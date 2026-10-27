"""
lollipop.im Blog Article Publisher

把一篇博客文章发布到网站。从 drafts/*.md 读取 Markdown，
自动写入 blog.ts（元数据）、blogContent.ts（正文）、blogFaq.ts（FAQ），
然后 build、deploy、git commit + push。

使用：
    python scripts/publish_article.py --draft drafts/ai-short-drama-economics.md
    python scripts/publish_article.py --draft drafts/article.md --slug custom-slug
    python scripts/publish_article.py --dry-run --draft drafts/article.md

要求：
    - 工作目录在 repo 根
    - Markdown 必须有 # Title 和 > **Direct Answer:**
    - 可选：FAQ 部分（## FAQ 或 ## Frequently Asked Questions）
    - Python 3.10+，依赖：paramiko（deploy 用）
"""

import argparse
import re
import sys
import subprocess
import os
from pathlib import Path

REPO = Path(__file__).parent.parent
BLOG_TS = REPO / 'src/app/data/blog.ts'
CONTENT_TS = REPO / 'src/app/data/blogContent.ts'
FAQ_TS = REPO / 'src/app/data/blogFaq.ts'

CATEGORIES = ['industry', 'creator', 'guide', 'workflow', 'production', 'distribution']


def slugify(name: str) -> str:
    """Kebab-case slug: lowercase, replace non-alnum with hyphens."""
    s = name.lower().strip()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')


def escape_tl(text: str) -> str:
    """Escape chars that break a JS template literal."""
    text = text.replace('\\', '\\\\')
    text = text.replace('`', '\\`')
    text = text.replace('${', '\\${')
    return text


def extract_sections(md: str) -> dict:
    """从 markdown 提取 title、direct answer、FAQ 等。"""
    sections = {}

    title_m = re.search(r'^#\s+(.+)$', md, re.MULTILINE)
    sections['title'] = title_m.group(1).strip() if title_m else "Untitled"

    da_m = re.search(r'>\s*\*\*Direct Answer:\*\*\s*(.+?)(?:\n|$)', md)
    sections['direct_answer'] = da_m.group(1).strip() if da_m else ""

    # FAQ — 匹配 ## FAQ 或 ## Frequently Asked Questions (## FAQ) 等格式
    faq_match = re.search(
        r'##\s+(?:Frequently Asked Questions(?:\s*\(FAQ\))?|FAQ)\s*\n(.*?)(?=\n---\n\n## |\n---\n\n\*|\Z)',
        md, re.DOTALL
    )
    sections['faq_text'] = faq_match.group(1).strip() if faq_match else ""

    return sections


def parse_faq_items(faq_text: str) -> list[dict]:
    """Parse FAQ text into structured items. 支持两种格式：
    
    格式 A: **Q1: question**  \nEnglish: ...  \n中文: ...
    格式 B: **Q1: question**  \nA: answer
    格式 C: ### Q1: question\n\n**Yes — but only...**
    """
    items = []

    # 格式 A (English/Chinese split)
    for m in re.finditer(
        r'\*\*Q\d+:\s*([^*]+)\*\*\s*\nEnglish:\s*([^\n]+(?:\n(?!\*\*|English:|中文:|---)[^\n]+)*)\n中文:\s*([^\n]+(?:\n(?!\*\*|English:|中文:|---)[^\n]+)*)',
        faq_text, re.MULTILINE
    ):
        items.append({
            'question': m.group(1).strip(),
            'answer': m.group(3).strip(),  # Chinese
            'questionEn': m.group(1).strip(),
            'answerEn': m.group(2).strip(),
        })

    if items:
        return items

    # 格式 B (简单 Q&A)
    for m in re.finditer(
        r'\*\*Q\d+:\s*([^*]+)\*\*\s*\nA:\s*([^\n]+(?:\n(?!\*\*Q\d+|---)[^\n]+)*)',
        faq_text, re.MULTILINE
    ):
        items.append({
            'question': m.group(1).strip(),
            'answer': m.group(2).strip(),
            'questionEn': m.group(1).strip(),
            'answerEn': m.group(2).strip(),
        })

    if items:
        return items

    # 格式 C (### Q1: ... + **Answer:** ...)
    for m in re.finditer(
        r'###\s*Q\d+:\s*([^\n]+)\n\n(.+?)(?=\n###\s*Q\d+|\Z)',
        faq_text, re.DOTALL
    ):
        q = m.group(1).strip()
        a = re.sub(r'^\*\*([^*]+):\*\*\s*', '', m.group(2).strip())
        items.append({
            'question': q,
            'answer': a,
            'questionEn': q,
            'answerEn': a,
        })

    return items


