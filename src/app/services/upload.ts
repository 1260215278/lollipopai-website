/**
 * 通用上传服务
 * ------------------------------------------------------------------
 * - 发行中心素材：`/publisher/course/upload/*` 切片上传（publisher token）。
 * - 入驻证照：`POST /alioss/upload` 整文件 multipart（app token / anon 业务域）。
 *
 * 协议对齐 short-play-seven `PublisherChunkUploadServiceImpl`：
 * - 分片固定 5MB，单文件最多 100 片（视频 ≤500MB）
 * - init 每次新建会话，uploadedChunks 恒为 0（是「已存在分片个数」计数，不是续传下标）
 * - chunk 同 uploadId/chunkIndex 幂等；须顺序发送（后端进程内锁 + 文档约定）
 * - complete 可幂等重试（COMPLETED 后直接回 URL）；失败时勿 cancel，否则清掉可合并分片
 * - cancel / TTL(24h) 清理临时目录
 *
 * 防卡住：
 * - chunk / complete 独立超时（超时 408 可重试）
 * - chunk 用 XHR 片内进度
 * - complete 前 phase=merging
 */
import { toast } from "sonner";
import { getAppToken, getPublisherToken, handleUnauthorized } from "./auth";
import { BASE_URL, ApiError, type ApiResponse } from "./http";
import { getMessages, getAcceptLanguage } from "../i18n";

/** 上剧素材旧整文件端点（保留后端兼容）；前端以此标识发行中心场景并切换到分片接口。 */
export const PUBLISHER_UPLOAD_PATH = "/publisher/course/upload";
/** 入驻证照上传端点（anon） */
export const ALIOSS_UPLOAD_PATH = "/alioss/upload";

export const PUBLISHER_CHUNK_INIT_PATH = `${PUBLISHER_UPLOAD_PATH}/init`;
export const PUBLISHER_CHUNK_PATH = `${PUBLISHER_UPLOAD_PATH}/chunk`;
export const PUBLISHER_CHUNK_COMPLETE_PATH = `${PUBLISHER_UPLOAD_PATH}/complete`;
export const PUBLISHER_CHUNK_CANCEL_PATH = `${PUBLISHER_UPLOAD_PATH}/cancel`;

/**
 * 与后端 `PublisherChunkUploadServiceImpl.CHUNK_SIZE_BYTES` 一致（5MB）。
 * 实际切片以 init 返回的 chunkSize 为准，此处用于预检与注释对齐。
 */
export const PUBLISHER_CHUNK_SIZE_BYTES = 5 * 1024 * 1024;
/** 与后端 `MAX_TOTAL_CHUNKS` 一致 */
export const PUBLISHER_MAX_TOTAL_CHUNKS = 100;

const CHUNK_RETRY_LIMIT = 3;
const CHUNK_RETRY_BASE_DELAY_MS = 300;
const CANCEL_TIMEOUT_MS = 5000;
/** 单分片 5MB 上传超时 */
const CHUNK_REQUEST_TIMEOUT_MS = 90_000;
/**
 * complete = 服务端顺序合并 + FileStorageService 写 OSS。
 * 大文件（近 500MB）合并/落库可能较久，单独放宽。
 */
const COMPLETE_REQUEST_TIMEOUT_MS = 300_000;
/** init / 整文件 / cancel 默认超时 */
const DEFAULT_REQUEST_TIMEOUT_MS = 60_000;

export type UploadProgressPhase = "uploading" | "merging";
export type UploadProgressHandler = (percent: number, phase?: UploadProgressPhase) => void;

interface ChunkUploadSession {
  uploadId: string;
  chunkSize: number;
  totalChunks: number;
  /** 后端返回的是「磁盘上已存在且大小正确的分片个数」，不是下一个下标；init 恒为 0 */
  uploadedChunks: number;
}

interface ChunkUploadResponse {
  chunkIndex: number;
  uploadedChunks: number;
  totalChunks: number;
}

/** 按路径解析应注入的 token（与 http.ts resolveToken 对齐） */
function resolveUploadToken(path: string): string {
  return path.startsWith("/publisher/") ? getPublisherToken() : getAppToken();
}

