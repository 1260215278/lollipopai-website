import { useSyncExternalStore } from "react";
import { saveEpisode, saveHighlight, type SaveEpisodeResult } from "../services/content";
import { getOssHeicJpgUrl } from "../services/heic";
import { PUBLISHER_UPLOAD_PATH, uploadFile, type UploadProgressPhase } from "../services/upload";

/**
 * 上传任务只保存任务元数据；File 对象保留在当前标签页内存中，避免把视频内容写入 localStorage。
 * 服务端草稿是恢复的权威来源，任务元数据用于跨路由/刷新后找到对应 courseId。
 *
 * 并发约定：全局同一时刻只跑一个上传任务（多短剧排队），避免抢带宽表现为「卡住」。
 * 失败约定：同一任务内任一集失败立即停止后续集，避免 failed/uploading 状态乱跳。
 *
 * 版权证明 / 高光时刻：与剧集同一套任务内存态，表单 unmount / 任务切换后上传继续，
 * 完成结果写回 store，避免本地 uploading 丢失后「永远上传中」或 URL 丢失。
 */
export type UploadTaskStatus = "draft" | "uploading" | "paused" | "ready" | "failed";
export type UploadFilePhase = "idle" | UploadProgressPhase;
/** 任务内附属素材（非剧集队列） */
export type TaskAssetKind = "copyrightProof" | "highlight";
export type TaskAssetStatus = "idle" | "uploading" | "done" | "failed";

export interface TaskAssetState {
  kind: TaskAssetKind;
  status: TaskAssetStatus;
  progress: number;
  phase: UploadFilePhase;
  fileName: string;
  url: string;
  error: string;
  /** 高光 saveHighlight 回写；版权证明用本地 file.size */
  fileSize: number | null;
  uploadTime: string;
}

export interface UploadTask {
  id: string;
  courseId: number | null;
  title: string;
  totalEpisodes: number;
  uploadedEpisodes: number;
  selectedEpisodes: number;
  currentEpisode: number | null;
  currentFileProgress: number;
  /** 当前文件阶段：idle / uploading / merging（complete） */
  currentFilePhase: UploadFilePhase;
  progress: number;
  step: 1 | 2 | 3;
  status: UploadTaskStatus;
  error: string;
  updatedAt: number;
}

export interface CreateUploadTaskInput {
  courseId?: number | null;
  title?: string;
  totalEpisodes?: number;
  step?: 1 | 2 | 3;
}

export type UploadTaskPatch = Partial<
  Pick<
    UploadTask,
    | "courseId"
    | "title"
    | "totalEpisodes"
    | "uploadedEpisodes"
    | "selectedEpisodes"
    | "currentEpisode"
    | "currentFileProgress"
    | "currentFilePhase"
    | "progress"
    | "step"
    | "status"
    | "error"
  >
>;

export interface PendingEpisodeMeta {
  title?: string;
  duration?: string;
}

export interface UploadTaskQueueItem {
  episodeNo: number;
  title: string;
  file: File;
  /**
   * 本集在本次提交前是否已在服务端 uploadStatus=1。
   * 替换/重传不得再 +1，否则会出现 13/8 这类超过计划集数。
   */
  alreadyUploaded?: boolean;
}

export interface UploadTaskCompletedItem {
  episodeNo: number;
  fileName: string;
  videoUrl: string;
  result: SaveEpisodeResult;
}

export interface UploadTaskRunResult {
  completed: UploadTaskCompletedItem[];
  failedEpisodes: number[];
  stopped: boolean;
}

const STORAGE_KEY = "distribution.upload.tasks.v2";

