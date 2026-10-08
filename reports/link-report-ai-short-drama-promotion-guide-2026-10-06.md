# 链接审核报告：AI 短剧投流推广完全指南（2026）

> 审核员：连乐桥（链接策略员 / link-strategist）
> 审核对象初稿：`drafts/ai-short-drama-promotion-guide-2026-10-06.md`
> 依据 Brief：`research/brief-ai-short-drama-promotion-guide-2026-10-06.md`
> 审核性质：**独立内链/外链审核，未改动原稿**

---

## 0. 总评分速览

| 指标 | 数值 |
|---|---|
| **链接评分（0–100）** | **88** |
| **P0 问题数** | **0** |
| 正文白名单内链数（条） | **18**（覆盖 12 个白名单 slug 全部） |
| forbidden slug 正文命中数 | **0** |
| 外链（正文）命中数 | **0** |

结论：正文内链纪律**优秀**——白名单全覆盖、零 forbidden、零外链、零死链。扣分点集中在 1 处锚文本误标（P1）与若干锚文本偏离 Brief 建议（P2），不影响上线，建议整合 FINAL 时顺手修正。

---

## 1. 白名单内链逐条核对（正文 H1–H2九，共 18 条）

正文范围：初稿第 1–156 行（H1 至 H2九 FAQ 结束；第 159 行起为「建议内链清单」登记区，不计入正文）。

| # | 行号 | 锚文本 | slug | 在 12 白名单 | 带 `?lang=zh-CN` | 评估 |
|---|---|---|---|---|---|---|
| 1 | 14 | 竖屏 AI 短剧发布与变现全流程 | publish-and-monetize-vertical-drama | ✅ | ✅ | 与 Brief §5.1 建议锚文本完全一致 |
| 2 | 32 | 2026 AI 短剧行业数据报告 | ai-short-drama-industry-data-report-2026 | ✅ | ✅ | 一致 |
| 3 | 49 | 三家平台分成对比 | lollipop-vs-reelshort-dramabox | ✅ | ✅ | 上下文合理（Brief 建议「Lollipop Drama vs ReelShort vs DramaBox」，此处用场景化表述，可接受） |
| 4 | 51 | 发布与变现全流程 | publish-and-monetize-vertical-drama | ✅ | ✅ | 合理变体 |
| 5 | 64 | AI 短剧本地化指南 | ai-short-drama-localization | ✅ | ✅ | 合理变体 |
| 6 | 64 | 2026 出海变现测算与分成模型 | global-ai-short-drama-monetization-roi-model | ✅ | ✅ | 合理变体 |
| 7 | 86 | 出海变现 ROI 测算 | global-ai-short-drama-monetization-roi-model | ✅ | ✅ | 与 Brief §5.1「出海变现 ROI 测算」对齐 |
| 8 | 98 | 2026 年八大 AI 短剧引擎 | top-8-ai-short-drama-engines-2026 | ✅ | ✅ | 一致 |
| 9 | 98 | AI 短剧制作全流程手册 | ai-short-drama-complete-guide | ✅ | ✅ | 一致 |
| 10 | 98 | 如何制作 AI 短剧 | how-to-create-ai-short-drama | ✅ | ✅ | 一致 |
| 11 | 98 | AI 网红平台 | ai-influencer-platform | ✅ | ✅ | 与 Brief「AI网红平台」对齐 |
| 12 | 112 | 行业数据报告 | ai-short-drama-industry-data-report-2026 | ✅ | ✅ | 合理变体 |
| 13 | 119 | 变现与版权红线 | ai-short-drama-monetization-copyright | ✅ | ✅ | 合理缩写（Brief 建议「AI 短剧变现与版权：商用授权与红线」） |
| 14 | 125 | 投流 ROI | global-ai-short-drama-monetization-roi-model | ✅ | ✅ | ⚠️ **锚文本误标，见 P1** |
| 15 | 150 | 素材本地化 | ai-short-drama-localization | ✅ | ✅ | 合理变体 |
| 16 | 153 | 全流程指南 | publish-and-monetize-vertical-drama | ✅ | ✅ | 合理变体 |
| 17 | 155 | 制作完全指南（Hub） | ai-short-drama-pillar-guide | ✅ | ✅ | 一致 |
| 18 | 155 | 常见问题全解 60 问 | ai-short-drama-faq-2026 | ✅ | ✅ | 一致 |

