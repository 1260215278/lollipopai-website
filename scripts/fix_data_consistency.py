"""
批量修复数据矛盾：
1. 分成：70% → 80%（与官方标准一致）
2. 国家数：80+ → 100+（与官方标准一致）

注意：只修改 revenue share 和 country count 语境下的数字，
不误改其他上下文中的 70%（如 "70% of weak topics"）
"""
import re
import os
import sys

sys.stdout.reconfigure(line_buffering=True)

DATA_DIR = r"c:\Users\Administrator\Documents\lollipop\src\app\data"

# 需要修改的文件
files = [
    os.path.join(DATA_DIR, "blogContent.ts"),
    os.path.join(DATA_DIR, "blogFaq.ts"),
    os.path.join(DATA_DIR, "blog.ts"),
]

# 分成替换规则：匹配 revenue share 语境下的 70%
# 包括：up to 70% (revenue) share, 70% revenue share, 70% creator share,
# 70% share on Net-30, revenue share up to 70%, up-to-70% share 等
share_patterns = [
    # "up to 70% revenue share" / "up to 70% share" / "up to 70% creator share"
    (r'up to 70% (?:creator )?(?:revenue )?share', 'up to 80% revenue share'),
    # "up-to-70% share"
    (r'up-to-70% share', 'up-to-80% share'),
    # "70% revenue share"
    (r'70% revenue share', '80% revenue share'),
    # "revenue share up to 70%"
    (r'revenue share up to 70%', 'revenue share up to 80%'),
    # "70% creator share"
    (r'70% creator share', '80% creator share'),
    # "70% share on Net-30"
    (r'70% share on Net-30', '80% share on Net-30'),
    # "revenue share runs up to 70%"
    (r'revenue share runs up to 70%', 'revenue share runs up to 80%'),
    # "up to 70% creator revenue share"
    (r'up to 70% creator revenue share', 'up to 80% creator revenue share'),
    # "up to 70% revenue share on Net-30"
    (r'up to 70% revenue share on Net-30', 'up to 80% revenue share on Net-30'),
    # "70% creator revenue share"
    (r'70% creator revenue share', '80% creator revenue share'),
    # "keep up to 70% revenue share"
    (r'keep up to 70% revenue share', 'keep up to 80% revenue share'),
    # "70% of their earnings" (in revenue context)
    (r'70% of their earnings', '80% of their earnings'),
    # "revenue share of up to 70%"
    (r'revenue share of up to 70%', 'revenue share of up to 80%'),
    # "up to 70% on Net-30"
    (r'up to 70% on Net-30', 'up to 80% on Net-30'),
    # "creators keep up to 70%"
    (r'creators keep up to 70%', 'creators keep up to 80%'),
    # "up to 70% revenue share, Net-30"
    (r'up to 70% revenue share, Net-30', 'up to 80% revenue share, Net-30'),
    # "up to 70%, Net-30" (standalone in revenue context)
    (r'up to 70%, Net-30', 'up to 80%, Net-30'),
    # "70% share, Net-30"
    (r'70% share, Net-30', '80% share, Net-30'),
    # "70% share with Net-30"
    (r'70% share with Net-30', '80% share with Net-30'),
    # "share up to 70%"
    (r'share up to 70%', 'share up to 80%'),
    # "70% revenue share on Net-30"
    (r'70% revenue share on Net-30', '80% revenue share on Net-30'),
    # "up to 70% creator revenue"
    (r'up to 70% creator revenue', 'up to 80% creator revenue'),
    # "up to 70% creator share on Net-30"
    (r'up to 70% creator share on Net-30', 'up to 80% creator share on Net-30'),
    # "Revenue share (up to 70%)"
    (r'Revenue share \(up to 70%\)', 'Revenue share (up to 80%)'),
    # "revenue share (up to 70%)"
    (r'revenue share \(up to 70%\)', 'revenue share (up to 80%)'),
    # "70% revenue share into one pipeline"
    (r'revenue share up to 70% into one pipeline', 'revenue share up to 80% into one pipeline'),
    # "up to 70% share, and Net-30"
    (r'up to 70% share, and Net-30', 'up to 80% share, and Net-30'),
    # "up to 70% revenue share and Net-30"
    (r'up to 70% revenue share and Net-30', 'up to 80% revenue share and Net-30'),
]

# 国家数替换规则
country_patterns = [
    # "80+ countries" → "100+ countries"
    (r'80\+ countries', '100+ countries'),
    # "80+ country" (singular in some contexts) → "100+ countries"
    (r'80\+ country and', '100+ country and'),
    # "across 80+ countries" → "across 100+ countries"
    (r'across 80\+ countries', 'across 100+ countries'),
]

total_share_replacements = 0
total_country_replacements = 0

for fpath in files:
    if not os.path.exists(fpath):
        print(f"SKIP: {fpath} not found")
        continue

    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Apply share replacements
    for pattern, replacement in share_patterns:
        content, count = re.subn(pattern, replacement, content)
        if count > 0:
            total_share_replacements += count

    # Apply country replacements
    for pattern, replacement in country_patterns:
        content, count = re.subn(pattern, replacement, content)
        if count > 0:
            total_country_replacements += count

    if content != original:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"UPDATED: {os.path.basename(fpath)}")
    else:
        print(f"NO CHANGE: {os.path.basename(fpath)}")

print(f"\nTotal share replacements: {total_share_replacements}")
print(f"Total country replacements: {total_country_replacements}")
print("Done")
