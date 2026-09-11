#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
audit-authority-outbound.py
===========================
全站出站外链（权威外链）盘点 + 权威性分级 + rel 属性审计

用法:
    python scripts/audit-authority-outbound.py            # 扫描 dist/
    python scripts/audit-authority-outbound.py --json     # 额外输出 JSON

输出:
    1. 按 hostname 归一化的出站域名聚合（次数 / 覆盖页面数 / 示例页面）
    2. 权威性 Tier 1/2/3 分级
    3. rel 属性（nofollow / sponsored / ugc / external）审计
    4. 站外引用构成结论
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Set
from urllib.parse import urlparse

# --------------------------------------------------------------------------
# 配置
# --------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"

# 自有域名（出站统计时排除）
OWN_HOSTS = {
    "lollipop.im",
    "www.lollipop.im",
    "localhost",
    "127.0.0.1",
}

# 非内容性标签/协议，不算"权威引用"
IGNORE_SCHEMES = {"mailto", "tel", "javascript", "data", "sms", "whatsapp", "#"}

# <a href=...> 提取（含 rel 属性）
A_TAG_RE = re.compile(
    r"<a\b(?P<attrs>[^>]*)>",
    re.IGNORECASE | re.DOTALL,
)
HREF_RE = re.compile(r"""href\s*=\s*["'](?P<href>[^"']+)["']""", re.IGNORECASE)
REL_RE = re.compile(r"""rel\s*=\s*["'](?P<rel>[^"']+)["']""", re.IGNORECASE)

# <link href=...>（含 preconnect / dns-prefetch / canonical / alternate）
LINK_TAG_RE = re.compile(r"<link\b(?P<attrs>[^>]*?)/?>", re.IGNORECASE | re.DOTALL)

# <script src=...> / <img src=...>（资源型外链，单独归类，不算权威引用）
SCRIPT_SRC_RE = re.compile(r"""<script[^>]+src\s*=\s*["'](?P<src>[^"']+)["']""", re.IGNORECASE)
IMG_SRC_RE = re.compile(r"""<img[^>]+src\s*=\s*["'](?P<src>[^"']+)["']""", re.IGNORECASE)


# --------------------------------------------------------------------------
# 权威性分级规则
# --------------------------------------------------------------------------

TIER1_HOSTS = {
    # 政府 / 监管
    "gov.sg", "usa.gov", "europa.eu", "ftc.gov", "sec.gov", "ftc.gov",
    # 国际标准 / 学术
    "iso.org", "ietf.org", "w3.org", "nist.gov", "ieee.org", "acm.org",
    "arxiv.org", "doi.org", "nature.com", "science.org", "sciencedirect.com",
    # 认证机构 / 非营利组织
    "trustarc.com", "bbb.org", "icann.org", "wikidata.org",
}

TIER2_HOSTS = {
    # 百科 / 知识图谱
    "wikipedia.org", "en.wikipedia.org", "wikidata.org", "britannica.com",
    # 大厂官方文档
    "openai.com", "developers.google.com", "developer.apple.com", "apple.com",
    "developer.android.com", "android.com", "cloud.google.com", "ai.google.dev",
    "runwayml.com", "docs.runwayml.com", "help.runwayml.com", "stability.ai",
    "anthropic.com", "microsoft.com", "learn.microsoft.com", "aws.amazon.com",
    "huggingface.co", "github.com", "pytorch.org",
    # 应用商店 / 权威评分平台
    "apps.apple.com", "itunes.apple.com", "play.google.com", "appstore.com",
    "producthunt.com", "g2.com", "trustpilot.com", "capterra.com", "getapp.com",
    "sensortower.com", "appfigures.com",
    # 权威媒体
    "techcrunch.com", "theverge.com", "wired.com", "forbes.com", "bloomberg.com",
    "reuters.com", "variety.com", "hollywoodreporter.com", "deadline.com",
    "screendaily.com", "businessinsider.com", "thenewyorktimes.com",
    "cnbc.com", "statista.com", "grandviewresearch.com", "mordorintelligence.com",
    # 社媒官方档案（作为 sameAs 时是强信号，作为普通外链是中信号）
    "twitter.com", "x.com", "youtube.com", "instagram.com", "tiktok.com",
    "facebook.com", "linkedin.com", "medium.com",
}

