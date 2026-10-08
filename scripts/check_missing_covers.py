import re

blog_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts'

with open(blog_path, 'r', encoding='utf-8') as f:
    content = f.read()

entries = re.findall(r'slug:\s*"([^"]+)",', content)
print(f'Total entries: {len(entries)}')

no_cover = []
has_cover = []
uses_guide = []

for slug in entries:
    idx = content.find(f'slug: "{slug}",')
    end = content.find('\n  },', idx)
    block = content[idx:end]
    
    m = re.search(r'coverImage:\s*"([^"]+)"', block)
    if not m:
        no_cover.append(slug)
    else:
        img = m.group(1)
        has_cover.append((slug, img))
        if 'guide' in img.lower() or 'placeholder' in img.lower():
            uses_guide.append((slug, img))

print(f'\nNo coverImage: {len(no_cover)}')
for s in no_cover:
    print(f'  - {s}')

print(f'\nUsing generic guide/placeholder: {len(uses_guide)}')
for s, img in uses_guide:
    print(f'  {s}: {img}')

# Also check which images exist on disk
import os
img_dir = r'c:\Users\Administrator\Documents\lollipop\public\blog-images'
if os.path.exists(img_dir):
    existing = set(os.listdir(img_dir))
    
    missing_files = []
    for slug, img_path in has_cover:
        filename = img_path.split('/')[-1]
        if filename not in existing:
            missing_files.append((slug, filename))
    
    print(f'\nCover images referenced but not on disk: {len(missing_files)}')
    for s, f in missing_files:
        print(f'  {s}: {f}')
