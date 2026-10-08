# SEO 研究 Brief: AI 短剧投流推广完全指南（2026）（中文 How-To / Commercial 投流推广指南型文章）

> 研究员：关宇霖（关键词研究 / 聚类策略师）
> 日期：2026-10-06
> 交付对象：撰稿人（中文 SEO How-To / 投流推广指南长文）
> 发布渠道：lollipop.im 中文博客
> 内容类型：投流 / 推广 / 付费投放 / 分发增长**指南型**（How-To / Commercial 向）—— 面向"想把 AI 短剧推出去、用付费流量换增长/收入"的创作者与发行方，给出"投什么渠道、怎么算 ROI、怎么避坑"的完全指南。
> 关联选题：本系列第 ⑧ 篇（① what-is-ai-short-drama-2026 / ② reelshort-alternative-* / ③ best-ai-short-drama-platforms / ④ ai-short-drama-monetization / ⑤ ai-short-drama-overseas-compliance / ⑥ ai-influencer-monetization / ⑦ ai-short-drama-industry-trends-2026 之后）；与站内 `publish-and-monetize-vertical-drama`（发布与变现流程）、`ai-short-drama-monetization-copyright`（变现与版权）、`global-ai-short-drama-monetization-roi-model`（出海变现 ROI 测算）强相关，须做**意图切分 + 双向互链**。
> 建议 slug：`ai-short-drama-promotion-guide-2026`（已确认不在 `blog.ts`，可用）

---

## 0. 数据核实与来源说明（重要：撰稿人务必遵守）

- **站内语言版本核查方法（权威源）**：本仓库判定某 slug 是否有简中版，权威依据是 `src/app/data/blog.ts` 中 `BlogPost` 的 **`titleZh` 字段是否存在**（= 进入多语言子集 `multilangSubset.ts` 规则 = 有简中版）。**本仓库无 `dist/zh/blog` 构建产物目录**，不可依赖产物存在性。本 Brief §5 全部内链结论均以此方法**逐 slug 用 Grep 读取 `blog.ts` 的 `slug` + `titleZh` 行号确认**。
- **blog.ts 行号偏移提示**：此前核查曾发现 blog.ts 较旧模板整体 `+3 行`；本 Brief 所有行号均为**本次实时 Grep 结果**，未抄旧行号。
- **本次 Grep 核查结论（关键）**：
  - **Forbidden slug（本批未发布草稿，正文严禁链）全部确认不在 `blog.ts`**：逐条 Grep ① `reelshort-alternative-lollipop-vs-reelshort-dramabox-2026`、② `what-is-ai-short-drama-2026`、③ `best-ai-short-drama-platforms`、④ `ai-short-drama-monetization`、⑤ `ai-short-drama-overseas-compliance`、⑥ `ai-influencer-monetization`、⑦ `ai-short-drama-industry-trends-2026`、⑨⑩（slug 待定）均**无匹配**（注：blog.ts 中存在语义相近但 slug 不同的 `ai-short-drama-monetization-copyright` L855/L858、`ai-short-drama-industry-data-report-2026` L1372/L1375，属不同 slug，不计入 forbidden）。上述 forbidden slug 当前 `URL 不可访问`、`titleZh` 缺失，**正文严禁链**，只列入"待建内链"待批量接回。
  - **可链白名单 slug 全部确认带 `titleZh`**（行号见 §5.1）。注意：任务点名的 `lollipop-vs-reelshort-dramabox` **已存在**（L895/L898，非 forbidden ① 的新草稿 slug），可作为简中内链正常使用；forbidden ① `reelshort-alternative-lollipop-vs-reelshort-dramabox-2026` 为**不同 slug**，不在库。
  - **目标 slug `ai-short-drama-promotion-guide-2026` 已确认不在 `blog.ts`**（无匹配），可安全使用、不与现有 slug 冲突。
- **市场数据口径**：下文所有渠道/ROI/预算数字均来自**公开行业经验与第三方估算**（巨量引擎/腾讯广告官方文档口径、DataEye 短剧观察、广大大、AppGrowing、短剧自习室等行业自媒体），非一手审计数据；引用请**标注来源 + "估算"**，不臆造精确数字。
- **检索偏差提示**：中文检索大量命中腾讯 `ima.qq.com` "知识库"聚合卡（二次转引），宜反映市场共识口径但**不宜作为权威外链锚点**；真·权威来源为 §7 列出的平台官网/媒体原文。

---

## 1. SEO 基础

### 1.1 主关键词（Primary Keyword）

