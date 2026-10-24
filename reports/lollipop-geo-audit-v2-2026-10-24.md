# Lollipop.im AI 可见性审计与 SEO / AEO / GEO 优化方案（v2 · 站点实证复核版）

**复核日期**：2026-10-24
**原始输入**：Glippy GEO 首页审计（77/100，B 级）
**复核对象**：`https://www.lollipop.im/` 线上构建产物 `dist/`（625 个 sitemap URL、84 篇英文文章 × 6 语言、`llms.txt` 55,470 字节、`llms-full.txt` 226,009 字节、首页 JSON-LD `@graph` 16,019 字符）
**复核原则**：Glippy 只抓首页 HTML，因此它对"全站内容资产"和"真实 AI 引用表现"的判断必然失真。本版以**站点实际资产**与**内部 AI 基准数据**为准，逐条修正原报告。

---

## 0. 执行摘要（三句话）

1. **技术可读性已经到顶，继续堆标签的边际收益接近 0。** 77 分里有 4 个满分项（Meta、机器可读、内容定位、内容完整度），真正拖分的是 Agent 20、实体权威 45、事实可验证 50——这三项都不是"加标签"能解决的。
2. **内容不是短缺，而是过剩且重复。** 站内已有 84 篇英文文章（6 语言 = 504 个文章页）、10 个类型页 × 6 语言、12 个剧集详情页、8 个地区页。原报告建议的 20 个选题**全部**能在现有 84 篇文章中找到对应内容（9 篇可直接保留、7 篇需升级、4 篇应合并），真正需要新写的只有 2 篇；建议新建的 21 个页面中 **4 个已存在、2 个已有等价页面**。下一阶段是"整合 + 证据化"，不是"扩产"。
3. **与真实 AI 表现的最大落差不在站内。** 内部 30 条查询基准（2026-09-01）里，Lollipop 提及率 **0.00%**、引用 1 次；同期 Runway 提及率 **66.67%**、引用 18 次。站内再优化也补不上"第三方证据"这一层。

---

## 1. 原报告的 9 处事实修正

| # | 原报告判断 | 2026-10-24 实测 | 影响 | v2 结论 |
|---|---|---|---|---|
| 1 | 内容新鲜度 67：没有可识别的机器日期 | 文章页**有** `datePublished` / `dateModified` + `Person` 作者（如 Evelyn Cho），博客列表项无日期；首页、About 无日期、无版本号 | 问题范围被高估 | 只补 3 类：首页、About、pricing/legal；文章列表项补日期 |
| 2 | 实体权威 45：缺少可识别的专业人员、资质 | About 页已有 4 人团队与履历（Co-Founder / 运营 / CTO / 财务），文章已有署名作者 | "缺人"不成立 | 真问题是"作者不可验证"：无 `/authors/` 档案页、无编辑政策、Organization 无 `founder` |
| 3 | Schema 76：建议补 Organization、WebSite、SoftwareApplication 等 | 首页 1 个 `@graph` 已含：Organization（地址/邮箱/7 条 sameAs/`foundingDate`）、MobileApplication、SoftwareApplication、WebSite、BreadcrumbList、FAQPage（**27 个问题**）、ItemList | 建议已过期 | 从"新增 Schema"改为"收敛身份 + 去除政策风险字段" |
| 4 | 建议搭建 21 个新页面 | 4 个已存在（`/genre/`、`/genre/romance/`、`/about/`、`/blog/`）；2 个已有等价页面（`/creating/` ≈ `/ai-drama-creator/`，`/creator-program/` ≈ `/creator-monetization/`）；其余 15 个为真实缺口，但多数不值得单独建页 | 会造页重复与关键词内耗 | 只补 4 个缺口页（见第 5 节） |
| 5 | 优先制作 20 个英文选题 | 20 个选题全部已有对应文章（如 `what-is-ai-drama`、`ai-vs-traditional-drama`、`how-to-create-ai-short-drama`、`best-ai-short-drama-platforms-2026`） | 选题清单失效 | 改为"7 篇升级 + 4 篇合并 + 2 篇新增" |
| 6 | 机器可读 100：存在 `llms.txt` 与 `llms-full.txt`（221KB） | 构建产物 `llms.txt` 仅 55KB，且**丢失**了 `public/llms.txt`（10,979 字节）里的 Brand Fact Sheet 与品牌消歧段 | 被漏掉的高价值缺陷 | P0 修复构建生成器，让 Fact Sheet 进入线上 `llms.txt` |
| 7 | 34 张图片均有 alt，但缺 width/height | 34/34 有 alt、0 空 alt；34/34 无 width/height；0 个 `srcset`；33 个 `loading="lazy"`；2 个 `fetchpriority` | 判断成立，但影响被高估 | 保留，降为 P1（CLS 对 AI 引用无直接因果） |
| 8 | 首页缺 `<main>` 标签 | 实际 **15 个页面**缺 `<main>`：首页 + About + 5 个语言首页/About + `creator-program` + `glossary` + `press` | 范围被低估 15 倍 | P0，覆盖全部 6 语言 |
| 9 | 首页开篇摘要仅 8 词 | H1 下方首段约 35 词；真正的问题是 H1 本身："Stream Short Dramas. Create. Monetize."——**不含品牌名、不含 "AI"** | 定位关键词缺失 | P1 改 H1 为 "Lollipop Drama: AI Short Drama Platform — Stream, Create, Monetize" |

