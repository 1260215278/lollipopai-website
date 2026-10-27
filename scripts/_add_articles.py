import os, re

ROOT = r"c:\Users\Administrator\Documents\lollipop"
CONTENT_TS = os.path.join(ROOT, "src", "app", "data", "blogContent.ts")

# Read current blogContent.ts
with open(CONTENT_TS, "r", encoding="utf-8") as f:
    content = f.read()

# Read article markdowns
articles = []

md1 = open(os.path.join(ROOT, "drafts", "ai-short-drama-copyright-commercial-rights-2026-10-27-FINAL.md"), encoding="utf-8").read()
articles.append(("ai-short-drama-copyright-commercial-rights", md1))

md2 = open(os.path.join(ROOT, "drafts", "ai-short-drama-distribution-platforms-submission-2026-10-27-FINAL.md"), encoding="utf-8").read()
md2 = re.sub(r"^---.*?\n---\n\n", "", md2, flags=re.DOTALL)
articles.append(("ai-short-drama-distribution-platforms-submission", md2))

md3 = open(os.path.join(ROOT, "ai-short-drama-retention-analytics-drop-off-cohorts.md"), encoding="utf-8").read()
articles.append(("ai-short-drama-retention-analytics-drop-off-cohorts", md3))

# Build new entries with proper escaping
new_entries = []
for slug, md in articles:
    md_escaped = md.replace("\\", "\\\\").replace("`", "\\`")
    entry = f'  "{slug}": {{\n    content: `{md_escaped}`,\n  }},\n'
    new_entries.append(entry)

new_entries_text = "\n".join(new_entries)

# Find the closing of blogContent: it ends with "};" followed by comment on same line
# Use rfind to get the LAST occurrence
closing = "};"
idx = content.rfind(closing)
if idx == -1:
    print("ERROR: Could not find closing };")
    exit(1)

# Verify it's the right one (should be followed immediately by "/**")
after = content[idx+2:idx+50]
if not after.startswith("/** 合并"):
    print(f"WARNING: rfind matched wrong at pos {idx}")
    print(f"After context: {repr(after[:30])}")
    # Find the correct one: look for the specific pattern
    pattern = "};/\*\* 合并元数据"
    idx = content.rfind(pattern)
    if idx == -1:
        # Try without the comment matching
        # Get last "}\n};" before "export function getFullPost"
        exp_idx = content.find("export function getFullPost")
        if exp_idx == -1:
            print("STILL ERROR")
            exit(1)
        # Search backwards from exp_idx
        idx = content.rfind("};", 0, exp_idx)
        print(f"Found closing }}; at {idx} (before getFullPost)")
    else:
        print(f"Found by pattern at {idx}")

before = content[:idx]
after = content[idx:]

new_content = before + new_entries_text + after

print(f"Original: {len(content)} chars → New: {len(new_content)} (+{len(new_content)-len(content)})")

with open(CONTENT_TS, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Done!")