- **主关键词：`AI短剧投流`**（首选，最贴合"投流推广完全指南"定位，行业精准词，商业意图最强）
- **H1 / 标题主表达（含时效与框架）**：`AI 短剧投流推广完全指南（2026）：渠道、ROI 与避坑`
- **搜索量（估算）**：中文搜索引擎（百度/Google 中文/巨量算数）月搜索量**中，估算 500–1,500 次/月**（"短剧投流"为成熟高频行业词，"AI短剧投流"随 AI 短剧爆发呈上升通道；无 Ahrefs/SEMrush 直连，标注"估算"）。长尾聚合（投流/推广/付费投放/怎么推广）整体可触达 2,000–5,000 次/月。
- **竞争难度**：**中**。SERP 现有结果以平台官方文档（巨量引擎/腾讯广告）、零散经验贴、投放课程软文为主，**缺乏一篇中立、结构化、覆盖"全渠道 + ROI 框架 + AI 短剧特化素材 + 避坑"的 How-To 完全指南**——存在蓝海窗口。
- **商业意图等级**：**高（Commercial-Investigation / How-To-Grow）**——搜索"投流/推广/付费投放"的人处于"已生产完内容、想花钱换增长/收入"阶段，正是 Lollipop Drama 的目标创作者与发行方。
- **选择理由**：
  1. 直接命中本篇"投流推广完全指南"定位与任务指定主词候选之首；
  2. 与 `publish-and-monetize-vertical-drama`（发布与变现流程）、`ai-short-drama-monetization-copyright`（变现与版权）、`global-ai-short-drama-monetization-roi-model`（出海变现 ROI 测算）做**"投放增长（花钱买流量）" vs "发布流程" vs "变现/版权" vs "收入模型 ROI"** 的清晰意图切分后可独占"AI 短剧投流推广"入口；
  3. 是 AI 引擎（豆包/文心/Perplexity）回答"AI 短剧怎么推广/投流渠道/投放 ROI"的**首选引用形态**（GEO/AEO 高价值，见 §6）；
  4. 蓝海——中文无"中立、覆盖多渠道 + ROI + 避坑 + AI 短剧特化"的投流推广单篇。

> **备选主词 / 语义表达**：`AI短剧 推广`、`AI短剧 怎么 推广`、`AI短剧 付费 投放`、`AI短剧 投放`、`短剧投流` 作语义变体与 H2 锚点，避免只押一个词。H1 可微调为 `AI 短剧怎么推广（2026）：投流渠道、ROI 与避坑完全指南` 以兼顾"投流"精准词与"怎么推广"口语词。

### 1.2 语义变体（Semantic Variants，5 个）
1. `AI短剧 推广`（推广型主表达）
2. `AI短剧 怎么 推广`（口语 How-To 变体）
3. `AI短剧 付费 投放`（付费投放型变体）
4. `AI短剧 投流 渠道`（渠道导向变体）
5. `短剧投流 ROI`（指标/商业导向变体）

### 1.3 长尾关键词（Long-tail，12 个，附意图 / 竞争度 / 优先级）

| # | 长尾词 | 搜索意图 | 竞争度 | 优先级 | 对应段落 / 内链去向 |
|---|---|---|---|---|---|
| 1 | AI短剧投流 | How-To/商业（主词） | 中（缺中立指南单篇） | 高 | H1 + H2 一 |
| 2 | AI短剧 怎么 推广 | How-To | 中低 | 高 | H2 一/七 实操步骤 |
| 3 | AI短剧 投流 渠道 | 信息/商业 | 中 | 高 | H2 三/四 渠道全景 → 内链 /blog/publish-and-monetize-vertical-drama |
| 4 | AI短剧 付费 投放 | How-To/商业 | 中 | 高 | H2 二/七 投放实操 |
| 5 | AI短剧 投流 ROI | 商业/指标 | 中 | 高 | H2 五 ROI 公式 → 内链 /blog/global-ai-short-drama-monetization-roi-model（区分投流ROI vs 变现ROI） |
| 6 | AI短剧 怎么 投流 才 不 亏 | How-To/避坑 | 低–中 | 中高 | H2 八 避坑 |
| 7 | 短剧投流 平台 有哪些 | 信息 | 中 | 中高 | H2 三/四 渠道 |
| 8 | AI短剧 素材 怎么 投 广告 | How-To | 低–中 | 中高 | H2 六 素材策略 |
| 9 | 抖音/巨量 短剧 投流 方法 | How-To | 中 | 中 | H2 三/七 国内渠道 |
| 10 | AI短剧 出海 投流 | How-To/商业 | 中 | 中 | H2 四 海外 → 内链 /blog/ai-short-drama-localization、/blog/global-ai-short-drama-monetization-roi-model |
| 11 | 投流 预算 怎么 分配 | 信息/商业 | 低 | 中 | H2 二/七 预算 |
| 12 | AI短剧 推广 避坑 | How-To/信息 | 低 | 中 | H2 八 避坑 + FAQ → 内链 /blog/ai-short-drama-monetization-copyright |

### 1.4 搜索意图（Search Intent）
- **主导意图**：Commercial-Investigation / How-To-Grow（"我已做好剧，怎么花钱推、推哪、怎么不亏"）。
- **次级意图**：信息型（渠道清单、ROI 定义、预算基准）+ 避坑型（"投流怎么不烧钱"）。
- **不应覆盖的意图**："怎么做一部 AI 短剧"（→ `how-to-create-ai-short-drama`）、"发布与分账流程"（→ `publish-and-monetize-vertical-drama`）、"变现/版权合规"（→ `ai-short-drama-monetization-copyright`）—— 这些交由对应 Spoke 承接，本篇只做指路，不展开。

### 1.5 目标字数
- **建议 2,800–3,800 中文字**（指南型，需覆盖 9 个 H2 + 渠道表 + ROI 公式 + 避坑清单 + FAQ）。下限保覆盖，上限防稀释；ROI/避坑两段是差异化重点，宜给足篇幅。

