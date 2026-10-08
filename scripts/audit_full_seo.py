import os
import re
from collections import Counter

dist_dir = r'c:\Users\Administrator\Documents\lollipop\dist'

html_files = []
for root, dirs, files in os.walk(dist_dir):
    for f in files:
        if f == 'index.html':
            html_files.append(os.path.join(root, f))

print(f'Total HTML pages: {len(html_files)}')

# 1. Meta description audit
no_desc = []
short_desc = []
long_desc = []
good_desc = []
undefined_desc = []

for fp in html_files:
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    rel = fp.replace(dist_dir, '').replace('\\index.html', '').replace('\\', '/')
    if not rel:
        rel = '/'
    
    m = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']', content, re.I)
    if not m:
        no_desc.append(rel)
    else:
        desc = m.group(1)
        if 'undefined' in desc.lower():
            undefined_desc.append(rel)
        elif len(desc) < 50:
            short_desc.append((rel, len(desc), desc[:80]))
        elif len(desc) > 160:
            long_desc.append((rel, len(desc), desc[:80]))
        else:
            good_desc.append(rel)

print(f'\n=== Meta Description ===')
print(f'Good (50-160ch): {len(good_desc)}')
print(f'Undefined: {len(undefined_desc)}')
print(f'No description: {len(no_desc)}')
print(f'Short (<50ch): {len(short_desc)}')
print(f'Long (>160ch): {len(long_desc)}')

if short_desc:
    print(f'\nShort descriptions:')
    for p, l, d in sorted(short_desc, key=lambda x: x[1]):
        print(f'  {l:>3}ch  {p}: {d}')

# 2. Canonical URL audit
no_canonical = []
bad_canonical = []
for fp in html_files:
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    rel = fp.replace(dist_dir, '').replace('\\index.html', '').replace('\\', '/')
    if not rel:
        rel = '/'
    
    m = re.search(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)["\']', content, re.I)
    if not m:
        no_canonical.append(rel)
    else:
        canonical = m.group(1)
        if 'undefined' in canonical.lower() or 'localhost' in canonical:
            bad_canonical.append((rel, canonical))

print(f'\n=== Canonical URLs ===')
print(f'No canonical: {len(no_canonical)}')
print(f'Bad canonical: {len(bad_canonical)}')
if bad_canonical:
    for p, c in bad_canonical[:10]:
        print(f'  {p}: {c}')

# 3. OG tags audit
no_og_title = []
no_og_desc = []
no_og_image = []
no_og_url = []

for fp in html_files:
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    rel = fp.replace(dist_dir, '').replace('\\index.html', '').replace('\\', '/')
    if not rel:
        rel = '/'
    
    if not re.search(r'og:title', content, re.I):
        no_og_title.append(rel)
    if not re.search(r'og:description', content, re.I):
        no_og_desc.append(rel)
    if not re.search(r'og:image', content, re.I):
        no_og_image.append(rel)
    if not re.search(r'og:url', content, re.I):
        no_og_url.append(rel)

print(f'\n=== Open Graph Tags ===')
print(f'Missing og:title: {len(no_og_title)}')
print(f'Missing og:description: {len(no_og_desc)}')
print(f'Missing og:image: {len(no_og_image)}')
print(f'Missing og:url: {len(no_og_url)}')

# 4. H1 tag audit
no_h1 = []
multi_h1 = []
for fp in html_files:
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    rel = fp.replace(dist_dir, '').replace('\\index.html', '').replace('\\', '/')
    if not rel:
        rel = '/'
    
    h1_count = len(re.findall(r'<h1[^>]*>', content, re.I))
    if h1_count == 0:
        no_h1.append(rel)
    elif h1_count > 1:
        multi_h1.append((rel, h1_count))

print(f'\n=== H1 Tags ===')
print(f'No H1: {len(no_h1)}')
print(f'Multiple H1: {len(multi_h1)}')
if no_h1:
    for p in sorted(no_h1)[:10]:
        print(f'  {p}')
if multi_h1:
    for p, c in multi_h1[:10]:
        print(f'  {p}: {c} H1s')

# 5. Image alt audit
total_imgs = 0
no_alt = []
for fp in html_files:
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    rel = fp.replace(dist_dir, '').replace('\\index.html', '').replace('\\', '/')
    if not rel:
        rel = '/'
    
    imgs = re.findall(r'<img[^>]+>', content)
    for img in imgs:
        total_imgs += 1
        if 'alt=' not in img or re.search(r'alt=["\']\s*["\']', img):
            no_alt.append(rel)

print(f'\n=== Image Alt ===')
print(f'Total images: {total_imgs}')
print(f'Missing/empty alt: {len(no_alt)}')

# 6. Schema types
schema_types = Counter()
for fp in html_files:
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    types = re.findall(r'"@type":\s*"([^"]+)"', content)
    for t in types:
        schema_types[t] += 1

print(f'\n=== Schema.org Types ===')
for t, c in schema_types.most_common():
    print(f'  {t}: {c}')

# 7. hreflang audit
hreflang_count = 0
no_hreflang = []
for fp in html_files:
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    rel = fp.replace(dist_dir, '').replace('\\index.html', '').replace('\\', '/')
    if not rel:
        rel = '/'
    
    hreflangs = re.findall(r'hreflang=["\']([^"\']+)["\']', content, re.I)
    if not hreflangs:
        no_hreflang.append(rel)
    else:
        hreflang_count += len(hreflangs)

print(f'\n=== hreflang ===')
print(f'Total hreflang tags: {hreflang_count}')
print(f'Pages without hreflang: {len(no_hreflang)}')
if no_hreflang:
    for p in sorted(no_hreflang)[:15]:
        print(f'  {p}')
