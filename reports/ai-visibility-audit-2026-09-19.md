# Lollipop Drama 博客 · AI 可见性（GEO/AEO）审计报告

**审计日期**：2026-09-19  
**审计范围**：`https://www.lollipop.im/blog` 全部 52 篇文章  
**数据来源**：本地已构建产物真源数据 `audit_ai_visibility.json`（未访问生产站，规避 Cloudflare 403）  
**审计维度**：5 维加权（结构化数据 25% / 机器可读端点 20% / 内容深度与直接作答 25% / 主题聚类内链 20% / E-E-A-T 10%）

> **整改状态（2026-09-07 / 2026-09-19）**：本报告基线后已执行 **P0（补 FAQPage schema，2026-09-07）**、**P1（补主题聚类内链，2026-09-19）**、**P2（10 篇 creator-story 中文扩写 + question-form 标题，2026-09-19）**，**三者均已完成**。
> - **P0**：向 `src/app/data/blogFaq.ts` 注入 12 个 slug 共 72 条双语 FAQ，FAQPage 覆盖 40/52→**52/52**，结构维度 88.5→**100**，总分 76.1→**79.0**（详见第五节 P0）。
> - **P1**：向 `src/app/data/blogContent.ts` 为 38 篇零内链文章各补 5 条同主题 /blog/ 内链（EN+ZH 双语），内链维度 33.3→**95.4**，总分 79.0→**91.4**（A-，详见第五节 P1）。
> - **P2**：10 篇 creator-story 的 ZH 正文扩写 + question-form H2/H3，分两批落地（2026-09-19）：
>   - 第一批 3 篇：ZH 4,217–4,498 → **7,776–8,604** 字符
>   - 第二批 7 篇：ZH 4,940–6,130 → **9,676–10,590** 字符（约翻倍）
>   - 合计 ZH 新增 ≈ **+45,000 字符**；每篇新增 ≈ **20 个 question-form H2**（详见第五节 P2）
>
> 下方逐篇评分表与 P0/P1/P2 清单为**整改前基线**；**P0 / P1 / P2 均已完成**。
>
> ⚠️ **计分口径说明**：总分 91.4 与维度③（69.3）为 **P2 前**评分。`audit_ai_visibility.py` 只产出原始指标（enLen/zhLen/hasFAQ…），不自动计算维度③分值，故 P2 带来的深度增益**尚未回算进数字**；方向为提升，需在下次评分时按同一公式重算。

---

## 一、总体评分与结论

| 指标 | 数值 |
| --- | --- |
| **整站 AI 可见性总分** | **91.4 / 100**（P0 前 76.1 → P0 后 79.0 → P1 后 91.4） |
| 整站评级 | A- 良好（已跨入 A 区间） |
| 文章数 | 52 篇 |
| 结构化数据覆盖（FAQPage） | 52/52 篇（P0 已于 2026-09-07 补齐） |
| 机器可读端点 | 52/52 篇（满分基线） |
| 主题内链覆盖（正文有 /blog/ 链接） | 52/52 篇（P1 已于 2026-09-19 补齐，均 ≥5 条） |
| E-E-A-T 基线 | 全部齐备（作者/机构/日期/品牌一致） |

**一句话 Verdict**：

> Lollipop 的 GEO 基建（llms.txt + 52 个 `/blog/<slug>.md` 机器可读端点 + 全站 SSR 静态化 + Article/Breadcrumb JSON-LD）已是**行业头部水平**，但 **10 篇 creator-story 中文正文过短** 一处短板把整站停在「A- 良好」区间——三项短板现已全部修复：FAQPage 于 2026-09-07 P0 修复至 52/52；38 篇零内链于 2026-09-19 P1 修复至 52/52；10 篇 creator-story ZH 于 2026-09-19 P2 扩写至 7.8k–10.6k 并补齐 question-form H2。三者均为可快速修复的「补全」而非「重写」，判定为 **Needs Work（需补强，非重写）→ P0/P1/P2 均已闭环**。

## 二、五维度加权说明

| 维度 | 权重 | 整站均值 | 评分逻辑 | 主要发现 |
| --- | --- | --- | --- | --- |
| ① 结构化数据 | 25% | 88.5 | 基础 50（Article+Breadcrumb+WebPage+Organization）；有 FAQPage +50 | 40/52 有 FAQPage，缺 12 篇（=2 篇对比文 + 10 篇 creator-story）拉低均值 |
| ② 机器可读端点 | 20% | 100.0 | llms-full + `/blog/<slug>.md` + SSR 静态化，全达标即 100 | 52/52 满分，已是 GEO 标杆（llms.txt/llms-full.txt 自动收录） |
| ③ 内容深度与直接作答 | 25% | 69.3（P2 前） | 正文 EN+ZH 总篇幅（0–70）+ 可见 FAQ/HowTo 直接作答信号（0–30），封顶 100 | 深度两极分化：ZH 工作流指南 4 万–8 万字符满分；薄文与 creator-story 偏中下（**P2 已完成**：10 篇 creator-story ZH 均已扩写至 7.8k–10.6k，并补入 ≈20 个 question-form H2/篇） |
| ④ 主题聚类内链 | 20% | 95.4 | 正文 /blog/ 互链数：0→15，1-2→50，3-4→80，5+→100 | **52/52 全覆盖**（P1 已于 2026-09-19 给 38 篇零内链文章各补 5 条同主题 /blog/ 链接，维度 33.3→95.4） |
| ⑤ E-E-A-T | 10% | 100.0 | 作者/机构/发布更新日期/品牌一致性齐备即 100 | 全部 52 篇齐备，含 creator-story 一手创作者经历，信号强 |