### 1.6 精选摘要（Featured Snippet）机会
- **高概率夺取"段落型/列表型"精选摘要**的问题：
  - "AI 短剧投流 ROI 怎么算？" → 给 ROAS/CPA/CPI/回收周期一句话公式 + 小表（H2 五）。
  - "AI 短剧投流有哪些渠道？" → 给"国内 6 + 海外 4"两行总表（H2 三/四）。
  - "投流怎么避免烧钱没转化？" → 给 5 条避坑要点（H2 八）。
- 做法：每个问题段首用 ≤40 字直接答案句，紧跟干净 Markdown 表/有序列表，便于 Google/百度摘要抓取。

---

## 2. 竞品格局分析（Top 10，按查询分语种）

### 2.1 中文 SERP（搜索"AI 短剧投流 / 短剧推广 / 付费投放 / 怎么推广"）Top 10 构成
1. **巨量引擎官方文档 / 巨量学** —— 短剧行业投放产品说明、巨量星图/短剧发行人计划（官方口径，偏产品）。
2. **腾讯广告 / 腾讯广知** —— 短剧赛道投放指南、微信视频号短剧推广（官方口径）。
3. **DataEye 短剧观察 / 短剧自习室** —— 行业投放数据、爆款投流复盘（第三方数据，较权威但非 How-To 指南）。
4. **广大大 / AppGrowing** —— 短剧广告创意与投放情报（工具/数据向）。
5. **知乎经验贴** —— "短剧投流怎么入门""ROI 怎么算"（零散 UGC，质量参差）。
6. **公众号/人人都是产品经理/运营派** —— 投流方法论长文（偏 App/电商 UA，非 AI 短剧特化）。
7. **抖音电商学习中心 / 巨量算数** —— 短剧发行人计划教程（平台闭环向）。
8. **投放课程软文/知识付费落地页** —— "3 天学会短剧投流"（商业软文，立场偏售课）。
9. **快手磁力引擎** —— 短剧投放产品页（官方口径）。
10. **B站/小红书创作者学院** —— 内容分发与涨粉（偏自然流量，非付费投流）。

### 2.2 英文 SERP（搜索 "how to advertise short drama / short drama UA / promote AI short drama 2026"）构成
1. **Meta for Business / TikTok for Business Help** —— 广告投放通用文档（非短剧特化）。
2. **AppLovin / Singular / AppsFlyer blog** —— 短剧/App UA 与 ROAS 方法论（偏移动应用买量）。
3. **ReelShort / DramaBox 母公司（Crazy Maple / StoryMatrix）招股书/财报/PR** —— 投放预算披露（数据向，非 How-To）。
4. **广告代理商博客（如 Mobidays、Pangle）** —— 短剧出海 UA 案例（商业软文）。
5. **Reddit / Quora / IndieHackers** —— "how do short drama apps acquire users"（UGC 讨论）。
- 英文侧**几乎没有"AI short drama promotion how-to"中立指南**，本篇出海段（H2 四）可填补空白，GEO/AEO 英文引用价值高（见 §6）。

### 2.3 语言构成结论
- 中文侧以**平台官方 + 第三方数据 + 零散经验 + 软文**为主，**缺一篇"中立、AI 短剧特化、覆盖全渠道 + ROI + 避坑"的 How-To 完全指南**。
- 英文侧以**通用 UA 文档 + 代理商软文**为主，缺 AI 短剧特化指南。
- 结论：**双向蓝海**，尤其"AI 短剧投流推广"这一精准交集几乎无人占领。

### 2.4 内容差距（我们的机会）
1. 现有结果**不中立**（官方卖产品 / 软文卖课），缺第三方客观指南。
2. 现有结果**不特化 AI 短剧**（多套用 App/电商 UA 模板），缺"AI 短剧素材如何用 AI 量产、如何 A/B 测钩子"等特化内容。
3. 缺**ROI 框架与投流 ROI / 变现 ROI 区分**（多数把"投放花费回报"与"平台分账收入"混为一谈）。
4. 缺**避坑清单**（烧钱无转化、素材审核不过、归因错误、预算超支）。
5. 缺与**发布/变现/出海**文章的**闭环互链**（读者看完投流仍不知"发布流程/怎么分账/出海合规"）。

### 2.5 差异化策略（独特定位）
- **中立第三方视角** + **AI 短剧特化**（素材 AI 量产、钩子 A/B）。
- **全渠道覆盖**（国内 6 + 海外 4）+ **ROI/ROAS/CPA 框架**（并明确区分投流 ROI 与变现 ROI）。
- **避坑清单** + **实操 7 步**（冷启动→放量→控成本）。
- **闭环互链**到站内核发/变现/出海/版权文，形成 Hub→Spoke 网络（见 §5/§8）。

---

## 3. 搜索意图分类与段落规划

| 意图类型 | 代表查询 | 落点段落（H2） | 内容形态 |
|---|---|---|---|
| How-To-Grow（主） | AI短剧怎么推广 / 投流 | H2 一、七 | 概念 + 实操 7 步 |
| 信息/渠道 | 投流渠道有哪些 / 短剧投流平台 | H2 三、四 | 渠道总表（国内/海外） |
| 商业/指标 | 投流 ROI 怎么算 | H2 五 | 公式 + 小表 |
| How-To/素材 | 素材怎么投广告 / A/B 测钩子 | H2 六 | 素材策略清单 |
| 避坑 | 投流怎么不亏 / 推广避坑 | H2 八 | 避坑清单 |
| 承接/CTA | 发布流程 / 变现 / 出海 | 各 H2 内链 + H2 九 | 指路 + FAQ |

