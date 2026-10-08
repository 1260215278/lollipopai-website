# 链接策略报告：AI 短剧出海合规指南 2026（出海合规缺口文 · 第 ⑤ 篇）

> 链接策略师：连乐桥（审计）｜ 日期：2026-10-06
> 稿件：`drafts/ai-short-drama-overseas-compliance-2026-10-06.md`
> 研究 Brief：`research/brief-ai-short-drama-overseas-compliance-2026-10-06.md`
> 参考（口径对齐）：`reports/link-report-best-ai-short-drama-platforms-2026-10-06.md`（③）
> 核查依据：`src/app/data/blog.ts`（以 `titleZh` 字段为简中版权威判定）、`src/app/multilangSubset.ts`、`brief-*` §5/§7/§8

---

## 一、文章概览

| 项目 | 数值 |
|---|---|
| 文章主题 | AI 短剧出海合规指南 2026：欧美/东南亚内容准入 + 跨境版权 + 海外 AI 标识 + 平台政策（信任建设型缺口文） |
| 主关键词 | `AI 短剧出海合规`（独占，详见 §六） |
| 正文内链（链接实例 / 不同目标） | **12 条实例 / 10 个不同 slug**（均以 `?lang=zh-CN` 链接） |
| 外链（真实超链） | **7 条**（EU AI Act / 美国版权局 / artificialintelligenceact.eu / TikTok / Netflix / ReelShort / DramaBox）+ 1 处"各国版权局 URL 待人工核实"（无编造） |
| 待补内链 | 5 条（①②③④ + ⑥⑦⑧⑨⑩ 合并说明），仅列于文末「待补内链」块，正文零植入 |
| 死链 / 误配（forbidden slug 入正文） | **0 条（P0 = 0）** |
| 语言版本匹配 | 全部正确（无错配） |
| **内容健康度评分（当前）** | **93 / 100** |

---

## 二、逐项评审表（六维）

| # | 评审维度 | 结论 | 扣分 | 说明 |
|---|---|---|---|---|
| 1 | **死链风险（P0）** | ✅ 通过 | 0 | 正文零 forbidden slug（①②③④ + ⑥⑦⑧⑨⑩，含 `best-ai-short-drama-platforms`）；仅文末「待补内链」块列出，未植入正文。 |
| 2 | **内链正确性** | ✅ 通过 | 0 | 正文 12 条实例指向 Brief §5.1 的 10 个已验证 `titleZh` slug，拼写与 `/blog/<slug>?lang=zh-CN` 格式逐条核对无误；H2七 对 4 篇国内合规文前链正确。 |
| 3 | **内链分布与锚文本** | ⚠️ 基本通过 | 轻微 | 锚文本描述性强、自然嵌入；但 H2七 表内 `ai-drama-legal-checklist` 重复 2 次、`monetization-copyright` 跨 H2五/七 重复；H2一~四、H2六 零内链（集中 H2五/七/八/九），符合 Brief 规划但早期段落偏空。 |
| 4 | **外链评估** | ✅ 通过 | 0 | 7 条外链全部为官方根域/法规原文，无编造 URL；"各国版权局"正确标"待人工核实"未编造；锚文本合理（政策中心/法规原文）。2 个平台根域本次 fetch 波动（非 404），建议上线前人工打开复检。 |
| 5 | **蚕食防护** | ✅ 通过 | 0 | H2七 仅 5 行摘要 + 前链 4 篇国内文、不展开；H2九 CTA 链出海 ROI 文、不展开赚钱模型；主词 `AI 短剧出海合规` 仅本篇使用；llms.txt 三集互斥成立。 |
| 6 | **待补内链接接** | ✅ 通过 | 0 | 文末清楚列出 ①②③④ + ⑥⑦⑧⑨⑩ 并说明"经 grep blog.ts = 0、正文严禁链、待批量发布接回"，说明充分。 |

