# 发布清单：2026 最佳 AI 短剧平台排名（文章 ③）

> 主理人整合交付 ｜ 日期：2026-10-06
> 洁净正文：`drafts/best-ai-short-drama-platforms-2026-10-06-FINAL.md`
> 三份评审：`reports/seo-report-…` / `reports/edit-report-…` / `reports/link-report-…`
> 研究 Brief：`research/brief-best-ai-short-drama-platforms-2026-10-06.md`

---

## 一、发布参数（前端 / CMS 注入，不进正文）

**URL Slug**：`/blog/best-ai-short-drama-platforms-2026`（可优化：补 `ranking` 令牌如 `…-platforms-ranking-2026`，非阻塞，需与 Brief 锁定一致）

**Meta Title**（取自稿件标注，含完整主词）：
```
2026 最佳 AI 短剧平台排名：综合榜+横向对比+选型指南
```

**Meta Description**（取自稿件标注）：
```
2026 最佳 AI 短剧平台排名出炉：一张 Top10 综合榜，按创作能力、分发与出海、创作者分成、AI 原生度、上手成本 5 维度横向对比，并给出新手/团队/出海/替代 ReelShort 的选型建议。挑平台前先看这篇。
```

**正文中文字数**：约 3700（洁净版）

---

## 二、结构化数据（JSON-LD，注入 `<head>` 或文末）

### 2.1 FAQPage
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "AI 短剧平台和短剧 App 有什么区别？",
      "acceptedAnswer": { "@type": "Answer", "text": "短剧 App（比如红果、抖音短剧）是"播出渠道"，你上去是看剧的；AI 短剧平台是"创作 + 分发 + 变现"的入口，你上去是做剧、发剧、分钱的。本篇排的榜把"能生成的创作型"和"只播出的分发型"分开列了，别混。" } },
    { "@type": "Question", "name": "新手做 AI 短剧选哪个平台？",
      "acceptedAnswer": { "@type": "Answer", "text": "预算紧先拿即梦 AI 或小云雀跑通流程，成本最低；等你想"做了还能高分成发出去"，再切到 Lollipop Drama（生成内置、分成 80%）。新手别一上来扎进 ReelShort，那边分成只有约 10–20%。" } },
    { "@type": "Question", "name": "哪个平台创作者分成最高？",
      "acceptedAnswer": { "@type": "Answer", "text": "公开估算里，Lollipop Drama 约 80%、红果约 70–80% 排第一档；ReelShort / DramaBox 只有约 10–20%。具体逐项参数看品牌横评那篇。" } },
    { "@type": "Question", "name": "想出海做 AI 短剧选哪个？",
      "acceptedAnswer": { "@type": "Answer", "text": "NetShort 和 DramaWave 是双寡头，合计占全球 AI 短剧 Top100 的 60%（DataEye H1 2026，估算），分发通道最成熟。但要先解决"剧从哪来"——它们不内置创作工具，得用创作型平台先做好。" } },
    { "@type": "Question", "name": "有 ReelShort 的替代品吗？",
      "acceptedAnswer": { "@type": "Answer", "text": "有，而且不止一个。想高分成就往 Lollipop Drama 看；想保留出海观众就对比 DramaBox。具体的"替代品怎么选"有专门的选型对比文，发布后会在文末说明里接回。" } }
  ]
}
```

### 2.2 Article
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "2026 最佳 AI 短剧平台排名：综合榜 + 横向对比 + 选型指南",
  "description": "2026 综合榜：按创作能力、分发与出海、创作者分成、AI 原生度、上手成本 5 维度排 Top10，并给出新手/团队/出海/替代 ReelShort 的选型建议。",
  "author": { "@type": "Organization", "name": "Lollipop Drama" },
  "publisher": { "@type": "Organization", "name": "Lollipop Drama", "logo": { "@type": "ImageObject", "url": "https://lollipop.im/logo.png" } },
  "datePublished": "2026-10-06",
  "dateModified": "2026-10-06",
  "inLanguage": "zh-CN",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://lollipop.im/blog/best-ai-short-drama-platforms-2026" }
}
```

### 2.3 BreadcrumbList
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "首页", "item": "https://lollipop.im" },
    { "@type": "ListItem", "position": 2, "name": "博客", "item": "https://lollipop.im/blog" },
    { "@type": "ListItem", "position": 3, "name": "2026 最佳 AI 短剧平台排名", "item": "https://lollipop.im/blog/best-ai-short-drama-platforms-2026" }
  ]
}
```

---

## 三、链接地图（已植入 FINAL 正文，均经 `blog.ts` titleZh 验证存在）

### 3.1 内链（9 目标，全部简中版已验证）
| # | 锚文本 | 目标 | 位置 |
|---|---|---|---|
| 1 | 什么是微短剧（格式定义） | `/blog/what-is-micro-drama?lang=zh-CN` | 引言 |
| 2 | AI 短剧工具对比矩阵 | `/blog/ai-tools-comparison?lang=zh-CN` | H2二、H2五 |
| 3 | 2026 最佳 AI 故事创作平台 | `/blog/best-ai-storytelling-platforms?lang=zh-CN` | H2二、H2五 |
| 4 | NetShort 与 DramaWave 双寡头分析 | `https://chinabizinsider.com/...` | H2四 |
| 5 | AI 短剧出海本地化（四步 SOP） | `/blog/ai-short-drama-localization?lang=zh-CN` | H2四 |
| 6 | Lollipop Drama vs ReelShort vs DramaBox 2026 | `/blog/lollipop-vs-reelshort-dramabox?lang=zh-CN` | H2六 |
| 7 | 竖屏 AI 短剧发布与变现 | `/blog/publish-and-monetize-vertical-drama?lang=zh-CN` | H2六 |
| 8 | AI 短剧 vs 传统电视剧 | `/blog/ai-vs-traditional-drama?lang=zh-CN` | H2五 |
| 9 | 如何制作 AI 短剧 / AI 短剧制作完全指南（Hub） | `/blog/how-to-create-ai-short-drama?lang=zh-CN` / `/blog/ai-short-drama-pillar-guide?lang=zh-CN` | H2七、H2十 |

