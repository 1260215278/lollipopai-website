# 链接三审报告：零基础 7 天入门 AI 短剧教程（2026）

> 审核人：连乐桥（链接策略师）
> 日期：2026-10-06
> 对象：初稿 `drafts/ai-short-drama-7-day-tutorial-2026-10-06.md`（修正稿）
> 结论：**通过（P0=0，P1=0，评分约 97）**

---

## 1. 评分（0–100）

| 维度 | 得分 | 说明 |
|---|---|---|
| 白名单内链覆盖 | 98 | 19 条白名单全部 Grep 确认带 titleZh，正文 28 处链接全命中 |
| 死链 / forbidden 防护 | 100 | forbidden ①②③④⑤⑥⑦⑧ 正文 0 出现（边界感知排除 `-copyright`/`-roi-model` 误判） |
| 外链纪律 | 100 | 正文外链 URL 0（全部"待人工核实"登记，未臆造） |
| 锚文本质量 | 95 | 锚文本 = 目标文 titleZh 语义，非"点击这里" |
| 互链闭环（Hub→Spoke） | 96 | H2 一/九 接 Hub；Day2–8 接制作/极简首剧/引擎/发布/版权/FAQ/网文等 Spoke |
| 意图切分互链 | 96 | 与 `first-vertical-drama-zero-experience` 双向互链 + 词汇消歧 |
| **加权总分** | **~97** | 可发布 |

---

## 2. P0 问题（阻断发布）

**无。**

---

## 3. P1 问题（建议优化，非阻断）

- **P1-1（提示）**：`first-vertical-drama-zero-experience` 出现 2 次（H2 一/九），`ai-short-drama-monetization-copyright` 出现 3 次（H2 六/八/九），`ai-drama-character-consistency` 出现 3 次（H2 四/七×2）——属合理复用强相关 Spoke，非过度内链，保留。
- **P1-2（提示）**：全部内链带 `?lang=zh-CN`，与新建草稿类（⑧ 同例）约定一致；批量发布入 blog.ts 后须复核该参数在预渲染产物中仍正确解析。

---

## 4. 链接清单核验（脚本提取，正文 28 处）

| slug | 出现次数 | 用途 |
|---|---|---|
| first-vertical-drama-zero-experience | 2 | H2 一/九 极简首剧路径（意图切分） |
| ai-short-drama-pillar-guide | 2 | H2 一/九 全景 Hub |
| ai-scriptwriting-micro-dramas-prompts | 2 | H2 二/三 钩子提示词 |
| how-to-create-ai-short-drama | 2 | H2 三/四/九 按环节指南 |
| ai-script-storyboard | 2 | H2 三/四 分镜 |
| ai-drama-character-consistency | 3 | H2 四/七 角色一致性 |
| ai-short-drama-monetization-copyright | 3 | H2 六/八/九 版权合规 |
| ai-short-drama-industry-data-report-2026 | 1 | H2 二 题材热度 |
| web-novel-to-ai-short-drama-pipeline | 1 | H2 二 网文改编（⑨ 白名单，非 forbidden） |
| ai-video-storytelling | 1 | H2 四 故事节奏 |
| top-8-ai-short-drama-engines-2026 | 1 | H2 五 引擎选型 |
| script-to-screen-pipeline | 1 | H2 五 流水线 |
| ai-short-drama-complete-guide | 1 | H2 五 制作全景 |
| ai-short-drama-localization | 1 | H2 六 出海配音前置 |
| publish-and-monetize-vertical-drama | 1 | H2 八 发布变现 |
| ai-influencer-platform | 1 | H2 八 角色 IP 化 |
| lollipop-vs-reelshort-dramabox | 1 | H2 八 平台对比（已存在 slug，非 forbidden ①） |
| global-ai-short-drama-monetization-roi-model | 1 | H2 八 出海 ROI |
| ai-short-drama-faq-2026 | 1 | H2 七/九 FAQ |

**白名单命中 19/19；非白名单链接 0；forbidden 正文 0；外链 0。**

---

## 5. forbidden slug 登记（待批量发布接回，正文严禁链）

① reelshort-alternative-lollipop-vs-reelshort-dramabox-2026（注意已存在 lollipop-vs-reelshort-dramabox）
② what-is-ai-short-drama-2026（注意已存在 what-is-ai-drama）
③ best-ai-short-drama-platforms（语义相近 best-ai-storytelling-platforms / top-8 已存在）
④ ai-short-drama-monetization（已存在 ai-short-drama-monetization-copyright）
⑤ ai-short-drama-overseas-compliance
⑥ ai-influencer-monetization（已存在 ai-influencer-platform）
⑦ ai-short-drama-industry-trends-2026（已存在 ai-short-drama-industry-data-report-2026）
⑧ ai-short-drama-promotion-guide-2026（⑧ 已写完未入 blog.ts）

> 上述 forbidden 正文 0 出现；待其批量发布且 URL 可访问后，由 content-editor 在对应段落补互链（时序前置）。