**核对结论**：
- 18 条内链全部命中 12 白名单 slug，**无越界 slug**。
- 12 个白名单 slug **全部被引用至少一次**，覆盖面满分。
- 18 条**全部带 `?lang=zh-CN`**，语言参数零遗漏。

---

## 2. Forbidden slug 正文命中统计

对正文（第 1–156 行）逐条 Grep 7 个 forbidden slug（①②③④⑤⑥⑦）及其 slug 形式：

- 用 `\b` 边界 Grep 时，第 64/86/119/125/165/166 行命中 `ai-short-drama-monetization` 子串——均为**白名单 slug 的前缀**（`ai-short-drama-monetization-copyright`、`global-ai-short-drama-monetization-roi-model`），属误命中，**非 forbidden ④ 独立出现**。
- 真正的 forbidden 独立 slug（①②③④⑤⑥⑦）**仅出现在第 179–185 行的「待补内链」登记区**（初稿第 159 行之后，不属于正文 H1–H2九），且均为纯文本登记、未做成链接。

**正文 forbidden 命中数 = 0（达标，零死链）。**

> 说明：第 179–185 行登记 forbidden slug 是作者刻意留的「待接回」清单，非正文链接，符合 Brief §5.2/§8.6「正文严禁链，仅登记」的纪律，不计入违规。

---

## 3. 外链纪律核对

对初稿全文 Grep `https?://` 与 `www\.`：**零匹配**。正文（及全文）**无任何外链 URL**，符合本系列「不臆造外链、权威来源只登记在 Brief §7 标待人工核实」的纪律。

**外链命中数 = 0（达标）。**

---

## 4. 关键词蚕食防护核对（意图切分 + 互链）

| 关系对 | 切分是否清晰 | 互链是否到位 | 是否重叠展开 | 结论 |
|---|---|---|---|---|
| 本篇（投流/需求侧增长） vs `publish-and-monetize-vertical-drama`（供给侧闭环） | ✅ 第 13–17 行明确定义「需求侧增长 vs 供给侧闭环」；第 51 行明示「本文只讲投流增长，不展开单平台结算操作」 | ✅ 第 14/51/153 行三处内链指路 | ✅ 未展开上传→审核→分账操作 | 达标 |
| 本篇（增长） vs `ai-short-drama-monetization-copyright`（合规红线） | ✅ 第 15–16 行定义「合规红线」；第 119 行「提前看…平台政策清单」只点结论 | ✅ 第 119 行内链 | ✅ 未展开合规细节 | 达标 |
| 本篇（投流 ROI） vs `global-ai-short-drama-monetization-roi-model`（变现 ROI / 收入模型） | ✅ 第 68–75 行显式区分「投流 ROI（花钱买量）≠ 变现 ROI（收入模型）」，第 84/86 行再次强调 | ✅ 第 64/86 行内链，第 125 行意图区分（但锚文本有误，见 P1） | ✅ 未混用同一「ROI」词、未重叠展开 | 基本达标（锚文本 P1 待修） |

三对核心边界均做了**意图切分 + 单向/双向指路 + 无重叠展开**，蚕食防护到位。

**互链完整性备注（非缺陷）**：本篇对三篇核心文均做了**出站指路**（本篇→他文）。Brief §8 要求的「双向互链」（他文→本篇）需在对应三篇的稿件中落实，单看本篇无法核验，列为整合 FINAL 时的跨文收尾项，不计入本稿扣分。

---

## 5. 问题清单（P0 / P1 / P2）

### P0（致命，死链/外链违规）—— 0 条
无。正文 forbidden 命中 0、外链 0、白名单外 slug 0。