const tasks = new Map<string, UploadTask>();
const pendingFiles = new Map<string, Map<number, File>>();
/** 跨路由保留的剧集标题/时长（File 之外的轻量 UI 态，不进 localStorage） */
const pendingEpisodeMeta = new Map<string, Map<number, PendingEpisodeMeta>>();
/** 版权证明 / 高光：仅会话内存，不写 localStorage（含 File 流与 in-flight 态） */
const taskAssets = new Map<string, Map<TaskAssetKind, TaskAssetState>>();
const uploadControllers = new Map<string, AbortController>();
const uploadRuns = new Map<string, Promise<UploadTaskRunResult>>();
/** key = `${taskId}:${kind}` */
const assetControllers = new Map<string, AbortController>();
const assetRuns = new Map<string, Promise<TaskAssetState>>();
/** 单集上传完成回调：表单卸载后仍可通知已挂载的订阅者即时刷新行态 */
const episodeCompleteListeners = new Map<string, Set<(item: UploadTaskCompletedItem) => void>>();
const listeners = new Set<() => void>();
let snapshotCache: UploadTask[] = [];
let hydrated = false;
let persistTimer: ReturnType<typeof setTimeout> | null = null;
let idSequence = 0;
/** 全局串行队列尾：保证多任务排队，同一时刻只有一个真正在传。 */
let globalUploadTail: Promise<void> = Promise.resolve();

function assetRunKey(taskId: string, kind: TaskAssetKind): string {
  return `${taskId}:${kind}`;
}

function emptyAssetState(kind: TaskAssetKind): TaskAssetState {
  return {
    kind,
    status: "idle",
    progress: 0,
    phase: "idle",
    fileName: "",
    url: "",
    error: "",
    fileSize: null,
    uploadTime: "",
  };
}

function readAssetState(taskId: string, kind: TaskAssetKind): TaskAssetState {
  return taskAssets.get(taskId)?.get(kind) ?? emptyAssetState(kind);
}

function writeAssetState(taskId: string, kind: TaskAssetKind, next: TaskAssetState): void {
  if (!tasks.has(taskId)) return;
  const map = taskAssets.get(taskId) ?? new Map<TaskAssetKind, TaskAssetState>();
  map.set(kind, { ...next, kind });
  taskAssets.set(taskId, map);
  commit();
}

function clearAssetMapsForTask(taskId: string): void {
  for (const kind of ["copyrightProof", "highlight"] as TaskAssetKind[]) {
    const key = assetRunKey(taskId, kind);
    assetControllers.get(key)?.abort();
    assetControllers.delete(key);
    assetRuns.delete(key);
  }
  taskAssets.delete(taskId);
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isTaskStatus(value: unknown): value is UploadTaskStatus {
  return value === "draft" || value === "uploading" || value === "paused" || value === "ready" || value === "failed";
}

function isStep(value: unknown): value is 1 | 2 | 3 {
  return value === 1 || value === 2 || value === 3;
}

function parsePersistedTask(value: unknown): UploadTask | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== "string" || raw.id.length === 0) return null;
  if (raw.courseId !== null && (typeof raw.courseId !== "number" || !Number.isInteger(raw.courseId))) return null;
  if (typeof raw.title !== "string") return null;
  if (typeof raw.totalEpisodes !== "number" || !Number.isInteger(raw.totalEpisodes) || raw.totalEpisodes < 0) return null;
  if (typeof raw.uploadedEpisodes !== "number" || !Number.isInteger(raw.uploadedEpisodes) || raw.uploadedEpisodes < 0) return null;
  if (typeof raw.selectedEpisodes !== "number" || !Number.isInteger(raw.selectedEpisodes) || raw.selectedEpisodes < 0) return null;
  if (raw.currentEpisode !== null && (typeof raw.currentEpisode !== "number" || !Number.isInteger(raw.currentEpisode))) return null;
  if (typeof raw.currentFileProgress !== "number" || !Number.isFinite(raw.currentFileProgress)) return null;
  if (typeof raw.progress !== "number" || !Number.isFinite(raw.progress)) return null;
  if (!isStep(raw.step) || !isTaskStatus(raw.status)) return null;
  if (typeof raw.error !== "string" || typeof raw.updatedAt !== "number" || !Number.isFinite(raw.updatedAt)) return null;

  const totalEpisodes = raw.totalEpisodes;
  const uploadedEpisodes = clampUploadedEpisodes(raw.uploadedEpisodes, totalEpisodes);
  return {
    id: raw.id,
    courseId: raw.courseId,
    title: raw.title,
    totalEpisodes,
    uploadedEpisodes,
    selectedEpisodes: 0,
    currentEpisode: null,
    currentFileProgress: 0,
    currentFilePhase: "idle",
    progress: totalEpisodes > 0 ? Math.round((uploadedEpisodes / totalEpisodes) * 100) : 0,
    step: raw.step,
    // A reload cannot keep an in-flight AbortSignal/File stream alive.
    status: raw.status === "uploading" ? "paused" : raw.status,
    error: raw.error,
    updatedAt: raw.updatedAt,
  };
}

