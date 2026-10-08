# 链接审核报告 · 网文改 AI 短剧完全指南（2026）

- **审核对象**：`drafts/web-novel-to-ai-short-drama-pipeline-2026-10-06.md`（刷新初稿）
- **审核员**：连乐桥（链接策略员）
- **审核方式**：独立内链/外链审核，**未修改原稿**
- **权威 slug 库**：`src/app/data/blog.ts`（以 `slug: "..."` 形式验证存在性）

---

## 一句话结论

| 指标 | 结果 |
|---|---|
| **链接评分（0–100）** | **96** |
| **P0 数量** | **0** |
| **内链 slug 验证** | 正文 15 个去重 slug，全部存在于 `blog.ts`（0 死链） |
| **forbidden 命中数（正文）** | **0**（详见 §2） |
| **外链命中数** | **0** |

---

## 1. 内链 slug 验证（正文 H1–H2九，绝对 URL 形式）

提取正文所有 `https://www.lollipop.im/blog/<slug>`，逐 slug 用 Grep `blog.ts` 确认 `slug: "..."` 存在。共 19 个链接实例，去重 15 个 slug，全部命中白名单（Brief §5.1 白名单 13 条 + 3 个现有有效链接）。

| # | slug | 出现位置（行） | 类型 | blog.ts 存在 |
|---|---|---|---|---|
| 1 | `how-to-create-ai-short-drama` | 9, 87, 165 | 白名单 | ✅ |
| 2 | `ai-short-drama-industry-data-report-2026` | 34, 122 | 白名单 | ✅ |
| 3 | `traditional-vs-ai-short-drama-production-cost` | 45 | 现有有效链接 | ✅ |
| 4 | `mastering-character-consistency-ai-video` | 68 | 现有有效链接 | ✅ |
| 5 | `ai-scriptwriting-micro-dramas-prompts` | 71 | 现有有效链接 | ✅ |
| 6 | `top-8-ai-short-drama-engines-2026` | 99, 107 | 白名单 | ✅ |
| 7 | `ai-short-drama-complete-guide` | 99 | 白名单 | ✅ |
| 8 | `ai-influencer-platform` | 111 | 白名单 | ✅ |
| 9 | `lollipop-vs-reelshort-dramabox` | 122 | 白名单 | ✅ |
| 10 | `ai-short-drama-monetization-copyright` | 137 | 白名单 | ✅ |
| 11 | `publish-and-monetize-vertical-drama` | 162 | 白名单 | ✅ |
| 12 | `global-ai-short-drama-monetization-roi-model` | 162 | 白名单 | ✅ |
| 13 | `ai-short-drama-pillar-guide` | 167 | 白名单 | ✅ |
| 14 | `ai-short-drama-faq-2026` | 167 | 白名单 | ✅ |
| 15 | `ai-short-drama-localization` | 167 | 白名单 | ✅ |

> 本篇自身 slug `web-novel-to-ai-short-drama-pipeline` 已确认存在于 blog.ts（作为中枢被其他 Spoke 回链），正文未自链，符合刷新文惯例。
>
> **白名单对照**：正文 15 个 slug = 白名单 13 条中的 12 条（缺本篇自身，合理）+ 3 条现有有效链接（mastering-character-consistency-ai-video / ai-scriptwriting-micro-dramas-prompts / traditional-vs-ai-short-drama-production-cost）全覆盖，**无越界 slug**。

**判定**：死链 0，越界 slug 0。✅

---

## 2. forbidden slug 命中统计

逐条 grep 子串（④ 已排除 `-copyright` 前缀误判）。forbidden slug **只出现在文末「待补内链」登记区（lines 194–201）**，均为非链接的文本备注（明确标注"待发布、正文严禁链"），**正文（H1–H2九）零出现**。

