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
      'import { PUBLISHER_UPLOAD_PATH, uploadFile, type UploadProgressPhase } from "../services/upload";',
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

test("upload task store serializes different dramas and pauses only the selected task", async () => {
  const { localStorage, store } = await loadExecutableStore();
  const activeUploads = new Map();

  globalThis.__uploadTaskTestHooks.uploadFile = (file, _path, signal, onProgress) =>
    new Promise((resolve, reject) => {
      activeUploads.set(file.name, { resolve, signal });
      onProgress(25, "uploading");
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
  await flushMicrotasks();

  // 全局串行：同一时刻只有第一个任务真正在传
  assert.equal(activeUploads.size, 1);
  assert.ok(activeUploads.has("first.mp4"));
  assert.equal(store.getUploadTask(first.id).status, "uploading");
  assert.equal(store.getUploadTask(second.id).status, "uploading");
  assert.equal(store.getUploadTask(first.id).currentFilePhase, "uploading");

  store.pauseUploadTask(first.id);
  await flushMicrotasks();

  // 第一个被 pause 后，第二个才开始
  assert.ok(activeUploads.has("second.mp4"));
  assert.equal(activeUploads.get("second.mp4").signal.aborted, false);
  activeUploads.get("second.mp4").resolve("https://example.com/second.mp4");
  await flushMicrotasks();

  const [firstResult, secondResult] = await Promise.all([firstRun, secondRun]);
  assert.equal(firstResult.stopped, true);
  assert.equal(secondResult.stopped, false);
  assert.equal(activeUploads.get("first.mp4").signal.aborted, true);
  assert.equal(store.getUploadTask(first.id).status, "paused");
  assert.equal(store.getUploadTask(first.id).selectedEpisodes, 1);
  assert.equal(store.getUploadTask(second.id).status, "ready");
  assert.equal(store.getUploadTask(second.id).uploadedEpisodes, 1);
  assert.equal(store.getUploadTask(second.id).selectedEpisodes, 0);
  assert.equal(store.getUploadTask(second.id).currentFilePhase, "idle");

  await waitForPersistence();
  const persisted = localStorage.getItem(STORAGE_KEY);
  assert.equal(persisted.includes("first.mp4"), false);
  assert.equal(persisted.includes("second.mp4"), false);
});

test("upload task store stops the whole batch after the first failed episode", async () => {
  const { store } = await loadExecutableStore();
  const started = [];

  globalThis.__uploadTaskTestHooks.uploadFile = async (file, _path, _signal, onProgress) => {
    started.push(file.name);
    onProgress(50, "uploading");
    if (file.name === "ep1.mp4") throw new Error("chunk failed");
    return `https://example.com/${file.name}`;
  };
  globalThis.__uploadTaskTestHooks.saveEpisode = async () => ({
    uploadStatus: 1,
    videoSize: 1,
    videoDuration: 1,
  });

  const task = store.createUploadTask({ courseId: 301, title: "失败即停", totalEpisodes: 2, step: 2 });
  const ep1 = new File(["1"], "ep1.mp4", { type: "video/mp4" });
  const ep2 = new File(["2"], "ep2.mp4", { type: "video/mp4" });
  store.setPendingUploadFile(task.id, 1, ep1);
  store.setPendingUploadFile(task.id, 2, ep2);

  const result = await store.startUploadTask(task.id, 301, 2, [
    { episodeNo: 1, title: "1", file: ep1 },
    { episodeNo: 2, title: "2", file: ep2 },
  ]);

  assert.deepEqual(started, ["ep1.mp4"]);
  assert.deepEqual(result.failedEpisodes, [1]);
  assert.equal(result.completed.length, 0);
  assert.equal(result.stopped, false);
  assert.equal(store.getUploadTask(task.id).status, "failed");
  assert.equal(store.getUploadTask(task.id).selectedEpisodes, 2);
});

test("upload task store does not count replace uploads past totalEpisodes", async () => {
  const { store } = await loadExecutableStore();
  let saves = 0;

  globalThis.__uploadTaskTestHooks.uploadFile = async (_file, _path, _signal, onProgress) => {
    onProgress(100, "merging");
    return "https://example.com/v.mp4";
  };
  globalThis.__uploadTaskTestHooks.saveEpisode = async () => {
    saves += 1;
    return { uploadStatus: 1, videoSize: 1, videoDuration: 1 };
  };

  const task = store.createUploadTask({ courseId: 401, title: "替换计数", totalEpisodes: 2, step: 2 });
  store.updateUploadTask(task.id, { uploadedEpisodes: 2, progress: 100, status: "ready" });

  const ep1 = new File(["1"], "ep1.mp4", { type: "video/mp4" });
  const ep2 = new File(["2"], "ep2.mp4", { type: "video/mp4" });
  store.setPendingUploadFile(task.id, 1, ep1);
  store.setPendingUploadFile(task.id, 2, ep2);

  await store.startUploadTask(task.id, 401, 2, [
    { episodeNo: 1, title: "1", file: ep1, alreadyUploaded: true },
    { episodeNo: 2, title: "2", file: ep2, alreadyUploaded: true },
  ]);

  assert.equal(saves, 2);
  assert.equal(store.getUploadTask(task.id).uploadedEpisodes, 2);
  assert.equal(store.getUploadTask(task.id).totalEpisodes, 2);
});

test("upload task store clamps inflated uploadedEpisodes from persistence", async () => {
  const { store } = await loadExecutableStore({
    persistedTasks: [
      {
        id: "inflated-task",
        courseId: 501,
        title: "脏数据",
        totalEpisodes: 8,
        uploadedEpisodes: 13,
        selectedEpisodes: 0,
        currentEpisode: null,
        currentFileProgress: 0,
        progress: 100,
        step: 2,
        status: "ready",
        error: "",
        updatedAt: 1,
      },
    ],
  });

  const restored = store.getUploadTask("inflated-task");
  assert.equal(restored.uploadedEpisodes, 8);
  assert.equal(restored.progress, 100);
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
  assert.equal(restored.currentFilePhase, "idle");
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
