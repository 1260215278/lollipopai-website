import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readSource = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const uploadSource = readSource("src/app/services/upload.ts");
const commonMessagesSource = readSource("src/app/distribution/i18n/common.ts");
const contentMessagesSource = readSource("src/app/distribution/i18n/content.ts");
const uploadFormSource = readSource("src/app/distribution/components/content/UploadForm.tsx");
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
  assert.match(uploadSource, /file\.slice\(start, Math\.min\(start \+ session\.chunkSize, file\.size\)\)/);
  assert.match(uploadSource, /form\.append\("uploadId", uploadId\)/);
  assert.match(uploadSource, /form\.append\("chunkIndex", String\(chunkIndex\)\)/);
  assert.match(uploadSource, /form\.append\("chunk", chunk/);
});

test("chunk requests retry and a failed or stopped session is cancelled", () => {
  assert.match(uploadSource, /const CHUNK_RETRY_LIMIT = 3/);
  assert.match(uploadSource, /await withChunkRetry\(async \(\) =>/);
  assert.match(uploadSource, /if \(uploadId\) await cancelChunkUpload\(uploadId\)/);
  assert.match(uploadSource, /requestUpload<string>\(PUBLISHER_CHUNK_COMPLETE_PATH/);
  assert.match(uploadSource, /onProgress\?\.\(Math\.round/);
});

test("upload service passes through AbortSignal without showing a network-error toast", () => {
  assert.match(uploadSource, /signal\?: AbortSignal/);
  assert.match(uploadSource, /body: form, signal/);
  assert.match(uploadSource, /catch \(error\) \{\s*if \(signal\?\.aborted\) throw error;/);
});

test("new-drama batch upload stops the current request and keeps unfinished files selected", () => {
  assert.match(uploadFormSource, /const controller = new AbortController\(\)/);
  assert.match(uploadFormSource, /uploadFile\([\s\S]*?r\.file as File,[\s\S]*?controller\.signal,[\s\S]*?uploadProgress: percent/);
  assert.match(uploadFormSource, /if \(controller\.signal\.aborted\) break;[\s\S]*?updateVideo\(r\.episodeNo/);
  assert.match(uploadFormSource, /const stopEpisodeUpload = \(\) => \{[\s\S]*?uploadAbortRef\.current\?\.abort\(\)/);
  assert.match(uploadFormSource, /<Square[\s\S]*?\{t\.stopUpload\}/);
  assert.match(uploadFormSource, /`\$\{t\.epUploading\} \$\{v\.uploadProgress\}%`/);
});

test("episode-management batch upload stops and restores every unresolved local file", () => {
  assert.match(episodesViewSource, /const unresolved = new Map<number, PendingFileState>/);
  assert.match(episodesViewSource, /uploadFile\([\s\S]*?r\.newFile as File,[\s\S]*?controller\.signal,[\s\S]*?uploadProgress: percent/);
  assert.match(episodesViewSource, /unresolved\.delete\(r\.episodeNo\)/);
  assert.match(episodesViewSource, /await load\(unresolved\)/);
  assert.match(episodesViewSource, /uploadAbortRef\.current\?\.abort\(\)/);
  assert.match(episodesViewSource, /`\$\{t\.epUploading\} \$\{ep\.uploadProgress\}%`/);
});

test("413 and stop-upload messages exist in every supported distribution locale", () => {
  assert.equal((commonMessagesSource.match(/uploadRequestTooLarge:/g) ?? []).length, 5);
  assert.equal((contentMessagesSource.match(/stopUpload:/g) ?? []).length, 5);
  assert.equal((contentMessagesSource.match(/uploadStopped:/g) ?? []).length, 5);
});
