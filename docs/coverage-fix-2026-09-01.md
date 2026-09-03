# lollipop.im Coverage 报告排查与修复（2026-09-01）

> 输入：`https___www.lollipop.im_-Coverage-2026-09-01.xlsx`（Google Search Console「网页索引编制」导出）
> 结论先行：**站点 70% 已知页面未被索引，99.4% 属网站侧可修问题；核心根因 = canonical/sitemap/hreflang 全部缺 `/lollipop/` 部署前缀 + 线上部署版本损坏。本次已全部修复并重建验证。**

---

## 一、报告解读（GSC Index Coverage）

| 指标 | 数值 | 说明 |
|---|---|---|
| 已知网页（sitemap） | 749 | 报告范围 = 「站点地图中的全部已知网页」 |
| 已编入索引 | 224（29.9%） | |
| 未编入索引 | 525（70.1%） | 网站侧可控 **522（99.4%）** |
| 展示量趋势 | 8-13 峰值 13,516 → 8-28 跌至 981（**-93%**） | 8-22 明显转折点（未入 +89 / 已入 -87 同日发生） |

### 未编入索引原因分布（525）

| 原因 | 数量 | 占比 | 归属 |
|---|---|---|---|
| 网页会自动重定向 | **398** | 75.8% | 网站 |
| 备用网页（有规范标记 canonical） | **103** | 19.6% | 网站 |
| 被 noindex 排除 | 17 | 3.2% | 网站 |
| 403 禁止访问 | 3 | 0.6% | 网站 |
| 重复网页未选 canonical | 1 | 0.2% | 网站 |
| 已抓取未索引（内容价值） | 2 | 0.4% | Google |
| 已发现未索引 | 1 | 0.2% | Google |

---

## 二、根因定位（线上实测 + 源码审计）

### R1 🔴 sitemap 208 条 loc 全部缺 `/lollipop/` 前缀
- 本地 `public/sitemap.xml` 208 条 `<loc>` 与 hreflang href 全部为 `https://www.lollipop.im/...`（无部署前缀）
- 线上实测 `https://www.lollipop.im/about` → **301 → `http://www.lollipop.im/about/`**（链式跳转，Cloudflare/Caddy 尾斜杠 + 协议降级）
- **后果**：sitemap 提交的每一个 URL 抓取时都 301 → Google 记录 398 个「自动重定向」

### R2 🔴 canonical/hreflang/JSON-LD/llms 全部缺前缀
- 源码 `SITE_URL = "https://www.lollipop.im"`（`scripts/prerender-plugin.ts`、`src/app/i18n.seo.ts`）+ 12 个文件 195 处硬编码
- canonical 指向的 URL 本身 301 → 「备用页」判定失效、重复内容

### R3 🔴 线上部署版本损坏（最严重）
- 线上实测 `/lollipop/about`、`/lollipop/blog`、`/lollipop/` **三个路径返回完全相同的首页 HTML**（title/canonical 全同）
- `/lollipop/robots.txt`、`/lollipop/sitemap.xml` 返回 HTML（文件缺失 → fallback 首页）
- `/lollipop/guides/*` 返回 200 而非 301（线上 Caddyfile 无 guides 重定向）
- **后果**：所有子页面 = 首页内容 → 103 个「canonical 备用页」+ 重复内容；robots/sitemap 失效
- 与 8-22 转折点吻合：线上在 8-22 前后有过一次部署，索引构成同日恶化

### R4 🟡 robots.txt 路径规则全部失配
- `Disallow: /login` 等规则是 host 根相对路径，真实路径 `/lollipop/login` **不被匹配** → login/forgot-password/distribution 可被爬取

---

## 三、修复内容（站点侧，已完成）

| 文件 | 变更 |
|---|---|
| `scripts/prerender-plugin.ts` | `SITE_URL` → `https://www.lollipop.im/lollipop`；llms 硬编码链接加前缀 |
| `src/app/i18n.seo.ts` | `SITE_URL` → 同上（canonical/og:url/og:image 走常量，自动生效） |
| `src/app/App.tsx` + 7 个页面组件 | JSON-LD 195 处 URL 加前缀（规则化替换，脚本 `scripts/add-deploy-prefix.py`） |
| `src/app/data/blogContent.ts` | 正文 126 处 GEO 引用/内链加前缀 |
| `public/sitemap.xml` | 208 条 loc + hreflang 全部带前缀（重新生成，CRLF 保真） |
| `scripts/update-sitemap-multilang.py` | `SITE` 常量同步（防止下次重建丢前缀） |
| `public/robots.txt` | 路径规则加前缀（`/lollipop/login` 等）+ Sitemap 指向带前缀 URL |
| `scripts/verify-blog.py` | 新增**第 13 组**「无前缀 URL 残留」校验（sitemap/dist HTML canonical·og:url·hreflang/llms 三面） |

