"""
用 JSON 里的中文译文替换 blogContent.ts 中 5 篇文章的 contentZh 字段。
"""
import json
import re

# 读取译文 JSON
with open(r'c:\Users\Administrator\Documents\lollipop\data\zh-translations-2026-10-27.json', 'r', encoding='utf-8') as f:
    translations = json.load(f)

# 读取 blogContent.ts
path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blogContent.ts'
with open(path, 'r', encoding='utf-8') as f:
    source = f.read()

# 模板字面量转义函数
def escape_tl(text):
    # blogContent.ts 里 contentZh 用反引号模板字面量包裹
    # 需要转义: ` -> \`, ${ -> \${
    text = text.replace('\\', '\\\\')  # 反斜杠先转
    text = text.replace('`', '\\`')
    text = text.replace('${', '\\${')
    return text

slugs = list(translations.keys())
print(f"待替换 {len(slugs)} 篇文章...\n")

for slug in slugs:
    zh_text = translations[slug]
    if not zh_text.strip():
        print(f"  ⚠️ 跳过 {slug}：译文为空")
        continue

    zh_escaped = escape_tl(zh_text)

    # 定位 slug 对应的 entry
    idx = source.find(f'"{slug}": {{')
    if idx < 0:
        print(f"  ❌ 未找到 slug: {slug}")
        continue

    # 在该 entry 内查找 contentZh: `...`（直到下一个顶层条目或文件结尾）
    # 从 idx 开始找第一个 contentZh: ` ... ` 模式
    search_space = source[idx:]
    m = re.search(r'contentZh:\s*`(.*?)`', search_space, re.DOTALL)
    if not m:
        print(f"  ❌ {slug} 中未找到 contentZh")
        continue

    full_match_start = idx + m.start()
    full_match_end = idx + m.end()
    # contentZh: `
    prefix_end = source.index('`', full_match_start) + 1
    # 闭合 `
    closing_backtick = full_match_end - 1

    new_source = (
        source[:prefix_end]
        + zh_escaped
        + source[closing_backtick:]
    )

    # 验证新长度合理
    old_len = len(source)
    new_len = len(new_source)
    diff = new_len - old_len
    print(f"  ✅ {slug}")
    print(f"     新译文长度: {len(zh_text)} 字 → 转义后 {len(zh_escaped)} 字符（+{diff} 字符）")

    source = new_source

# 写回
with open(path, 'w', encoding='utf-8') as f:
    f.write(source)

print(f"\n✅ 全部写入完成，文件总长度: {len(source)} 字符")
