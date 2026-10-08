# SEO 三审报告：零基础 7 天入门 AI 短剧教程（2026）

> 审核人：欧化成（SEO 优化师）
> 日期：2026-10-06
> 对象：`drafts/ai-short-drama-7-day-tutorial-2026-10-06.md`（初稿 + 修正）
> 结论：**通过（P0=0，P1=0，评分约 86）**

---

## 1. 评分（0–100）

| 维度 | 得分 | 说明 |
|---|---|---|
| 主词覆盖 | 95 | 主词 `AI短剧7天入门教程` 进 H1、H2 一、H2 九；语义变体分散在 H2 一/二 |
| 长尾覆盖 | 100 | 12 条长尾经脚本核验 12/12 全文精确命中（含无空格精确串） |
| 意图匹配 | 92 | 强 How-To-Onboard，与同聚类 4 篇做显式切分（见下） |
| 结构化（Featured Snippet） | 95 | H2 一/二/三/八 段首答句 39/32/38/25 字（均 ≤40），含 7 天总览表 + 每日三栏表 |
| 字数与厚度 | 90 | 正文 ≈2,855 中文字，落在 2,800–3,800 目标区间 |
| 内链健康 | 95 | 19 条白名单全带 `?lang=zh-CN`，forbidden 正文 0，外链 0 |
| 蚕食防护 | 94 | 与 `first-vertical-drama-zero-experience`（极简快路径）、`how-to-create-ai-short-drama`（按环节）、`ai-short-drama-complete-guide`（全景）做词汇消歧 + 双向互链 |
| **加权总分** | **~86** | 可发布 |

---

## 2. P0 问题（阻断发布）

**无。** 初稿曾两个问题（长尾 0/12 精确命中、字数 2,268 不足），均已在修正稿解决：长尾 12/12 精确串植入，字数补至 2,855。

---

## 3. P1 问题（建议优化，非阻断）

- **P1-1（轻微，已规避）**：H2 一 用"AI短剧"裸词与"AI 短剧"空格混用——不影响 SEO 精确串命中（长尾已独立精确出现），但建议上线前统一为"AI短剧"无空格以强化主词信号。✅ 修后已统一主词串。
- **P1-2（提示）**：Meta Description 备选 2 已含完整 Day1–Day7 串，建议优先采用（覆盖更多长尾的摘要展示）。
- **P1-3（提示）**：llms.txt 须将该文列入互斥集 `AI short drama 7-day beginner tutorial / onboarding 2026`，与 `how-to-create-ai-short-drama`（by stage）、`first-vertical-drama-zero-experience`（minimal first drama）互斥，防站内自竞争。

---

## 4. 核验证据（脚本 `tmp/verify_tutorial_10.py`）

- 长尾覆盖：12/12 OK
- forbidden slug 正文：8 项全 CLEAN（含 `ai-short-drama-monetization` 用负向前瞻排除 `-copyright` / `-roi-model` 误判）
- 白名单链接：19/19 命中，非白名单链接 0；外链 URL 正文 0
- 答句长度：H2一 39 / H2二 32 / H2三 38 / H2八 25（均 ≤40）
- 正文 CJK ≈ 2,855（目标 2,800–3,800）
- 生产注扫描：0（无"便于被 AI 引用/FAQPage/llms.txt/精选摘要"等注进正文）

---

## 5. 发布前确认项（与 publish-checklist 对齐）

- [x] 主词进 H1/H2一/H2九
- [x] 12 长尾精确串覆盖
- [x] 字数达标
- [x] 答句 ≤40
- [x] forbidden 0 / 白名单 19 全带 ?lang=zh-CN
- [ ] slug 入 blog.ts + titleZh（批量发布时）
- [ ] llms.txt 互斥集登记
