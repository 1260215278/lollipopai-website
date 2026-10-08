# 发布清单：ReelShort 替代品对比长文（文章 ①）

> 主理人整合交付 ｜ 日期：2026-10-06
> 洁净正文：`drafts/lollipop-vs-reelshort-dramabox-2026-10-06-FINAL.md`
> 三份评审：`reports/seo-report-…` / `reports/edit-report-…` / `reports/link-report-…`
> 关联 Brief：`research/brief-lollipop-vs-reelshort-dramabox-2026-10-06.md` + 旧文互链补丁 `research/brief-lollipop-vs-reelshort-dramabox-zh-interlink-2026-10-06.md`

---

## 一、发布参数（前端 / CMS 注入，不进正文）

**URL Slug**：`/blog/reelshort-alternative-lollipop-vs-reelshort-dramabox-2026`（已锁定，旧文回链以此为准）

**Meta Title**（采用 SEO 报告 #3，53 字符，含主词 + 缺失长尾 #5）：
```
ReelShort 和 DramaBox 哪个好？Lollipop Drama 80% 分成对比 2026
```
*备选*：`ReelShort 替代品对比：Lollipop Drama 80% 分成 vs 头部平台`（SEO #1，主词绝对前置）

**Meta Description**（采用 SEO 报告 #1，约 150 字符，含完整主词"ReelShort 替代品"）：
```
找 ReelShort 替代品？本文用一张表对比 Lollipop Drama、ReelShort、DramaBox 2026 的创作者分成（80% vs 10–20%）、内置 AI 创作工具、人+AI 内容模式与全球出海能力，并附分成实例与选型建议。想创作并高分成变现 AI 短剧？这篇 3 分钟帮你选对平台。
```

**正文中文字数**：约 5300（实测后填；原稿 4970 + 补链/补长尾增量，仍处 Pillar-Spoke 支撑文合理区间）

---

## 二、结构化数据（JSON-LD，注入 `<head>` 或文末）

### 2.1 FAQPage
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Lollipop Drama 真的给 80% 分成吗？",
      "acceptedAnswer": { "@type": "Answer", "text": "是的。根据 lollipop.im 官网及发布通稿的官方口径，Lollipop Drama 创作者分成比例为 80%，涵盖解锁费、订阅、打赏等多种收入，是三家中最高的。作为对比，ReelShort 创作者约拿净收入的 10–20%，DramaBox 约 20%（均为第三方公开估算）。" } },
    { "@type": "Question", "name": "ReelShort 和 DramaBox 能自己用 AI 做剧吗？",
      "acceptedAnswer": { "@type": "Answer", "text": "两家平台本身都不提供 AI 生成工具，属于"纯分发"型。如果你想发 AI 短剧，需要先用 Runway、Sora 等外部工具生成内容，再上传到平台。只有 Lollipop Drama 把文生视频、换脸、风格迁移等 AI 工具内置在平台内，让创作者从生成到分发一站式完成。" } },
    { "@type": "Question", "name": "新手适合哪个平台？",
      "acceptedAnswer": { "@type": "Answer", "text": "如果你是零拍摄资源、想低成本试水的新手，Lollipop Drama 更友好——内置 AI 工具降低了制作门槛，80% 分成又保证了收益。如果你已有真人剧团队和 IP，想快速触达大规模付费用户，可优先看 ReelShort（欧美）或 DramaBox（多语言全球）。" } },
    { "@type": "Question", "name": "短剧出海哪个市场最赚钱？",
      "acceptedAnswer": { "@type": "Answer", "text": "公开估算显示，北美（ReelShort 主导）用户付费能力最强；DramaBox 在东南亚、日韩、欧美多点开花；Lollipop Drama 覆盖 100+ 国家 / 地区并支持打赏等多元变现。2026 上半年出海短剧 App 内购 TOP10 合计约 2.98 亿美元（扬帆出海 / 三皮匠报告口径），整体市场仍在高速增长。" } }
  ]
}
```

### 2.2 Article
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "ReelShort 替代品怎么选？Lollipop Drama vs ReelShort vs DramaBox 2026 全对比",
  "description": "2026 三大短剧平台对比：分成（80% vs 10–20%）、内置 AI 创作工具、内容模式与全球出海。",
  "author": { "@type": "Organization", "name": "Lollipop Drama" },
  "publisher": { "@type": "Organization", "name": "Lollipop Drama", "logo": { "@type": "ImageObject", "url": "https://lollipop.im/logo.png" } },
  "datePublished": "2026-10-06",
  "dateModified": "2026-10-06",
  "inLanguage": "zh-CN",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://lollipop.im/blog/reelshort-alternative-lollipop-vs-reelshort-dramabox-2026" }
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
    { "@type": "ListItem", "position": 3, "name": "ReelShort 替代品对比", "item": "https://lollipop.im/blog/reelshort-alternative-lollipop-vs-reelshort-dramabox-2026" }
  ]
}
```

> 对比表 Schema（Table 类型）属锦上添花，非必需；优先级保证语义化 HTML 表 + FAQPage + Article 三项即可。

---

## 三、链接地图（已植入 FINAL 正文，均经 `dist/zh/blog/` 验证存在）