function getAbortError(signal?: AbortSignal): Error {
  if (signal?.reason instanceof Error) return signal.reason;
  return new DOMException("The operation was aborted", "AbortError");
}

function getUploadTimeoutError(): ApiError {
  return new ApiError(408, getMessages().distribution.common.uploadTimeout);
}

/**
 * 将用户 AbortSignal 与超时合并：用户中止优先；超时抛 408，便于重试且会 toast。
 */
function createTimeoutSignal(
  timeoutMs: number,
  userSignal?: AbortSignal,
): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  if (userSignal?.aborted) {
    controller.abort(userSignal.reason);
    return { signal: controller.signal, cleanup: () => undefined };
  }

  const onUserAbort = () => {
    controller.abort(userSignal?.reason ?? getAbortError(userSignal));
  };
  userSignal?.addEventListener("abort", onUserAbort, { once: true });

  const timer = globalThis.setTimeout(() => {
    controller.abort(getUploadTimeoutError());
  }, timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => {
      globalThis.clearTimeout(timer);
      userSignal?.removeEventListener("abort", onUserAbort);
    },
  };
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

function resolveRequestFailure(error: unknown, userSignal?: AbortSignal): never {
  if (userSignal?.aborted) throw getAbortError(userSignal);
  if (error instanceof ApiError) throw error;
  if (isAbortError(error)) throw getUploadTimeoutError();
  throw new ApiError(-1, getMessages().distribution.common.networkError);
}

async function parseUploadResponse<T>(res: Response): Promise<T> {
  if (res.status === 413) {
    throw new ApiError(res.status, getMessages().distribution.common.uploadRequestTooLarge);
  }

  let json: ApiResponse<T>;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    if (res.status === 401) handleUnauthorized();
    throw new ApiError(res.status, getMessages().distribution.common.serverError);
  }

  if (json.code === 401 || res.status === 401) {
    handleUnauthorized();
    throw new ApiError(json.code, json.msg);
  }
  if (json.code !== 0) throw new ApiError(json.code, json.msg);
  return json.data;
}

/** 上传协议专用 fetch：不在重试过程 toast，由最外层只提示一次最终错误。 */
async function requestUpload<T>(
  path: string,
  init: RequestInit,
  timeoutMs: number = DEFAULT_REQUEST_TIMEOUT_MS,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Accept-Language")) headers.set("Accept-Language", getAcceptLanguage());
  const token = resolveUploadToken(path);
  if (token) headers.set("token", token);

  const userSignal = init.signal ?? undefined;
  const { signal, cleanup } = createTimeoutSignal(timeoutMs, userSignal);

  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...init, headers, signal });
    return await parseUploadResponse<T>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    resolveRequestFailure(error, userSignal);
  } finally {
    cleanup();
  }
}

/**
 * 分片用 XHR：支持 upload.onprogress 片内进度，并带 xhr.timeout。
 * 表单字段对齐后端：uploadId / chunkIndex / chunk。
 */
