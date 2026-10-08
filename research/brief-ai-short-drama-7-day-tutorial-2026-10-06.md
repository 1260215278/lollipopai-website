# SEO 研究 Brief: 零基础 7 天入门 AI 短剧教程（2026）（中文 How-To / Onboarding 教程型文章）

> 研究员：关宇霖（关键词研究 / 聚类策略师）
> 日期：2026-10-06
> 交付对象：撰稿人（中文 SEO How-To / 新手入门 Onboarding 长文）
> 发布渠道：lollipop.im 中文博客
> 内容类型：新手入门 / Onboarding 教程（按天排期的上手日程）—— 面向**完全没做过 AI 短剧的人**，讲清"7 天从 0 到出第一部成片"的明确日程、工具清单、第一个项目怎么做。内容讲清"每天做什么、用什么工具、产出什么、第 7 天拿到什么"。
> 关联选题：本系列第 ⑩ 篇（① what-is-ai-short-drama-2026 / ② reelshort-alternative-* / ③ best-ai-short-drama-platforms / ④ ai-short-drama-monetization / ⑤ ai-short-drama-overseas-compliance / ⑥ ai-influencer-monetization / ⑦ ai-short-drama-industry-trends-2026 / ⑧ ai-short-drama-promotion-guide-2026 之后）；归属"AI 短剧制作/新手入门"聚类的一个 Spoke。
> **建议 slug：`ai-short-drama-7-day-tutorial-2026`（全新 slug，非刷新——判定依据见 §0 与 §8；注意同聚类近重合 slug `first-vertical-drama-zero-experience` L605 必须做意图切分，详见 §8.2）**

---

## 0. 数据核实与来源说明（重要：撰稿人务必遵守）

- **站内语言版本核查方法（权威源）**：本仓库判定某 slug 是否有简中版，权威依据是 `src/app/data/blog.ts` 中 `BlogPost` 的 **`titleZh` 字段是否存在**（= 进入多语言子集 `multilangSubset.ts` 规则 = 有简中版）。**本仓库无 `dist/zh/blog` 构建产物目录**，不可依赖产物存在性。本 Brief §5 全部内链结论均以此方法**逐 slug 用 Grep 读取 `blog.ts` 的 `slug` + `titleZh` 行号确认**。
- **blog.ts 行号偏移提示**：所有行号均为**本次实时 Grep 结果**（2026-10-06），未抄旧行号。
- **本次 Grep 核查结论（关键）**：
  - **① 目标 slug 判定 = 全新 slug（不刷新任何已存在文）**。任务点名核查的 6 个已存在 slug 逐一读取（结果见下）后判定：无一为"按天排期的 onboarding 日程"型文章。
    - `ai-short-drama-complete-guide` L175 / titleZh L178「AI短剧制作全流程手册（2026）：从创意到变现的16个关键节点」= **制作全景 Hub**（16 节点/5 阶段），非日程型。
    - `how-to-create-ai-short-drama` L254 / titleZh L257「如何制作AI短剧：2026年完整新手指南」/ excerptZh L259「从零开始的AI短剧制作新手指南——涵盖故事构思、AI剧本生成、角色设计、视频制作、配音到发布的完整流程」= **按"制作环节"组织的完整新手指南**（story→script→character→video→dub→publish），**非按天排期**，与本篇"Day1–Day7 每日任务 + 工具清单 + 当日产出 + 第 7 天成片"的信息架构不同。
    - `ai-script-storyboard` L80 / titleZh L83「AI如何辅助剧本构思和分镜设计？2026实操指南」= 剧本+分镜单环节。
    - `script-to-screen-pipeline` L561 / titleZh L564「从一句话创意到成片：AI 短剧流水线分步拆解」= 流水线分步（按阶段，非按天）。
    - `ai-video-storytelling` L371 / titleZh L374「AI视频故事创作完整流程指南：从创意到完整AI短剧（2026）」= 故事化全流程。
    - `ai-scriptwriting-micro-dramas-prompts` L733 / titleZh L736「AI 短剧剧本创作：15 个高转化的 3 秒钩子提示词」= 钩子提示词单环节。
    - **结论**：上述 6 篇均为"按主题/环节"组织的教程或 Hub，**无一篇是"7 天按天排期 onboarding 日程"**。本篇独占"Day1–Day7 节奏 + 每日任务 + 第一个项目"入口，应**新建 slug**，不与现有文蚕食。
  - **② 任务外补充核查（重要）**：本研究员额外 Grep 到 `first-vertical-drama-zero-experience` L605 / titleZh L608「零制作经验完成第一部竖屏 AI 短剧」/ excerptZh L610「七天、无团队的路径，从空白页走到一部两分钟竖屏剧上线。刻意把范围压到最小——完成比惊艳更重要。」——**这是字面与本篇（"零基础 7 天 / 第一部成片"）重合度最高的已存在 slug**。它存在于库（非 forbidden），本篇**不刷新它、也不新建近重复 slug 抢它排名**，而是通过 §8.2 的**意图切分 + 双向互链**共存：该文 = "最小范围、完成>完美的 2 分钟极简首剧快路径"；本篇 = "结构化 7 天课程（完整首部短剧 + 每日工具清单 + 当日产出 + 第 7 天成片与复盘）"。二者信息架构不同，可互补不互抢。
  - **③ Forbidden slug（本批未发布草稿/待定，正文严禁链）全部确认不在 `blog.ts`**：逐条以 `slug: "..."` 精确 Grep ① `reelshort-alternative-lollipop-vs-reelshort-dramabox-2026`、② `what-is-ai-short-drama-2026`、③ `best-ai-short-drama-platforms`、④ `ai-short-drama-monetization`（精确 slug，不含 `-copyright`）、⑤ `ai-short-drama-overseas-compliance`、⑥ `ai-influencer-monetization`、⑦ `ai-short-drama-industry-trends-2026`、⑧ `ai-short-drama-promotion-guide-2026` 均**无匹配**（注：blog.ts 中存在语义相近但 slug 不同的 `ai-short-drama-monetization-copyright` L855/L858、`ai-short-drama-industry-data-report-2026` L1372/L1375、`ai-influencer-platform` L914/L917、`lollipop-vs-reelshort-dramabox` L895/L898、`what-is-ai-drama` L235/L238、`best-ai-storytelling-platforms` L314/L317，均属不同 slug，不计入 forbidden）。上述 forbidden slug 当前 `URL 不可访问`、`titleZh` 缺失，**正文严禁链**，只列入"待建内链"待批量接回。
  - **④ ⑨ `web-novel-to-ai-short-drama-pipeline` 正确排除出 forbidden、列入白名单**：该 slug **已存在**（blog.ts L814 / titleZh L817「从网络小说到 AI 短剧：IP 改编五步流水线」），属可链白名单，**非 forbidden**（任务点名确认）。
  - **⑤ 可链白名单 slug 全部确认带 `titleZh`**（行号见 §5.1，共 19 条，含 ⑨ 网文改编）。其中任务点名的 `lollipop-vs-reelshort-dramabox` **已存在**（L895/L898，非 forbidden ① 的新草稿 slug），可作为简中内链正常使用；forbidden ① `reelshort-alternative-lollipop-vs-reelshort-dramabox-2026` 为**不同 slug**，不在库。
  - **⑥ 目标 slug `ai-short-drama-7-day-tutorial-2026` 已确认不在 `blog.ts`**（无匹配），可安全使用、不与现有 slug 冲突。