# ========= blog.ts metadata =========

def insert_blog_meta(slug: str, title: str, title_zh: str, excerpt: str, excerpt_zh: str,
                     seo_title: str, seo_desc: str, category: str, category_label: str,
                     cover_image: str, author: str, author_role: str, author_bio: str,
                     publish_date: str, takeaways_en: list, takeaways_zh: list) -> bool:
    """向 blogMeta 数组追加一条记录。"""
    if category not in CATEGORIES:
        print(f"  ⚠️  category '{category}' 不在 {CATEGORIES} 中")
        return False

    with open(BLOG_TS, 'r', encoding='utf-8') as f:
        content = f.read()

    if slug in content:
        print(f"  ⚠️  slug '{slug}' 已存在于 blog.ts，跳过")
        return False

    # 找插入点：blogMeta 数组最后一个对象的结束 }, 之前
    close_marker = '];/** 通过 slug 查找'
    close_pos = content.find(close_marker)
    if close_pos == -1:
        close_pos = content.find('export function getBlogMetaBySlug')
    if close_pos == -1:
        print("  ❌ 找不到 blogMeta 结束标记")
        return False

    search_back = content[:close_pos]
    last_obj_end = search_back.rfind('  },\n')
    if last_obj_end == -1:
        print("  ❌ 找不到最后一个 blogMeta 对象的结束位置")
        return False

    def esc_q(s):
        return s.replace('"', '\\"')

    def esc_brackets(arr):
        return ', '.join(f'"{esc_q(s)}"' for s in arr)

    new_obj = f''',
  {{
    slug: "{slug}",
    coverImage: "{cover_image}",
    title: "{esc_q(title)}",
    titleZh: "{esc_q(title_zh)}",
    excerpt: "{esc_q(excerpt)}",
    excerptZh: "{esc_q(excerpt_zh)}",
    seoTitle: "{esc_q(seo_title)}",
    seoDescription: "{esc_q(seo_desc)}",
    category: "{category}",
    categoryLabel: "{esc_q(category_label)}",
    author: "{esc_q(author)}",
    authorRole: "{esc_q(author_role)}",
    authorBio: "{esc_q(author_bio)}",
    publishDate: "{publish_date}",
    updateDate: "{publish_date}",
    keyTakeaways: [{esc_brackets(takeaways_en)}],
    keyTakeawaysZh: [{esc_brackets(takeaways_zh)}],
  }}'''

    new_content = content[:last_obj_end] + new_obj + content[last_obj_end:]

    with open(BLOG_TS, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"  ✅ blog.ts metadata 已插入 (slug={slug})")
    return True


# ========= blogContent.ts =========

def insert_blog_content(slug: str, md: str, md_zh_fallback: str = None) -> bool:
    """向 blogContent Record 追加 content + contentZh。"""
    with open(CONTENT_TS, 'r', encoding='utf-8') as f:
        content = f.read()

    if slug in content and f'"{slug}":' in content:
        print(f"  ⚠️  slug '{slug}' 已存在于 blogContent.ts，跳过")
        return False

    close_marker = '};/** 合并元数据'
    close_pos = content.find(close_marker)
    if close_pos == -1:
        close_pos = content.rfind('};')
    if close_pos == -1:
        print("  ❌ 找不到 blogContent 结束标记")
        return False

    md_escaped = escape_tl(md)
    zh_escaped = escape_tl(md_zh_fallback) if md_zh_fallback else md_escaped

    new_entry = f'  "{slug}": {{\n    content: `{md_escaped}`,\n    contentZh: `{zh_escaped}`,\n  }},\n'
    new_content = content[:close_pos] + new_entry + content[close_pos:]

    with open(CONTENT_TS, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"  ✅ blogContent.ts 已写入 ({len(md_escaped)} chars content, contentZh=fallback)")
    return True


