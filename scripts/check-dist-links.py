#!/usr/bin/env python3
"""
dist 内部引用自洽性检查 —— 区分「构建坏了」和「服务根目录指错了」。

背景
----
2026-09-01：浏览器控制台刷了 11 条 404（index-*.js + 各 vendor chunk + favicon-32.png）。
扫描后确认 dist 内部 100% 自洽，真正原因是预览服务的文档根目录没有指向 dist。

用法
----
    python scripts/check-dist-links.py            # 检查 ./dist
    python scripts/check-dist-links.py path/to/d  # 指定目录

判定
----
  [资源缺失] > 0  → 构建 / 预渲染有问题（查 prerender 的 asset map、public/ 是否漏文件）
  [资源缺失] == 0 → 构建健康，404 出在服务端根目录，用
                    `node node_modules/vite/bin/vite.js preview --outDir dist` 起对照服务
  [悬挂内链] > 0  → 页面里有指向不存在路由的 <a>，SEO 死链，必须修
"""
import re
import sys
import pathlib

# 有独立目录的路由段（新增内容区时在此登记）
ROUTE_SEGMENTS = ("genre", "drama", "region", "blog", "guides")


def main() -> int:
    dist = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
    if not dist.is_dir():
        print(f"目录不存在：{dist}")
        return 2

    htmls = sorted(dist.rglob("*.html"))
    have = {
        seg: {p.name for p in (dist / seg).iterdir() if p.is_dir()}
        for seg in ROUTE_SEGMENTS
        if (dist / seg).is_dir()
    }

    missing: dict[str, set[str]] = {}
    dangling: dict[str, set[str]] = {}
    refs = 0

    for h in htmls:
        rel = str(h.relative_to(dist))
        s = h.read_text(encoding="utf-8", errors="ignore")

        # 1. 静态资源引用（src/href 里的站内绝对路径）
        for m in re.finditer(r'(?:src|href)="(/[^"#?]+)"', s):
            u = m.group(1).split("?")[0].split("#")[0]
            if u.startswith("//") or u.startswith("http"):
                continue
            refs += 1
            if not (dist / u.lstrip("/")).exists():
                missing.setdefault(u, set()).add(rel)

        # 2. 站内路由内链
        alt = "|".join(have)
        for m in re.finditer(rf'href="/({alt})/([a-z0-9\-]+)"', s):
            kind, slug = m.group(1), m.group(2)
            if slug not in have[kind]:
                dangling.setdefault(f"/{kind}/{slug}", set()).add(rel)

    print(f"扫描 {len(htmls)} 个 HTML / {refs} 个站内绝对路径引用")

    print(f"\n[资源缺失] {len(missing)} 个")
    for u, hs in sorted(missing.items())[:20]:
        print(f"   {u}   <- {len(hs)} 处，例：{sorted(hs)[0]}")
    if not missing:
        print("   (无)  构建产物自洽")

    print(f"\n[悬挂内链] {len(dangling)} 个")
    for u, hs in sorted(dangling.items())[:20]:
        print(f"   {u}   <- {len(hs)} 处，例：{sorted(hs)[0]}")
    if not dangling:
        print("   (无)")

    ok = not missing and not dangling
    print("\n" + ("RESULT: ALL PASSED" if ok else "RESULT: FAILED"))
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
