"""扫描 blogContent.ts 中 contentZh 仍为英文 fallback 的文章"""
import re

path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blogContent.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all slugs with their contentZh blocks
# Pattern: "slug": { ... contentZh: `...` }
pattern = re.compile(
    r'"([^"]+)":\s*\{(?:(?!contentZh)[^{}])*?contentZh:\s*`(.*?)`',
    re.DOTALL
)

results = []
for m in pattern.finditer(content):
    slug = m.group(1)
    zh_body = m.group(2)
    # Get first 100 chars, strip leading whitespace
    first = zh_body.strip()[:150]
    has_cn = bool(re.search(r'[\u4e00-\u9fff]', first))
    if not has_cn and len(first) > 10:
        results.append((slug, first[:100].replace('\n', ' | ')))

print(f"共发现 {len(results)} 篇 contentZh 无中文（英文 fallback）：\n")
for slug, preview in results:
    print(f"  {slug}")
    print(f"    → {preview}")
    print()