- **市场数据口径**：下文所有工具/成本/产能数字均来自**公开行业经验与第三方估算**（Lollipop Drama 公开基准、DataEye 短剧观察、短剧自习室、各引擎官网文档等），非一手审计数据；引用请**标注来源 + "估算"**，不臆造精确数字。
- **检索偏差提示**：中文检索大量命中腾讯 `ima.qq.com` "知识库"聚合卡（二次转引），宜反映市场共识口径但**不宜作为权威外链锚点**；真·权威来源为 §7 列出的平台官网/媒体原文。

---

## 1. SEO 基础

### 1.1 主关键词（Primary Keyword）

- **主关键词：`AI短剧7天入门教程`**（首选，最贴合"零基础 7 天从 0 到出第一部成片"的 Onboarding 定位，且天然区别于"完整制作指南（按环节）"与"极简首剧快路径"，意图最精准）
- **H1 / 标题主表达（含时效与框架）**：`零基础 7 天入门 AI 短剧教程（2026）：每天做什么、用什么工具、第 7 天拿到什么`
- **搜索量（估算）**：中文搜索引擎（百度/Google 中文/微信搜一搜/B站）月搜索量**中，估算 400–1,500 次/月**（"AI短剧教程/新手/怎么入门/7天"随 AI 短剧爆发呈上升通道；"7天学会X"是强教程型长尾；无 Ahrefs/SEMrush 直连，标注"估算"）。长尾聚合（新手教程/零基础/第一天做什么/计划表）整体可触达 2,000–5,000 次/月。
- **竞争难度**：**中低 → 中**。SERP 现有结果以"平台官方新手引导、知乎/小红书零散经验、B站/抖音视频教程、课程软文"为主，**几乎无一篇"结构化 7 天按天排期 + 每日工具清单 + 当日产出 + 第 7 天成片复盘"的中文 Onboarding 长文**——存在蓝海窗口。
- **商业意图等级**：**中高（Commercial-Investigation / How-To-Onboard）**——搜索"7天入门/零基础教程"的人处于"想动手但不知从哪天开始、怕踩坑"阶段，正是 Lollipop Drama 要转化的目标新手。
- **选择理由**：
  1. 直接命中本篇"零基础 7 天入门 Onboarding 教程"定位与任务指定主词；
  2. 与 `how-to-create-ai-short-drama`（按环节的新手指南）、`first-vertical-drama-zero-experience`（极简首剧快路径）、`ai-short-drama-complete-guide`（全景 Hub）做**"按天排期 onboarding（本篇）" vs "按环节讲解" vs "极简快路径" vs "全景 Hub"** 的清晰意图切分后可独占"AI短剧7天入门教程"入口；
  3. 是 AI 引擎（豆包/文心/Perplexity）回答"零基础怎么学 AI 短剧 / 7 天能做出 AI 短剧吗 / 新手第一天做什么"的**首选引用形态**（GEO/AEO 高价值，见 §6）；
  4. 蓝海——中文无"中立、按天排期、带工具清单与当日产出"的 7 天 AI 短剧 Onboarding 单篇。

> **备选主词 / 语义表达**：`零基础AI短剧教程`、`7天学会AI短剧`、`从零开始做AI短剧7天`、`AI短剧新手7天计划`、`AI短剧怎么入门` 作语义变体与 H2 锚点，避免只押一个词。H1 可微调为 `零基础怎么学 AI 短剧（2026）：7 天入门教程，每天任务+工具+产出` 以兼顾"7天入门教程"精准词与"零基础怎么学"口语词。

### 1.2 语义变体（Semantic Variants，5 个）
1. `零基础AI短剧教程`（零基础型主表达）
2. `7天学会AI短剧`（日程型变体）
3. `从零开始做AI短剧`（口语 How-To 变体）
4. `AI短剧新手入门`（新手导向变体）
5. `AI短剧怎么入门`（How-To 长变体）

### 1.3 长尾关键词（Long-tail，12 个，附意图 / 竞争度 / 优先级）

| # | 长尾词 | 搜索意图 | 竞争度 | 优先级 | 对应段落 / 内链去向 |
|---|---|---|---|---|---|
| 1 | AI短剧7天入门教程 | How-To/信息（主词） | 中（缺按天排期单篇） | 高 | H1 + H2 一 |
| 2 | 零基础怎么学AI短剧 | How-To | 中低 | 高 | H2 一/二 起点 |
| 3 | 7天做出第一部AI短剧 | How-To/目标 | 中 | 高 | H2 一 + H2 八（Day7 成片） |
| 4 | AI短剧新手第一天做什么 | How-To | 低–中 | 高 | H2 二 Day1 → 内链 /blog/ai-scriptwriting-micro-dramas-prompts（钩子） |
| 5 | AI短剧脚本怎么写新手 | How-To | 中 | 高 | H2 三 Day2 → 内链 /blog/how-to-create-ai-short-drama、/blog/ai-script-storyboard |
| 6 | AI短剧角色分镜怎么做 | How-To | 中 | 中高 | H2 四 Day3 → 内链 /blog/ai-script-storyboard、/blog/ai-drama-character-consistency |
| 7 | 用什么工具生成AI短剧 | How-To/信息 | 中 | 高 | H2 五 Day4 → 内链 /blog/top-8-ai-short-drama-engines-2026 |
| 8 | AI短剧怎么剪辑配音 | How-To | 中低 | 中高 | H2 六 Day5 |
| 9 | 完全没有经验能做AI短剧吗 | 信息/How-To | 低 | 中高 | H2 一/二 → 内链 /blog/first-vertical-drama-zero-experience（极简首剧路径） |
| 10 | AI短剧做好了怎么发布 | How-To | 中 | 中高 | H2 八 Day7 → 内链 /blog/publish-and-monetize-vertical-drama |
| 11 | AI短剧7天计划表 | 信息/排期 | 低 | 中 | H2 九 Checklist（7 天总表） |
| 12 | AI短剧新手避坑 | How-To/信息 | 低–中 | 中 | H2 九 FAQ + Checklist → 内链 /blog/ai-short-drama-monetization-copyright、/blog/ai-short-drama-faq-2026 |