---

## 三、维度一：死链风险（P0）— ✅ 0 处

> 核查方法：扫描正文全部 `/blog/<slug>?lang=zh-CN` 与裸 slug，比对 Brief §5.2 forbidden 清单（①②③④ + ⑥⑦⑧⑨⑩，含 `best-ai-short-drama-platforms`）。

- 正文内链目标仅出现在 §五 的 10 个已验证 `titleZh` slug（见 §七内链地图），**无任何 forbidden slug 入正文**。
- `best-ai-short-drama-platforms`（③ 平台排名文，本批未入库）仅出现在文末「待补内链」块，**未植入正文** → 无死链。
- `what-is-ai-short-drama-2026` / `reelshort-alternative-*` / `ai-short-drama-monetization` 等同仅列于待补块。
- **结论：P0 = 0，符合"发布前严禁链未入 blog.ts 的 slug"硬性约束。**

---

## 四、维度二：内链正确性 — ✅ 通过

> 逐条核验：正文每个 `/blog/<slug>?lang=zh-CN` 是否均来自 Brief §5.1 已验证 10 slug；拼写与格式是否正确。

| # | 锚文本 | 目标 slug | 出现位置 | Brief §5.1 验证 | 拼写/格式 | 结论 |
|---|---|---|---|---|---|---|
| 1 | AI 短剧变现与版权（商用授权/红线） | ai-short-drama-monetization-copyright | H2五 L66 | ✅ #4 | ✅ | 正确 |
| 2 | AI 短剧版权与合规白皮书 | ai-copyright-compliance | H2七 L86 | ✅ #1 | ✅ | 正确 |
| 3 | AI 短剧发布前合规清单 | ai-drama-legal-checklist | H2七 L87 | ✅ #2 | ✅ | 正确 |
| 4 | AI 生成内容合规实操路线 | creator-story-ai-compliance | H2七 L88 | ✅ #3 | ✅ | 正确 |
| 5 | AI 短剧发布前合规清单 | ai-drama-legal-checklist | H2七 L89 | ✅ #2 | ✅ | 正确（重复实例） |
| 6 | AI 短剧变现与版权（商用授权/红线） | ai-short-drama-monetization-copyright | H2七 L90 | ✅ #4 | ✅ | 正确（重复实例） |
| 7 | AI 网红平台（出海人物变现） | ai-influencer-platform | H2八 L107 | ✅ #10 | ✅ | 正确 |
| 8 | 竖屏 AI 短剧发布与变现全流程 | publish-and-monetize-vertical-drama | H2八 L107 | ✅ #6 | ✅ | 正确 |
| 9 | AI 短剧工具对比矩阵 | ai-tools-comparison | H2九 Q5 L124 | ✅ #9 | ✅ | 正确 |
| 10 | 如何制作 AI 短剧（新手指南） | how-to-create-ai-short-drama | H2九 L128 | ✅ #7 | ✅ | 正确 |
| 11 | 2026 出海 AI 短剧变现测算与分成模型 | global-ai-short-drama-monetization-roi-model | H2九 L128 | ✅ #5 | ✅ | 正确 |
| 12 | AI 短剧制作完全指南（全景 Hub） | ai-short-drama-pillar-guide | H2九 L128 | ✅ #8 | ✅ | 正确 |

**H2七 对 4 篇国内合规文前链专项核验**（任务重点）：

| H2七 行 | 维度摘要 | 前链 slug | 是否正确 |
|---|---|---|---|
| 版权音乐 | 国内商用需拿授权 | ai-copyright-compliance | ✅ |
| 肖像权 | AI 角色避免可识别真实人物 | ai-drama-legal-checklist | ✅ |
| AI 生成声明 | 国内平台普遍要求标注 | creator-story-ai-compliance | ✅ |
| 平台政策 | 各平台自审规则 | ai-drama-legal-checklist | ✅（无独立"国内平台政策"文，指向 legal-checklist 合理） |
| 备案 | AIGC 微短剧需备案 | ai-short-drama-monetization-copyright | ✅（与 Brief §5.1 #4 "国内地图备案行前链"一致） |

