"""
第二轮修复：处理所有残留的 70% 分成
包括 JSON 字符串中的、各种变体格式
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

# 更全面的替换规则
patterns = [
    # 基本形式
    (r'up to 70%', 'up to 80%'),
    (r'up-to-70%', 'up-to-80%'),
    # 中文
    (r'最高 70%', '最高 80%'),
    (r'最高70%', '最高80%'),
    # 在 revenue share 语境中的独立 70%
    (r'(\brevenue\b[^"]*?)70%', r'\g<1>80%'),
    (r'(\bshare\b[^"]*?)70%', r'\g<1>80%'),
    (r'(\bsplit\b[^"]*?)70%', r'\g<1>80%'),
    (r'(\bcreator\b[^"]*?)70%', r'\g<1>80%'),
    (r'(\bearnings\b[^"]*?)70%', r'\g<1>80%'),
    (r'(\btake-home\b[^"]*?)70%', r'\g<1>80%'),
    (r'(\bmonetiz\b[^"]*?)70%', r'\g<1>80%'),
    # 表格中的 "Up to 70%"
    (r'\| Up to 70%', '| Up to 80%'),
    (r'\| up to 70%', '| up to 80%'),
    # "70% share"
    (r'70% share', '80% share'),
    # "70% creator"
    (r'70% creator', '80% creator'),
    # "70% revenue"
    (r'70% revenue', '80% revenue'),
    # "70% of"
    (r'70% of (?:their |the )?(?:earnings|revenue)', '80% of their earnings'),
    # "shares revenue up to 70%"
    (r'shares revenue up to 70%', 'shares revenue up to 80%'),
    # "70% split"
    (r'70% split', '80% split'),
    # "70% on Net-30"
    (r'70% on Net-30', '80% on Net-30'),
    # "70%, Net-30"
    (r'70%, Net-30', '80%, Net-30'),
    # "70% with Net-30"
    (r'70% with Net-30', '80% with Net-30'),
    # "70% settled on Net-30"
    (r'70% settled on Net-30', '80% settled on Net-30'),
    # "70% and Net-30"
    (r'70% and Net-30', '80% and Net-30'),
    # "70% > traditional"
    (r'70% > traditional', '80% > traditional'),
    # "70% \u003e traditional"
    (r'70% \u003e traditional', '80% \u003e traditional'),
    # "Lollipop Drama up to 70%"
    (r'Lollipop Drama up to 70%', 'Lollipop Drama up to 80%'),
    # "Lollipop Drama 70%"
    (r'Lollipop Drama 70%', 'Lollipop Drama 80%'),
    # "Lollipop Drama（最高 70%）"
    (r'Lollipop Drama（最高 70%）', 'Lollipop Drama（最高 80%）'),
    # "Lollipop Drama最高70%"
    (r'Lollipop Drama最高70%', 'Lollipop Drama最高80%'),
    # "70% into one pipeline"
    (r'70% into one pipeline', '80% into one pipeline'),
    # "70% to creators"
    (r'70% to creators', '80% to creators'),
    # "70% creator share"
    (r'70% creator share', '80% creator share'),
    # "up to 70% creator revenue share"
    (r'up to 70% creator revenue share', 'up to 80% creator revenue share'),
    # "up to 70% revenue share"
    (r'up to 70% revenue share', 'up to 80% revenue share'),
    # "up to 70% creator share"
    (r'up to 70% creator share', 'up to 80% creator share'),
    # "70% creator revenue share"
    (r'70% creator revenue share', '80% creator revenue share'),
    # "revenue share up to 70%"
    (r'revenue share up to 70%', 'revenue share up to 80%'),
    # "revenue share runs up to 70%"
    (r'revenue share runs up to 70%', 'revenue share runs up to 80%'),
    # "keep up to 70%"
    (r'keep up to 70%', 'keep up to 80%'),
    # "creators keep up to 70%"
    (r'creators keep up to 70%', 'creators keep up to 80%'),
    # "Revenue share (up to 70%)"
    (r'Revenue share \(up to 70%\)', 'Revenue share (up to 80%)'),
    # "revenue share (up to 70%)"
    (r'revenue share \(up to 70%\)', 'revenue share (up to 80%)'),
    # "70% of the revenue"
    (r'70% of the revenue', '80% of the revenue'),
    # "70% of earnings"
    (r'70% of earnings', '80% of earnings'),
    # "70% of their revenue"
    (r'70% of their revenue', '80% of their revenue'),
    # "70% creator revenue"
    (r'70% creator revenue', '80% creator revenue'),
    # "share of up to 70%"
    (r'share of up to 70%', 'share of up to 80%'),
    # "up to 70% share"
    (r'up to 70% share', 'up to 80% share'),
    # "70% share on Net-30"
    (r'70% share on Net-30', '80% share on Net-30'),
    # "70% share with Net-30"
    (r'70% share with Net-30', '80% share with Net-30'),
    # "70% share, Net-30"
    (r'70% share, Net-30', '80% share, Net-30'),
    # "70% on Net-30"
    (r'70% on Net-30', '80% on Net-30'),
    # "70% revenue share on Net-30"
    (r'70% revenue share on Net-30', '80% revenue share on Net-30'),
    # "70% revenue share, Net-30"
    (r'70% revenue share, Net-30', '80% revenue share, Net-30'),
    # "70% and 15+ languages"
    (r'70% and 15\+ languages', '80% and 15+ languages'),
    # "70% share and Net-30"
    (r'70% share and Net-30', '80% share and Net-30'),
    # "70% share or more"
    (r'70% share or more', '80% share or more'),
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