### P1（应修，正确性）—— 1 条
**P1-1｜第 125 行锚文本误标**
- 原文：`解法：严格区分[投流 ROI](/blog/global-ai-short-drama-monetization-roi-model?lang=zh-CN)（花钱买量）和变现 ROI（收入模型）。`
- 问题：可见锚文本写「投流 ROI」并括注「（花钱买量）」，但其链接指向的是 `global-ai-short-drama-monetization-roi-model`（即 Brief 定义的**变现 ROI / 出海收入模型**文章）。读者点「投流 ROI（花钱买量）」会落到变现 ROI 文，预期错位；且该文主题恰是「投流 ROI ≠ 变现 ROI」，链接却反把「投流 ROI」指向了变现 ROI 文，自相矛盾。
- 建议：将链接锚文本改为「**变现 ROI**」并保留括注「（收入模型）」，让链接落在正确的目的地；或保留「投流 ROI」文字但**不包裹链接**（仅把「变现 ROI（收入模型）」做成链接指向该文）。即：`严格区分投流 ROI（花钱买量）和[变现 ROI](/blog/global-ai-short-drama-monetization-roi-model?lang=zh-CN)（收入模型）`。

### P2（可优化，一致性）—— 4 条
**P2-1｜第 49 行锚文本偏离 Brief 建议**
- 原文：`[三家平台分成对比](/blog/lollipop-vs-reelshort-dramabox?lang=zh-CN)`
- 说明：场景化表述可接受，但若追求锚文本规范统一，建议靠拢 Brief §5.1 建议「Lollipop Drama vs ReelShort vs DramaBox（2026）分成对比」。非必须。

**P2-2｜第 51 / 153 行锚文本为缩写**
- 原文：`[发布与变现全流程]`、`[全流程指南]` 均链 `publish-and-monetize-vertical-drama`。
- 说明：与 Brief 建议锚「竖屏 AI 短剧发布与变现全流程」为合理变体，上下文清晰，可保留；若统一品牌词可改为全称。

**P2-3｜第 150 行锚文本为缩写**
- 原文：`[素材本地化](/blog/ai-short-drama-localization?lang=zh-CN)`
- 说明：与 Brief 建议「AI 短剧本地化：翻译/配音/对口型」为合理变体，可接受。

**P2-4｜第 119 行锚文本为缩写**
- 原文：`[变现与版权红线](/blog/ai-short-drama-monetization-copyright?lang=zh-CN)`
- 说明：与 Brief 建议「AI 短剧变现与版权：商用授权与红线」为合理缩写，可接受。

---

## 6. 评分依据

| 维度 | 权重（自评） | 得分 | 说明 |
|---|---|---|---|
| 白名单覆盖率 | 25% | 100 | 12/12 slug 全引用，18 条内链 |
| `?lang=zh-CN` 合规 | 15% | 100 | 18/18 全带 |
| forbidden 死链防护 | 25% | 100 | 正文 0 命中 |
| 外链纪律 | 15% | 100 | 正文 0 外链 |
| 蚕食防护（意图切分+互链） | 15% | 90 | 三对边界清晰、互链到位，仅互链双向性待跨文收尾 |
| 锚文本准确性 | 5% | 60 | 1 处 P1 误标，4 处 P2 缩写 |

**加权评分 ≈ 88/100。**

---

## 7. 给主理人整合 FINAL 的提示
1. 修 P1-1（第 125 行锚文本误标）——唯一影响正确性的项，务必改。
2. P2 四项为可选统一，按品牌锚文本规范酌情处理。
3. 跨文任务：在 `publish-and-monetize-vertical-drama`、`ai-short-drama-monetization-copyright`、`global-ai-short-drama-monetization-roi-model` 三篇中补**回链**（他文→本篇），完成 Brief §8 要求的双向互链。
4. forbidden ①②③④⑤⑥⑦⑨⑩ 仍不得链入正文，待其批量发布且 URL 可访问后再由 content-editor 接回（时序前置）。