→ 4 篇国内合规文（`ai-copyright-compliance` / `ai-drama-legal-checklist` / `creator-story-ai-compliance` / `ai-short-drama-monetization-copyright`）**前链全部正确，无遗漏、无错链**。

---

## 五、维度三：内链分布与锚文本

**分布**：内链集中在 H2五（1）、H2七（5）、H2八（2）、H2九（4）；H2一/H2二/H2三/H2四/H2六 零内链。该布局与 Brief §5.1 规划的"内链去向"一致（规划本就只给 H2五/七/八/九 指派内链），属合规，但早期教育段（尤其 H2三 欧美、H2六 AI 标识）略空，可作 P2 轻补。

**锚文本**：均为描述性中文、自然嵌入句中（如"通用授权与商用红线，这篇不展开，交给…深读"），无"点击这里"等生硬措辞。

**需关注的轻微重复（P2）**：
- H2七 表内 `ai-drama-legal-checklist` 出现 2 次（肖像权行 + 平台政策行）——同一目标在同表重复，建议平台政策行改用措辞差异或注明"同见发布前清单"，避免读者困惑。
- `ai-short-drama-monetization-copyright` 跨 H2五（inline）与 H2七（备案行）出现 2 次——语境不同可接受，但 CTA 处可考虑变体锚文本。

---

## 六、维度四：外链评估

> 本次对 7 条外链做可达性复核（与 ③ 报告口径一致）。

| # | 来源 | 核实 URL | 稿件位置 | 可达性复核 | 标注状态 | 结论 |
|---|---|---|---|---|---|---|
| 1 | TikTok 帮助中心 | https://support.tiktok.com/ | H2三/八 L40 | ⚠️ 本次 fetch 失败（网络波动，官方根域非 404） | Brief：根域✅，深链待人工核实 | 合理，上线前人工打开 |
| 2 | Netflix 帮助中心 | https://help.netflix.com/ | H2三 L40 | ⚠️ 本次返回空（JS 重页/反爬，官方根域） | Brief：根域✅，深链待人工核实 | 合理，上线前人工打开 |
| 3 | ReelShort 官网 | https://www.reelshort.com/ | H2三 L40 | ✅ 稳定可达 | Brief：根域⚠️，深链待人工核实 | 合理 |
| 4 | DramaBox 官网 | https://www.dramabox.com/ | H2三 L40 | ✅ 稳定可达 | Brief：根域⚠️，深链待人工核实 | 合理 |
| 5 | 美国版权局 | https://www.copyright.gov/ | H2五 L62 | ✅ 稳定可达（U.S. Copyright Office 官方） | Brief：✅ 官方可查 | 正确 |
| 6 | EU AI Act 原文 | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689 | H2六 L72 | ⚠️ 返回 202（反爬，官方 CELEX URI 有效） | Brief：✅ 官方可查 | 正确（法规编号 32024R1689 未臆造） |
| 7 | artificialintelligenceact.eu | https://artificialintelligenceact.eu/ | H2六 L72 | ✅ 稳定可达（EU AI Act 解读站） | Brief：✅ 可查（非官方法律文本） | 正确，已标注"解读非官方法律文本" |

**第 8 项（各国版权局）**：稿件 L52 写"具体各国版权局 URL 待人工核实"，**未编造 URL**，与 Brief §7 #8（❌ 待人工核实）一致 → 处理正确。

**结论**：7 条外链全部为真实官方根域/法规原文，**无任何编造 URL**；锚文本合理（"政策中心/法规原文/解读"）；"待人工核实"标注到位。仅 2 个平台根域本次 fetch 波动，已建议上线前人工逐一打开确认（属 Brief §10.4 上线前置项）。

