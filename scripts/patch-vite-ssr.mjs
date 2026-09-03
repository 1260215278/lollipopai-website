/**
 * Vite SSR 超时补丁 — CI 流水线 prebuild 脚本
 *
 * 问题：Vite 6.3.5 的 build-time SSR 使用 module-runner 的默认
 * transport timeout 只有 60s，大 SSG 站点（8 篇博客 + 48 页）会超时导致
 * SSR 降级为 meta-only。
 *
 * 修复：将 60s 改为 300s。
 * 注意：每次 pnpm install 后 node_modules 重置，此补丁就会丢失，
 * 因此流水线必须在 install 之后、build 之前运行本脚本。
 *
 * 用法：node scripts/patch-vite-ssr.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const file = join(
  import.meta.dirname,
  '..',
  'node_modules',
  'vite',
  'dist',
  'node',
  'module-runner.js'
);

const content = readFileSync(file, 'utf-8');
const patched = content.replace(
  'timeout = transport.timeout ?? 6e4',
  'timeout = transport.timeout ?? 3e5',
);

if (content === patched) {
  console.log('[patch-vite-ssr] Already patched or pattern not found — skipping');
} else {
  writeFileSync(file, patched);
  console.log('[patch-vite-ssr] Patched: timeout 6e4 → 3e5 (60s → 300s)');
}
