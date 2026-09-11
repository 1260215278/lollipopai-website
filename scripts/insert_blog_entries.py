import os

# Read generated entries
blog_ts_path = os.path.join(os.environ.get("TEMP", "/tmp"), "blog_ts_entries.txt")
blog_content_path = os.path.join(os.environ.get("TEMP", "/tmp"), "blog_content_entries.txt")

with open(blog_ts_path, "r", encoding="utf-8") as f:
    blog_ts_code = f.read()

with open(blog_content_path, "r", encoding="utf-8") as f:
    blog_content_code = f.read()

# Insert into blog.ts - find the last "];" that closes blogMeta
blog_ts_file = r"c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts"
with open(blog_ts_file, "r", encoding="utf-8") as f:
    blog_ts_content = f.read()

# Find the insertion point: the last "];" before the comment about slug lookup
marker = "];/** 通过 slug 查找"
if marker in blog_ts_content:
    blog_ts_content = blog_ts_content.replace(marker, blog_ts_code + "\n" + marker)
    with open(blog_ts_file, "w", encoding="utf-8") as f:
        f.write(blog_ts_content)
    print(f"Inserted {len(blog_ts_code)} bytes into blog.ts")
else:
    # Try alternate marker
    marker2 = "];"
    # Find the last occurrence
    idx = blog_ts_content.rfind(marker2)
    if idx > 0:
        blog_ts_content = blog_ts_content[:idx] + blog_ts_code + "\n" + blog_ts_content[idx:]
        with open(blog_ts_file, "w", encoding="utf-8") as f:
            f.write(blog_ts_content)
        print(f"Inserted {len(blog_ts_code)} bytes into blog.ts (alternate marker)")
    else:
        print("ERROR: Could not find insertion point in blog.ts")

# Insert into blogContent.ts - find the closing "};\n/** 合并"
blog_content_file = r"c:\Users\Administrator\Documents\lollipop\src\app\data\blogContent.ts"
with open(blog_content_file, "r", encoding="utf-8") as f:
    blog_content_content = f.read()

marker = "};/** 合并元数据 + 正文"
if marker in blog_content_content:
    blog_content_content = blog_content_content.replace(marker, blog_content_code + "\n" + marker)
    with open(blog_content_file, "w", encoding="utf-8") as f:
        f.write(blog_content_content)
    print(f"Inserted {len(blog_content_code)} bytes into blogContent.ts")
else:
    # Try to find "};\n" before the export function
    marker2 = "};\n\n/** "
    idx = blog_content_content.rfind(marker2)
    if idx > 0:
        blog_content_content = blog_content_content[:idx+2] + blog_content_code + "\n" + blog_content_content[idx+2:]
        with open(blog_content_file, "w", encoding="utf-8") as f:
            f.write(blog_content_content)
        print(f"Inserted {len(blog_content_code)} bytes into blogContent.ts (alternate marker)")
    else:
        print("ERROR: Could not find insertion point in blogContent.ts")

print("Done!")
