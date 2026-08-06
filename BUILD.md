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

## 打包源码交付包（可选）

如需把源码打包交给客户流水线/其他环境，使用内置脚本：

```bash
node scripts/package-source.mjs
```

- 脚本会**先删除 `packages/` 与根目录下所有旧的 `lollipop-*-source.tar.gz`**，再重新打包，**确保目录里始终只有最新一份**。
- 自动排除 `node_modules`、`dist`、`dist_old*`、`.git`、`.workbuddy`、`.env`、旧交付包（`lollipop-*-dist.tar.gz`、`dist-deploy-*.zip`）等。
- 产物输出到 **`packages/lollipop-<VERSION>-source.tar.gz`**（`VERSION` 在脚本顶部常量，当前 `v1.0.0`）。
- 该包即客户直接 `pnpm install && node scripts/patch-vite-ssr.mjs && CI=true pnpm run build` 所需的完整源码。

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

- **SSG 预渲染**默认走 build-time 全量 SSR：Rollup 编译 `src/entry-server.tsx` 为独立 bundle，成功即渲染完整 React HTML 正文（对爬虫/无 JS 环境友好）。仅当 SSR bundle 编译失败时才降级为 meta-only 模式（极罕见，会打印 `[prerender] SSR build failed` 警告）。
- **framer-motion** 已显式声明为项目直接依赖（`package.json` 中）。`motion/react` 依赖它提供动画上下文，缺失会导致 SSR 渲染器运行时异常——请勿从依赖中移除。
- 所有字体已本地化（`public/fonts/`），不依赖 Google Fonts。
- **部署路径 `base`**：`vite.config.ts` 默认 `base: '/'`（根域名部署，如 `www.lollipop.im`）。**务必保持为绝对路径**——若改回相对路径 `'./'`，深层路由（如 `/distribution/enroll`）刷新直访时 `./assets/*.js` 会被浏览器误解析成 `/distribution/assets/*.js` 而 404，整页黑屏（已踩坑）。子路径部署（如 `/lollipop/`）请用 `VITE_BASE=/lollipop/ pnpm run build` 覆盖。
