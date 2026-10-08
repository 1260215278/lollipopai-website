# 发布清单：什么是AI短剧 2026 完整指南（文章 ②）

> 主理人整合交付 ｜ 日期：2026-10-06
> 洁净正文：`drafts/what-is-ai-short-drama-2026-10-06-FINAL.md`
> 三份评审：`reports/seo-report-…` / `reports/edit-report-…` / `reports/link-report-…`
> 研究 Brief：`research/brief-what-is-ai-short-drama-2026-10-06.md`

---

## 一、发布参数（前端 / CMS 注入，不进正文）

**URL Slug**：`/blog/what-is-ai-short-drama-2026`

**Meta Title**（取自稿件标注，质量高、含完整主词）：
```
AI短剧是什么？2026 完整指南：定义·形态·与微短剧/传统短剧的区别
```

**Meta Description**（取自稿件标注）：
```
AI短剧是什么？2026 新手完整指南讲清定义、四大特征、仿真人/漫剧/2D 等形态，区分 AI 短剧与微短剧、传统短剧的边界，并给出制作、工具、变现的下一步指路。
```

**正文中文字数**：约 3000（洁净版）

---

## 二、结构化数据（JSON-LD，注入 `<head>` 或文末）

### 2.1 FAQPage
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "AI 短剧和微短剧到底有什么区别？",
      "acceptedAnswer": { "@type": "Answer", "text": "微短剧是按"格式"划分的——单集短、竖屏、快节奏；AI 短剧是按"生产方式"划分的，指由生成式 AI 生成的那些。关系是包含：AI 短剧是微短剧这个大容器里"用 AI 造出来"的子集。真人拍的微短剧，不叫 AI 短剧。" } },
    { "@type": "Question", "name": "普通人没有团队能做 AI 短剧吗？",
      "acceptedAnswer": { "@type": "Answer", "text": "可以。当前工具链已经能把剧本、角色、视频、配音、剪辑的主要环节收到个人电脑上，极小团队甚至单人就能产出样片。难点从"有没有资源拍"转成了"创意和节奏把控得好不好"，这对新手反而更友好。" } },
    { "@type": "Question", "name": "AI 短剧需要备案吗（2026）？",
      "acceptedAnswer": { "@type": "Answer", "text": "需要。根据广电总局 AIGC 类微短剧备案工作提示，2026 年 4 月 1 日起存量 AI 微短剧须完成备案，未备案可能下线。发布前先把合规动作做了，比事后补票省心得多。" } },
    { "@type": "Question", "name": "做一部 AI 短剧大概要花多少钱、多久？",
      "acceptedAnswer": { "@type": "Answer", "text": "工具侧成本公开估算在几百到数千元级，远低于真人剧的数万到数十万元；样片周期可以压缩到天数级。具体花多少，取决于形态（仿真人比沙雕漫贵）和精致度要求，本篇不展开，后续制作指南会细讲。" } }
  ]
}
```

### 2.2 Article
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "AI短剧是什么？2026 完整指南：定义·形态·与传统/微短剧的区别",
  "description": "2026 定义型柱石：讲清 AI 短剧是什么、四大特征、形态分类，厘清与微短剧/传统短剧的边界，并指路制作/工具/变现。",
  "author": { "@type": "Organization", "name": "Lollipop Drama" },
  "publisher": { "@type": "Organization", "name": "Lollipop Drama", "logo": { "@type": "ImageObject", "url": "https://lollipop.im/logo.png" } },
  "datePublished": "2026-10-06",
  "dateModified": "2026-10-06",
  "inLanguage": "zh-CN",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://lollipop.im/blog/what-is-ai-short-drama-2026" }
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
    { "@type": "ListItem", "position": 3, "name": "AI短剧是什么", "item": "https://lollipop.im/blog/what-is-ai-short-drama-2026" }
  ]
}
```

---

## 三、链接地图（已植入 FINAL 正文，均经 `dist/zh/blog/` 验证存在）

### 3.1 内链（9 目标，全部简中版已验证）
| # | 锚文本 | 目标 | 位置 |
|---|---|---|---|
| 1 | 什么是 AI 短剧（泛 AI drama 定义） | `/blog/what-is-ai-drama?lang=zh-CN` | H2一、H2十 |
| 2 | 什么是微短剧（格式定义） | `/blog/what-is-micro-drama?lang=zh-CN` | H2四 |
| 3 | AI 短剧 vs 传统电视剧 | `/blog/ai-vs-traditional-drama?lang=zh-CN` | H2四 |
| 4 | 如何制作 AI 短剧（新手指南） | `/blog/how-to-create-ai-short-drama?lang=zh-CN` | H2五、H2十 CTA1 |
| 5 | AI 视频故事创作完整流程 | `/blog/ai-video-storytelling?lang=zh-CN` | H2五 |
| 6 | AI 短剧制作完全指南（全景 Hub） | `/blog/ai-short-drama-pillar-guide?lang=zh-CN` | H2五、H2七 |
| 7 | AI 短剧工具对比矩阵 | `/blog/ai-tools-comparison?lang=zh-CN` | H2六 |
| 8 | 2026 最佳 AI 故事创作平台 | `/blog/best-ai-storytelling-platforms?lang=zh-CN` | H2六 |
| 9 | 竖屏 AI 短剧发布与变现 | `/blog/publish-and-monetize-vertical-drama?lang=zh-CN` | H2七、H2十 CTA3 |