---

## 七、维度五：蚕食防护

> 评估对象：本篇 vs 4 篇国内合规文 + `global-ai-short-drama-monetization-roi-model`（出海 ROI）。

| 对手文 | 其意图 | 本篇是否越界 | 处理方式 | 风险 |
|---|---|---|---|---|
| `ai-copyright-compliance` 等 4 篇国内文 | 国内/通用合规（版权音乐/肖像/AI声明/平台政策/备案） | **否**。H2七 仅 5 行摘要 + 前链，明确"本篇不展开国内维度" | 已前链 ✅ | 低 |
| `global-ai-short-drama-monetization-roi-model` | 出海变现测算/分成模型（赚钱向） | **否**。H2九 CTA 链出做深读，L128 写"想把'合规准入'接到'出海怎么赚钱'"，不展开赚钱模型 | 已内链 ✅（合规广度 vs 赚钱深度） | 低 |

- **主词唯一性**：`AI 短剧出海合规` 仅本篇（⑤）使用；语义变体（出海版权/海外合规/平台政策/全球化合规）亦仅本篇承载，与 4 国内文（国内/通用）、出海 ROI（赚钱模型）意图互斥 → 与 Brief §8.1/§8.2/§8.6 完全一致。
- **llms.txt 三集互斥**：本篇→"overseas compliance 2026"；4 国内文→各自"domestic compliance"；出海 ROI→"overseas ROI model"。成立。
- **残留风险**：无。本篇边界声明充分（L30、L82、L128 均显式"不展开/交 X 文"）。

**结论：蚕食风险 LOW（可控），无需修改。**

---

## 八、维度六：待补内链接接 — ✅ 通过

文末「待补内链」块（L147–155）清楚列出：
- ① `what-is-ai-short-drama-2026`、② `reelshort-alternative-lollipop-vs-reelshort-dramabox-2026`、③ `best-ai-short-drama-platforms`、④ `ai-short-drama-monetization`
- ⑥⑦⑧⑨⑩ 后续批次 slug
- 并说明"经 grep `blog.ts` = 0（不在数据层、无简中版、URL 不可访问），正文严禁链接，待对应批次发布且 URL 可访问后，由内容编辑/主理人批量接回"

→ 说明充分、与 Brief §5.2 一致，**接回时序与责任方清晰**。

---

## 九、内链地图（锚文本 → slug → H2）

```
[Pillar] ai-short-drama-pillar-guide  ──H2九──▶ (全景 Hub CTA)
   │
   ├─ 国内合规前链（H2七 地图总表，仅摘要）
   │    ai-copyright-compliance                (版权音乐行)
   │    ai-drama-legal-checklist  ×2           (肖像权行 / 平台政策行)
   │    creator-story-ai-compliance            (AI 生成声明行)
   │    ai-short-drama-monetization-copyright  (备案行；另 H2五 跨境版权深读)
   │
   ├─ 出海 ROI CTA（H2九，不展开赚钱模型）
   │    global-ai-short-drama-monetization-roi-model
   │
   ├─ 发布/教程/工具/人物 Spoke
   │    publish-and-monetize-vertical-drama    (H2八)
   │    ai-influencer-platform                (H2八 likeness)
   │    how-to-create-ai-short-drama           (H2九)
   │    ai-tools-comparison                    (H2九 Q5)
   │
   └─ 待补接回（仅列文末，正文零植入）
        what-is-ai-short-drama-2026 (①)
        reelshort-alternative-* (②)
        best-ai-short-drama-platforms (③)
        ai-short-drama-monetization (④)
        ⑥⑦⑧⑨⑩ 后续批次
```

