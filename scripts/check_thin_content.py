import os, re

dist_dir = r'c:\Users\Administrator\Documents\lollipop\dist'

pages = []
for root, dirs, files in os.walk(dist_dir):
    for f in files:
        if f == 'index.html':
            fp = os.path.join(root, f)
            with open(fp, 'r', encoding='utf-8') as fh:
                content = fh.read()
            rel_path = fp.replace(dist_dir, '').replace('\\index.html', '').replace('\\', '/')
            if not rel_path:
                rel_path = '/'
            pages.append((rel_path, len(content), content))

pages.sort(key=lambda x: x[1])
print('Pages by content size (smallest 25):')
for path, size, content in pages[:25]:
    has_noindex = bool(re.search(r'noindex', content, re.I))
    tag = ' (noindex)' if has_noindex else ''
    print(f'  {size:>6} bytes  {path}{tag}')

print(f'\nTotal pages: {len(pages)}')

genre_pages = [(p, s) for p, s, c in pages if '/genre/' in p]
print(f'\nGenre pages: {len(genre_pages)}')
for p, s in sorted(genre_pages, key=lambda x: x[1]):
    print(f'  {s:>6} bytes  {p}')

# Check pages with very little text content (strip HTML)
def text_length(html):
    text = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return len(text)

print('\nPages by visible text length (smallest 20):')
text_pages = []
for p, s, c in pages:
    tl = text_length(c)
    text_pages.append((p, tl, s))
text_pages.sort(key=lambda x: x[1])
for p, tl, hl in text_pages[:20]:
    print(f'  text={tl:>5}  html={hl:>6}  {p}')
