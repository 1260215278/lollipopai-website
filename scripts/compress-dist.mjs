// scripts/compress-dist.mjs
// 独立压缩脚本：在 vite build（含预渲染）完成后，为 dist 下所有可压缩资源生成 .gz 和 .br 预压缩文件。
// 不依赖 Vite 插件钩子执行顺序，独立运行更可靠。
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, rmSync } from 'fs'
import { join, extname } from 'path'
import { gzipSync, brotliCompressSync } from 'zlib'

const outDir = 'dist'
const compressExts = new Set(['.html', '.js', '.css', '.json', '.svg', '.xml', '.txt', '.webmanifest'])

function walkDir(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const st = statSync(fullPath)
    if (st.isDirectory()) {
      // 跳过构建中间产物目录（见下面的清理说明）
      if (entry === '.ssr') continue
      walkDir(fullPath, files)
    } else if (compressExts.has(extname(fullPath))) {
      files.push(fullPath)
    }
  }
  return files
}

if (!existsSync(outDir)) {
  console.error('[compress-dist] dist not found, aborting.')
  process.exit(1)
}

// ── 清理构建中间产物 dist/.ssr ───────────────────────────────────────────────
// 预渲染会在 dist/.ssr 下产出一份 SSR bundle（entry-server.js，约 1.4 MB），
// 用完就该删。prerender-plugin.ts 里虽然有 rmSync，但那个进程**还 import 着这个
// bundle**，Windows 下文件句柄未释放 → EBUSY → 异常被空 catch 吞掉 → 静默失败。
// 结果就是 2.2 MB（含 .gz/.br）的中间产物被打进部署包，纯属浪费。
//
// 本脚本是 **vite build 之后的独立进程**，此时已无人持有该 bundle 的句柄，删除可靠。
// 必须在压缩之前删 —— 否则还会白白多出 .gz / .br 两份。
const ssrDir = join(outDir, '.ssr')
if (existsSync(ssrDir)) {
  try {
    rmSync(ssrDir, { recursive: true, force: true })
    console.log('[compress-dist] Cleaned dist/.ssr (SSR build artifact)')
  } catch (e) {
    console.warn(`[compress-dist] .ssr cleanup failed: ${e instanceof Error ? e.message : String(e)}`)
  }
}

const files = walkDir(outDir)
let gz = 0
let br = 0
let brFail = 0

for (const file of files) {
  const data = readFileSync(file)
  try {
    writeFileSync(file + '.gz', gzipSync(data, { level: 9 }))
    gz++
  } catch (e) {
    console.error(`[compress-dist] gzip failed for ${file}:`, e instanceof Error ? e.message : String(e))
  }
  try {
    writeFileSync(file + '.br', brotliCompressSync(data))
    br++
  } catch (e) {
    brFail++
    console.error(`[compress-dist] brotli failed for ${file}:`, e instanceof Error ? e.message : String(e))
  }
}

console.log(`[compress-dist] Done. Gzip: ${gz} files, Brotli: ${br} files${brFail ? `, Brotli failed: ${brFail}` : ''}`)
