import re

blog_ts_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts'

slugs = [
    "reelshort-alternative-lollipop-vs-reelshort-dramabox-2026",
    "what-is-ai-short-drama-2026",
    "best-ai-short-drama-platforms-2026",
    "ai-short-drama-monetization",
    "ai-short-drama-overseas-compliance",
    "ai-influencer-monetization",
    "ai-short-drama-industry-trends-2026",
    "ai-short-drama-promotion-guide-2026",
    "ai-short-drama-7-day-tutorial-2026",
]

with open(blog_ts_path, 'r', encoding='utf-8') as f:
    content = f.read()

count = 0
for slug in slugs:
    # Find the slug line and add coverImage after it
    slug_line = f'    slug: "{slug}",'
    cover_line = f'    coverImage: "/blog-images/{slug}.webp",'
    
    # Check if coverImage already exists for this slug
    # Find the block between this slug and next slug/end
    idx = content.find(slug_line)
    if idx == -1:
        print(f"NOT FOUND: {slug}")
        continue
    
    # Check if coverImage already exists in the next 3 lines
    next_section = content[idx:idx+200]
    if 'coverImage:' in next_section:
        print(f"ALREADY HAS COVER: {slug}")
        continue
    
    # Insert coverImage line after slug line
    content = content.replace(slug_line, slug_line + '\n' + cover_line, 1)
    count += 1
    print(f"ADDED: {slug}")

with open(blog_ts_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nTotal updated: {count}")
