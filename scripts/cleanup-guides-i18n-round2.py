# -*- coding: utf-8 -*-
"""i18n 死键清理第二轮 + 新增 Footer 所需键（2026-09-01，/guides 迁入 /blog 收尾）。

两件事：

1) 再删 4 个死键 × 6 语言 = 24 个
   `allGuides` / `backToGuides` / `notFoundGuide` / `relatedGuides`
   —— 都是旧 `GuidesListPage` / `GuidePage` 用的，页面随 /guides 一起删了。
   已核实：全仓零 `.allGuides` 等属性访问，且无 `dp[...]` 动态键访问（有则不能静态删）。

2) 新增 `howToGuides` × 6 语言
   Footer 的 Explore 栏里 "Blog" / "How-To Guides" 之前是硬编码英文，非英语种显示英文。
   "Blog" 复用已有的 `dynamicPages.blog`；"How-To Guides" 需要新键。

⚠️ `TranslationMessages = typeof enMessages`，en 是类型源，6 个语言块必须同步改。
⚠️ CRLF：open(newline="") 保真读写，内部按 LF 处理，落盘还原原行尾。
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

# ── 1) 删除死键 ─────────────────────────────────────────────────────────────
DEAD = ["allGuides", "backToGuides", "notFoundGuide", "relatedGuides"]
removed = 0
for k in DEAD:
    work, n = re.subn(r"^[ \t]*" + k + r": .*,\n", "", work, flags=re.M)
    removed += n
    print(f"  {'OK ' if n == 6 else '!! '}删除 {k}: {n} 处（期望 6）")

if removed != 24:
    print(f"\n[ABORT] 删除 {removed} 处，预期 24 处，未写入。")
    sys.exit(1)

# ── 2) 新增 howToGuides（插到 relatedPosts 之前，6 个语言块各一次）────────────
# 措辞沿用既有键：zh 用「指南」，pt/es 用 guias/guías，ar 用 الأدلة
VALUES = {
    "How-To Guides": "How-To Guides",
    "Related Posts": "How-To Guides",  # 占位，下面按出现顺序替换
}
# 按文件里 relatedPosts 的出现顺序给出译文（en / zh-CN / zh-TW / pt / es / ar）
ORDERED = [
    "How-To Guides",   # en
    "操作指南",         # zh-CN
    "操作指南",         # zh-TW
    "Guias Práticos",  # pt
    "Guías Prácticas",  # es
    "أدلة عملية",   # ar
]

anchors = list(re.finditer(r"^([ \t]*)relatedPosts: ", work, re.M))
if len(anchors) != 6:
    print(f"\n[ABORT] relatedPosts 锚点 {len(anchors)} 个，预期 6 个，未写入。")
    sys.exit(1)

# 从后往前插，避免位置偏移
for m, val in zip(reversed(anchors), reversed(ORDERED)):
    indent = m.group(1)
    work = work[: m.start()] + f'{indent}howToGuides: "{val}",\n' + work[m.start() :]
print(f"  OK  新增 howToGuides: 6 处")

# ── 落盘 ────────────────────────────────────────────────────────────────────
before = len(P.read_bytes())

with P.open("w", encoding="utf-8", newline="") as f:
    f.write(work.replace("\n", eol))

# ⚠️ 必须用字节数对比：文件里有大量中文/阿拉伯文，字符数比字节数小很多，
#    拿 len(字符) 和 len(字节) 对比会得出「删了内容反而变大」的荒谬结论。
b = P.read_bytes()
crlf = b.count(b"\r\n")
bare = b.count(b"\n") - crlf
print(f"\n[WRITE] i18n.tsx：删 {removed} 处死键，加 6 处新键")
print(f"        {before} → {len(b)} bytes，CRLF={crlf}，裸LF={bare}（{'纯 CRLF OK' if bare == 0 else '混合行尾 有问题'}）")
print(f"        howToGuides 出现 {work.count('howToGuides:')} 次（应为 6）")