# 明确的应用商店（单独识别，判断是否"被商店链接垄断"）
APP_STORE_HOSTS = {"apps.apple.com", "itunes.apple.com", "play.google.com", "appstore.com"}

# 第三方评价 / UGC 平台（板块 3 关注）
UGC_HOSTS = {
    "trustpilot.com", "g2.com", "capterra.com", "producthunt.com",
    "apps.apple.com", "play.google.com", "judge.me", "yotpo.com",
    "reviews.io", "sitejabber.com", "google.com",
}


def norm_host(host: str) -> str:
    """归一化 hostname：小写 + 去 www."""
    host = (host or "").lower().strip()
    if host.startswith("www."):
        host = host[4:]
    return host


def tier_of(host: str) -> int:
    h = norm_host(host)
    if h in TIER1_HOSTS:
        return 1
    parts = h.split(".")
    tld = parts[-1] if parts else ""
    if tld in {"gov", "edu", "int", "mil"}:
        return 1
    if len(parts) >= 2 and parts[-2:] == ["gov", "sg"]:
        return 1
    if h in TIER2_HOSTS:
        return 2
    return 3


def is_ugc_platform(host: str) -> bool:
    h = norm_host(host)
    return h in UGC_HOSTS or any(h.endswith(x) for x in (".g2.com", ".trustpilot.com"))


# --------------------------------------------------------------------------
# 数据结构
# --------------------------------------------------------------------------

@dataclass
class DomainStat:
    host: str
    count: int = 0
    pages: Set[str] = field(default_factory=set)
    rels: Dict[str, int] = field(default_factory=lambda: defaultdict(int))
    sample_urls: Set[str] = field(default_factory=set)
    kinds: Set[str] = field(default_factory=set)  # a / link / script / img

    @property
    def tier(self) -> int:
        return tier_of(self.host)


# --------------------------------------------------------------------------
# 扫描
# --------------------------------------------------------------------------

def iter_html(dist: Path):
    for p in sorted(dist.rglob("*.html")):
        yield p


def classify_url(raw: str, page_rel: str) -> tuple[str, str] | None:
    """返回 (hostname, full_url) 或 None（非站外 / 非 http）"""
    if not raw:
        return None
    raw = raw.strip()
    if raw.startswith("#") or raw.startswith("//") and False:
        return None
    low = raw.lower()
    for s in IGNORE_SCHEMES:
        if low.startswith(s + ":") or (s == "#" and low.startswith("#")):
            return None
    if raw.startswith("//"):
        raw = "https:" + raw
    if not raw.lower().startswith(("http://", "https://")):
        return None  # 相对路径 → 站内
    try:
        u = urlparse(raw)
    except Exception:
        return None
    if not u.hostname:
        return None
    host = norm_host(u.hostname)
    if not host or host in OWN_HOSTS:
        return None
    return host, raw


def scan(dist: Path):
    stats: Dict[str, DomainStat] = {}
    rel_total = defaultdict(int)
    total_outbound = 0
    page_with_outbound = 0
    page_count = 0

    for path in iter_html(dist):
        page_count += 1
        try:
            html = path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        page_rel = path.relative_to(dist).as_posix()
        page_hits = 0

        def record(host: str, url: str, kind: str, rel: str | None = None):
            nonlocal page_hits
            st = stats.get(host)
            if st is None:
                st = stats[host] = DomainStat(host=host)
            st.count += 1
            st.pages.add(page_rel)
            st.kinds.add(kind)
            if len(st.sample_urls) < 3:
                st.sample_urls.add(url[:160])
            if rel:
                for tok in rel.lower().split():
                    st.rels[tok] += 1
                    rel_total[tok] += 1
            if kind == "a":
                page_hits += 1

        # ---- <a href> ----
        for m in A_TAG_RE.finditer(html):
            attrs = m.group("attrs")
            hm = HREF_RE.search(attrs)
            if not hm:
                continue
            rm = REL_RE.search(attrs)
            r = classify_url(hm.group("href"), page_rel)
            if r:
                record(r[0], r[1], "a", rm.group("rel") if rm else None)

        # ---- <link href> ----
        for m in LINK_TAG_RE.finditer(html):
            attrs = m.group("attrs")
            hm = HREF_RE.search(attrs)
            if not hm:
                continue
            rm = REL_RE.search(attrs)
            r = classify_url(hm.group("href"), page_rel)
            if r:
                # preconnect / dns-prefetch 是性能优化，不是引用，单独标 kind
                relv = (rm.group("rel") if rm else "").lower()
                kind = "link-perf" if any(k in relv for k in ("preconnect", "dns-prefetch", "preload")) else "link"
                record(r[0], r[1], kind, relv or None)

        # ---- <script src> ----
        for m in SCRIPT_SRC_RE.finditer(html):
            r = classify_url(m.group("src"), page_rel)
            if r:
                record(r[0], r[1], "script")

        # ---- <img src> ----
        for m in IMG_SRC_RE.finditer(html):
            r = classify_url(m.group("src"), page_rel)
            if r:
                record(r[0], r[1], "img")

        total_outbound += page_hits
        if page_hits:
            page_with_outbound += 1

    return stats, rel_total, total_outbound, page_with_outbound, page_count


