"""sitemap.xml 同步：/guides 迁入 /blog（2026-09-01）

⚠️ public/sitemap.xml 是手写静态文件，prerender 只更新 lastmod、不生成条目
   （详见 skill lollipop-packaging）。任何路由增删都必须手动同步这里。

本脚本做三件事：
  1. 删除全部 /guides/* 的 <url> 块（13 个页面已下线：1 列表页 + 3 分类页 + 9 篇）
  2. 追加 9 条 /blog/<slug> 的 <url> 块（迁入的指南），沿用现有 blog 条目的 hreflang 模板
  3. 校验：/blog 条目数 == blog.ts 里的文章总数，且零 /guides 残留

用法：python scripts/update-sitemap-guides-merge.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITEMAP = ROOT / "public" / "sitemap.xml"
BLOG_TS = ROOT / "src" / "app" / "data" / "blog.ts"

# 迁入的 9 篇指南 slug（顺序与 blog.ts 中追加的顺序一致）
MIGRATED_SLUGS = [
    "character-consistency-workflow",
    "ten-episodes-two-weeks",
    "publish-and-monetize-vertical-drama",
    "script-to-screen-pipeline",
    "fix-ai-video-artifacts",
    "first-vertical-drama-zero-experience",
    "ai-drama-budget-under-1000",
    "multilingual-localization-workflow",
    "ai-drama-legal-checklist",
]

LANGS = [("en", ""), ("zh-CN", "/zh"), ("zh-TW", "/zh-TW"),
         ("pt", "/pt"), ("es", "/es"), ("ar", "/ar")]
LAST_MOD = "2026-09-01"

raw = SITEMAP.read_text(encoding="utf-8")
eol = "\r\n" if "\r\n" in raw else "\n"

# ── 1. 切出所有 <url> 块 ────────────────────────────────────────────────────
blocks = re.findall(r"[ \t]*<url>.*?</url>" + ("\r?\n" if eol == "\r\n" else "\n"), raw, re.S)
print(f"原始 <url> 块：{len(blocks)}")

def loc_of(block: str) -> str:
    m = re.search(r"<loc>(.*?)</loc>", block, re.S)
    return m.group(1).strip() if m else ""

kept, dropped = [], []
for b in blocks:
    (dropped if "/guides" in loc_of(b) else kept).append(b)

print(f"删除 /guides 块：{len(dropped)}")
for b in dropped:
    print(f"  - {loc_of(b)}")

# ── 2. 构造新 blog 块（照抄现有 blog 条目的 hreflang 模板）────────────────────
sample = next((b for b in kept if "/blog/" in loc_of(b)), None)
if sample is None:
    sys.exit("[FAIL] sitemap 里找不到任何 /blog/ 条目，无法套用模板")

def build_blog_block(slug: str) -> str:
    url = f"https://www.lollipop.im/blog/{slug}"
    lines = ["  <url>", f"    <loc>{url}</loc>", f"    <lastmod>{LAST_MOD}</lastmod>",
             "    <changefreq>weekly</changefreq>", "    <priority>0.6</priority>"]
    for hreflang, prefix in LANGS:
        lines.append(
            f'    <xhtml:link rel="alternate" hreflang="{hreflang}" '
            f'href="https://www.lollipop.im{prefix}/blog/{slug}" />'
        )
    lines.append(f'    <xhtml:link rel="alternate" hreflang="x-default" href="{url}" />')
    lines.append("  </url>")
    return eol.join(lines) + eol

existing = {loc_of(b) for b in kept}
new_blocks = []
for slug in MIGRATED_SLUGS:
    url = f"https://www.lollipop.im/blog/{slug}"
    if url in existing:
        print(f"  = 已存在，跳过：{url}")
        continue
    new_blocks.append(build_blog_block(slug))
    print(f"  + 新增：{url}")

# ── 3. 插到最后一个 blog 条目之后（保持分区聚合，可读性更好）──────────────────
out = raw
if new_blocks:
    last_blog = None
    for m in re.finditer(r"[ \t]*<url>.*?</url>", raw, re.S):
        if "/blog/" in loc_of(m.group(0)):
            last_blog = m
    if last_blog is None:
        sys.exit("[FAIL] 定位不到最后一个 /blog 条目")
    insert_at = last_blog.end()
    if not raw[insert_at:].startswith(eol):
        insert_at = raw.index(eol, insert_at) + len(eol)
    out = raw[:insert_at] + eol.join(new_blocks) + raw[insert_at:]

# 删除 /guides 块
for b in dropped:
    out = out.replace(b, "", 1)

SITEMAP.write_text(out, encoding="utf-8")
print(f"\n写入完成：{len(raw)} → {len(out)} 字节")

# ── 4. 校验 ─────────────────────────────────────────────────────────────────
final = SITEMAP.read_text(encoding="utf-8")
final_blocks = re.findall(r"<url>.*?</url>", final, re.S)
blog_urls = [loc_of(b) for b in final_blocks if "/blog/" in loc_of(b)]
guide_left = [loc_of(b) for b in final_blocks if "/guides" in loc_of(b)]

blog_slugs = re.findall(r'^\s*slug: "([^"]+)"', BLOG_TS.read_text(encoding="utf-8"), re.M)

print(f"\n=== 校验 ===")
print(f"sitemap <url> 总数：{len(final_blocks)}")
print(f"sitemap /blog 条目：{len(blog_urls)}  |  blog.ts 文章数：{len(blog_slugs)}")
print(f"sitemap /guides 残留：{len(guide_left)}")

ok = True
if guide_left:
    print(f"[FAIL] 仍有 /guides 条目：{guide_left}")
    ok = False
if len(blog_urls) != len(blog_slugs):
    missing = set(blog_slugs) - {u.rsplit("/", 1)[-1] for u in blog_urls}
    extra = {u.rsplit("/", 1)[-1] for u in blog_urls} - set(blog_slugs)
    if missing:
        print(f"[FAIL] blog.ts 有但 sitemap 缺：{sorted(missing)}")
    if extra:
        print(f"[FAIL] sitemap 有但 blog.ts 缺：{sorted(extra)}")
    ok = False

print("\n[PASS] sitemap 与数据层一致" if ok else "\n[FAIL] 请修正上述差异")
sys.exit(0 if ok else 1)
