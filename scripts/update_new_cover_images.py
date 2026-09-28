import re

blog_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts'

with open(blog_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Map of slugs to new cover images
COVER_MAP = {
    'pixverse-canvas-vs-higgsfield-vs-ltx-vs-lollipop': '/blog-images/pixverse-vs-higgsfield-vs-ltx-vs-lollipop.webp',
    'ceo-romance-revenge-short-drama-prompt-pack': '/blog-images/ceo-romance-revenge-prompt-pack.webp',
    'multi-character-interaction-physics-in-ai-drama': '/blog-images/multi-character-interaction-physics.webp',
    'ai-drama-lip-sync-and-facial-expressions': '/blog-images/ai-drama-lip-sync-facial-expressions.webp',
    'webtoon-to-ai-micro-drama-workflow': '/blog-images/webtoon-to-ai-micro-drama-workflow.webp',
    'hook-architecture-and-three-second-rule-in-short-dramas': '/blog-images/hook-architecture-three-second-rule.webp',
    'vertical-cinematography-9-16-composition-rules': '/blog-images/vertical-cinematography-9-16-composition.webp',
    'short-drama-foley-sfx-and-sound-design-guide': '/blog-images/short-drama-foley-sfx-sound-design.webp',
    '100-episode-ai-drama-pipeline-and-qc-checklist': '/blog-images/100-episode-ai-drama-pipeline-qc.webp',
    'global-ai-short-drama-monetization-roi-model': '/blog-images/global-ai-short-drama-monetization-roi.webp',
    'ai-short-drama-pillar-guide': '/blog-images/ai-short-drama-pillar-guide.webp',
    'ai-short-drama-industry-data-report-2026': '/blog-images/ai-short-drama-industry-data-report-2026.webp',
    'ai-short-drama-faq-2026': '/blog-images/ai-short-drama-faq-2026.webp',
}

updated = 0
for slug, img_path in COVER_MAP.items():
    pattern = f'slug: "{slug}",'
    idx = content.find(pattern)
    if idx == -1:
        print(f'NOT FOUND: {slug}')
        continue
    
    # Find the section around the slug
    section_end = content.find('\n  },', idx)
    section = content[idx:section_end]
    
    # Check if coverImage already exists
    if 'coverImage:' in section:
        # Update existing path
        old_match = re.search(r'coverImage:\s*"([^"]+)"', section)
        if old_match:
            old_path = old_match.group(1)
            full_old = f'coverImage: "{old_path}"'
            full_new = f'coverImage: "{img_path}"'
            exact_idx = content.find(full_old, idx)
            if exact_idx != -1:
                content = content[:exact_idx] + full_new + content[exact_idx + len(full_old):]
                updated += 1
                print(f'UPDATED: {slug} -> {img_path}')
    else:
        # Insert coverImage after slug line
        slug_line_end = content.index('\n', idx) + 1
        insert_text = f'    coverImage: "{img_path}",\n'
        content = content[:slug_line_end] + insert_text + content[slug_line_end:]
        updated += 1
        print(f'ADDED: {slug} -> {img_path}')

with open(blog_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\nTotal updated: {updated}/{len(COVER_MAP)}')