### 1.4 搜索意图（Search Intent）
- **主导意图**：Commercial-Investigation / How-To-Onboard（"我零基础，想用 7 天动手做出第一部 AI 短剧，每天该干什么、用什么工具、最后能拿到什么"）。
- **次级意图**：信息型（7 天是否能学会、每日任务清单、工具清单）+ 避坑型（"新手容易踩什么坑"）。
- **不应覆盖的意图**："按制作环节深讲每个环节"（→ `how-to-create-ai-short-drama`）、"极简 2 分钟首剧快路径"（→ `first-vertical-drama-zero-experience`）、"制作全景 Hub"（→ `ai-short-drama-complete-guide`）、"发布与分账流程"（→ `publish-and-monetize-vertical-drama`）、"版权合规深读"（→ `ai-short-drama-monetization-copyright`）—— 这些交由对应 Spoke 承接，本篇只做指路，不展开。

### 1.5 目标字数
- **建议 2,800–3,800 中文字**（Onboarding 教程型，需覆盖 9 个 H2 + 7 天日程表 + 每日工具清单 + 第一个项目 walkthrough + Checklist + FAQ）。下限保覆盖，上限防稀释；"Day1 选题 / Day4 生成 / Day7 发布复盘"三段是差异化重点，宜给足篇幅。

### 1.6 精选摘要（Featured Snippet）机会
- **高概率夺取"段落型/列表型"精选摘要**的问题：
  - "零基础 7 天能学会 AI 短剧吗？" → 给一句直接答案（≤40 字）+ 7 天总览小表（H2 一）。
  - "7 天做 AI 短剧每天做什么？" → 给 7 天任务总表（Day1–Day7 各一行，H2 二~八 浓缩）。
  - "新手第一天该做什么？" → 给 Day1 三件事要点（H2 二）。
- 做法：每个问题段首用 ≤40 字直接答案句，紧跟干净 Markdown 表/有序列表，便于 Google/百度摘要抓取。

---

## 2. 竞品格局分析（Top 10，按查询分语种）

### 2.1 中文 SERP（搜索"AI短剧教程 / 零基础AI短剧 / 7天学AI短剧 / 新手怎么做AI短剧"）Top 10 构成
1. **Lollipop Drama / ReelShort / DramaBox 官方新手引导** —— 平台内的"如何开始/创作中心"教程（平台闭环向，偏自家工具）。
2. **知乎 / 小红书经验贴** —— "零基础怎么学 AI 短剧""新手第一天做什么"（零散 UGC，质量参差，多偏工具测评或碎碎念）。
3. **B站 / 抖音 视频教程** —— "10 分钟带你做一部 AI 短剧""AI 短剧保姆级教程"（视频向，无结构化 7 天排期，难检索、难引用）。
4. **公众号 / 人人都是产品经理** —— AI 短剧入门长文（偏行业科普/工具罗列，非按天排期）。
5. **知识付费课程落地页** —— "7 天 AI 短剧训练营""3 天学会"（商业软文，立场偏售课，非中立）。
6. **AI 工具官网文档（Runway / Kling / 可灵 / 即梦）** —— 单工具使用教程（非"从 0 到成片"的整合 Onboarding）。
7. **短剧自习室 / DataEye 短剧观察** —— 行业数据与案例（非新手操作教程）。
8. **百度百家号 / 头条 搬运文** —— "AI 短剧赚钱吗 / 新手怎么入行"（流量文，浅、无方法论）。
9. **编剧 / 影视教育号** —— 传统短片/剧本教学（非 AI 生成、非竖屏短剧特化）。
10. **AI 绘画/视频社区（小红书创作学院、B站创作中心）** —— 通用 AI 创作入门（不特化短剧）。

### 2.2 英文 SERP（搜索 "how to make AI short drama for beginners / 7 day AI short film tutorial / AI short drama course 2026"）构成
1. **Runway / Kling / Pika blog & docs** —— 单工具 AI 视频教程（非"从剧本到成片"整合）。
2. **YouTube 教程（个人创作者）** —— "I made an AI short film in 7 days"（视频向，零散，难检索引用）。
3. **Udemy / Skillshare 课程页** —— "AI Video Creation Course"（付费课，软文向）。
4. **Reddit / Quora** —— "how to start making AI short films"（UGC 讨论，零散）。
5. **AI 影视媒体（Tom's Guide / Futurism）** —— AI 视频工具盘点（非 Onboarding 教程）。
- 英文侧**几乎没有"structured 7-day beginner onboarding for AI short drama"中立长文**，本篇出海引用价值高（见 §6）。

### 2.3 语言构成结论
- 中文侧以**平台引导 + 零散 UGC + 视频教程 + 课程软文 + 工具文档**为主，**缺一篇"中立、按天排期、带工具清单与当日产出、首项目 walkthrough"的 7 天 Onboarding 长文**。
- 英文侧以**单工具文档 + 视频教程 + 付费课**为主，缺结构化 7 天新手课程。
- 结论：**双向蓝海**，尤其"AI短剧7天入门教程"（按天排期 + Onboarding 交集）几乎无人占领。

### 2.4 内容差距（我们的机会）
1. 现有结果**不按天排期**（多按工具/环节罗列，或视频碎讲），缺"Day1–Day7 每日任务 + 工具 + 产出"的结构化日程。
2. 现有结果**不特化 AI 短剧竖屏生产**（多套用通用 AI 视频/传统编剧模板），缺"钩子→分镜→图生视频→配音→发布"的 AI 短剧特化链路。
3. 缺**第一个项目的端到端 walkthrough**（读者跟着做就能在第 7 天拿到成片）。
4. 缺与**制作/发布/变现/版权/引擎/极简首剧**文章的**闭环互链**（读者看完仍不知"下一步去哪"）。
5. 缺**新手避坑清单**（选题过大、钩子不痛、角色漂移、生成翻车、发布踩红线）。

### 2.5 差异化策略（独特定位）
- **按天排期的 Onboarding 结构**（Day1–Day7，每日"任务 + 工具 + 产出"）+ **第一个项目 walkthrough**（同一题材贯穿 7 天）。
- **AI 短剧特化链路**（钩子脚本 → 角色分镜 → 图生视频 → 配音剪辑 → 发布复盘）。
- **工具清单逐日给出**（不堆砌，只给当天该用的），降低新手决策成本。
- **闭环互链**到站内核发/极简首剧/引擎/发布/版权/FAQ 文，形成 Hub→Spoke 网络（见 §5/§8）。

---

## 3. 搜索意图分类与段落规划

