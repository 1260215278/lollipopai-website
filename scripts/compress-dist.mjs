// scripts/compress-dist.mjs
// 独立压缩脚本：在 vite build（含预渲染）完成后，为 dist 下所有可压缩资源生成 .gz 和 .br 预压缩文件。
// 不依赖 Vite 插件钩子执行顺序，独立运行更可靠。
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, extname } from 'path'
import { gzipSync, brotliCompressSync } from 'zlib'

const outDir = 'dist'
const compressExts = new Set(['.html', '.js', '.css', '.json', '.svg', '.xml', '.txt', '.webmanifest'])

function walkDir(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const st = statSync(fullPath)
    if (st.isDirectory()) {
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
