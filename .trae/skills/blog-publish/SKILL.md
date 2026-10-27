---
name: blog-publish
description: Publish or update a blog article on lollipop.im — writes metadata, body, FAQ, builds, deploys, and commits. Use when the user asks to publish, deploy, or launch a blog post, or when an article draft is ready to go live. Do not use for writing the article from scratch.
---

# Blog Publisher — lollipop.im

把一篇已完成的博客文章发布到 lollipop.im 网站。**这个 Skill 假设文章 Markdown 已经写好了**（在 `drafts/` 目录）。它不负责写文章——只负责把文章发布上线。

## 何时使用

- 用户说"发布这个博客文章"、"deploy 这篇"、"把这篇发上去"
- 一篇新文章 Markdown 已写完，需要上线
- 需要同时发布多篇文章

## 先决条件

1. Markdown 文章在 `drafts/*.md` 路径，包含：
   - `# Article Title` — 一级标题
   - `> **Direct Answer:** ...` — 开头 50-80 词的 blockquote 直接回答
   - `## FAQ` 或 `## Frequently Asked Questions` — 可选
2. 工作目录在 repo 根 `c:\Users\Administrator\Documents\lollipop`
3. `pnpm build` 能成功（当前环境已验证）
4. SSH key `C:/Users/Administrator/.ssh/id_ed25519_hermes` 存在（deploy 用）

## 一步命令发布

```bash
python scripts/publish_article.py --draft drafts/article-title.md --category creator
```

脚本会自动完成：
1. 提取 title / slug / Direct Answer / FAQ
2. 追加 blog.ts 元数据
3. 追加 blogContent.ts content + contentZh（英文 fallback）
4. 追加 blogFaq.ts FAQ 条目（自动识别 Q&A 格式）
5. `pnpm build` 验证
6. `python scripts/deploy_html_batch.py` 部署
7. `git commit + push`

## 全量参数

```bash
python scripts/publish_article.py \
  --draft drafts/my-article.md \
  --slug my-custom-slug \
  --category creator \
  --category-label "AI Creator Economics" \
  --title-zh "我的文章标题中文" \
  --excerpt-zh "中文摘要 180 字以内" \
  --seo-title "SEO Title — Site Name" \
  --seo-desc "SEO description under 155 chars" \
  --cover-image "/blog-images/custom-cover.webp" \
  --author "Jane Zhang" \
  --author-role "Lead Creator" \
  --author-bio "1-2 sentence bio" \
  --takeaways-en "Key point 1" "Key point 2" "Key point 3" \
  --takeaways-zh "要点 1" "要点 2" "要点 3" \
  --dry-run \
  --skip-build --skip-deploy --skip-git
```

**先 `--dry-run` 预览，去掉后才真正写文件。**

## 博客数据架构

网站博客数据分三个文件，职责严格分离：

| 文件 | 职责 | 字段 |
|------|------|------|
| `src/app/data/blog.ts` | 元数据 | slug, title, titleZh, excerpt, excerptZh, seoTitle, seoDescription, category, categoryLabel, coverImage, author, authorRole, authorBio, publishDate, updateDate, keyTakeaways, keyTakeawaysZh |
| `src/app/data/blogContent.ts` | 正文 | `Record<string, BlogBody>` — 键是 slug，值 `{ content: markdown, contentZh?: markdown }` |
| `src/app/data/blogFaq.ts` | FAQ JSON-LD | `Record<string, FaqItem[]>` — 键是 slug，值 `[{ question, answer, questionEn?, answerEn? }]` |

### Category 枚举值

```
"industry" | "creator" | "guide" | "workflow" | "production" | "distribution"
```

`blog.ts` 是 `export const blogMeta: BlogMeta[] = [...]` 数组，结束在 `];/** 通过 slug 查找` 注释处。
`blogContent.ts` 是 `export const blogContent: Record<string, BlogBody> = { ... };/** 合并元数据` Record。
`blogFaq.ts` 是 `export const blogFaq: Record<string, FaqItem[]> = { ... };` Record。

### 新增规则

- 追加到数组/Record 末尾，保持原顺序不打乱
- `blog.ts` 最后一个 blogMeta 对象的结束是 `  },\n`，下一个新对象前加 `,\n  {`
- `blogContent.ts` 最后一条 blogContent 的结束是 `  },\n`，下一条前加 `  "slug": {\n    content: \`...\`,\n    contentZh: \`...\`,\n  },\n`

## Template Literal 转义陷阱

`blogContent.ts` 用反引号 template literal 包裹 markdown。markdown 里如果有反引号或 `${` 会直接让 TypeScript 编译崩溃。脚本的 `escape_tl()` 已经处理了：

```python
def escape_tl(text: str) -> str:
    text = text.replace('\\', '\\\\')   # 先转反斜杠
    text = text.replace('`', '\\`')     # 转反引号
    text = text.replace('${', '\\${')   # 转模板插值
    return text
```