**原报告中仍然成立、应直接沿用的判断**：语义 HTML 67、内链 69、多模态 55、Agent 20；"Article page missing Article schema" 不应套用到首页（实测文章页确有 Article Schema，该提示与首页类型不匹配）；"不要为了换漂亮 URL 迁移已积累权重的页面"。

---

## 2. 站点资产盘点（v2 的事实底座）

| 资产 | 实测数量 | 说明 |
|---|---|---|
| sitemap URL | **625** | 115 个非博客页 + 510 个博客相关 URL |
| 博客文章（英文） | **84** 篇 | 6 语言 = 504 个文章页 + 6 个博客列表页 = 510 |
| Markdown 镜像 | **84** 个 | 构建为每篇文章生成 `.md`，供 AI 抓纯文本，设计正确 |
| 类型页 | 10 个 × 6 语言 | romance / revenge / thriller / ceo-drama / fantasy / action / horror / sci-fi / family / historical |
| 剧集详情页 | **12** 个 | `/drama/*`，有 `datePublished`，无 `author` |
| 地区页 | 8 个 | US / UK / CA / AU / SG / MY / PH / ID，仅英文 |
| 其他核心页 | about、contact、creating、creator-program、download、glossary、press、privacy、terms | |
| robots.txt | 7 个 AI 爬虫显式 Allow | GPTBot、Google-Extended、ClaudeBot、anthropic-ai、PerplexityBot、OAI-SearchBot、ChatGPT-User；屏蔽 `/distribution/`、`/login/`、`/forgot-password/`；声明 sitemap |
| llms.txt | 55,470 B（生成物）/ 10,979 B（`public/` 旧副本） | 生成物**未包含** Fact Sheet 与消歧段 |
| hreflang | en、zh-TW、zh、pt、es、ar、x-default | 6 语言互指 + x-default，正确 |
| 首页 JSON-LD | 1 个 `@graph`，16,019 字符 | Organization / MobileApplication / SoftwareApplication / WebSite / BreadcrumbList / FAQPage（27 问）/ ItemList |

**两个结构性发现：**