function rebuildSnapshot(): void {
  snapshotCache = [...tasks.values()]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((task) => ({ ...task }));
}

function persistNow(): void {
  persistTimer = null;
  if (!isBrowser()) return;
  try {
    const serializable = [...tasks.values()].filter((task) => task.courseId !== null).map(({ id, courseId, title, totalEpisodes, uploadedEpisodes, selectedEpisodes, currentEpisode, currentFileProgress, progress, step, status, error, updatedAt }) => ({
      id,
      courseId,
      title,
      totalEpisodes,
      uploadedEpisodes,
      selectedEpisodes,
      currentEpisode,
      currentFileProgress,
      progress,
      step,
      status,
      error,
      updatedAt,
    }));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // 隐私模式、配额不足或禁用存储时，当前会话内存态仍可用。
  }
}

function schedulePersist(): void {
  if (persistTimer !== null) return;
  persistTimer = globalThis.setTimeout(persistNow, 120);
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (isBrowser()) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.map(parsePersistedTask).forEach((task) => {
            if (task) tasks.set(task.id, task);
          });
        }
      }
    } catch {
      // 损坏的旧缓存不阻断页面，下一次写入时会被替换。
    }
  }
  rebuildSnapshot();
}

function commit(): void {
  rebuildSnapshot();
  schedulePersist();
  listeners.forEach((listener) => listener());
}

function makeId(): string {
  idSequence += 1;
  if (isBrowser() && typeof window.crypto?.randomUUID === "function") return window.crypto.randomUUID();
  return `upload-task-${Date.now()}-${idSequence}`;
}

function clampProgress(progress: number): number {
  return Math.max(0, Math.min(100, Math.round(progress)));
}

/** 已上传集数不超过计划集数（替换重传、脏 localStorage 都要夹紧） */
function clampUploadedEpisodes(uploaded: number, total: number): number {
  const safeTotal = Number.isFinite(total) && total > 0 ? Math.floor(total) : 0;
  const safeUploaded = Number.isFinite(uploaded) ? Math.floor(uploaded) : 0;
  if (safeTotal <= 0) return Math.max(0, safeUploaded);
  return Math.max(0, Math.min(safeTotal, safeUploaded));
}

