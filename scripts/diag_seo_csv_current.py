# -*- coding: utf-8 -*-
"""Fresh SEO-CSV diagnostic over the CURRENT worktree dist/.

Covers the 4 issues in www.lollipop.im_SEOAnalysisSummary_2026_10_13.csv:
  1. <img> without ALT
  2. duplicate meta descriptions (same-language groups are the real problem)
  3. short meta descriptions (<70 chars)
  4. IndexNow adoption (key file + dist presence)
"""
import io
import os
import re
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")

LOCALE_OF = {
    "": "en", "en": "en", "zh": "zh-CN", "zh-TW": "zh-TW",
    "pt": "pt", "es": "es", "ar": "ar",
}


def locale_for(rel):
    parts = [p for p in rel.strip("/").split("/") if p]
    if not parts:
        return "en"
    return LOCALE_OF.get(parts[0], "en")


def main():
    html_files = []
    for root, dirs, files in os.walk(DIST):
        for f in files:
            if f == "index.html":
                html_files.append(os.path.join(root, f))

    rows = []  # (rel, locale, desc)
    img_total = 0
    img_no_alt = 0
    for fp in html_files:
        rel = fp.replace(DIST, "").replace("\\index.html", "").replace("\\", "/")
        if not rel:
            rel = "/"
        locale = locale_for(rel)
        with io.open(fp, encoding="utf-8", errors="ignore") as fh:
            content = fh.read()
        # 容错：先匹配双引号，再单引号；避免把描述里的撇号(如 China's)截断
        m = re.search(
            r'<meta\s+name=["\']description["\']\s+content="([^"]*)"',
            content, re.I)
        if not m:
            m = re.search(
                r"<meta\s+name=['\"]description['\"]\s+content='([^']*)'",
                content, re.I)
        desc = m.group(1) if m else ""
        rows.append((rel, locale, desc))

        for img in re.findall(r'<img\b[^>]*>', content):
            img_total += 1
            if not re.search(r'\balt\s*=', img, re.I):
                img_no_alt += 1

    print("=== 1) IMG ALT ===")
    print(f"  total <img>: {img_total}, without alt: {img_no_alt}")

    print("\n=== 2) DUPLICATE DESCRIPTIONS (same-language groups, size>1) ===")
    by_locale = defaultdict(lambda: defaultdict(list))
    for rel, locale, desc in rows:
        if desc.strip():
            by_locale[locale][desc].append(rel)
    total_dup_pages = 0
    for locale in sorted(by_locale):
        groups = {d: rs for d, rs in by_locale[locale].items() if len(rs) > 1}
        if not groups:
            continue
        for d, rs in groups.items():
            total_dup_pages += len(rs)
            print(f"  [{locale}] {len(rs)} pages  desc={d[:70]!r}")
            for r in rs[:12]:
                print(f"        {r}")
            if len(rs) > 12:
                print(f"        ... +{len(rs) - 12} more")
    print(f"  TOTAL same-language duplicate pages: {total_dup_pages}")

    # cross-language (same desc string appearing under >1 locale)
    print("\n=== 2b) CROSS-LANGUAGE duplicate description strings ===")
    desc_to_locales = defaultdict(set)
    for rel, locale, desc in rows:
        if desc.strip():
            desc_to_locales[desc].add(locale)
    cross = {d: ls for d, ls in desc_to_locales.items() if len(ls) > 1}
    cross_pages = sum(len(by_locale[list(v)[0]][d]) for d, v in cross.items())
    print(f"  distinct cross-locale strings: {len(cross)}  (approx pages: {cross_pages})")
    for d, ls in sorted(cross.items(), key=lambda kv: -len(kv[1]))[:15]:
        print(f"  {sorted(ls)}  ::  {d[:60]!r}")

    print("\n=== 3) SHORT DESCRIPTIONS (<70 chars, non-empty) ===")
    short = [(rel, locale, len(d), d) for rel, locale, d in rows
             if 0 < len(d) < 70]
    print(f"  total short pages: {len(short)}")
    by_loc = Counter(locale for _, locale, _, _ in short)
    print("  by locale:", dict(by_loc))
    uniq = {}
    for rel, locale, ln, d in short:
        uniq.setdefault(d, (locale, ln, []))
        uniq[d][2].append(rel)
    print(f"  unique short strings: {len(uniq)}")
    for d, (locale, ln, rels) in sorted(uniq.items(), key=lambda kv: kv[1][1]):
        sample = rels[0] + (f" (+{len(rels)-1})" if len(rels) > 1 else "")
        print(f"  [{locale} {ln}c] {sample}  ::  {d[:55]!r}")

    print("\n=== 3b) EMPTY DESCRIPTIONS ===")
    for rel, locale, d in rows:
        if not d.strip():
            print(f"  [{locale}] {rel}")

    print("\n=== 4) INDEXNOW ===")
    key_file = os.path.join(DIST, "fc327f494d3f4612b851a2972530d549.txt")
    print(f"  dist key file exists: {os.path.exists(key_file)}")
    submit_py = os.path.join(ROOT, "scripts", "indexnow-submit.py")
    print(f"  submit script exists: {os.path.exists(submit_py)}")
    key_src = os.path.join(ROOT, "scripts", "indexnow-key.txt")
    print(f"  key source exists: {os.path.exists(key_src)}")


if __name__ == "__main__":
    main()
