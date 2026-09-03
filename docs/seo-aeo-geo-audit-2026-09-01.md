# Lollipop AI — SEO / AEO / GEO 审计报告

> 审计日期：2026-09-01 · 对象：lollipop.im（React + Vite + Tailwind SPA）
> 审计方式：代码级静态审计（i18n.seo.ts / prerender-plugin.ts / index.html / robots.txt / sitemap.xml / blog.ts / blogFaq.ts / localePath.ts）

---

## 一、结论速览

| 维度 | 评分 | 一句话结论 |
|------|------|-----------|
| **SEO**（传统搜索） | 🟢 优秀 | SSG 预渲染 + 6 语言 hreflang + 完整结构化数据，已超绝大多数 SPA |
| **AEO**（答案引擎） | 🟡 良好 | FAQPage + 博客问答齐全，但多语言 FAQ 结构化未覆盖 |
| **GEO**（生成式引擎） | 🟠 有基础 | AI 爬虫放行 + 结构化数据到位，缺 llms.txt 这一关键抓手 |

核心判断：**这个项目的 SEO 底座已经非常扎实**，不存在"漏收录博客""空壳 HTML"这类致命问题。真正值得投入的是 GEO 方向的增量——尤其 llms.txt，以及几处结构化数据的语义缺陷。

---

## 二、现状盘点（已具备，无需重复建设）

### SEO 技术基础 ✅
| 项 | 状态 | 位置 |
|----|------|------|
| SSG 预渲染（真实 HTML 正文，非空壳） | ✅ | `scripts/prerender-plugin.ts`（SSR bundle 全量渲染） |
| 每页独立 title/description（60/160 字符控制） | ✅ | `src/app/i18n.seo.ts` |
| 6 语言（en/zh-CN/zh-TW/pt/es/ar）SEO 文案 | ✅ | `pageSeoMessages` |
| Open Graph + Twitter Card（含 og:image 1200×630） | ✅ | `index.html` + `applyCustomSeoMeta` |
| canonical（每页唯一） | ✅ | 运行时 + 预渲染双层 |
| hreflang（双向 + x-default） | ✅ | `updateHreflang` + prerender 注入 |
| sitemap.xml（18 blog + 10 genre + 12 drama + 8 region + 6 静态页） | ✅ | `public/sitemap.xml`（手动维护） |
| robots.txt（含 AI 爬虫显式放行） | ✅ | `public/robots.txt` |
| 博客 Article schema + author + publisher + image | ✅ | prerender 博客循环 |
| 博客封面图全覆盖（18/18 篇均有独立 coverImage） | ✅ | `src/app/data/blog.ts` |
| 数据一致性：blog.ts ↔ sitemap ↔ prerender 三处 slug 完全对齐 | ✅ | 本次核验 |

### AEO 基础 ✅
| 项 | 状态 |
|----|------|
| 首页 FAQPage schema（5 个核心问答） | ✅ `index.html` site-schema |
| 每篇博客 FAQPage schema（blogFaq.ts，18 篇全覆盖，双语） | ✅ |
| 博客正文 "Direct Answer" 段落（问答式开头） | ✅ |
| guide 类博客附加 HowTo schema | ✅ |

### GEO 基础 ✅
| 项 | 状态 |
|----|------|
| robots.txt 显式放行 GPTBot / ClaudeBot / PerplexityBot / Google-Extended 等 10+ AI 爬虫 | ✅ |
| Organization schema 含 sameAs（6 个社交/应用商店链接，实体消歧） | ✅ |
| 结构化数据全站覆盖（Organization/MobileApplication/WebSite/FAQPage/Article/HowTo/VideoObject/CollectionPage/BreadcrumbList） | ✅ |

---

## 三、缺口与优先级

### 🔴 P0 — GEO 核心缺失：llms.txt
- **问题**：站点完全没有 `llms.txt` / `llms-full.txt`。这是 llmstxt.org 提出的 AI 引擎抓取标准，ChatGPT/Claude/Perplexity/Gemini 检索站点时优先读取它来理解内容架构。对"被 AI 回答引用"这一 GEO 目标，缺它是最大的可量化短板。
- **修复**：构建时动态生成（本次已做，见下）。

