# Lollipop.im 谷歌 / 必应索引量下降 — 根因诊断

日期：2026-10-04
结论一句话：**生产环境对 `zh` / `zh-TW` / `pt` 三个语言的整棵 URL 子树返回英文内容（与英文版重复），导致这 3 个语言约 243 个 URL（占 sitemap 47%）被 Google 与 Bing 当作英文重复页去重剔出 → 索引量下降。** 本地 09-28 构建产物本身正确，问题出在**部署未正确提供这三个语言的静态文件**。

---

## 证据链

1. 线上探测（伪装 Googlebot UA + `--noproxy '*'` 绕过 CF 风控）：
   - `/zh/`、`/zh-TW/`、`/pt/` 首页 → `<html lang="en">` + 英文标题 + canonical=`https://www.lollipop.im/`
   - `/zh/blog/`、`/zh/blog/<post>/`、`/zh/genre/revenge/` → 同样 `lang="en"`，且 canonical 指向**英文 URL**（如 `/zh/blog/x` → canonical=`/blog/x`，无 `/zh/` 前缀）
   - 对照：`/es/`、`/ar/` 全系列正确本地化（`lang=es/ar`，西语/阿语标题与正文）
2. 量化（解析线上 sitemap.xml，共 510 条 `<loc>`）：

   | 语言 | sitemap URL 数 | 线上状态 |
   |------|---------------|----------|
   | zh + zh-TW + pt | **243** | ❌ 全部返回英文内容 |
   | es | 81 | ✅ 正常 |
   | ar | 81 | ✅ 正常 |
   | en（根） | 105 | ✅ 正常 |

3. 本地构建核对：`dist/zh`、`dist/zh-TW`、`dist/pt` 各含 **81** 个 html 文件，内容正确（`dist/zh/blog/<post>/index.html` → `lang="zh-CN"` 中文）。即**构建正确，部署层缺失/回退英文**。
4. 线上 `Last-Modified` 全部为 `09-28 08:54`（同一构建时间戳），`cf-cache-status: DYNAMIC`（非缓存）→ 排除缓存因素，是源站文件问题。

## 去重机制（为什么双引擎都掉）
zh 页面声明的 canonical 是英文 URL（例：`/zh/blog/x` → canonical=`/blog/x`），Google/Bing 据此把 zh 版**合并进英文版** → zh/zh-TW/pt 版不收录或被剔出。es/ar 自带正确本地化 canonical，故安全。

---

## 次要问题（非主因，建议一并修）

- **A. 301 尾部斜杠跳转降级到 HTTP**：`/about` → `Location: http://www.lollipop.im/about/`（明文 http）。建议源站/CF 强制 HTTPS 跳转，避免抓取链路与 canonical 协议冲突、浪费抓取预算。
- **B. `/guides` 返回 200 首页壳**（canonical=`/`）而非 301 到 `/blog`：旧 `/guides/*` 收录 URL 软 404。确认 CF/Caddy 的 `/guides → /blog` 301 在生产环境生效（记忆记载 Caddyfile 已配，但线上未生效）。

---

## 修复建议（优先级）

1. **【P0】重新完整部署 dist，确保 `zh` / `zh-TW` / `pt` 三目录上传并被正确服务。**
   - 本地构建已正确，排查上次上传包是否漏传这三目录，或源站是否存在"剥 locale 前缀回退英文"的配置（线上现象是 `/zh/X` 被当成 `/X` 英文页提供）。
   - 部署后必须验证：`curl ... /zh/ | grep 'lang="zh-CN"'` 命中。
2. 【P1】修复 301 跳转强制 HTTPS（去掉 http:// Location）。
3. 【P1】确认 `/guides → /blog` 的 301 在生产环境生效。
4. 修复后到 GSC / Bing Webmaster Tools 对 zh/zh-TW/pt 相关 URL 提交重新抓取，观察索引量回升。

## 部署后验证命令
```
UA="Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
curl -s --noproxy '*' -A "$UA" https://www.lollipop.im/zh/ | grep -o 'lang="[^"]*"'
# 期望输出: lang="zh-CN"
```

## 排查方法备注
- 线上探测必须伪装 UA（urllib 默认被 CF 风控 403），且本机有 `http_proxy` 须 `--noproxy '*'`。
- 软 404 判定：canonical 指向首页 `/` 或正文语言与 URL 语言不符。
- sitemap 解析 + 语言扫描脚本：`tmp/analyze_index.py`（已落地项目 tmp）。
