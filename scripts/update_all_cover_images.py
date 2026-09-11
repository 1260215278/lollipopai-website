import re

blog_ts_path = r"c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts"
img_dir = r"c:\Users\Administrator\Documents\lollipop\public\blog-images"

with open(blog_ts_path, "r", encoding="utf-8") as f:
    content = f.read()

# Full mapping of slug -> coverImage (webp)
COVER_MAP = {
    # GEO articles (10) - already have coverImage but need .jpg -> .webp
    "top-8-ai-short-drama-engines-2026": "/blog-images/top-8-ai-engines-comparison-new.webp",
    "mastering-character-consistency-ai-video": "/blog-images/mastering-character-consistency-ai-video-new.webp",
    "ai-scriptwriting-micro-dramas-prompts": "/blog-images/ai-scriptwriting-micro-dramas-prompts-new.webp",
    "ai-short-drama-localization": "/blog-images/ai-short-drama-localization-new.webp",
    "traditional-vs-ai-short-drama-production-cost": "/blog-images/traditional-vs-ai-short-drama-production-cost-new.webp",
    "prompting-cinematic-camera-movements-vertical": "/blog-images/prompting-cinematic-camera-movements-vertical-new.webp",
    "web-novel-to-ai-short-drama-pipeline": "/blog-images/web-novel-to-ai-short-drama-pipeline-new.webp",
    "ai-audio-soundscapes-short-dramas": "/blog-images/ai-audio-soundscapes-short-dramas-new.webp",
    "ai-short-drama-monetization-copyright": "/blog-images/ai-short-drama-monetization-copyright-new.webp",
    "fixing-ai-video-artifacts": "/blog-images/fix-ai-video-artifacts-new.webp",
    # Remaining articles (32) - need coverImage added
    "ai-script-storyboard": "/blog-images/ai-script-storyboard-new.webp",
    "ai-video-quality": "/blog-images/ai-video-quality-new.webp",
    "ai-editing-tools": "/blog-images/ai-editing-tools-new.webp",
    "ai-production-cost": "/blog-images/ai-production-cost-new.webp",
    "ai-rendering-pipeline": "/blog-images/ai-rendering-pipeline-new.webp",
    "ai-short-drama-complete-guide": "/blog-images/ai-short-drama-complete-guide-new.webp",
    "ai-copyright-compliance": "/blog-images/ai-copyright-compliance-new.webp",
    "ai-tools-comparison": "/blog-images/ai-tools-comparison-new.webp",
    "what-is-ai-drama": "/blog-images/what-is-ai-drama-new.webp",
    "how-to-create-ai-short-drama": "/blog-images/how-to-create-ai-short-drama-new.webp",
    "future-of-ai-entertainment": "/blog-images/future-of-ai-entertainment-new.webp",
    "ai-vs-traditional-drama": "/blog-images/ai-vs-traditional-drama-new.webp",
    "best-ai-storytelling-platforms": "/blog-images/best-ai-storytelling-platforms-new.webp",
    "ai-new-generation-creators": "/blog-images/ai-new-generation-creators-new.webp",
    "what-is-micro-drama": "/blog-images/what-is-micro-drama-new.webp",
    "ai-video-storytelling": "/blog-images/ai-video-storytelling-new.webp",
    "ai-anyone-can-create": "/blog-images/ai-anyone-can-create-new.webp",
    "complete-guide-ai-entertainment-platforms": "/blog-images/complete-guide-ai-entertainment-platforms-new.webp",
    "lollipop-drama-vs-runway-sora": "/blog-images/lollipop-drama-vs-runway-sora-new.webp",
    "ai-drama-character-consistency": "/blog-images/ai-drama-character-consistency-new.webp",
    "fanvue-vs-lollipop-drama": "/blog-images/fanvue-vs-lollipop-drama-new.webp",
    "character-consistency-workflow": "/blog-images/character-consistency-workflow-new.webp",
    "ten-episodes-two-weeks": "/blog-images/ten-episodes-two-weeks-new.webp",
    "publish-and-monetize-vertical-drama": "/blog-images/publish-and-monetize-vertical-drama-new.webp",
    "script-to-screen-pipeline": "/blog-images/script-to-screen-pipeline-new.webp",
    "fix-ai-video-artifacts": "/blog-images/fix-ai-video-artifacts-new.webp",
    "first-vertical-drama-zero-experience": "/blog-images/first-vertical-drama-zero-experience-new.webp",
    "ai-drama-budget-under-1000": "/blog-images/ai-drama-budget-under-1000-new.webp",
    "multilingual-localization-workflow": "/blog-images/multilingual-localization-workflow-new.webp",
    "ai-drama-legal-checklist": "/blog-images/ai-drama-legal-checklist-new.webp",
    "lollipop-vs-reelshort-dramabox": "/blog-images/lollipop-vs-reelshort-dramabox-new.webp",
    "ai-influencer-platform": "/blog-images/ai-influencer-platform-new.webp",
}

added = 0
updated = 0
not_found = 0

for slug, img_path in COVER_MAP.items():
    pattern = f'slug: "{slug}",'
    idx = content.find(pattern)
    if idx < 0:
        not_found += 1
        print(f"  NOT FOUND: {slug}")
        continue
    
    # Check if coverImage already exists in next ~500 chars
    section = content[idx:idx+600]
    if 'coverImage:' in section:
        # Update existing coverImage path
        old_match = re.search(r'coverImage:\s*"([^"]+)"', section)
        if old_match:
            old_path = old_match.group(1)
            if old_path != img_path:
                # Replace the old path with new one
                full_old = f'coverImage: "{old_path}"'
                full_new = f'coverImage: "{img_path}"'
                # Find exact position in content
                exact_idx = content.find(full_old, idx)
                if exact_idx >= 0 and exact_idx < idx + 600:
                    content = content[:exact_idx] + full_new + content[exact_idx + len(full_old):]
                    updated += 1
                    print(f"  UPDATED: {slug} -> {img_path}")
                else:
                    print(f"  WARN: Could not find exact coverImage position for {slug}")
            else:
                pass  # Already correct
    else:
        # Insert coverImage after slug line
        slug_line_end = content.index("\n", idx) + 1
        insert_text = f'    coverImage: "{img_path}",\n'
        content = content[:slug_line_end] + insert_text + content[slug_line_end:]
        added += 1
        print(f"  ADDED: {slug} -> {img_path}")

with open(blog_ts_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"\nSummary: {added} added, {updated} updated, {not_found} not found")
print(f"Total articles with coverImage: {added + updated + (42 - added - updated - not_found)}")
