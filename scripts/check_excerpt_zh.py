import re

blog_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts'

with open(blog_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract all blog entries
entries = re.findall(r'slug:\s*"([^"]+)",', content)
print(f'Total entries: {len(entries)}')

# Check each entry for excerptZh
no_excerpt_zh = []
short_excerpt_zh = []
good_excerpt_zh = []

for slug in entries:
    idx = content.find(f'slug: "{slug}",')
    if idx == -1:
        continue
    end = content.find('\n  },', idx)
    block = content[idx:end]
    
    m = re.search(r'excerptZh:\s*"([^"]*)"', block)
    if not m:
        no_excerpt_zh.append(slug)
    else:
        excerpt = m.group(1)
        if len(excerpt) < 50:
            short_excerpt_zh.append((slug, len(excerpt), excerpt))
        else:
            good_excerpt_zh.append(slug)

print(f'\nNo excerptZh: {len(no_excerpt_zh)}')
for s in no_excerpt_zh:
    print(f'  - {s}')

print(f'\nShort excerptZh (<50 chars): {len(short_excerpt_zh)}')
for s, l, e in short_excerpt_zh:
    print(f'  {l}ch  {s}: {e}')

print(f'\nGood excerptZh (>=50 chars): {len(good_excerpt_zh)}')
