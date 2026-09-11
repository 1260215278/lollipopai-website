import json, os

json_path = os.path.join(os.environ.get("TEMP", "/tmp"), "geo_articles.json")
with open(json_path, "r", encoding="utf-8") as f:
    articles = json.load(f)

# Generate blog.ts entries
blog_ts_entries = []
for a in articles:
    kt = ", ".join([f'"{t}"' for t in a["keyTakeaways"]])
    kt_zh = ", ".join([f'"{t}"' for t in a["keyTakeawaysZh"]])
    
    entry = f'''  {{
    slug: "{a["slug"]}",
    title: {json.dumps(a["title"], ensure_ascii=False)},
    titleZh: {json.dumps(a["titleZh"], ensure_ascii=False)},
    excerpt: {json.dumps(a["excerpt"], ensure_ascii=False)},
    excerptZh: {json.dumps(a["excerptZh"], ensure_ascii=False)},
    seoTitle: {json.dumps(a["seoTitle"], ensure_ascii=False)},
    seoDescription: {json.dumps(a["seoDescription"], ensure_ascii=False)},
    category: "{a["category"]}",
    categoryLabel: "{a["categoryLabel"]}",
    author: "{a["author"]}",
    authorRole: "{a["authorRole"]}",
    authorBio: {json.dumps(a["authorBio"], ensure_ascii=False)},
    publishDate: "{a["publishDate"]}",
    updateDate: "{a["updateDate"]}",
    keyTakeaways: [{kt}],
    keyTakeawaysZh: [{kt_zh}],
  }},'''
    blog_ts_entries.append(entry)

# Generate blogContent.ts entries
blog_content_entries = []
for a in articles:
    # Escape backticks and ${ in content
    content = a["content"].replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
    content_zh = content  # Same content for both
    
    entry = f'''  "{a["slug"]}": {{
    content: `{content}`,
    contentZh: `{content_zh}`,
  }},'''
    blog_content_entries.append(entry)

# Write to temp files
blog_ts_path = os.path.join(os.environ.get("TEMP", "/tmp"), "blog_ts_entries.txt")
blog_content_path = os.path.join(os.environ.get("TEMP", "/tmp"), "blog_content_entries.txt")

with open(blog_ts_path, "w", encoding="utf-8") as f:
    f.write(",\n".join(blog_ts_entries))

with open(blog_content_path, "w", encoding="utf-8") as f:
    f.write(",\n".join(blog_content_entries))

print(f"Generated {len(blog_ts_entries)} blog.ts entries ({os.path.getsize(blog_ts_path)} bytes)")
print(f"Generated {len(blog_content_entries)} blogContent.ts entries ({os.path.getsize(blog_content_path)} bytes)")
print(f"blog_ts: {blog_ts_path}")
print(f"blog_content: {blog_content_path}")
