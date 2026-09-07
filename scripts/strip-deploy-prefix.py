"""剥离 /lollipop 部署前缀（根部署迁移，2026-09-05）。

背景：生产环境 www.lollipop.im 把 dist 部署在网站根目录，真实可索引 URL 是
      https://www.lollipop.im/about
但构建产物里 canonical / sitemap / hreflang / og:url / JSON-LD / llms / robots
全部硬编码了 https://www.lollipop.im/lollipop/... 前缀，导致 sitemap 里 298 条
URL 100% 被 SPA 兜底成首页壳 → GSC 525 个页面未编入索引。

规则：https://www.lollipop.im/lollipop → https://www.lollipop.im
      （后面无论跟 /xxx、`、`"、}、空白、行尾都安全，因为 /lollipop 在此只作部署前缀出现）

⚠️ 幂等：二次运行无匹配即无副作用。
⚠️ CRLF 保真：项目数据文件全 CRLF，必须用 newline="" 读写。
"""
import argparse
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

RULE = re.compile(r"https://www\.lollipop\.im/lollipop")

# 只处理这些扩展名
EXTS = {".ts", ".tsx", ".txt", ".py", ".mjs", ".json", ".html", ".xml"}

# 排除目录（按名称匹配）：构建产物 / 依赖 / 历史产物包 / 归档报告
EXCLUDE_DIRS = {
    "node_modules", "dist", ".git", "packages", ".workbuddy", "docs",
    "tests", "seo-audit-report", "language-routing-guide", ".tmp",
}

# 排除目录（按相对路径精确匹配，只排除项目根级的那一个）。
# ⚠️ 这里必须按路径排除：项目根的 data/ 是 GEO 采集数据，而 src/app/data/ 是源码，
#    曾经把 "data" 放进 EXCLUDE_DIRS 导致 src/app/data/blogContent.ts（52 处前缀）漏改。
EXCLUDE_REL_DIRS = {"data"}


def walk():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        rel_dir = os.path.relpath(dirpath, ROOT)
        dirnames[:] = [
            d for d in dirnames
            if d not in EXCLUDE_DIRS
            and (rel_dir != "." or d not in EXCLUDE_REL_DIRS)
        ]
        for fn in filenames:
            if os.path.splitext(fn)[1] not in EXTS:
                continue
            if fn in EXCLUDE_FILES:
                continue
            yield os.path.join(dirpath, fn)

# 排除文件：历史一次性脚本（保留其文档价值）+ 本脚本自身
EXCLUDE_FILES = {
    "add-deploy-prefix.py",   # 记录 2026-09-01 加前缀的操作，保留原样
    "strip-deploy-prefix.py",
    "update-sitemap-guides-merge.py",  # 已归档的 /guides 迁移脚本
    "verify-blog.py",         # 需手工改校验语义，不参与批量替换
    "probe-live.py",
    "xlsx-dump.py",
}


def walk():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for fn in filenames:
            if os.path.splitext(fn)[1] not in EXTS:
                continue
            if fn in EXCLUDE_FILES:
                continue
            yield os.path.join(dirpath, fn)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="真正写入（默认 dry-run）")
    a = ap.parse_args()

    total_files, total_hits = 0, 0
    skipped = []
    changed = []
    for fp in sorted(walk()):
        try:
            with io.open(fp, encoding="utf-8", newline="") as f:
                src = f.read()
        except (UnicodeDecodeError, OSError):
            skipped.append(os.path.relpath(fp, ROOT).replace("\\", "/"))
            continue
        n = len(RULE.findall(src))
        if not n:
            continue
        total_files += 1
        total_hits += n
        rel = os.path.relpath(fp, ROOT).replace("\\", "/")
        changed.append((rel, n))
        if a.apply:
            out = RULE.sub("https://www.lollipop.im", src)
            with io.open(fp, "w", encoding="utf-8", newline="") as f:
                f.write(out)

    for rel, n in changed:
        print(f"  {n:>4}  {rel}")
    print()
    if skipped:
        print(f"（跳过 {len(skipped)} 个非 UTF-8 文件，无需处理）")
    print(f"合计 {total_files} 个文件 / {total_hits} 处"
          f"{'（已写入）' if a.apply else '（dry-run，未写入）'}")
    if not a.apply and total_hits:
        print("\n确认无误后加 --apply 执行")


if __name__ == "__main__":
    main()
