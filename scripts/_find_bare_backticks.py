"""找出 blogContent.ts 里模板字面量中的裸反引号"""
with open(r'c:\Users\Administrator\Documents\lollipop\src\app\data\blogContent.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

problems = []
# 简单启发式：在行内，如果反引号出现但不在序列里（` -> \` 是正确的）
# 且不是模板字面量的开头/结尾
# 更简单：找 "`\`" 或单独一个 "`" 后面跟着正常文本的行

import re
in_template = False
for i, line in enumerate(lines, 1):
    stripped = line.strip()
    # 跳过确定的模板边界行
    if stripped.startswith('content:`') or stripped == '`,' or stripped.endswith(': `'):
        continue
    # 找行中裸反引号（非 \` 形式）
    # 模式: 非转义反引号后跟非逗号/反引号内容
    matches = re.findall(r'(?<!\\)`(?!,|\s*$|\s*})', line)
    if matches and i > 30200 and i < 32200:  # 只检查我们修改的区域
        problems.append((i, line.rstrip(), matches))

print(f"疑似问题行: {len(problems)}")
for lineno, text, m in problems[:20]:
    print(f"  Line {lineno}: ...{text[:120]}...  ← {m}")
