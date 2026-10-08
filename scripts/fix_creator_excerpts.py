import re

blog_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts'

with open(blog_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace single quotes in the 3 creator-story excerptZh fields
# that are still being truncated
FIXES = {
    'creator-story-character-bible': (
        '角色一致性靠一本角色圣经——8-12 张参考图（正 / 侧 / 背 + 3-5 种表情 + 2 套服装），'
        '再配合 image anchor 与 seed lock 跨集锁定；动画师小满用这套流程让第 1 集到第 10 集的脸始终是同一个人。'
    ),
    'creator-story-warm-story-formula': (
        '温情短片爆款靠一条共鸣公式——真实困境 + 微光转机 + 留白结尾。'
        '两位 Lollipop Drama 创作者用它把完播率做到 42%-58%，标题决定一半的点击。'
    ),
    'creator-story-topic-selection': (
        '三位创作者都先建 30 条以上的常备选题池，再用一句话记忆点和四维评分表筛选，'
        '平均 8 条里只有 1 条能进制作。选题不是靠灵感，而是靠系统化筛选。'
    ),
}

for slug, new_excerpt in FIXES.items():
    idx = content.find(f'slug: "{slug}",')
    if idx == -1:
        print(f'NOT FOUND: {slug}')
        continue
    
    end = content.find('\n  },', idx)
    block = content[idx:end]
    
    m = re.search(r'excerptZh:\s*"', block)
    if not m:
        print(f'NO excerptZh: {slug}')
        continue
    
    start_in_block = m.end()
    pos = start_in_block
    while pos < len(block):
        if block[pos] == '"' and block[pos-1] != '\\':
            break
        pos += 1
    
    old_excerpt = block[start_in_block:pos]
    
    abs_start = idx + m.start()
    abs_end = idx + pos + 1
    
    new_full = f'excerptZh: "{new_excerpt}"'
    content = content[:abs_start] + new_full + content[abs_end:]
    print(f'FIXED: {slug} (removed all quotes)')

with open(blog_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('\nDone!')