---

## 4. 推荐文章结构大纲（9 个 H2，含 Hook 的 APP 公式）

> **开篇 Hook（APP 公式）**：**A（Attention 痛点）**——"一部 AI 短剧做好了，却只有 200 播放？问题往往不在内容，在投流。" **P（Problem 问题）**——"90% 的创作者把预算洒在错误的渠道、错误的素材、错误的ROI认知上，烧钱无转化。" **P（Proof 证据/方法）**——"本指南用 9 节讲清：投什么渠道、ROI 怎么算、素材怎么量产、7 步实操、以及 8 个烧钱陷阱。全程中立、AI 短剧特化。"

- **H2 一、什么是 AI 短剧投流推广（概念 + 为什么必须投）**
  - 要点：投流 = 付费买流量（区别于自然分发）；AI 短剧"内容产能高、自然流量天花板低"，投流是放大 ROI 的杠杆；与"发布/变现"的关系（投流是需求侧增长，发布变现是供给侧闭环）。一句话定义 + 直接答案句（抢 Featured Snippet）。
- **H2 二、投流前必做的 3 件准备（素材库 / 落地页或账号矩阵 / 受众包与预算）**
  - 要点：钩子素材库（前 3 秒冲突）、落地承接（小程序/应用/主页）、种子受众与相似包、日预算与回本预期；预算分配基准（估算，标注来源）。
- **H2 三、国内投流渠道全景（巨量引擎 / 腾讯广告 / 快手磁力 / 抖音发行人计划 / 小红书 / B站）**
  - 要点：6 渠道对比表（适合题材、计费方式 oCPM/CPC、起量门槛、优势/坑点）；国内主战场=巨量+腾讯+快手；内链 `publish-and-monetize-vertical-drama` 指路"发布流程"。
- **H2 四、海外投流渠道（Meta / TikTok for Business / Google Ads / Apple Search Ads）**
  - 要点：4 渠道对比表（区域、计费、素材要求、合规注意）；出海投放与本地化强相关 → 内链 `ai-short-drama-localization`、`global-ai-short-drama-monetization-roi-model`。
- **H2 五、投流 ROI 怎么算（ROAS / CPA / CPI / 回收周期公式）**
  - 要点：核心公式（ROAS=投放带来的收入/花费；CPA=花费/转化数；回收周期=获客成本/单用户日均收入）；**明确区分"投流 ROI（花钱买量回报）"vs"变现 ROI（平台分账收入模型，见出海 ROI 测算文）"**；给出中性估算基准（标注估算）。
- **H2 六、素材策略：AI 短剧如何用 AI 量产高转化素材（A/B 测钩子）**
  - 要点：用 LunoTV/AI 工具批量生成前 3 秒钩子变体；A/B 测试框架（钩子/画风/字幕/落地话术）；素材衰退与更新节奏；与 `ai-short-drama-complete-guide`/`how-to-create-ai-short-drama` 衔接。
- **H2 七、投放增长实操 7 步（冷启动 → 放量 → 控成本）**
  - 要点：①建计划 ②小预算测素材 ③留优汰劣 ④扩量 ⑤控 CPA 红线 ⑥跨渠道复制 ⑦归因复盘；每步一句话动作 + 警惕点。
- **H2 八、避坑指南（8 个烧钱陷阱）**
  - 要点：烧钱无转化、素材审核不过（平台 AI 标注政策）、归因错误（只看末次点击）、预算超支无止损、受众过窄/过宽、钩子不痛、盲目铺渠道、把投流ROI当变现ROI。每条给"现象→原因→解法"。内链 `ai-short-drama-monetization-copyright` 指路版权/政策红线。
- **H2 九、投流推广完全指南 Checklist + 内链承接（FAQ）**
  - 要点：一页式 Checklist（准备/渠道/ROI/素材/7步/避坑）；5 条 FAQ（用 FAQPage 结构化数据）；向下承接发布/变现/出海/版权/引擎文，形成闭环。

---

## 5. 内链规划

### 5.1 可链内链清单（锚文本 + 路径 + 简中版验证结论 + 行号 + 用途）

> **核查方法**：逐 slug 读取 `src/app/data/blog.ts`，以 `titleZh` 字段存在性判定简中版（本仓库无 `dist/zh/blog` 构建产物，故不依赖 dist）。行号见各条（本次实时 Grep）。

