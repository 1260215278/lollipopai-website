# /guides/ 结构化知识区 — 建设报告

日期：2026-09-01
阶段：GEO 第三轮（承接第二轮「30 条真实 prompt 采集分析」结论）

---

## 一、为什么建这个区（数据依据）

第二轮 GEO 采集（`data/outputs/lollipop_drama_20260901/`）的关键发现：

| 指标 | Lollipop Drama | Runway | Fanvue |
|---|---|---|---|
| 提及率（30 条 prompt） | **0.00%** | 66.67%（20 次） | 6.67% |
| 引用域名数 | 1（lollipop.im） | 30 | 5 |

拆解 Runway 的 30 次引用来源：

| 域名 | 次数 | 占比 |
|---|---|---|
| runway.com（营销站） | 15 | 50% |
| **help.runwayml.com** | **11** | 37% |
| **academy.runwayml.com** | **4** | 13% |
| **docs.dev.runwayml.com** | **2** | 7% |

**结论：Runway 57% 的引用来自 help / academy / docs 类「结构化知识」页面，而非营销页。**
AI 引擎在回答「怎么做」类问题时，优先引用带明确步骤、可逐条摘取的内容。

本轮之前，Lollipop Drama 全站 21 篇博客以 Article（观点/对比）为主，没有 HowTo 类型内容。
`/guides/` 即是对标该结构性缺口的产物。

---

## 二、本轮交付

### 内容（首批 3 篇 + 扩充 6 篇 = 9 篇双语 HowTo 指南）

| # | slug | 分类 | 标题 | 耗时 | 难度 | 覆盖 query |
|---|---|---|---|---|---|---|
| 1 | `character-consistency-workflow` | Production Workflow | How to Keep AI Characters Consistent Across Episodes | PT3H | Intermediate | #3、#14（角色一致性，原零覆盖） |
| 2 | `ten-episodes-two-weeks` | Production Planning | How to Produce 10 AI Short Drama Episodes in Two Weeks | P14D | Intermediate | 制作排期（原零覆盖） |
| 3 | `publish-and-monetize-vertical-drama` | Distribution & Monetization | How to Publish and Monetize a Vertical AI Drama | PT2H | Beginner | #9、#15、#19（变现） |
| 4 | `script-to-screen-pipeline` | Production Workflow | From Logline to Finished Episode: The AI Drama Pipeline | PT4H | Intermediate | #2、#8、#17、#25 |
| 5 | `fix-ai-video-artifacts` | Production Workflow | How to Fix Hands, Motion, and Multi-Character Artifacts | PT2H | Advanced | #29 |
| 6 | `first-vertical-drama-zero-experience` | Production Planning | Your First Vertical AI Drama With Zero Production Experience | P7D | Beginner | #20、#24、#27 |
| 7 | `ai-drama-budget-under-1000` | Production Planning | Producing a Publishable AI Drama for Under $1,000 | PT3H | Beginner | #11、#12、#26 |
| 8 | `multilingual-localization-workflow` | Distribution & Monetization | Localizing an AI Drama for International Audiences | PT3H | Intermediate | #23 |
| 9 | `ai-drama-legal-checklist` | Production Workflow | The Pre-Publish Legal Checklist for AI Drama | PT1H | Beginner | #7 |

1–3 为批准的首批，4–9 按 30 条真实 query 的**剩余缺口**反推选题（覆盖 #2 #7 #8 #11 #12 #17 #20 #23 #24 #25 #26 #27 #29，
至此 30 条 query 中「工作流/制作/发行/成本/合规」五大类均有对应可引用页面）。

每篇结构：Direct Answer 前置结论 → 7 步工作流（与 HowTo schema 同源）→ 表格/清单 → 3 条 FAQ → 相关阅读内部链接。
正文 EN/ZH 双语，`steps` / `stepsZh` 各 7 步，`totalTime` 为 ISO 8601。

### 代码