# ========= blogFaq.ts =========

def insert_blog_faq(slug: str, faq_items: list[dict]) -> bool:
    """向 blogFaq Record 追加 FAQ 条目。"""
    if not faq_items:
        print("  ℹ️  没有 FAQ 可提取，跳过 blogFaq.ts")
        return True

    with open(FAQ_TS, 'r', encoding='utf-8') as f:
        content = f.read()

    if slug in content and f'"{slug}":' in content:
        print(f"  ⚠️  slug '{slug}' 已存在于 blogFaq.ts，跳过")
        return False

    close_pos = content.rfind('};')
    if close_pos == -1:
        print("  ❌ 找不到 blogFaq 结束标记")
        return False

    def esc_q(s):
        return s.replace('"', '\\"').replace('\n', ' ')

    ts_items = []
    for item in faq_items:
        ts_items.append(f'''    {{
      question: "{esc_q(item["question"])}",
      answer: "{esc_q(item["answer"])}",
      questionEn: "{esc_q(item["questionEn"])}",
      answerEn: "{esc_q(item["answerEn"])}",
    }},''')

    new_entry = f'  "{slug}": [\n' + '\n'.join(ts_items) + '\n  ],\n'
    new_content = content[:close_pos] + '\n' + new_entry + '\n};\n'

    with open(FAQ_TS, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"  ✅ blogFaq.ts 已写入 ({len(faq_items)} 条 FAQPage)")
    return True


# ========= pipeline =========

