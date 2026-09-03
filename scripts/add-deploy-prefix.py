#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
add-deploy-prefix.py — Coverage 修复 R1/R2：全仓 URL 加 /lollipop/ 部署前缀（2026-09-01）

背景：GSC Coverage 报告显示 398 个「自动重定向」+ 103 个「canonical 备用页」。
根因：canonical / sitemap / hreflang / JSON-LD / llms 全部硬编码 https://www.lollipop.im
（无 /lollipop/ 部署前缀），而真实可索引 URL 是 https://www.lollipop.im/lollipop/...，
无前缀 URL 实际 301 到 http://.../about/（链式跳转）。

替换规则（先 A 后 B，防重复）：
  A. https://www.lollipop.im/xxx  → https://www.lollipop.im/lollipop/xxx
     （负面前瞻 (?!lollipop/) 确保已带前缀的跳过）
  B. https://www.lollipop.im"（裸域结尾，后跟 " ' , } ) 空白 或行尾）
     → https://www.lollipop.im/lollipop/"  （站点/首页语义）

⚠️ 排除 src/app/services/http.ts（其中 www.lollipop.im 只出现在注释里，是 API 说明，不能改）。
⚠️ CRLF 保真：按文件原行尾写回。
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

FILES = [
    "scripts/prerender-plugin.ts",
    "src/app/i18n.seo.ts",
    "src/app/App.tsx",
    "src/app/data/blogContent.ts",
    "src/app/pages/BlogListPage.tsx",
    "src/app/pages/CreatorProfilePage.tsx",
    "src/app/pages/BlogPostPage.tsx",
    "src/app/pages/DramaPage.tsx",
    "src/app/pages/RegionPage.tsx",
    "src/app/pages/GenrePage.tsx",
    "src/app/pages/LegalDocumentPage.tsx",
    "public/sitemap.xml",
]

RULE_A = re.compile(r"https://www\.lollipop\.im/(?!lollipop)")
# ⚠️ 负面前瞻必须是 (?!lollipop) 而非 (?!lollipop/)：后者漏掉「/lollipop 后直接跟
#    引号/逗号」的写法（如 const SITE_URL = ".../lollipop";），导致二次加前缀成双前缀
#    （2026-09-01 实测踩坑，3406 处 dist 污染）。
RULE_B = re.compile(r'https://www\.lollipop\.im(?=["\',})\s\]])')


def process(path: str) -> int:
    p = ROOT / path
    with p.open(encoding="utf-8", newline="") as f:
        raw = f.read()
    eol = "\r\n" if "\r\n" in raw else "\n"
    text = raw.replace("\r\n", "\n")
    a = len(RULE_A.findall(text))
    text = RULE_A.sub("https://www.lollipop.im/lollipop/", text)
    b = len(RULE_B.findall(text))
    text = RULE_B.sub("https://www.lollipop.im/lollipop/", text)
    with p.open("w", encoding="utf-8", newline="") as f:
        f.write(text.replace("\n", eol))
    tag = "CRLF" if eol == "\r\n" else "LF"
    print(f"{path}: A={a} B={b} EOL={tag}")
    return a + b


if __name__ == "__main__":
    total = 0
    for f in FILES:
        total += process(f)
    print(f"TOTAL replacements: {total}")
