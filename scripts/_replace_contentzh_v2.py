"""
更安全的 contentZh 替换脚本。
不用 .*? regex —— 改用逐字符扫描找正确的闭合反引号。
"""
import json

# 模板字面量转义：blogContent.ts 里 contentZh 用反引号包裹
def escape_tl(text):
    text = text.replace('\\', '\\\\')
    text = text.replace('`', '\\`')
    text = text.replace('${', '\\${')
    return text

with open(r'c:\Users\Administrator\Documents\lollipop\data\zh-translations-2026-10-27.json', 'r', encoding='utf-8') as f:
    translations = json.load(f)

path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blogContent.ts'
with open(path, 'r', encoding='utf-8') as f:
    src = f.read()

slugs = list(translations.keys())
new_src = src

for slug in slugs:
    zh = escape_tl(translations[slug])
    
    # 定位 slug entry
    slug_key = f'"{slug}": {{'
    entry_start = new_src.find(slug_key)
    if entry_start < 0:
        print(f"  ❌ {slug} 未找到")
        continue
    
    # 从 entry_start 开始找 "contentZh: `"
    czh_marker = 'contentZh: `'
    marker_pos = new_src.find(czh_marker, entry_start)
    if marker_pos < 0:
        print(f"  ❌ {slug} 中未找到 contentZh marker")
        continue
    
    # 跳过 `contentZh: ` 后的开头反引号
    content_start = marker_pos + len(czh_marker)  # 指向第一个字符（跳过开头 `）
    
    # 从 content_start 开始，找正确的闭合反引号
    # 闭合条件：该位置字符是 ` 且前一个字符不是 \ 且后面紧跟 `,`（即模板字面量闭合后是逗号）
    i = content_start
    found_close = -1
    while i < len(new_src) - 1:
        ch = new_src[i]
        if ch == '`' and (i == 0 or new_src[i-1] != '\\'):
            # 检查后面是不是 `,` 或 `\n` + `  }` —— 真正闭合的模板字面量
            after = new_src[i+1:i+6]
            if after.startswith(',') or after.startswith('\n') or after.startswith('  }') or after.startswith('\n  },'):
                found_close = i
                break
            # 否则是代码块里的转义反引号后面的逗号，继续找
        i += 1
    
    if found_close < 0:
        print(f"  ❌ {slug} 未找到闭合反引号")
        continue
    
    new_src = new_src[:content_start] + zh + new_src[found_close:]
    print(f"  ✅ {slug}: 替换成功 ({len(zh)} 字符)")

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_src)

print(f"\n总长度: {len(new_src)} 字符")
