import re

def extract_text(html):
    text = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

dist = r'c:\Users\Administrator\Documents\lollipop\dist'

# Check English genre pages
for slug in ['romance', 'revenge', 'horror', 'family']:
    fp = f'{dist}/genre/{slug}/index.html'
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    text = extract_text(content)
    has_seo = 'genre-seo-content' in content
    has_about = 'About ' in content and 'Short Dramas' in content
    has_faq = 'Frequently Asked Questions' in content
    print(f'/genre/{slug}: {len(text)} chars text, {len(content)} bytes HTML')
    print(f'  SEO content div: {has_seo}, About section: {has_about}, FAQ: {has_faq}')

# Check a sample of the actual content
fp = f'{dist}/genre/romance/index.html'
with open(fp, 'r', encoding='utf-8') as f:
    content = f.read()
# Find the genre-seo-content div
idx = content.find('genre-seo-content')
if idx > 0:
    snippet = content[idx:idx+500]
    print(f'\nSample genre content (first 500 chars):\n{snippet}')
