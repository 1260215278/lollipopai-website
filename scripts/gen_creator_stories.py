#!/usr/bin/env python3
"""Generate + insert the 10 Lollipop creator stories (ZH+EN) into blog.ts / blogContent.ts.

- Reads the 10 ZH (lollipop_creator_story_XX_*) and 10 EN (geo_creator_story_XX_*_EN) files
  extracted from the attached zip (tmp/lollipop_zip/).
- Strips trailing <script> JSON-LD, extracts H1 title, body, 核心答案/Core Answer summary,
  and ## section headings for keyTakeaways.
- Escapes content for TS template literals.
- Inserts into blogMeta (metadata) and blogContent (EN+ZH body) idempotently.
"""
import os, re

ZIP = r"C:\Users\Administrator\Documents\lollipop\tmp\lollipop_zip"
BLOG_TS = r"C:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts"
CONTENT_TS = r"C:\Users\Administrator\Documents\lollipop\src\app\data\blogContent.ts"

# (num, slug, zh_name, en_name)
STORIES = [
    ("01", "creator-story-taiwan-solo-daily", "taiwan_daily", "taiwan_daily"),
    ("02", "creator-story-topic-selection", "topic_selection", "topic_selection"),
    ("03", "creator-story-script-licensing", "script_licensing", "script_licensing"),
    ("04", "creator-story-cost-breakdown", "cost_breakdown", "cost_breakdown"),
    ("05", "creator-story-student-graduation", "student_graduation", "student_graduation"),
    ("06", "creator-story-warm-story-formula", "warm_story_formula", "warm_story_formula"),
    ("07", "creator-story-side-hustle-income", "side_hustle_income", "side_hustle_income"),
    ("08", "creator-story-ai-compliance", "ai_compliance", "ai_compliance"),
    ("09", "creator-story-tool-pipeline-comparison", "tool_pipeline_comparison", "tool_pipeline"),
    ("10", "creator-story-character-bible", "character_bible", "character_bible"),
]

ZH_SKIP = ["适合谁", "常见问题", "来源", "延伸", "方法", "验证", "关于", "目录",
           "结语", "声明", "免责", "相关", "篇目", "身份", "目标", "导航", "总览",
           "篇", "一览", "按 ", "找你", "推荐", "核心答案"]
EN_SKIP = ["for", "faq", "who this", "source", "about", "related", "methodolog",
           "verif", "appendix", "checklist", "template", "recap", "summar",
           "disclaim", "contents", "reference", "next step", "find your", "recommend",
           "index", "overview", "core answer", "at a glance"]


def read_story(num, name, lang):
    if lang == "zh":
        fn = f"lollipop_creator_story_{num}_{name}_20260918.md"
    else:
        fn = f"geo_creator_story_{num}_{name}_EN_20260918.md"
    p = os.path.join(ZIP, fn)
    t = open(p, encoding="utf-8").read()
    return t


def strip_scripts(t):
    return re.sub(r"<script[\s\S]*?</script>", "", t, flags=re.I)


def split_h1(t):
    lines = t.split("\n")
    for i, ln in enumerate(lines):
        m = re.match(r"^#\s+(.*)", ln)
        if m:
            title = m.group(1).strip()
            body = "\n".join(lines[i + 1:])
            return title, body
    # fallback: whole text, title from first non-empty
    body = t
    title = ""
    for ln in lines:
        if ln.strip():
            title = ln.strip().lstrip("#").strip()
            break
    return title, body


def clean_md(s):
    s = re.sub(r"\*\*(.*?)\*\*", r"\1", s)        # bold
    s = re.sub(r"`([^`]*)`", r"\1", s)            # inline code
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)  # links -> text
    return s.strip()


def get_summary(t):
    # ZH: **核心答案：** ...   EN: **Core Answer:** ...
    for pat in [r"^\*\*(?:核心答案|Core Answer)[:：]\*\*\s*(.*)", r"(?:核心答案|Core Answer)[:：]\s*(.*)"]:
        m = re.search(pat, t, re.M)
        if m:
            return clean_md(m.group(1))
    # fallback: first non-empty body line
    for ln in t.split("\n"):
        ln = ln.strip()
        if ln and not ln.startswith("#") and not ln.startswith(">") and not ln.startswith("---"):
            return clean_md(ln)
    return ""


def get_takeaways(t, summary, skip):
    outs = [summary] if summary else []
    for ln in t.split("\n"):
        m = re.match(r"^##\s+(.*)", ln)
        if not m:
            continue
        h = clean_md(m.group(1))
        if not h or len(h) < 5 or len(h) > 70:
            continue
        low = h.lower()
        if any(k in low for k in skip):
            continue
        if h in outs:
            continue
        outs.append(h)
        if len(outs) >= 5:
            break
    return outs


def esc_template(s):
    s = s.replace("\\", "\\\\")
    s = s.replace("`", "\\`")
    s = s.replace("${", "\\${")
    return s


def esc_str(s):
    s = s.replace("\\", "\\\\")
    s = s.replace('"', '\\"')
    s = s.replace("\n", "\\n")
    return s


