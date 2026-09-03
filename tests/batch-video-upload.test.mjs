import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  getFolderEpisodeTitle,
  prepareBatchVideoFiles,
} from "../src/app/distribution/components/content/batchVideoFiles.ts";

const source = readFileSync(
  new URL("../src/app/distribution/components/content/UploadForm.tsx", import.meta.url),
  "utf8",
);

test("batch video files keep accepted formats and use natural numeric ordering", () => {
  const files = [
    { name: "10.mp4", type: "video/mp4" },
    { name: "notes.txt", type: "text/plain" },
    { name: "2.MP4", type: "" },
    { name: "1.mp4", type: "video/mp4" },
  ];

  const sorted = prepareBatchVideoFiles(files, "video/mp4,.mp4");

  assert.deepEqual(sorted.map((file) => file.name), ["1.mp4", "2.MP4", "10.mp4"]);
});

test("folder uploads ignore macOS and nested hidden files", () => {
  const files = [
    { name: ".DS_Store", type: "application/octet-stream", webkitRelativePath: "测试视频/.DS_Store" },
    { name: "._1.mp4", type: "", webkitRelativePath: "测试视频/._1.mp4" },
    { name: "2.mp4", type: "video/mp4", webkitRelativePath: "测试视频/.cache/2.mp4" },
    { name: "1.mp4", type: "video/mp4", webkitRelativePath: "测试视频/1.mp4" },
  ];

  const sorted = prepareBatchVideoFiles(files, "video/mp4,.mp4");

  assert.deepEqual(sorted.map((file) => file.name), ["1.mp4"]);
});

test("folder uploads prefix the top-level folder name to the episode title", () => {
  assert.equal(
    getFolderEpisodeTitle({
      name: "1.mp4",
      type: "video/mp4",
      webkitRelativePath: "测试视频/1.mp4",
    }),
    "测试视频1",
  );
  assert.equal(getFolderEpisodeTitle({ name: "1.mp4", type: "video/mp4" }), null);
});

test("batch upload rejects a selection larger than the planned episode count before assigning rows", () => {
  assert.match(
    source,
    /if \(files\.length > videos\.length\) \{\s*toast\.error\(fmt\(t\.batchUploadTooMany,[\s\S]*?return;\s*\}\s*files\.forEach/,
  );
});

test("batch upload exposes both multiple-file and folder pickers", () => {
  assert.match(source, /ref=\{batchVideoInputRef\}[\s\S]*?multiple[\s\S]*?onPickBatchVideos/);
  assert.match(source, /folderInputRef\.current\?\.setAttribute\("webkitdirectory", ""\)/);
  assert.match(source, /ref=\{folderInputRef\}[\s\S]*?multiple[\s\S]*?onPickBatchVideos/);
  assert.match(source, /\{t\.batchUploadEpisodes\}/);
  assert.match(source, /\{t\.uploadFolder\}/);
});