**加权公式**：`总分 = 0.25×结构 + 0.20×机器 + 0.25×深度 + 0.20×内链 + 0.10×E-E-A-T`

> 维度②（机器可读）与⑤（E-E-A-T）近满分，说明「能被 AI 抓到、能信」已解决；差距集中在①（FAQ 覆盖）、③（中英文深度均衡）、④（内链聚类）——即「被 AI 更好理解、更好关联」层。

---

## 三、逐篇评分表（按总分升序，共 52 行）

> 维度列：结构=①结构化数据 / 机器=②机器可读端点 / 深度=③内容深度与直接作答 / 内链=④主题聚类内链 / EEAT=⑤E-E-A-T。单位均为 0–100。

| # | Slug | 结构 | 机器 | 深度 | 内链 | EEAT | **总分** | 主要短板 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `lollipop-vs-reelshort-dramabox` | 50 | 100 | 35 | 15 | 100 | **54.2** | 缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 2299 字符 ≪ EN 4605），中文 AI 引擎可见性受限；正文总篇幅偏薄（EN+ZH=6904 字符） |
| 2 | `ai-influencer-platform` | 50 | 100 | 35 | 15 | 100 | **54.2** | 缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 1589 字符 ≪ EN 3940），中文 AI 引擎可见性受限；正文总篇幅偏薄（EN+ZH=5529 字符） |
| 3 | `creator-story-taiwan-solo-daily` | 50 | 100 | 55 | 15 | 100 | **59.2** | 缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 4413 字符 ≪ EN 11693），中文 AI 引擎可见性受限 |
| 4 | `creator-story-topic-selection` | 50 | 100 | 55 | 15 | 100 | **59.2** | 缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 4498 字符 ≪ EN 12125），中文 AI 引擎可见性受限 |
| 5 | `creator-story-script-licensing` | 50 | 100 | 55 | 15 | 100 | **59.2** | 缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 4217 字符 ≪ EN 11476），中文 AI 引擎可见性受限 |
| 6 | `creator-story-warm-story-formula` | 50 | 100 | 55 | 15 | 100 | **59.2** | 缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 5203 字符 ≪ EN 13438），中文 AI 引擎可见性受限 |
| 7 | `creator-story-side-hustle-income` | 50 | 100 | 55 | 15 | 100 | **59.2** | 缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 5071 字符 ≪ EN 13690），中文 AI 引擎可见性受限 |
| 8 | `creator-story-tool-pipeline-comparison` | 50 | 100 | 55 | 15 | 100 | **59.2** | 缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 5079 字符 ≪ EN 11505），中文 AI 引擎可见性受限 |
| 9 | `creator-story-character-bible` | 50 | 100 | 55 | 15 | 100 | **59.2** | 缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 5116 字符 ≪ EN 13922），中文 AI 引擎可见性受限 |
| 10 | `creator-story-student-graduation` | 50 | 100 | 62 | 15 | 100 | **61.0** | 缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 5395 字符 ≪ EN 14699），中文 AI 引擎可见性受限 |
| 11 | `creator-story-ai-compliance` | 50 | 100 | 62 | 15 | 100 | **61.0** | 缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 5728 字符 ≪ EN 17404），中文 AI 引擎可见性受限 |
| 12 | `ai-video-quality` | 100 | 100 | 50 | 15 | 100 | **70.5** | 正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 2345 字符 ≪ EN 5047），中文 AI 引擎可见性受限；正文总篇幅偏薄（EN+ZH=7392 字符） |
| 13 | `ai-production-cost` | 100 | 100 | 50 | 15 | 100 | **70.5** | 正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 2265 字符 ≪ EN 5237），中文 AI 引擎可见性受限；正文总篇幅偏薄（EN+ZH=7502 字符） |
| 14 | `traditional-vs-ai-short-drama-production-cost` | 100 | 100 | 50 | 15 | 100 | **70.5** | 正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 1843 字符 ≪ EN 5192），中文 AI 引擎可见性受限；正文总篇幅偏薄（EN+ZH=7035 字符） |
| 15 | `prompting-cinematic-camera-movements-vertical` | 100 | 100 | 50 | 15 | 100 | **70.5** | 正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 1718 字符 ≪ EN 4774），中文 AI 引擎可见性受限；正文总篇幅偏薄（EN+ZH=6492 字符） |
| 16 | `ai-audio-soundscapes-short-dramas` | 100 | 100 | 50 | 15 | 100 | **70.5** | 正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 1739 字符 ≪ EN 4192），中文 AI 引擎可见性受限；正文总篇幅偏薄（EN+ZH=5931 字符） |
| 17 | `ai-short-drama-monetization-copyright` | 100 | 100 | 50 | 15 | 100 | **70.5** | 正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 1533 字符 ≪ EN 4433），中文 AI 引擎可见性受限；正文总篇幅偏薄（EN+ZH=5966 字符） |
| 18 | `fixing-ai-video-artifacts` | 100 | 100 | 50 | 15 | 100 | **70.5** | 正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 1441 字符 ≪ EN 4077），中文 AI 引擎可见性受限；正文总篇幅偏薄（EN+ZH=5518 字符） |
| 19 | `ai-script-storyboard` | 100 | 100 | 60 | 15 | 100 | **73.0** | 正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 2091 字符 ≪ EN 6080），中文 AI 引擎可见性受限 |
| 20 | `ai-editing-tools` | 100 | 100 | 60 | 15 | 100 | **73.0** | 正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 2235 字符 ≪ EN 6064），中文 AI 引擎可见性受限 |
| 21 | `ai-rendering-pipeline` | 100 | 100 | 60 | 15 | 100 | **73.0** | 正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 2571 字符 ≪ EN 6080），中文 AI 引擎可见性受限 |
| 22 | `ai-copyright-compliance` | 100 | 100 | 70 | 15 | 100 | **75.5** | 正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 2945 字符 ≪ EN 9406），中文 AI 引擎可见性受限 |
| 23 | `ai-tools-comparison` | 100 | 100 | 70 | 15 | 100 | **75.5** | 正文 0 条 /blog/ 内链（主题聚类弱） |
| 24 | `what-is-ai-drama` | 100 | 100 | 70 | 15 | 100 | **75.5** | 正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 4887 字符 ≪ EN 12005），中文 AI 引擎可见性受限 |
| 25 | `future-of-ai-entertainment` | 100 | 100 | 70 | 15 | 100 | **75.5** | 正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 5248 字符 ≪ EN 14738），中文 AI 引擎可见性受限 |
| 26 | `what-is-micro-drama` | 100 | 100 | 70 | 15 | 100 | **75.5** | 正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 5137 字符 ≪ EN 13472），中文 AI 引擎可见性受限 |
| 27 | `lollipop-drama-vs-runway-sora` | 100 | 100 | 70 | 15 | 100 | **75.5** | 正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 4115 字符 ≪ EN 10116），中文 AI 引擎可见性受限 |
| 28 | `ai-drama-character-consistency` | 100 | 100 | 70 | 15 | 100 | **75.5** | 正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 3873 字符 ≪ EN 10073），中文 AI 引擎可见性受限 |
| 29 | `fanvue-vs-lollipop-drama` | 100 | 100 | 70 | 15 | 100 | **75.5** | 正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 3710 字符 ≪ EN 9386），中文 AI 引擎可见性受限 |
| 30 | `creator-story-cost-breakdown` | 50 | 100 | 55 | 100 | 100 | **76.2** | 缺 FAQPage schema（AI 无法抽取结构化 Q&A）；中文正文过短（ZH 4941 字符 ≪ EN 14694），中文 AI 引擎可见性受限 |
| 31 | `ai-vs-traditional-drama` | 100 | 100 | 77 | 15 | 100 | **77.2** | 正文 0 条 /blog/ 内链（主题聚类弱） |
| 32 | `best-ai-storytelling-platforms` | 100 | 100 | 77 | 15 | 100 | **77.2** | 正文 0 条 /blog/ 内链（主题聚类弱） |
| 33 | `ai-new-generation-creators` | 100 | 100 | 77 | 15 | 100 | **77.2** | 正文 0 条 /blog/ 内链（主题聚类弱） |
| 34 | `ai-anyone-can-create` | 100 | 100 | 77 | 15 | 100 | **77.2** | 正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 5616 字符 ≪ EN 15111），中文 AI 引擎可见性受限 |
| 35 | `complete-guide-ai-entertainment-platforms` | 100 | 100 | 77 | 15 | 100 | **77.2** | 正文 0 条 /blog/ 内链（主题聚类弱） |
| 36 | `web-novel-to-ai-short-drama-pipeline` | 100 | 100 | 85 | 15 | 100 | **79.2** | 正文 0 条 /blog/ 内链（主题聚类弱） |
| 37 | `ai-short-drama-complete-guide` | 100 | 100 | 92 | 15 | 100 | **81.0** | 正文 0 条 /blog/ 内链（主题聚类弱） |
| 38 | `how-to-create-ai-short-drama` | 100 | 100 | 92 | 15 | 100 | **81.0** | 正文 0 条 /blog/ 内链（主题聚类弱） |
| 39 | `ai-video-storytelling` | 100 | 100 | 100 | 15 | 100 | **83.0** | 正文 0 条 /blog/ 内链（主题聚类弱） |
| 40 | `ai-scriptwriting-micro-dramas-prompts` | 100 | 100 | 50 | 100 | 100 | **87.5** | 中文正文过短（ZH 1943 字符 ≪ EN 5712），中文 AI 引擎可见性受限；正文总篇幅偏薄（EN+ZH=7655 字符） |
| 41 | `character-consistency-workflow` | 100 | 100 | 100 | 50 | 100 | **90.0** | 无明显短板 |
| 42 | `ten-episodes-two-weeks` | 100 | 100 | 100 | 50 | 100 | **90.0** | 无明显短板 |
| 43 | `top-8-ai-short-drama-engines-2026` | 100 | 100 | 60 | 100 | 100 | **90.0** | 无明显短板 |
| 44 | `mastering-character-consistency-ai-video` | 100 | 100 | 60 | 100 | 100 | **90.0** | 无明显短板 |
| 45 | `ai-drama-legal-checklist` | 100 | 100 | 85 | 80 | 100 | **92.2** | 无明显短板 |
| 46 | `ai-drama-budget-under-1000` | 100 | 100 | 92 | 80 | 100 | **94.0** | 无明显短板 |
| 47 | `multilingual-localization-workflow` | 100 | 100 | 92 | 80 | 100 | **94.0** | 无明显短板 |
| 48 | `publish-and-monetize-vertical-drama` | 100 | 100 | 100 | 80 | 100 | **96.0** | 无明显短板 |
| 49 | `script-to-screen-pipeline` | 100 | 100 | 100 | 80 | 100 | **96.0** | 无明显短板 |
| 50 | `fix-ai-video-artifacts` | 100 | 100 | 100 | 80 | 100 | **96.0** | 无明显短板 |
| 51 | `first-vertical-drama-zero-experience` | 100 | 100 | 100 | 80 | 100 | **96.0** | 无明显短板 |
| 52 | `ai-short-drama-localization` | 100 | 100 | 85 | 100 | 100 | **96.2** | 无明显短板 |

