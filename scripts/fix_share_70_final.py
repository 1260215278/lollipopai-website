"""
最终修复：处理中文 70% 分成残留
"""
import re
import os
import sys

sys.stdout.reconfigure(line_buffering=True)

DATA_DIR = r"c:\Users\Administrator\Documents\lollipop\src\app\data"

files = [
    os.path.join(DATA_DIR, "blog.ts"),
    os.path.join(DATA_DIR, "blogContent.ts"),
    os.path.join(DATA_DIR, "blogFaq.ts"),
]

patterns = [
    # 中文 "70% 分成"
    (r'70% 分成', '80% 分成'),
    (r'70%分成', '80%分成'),
    (r'最高 70%', '最高 80%'),
    (r'最高70%', '最高80%'),
    (r'最高可获 70%', '最高可获 80%'),
    (r'最高可获70%', '最高可获80%'),
    (r'创作者最高分成 70%', '创作者最高分成 80%'),
    (r'创作者最高分成70%', '创作者最高分成80%'),
    (r'创作者最高可获 70%', '创作者最高可获 80%'),
    (r'分成 70%', '分成 80%'),
    (r'分成70%', '分成80%'),
    (r'最高 \*\*70\%\*\*', '最高 **80%**'),
    (r'最高\*\*70\%\*\*', '最高**80%**'),
    (r'分成最高 \*\*70\%\*\*', '分成最高 **80%**'),
    (r'70% vs 40%', '80% vs 40%'),
    (r'70% vs\. 40%', '80% vs. 40%'),
    (r'Lollipop Drama 的 70%', 'Lollipop Drama 的 80%'),
    (r'Lollipop Drama 的70%', 'Lollipop Drama 的80%'),
    (r'最高 70% 分成', '最高 80% 分成'),
    (r'最高70%分成', '最高80%分成'),
    (r'最高分成 70%', '最高分成 80%'),
    (r'最高分成70%', '最高分成80%'),
    (r'（最高 70%）', '（最高 80%）'),
    (r'（最高70%）', '（最高80%）'),
    # 80+ countries in Chinese
    (r'80\+ 国家', '100+ 国家'),
    (r'80\+ 国', '100+ 国'),
    (r'80\+国家', '100+国家'),
]

total = 0
for fpath in files:
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    for pattern, replacement in patterns:
        content, count = re.subn(pattern, replacement, content)
        total += count
    if content != original:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"UPDATED: {os.path.basename(fpath)}")

print(f"\nTotal replacements: {total}")
print("Done")
