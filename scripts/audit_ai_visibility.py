#!/usr/bin/env python3
"""Audit AI visibility (GEO/AEO) baseline for all lollipop.im/blog articles.

Scans source (blog.ts, blogContent.ts, blogFaq.ts) + built dist (static HTML,
/blog/*.md endpoints, llms-full.txt) and emits a per-slug inventory with the
signals that matter to generative engines (ChatGPT / Perplexity / Gemini / Claude).

Output: tmp/audit_ai_visibility.json
"""
import os, re, json

ROOT = r"C:\Users\Administrator\Documents\lollipop"
SRC = os.path.join(ROOT, "src", "app", "data")
DIST = os.path.join(ROOT, "dist")
TMP = os.path.join(ROOT, "tmp")
os.makedirs(TMP, exist_ok=True)

def read(p):
    return open(p, encoding="utf-8").read()

blog_ts = read(os.path.join(SRC, "blog.ts"))
content_ts = read(os.path.join(SRC, "blogContent.ts"))
faq_ts = read(os.path.join(SRC, "blogFaq.ts"))

# ---- parse blog.ts entries (split by slug) ----
# Each block: { slug: "...", title: "...", ... },
slugs = re.findall(r'slug:\s*"([a-z0-9-]+)"', blog_ts)
entries = {}
for m in re.finditer(r'\{\s*slug:\s*"([a-z0-9-]+)"(.*?)\n\s*\},', blog_ts, re.S):
    slug = m.group(1)
    blk = m.group(2)
    def g(field):
        mm = re.search(rf'{field}:\s*"((?:[^"\\]|\\.)*)"', blk)
        return mm.group(1) if mm else ""
    entries[slug] = {
        "title": g("title"),
        "titleZh": g("titleZh"),
        "category": g("category"),
        "categoryLabel": g("categoryLabel"),
        "author": g("author"),
        "publishDate": g("publishDate"),
        "updateDate": g("updateDate"),
        "stepCount": bool(re.search(r"stepCount:", blk)),
        "excerptLen": len(g("excerpt")),
        "ktCount": len(re.findall(r'"', g("keyTakeaways"))) // 2 if g("keyTakeaways") else 0,
    }

# ---- content presence / length (index-based, robust to nested backticks) ----
content_map = {}
for slug in slugs:
    key = f'  "{slug}": {{'
    s = content_ts.find(key)
    if s == -1:
        continue
    rest = content_ts[s + len(key):]
    i_en = rest.find("content: `")
    if i_en == -1:
        continue
    en_start = i_en + len("content: `")
    # content ends at the literal "`,\n    contentZh: `"
    m_cz = re.search(r'`,\s*\n\s*contentZh:\s*`', rest[en_start:])
    if not m_cz:
        continue
    en = rest[en_start: en_start + m_cz.start()]
    zh_start = en_start + m_cz.end()
    m_end = re.search(r'`,\s*\n\s*\},', rest[zh_start:])
    if not m_end:
        continue
    zh = rest[zh_start: zh_start + m_end.start()]
    content_map[slug] = (len(en), len(zh))

# ---- FAQ keys ----
faq_keys = set(re.findall(r'^\s*"([a-z0-9-]+)":\s*\[', faq_ts, re.M))

# ---- dist checks ----
llms_full = read(os.path.join(DIST, "llms-full.txt")) if os.path.exists(os.path.join(DIST, "llms-full.txt")) else ""

def jsonld_types(slug):
    p = os.path.join(DIST, "blog", slug, "index.html")
    if not os.path.exists(p):
        return None, []
    b = read(p)
    types = sorted(set(re.findall(r'"@type":\s*"([A-Za-z]+)"', b)))
    return len(b), types

def has_md(slug):
    return os.path.exists(os.path.join(DIST, "blog", slug + ".md"))

def in_llms(slug):
    # llms-full lists blog slugs as /blog/<slug> or <slug>
    return (f"/blog/{slug}" in llms_full) or (f'"{slug}"' in llms_full) or (slug in llms_full)

# ---- assemble ----
inv = []
for slug in slugs:
    e = entries.get(slug, {})
    clen, zlen = content_map.get(slug, (0, 0))
    html_len, types = jsonld_types(slug)
    # internal blog links inside the EN body (markdown [..](/blog/x))
    key = f'  "{slug}": {{'
    en_links = 0
    if key in content_ts:
        s = content_ts.find(key) + len(key)
        rest = content_ts[s:]
        m_cz = re.search(r'`,\s*\n\s*contentZh:\s*`', rest)
        if m_cz:
            en_block = rest[: m_cz.start()]
            en_links = len(re.findall(r'\]\(/blog/[a-z0-9-]+\)', en_block))
    inv.append({
        "slug": slug,
        "title": e.get("title", ""),
        "category": e.get("category", ""),
        "hasSteps": e.get("stepCount", False),
        "hasFAQ": slug in faq_keys,
        "hasArticleSchema": (types is not None and "Article" in types) or (types is not None and "TechArticle" in types),
        "hasHowTo": (types is not None and "HowTo" in types),
        "hasFAQPage": (types is not None and "FAQPage" in types),
        "hasBreadcrumb": (types is not None and "BreadcrumbList" in types),
        "htmlLen": html_len,
        "mdEndpoint": has_md(slug),
        "inLLMsFull": in_llms(slug),
        "enLen": clen,
        "zhLen": zlen,
        "excerptLen": e.get("excerptLen", 0),
        "ktCount": e.get("ktCount", 0),
        "enInternalLinks": en_links,
        "author": e.get("author", ""),
        "publishDate": e.get("publishDate", ""),
        "updateDate": e.get("updateDate", ""),
    })

out = {
    "total": len(inv),
    "faqCovered": sum(1 for x in inv if x["hasFAQ"]),
    "noFAQ": [x["slug"] for x in inv if not x["hasFAQ"]],
    "noMD": [x["slug"] for x in inv if not x["mdEndpoint"]],
    "notInLLMs": [x["slug"] for x in inv if not x["inLLMsFull"]],
    "noHTML": [x["slug"] for x in inv if x["htmlLen"] is None],
    "withHowTo": sum(1 for x in inv if x["hasHowTo"]),
    "withFAQPage": sum(1 for x in inv if x["hasFAQPage"]),
    "articles": inv,
}
with open(os.path.join(TMP, "audit_ai_visibility.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

# console summary
print(f"Total articles: {out['total']}")
print(f"FAQ-covered: {out['faqCovered']}  | no FAQ: {len(out['noFAQ'])}")
print(f"With HowTo schema: {out['withHowTo']} | With FAQPage schema: {out['withFAQPage']}")
zero_link = [x["slug"] for x in out["articles"] if x["enInternalLinks"] == 0]
print(f"Articles with 0 internal links: {len(zero_link)}")
print("  ", zero_link)
print(f"Missing MD endpoint: {len(out['noMD'])} | Not in llms-full: {len(out['notInLLMs'])} | Missing HTML: {len(out['noHTML'])}")
print("\n--- NO FAQ (no FAQPage schema) ---")
for s in out["noFAQ"]:
    print("  ", s)
print("\n--- Not in llms-full.txt ---")
print("  ", out["notInLLMs"] if out["notInLLMs"] else "(none)")
print("\n--- Missing MD endpoint ---")
print("  ", out["noMD"] if out["noMD"] else "(none)")
print("\n--- Missing static HTML ---")
print("  ", out["noHTML"] if out["noHTML"] else "(none)")
