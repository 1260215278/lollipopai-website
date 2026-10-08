# Lollipop.im 索引量下降 — GSC Coverage 报告交叉诊断（2026-10-05 精炼版）

> 本文用用户提供的 GSC Coverage xlsx（数据窗口 2026-08-04 → 09-21）作为权威证据，与代码/部署层分析交叉核对。
> 前一份 `index-drop-diagnosis-2026-10-04.md`（P0：zh/zh-TW/pt 线上返回英文）仍然成立，本文在其基础上**量化并补全**三大排除桶的归因。

---

## 一、GSC 权威时间线（来自 xlsx「图表」sheet）

| 日期 | 已编入索引 | 未编入索引 | 展示 |
|------|----------:|----------:|-----:|
| 08-08 | **355（峰值）** | 331 | 753 |
| 08-10 | 355 | 331 | **8620（展示峰值）** |
| 08-22 | **224（谷值，−37%）** | 525 | 1277 |
| 08-29 | 253 | 729 | 1612 |
| 09-05 | 249 | 976 | 825 |
| 09-15 | 289 | 994 | 1035 |
| 09-19 | **344（回升）** | 1102 | 1027 |
| 09-21 | 344 | 1102 | 1401 |

**结论：索引量并非永久崩塌，而是「先跌后回」。** 08-08→08-22 跌 131（−37%）是真实塌陷；到 09-19/21 已回升至 344，接近峰值 355。
**真正仍受损的是展示量**：峰值 8620 → 谷值 1277 → 09-21 仅 1401（≈ −84%）。索引数恢复但展示没回来，说明回流入库的页面质量/权重偏低，或 Google 在部署动荡期对站点信任度下降。

---

## 二、未编入索引 = 1102，且「严重问题」七桶之和精确等于 1102

xlsx「严重问题」sheet（来源=网站 / Google 系统）逐桶：

| 排除原因 | 数量 | 来源 | 本文归因 |
|----------|-----:|------|----------|
| 网页会自动重定向 | **661** | 网站 | legacy `/lollipop/*` 301 + `/guides/*`→`/blog` 301 + 尾部斜杠归一 |
| 被 noindex 标记排除 | **213** | 网站 | 设计内 ~11（见下）+ 部署动荡遗留的陈旧 URL |
| 备用网页（有适当的规范标记） | **147** | 网站 | **P0：zh/zh-TW/pt 线上返回英文 → 被当作英文重复页** |
| 已发现 - 尚未编入索引 | 58 | Google | 正常发现队列 |
| 已抓取 - 尚未编入索引 | 20 | Google | 正常抓取队列（会回落） |
| 由于禁止访问 (403) | 3 | 网站 | 轻微 |
| 重复网页，用户未选定规范 | 0 | 网站 | 已通过 |

**七桶加总 = 661+213+147+58+20+3+0 = 1102 = 未编入索引总数** → 证明这七类是互斥且穷尽的，每个被排除的 URL 只落在其中一类。

---

## 三、逐桶归因（与代码/部署层交叉核对）

### ✅ 147「备用网页（有适当规范标记）」= P0 主因（已定位、已修待部署）
- 即 `index-drop-diagnosis-2026-10-04.md` 的 P0：生产对 `zh`/`zh-TW`/`pt` 整棵子树返回英文内容，canonical 指向英文 URL → Google 把这三语言 ~243 个 URL 合并进英文版。
- GSC 在 09-21 前已处理并标记 **147** 个为 canonical-alternates（243 中的其余仍在其它桶或被逐步消化）。
- **修复已在 10-04 构建完成（commit 9e8c86e，含 Caddyfile HTTPS 跳转 + package-upload 多语言自检 + 重建 dist），但截至本报告尚未部署上线。** 部署后 Google 重新抓取会发现各语言内容已真正不同 → 不再被去重 → 147 桶自然清零。

### ✅ 661「网页会自动重定向」= 迁移期 301（预期内，会自然消化）
来源（来自 `Caddyfile`）：
1. **legacy `/lollipop/*` → 301**（Caddyfile 65–70 行，2026-09-05 根部署迁移）：旧 `/lollipop/` 前缀曾被收录数百条，现 301 到根路径。这是 661 的主体。
2. **`/guides/*` → `/blog` 301**（Caddyfile 44–57 行）：旧 `/guides` 知识中枢 URL 整体迁移到 `/blog`。
3. 尾部斜杠归一（`/blog` → `/blog/`）等正常 301。
- 这些 301 是有意的迁移动作，会把权重传给新 URL，**会随 Google 重抓自然清零**，无需回退。

### ⚠️ 213「被 noindex 标记排除」= 设计内仅 ~11，其余为部署动荡遗留（需 GSC 侧确认）
**代码侧可证伪的 noindex 来源：**
- 静态（构建期写入 HTML meta）：仅 `/login`、`/forgot-password` → **2 个**（已对 `dist/` 全量扫描确认：512 个 index.html 仅 2 个含 `content="noindex"`）。
- 客户端（JS 注入，`applyNoIndexMeta`）：仅 `/distribution/*` 后台子树（约 9 条路由：enroll/overview/content/payment/earnings/withdraw/account/members）+ `EnrollPage` → 经 React hydrate 后由 `DistributionLayout.tsx:217` / `EnrollPage.tsx:178` 注入。这些是**登录后私有页，本就不应被收录，设计正确**。
- 404 壳页（`NotFoundPage.tsx:19`）瞬时 noindex，不构成真实 URL。

