"""
转义 blogContent.ts 中 contentZh 的 template literal 问题字符
"""
import re

path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blogContent.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 找所有 contentZh: `...` 块，转义内部的 ` 和 ${
# Strategy: 找到每个 contentZh 块，对内部做转义

# Pattern to find contentZh block - more precise
zh_block_pat = re.compile(
    r'(    contentZh: `)(.*?)(`,)',
    re.DOTALL
)

def escape_template_literal_inner(text):
    """Escape chars that would break a JS template literal"""
    # Escape backslash first
    text = text.replace('\\', '\\\\')
    # Escape backtick
    text = text.replace('`', '\\`')
    # Escape ${ 
    text = text.replace('${', '\\${')
    return text

def replace_zh_block(m):
    prefix = m.group(1)
    inner = m.group(2)
    suffix = m.group(3)
    escaped_inner = escape_template_literal_inner(inner)
    if escaped_inner != inner:
        print(f"  Escaped {len(inner) - len(escaped_inner)} chars")
    return prefix + escaped_inner + suffix

# Only target the 3 new articles - check by contentZh being large
# Actually let's just do ALL contentZh blocks to be safe
new_content, count = zh_block_pat.subn(replace_zh_block, content)
print(f"\nProcessed {count} contentZh blocks")

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done!")
