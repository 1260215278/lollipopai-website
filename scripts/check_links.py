import re

with open(r'c:\Users\Administrator\Documents\lollipop\dist\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all anchor hrefs
links = re.findall(r'<a[^>]*href="([^"]+)"[^>]*>', content)
# Categorize
non_lollipop = [l for l in links if l.startswith('/') and not l.startswith('/lollipop')]
print(f'Non-lollipop anchor links: {len(non_lollipop)}')
for l in sorted(set(non_lollipop)):
    count = non_lollipop.count(l)
    print(f'  {l} (x{count})')

print()

# Also check link tags (CSS, JS, favicon)
css_links = re.findall(r'<link[^>]*href="([^"]+)"', content)
non_lollipop_css = [l for l in css_links if l.startswith('/') and not l.startswith('/lollipop') and not l.startswith('/assets')]
print(f'Non-lollipop link tags: {len(non_lollipop_css)}')
for l in sorted(set(non_lollipop_css)):
    print(f'  {l}')

print()

# Check script src
scripts = re.findall(r'<script[^>]*src="([^"]+)"', content)
non_lollipop_js = [s for s in scripts if s.startswith('/') and not s.startswith('/lollipop') and not s.startswith('/assets')]
print(f'Non-lollipop script srcs: {len(non_lollipop_js)}')
for s in sorted(set(non_lollipop_js)):
    print(f'  {s}')

print()

# Check img src
imgs = re.findall(r'<img[^>]*src="([^"]+)"', content)
non_lollipop_imgs = [i for i in imgs if i.startswith('/') and not i.startswith('/lollipop')]
print(f'Non-lollipop img srcs: {len(non_lollipop_imgs)}')
for i in sorted(set(non_lollipop_imgs)):
    print(f'  {i}')