function postChunkWithProgress(
  uploadId: string,
  chunkIndex: number,
  chunk: Blob,
  fileName: string,
  userSignal: AbortSignal | undefined,
  onByteProgress?: (loaded: number, total: number) => void,
): Promise<ChunkUploadResponse> {
  return new Promise((resolve, reject) => {
    if (userSignal?.aborted) {
      reject(getAbortError(userSignal));
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}${PUBLISHER_CHUNK_PATH}`);
    xhr.timeout = CHUNK_REQUEST_TIMEOUT_MS;
    xhr.setRequestHeader("Accept-Language", getAcceptLanguage());
    const token = resolveUploadToken(PUBLISHER_CHUNK_PATH);
    if (token) xhr.setRequestHeader("token", token);

    const onUserAbort = () => {
      xhr.abort();
    };
    userSignal?.addEventListener("abort", onUserAbort, { once: true });

    const settle = (fn: () => void) => {
      userSignal?.removeEventListener("abort", onUserAbort);
      fn();
    };

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onByteProgress?.(event.loaded, event.total);
      }
    };

    xhr.onload = () => {
      settle(() => {
        void (async () => {
          try {
            const res = new Response(xhr.responseText, { status: xhr.status, statusText: xhr.statusText });
            resolve(await parseUploadResponse<ChunkUploadResponse>(res));
          } catch (error) {
            reject(error);
          }
        })();
      });
    };

    xhr.onerror = () => {
      settle(() => reject(new ApiError(-1, getMessages().distribution.common.networkError)));
    };

    xhr.ontimeout = () => {
      settle(() => reject(getUploadTimeoutError()));
    };

    xhr.onabort = () => {
      settle(() => {
        if (userSignal?.aborted) reject(getAbortError(userSignal));
        else reject(getUploadTimeoutError());
      });
    };

    const form = new FormData();
    form.append("uploadId", uploadId);
    form.append("chunkIndex", String(chunkIndex));
    form.append("chunk", chunk, `${fileName}.part.${chunkIndex}`);
    xhr.send(form);
  });
}

function shouldRetry(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.code === -1 || error.code === 408 || error.code === 429 || error.code >= 500)
  );
}

function waitForRetry(delayMs: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return Promise.reject(getAbortError(signal));
  return new Promise((resolve, reject) => {
    const timer = globalThis.setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, delayMs);
    const onAbort = () => {
      globalThis.clearTimeout(timer);
      reject(getAbortError(signal));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

async function withChunkRetry<T>(operation: () => Promise<T>, signal?: AbortSignal): Promise<T> {
  for (let attempt = 0; attempt < CHUNK_RETRY_LIMIT; attempt += 1) {
    if (signal?.aborted) throw getAbortError(signal);
    try {
      return await operation();
    } catch (error) {
      if (signal?.aborted) throw error;
      if (attempt === CHUNK_RETRY_LIMIT - 1 || !shouldRetry(error)) throw error;
      await waitForRetry(CHUNK_RETRY_BASE_DELAY_MS * 2 ** attempt, signal);
    }
  }
  throw new ApiError(-1, getMessages().distribution.common.networkError);
}

function assertChunkSession(session: ChunkUploadSession, fileSize: number): void {
  const expectedChunks = Math.ceil(fileSize / session.chunkSize);
  const uploadedChunks = session.uploadedChunks ?? 0;
  if (
    !session.uploadId ||
    !Number.isInteger(session.chunkSize) ||
    session.chunkSize <= 0 ||
    !Number.isInteger(session.totalChunks) ||
    session.totalChunks !== expectedChunks ||
    session.totalChunks > PUBLISHER_MAX_TOTAL_CHUNKS ||
    !Number.isInteger(uploadedChunks) ||
    uploadedChunks < 0 ||
    uploadedChunks > session.totalChunks
  ) {
    throw new ApiError(-1, getMessages().distribution.common.serverError);
  }
}

/** 与后端 expectedChunkSize 一致：最后一片可为不足 chunkSize 的尾部 */
function expectedChunkByteSize(fileSize: number, chunkSize: number, chunkIndex: number): number {
  const offset = chunkIndex * chunkSize;
  return Math.min(chunkSize, fileSize - offset);
}

async function cancelChunkUpload(uploadId: string): Promise<void> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), CANCEL_TIMEOUT_MS);
  try {
    await requestUpload<void>(
      PUBLISHER_CHUNK_CANCEL_PATH,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId }),
        signal: controller.signal,
      },
      CANCEL_TIMEOUT_MS,
    );
  } catch {
    // 取消清理失败时由后端 TTL 任务兜底，不能覆盖原始上传错误。
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

async function uploadPublisherFileInChunks(
  file: File,
  signal?: AbortSignal,
  onProgress?: UploadProgressHandler,
): Promise<string> {
  // 与后端 init 校验对齐：分片数超限直接失败，避免无意义 init
  if (file.size <= 0) {
    throw new ApiError(-1, getMessages().distribution.common.serverError);
  }
  const projectedChunks = Math.ceil(file.size / PUBLISHER_CHUNK_SIZE_BYTES);
  if (projectedChunks > PUBLISHER_MAX_TOTAL_CHUNKS) {
    throw new ApiError(-1, getMessages().distribution.common.uploadRequestTooLarge);
  }

  let uploadId = "";
  /** 全部分片已成功落盘后，complete 失败不应 cancel（后端可幂等 complete） */
  let allChunksOnServer = false;

  try {
    const session = await requestUpload<ChunkUploadSession>(
      PUBLISHER_CHUNK_INIT_PATH,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type || "application/octet-stream",
        }),
        signal,
      },
      DEFAULT_REQUEST_TIMEOUT_MS,
    );
    uploadId = session.uploadId;
    assertChunkSession(session, file.size);

    const totalChunks = session.totalChunks;
    const chunkSize = session.chunkSize;
    // init 的 uploadedChunks 是计数且新会话恒为 0；不可当「从第 N 片续传」。
    // 分片同 index 幂等，统一从 0 顺序上传（与后端「由前端顺序发送」一致）。
    onProgress?.(0, "uploading");

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
      if (signal?.aborted) throw getAbortError(signal);
      const start = chunkIndex * chunkSize;
      const end = start + expectedChunkByteSize(file.size, chunkSize, chunkIndex);
      const chunk = file.slice(start, end);
      if (chunk.size !== expectedChunkByteSize(file.size, chunkSize, chunkIndex)) {
        throw new ApiError(-1, getMessages().distribution.common.serverError);
      }

      await withChunkRetry(
        () =>
          postChunkWithProgress(uploadId, chunkIndex, chunk, file.name, signal, (loaded, total) => {
            const fraction = (chunkIndex + loaded / Math.max(total, 1)) / Math.max(totalChunks, 1);
            onProgress?.(Math.min(99, clampPercent(fraction * 100)), "uploading");
          }),
        signal,
      );
      const afterChunk = ((chunkIndex + 1) / Math.max(totalChunks, 1)) * 100;
      onProgress?.(Math.min(99, clampPercent(afterChunk)), "uploading");
    }

    allChunksOnServer = true;
    onProgress?.(100, "merging");
    // complete 幂等：超时/网关抖动可重试；勿在失败后 cancel
    return await withChunkRetry(
      () =>
        requestUpload<string>(
          PUBLISHER_CHUNK_COMPLETE_PATH,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uploadId }),
            signal,
          },
          COMPLETE_REQUEST_TIMEOUT_MS,
        ),
      signal,
    );
  } catch (error) {
    // 用户停止 / 分片阶段失败：清理临时目录
    // 合并阶段失败：保留会话，后端 TTL 或下次同 uploadId complete 可恢复（本调用已重试尽）
    if (uploadId && (signal?.aborted || !allChunksOnServer)) {
      await cancelChunkUpload(uploadId);
    }
    throw error;
  }
}

async function uploadWholeFile(file: File, path: string, signal?: AbortSignal): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  return requestUpload<string>(path, { method: "POST", body: form, signal }, DEFAULT_REQUEST_TIMEOUT_MS);
}

/**
 * 上传单个文件并返回完整 URL。发行中心自动使用切片协议，其他端点保持整文件 multipart。
 * @param signal 批量上传停止时中止当前分片；分片未齐时会 cancel 服务端会话
 * @param onProgress 进度 0..100；complete 前会再回调 phase=merging
 */
export async function uploadFile(
  file: File,
  path: string = PUBLISHER_UPLOAD_PATH,
  signal?: AbortSignal,
  onProgress?: UploadProgressHandler,
): Promise<string> {
  try {
    return path === PUBLISHER_UPLOAD_PATH
      ? await uploadPublisherFileInChunks(file, signal, onProgress)
      : await uploadWholeFile(file, path, signal);
  } catch (error) {
    if (signal?.aborted) throw error;
    const failure =
      error instanceof ApiError
        ? error
        : new ApiError(-1, getMessages().distribution.common.networkError);
    toast.error(failure.message);
    throw failure;
  }
}
