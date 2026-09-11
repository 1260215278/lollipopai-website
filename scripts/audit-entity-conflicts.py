#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
audit-entity-conflicts.py
=========================
扫描 dist/**/*.html 内所有 JSON-LD，审计实体定义冲突：
  1. Organization 节点重复定义（有 @id / 无 @id）
  2. sameAs 字段的用法（是否指向站内自引 —— 反模式）
  3. 评价信号残留（Review / AggregateRating / ratingValue / ratingCount / reviewCount）
  4. 站点级 Organization 必填字段覆盖率

用法:
    python scripts/audit-entity-conflicts.py
"""

from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"

LD_RE = re.compile(
    r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(?P<body>.*?)</script>',
    re.IGNORECASE | re.DOTALL,
)

RATING_KEYS = {
    "aggregateRating", "ratingValue", "ratingCount", "reviewCount",
    "bestRating", "worstRating", "reviewRating", "reviews",
}

CANON_ORG_ID = "https://www.lollipop.im/#organization"


def walk_nodes(obj, path="$"):
    """递归产出 (path, node_dict)"""
    if isinstance(obj, dict):
        yield path, obj
        for k, v in obj.items():
            if isinstance(v, (dict, list)):
                yield from walk_nodes(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            if isinstance(v, (dict, list)):
                yield from walk_nodes(v, f"{path}[{i}]")


def node_type(n: dict):
    t = n.get("@type")
    if isinstance(t, list):
        return t
    return t


def main():
    if not DIST.exists():
        print(f"[FATAL] 无 dist: {DIST}", file=sys.stderr)
        sys.exit(1)

    files = sorted(DIST.rglob("*.html"))
    print("=" * 94)
    print("板块 2/3 · JSON-LD 实体冲突 + 评价信号残留审计")
    print("=" * 94)
    print(f"扫描 {len(files)} 个 HTML\n")

    org_nodes = defaultdict(lambda: {"count": 0, "pages": set(), "with_id": 0, "fields": set()})
    rating_hits = defaultdict(lambda: {"count": 0, "pages": set(), "keys": set()})
    sameas_values = defaultdict(lambda: {"count": 0, "pages": set(), "on_type": set()})
    site_org_fields = set()
    site_org_pages = 0
    type_counter = defaultdict(int)
    page_org_count = defaultdict(int)
    ld_blocks = 0
    ld_errors = []

    for f in files:
        rel = f.relative_to(DIST).as_posix()
        try:
            html = f.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        page_orgs = 0
        for m in LD_RE.finditer(html):
            body = m.group("body").strip()
            if not body:
                continue
            ld_blocks += 1
            try:
                data = json.loads(body)
            except Exception as e:
                ld_errors.append((rel, str(e)[:100]))
                continue

            for path, node in walk_nodes(data):
                if not isinstance(node, dict):
                    continue
                t = node_type(node)
                tset = t if isinstance(t, list) else ([t] if t else [])
                for tt in tset:
                    type_counter[tt] += 1

                # --- Organization ---
                if "Organization" in tset:
                    page_orgs += 1
                    nid = node.get("@id")
                    key = f"@id={nid}" if nid else f"(无 @id) name={node.get('name')!r}"
                    rec = org_nodes[key]
                    rec["count"] += 1
                    rec["pages"].add(rel)
                    if nid:
                        rec["with_id"] += 1
                    rec["fields"].update(k for k in node.keys() if not k.startswith("@"))
                    if nid == CANON_ORG_ID:
                        site_org_fields.update(k for k in node.keys())
                        site_org_pages += 1

                # --- 评价信号 ---
                for rk in RATING_KEYS:
                    if rk in node:
                        h = rating_hits[rk]
                        h["count"] += 1
                        h["pages"].add(rel)
                        h["keys"].add(",".join(tset) or node.get("@type", "?"))

                # --- sameAs ---
                if "sameAs" in node:
                    v = node["sameAs"]
                    vals = v if isinstance(v, list) else [v]
                    for one in vals:
                        s = sameas_values[str(one)]
                        s["count"] += 1
                        s["pages"].add(rel)
                        s["on_type"].add(",".join(tset) or "?")
        if page_orgs:
            page_org_count[page_orgs] += 1

    # ---------------- 报告 ----------------
    print("-" * 94)
    print("【1】Organization 节点定义统计（重复实体检测）")
    print("-" * 94)
    total_org = sum(r["count"] for r in org_nodes.values())
    print(f"全站 Organization 节点总数: {total_org}（跨 {sum(len(r['pages']) for r in org_nodes.values())} 页次）\n")
    for key, r in sorted(org_nodes.items(), key=lambda x: -x[1]["count"]):
        flag = "✅ 有 @id（可合并）" if not key.startswith("(无 @id)") else "❌ 无 @id（独立实体，无法合并）"
        print(f"  {key}")
        print(f"      出现 {r['count']} 次 / {len(r['pages'])} 页   {flag}")
        print(f"      字段: {', '.join(sorted(r['fields'])) or '(仅 @id)'}")
        print(f"      示例页: {sorted(r['pages'])[0]}")
        print()
    print("  每页 Organization 节点数分布：")
    for k in sorted(page_org_count):
        print(f"      {k} 个/页 → {page_org_count[k]} 页")
    print()

    print("-" * 94)
    print("【2】sameAs 用法审计")
    print("-" * 94)
    if not sameas_values:
        print("  （无 sameAs）")
    for v, s in sorted(sameas_values.items(), key=lambda x: -x[1]["count"]):
        internal = "lollipop.im" in v
        tag = "❌ 站内自引（反模式：sameAs 应指向外部权威档案）" if internal else "✅ 外部档案"
        print(f"  {v[:88]}")
        print(f"      {s['count']} 次 / {len(s['pages'])} 页 | 挂靠类型: {', '.join(sorted(s['on_type']))} | {tag}")
    print()

    print("-" * 94)
    print("【3】评价信号残留扫描（Review / AggregateRating / ratingValue / ratingCount / reviewCount）")
    print("-" * 94)
    if not rating_hits:
        print("  ✅ dist 全站 0 处评价类 schema 字段残留")
    else:
        for k, h in sorted(rating_hits.items(), key=lambda x: -x[1]["count"]):
            print(f"  ❌ {k}: {h['count']} 次 / {len(h['pages'])} 页 | 挂靠: {', '.join(sorted(h['keys']))}")
            print(f"      示例: {sorted(h['pages'])[0]}")
    print()

    print("-" * 94)
    print("【4】站点级 Organization（@id = #organization）字段覆盖")
    print("-" * 94)
    print(f"  出现在 {site_org_pages} 个页面")
    REQUIRED = [
        "name", "url", "logo", "image", "sameAs", "foundingDate", "founder",
        "foundingLocation", "address", "telephone", "email", "contactPoint",
        "legalName", "alternateName", "knowsAbout", "areaServed", "slogan",
        "description", "numberOfEmployees", "award", "memberOf",
    ]
    print(f"  {'字段':<20}{'状态':<8}")
    for k in REQUIRED:
        has = k in site_org_fields
        star = "★" if k in ("sameAs", "legalName", "alternateName", "foundingDate", "address", "telephone") else " "
        print(f"  {star}{k:<19}{'✅ 有' if has else '❌ 缺失':<8}")
    print(f"\n  实际字段: {', '.join(sorted(site_org_fields))}")
    print()

    print("-" * 94)
    print("【5】JSON-LD 解析健康度")
    print("-" * 94)
    print(f"  ld+json 块总数: {ld_blocks}")
    print(f"  解析失败: {len(ld_errors)}")
    for rel, e in ld_errors[:10]:
        print(f"      ❌ {rel}: {e}")
    print()

    print("-" * 94)
    print("【6】全站 schema 类型 Top 20")
    print("-" * 94)
    for t, c in sorted(type_counter.items(), key=lambda x: -x[1])[:20]:
        print(f"      {str(t):<40} {c:>6}")
    print("=" * 94)


if __name__ == "__main__":
    main()
