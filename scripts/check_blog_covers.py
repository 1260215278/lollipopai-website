import re

with open(r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts', 'r', encoding='utf-8') as f:
    content = f.read()

entries = re.findall(r'slug:\s*"([^"]+)",', content)
print(f'Total blog posts: {len(entries)}')

no_cover = []
has_cover = []
for slug in entries:
    idx = content.find(f'slug: "{slug}",')
    if idx == -1:
        continue
    block = content[idx:idx+800]
    if 'coverImage:' in block:
        m = re.search(r'coverImage:\s*"([^"]+)"', block)
        has_cover.append((slug, m.group(1) if m else 'unknown'))
    else:
        no_cover.append(slug)

print(f'\nWith cover image: {len(has_cover)}')
print(f'Without cover image: {len(no_cover)}')

if no_cover:
    print('\nArticles WITHOUT cover image:')
    for slug in no_cover:
        print(f'  - {slug}')

print('\nAll articles with cover images:')
for slug, img in has_cover:
    print(f'  - {slug}: {img}')
