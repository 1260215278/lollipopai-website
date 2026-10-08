import re

blog_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts'
content_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blogContent.ts'

with open(blog_path, 'r', encoding='utf-8') as f:
    blog_content = f.read()
with open(content_path, 'r', encoding='utf-8') as f:
    content_ts = f.read()

# blog.ts uses slug: "xxx",
blog_slugs = set(re.findall(r'slug:\s*"([^"]+)",', blog_content))

# blogContent.ts uses Record keys like: "slug-name": {
content_keys = set(re.findall(r'^\s*"([^"]+)":\s*\{', content_ts, re.MULTILINE))

print(f'blog.ts slugs: {len(blog_slugs)}')
print(f'blogContent.ts keys: {len(content_keys)}')

in_content_not_blog = content_keys - blog_slugs
print(f'\nIn blogContent but NOT in blog.ts: {len(in_content_not_blog)}')
for s in sorted(in_content_not_blog):
    print(f'  - {s}')

in_blog_not_content = blog_slugs - content_keys
print(f'\nIn blog.ts but NOT in blogContent: {len(in_blog_not_content)}')
for s in sorted(in_blog_not_content):
    print(f'  - {s}')
