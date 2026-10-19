# Lollipop GSC Coverage 诊断与修复（2026-10-12）

数据源：`https___www.lollipop.im_-Coverage-2026-10-12.xlsx`（Google Search Console「网页索引 / Coverage」导出，2 个 sheet：图表 + 严重问题）。

## 1. 报告数据

**图表（日趋势）**：未编入索引 从 ~2 持续攀升至 **1,376**；已编入索引 仅 ~368；展示量 高峰后回落。

**严重问题分布**（合计 ≈ 1,376 未编入索引）：

| 原因 | 计数 | 性质 |
|---|---|---|
| 网页会自动重定向（Page with redirect） | **958** | ❌ 真问题 |
| 被 "noindex" 标记排除了 | **238** | ✅ 预期正确 |
| 备用网页（有适当的规范标记） | **153** | ✅ 预期正确 |
| 已抓取 - 尚未编入索引 | 15 | ⚠️ 暂时性 |
| 由于禁止访问 (403) 被屏蔽 | 3 | ⚠️ 线上旧产物 |
| 未找到 (404) | 1 | ⚠️ 线上旧产物 |

## 2. 根因判定

| 类别 | 计数 | 性质 | 根因 |
|---|---|---|---|
| 网页会自动重定向 | 958 | 真问题（**已修复**） | 线上**旧 sitemap 仍提交 `/lollipop/...` 前缀 URL**，被 Caddyfile 的 `redir /lollipop/* → 301` 重定向。新构建 `base='/'`、sitemap **0 处 `/lollipop` 泄漏**，根因消除。 |
| 被 noindex 排除 | 238 | 预期正确 | 来源 = 后台/鉴权页（`DistributionLayout`、`EnrollPage`、`/login`、`/forgot-password`、`NotFoundPage`），本就该 noindex；与 `robots.txt` 的 `Disallow: /distribution/ /login/ /forgot-password/` 完全一致。非 bug。 |
| 备用网页（适当规范标记） | 153 | 预期正确 | 本地化变体（`/zh-TW` `/zh` `/pt` `/es` `/ar`）带 `hreflang` + `x-default`，GSC 只索引 en 规范页。标准 hreflang 行为，不是缺陷。 |
| 已抓取 - 尚未编入索引 | 15 | 暂时性 | GSC 后续会自动编入，无需处理。 |
| 403 / 404 | 3 / 1 | 线上旧产物 | 旧 `/lollipop` 路径或鉴权页残留；新构建 565 条 URL 全量 crawl **0 个非 200**，新构建本身无 403/404。 |

## 3. 新构建验证（已构建 + 本地 crawl）

- ✅ **0 处 `/lollipop` 前缀泄漏**；sitemap 565 条 URL 本地全量请求 **全部 200**（0 重定向 / 0 404 / 0 403）。
- ✅ 内容路由 `#root` 真实正文 **24K–35K 字符**（无 SPA 壳 / 软 404）；`/creator-program` = 25K 真实条款页（修复此前软 404 P0）。
- ✅ `/zh/about/` 含完整 `hreflang` 集合（含 `x-default`）。
- ✅ `robots.txt` 正确（声明 `Sitemap`；`Disallow` 仅后台/鉴权，与 noindex 一致）。
- ✅ canonical 全站 trailing-slash 一致（`/creator-program/`、`/about/`），无 canonical 循环。

## 4. 修复 = 部署新构建（代码已 commit `656dfb0`）

1. **关键**：部署流水线**不得**再设 `VITE_BASE=/lollipop/`（旧构建因此写死前缀，是 729/958 未收录的根因）。新构建本地用默认 `base='/'`。
2. **保留** Caddyfile 的 `/lollipop` 301 迁移规则 —— 消化已收录的旧前缀 URL，把权重传给根路径新 URL。
3. 部署后于 GSC **重新提交 sitemap.xml**、对关键页「请求编入」，等待自然重抓；958 重定向将随旧 URL 301 到位后逐步清零。
4. 238 / 153 为预期项，无需改动。

> push / 服务器部署为外部动作，待你确认后执行。