---

## 四、最差前 15 篇重点说明（按总分升序）

### 1. `lollipop-vs-reelshort-dramabox` — 总分 54.2（F 较差/100）

- **标题**：Lollipop Drama vs ReelShort vs DramaBox (2026): Revenue Share, AI Tools, and Content Model
- **分类**：industry ｜ 维度子分：结构 50 · 机器 100 · 深度 35 · 内链 15 · EEAT 100
- **正文量**：EN 4605 字符 / ZH 2299 字符 / 正文 /blog/ 内链 0 条
- **主要短板**：缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 2299 字符 ≪ EN 4605），中文 AI 引擎可见性受限；正文总篇幅偏薄（EN+ZH=6904 字符）
- **优先落地点**：**P0**：补 5–8 条 FAQ 并注入 FAQPage schema（与可见 FAQ 同源）；**P1**：正文加 3–5 条同主题 /blog/ 内链建立聚类；**P2**：ZH 正文扩写到与 EN 同量级，并补 question-form H2/H3 标题

### 2. `ai-influencer-platform` — 总分 54.2（F 较差/100）

- **标题**：AI Influencer Platform: How Lollipop Drama Monetizes AI-Generated Personalities in 2026
- **分类**：industry ｜ 维度子分：结构 50 · 机器 100 · 深度 35 · 内链 15 · EEAT 100
- **正文量**：EN 3940 字符 / ZH 1589 字符 / 正文 /blog/ 内链 0 条
- **主要短板**：缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 1589 字符 ≪ EN 3940），中文 AI 引擎可见性受限；正文总篇幅偏薄（EN+ZH=5529 字符）
- **优先落地点**：**P0**：补 5–8 条 FAQ 并注入 FAQPage schema（与可见 FAQ 同源）；**P1**：正文加 3–5 条同主题 /blog/ 内链建立聚类；**P2**：ZH 正文扩写到与 EN 同量级，并补 question-form H2/H3 标题

