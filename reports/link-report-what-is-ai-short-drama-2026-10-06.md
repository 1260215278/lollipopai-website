# 链接策略报告：AI短剧是什么？（定义型柱石 ②，连乐桥）

> 链接策略师：连乐桥 ｜ 日期：2026-10-06
> 稿件：`drafts/what-is-ai-short-drama-2026-10-06.md`
> 研究 Brief：`research/brief-what-is-ai-short-drama-2026-10-06.md`
> 参考（结构对齐）：`reports/link-report-lollipop-vs-reelshort-dramabox-2026-10-06.md`（①）
> 核查依据：`src/app/data/blog.ts`、`src/app/multilangSubset.ts`、`src/app/i18n.tsx`（?lang= 兼容逻辑）、`tests/locale-path.test.mjs`、`dist/zh/blog/`（当前预渲染产物）

---

## 一、文章概览

| 项目 | 数值 |
|---|---|
| 文章主题 | AI短剧是什么？2026 完整指南：定义·形态·与传统/微短剧的区别·制作流程（新手入门定义型柱石） |
| 主关键词 | `AI短剧是什么`（首选）／ 同义 `什么是AI短剧` |
| 自身 URL Slug | `/blog/what-is-ai-short-drama-2026`（⚠️ 当前 `dist/zh/blog/` 与 `blog.ts` 均**尚未存在**——未发布稿，符合预期） |
| 正文内链（不同目标） | **9 个** 博客内链（共 15 次出现） |
| 正文外链（权威引用超链） | **3 条**（中新网 / 央视网 / 河北日报），均 HTTP 200 可达 |
| 语言版本匹配 | 全部正确（无错配） |
| 断链 / 误配 | **0 条**（详见第三节、第四节） |
| **内容健康度评分（当前）** | **89 / 100** |
| **内容健康度评分（实施本报告建议后预估）** | **96 / 100** |

---

## 二、内容健康度六维评分

> 核查方法：逐一比对 `dist/zh/blog/<slug>` 预渲染产物 + `blog.ts` 的 `titleZh` 字段 + 路由对 `?lang=zh-CN` 的兼容逻辑（`i18n.tsx:2636` 起：旧 `?lang=xx` 会被规范化为路径前缀 `/zh/`，即简中）。

| 维度 | 权重 | 当前得分 | 说明 |
|---|---|---|---|
| 链接完整性 | 25% | 24/25 | 9 个不同内链目标 + 3 条权威外链，已超过「3–5 内链 + 2–3 外链」基准。仅 minor 缺口：广电总局备案政策为纯文本引用、无 URL（详见第四节）。实施后可达 25/25。 |
| 锚文本质量 | 20% | 18/20 | 所有锚文本描述性强、自然，且与目标 `titleZh` 对齐（如「什么是微短剧（格式定义）」↔ titleZh「什么是微短剧？2026年短剧完整指南」）。个别锚文本加编辑注「（全景 Hub）」「（泛 AI drama 定义）」略超出 titleZh 原文，属合理澄清。部分目标（pillar-guide / how-to-create / ai-tools-comparison 等）出现 2 次，但分属「概览」与「CTA」语境，可接受。 |
| 聚类连通性 | 20% | 16/20 | 覆盖定义/教程/平台工具/变现全类 Spoke，并链向 Pillar（`ai-short-drama-pillar-guide`）。**关键缺口：与 `what-is-ai-drama` 仅为单向前向链，双向互链未建立**（旧文回链需待本稿发布后由 content-editor 补）。补回链后可达 20/20。 |
| 链接分布 | 15% | 12/15 | 正文链出现分布：前段(H2一~三) 1 / 中段(H2四~六) 7 / 后段(H2七~十) 7，共 15 次。定义型文章前段少链属合理（前段专注「是什么」），但前段唯一链接即指向竞品意图文 `what-is-ai-drama`，边界澄清的 `what-is-micro-drama` 落在中段。略偏后，可接受。 |
| 用户价值 | 10% | 10/10 | 每条链接都提供真实「下一步」价值（做剧教程 / 概念定义 / 平台工具 / 变现入口），无装饰性链接。 |
| 竞品对标 | 10% | 9/10 | 中文市场无「创作者视角定义柱石」竞品（Brief §2.3）；本稿 + 3 条权威外链构成强 GEO/AEO 引用位。中文蓝海先发优势明显。 |
| **合计** | **100%** | **89/100** | **实施建议（回链 + 广电外链 + llms.txt 分集）后预估 96/100** |

