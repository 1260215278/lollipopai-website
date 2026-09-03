# -*- coding: utf-8 -*-
"""止血：移除 sitemap.xml 里指向不存在页面的 hreflang（2026-09-01）。

背景：sitemap 声明了 476 条 hreflang，其中 460 条指向 /zh/… /zh-TW/… /pt/… /es/… /ar/…
语言前缀路径，但 dist 里**零语言目录** —— Caddy 的
`try_files {path} {path}/index.html /index.html` 会把这些 URL 全部 fallback 到英文首页。

后果：① hreflang 互指链断裂 → 整组失效 ② 约 340 个 URL 重复内容
③ 抓取预算浪费 ④ GPTBot / PerplexityBot / ClaudeBot 不渲染 JS，非英语种内容为零。

本脚本只做**止血**：删掉 5 个不存在语言的 hreflang，保留自指的 `en` 与 `x-default`。
（保留 en 而非全删，是为了将来重新接入多语言时只需加回 5 行，diff 最小。）

只删 hreflang 行，不动 `<loc>` / `<lastmod>` / `<priority>` 等任何其它内容。
⚠️ CRLF：open(newline="") 保真读写，落盘还原原行尾。
"""
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

P = Path(r"C:\Users\Administrator\Documents\lollipop\public\sitemap.xml")

with P.open(encoding="utf-8", newline="") as f:
    raw = f.read()
eol = "\r\n" if "\r\n" in raw else "\n"
work = raw.replace("\r\n", "\n")

KEEP = {"en", "x-default"}
DROP = ["zh-CN", "zh-TW", "pt", "es", "ar"]

before_lines = work.count("\n")
before_bytes = len(P.read_bytes())

total_removed = 0
for lang in DROP:
    # 只匹配 hreflang 属性值精确等于 lang 的整行（含行尾换行）
    pat = r'^[ \t]*<xhtml:link rel="alternate" hreflang="' + re.escape(lang) + r'" href="[^"]*"[ \t]*/>[ \t]*\n'
    work, n = re.subn(pat, "", work, flags=re.M)
    total_removed += n
    print(f"  {'OK ' if n > 0 else '!! '}移除 hreflang={lang}: {n} 行")

# ⚠️ 预期 340 = 68 个 URL × 5 个语言。
#    别用「grep 域名后第一个路径段」去数坏 URL —— 那样会把
#    `hreflang="en" href="https://www.lollipop.im/blog/"` 这类**带路径段的存活条目**
#    也算成坏的（我第一版就数成了 460，虚报 120 条）。
#    正确账目：68 × 7（en + 5 语言 + x-default）= 476 总数，其中 340 条是死的。
if total_removed != 340:
    print(f"\n[ABORT] 移除 {total_removed} 行，预期 340 行，未写入。")
    sys.exit(1)

with P.open("w", encoding="utf-8", newline="") as f:
    f.write(work.replace("\n", eol))

b = P.read_bytes()
crlf = b.count(b"\r\n")
bare = b.count(b"\n") - crlf
print(f"\n[WRITE] sitemap.xml：移除 {total_removed} 行死 hreflang")
print(f"        {before_bytes} → {len(b)} bytes，行数 {before_lines} → {work.count(chr(10))}")
print(f"        CRLF={crlf}，裸LF={bare}（{'纯 CRLF OK' if bare == 0 else '混合行尾 有问题'}）")

# 复核：剩余的 hreflang 语言集合
left = sorted(set(re.findall(r'hreflang="([^"]+)"', work)))
print(f"        剩余 hreflang 语言: {left}（应为 ['en', 'x-default']）")

left_over = [l for l in left if l not in KEEP]
if left_over:
    print(f"\n[FAIL] 仍有不该存在的语言: {left_over}")
    sys.exit(1)
print("        复核通过：只剩 en + x-default")
