# 方案 B 多语言预渲染落地 — 交付说明（2026-09-01 22:51）

## 概述

用户在多语言预渲染三方案中选定 **方案 B 子集多语言**。本次完成全链路落地：
只对 28 个高价值页面生成 5 语言版本（`/zh/` `/zh-TW/` `/pt/` `/es/` `/ar/`，en 无前缀），
其余页面保持英文 + x-default。hreflang 互指组（6 语言 + x-default→en）只声明**真实存在产物**的 URL。

## 子集范围（28 个 appPath）

| 类别 | 数量 | 说明 |
|---|---|---|
| 静态页 | 6 | `/` `/about` `/creating` `/download` `/contact` `/blog` |
| Genre | 10 | romance / revenge / thriller / ceo-drama / fantasy / action / horror / sci-fi / family / historical |
| HowTo | 12 | `blogMeta.stepCount > 0` 的 12 篇操作指南 |

## 核心改动

| 文件 | 改动 |
|---|---|
| `scripts/prerender-plugin.ts` | `appendMultilangVariants()` 生成 5 语言变体；`buildLocalizedBlogSchema()` 中文 schema；hreflang 互指组 + `dir="rtl"`（仅 ar）；llms 过滤语言前缀；**`rewriteNonSubsetLinks()` 非子集内链回退英文** |
| `src/app/multilangSubset.ts`（新） | 子集判定唯一真源（静态清单 + genres.ts + stepCount>0）；禁止导入 blogContent.ts |
| `src/app/components/MultilangSubsetGuard.tsx`（新） | 运行时兜底：语言前缀 + 非子集路径 → Navigate 英文版；挂 main.tsx + entry-server.tsx |
| `src/app/localePath.ts` | `buildLocalizedPath` 非 en + 非子集 → 回退英文路径 |
| `scripts/update-sitemap-multilang.py`（新） | sitemap 68 → **208 条**（28×6 语言 loc + 40 英文），幂等，CRLF 保真 |
| `scripts/verify-blog.py` | 新增第 12 组（19 项）方案 B 专项校验 |
| `tests/locale-path.test.mjs` | 复刻契约同步子集逻辑 + 新断言（8 项全过） |

## 关键问题与解法（170 死链）

语言版本页面的内链真源是 **`<Link to>` + Router basename**（自动加语言前缀），
并非 `buildLocalizedPath` —— 首版构建 `check-dist-links.py` 报 **170 个唯一缺失路径**。
双管齐下修复：

1. **产物层**：prerender `rewriteNonSubsetLinks` 把语言版本 HTML 中非子集相对 href 回退英文
   （hreflang/canonical/schema 均为绝对 URL，天然不受影响）
2. **运行时层**：`MultilangSubsetGuard` 重定向语言前缀 + 非子集 URL 到英文版
3. **切换器**：`buildLocalizedPath` 非子集回退英文（非子集页切语言只切 UI 壳、URL 不变，已知妥协）

## 验证结果

- 构建：**209 HTML / 210 routes**（70 en + 140 语言版本），gz·br 各 239，**零 SSR 失败**
- `verify-blog.py`：**454 项 ALL PASSED**（较上轮 435 新增 19 项）
- `check-dist-links.py`：213 HTML / 9948 引用，**资源缺失 0 / 悬挂内链 0**
- 单测：locale-path 8/8；另 2 个失败（distribution-public-entry / enroll-banner）为**预存问题**，与本次无关
- 抽查：`<html lang="zh-CN">`、ar 页 `dir="rtl"`、6 语言互指 + x-default、中文 HowTo schema（8 步 + 2 FAQ）、pt/es/ar 标题本地化

## 交付产物

| 文件 | 大小 | 用途 |
|---|---|---|
| `packages/lollipop-dist-0.0.1-20260901-2251-full.tar.gz` | 18.07 MB | 全量部署（首次/回滚） |
| `packages/lollipop-dist-0.0.1-20260901-2251-delta.tar.gz` | 8.23 MB | 增量更新 |
| `packages/lollipop-dist-0.0.1-20260901-2251-deleted.txt` | — | 39 个旧 assets 清理清单 |

## 已知妥协（方案 B 范围）

- pt/es/ar 版正文与 schema 仍为英文（仅标题/描述本地化）—— 正文翻译到位前属预期
- 非 HowTo 博客（17 篇）无语言版本产物，语言版页面内链自动回退英文
- 非子集页面语言切换只切 UI 壳、URL 不变、刷新回英文

## 部署注意

- 服务器 43.160.226.253/lollipop/ 仍为旧版本，需人工上传 `2251-full.tar.gz`
- 语言前缀路径（`/lollipop/zh/about` 等）依赖 Caddy `try_files` 兜底到 index.html 后的 SPA 路由；
  语言版本直链已 SSR 渲染，无需额外服务端配置
- 若后续把非 HowTo 博客纳入多语言：改 prerender 标记 + multilangSubset 判定 + 重跑 sitemap 脚本 + 重建
