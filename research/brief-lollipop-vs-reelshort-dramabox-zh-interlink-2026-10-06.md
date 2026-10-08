# SEO 补丁 Brief: 旧文 `lollipop-vs-reelshort-dramabox`（简中）互链与蚕食防护

> 研究员：关宇霖（关键词研究 / 聚类策略师）
> 日期：2026-10-06
> 类型：已发布页补丁（非新文），配合新文双向互链
> 配合文档：新文 Brief `brief-lollipop-vs-reelshort-dramabox-2026-10-06.md`
> 来源依据：link-strategist 对 2026-10-05 构建产物与旧文"延伸阅读"的核查结论

---

## 0. 背景与目的
- 新文《ReelShort 替代品怎么选？Lollipop Drama vs ReelShort vs DramaBox 2026 全对比》主词 = `ReelShort 替代品`（商业 / 替代决策意图）。
- 旧文《Lollipop Drama vs ReelShort vs DramaBox》主词 = 品牌横评（参数对比意图），简中版已发布。
- 双向互链是"两条腿"：新→旧易（link-strategist 已在新文链接策略列好）；**旧→新目前为空**（旧文"延伸阅读"现有 5 条：lollipop-drama-vs-runway-sora / fanvue-vs-lollipop-drama / ai-influencer-platform / what-is-ai-drama / best-ai-storytelling-platforms，均不含新文）。
- 本 Brief 专补"旧→新"这条腿，并处理 locale、数据口径、llms.txt 三项站内自洽。

---

## 1. ⏳ 前置条件（MUST，否则旧文出现死链）
- 新文 slug **已锁定** = `reelshort-alternative-lollipop-vs-reelshort-dramabox-2026`（取自稿件第 278 行 `URL Slug` 声明，即最终发布 slug；link-strategist 2026-10-06 确认）。
- **务必等新文正式发布、URL 可访问后，方可实施本补丁。**
- 唯一前置：若 content-editor 后续改 slug，新/旧两篇 Brief 须同步更新（已在 §3 时序覆盖）。

---

## 2. 新增回链规格（1 条，旧文 → 新文）
- **目标 URL**：`/blog/reelshort-alternative-lollipop-vs-reelshort-dramabox-2026?lang=zh-CN`（slug 已锁定，见 §1）
- **锚文本（强化意图切分，link-strategist 2026-10-06 确认）**：
  - 主选（采用）："正在找 ReelShort 替代品？看这份 2026 选型对比" ✅
  - 备选 A："ReelShort 替代品怎么选？Lollipop Drama 2026 全对比"
  - 备选 B："不想只拿 20% 分成？看这个 ReelShort 替代方案"
- 三者均强化"替代 / 决策"意图，与旧文自身品牌横评锚点不撞。
- **意图要求**：锚文本须指向"替代选择 / 创作决策"，**不得**写成"完整对比 / 参数横评"——避免与旧文自身的品牌横评锚点混淆、造成意图重叠与蚕食。

---

## 3. 放置位置
- **位置**：旧文 FAQ 区 或 文末"延伸阅读"块（与现有 5 条并列，作为第 6 条）。
- **禁止**：不要插入正文对比表，避免稀释参数横评主线。
- **顺序**：建议置于"延伸阅读"末位或 FAQ 末条"相关选型指南"，承接"想进一步选型 / 创作"的读者动线。

---

## 4. 语言上下文（locale 修复）
- 旧文"延伸阅读"当前用**裸 `/blog/<slug>`（无 `?lang=`）**，从 `/zh/` 页点出会丢失 locale 前缀，可能落到默认语种。
- **本补丁新链 MUST 用 `?lang=zh-CN`**（与 link-strategist 新文策略一致）。
- **现有 5 条延伸阅读——经 link-strategist 比对 `dist/zh/blog/` 预渲染产物，全部在简中子集内，无需排除**，统一将 href 由 `/blog/<slug>` 改为 `/blog/<slug>?lang=zh-CN` 即可；锚文本沿用 `titles_zh`（简中标题），**无需改动**：
  - `lollipop-drama-vs-runway-sora` ✅（竞品对比聚类，合理互链，保留）
  - `fanvue-vs-lollipop-drama` ✅（竞品对比聚类，合理互链，保留）
  - `ai-influencer-platform` ✅（即此前误判为英文、现已确认有简中版者）
  - `what-is-ai-drama` ✅
  - `best-ai-storytelling-platforms` ✅

---

## 5. 数据口径对齐（消除站内自相矛盾）
- 旧文 `keyTakeawaysZh` 现写："ReelShort 2025 收入 7 亿美元 / 下载 3.7 亿+"。
- 新文 / 新文 Brief §0 采用第三方口径 **约 7.85 亿美元**（Variety 援引 MPA）。
- **行动**：旧文同步改为"约 7.85 亿美元（Variety 援引 MPA 估算）"，与新文统一；下载 3.7 亿+ 口径若新文也引用，则两文保持一致（新文 Brief §0 已标注其为 Lollipop 英文站引用数据、建议统一说明）。

---

## 6. 蚕食防护（意图切分分工）
- 新文主词 `ReelShort 替代品` ≠ 旧文主词"品牌横评"，二者意图不同、不重叠。
- **分工**：
  - 旧文职责 = 参数对比（分成 / AI 工具 / 内容模式 / 出海 表格）。
  - 新文职责 = 替代决策（"我该把作品放哪个平台做创作者"）。
- **双向互链语义**：旧文→新文 = "想找替代 / 想创作，看选型指南"；新文→旧文 = "要深读参数，看完整横评"。
- **禁止**：旧文不得把新文锚文本写成"完整对比"，那会模糊意图、造成内部关键词竞争。

---

## 7. llms.txt 引用集分配（GEO/AEO，两篇分集不重叠）
- llms.txt 应将两篇分别列入不同引用集、互斥不重叠：
  - 新文 → **"ReelShort alternative"** 引用集（AI 原生替代定位）。
  - 旧文 → **"ReelShort vs DramaBox"** 引用集（品牌参数横评）。
- 本 Brief 结论：确认 llms.txt 含本旧文于 "ReelShort vs DramaBox" 集，且与新文 "ReelShort alternative" 集互斥，避免 AI 引擎在同一查询下两篇自相竞争。

---

## 8. 实施检查清单（交付 content-editor / seo-optimizer）
- [ ] 新文已发布且 URL 可访问（前置条件）
- [ ] slug 与 link-strategist 最终确认一致
- [ ] 旧文新增 1 条回链（URL 含 `?lang=zh-CN`，锚文本为替代意图）
- [ ] 回链置于 FAQ / 延伸阅读，未插入正文对比表
- [ ] 现有 5 条延伸阅读审计并补 `?lang=zh-CN`
- [ ] 旧文 ReelShort 2025 收入口径改为约 7.85 亿（第三方估算）
- [ ] llms.txt 两篇分入不同引用集（新 = alternative / 旧 = vs DramaBox）

---

*（本补丁所有站内事实依据 link-strategist 对 2026-10-05 构建与旧文 延伸阅读 的核查；slug 与锚文本以 link-strategist 最终确认为实施准绳。）*
