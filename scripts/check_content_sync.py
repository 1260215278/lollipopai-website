import re, os

blog_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts'
content_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blogContent.ts'

with open(blog_path, 'r', encoding='utf-8') as f:
    blog_content = f.read()
with open(content_path, 'r', encoding='utf-8') as f:
    content_ts = f.read()

blog_slugs = set(re.findall(r'slug:\s*"([^"]+)",', blog_content))
content_slugs = set(re.findall(r'slug:\s*"([^"]+)",', content_ts))

print(f'blog.ts: {len(blog_slugs)} slugs')
print(f'blogContent.ts: {len(content_slugs)} slugs')

in_content_not_blog = content_slugs - blog_slugs
in_blog_not_content = blog_slugs - content_slugs

print(f'\nIn blogContent but NOT in blog.ts: {len(in_content_not_blog)}')
for s in sorted(in_content_not_blog):
    print(f'  - {s}')

print(f'\nIn blog.ts but NOT in blogContent: {len(in_blog_not_content)}')
for s in sorted(in_blog_not_content):
    print(f'  - {s}')