### ⚠️ 过程中踩坑（已修复并沉淀）
1. **二次加前缀**：批量替换脚本的负面前瞻 `(?!lollipop/)` 只能防「`/lollipop/` 带尾斜杠」，防不了「`/lollipop` 后直接跟引号」→ SITE_URL 常量被二次处理成 `.../lollipop/lollipop`（dist 3406 处污染）。已修正为 `(?!lollipop)` 并在脚本注释固化教训。
2. **SITE_URL 尾斜杠**：规则 B 把常量替换成带尾斜杠版本，会与 `SITE_URL + "/about"` 拼接出 `//about`。常量必须无尾斜杠，JSON 站点 url 必须带尾斜杠，两者语义不同。

---

## 四、验证结果（全部通过）

| 验证 | 结果 |
|---|---|
| `python scripts/verify-blog.py` | **457 项 ALL PASSED**（原 454 + 第 13 组 3 项） |
| `python scripts/check-dist-links.py` | 213 HTML / 9948 引用 / **0 缺失 / 0 悬挂** |
| 构建产物 | 209 HTML / 210 routes（70 en + 140 语言版本）；gz·br 各 239 |
| dist canonical 抽查 | `https://www.lollipop.im/lollipop/about` ✅（首页 `.../lollipop/`） |
| dist 双前缀残留 | **0** |
| dist 无前缀 SEO URL 残留 | **0** |
| robots.txt 已更新进 dist | ✅（含 `/lollipop/login` 等规则） |
| HTTP 冒烟（模拟 Caddy try_files） | 8 项全过：语言页 canonical/hreflang 7 条 / 非子集语言回退英文 / ar rtl / sitemap 前缀 / assets 200 / llms 前缀 / robots 规则 |

---

## 五、交付包

```
packages/lollipop-dist-0.0.1-20260902-0748-full.tar.gz   (17.23 MB, 789 文件, 全量)
packages/lollipop-dist-0.0.1-20260902-0748-delta.tar.gz  (8.35 MB, 增量: +33/~645 修改)
packages/lollipop-dist-0.0.1-20260902-0748-deleted.txt   (33 个待删文件清单)
```

---

## 六、线上部署清单（用户执行）

> ✅ **2026-09-02 08:30 测试环境已部署**：43.160.226.253 → `/srv/www/lollipop/releases/v1.27.0`（current 软链已切），Caddyfile 已修正（删除 blog 特殊规则 + 13 条 /guides 301），冒烟 11 项全过、关键文件 hash 与本地一致。详见 `.workbuddy/memory/2026-09-02.md` 与 lollipop-packaging skill「D. 线上部署」。
> ⚠️ **www.lollipop.im 正式环境不在 43.160.226.253**：DNS 指向 Cloudflare（172.67.200.26 / 104.21.92.234），本服务器 Caddyfile 无 lollipop.im 配置。正式源站信息待用户提供后再执行以下清单。

### 1. 重新部署 dist（解决 R3 —— 最关键）
- 将 **full 包** 解压覆盖服务器上的站点根目录，确认目录结构为：
  - `/lollipop/about/index.html`、`/lollipop/blog/...`、`/lollipop/sitemap.xml`、`/lollipop/robots.txt`（即 dist 内容放在站点的 `/lollipop/` 子路径下，**不是**站点根）
- 若使用 delta 包：解压覆盖 + 按 deleted.txt 清理 33 个旧文件

### 2. 确认线上 Caddyfile 已包含（本地 Caddyfile 即最终版）
- `try_files {path} {path}/index.html /index.html`（修复子页面 fallback 首页）
- `redir /guides* /blog 301`（13 条精确 + 兜底）
- `file_server { index index.html; precompressed zstd gzip }`

### 3. 部署后冒烟（curl 验证）
```bash
curl -s https://www.lollipop.im/lollipop/about | grep canonical   # 期望 .../lollipop/about
curl -s -o /dev/null -w "%{http_code}" https://www.lollipop.im/lollipop/robots.txt  # 期望 200 文本
curl -s https://www.lollipop.im/lollipop/sitemap.xml | grep -c "<loc>"  # 期望 208
```

### 4. Google Search Console 操作
1. 左侧「站点地图」→ 重新提交 `https://www.lollipop.im/lollipop/sitemap.xml`（**带前缀**）
2. 「网页索引编制」→ 对「网页会自动重定向」「备用网页（有适当规范标记）」「被 noindex 排除」「403」逐个点**验证修复**
3. 修复后观察 1~2 周：重定向 398 / 备用页 103 应显著下降，展示量回升

### 5. 遗留项（非本次范围）
- `BlogPostPage.tsx` / 各组件 JSON-LD 中 `publisher.logo = https://www.lollipop.im/lollipop/src/imports/logo.webp` 资源不存在（历史遗留，不影响索引，可后续修正为真实 logo 路径）
- GSC「已抓取未索引 2 + 已发现未索引 1」属 Google 侧判定，靠内容独特性改善
- noindex 17 个中 3 个（login/forgot-password/seo-audit）为有意设置，其余待新版本部署后由 GSC 重新确认
