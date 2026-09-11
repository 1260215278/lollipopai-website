import re

blog_ts_path = r"c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts"
with open(blog_ts_path, "r", encoding="utf-8") as f:
    content = f.read()

COVER_MAP = {
    "top-8-ai-short-drama-engines-2026": "/blog-images/top-8-ai-engines-comparison-new.jpg",
    "mastering-character-consistency-ai-video": "/blog-images/mastering-character-consistency-ai-video-new.jpg",
    "ai-scriptwriting-micro-dramas-prompts": "/blog-images/ai-scriptwriting-micro-dramas-prompts-new.jpg",
    "ai-short-drama-localization": "/blog-images/ai-short-drama-localization-new.jpg",
    "traditional-vs-ai-short-drama-production-cost": "/blog-images/traditional-vs-ai-short-drama-production-cost-new.jpg",
    "prompting-cinematic-camera-movements-vertical": "/blog-images/prompting-cinematic-camera-movements-vertical-new.jpg",
    "web-novel-to-ai-short-drama-pipeline": "/blog-images/web-novel-to-ai-short-drama-pipeline-new.jpg",
    "ai-audio-soundscapes-short-dramas": "/blog-images/ai-audio-soundscapes-short-dramas-new.jpg",
    "ai-short-drama-monetization-copyright": "/blog-images/ai-short-drama-monetization-copyright-new.jpg",
    "fixing-ai-video-artifacts": "/blog-images/fix-ai-video-artifacts-new.webp",
}

for slug, img_path in COVER_MAP.items():
    # Find the slug line, then check if coverImage already exists in next ~500 chars
    pattern = f'slug: "{slug}",'
    idx = content.find(pattern)
    if idx < 0:
        print(f"WARNING: {slug} not found")
        continue
    
    # Check if coverImage already exists within next 500 chars
    section = content[idx:idx+600]
    if "coverImage:" in section:
        print(f"SKIP: {slug} already has coverImage")
        continue
    
    # Find the next line after slug to insert coverImage
    # The slug line ends with a newline; we insert coverImage right after it
    slug_line_end = content.index("\n", idx) + 1
    insert_text = f'    coverImage: "{img_path}",\n'
    content = content[:slug_line_end] + insert_text + content[slug_line_end:]
    print(f"INSERT: {slug} -> {img_path}")

with open(blog_ts_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"\nDone! Total file size: {len(content)} chars")