| # | 锚文本建议 | 路径 | 简中版验证（blog.ts） | 行号 | 用途 |
|---|---|---|---|---|---|
| 1 | 竖屏 AI 短剧发布与变现全流程 | /blog/publish-and-monetize-vertical-drama | ✅ 已验证（titleZh"竖屏 AI 短剧发布与变现全流程：从分发到收入"） | slug L539 / titleZh L542 | H2 三/七 指路"发布与结算流程"（本篇只指路，不展开上传→审核→分账） |
| 2 | AI 短剧变现与版权：商用授权与红线 | /blog/ai-short-drama-monetization-copyright | ✅ 已验证（titleZh"AI 短剧变现与版权：商用授权、平台政策与红线规避"） | slug L855 / titleZh L858 | H2 八 素材审核/平台 AI 标注政策/版权红线深读 |
| 3 | 2026 出海 AI 短剧变现测算与分成模型 | /blog/global-ai-short-drama-monetization-roi-model | ✅ 已验证（titleZh"2026 出海AI短剧变现测算与分成模型：欧美 vs 东南亚实操指南"） | slug L1328 / titleZh L1331 | H2 四/五 出海 ROI 深读（**区分投流ROI vs 变现ROI**） |
| 4 | AI 短剧本地化：翻译/配音/对口型 | /blog/ai-short-drama-localization | ✅ 已验证（titleZh"AI 短剧本地化：如何用 AI 自动翻译、配音并对口型到 20+ 语言"） | slug L753 / titleZh L756 | H2 四 海外投流前置（素材本地化） |
| 5 | 如何制作 AI 短剧（新手指南） | /blog/how-to-create-ai-short-drama | ✅ 已验证（titleZh"如何制作AI短剧：2026年完整新手指南"） | slug L254 / titleZh L257 | H2 一/六 出片与素材 CTA |
| 6 | AI短剧制作全流程手册（2026） | /blog/ai-short-drama-complete-guide | ✅ 已验证（titleZh"AI短剧制作全流程手册（2026）：从创意到变现的16个关键节点"） | slug L175 / titleZh L178 | H2 六 素材量产衔接 |
| 7 | 2026 年八大 AI 短剧引擎 | /blog/top-8-ai-short-drama-engines-2026 | ✅ 已验证（titleZh"2026 年八大 AI 短剧引擎：Lollipop Drama vs Runway vs Kling vs Pika"） | slug L693 / titleZh L696 | H2 六 素材生成工具选型 |
| 8 | AI 短剧制作完全指南（全景 Hub） | /blog/ai-short-drama-pillar-guide | ✅ 已验证（titleZh"AI 短剧制作完全指南：从剧本到变现的 2026 全景"） | slug L1352 / titleZh L1355 | H2 九 向下承接 Hub |
| 9 | 2026 AI 短剧行业数据报告（成本/产能/变现基准） | /blog/ai-short-drama-industry-data-report-2026 | ✅ 已验证（titleZh"2026 AI 短剧行业数据报告：成本、产能与变现基准"） | slug L1372 / titleZh L1375 | H2 二/五 成本/产能基准 |
| 10 | Lollipop Drama vs ReelShort vs DramaBox（2026）分成对比 | /blog/lollipop-vs-reelshort-dramabox | ✅ 已验证（titleZh"Lollipop Drama vs ReelShort vs DramaBox（2026）：分成、AI工具与内容模式对比"） | slug L895 / titleZh L898 | H2 三/四 平台分成/工具深读（注：此为**已存在** slug，非 forbidden ① 新草稿） |
| 11 | AI 短剧制作常见问题全解（60 问） | /blog/ai-short-drama-faq-2026 | ✅ 已验证（titleZh"AI 短剧制作常见问题全解：从工具选择到变现的 60 问"） | slug L1392 / titleZh L1395 | H2 九 FAQ 互补 |
| 12 | AI网红平台：AI 生成人物变现 | /blog/ai-influencer-platform | ✅ 已验证（titleZh"AI网红平台：Lollipop Drama 如何在2026年变现AI生成人物"） | slug L914 / titleZh L917 | H2 二/六 KOL/网红投放视角补充 |

> **语言版本核查结论（关键）**：任务点名与聚类强相关的 7 个白名单 slug（publish-and-monetize-vertical-drama / ai-short-drama-monetization-copyright / global-ai-short-drama-monetization-roi-model / ai-short-drama-localization / how-to-create-ai-short-drama / top-8-ai-short-drama-engines-2026 / lollipop-vs-reelshort-dramabox 等）**全部确认存在简中版**（titleZh 已验证，行号见上表），可作为简中内链正常使用。
>
> **⚠️ 特别提示（与任务描述的出入）**：forbidden ① 为 `reelshort-alternative-lollipop-vs-reelshort-dramabox-2026`（新草稿 slug，**不在 blog.ts**），而**已存在的**是 `lollipop-vs-reelshort-dramabox`（L895/L898，不同 slug）。二者 slug 不同，本文**只链已存在的后者**，严禁链 forbidden ① 新草稿 slug，避免死链。

### 5.2 待建 forbidden slug 清单（①②③④⑤⑥⑦⑨⑩，标注"待批量发布接回，正文严禁链"）

> 经**逐 slug Grep `blog.ts` 确认以下 slug 均不存在（无 titleZh、URL 不可访问）**，正文严禁链，仅在此登记待批量接回。