**设计内 noindex ≈ 2 + 9 = 11 条，远小于 213。** 剩余 ~200 条无法从当前代码解释，最强解释是：**Aug–Sep 根部署迁移 + 多次重建 + `/guides`→`/blog` 迁移期间，Googlebot 抓到过「返回 noindex 的壳页/404 壳/迁移中间态」，GSC 的「被 noindex 排除」桶是黏性的（记住最后一次带 noindex 的抓取），正随重抓逐步清除（186→213 是缓慢增长而非暴涨，符合新发现 URL 被标记、旧 URL 被清的拉锯）。**

> 验证方法（用户在 GSC 侧即可做，不依赖本机网络）：GSC → 「网页索引编制」→「被 noindex 标记排除了」→ 点开可见**示例 URL 列表**。把这些 URL 与「设计内 auth 路由 + 陈旧 legacy 路径」比对即可定位剩余来源。也可用本项目 `scripts/audit_robots.py` 对 `dist/` 自检（已落地）。

### ✅ 58 + 20 = 正常队列
- 58「已发现未索引」+ 20「已抓取未索引」来自 Google 侧，是正常发现/抓取队列，随时间回落，非站点缺陷。
### ✅ 3 ×403
- 极轻微，可能来自偶发 UA/速率拦截，量级可忽略。

---

## 四、与双引擎（Google + 必应）的关联
- 两份报告（10-04 线上探测 + 本 GSC 时间线）指向同一根因：**canonical 指向错误导致去重**。Google 与 Bing 都按 canonical 合并，故双引擎同跌。
- 必应 Webmaster Tools 大概率呈现同类「规范重复/未收录」信号。
- **IndexNow**：`public/` 已有 key `fc327f494d3f4612b851a2972530d549`。Google 不消费 IndexNow，但 **Bing/Yandex 消费**——可对 372 条干净根 URL 提交，加速 Bing 侧回升（对 GSC 无直接影响，但用户明确关心必应）。

---

## 五、修复路线图（优先级）

| 优先级 | 动作 | 解决桶 | 状态 |
|--------|------|--------|------|
| **P0** | **部署 10-04 构建包**（`packages/lollipop-upload-20261004-*-full.zip` 或 `-slim.zip`）——含 Caddyfile HTTPS 跳转、locale 打包自检、重建 dist | 147 canonical-alternates + 消除「线上回退英文」复发 | ⚠️ 已构建未部署 |
| P1 | 部署后验证 `/zh` `/zh-TW` `/pt` 返回本地化（`lang="zh-CN"` 等 + 正确正文），见下命令 | 147 | 待部署后验 |
| P2 | 确认 `/guides`→`/blog` 与 `/lollipop/*`→`/*` 301 在生产生效 | 661 | Caddyfile 已配，待线上确认 |
| P2 | GSC 导出「被 noindex 排除」URL 列表，确认剩余 213 是否多为 legacy；若是则随重抓自然清，或加 Cloudflare Bulk Redirect 加速 | 213 | 待 GSC 侧 |
| P3 | 向 IndexNow 提交 372 条根 URL（Bing/Yandex） | 必应回升 | 可立即做 |
| P3 | GSC「网址检查 → 请求编入索引」对首页/`/about`/`/blog`/Top 文章提速 | 加速回流 | 单条手动 |

**部署后验证命令：**
```bash
UA="Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
curl -s --noproxy '*' -A "$UA" https://www.lollipop.im/zh/ | grep -o 'lang="[^"]*"'
# 期望输出: lang="zh-CN"
curl -s --noproxy '*' -A "$UA" https://www.lollipop.im/zh-TW/ | grep -o 'lang="[^"]*"'
# 期望输出: lang="zh-TW"
```

---

## 六、方法论备注 / 本机探测局限（透明声明）
- 本机经代理出网，对 `www.lollipop.im`（Cloudflare Anycast）反复探测会出现 `502/unknown host` 与偶发 `FASTPANEL` 默认页（带 `<meta robots="noindex,nofollow">`）。经「直连可用 Cloudflare 边缘 IP（104.21.92.234）」复核：首页稳定返回 200、正确标题、`noindex=0`。**故判定 FASTPANEL/502 系本机代理/DNS 干扰的产物，非生产缺陷**，已从结论中剔除。
- 生产 `www.lollipop.im` DNS 仅解析到两个 Cloudflare Anycast IP（172.67.200.26 / 104.21.92.234），为单逻辑源站，不存在多后端混跑；FASTPANEL 观察不可作为生产问题证据。
- noindex 静态面已通过本地 `dist/` 全量扫描实证（512 页仅 2 页带静态 noindex meta）。
- 解析脚本已落地项目 `tmp/`：`coverage_trend.py`（时间线+桶）、`dump_severe.py`（桶明细）、`probe*.sh`（线上探测）。

---
## 七、一句话总结
**索引量 8 月塌陷、9 月已基本回补；真正未恢复的是展示量（−84%）。** 根因是 8–9 月部署动荡：① zh/zh-TW/pt 线上回退英文（147 条被去重，P0，已修待部署）；② `/lollipop/*`+`/guides/*` 迁移 301（661 条，预期内）；③ 动荡期遗留 ~200 条陈旧 noindex（213 桶，随重抓清零）。**最关键动作 = 把已构建好的 10-04 修复包部署上线。**