| 文件 | 说明 |
|---|---|
| `src/app/data/guides.ts` | 新建。数据源 + `getGuideBySlug()` + `GUIDE_CATEGORY_ACCENT` |
| `src/app/data/guidesFaq.ts` | 新建。每篇 3 条双语 FAQ（共 **27 条**，9 个 slug 全覆盖） |
| `src/app/lib/markdown.tsx` | 新建。从 BlogPostPage 抽出的共享 Markdown 渲染器 |
| `src/app/pages/GuidesListPage.tsx` | 新建。hub，CollectionPage + ItemList schema |
| `src/app/pages/GuidePage.tsx` | 新建。详情页，HowTo + TechArticle + FAQPage + BreadcrumbList |
| `src/app/pages/BlogPostPage.tsx` | 重构 481 → 287 行，删除 196 行内联 Markdown 实现 |
| `src/main.tsx` | 客户端路由 +2（后追加 3 条分类静态路由） |
| `src/entry-server.tsx` | SSR 路由 +4（含修复既有 /login、/forgot-password 缺失）；后追加 3 条分类静态路由 |
| `src/app/i18n.tsx` | 六语言 dynamicPages +19 键（共 114 处） |
| `src/app/i18n.seo.ts` | `getLocalizedDynamicSeo` 新增 `guides` 页面类型（5 语言模板） |
| `scripts/prerender-plugin.ts` | 指南路由 + hub CollectionPage schema + llms 双文件分区 |
| `public/sitemap.xml` | 手动补 **10 个** URL（hub + 9 篇，含 6 语言 hreflang + x-default） |
| `src/app/components/useNavItems.ts` | 顶栏加入口 |
| `src/app/components/Footer.tsx` | 页脚加链接 |
| `src/app/components/MarketingPageShell.tsx` | `/guides` 导航高亮 |
| `scripts/verify-guides.py` | 新建。构建后全链路终检脚本；后追加第 8 组「分类聚合页」校验（分类表从数据层反查，不硬编码） |

---

## 三、构建前后对比

| 指标 | 建设前 | 3 篇时 | 9 篇时 | + 分类页 | **数据拆分后（当前）** |
|---|---|---|---|---|---|
| 预渲染 HTML | 60 | 64 | 70 | 73 | **73** |
| 路由总数 | 61 | 65 | 71 | 74 | **74** |
| sitemap URL | 59 | 63 | 69 | 72 | **72** |
| llms.txt | 10,971 chars | 12,101 chars | 14,109 chars | 14,838 chars | **14,838 chars** |
| llms-full.txt | 62,235 chars | 78,395 chars | 95,999 chars | 96,757 chars | **96,757 chars** |
| gz / br 预压缩 | 各 90 | 各 99 | 各 105 | 各 108 | 各 **108** |
| `guides` 数据 chunk | — | 30.08 kB | 104.16 kB | 104.16 kB | **10.72 kB（gzip 3.98）** |
| `GuidePage` chunk | — | 17.78 kB | 33.12 kB | 33.12 kB | **127.06 kB（gzip 51.32）** |

---

## 三 bis、数据层拆分（元数据 / 正文分离）

### 为什么这样拆，而不是按篇动态 import

最初设想是 `guides/index.ts`（元数据）+ `guides/<slug>.ts`（正文动态 import），
但实测后发现**详情页不能异步加载**，原因在 `src/main.tsx`：

```tsx
createRoot(document.getElementById("root")!).render(...)
```

用的是 `createRoot` 而非 `hydrateRoot` —— 客户端挂载时会**清空并重建** DOM。
若详情页改为异步取正文，直接落地的用户会看到「预渲染正文 → 空白/骨架 → 正文」的闪屏。
而详情页正是 GEO 的落地方（用户从搜索/AI 回答点进来），闪屏不可接受。

因此改为**元数据 / 正文两个模块，详情页同步引入两者**：

| 文件 | 内容 | 体积 | 被谁导入 |
|---|---|---|---|
| `src/app/data/guides.ts` | `guideMeta`（含新增 `stepCount`）+ `GUIDE_CATEGORIES` + 分类配色 | 13,171 chars | **列表页 / 分类页** |
| `src/app/data/guidesContent.ts` | `steps` / `stepsZh` / `content` / `contentZh` | 99,337 字节 | **详情页 + 预渲染** |

正文占原数据文件 **87.3%**（68,948 / 78,955 chars）—— 这就是拆分收益的来源。

### 结果

- hub / 分类页：数据 chunk **40.72 kB → 3.98 kB（gzip，-90%）**
- 详情页：56.21 kB → 55.30 kB（gzip），**基本不变**（正文从共享 chunk 挪进了详情页自己的 chunk）
- 静态产物字节级不变：llms.txt 14,838 / llms-full.txt 96,757 chars，与拆分前完全一致

### 拆完必须处理的连带问题