# --------------------------------------------------------------------------
# 报告
# --------------------------------------------------------------------------

def bar(n: int, total: int, width: int = 28) -> str:
    if total <= 0:
        return ""
    f = int(round(n / total * width))
    return "█" * f + "·" * (width - f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true", help="额外输出 JSON 到 scripts/out/")
    args = ap.parse_args()

    if not DIST.exists():
        print(f"[FATAL] 找不到 dist 目录: {DIST}", file=sys.stderr)
        sys.exit(1)

    stats, rel_total, total_outbound, page_with_outbound, page_count = scan(DIST)

    print("=" * 96)
    print("板块 1 · 全站出站外链（权威外链）盘点")
    print("=" * 96)
    print(f"扫描目录    : {DIST}")
    print(f"HTML 页面数 : {page_count}")
    print(f"含站外链接页: {page_with_outbound}  ({page_with_outbound / max(page_count,1) * 100:.1f}%)")
    print(f"站外 <a> 总数: {total_outbound}")
    print()

    # 只统计"引用型"外链（a + link），排除资源型（script/img/link-perf）
    cite_kinds = {"a", "link"}
    cite_stats = {h: s for h, s in stats.items() if s.kinds & cite_kinds}
    cite_total = sum(s.count for s in cite_stats.values())

    rows = sorted(cite_stats.values(), key=lambda s: (-s.count, s.host))

    print("-" * 96)
    print(f"【A】引用型外链域名聚合（共 {len(rows)} 个域名 / {cite_total} 处）")
    print("-" * 96)
    print(f"{'域名':<38}{'次数':>6}{'页面':>6}  {'Tier':<5}{'rel 标记':<22}示例页面")
    print("-" * 96)
    for s in rows:
        rels = ",".join(f"{k}×{v}" for k, v in sorted(s.rels.items(), key=lambda x: -x[1])) or "—"
        sample = sorted(s.pages)[0][:44] if s.pages else ""
        print(f"{s.host:<38}{s.count:>6}{len(s.pages):>6}  T{s.tier:<4}{rels:<22}{sample}")
    print()

    # Tier 分布
    t1 = [s for s in rows if s.tier == 1]
    t2 = [s for s in rows if s.tier == 2]
    t3 = [s for s in rows if s.tier == 3]
    c1 = sum(s.count for s in t1)
    c2 = sum(s.count for s in t2)
    c3 = sum(s.count for s in t3)

    print("-" * 96)
    print("【B】权威性分级")
    print("-" * 96)
    print(f"Tier 1（政府/监管/标准/学术/认证）: {len(t1):>3} 个域名, {c1:>5} 处  {c1/max(cite_total,1)*100:5.1f}%  {bar(c1, cite_total)}")
    for s in sorted(t1, key=lambda x: -x.count):
        print(f"      · {s.host:<40} {s.count:>4} 处 / {len(s.pages)} 页")
    print(f"Tier 2（大厂官方/百科/权威媒体/商店/评台）: {len(t2)} 个域名, {c2:>5} 处  {c2/max(cite_total,1)*100:5.1f}%  {bar(c2, cite_total)}")
    for s in sorted(t2, key=lambda x: -x.count):
        print(f"      · {s.host:<40} {s.count:>4} 处 / {len(s.pages)} 页")
    print(f"Tier 3（其他第三方）            : {len(t3):>3} 个域名, {c3:>5} 处  {c3/max(cite_total,1)*100:5.1f}%  {bar(c3, cite_total)}")
    for s in sorted(t3, key=lambda x: -x.count)[:20]:
        print(f"      · {s.host:<40} {s.count:>4} 处 / {len(s.pages)} 页")
    print()

    # 应用商店垄断度
    print("-" * 96)
    print("【C】应用商店垄断度检测（弱信号风险）")
    print("-" * 96)
    store = [s for s in rows if s.host in APP_STORE_HOSTS]
    store_c = sum(s.count for s in store)
    store_nofollow = sum(v for s in store for k, v in s.rels.items() if k == "nofollow")
    print(f"应用商店外链: {store_c} 处（{store_c/max(cite_total,1)*100:.1f}% of 引用型外链），覆盖 {len({p for s in store for p in s.pages})} 页")
    for s in sorted(store, key=lambda x: -x.count):
        nf = s.rels.get("nofollow", 0)
        print(f"      · {s.host:<40} {s.count:>4} 处 / {len(s.pages):>4} 页  nofollow {nf}")
    print(f"其中带 nofollow: {store_nofollow} 处")
    if cite_total:
        if store_c / cite_total > 0.9:
            print("  ⚠ 结论：>90% 出站被应用商店垄断 —— 典型的'下载 CTA 外链'而非'权威引用'，权威信号极弱")
        elif store_c / cite_total > 0.6:
            print("  ⚠ 结论：60-90% 出站指向应用商店 —— 权威引用占比不足")
        else:
            print("  ✓ 结论：应用商店未垄断出站")
    print()

    # UGC / 评价平台
    print("-" * 96)
    print("【D】第三方评价 / UGC 平台外链（板块 3 关注）")
    print("-" * 96)
    ugc = [s for s in rows if is_ugc_platform(s.host)]
    if ugc:
        for s in sorted(ugc, key=lambda x: -x.count):
            print(f"      · {s.host:<40} {s.count:>4} 处 / {len(s.pages):>4} 页")
    else:
        print("      （无）")
    print()

    # rel 属性
    print("-" * 96)
    print("【E】rel 属性审计")
    print("-" * 96)
    all_a = sum(s.count for s in stats.values() if "a" in s.kinds)
    if rel_total:
        for k, v in sorted(rel_total.items(), key=lambda x: -x[1]):
            print(f"      rel={k:<16} {v:>5} 处")
    else:
        print("      （全站无任何 rel 标记）")
    nf = rel_total.get("nofollow", 0)
    print(f"      → 站外 <a> 共 {all_a} 处，带 nofollow 的 {nf} 处（{nf/max(all_a,1)*100:.1f}%）")
    skipped = [k for k in ("sponsored", "ugc") if k not in rel_total]
    if skipped:
        print(f"      → 从未使用: {', '.join(skipped)}")
    print()

    # 资源型外链（参考）
    print("-" * 96)
    print("【F】资源型外链（不计入权威引用，仅供参考）")
    print("-" * 96)
    for s in sorted(stats.values(), key=lambda x: -x.count):
        if s.kinds and not (s.kinds & cite_kinds):
            print(f"      · {s.host:<40} {s.count:>4} 处   kinds={','.join(sorted(s.kinds))}")
    print()
    print("=" * 96)

    if args.json:
        out = ROOT / "scripts" / "out"
        out.mkdir(parents=True, exist_ok=True)
        data = {
            "pages": page_count,
            "pages_with_outbound": page_with_outbound,
            "cite_total": cite_total,
            "domains": [
                {
                    "host": s.host,
                    "count": s.count,
                    "pages": len(s.pages),
                    "tier": s.tier,
                    "rels": dict(s.rels),
                    "kinds": sorted(s.kinds),
                    "sample_pages": sorted(s.pages)[:5],
                    "sample_urls": sorted(s.sample_urls)[:3],
                }
                for s in rows
            ],
            "tier_counts": {"tier1": c1, "tier2": c2, "tier3": c3},
            "rel_totals": dict(rel_total),
        }
        fp = out / "authority-outbound.json"
        fp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"JSON 已写入: {fp}")


if __name__ == "__main__":
    main()
