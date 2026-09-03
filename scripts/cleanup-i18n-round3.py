# -*- coding: utf-8 -*-
"""i18n 死键清理第三轮（2026-09-01，收尾）。

删 9 个死键 × 6 语言 = 54 个：

  common.availableNow        "Available Now"                      —— 旧下载区徽章
  common.scanForAppStore     "App Store"                          —— 与 common.appStore 重复
  common.scanForGooglePlay   "Google Play"                        —— 与 common.googlePlay 重复
  common.previewComingSoon   "Preview Coming Soon"                —— videoModal 有自己的一份
  common.fullEpisodeInApp    "Full episode available in the app"  —— 同上
  common.languageUpdated     "Language"                           —— 语言选择器用 footer.titles.languages
  footer.titles.businessContact / customerService                 —— 联系卡片标题由 contact.cards 提供
  dynamicPages.timeRequired  "Time required"                      —— 时长徽章只渲染数值+图标，无标签

核实方法（两项前置，缺一不可）：
  ① 全仓搜索键名（排除 i18n.tsx、node_modules、dist）→ 零命中
  ② 确认无动态键访问 → **这一轮恰恰踩到了**：Footer.tsx:107 有
     `messages.footer.links[item.key]`，所以 `footer.links` 整块不能静态判定。
     本轮删的 9 个键**都不属于 footer.links**，故安全。
     这也说明自动死键扫描不能无脑固化 —— 见 _probe_deadkeys.py 的结论。

⚠️ `TranslationMessages = typeof enMessages`，en 是类型源，6 个语言块必须同步删。
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

DEAD = [
    "availableNow",
    "scanForAppStore",
    "scanForGooglePlay",
    "previewComingSoon",
    "fullEpisodeInApp",
    "languageUpdated",
    "businessContact",
    "customerService",
    "timeRequired",
]

removed = 0
for k in DEAD:
    # 先确认键名在文件中只出现 6 次（每个语言一次），否则说明有跨 section 重名，
    # 单行正则会误伤同名但不同用途的键。
    total = len(re.findall(r"^[ \t]*" + k + r": ", work, flags=re.M))
    work, n = re.subn(r"^[ \t]*" + k + r": .*,\n", "", work, flags=re.M)
    removed += n
    ok = (n == 6) and (total == 6)
    print(f"  {'OK ' if ok else '!! '}删除 {k}: 删 {n} 处 / 定义 {total} 处（期望均 6）")

if removed != 54:
    print(f"\n[ABORT] 删除 {removed} 处，预期 54 处，未写入。")
    sys.exit(1)

before = len(P.read_bytes())

with P.open("w", encoding="utf-8", newline="") as f:
    f.write(work.replace("\n", eol))

# ⚠️ 必须用字节数对比：文件里有大量中文/阿拉伯文，字符数比字节数小很多。
b = P.read_bytes()
crlf = b.count(b"\r\n")
bare = b.count(b"\n") - crlf
print(f"\n[WRITE] i18n.tsx：删 {removed} 处死键")
print(f"        {before} → {len(b)} bytes，CRLF={crlf}，裸LF={bare}"
      f"（{'纯 CRLF OK' if bare == 0 else '混合行尾 有问题'}）")

left = [k for k in DEAD if re.search(r"^[ \t]*" + k + r": ", work, flags=re.M)]
print(f"        残留检查：{'无残留 OK' if not left else '仍有 ' + str(left)}")
