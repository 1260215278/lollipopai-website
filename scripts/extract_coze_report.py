import re
from html.parser import HTMLParser

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text_parts = []
        self.skip = False
        self.skip_tags = {'script', 'style'}
    
    def handle_starttag(self, tag, attrs):
        if tag in self.skip_tags:
            self.skip = True
    
    def handle_endtag(self, tag):
        if tag in self.skip_tags:
            self.skip = False
        if tag in ('p', 'div', 'li', 'h1', 'h2', 'h3', 'h4', 'br'):
            self.text_parts.append('\n')
    
    def handle_data(self, data):
        if not self.skip:
            self.text_parts.append(data.strip())

fp = r'c:\Users\Administrator\.trae-cn\attachments\6aa38ddf241acc9d8042189d\5b69a11c-e2fa-44dc-93bb-74ff4b2f68a4_77c67a1a-e23a-40aa-a4d7-2977040f85e8_扣子 - AI办公助手一站式平台 - 扣子提供AI写作_PPT_表格_设计_播客_生图.html'

with open(fp, 'r', encoding='utf-8') as f:
    html = f.read()

parser = TextExtractor()
parser.feed(html)
text = ''.join(parser.text_parts)
text = re.sub(r'\n{3,}', '\n\n', text)

# Find sections about Lollipop or optimization
lines = text.split('\n')
relevant = []
capture = False
for i, line in enumerate(lines):
    if any(k in line for k in ['Lollipop', 'lollipop', '三维度', 'P0', 'P1', 'P2', '行动清单', '优化', '评分', '审计']):
        capture = True
        start = max(0, i-2)
        end = min(len(lines), i+3)
        for j in range(start, end):
            if lines[j].strip():
                relevant.append(lines[j].strip())
        relevant.append('---')

# Deduplicate and print
seen = set()
output = []
for line in relevant:
    if line not in seen and len(line.strip()) > 5:
        seen.add(line)
        output.append(line)

print('\n'.join(output[:80]))
