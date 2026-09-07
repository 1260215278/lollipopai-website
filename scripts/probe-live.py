"""探测线上 URL 的真实返回，识别「SPA 兜底壳」「软 404」「正常预渲染页」。

用法:
  python scripts/probe-live.py --sitemap .tmp/root-sitemap.xml --sample 40
  python scripts/probe-live.py --urls https://a https://b
"""
import argparse
import random
import re
import sys
from concurrent.futures import ThreadPoolExecutor
from urllib.request import Request, urlopen

UA = "Mozilla/5.0 (compatible; LollipopAudit/1.0; +https://www.lollipop.im)"

SHELL_MARKERS = (
    # 旧构建首页 title（2026-09-05 根部署迁移前的生产版本）
    "Lollipop Drama — Stream Short Dramas & AI Creator Platform",
    # 新构建首页 title（根部署迁移后）
    "Lollipop Drama — AI Short Drama Creation & Streaming Platform",
)


def fetch(url: str, timeout: int = 25):
    req = Request(url, headers={"User-Agent": UA})
    try:
        with urlopen(req, timeout=timeout) as r:
            body = r.read()
            return r.status, r.headers.get("Content-Type", ""), body
    except Exception as e:  # HTTPError 也走这里
        code = getattr(e, "code", None)
        return code or 0, "", b""


def probe(url: str):
    code, ctype, body = fetch(url)
    if code != 200:
        return url, code, ctype, len(body), "NON200"
    m = re.search(rb"<title[^>]*>(.*?)</title>", body, re.S | re.I)
    title = m.group(1).decode("utf-8", "ignore").strip() if m else ""
    canon = re.search(rb'<link[^>]*rel="canonical"[^>]*href="([^"]+)"', body, re.I)
    canon = canon.group(1).decode() if canon else ""
    is_shell = any(k in title for k in SHELL_MARKERS)
    return url, code, ctype, len(body), ("SHELL" if is_shell else "OK"), title, canon


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sitemap")
    ap.add_argument("--urls", nargs="*")
    ap.add_argument("--sample", type=int, default=0)
    ap.add_argument("--workers", type=int, default=8)
    a = ap.parse_args()

    urls = list(a.urls or [])
    if a.sitemap:
        txt = open(a.sitemap, encoding="utf-8").read()
        urls += re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", txt)
    if a.sample and len(urls) > a.sample:
        random.seed(42)
        urls = random.sample(urls, a.sample)

    with ThreadPoolExecutor(max_workers=a.workers) as ex:
        rows = list(ex.map(probe, urls))

    stat = {}
    for r in rows:
        stat[r[4]] = stat.get(r[4], 0) + 1
    print(f"探测 {len(rows)} 条 URL —— 结果分布: {stat}")
    print()
    for r in rows:
        kind = r[4]
        extra = f"  | {r[5][:50]}" if len(r) > 5 else ""
        print(f"  [{kind:6}] {r[0]}{extra}")
    if stat.get("SHELL"):
        print()
        print(f"⚠️  {stat['SHELL']}/{len(rows)} 条返回 SPA 兜底壳（全部等同于首页）")


if __name__ == "__main__":
    main()