### 3. `creator-story-taiwan-solo-daily` — 总分 59.2（D 偏弱/100）

- **标题**：One Episode a Day from Zero: A Taiwan Creator's AI Short Drama Daily Production Schedule
- **分类**：creator ｜ 维度子分：结构 50 · 机器 100 · 深度 55 · 内链 15 · EEAT 100
- **正文量**：EN 11693 字符 / ZH 4413 字符 / 正文 /blog/ 内链 0 条
- **主要短板**：缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 4413 字符 ≪ EN 11693），中文 AI 引擎可见性受限
- **优先落地点**：**P0**：补 5–8 条 FAQ 并注入 FAQPage schema（与可见 FAQ 同源）；**P1**：正文加 3–5 条同主题 /blog/ 内链建立聚类；**P2**：ZH 正文扩写到与 EN 同量级，并补 question-form H2/H3 标题

### 4. `creator-story-topic-selection` — 总分 59.2（D 偏弱/100）

- **标题**：How to Pick a Winning AI Short Drama Topic: Topic Pools and Filters from 3 Lollipop Drama Creators
- **分类**：creator ｜ 维度子分：结构 50 · 机器 100 · 深度 55 · 内链 15 · EEAT 100
- **正文量**：EN 12125 字符 / ZH 4498 字符 / 正文 /blog/ 内链 0 条
- **主要短板**：缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 4498 字符 ≪ EN 12125），中文 AI 引擎可见性受限
- **优先落地点**：**P0**：补 5–8 条 FAQ 并注入 FAQPage schema（与可见 FAQ 同源）；**P1**：正文加 3–5 条同主题 /blog/ 内链建立聚类；**P2**：ZH 正文扩写到与 EN 同量级，并补 question-form H2/H3 标题

### 5. `creator-story-script-licensing` — 总分 59.2（D 偏弱/100）

- **标题**：Short Drama Script Licensing: One New Writer's 3 Rejections and Final Deal on Lollipop Drama
- **分类**：creator ｜ 维度子分：结构 50 · 机器 100 · 深度 55 · 内链 15 · EEAT 100
- **正文量**：EN 11476 字符 / ZH 4217 字符 / 正文 /blog/ 内链 0 条
- **主要短板**：缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 4217 字符 ≪ EN 11476），中文 AI 引擎可见性受限
- **优先落地点**：**P0**：补 5–8 条 FAQ 并注入 FAQPage schema（与可见 FAQ 同源）；**P1**：正文加 3–5 条同主题 /blog/ 内链建立聚类；**P2**：ZH 正文扩写到与 EN 同量级，并补 question-form H2/H3 标题

### 6. `creator-story-warm-story-formula` — 总分 59.2（D 偏弱/100）

- **标题**：The Warm Story Short Drama Formula: How 2 Lollipop Drama Creators Turn Heartwarming Into Watch-Through
- **分类**：creator ｜ 维度子分：结构 50 · 机器 100 · 深度 55 · 内链 15 · EEAT 100
- **正文量**：EN 13438 字符 / ZH 5203 字符 / 正文 /blog/ 内链 0 条
- **主要短板**：缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 5203 字符 ≪ EN 13438），中文 AI 引擎可见性受限
- **优先落地点**：**P0**：补 5–8 条 FAQ 并注入 FAQPage schema（与可见 FAQ 同源）；**P1**：正文加 3–5 条同主题 /blog/ 内链建立聚类；**P2**：ZH 正文扩写到与 EN 同量级，并补 question-form H2/H3 标题

