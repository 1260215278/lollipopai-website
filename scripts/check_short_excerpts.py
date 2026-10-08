import re

blog_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts'

with open(blog_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Slugs that need excerptZh expansion
NEED_FIX = [
    'creator-story-character-bible',
    'creator-story-warm-story-formula',
    'creator-story-topic-selection',
    'ai-short-drama-faq-2026',
    'publish-and-monetize-vertical-drama',
    'future-of-ai-entertainment',
    'ten-episodes-two-weeks',
    'ai-vs-traditional-drama',
    'character-consistency-workflow',
    'first-vertical-drama-zero-experience',
    'multilingual-localization-workflow',
]

for slug in NEED_FIX:
    idx = content.find(f'slug: "{slug}",')
    if idx == -1:
        print(f'NOT FOUND: {slug}')
        continue
    end = content.find('\n  },', idx)
    block = content[idx:end]
    
    # Find excerptZh
    m = re.search(r'excerptZh:\s*"((?:[^"\\]|\\.|"(?!"))*)"', block, re.DOTALL)
    if not m:
        # Try simpler match
        start_m = re.search(r'excerptZh:\s*"', block)
        if start_m:
            # Find end of the string manually
            start_pos = start_m.end()
            pos = start_pos
            while pos < len(block):
                if block[pos] == '"' and block[pos-1] != '\\':
                    break
                pos += 1
            excerpt = block[start_m.end():pos]
            print(f'{slug}: {len(excerpt)}ch')
            print(f'  "{excerpt}"')
        else:
            print(f'{slug}: NO excerptZh found')
    else:
        excerpt = m.group(1)
        print(f'{slug}: {len(excerpt)}ch')
        print(f'  "{excerpt}"')
    print()
