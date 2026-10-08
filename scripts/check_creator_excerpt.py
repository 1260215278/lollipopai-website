import re

fp = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts'
with open(fp, 'r', encoding='utf-8') as f:
    content = f.read()

for slug in ['creator-story-topic-selection', 'creator-story-warm-story-formula', 'creator-story-character-bible']:
    idx = content.find(f'slug: "{slug}",')
    end = content.find('\n  },', idx)
    block = content[idx:end]
    # Find excerptZh line
    lines = block.split('\n')
    for i, line in enumerate(lines):
        if 'excerptZh' in line:
            print(f'{slug}: line {i} -> {line.strip()[:120]}')
            # Check if it continues
            if not line.rstrip().endswith('",'):
                for j in range(i+1, min(i+5, len(lines))):
                    print(f'  cont {j}: {lines[j].strip()[:100]}')
                    if lines[j].rstrip().endswith('",'):
                        break
            break
    print()
