import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readSource = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const storeSource = readSource("src/app/distribution/uploadTaskStore.ts");
const formSource = readSource("src/app/distribution/components/content/UploadForm.tsx");
const contentPageSource = readSource("src/app/distribution/pages/ContentPage.tsx");
const layoutSource = readSource("src/app/distribution/DistributionLayout.tsx");
const serviceSource = readSource("src/app/services/content.ts");

test("upload tasks use a versioned metadata store while files stay in memory", () => {
  assert.match(storeSource, /const STORAGE_KEY = "distribution\.upload\.tasks\.v2"/);
  assert.match(storeSource, /const pendingFiles = new Map<string, Map<number, File>>\(\)/);
  assert.match(storeSource, /filter\(\(task\) => task\.courseId !== null\)/);
  assert.doesNotMatch(storeSource, /"Upload failed"/);
});

test("different dramas can upload concurrently and pausing only stops the selected task", () => {
  assert.match(storeSource, /const uploadControllers = new Map<string, AbortController>\(\)/);
  assert.match(storeSource, /const activeRun = uploadRuns\.get\(taskId\)/);
  assert.match(storeSource, /uploadControllers\.get\(taskId\)\?\.abort\(\)/);
  assert.match(storeSource, /uploadRuns\.set\(taskId, run\)/);
  assert.match(layoutSource, /Math\.min\(100, Math\.max\(task\.progress/);
});

test("switching upload tasks remounts the form and does not update an unmounted form", () => {
  assert.match(contentPageSource, /<UploadForm\s+key=\{task\.id\}/);
  assert.match(formSource, /const mountedRef = useRef\(true\)/);
  assert.match(formSource, /if \(!mountedRef\.current\) return/);
  assert.match(formSource, /if \(mountedRef\.current\) setUploadingEps\(false\)/);
});

test("task synchronization restores a selected draft and removes stale transient state", () => {
  assert.match(serviceSource, /fetchDraftTasks\(\)[\s\S]*?"\/publisher\/course\/drafts"/);
  assert.match(serviceSource, /fetchDraft\(courseId\?: number\)[\s\S]*?params: \{ courseId \}/);
  assert.match(layoutSource, /accountChanged && task\.courseId === null/);
  assert.match(layoutSource, /clearUploadTasks\(\);\s*clearTokens\(\)/);
  assert.match(contentPageSource, /if \(task\?\.courseId === null\) removeUploadTask\(task\.id\)/);
});

test("opening an actively uploading draft preserves its running state and progress", () => {
  assert.match(formSource, /const isUploading = existingTask\?\.status === "uploading"/);
  assert.match(formSource, /currentEpisode: isUploading \? existingTask\.currentEpisode : null/);
  assert.match(formSource, /progress: isUploading\s*\? existingTask\.progress/);
  assert.match(formSource, /status: isUploading\s*\? "uploading"/);
});

test("upload task menu supports delete with secondary confirm and clears server draft", () => {
  assert.match(layoutSource, /onDeleteTask=\{requestDeleteUploadTask\}/);
  assert.match(layoutSource, /taskPendingDelete/);
  assert.match(layoutSource, /confirmDeleteUploadTask/);
  assert.match(layoutSource, /deleteUploadTaskTitle/);
  assert.match(layoutSource, /await clearDraft\(task\.courseId\)/);
  assert.match(layoutSource, /removeUploadTask\(task\.id\)/);
  assert.match(layoutSource, /params\.get\("uploadTask"\) === task\.id/);
  assert.match(layoutSource, /Trash2/);
  const commonSource = readSource("src/app/distribution/i18n/common.ts");
  assert.match(commonSource, /deleteUploadTask:/);
  assert.match(commonSource, /deleteUploadTaskTitle:/);
  assert.match(commonSource, /deleteUploadTaskDesc:/);
  assert.match(commonSource, /deleteUploadTaskOk:/);
  assert.match(commonSource, /deleteUploadTaskSuccess:/);
});
