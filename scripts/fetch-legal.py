# -*- coding: utf-8 -*-
"""
抓取官网法律正文（用户协议 / 隐私政策）并生成本地 fallback 模块。

背景
----
LegalDocumentPage 原本在客户端 mount 后才请求 /sqx_fast/app/common/type/{154,155}，
导致预渲染 HTML 里只有一个 "Loading..."，Google 首屏抓不到任何正文（SEO 报告
「内容不足」：privacy 522 字符 / terms 526 字符）。

方案
----
构建期把正文抓下来、按白名单净化（防 XSS），写入 src/app/data/legalContent.ts。
组件以该常量作为 useState 初始值 —— SSR 直接渲染出完整正文，客户端 mount 后
再请求接口覆盖为最新版本。

注意
----
- 后端当前忽略 Accept-Language（6 语言均返回同一英文正文），故只抓一次。
- 净化在构建期完成，运行环境无需 DOMParser，SSR 也不会因缺 DOM 而崩溃。
- 生成文件为 CRLF（与项目其余数据文件一致）。

用法
----
    python scripts/fetch-legal.py            # 抓取并写入
    python scripts/fetch-legal.py --offline  # 不联网，仅校验现有文件
"""
from __future__ import annotations

import argparse
import io
import json
import os
import re
import sys
import urllib.request
from html.parser import HTMLParser

API = "https://www.testshort.top/sqx_fast/app/common/type/{type}"
OUT = "src/app/data/legalContent.ts"

# 与前端 AGREEMENT_HTML_TAGS 白名单保持一致
ALLOWED_TAGS = {
    "a", "b", "blockquote", "br", "em", "h1", "h2", "h3", "h4",
    "i", "li", "ol", "p", "strong", "u", "ul",
}
VOID_TAGS = {"br"}
HEADER = """/**
 * 法律正文 fallback（构建期生成，勿手改）
 * ------------------------------------------------------------------
 * 由 scripts/fetch-legal.py 从配置中心 /app/common/type/{154,155} 抓取，
 * 并按白名单净化（仅保留排版标签、剥离全部属性，a[href] 除外）。
 *
 * 用途：LegalDocumentPage 用它作为 useState 初始值，让 SSR / 预渲染 HTML
 * 直接包含完整正文（此前只有一个 Loading 占位，搜索引擎首屏抓不到内容）。
 * 客户端 mount 后仍会请求接口，拿到新版本后覆盖。
 *
 * 后端目前忽略 Accept-Language（各语言返回同一英文正文），故全文仅一份。
 * 需要刷新时执行：python scripts/fetch-legal.py
 */

export const legalFallback: Record<"terms" | "privacy", string> = {
"""


class Sanitizer(HTMLParser):
    """按白名单净化富文本：剥离注释 / script / style / 未知标签，只留纯排版结构。"""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.out: list[str] = []
        self.stack: list[str] = []

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag in ("script", "style"):
            self.stack.append(tag)
            return
        if tag not in ALLOWED_TAGS:
            return
        attr_str = ""
        if tag == "a":
            href = dict(attrs).get("href", "")
            if re.match(r"^(https?:|mailto:)", href.strip(), re.I):
                attr_str = ' target="_blank" rel="noreferrer"'
        self.out.append(f"<{tag}{attr_str}>")
        if tag not in VOID_TAGS:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in ("script", "style"):
            if tag in self.stack:
                self.stack.remove(tag)
            return
        if tag not in ALLOWED_TAGS:
            return
        if tag in self.stack:
            # 闭合到该标签（容忍不规范的嵌套）
            while self.stack and self.stack.pop() != tag:
                pass
            self.out.append(f"</{tag}>")

    def handle_data(self, data):
        if "script" in self.stack or "style" in self.stack:
            return
        self.out.append(data)

    def result(self) -> str:
        for tag in reversed(self.stack):
            if tag in ALLOWED_TAGS and tag not in VOID_TAGS:
                self.out.append(f"</{tag}>")
        return "".join(self.out).strip()


def sanitize(html: str) -> str:
    p = Sanitizer()
    p.feed(html)
    p.close()
    text = p.result()
    # 压缩连续空行（<p><br></p> 之类）造成的冗余
    text = re.sub(r"(?:<p>\s*</p>|<p><br></p>|<p>\s*<br>\s*</p>)+", "<p><br></p>", text)
    return text


def fetch(common_type: int) -> str:
    req = urllib.request.Request(
        API.format(type=common_type),
        headers={"Accept-Language": "en", "User-Agent": "lollipop-build/1.0"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        payload = json.loads(resp.read().decode("utf-8"))
    return (payload.get("data") or {}).get("value", "") or ""


def ts_escape(s: str) -> str:
    """转成 TS 模板字面量安全内容。"""
    return s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--offline", action="store_true", help="不联网，仅校验现有文件")
    args = ap.parse_args()

    docs: dict[str, str] = {}
    if args.offline:
        if not os.path.exists(OUT):
            print(f"[FAIL] {OUT} 不存在，无法离线校验")
            return 1
        print(f"[skip] 离线模式，仅校验 {OUT}")
    else:
        for kind, ctype in (("terms", 154), ("privacy", 155)):
            raw = fetch(ctype)
            if not raw:
                print(f"[FAIL] type={ctype} 返回空正文")
                return 1
            clean = sanitize(raw)
            docs[kind] = clean
            print(f"[ok] type={ctype} ({kind}) raw={len(raw)} sanitized={len(clean)}")

        body = "".join(
            f'  {k}: `{ts_escape(v)}`,\n' if "\n" not in v else
            f"  {k}:\n    `{ts_escape(v)}`,\n"
            for k, v in docs.items()
        )
        content = HEADER + body + "};\n"
        with io.open(OUT, "w", encoding="utf-8", newline="\r\n") as f:
            f.write(content)
        print(f"[ok] 写入 {OUT} ({len(content)} bytes)")

    # 校验
    with io.open(OUT, encoding="utf-8", newline="") as f:
        src = f.read()
    bare_lf = src.replace("\r\n", "").count("\n")
    print(f"[check] 裸 LF 数量（应为 0）: {bare_lf}")
    for bad in ("<script", "<iframe", "onerror=", "javascript:"):
        if bad in src.lower():
            print(f"[FAIL] 净化不彻底，残留 {bad}")
            return 1
    print("[check] 危险标签/属性：无")
    return 0 if bare_lf == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
