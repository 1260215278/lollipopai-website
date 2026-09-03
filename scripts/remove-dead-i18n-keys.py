# -*- coding: utf-8 -*-
"""清理 src/app/i18n.tsx 中随 /guides 下线而变成死代码的 dynamicPages 键。

2026-09-01 /guides 整体迁入 /blog 后，以下键再无任何引用（已逐键核实零引用，
且全仓无 `dp[...]` 形式的动态键访问）：

  howToSteps        —— 旧的通用 HowTo 步骤模板（违反「结构化数据须与可见文本一致」，已停用）
  howToTotalTime    —— 同上
  guides            —— 旧 GuidesListPage 的导航标签
  guidesTitle       —— 旧 /guides 列表页标题
  guidesDescription —— 旧 /guides 列表页描述

⚠️ `TranslationMessages = typeof enMessages`，en 是类型源，
   所以 6 个语言块必须**同步全删**，只删 en 会让其余 5 个语言对象多出未声明属性而类型报错。

⚠️ CRLF：必须用 open(newline="") 保真读写，内部按 LF 处理，落盘还原原行尾。
"""
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

P = Path(r"C:\Users\Administrator\Documents\lollipop\src\app\i18n.tsx")

with P.open(encoding="utf-8", newline="") as f:
    raw = f.read()
eol = "\r\n" if "\r\n" in raw else "\n"
work = raw.replace("\r\n", "\n")

# (说明, 正则) —— 顺序无关，但数组块要整体匹配
PATTERNS = [
    ("howToSteps 数组块", r"^[ \t]*howToSteps: \[\n(?:^.*\n)*?^[ \t]*\],\n"),
    ("howToTotalTime", r"^[ \t]*howToTotalTime: .*,\n"),
    ("guidesTitle", r"^[ \t]*guidesTitle: .*,\n"),
    ("guidesDescription", r"^[ \t]*guidesDescription: .*,\n"),
    # ⚠️ 放在最后：`guides:` 不会匹配 `guidesTitle:`（后面是 T 不是 :），顺序其实安全
    ("guides", r"^[ \t]*guides: .*,\n"),
]

total = 0
for label, pat in PATTERNS:
    work, n = re.subn(pat, "", work, flags=re.M)
    total += n
    flag = "OK " if n == 6 else "!! "
    print(f"  {flag}{label}: 删除 {n} 处（期望 6）")

if total != 30:
    print(f"\n[ABORT] 共删除 {total} 处，与预期 30 处不符，未写入。请人工检查。")
    sys.exit(1)

# 残留确认
left = [l for l in PATTERNS if re.search(l[1], work, re.M)]
if left:
    print(f"\n[ABORT] 仍有残留：{[l[0] for l in left]}")
    sys.exit(1)

with P.open("w", encoding="utf-8", newline="") as f:
    f.write(work.replace("\n", eol))

b = P.read_bytes()
crlf = b.count(b"\r\n")
bare = b.count(b"\n") - crlf
print(f"\n[WRITE] i18n.tsx：删除 {total} 处死键")
print(f"        126476 → {len(b)} bytes，CRLF={crlf}，裸LF={bare}（{'纯 CRLF OK' if bare == 0 else '混合行尾 有问题'}）")