- **"15,000+ 短剧"只有 12 个详情页做支撑。** AI 在核验时能抓到的剧集实体只有 12 个，声明与可验证证据之间差三个数量级。这不是"多写点内容"能解决的，需要真实库导入或调整表述口径。
- **6 语言 × 84 篇 = 504 页，但英文原创只有 84 篇。** AI 引擎按语言分别索引，非英文页面基本不会进入英文问答的候选集。真正参与英文 AI 竞争的内容池是 84 篇，不是 504 篇——这解释了"站内很丰富、站外 0% 提及"的割裂。

---

## 3. 真实短板：按"AI 是否敢推荐"排序

原报告按 Glippy 分项排序（Agent 20 被列为第一优先级），但 **Agent 能力不是当前推荐率低的成因**。v2 按 AI 决策链重排：

### A. 实体一致性（P0，成本最低、收益最直接）

站内同时存在 4 个身份，AI 无法判断它们是不是同一家公司：

| 身份 | 出现位置 |
|---|---|
| Lollipop Drama（产品/品牌） | 全站 |
| Nyx Entertainment Group（香港母公司） | Organization `parentOrganization` |
| Starget Ventures LLC（开发者） | `public/llms.txt` Fact Sheet、Google Play 包名 |
| LunoTV 1.5（旧产品名） | SoftwareApplication `alternateName` |

同时，联系方式存在两套口径：`llms.txt` 有 `+65 80742120` 与完整地址，JSON-LD 的 `ContactPoint` 只有邮箱、没有电话。**AI 交叉核对时会判定信息不一致，从而降低实体置信度。**

### B. 声明可验证性（P0）

首页约有 12,571 字符正文，"80% / 15,000+ / 1M+ / 100K+ / 100+ countries / 4K" 这类数字出现 **约 60 次**，但三件事都没有：统计口径、统计日期、来源链接。

更具体的政策风险：`MobileApplication` 带 `aggregateRating: 4.9 / 12,840`。这是自述评分，不是来自 App Store / Google Play 的可核验数据。Google 的 structured data 政策对自助评价（self-serving reviews）有明确限制，保留无来源的 `AggregateRating` 属于**扣分项而非加分项**，建议删除或改为绑定真实商店评分。

同类问题还有 `llms.txt` 里的 "highest in the short drama industry"、"ReelShort 370M+ downloads / $700M in 2025"——比较性表述若无第三方出处，AI 会把它当营销话术而非事实。

### C. 第三方证据（P0，决定"是否被推荐"）

内部基准（30 条查询）：Lollipop 提及 0%，引用 1 次，在 107 个被引域名中与 dramily.com、starreel.ai 并列末位；Runway 单域名被引 15 次。**这是当前最硬的短板，也是站内优化无法解决的唯一一项。**

已有基础：Crunchbase 建档字段包已交付（`reports/crunchbase-profile-field-pack-2026-10-23.md`）。缺的是审核通过后的**回链闭环**：`index.html` 的 `sameAs` + `llms.txt` Fact Sheet 补 Crunchbase URL。

### D. 作者与编辑可信度（P1）

- 文章作者是 `Person`（Evelyn Cho，Content Lead），但 `sameAs` 只指向 `/about/`，**没有作者独立页面**，AI 无法确认这是一个真实、可持续产出的人。
- About 的 4 位团队成员没有 LinkedIn / 外部可核验链接。
- 全站没有 editorial policy（编辑方针、事实核查、AI 内容披露）。对"AI 短剧平台"这类题材，**AI 内容披露本身就是可信度信号**。

### E. 语义与性能（P1/P2）

| 问题 | 实测 | 修复位置 |
|---|---|---|
| 15 个页面缺 `<main>` | 首页、About、5 个语言首页/About、creator-program、glossary、press | `HeroSection.tsx` 外层、`AboutPage.tsx`、`MarketingPageShell.tsx` |
| 71 个 `<svg>` 无 `<title>`/`<desc>` | 首页图标均为装饰性 | 装饰图标应加 `aria-hidden="true"`（不是补 `<title>`），信息型图形才补 `<title>`/`<desc>` |
| 34 张图无 `width`/`height` | 33 张已 lazy | 统一容器比例后补尺寸 |
| 1 个渲染阻塞脚本 | 3 个 `<script>`，1 个无 `defer`/`async` | 入口脚本加 `defer` 或改 `module` |
| 无 `preload`、无 `srcset` | 0 / 0 | LCP 图 `preload` + 响应式图 `srcset` |