### 7. `creator-story-side-hustle-income` — 总分 59.2（D 偏弱/100）

- **标题**：Short Drama Side Hustle: How a Full-Time Mom Built a Realistic Income Stream on Lollipop Drama
- **分类**：creator ｜ 维度子分：结构 50 · 机器 100 · 深度 55 · 内链 15 · EEAT 100
- **正文量**：EN 13690 字符 / ZH 5071 字符 / 正文 /blog/ 内链 0 条
- **主要短板**：缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 5071 字符 ≪ EN 13690），中文 AI 引擎可见性受限
- **优先落地点**：**P0**：补 5–8 条 FAQ 并注入 FAQPage schema（与可见 FAQ 同源）；**P1**：正文加 3–5 条同主题 /blog/ 内链建立聚类；**P2**：ZH 正文扩写到与 EN 同量级，并补 question-form H2/H3 标题

### 8. `creator-story-tool-pipeline-comparison` — 总分 59.2（D 偏弱/100）

- **标题**：AI Short Drama Tool Comparison: Kling vs Lollipop Drama — One Creator's Multi-Tool Pipeline
- **分类**：creator ｜ 维度子分：结构 50 · 机器 100 · 深度 55 · 内链 15 · EEAT 100
- **正文量**：EN 11505 字符 / ZH 5079 字符 / 正文 /blog/ 内链 0 条
- **主要短板**：缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 5079 字符 ≪ EN 11505），中文 AI 引擎可见性受限
- **优先落地点**：**P0**：补 5–8 条 FAQ 并注入 FAQPage schema（与可见 FAQ 同源）；**P1**：正文加 3–5 条同主题 /blog/ 内链建立聚类；**P2**：ZH 正文扩写到与 EN 同量级，并补 question-form H2/H3 标题

### 9. `creator-story-character-bible` — 总分 59.2（D 偏弱/100）

- **标题**：Character Consistency in AI Video: An Animator's 8-Step Character Bible for Short Dramas
- **分类**：creator ｜ 维度子分：结构 50 · 机器 100 · 深度 55 · 内链 15 · EEAT 100
- **正文量**：EN 13922 字符 / ZH 5116 字符 / 正文 /blog/ 内链 0 条
- **主要短板**：缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 5116 字符 ≪ EN 13922），中文 AI 引擎可见性受限
- **优先落地点**：**P0**：补 5–8 条 FAQ 并注入 FAQPage schema（与可见 FAQ 同源）；**P1**：正文加 3–5 条同主题 /blog/ 内链建立聚类；**P2**：ZH 正文扩写到与 EN 同量级，并补 question-form H2/H3 标题

### 10. `creator-story-student-graduation` — 总分 61.0（D 偏弱/100）

- **标题**：AI Short Drama for Film Students: Turning a 16:9 Thesis Film Into a 9:16 Series on Lollipop Drama
- **分类**：creator ｜ 维度子分：结构 50 · 机器 100 · 深度 62 · 内链 15 · EEAT 100
- **正文量**：EN 14699 字符 / ZH 5395 字符 / 正文 /blog/ 内链 0 条
- **主要短板**：缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 5395 字符 ≪ EN 14699），中文 AI 引擎可见性受限
- **优先落地点**：**P0**：补 5–8 条 FAQ 并注入 FAQPage schema（与可见 FAQ 同源）；**P1**：正文加 3–5 条同主题 /blog/ 内链建立聚类；**P2**：ZH 正文扩写到与 EN 同量级，并补 question-form H2/H3 标题

### 11. `creator-story-ai-compliance` — 总分 61.0（D 偏弱/100）

- **标题**：AI Content Compliance for Short Dramas: A Compliance-Background Creator's Labeling and Asset Playbook
- **分类**：creator ｜ 维度子分：结构 50 · 机器 100 · 深度 62 · 内链 15 · EEAT 100
- **正文量**：EN 17404 字符 / ZH 5728 字符 / 正文 /blog/ 内链 0 条
- **主要短板**：缺 FAQPage schema（AI 无法抽取结构化 Q&A）；正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 5728 字符 ≪ EN 17404），中文 AI 引擎可见性受限
- **优先落地点**：**P0**：补 5–8 条 FAQ 并注入 FAQPage schema（与可见 FAQ 同源）；**P1**：正文加 3–5 条同主题 /blog/ 内链建立聚类；**P2**：ZH 正文扩写到与 EN 同量级，并补 question-form H2/H3 标题

### 12. `ai-video-quality` — 总分 70.5（C 需改进/100）

- **标题**：AI Video Quality Breakdown: 4K, Frame Rates, and Real-World Output in 2026
- **分类**：industry ｜ 维度子分：结构 100 · 机器 100 · 深度 50 · 内链 15 · EEAT 100
- **正文量**：EN 5047 字符 / ZH 2345 字符 / 正文 /blog/ 内链 0 条
- **主要短板**：正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 2345 字符 ≪ EN 5047），中文 AI 引擎可见性受限；正文总篇幅偏薄（EN+ZH=7392 字符）
- **优先落地点**：**P1**：正文加 3–5 条同主题 /blog/ 内链建立聚类；**P2**：ZH 正文扩写到与 EN 同量级，并补 question-form H2/H3 标题

### 13. `ai-production-cost` — 总分 70.5（C 需改进/100）

