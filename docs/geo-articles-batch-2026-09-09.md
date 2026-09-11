# GEO 文章批次导入（2026-09-09）

把 10 篇 GEO 文章接入博客列表，并新增 Markdown 端点 + llms.txt 暴露。

**结果**：文章 30 → 40 篇；dist 静态页 311 → **361**（每篇多出 5 个语言版本页面）；sitemap 310 → **360 条**；新增 40 个 `/blog/<slug>.md` 端点；中文版产物 /zh/、/zh-TW/ 共 20 页（正文中文）。

---

## 一、新增文章（10 篇）

| # | slug | 分类 | 结构化数据 |
|---|------|------|-----------|
| 1 | top-8-ai-short-drama-engines-2026 | Industry Insights | Article + FAQPage |
| 2 | mastering-character-consistency-ai-video | Production Workflow | Article + FAQPage |
| 3 | ai-scriptwriting-micro-dramas-prompts | Creator Guides | Article + FAQPage |
| 4 | ai-short-drama-localization | Distribution & Monetization | **TechArticle + HowTo(4 步)** + FAQPage |
| 5 | traditional-vs-ai-short-drama-production-cost | Industry Insights | Article + FAQPage |
| 6 | prompting-cinematic-camera-movements-vertical | Production Workflow | Article + FAQPage |
| 7 | web-novel-to-ai-short-drama-pipeline | Production Workflow | **TechArticle + HowTo(5 步)** + FAQPage |
| 8 | ai-audio-soundscapes-short-dramas | Production Planning | Article + FAQPage |
| 9 | ai-short-drama-monetization-copyright | Distribution & Monetization | Article + FAQPage |
| 10 | fixing-ai-video-artifacts | Production Workflow | Article + FAQPage |

统一属性：作者 Evelyn Cho (Content Lead)、发布/更新 2026-09-09、每篇 5 条 Key Takeaways、8 条 FAQ。

## 二、数据处理决策

1. **导入脚本**：`scripts/import-geo-articles.py`（试跑 `python scripts/import-geo-articles.py`，写入加 `--write`）。
   单一数据源写入三件套：`blog.ts`（元数据）/ `blogContent.ts`（正文）/ `blogFaq.ts`（FAQ）。
2. **正文清洗**：去掉 H1、作者 byline、FAQ 段（FAQ 由 `blogFaq` 渲染为可见问答块 + FAQPage schema，留在正文会逐字重复）、尾部自带 JSON-LD（schema 由页面统一生成）；保留 Core Answer、来源与相关阅读（内部互链）。
3. **英文-only**：源稿无中文，`titleZh / excerptZh / contentZh` 置空 —— `multilangSubset.ts` 以 `titleZh` 判定子集，因此**不会生成空的中文壳页**（正是审计 P1-1 那类问题）。补齐中文后可自动进入多语言子集。
4. **口径统一**：源稿写「70% 分成」，与全站对外口径（80%）冲突，统一改为 80%（含 "a 80%" → "an 80%" 语法修正）。
5. **HowTo 只对真实有序步骤输出**：仅第 4、7 篇（原文即为 `### Step N:` 结构），步骤文本与可见文本逐字一致。

## 三、Markdown 端点（新能力）

- 预渲染新增 `generateMarkdownEndpoints()`：为**全部 40 篇**输出 `dist/blog/<slug>.md`
  - 含 YAML front matter（title / description / canonical / author / published / updated / category / markdown_source）
  - 内容 = 正文 + 步骤（如有）+ FAQ（补齐 HTML 侧拆出去的 FAQ，保证 .md 是可独立引用的完整文档）
- `llms.txt` 新增 `## Markdown Sources` 段列出 40 个 .md 端点；`llms-full.txt` 每篇补 `Markdown:` 行
- robots.txt 未限制 `.md`（仅 /distribution/ /login /forgot-password 被 Disallow）

## 四、两处代码修复（导入过程中暴露）

1. **`prerender-plugin.ts` 博客路由无条件 `hreflangLangs: ALL_SEGMENTS`** —— 依赖「所有文章都有中文」这一隐含前提；英文-only 文章会导致 `stepsZh` 读取崩溃并生成空中文壳页。改为以 `isMultilangSubsetPath()` 判定（与运行时 hreflang 同一真源），并给 `buildLocalizedBlogSchema` 加 `stepsZh ?? steps` 兜底。
2. **`verify-blog.py` 的「/guides 迁入」判定过宽** —— 原按「有步骤且 category ≠ guide」推断，把新增的 workflow/distribution 文章误判为需 `/guides/<slug>` 301。改为显式列出真实迁入的 9 个 slug。

## 五、验证结果

- `verify-blog.py`：**567 PASS / 0 FAIL**
- `check-dist-links.py`：314 个 HTML / 14363 条站内引用 → 资源缺失 0、悬挂内链 0
- `seo-self-check.py`：薄内容 0 / noindex 0 / 缺 alt 0（唯一告警是域名验证纯文本文件，预期）
- 抽样：新文章表格正常渲染（4 个 table）、可见 FAQ 8 条、HowTo 步骤数正确（5 步）

## 六、后续可选

- 补齐 10 篇中文译文（`titleZh / excerptZh / contentZh / stepsZh / FAQ 中文`）→ 自动进入多语言子集，产出 5 语言版本
- 补 `coverImage`（当前用占位图 `/blog-images/guide.png`）
- 本次 dist 尚未部署；部署后建议对新增 10 条 URL 走一次 IndexNow 提交（脚本已改为只读 dist 版 sitemap）

---

## 七、中文版补齐（2026-09-09 追加批次）

- 10 篇全部补齐 `titleZh / excerptZh / contentZh / keyTakeawaysZh / FAQ 中文 / stepsZh（第 4、7 篇）`
- `titleZh` 非空 → 被 `multilangSubset.ts` 自动纳入子集 → 预渲染为 zh / zh-TW / pt / es / ar 五个版本（pt/es/ar 正文仍为英文，既定妥协）
- 中文 FAQ：`question/answer` 改为中文，原英文挪到 `questionEn/answerEn`
- 中文版产物体积：每篇正文 1.4k–3.4k 汉字 + 8 条 FAQ +（04/07）4/5 个 HowToStep

### 翻译源与注入脚本
- 中文稿位于 `tmp/geo-zh/01_top8_engines.md` … `10_fixing_artifacts.md`（共 10 份）
- 注入脚本：`scripts/apply-geo-zh.py`（试跑 `python scripts/apply-geo-zh.py`，写入加 `--write`，脚本已幂等化）
- 关键参数：摘要 `trim_sentences(核心答案, 300)` 句号粒度断句；FAQ 顺序与英文严格 1:1 对齐
- 数据校验（重新跑）：`titleZh: 40`、`contentZh: 40`、`keyTakeawaysZh: 40`、`stepsZh: 14`、`questionEn: 207`

### 终检（中文版后）
- `verify-blog.py`：**567 PASS / 0 FAIL**
- `check-dist-links.py`：0 资源缺失、0 悬挂内链
- `seo-self-check.py`：薄内容 0 / noindex 0 / 缺 alt 0（唯一告警 = 域名验证文件，预期）
- 抽样：中文版正文 12,773 / 13,187 字符、FAQ 8 条、HowToStep 4 / 5 步
- dist 361 页（30 子集路由 + 10 新文章 + 5 语言 × 10 新文章 = 311 + 50）、sitemap 360 条