| 编号 | forbidden slug | Grep 结论 | 处理 |
|---|---|---|---|
| ① | `reelshort-alternative-lollipop-vs-reelshort-dramabox-2026` | 不在 blog.ts（无匹配；注意已存在的是 `lollipop-vs-reelshort-dramabox` L895，不同 slug） | 待发布接回；正文严禁链 |
| ② | `what-is-ai-short-drama-2026` | 不在 blog.ts（无匹配） | 待发布接回；正文严禁链 |
| ③ | `best-ai-short-drama-platforms` | 不在 blog.ts（仅语义相近 `top-8-ai-short-drama-engines-2026` L693 存在） | 待发布接回；正文严禁链 |
| ④ | `ai-short-drama-monetization` | 不在 blog.ts（仅 `ai-short-drama-monetization-copyright` L855 存在，不同 slug） | 待发布接回；正文严禁链 |
| ⑤ | `ai-short-drama-overseas-compliance` | 不在 blog.ts（无匹配） | 待发布接回；正文严禁链 |
| ⑥ | `ai-influencer-monetization` | 不在 blog.ts（仅 `ai-influencer-platform` L914 存在，不同 slug） | 待发布接回；正文严禁链 |
| ⑦ | `ai-short-drama-industry-trends-2026` | 不在 blog.ts（仅 `ai-short-drama-industry-data-report-2026` L1372 存在，不同 slug） | 待发布接回；正文严禁链 |
| ⑨⑩ | 本批后续文章（slug 待定） | 不在 blog.ts（slug 未定，自然不在） | 待定 slug 发布后接回；正文严禁链 |

> **正文纪律**：本篇正文**仅链 §5.1 白名单 12 条**；任何 forbidden slug 一律不链，避免死链。待 ①②③④⑤⑥⑦⑨⑩ 批量发布且 URL 可访问后，由 content-editor 在对应段落补互链（时序前置，原则同 `brief-lollipop-vs-reelshort-dramabox-zh-interlink-2026-10-06.md`）。

---

## 6. GEO / AEO 适配建议

### 6.1 核心目标
让豆包 / 文心 / Perplexity / ChatGPT 在回答"AI 短剧怎么推广 / AI 短剧投流渠道 / 投流 ROI 怎么算 / 短剧推广避坑"时，**优先引用本篇并给出清晰结论**。

### 6.2 具体做法
1. **直接答案句前置**：H2 一/三/五/八 每段首用 ≤40 字结论句 + 干净 Markdown 表，AI 引用偏好"句子级结论 + 结构化表"。
2. **渠道总表**：H2 三/四 给"国内 6 + 海外 4"两表，便于解析与引用。
3. **ROI 公式块**：H2 五 用代码块/定义列表给出 ROAS/CPA/CPI/回收周期公式，**并显式区分投流 ROI 与变现 ROI**（避免 AI 混淆两概念）。
4. **FAQPage 结构化数据**：H2 九 5 问用 JSON-LD `FAQPage`，对齐"AI短剧投流ROI怎么算""投流怎么不亏"等自然语言问法。
5. **实体消歧 + 互链**：首次同屏出现 `publish-and-monetize-vertical-drama`（发布流程）、`ai-short-drama-monetization-copyright`（版权）、`global-ai-short-drama-monetization-roi-model`（出海变现 ROI）时互链并各自限定范围，明确"投流=花钱买量增长，发布=供给侧闭环，变现/出海ROI=收入模型"。
6. **llms.txt 对齐（互斥聚类）**：本篇列入 **"AI short drama promotion / paid traffic guide 2026"** 引用集；`publish-and-monetize-vertical-drama` → "publish & monetize vertical drama"；`ai-short-drama-monetization-copyright` → "monetization copyright"；`global-ai-short-drama-monetization-roi-model` → "overseas ROI model"。各集互斥，避免同一查询下站内自相竞争。
7. **数据可溯**：每个关键数字就近附来源 + "估算"（如"国内短剧投流起量日预算估算区间 X–Y，来源：行业投放经验，标注估算"），AI 引用倾向带出处陈述。

### 6.3 推荐"可被引用的结论句"（供撰稿人直接使用/微调）
> "2026 年 AI 短剧投流推广分国内（巨量引擎、腾讯广告、快手磁力、抖音发行人计划、小红书、B站）与海外（Meta、TikTok for Business、Google Ads、Apple Search Ads）两大渠道群；投流 ROI 用 ROAS=投放带来的收入÷花费、CPA=花费÷转化数、回收周期=获客成本÷单用户日均收入 衡量，且必须和'平台分账收入模型（变现 ROI）'区分开——投流解决'花钱买量'，变现解决'内容怎么赚钱'。AI 短剧应以 AI 工具批量量产前 3 秒钩子素材并 A/B 测试，避开通不过审核、归因错误、无止损等 8 个烧钱陷阱。"

### 6.4 GEO/AEO 价值评级
- **投流推广 How-To 引用价值：高（A）**。"how to promote X / X 投流渠道 / 投流 ROI"是 AI 引擎高引用概率的查询形态；本篇作为"AI 短剧投流推广"主题聚类的 How-To 入口，被引用并向下分发到发布/横评/版权/出海 Spoke 的概率高，是整站 GEO 结构的关键节点。英文侧（出海段）几乎空白，引用价值尤高。

---

## 7. 外链规划（权威来源，附核实 URL）

> **纪律**：以下来源为行业公认权威/平台官方，**URL 均标注"待人工核实"**，严禁臆造精确链接；撰稿/上线前由人工用搜索确认最新官方地址后填入。不列 `ima.qq.com` 二次转引聚合卡为权威锚点。