/** 全局串行：后进任务等前一个 settle 后再真正开传。 */
function runExclusiveUpload<T>(work: () => Promise<T>): Promise<T> {
  const run = globalUploadTail.then(work, work);
  globalUploadTail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function subscribeUploadTasks(listener: () => void): () => void {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getUploadTasksSnapshot(): UploadTask[] {
  hydrate();
  return snapshotCache;
}

export function useUploadTasks(): UploadTask[] {
  return useSyncExternalStore(subscribeUploadTasks, getUploadTasksSnapshot, getUploadTasksSnapshot);
}

export function getUploadTask(taskId: string): UploadTask | null {
  hydrate();
  const task = tasks.get(taskId);
  return task ? { ...task } : null;
}

export function getUploadTaskByCourseId(courseId: number): UploadTask | null {
  hydrate();
  for (const task of tasks.values()) {
    if (task.courseId === courseId) return { ...task };
  }
  return null;
}

export function createUploadTask(input: CreateUploadTaskInput = {}): UploadTask {
  hydrate();
  const now = Date.now();
  const task: UploadTask = {
    id: makeId(),
    courseId: input.courseId ?? null,
    title: input.title ?? "",
    totalEpisodes: input.totalEpisodes ?? 0,
    uploadedEpisodes: 0,
    selectedEpisodes: 0,
    currentEpisode: null,
    currentFileProgress: 0,
    currentFilePhase: "idle",
    progress: 0,
    step: input.step ?? 1,
    status: "draft",
    error: "",
    updatedAt: now,
  };
  tasks.set(task.id, task);
  pendingFiles.set(task.id, new Map());
  pendingEpisodeMeta.set(task.id, new Map());
  commit();
  return { ...task };
}

/** 将服务端已有草稿接入任务列表，避免升级后遗留草稿消失。 */
export function upsertUploadTaskForCourse(courseId: number, title: string, totalEpisodes: number, uploadedEpisodes: number): UploadTask {
  hydrate();
  const existing = getUploadTaskByCourseId(courseId);
  if (existing) {
    updateUploadTask(existing.id, { title, totalEpisodes, uploadedEpisodes, step: uploadedEpisodes >= totalEpisodes && totalEpisodes > 0 ? 3 : 2 });
    return getUploadTask(existing.id) as UploadTask;
  }
  const task = createUploadTask({ courseId, title, totalEpisodes, step: uploadedEpisodes >= totalEpisodes && totalEpisodes > 0 ? 3 : 2 });
  updateUploadTask(task.id, { uploadedEpisodes, progress: totalEpisodes > 0 ? Math.round((uploadedEpisodes / totalEpisodes) * 100) : 0, status: "paused" });
  return getUploadTask(task.id) as UploadTask;
}

export function updateUploadTask(taskId: string, patch: UploadTaskPatch): void {
  hydrate();
  const task = tasks.get(taskId);
  if (!task) return;
  const totalEpisodes = patch.totalEpisodes !== undefined ? patch.totalEpisodes : task.totalEpisodes;
  const uploadedRaw = patch.uploadedEpisodes !== undefined ? patch.uploadedEpisodes : task.uploadedEpisodes;
  const uploadedEpisodes = clampUploadedEpisodes(uploadedRaw, totalEpisodes);
  let progress = patch.progress === undefined ? task.progress : clampProgress(patch.progress);
  // 仅更新 uploaded 且未显式传 progress 时，用夹紧后的计数重算（避免脏数据 13/8 → 进度仍超 100）
  if (patch.uploadedEpisodes !== undefined && patch.progress === undefined && totalEpisodes > 0) {
    progress = clampProgress((uploadedEpisodes / totalEpisodes) * 100);
  }
  const next: UploadTask = {
    ...task,
    ...patch,
    totalEpisodes,
    uploadedEpisodes,
    progress,
    updatedAt: Date.now(),
  };
  tasks.set(taskId, next);
  commit();
}

export function setPendingUploadFile(taskId: string, episodeNo: number, file: File): void {
  hydrate();
  if (!tasks.has(taskId)) return;
  const files = pendingFiles.get(taskId) ?? new Map<number, File>();
  files.set(episodeNo, file);
  pendingFiles.set(taskId, files);
  updateUploadTask(taskId, { selectedEpisodes: files.size });
}

export function setPendingEpisodeMeta(
  taskId: string,
  episodeNo: number,
  patch: PendingEpisodeMeta,
): void {
  hydrate();
  if (!tasks.has(taskId)) return;
  const meta = pendingEpisodeMeta.get(taskId) ?? new Map<number, PendingEpisodeMeta>();
  const prev = meta.get(episodeNo) ?? {};
  meta.set(episodeNo, {
    title: patch.title !== undefined ? patch.title : prev.title,
    duration: patch.duration !== undefined ? patch.duration : prev.duration,
  });
  pendingEpisodeMeta.set(taskId, meta);
}

export function getPendingEpisodeMeta(taskId: string): Map<number, PendingEpisodeMeta> {
  hydrate();
  return new Map(pendingEpisodeMeta.get(taskId) ?? []);
}

export function removePendingUploadFile(taskId: string, episodeNo: number): void {
  hydrate();
  const files = pendingFiles.get(taskId);
  if (!files) return;
  files.delete(episodeNo);
  pendingEpisodeMeta.get(taskId)?.delete(episodeNo);
  updateUploadTask(taskId, { selectedEpisodes: files.size });
}

export function getPendingUploadFiles(taskId: string): Map<number, File> {
  hydrate();
  return new Map(pendingFiles.get(taskId) ?? []);
}

export function clearPendingUploadFiles(taskId: string): void {
  hydrate();
  pendingFiles.delete(taskId);
  pendingEpisodeMeta.delete(taskId);
  const task = tasks.get(taskId);
  if (task) updateUploadTask(taskId, { selectedEpisodes: 0 });
}

export function removeUploadTask(taskId: string): void {
  hydrate();
  uploadControllers.get(taskId)?.abort();
  uploadControllers.delete(taskId);
  episodeCompleteListeners.delete(taskId);
  clearAssetMapsForTask(taskId);
  tasks.delete(taskId);
  pendingFiles.delete(taskId);
  pendingEpisodeMeta.delete(taskId);
  commit();
}

export function clearUploadTasks(): void {
  hydrate();
  uploadControllers.forEach((controller) => controller.abort());
  uploadControllers.clear();
  uploadRuns.clear();
  episodeCompleteListeners.clear();
  assetControllers.forEach((controller) => controller.abort());
  assetControllers.clear();
  assetRuns.clear();
  taskAssets.clear();
  tasks.clear();
  pendingFiles.clear();
  pendingEpisodeMeta.clear();
  commit();
}

export function getTaskAsset(taskId: string, kind: TaskAssetKind): TaskAssetState {
  hydrate();
  return { ...readAssetState(taskId, kind) };
}

/** 中止指定附属上传；默认回到 idle（用户替换文件 / 删除任务时用）。 */
export function abortTaskAssetUpload(taskId: string, kind: TaskAssetKind): void {
  hydrate();
  const key = assetRunKey(taskId, kind);
  assetControllers.get(key)?.abort();
  assetControllers.delete(key);
  // 进行中的 run finally 也会清；这里先把 UI 拉回 idle，避免卸载再进时仍显示「上传中」
  if (readAssetState(taskId, kind).status === "uploading") {
    writeAssetState(taskId, kind, emptyAssetState(kind));
  }
}

export function clearTaskAsset(taskId: string, kind: TaskAssetKind): void {
  hydrate();
  abortTaskAssetUpload(taskId, kind);
  writeAssetState(taskId, kind, emptyAssetState(kind));
}

/**
 * 版权证明 / 高光：在 store 内跑上传，表单卸载后仍继续。
 * - 与剧集共用全局串行队列，避免多路上传抢带宽「假卡死」
 * - 同 kind 重复调用会中止上一次
 * - 高光成功后自动 saveHighlight；版权证明只回写 URL（随 saveBasic 落库）
 */
export function startTaskAssetUpload(
  taskId: string,
  kind: TaskAssetKind,
  file: File,
  options: { courseId?: number | null } = {},
): Promise<TaskAssetState> {
  hydrate();
  if (!tasks.has(taskId)) {
    return Promise.resolve(emptyAssetState(kind));
  }

  const key = assetRunKey(taskId, kind);
  // 替换上传：中止旧请求，避免完成回调互相覆盖
  assetControllers.get(key)?.abort();
  assetControllers.delete(key);

  const controller = new AbortController();
  assetControllers.set(key, controller);

  writeAssetState(taskId, kind, {
    kind,
    status: "uploading",
    progress: 0,
    phase: "uploading",
    fileName: file.name,
    url: "",
    error: "",
    fileSize: null,
    uploadTime: "",
  });

  const isOwner = () => assetControllers.get(key) === controller;

  const run = runExclusiveUpload(async (): Promise<TaskAssetState> => {
    if (!tasks.has(taskId) || controller.signal.aborted || !isOwner()) {
      return emptyAssetState(kind);
    }

    try {
      let url = await uploadFile(
        file,
        PUBLISHER_UPLOAD_PATH,
        controller.signal,
        (percent, phase = "uploading") => {
          // 已被同 kind 新上传接管时禁止回写，避免进度/状态互相踩
          if (!tasks.has(taskId) || !isOwner() || controller.signal.aborted) return;
          writeAssetState(taskId, kind, {
            kind,
            status: "uploading",
            progress: percent,
            phase,
            fileName: file.name,
            url: "",
            error: "",
            fileSize: null,
            uploadTime: "",
          });
        },
      );

      if (!tasks.has(taskId) || !isOwner() || controller.signal.aborted) {
        return emptyAssetState(kind);
      }

      if (kind === "copyrightProof") {
        url = getOssHeicJpgUrl(file, url);
        const done: TaskAssetState = {
          kind,
          status: "done",
          progress: 100,
          phase: "idle",
          fileName: file.name,
          url,
          error: "",
          fileSize: file.size,
          uploadTime: "",
        };
        writeAssetState(taskId, kind, done);
        return done;
      }

      // highlight：切片上传后立即挂到草稿，切换任务回来可从服务端/store 双源恢复
      const courseId = options.courseId ?? tasks.get(taskId)?.courseId ?? null;
      if (courseId === null) {
        const failed: TaskAssetState = {
          kind,
          status: "failed",
          progress: 0,
          phase: "idle",
          fileName: file.name,
          url: "",
          error: "courseId required",
          fileSize: null,
          uploadTime: "",
        };
        writeAssetState(taskId, kind, failed);
        return failed;
      }

      const saved = await saveHighlight(courseId, url, file.name);
      const done: TaskAssetState = {
        kind,
        status: "done",
        progress: 100,
        phase: "idle",
        fileName: saved.highlightFileName || file.name,
        url: saved.highlightVideoUrl,
        error: "",
        fileSize: saved.highlightFileSize,
        uploadTime: saved.highlightUploadTime || "",
      };
      // 服务端已落库：即使随后被替换中止，只要仍是 owner 就写 done；非 owner 不覆盖新上传
      if (tasks.has(taskId) && isOwner()) {
        writeAssetState(taskId, kind, done);
      }
      return done;
    } catch (error) {
      if (!tasks.has(taskId) || !isOwner()) {
        return emptyAssetState(kind);
      }
      if (controller.signal.aborted) {
        // 用户中止 / 删任务 / 替换：回 idle，不落 failed
        writeAssetState(taskId, kind, emptyAssetState(kind));
        return emptyAssetState(kind);
      }
      const failed: TaskAssetState = {
        kind,
        status: "failed",
        progress: 0,
        phase: "idle",
        fileName: file.name,
        url: "",
        error: error instanceof Error ? error.message : "",
        fileSize: null,
        uploadTime: "",
      };
      writeAssetState(taskId, kind, failed);
      return failed;
    } finally {
      if (assetControllers.get(key) === controller) {
        assetControllers.delete(key);
      }
      if (assetRuns.get(key) === run) {
        assetRuns.delete(key);
      }
    }
  });

  assetRuns.set(key, run);
  return run;
}

/** 订阅单集上传完成（用于离开页面再回来或长传过程中即时刷新行状态） */
export function subscribeUploadEpisodeComplete(
  taskId: string,
  listener: (item: UploadTaskCompletedItem) => void,
): () => void {
  const set = episodeCompleteListeners.get(taskId) ?? new Set();
  set.add(listener);
  episodeCompleteListeners.set(taskId, set);
  return () => {
    const current = episodeCompleteListeners.get(taskId);
    if (!current) return;
    current.delete(listener);
    if (current.size === 0) episodeCompleteListeners.delete(taskId);
  };
}

function emitUploadEpisodeComplete(taskId: string, item: UploadTaskCompletedItem): void {
  const set = episodeCompleteListeners.get(taskId);
  if (!set) return;
  set.forEach((listener) => {
    try {
      listener(item);
    } catch {
      // 订阅方异常不影响上传主链路
    }
  });
}

export function pauseUploadTask(taskId: string): void {
  uploadControllers.get(taskId)?.abort();
  updateUploadTask(taskId, {
    status: "paused",
    currentEpisode: null,
    currentFileProgress: 0,
    currentFilePhase: "idle",
  });
}

/**
 * 上传在页面组件之外运行，因此切换路由或挂起表单不会中断。
 * 不同 taskId 全局排队（串行）；同一任务重复调用会复用正在运行的 Promise。
 */
export function startUploadTask(
  taskId: string,
  courseId: number,
  totalEpisodes: number,
  queue: UploadTaskQueueItem[],
): Promise<UploadTaskRunResult> {
  hydrate();
  const activeRun = uploadRuns.get(taskId);
  if (activeRun) return activeRun;

  // 排队前即挂上 controller，便于队列等待期间 pause 生效
  const controller = new AbortController();
  uploadControllers.set(taskId, controller);

  updateUploadTask(taskId, {
    courseId,
    totalEpisodes,
    selectedEpisodes: pendingFiles.get(taskId)?.size ?? queue.length,
    currentEpisode: null,
    currentFileProgress: 0,
    currentFilePhase: "idle",
    progress: totalEpisodes > 0 ? ((tasks.get(taskId)?.uploadedEpisodes ?? 0) / totalEpisodes) * 100 : 0,
    step: 2,
    status: "uploading",
    error: "",
  });

  const run = runExclusiveUpload(async (): Promise<UploadTaskRunResult> => {
    // 排队期间可能被 pause / 删除
    if (!tasks.has(taskId) || controller.signal.aborted) {
      return { completed: [], failedEpisodes: [], stopped: true };
    }

    const completed: UploadTaskCompletedItem[] = [];
    const failedEpisodes: number[] = [];
    // 以任务上的计数为基线并夹紧；替换已上传集不得再 +1
    let uploadedEpisodes = clampUploadedEpisodes(tasks.get(taskId)?.uploadedEpisodes ?? 0, totalEpisodes);
    let lastError = "";

    updateUploadTask(taskId, {
      uploadedEpisodes,
      currentEpisode: queue[0]?.episodeNo ?? null,
      currentFileProgress: 0,
      currentFilePhase: queue.length > 0 ? "uploading" : "idle",
      status: "uploading",
      error: "",
    });

    for (const item of queue) {
      if (controller.signal.aborted) break;
      try {
        updateUploadTask(taskId, {
          currentEpisode: item.episodeNo,
          currentFileProgress: 0,
          currentFilePhase: "uploading",
          status: "uploading",
          error: "",
        });
        // 替换已上传集：进度条不占用「新一集」份额，避免分母错觉
        const countsAsNew = !item.alreadyUploaded;
        const videoUrl = await uploadFile(
          item.file,
          PUBLISHER_UPLOAD_PATH,
          controller.signal,
          (percent, phase = "uploading") => {
            const overall =
              totalEpisodes > 0
                ? countsAsNew
                  ? ((uploadedEpisodes + percent / 100) / totalEpisodes) * 100
                  : (uploadedEpisodes / totalEpisodes) * 100
                : percent;
            updateUploadTask(taskId, {
              currentEpisode: item.episodeNo,
              currentFileProgress: percent,
              currentFilePhase: phase,
              progress: overall,
              status: "uploading",
            });
          },
        );
        const result = await saveEpisode({
          courseId,
          episodeNo: item.episodeNo,
          title: item.title || undefined,
          videoUrl,
          fileName: item.file.name,
        });
        // 仅「首次成功入库」的集 +1；同 episodeNo 覆盖替换不重复计数
        if (result.uploadStatus === 1 && countsAsNew) {
          uploadedEpisodes = clampUploadedEpisodes(uploadedEpisodes + 1, totalEpisodes);
        } else if (result.uploadStatus === 1) {
          uploadedEpisodes = clampUploadedEpisodes(uploadedEpisodes, totalEpisodes);
        }
        if (result.uploadStatus !== 1) {
          // saveEpisode 业务失败：立即停整批；本地文件保留便于重试
          failedEpisodes.push(item.episodeNo);
          lastError = "";
          const failedItem: UploadTaskCompletedItem = {
            episodeNo: item.episodeNo,
            fileName: item.file.name,
            videoUrl,
            result,
          };
          completed.push(failedItem);
          updateUploadTask(taskId, {
            uploadedEpisodes,
            selectedEpisodes: pendingFiles.get(taskId)?.size ?? 0,
            currentEpisode: null,
            currentFileProgress: 0,
            currentFilePhase: "idle",
            progress: totalEpisodes > 0 ? (uploadedEpisodes / totalEpisodes) * 100 : 0,
            status: "failed",
          });
          emitUploadEpisodeComplete(taskId, failedItem);
          break;
        }
        pendingFiles.get(taskId)?.delete(item.episodeNo);
        pendingEpisodeMeta.get(taskId)?.delete(item.episodeNo);
        const doneItem: UploadTaskCompletedItem = {
          episodeNo: item.episodeNo,
          fileName: item.file.name,
          videoUrl,
          result,
        };
        completed.push(doneItem);
        updateUploadTask(taskId, {
          uploadedEpisodes,
          selectedEpisodes: pendingFiles.get(taskId)?.size ?? 0,
          currentEpisode: null,
          currentFileProgress: 0,
          currentFilePhase: "idle",
          progress: totalEpisodes > 0 ? (uploadedEpisodes / totalEpisodes) * 100 : 0,
        });
        // 每集完成后立即通知 UI，避免整批结束前一直显示「已选择」
        emitUploadEpisodeComplete(taskId, doneItem);
      } catch (error) {
        if (controller.signal.aborted) break;
        failedEpisodes.push(item.episodeNo);
        lastError = error instanceof Error ? error.message : "";
        updateUploadTask(taskId, {
          status: "failed",
          currentEpisode: null,
          currentFileProgress: 0,
          currentFilePhase: "idle",
          error: lastError,
        });
        // 单集失败立即停止后续集
        break;
      }
    }

    const stopped = controller.signal.aborted;
    const selectedEpisodes = pendingFiles.get(taskId)?.size ?? 0;
    updateUploadTask(taskId, {
      uploadedEpisodes,
      selectedEpisodes,
      currentEpisode: null,
      currentFileProgress: 0,
      currentFilePhase: "idle",
      progress: totalEpisodes > 0 ? (uploadedEpisodes / totalEpisodes) * 100 : 0,
      step: uploadedEpisodes >= totalEpisodes && totalEpisodes > 0 ? 3 : 2,
      status: stopped
        ? "paused"
        : failedEpisodes.length > 0
          ? "failed"
          : uploadedEpisodes >= totalEpisodes && totalEpisodes > 0
            ? "ready"
            : "paused",
      error: failedEpisodes.length > 0 && !stopped ? lastError : "",
    });
    return { completed, failedEpisodes, stopped };
  }).finally(() => {
    uploadControllers.delete(taskId);
    uploadRuns.delete(taskId);
  });

  uploadRuns.set(taskId, run);
  return run;
}
