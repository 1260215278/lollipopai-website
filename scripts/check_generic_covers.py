import re, os

fp = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts'
with open(fp, 'r', encoding='utf-8') as f:
    content = f.read()

entries = re.findall(r'slug:\s*"([^"]+)",', content)
img_dir = r'c:\Users\Administrator\Documents\lollipop\public\blog-images'
existing = set(os.listdir(img_dir))

print(f'Total entries: {len(entries)}')
print(f'Blog images on disk: {len(existing)}')

uses_generic = []
for slug in entries:
    idx = content.find(f'slug: "{slug}",')
    end = content.find('\n  },', idx)
    block = content[idx:end]
    m = re.search(r'coverImage:\s*"([^"]+)"', block)
    if m:
        img = m.group(1)
        filename = img.split('/')[-1]
        if filename == 'guide.webp':
            uses_generic.append(slug)

print(f'\nUsing generic guide.webp: {len(uses_generic)}')
for s in uses_generic:
    print(f'  - {s}')

webp_files = sorted([f for f in existing if f.endswith('.webp')])
print(f'\nWebP files: {len(webp_files)}')
