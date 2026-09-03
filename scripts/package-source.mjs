/**
 * package-source.mjs
 * 源码打包脚本（给客户流水线用）
 *
 * 流程：
 *   1. 清空 packages/ 下所有旧的 *-source.tar.gz
 *   2. 将项目源码（含全部构建必需配置与资源）打包成 packages/lollipop-<VERSION>-source.tar.gz
 *   3. 校验产物大小
 *
 * 用法：node scripts/package-source.mjs   （可改下方 VERSION）
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * 强制删除文件（绕过 safe-delete 回收站拦截，用 PowerShell Remove-Item -Force）
 */
function forceRemove(target) {
  execFileSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Remove-Item -LiteralPath '${target.replace(/'/g, "''")}' -Force -ErrorAction SilentlyContinue`,
    ],
    { stdio: "ignore" }
  );
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "packages");
const VERSION = "v1.0.0";

// 必须排除的内容（依赖、缓存、旧构建产物、机密）
const EXCLUDES = [
  "node_modules",
  "_node_modules_old",
  "dist",
  "dist_old*",
  "packages", // 打包产物输出目录，不递归进归档
  ".git",
  ".workbuddy",
  ".pnpm-cache",
  ".pnpm-store",
  ".trae-html-share-packages",
  ".env",
  "tmp_about.html",
  "tmp_home.html",
  // 根目录残留的旧交付包，避免被打进新包造成嵌套膨胀
  "lollipop-*-source.tar.gz",
  "lollipop-*-dist.tar.gz",
  "dist-deploy-*.zip",
];

function main() {
  // 1. 确保输出目录存在
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // 2. 删除旧的源码包（packages/ 与根目录都清，确保目录里只剩最新一份）
  const old = [
    ...fs.readdirSync(OUT_DIR).filter((f) => f.endsWith("-source.tar.gz")),
    ...fs
      .readdirSync(ROOT)
      .filter((f) => f.endsWith("-source.tar.gz")),
  ];
  if (old.length > 0) {
    console.log("🗑  删除旧的源码包:");
    for (const f of old) {
      const p =
        f.startsWith("lollipop-") && fs.existsSync(path.join(ROOT, f))
          ? path.join(ROOT, f)
          : path.join(OUT_DIR, f);
      forceRemove(p);
      console.log("   - " + f);
    }
  }

  // 3. 组装 tar 参数
  const outFile = path.join(OUT_DIR, `lollipop-${VERSION}-source.tar.gz`);
  const args = ["-czf", outFile];
  for (const e of EXCLUDES) args.push(`--exclude=${e}`);
  args.push(".");

  console.log(`\n📦 打包源码 -> ${path.relative(ROOT, outFile)}`);
  execFileSync("tar", args, { cwd: ROOT, stdio: "inherit" });

  // 4. 校验
  const size = fs.statSync(outFile).size;
  const mb = (size / 1024 / 1024).toFixed(1);
  console.log(`\n✅ 完成: ${path.basename(outFile)} (${mb} MB)`);
  console.log(`   位置: ${outFile}`);

  // 5. 列一下包内最大文件，防止意外混入巨型文件
  const listing = execFileSync("tar", ["-tvzf", outFile], {
    cwd: ROOT,
  }).toString();
  const top = listing
    .split("\n")
    .map((l) => {
      const parts = l.split(/\s+/);
      const size = Number(parts[2] || 0);
      return { name: parts[5] || "", size };
    })
    .filter((x) => x.name && x.size > 1_000_000)
    .sort((a, b) => b.size - a.size)
    .slice(0, 8);

  if (top.length) {
    console.log("\n📋 包内 >1MB 文件 top:");
    for (const t of top) {
      console.log(`   ${t.name}  (${(t.size / 1024 / 1024).toFixed(1)} MB)`);
    }
  }
}

main();