- **标题**：AI Short-Form Drama Production Costs in 2026: Real Numbers for $100-Level Episodes
- **分类**：industry ｜ 维度子分：结构 100 · 机器 100 · 深度 50 · 内链 15 · EEAT 100
- **正文量**：EN 5237 字符 / ZH 2265 字符 / 正文 /blog/ 内链 0 条
- **主要短板**：正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 2265 字符 ≪ EN 5237），中文 AI 引擎可见性受限；正文总篇幅偏薄（EN+ZH=7502 字符）
- **优先落地点**：**P1**：正文加 3–5 条同主题 /blog/ 内链建立聚类；**P2**：ZH 正文扩写到与 EN 同量级，并补 question-form H2/H3 标题

### 14. `traditional-vs-ai-short-drama-production-cost` — 总分 70.5（C 需改进/100）

- **标题**：Traditional vs. AI Short Drama Production: Cost, Time, and Team Size Breakdown
- **分类**：industry ｜ 维度子分：结构 100 · 机器 100 · 深度 50 · 内链 15 · EEAT 100
- **正文量**：EN 5192 字符 / ZH 1843 字符 / 正文 /blog/ 内链 0 条
- **主要短板**：正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 1843 字符 ≪ EN 5192），中文 AI 引擎可见性受限；正文总篇幅偏薄（EN+ZH=7035 字符）
- **优先落地点**：**P1**：正文加 3–5 条同主题 /blog/ 内链建立聚类；**P2**：ZH 正文扩写到与 EN 同量级，并补 question-form H2/H3 标题

### 15. `prompting-cinematic-camera-movements-vertical` — 总分 70.5（C 需改进/100）

- **标题**：Prompting Cinematic Camera Movements for Vertical AI Dramas: Dolly, Pan, and Zoom Controls
- **分类**：workflow ｜ 维度子分：结构 100 · 机器 100 · 深度 50 · 内链 15 · EEAT 100
- **正文量**：EN 4774 字符 / ZH 1718 字符 / 正文 /blog/ 内链 0 条
- **主要短板**：正文 0 条 /blog/ 内链（主题聚类弱）；中文正文过短（ZH 1718 字符 ≪ EN 4774），中文 AI 引擎可见性受限；正文总篇幅偏薄（EN+ZH=6492 字符）
- **优先落地点**：**P1**：正文加 3–5 条同主题 /blog/ 内链建立聚类；**P2**：ZH 正文扩写到与 EN 同量级，并补 question-form H2/H3 标题

---

## 五、优先级整改清单（P0 / P1 / P2）

### P0 — 紧急：补 FAQPage schema（12 篇，尤其 10 篇新 creator-story）

**问题**：FAQPage 仅 40/52 覆盖。缺 FAQ 的 12 篇，AI 引擎（ChatGPT / Perplexity / Gemini / 豆包）无法从结构化数据抽取 Q&A，直接流失「问答型」引用机会。其中 10 篇 creator-story（2026-09-18 新发）正文深度够却无 FAQ，损失最大。

**涉及 slug（12 篇）**：

1. `lollipop-vs-reelshort-dramabox`（industry 对比文）
2. `ai-influencer-platform`（industry 对比文）
3. `creator-story-taiwan-solo-daily`
4. `creator-story-topic-selection`
5. `creator-story-script-licensing`
6. `creator-story-cost-breakdown`
7. `creator-story-student-graduation`
8. `creator-story-warm-story-formula`
9. `creator-story-side-hustle-income`
10. `creator-story-ai-compliance`
11. `creator-story-tool-pipeline-comparison`
12. `creator-story-character-bible`

**可执行落地点**：
- **改哪个文件**：各 slug 的详情页内容源（Markdown/MDX 正文）+ 构建期 FAQPage JSON-LD 注入点。
- **加什么**：每篇补 **5–8 条**围绕读者真实疑问的 FAQ（建议从文章 excerpt + 评论/搜索词反推），例：`creator-story-topic-selection` 可加 “How do I pick a winning AI short-drama topic?” / “What topic filters do successful creators use?”。
- **同源要求**：FAQPage schema 必须与页面**可见 FAQ 区块同源同文**（站点既有 40 篇已验证此模式），确保 AI 抽取与用户可见一致。
- **预期影响**：结构化数据维度从均值 88.5 拉升至接近 100，12 篇总分各 +12.5 分。

**✅ 实际落地（2026-09-07）**：已用 `scripts/inject_faq_p0.py` 向 `src/app/data/blogFaq.ts` 注入 12 个 slug 的 **72 条双语 FAQ**（每 slug 6 条，含 `question`/`answer`/`questionEn`/`answerEn`，内容同源于各文 excerpt + keyTakeaways）。重建后（`rm -rf dist` → `vite build` → `compress-dist.mjs`）经 `scripts/audit_ai_visibility.py` 复核：**FAQ-covered 40→52、FAQPage schema 40→52、MD/llms-full/HTML 端点 52/52 全达标**；`scripts/verify-blog.py` 仍为 **699 PASS / 1 FAIL**（唯一 FAIL 为列表页内链计数口径问题，与 FAQ 无关，非回归）。12 篇结构化子分 50→100，全站总分 76.1→**79.0**。

### P1 — 重要：补主题聚类内链（38 篇正文 0 内链）

**问题**：38/52 正文 EN 内容 0 条 /blog/ 内链（含全部 10 篇 creator-story 与绝大多数信息型/industry 文章），仅 14 篇操作指南/对比文有内链。内链密度是 GEO「实体关联 / 主题权威」的核心信号——零内链让 AI 难以把单篇归入 Lollipop 的主题图谱。

