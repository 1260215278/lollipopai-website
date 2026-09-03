#!/usr/bin/env python3
"""
GEO（生成式引擎优化）采集与分析。

两件事：
  1. `--analyze`  把采集到的原始回答算成品牌提及率 / 引用域名表（离线，直接用）
  2. `--collect`  重新跑一遍 prompt 采集（需要 API key，联网）

口径说明（务必读）
------------------
这套口径是 2026-09-01 从 `data/outputs/lollipop_drama_20260901/*.csv` **反推校准**出来的，
能精确复现原有数字。改口径前先想清楚，否则前后不可比：

  - 引用域名：取 `citations[].url`（**不是** `domain` 字段）的 hostname，去掉 `www.`，
    **不去重**计数。
  - 品牌引用：`citations[].url` 里出现 `citePatterns` 任一子串即计 1，**不去重**。
  - 品牌提及：该条 `answerText` 里出现任一 alias（忽略大小写）即计 1，
    再除以总条数得百分比（记录级，最多 = 总 query 数）。

⚠️ 已知坑：Runway 的 `citePatterns` 基线只写了 `runwayml.com`，漏了 `runway.com`（15 次）
和 `docs.dev.runwayml.com`（2 次）。这里为保持可比沿用原口径，
真实 Runway 引用数应为 35 而非 18。见 data/geo-brands.json 的 `_runway_caveat`。

用法
----
    # 分析已有数据
    python scripts/geo-collect.py --analyze \
        --raw data/raw/raw_GEO_20260901_sd_mtigcdoz500zhnwqu.json \
        --out data/outputs/verify_20260901

    # 严格模式（只用当前品牌名，与旧基线可比）
    python scripts/geo-collect.py --analyze --raw <file> --strict

    # 重新采集（需要 OPENAI_API_KEY）
    export OPENAI_API_KEY=sk-...
    python scripts/geo-collect.py --collect \
        --prompts data/prompts/prompts_Lollipop_Drama_20260901_171518.json \
        --out data/raw/raw_GEO_20260902_<id>.json

    # 只看会发什么，不真发（不花钱）
    python scripts/geo-collect.py --collect --prompts <file> --dry-run
"""

import argparse
import collections
import csv
import io
import json
import os
import pathlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parent.parent
DEFAULT_BRAND_CFG = ROOT / "data" / "geo-brands.json"


# --------------------------------------------------------------------------
# 工具
# --------------------------------------------------------------------------
def host_of(url: str) -> str:
    """取 hostname 并去掉开头的 www.（与基线口径一致）。"""
    if not url:
        return ""
    h = urlparse(url if "//" in url else "https://" + url).hostname or url
    return h[4:] if h.startswith("www.") else h


def load_brands(cfg_path: pathlib.Path) -> dict:
    return json.loads(cfg_path.read_text(encoding="utf-8"))


def alias_set(brand: dict, strict: bool) -> list[str]:
    """strict=True 时只用当前品牌名（与旧基线可比）；否则把历史旧名也纳入。"""
    aliases = list(brand.get("mentionAliases") or [])
    if not strict:
        aliases += list(brand.get("legacyAliases") or [])
    return [a.lower() for a in aliases if a]


# --------------------------------------------------------------------------
# 分析
# --------------------------------------------------------------------------
def analyze(records: list[dict], cfg: dict, strict: bool = False) -> dict:
    total = len(records)
    brands = cfg["brands"]

    # 1. 引用域名（不去重）
    domains = collections.Counter()
    for r in records:
        for c in r.get("citations") or []:
            h = host_of(c.get("url"))
            if h:
                domains[h] += 1

    # 2. 品牌引用（不去重）
    brand_cites = {}
    for b in brands:
        pats = [p.lower() for p in b.get("citePatterns") or []]
        n = 0
        for r in records:
            for c in r.get("citations") or []:
                u = (c.get("url") or "").lower()
                if any(p in u for p in pats):
                    n += 1
        brand_cites[b["name"]] = n

    # 3. 品牌提及（记录级）
    brand_mentions = {}
    for b in brands:
        aliases = alias_set(b, strict)
        brand_mentions[b["name"]] = sum(
            1
            for r in records
            if any(a in (r.get("answerText") or "").lower() for a in aliases)
        )

    return {
        "total": total,
        "domains": domains,
        "brand_cites": brand_cites,
        "brand_mentions": brand_mentions,
        "strict": strict,
    }


