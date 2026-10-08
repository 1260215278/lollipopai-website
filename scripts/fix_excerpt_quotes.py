import re

blog_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts'

with open(blog_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Replace escaped quotes in excerptZh for creator-story articles
# The \" in TypeScript strings causes the prerender to truncate at the first "
FIX_SLUGS = {
    'creator-story-character-bible': (
        '角色一致性靠一本"角色圣经"——8-12 张参考图（正 / 侧 / 背 + 3-5 种表情 + 2 套服装），'
        '再配合 image anchor 与 seed lock 跨集锁定；动画师小满用这套流程让第 1 集到第 10 集的脸始终是同一个人。'
    ),
    'creator-story-warm-story-formula': (
        '温情短片爆款靠一条"共鸣公式"——真实困境 + 微光转机 + 留白结尾。'
        '两位 Lollipop Drama 创作者用它把完播率做到 42%-58%，标题决定一半的点击。'
    ),
    'creator-story-topic-selection': (
        '三位创作者都先建 30 条以上的常备选题池，再用"一句话记忆点 + 四维评分表"筛选，'
        '平均 8 条里只有 1 条能进制作。选题不是靠灵感，而是靠系统化筛选。'
    ),
    'ai-short-drama-faq-2026': (
        'AI 短剧制作 60 问全解：涵盖工具选择、成本预算、口型同步、角色一致性、'
        '版权合规到发布变现的常见问题，适合零基础入门者快速建立完整认知框架。'
    ),
}

updated = 0
for slug, new_excerpt in FIX_SLUGS.items():
    idx = content.find(f'slug: "{slug}",')
    if idx == -1:
        print(f'NOT FOUND: {slug}')
        continue
    
    # Find the excerptZh line within this entry
    end = content.find('\n  },', idx)
    block = content[idx:end]
    
    # Find excerptZh start
    m = re.search(r'excerptZh:\s*"', block)
    if not m:
        print(f'NO excerptZh: {slug}')
        continue
    
    # Find the end of the string (unescaped ")
    start_in_block = m.end()
    pos = start_in_block
    while pos < len(block):
        if block[pos] == '"' and block[pos-1] != '\\':
            break
        pos += 1
    
    old_excerpt = block[start_in_block:pos]
    
    # Replace the old excerpt with the new one
    abs_start = idx + m.start()
    abs_end = idx + pos + 1  # include closing quote
    
    new_full = f'excerptZh: "{new_excerpt}"'
    content = content[:abs_start] + new_full + content[abs_end:]
    updated += 1
    print(f'FIXED: {slug} ({len(old_excerpt)}ch -> {len(new_excerpt)}ch)')

# Fix 2: Also remove escaped quotes from excerptZh in other articles
# that might have the same issue
entries = re.findall(r'slug:\s*"([^"]+)",', content)
for slug in entries:
    idx = content.find(f'slug: "{slug}",')
    if idx == -1:
        continue
    end = content.find('\n  },', idx)
    block = content[idx:end]
    
    m = re.search(r'excerptZh:\s*"', block)
    if not m:
        continue
    
    start_in_block = m.end()
    pos = start_in_block
    while pos < len(block):
        if block[pos] == '"' and block[pos-1] != '\\':
            break
        pos += 1
    
    old_excerpt = block[start_in_block:pos]
    
    # Check if it contains escaped quotes
    if '\\"' in old_excerpt:
        # Replace escaped quotes with regular quotes (they'll be safe in the string)
        new_excerpt = old_excerpt.replace('\\"', '"')
        # But we need to be careful - if we put unescaped " in the TS string, it'll break
        # So use single quotes or remove them
        new_excerpt = old_excerpt.replace('\\"', "'")
        
        abs_start = idx + m.start()
        abs_end = idx + pos + 1
        new_full = f'excerptZh: "{new_excerpt}"'
        content = content[:abs_start] + new_full + content[abs_end:]
        print(f'UNESCAPED: {slug} (removed \\" from excerptZh)')

with open(blog_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\nTotal fixed: {updated} direct + escaped quotes cleaned')
