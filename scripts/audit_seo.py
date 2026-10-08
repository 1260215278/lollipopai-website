import os
import re

dist_dir = r'c:\Users\Administrator\Documents\lollipop\dist'

html_files = []
for root, dirs, files in os.walk(dist_dir):
    for f in files:
        if f == 'index.html':
            html_files.append(os.path.join(root, f))

print(f'Total HTML pages: {len(html_files)}')

# Check meta description
no_desc = []
short_desc = []
long_desc = []
good_desc = []
empty_desc = []

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
        length = len(desc)
        if length == 0:
            empty_desc.append(rel)
        elif length < 50:
            short_desc.append((rel, length, desc))
        elif length > 160:
            long_desc.append((rel, length, desc[:80]))
        else:
            good_desc.append(rel)

print(f'\n--- Meta Description Analysis ---')
print(f'No description: {len(no_desc)}')
print(f'Empty description: {len(empty_desc)}')
print(f'Too short (<50 chars): {len(short_desc)}')
print(f'Too long (>160 chars): {len(long_desc)}')
print(f'Good (50-160 chars): {len(good_desc)}')

if no_desc:
    print(f'\nPages WITHOUT meta description (first 20):')
    for p in sorted(no_desc)[:20]:
        print(f'  {p}')

if short_desc:
    print(f'\nShort descriptions (<50 chars):')
    for p, l, d in short_desc[:10]:
        print(f'  {l}ch  {p}: {d}')

if long_desc:
    print(f'\nLong descriptions (>160 chars):')
    for p, l, d in long_desc[:10]:
        print(f'  {l}ch  {p}: {d}...')

# Check schema.org JSON-LD
no_schema = []
schema_types = {}
for fp in html_files:
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    rel = fp.replace(dist_dir, '').replace('\\index.html', '').replace('\\', '/')
    if not rel:
        rel = '/'
    
    jsonlds = re.findall(r'"@type":\s*"([^"]+)"', content)
    if not jsonlds:
        no_schema.append(rel)
    else:
        for t in jsonlds:
            schema_types[t] = schema_types.get(t, 0) + 1

print(f'\n--- Schema.org Analysis ---')
print(f'Pages without JSON-LD schema: {len(no_schema)}')
if no_schema:
    for p in sorted(no_schema)[:15]:
        print(f'  {p}')

print(f'\nSchema types found:')
for t, c in sorted(schema_types.items(), key=lambda x: -x[1]):
    print(f'  {t}: {c} pages')

# Check image alt tags on key pages
print(f'\n--- Image Alt Analysis (sample pages) ---')
sample_pages = ['/', '/blog', '/genre/romance', '/drama/temptation-ceo']
for p in sample_pages:
    p_path = p if p != '/' else ''
    fp = os.path.join(dist_dir, p_path.lstrip('/'), 'index.html')
    if not os.path.exists(fp):
        continue
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    imgs = re.findall(r'<img[^>]+>', content)
    no_alt = [img for img in imgs if 'alt=' not in img]
    print(f'  {p}: {len(imgs)} images, {len(no_alt)} missing alt')
