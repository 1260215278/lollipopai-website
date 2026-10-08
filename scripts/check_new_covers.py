import re, os

blog_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts'
img_dir = r'c:\Users\Administrator\Documents\lollipop\public\blog-images'
existing = set(os.listdir(img_dir))

with open(blog_path, 'r', encoding='utf-8') as f:
    content = f.read()

NEW_SLUGS = [
    "pixverse-canvas-vs-higgsfield-vs-ltx-vs-lollipop",
    "ceo-romance-revenge-short-drama-prompt-pack",
    "multi-character-interaction-physics-in-ai-drama",
    "ai-drama-lip-sync-and-facial-expressions",
    "webtoon-to-ai-micro-drama-workflow",
    "hook-architecture-and-three-second-rule-in-short-dramas",
    "vertical-cinematography-9-16-composition-rules",
    "short-drama-foley-sfx-and-sound-design-guide",
    "100-episode-ai-drama-pipeline-and-qc-checklist",
    "global-ai-short-drama-monetization-roi-model",
    "ai-short-drama-pillar-guide",
    "ai-short-drama-industry-data-report-2026",
    "ai-short-drama-faq-2026",
]

print("=== 13 New Articles Cover Image Status ===\n")
for slug in NEW_SLUGS:
    idx = content.find(f'slug: "{slug}",')
    end = content.find('\n  },', idx)
    block = content[idx:end]
    m = re.search(r'coverImage:\s*"([^"]+)"', block)
    if not m:
        print(f"  {slug}: NO COVER IMAGE")
        continue
    img_path = m.group(1)
    filename = img_path.split('/')[-1]
    exists = filename in existing
    print(f"  {slug}")
    print(f"    coverImage: {img_path}")
    print(f"    on disk: {'YES' if exists else 'NO'}")
    print()