> 对比 ①（ReelShort 替代品对比文，68→87）：本稿链接结构显著更成熟、断链 0，属「交付质量高、仅需补蚕食处置」的稿。

---

## 三、内链复核（9 目标，逐一验证 `dist/zh/blog/` 存在）

> 全部 9 目标 slug 均在 `dist/zh/blog/` 产物目录中存在，且 `blog.ts` 均有 `titleZh` 字段（= 进入多语言子集，有 `/zh/` 产物）。`?lang=zh-CN` 经 `i18n.tsx` 规范化后均可抵达简中页。**零断链、零语言误配。**

| # | 锚文本 | 目标路径 | 出现位置（正文） | titleZh 核对 | 结论 |
|---|---|---|---|---|---|
| 1 | 什么是 AI 短剧（泛 AI drama 定义） | `/blog/what-is-ai-drama?lang=zh-CN` | H2一(23)、H2十(165) | ✅「什么是AI短剧？2026年AI驱动娱乐完整指南」 | **正确（蚕食处置对象，见第五节）** |
| 2 | 什么是微短剧（格式定义） | `/blog/what-is-micro-drama?lang=zh-CN` | H2四(80) | ✅「什么是微短剧？2026年短剧完整指南」 | **正确** |
| 3 | AI 短剧 vs 传统电视剧 | `/blog/ai-vs-traditional-drama?lang=zh-CN` | H2四(82) | ✅「AI短剧vs传统电视剧：2026年AI如何改变影视制作」 | **正确** |
| 4 | 如何制作 AI 短剧（新手指南） | `/blog/how-to-create-ai-short-drama?lang=zh-CN` | H2五(92)、H2十(161) | ✅「如何制作AI短剧：2026年完整新手指南」 | **正确** |
| 5 | AI 视频故事创作完整流程 | `/blog/ai-video-storytelling?lang=zh-CN` | H2五(93) | ✅「AI视频故事创作完整流程指南：从创意到完整AI短剧（2026）」 | **正确** |
| 6 | AI 短剧制作完全指南（全景 Hub） | `/blog/ai-short-drama-pillar-guide?lang=zh-CN` | H2五(94)、H2七(119) | ✅「AI 短剧制作完全指南：从剧本到变现的 2026 全景」 | **正确（链向 Pillar）** |
| 7 | AI 短剧工具对比矩阵 | `/blog/ai-tools-comparison?lang=zh-CN` | H2六(109)、H2十(162) | ✅「AI短剧工具对比矩阵（2026）：25+工具覆盖剧本到成片全链路实测评估」 | **正确** |
| 8 | 2026 最佳 AI 故事创作平台 | `/blog/best-ai-storytelling-platforms?lang=zh-CN` | H2六(110)、H2十(163) | ✅「2026年最佳AI故事创作平台：完整对比指南」 | **正确** |
| 9 | 竖屏 AI 短剧发布与变现 | `/blog/publish-and-monetize-vertical-drama?lang=zh-CN` | H2七(118)、H2十(163) | ✅「竖屏 AI 短剧发布与变现全流程：从分发到收入」 | **正确** |

### 锚文本自然度
全部锚文本为「描述性短语 + 目标主题」，无「点击这里 / 详情」类泛锚，自然度良好。建议：CTA 段（H2十）的 5 条链接可与概览段（H2五/六/七）使用轻微变体（如 CTA 处改「动手做第一部 AI 短剧」替代重复的「如何制作 AI 短剧（新手指南）」），降低同一锚文本重复度，提升长尾覆盖。非强制。

### 分布均衡性
- 前段（H2一~三）：1 次（what-is-ai-drama）
- 中段（H2四~六）：7 次
- 后段（H2七~十）：7 次