### F. Agent 交互（P2，暂不投入开发）

Agent 20 分对"是否被推荐"没有直接影响。当前阶段做**动作清单**即可（Search / Browse / Drama Detail / Create / Publish / Creator Signup 六个动作的明确入口与描述），WebMCP、`/.well-known/mcp/server-card.json`、NLWeb 属于观察项，等第三方证据层建成后再评估。

---

## 4. 战略定位：保留原判断，但改入口结构

原报告的"双定位"判断正确，予以保留：

- **观看侧**：AI Short Drama Streaming Platform（AI short dramas、AI drama streaming、short drama app）
- **创作侧**：AI Drama Creation & Monetization Platform（AI drama creator、monetize AI videos、creator revenue share）

但入口不要新造，应映射到已有页面：

| 用户意图 | 现有入口 | 动作 |
|---|---|---|
| Watch | 首页 / `/genre/*` / `/drama/*` | 强化类型页与剧集页的实体信息 |
| Create | `/creating/` | 补工具能力边界与真实演示 |
| Publish | `/creator-program/` | 补发布流程与审核规则 |
| Earn | `/creator-program/` | 补 80% 分成的计算与结算规则 |

---

## 5. 页面架构：只新建 4 个，合并 1 个

| 缺口页 | 目标关键词 | 理由 | 依赖 |
|---|---|---|---|
| `/how-it-works/` | how Lollipop works | 首页 FAQ 无法承载完整流程说明；也是 Agent 动作清单的落地页 | 需真实创作/发布流程截图 |
| `/creator-guidelines/` | AI drama creator guidelines | 同时解决实体权威与"AI 内容披露"可信度 | 需法务/运营确认条款 |
| `/faq/` | Lollipop Drama FAQ | 首页已塞 27 个 FAQ，继续堆会稀释首页权重；拆成独立 FAQ Hub 并扩展到 50+ 问 | 复用现有 27 问 |
| `/best-ai-short-dramas/` | best AI short dramas | 聚合页，承接"best/trending"类高意图查询 | **需真实榜单与更新时间**，否则不做 |
| ~~`/creator-monetization/`~~ | — | **合并进 `/creator-program/`**，不要新建 | 避免关键词内耗 |

**明确不要新建**：`/genre/*`（已有 10 个 × 6 语言）、`/ai-short-dramas/`（与首页/类型页重复）、`/ai-drama-streaming/`、`/ai-drama-creator/`（有 `/creating/`）、`/publish-ai-dramas/`（有文章）、`/about/`、`/blog/`。

---

## 6. 内容策略：从"再写 20 篇"改为"1 支柱 + 7 升级 + 4 合并 + 2 新增"

原报告 20 个选题的实测覆盖情况：

