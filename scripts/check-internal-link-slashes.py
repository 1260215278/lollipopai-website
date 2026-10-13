# -*- coding: utf-8 -*-
"""dist 站内 <a href> 尾斜杠一致性检查（2026-10-13 新增）。

背景：GSC 报 958 条「网页会自动重定向」，根因为站内 <a href> 缺尾斜杠
（/blog、/about、/blog/slug），而 canonical/sitemap 用尾斜杠约定，Google
沿无斜杠内链抓取触发源站 301（且 Caddy 在 CF 之后误发 http://）。

本脚本扫描 dist 所有 HTML，确认站内绝对路径 <a href> 均以尾斜杠结尾，
与 canonical/sitemap 约定一致。允许例外：静态资源（带扩展名）、
首页 "/"、纯锚点 "/#..."、协议相对 "//"、外部 http(s)://。
"""
import re
import sys
from pathlib import Path

DIST = Path(r"C:\Users\Administrator\WorkBuddy\Worktrees\lollipop\master-17dd9e0b\dist")

A_TAG = re.compile(r'<a\b[^>]*\bhref="([^"]*)"[^>]*>', re.I)
ASSET_EXT = re.compile(r"\.[a-z0-9]+$", re.I)


def is_ok(href: str) -> bool:
    if not href.startswith("/") or href.startswith("//"):
        return True  # 外部 / 协议相对 / 非站内
    path = href.split("#", 1)[0].split("?", 1)[0]
    if path == "":
        return True  # /#anchor
    if ASSET_EXT.search(path):
        return True  # 静态资源
    return path.endswith("/")


def main() -> int:
    htmls = sorted(DIST.rglob("*.html"))
    total = 0
    bad: list[tuple[str, str]] = []
    for h in htmls:
        text = h.read_text(encoding="utf-8", errors="replace")
        for m in A_TAG.finditer(text):
            href = m.group(1)
            total += 1
            if not is_ok(href):
                bad.append((str(h.relative_to(DIST)), href))
    print(f"scanned {len(htmls)} HTML files, {total} internal <a href> checked")
    if bad:
        print(f"FAIL: {len(bad)} internal links missing trailing slash")
        for rel, href in bad[:30]:
            print(f"  {rel}  ->  {href}")
        return 1
    print("PASS: all internal <a href> use trailing slash")
    return 0


if __name__ == "__main__":
    sys.exit(main())
