import os, re

dist = r'c:\Users\Administrator\Documents\lollipop\dist'

# 1. Check multilingual directory structure
print("=== Directory structure ===")
for d in sorted(os.listdir(dist)):
    if os.path.isdir(os.path.join(dist, d)):
        count = sum(1 for root, dirs, files in os.walk(os.path.join(dist, d)) for f in files if f.endswith('.html'))
        print(f"  {d}/: {count} HTML files")

# 2. Check canonical tags in key pages
print("\n=== Canonical tags ===")
check_files = ['index.html', 'zh/index.html', 'zh-TW/index.html', 'es/index.html', 'pt/index.html', 'ar/index.html',
               'about/index.html', 'zh/about/index.html', 'blog/index.html']
for f in check_files:
    fpath = os.path.join(dist, f)
    if os.path.exists(fpath):
        with open(fpath, 'r', encoding='utf-8') as fh:
            content = fh.read()
        canonical = re.findall(r'rel="canonical"\s+href="([^"]+)"', content)
        if not canonical:
            canonical = re.findall(r'href="([^"]+)"\s+rel="canonical"', content)
        hreflang_links = re.findall(r'rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"', content)
        if not hreflang_links:
            hreflang_links = re.findall(r'hreflang="([^"]+)"\s+href="([^"]+)"', content)
        print(f"  {f}:")
        print(f"    canonical: {canonical[0] if canonical else 'NONE'}")
        print(f"    hreflang: {len(hreflang_links)} links")
        for lang, url in hreflang_links[:3]:
            print(f"      {lang} -> {url}")
        if len(hreflang_links) > 3:
            print(f"      ... and {len(hreflang_links)-3} more")
    else:
        print(f"  {f}: NOT FOUND")

# 3. Check for stray files
print("\n=== Stray/unexpected files ===")
expected_prefixes = ('about', 'ar', 'blog', 'contact', 'creating', 'distribution', 'download',
                     'drama', 'es', 'genre', 'glossary', 'login', 'forgot-password', 'press',
                     'pt', 'region', 'zh', 'zh-TW', 'terms', 'privacy')
stray = []
for root, dirs, files in os.walk(dist):
    for f in files:
        if f.endswith('.html'):
            rel = os.path.relpath(os.path.join(root, f), dist)
            if not any(rel.startswith(p) for p in expected_prefixes) and rel != 'index.html':
                stray.append(rel)
for f in stray:
    print(f"  {f}")

# 4. Check robots.txt
print("\n=== robots.txt ===")
robots_path = os.path.join(dist, 'robots.txt')
if os.path.exists(robots_path):
    with open(robots_path, 'r') as fh:
        print(fh.read())
