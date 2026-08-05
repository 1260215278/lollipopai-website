# Lollipop.im v1.0.0 — CI 流水线构建指南

## 环境要求

- **Node.js** ≥ 20
- **pnpm** ≥ 9（包管理器已锁定，见 `pnpm-lock.yaml`）
- 操作系统：Linux (推荐) / macOS / Windows

## 流水线步骤

```bash
# 1. 安装依赖
pnpm install

# 2. 给 Vite SSR 打超时补丁（必须！否则 SSG 预渲染会超时降级）
node scripts/patch-vite-ssr.mjs

# 3. 构建（注意：必须用 CI=true，且 pnpm run build 而非 pnpm build）
CI=true pnpm run build
```

构建完成后，`dist/` 目录即为可部署的静态文件。

## 产物说明

| 内容 | 路径 |
|---|---|
| 静态 HTML | `dist/*.html`, `dist/{about,blog,download,...}/*/index.html` |
| JS/CSS 资源 | `dist/assets/` |
| 本地字体 | `dist/fonts/`（Inter / Playfair Display / Orbitron） |
| 博客封面 | `dist/blog-images/`（WebP 格式） |
| Yandex 验证 | `dist/yandex_25ffeb6263c2d258.html` |
| Google 验证 | `dist/google58febbcf1b801feb.html` |
| SEO 审计报告 | `dist/seo-audit-www.bonjourluxe.com--2026-08-05.html` |

## 当前已知限制

- **SSG 预渲染**使用 meta-only 模式（SEO meta/JSON-LD 标签完整，但 `#root` div 内无 React SSR HTML）。如需完整 SSR，请排查 Vite `createServer` 在构建环境下的死锁问题（见 `scripts/prerender-plugin.ts` 第 597 行附近注释）。
- 所有字体已本地化（public/fonts/），不依赖 Google Fonts。
