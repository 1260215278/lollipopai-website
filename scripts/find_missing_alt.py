import os
import re

dist_dir = r'c:\Users\Administrator\Documents\lollipop\dist'

html_files = []
for root, dirs, files in os.walk(dist_dir):
    for f in files:
        if f == 'index.html':
            html_files.append(os.path.join(root, f))

print('=== Missing/empty alt tags ===')
for fp in html_files:
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    rel = fp.replace(dist_dir, '').replace('\\index.html', '').replace('\\', '/')
    if not rel:
        rel = '/'
    
    imgs = re.findall(r'<img[^>]+>', content)
    for img in imgs:
        if 'alt=' not in img:
            # Extract src
            src_m = re.search(r'src=["\']([^"\']+)["\']', img)
            src = src_m.group(1) if src_m else 'unknown'
            print(f'  {rel}: src={src}')
        elif re.search(r'alt=["\']\s*["\']', img):
            src_m = re.search(r'src=["\']([^"\']+)["\']', img)
            src = src_m.group(1) if src_m else 'unknown'
            print(f'  {rel}: EMPTY alt, src={src}')