| 意图类型 | 代表查询 | 落点段落（H2） | 内容形态 |
|---|---|---|---|
| How-To-Onboard（主） | AI短剧7天入门教程 / 零基础怎么学 | H2 一、二~八 | 概念 + 7 天日程 |
| 信息/日程 | 7天做出第一部AI短剧 / 7天计划表 | H2 一、九 | 7 天总表 + Checklist |
| How-To/环节 | 新手第一天做什么 / 脚本怎么写 / 角色分镜 / 生成工具 | H2 二~五 | 每日任务 + 工具清单 |
| How-To/产出 | 怎么剪辑配音 / 做好了怎么发布 | H2 六、八 | 操作要点 |
| 避坑/承接 | 新手避坑 / 发布流程 / 版权 | H2 九 + 各 H2 内链 | 指路 + FAQ |

---

## 4. 推荐文章结构大纲（9 个 H2，含 Hook 的 APP 公式）

> **开篇 Hook（APP 公式）**：**A（Attention 痛点）**——"想做 AI 短剧，但打开工具就懵：第一步该干嘛？怕搞一周啥也没有。" **P（Problem 问题）**——"90% 的新手卡在'不知道按什么顺序学'：今天学脚本、明天学生成，最后没有一个完整项目落地，更没成片可发。" **P（Proof 证据/方法）**——"本教程用 9 节给你一份 7 天日程：每天做什么、用什么工具、产出什么，第 7 天你手里会有一部能发的竖屏 AI 短剧。全程零基础友好、AI 短剧特化。"

- **H2 一、零基础 7 天能做出 AI 短剧吗（概念 + 为什么 7 天可行 + 7 天总览）**
  - 要点：AI 短剧 = 用 AI 生成（非真人拍摄）的竖屏剧本化短内容；为什么 7 天对纯新手可行（工具把脚本/分镜/生成/配音门槛打下来，完成>完美）；给"7 天总览表"（Day1 选题→Day7 发布）；一句话定义 + 直接答案句（抢 Featured Snippet）。内链 `first-vertical-drama-zero-experience`（极简首剧路径）、`ai-short-drama-complete-guide`（全景 Hub）。
- **H2 二、Day 1 选题材与定目标（第一天做什么）**
  - 要点：选 1 个高钩子、易生成的题材（逆袭/甜宠/复仇等，参考爆款）；定"第 7 天要交的差"（1 部 1–2 分钟竖屏剧、3–5 集或单集）；工具清单（选题参考：站内题材热度/爆款拆解文）；产出=题材卡 + 一句话 logline。内链 `ai-short-drama-industry-data-report-2026`（题材热度）、`ai-scriptwriting-micro-dramas-prompts`（钩子方向）。
- **H2 三、Day 2 写脚本与钩子（第二天做什么）**
  - 要点：用 AI 写 3 秒钩子 + 每集结构（前 3 秒冲突→中段→结尾悬念）；控制单集 60 秒；工具清单（AI 编剧/提示词）；产出=分集大纲 + 第 1 集剧本。内链 `how-to-create-ai-short-drama`（剧本技巧）、`ai-script-storyboard`（分镜衔接）、`ai-scriptwriting-micro-dramas-prompts`（15 个钩子提示词）。
- **H2 四、Day 3 角色与分镜（第三天做什么）**
  - 要点：建角色圣经（参考图/人设标签）保一致性；画每集分镜（景别/动作/镜头运动）；工具清单（角色一致性工具/分镜）；产出=角色设定表 + 分镜表。内链 `ai-script-storyboard`（分镜深读）、`ai-drama-character-consistency`（角色一致性）、`ai-video-storytelling`（故事节奏）。
- **H2 五、Day 4 生成画面（第四天做什么）**
  - 要点：以角色为锚点图生视频；逐镜生成、留优汰劣；工具清单（八大引擎选型）；产出=粗剪素材库。内链 `top-8-ai-short-drama-engines-2026`（引擎选型）、`script-to-screen-pipeline`（流水线）、`ai-short-drama-complete-guide`（制作全景）。
- **H2 六、Day 5 剪辑与配音（第五天做什么）**
  - 要点：粗剪→精剪（节奏/转场）；AI 配音/对口型；加 BGM 与音效；工具清单（剪辑/配音）；产出=带声画的第一版成片。内链 `ai-short-drama-monetization-copyright`（音乐授权红线）、`ai-short-drama-localization`（后续出海配音）。
- **H2 七、Day 6 预览与修改（第六天做什么）**
  - 要点：自审清单（角色漂移/画质/节奏/钩子强度）；找 3 个朋友预览收反馈；修典型问题（手部/动作/多人互动）；产出=修改后成片 v2。内链 `ai-drama-character-consistency`、`ai-short-drama-faq-2026`（常见问题）。
- **H2 八、Day 7 发布与复盘（第七天做什么）**
  - 要点：竖屏适配/元数据/选平台分发；记录数据做复盘（完播/钩子留存）；下一步迭代方向；产出=**上线的一部 AI 短剧 + 复盘笔记**。内链 `publish-and-monetize-vertical-drama`（发布与变现流程）、`ai-short-drama-monetization-copyright`（发布合规红线）、`ai-influencer-platform`（角色 IP 化）。
- **H2 九、7 天入门 Checklist + 内链承接（FAQ）**
  - 要点：一页式 7 天 Checklist（每天任务✓）；5 条 FAQ（用 FAQPage 结构化数据）；向下承接制作/极简首剧/发布/变现/版权/引擎/FAQ 文，形成闭环。内链 `ai-short-drama-pillar-guide`（Hub）、`ai-short-drama-faq-2026`、`first-vertical-drama-zero-experience`。

---

## 5. 内链规划

### 5.1 可链内链清单（锚文本 + 路径 + 简中版验证结论 + 行号 + 用途）

> **核查方法**：逐 slug 读取 `src/app/data/blog.ts`，以 `titleZh` 字段存在性判定简中版（本仓库无 `dist/zh/blog` 构建产物，故不依赖 dist）。行号见各条（本次实时 Grep 2026-10-06）。