def meta_entry(slug, title, titleZh, excerpt, excerptZh, takes, takesZh):
    kt = "[" + ", ".join('"%s"' % esc_str(x) for x in takes) + "]"
    ktz = "[" + ", ".join('"%s"' % esc_str(x) for x in takesZh) + "]"
    return (
        "  {\n"
        f'    slug: "{esc_str(slug)}",\n'
        f'    title: "{esc_str(title)}",\n'
        f'    titleZh: "{esc_str(titleZh)}",\n'
        f'    excerpt: "{esc_str(excerpt)}",\n'
        f'    excerptZh: "{esc_str(excerptZh)}",\n'
        f'    seoTitle: "{esc_str(title)} | Lollipop Drama",\n'
        f'    seoDescription: "{esc_str(excerpt)}",\n'
        '    category: "creator",\n'
        '    categoryLabel: "Creator Stories",\n'
        '    author: "Evelyn Cho",\n'
        '    authorRole: "Lollipop Drama Content Lead",\n'
        '    authorBio: "Evelyn curates Lollipop Drama\'s creator-story series, turning first-person creator interviews and backend data into practical, numbers-backed playbooks for AI short-drama makers.",\n'
        '    publishDate: "2026-09-18",\n'
        '    updateDate: "2026-09-18",\n'
        f"    keyTakeaways: {kt},\n"
        f"    keyTakeawaysZh: {ktz},\n"
        "  },"
    )


def content_entry(slug, content_en, content_zh):
    return (
        f'  "{esc_str(slug)}": {{\n'
        f"    content: `{esc_template(content_en)}`,\n"
        f"    contentZh: `{esc_template(content_zh)}`,\n"
        "  },"
    )


def insert_before(haystack, marker, anchor_close, block):
    """Insert `block` right before the first `anchor_close` that follows `marker`."""
    start = haystack.find(marker)
    if start == -1:
        raise RuntimeError(f"marker not found: {marker}")
    close = haystack.find(anchor_close, start)
    if close == -1:
        raise RuntimeError(f"close anchor not found after marker: {marker}")
    return haystack[:close] + block + "\n" + haystack[close:]


def main():
    meta_blocks = []
    content_blocks = []
    report = []
    for num, slug, zh_name, en_name in STORIES:
        zt = strip_scripts(read_story(num, zh_name, "zh"))
        et = strip_scripts(read_story(num, en_name, "en"))
        zt_full = zt
        et_full = et
        titleZh, bodyZh = split_h1(zt_full)
        titleEn, bodyEn = split_h1(et_full)
        sumZh = get_summary(zt_full)
        sumEn = get_summary(et_full)
        takesZh = get_takeaways(zt_full, sumZh, ZH_SKIP)
        takesEn = get_takeaways(et_full, sumEn, EN_SKIP)
        meta_blocks.append(meta_entry(slug, titleEn, titleZh, sumEn, sumZh, takesEn, takesZh))
        content_blocks.append(content_entry(slug, bodyEn, bodyZh))
        report.append((slug, titleEn[:40], len(bodyEn), len(bodyZh), len(takesEn), len(takesZh)))

    # Idempotency: skip slugs already present in blog.ts
    blog_text = open(BLOG_TS, encoding="utf-8").read()
    content_text = open(CONTENT_TS, encoding="utf-8").read()
    new_meta = [b for b, (slug, *_ ) in zip(meta_blocks, report) if f'slug: "{slug}"' not in blog_text]
    # map slug->block
    meta_by_slug = {slug: b for (slug, *_), b in zip(report, meta_blocks)}
    content_by_slug = {slug: b for (slug, *_), b in zip(report, content_blocks)}
    added_meta = [meta_by_slug[s] for s in meta_by_slug if f'slug: "{s}"' not in blog_text]
    added_content = [content_by_slug[s] for s in content_by_slug if f'"{s}"' not in content_text]

    if added_meta:
        blog_out = insert_before(blog_text, "export const blogMeta: BlogMeta[] = [", "\n];", "\n" + "\n".join(added_meta))
        open(BLOG_TS, "w", encoding="utf-8").write(blog_out)
    if added_content:
        content_out = insert_before(content_text, "export const blogContent: Record<string, BlogBody> = {", "\n};", "\n" + "\n".join(added_content))
        open(CONTENT_TS, "w", encoding="utf-8").write(content_out)

    print("=== INSERT REPORT ===")
    print(f"blog.ts meta added: {len(added_meta)} (skipped {len(meta_blocks)-len(added_meta)})")
    print(f"blogContent.ts bodies added: {len(added_content)} (skipped {len(content_blocks)-len(added_content)})")
    print(f"{'slug':42} {'ENtitle':40} {'ENlen':>6} {'ZHlen':>6} {'kEN':>4} {'kZH':>4}")
    for slug, t, el, zl, ke, kz in report:
        print(f"{slug:42} {t:40} {el:6} {zl:6} {ke:4} {kz:4}")
    if not added_meta and not added_content:
        print("Nothing inserted (all slugs already present).")


if __name__ == "__main__":
    main()