### 3.2 外链（5 条，均 HTTP 200 实拉可达）
| # | 锚文本 | URL | 位置 |
|---|---|---|---|
| 1 | CNPP 短剧 APP 排行榜 | `https://www.cnpp.cn/china/list_12702.html` | H2三 |
| 2 | ChinaBizInsider NetShort/DramaWave 双寡头 | `https://chinabizinsider.com/...` | H2四 |
| 3 | 中华网河南 AI 短剧工具横评 | `https://hn.china.com/gundong/2026-09/17/content_0920261543.html` | H2五 |
| 4 | 三个皮匠 短剧合作平台分成 | `https://www.sgpjbg.com/searchtag/26651081.html` | H2六 |
| 5 | redrama.ai best short drama apps 2026 | `https://redrama.ai/best-short-drama-apps` | H2七 |

### 3.3 待补内链（本批新文，批量发布时接回，防死链）
- ① `what-is-ai-short-drama-2026`（概念入口）→ H2一/FAQ 可回链
- ② `reelshort-alternative-lollipop-vs-reelshort-dramabox-2026`（替代决策）→ H2八/FAQ 可回链
> 当前 `blog.ts` 无此二 slug，正文未链；待 ①/② 入 blog.ts 并发布后，由主理人统一接回。

---

## 四、发布前必做 Checklist（去重后）

### 🔴 阻塞项（已在本 FINAL 稿内修复，复核即可）
- [x] 剥离文末内部块（建议/待补内链表、Meta、Slug、WordCount、Primary/Secondary Keywords）
- [x] 删除正文 L195 llms.txt 内部分集策略泄漏句（编辑注）
- [x] 主词 "AI短剧平台排名" 强化：H1 + H2三标题 + 结论三处覆盖（正文前段 + 结尾各补完整词）
- [x] 补缺失长尾 "AI 短剧平台推荐"（H2八 选型清单自然植入）
- [x] 注入 FAQPage + Article + BreadcrumbList JSON-LD（本节已给代码块）
- [x] Meta 经 CMS 注入（标题/描述含完整主词）
- [x] 降低 "内置工具+80%分成" 机械重复（正文保留关键处，表格/结论留事实，其余换近义表述）

### 🟡 前端 / 上线协同项
- [ ] 语义化 HTML 表：H2二/三/四/六 多张表加 `<caption>` + `<th scope>`
- [ ] `llms.txt`：本篇归入 **"AI short drama platforms ranking 2026"** 集，与创作工具横评 / 品牌深评 / ReelShort 替代品三集互斥
- [ ] Open Graph + Twitter Card
- [ ] 1–2 张配图（Top10 榜单图 / 三类型关系图）并加含关键词 `alt`

### 🟢 已达标
- [x] 主关键词 H1 / H2三 / 结论 覆盖
- [x] H1/H2/H3 层级正确
- [x] 正文 ≥ 2000 字（约 3700）
- [x] Slug 含主词、全小写连字符
- [x] 9 内链 + 5 外链全部可达、语言正确（0 断链 / 0 误配）
- [x] FAQ 5 组自然语言问答
- [x] 与 best-ai-storytelling-platforms / lollipop-vs-reelshort-dramabox 边界正文显式切分（四篇互斥）

---

## 五、风险与跨文章动作（重要）

1. **redrama.ai 为直接竞品**：H2七 仅作"纯数据参照"外链，锚文本中性（无"官网/了解更多"类 CTA 措辞），不为竞品导流——已落实。
2. **待补内链 ①/② 死链风险**：本篇 H2八/FAQ 提及"替代品选型对比文""发布后接回"，但 ①/② 尚未入 `blog.ts`；批量发布时统一接回，发布前不得提前链 slug。
3. **ReelShort 收入/分成口径统一**：全篇 ReelShort 分成用"约 10–20%"（与 ①/② 一致）；如后续补 ReelShort 收入美元数，须统一 7.85 亿（Variety/MPA）口径，避免与旧文 `lollipop-vs-reelshort-dramabox` 的"7 亿"矛盾。
4. **代码健康提示（非阻塞）**：`tests/locale-path.test.mjs` 的 `SUBSET_HOWTOS` 快照过期（误判 what-is-micro-drama 不在子集），建议后续同步测试快照。
5. **CTA 指向首页 `https://lollipop.im`**：沿用安全选择（多语可达），如需改 `/creating`、`/download` 待研发确认路径。