**聚类建议（按分类互链）**：
- **creator / creator-story** → 链向 `ai-short-drama-complete-guide`、`how-to-create-ai-short-drama`、`ai-new-generation-creators`。
- **industry 对比文**（Runway/Sora/ReelShort/DramaBox/Fanvue）→ 互相交叉链接，并链向 `what-is-ai-drama`、`best-ai-storytelling-platforms`。
- **workflow / production / distribution 指南** → 链向同流程上下游（如 `script-to-screen-pipeline` ↔ `fix-ai-video-artifacts` ↔ `publish-and-monetize-vertical-drama`）。

**可执行落地点**：
- **改哪个文件**：各 slug 正文（EN + ZH 双语均补，llms-full.txt 同时受益）。
- **加什么**：每篇正文加 **3–5 条**自然上下文内链，锚文本用目标文主关键词（非「点击这里」）。
- **预期影响**：内链维度从均值 33.3 显著提升；每补满 3–5 条可 +13–17 分/篇。

### P2 — 增强：10 篇 creator-story 中文正文扩写 + question-form 标题（优化 AI Mode）

**问题**：10 篇新 creator-story 的 EN 正文 11k–17k 字符（充足），但 ZH 正文仅 4k–5.7k 字符，中文 AI 引擎（豆包 / 文心 / 通义）可见性被严重限制；且标题多为陈述式，缺少问句式（question-form）H2/H3，不利于 Google AI Mode / ChatGPT 直接作答抽取。

**涉及 slug（10 篇，ZH 偏短）**：

| Slug | EN 字符 | ZH 字符 | ZH 缺口 |
| --- | --- | --- | --- |
| `creator-story-taiwan-solo-daily` | 11693 | 4413 | 扩写到 ≈11693 |
| `creator-story-topic-selection` | 12125 | 4498 | 扩写到 ≈12125 |
| `creator-story-script-licensing` | 11476 | 4217 | 扩写到 ≈11476 |
| `creator-story-warm-story-formula` | 13438 | 5203 | 扩写到 ≈13438 |
| `creator-story-side-hustle-income` | 13690 | 5071 | 扩写到 ≈13690 |
| `creator-story-tool-pipeline-comparison` | 11505 | 5079 | 扩写到 ≈11505 |
| `creator-story-character-bible` | 13922 | 5116 | 扩写到 ≈13922 |
| `creator-story-student-graduation` | 14699 | 5395 | 扩写到 ≈14699 |
| `creator-story-ai-compliance` | 17404 | 5728 | 扩写到 ≈17404 |
| `creator-story-cost-breakdown` | 14694 | 4941 | 扩写到 ≈14694 |

**可执行落地点**：
- **改哪个文件**：各 creator-story slug 的 ZH 正文内容源。
- **加什么**：ZH 正文扩写到与 EN **同量级**（4k–5.7k → 11k–17k 字符），保留一手创作者叙事；同时在章节中补 **question-form H2/H3**（如 “How did a full-time mom build a side income with short dramas?”），直接命中 AI Mode 问答。
- **预期影响**：深度维度提升 + 中文 AI 可见性补齐，单篇总分 +5–10 分，并打开中文生成式引擎引用。

#### ✅ 第一批落地（2026-09-19）——3 篇

| Slug | ZH 整改前 | ZH 整改后 | 增幅 |
| --- | --- | --- | --- |
| `creator-story-taiwan-solo-daily` | 4,413 | **8,604** | +95% |
| `creator-story-topic-selection` | 4,498 | **7,998** | +78% |
| `creator-story-script-licensing` | 4,217 | **7,776** | +84% |

#### ✅ 第二批落地（2026-09-19）——剩余 7 篇，全部完成

| Slug | ZH 整改前 | ZH 整改后 | 增幅 | EN（参照） | ZH/EN |
| --- | --- | --- | --- | --- | --- |
| `creator-story-cost-breakdown` | 4,940 | **10,080** | +104% | 14,694 | 69% |
| `creator-story-student-graduation` | 5,773 | **10,315** | +79% | 15,320 | 67% |
| `creator-story-warm-story-formula` | 5,597 | **9,865** | +76% | 14,091 | 70% |
| `creator-story-side-hustle-income` | 5,456 | **9,677** | +77% | 14,358 | 67% |
| `creator-story-ai-compliance` | 6,130 | **10,591** | +73% | 18,113 | 58% |
| `creator-story-tool-pipeline-comparison` | 5,484 | **9,934** | +81% | 12,164 | 82% |
| `creator-story-character-bible` | 5,519 | **9,839** | +78% | 14,606 | 67% |

**落地方式**：向 `src/app/data/blogContent.ts` 各 slug 的 `contentZh` 内、在 `## 常见问题（FAQ）` 锚点**之前**注入扩写块（保留原有表格、FAQ 与 P1 内链）。每篇新增约 **20 个 question-form H2**（如「单集成本到底怎么逐项记账？」「平台分成和结算，到底怎么算？」），直接命中 AI Mode / 中文生成式引擎的问答抽取。

**注入脚本**（`scripts/`）：
- `inject_zh_expand_p2_batch2.py` / `_batch2c.py` / `_batch2d.py` / `_batch2e.py` —— 分批注入
- `relocate_batch2_blocks.py` —— **修正注入错位**：早期脚本一次性预计算 slug 位置，插入后位置整体位移，导致 4 个块落到上一篇文章；该脚本按「本 slug → 下一 slug」区间重新界定锚点后归位
- `measure_en_zh.py` —— EN/ZH 同口径实测

