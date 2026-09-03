# /guides → /blog 内容区合并报告

日期：2026-09-01
决策：用户选择**彻底迁入 /blog，删除 /guides**（三档方案中的激进档）

---

## 一、决策依据

| 事实 | 结论 |
|---|---|
| `/guides` 9 篇的 `publishDate` 均为 2026-09-01（当天新建，基本未被收录） | 删除路由的索引损失代价**很小** |
| GEO 复核：Runway 66.67% 提及率中，17/30 次引用来自 `help.` / `academy.` / `docs.` 结构化知识子域 | **HowTo 结构化资产必须保住** —— 删路由 ≠ 删结构化数据 |

两条叠加后的结论：结构化 HowTo 资产要保留，但**独立路由不值得**。`/blog` 的「操作指南」分类足以承载。

---

## 二、迁移范围

### 数据层（21 篇 → 30 篇）

| 文件 | 迁移前 | 迁移后 | 说明 |
|---|---|---|---|
| `src/app/data/blog.ts` | 24,152 B / 21 slug | 34,017 B / 30 slug | 元数据 + `stepCount` |
| `src/app/data/blogContent.ts` | 337,335 B / 21 条 | 409,726 B / 30 条 | 正文 + `steps` / `stepsZh` |
| `src/app/data/blogFaq.ts` | 77,229 B / 21 条 | 96,032 B / 30 条 | 9 组 FAQ |

行尾全部保持 CRLF，无混合行尾。正文内链 `/guides/xxx` → `/blog/xxx` 改写 **30 处**。

### 类型与共享逻辑

- `blog.ts` 新增 `GuideStep` 接口；`category` 值域扩展 `workflow` / `production` / `distribution`；新增 `steps` / `stepsZh` / `totalTime` / `difficulty`；`BlogMeta` 加可选 `stepCount`
- 新增 `GUIDE_CATEGORY_GROUP` + `isGuideCategory()` —— 「操作指南」是**分类组**不是单一分类，否则 `distribution` 只有 2 篇会导致详情页「相关阅读」只剩 1 条
- 新增 `src/app/lib/blogCategory.ts` 的 `blogCategoryLabel()` —— 列表页与详情页**共用**，避免只改一处、另一处静默 fallback 到硬编码英文

### 页面

- `BlogPostPage.tsx`：承载两类文章。带 `steps` 的输出 `TechArticle` + `HowTo`，并在正文前渲染**可见步骤概览区块**（与 schema 同源）；不带 `steps` 的维持原 `Article` 行为
- `BlogListPage.tsx`：筛选 chip 只出 `all` / `guide` / `industry` / `creator`（细分分类不单列），筛选按组匹配，卡片显示细分分类名 + 步骤数徽章

### 删除清单（备份在 `/tmp/guides_merge_bak/`）

`guides.ts` / `guidesContent.ts` / `guidesFaq.ts` / `GuidePage.tsx` / `GuidesListPage.tsx`；
双路由表各 4 条 `/guides*`；导航项与 `MarketingPageShell` 分支；prerender 路由块与 llms Guides 区块；
sitemap 13 条 URL；`i18n.seo.ts` 的 `pageType: "guides"` 与 5 个语言模板块。

---

## 三、顺带修掉的三个既有缺陷

1. **HowTo 与可见文本不一致（违反 Google 硬要求）**
   原先所有 `guide` 分类文章输出的 HowTo 是 `dp.howToSteps` **通用模板**，7 篇共用同一步骤且页面不可见。
   迁入的 9 篇改用真实步骤 + 渲染可见步骤区块；旧 7 篇保留历史行为并标注为待优化项。

2. **迁入的 9 篇在静态 HTML 里根本没有 HowTo**
   prerender 的判据是 `category === "guide"`，而迁入文章的 category 是 `workflow` / `production` / `distribution`。
   已改为 `Boolean(p.steps?.length)`。

3. **英文页面输出中文 FAQ**
   prerender 的 FAQ schema 用 `f.question`，但预渲染只生成英文路径。已改为 `f.questionEn ?? f.question`。

另发现旧 sitemap **漏了 `/guides` 列表页本身**（只有 3 分类 + 9 篇 = 12 条）。本次改用脚本生成 + 校验。

---

## 四、路由与收录承接

- `public/sitemap.xml`：72 → 68 条（删 13 条 `/guides`，加 9 条 `/blog/<slug>`），`/blog` 30 条，零 `/guides` 残留
- `Caddyfile`：9 篇一一对应 301 + 3 个分类页 → `/blog` + 兜底 `redir /guides* /blog 301`
- `llms.txt` 改为 `## Blog (includes HowTo guides)`，带步骤的文章标注 `[HowTo: N steps, 时长, 难度]`
- Footer 的 `Guides` 入口改为直链代表性 HowTo 实体页 `/blog/character-consistency-workflow`（其「相关阅读」会把爬虫导向其余 15 篇）

---

## 五、终检结果

```
python scripts/verify-blog.py      → 9 组 415 项 ALL PASSED
python scripts/check-dist-links.py → 扫 73 HTML / 2963 引用，资源缺失 0 / 悬挂内链 0，ALL PASSED
```

构建：69 HTML / 70 routes / gz·br 各 101，零 SSR 失败。

### 12 篇 HowTo 的 GEO 硬要求校验

每篇均满足 **HowTo schema 步骤数 == 页面可见步骤数 == 数据层 stepCount**
（迁入的 9 篇各 7 步；后补的 3 篇分别 8 / 8 / 7 步），`totalTime` / `supply` / `tool` 齐全，
同时带 `TechArticle` + `FAQPage` + `BreadcrumbList`。

---

## 六、踩坑记录