| # | 锚文本建议 | 路径 | 简中版验证（blog.ts） | 行号 | 用途 |
|---|---|---|---|---|---|
| 1 | AI 短剧制作完全指南（全景 Hub） | /blog/ai-short-drama-pillar-guide | ✅ 已验证（titleZh"AI 短剧制作完全指南：从剧本到变现的 2026 全景"） | slug L1352 / titleZh L1355 | H2 一/九 向下承接 Hub |
| 2 | 如何制作 AI 短剧（新手指南） | /blog/how-to-create-ai-short-drama | ✅ 已验证（titleZh"如何制作AI短剧：2026年完整新手指南"） | slug L254 / titleZh L257 | H2 三/四 按环节深读（本篇=按天，它=按环节，互补） |
| 3 | 零制作经验完成第一部竖屏 AI 短剧 | /blog/first-vertical-drama-zero-experience | ✅ 已验证（titleZh"零制作经验完成第一部竖屏 AI 短剧"） | slug L605 / titleZh L608 | H2 一/九 极简首剧快路径（近重合，须做 §8.2 意图切分） |
| 4 | AI短剧制作全流程手册（2026） | /blog/ai-short-drama-complete-guide | ✅ 已验证（titleZh"AI短剧制作全流程手册（2026）：从创意到变现的16个关键节点"） | slug L175 / titleZh L178 | H2 五 制作全景衔接 |
| 5 | 从一句话创意到成片：AI 短剧流水线分步拆解 | /blog/script-to-screen-pipeline | ✅ 已验证（titleZh"从一句话创意到成片：AI 短剧流水线分步拆解"） | slug L561 / titleZh L564 | H2 五 流水线衔接 |
| 6 | AI 如何辅助剧本构思和分镜设计 | /blog/ai-script-storyboard | ✅ 已验证（titleZh"AI如何辅助剧本构思和分镜设计？2026实操指南"） | slug L80 / titleZh L83 | H2 三/四 分镜深读 |
| 7 | AI 短剧剧本创作：15 个高转化的 3 秒钩子提示词 | /blog/ai-scriptwriting-micro-dramas-prompts | ✅ 已验证（titleZh"AI 短剧剧本创作：15 个高转化的 3 秒钩子提示词"） | slug L733 / titleZh L736 | H2 二/三 钩子提示词 |
| 8 | AI 视频故事创作完整流程指南 | /blog/ai-video-storytelling | ✅ 已验证（titleZh"AI视频故事创作完整流程指南：从创意到完整AI短剧（2026）"） | slug L371 / titleZh L374 | H2 四 故事节奏 |
| 9 | 2026 年八大 AI 短剧引擎 | /blog/top-8-ai-short-drama-engines-2026 | ✅ 已验证（titleZh"2026 年八大 AI 短剧引擎：Lollipop Drama vs Runway vs Kling vs Pika"） | slug L693 / titleZh L696 | H2 五 生成工具选型 |
| 10 | AI 短剧角色一致性完全指南（2026） | /blog/ai-drama-character-consistency | ✅ 已验证（titleZh"AI短剧角色一致性完全指南（2026）：跨10集锁定角色外貌、声音与造型"） | slug L450 / titleZh L453 | H2 四/七 角色一致性/防漂移 |
| 11 | 竖屏 AI 短剧发布与变现全流程 | /blog/publish-and-monetize-vertical-drama | ✅ 已验证（titleZh"竖屏 AI 短剧发布与变现全流程：从分发到收入"） | slug L539 / titleZh L542 | H2 八 发布与结算流程（本篇只指路） |
| 12 | AI 短剧变现与版权：商用授权与红线 | /blog/ai-short-drama-monetization-copyright | ✅ 已验证（titleZh"AI 短剧变现与版权：商用授权、平台政策与红线规避"） | slug L855 / titleZh L858 | H2 六/八 音乐授权/发布合规红线深读 |
| 13 | AI 短剧本地化：翻译/配音/对口型 | /blog/ai-short-drama-localization | ✅ 已验证（titleZh"AI 短剧本地化：如何用 AI 自动翻译、配音并对口型到 20+ 语言"） | slug L753 / titleZh L756 | H2 六/八 后续出海配音前置 |
| 14 | Lollipop Drama vs ReelShort vs DramaBox（2026）分成对比 | /blog/lollipop-vs-reelshort-dramabox | ✅ 已验证（titleZh"Lollipop Drama vs ReelShort vs DramaBox（2026）：分成、AI工具与内容模式对比"） | slug L895 / titleZh L898 | H2 八 平台选择/分成深读（注：已存在 slug，非 forbidden ① 新草稿） |
| 15 | AI网红平台：AI 生成人物变现 | /blog/ai-influencer-platform | ✅ 已验证（titleZh"AI网红平台：Lollipop Drama 如何在2026年变现AI生成人物"） | slug L914 / titleZh L917 | H2 八 角色 IP 化/网红化视角 |
| 16 | 2026 出海 AI 短剧变现测算与分成模型 | /blog/global-ai-short-drama-monetization-roi-model | ✅ 已验证（titleZh"2026 出海AI短剧变现测算与分成模型：欧美 vs 东南亚实操指南"） | slug L1328 / titleZh L1331 | H2 八/九 出海变现 ROI 深读 |
| 17 | 2026 AI 短剧行业数据报告（成本/产能/变现基准） | /blog/ai-short-drama-industry-data-report-2026 | ✅ 已验证（titleZh"2026 AI 短剧行业数据报告：成本、产能与变现基准"） | slug L1372 / titleZh L1375 | H2 二 题材热度/成本产能基准 |
| 18 | AI 短剧制作常见问题全解（60 问） | /blog/ai-short-drama-faq-2026 | ✅ 已验证（titleZh"AI 短剧制作常见问题全解：从工具选择到变现的 60 问"） | slug L1392 / titleZh L1395 | H2 七/九 FAQ 互补 |
| 19 | 从网络小说到 AI 短剧：IP 改编五步流水线 | /blog/web-novel-to-ai-short-drama-pipeline | ✅ 已验证（titleZh"从网络小说到 AI 短剧：IP 改编五步流水线"） | slug L814 / titleZh L817 | H2 二 选题延伸（拿网文 IP 做首剧的备选路径；**⑨ 非 forbidden，正确列入白名单**） |

> **语言版本核查结论（关键）**：任务点名与聚类强相关的白名单 slug（ai-short-drama-pillar-guide / how-to-create-ai-short-drama / first-vertical-drama-zero-experience / ai-short-drama-complete-guide / script-to-screen-pipeline / ai-script-storyboard / ai-scriptwriting-micro-dramas-prompts / ai-video-storytelling / top-8-ai-short-drama-engines-2026 / ai-drama-character-consistency / publish-and-monetize-vertical-drama / ai-short-drama-monetization-copyright / ai-short-drama-localization / lollipop-vs-reelshort-dramabox / ai-influencer-platform / global-ai-short-drama-monetization-roi-model / ai-short-drama-industry-data-report-2026 / ai-short-drama-faq-2026 / web-novel-to-ai-short-drama-pipeline）**全部确认存在简中版**（titleZh 已验证，行号见上表），可作为简中内链正常使用；白名单合计 **19 条**，全部 titleZh 验证通过。
>
> **⚠️ 特别提示（与任务描述的出入）**：forbidden ① 为 `reelshort-alternative-lollipop-vs-reelshort-dramabox-2026`（新草稿 slug，**不在 blog.ts**），而**已存在的**是 `lollipop-vs-reelshort-dramabox`（L895/L898，不同 slug）。二者 slug 不同，本文**只链已存在的后者**，严禁链 forbidden ① 新草稿 slug，避免死链。另：本篇同聚类近重合 slug `first-vertical-drama-zero-experience`（L605）**已存在、非 forbidden**，须做 §8.2 意图切分。

### 5.2 待建 forbidden slug 清单（①②③④⑤⑥⑦⑧，标注"待批量发布接回，正文严禁链"；⑨ 正确排除、⑩ 为自身新 slug）

