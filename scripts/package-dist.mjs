/**
 * package-dist.mjs
 * dist 部署包「版本管理 + 增量打包」脚本
 *
 * 思路：
 *   - 版本号单一事实源 = package.json 的 version + 构建时间戳（YYYYMMDD-HHMM）
 *   - 递归计算 dist/ 所有文件 sha256，与上一次 baseline manifest 对比
 *   - 只打包「变化的文件」：
 *       * full  包：全量（首次部署 / 回滚用，每次都生成）
 *       * delta 包：仅 added + changed 文件（非首次、且确有变化时才生成）
 *       * deleted.txt：被删除文件的清理清单（部署时按清单 rm）
 *   - baseline manifest 持久化在 packages/.deploy-manifest.json，供下次增量对比
 *   - 部署时只覆盖变化文件，不动未变文件 → 体积更小、风险更低、可回滚
 *
 * 用法：
 *   node scripts/package-dist.mjs            # 增量打包（首次=全量）
 *   node scripts/package-dist.mjs --full     # 强制只打全量（等价首次）
 *
 * v1: 内容哈希增量打包 + 版本管理
 */
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 从临时目录加载 tar 库（绕过 pnpm workspace 安装问题，正确处理中文文件名）
const TAR_LIB_DIR = "C:/Users/Administrator/AppData/Local/Temp/tar-lib";
const require = createRequire(TAR_LIB_DIR + "/");
const tar = require("tar");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT, "dist");
const PKG_DIR = path.join(ROOT, "packages");
// baseline manifest：跨构建持久，放在 packages/（不受 build 清 dist 影响）
const MANIFEST_PATH = path.join(PKG_DIR, ".deploy-manifest.json");
// dist 内的部署元数据不进包
const EXCLUDE_IN_DIST = new Set([".deploy-manifest.json"]);

/** 构建时间戳：YYYYMMDD-HHMM（本地时区，便于人工对照） */
function buildStamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `-${p(d.getHours())}${p(d.getMinutes())}`
  );
}

/** 读 package.json 的 version 作为版本主号 */
function pkgVersion() {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(ROOT, "package.json"), "utf-8")
  );
  return pkg.version || "0.0.0";
}

/** 计算文件 sha256（小文件一次读，足够用） */
function sha256File(fullPath) {
  const h = crypto.createHash("sha256");
  h.update(fs.readFileSync(fullPath));
  return h.digest("hex");
}

/** 递归收集 dist 文件 -> { relPath: sha256 } */
function collectDistFiles() {
  const files = {};
  function walk(dir, base) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = path.posix.join(base, entry.name).replace(/\\/g, "/");
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, rel);
      } else if (entry.isFile()) {
        if (EXCLUDE_IN_DIST.has(entry.name)) continue;
        files[rel] = sha256File(full);
      }
    }
  }
  walk(DIST_DIR, ".");
  return files;
}

/** 读 baseline（上一次打包的哈希清单），损坏或不存在返回 {} */
function loadBaseline() {
  if (!fs.existsSync(MANIFEST_PATH)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
    return data.files && typeof data.files === "object" ? data.files : {};
  } catch {
    return {};
  }
}

/** 把一组相对路径打包成 tar.gz（cwd=dist） */
async function pack(files, outFile) {
  if (files.length === 0) return false;
  await tar.c(
    {
      gzip: true,
      file: outFile,
      cwd: DIST_DIR,
      portable: true,
      noDirRecurse: true,
      prefix: "",
    },
    files
  );
  return true;
}

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error("❌ dist/ 不存在，请先 CI=true pnpm run build");
    process.exit(1);
  }
  fs.mkdirSync(PKG_DIR, { recursive: true });

  const forceFull = process.argv.includes("--full");
  const VER = `${pkgVersion()}-${buildStamp()}`;
  const current = collectDistFiles();
  const prev = loadBaseline();
  const isFirst = forceFull || Object.keys(prev).length === 0;

  // 分类
  const added = [];
  const changed = [];
  const unchanged = [];
  for (const rel of Object.keys(current)) {
    if (!(rel in prev)) added.push(rel);
    else if (prev[rel] !== current[rel]) changed.push(rel);
    else unchanged.push(rel);
  }
  const deleted = [];
  for (const rel of Object.keys(prev)) {
    if (!(rel in current)) deleted.push(rel);
  }

  const fullName = `lollipop-dist-${VER}-full.tar.gz`;
  const deltaName = `lollipop-dist-${VER}-delta.tar.gz`;
  const delName = `lollipop-dist-${VER}-deleted.txt`;
  const fullPath = path.join(PKG_DIR, fullName);

  console.log(`\n📦 Lollipop dist 打包  [版本 ${VER}]`);
  console.log(
    `   模式: ${isFirst ? "首次/全量" : "增量"}  ·  dist 文件数: ${Object.keys(current).length}`
  );

  // 1) 总打 full（每次都生成，作为基准/回滚包）
  await pack(Object.keys(current), fullPath);

  // 2) delta（非首次且有变化）
  let deltaPath = null;
  if (!isFirst) {
    const delta = [...added, ...changed];
    if (delta.length > 0) {
      deltaPath = path.join(PKG_DIR, deltaName);
      await pack(delta, deltaPath);
    }
    // 3) deleted 清单（被删除的文件）
    if (deleted.length > 0) {
      const lines = [
        "# 部署时清理已删除文件：",
        "#   cd /var/www/lollipop && bash lollipop-dist-<VER>-deleted.txt",
        ...deleted.map((d) => `rm -f "${d}"`),
      ];
      fs.writeFileSync(path.join(PKG_DIR, delName), lines.join("\n") + "\n");
    }
  }

  // 4) 写回 baseline manifest（供下次增量对比）
  fs.writeFileSync(
    MANIFEST_PATH,
    JSON.stringify(
      { version: VER, generatedAt: new Date().toISOString(), files: current },
      null,
      2
    )
  );

  // 摘要
  console.log(`\n✅ 完成`);
  console.log(`   full : ${fullName}  (${humanSize(fs.statSync(fullPath).size)})`);
  if (deltaPath) {
    console.log(
      `   delta: ${deltaName}  (${humanSize(fs.statSync(deltaPath).size)})`
    );
  } else if (!isFirst) {
    console.log(`   delta: (无变化，跳过)`);
  }
  if (deleted.length > 0) {
    console.log(
      `   del  : ${delName}  (${deleted.length} 个待删文件)`
    );
  }
  console.log(
    `\n   文件变化: +${added.length} 新增 / ~${changed.length} 修改 / -${deleted.length} 删除 / =${unchanged.length} 未变`
  );
  console.log(`   baseline: ${path.relative(ROOT, MANIFEST_PATH)} 已更新`);

  // 部署指引
  console.log(`\n🚀 部署:`);
  if (isFirst) {
    console.log(`   首次部署 → 解压 full 包到站点根目录`);
  } else {
    console.log(`   增量更新 → 解压 delta 包覆盖; 有 deleted.txt 则按清单清理`);
    console.log(`   回滚     → 保留的历史 full 包直接解压覆盖`);
  }
}

main().catch((err) => {
  console.error("打包失败:", err);
  process.exit(1);
});