1. **列表页运行时 schema 里的 `step[]` 必须删掉** —— 元数据上已无 `steps` 字段，
   留着就是 `undefined.map()` 崩溃。静态 HTML 的完整 HowTo（含全部 HowToStep）
   仍由 `prerender-plugin.ts` 注入，爬虫读到的还是完整版。
2. **卡片步骤数**改用新增的 `stepCount` 字段。
3. **反向约束写进文件头**：`guidesContent` 只能被详情页与预渲染导入，
   一旦被列表页导入，全部正文会被拉回 bundle，拆分立刻失效。

---

## 四、本轮发现并修复的既有严重缺陷

### SSR 路由表不同步（静默正文替换）

`src/entry-server.tsx` 是**第二份**硬编码路由表，与 `src/main.tsx` 需手工同步。
该文件末尾有 `<Route path="*" element={<App initialPage="home" />} />` 兜底，
**任何忘记在此注册的路由都不会报错** —— prerender 照常生成 HTML，
title / description / canonical 也全部正确（来自 `getRouteData()`），
只有 `<div id="root">` 里的正文被静默替换成首页内容。

本轮首次构建后实测：4 个 `/guides/*` HTML 全部命中该问题，正文是首页。
**在 dist 里肉眼几乎看不出来**（title 正确、文件存在、体积正常）。

顺带排查发现同样问题已存在于：

| 路由 | 状态 |
|---|---|
| `/login` | 正文为首页（noindex，影响有限但仍是错的） |
| `/forgot-password` | 同上 |

已一并修复：两个页面补进 `entry-server.tsx`，重新构建后正文正确、noindex 保留。

**防复发措施：**
1. `entry-server.tsx` 头部加「路由同步铁律」注释。
2. `scripts/verify-guides.py` 第 7 项自动比对两张路由表（豁免 `/distribution/*`、`/creator/:userId`）。
3. 新增兜底污染检测：扫描 dist，任何页面若出现首页特征文案 `15,000+` 即判失败。

> 这与已记录的「静态 sitemap 陷阱」属同一类问题：
> **本项目存在多处需要手工同步的第二数据源（sitemap.xml、entry-server.tsx），
> 且全部失败时静默、不报错。**

---

## 五、终检结果

`python scripts/verify-guides.py` → **ALL PASSED**（7 组、共 **100+** 项，9 篇 × 11 项 + hub/llms/sitemap 各项）

覆盖：HTML 生成 / SSR 正文正确性 / 四层 Schema（HowTo·TechArticle·FAQPage·BreadcrumbList）/
步骤与 FAQ 数量 / hub CollectionPage / llms 双文件收录 / sitemap 与 hreflang /
dist 旧定位文案残留（0 处）/ 双路由表同步 / 兜底污染。

---

## 六、下一轮建议

| 优先级 | 动作 | 理由 |
|---|---|---|
| P0 | ✅ 已完成：知识区扩到 9 篇 | Runway 的 help/academy/docs 是成百上千页量级，3 篇只是起点 |
| P0 | **采集第二轮数据验证效果** | 30 条 prompt 重跑，对比 Lollipop Drama 提及率 0% → ?（**需用户确认后再跑，涉及外部 API 调用**） |
| P1 | ✅ 已完成：分类聚合子页 `/guides/workflow`、`/guides/production`、`/guides/distribution` | 强化主题聚类，AI 引擎偏好清晰层级；+3 个可索引页面 |
| P1 | ✅ 已完成：`guides` 数据拆分（104 kB → 10.7 kB） | 见「三 bis」。扩到 20+ 篇时详情页会跟着涨，届时需再按篇拆 |
| P1 | **博客数据 chunk 470 kB（gzip 165 kB）** | 比 guides 拆分前还重 4.5 倍，是站内最大 payload。同样套路可拆 |
| P2 | 给现有 21 篇博客中的教程类补 HowTo schema | 目前仅 `category==="guide"` 的文章带 HowTo，且步骤是 i18n 写死的通用 7 步 |
| P2 | 检查 `dp.howToSteps` 硬编码问题 | 博客的 HowTo 步骤对所有教程类文章是同一套文案，语义价值有限 |

### 分类聚合页实现要点（2026-09-01 追加）

路由用**静态段** `/guides/workflow` 而非 `/guides/category/:id`——React Router v6 的静态优先排序
会让静态段先于 `/guides/:slug` 命中，无需改详情页逻辑，URL 也更短更可读。

