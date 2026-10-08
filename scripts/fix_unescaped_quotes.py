import re

blog_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts'

with open(blog_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all excerptZh fields and check for unescaped quotes
# Pattern: excerptZh: "...content with unescaped"..."
# We need to find all excerptZh lines that have unescaped " inside the string

lines = content.split('\n')
fixed_count = 0

for i, line in enumerate(lines):
    if 'excerptZh:' not in line:
        continue
    
    # Check if the line has unescaped quotes (more than the opening and closing ones)
    # The pattern should be: excerptZh: "content here",
    # If there are extra " inside, they break the syntax
    
    # Find all " positions in the line after 'excerptZh:'
    idx = line.find('excerptZh:')
    if idx == -1:
        continue
    
    rest = line[idx:]
    # Count quotes
    quote_positions = [j for j, c in enumerate(rest) if c == '"']
    
    if len(quote_positions) > 2:
        # Has extra quotes - need to escape them
        # The first " is the string opener, last " is the closer
        # All " in between need to be escaped as \"
        
        # Extract the content between first and last quote
        first_q = quote_positions[0]
        last_q = quote_positions[-1]
        before = rest[:first_q + 1]  # up to and including opening "
        string_content = rest[first_q + 1:last_q]
        after = rest[last_q:]  # from closing " onwards
        
        # Replace all " in string_content with '
        # (using single quotes is safer than escaping for Chinese text)
        fixed_content = string_content.replace('"', "'")
        
        new_rest = before + fixed_content + after
        lines[i] = line[:idx] + new_rest
        fixed_count += 1
        print(f'FIXED line {i+1}: {line[idx:idx+80]}...')

content = '\n'.join(lines)

with open(blog_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\nTotal fixed: {fixed_count} lines')
