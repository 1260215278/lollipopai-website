import re

path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blogContent.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

slugs = [
    'ai-short-drama-copyright-commercial-rights',
    'ai-short-drama-distribution-platforms-submission',
    'ai-short-drama-retention-analytics-drop-off-cohorts',
]

for slug in slugs:
    pattern = rf'  "{re.escape(slug)}": \{{\n    content: `'
    m = re.search(pattern, content)
    if not m:
        print(f'WARN: slug {slug} block start not found')
        continue
    start = m.start()
    block_end_pattern = re.compile(rf'  "{re.escape(slug)}": \{{.*?\n  \}},\n', re.DOTALL)
    block_match = block_end_pattern.search(content, start)
    if not block_match:
        print(f'WARN: could not find block end for {slug}')
        continue
    block_text = block_match.group(0)
    print(f'Block for {slug} ({len(block_text)} chars)')
    if 'contentZh:' in block_text:
        print(f'  -> already has contentZh, skip')
        continue
    content_start = block_text.find('content: `') + len('content: `')
    close_pattern = r'`,\n  \},'
    close_match = re.search(close_pattern, block_text)
    if not close_match:
        print(f'  WARN: content close pattern not found')
        continue
    content_end_in_block = close_match.start()
    markdown_body = block_text[content_start:content_end_in_block]
    new_block = block_text[:content_end_in_block] + '`,\n    contentZh: `' + markdown_body + '`,\n  },\n'
    content = content[:block_match.start()] + new_block + content[block_match.end():]
    print(f'  -> added contentZh ({len(markdown_body)} chars same as content)')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