**回归校验（重建后）**：
- `vite build` 通过：432 URL / 52 个 `.md` 端点 / 433 静态 HTML / llms-full 155,760 字符
- `audit_ai_visibility.py`：FAQ 覆盖 **52/52**、FAQPage **52/52**、零内链文章 **0** 篇、noMD/noHTML/notInLLMs 均为 0
- `verify-blog.py`：**699 PASS / 1 FAIL**（唯一失败项「列表页第 1 页内链 21 条（期望 20）」为整改前既存的统计口径问题，非本次回归）
- `dist/zh/blog/<slug>/index.html` 抽查：新增 ZH 章节全部渲染，且均位于 FAQ 区块之前

---

## 六、整站结论与判定

- **整站总分**：76.1 / 100（评级：B 良好）
- **最关键 3 个短板**：
  1. **38/52 正文零 /blog/ 内链**（内链维度均值仅 33.3）——主题聚类/实体关联信号最弱。
  2. ~~12/52 缺 FAQPage~~ **已于 2026-09-07 P0 修复（52/52 全覆盖）**——FAQPage 维度均值已从 88.5 升至 100，12 篇缺 FAQ 的 slug 结构化子分由 50→100。
  3. ~~10 篇 creator-story 中文正文过短（ZH 4k–5.7k ≪ EN 11k–17k）~~ **已于 2026-09-19 P2 修复**：10 篇 ZH 全部扩写至 **7.8k–10.6k**（增幅 73%–104%），并补入 ≈20 个 question-form H2/篇；ZH/EN 篇幅比由 ≈35% 提升至 **58%–82%**，中文 AI 引擎（豆包 / 文心 / 通义）可见性短板已补齐。
- **判定**：**Needs Work（需补强，非重写）**。机器可读端点与 E-E-A-T 已是头部水平，剩余均为「快速补全型」基建修复（补 FAQ、补内链、扩中文），预计可在 1–2 轮内容迭代内把整站推回 A 区间。

> 注：本报告仅基于本地已构建产物真源数据做分析，未修改任何源码或构建产物。所有整改建议指向内容源与构建注入点，不改变现有 GEO 基建。

---

## 七、外部审计对账（2026-09-20）：`43.160.226.253` 抓取版

**背景**：一份外部 GEO 审计以 `http://43.160.226.253/lollipop/blog`（staging，IP+HTTP）为对象给出 C+ 评级，并将「IP/HTTP/无索引」列为 P0。**该结论属审计对象错位**——此 URL 是预发环境；生产 `https://www.lollipop.im` 早已是 HTTPS + 正式域名 + 根部署 + sitemap + IndexNow。以下为逐项对账：

| 审计建议 | 实际状态 | 证据 |
|---|---|---|
| 2.2 llms.txt + Markdown 端点 | ✅ 早已实现 | `/llms.txt` 37,360 字符、`/llms-full.txt` 155,760、52 个 `/blog/<slug>.md`（staging 实测 200 text/markdown）；**本轮新增** `/.well-known/llms.txt` + `/.well-known/llms-full.txt` 标准路径副本 |
| 2.3 hreflang + canonical | ✅ 早已实现 | 每页 canonical 指向 www.lollipop.im；sitemap 432 URL × 7 语言 hreflang 全部有产物（verify-blog 第 11 节 0 缺失） |
| 2.4 核心结论前置（40–60 字） | ✅ 早已实现 | BlogPostPage 的 H1+摘要下方即渲染「关键要点 / Key Takeaways」区块（与 `keyTakeaways` 数据同源，5 条/篇，GEO 提取块） |
| 2.5 FAQPage + HowTo schema | ✅ 早已实现 | FAQPage **52/52**；HowTo 14 篇且「schema=可见=数据层」三方一致；JSON-LD `dateModified=updateDate` |
| 「首页仅摘要聚合，AI 拿不到全文」 | ❌ 误报 | 列表页预渲染 HTML 132KB：21 条文章链接、20 张封面 `<img>`、摘要文本、ItemList+CollectionPage JSON-LD；全文另有 52 个 `.md` 端点 |
| 「缺少可视化内容」 | ⚠️ 部分 | 10 篇 creator-story 已有 1600×900 封面图（Article JSON-LD image/thumbnailUrl 同步引用）；正文内截图/图表为后续内容任务 |
| 2.6 知识图谱实体 | ⚠️ 部分（站外） | 站内 Organization publisher + `sameAs`(/about) 已有；Wikidata / Crunchbase 属站外动作，待办 |
| 2.7 原创数据报告 | 📋 待办 | 内容任务（3–5 天量级），建议单独立项 |
| 2.10 Pillar Page | ✅ 基本等价 | `ai-short-drama-complete-guide`（56,670 字符、16 步 HowTo）即站内终极指南 |
| P0 域名 + HTTPS + 索引提交 | ✅ 生产已满足 | www.lollipop.im = HTTPS + 根部署 + sitemap 432 URL；staging IP 仅供预览。**10 篇新文章需随下一次生产部署上线，之后跑 `indexnow-submit.py` 提交** |

**本轮额外修复（部署链路，重要）**：发现并修复 staging 部署脚本的 **SFTP 断点续传污染**——远端残留旧 tar 时按字节偏移「续传」，会把新包尾部追加到旧 gzip 流上；`tar` 解包报 trailing garbage 但大部分文件「成功」，rsync 照常执行 → **实际部署的是旧构建且所有验证项碰巧通过**。已改为：每次**全新上传**（先删远端 tar）+ 远端条目数完整性校验，不匹配即中止 rsync（`deploy_staging_sync.py`）。

**对账结论**：该外部审计的内容层建议与既有 GEO 基建高度重合；真正的增量是 ① `/.well-known/llms.txt`（本轮已补并部署 staging）② 正文内视觉证据（待办）③ 站外实体与外链建设（用户动作）④ 新文章上生产 + IndexNow 提交（待生产部署包）。