同一组件 `GuidesListPage` 服务两类路由，靠 `category` prop 区分。**筛选 chip 全部改成 `<Link>`**
（原来是 `<button>` + 本地 state）：否则爬虫抓不到分类页入口，聚合页等于白建。

新增一个分类要同步 **4 处**（已在代码注释中标注）：
① `GUIDE_CATEGORIES`（数据层）② `Guide["category"]` 联合类型
③ `main.tsx` + `entry-server.tsx` 静态路由 ④ `public/sitemap.xml`

### 本轮扩产的选题方法（可复用）

1. 拿 `data/outputs/queries_full.csv` 的 30 条真实 query
2. 逐条问「这条问题，我们站上有没有一个页面能直接被引用来回答？」
3. 答不上的就是缺口 → 按缺口聚类成选题（一个选题常能盖 2–4 条 query）
4. 选题优先级：**带明确数字/预算/时长的 query 优先**（AI 引擎最爱引用「可验证的具体答案」）

---

## 七、复用清单（下次新增内容区照抄）

1. 建数据源 `src/app/data/<x>.ts` + `<x>Faq.ts`
2. 建页面组件，schema 用 `@graph` 组合，Breadcrumb 交给 `withBreadcrumb()`
3. `src/main.tsx` 加 `<Route>`
4. **`src/entry-server.tsx` 加 `<Route>`**（最容易漏，漏了静默出错）
5. `scripts/prerender-plugin.ts` 的 `getRouteData()` 加路由 + schema，llms 双文件加分区
6. `src/app/i18n.tsx` 六语言补键（en 是类型源，缺任一语言即类型报错）
7. `src/app/i18n.seo.ts` 若需本地化 title，加页面类型模板
8. `public/sitemap.xml` 手动补 `<url>`（含 6 语言 hreflang + x-default）
9. 构建 → 跑终检脚本 → grep dist 验正文

---

## 八、数据层拆分（元数据 / 正文分离）—— guides + blog 双验证

公式化做法 + 可复用工具 `scripts/split-content-fields.py`。

### 结论

| 内容区 | 拆分前 | 拆分后 | 列表页 payload（gzip） | 详情页 payload（gzip） |
|---|---|---|---|---|
| `guides`（9 篇） | 104.16 kB | 10.72 kB | 40.7 → 4.0 KB（**-90%**） | 56.8 → 51.3 KB（-10%） |
| `blog`（21 篇） | 470.08 kB | 23.38 kB | 165.0 → 6.8 KB（**-95.9%**） | 205.9 → 194.5 KB（-5.5%） |

两边列表页都是数量级改善，详情页基本持平（正文只是从共享 chunk 挪进了详情页自己的 chunk）。
**静态产物字节级零回归**：blog 21 篇 HTML 长度全部 +0，llms.txt / llms-full.txt / sitemap.xml / 首页 byte 相同。

### 为什么不是「按篇动态 import」

`src/main.tsx` 用 **`createRoot`（不是 `hydrateRoot`）**——客户端挂载会清空重建 DOM。
详情页若异步加载正文，直接落地的用户会看到「预渲染正文 → 空白 → 正文」闪屏，
而详情页正是 GEO 落地方。所以详情页必须**同步**引入元数据 + 正文两个模块。

> 若将来改用 `hydrateRoot`，详情页就能按篇动态 import，199 KB 还能再降到约 10 KB。
> 但 hydration 不匹配有风险，没做。

### 拆分后必须处理的连带问题

1. 列表页代码里若读了被拆走的字段（如 `post.content.length`），必须改掉
2. 元数据数组重命名后，所有引用点要同步（列表页 / 详情页 / prerender 三处）
3. prerender **必须**改导入全量数组（它需要正文渲染静态 HTML 与 llms 文件）
4. 列表页 / 聚合页**绝不能** import 正文模块，否则全部正文被拉回 bundle，拆分立刻失效

### 生成脚本踩的坑（split-content-fields.py）

- value 扫描不能用朴素正则：正文含 ``` 代码块、转义反引号、Markdown 方括号，
  必须按模板串 / 引号串 / 数组深度正确扫描
- **删除区间必须从行首开始**：只删到 key 起点会留下该行缩进，导致下一个 `}` 缩进多 4 格
- 别用全局正则清理尾随逗号：会把上一个属性的逗号一起吃掉，产出语法错误
  （2026-09-01 首跑就炸在这里，靠 `/tmp/blog.ts.bak` 还原后修好）
