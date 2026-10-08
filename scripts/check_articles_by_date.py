import re, os

blog_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts'
img_dir = r'c:\Users\Administrator\Documents\lollipop\public\blog-images'

with open(blog_path, 'r', encoding='utf-8') as f:
    content = f.read()

entries = re.findall(r'slug:\s*"([^"]+)",', content)
img_files = set(os.listdir(img_dir))

print(f'Total articles: {len(entries)}')
print(f'Total images: {len(img_files)}')

# Group by article type
new_articles = []
for slug in entries:
    idx = content.find(f'slug: "{slug}",')
    end = content.find('\n  },', idx)
    block = content[idx:end]
    
    m_cover = re.search(r'coverImage:\s*"([^"]+)"', block)
    m_date = re.search(r'publishDate:\s*"([^"]+)"', block)
    m_title = re.search(r'title:\s*"([^"]+)"', block)
    
    cover = m_cover.group(1) if m_cover else 'NONE'
    date = m_date.group(1) if m_date else 'unknown'
    title = m_title.group(1) if m_title else slug
    
    filename = cover.split('/')[-1] if cover != 'NONE' else 'none'
    on_disk = filename in img_files
    
    new_articles.append((date, slug, title, cover, on_disk))

# Sort by date descending
new_articles.sort(key=lambda x: x[0], reverse=True)

print('\n=== All articles sorted by publish date (newest first) ===\n')
for date, slug, title, cover, on_disk in new_articles[:20]:
    status = 'OK' if on_disk else 'MISSING'
    filename = cover.split('/')[-1]
    print(f'  [{date}] {slug}')
    print(f'    title: {title[:60]}')
    print(f'    cover: {filename} [{status}]')
    print()
