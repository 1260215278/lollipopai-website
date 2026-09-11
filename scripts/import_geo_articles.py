import os, re, json, glob

ATTACH_DIR = r"c:\Users\Administrator\.trae-cn\attachments\6aa38ddf241acc9d8042189d"

# Map: filename prefix -> slug (derived from internal cross-links in the articles)
SLUG_MAP = {
    "geo_article_01_top8_engines": "top-8-ai-short-drama-engines-2026",
    "geo_article_02_character_consistency": "mastering-character-consistency-ai-video",
    "geo_article_03_scriptwriting_prompts": "ai-scriptwriting-micro-dramas-prompts",
    "geo_article_04_localization": "ai-short-drama-localization",
    "geo_article_05_cost_roi": "traditional-vs-ai-short-drama-production-cost",
    "geo_article_06_camera_movements": "prompting-cinematic-camera-movements-vertical",
    "geo_article_07_webnovel_pipeline": "web-novel-to-ai-short-drama-pipeline",
    "geo_article_08_audio_soundscapes": "ai-audio-soundscapes-short-dramas",
    "geo_article_09_monetization_copyright": "ai-short-drama-monetization-copyright",
    "geo_article_10_fixing_artifacts": "fixing-ai-video-artifacts",
}

CATEGORY_MAP = {
    "top-8-ai-short-drama-engines-2026": ("industry", "Industry Analysis"),
    "mastering-character-consistency-ai-video": ("tutorials", "Tutorials"),
    "ai-scriptwriting-micro-dramas-prompts": ("tutorials", "Tutorials"),
    "ai-short-drama-localization": ("tutorials", "Tutorials"),
    "traditional-vs-ai-short-drama-production-cost": ("industry", "Industry Analysis"),
    "prompting-cinematic-camera-movements-vertical": ("tutorials", "Tutorials"),
    "web-novel-to-ai-short-drama-pipeline": ("tutorials", "Tutorials"),
    "ai-audio-soundscapes-short-dramas": ("tutorials", "Tutorials"),
    "ai-short-drama-monetization-copyright": ("industry", "Industry Analysis"),
    "fixing-ai-video-artifacts": ("tutorials", "Tutorials"),
}

def clean_content(text):
    """Clean LunoTV references and update 70% to 80%"""
    text = text.replace("LunoTV", "Lollipop Drama AI")
    text = text.replace("70% creator revenue share", "80% creator revenue share")
    text = text.replace("70% revenue share", "80% revenue share")
    text = text.replace("up to 70%", "up to 80%")
    text = text.replace("Up to 70%", "Up to 80%")
    text = text.replace("pays creators [up to 80% revenue share]", "pays creators [up to 80% revenue share]")
    text = text.replace("70% creator", "80% creator")
    return text

def extract_meta(filepath, slug):
    with open(filepath, "r", encoding="utf-8") as f:
        raw = f.read()
    
    content = clean_content(raw)
    
    # Extract title (first # line)
    title_match = re.search(r'^# (.+)$', content, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else "Untitled"
    
    # Extract core answer
    core_match = re.search(r'\*\*Core Answer:\*\*\s*(.+?)(?=\n---|\n## )', content, re.DOTALL)
    core_answer = core_match.group(1).strip() if core_match else ""
    
    # Clean up core answer for excerpt (remove markdown links)
    excerpt = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', core_answer)
    excerpt = excerpt.replace("**", "")
    excerpt = " ".join(excerpt.split())[:300]
    
    # Extract key takeaways from "## Key Takeaways" or "## Summary" or derive from content
    takeaways = []
    # Try to find ## Key Takeaways
    kt_match = re.search(r'## Key Takeaways\s*\n(.*?)(?=\n---|\n## |\Z)', content, re.DOTALL)
    if kt_match:
        kt_text = kt_match.group(1)
        takeaways = re.findall(r'^\d+\.\s+(.+)', kt_text, re.MULTILINE)
    
    if not takeaways:
        # Derive from section headers
        sections = re.findall(r'^## (.+)$', content, re.MULTILINE)
        takeaways = sections[:5] if sections else [title]
    
    takeaways = [re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', t).replace("**", "") for t in takeaways]
    
    # Extract author info
    author_match = re.search(r'By (.+?) at Lollipop Drama', content)
    author = author_match.group(1).strip() if author_match else "Evelyn Cho"
    
    # Extract date
    date_match = re.search(r'Last Updated:\s*(\d{4}-\d{2}-\d{2})', content)
    update_date = date_match.group(1) if date_match else "2026-09-09"
    
    # SEO fields
    seo_title = f"{title} | Lollipop Drama" if len(title) < 60 else title[:57] + "..."
    seo_desc = excerpt[:155] if len(excerpt) > 155 else excerpt
    
    cat, cat_label = CATEGORY_MAP.get(slug, ("tutorials", "Tutorials"))
    
    # Remove the markdown header (title + author + date) from content
    # Keep from **Core Answer:** onwards
    content_start = content.find("**Core Answer:**")
    if content_start >= 0:
        body = content[content_start:]
    else:
        body = content
    
    # Remove the H1 title and metadata lines
    body = body.strip()
    
    return {
        "slug": slug,
        "title": title,
        "titleZh": title,  # Keep English title
        "excerpt": excerpt,
        "excerptZh": excerpt,  # Keep English excerpt
        "seoTitle": seo_title,
        "seoDescription": seo_desc,
        "category": cat,
        "categoryLabel": cat_label,
        "author": author,
        "authorRole": "Content Lead at Lollipop Drama",
        "authorBio": f"{author} leads AI drama content strategy at Lollipop Drama, specializing in creator education and GEO-optimized content.",
        "publishDate": "2026-09-09",
        "updateDate": update_date,
        "keyTakeaways": takeaways[:7],
        "keyTakeawaysZh": takeaways[:7],  # Keep English
        "content": body,
    }

# Process all files
articles = []
for prefix, slug in SLUG_MAP.items():
    # Find the file
    pattern = os.path.join(ATTACH_DIR, f"*{prefix}*")
    files = glob.glob(pattern)
    if files:
        meta = extract_meta(files[0], slug)
        articles.append(meta)
        print(f"Processed: {slug} ({len(meta['content'])} chars)")
    else:
        print(f"WARNING: File not found for {prefix}")

# Output as JSON
output_path = os.path.join(os.environ.get("TEMP", "/tmp"), "geo_articles.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

print(f"\nProcessed {len(articles)} articles")
print(f"Output: {output_path}")