| # | 来源 | 类型 | 核实 URL | 用途 |
|---|---|---|---|---|
| 1 | 巨量引擎官方（短剧行业投放 / 巨量学） | 平台官方文档 | 待人工核实（搜索"巨量引擎 短剧 投放 指南"） | H2 三 国内渠道口径 |
| 2 | 腾讯广告 / 腾讯广知（视频号短剧推广） | 平台官方文档 | 待人工核实（搜索"腾讯广告 短剧 投放"） | H2 三 国内渠道口径 |
| 3 | 快手磁力引擎（短剧投放） | 平台官方文档 | 待人工核实（搜索"快手磁力引擎 短剧"） | H2 三 国内渠道口径 |
| 4 | DataEye 短剧观察 / 短剧自习室 | 第三方行业数据 | 待人工核实（搜索"DataEye 短剧 投流"） | H2 二/五 投放数据与 ROI 基准（标注估算） |
| 5 | 广大大 / AppGrowing | 投放情报工具/数据 | 待人工核实（搜索"广大大 短剧 广告"） | H2 三/六 创意与渠道情报 |
| 6 | Meta for Business / TikTok for Business Help | 海外平台官方文档 | 待人工核实（搜索"Meta/TikTok for Business short drama ads"） | H2 四 海外渠道口径 |
| 7 | AppsFlyer / Singular blog（短剧 UA / ROAS） | 第三方方法论 | 待人工核实（搜索"short drama UA ROAS AppsFlyer"） | H2 五 海外 ROI/归因方法论 |

> 说明：上列来源分属"平台官方/第三方数据/海外官方/归因方法论"四类，可交叉佐证本篇渠道与 ROI 维度。所有 URL 待人工核实后填入，不臆造；行业数据均标注"估算"。中文 `ima.qq.com` 聚合卡为二次转引，**不列为权威外链锚点**（仅反映市场共识口径）。

---

## 8. 关键词蚕食防护（与发布流程类/变现类/平台类文章的意图切分）

本篇为**投流推广指南支撑文（Promotion / Paid-Traffic Spoke）**，归属"AI 短剧投流推广"聚类入口。须与以下站内文做**意图切分 + 双向互链**，否则将内耗排名：

### 8.1 与 `publish-and-monetize-vertical-drama`（头号边界风险）
- **边界**：该文 = "竖屏 AI 短剧**发布与变现全流程**（从分发到收入）"（偏"上传→审核→元数据→分发入口→三层变现"的供给侧闭环，即 how the platform distributes & pays you）；本篇 = "**AI 短剧投流推广完全指南**"（偏"花钱买流量、渠道、ROI、增长"，即 how to pour paid traffic to scale）。
- **切分方案**：本篇 H2 三/七 当读者需要"具体如何在某平台发布并拿到结算"时，**内链** publish-and-monetize-vertical-drama 做深读；该文谈"发布与结算操作"，本篇谈"投放增长与付费流量"。**需求侧 vs 供给侧**，互补闭环。
- **禁止**：本篇不展开单平台"上传→审核→分账到账"的操作细节（那是 publish-and-monetize 的职责），只做"投流前的发布准备 + 指路"。

### 8.2 与 `ai-short-drama-monetization-copyright`（变现与版权）
- **边界**：该文 = "商用授权、平台政策与**红线规避**"（合规向，偏"变现怎么合法"）；本篇 = 投流推广（增长向，偏"花钱买量"）。
- **做法**：本篇 H2 八"素材审核/平台 AI 标注政策/版权红线"只点结论 → 内链该文深读；该文链回本篇做"投流推广总览"。意图各异（合规 vs 增长），不重叠。

### 8.3 与 `global-ai-short-drama-monetization-roi-model`（出海变现 ROI 测算）
- **边界（二级风险，须显式区分）**：该文 = "出海变现**测算与分成模型**（欧美 vs 东南亚）"的**收入模型 ROI**（IAP/订阅/广告分账数学，即 how much you EARN）；本篇 H2 五 = **投流 ROI**（ROAS/CPA/CPI/回收周期，即 how much you SPEND to acquire a viewer/conversion）。**两者是漏斗两端，不可混用同一"ROI"词。**
- **做法**：本篇 H2 五 明确写"投流 ROI（投放回报）≠ 变现 ROI（收入模型，详见出海 ROI 测算文）"，并内链该文做收入模型深读；该文链回本篇做"全渠道投流总览"。互补，且词汇消歧防 cannibalization。

### 8.4 与 `lollipop-vs-reelshort-dramabox`（品牌横评含分成）
- **边界**：该文 = 三家**参数深读横评（含分成/工具）**；本篇 = 投流推广 How-To，把"平台选择"作为渠道决策的参考。
- **做法**：本篇 H2 三/四 提到"各渠道依托平台分成不同 → 看三家对比"内链该文；该文链回本篇做"投流推广总览"。广度 vs 深度，互补（注意：链**已存在**的 `lollipop-vs-reelshort-dramabox` L895，非 forbidden ① 新草稿）。

### 8.5 与 `ai-short-drama-localization` / `top-8-ai-short-drama-engines-2026` / `how-to-create-ai-short-drama` / `ai-short-drama-complete-guide` / `ai-short-drama-pillar-guide` / `ai-short-drama-industry-data-report-2026` / `ai-short-drama-faq-2026` / `ai-influencer-platform`
- 均为本篇**下游 Spoke**：本篇渠道/素材/步骤 → 内链导向（本地化前置、引擎选型、出片教程、全景 Hub、行业数据、FAQ、网红投放）。主词（投流推广）与上述（本地化/引擎/教程/全景/数据/FAQ/网红）意图各异，无重叠；形成 How-To→Spoke 内链网，共享权重而非竞争。