| # | 问题 | 根因 | 修复 |
|---|---|---|---|
| 1 | 迁移脚本找不到插入锚点 | 数据文件全 CRLF，锚点用 LF | `detectEOL()` + `toEOL()` |
| 2 | bash heredoc 报 `Bad substitution` | heredoc 里含 `${}` 模板字面量 | 改用 Write 工具直接落文件 |
| 3 | SSR 全崩 `steps is not defined`（22 篇） | `const steps` 写在 `useEffect` 内，但 JSX 引用了它 | 提到**组件顶层**声明 |
| 4 | JSON-LD 全部漏抓 | 标签带 `id` 属性 | 正则改 `<script[^>]*application/ld\+json[^>]*>` |
| 5 | 终检误报 15 项「标题特征词」 | 标题连字符（`Post-Production`）在 HTML 中原样保留 | 改为取渲染后的 `<h1>` 与数据层标题归一化比对 |
| 6 | 终检误报 5 页「兜底污染」 | `15,000+` 在 contact/download/region 营销页正常出现 | 改为「子页面 h1 == 首页 h1」判定 |

---

## 七、收尾：清理旧的通用 HowTo 模板（同日完成）

合并完成后，旧的 `category === "guide"` 分支仍在给 7 篇文章输出一份 i18n 通用 HowTo 模板
（`dp.howToSteps` / prerender 里的硬编码 7 步）。这份模板**多篇共用同一步骤，且步骤在页面上完全不可见**，
违反 Google「结构化数据必须与可见文本一致」的要求 —— 这是合并前就存在的合规隐患。

处理方式**不是一刀切**，而是按正文的实际性质分两类：

| 篇 | 正文里的真实结构 | 处理 |
|---|---|---|
| `how-to-create-ai-short-drama` | H2 即 `Step 1~8` | 补真实 HowTo（8 步，Beginner / P10D） |
| `ai-video-storytelling` | H3 即 `Stage 1~8`，每节有 `**What to do:**` | 补真实 HowTo（8 步，Intermediate / P10D） |
| `ai-short-drama-complete-guide` | H2 即 `Stage 1~7` | 补真实 HowTo（7 步，Advanced / P6D） |
| `ai-drama-character-consistency` | `Method 1~4`（并列方法，非有序步骤） | 去掉 HowTo，输出 Article |
| `ai-copyright-compliance` | 风险清单 | 去掉 HowTo，输出 Article |
| `best-ai-storytelling-platforms` | 平台对比 | 去掉 HowTo，输出 Article |
| `complete-guide-ai-entertainment-platforms` | 平台对比 | 去掉 HowTo，输出 Article |

步骤名**逐字取自正文可见标题**，步骤说明提炼自该节正文（`What to do` / `Core takeaway`），
保证 schema 与可见文本一致。`totalTime` 取自正文的时长声明（10 集系列 5–15 天 / 全流桯 4–8 天）。

结果：**带 HowTo 的文章 9 → 12 篇**，无步骤的 18 篇全部输出 Article。

### 新增的防复发检查

`verify-blog.py` 第 6b 组：18 篇无步骤文章不得含 `HowTo` / `TechArticle` —— 阻止通用模板行为复活。

### 又一个 CRLF 坑

`Path.read_text()` **默认开启通用换行**，会把纯 CRLF 的文件整体转成 LF。
第一次跑脚本就是这个 bug：EOL 检测恒为 `\n`，写回后 blogContent.ts 的 8841 个 CRLF 全部变成 LF
（文件反而小了 2.9 KB，因为加了步骤数据却丢了 CR）。
已回滚并改为 `open(..., newline="")` 保真读取 + 内部按 LF 处理 + 落盘还原原行尾。

---

## 八、收尾：清理 i18n 死键（同日完成）

`/guides` 下线 + 通用 HowTo 模板停用后，`src/app/i18n.tsx` 的 `dynamicPages` 命名空间里有
**5 个键 × 6 语言 = 30 个键**再无任何引用：

| 键 | 原用途 |
|---|---|
| `howToSteps` | 旧的通用 HowTo 步骤模板（已停用） |
| `howToTotalTime` | 同上 |
| `guides` | 旧 `GuidesListPage` 的导航标签 |
| `guidesTitle` | 旧 `/guides` 列表页标题 |
| `guidesDescription` | 旧 `/guides` 列表页描述 |

清理前逐键核实：全仓零引用，且**不存在 `dp[...]` 形式的动态键访问**（否则不能按静态分析删）。
`scripts/remove-dead-i18n-keys.py` 一次性删除，`TranslationMessages = typeof enMessages`
意味着 en 是类型源，**6 个语言块必须同步全删**，只删 en 会让其余 5 个语言对象多出未声明属性而类型报错。

结果：`i18n.tsx` 126,476 → **116,814 字节（-9.7 KB）**，纯 CRLF 保持。
dist 终检确认 `Guides & Workflows` / `Write Your Script` 等已删文案**零残留**。

> ⚠️ `LunoTV 1.5` 在 dist 中仍有 73 处，但来源是 `App.tsx` 的软件 schema 与 `FAQSection.tsx` 的在用在内容，
> **不是**被删的通用模板，未一并处理。

---

## 九、后续可选项

- **Footer 的 `How-To Guides` 是硬编码英文**（`src/app/components/Footer.tsx:28`），未走 i18n，
  其余 5 个语言显示的是英文。规模小，可后续补键
- 详情页 chunk 677 kB / gzip 247 kB（含 30 篇正文）。改为 `hydrateRoot` 后可按篇动态 import，
  可显著下降，但 hydration 不匹配有风险，**未做**
- 重跑 GEO 采集需 `OPENAI_API_KEY`，建议连跑 3 轮取平均
