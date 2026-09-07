#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
update-sitemap-multilang.py — 方案 B 多语言 sitemap 生成（2026-09-01）

背景：/guides 迁入 /blog 后 sitemap 为 68 条纯英文 <url>（每条 en + x-default）。
方案 B 把「5 营销页 + /blog 列表 + 12 篇 HowTo + 10 genre」扩展为 6 语言版本。

本脚本：
1. 解析现有 public/sitemap.xml 的 en <url> 块（loc/lastmod/changefreq/priority）
2. 子集路径（28 个）生成 6 语言 <url>（每条 hreflang 组 = 6 语言 + x-default→en）
3. 非子集路径保持原样（en + x-default）
4. 写回 public/sitemap.xml（CRLF 保真）并校验条数

用法：
  python scripts/update-sitemap-multilang.py

预期结果：68 → 28×6 + 40 = 208 条 <url>。
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITEMAP = ROOT / "public" / "sitemap.xml"
BLOG_TS = ROOT / "src" / "app" / "data" / "blog.ts"
SITE = "https://www.lollipop.im"

# ── 语言 → URL 前缀段（与 src/app/localePath.ts 对齐；en 无前缀）──
# 顺序注意 zh-TW 在 zh 前（前缀误匹配）
SEGMENTS = ["zh-TW", "zh", "pt", "es", "ar"]
SEG_TO_PREFIX = {s: f"/{s}" for s in SEGMENTS}
EN = "en"

# 营销页 + blog 列表（多语言子集静态部分）
STATIC_SUBSET = {"/", "/about", "/creating", "/download", "/contact", "/blog"}


def read_text_preserve_eol(p: Path) -> tuple[str, str]:
    """保真读文件，返回 (内容, 原行尾)。"""
    with p.open(encoding="utf-8", newline="") as f:
        raw = f.read()
    eol = "\r\n" if "\r\n" in raw else "\n"
    return raw.replace("\r\n", "\n"), eol


def howto_slugs() -> set[str]:
    """从 blog.ts 反查带步骤（stepCount>0）的文章 slug（12 篇）。"""
    raw, _ = read_text_preserve_eol(BLOG_TS)
    blocks = re.split(r"(?m)^\s{4}slug: ", raw)
    out: set[str] = set()
    for blk in blocks[1:]:
        slug = re.match(r'"([a-z0-9-]+)"', blk)
        if not slug:
            continue
        has_steps = re.search(r"(?m)^\s*stepCount:\s*[1-9]\d*", blk)
        if has_steps:
            out.add(slug.group(1))
    return out


def parse_existing() -> list[dict]:
    """解析现有 sitemap 的 en <url> 块（跳过已生成的语言版本块，保证幂等）。"""
    raw, _ = read_text_preserve_eol(SITEMAP)
    blocks: list[dict] = []
    LANG_FIRST = {"zh", "zh-TW", "pt", "es", "ar"}
    for m in re.finditer(r"<url>(.*?)</url>", raw, re.S):
        body = m.group(1)
        loc = re.search(r"<loc>(.*?)</loc>", body)
        if not loc:
            continue
        url = loc.group(1)
        app_path = url.replace(SITE, "") or "/"
        # 幂等：跳过语言版本块（首段为语言段的 /zh/xxx /pt/xxx 等）
        first = app_path.strip("/").split("/")[0] if app_path != "/" else ""
        if first in LANG_FIRST:
            continue
        lm = re.search(r"<lastmod>(.*?)</lastmod>", body)
        cf = re.search(r"<changefreq>(.*?)</changefreq>", body)
        pr = re.search(r"<priority>(.*?)</priority>", body)
        blocks.append(
            {
                "app_path": app_path,
                "lastmod": lm.group(1) if lm else "2026-09-01",
                "changefreq": cf.group(1) if cf else "monthly",
                "priority": pr.group(1) if pr else "0.8",
            }
        )
    return blocks


def localized_url(app_path: str, seg: str) -> str:
    """语言版本 URL 路径（与 buildLocalizedPath 对齐）。"""
    if seg == EN:
        return "/" if app_path == "/" else app_path
    prefix = SEG_TO_PREFIX[seg]
    if app_path == "/":
        return f"{prefix}/"
    return f"{prefix}{app_path}"