> 经**逐 slug 以 `slug: "..."` 精确 Grep `blog.ts` 确认以下 slug 均不存在（无 titleZh、URL 不可访问）**，正文严禁链，仅在此登记待批量接回。

| 编号 | forbidden slug | Grep 结论 | 处理 |
|---|---|---|---|
| ① | `reelshort-alternative-lollipop-vs-reelshort-dramabox-2026` | 不在 blog.ts（无匹配；注意已存在的是 `lollipop-vs-reelshort-dramabox` L895，不同 slug） | 待发布接回；正文严禁链 |
| ② | `what-is-ai-short-drama-2026` | 不在 blog.ts（无匹配；注意已存在的是 `what-is-ai-drama` L235/L238，不同 slug） | 待发布接回；正文严禁链 |
| ③ | `best-ai-short-drama-platforms` | 不在 blog.ts（仅语义相近 `best-ai-storytelling-platforms` L314/L317、`top-8-ai-short-drama-engines-2026` L693 存在） | 待发布接回；正文严禁链 |
| ④ | `ai-short-drama-monetization` | 不在 blog.ts（精确 slug 无匹配；仅 `ai-short-drama-monetization-copyright` L855 存在，不同 slug） | 待发布接回；正文严禁链 |
| ⑤ | `ai-short-drama-overseas-compliance` | 不在 blog.ts（无匹配） | 待发布接回；正文严禁链 |
| ⑥ | `ai-influencer-monetization` | 不在 blog.ts（仅 `ai-influencer-platform` L914 存在，不同 slug） | 待发布接回；正文严禁链 |
| ⑦ | `ai-short-drama-industry-trends-2026` | 不在 blog.ts（仅 `ai-short-drama-industry-data-report-2026` L1372 存在，不同 slug） | 待发布接回；正文严禁链 |
| ⑧ | `ai-short-drama-promotion-guide-2026` | 不在 blog.ts（无匹配；刚写完初稿但还未入 blog.ts） | 待发布接回；正文严禁链 |
| ⑨ | `web-novel-to-ai-short-drama-pipeline` | **已存在（L814/L817），正确排除出 forbidden、列入 §5.1 白名单第 19 条** | 可链，非 forbidden |
| ⑩ | 本篇自身 slug `ai-short-drama-7-day-tutorial-2026` | 不在 blog.ts（新 slug，待写入） | 发布后自动可链自身 |

> **正文纪律**：本篇正文**仅链 §5.1 白名单 19 条**；任何 forbidden slug（①②③④⑤⑥⑦⑧）一律不链，避免死链。待其批量发布且 URL 可访问后，由 content-editor 在对应段落补互链（时序前置，原则同 `brief-lollipop-vs-reelshort-dramabox-zh-interlink-2026-10-06.md`）。

---

## 6. GEO / AEO 适配建议

### 6.1 核心目标
让豆包 / 文心 / Perplexity / ChatGPT 在回答"零基础怎么学 AI 短剧 / 7 天能做出 AI 短剧吗 / 新手第一天做什么 / AI 短剧 7 天教程"时，**优先引用本篇并给出清晰结论**。

### 6.2 具体做法
1. **直接答案句前置**：H2 一/二/三/八 每段首用 ≤40 字结论句 + 干净 Markdown 表（7 天总览表、每日任务表），AI 引用偏好"句子级结论 + 结构化表"。
2. **7 天日程总表**：H2 一 给 7 天一行总表（Day/任务/产出），便于解析与引用。
3. **每日任务块**：H2 二~八 每 Day 用"任务 + 工具 + 产出"三栏小表，AI 引用偏好步骤/清单型结论。
4. **FAQPage 结构化数据**：H2 九 5 问用 JSON-LD `FAQPage`，对齐"零基础7天能学会吗""新手第一天做什么""AI短剧新手避坑"等自然语言问法。
5. **实体消歧 + 互链**：首次同屏出现 `how-to-create-ai-short-drama`（按环节指南）、`first-vertical-drama-zero-experience`（极简首剧）、`ai-short-drama-complete-guide`（全景 Hub）、`publish-and-monetize-vertical-drama`（发布变现）时互链并各自限定范围，明确"本篇=按天 onboarding 课程；它=按环节深讲 / 极简快路径 / 全景 / 发布结算"。
6. **llms.txt 对齐（互斥聚类）**：本篇列入 **"AI short drama 7-day beginner tutorial / onboarding 2026"** 引用集；`how-to-create-ai-short-drama` → "create AI short drama from scratch (by stage)"；`first-vertical-drama-zero-experience` → "minimal first drama in 7 days"；`ai-short-drama-complete-guide` → "full-process Hub"；`publish-and-monetize-vertical-drama` → "publish & monetize"。各集互斥，避免同一查询下站内自相竞争。
7. **数据可溯**：每个关键数字（如单集 7–11 小时、成本降约 99.9%）就近附来源 + "估算"，AI 引用倾向带出处陈述。

### 6.3 推荐"可被引用的结论句"（供撰稿人直接使用/微调）
> "零基础也能用 7 天做出第一部 AI 短剧：Day1 选题材定 logline、Day2 写 3 秒钩子脚本、Day3 建角色圣经与分镜、Day4 以角色为锚点图生视频、Day5 剪辑配音、Day6 预览修改、Day7 发布复盘——每天只做'任务+工具+产出'三件事，第 7 天你手里会有一部能发的竖屏 AI 短剧。AI 把'从空白页到成片'的周期从数月压到一周，关键是完成>完美，先交第一部再迭代。"

### 6.4 GEO/AEO 价值评级
- **7 天入门 Onboarding 引用价值：高（A）**。"how to learn X in 7 days / 零基础怎么学 AI 短剧 / 7 天能做出 AI 短剧吗"是 AI 引擎高引用概率的查询形态；本篇作为"AI 短剧 7 天入门"主题聚类的 Onboarding 入口，被引用并向下分发到制作/极简首剧/引擎/发布/版权 Spoke 的概率高，是整站 GEO 结构的关键节点。英文侧几乎空白，引用价值尤高。

---

## 7. 外链规划（权威来源，附核实 URL）

> **纪律**：以下来源为行业公认权威/平台官方，**URL 均标注"待人工核实"**，严禁臆造精确链接；撰稿/上线前由人工用搜索确认最新官方地址后填入。不列 `ima.qq.com` 二次转引聚合卡为权威锚点。

