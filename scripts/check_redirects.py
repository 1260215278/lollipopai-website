import os, re

dist = r'c:\Users\Administrator\Documents\lollipop\dist'

# 1. Check the stray bonjourluxe file
bonjour_file = os.path.join(dist, 'seo-audit-www.bonjourluxe.com--2026-08-05.html')
if os.path.exists(bonjour_file):
    with open(bonjour_file, 'r', encoding='utf-8') as f:
        content = f.read(500)
    print(f"=== Bonjourluxe audit file ===")
    print(f"Size: {os.path.getsize(bonjour_file)} bytes")
    print(f"Content preview: {content[:200]}")
    print()

# 2. Check distribution directory
dist_dir = os.path.join(dist, 'distribution')
print(f"=== distribution/ directory ===")
if os.path.exists(dist_dir):
    for root, dirs, files in os.walk(dist_dir):
        for f in files:
            print(f"  {os.path.relpath(os.path.join(root, f), dist)}")
else:
    print("  NOT FOUND")

# 3. Check all HTML files for potential issues:
#    - Missing canonical
#    - Redirect meta tags
#    - 403-related content
print("\n=== HTML files with redirect meta tags ===")
redirect_files = []
for root, dirs, files in os.walk(dist):
    for f in files:
        if f.endswith('.html'):
            fpath = os.path.join(root, f)
            with open(fpath, 'r', encoding='utf-8') as fh:
                content = fh.read()
            if 'http-equiv="refresh"' in content or 'meta refresh' in content:
                rel = os.path.relpath(fpath, dist)
                redirect_files.append(rel)
                # Find the redirect URL
                match = re.search(r'content="[^"]*url=([^"]+)"', content)
                if match:
                    print(f"  {rel} -> {match.group(1)}")
                else:
                    print(f"  {rel} (meta refresh found)")

if not redirect_files:
    print("  None found")

# 4. Check for pages with broken internal links (links to /lollipop/ that might redirect)
print("\n=== Checking index.html for redirect patterns ===")
index_path = os.path.join(dist, 'index.html')
if os.path.exists(index_path):
    with open(index_path, 'r', encoding='utf-8') as f:
        content = f.read()
    # Find all internal links
    links = re.findall(r'href="([^"]*)"', content)
    # Check for links that might cause issues
    non_lollipop_links = [l for l in links if l.startswith('/') and not l.startswith('/lollipop') and not l.startswith('/assets') and not l.startswith('/blog-images') and l != '/']
    print(f"  Total links: {len(links)}")
    print(f"  Non-/lollipop internal links: {len(non_lollipop_links)}")
    for l in non_lollipop_links[:10]:
        print(f"    {l}")
