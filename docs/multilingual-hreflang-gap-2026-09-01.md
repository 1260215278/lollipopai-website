# 多语言 hreflang 断裂：sitemap 提交了 460 个不存在的 URL

- **发现日期**：2026-09-01
- **发现契机**：清理 i18n 死键时，为了确认 `footer.links.aboutUs` 是否为真死键，
  去 dist 里找 `/about` 的六语言版本，结果**一个语言目录都没有**
- **严重度**：P0（影响整站 hreflang 有效性与全部非英语种的收录）

---

## 一、问题

`sitemap.xml` 里既有英文路径，也有六语言 hreflang；但**只有英文路径有真实产物**。

| 指标 | 数值 |
|---|---|
| `dist` 里的 HTML 文件 | 73 个（**全部英文**，零中文/葡/西/阿文） |
| `dist` 里的语言目录（`zh/` `pt/` `es/` `ar/` …） | **0 个** |
| sitemap `<loc>`（真实存在的 URL） | 68 |
| sitemap `xhtml:link`（hreflang 声明）总数 | 476 |
| 其中指向**不存在**的语言前缀路径 | **460（96.6%）** |

### sitemap 的实际形态

```xml
<url>
  <loc>https://www.lollipop.im/about</loc>          <!-- 真实存在 -->
  <xhtml:link rel="alternate" hreflang="en"    href="https://www.lollipop.im/about" />
  <xhtml:link rel="alternate" hreflang="zh-CN" href="https://www.lollipop.im/zh/about" />   <!-- 不存在 -->
  <xhtml:link rel="alternate" hreflang="zh-TW" href="https://www.lollipop.im/zh-TW/about" /> <!-- 不存在 -->
  <xhtml:link rel="alternate" hreflang="pt"    href="https://www.lollipop.im/pt/about" />   <!-- 不存在 -->
  <xhtml:link rel="alternate" hreflang="es"    href="https://www.lollipop.im/es/about" />   <!-- 不存在 -->
  <xhtml:link rel="alternate" hreflang="ar"    href="https://www.lollipop.im/ar/about" />   <!-- 不存在 -->
  <xhtml:link rel="alternate" hreflang="x-default" href="https://www.lollipop.im/about" />
</url>
```

### 这四个后果是叠加的

| # | 后果 | 机理 |
|---|---|---|
| 1 | **hreflang 整组失效** | Google 要求 hreflang **互指且一致**：A 声明了 B，B 就必须回指 A。B 实际返回的是英文首页（canonical 指向 `/`），回指链断 → Search Console 报「no return tags」 |
| 2 | **约 340 个 URL 重复内容** | 460 个 URL 全部 fallback 到同一份英文首页 HTML，canonical 都是 `https://www.lollipop.im/` |
| 3 | **抓取预算浪费** | 68 个真实页面 vs 460 个空壳，抓取预算大头花在空壳上 |
| 4 | **非英语种 AEO 为零** | GPTBot / PerplexityBot / ClaudeBot / 豆包 **不执行 JS**。这些 URL 返回的是英文首页骨架，本地语言内容一个字都拿不到 |

> 第 4 条对本项目的伤害最直接 —— 前面所有 GEO / AEO 优化（结构化数据、FAQ、
> HowTo、llms.txt）都只作用在英文页面上。

---

## 二、根因

不是"没做多语言"，而是**多语言做了一半，卡在最后一步**。

基础设施其实已经铺好了：

| 层 | 文件 | 状态 |
|---|---|---|
| 路径 ↔ locale 映射 | `src/app/localePath.ts` | ✅ 完整：`LOCALE_PATH_SEGMENTS` / `matchLocalePath` / `stripLocalePrefix` / `buildLocalizedPath` / `getRouterBasename` / `localizedHref` |
| 客户端路由 | `src/main.tsx` | ✅ `getRouterBasename()`，`/zh/about` → basename `/zh` |
| SSR 渲染 | `src/entry-server.tsx` | ✅ `matchLocalePath(path, "")` + `I18nProvider initialLocale={localeMatch?.locale ?? "en"}` |
| HTML `lang` 属性 | `scripts/prerender-plugin.ts:727` | ✅ 会写 `<html lang="${lang}">` |
| **生成多语言 HTML** | `scripts/prerender-plugin.ts` | ❌ **没做** —— `getRouteData()` 只产出英文路径；第 750 行的 `hreflangPaths` 只用来**拼 hreflang 标签**，不生成对应产物 |
| 阿拉伯语 `dir="rtl"` | `scripts/prerender-plugin.ts` | ❌ 缺失，AR 页面需要 `<html lang="ar" dir="rtl">` |

