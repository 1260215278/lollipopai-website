import os
import re

img_dir = r'c:\Users\Administrator\Documents\lollipop\public\blog-images'
blog_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts'

# Step 1: Get all coverImage references from blog.ts
with open(blog_path, 'r', encoding='utf-8') as f:
    content = f.read()

references = re.findall(r'coverImage:\s*"([^"]+)"', content)
referenced_files = set()
for ref in references:
    filename = ref.split('/')[-1]
    referenced_files.add(filename)

print(f'Referenced in blog.ts: {len(referenced_files)} files')

# Step 2: List all files on disk
all_files = set(os.listdir(img_dir))
jpg_files = set(f for f in all_files if f.endswith('.jpg'))
webp_files = set(f for f in all_files if f.endswith('.webp'))

print(f'On disk - total: {len(all_files)}')
print(f'  JPG: {len(jpg_files)}')
print(f'  WebP: {len(webp_files)}')

# Step 3: Find JPG files that have a WebP counterpart (safe to delete)
jpg_with_webp = set()
jpg_without_webp = set()

for jpg in jpg_files:
    webp_name = jpg.replace('.jpg', '.webp')
    if webp_name in webp_files:
        jpg_with_webp.add(jpg)
    else:
        jpg_without_webp.add(jpg)

print(f'\nJPG with WebP counterpart (safe to delete): {len(jpg_with_webp)}')
print(f'JPG without WebP counterpart (need attention): {len(jpg_without_webp)}')
if jpg_without_webp:
    for f in sorted(jpg_without_webp):
        print(f'  {f}')

# Step 4: Check if any referenced files are missing
missing_referenced = set()
for ref in referenced_files:
    if ref not in all_files:
        missing_referenced.add(ref)

print(f'\nReferenced but missing on disk: {len(missing_referenced)}')
if missing_referenced:
    for f in sorted(missing_referenced):
        print(f'  {f}')

# Step 5: Delete JPG files that have WebP counterparts
total_saved = 0
deleted = 0
for jpg in jpg_with_webp:
    jpg_path = os.path.join(img_dir, jpg)
    size = os.path.getsize(jpg_path)
    os.remove(jpg_path)
    total_saved += size
    deleted += 1

print(f'\nDeleted {deleted} JPG files')
print(f'Space saved: {total_saved/1024/1024:.1f} MB')

# Step 6: Final check
remaining = set(os.listdir(img_dir))
remaining_jpg = [f for f in remaining if f.endswith('.jpg')]
remaining_webp = [f for f in remaining if f.endswith('.webp')]
print(f'\nRemaining on disk: {len(remaining)} files')
print(f'  JPG: {len(remaining_jpg)}')
print(f'  WebP: {len(remaining_webp)}')
