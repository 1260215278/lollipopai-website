/**
 * 通用上传服务
 * ------------------------------------------------------------------
 * - 发行中心素材：`/publisher/course/upload/*` 切片上传（publisher token）。
 * - 入驻证照：`POST /alioss/upload` 整文件 multipart（app token / anon 业务域）。
 * 发行中心的图片、视频、文档均走同一切片协议；文件类型和总大小仍由后端统一校验。
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

const CHUNK_RETRY_LIMIT = 3;
const CHUNK_RETRY_BASE_DELAY_MS = 300;
const CANCEL_TIMEOUT_MS = 5000;

export type UploadProgressHandler = (percent: number) => void;

interface ChunkUploadSession {
  uploadId: string;
  chunkSize: number;
  totalChunks: number;
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

/** 上传协议专用 fetch：不在重试过程 toast，由最外层只提示一次最终错误。 */
async function requestUpload<T>(path: string, init: RequestInit): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Accept-Language")) headers.set("Accept-Language", getAcceptLanguage());
  const token = resolveUploadToken(path);
  if (token) headers.set("token", token);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch (error) {
    if (init.signal?.aborted) throw error;
    throw new ApiError(-1, getMessages().distribution.common.networkError);
  }

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
  if (
    !session.uploadId ||
    !Number.isInteger(session.chunkSize) ||
    session.chunkSize <= 0 ||
    !Number.isInteger(session.totalChunks) ||
    session.totalChunks !== expectedChunks
  ) {
    throw new ApiError(-1, getMessages().distribution.common.serverError);
  }
}

async function cancelChunkUpload(uploadId: string): Promise<void> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), CANCEL_TIMEOUT_MS);
  try {
    await requestUpload<void>(PUBLISHER_CHUNK_CANCEL_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId }),
      signal: controller.signal,
    });
  } catch {
    // 取消清理失败时由后端 TTL 任务兜底，不能覆盖原始上传错误。
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

async function uploadPublisherFileInChunks(
  file: File,
  signal?: AbortSignal,
  onProgress?: UploadProgressHandler,
): Promise<string> {
  let uploadId = "";
  try {
    const session = await requestUpload<ChunkUploadSession>(PUBLISHER_CHUNK_INIT_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type || "application/octet-stream",
      }),
      signal,
    });
    uploadId = session.uploadId;
    assertChunkSession(session, file.size);
    onProgress?.(0);

    for (let chunkIndex = 0; chunkIndex < session.totalChunks; chunkIndex += 1) {
      const start = chunkIndex * session.chunkSize;
      const chunk = file.slice(start, Math.min(start + session.chunkSize, file.size));
      await withChunkRetry(async () => {
        const form = new FormData();
        form.append("uploadId", uploadId);
        form.append("chunkIndex", String(chunkIndex));
        form.append("chunk", chunk, `${file.name}.part.${chunkIndex}`);
        await requestUpload<ChunkUploadResponse>(PUBLISHER_CHUNK_PATH, {
          method: "POST",
          body: form,
          signal,
        });
      }, signal);
      onProgress?.(Math.round(((chunkIndex + 1) / session.totalChunks) * 100));
    }

    return await withChunkRetry(
      () =>
        requestUpload<string>(PUBLISHER_CHUNK_COMPLETE_PATH, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uploadId }),
          signal,
        }),
      signal,
    );
  } catch (error) {
    if (uploadId) await cancelChunkUpload(uploadId);
    throw error;
  }
}

async function uploadWholeFile(file: File, path: string, signal?: AbortSignal): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  return requestUpload<string>(path, { method: "POST", body: form, signal });
}

/**
 * 上传单个文件并返回完整 URL。发行中心自动使用切片协议，其他端点保持整文件 multipart。
 * @param signal 批量上传停止时中止当前分片，并触发服务端会话清理
 * @param onProgress 每个分片确认成功后回调 0..100 的整数进度
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