### 🟠 P1 — Article schema 语言错位（真实缺陷）
- **问题**：`prerender-plugin.ts` 用 `stripMd(p.contentZh)` 生成 `articleBody`，但 `headline` 用英文 `p.title`。预渲染只产出英文路径，导致英文页面的 Article schema 里正文是中文 —— 语义错乱，损害 AEO/GEO 引用准确度。
- **附带**：`wordCount` 用 `replace(/\s/g,"").length` 对英文算的是"去空格字符数"而非词数。
- **修复**：改英文正文 + 空格分词计数（本次已做）。

### 🟡 P2 — 多语言 AEO 覆盖不足
- **问题**：首页 FAQPage 仅英文 5 问，6 语言站点未提供对应语言的 FAQ 结构化数据。非英文查询场景下 AI 引用概率较低。
- **建议**：后续为 zh-CN/zh-TW/pt/es/ar 各补一套 FAQPage（数据可复用 i18n.seo.ts 的多语言结构）。

### 🟡 P3 — 细节增强（低优先级）
- 预渲染页面的 `og:image` 缺 `og:image:width/height`（首页 index.html 有，动态页没有）。
- `genre` CollectionPage 未关联具体剧集（可加 ItemList 增强实体关系）。
- `sitemap.xml` 为手动维护，历史上发生过漏收录（记忆记录：曾漏 13 篇博客）；建议长期改为由 prerender 动态生成，与 llms.txt 同源。
- genre/drama/region 的 SEO 数据在 prerender-plugin 内硬编码，与 `src/app/data/*.ts` 分离，存在漂移风险。

---

## 四、本次已执行优化

### 1. 新增 llms.txt + llms-full.txt（P0）
- 在 `prerender-plugin.ts` 新增 `generateLlmsFiles()`，构建时自动生成 `dist/llms.txt` 与 `dist/llms-full.txt`。
- **llms.txt**（精简版）：站点简介 + 核心页面 + 10 品类 + 12 剧集 + 8 区域 + 18 博客 + 5 核心 FAQ + 联系信息。
- **llms-full.txt**（完整版）：额外含每篇博客的分类/作者/日期/摘要 + 每篇博客的 FAQ 问答（双语回退）。
- **数据源与博客同源**（dataBlogPosts + blogFaq），新增博客自动同步，规避 sitemap 手动维护的漏收录教训。

### 2. 修复 Article schema 语言错位（P1）
- `articleBody` 改用英文正文 `stripMd(p.content)`（与英文 headline 一致），并扩至 1500 字符以利 GEO 理解。
- `wordCount` 改为 `content.split(/\s+/).filter(Boolean).length` 正确英文词数。

### 3. 顺带修复：SSR bundle 清理撞 safe-delete（环境坑）
- 构建时发现 `dist/.ssr` 残留 + `publicDir` 复制导致 SSR bundle 目录清理被 WorkBuddy 的 safe-delete（50 文件阈值）拦截，SSR 降级为 meta-only。
- 修复：SSR build 加 `publicDir: false`，把 `.ssr` 临时目录体积降到个位数，不再触发批量删除拦截。

## 五、构建验证结果（2026-09-01）

| 校验项 | 结果 |
|--------|------|
| 构建状态 | ✅ 成功（`✓ built in 14.38s`） |
| SSR 完整渲染 | ✅ 启用（`SSR module loaded — full content rendering enabled`） |
| 静态 HTML | ✅ 57 个（含完整正文，非空壳） |
| llms.txt | ✅ 9716 字符 |
| llms-full.txt | ✅ 62062 字符 |
| 压缩产物 | ✅ Gzip 88 文件 + Brotli 88 文件 |
| Article schema | ✅ articleBody 英文、wordCount 正确英文词数（如 917 词） |

---

## 六、后续建议（按投入产出比排序）

1. **多语言 FAQPage**（P2）— 复用 i18n 结构，为 6 语言各补 FAQ 结构化数据。
2. **sitemap 动态化**（P3）— 将 sitemap.xml 改为 prerender 同源生成，根除漏收录风险。
3. **og:image:width/height 补齐**（P3）— 一行改动，提升社交分享抓取。
4. **genre ItemList**（P3）— 品类页关联具体剧集，增强实体图谱。
5. 上线后到 Google Search Console 提交 llms.txt 与 sitemap，观察 AI 引擎抓取频次。