**如果手动编辑 blogContent.ts，务必先过这个函数。** 否则 build 会报 esbuild `Expected "}" but found "−"` 或类似的诡异错误。

## 服务器部署细节

- SSH: `ssh -i C:/Users/Administrator/.ssh/id_ed25519_hermes ubuntu@43.160.226.253`
- Web root: `/srv/www/lollipop/current`（symlink → releases/）
- Deploy 脚本: `scripts/deploy_html_batch.py` — tar → SFTP → extract → rsync → IndexNow
- Deploy 输出 Step 6 检查 `CF / llms-txt link: 1` 确认线上内容正确
- **IndexNow Step 7 长期返回 403** — 这是 key 验证问题，不影响发布，已知问题

## 必做但脚本做不了的事

### 🔴 Cloudflare Purge Everything（必须手动）

服务器没有 CF API token，无法自动 purge。发布后必须手动：

1. 打开 dash.cloudflare.com → **lollipop.im** → **Caching** → **Configuration**
2. 点 **Purge Everything**
3. 等 1–2 分钟让边缘节点刷新

脚本输出末尾会提醒这件事。

### 🟡 contentZh 中文内容

`publish_article.py` 默认把 `contentZh` 设成英文 fallback（同样的 markdown）。这样 zh/zh-TW SSR 不会崩溃，但中文访问者看到的是英文。有两种升级方式：

1. **快速升级**：手动在 `blogContent.ts` 找到该 slug 的 contentZh 块，把 Direct Answer、表格标题、FAQ 问答翻译成中文
2. **完整升级**：整篇 markdown 写成双语（像版权文章那样 English/中文 分列）

翻译完记得重新 `pnpm build && python scripts/deploy_html_batch.py`。

## 封面图

`coverImage` 路径是 `/blog-images/filename.webp`。图片放在 `public/blog-images/` 下，build 时复制到 `dist/blog-images/`。

现有可复用封面图路径：
- `/blog-images/ai-production-cost-new.webp` — 商业模型/成本类
- `/blog-images/ai-short-drama-analytics-retention-completion-revenue.webp` — 数据分析类
- `/blog-images/ai-short-drama-complete-guide-new.webp` — 完整指南类
- `/blog-images/ai-short-drama-industry-trends-2026.webp` — 行业趋势类
- `/blog-images/ai-short-drama-promotion-guide-2026.webp` — 推广类
- `/blog-images/ai-short-drama-faq-2026.webp` — FAQ 类

## 已发布文章（参考格式）

| Slug | Category | Cover |
|------|----------|-------|
| ai-short-drama-copyright-commercial-rights | creator | ai-short-drama-industry-trends-2026.webp |
| ai-short-drama-distribution-platforms-submission | creator | ai-short-drama-complete-guide-new.webp |
| ai-short-drama-retention-analytics-drop-off-cohorts | creator | ai-short-drama-analytics-retention-completion-revenue.webp |
| ai-short-drama-studio-economics-break-even-profit | creator | ai-production-cost-new.webp |

## 常见问题排查

**Q: 脚本说 slug 已存在？**
A: 用 `--slug different-name` 指定新 slug，或手动从 blog.ts/blogContent.ts/blogFaq.ts 删除旧条目。

**Q: Build 报 esbuild 编译错误？**
A: 99% 是 template literal 内有未转义的反引号。用脚本发布就不会有——脚本自动转义。手动编辑时必须过 `escape_tl()`。

**Q: Deploy Step 6 显示 CF / llms-txt link: 0？**
A: CF 还在缓存旧版本（或者 Purge Everything 没做）。先手动 Purge Everything，然后重跑 deploy。

**Q: 三篇文章的 zh/zh-TW 页崩溃？**
A: 原因是 `contentZh` 缺失（SSR 调 `.split()` on undefined）。必须给每篇都写 `contentZh`——就算是英文 fallback 也行。脚本自动处理。

## 手动发布（当脚本不适用时）

1. 读 `src/app/data/blog.ts` 最后一个 blogMeta 对象 → 加新对象，注意逗号和缩进
2. 读 `src/app/data/blogContent.ts` 最后一条 Record 记录 → 加 content + contentZh，**先过 escape_tl()**
3. 读 `src/app/data/blogFaq.ts` 最后一条 → 加 FAQ 数组，手动解析问答格式
4. `pnpm build` 必须零报错
5. `python scripts/deploy_html_batch.py`
6. `curl.exe -s -o NUL -w "%{http_code}" https://www.lollipop.im/blog/YOUR-SLUG` 验证 200
7. `git add -A && git commit -m "feat: publish YOUR-SLUG" && git push`
8. 手动 Cloudflare Purge Everything
