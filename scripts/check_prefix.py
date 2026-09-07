import re
import sys

filepath = sys.argv[1] if len(sys.argv) > 1 else 'dist/index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

links = re.findall(r'<a[^>]*href="([^"]+)"[^>]*>', content)
non_lollipop = [l for l in links if l.startswith('/') and not l.startswith('/lollipop') and not l.startswith('/assets')]
print(f'Total anchor links: {len(links)}')
print(f'Non-lollipop anchor links: {len(non_lollipop)}')
for l in sorted(set(non_lollipop)):
    count = non_lollipop.count(l)
    print(f'  {l} (x{count})')

imgs = re.findall(r'<img[^>]*src="([^"]+)"', content)
non_lollipop_imgs = [i for i in imgs if i.startswith('/') and not i.startswith('/lollipop') and not i.startswith('/assets')]
print(f'Non-lollipop img srcs: {len(non_lollipop_imgs)}')
for i in sorted(set(non_lollipop_imgs)):
    count = non_lollipop_imgs.count(i)
    print(f'  {i} (x{count})')

# Also check canonical and hreflang
canonical = re.findall(r'rel="canonical"\s+href="([^"]+)"', content)
if not canonical:
    canonical = re.findall(r'href="([^"]+)"\s+rel="canonical"', content)
print(f'\nCanonical: {canonical[0] if canonical else "NONE"}')

hreflang = re.findall(r'rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"', content)
print(f'Hreflang links: {len(hreflang)}')
for lang, href in hreflang[:5]:
    print(f'  {lang}: {href}')