def render_csv(rows: list[list], header: list[str]) -> str:
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator="\n")
    w.writerow(header)
    w.writerows(rows)
    return buf.getvalue()


def write_outputs(res: dict, cfg: dict, records: list[dict], outdir: pathlib.Path) -> None:
    outdir.mkdir(parents=True, exist_ok=True)
    total = res["total"]
    brands = [b["name"] for b in cfg["brands"]]

    (outdir / "summary.csv").write_text(
        render_csv([[b, res["brand_cites"][b]] for b in brands],
                   ["Brand", "Brand_URL_in_Citations"]),
        encoding="utf-8",
    )

    (outdir / "mention_stats.csv").write_text(
        render_csv(
            [[b, res["brand_mentions"][b], f"{res['brand_mentions'][b] / total * 100:.2f}%"]
             for b in brands],
            ["Brand", "Mentions", "Percentage"],
        ),
        encoding="utf-8",
    )

    (outdir / "citation_domains.csv").write_text(
        render_csv(
            [[d, n] for d, n in res["domains"].most_common()],
            ["Domain", "Citation_Count"],
        ),
        encoding="utf-8",
    )

    # queries_full.csv 与原文件一致：带 BOM
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator="\n")
    w.writerow(["#", "Prompt"])
    for i, r in enumerate(records, 1):
        p = r.get("prompt") or ""
        p = re.sub(r"\s*Please provide relevant web links or sources for your answer\.\s*$", "", p)
        w.writerow([i, p])
    (outdir / "queries_full.csv").write_text("\ufeff" + buf.getvalue(), encoding="utf-8")

    # 逐条明细，方便定位「哪条 query 提到了我 / 没提到」
    detail = []
    for i, r in enumerate(records, 1):
        text = (r.get("answerText") or "").lower()
        cites = [host_of(c.get("url")) for c in (r.get("citations") or [])]
        row = {"#": i, "prompt": (r.get("prompt") or "")[:80]}
        for b in cfg["brands"]:
            name = b["name"]
            row[f"{name}_mentioned"] = any(a in text for a in alias_set(b, res["strict"]))
            row[f"{name}_cited"] = any(
                any(p in (c.get("url") or "").lower() for p in (b.get("citePatterns") or []))
                for c in (r.get("citations") or [])
            )
        row["cited_domains"] = ", ".join(sorted({c for c in cites if c}))
        detail.append(row)
    (outdir / "per_query_detail.json").write_text(
        json.dumps(detail, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def print_report(res: dict, cfg: dict) -> None:
    total = res["total"]
    mode = "严格（仅当前品牌名）" if res["strict"] else "含历史旧名"
    print(f"\n样本 {total} 条 query | 提及口径：{mode}")
    print(f"{'品牌':<16}{'被引次数':>10}{'提及':>8}{'提及率':>10}")
    for b in cfg["brands"]:
        n = b["name"]
        m = res["brand_mentions"][n]
        print(f"{n:<16}{res['brand_cites'][n]:>10}{m:>8}{m / total * 100:>9.2f}%")
    print("\n引用域名 Top 10:")
    for d, c in res["domains"].most_common(10):
        print(f"   {d:<28} {c}")


# --------------------------------------------------------------------------
# 采集
# --------------------------------------------------------------------------
def call_openai_responses(prompt: str, model: str, api_key: str, timeout: int = 120) -> dict:
    """调 OpenAI Responses API（带 web_search_preview），返回原始 JSON。"""
    body = {
        "model": model,
        "tools": [{"type": "web_search_preview"}],
        "input": prompt,
    }
    req = urllib.request.Request(
        "https://api.openai.com/v1/responses",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def normalize_response(prompt: str, data: dict, country: str) -> dict:
    """把 Responses API 的结果映射成本项目 raw schema。"""
    text = data.get("output_text") or ""
    citations, links = [], []
    pos = 0
    for item in data.get("output") or []:
        if item.get("type") != "message":
            continue
        for c in item.get("content") or []:
            if c.get("type") == "output_text":
                text = text or c.get("text", "")
                for ann in c.get("annotations") or []:
                    if ann.get("type") != "url_citation":
                        continue
                    pos += 1
                    u = ann.get("url", "")
                    citations.append({
                        "domain": f"https://{host_of(u)}" if host_of(u) else None,
                        "position": str(pos),
                        "snippet": None,
                        "title": ann.get("title"),
                        "url": u,
                    })
                    links.append({"position": pos, "text": ann.get("title"), "url": u})
    return {
        "answerText": text,
        "citations": citations,
        "country": country,
        "index": None,
        "linksAttached": links,
        "prompt": prompt,
        "url": "https://chatgpt.com/?q=" + urllib.parse.quote(prompt),
        "webSearchQuery": None,
    }


def collect(prompts: list[str], cfg: dict, outdir: pathlib.Path, dry_run: bool) -> None:
    cc = cfg.get("collection") or {}
    model = cc.get("model", "gpt-4o-mini")
    country = cc.get("country", "US")
    suffix = cc.get("promptSuffix", "")
    api_key = os.environ.get("OPENAI_API_KEY", "")

    print(f"待采集 {len(prompts)} 条 | provider={cc.get('provider')} model={model}")
    if dry_run:
        for i, p in enumerate(prompts, 1):
            print(f"  {i:2}. {p}{suffix}")
        print("\n--dry-run：未实际请求，未产生费用。")
        return
    if not api_key:
        print("缺少 OPENAI_API_KEY 环境变量，无法采集。", file=sys.stderr)
        raise SystemExit(2)

    out = []
    for i, p in enumerate(prompts, 1):
        full = p + suffix
        print(f"[{i}/{len(prompts)}] {p[:50]}...", flush=True)
        try:
            data = call_openai_responses(full, model, api_key)
        except urllib.error.HTTPError as e:
            print(f"    HTTP {e.code}: {e.read().decode('utf-8', 'ignore')[:200]}", file=sys.stderr)
            raise SystemExit(1)
        out.append(normalize_response(full, data, country))
        if i < len(prompts):
            time.sleep(2)  # 轻量限流

    outdir.mkdir(parents=True, exist_ok=True)
    ts = time.strftime("%Y%m%d")
    path = outdir / f"raw_GEO_{ts}_{int(time.time())}.json"
    path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n已保存 {len(out)} 条 -> {path}")


# --------------------------------------------------------------------------
def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--analyze", action="store_true")
    ap.add_argument("--collect", action="store_true")
    ap.add_argument("--raw", help="原始采集 JSON")
    ap.add_argument("--prompts", help="prompt 源文件（list[str] 或 {queries:[...]}）")
    ap.add_argument("--brands", default=str(DEFAULT_BRAND_CFG))
    ap.add_argument("--out", required=True, help="输出目录（analyze）或 raw 目录（collect）")
    ap.add_argument("--strict", action="store_true", help="提及口径只用当前品牌名（与旧基线可比）")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    cfg = load_brands(pathlib.Path(a.brands))
    outdir = pathlib.Path(a.out)

    if a.analyze:
        if not a.raw:
            print("--analyze 需要 --raw", file=sys.stderr)
            return 2
        records = json.loads(pathlib.Path(a.raw).read_text(encoding="utf-8"))
        res = analyze(records, cfg, strict=a.strict)
        write_outputs(res, cfg, records, outdir)
        print_report(res, cfg)
        print(f"\n输出目录：{outdir}")
        return 0

    if a.collect:
        if not a.prompts:
            print("--collect 需要 --prompts", file=sys.stderr)
            return 2
        p = json.loads(pathlib.Path(a.prompts).read_text(encoding="utf-8"))
        prompts = p if isinstance(p, list) else p.get("queries", [])
        collect(prompts, cfg, outdir, a.dry_run)
        return 0

    ap.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
