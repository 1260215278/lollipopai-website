import os

img_dir = r'c:\Users\Administrator\Documents\lollipop\public\blog-images'

NEW_ARTICLE_IMAGES = [
    "pixverse-vs-higgsfield-vs-ltx-vs-lollipop.webp",
    "ceo-romance-revenge-prompt-pack.webp",
    "multi-character-interaction-physics.webp",
    "ai-drama-lip-sync-facial-expressions.webp",
    "webtoon-to-ai-micro-drama-workflow.webp",
    "hook-architecture-three-second-rule.webp",
    "vertical-cinematography-9-16-composition.webp",
    "short-drama-foley-sfx-sound-design.webp",
    "100-episode-ai-drama-pipeline-qc.webp",
    "global-ai-short-drama-monetization-roi.webp",
    "ai-short-drama-pillar-guide.webp",
    "ai-short-drama-industry-data-report-2026.webp",
    "ai-short-drama-faq-2026.webp",
]

print("=== 13 New Article Cover Images ===\n")
for img in NEW_ARTICLE_IMAGES:
    path = os.path.join(img_dir, img)
    if os.path.exists(path):
        size = os.path.getsize(path)
        print(f"  {img}: {size/1024:.0f}KB")
    else:
        print(f"  {img}: MISSING!")

# Also check for any .jpg files that should be .webp
print("\n=== JPG files (should be WebP) ===")
jpgs = [f for f in os.listdir(img_dir) if f.endswith('.jpg')]
print(f"  JPG count: {len(jpgs)}")
for f in sorted(jpgs):
    path = os.path.join(img_dir, f)
    print(f"  {f}: {os.path.getsize(path)/1024:.0f}KB")