| # | 来源 | 类型 | 核实 URL | 用途 |
|---|---|---|---|---|
| 1 | Lollipop Drama 官方（LunoTV / 创作工具 / 新手引导） | 平台官方文档 | 待人工核实（搜索"Lollipop Drama LunoTV 创作 新手"） | H2 一/二~八 工具与流程口径 |
| 2 | Runway / Kling / 可灵 / 即梦 官方文档 | 平台官方文档 | 待人工核实（搜索"Runway / Kling AI video docs"） | H2 五 生成工具口径 |
| 3 | ElevenLabs / 剪映 / CapCut 官方（配音/剪辑） | 平台官方文档 | 待人工核实（搜索"ElevenLabs AI dubbing docs"） | H2 六 配音剪辑口径 |
| 4 | DataEye 短剧观察 / 短剧自习室 | 第三方行业数据 | 待人工核实（搜索"DataEye AI 短剧 新手 数据"） | H2 二 题材热度与产能基准（标注估算） |
| 5 | 抖音/快手 短剧发行人计划官方教程 | 平台官方文档 | 待人工核实（搜索"抖音 短剧 发行人计划 教程"） | H2 八 发布分发口径 |
| 6 | 国家版权局 / 著作权法相关条文 | 监管/法律权威 | 待人工核实（搜索"著作权法 音乐 肖像 授权"） | H2 六/八 音乐/肖像授权边界 |
| 7 | YouTube / B站 创作者学院（通用 AI 创作入门） | 平台官方/社区 | 待人工核实（搜索"YouTube creator academy AI video"） | H2 一 入门背景补充 |

> 说明：上列来源分属"平台创作工具/生成引擎/配音剪辑/行业数据/发布分发/法律权威/社区学院"七类，可交叉佐证本篇日程、工具、产能、合规维度。所有 URL 待人工核实后填入，不臆造；行业数据均标注"估算"。中文 `ima.qq.com` 聚合卡为二次转引，**不列为权威外链锚点**（仅反映市场共识口径）。

---

## 8. 关键词蚕食防护（与新手入门/极简首剧/制作类/发布变现类/版权类文章的意图切分）

本篇为**7 天 Onboarding 教程支撑文（7-Day Beginner Tutorial Spoke）**，归属"AI 短剧制作/新手入门"聚类入口。须与以下站内文做**意图切分 + 双向互链**，否则将内耗排名：

### 8.1 与 `how-to-create-ai-short-drama`（按环节的新手指南，头号边界风险之一）
- **边界**：该文 = "**按制作环节**讲解的完整新手指南（story→script→character→video→dub→publish）"（信息架构=环节）；本篇 = "**按天排期**的 Onboarding 课程（Day1–Day7，每日任务+工具+产出）"（信息架构=时间/日程）。
- **切分方案**：该文谈"每个环节怎么做"，本篇谈"第 N 天该推进到哪个环节、当天交什么"。读者在 Day2/Day3 需要"剧本/分镜深讲"时**内链**该文；该文谈完环节后**链回本篇**做"按天落地排期总览"。同一主题、两种信息架构，互补不重叠。
- **禁止**：本篇不深讲每个环节的技法细节（那是 how-to-create 的职责），只给"当天做到什么程度够用"。

### 8.2 与 `first-vertical-drama-zero-experience`（极简首剧快路径，头号边界风险之二，须显式切分）
- **边界（二级风险，最高重合度）**：该文 = "**七天、无团队、最小范围**的路径，从空白页走到**一部两分钟竖屏剧**上线，刻意把范围压到最小——完成比惊艳更重要"（excerptZh L610，定位=极简快路径）；本篇 = "**结构化 7 天课程**：完整首部短剧 + **每日工具清单 + 当日产出 + 第 7 天成片与复盘**"，范围更完整、教学性更强（定位=系统 onboarding 课程）。
- **切分方案（推荐共存而非刷新）**：两篇**信息架构与定位不同**（极简快路径 vs 系统课程），可互补；本篇 H2 一/九 当读者"只想最快出一部极小成片"时**内链** `first-vertical-drama-zero-experience`；该文链回本篇做"想要更完整、按天系统学"的总览。**词汇消歧**：本篇称"7 天系统入门课程"，该文称"7 天极简首剧快路径"，避免都用"7天教程"造成自相竞争。
- **备选方案（若编辑决策倾向合并）**：可将本篇核心内容**刷新合并进 `first-vertical-drama-zero-experience`**（保留其 slug 与历史权重，升级为"7 天从 0 到成片：极简路径 + 系统日程"），则本 Brief 的 slug 应改为该已有 slug 并在 §10 注明刷新边界。当前默认按"新建 slug + 共存切分"推进，最终以编辑决策为准。

### 8.3 与 `ai-short-drama-complete-guide`（制作全景 Hub）
- **边界**：该文 = AI 短剧制作**全景 Hub（16 节点/5 阶段）**；本篇 = Onboarding 教程 Spoke（聚焦"7 天从 0 到成片"这一入口）。
- **做法**：本篇 H2 五 衔接制作全景时内链该文；该文 Hub 把"新手 7 天入门"作为一个聚类入口链回本篇。广度 vs 深度，互补。

### 8.4 与 `script-to-screen-pipeline` / `ai-script-storyboard` / `ai-scriptwriting-micro-dramas-prompts` / `ai-video-storytelling` / `ai-drama-character-consistency`（环节 Spoke）
- **边界**：均为单环节深读（流水线/分镜/钩子提示词/故事化/角色一致性）；本篇 = 把它们按 Day 串起来的日程总览。
- **做法**：本篇 Day 对应日（Day3 分镜→ai-script-storyboard、Day2 钩子→ai-scriptwriting-micro-dramas-prompts、Day4 生成→script-to-screen-pipeline、Day4 故事→ai-video-storytelling、Day3/7 角色→ai-drama-character-consistency）**内链**做深读；它们链回本篇做"按天落地"。广度 vs 深度，互补。

### 8.5 与 `top-8-ai-short-drama-engines-2026`（引擎选型）
- **边界**：该文 = 八大引擎横评；本篇 Day4 = "今天该用哪个引擎生成"，只做选型指路。
- **做法**：本篇 H2 五 内链该文做引擎深读；该文链回本篇做"新手按天生成"总览。

### 8.6 与 `publish-and-monetize-vertical-drama`（发布与变现）
- **边界**：该文 = "竖屏 AI 短剧**发布与变现全流程**（上传→审核→元数据→分发→三层变现）"（供给侧闭环）；本篇 Day7 = "第 7 天发布与复盘"（需求侧落地终点）。
- **做法**：本篇 H2 八 当读者需要"具体如何发布并拿到结算"时**内链**该文深读；该文链回本篇做"内容从哪来（7 天做出来）"总览。生产 vs 分发，互补闭环。

### 8.7 与 `ai-short-drama-monetization-copyright`（变现与版权）
- **边界**：该文 = "商用授权、平台政策与**红线规避**"的**版权合规深读**；本篇 H2 六/八 = 提醒"音乐授权/发布合规红线"，只点结论不展开全章。
- **做法**：本篇 H2 六/八 列要点后**内链**该文深读；该文链回本篇做"新手 7 天入门"总览。广度 vs 深度，互补（注意：链**已存在**的 `ai-short-drama-monetization-copyright` L855，非 forbidden ④ 裸 slug）。