定义型柱石前段少链合理；但前段唯一的链接指向竞品意图文（蚕食风险文），建议评估是否在 H2四 边界澄清处前移一条 `what-is-micro-drama` 前向链到 H2一 末尾（「先搞懂它住在哪个容器里，见什么是微短剧」），使前段同时建立「短-form 定义 ↔ 格式容器」关系，强化聚类。属优化项，非错误。

---

## 四、外链复核（3 条权威来源，均核实可达）

> 稿件正文含 3 条权威媒体超链，URL 来自 Brief §7 已核实清单。本策略师于 2026-10-06 实拉验证：

| # | 来源 | 核实 URL | 放置位置（就近数据） | 可达性 | GEO「数据可溯」 |
|---|---|---|---|---|---|
| 1 | 中国新闻网 —《没有摄像、没有演员，一部AI生成短剧是如何诞生的？》 | https://www.chinanews.com.cn/sh/2026/04-29/10612872.shtml | H2一(25) 流水线佐证 | ✅ HTTP 200 | 满足（就近流程纪实） |
| 2 | 央视网 —《厦门：AI杀进短剧圈》 | https://big5.cctv.com/gate/big5/local.cctv.com/2026/04/13/ARTI0r6WzMBXWWQAfObkHSsY260413.shtml | H2二(33) 降本案例 | ✅ HTTP 200 | 满足（就近成本数据） |
| 3 | 河北日报 —《AI短剧产业的嬗变与突围》 | https://hbxw.hebnews.cn/news/613665.html | H2八(131) 95% 占比/市场规模 | ✅ HTTP 200 | 满足（就近 95% 数据） |

### GEO/AEO「数据可溯」结论
- 三条外链均**就近其数据主张**放置，符合 Brief §6.2 第 6 条「数据可溯」。
- **微瑕（建议补）**：H2一 开头「2026 年一季度...AI 参与生成占比超 95%（中国网络视听协会口径，河北日报亦有援引）」的 95% 数据，其权威锚点（河北日报）直到 H2八 才出现，相距 7 节。严格就近可溯建议在 H2一 该句后补一条河北日报同链，或在 H2一 注「数据详见第八节产业侧」。
- **缺口（建议补）**：H2八 广电总局 AIGC 备案政策（「2026.4.1 起存量 AI 微短剧须备案」）为**纯文本引用、无 URL**。Brief §7 第 4 条明确「URL 待撰稿时核实」——撰稿人正确地未编造链接（无断链），但为完整「数据可溯」，建议 content-editor 上线前在 nrta.gov.cn 通知公告栏核实稳定直链并补锚（避免转引聚合页）。非本稿范围，列为实施清单。

---

## 五、蚕食风险专项（重点）

### 5.1 与 `what-is-ai-drama` 的关系核查

| 项 | 状态 |
|---|---|
| `what-is-ai-drama` 是否已简中存在 | ✅ 是（`dist/zh/blog/what-is-ai-drama` 产物存在；titleZh「什么是AI短剧？2026年AI驱动娱乐完整指南」） |
| 本稿 → `what-is-ai-drama`（前向链） | ✅ 已建（H2一(23)、H2十(165)，显式「泛 AI drama 定义 / 互补入口」） |
| `what-is-ai-drama` → 本稿（回链） | ❌ **未建**（本稿尚未发布、未进 `blog.ts`，旧文无由回链；需 content-editor 同步补） |
| 互链性质 | **当前为单向前向链，非双向互链** |
| 旧文是否重定位 | ❌ 否（标题仍为「什么是AI短剧？」，未做泛 AI entertainment 范围声明切分） |

### 5.2 字面 + 意图重叠评估

- **字面**：本稿 H1「AI短剧是什么？」vs 旧文标题「什么是AI短剧？」。S-V 倒置，但搜索引擎对「什么是AI短剧」「AI短剧是什么」判定为**同一查询意图**。`ai短剧 定义` 等长尾亦同源。
- **意图**：两篇都回答「AI short drama 是什么」。旧文范围=泛 AI drama（含长剧/电影/综艺），本稿范围=short-form（竖屏/微短剧，由 AI 生产子集）。**意图高度重叠，可经范围切分区分**。
- **风险等级**：**中高（未化解）**。旧文已是活页、可能被收录；若两篇同抢「什么是AI短剧 / AI short drama 定义」且无回链/无范围声明，将站内互斗、稀释排名。