| 锚文本 | slug | H2 | 用途 |
|---|---|---|---|
| AI 短剧变现与版权（商用授权/红线） | ai-short-drama-monetization-copyright | H2五 / H2七 | 跨境版权通用授权深读 + 国内备案前链 |
| AI 短剧版权与合规白皮书 | ai-copyright-compliance | H2七 | 国内版权音乐深读 |
| AI 短剧发布前合规清单 | ai-drama-legal-checklist | H2七 | 国内肖像权/平台政策深读 |
| AI 生成内容合规实操路线 | creator-story-ai-compliance | H2七 | 国内 AI 声明深读 |
| 竖屏 AI 短剧发布与变现全流程 | publish-and-monetize-vertical-drama | H2八 | 发布操作流程指路 |
| AI 网红平台（出海人物变现） | ai-influencer-platform | H2八 | 出海人物 likeness 轻链 |
| AI 短剧工具对比矩阵 | ai-tools-comparison | H2九 | 出海创作工具选型 |
| 如何制作 AI 短剧（新手指南） | how-to-create-ai-short-drama | H2九 | 出海创作实操 CTA |
| 2026 出海 AI 短剧变现测算与分成模型 | global-ai-short-drama-monetization-roi-model | H2九 | 出海 ROI 深读（不展开） |
| AI 短剧制作完全指南（全景 Hub） | ai-short-drama-pillar-guide | H2九 | 全景承接 CTA |

> 正文共 12 条链接实例 / 10 个不同 slug，全部为已验证 `titleZh` 简中页，零 forbidden 入正文。

---

## 十、内容健康度评分（六维）

| 维度 | 权重 | 得分 | 说明 |
|---|---|---|---|
| 死链防护 / 链接完整性 | 25% | 25/25 | P0=0；10 个已验证 slug 全覆盖；待建 slug 仅列待补块；7 外链 0 编造 |
| 锚文本质量 | 20% | 18/20 | 描述性强、自然嵌入；H2七 `legal-checklist` 重复 2 次、`monetization-copyright` 跨段重复，略扣 |
| 聚类连通性 | 20% | 19/20 | 10 Spoke + Pillar + 出海ROI + 国内4篇前链闭环完整；仅缺定义类前链（本篇无依赖，可接受） |
| 链接分布 | 15% | 12/15 | 符合 Brief 规划但 H2一~四/六 零内链，早期段落偏空（P2） |
| 蚕食防护 | 10% | 10/10 | H2七仅摘要+前链、H2九不展开 ROI、主词独占、三集互斥 |
| 竞品对标 / GEO | 10% | 9/10 | 出海合规中文空白蓝海；外链权威且标核实状态；2 平台根域 fetch 波动需复检 |
| **合计** | **100%** | **93/100** | 严格遵循 Brief，P0 为零、内链全对、蚕食防护到位 |

---

## 十一、必须修改项（P0 / P1）

- **P0：0 项**。正文无 forbidden slug 入链，无死链风险。✅
- **P1：0 项**。内链正确性、外链真实性、蚕食防护、待补内链接接均达标，无必须修改项。

> 本稿在链接层面已可直接进入发布前置复核（仅剩"发布前人工打开 7 条外链 + 确认 ①②③④ 是否已发布"两项运营动作，见 §十二）。

---

## 十二、建议优化项（P2）

1. **H2七 平台政策行锚文本**：同表 `ai-drama-legal-checklist` 出现 2 次（肖像权 + 平台政策）。建议平台政策行改为"各平台自审规则（详见发布前合规清单）"或注明同指，避免同表重复跳转。
2. **早期段落补 1–2 条内链（分布均衡）**：H2三（欧美）可在末段轻链 `global-ai-short-drama-monetization-roi-model`（"出海赚钱模型另文"）做意图切分明示；H2六（AI 标识）可轻链 `creator-story-ai-compliance` 做"国内 AI 声明 vs 海外标识"对比锚点。非强制，仅改善前段密度。
3. **CTA 锚文本变体**：`ai-short-drama-monetization-copyright` / `how-to-create-ai-short-drama` 等在文末 CTA 处若觉重复，可用口语变体（如"动手做出海第一部"）提升自然度。
4. **外链上线前人工复检**：support.tiktok.com、help.netflix.com 本次 fetch 波动，eur-lex 反爬返回 202——三者均为官方根域有效，但发布前须人工逐一打开确认可用（Brief §10.4 上线前置项）；若具体合规深链不可用，维持"以官方最新发布为准"。
5. **跨文回链落实**：确认 4 篇国内合规文、出海 ROI 文、Pillar 等已回链本篇（双向互链，权重归一）；`lollipop-vs-reelshort-dramabox` 等不在本篇域内，不涉。