### 8.8 与 `ai-short-drama-localization` / `lollipop-vs-reelshort-dramabox` / `ai-influencer-platform` / `global-ai-short-drama-monetization-roi-model` / `ai-short-drama-pillar-guide` / `ai-short-drama-industry-data-report-2026` / `ai-short-drama-faq-2026` / `web-novel-to-ai-short-drama-pipeline`
- 均为本篇**下游 Spoke**：本篇 7 天日程 → 内链导向（本地化前置/平台对比/网红化/出海变现/全景 Hub/行业数据/FAQ/网文改编）。主词（7 天入门）与上述（本地化/横评/网红/出海/全景/数据/FAQ/网文）意图各异，无重叠；形成 How-To→Spoke 内链网，共享权重而非竞争。

### 8.9 与 forbidden ①②③④⑤⑥⑦⑧（待建，严禁链）
- **现状**：经 `slug: "..."` 精确 Grep 确认均不在 `blog.ts`（见 §5.2）。本篇**当前不内链任何 forbidden slug**（避免死链）；待其批量发布且 URL 可访问后，由 content-editor 在对应段落补互链（原则同 `brief-lollipop-vs-reelshort-dramabox-zh-interlink-2026-10-06.md` 时序前置）。主词唯一性：`AI短剧7天入门教程` 仅本篇使用。

### 8.10 主词唯一性总结
- `AI短剧7天入门教程` / `零基础AI短剧教程` 仅本篇使用；`how-to-create-ai-short-drama` 主词为"按环节新手指南"、`first-vertical-drama-zero-experience` 主词为"极简首剧快路径"、`ai-short-drama-complete-guide` 主词为制作全景 Hub、`publish-and-monetize-vertical-drama` 主词为"发布与变现流程"、`ai-short-drama-monetization-copyright` 主词为"版权合规"——六者意图互斥，不互相蚕食（其中 `first-vertical-drama-zero-experience` 与本篇重合度最高，已用 §8.2 显式切分）。

---

## 9. 优先级评分（内容排期参考）

| 因素 | 权重 | 本篇评分(0-100) | 说明 |
|---|---|---|---|
| 搜索量 | 20% | 68 | "AI短剧教程/7天入门"高意图词，绝对量中（估算），长尾聚合可观 |
| 难度逆值 | 15% | 82 | 中文"7天按天排期 Onboarding"蓝海，易排名 |
| 商业意图 | 20% | 88 | 直接导向新手转化/工具/入驻，意图强 |
| Pillar 依赖 | 10% | 90 | "新手入门"聚类关键 Spoke，承上启下 |
| 交叉链接价值 | 10% | 96 | 可链 19 条简中 Spoke（含制作/极简首剧/发布/版权/引擎强相关），闭环强 |
| CTR 潜力 | 5% | 84 | "7天入门+2026+每天任务"标题提升点击 |
| 时效性 | 10% | 85 | 常青+2026 AI 短剧风口增量 |
| 趋势 | 10% | 92 | AI 短剧处爆发通道，新手教程需求上行 |
| **加权总分** | 100% | **~83** | 高优先级；建议尽快排期（注意 §5.2/§8.9 待建文时序；§8.2 与 first-vertical 的切分/合并决策） |

---

## 10. 发布参数建议（初稿）

### 10.1 Meta Title（3 备选，50–60 字符区间）
1. `零基础 7 天入门 AI 短剧教程（2026）：每天任务+工具+产出`
2. `AI短剧7天入门教程：零基础从 0 到出第一部成片（2026）`
3. `2026 零基础学 AI 短剧：7 天日程、工具清单与第 7 天成片`

### 10.2 Meta Description（3 备选，150–160 中文字符）
1. `零基础也能 7 天做出第一部 AI 短剧？本教程按天排期：每天做什么、用什么工具、产出什么，第 7 天你手里会有一部能发的竖屏剧。AI 短剧特化、全程中立。`
2. `2026 零基础 7 天入门 AI 短剧教程：从 Day1 选题、Day2 写钩子脚本、Day3 角色分镜，到 Day4 生成、Day5 剪辑配音、Day6 修改、Day7 发布复盘，附 Checklist 与 FAQ。`
3. `想从零做 AI 短剧但不知从哪天开始？本文给你一份 7 天日程：每日任务+工具清单+当日产出，串起钩子脚本、角色分镜、图生视频到发布复盘，帮你第 7 天拿到成片。`

### 10.3 结构化数据
- **Article / BlogPosting**：`headline`、`datePublished`、`dateModified`、`author`、`publisher`、`inLanguage: zh-CN`、`mainEntityOfPage`。
- **FAQPage**（H2 九 5 问）：JSON-LD `FAQPage`，对齐"零基础7天能学会吗""新手第一天做什么""AI短剧新手避坑"等自然语言问法（GEO/AEO 高价值）。
- **HowTo**（可选，H2 二~八 7 天步骤）：若正文用有序步骤块，可加 `HowTo` 结构化数据（7 个 step，每步含 supplies/tools + 产出），提升富媒体展示。

### 10.4 上线前置清单
- [ ] 目标 slug `ai-short-drama-7-day-tutorial-2026` 已写入 `blog.ts` 且带 `titleZh`（语言版本核查通过）。（若编辑决策改走 §8.2 备选"合并刷新 first-vertical-drama-zero-experience"，则改为刷新该 slug 并在文内注明）
- [ ] §5.1 白名单 19 条内链全部就位、锚文本与路径正确（路径 `/blog/<slug>`，slug 以本次 Grep 行号对应为准）。
- [ ] §5.2 forbidden ①②③④⑤⑥⑦⑧ **正文零出现**（死链防护）；⑨ `web-novel-to-ai-short-drama-pipeline` 已正确列入白名单可链。
- [ ] H2 一 已给"7 天总览表"与直接答案句；H2 二~八 每 Day 含"任务+工具+产出"三栏。
- [ ] §8.2 已与 `first-vertical-drama-zero-experience` 做显式意图切分与双向互链（或按备选方案合并刷新）；词汇消歧（"系统课程" vs "极简快路径"）。
- [ ] FAQPage / HowTo 结构化数据已加；llms.txt 已将该文列入 "AI short drama 7-day beginner tutorial / onboarding 2026" 互斥集。
- [ ] 外部链接 URL 已由人工核实填入（§7 待人工核实项），无臆造链接。
- [ ] 所有行业数字标注"估算"+ 来源。
- [ ] 与 `how-to-create-ai-short-drama`、`first-vertical-drama-zero-experience`、`ai-short-drama-complete-guide`、`publish-and-monetize-vertical-drama`、`ai-short-drama-monetization-copyright` 完成双向互链。
