import re

blog_ts_path = r"c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts"
with open(blog_ts_path, "r", encoding="utf-8") as f:
    content = f.read()

# Parse all blog entries
entries = re.findall(r'slug:\s*"([^"]+)",', content)
print(f"Total articles: {len(entries)}")

no_cover = []
with_cover = []
for slug in entries:
    # Find the entry block for this slug
    idx = content.find(f'slug: "{slug}",')
    if idx < 0:
        continue
    # Look ahead ~600 chars for coverImage
    block = content[idx:idx+600]
    if 'coverImage:' in block:
        m = re.search(r'coverImage:\s*"([^"]+)"', block)
        with_cover.append((slug, m.group(1) if m else 'unknown'))
    else:
        no_cover.append(slug)

print(f"\nWith coverImage: {len(with_cover)}")
print(f"Without coverImage: {len(no_cover)}")

print("\n--- WITHOUT COVER ---")
for slug in no_cover:
    # Find title
    idx = content.find(f'slug: "{slug}",')
    block = content[idx:idx+300]
    title_match = re.search(r'title:\s*"([^"]+)"', block)
    title = title_match.group(1) if title_match else '?'
    print(f"  {slug}")
    print(f"    {title[:80]}")

print("\n--- WITH COVER (JPG only) ---")
jpg_count = 0
webp_count = 0
for slug, img in with_cover:
    if img.endswith('.jpg'):
        jpg_count += 1
        print(f"  JPG: {slug} -> {img}")
    elif img.endswith('.webp'):
        webp_count += 1

print(f"\nJPG covers: {jpg_count}")
print(f"WebP covers: {webp_count}")