| 原选题 | 已有对应文章 | 动作 |
|---|---|---|
| 1 What Are AI Short Dramas? | `/blog/what-is-ai-drama/`、`/blog/ai-short-drama-complete-guide/` | 保留，升级为支柱页 |
| 2 How Are AI Short Dramas Created? | `/blog/how-to-create-ai-short-drama/`、`/blog/ai-short-drama-pillar-guide/` | 升级 |
| 3 Best Platforms to Watch | `/blog/best-ai-short-drama-platforms-2026/` | 升级（补更新时间与评测口径） |
| 4 vs Traditional | `/blog/ai-vs-traditional-drama/` | 升级 |
| 5 From a Story | `/blog/script-to-screen-pipeline/` | 保留 |
| 6 Script → Video Series | `/blog/ai-script-storyboard/` | 保留 |
| 7 Publish & Distribute | `/blog/publish-and-monetize-vertical-drama/` | 升级（补 Lollipop 实际流程） |
| 8 How Creators Make Money | `/blog/ai-short-drama-monetization/` | 升级（补 80% 计算示例） |
| 9 Revenue Sharing | `/blog/global-ai-short-drama-monetization-roi-model/` | 升级 |
| 10 Monetize AI Videos | `/blog/ai-influencer-monetization/` | 保留 |
| 11 Production Workflow | `/blog/ai-short-drama-complete-guide/` | 合并 |
| 12 1-Minute Scripts | `/blog/ai-scriptwriting-micro-dramas-prompts/` | 保留 |
| 13 What Makes It Viral | `/blog/hook-architecture-and-three-second-rule-in-short-dramas/` | 保留 |
| 14 Build an Audience | `/blog/short-drama-audience-research-before-genre/` | 保留 |
| 15 Best Genres | `/blog/short-drama-audience-research-before-genre/` | 合并 |
| 16 Industry Change | `/blog/ai-short-drama-industry-trends-2026/` | 保留 |
| 17 Independent Creators | `/blog/publish-and-monetize-vertical-drama/` | 合并 |
| 18 What to Look For | `/blog/best-ai-short-drama-platforms-2026/` | 合并 |
| 19 Distribution | `/blog/ai-short-drama-distribution-channels-guide/` | 保留 |
| 20 Future | `/blog/future-of-ai-entertainment/` | 保留 |
| 新增 A | — | AI 短剧的版权与肖像权实操（英文，面向欧美创作者） |
| 新增 B | — | AI 短剧平台分成对比数据报告（原创数据） |

**同时必须处理 2 组内容内耗：**

- `fix-ai-video-artifacts` 与 `fixing-ai-video-artifacts` → 保留搜索表现好的一个，另一个 301。
- `lollipop-vs-reelshort-dramabox` 与 `reelshort-alternative-lollipop-vs-reelshort-dramabox-2026` → 同一意图的两篇，合并为 1 篇。

**每篇统一结构**（原报告模板可用，补充两项）：Direct Answer 25–60 词 → Key Takeaways → Detailed Explanation → Comparison Table → Practical Examples → **How Lollipop Helps（必须写清功能边界）** → FAQ → **Sources & Author（含 `dateModified`）**。

---

## 7. 事实与证据体系（把营销数字变成可引用事实）

建立一份**单一事实源**（`/facts/` 页面 + `llms.txt` Fact Sheet + JSON-LD 三处一致），每条声明必须带口径、日期、来源。

| 声明 | 当前状态 | 必须补齐 | 发布位置 |
|---|---|---|---|
| 80% 创作者分成 | 仅口号，无规则 | 计算公式、适用条件、结算周期、提现门槛 | `/creator-program/` + FAQ + llms |
| 15,000+ 短剧 | 无可核验支撑（仅 12 个详情页） | 统计口径（是否含 AI 生成/真人、去重方式）、统计日期 | `/facts/` + llms |
| 1M+ 用户 / 100K+ 创作者 | 无来源 | 注册口径 vs MAU、统计日期 | `/facts/` + About |
| 4K 播放 | 声称 | 支持设备、码率、测试条件 | `/download/` + FAQ |
| 100+ 国家 | 声称 | 应用商店上架国家数快照（附日期） | `/facts/` |
| 4.9 / 12,840 评分 | JSON-LD 自述 | **删除，或绑定 App Store / Google Play 真实数据** | `App.tsx` schema |
| "行业最高 80%" | 比较性表述 | 改为"公开对比中处于最高档（80%）"，注明竞品数据为第三方估算 | `/creator-program/` + llms |

---

## 8. 技术任务清单（按影响/成本重排）

### P0（1–7 天，直接提升可信度）

