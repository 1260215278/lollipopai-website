import re

# Check a genre page for hreflang, canonical, and content
fp = r'c:\Users\Administrator\Documents\lollipop\dist\genre\romance\index.html'
with open(fp, 'r', encoding='utf-8') as f:
    content = f.read()

hreflangs = re.findall(r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"', content)
print('Hreflang tags on /genre/romance:')
for lang, url in hreflangs:
    print(f'  {lang}: {url}')

canonical = re.search(r'<link rel="canonical" href="([^"]+)"', content)
print(f'\nCanonical: {canonical.group(1) if canonical else "NONE"}')

# Check zh/zh-TW similarity
fp_zh = r'c:\Users\Administrator\Documents\lollipop\dist\zh\genre\family\index.html'
fp_zhtw = r'c:\Users\Administrator\Documents\lollipop\dist\zh-TW\genre\family\index.html'
with open(fp_zh, 'r', encoding='utf-8') as f:
    zh = f.read()
with open(fp_zhtw, 'r', encoding='utf-8') as f:
    zhtw = f.read()
print(f'\nZH genre/family size: {len(zh)}')
print(f'ZH-TW genre/family size: {len(zhtw)}')
diff = abs(len(zh)-len(zhtw))
pct = diff / len(zh) * 100
print(f'Size difference: {diff} chars ({pct:.1f}%)')

# Check what content genre pages have (visible text)
def extract_text(html):
    text = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

text = extract_text(content)
print(f'\n/genre/romance visible text ({len(text)} chars):')
print(text[:1000])