### 8.6 与 forbidden ①②③④⑤⑥⑦⑨⑩（待建，严禁链）
- **现状**：经 Grep 确认均不在 `blog.ts`（见 §5.2）。本篇**当前不内链任何 forbidden slug**（避免死链）；待其批量发布且 URL 可访问后，由 content-editor 在对应段落补互链（原则同 `brief-lollipop-vs-reelshort-dramabox-zh-interlink-2026-10-06.md` 时序前置）。主词唯一性：`AI短剧投流` 仅本篇使用。

### 8.7 主词唯一性总结
- `AI短剧投流` / `AI短剧 推广` 仅本篇使用；`publish-and-monetize-vertical-drama` 主词为"发布与变现流程"、`ai-short-drama-monetization-copyright` 主词为"变现与版权"、`global-ai-short-drama-monetization-roi-model` 主词为"出海变现 ROI 模型"、`lollipop-vs-reelshort-dramabox` 主词为品牌横评——五者意图互斥，不互相蚕食。

---

## 9. 优先级评分（内容排期参考）

| 因素 | 权重 | 本篇评分(0-100) | 说明 |
|---|---|---|---|
| 搜索量 | 20% | 65 | "投流/推广"高意图词，绝对量中（估算），长尾聚合可观 |
| 难度逆值 | 15% | 80 | 中文中立投流推广 How-To 蓝海，易排名 |
| 商业意图 | 20% | 90 | 直接导向投放/工具/入驻，意图极强 |
| Pillar 依赖 | 10% | 85 | "投流推广"聚类关键 Spoke，承上启下 |
| 交叉链接价值 | 10% | 95 | 可链 12+ 简中 Spoke（含发布/变现/出海/版权强相关），闭环强 |
| CTR 潜力 | 5% | 82 | "投流推广+2026+完全指南"标题提升点击 |
| 时效性 | 10% | 85 | 常青+2026 渠道/政策增量 |
| 趋势 | 10% | 90 | AI 短剧处爆发通道，投流需求上行 |
| **加权总分** | 100% | **~81** | 高优先级；建议尽快排期（注意 §5.2/§8.6 待建文时序） |

---

## 10. 发布参数建议（初稿）

### 10.1 Meta Title（3 备选，50–60 字符区间）
1. `AI 短剧投流推广完全指南（2026）：渠道、ROI 与避坑`
2. `AI 短剧怎么推广：投流渠道、ROI 计算与避坑指南 2026`
3. `2026 AI 短剧付费投放指南：全渠道、ROI 与 8 个避坑`

### 10.2 Meta Description（3 备选，150–160 中文字符）
1. `AI 短剧做好了却没播放？本指南讲清国内 6+海外 4 投流渠道、ROAS/CPA 怎么算、素材如何用 AI 量产，以及 8 个烧钱陷阱。中立、AI 短剧特化。`
2. `2026 AI 短剧投流推广完全指南：从投流前准备、全渠道对比、ROI 公式，到 7 步实操与避坑清单，帮你把预算花在刀刃上。`
3. `想给 AI 短剧买量增长？本文覆盖巨量/腾讯/快手/Meta/TikTok 等投流渠道、投流 ROI 与变现 ROI 的区别、素材 A/B 与避坑，一站搞定。`

### 10.3 结构化数据
- **Article / BlogPosting**：`headline`、`datePublished`、`dateModified`、`author`、`publisher`、`inLanguage: zh-CN`、`mainEntityOfPage`。
- **FAQPage**（H2 九 5 问）：JSON-LD `FAQPage`，对齐"AI短剧投流ROI怎么算""投流怎么不亏""投流渠道有哪些"等自然语言问法（GEO/AEO 高价值）。
- **HowTo**（可选，H2 七 7 步）：若正文用有序步骤块，可加 `HowTo` 结构化数据，提升富媒体展示。

### 10.4 上线前置清单
- [ ] 目标 slug `ai-short-drama-promotion-guide-2026` 已写入 `blog.ts` 且带 `titleZh`（语言版本核查通过）。
- [ ] §5.1 白名单 12 条内链全部就位、锚文本与路径正确（路径 `/blog/<slug>`，slug 以本次 Grep 行号对应为准）。
- [ ] §5.2 forbidden ①②③④⑤⑥⑦⑨⑩ **正文零出现**（死链防护）。
- [ ] H2 五 已显式区分"投流 ROI"与"变现 ROI（出海 ROI 测算文）"。
- [ ] FAQPage / HowTo 结构化数据已加；llms.txt 已将该文列入 "AI short drama promotion / paid traffic guide 2026" 互斥集。
- [ ] 外部链接 URL 已由人工核实填入（§7 待人工核实项），无臆造链接。
- [ ] 所有行业数字标注"估算"+ 来源。
- [ ] 与 `publish-and-monetize-vertical-drama`、`ai-short-drama-monetization-copyright`、`global-ai-short-drama-monetization-roi-model` 完成双向互链。
