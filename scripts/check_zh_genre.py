import re

def extract_text(html):
    text = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

dist = r'c:\Users\Administrator\Documents\lollipop\dist'

# Check non-English genre pages
for path in ['zh/genre/romance', 'zh-TW/genre/romance', 'es/genre/romance']:
    fp = f'{dist}/{path}/index.html'
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    text = extract_text(content)
    has_seo = 'genre-seo-content' in content
    print(f'/{path}: {len(text)} chars text, SEO content: {has_seo}')