一句话：**页面里写了「我有 6 个语言版本」，但只造了 1 个。**

### 为什么一直没被发现

`scripts/verify-blog.py` 第 5 组只检查「sitemap 里有没有 hreflang 标签」，
**不检查这些 URL 是否真能解析**。这是典型的「只验声明、不验产物」的校验盲区。

---

## 三、三个可选方案

### A. 全量六语言预渲染

给 `getRouteData()` 的 70 条路由 × 6 个语言全部生成 HTML。

| | 现在 | 方案 A 后 |
|---|---|---|
| HTML | 73 个 / 3.7 MB | ~438 个 / ~22 MB |
| gz + br | 202 个 / 3.8 MB | ~1200 个 / ~23 MB |
| dist 总计 | 21 MB | **~62 MB** |
| 构建耗时 | ~21 s | ~2 min |

- ✅ 多语言 SEO / AEO 完整，hreflang 全部有效
- ⚠️ 需补阿拉伯语 `dir="rtl"`，以及各语言的 `og:locale` / JSON-LD `inLanguage`
- ⚠️ **dist 62 MB 对人工上传是实打实的负担**（当前部署方式是手工上传 dist）
- ⚠️ 需先验证非 en locale 的 SSR 渲染正常（尤其 AR 的 RTL 布局）

### B. 子集多语言

只对高价值页生成：首页 / about / download / contact / blog 列表 / 12 篇 HowTo / 10 个 genre
≈ 25 页 × 5 语言 = **+125 个 HTML**，dist ≈ 35 MB。

- ✅ 覆盖"最可能被搜索/引用"的页面，代价约为方案 A 的三分之一
- ⚠️ **hreflang 必须一致**：只要某页面的 en 版声明了 zh 版，zh 版就必须存在且回指。
  所以子集之外的页面（如 12 篇 drama 详情、6 个 region 页）**必须只输出 en + x-default**，
  不能再声明 5 个语言。改动点在 `prerender-plugin.ts` 的 hreflang 生成逻辑 —— 需要给
  `RouteSeoData` 加一个「是否参与多语言」标记
- ⚠️ 同样要补 `dir="rtl"`

### C. 不生成多语言页面，移除不存在的 hreflang

从 sitemap 与页面 HTML 里删掉 5 个语言前缀的 hreflang，只保留 en + x-default。

- ✅ dist 体积不变，立刻消除错误信号
- ❌ 彻底放弃多语言收录（i18n 只剩客户端 `?lang=` 切换，对 SEO 无意义）
- ❌ 已做的六语言 i18n 投入（113 KB 文案）归零

---

## 四、建议

**先做 C 的"止血"部分（1 小时内可完成、零风险），再决定 A 还是 B。**

理由：现在每多一天，就有 460 个坏 URL 在被 Google 反复抓取并判定为重复内容，
这个负面影响是**正在累积**的，而 A / B 都需要先验证非 en locale 的 SSR 渲染质量才能定。
先把错误信号停掉，再从容决定投入规模。

如果选 A 或 B，动工前必须先确认三件事：

1. 非 en locale 的 SSR 渲染是否正常（先只跑 1 个语言 × 1 个路由做冒烟）
2. 阿拉伯语 RTL 布局在 SSR 下是否正确（`<html dir="rtl">` + Tailwind RTL 支持）
3. 部署方式能否承受 dist 体积翻 1.7~3 倍（当前是手工上传）

---

## 五、相关文件

| 文件 | 作用 |
|---|---|
| `src/app/localePath.ts` | 语言前缀 ↔ locale 的全套映射（已就绪） |
| `src/entry-server.tsx` | SSR 入口，已支持 `initialLocale` |
| `scripts/prerender-plugin.ts` | `getRouteData()`（第 163 行）、hreflang 生成（第 750 行）、`<html lang>`（第 727 行） |
| `public/sitemap.xml` | 静态手写文件，六语言 hreflang 在这里 |
| `Caddyfile` | `try_files {path} {path}/index.html /index.html`（第 66 行）—— 坏 URL 的兜底路径 |
| `scripts/verify-blog.py` | 第 5 组（sitemap + hreflang）—— 需补「URL 能否解析」的检查 |
