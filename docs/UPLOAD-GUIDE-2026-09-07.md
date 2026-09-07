# 生产上传指引（人工部署）

> 生成时间：2026-09-07  
> 目标：把根部署新构建传到生产，修复 GSC 729 个页面未编入索引



---

## 一、产物（已备好）

| 文件                                                | 体积       | 文件数  | 适用                                                                 |
| ------------------------------------------------- | -------- | ---- | ------------------------------------------------------------------ |
| `packages/lollipop-upload-20260907-1222-full.zip` | 24.12 MB | 1081 | **推荐**。含 `.br`/`.gz` 预压缩副本，适合 Caddy/Nginx 源站（`precompressed` 直接命中） |
| `packages/lollipop-upload-20260907-1222-slim.zip` | 14.09 MB | 417  | 空间受限 / Cloudflare Pages（CF 自动压缩，预压缩副本无用）                           |

**包内已是网站根目录结构**（`index.html` 在 zip 根层），解压即用。

已内置自检通过：

- 首页 `canonical = https://www.lollipop.im/`（无 `/lollipop/` 前缀）
- `sitemap.xml` 300 条，无一含前缀
- 含 `_redirects`（`/lollipop/* → /:splat 301`）
- 含 `robots.txt`、`fc327f494d3f4612b851a2972530d549.txt`（IndexNow key）

---

## 二、选哪种上传方式

### 场景 A：Cloudflare Pages（最简单，推荐先确认是不是这个）

1. Cloudflare Dashboard → **Workers & Pages** → 你的项目
2. **Create deployment** → **Upload assets**
3. 拖 `slim.zip` 进去（或直接拖 `dist` 文件夹）
4. 部署完 CF 会给一个 `*.pages.dev` 域名 → 确认后切自定义域

> ✅ Pages **原生支持 `_redirects`**，301 自动生效，无需额外配置。

### 场景 B：服务器面板（宝塔 / cPanel / 1Panel）

1. 文件管理器进到**网站根目录**（注意：是 `/about` 能直接访问的那个目录，不是 `/lollipop/` 子目录）
2. 上传 zip → **解压到当前目录**（⚠️ 别多解一层 `dist/`）
3. 若面板提示覆盖，选**覆盖全部**

### 场景 C：SSH 直连源站

```bash
# 本地先传上去（把 zip 放 /tmp）
scp packages/lollipop-upload-20260907-1222-full.zip user@源站IP:/tmp/

# 服务器上执行
ssh user@源站IP
sudo unzip -o /tmp/lollipop-upload-20260907-1222-full.zip -d /你的网站根目录/
sudo chown -R www-data:www-data /你的网站根目录/   # 按实际用户改
```

---

## 三、⚠️ 上传后必做：`_redirects` 的生效条件

**`_redirects` 只对 Cloudflare Pages / Netlify 生效**。如果你的生产是自建源站（Caddy / Nginx / Apache），光传这个文件不会有任何效果，旧 `/lollipop/*` 仍会返回 SPA 兜底壳。

按你的源站类型二选一：

### Caddy（仓库 `Caddyfile` 已写好，直接搬）

```caddyfile
redir /lollipop / 301

@oldDeployPrefix path /lollipop/*
handle @oldDeployPrefix {
	uri strip_prefix /lollipop
	redir * {uri} 301
}
```

然后 `sudo caddy reload`。

### Nginx

```nginx
location /lollipop {
    return 301 /;
}
location /lollipop/ {
    rewrite ^/lollipop/(.*)$ /$1 permanent;
}
```

然后 `sudo nginx -s reload`。

### Apache（`.htaccess`）

```apache
RedirectMatch 301 ^/lollipop$ /
RedirectMatch 301 ^/lollipop/(.*)$ /$1
```

---

## 四、上传后验证（一条命令）

```bash
python scripts/verify-live.py
```

**当前（旧构建）预期输出**：`11 PASS / 4 FAIL`，FAIL 项是：

- 首页 canonical 为根路径
- sitemap 无 `/lollipop/` 前缀
- `/lollipop` 未返回兜底壳
- `/lollipop/about` 未返回兜底壳

**部署成功后**：应变成 `15 PASS / 0 FAIL`，并显示「✅ 生产已切到根部署新构建」。

> 若仍报 FAIL 且 `Last-Modified` 没变 → **Cloudflare 缓存没刷**，去 Dashboard → Caching → **Purge Everything**，或等缓存自然过期后再测。

---

## 五、部署成功后的收尾（顺序不能乱）

```bash
# 1. 全站提交 IndexNow（Bing/Yandex 等，加速发现）
python scripts/indexnow-submit.py --limit 10 --dry-run   # 先验 URL 对不对
python scripts/indexnow-submit.py                        # 全量 300 条
```

然后在 Google Search Console：

1. **Sitemap** → 移除旧的 `.../lollipop/sitemap.xml`，提交新的 `https://www.lollipop.im/sitemap.xml`
2. **网页索引** → 对「自动重定向」「备用网页」点 **验证修复**
3. 对重点页面用 **URL 检查** → **请求编入索引**

---

## 六、预期时间线（别急）

| 阶段                       | 时间    |
| ------------------------ | ----- |
| IndexNow 生效（Bing/Yandex） | 1~3 天 |
| Google 重新抓取全部 300 条      | 1~2 周 |
| 「自动重定向」计数消退              | 2~4 周 |
| 已编入索引数回升                 | 3~6 周 |

**关键**：部署后不再有新错误 URL 进入索引池，剩下的 729 个是历史存量，靠 Google 自然消化，无法人工加速。

---

## 七、回滚方案

若新构建出问题，把之前服务器上的旧目录恢复即可（staging 上 `/srv/www/lollipop/releases/` 保留了 v1.29.0 / v1.29.1 / v1.30.0）。生产侧请务必**先备份再覆盖**。
