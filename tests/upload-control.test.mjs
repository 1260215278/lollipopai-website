import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readSource = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const uploadSource = readSource("src/app/services/upload.ts");
const commonMessagesSource = readSource("src/app/distribution/i18n/common.ts");
const contentMessagesSource = readSource("src/app/distribution/i18n/content.ts");
const uploadFormSource = readSource("src/app/distribution/components/content/UploadForm.tsx");
const uploadTaskStoreSource = readSource("src/app/distribution/uploadTaskStore.ts");
const episodesViewSource = readSource("src/app/distribution/components/content/EpisodesView.tsx");

test("upload service reports gateway 413 before attempting to parse the HTML response", () => {
  const statusBranch = uploadSource.indexOf("if (res.status === 413)");
  const jsonParse = uploadSource.indexOf("await res.json()");

  assert.ok(statusBranch >= 0);
  assert.ok(jsonParse > statusBranch);
  assert.match(uploadSource, /common\.uploadRequestTooLarge/);
  assert.match(uploadSource, /throw new ApiError\(res\.status, getMessages\(\)\.distribution\.common\.uploadRequestTooLarge\)/);
});

test("publisher upload uses the complete chunk protocol", () => {
  assert.match(uploadSource, /PUBLISHER_CHUNK_INIT_PATH = `\$\{PUBLISHER_UPLOAD_PATH\}\/init`/);
  assert.match(uploadSource, /PUBLISHER_CHUNK_PATH = `\$\{PUBLISHER_UPLOAD_PATH\}\/chunk`/);
  assert.match(uploadSource, /PUBLISHER_CHUNK_COMPLETE_PATH = `\$\{PUBLISHER_UPLOAD_PATH\}\/complete`/);
  assert.match(uploadSource, /PUBLISHER_CHUNK_CANCEL_PATH = `\$\{PUBLISHER_UPLOAD_PATH\}\/cancel`/);
  assert.match(uploadSource, /file\.slice\(start, end\)/);
  assert.match(uploadSource, /expectedChunkByteSize\(file\.size, chunkSize, chunkIndex\)/);
  assert.match(uploadSource, /form\.append\("uploadId", uploadId\)/);
  assert.match(uploadSource, /form\.append\("chunkIndex", String\(chunkIndex\)\)/);
  assert.match(uploadSource, /form\.append\("chunk", chunk/);
});

test("chunk protocol matches backend: 5MB slices, sequential from 0, cancel only before complete", () => {
  assert.match(uploadSource, /const CHUNK_RETRY_LIMIT = 3/);
  assert.match(uploadSource, /export const PUBLISHER_CHUNK_SIZE_BYTES = 5 \* 1024 \* 1024/);
  assert.match(uploadSource, /export const PUBLISHER_MAX_TOTAL_CHUNKS = 100/);
  assert.match(uploadSource, /const CHUNK_REQUEST_TIMEOUT_MS = 90_000/);
  assert.match(uploadSource, /const COMPLETE_REQUEST_TIMEOUT_MS = 300_000/);
  assert.match(uploadSource, /await withChunkRetry\(/);
  // 分片阶段 / 用户停止才 cancel；合并阶段失败保留会话
  assert.match(uploadSource, /if \(uploadId && \(signal\?\.aborted \|\| !allChunksOnServer\)\)/);
  assert.match(uploadSource, /await cancelChunkUpload\(uploadId\)/);
  assert.match(uploadSource, /requestUpload<string>\(\s*PUBLISHER_CHUNK_COMPLETE_PATH/);
  // 不可把 uploadedChunks 计数当续传下标
  assert.doesNotMatch(uploadSource, /const startIndex = Math\.min\(Math\.max\(0, session\.uploadedChunks/);
  assert.match(uploadSource, /for \(let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex \+= 1\)/);
  assert.match(uploadSource, /expectedChunkByteSize/);
  assert.match(uploadSource, /postChunkWithProgress/);
  assert.match(uploadSource, /onProgress\?\.\(100, "merging"\)/);
  assert.match(uploadSource, /common\.uploadTimeout/);
});

test("upload service passes through AbortSignal without showing a network-error toast", () => {
  assert.match(uploadSource, /signal\?: AbortSignal/);
  assert.match(uploadSource, /catch \(error\) \{\s*if \(signal\?\.aborted\) throw error;/);
});

test("new-drama batch upload runs in the global task manager, serializes tasks, and stops on first failure", () => {
  assert.match(uploadTaskStoreSource, /const uploadRuns = new Map<string, Promise<UploadTaskRunResult>>\(\)/);
  assert.match(uploadTaskStoreSource, /const controller = new AbortController\(\)/);
  assert.match(uploadTaskStoreSource, /runExclusiveUpload/);
  assert.match(uploadTaskStoreSource, /uploadFile\([\s\S]*?item\.file,[\s\S]*?controller\.signal,[\s\S]*?currentFileProgress: percent/);
  assert.match(uploadTaskStoreSource, /if \(controller\.signal\.aborted\) break/);
  // 单集失败立即 break，不再继续后续集
  assert.match(uploadTaskStoreSource, /status: "failed",[\s\S]*?currentFilePhase: "idle",[\s\S]*?error: lastError,[\s\S]*?\}\);\s*\/\/ 单集失败立即停止后续集\s*break;/);
  // 每集完成即时通知 UI，避免整批结束前一直「已选择」
  assert.match(uploadTaskStoreSource, /emitUploadEpisodeComplete\(taskId, doneItem\)/);
  assert.match(uploadTaskStoreSource, /subscribeUploadEpisodeComplete/);
  assert.match(uploadTaskStoreSource, /setPendingEpisodeMeta/);
  // 替换重传不重复 +1，并夹紧 ≤ totalEpisodes
  assert.match(uploadTaskStoreSource, /alreadyUploaded\?: boolean/);
  assert.match(uploadTaskStoreSource, /clampUploadedEpisodes/);
  assert.match(uploadTaskStoreSource, /countsAsNew/);
  assert.match(uploadFormSource, /alreadyUploaded: video\.uploadStatus === 1/);
  assert.match(uploadFormSource, /const run = startUploadTask\([\s\S]*?file: video\.file as File/);
  assert.match(uploadFormSource, /subscribeUploadEpisodeComplete\(taskId/);
  assert.match(uploadFormSource, /applyCompletedEpisode/);
  assert.match(uploadFormSource, /readVideoDuration\(row\.file\)/);
  assert.match(uploadFormSource, /const stopEpisodeUpload = \(\) => \{[\s\S]*?pauseUploadTask\(taskId\)/);
  assert.match(uploadFormSource, /<Square[\s\S]*?\{t\.stopUpload\}/);
  assert.match(uploadFormSource, /t\.epMerging/);
  assert.match(uploadFormSource, /t\.draftRestoredReselect/);
  assert.match(uploadFormSource, /`\$\{t\.epUploading\} \$\{v\.uploadProgress\}%`/);
});

test("episode-management batch upload stops on failure and restores every unresolved local file", () => {
  assert.match(episodesViewSource, /const unresolved = new Map<number, PendingFileState>/);
  assert.match(episodesViewSource, /uploadFile\([\s\S]*?r\.newFile as File,[\s\S]*?controller\.signal,[\s\S]*?uploadProgress:/);
  assert.match(episodesViewSource, /unresolved\.delete\(r\.episodeNo\)/);
  assert.match(episodesViewSource, /await load\(unresolved\)/);
  assert.match(episodesViewSource, /uploadAbortRef\.current\?\.abort\(\)/);
  assert.match(episodesViewSource, /单集失败立即停止后续集[\s\S]*?break;/);
  assert.match(episodesViewSource, /t\.epMerging/);
});

test("413, timeout, stop-upload and merge messages exist in every supported distribution locale", () => {
  assert.equal((commonMessagesSource.match(/uploadRequestTooLarge:/g) ?? []).length, 7);
  assert.equal((commonMessagesSource.match(/uploadTimeout:/g) ?? []).length, 7);
  assert.equal((contentMessagesSource.match(/stopUpload:/g) ?? []).length, 7);
  assert.equal((contentMessagesSource.match(/uploadStopped:/g) ?? []).length, 7);
  assert.equal((contentMessagesSource.match(/epMerging:/g) ?? []).length, 7);
  assert.equal((contentMessagesSource.match(/draftRestoredReselect:/g) ?? []).length, 7);
});
