import re

blog_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts'

with open(blog_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all blog entries
entries = re.findall(r'slug:\s*"([^"]+)",', content)
fixed_count = 0

for slug in entries:
    # Find the entry block
    start = content.find(f'slug: "{slug}",')
    if start == -1:
        continue
    
    # Find end of this entry (next "  },")
    end = content.find('\n  },', start)
    if end == -1:
        continue
    
    block = content[start:end]
    
    # Count coverImage occurrences
    cover_count = len(re.findall(r'\n\s+coverImage:', block))
    
    if cover_count > 1:
        # Remove the LAST coverImage in the block (keep the first one near slug)
        # Find all positions
        positions = [m.start() for m in re.finditer(r'\n\s+coverImage:\s*"[^"]+",', block)]
        
        if len(positions) >= 2:
            # Remove the second occurrence (relative to block)
            second_pos_in_block = positions[1]
            # Find end of this line
            line_end = block.find('\n', second_pos_in_block + 1)
            if line_end == -1:
                line_end = len(block)
            
            # Calculate absolute position
            abs_start = start + second_pos_in_block
            abs_end = start + line_end
            
            content = content[:abs_start] + content[abs_end:]
            fixed_count += 1
            print(f'FIXED: {slug} (removed duplicate coverImage)')

with open(blog_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\nTotal fixed: {fixed_count}')

# Verify
with open(blog_path, 'r', encoding='utf-8') as f:
    content = f.read()

entries = re.findall(r'slug:\s*"([^"]+)",', content)
still_dup = 0
for slug in entries:
    start = content.find(f'slug: "{slug}",')
    if start == -1:
        continue
    end = content.find('\n  },', start)
    block = content[start:end]
    count = len(re.findall(r'\n\s+coverImage:', block))
    if count > 1:
        still_dup += 1
        print(f'STILL DUP: {slug} ({count} coverImages)')

print(f'\nVerification: {len(entries)} entries, {still_dup} still have duplicates')
