"""提取 5 篇文章英文 content，打印长度和结构"""
import re

slugs = [
    'ai-short-drama-studio-economics-break-even-profit',
    'ai-short-drama-organic-growth-free-traffic-no-paid-ads',
    'short-drama-release-calendar-episode-frequency-cliffhangers-season-planning',
    'ai-short-drama-pitch-deck-format-audience-budget-distribution',
    'ai-short-drama-voice-music-image-rights-tool-licenses',
]

with open(r'c:\Users\Administrator\Documents\lollipop\src\app\data\blogContent.ts', 'r', encoding='utf-8') as f:
    content = f.read()

for slug in slugs:
    idx = content.find(f'"{slug}": {{')
    if idx < 0:
        print(f'NOT FOUND: {slug}')
        continue
    m = re.search(r'content:\s*`(.*?)`,\s*\n\s*contentZh:\s*`(.*?)`', content[idx:], re.DOTALL)
    if m:
        en = m.group(1)
        zh = m.group(2)
        print(f'=== {slug} ===')
        print(f'EN length: {len(en)}')
        print(f'ZH length: {len(zh)}')
        # Extract headings
        headings = re.findall(r'^#{1,4}\s+(.+)', en, re.MULTILINE)
        for h in headings:
            print(f'  H: {h}')
        print()