| # | 任务 | 具体改动 | 验收标准 |
|---|---|---|---|
| 1 | 恢复 llms.txt Fact Sheet | `scripts/prerender-plugin.ts` 的 llms 生成段加入 Brand Fact Sheet、品牌消歧、联系方式；删除或同步 `public/llms.txt` 旧副本 | 线上 `/llms.txt` 含 Fact Sheet 表 + 4 个消歧实体 + 与 JSON-LD 一致的联系方式 |
| 2 | 实体收敛 | `src/app/App.tsx` schema：补 `founder`、`telephone`；明确 `parentOrganization` 与 developer 关系；`alternateName` 仅保留必要项 | 4 个身份在 schema/llms/about 三处表述一致 |
| 3 | 移除风险字段 | 删除自述 `AggregateRating`，或改为真实商店评分并附来源 | Rich Results 测试无警告 |
| 4 | 补 `<main>` | `HeroSection.tsx` 外层、`AboutPage.tsx`、`creator-program`、`glossary`、`press`（含 6 语言） | 全站 0 个页面缺 `<main>` |
| 5 | 事实源页面 | 新建 `/facts/`（或并入 About），承载 6 条声明的口径与日期 | 每条声明可点击到证据 |

### P1（2–4 周）

| # | 任务 | 具体改动 |
|---|---|---|
| 6 | 作者实体 | `/authors/evelyn-cho/` 等作者页 + `Person.sameAs`（LinkedIn/About）+ About 团队外部链接 |
| 7 | 编辑政策 | `/editorial-policy/`：选题、核查、AI 内容披露、更正机制 |
| 8 | 4 个缺口页 | `/how-it-works/`、`/creator-guidelines/`、`/faq/`、`/best-ai-short-dramas/` |
| 9 | 页面日期 | 首页、About、FAQ 加可见 `Last updated` + JSON-LD `dateModified`；博客列表项补 `datePublished` |
| 10 | 内容合并 | 2 组重复文章 301 合并 |
| 11 | 剧集页扩容 | `/drama/` 从 12 → 200+（真实库导入优先，禁止编造） |
| 12 | H1 修正 | 首页 H1 改为含品牌 + "AI" 的表述 |

### P2（1–3 个月）

| # | 任务 |
|---|---|
| 13 | 图片 `width`/`height`（34 张）+ `srcset` + LCP `preload` |
| 14 | 处理 1 个渲染阻塞脚本（`defer`/`module`） |
| 15 | SVG 分型处理：装饰 `aria-hidden`，信息型补 `<title>`/`<desc>` |
| 16 | 6 个 Agent 动作清单落地（Search / Browse / Detail / Create / Publish / Signup），不做 WebMCP |
| 17 | 第三方证据：Crunchbase 审核通过后回链 `sameAs` + llms；YouTube / LinkedIn / Medium / Reddit 四个平台起步 |

---

## 9. 90 天落地计划（v2）

**阶段一：事实层与实体层（D1–D15）**
- 完成 P0 全部 5 项
- 发布 `/facts/`，核实 6 条核心声明
- 建立 Crunchbase 回链（待审核结果）
- **出口标准**：`llms.txt` 含 Fact Sheet；schema 无自述评分；全站 0 缺 `<main>`；6 条声明可溯源

**阶段二：内容整合与作者可信（D16–D45）**
- 4 个缺口页上线；7 篇升级；4 篇合并；2 篇新增
- 作者页 + 编辑政策上线
- 首页/About 补日期与版本
- **出口标准**：84 篇中至少 30 篇有 `dateModified` 且指向作者页；重复内容 0

**阶段三：第三方引用与规模化（D46–D90)**
- 剧集页扩至 200+
- 发布 1 份原创行业数据报告（样本量、方法、日期公开）
- YouTube 演示 ≥10 条；LinkedIn / Medium 各 ≥8 篇
- 建立 50 问品牌监测基线
- **出口标准**：30 条基准中品牌提及率 ≥10%，引用域名 ≥5 个非自有域名