### 3.1 内链（10 条不同目标，含 Old→New 待回链）
| # | 锚文本 | 目标 | 位置 | 状态 |
|---|---|---|---|---|
| 1 | 如何制作 AI 短剧：2026 完整新手指南 | `/blog/how-to-create-ai-short-drama?lang=zh-CN` | H2二、H2三、H2十 CTA1 | ✅ 已有 |
| 2 | AI 短剧 vs 传统电视剧 | `/blog/ai-vs-traditional-drama?lang=zh-CN` | H2四 | ✅ 已有 |
| 3 | 什么是微短剧 | `/blog/what-is-micro-drama?lang=zh-CN` | H2四 开头 | 🆕 补（纠正 Brief 过期排除） |
| 4 | AI 网红平台 | `/blog/ai-influencer-platform?lang=zh-CN` | H2四 | 🆕 补（纠正 Brief 过期排除） |
| 5 | AI 视频故事创作完整流程指南 | `/blog/ai-video-storytelling?lang=zh-CN` | H2三 | 🆕 实插 |
| 6 | 竖屏短剧的发布与变现全流程 | `/blog/publish-and-monetize-vertical-drama?lang=zh-CN` | H2六 | 🆕 补 |
| 7 | 2026 年最佳 AI 故事创作平台对比 | `/blog/best-ai-storytelling-platforms?lang=zh-CN` | H2七 | 🆕 补 |
| 8 | AI 短剧出海本地化（四步 SOP） | `/blog/ai-short-drama-localization?lang=zh-CN` | H2五 | 🆕 补 |
| 9 | AI 短剧制作完全指南：2026 全景（Pillar） | `/blog/ai-short-drama-pillar-guide?lang=zh-CN` | H2十 | 🆕 链 Pillar |
| 10 | 这篇深度对比（旧文） | `/blog/lollipop-vs-reelshort-dramabox?lang=zh-CN` | H2十 | 🆕 新→旧 前向链 |

> **待办（受新文发布前置约束）**：旧文 `lollipop-vs-reelshort-dramabox` 回链新文，由 `research/brief-…-zh-interlink-2026-10-06.md` 规格驱动，**必须等新文 URL 可访问后再注入**，防死链。锚文本主选"正在找 ReelShort 替代品？看这份 2026 选型对比"，强化意图切分。

### 3.2 外链（3 条，0 → 3，GEO/AEO 数据可溯）
| # | 锚文本 | URL | 位置 |
|---|---|---|---|
| 1 | ReelShort 官网 | `https://www.reelshort.com/` | H2二（运营主体处） |
| 2 | Variety 援引 Media Partners Asia 的报告 | `https://variety.com/2026/global/global/reelshort-1-billion-revenue-profit-2026-mpa-1236828885/` | H2二（ReelShort 收入处） |
| 3 | 扬帆出海《2026 上半年短剧出海四维榜单》 | `https://www.sgpjbg.com.cn/labels/yangfanchuhaiduanjuchuhaisiweibangdan/1/7590996.html` | H2五（2.98 亿处） |

---

## 四、发布前必做 Checklist（去重后）

### 🔴 阻塞项（已在本 FINAL 稿内修复，复核即可）
- [x] 剥离文末内部工件（建议内链清单 / Meta / Slug / Word Count 块）
- [x] 清除两处编辑注泄漏（原 L24、L223）
- [x] 重写三则模板化人物故事（小李 / 小林 / 阿杰，去"化名"套框）
- [x] 补 2 个高优缺失长尾（#4 Lollipop Drama 怎么样 / #5 DramaBox 和 ReelShort 哪个好）
- [x] 注入 FAQPage + Article JSON-LD（本节已给代码块）
- [x] 配齐 3 条外链 + 纠正 2 条过期排除内链 + 补齐 Pillar / 旧文互链

### 🟡 前端 / 上线协同项（非正文，交付研发）
- [ ] 语义化 HTML 表：两张对比表加 `<caption>` + `<th scope="col/row">`，捕获对比型 Featured Snippet
- [ ] Meta Title / Description 按第一节注入 `<title>` 与 `<meta name="description">`
- [ ] Open Graph（og:title/description/image）+ Twitter Card
- [ ] 1–2 张配图（平台界面对比 / 分成示意）并加含关键词 `alt`
- [ ] `llms.txt`：本篇列入 **"ReelShort alternative"** 集（与旧文 "ReelShort vs DramaBox" 集互斥不重叠）
- [ ] 旧文数据口径对齐：`keyTakeawaysZh` 的 "ReelShort 2025 收入 7 亿美元" → "约 7.85 亿美元（Variety 援引 MPA 估算）"
- [ ] 旧文回链新文（见 3.1 待办，发布后执行）

### 🟢 已达标（无需改动）
- [x] 主关键词 H1 / 前 100 词 / 2+ H2 / 结论均出现（密度 ~1.8%，无堆砌）
- [x] H1/H2/H3 层级正确
- [x] 正文 ≥ 2000 字（约 5300）
- [x] Slug 含主词、全小写连字符
- [x] 结论含 3 个明确 CTA
- [x] 锚文本自然、分布均衡（前 2 / 中 3 / 后 5）

---

## 五、风险与保留说明

1. **长尾 #10 "ReelShort 替代 中国平台" 主动放弃**：SEO 报告明确"仅当 Lollipop 确有中国团队 / 中国运营主体支撑时再写，否则可放弃"。本文未做该断言，避免无据陈述；如需启用，先由品牌侧确认中国实体后再补。
2. **CTA 指向首页 `https://lollipop.im` 而非 `/creating`、`/download`**：链接策略师建议改专用路径，但为避免未知路径产生死链，FINAL 暂用首页（多语可达）。若研发确认 `/creating`、`/download` 存在，可替换。
3. **数据口径统一**：新文采用 7.85 亿美元（Variety/MPA），旧文须同步改为 7.85 亿（见 3.1 / 第四节），否则站内自相矛盾。
4. **蚕食防护三件套已就位**：① 意图切分（新=替代品决策 / 旧=品牌横评）；② 双向互链（新已链旧、旧待发布回链）；③ llms.txt 分集互斥。
