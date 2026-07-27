import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { transformWithEsbuild } from "vite";

const STORE_PATH = new URL("../src/app/distribution/uploadTaskStore.ts", import.meta.url);
const STORAGE_KEY = "distribution.upload.tasks.v2";
let moduleSequence = 0;

function createLocalStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

async function loadExecutableStore({ persistedTasks = [] } = {}) {
  const localStorage = createLocalStorage({
    [STORAGE_KEY]: JSON.stringify(persistedTasks),
  });
  globalThis.window = {
    crypto: globalThis.crypto,
    localStorage,
  };
  globalThis.__uploadTaskTestHooks = {
    uploadFile: async () => {
      throw new Error("uploadFile test hook not configured");
    },
    saveEpisode: async () => {
      throw new Error("saveEpisode test hook not configured");
    },
  };

  const source = await readFile(STORE_PATH, "utf8");
  const isolatedSource = source
    .replace(
      'import { useSyncExternalStore } from "react";',
      "const useSyncExternalStore = () => { throw new Error('React hook is not used in store behavior tests'); };",
    )
    .replace(
      'import { saveEpisode, type SaveEpisodeResult } from "../services/content";',
      "const saveEpisode = (...args) => globalThis.__uploadTaskTestHooks.saveEpisode(...args);",
    )
    .replace(
      'import { PUBLISHER_UPLOAD_PATH, uploadFile } from "../services/upload";',
      "const PUBLISHER_UPLOAD_PATH = 'test/publisher'; const uploadFile = (...args) => globalThis.__uploadTaskTestHooks.uploadFile(...args);",
    );
  assert.notEqual(isolatedSource, source);

  const transformed = await transformWithEsbuild(isolatedSource, "uploadTaskStore.ts", {
    format: "esm",
    loader: "ts",
    target: "es2022",
  });
  moduleSequence += 1;
  const dataUrl = `data:text/javascript;base64,${Buffer.from(transformed.code).toString("base64")}#${moduleSequence}`;
  return {
    localStorage,
    store: await import(dataUrl),
  };
}

const flushMicrotasks = () => new Promise((resolve) => setImmediate(resolve));
const waitForPersistence = () => new Promise((resolve) => setTimeout(resolve, 160));

test("upload task store runs different dramas concurrently and pauses only the selected task", async () => {
  const { localStorage, store } = await loadExecutableStore();
  const activeUploads = new Map();

  globalThis.__uploadTaskTestHooks.uploadFile = (file, _path, signal, onProgress) =>
    new Promise((resolve, reject) => {
      activeUploads.set(file.name, { resolve, signal });
      onProgress(25);
      signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
    });
  globalThis.__uploadTaskTestHooks.saveEpisode = async () => ({
    uploadStatus: 1,
    videoSize: 1,
    videoDuration: 1,
  });

  const first = store.createUploadTask({ courseId: 101, title: "第一部", totalEpisodes: 1, step: 2 });
  const second = store.createUploadTask({ courseId: 102, title: "第二部", totalEpisodes: 1, step: 2 });
  const firstFile = new File(["first"], "first.mp4", { type: "video/mp4" });
  const secondFile = new File(["second"], "second.mp4", { type: "video/mp4" });
  store.setPendingUploadFile(first.id, 1, firstFile);
  store.setPendingUploadFile(second.id, 1, secondFile);

  const firstRun = store.startUploadTask(first.id, 101, 1, [
    { episodeNo: 1, title: "第一集", file: firstFile },
  ]);
  const duplicateFirstRun = store.startUploadTask(first.id, 101, 1, [
    { episodeNo: 1, title: "第一集", file: firstFile },
  ]);
  const secondRun = store.startUploadTask(second.id, 102, 1, [
    { episodeNo: 1, title: "第一集", file: secondFile },
  ]);

  assert.equal(duplicateFirstRun, firstRun);
  assert.equal(activeUploads.size, 2);
  assert.equal(store.getUploadTask(first.id).status, "uploading");
  assert.equal(store.getUploadTask(second.id).status, "uploading");
  assert.equal(activeUploads.get("second.mp4").signal.aborted, false);

  store.pauseUploadTask(first.id);
  activeUploads.get("second.mp4").resolve("https://example.com/second.mp4");
  await flushMicrotasks();

  const [firstResult, secondResult] = await Promise.all([firstRun, secondRun]);
  assert.equal(firstResult.stopped, true);
  assert.equal(secondResult.stopped, false);
  assert.equal(activeUploads.get("first.mp4").signal.aborted, true);
  assert.equal(activeUploads.get("second.mp4").signal.aborted, false);
  assert.equal(store.getUploadTask(first.id).status, "paused");
  assert.equal(store.getUploadTask(first.id).selectedEpisodes, 1);
  assert.equal(store.getUploadTask(second.id).status, "ready");
  assert.equal(store.getUploadTask(second.id).uploadedEpisodes, 1);
  assert.equal(store.getUploadTask(second.id).selectedEpisodes, 0);

  await waitForPersistence();
  const persisted = localStorage.getItem(STORAGE_KEY);
  assert.equal(persisted.includes("first.mp4"), false);
  assert.equal(persisted.includes("second.mp4"), false);
});

test("upload task store restores persisted uploads as paused metadata without local Files", async () => {
  const persistedTask = {
    id: "persisted-task",
    courseId: 201,
    title: "恢复短剧",
    totalEpisodes: 4,
    uploadedEpisodes: 2,
    selectedEpisodes: 2,
    currentEpisode: 3,
    currentFileProgress: 64,
    progress: 66,
    step: 2,
    status: "uploading",
    error: "",
    updatedAt: 1,
  };
  const { localStorage, store } = await loadExecutableStore({
    persistedTasks: [persistedTask],
  });

  const restored = store.getUploadTask("persisted-task");
  assert.equal(restored.status, "paused");
  assert.equal(restored.uploadedEpisodes, 2);
  assert.equal(restored.selectedEpisodes, 0);
  assert.equal(restored.currentEpisode, null);
  assert.equal(restored.currentFileProgress, 0);
  assert.equal(restored.progress, 50);
  assert.equal(store.getPendingUploadFiles("persisted-task").size, 0);

  const transient = store.createUploadTask();
  store.setPendingUploadFile(
    transient.id,
    1,
    new File(["transient"], "transient.mp4", { type: "video/mp4" }),
  );
  await waitForPersistence();

  const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY));
  assert.deepEqual(persisted.map((task) => task.id), ["persisted-task"]);
  assert.equal(JSON.stringify(persisted).includes("transient.mp4"), false);
});
