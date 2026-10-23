# GSC Coverage 排查与修复 — www.lollipop.im（2026-10-23）

审计源：`https___www.lollipop.im_-Coverage-2026-10-23.xlsx`（GSC Coverage 导出）。
本报告为**只读诊断 + 仓库内可落地修复**；部署到源站需执行一次 `caddy reload`（见末段）。

## 一、报告里的严重问题清单（合计 = GSC「未编入索引」1542）

| 原因 | 来源 | 验证 | 网页数 | 本次处置 |
|---|---|---|---:|---|
| 网页会自动重定向 | 网站 | 失败 | **1180** | ✅ 已修复（Caddyfile 根因） |
| 被"noindex"标记排除了 | 网站 | 失败 | 235 | ⏳ 需 GSC URL 明细导出（见 §3） |
| 备用网页（适当的规范标记） | 网站 | 失败 | 104 | ✅ 正常（hreflang 互指，无需动） |
| 未找到 (404) | 网站 | 失败 | 1 | ⏳ 需 URL 明细 |
| 已抓取 - 尚未编入索引 | Google | 失败 | 7 | ✅ 正常队列，会自动消化 |
| 已被 robots.txt 屏蔽 | 网站 | 未启动 | 3 | ✅ 正常（/distribution/ 等，见 §3） |
| 重复网页，Google 选的规范≠用户指定 | Google | 未启动 | 4 | ⏳ 需 URL 明细 |
| 因禁止访问 (403) 被屏蔽 | 网站 | 已开始 | 3 | ⏳ 需 URL 明细（Googlebot 实测 200，见 §3） |
| 重复网页，用户未选定规范 | 网站 | 已通过 | 0 | — |
| 已发现 - 尚未编入索引 | Google | 已通过 | 5 | ✅ 正常队列 |

> 已编入索引（Valid）：**435**；趋势（图表末日 2026-10-16）：未编入 1542 / 已编入 435 / 展示 ~3076。

## 二、根因定位：1180「网页会自动重定向」= 尾斜杠跳转明文降级到 HTTP

线上实测（curl，不跟随重定向）：

```
https://www.lollipop.im/zh                  → 301 → http://www.lollipop.im/zh/   ← 降级到 http
http://www.lollipop.im/zh/                 → 301 → https://www.lollipop.im/zh/
https://www.lollipop.im/blog/<slug>        → 301 → http://www.lollipop.im/blog/<slug>/
```

即每个无尾斜杠 URL 走 `https → http → https` **双跳 + 明文降级**。根因：
Caddy `file_server` 对目录（`/zh`）自动 301 到 `/zh/`，但**源站未正确识别
Cloudflare 转发的 `X-Forwarded-Proto`**，于是 Location 写成 `http://`。
（本仓库 `Caddyfile` 第 12 行已有 `trusted_proxies cloudflare` 意图修此问题，
但**线上源站实际跑的是旧配置**——该文件未被加载，故降级仍在发生。）

后果：Google 把每个无斜杠变体记为「网页会自动重定向」并从索引排除；
`https→http` 跳转让 Googlebot 走不安全跳板，计数长期虚高 → 1180 条。

> 注：sitemap（601 条）本身全部为尾斜杠 + www + https，格式干净；
> 1180 多为 Google **发现**的无斜杠变体（外加旧 `/lollipop/*` 迁移跳转，属预期）。

## 三、已修复：Caddyfile 全部跳转显式 HTTPS、单跳

改动（仓库 `Caddyfile`，已通过括号/matcher 结构校验）：

1. **新增显式尾斜杠跳转**（绕过 file_server 自动跳转，写死 https）：
   ```caddy
   @add-slash {
       not path */
       not path *.html  not path *.xml  not path *.txt
       not path *.json  not path *.webp
       file {path}/index.html      # 仅对真实存在的预渲染目录生效
   }
   redir @add-slash https://{host}{uri}/ 301
   ```
   这样 `/zh` → 直接 `301 https://www.lollipop.im/zh/`（单跳，不再降级）。

2. **所有 `redir` 目标改为 `https://{host}...`**（18 条全部覆盖）：
   `/guides/*→/blog`、`/lollipop→/`、`/lollipop/*` 剥离前缀跳转、
   `@humanOnPress`/`@humanOnGlossary` 302→首页，全部显式 https，
   不再依赖请求 scheme，杜绝任何明文降级路径。

3. 保留 `trusted_proxies cloudflare` 作为冗余保障。

修复后预期链：`https://www.lollipop.im/zh` → `301 https://www.lollipop.im/zh/`（单跳）。
Google 跟随跳转到规范 URL，无斜杠变体将随后续抓取自然消化，「网页会自动重定向」计数下降。

## 四、次要问题处置指引（本次未改代码，需 GSC URL 明细）

- **235 noindex**：仓库 `dist/` 实测仅 **3 个**合法 noindex 页
  （`/login/`、`/forgot-password/`、Yandex 校验文件），且 `prerender-plugin.ts`
  已跳过 noindex 路由进 sitemap。**因此这 235 是 Google 发现的站外/旧 URL**，
  非 sitemap 提交项。精确定位需：GSC → Coverage → 「被 noindex 标记排除了」
  → 导出 URL 明细 → 交由 `scripts/diag_seo_csv_current.py` 同款逻辑核对。
- **3 robots 屏蔽**：线上 `robots.txt` 显式 `Disallow: /distribution/`、`/login/`、
  `/forgot-password/`，与这 3 条吻合，属合规，无需修。
- **3 个 403**：Googlebot UA 实测首页/博客/类型页均 **200**，Cloudflare 未拦截
  Googlebot（排除 Bot Fight Mode 全局误伤）。3 条应为个别带异常参数或遗留路径，
  需 URL 明细确认。
- **1 个 404 / 4 个规范分歧 / 7+5 未编入索引**：常规队列，待 GSC 明细 + 下次抓取消化。

## 五、部署与验证（需源站访问）

```bash
# 1) 把仓库 Caddyfile 放到源站
scp Caddyfile user@origin:/etc/caddy/Caddyfile
# 2) 语法校验（源站执行）
caddy fmt --overwrite /etc/caddy/Caddyfile
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
# 3) 优雅重载（不断连接；仅改全局 {} 块才需 restart）
systemctl reload caddy
# 4) 验证（应全部为「单跳 https 301」）
curl -sI https://www.lollipop.im/zh        | grep -iE "^HTTP/|^location:"
curl -sI https://www.lollipop.im/blog/web-novel-to-ai-short-drama-pipeline | grep -iE "^HTTP/|^location:"
curl -sI http://www.lollipop.im/zh         | grep -iE "^HTTP/|^location:"
```

部署后：GSC → Coverage → 「网页会自动重定向」→ 点「验证修复」，观察 1180 计数随抓取下降。

## 六、结论
- **P0（根因）已修复**：Caddyfile 尾斜杠/全部跳转改显式 https，单跳、不降级。
- **部署动作待执行**：源站 `caddy reload`（需用户服务器访问）。
- **P1（需数据）**：235 noindex / 3 403 / 1 404 / 4 规范分歧 待 GSC URL 明细导出后精修。