| forbidden slug | 正文（H1–H2九）出现 | 备注 |
|---|---|---|
| ① reelshort-alternative-lollipop-vs-reelshort-dramabox-2026 | 0 | 仅登记区 line 194（文本） |
| ② what-is-ai-short-drama-2026 | 0 | 仅登记区 line 195（文本） |
| ③ best-ai-short-drama-platforms | 0 | 仅登记区 line 196（文本） |
| ④ ai-short-drama-monetization（裸 slug） | 0 | 正文 line 137 为 `-copyright` 变体，已排除；裸 slug 仅登记区 line 197（文本） |
| ⑤ ai-short-drama-overseas-compliance | 0 | 仅登记区 line 198（文本） |
| ⑥ ai-influencer-monetization | 0 | 仅登记区 line 199（文本） |
| ⑦ ai-short-drama-industry-trends-2026 | 0 | 仅登记区 line 200（文本） |
| ⑧ ai-short-drama-promotion-guide-2026 | 0 | 仅登记区 line 201（文本） |

**判定**：正文 forbidden 命中数 = **0**。✅

> 说明：登记区的 forbidden 文本备注为审计留痕、非链接，不计入死链风险；上线前由 content-editor 在对应文发布后补链，不在本次审核范围内。

---

## 3. 蚕食防护（意图切分 + 互链）

| 关联文 | 切分维度 | 正文互链位置 | 是否重叠展开 |
|---|---|---|---|
| `how-to-create-ai-short-drama` | 改编（拿现成 IP）vs 从零原创 | H2一 line 9（明确区分）、H2四 line 87（剧本技巧深读）、H2九 Q5 line 165 | 否——本篇只指路，不展开原创制作 |
| `publish-and-monetize-vertical-drama` | 改编生产 vs 发布分发 | H2九 Q4 line 162（发布结算流程指路） | 否——只给路径，不展开发布操作 |
| `ai-short-drama-monetization-copyright` | 改编版权边界 vs 合规全章 | H2八 line 137（商用授权/平台政策/红线深读指路） | 否——只列"风险→解法"要点，全章深读交该文 |

**判定**：三处意图切分清晰、互链到位、无重叠展开，主词 `网文改AI短剧` 唯一性保持。✅

---

## 4. 外链纪律

Grep 全稿所有 `https?://` URL，全部为 `https://www.lollipop.im/blog/...` 站内链接（含 line 172 仅为说明链接形态的示例文本，非实际链接）。无任何非 lollipop.im 外链。

**判定**：外链命中数 = **0**。✅（本系列不允许臆造外链，纪律达标）

---

## 5. 评分与问题清单

### 评分：96 / 100

| 维度 | 得分 | 说明 |
|---|---|---|
| 内链有效性（无死链） | 满分 | 15/15 slug 全部存在 |
| forbidden 防护 | 满分 | 正文 0 命中 |
| 外链纪律 | 满分 | 0 外链 |
| 蚕食防护 | 满分 | 意图切分 + 互链到位 |
| 锚文本/结构规范 | -4 | 见 P2-1 |

### P0（阻断级，必须修）
**无**。

### P1（重要，建议修）
**无**。

### P2（建议优化，非阻断）
- **P2-1（信息项）**：文末「建议内链清单」登记表（lines 174–190）使用相对路径 `/blog/<slug>`，而正文统一使用绝对 URL `https://www.lollipop.im/blog/<slug>`。登记表仅供主理人校验、非上线链接，不影响死链，但建议统一为绝对 URL 形式以保持全稿一致、便于自动校验。
- **P2-2（信息项）**：正文未自链本篇中枢 slug `web-novel-to-ai-short-drama-pipeline`。刷新文通常不需自链；若希望强化 Hub 锚点，可在 H2三 五步流水线段首以"本指南五步流水线"自指一次，非必需。

---

## 审核结论

初稿链接层**通过独立审核**：无死链、无 forbidden 正文命中、无外链、蚕食防护到位。可直接进入 FINAL 整合；P2 为可选优化，不改亦不阻断上线。
