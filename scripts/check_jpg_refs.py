import re

blog_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts'

with open(blog_path, 'r', encoding='utf-8') as f:
    content = f.read()

entries = re.findall(r'slug:\s*"([^"]+)",', content)

jpg_refs = []
webp_refs = []

for slug in entries:
    idx = content.find(f'slug: "{slug}",')
    end = content.find('\n  },', idx)
    block = content[idx:end]
    m = re.search(r'coverImage:\s*"([^"]+)"', block)
    if m:
        img = m.group(1)
        if img.endswith('.jpg'):
            jpg_refs.append((slug, img))
        elif img.endswith('.webp'):
            webp_refs.append((slug, img))
        else:
            print(f'OTHER: {slug}: {img}')

print(f'WebP references: {len(webp_refs)}')
print(f'JPG references: {len(jpg_refs)}')
if jpg_refs:
    print('\nArticles still referencing JPG:')
    for slug, img in jpg_refs:
        print(f'  {slug}: {img}')