---

## 10. KPI 体系（含基线）

| 指标 | 基线（2026-10） | D90 目标 | 监测方式 |
|---|---|---|---|
| Glippy GEO 技术分 | 77 | 85+（仅作技术就绪度） | 固定审计工具与日期 |
| AI 品牌提及率 | **0.00%**（30 条查询） | ≥10% | 50 条固定问题 × 4 引擎 |
| AI 引用域名数 | 1（自有） | ≥5 个非自有 | 引用域名统计 |
| 实体准确率 | 未测（存在 4 身份冲突） | 100% | 人工核验 10 个问题答案 |
| 可溯源声明占比 | 约 0/6 | 6/6 | `/facts/` 自检 |
| 剧集详情页 | 12 | 200+ | sitemap |
| 作者署名覆盖 | 100%（无作者页） | 100% + 作者页 | 抽检 |
| Google 自然点击 | GSC 当前值 | +30% | Search Console |

**测量纪律**：固定问题、语言、地区、时间、模型版本；每次记录原始回答与引用 URL，否则数据不可比。

---

## 11. 三个最值得优先投入的项目（v2 排序）

1. **事实与实体可信层（Fact & Entity Layer）** — 成本最低、周期最短。核心动作：`llms.txt` 恢复 Fact Sheet、4 个身份收敛、删除自述评分、`/facts/` 上线。它直接决定 AI"敢不敢引用"，而不是"能不能读懂"。
2. **第三方引用网络** — Crunchbase 回链 + YouTube 演示 + LinkedIn/Medium 专业内容。这是 0% → 10% 提及率之间唯一的桥。
3. **内容整合与剧集页扩容** — 把 84 篇做减法（合并重复）、把 12 个剧集页做成 200+，让"15,000+"从口号变成可抽样验证的事实。

**最终判断（修正原报告）**：Lollipop 缺的不是内容数量，也不是技术标签，而是**可核验的身份、可溯源的声明、可交叉验证的第三方证据**。原报告把"Agent 20 分"列为第一优先级，属于被评分表带偏；在本轮复核中，它排在第 6 位。

---

## 附录：复核证据（2026-10-24，`dist/` 构建）

| 检查项 | 结果 |
|---|---|
| 首页 `<main>` | 0 |
| 全站缺 `<main>` 页面 | 15（首页、About、5 语言首页/About、creator-program、glossary、press） |
| 首页 `<img>` | 34，全部有 alt，0 个 width/height，0 srcset，33 lazy，2 fetchpriority |
| 首页 `<svg>` | 71，0 个带 `<title>` |
| 首页 `<script>` | 3，1 个无 defer/async |
| 首页 JSON-LD | 1 个 `@graph`，16,019 字符；FAQPage 27 问 |
| Organization | 有地址、邮箱、7 条 sameAs、foundingDate=2024；**无 founder、无 telephone** |
| SoftwareApplication | `alternateName` = LunoTV 1.5 |
| MobileApplication | `aggregateRating` 4.9 / 12,840（无来源） |
| sitemap | 625 URL；115 非博客 + 510 博客；全部对应已构建页面 |
| 博客 | 84 篇英文文章、504 个文章页、84 个 `.md` 镜像 |
| llms.txt | 生成物 55,470 B（无 Fact Sheet）；`public/` 副本 10,979 B（有 Fact Sheet，未生效） |
| llms-full.txt | 226,009 B |
| robots.txt | 7 个 AI 爬虫显式 Allow；屏蔽 3 个路径 |
| 文章 Schema | Article + `datePublished`/`dateModified` + Person 作者 + publisher + HowTo |
| 联系方式 | 页面/llms：business@、service@、+65 80742120；JSON-LD：仅邮箱 |
| 内部 AI 基准 | 30 条查询，Lollipop 提及 0%、引用 1；Runway 提及 66.67%、引用 18 |