### 3.2 外链（3 条，均 HTTP 200 实拉可达）
| # | 锚文本 | URL | 位置 |
|---|---|---|---|
| 1 | 中新网《没有摄像、没有演员…》 | `https://www.chinanews.com.cn/sh/2026/04-29/10612872.shtml` | H2一 |
| 2 | 央视网《厦门：AI 杀进短剧圈》 | `https://big5.cctv.com/gate/big5/local.cctv.com/2026/04/13/ARTI0r6WzMBXWWQAfObkHSsY260413.shtml` | H2二 |
| 3 | 河北日报《AI短剧产业的嬗变与突围》 | `https://hbxw.hebnews.cn/news/613665.html` | H2八 |

---

## 四、发布前必做 Checklist（去重后）

### 🔴 阻塞项（已在本 FINAL 稿内修复，复核即可）
- [x] 剥离文末内部块（建议内链清单 / Meta / Slug / WordCount / @角色协作注）
- [x] 清除内部协作注泄漏（原"需 content-editor 在旧文补回链"已从正文撤回，列为协作项）
- [x] H2一 补 ≤60 字 Featured Snippet 答案句（含精确主词 "AI短剧是什么"）
- [x] 结论补精确主词 "AI短剧是什么"（H1 + H2一 + 结论 三处覆盖）
- [x] L121 匿名案例 → 改为中新网纪实报道的具名参照
- [x] 注入 FAQPage + Article JSON-LD（本节已给代码块）
- [x] Meta Title / Description 按第一节注入
- [x] H1 去掉冗余"（新手入门）"副标题

### 🟡 前端 / 上线协同项（非正文）
- [ ] 语义化 HTML 表：H2三 / H2四 两张表加 `<caption>` + `<th scope>`
- [ ] 主词精确形态 "AI短剧是什么"（无空格）在前端 `<title>` 与 OG 同步
- [ ] Open Graph + Twitter Card
- [ ] 1–2 张配图（AI 短剧生产流水线示意 / 形态对比）并加含关键词 `alt`
- [ ] `llms.txt`：本篇列入 **"AI short drama (short-form)"** 集

### 🟢 已达标
- [x] 主关键词 H1 / H2一 / 结论 覆盖（精确形态三处）
- [x] H1/H2/H3 层级正确
- [x] 正文 ≥ 2000 字（约 3000）
- [x] Slug 含主词、全小写连字符
- [x] 9 内链 + 3 外链全部可达、语言正确（0 断链 / 0 误配）
- [x] FAQ 4 组自然语言问答
- [x] 与 what-is-micro-drama 边界已用关系图 + 对比表厘清（互补不重叠）

---

## 五、风险与跨文章动作（重要）

1. **蚕食防护（方案 B，链接策略师确认）**：本篇主词 "AI短剧是什么" 已避用 what-is-ai-drama 标题字面 "什么是AI短剧"，且显式范围声明 + 前向链。**强制前置动作（发布时同步执行）**：
   - 在旧文 `what-is-ai-drama` 补**范围声明**（明确其覆盖广义 AI 娱乐：长剧/电影/综艺）+ **回链本篇** `what-is-ai-short-drama-2026`；
   - `llms.txt` 分集互斥：本篇 → "AI short drama (short-form)" 集；`what-is-ai-drama` → "AI drama / 娱乐" 集。
   - 若愿承担旧文排名波动，可升级方案 A（旧文改标题，彻底避开字面重合）。
2. **代码健康提示（非阻塞）**：`tests/locale-path.test.mjs` 的 `SUBSET_HOWTOS` 快照仍硬编码旧"12 HowTo"规则、误判 `what-is-micro-drama` 不在子集（与现行 `multilangSubset.ts` 矛盾）。不影响本稿链接可达性，但建议后续同步测试快照。
3. **广电备案外链**：政策口径已写明（广电总局 AIGC 微短剧备案工作提示，2026-04-01 起），但**未编造稳定直链**（Brief 要求）；如需加源链，由撰稿核实 nrta.gov.cn 官方页后再补。
4. **CTA 指向首页 `https://lollipop.im`**：沿用 ① 的安全选择（多语可达），如需改 `/creating`、`/download` 待研发确认路径。
