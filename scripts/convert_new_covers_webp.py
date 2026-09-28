import os
from PIL import Image

img_dir = r'c:\Users\Administrator\Documents\lollipop\public\blog-images'

# List of new JPG files to convert to WebP
new_images = [
    'pixverse-vs-higgsfield-vs-ltx-vs-lollipop.jpg',
    'ceo-romance-revenge-prompt-pack.jpg',
    'multi-character-interaction-physics.jpg',
    'ai-drama-lip-sync-facial-expressions.jpg',
    'webtoon-to-ai-micro-drama-workflow.jpg',
    'hook-architecture-three-second-rule.jpg',
    'vertical-cinematography-9-16-composition.jpg',
    'short-drama-foley-sfx-sound-design.jpg',
    '100-episode-ai-drama-pipeline-qc.jpg',
    'global-ai-short-drama-monetization-roi.jpg',
    'ai-short-drama-pillar-guide.jpg',
    'ai-short-drama-industry-data-report-2026.jpg',
    'ai-short-drama-faq-2026.jpg',
    'ai-drama-content-revenue-strategy.jpg',
]

total_jpg = 0
total_webp = 0

for jpg_name in new_images:
    jpg_path = os.path.join(img_dir, jpg_name)
    if not os.path.exists(jpg_path):
        print(f'MISSING: {jpg_name}')
        continue
    webp_name = jpg_name.replace('.jpg', '.webp')
    webp_path = os.path.join(img_dir, webp_name)
    
    img = Image.open(jpg_path)
    img.save(webp_path, 'WEBP', quality=80, method=6)
    
    jpg_size = os.path.getsize(jpg_path)
    webp_size = os.path.getsize(webp_path)
    savings = (1 - webp_size / jpg_size) * 100
    
    total_jpg += jpg_size
    total_webp += webp_size
    
    print(f'{jpg_name}: {jpg_size/1024:.0f}KB -> {webp_size/1024:.0f}KB ({savings:.1f}% saved)')

print(f'\nTotal: {total_jpg/1024/1024:.1f}MB -> {total_webp/1024/1024:.1f}MB ({(1-total_webp/total_jpg)*100:.1f}% saved)')