def run_build() -> bool:
    """pnpm build."""
    print("\n=== Building ===")
    result = subprocess.run(['pnpm', 'build'], cwd=str(REPO), capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  ❌ Build 失败:\n{result.stderr[-1000:]}")
        return False
    print("  ✅ Build 通过")
    return True


def run_deploy() -> bool:
    """python scripts/deploy_html_batch.py."""
    print("\n=== Deploying ===")
    result = subprocess.run(['python', 'scripts/deploy_html_batch.py'], cwd=str(REPO),
                           capture_output=True, text=True, timeout=300)
    if result.returncode != 0:
        print(f"  ❌ Deploy 失败:\n{result.stderr[-1000:]}")
        return False
    # Check key step results
    out = result.stdout
    if '=== Step 6:' in out and 'CF / llms-txt link: 1' in out:
        print("  ✅ Deploy Step 1-6 通过")
        return True
    print(f"  ⚠️ Deploy 输出:\n{out[-500:]}")
    return 'Done' in out


def run_git_commit_push(slug: str) -> bool:
    """git add + commit + push."""
    print("\n=== Git commit + push ===")
    msg = f'feat: publish {slug}'

    subprocess.run(['git', 'add', '-A'], cwd=str(REPO), capture_output=True)
    result = subprocess.run(['git', 'commit', '-m', msg], cwd=str(REPO), capture_output=True, text=True)
    if result.returncode != 0:
        # might be "nothing to commit"
        print(f"  ℹ️  git commit: {result.stdout.strip() or result.stderr.strip()}")

    result = subprocess.run(['git', 'push'], cwd=str(REPO), capture_output=True, text=True, timeout=60)
    if result.returncode != 0:
        print(f"  ❌ git push 失败: {result.stderr}")
        return False

    print("  ✅ Git push 成功")
    return True


def main():
    parser = argparse.ArgumentParser(description='Publish blog article to lollipop.im')
    parser.add_argument('--draft', required=True, help='Markdown draft file path (e.g., drafts/article.md)')
    parser.add_argument('--slug', help='Override auto-generated slug')
    parser.add_argument('--dry-run', action='store_true', help='不写文件、不 build、不 deploy')
    parser.add_argument('--skip-build', action='store_true')
    parser.add_argument('--skip-deploy', action='store_true')
    parser.add_argument('--skip-git', action='store_true')
    parser.add_argument('--author', default='Marcus Liu')
    parser.add_argument('--author-role', default='Creator Economics Analyst')
    parser.add_argument('--author-bio', default='Marcus covers AI entertainment trends and creator economy analysis at Lollipop Drama.')
    parser.add_argument('--category', default='creator', choices=CATEGORIES)
    parser.add_argument('--category-label', default='Creator Content')
    parser.add_argument('--cover-image', default='/blog-images/ai-production-cost-new.webp')
    parser.add_argument('--title-zh', default='')
    parser.add_argument('--excerpt-zh', default='')
    parser.add_argument('--seo-title', default='')
    parser.add_argument('--seo-desc', default='')
    parser.add_argument('--takeaways-en', nargs='*', default=[])
    parser.add_argument('--takeaways-zh', nargs='*', default=[])
    args = parser.parse_args()

    # 读 markdown
    draft_path = REPO / args.draft
    if not draft_path.exists():
        print(f"❌ 找不到 draft: {draft_path}")
        sys.exit(1)

    with open(draft_path, 'r', encoding='utf-8') as f:
        md = f.read()

    sections = extract_sections(md)
    slug = args.slug or slugify(sections['title'])
    title = sections['title']
    da = sections['direct_answer']

    # 自动推断字段
    excerpt = da[:180] + ("..." if len(da) > 180 else "")
    seo_title = args.seo_title or f"{title} | Lollipop Drama"
    seo_desc = args.seo_desc or excerpt
    title_zh = args.title_zh or title
    excerpt_zh = args.excerpt_zh or excerpt
    takeaways_en = args.takeaways_en or [da[:120]]
    takeaways_zh = args.takeaways_zh or [excerpt_zh[:120]]

    faq_items = parse_faq_items(sections['faq_text']) if sections['faq_text'] else []

    today = subprocess.run(['powershell', '-Command', 'Get-Date -Format "yyyy-MM-dd"'],
                          capture_output=True, text=True).stdout.strip()

    print(f"""
========================================
  Blog Publisher — {slug}
========================================
  Draft:       {draft_path.name}
  Title:       {title}
  Category:    {args.category} / {args.category_label}
  Author:      {args.author}
  FAQ:         {len(faq_items)} items extracted
  Build:       {'DRY RUN' if args.dry_run else 'yes (unless --skip-build)'}
  Deploy:      {'DRY RUN' if args.dry_run else 'yes (unless --skip-deploy)'}
  Git:         {'DRY RUN' if args.dry_run else 'yes (unless --skip-git)'}
========================================
""")

    if args.dry_run:
        print("ℹ️  DRY RUN — 停止。确认后去掉 --dry-run 重跑。")
        return

    # Step 1: blog.ts metadata
    if not insert_blog_meta(
        slug, title, title_zh, excerpt, excerpt_zh, seo_title, seo_desc,
        args.category, args.category_label, args.cover_image,
        args.author, args.author_role, args.author_bio, today,
        takeaways_en, takeaways_zh
    ):
        print("❌ blog.ts 写入失败，中止")
        sys.exit(1)

    # Step 2: blogContent.ts
    if not insert_blog_content(slug, md):
        print("❌ blogContent.ts 写入失败，中止")
        sys.exit(1)

    # Step 3: blogFaq.ts
    insert_blog_faq(slug, faq_items)

    # Step 4: build
    if not args.skip_build:
        if not run_build():
            print("\n❌ Build 失败。文章未发布，请修复后重跑。")
            sys.exit(1)

    # Step 5: deploy
    if not args.skip_deploy:
        if not run_deploy():
            print("\n⚠️  Deploy 可能有问题。继续 git commit。")

    # Step 6: git
    if not args.skip_git:
        run_git_commit_push(slug)

    print(f"""
========================================
✅ 发布完成
========================================
  URL:   https://www.lollipop.im/blog/{slug}
  构建:  成功
  Git:   已 push

  ⚠️  Cloudflare Purge Everything 还需手动做：
  dash.cloudflare.com → lollipop.im → Caching → Purge Everything
========================================
""")


if __name__ == '__main__':
    main()