### 5.3 与 `what-is-micro-drama` 边界是否厘清

✅ **已厘清，无蚕食风险**。H2四 用关系图（微短剧/短剧 ⊃ AI 短剧）+ 三列对比表澄清「微短剧是格式容器，AI 短剧是按生产方式划分的子集」，并内链 `what-is-micro-drama` 取其「格式定义」；本稿取「AI 是唯一界定特征」。**互补闭环，意图不重叠。**

### 5.4 最终处置建议

**推荐：方案 B（本稿已合规的低风险策略）+ 强制回链 + llms.txt 分集。**

- **为何不首选方案 A**：方案 A 要求改旧文 `what-is-ai-drama` 标题为「什么是 AI 戏剧/AI 娱乐？」并加范围声明。该文是已收录活页，改标题有排名波动风险，且超出本稿交付范围。
- **方案 B 已被本稿部分实现**：本稿 H1 用「AI短剧是什么」、主词避开「什么是AI短剧」字面（Brief §8.1 方案 B 要求）；H2一「边界提醒」框与 H2十「互补入口」已显式限定本稿范围=竖屏/微短剧，并前向链旧文做泛 AI drama 延伸。
- **无论 A/B，强制动作相同**：在 `what-is-ai-drama` 文首补一句范围声明「本文谈广义 AI 驱动的娱乐内容；若你想了解竖屏/微短剧形态的 AI 短剧，见《AI短剧是什么》」并**回链本稿**（`/blog/what-is-ai-short-drama-2026?lang=zh-CN`）。由 content-editor 在本稿发布时同步上线。
- **llms.txt 分集（互斥）**：本稿入「AI短剧 定义（short-form）」引用集；`what-is-ai-drama` 入「AI drama / AI 娱乐（含长剧/电影）」引用集。两集不重叠，避免同一查询下两篇自相竞争。
- **升级路径**：若编辑团队愿承担旧文排名波动，可升级到方案 A（旧文改标题 + 范围声明 + 回链），切分更彻底。

---

## 六、聚类图谱（本篇在 AI 短剧矩阵中的角色）

**本篇角色**：定义型 Spoke / 入口（Definition Hub-Spoke）。它是「AI短剧」主题聚类的**概念入口**，向下分发到教程/平台/工具/变现 Spoke，自身只概览+指路，不展开操作（防蚕食）。

**Pillar（枢纽页）**：`ai-short-drama-pillar-guide`（「AI 短剧制作完全指南：从剧本到变现的 2026 全景」）— 本稿已链向（H2五、H2七），Pillar 应回链本稿作「定义入口」。

```
                       [Pillar] ai-short-drama-pillar-guide
                                   ▲   ▲
                                   │   └──────────────┐
            ┌──────────────────────┼───────────────────┼──────────────────┐
            │                      │                   │                   │
    定义类 Spoke            教程类 Spoke          变现类 Spoke       平台/工具 Spoke
 ┌──────────┴──────┐  how-to-create-   publish-and-   best-ai-storytelling-
 本篇②(short-form)   ai-short-drama     ai-short-drama  vertical-drama    platforms
 AI短剧是什么        ai-video-         monetize-       ai-tools-comparison
 what-is-micro-drama storytelling       vertical-drama
 what-is-ai-drama    script-to-screen-  (回链)          (回链)
 (泛 AI drama,       pipeline
  回链待补)          (回链)
```

**本篇应链出的 Spoke（已验证全部有简中版，9/9 实链）**：
1. `what-is-micro-drama`（格式定义，边界澄清）✅
2. `what-is-ai-drama`（泛 AI drama，互补入口）✅ 前向已建 / 回链待补
3. `ai-vs-traditional-drama`（对比）✅
4. `how-to-create-ai-short-drama`（新手制作）✅
5. `ai-video-storytelling`（方法论流程）✅
6. `ai-short-drama-pillar-guide`（Pillar 全景）✅
7. `ai-tools-comparison`（工具矩阵）✅
8. `best-ai-storytelling-platforms`（平台对比）✅
9. `publish-and-monetize-vertical-drama`（变现）✅