def hreflang_links(app_path: str) -> str:
    """6 语言互指 + x-default（x-default 指 en）。"""
    lines = []
    for seg in [EN, *SEGMENTS]:
        href = f"{SITE}{localized_url(app_path, seg)}"
        lines.append(f'    <xhtml:link rel="alternate" hreflang="{seg}" href="{href}" />')
    xdefault = f"{SITE}{localized_url(app_path, EN)}"
    lines.append(f'    <xhtml:link rel="alternate" hreflang="x-default" href="{xdefault}" />')
    return "\n".join(lines)


def main() -> int:
    blocks = parse_existing()
    existing = {b["app_path"] for b in blocks}
    print(f"现有 en <url> 块: {len(blocks)}")

    # 子集 = 静态 6 个 + 10 genre（sitemap 里全部 /genre/）+ 12 HowTo
    genres = {b["app_path"] for b in blocks if b["app_path"].startswith("/genre/")}
    howtos = {f"/blog/{s}" for s in howto_slugs()}
    subset = STATIC_SUBSET | genres | howtos
    # 防御：子集必须都能在现有 sitemap 找到 en 版（否则说明数据不同步）
    missing = subset - existing
    if missing:
        print(f"❌ 子集路径在现有 sitemap 中找不到 en 版: {sorted(missing)}")
        return 1
    non_subset = existing - subset
    print(f"子集（多语言 6 版）: {len(subset)} 个")
    print(f"非子集（保持 en）: {len(non_subset)} 个")

    # 构建新 <url> 块
    url_blocks: list[str] = []
    for app_path in sorted(subset):
        # 语言版本顺序：en 开头，随后 zh-TW/zh/pt/es/ar
        for seg in [EN, *SEGMENTS]:
            url = f"{SITE}{localized_url(app_path, seg)}"
            meta = next(b for b in blocks if b["app_path"] == app_path)
            url_blocks.append(
                f"  <url>\n"
                f"    <loc>{url}</loc>\n"
                f"    <lastmod>{meta['lastmod']}</lastmod>\n"
                f"    <changefreq>{meta['changefreq']}</changefreq>\n"
                f"    <priority>{meta['priority']}</priority>\n"
                f"{hreflang_links(app_path)}\n"
                f"  </url>"
            )
    for app_path in sorted(non_subset):
        meta = next(b for b in blocks if b["app_path"] == app_path)
        url = f"{SITE}{app_path}"
        url_blocks.append(
            f"  <url>\n"
            f"    <loc>{url}</loc>\n"
            f"    <lastmod>{meta['lastmod']}</lastmod>\n"
            f"    <changefreq>{meta['changefreq']}</changefreq>\n"
            f"    <priority>{meta['priority']}</priority>\n"
            f'    <xhtml:link rel="alternate" hreflang="en" href="{url}" />\n'
            f'    <xhtml:link rel="alternate" hreflang="x-default" href="{url}" />\n'
            f"  </url>"
        )

    header = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n'
    )
    content = header + "\n\n".join(url_blocks) + "\n\n</urlset>\n"

    # CRLF 保真写回（项目数据文件全 CRLF）
    _, eol = read_text_preserve_eol(SITEMAP)
    with SITEMAP.open("w", encoding="utf-8", newline="") as f:
        f.write(content.replace("\n", eol))
    print(f"✅ 已写回 {SITEMAP.name}（行尾 {'CRLF' if eol == chr(13)+chr(10) else 'LF'}）")

    # 校验
    new_count = content.count("<url>")
    expect = len(subset) * 6 + len(non_subset)
    print(f"<url> 条数: {new_count}（期望 {expect}）")
    if new_count != expect:
        print("❌ 条数不符，abort")
        return 1
    # 裸 LF 校验
    raw_bytes = SITEMAP.read_bytes()
    bare_lf = raw_bytes.count(b"\n") - raw_bytes.count(b"\r\n")
    if bare_lf:
        print(f"❌ 裸 LF {bare_lf} 个（CRLF 保真失败）")
        return 1
    print("✅ CRLF 保真，无裸 LF")
    print("ALL DONE")
    return 0


if __name__ == "__main__":
    sys.exit(main())
