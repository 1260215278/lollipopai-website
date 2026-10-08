import os
import re

dist_dir = r'c:\Users\Administrator\Documents\lollipop\dist'

html_files = []
for root, dirs, files in os.walk(dist_dir):
    for f in files:
        if f == 'index.html':
            html_files.append(os.path.join(root, f))

# Find all short descriptions
short_pages = []
for fp in html_files:
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    rel = fp.replace(dist_dir, '').replace('\\index.html', '').replace('\\', '/')
    if not rel:
        rel = '/'
    
    m = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']', content, re.I)
    if m:
        desc = m.group(1)
        if len(desc) < 50:
            short_pages.append((rel, len(desc), desc))

print(f'Total short descriptions: {len(short_pages)}')
print('\nAll short description pages:')
for p, l, d in sorted(short_pages, key=lambda x: x[0]):
    print(f'  {l:>3}ch  {p}: {d}')

# Check if it's only genre pages
genre_count = sum(1 for p, _, _ in short_pages if '/genre/' in p)
print(f'\nGenre pages among short desc: {genre_count}/{len(short_pages)}')

# Language breakdown
from collections import Counter
langs = Counter()
for p, _, _ in short_pages:
    parts = p.strip('/').split('/')
    if parts and parts[0] in ['ar', 'zh', 'zh-TW', 'es', 'pt', 'en']:
        langs[parts[0]] += 1
    elif '/genre/' in p:
        langs['en'] += 1
    else:
        langs['other'] += 1

print('\nLanguage breakdown:')
for lang, count in langs.most_common():
    print(f'  {lang}: {count}')