**与 `ai-short-drama-pillar-guide` 关系**：本篇只概览+指路，H2五/七均一句话带过并内链 Pillar；**绝不展开操作步骤**，符合 Brief §8.3 防蚕食要求。✅

---

## 七、实施清单（内链 / 外链 / 蚕食处置 / llms.txt 对齐）

### 内链
- [x] 9 条内链目标全部验证存在、语言匹配正确（无需修改稿件）。
- [ ] **（优化，非强制）** 评估将 `what-is-micro-drama` 前向链前移至 H2一 末尾，强化前段「定义↔格式容器」关系。
- [ ] **（优化，非强制）** CTA 段（H2十）对重复锚文本（how-to-create / ai-tools-comparison 等）使用轻微变体，提升长尾覆盖。

### 外链
- [x] 3 条权威外链（中新网/央视网/河北日报）已核实 HTTP 200、就近数据放置。
- [ ] **（建议补）** H2一 95% 数据句后补河北日报同链或注明「详见第八节」，满足严格就近可溯。
- [ ] **（待 content-editor）** 广电总局备案政策补稳定官方直链（nrta.gov.cn 通知公告栏，避免聚合转引页），上线前核实。

### 蚕食处置（强制，跨稿件）
- [ ] **content-editor 在 `what-is-ai-drama` 文首补范围声明 + 回链本稿**（`/blog/what-is-ai-short-drama-2026?lang=zh-CN`），随本稿发布同步上线。
- [ ] 确认本稿发布时 `blog.ts` 写入 `titleZh`（确保进多语言子集、有 `/zh/` 产物）。
- [ ] 采用方案 B（低风险，本稿已合规）；若愿承担排名波动可升级方案 A（旧文改标题 + 范围声明 + 回链）。

### llms.txt 对齐
- [ ] 本稿列入 llms.txt「AI短剧 定义（short-form）」引用集。
- [ ] `what-is-ai-drama` 列入「AI drama / AI 娱乐（含长剧/电影）」引用集；两集互斥。

### 代码健康（团队提示，非本稿问题）
- [ ] **`tests/locale-path.test.mjs` 的 `SUBSET_HOWTOS` 快照已过期**：仍硬编码旧「12 HowTo」集合，未含 `what-is-ai-drama` / `what-is-micro-drama` / `ai-vs-traditional-drama` / `best-ai-storytelling-platforms` / `ai-tools-comparison` / `ai-short-drama-pillar-guide`，且 line 148 断言 `what-is-micro-drama` **不在**子集——与现行 `multilangSubset.ts`（titleZh 即子集）矛盾（前述 6 篇均有 `/zh/` 产物已证实）。建议维护者将测试快照改为动态派生 `blogMeta.filter(titleZh)`，避免回归误报。**不影响本稿链接可达性。**

---

## 八、结论速览（供用户）

- **健康度评分**：当前 **89/100**，实施蚕食回链 + 广电外链 + llms.txt 分集后预估 **96/100**。
- **断链 / 误配清单**：**0 条**。9 内链目标全部 `dist/zh/blog/` 存在 + `titleZh` 匹配 + 语言正确；3 外链全部 HTTP 200。仅两项非断链提示：① `what-is-ai-drama` 回链尚未建（单向前向链，待发布后补）；② 测试快照 `SUBSET_HOWTOS` 过期（代码健康，不影响链接）。
- **蚕食风险结论**：与 `what-is-ai-drama` 字面+意图重叠**中高**、当前**单向前向链未化解**；与 `what-is-micro-drama` 边界**已厘清无风险**。
- **推荐方案**：**方案 B**（本稿已合规、低风险）＋ 强制 `what-is-ai-drama` 回链 + llms.txt 分集；愿承担旧文排名波动可升级方案 A。

---

*本报告仅给出链接策略与内容健康度建议，未修改稿件或代码。所有内链目标均经 `dist/zh/blog/` 预渲染产物与 `blog.ts` 元数据交叉验证；3 条权威外链均经实拉 HTTP 状态核对。*