---

## 十三、实施清单（给内容编辑 / 主理人）

**死链防护（已达标，保持）**
- [x] 正文零 forbidden slug（①②③④ + ⑥⑦⑧⑨⑩ 含 best-ai-short-drama-platforms）
- [x] 待建 slug 仅列文末待补块，未植入正文

**发布前运营动作（非稿件修改）**
- [ ] 确认 ①②③④ 是否已发布；已发布则补对应回链，未发布维持暂挂
- [ ] 人工逐一打开 7 条外链（TikTok/Netflix 根域 + eur-lex 反爬）确认可用，不可用则维持"以官方最新为准"
- [ ] 确认 4 国内文 / 出海 ROI / Pillar 已回链本篇（双向互链）

**P2 优化（可选）**
- [ ] H2七 平台政策行锚文本去重
- [ ] H2三 / H2六 各补 1 条早期内链改善分布
- [ ] CTA 锚文本变体

**llms.txt 对齐**
- [ ] 本篇 slug `/blog/ai-short-drama-overseas-compliance` 列入 "AI short drama overseas compliance 2026" 集
- [ ] 与 4 国内文（domestic compliance）、出海 ROI（overseas ROI model）三集互斥声明落盘
- [ ] 主词 `AI 短剧出海合规` 仅本篇使用

---

## 十四、审计结论（给用户的摘要）

- **总分：93 / 100**（链接完整性与外链合规本就领先；主要"扣分项"仅为分布略偏后段与表内锚文本轻微重复，均属 P2）。
- **P0 数量：0**。正文零 forbidden slug 入链、零死链；待建 ①②③④ + ⑥⑦⑧⑨⑩ 仅列文末待补块，符合"发布前严禁链未入 blog.ts 的 slug"硬约束。
- **内链正确性：全对**。12 条实例 / 10 个已验证 `titleZh` slug，拼写与格式无误；H2七 对 4 篇国内合规文前链全部正确。
- **外链：7 条均为真实官方根域/法规原文，零编造**；"各国版权局"正确标"待人工核实"。2 个平台根域 fetch 波动（非 404），已建议上线前人工复检。
- **蚕食防护：LOW（可控）**。H2七仅摘要+前链、H2九不展开 ROI、主词独占、llms.txt 三集互斥，与 Brief §8 完全一致。
- **最关键 3 条修改/优化建议**：
  1. （保持/确认）**P0 已为零，核心动作是发布前人工打开 7 条外链并确认 ①②③④ 是否已发布**——已发布则补回链，否则维持暂挂防死链。
  2. （P2）**H2七 平台政策行与肖像权行同链 `ai-drama-legal-checklist`**，建议去重或注明同指，避免同表重复跳转。
  3. （P2）**早期 H2三/H2六 零内链**，建议在欧美段末链出海 ROI、AI 标识段轻链国内 AI 声明文，改善前段分布密度与意图切分明示。

*本报告仅出链接策略与内容健康度建议，未修改稿件或代码。所有内链目标均经 `src/app/data/blog.ts` 的 `titleZh` 字段 + Brief §5.1 交叉验证；7 条外链均经实时可达性复核（4 条稳定可达，3 条为官方根域/反爬波动，均非 404、无编造）。*
