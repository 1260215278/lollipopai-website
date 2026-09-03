# -*- coding: utf-8 -*-
"""IndexNow 批量提交脚本（2026-09-03 接入）

SEO 扫描报告把「未采用 IndexNow」列为高严重性项。本脚本把 sitemap 里的 URL 批量推送给
IndexNow 成员搜索引擎（Bing / Yandex / Seznam / Naver），让新页面分钟级被发现，而不必等爬虫。

用法：
    python scripts/indexnow-submit.py                    # 提交全站 sitemap 里的所有 URL
    python scripts/indexnow-submit.py --limit 50         # 只提交前 50 条（试跑）
    python scripts/indexnow-submit.py --file urls.txt    # 提交自定义 URL 列表
    python scripts/indexnow-submit.py --endpoint bing    # 只提交到 Bing

⚠️ 部署前缀铁律：站点部署在 /lollipop/ 子路径下，key 文件实际地址是
   https://www.lollipop.im/lollipop/{key}.txt，因此 keyLocation **必须显式指定**，
   不能依赖 IndexNow 默认的 https://{host}/{key}.txt（那个地址 301/404）。
"""
import argparse
import io
import json
import os
import re
import sys
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

HOST = "www.lollipop.im"
# 部署前缀（与 SITE_URL 常量保持一致，无尾斜杠）
DEPLOY_PREFIX = "/lollipop"

ENDPOINTS = {
    "indexnow": "https://api.indexnow.org/IndexNow",
    "bing": "https://www.bing.com/indexnow",
    "yandex": "https://yandex.com/indexnow",
    "seznam": "https://search.seznam.cz/indexnow",
    "naver": "https://searchadvisor.naver.com/indexnow",
}

BATCH = 10000  # IndexNow 单次上限


def load_key():
    """key 与 public/{key}.txt 同源，避免两处不一致。"""
    p = os.path.join(ROOT, "scripts", "indexnow-key.txt")
    if not os.path.exists(p):
        sys.exit("缺少 scripts/indexnow-key.txt，先运行生成 key 的步骤")
    with io.open(p, encoding="utf-8") as f:
        return f.read().strip()


def urls_from_sitemap():
    p = os.path.join(ROOT, "public", "sitemap.xml")
    if not os.path.exists(p):
        p = os.path.join(ROOT, "dist", "sitemap.xml")
    with io.open(p, encoding="utf-8") as f:
        s = f.read()
    return re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", s)


def urls_from_file(path):
    with io.open(path, encoding="utf-8") as f:
        return [ln.strip() for ln in f if ln.strip() and ln.strip().startswith("http")]


def submit(endpoint_url, payload):
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        endpoint_url,
        data=data,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, resp.read().decode("utf-8", "ignore")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "ignore")
    except Exception as e:  # 网络抖动
        return 0, str(e)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0, help="只提交前 N 条")
    ap.add_argument("--file", default="", help="自定义 URL 列表文件（每行一个）")
    ap.add_argument("--endpoint", default="all", choices=list(ENDPOINTS) + ["all"])
    ap.add_argument("--dry-run", action="store_true", help="只打印不实际提交")
    args = ap.parse_args()

    urls = urls_from_file(args.file) if args.file else urls_from_sitemap()
    if args.limit:
        urls = urls[: args.limit]
    if not urls:
        sys.exit("没有可提交的 URL")

    key = load_key()
    key_location = f"https://{HOST}{DEPLOY_PREFIX}/{key}.txt"

    targets = ENDPOINTS if args.endpoint == "all" else {args.endpoint: ENDPOINTS[args.endpoint]}

    print(f"host         : {HOST}")
    print(f"keyLocation  : {key_location}")
    print(f"URL 总数     : {len(urls)}")
    print(f"端点         : {', '.join(targets)}")
    if args.dry_run:
        for u in urls[:10]:
            print("  ", u)
        if len(urls) > 10:
            print(f"   ... 其余 {len(urls) - 10} 条")
        return

    ok = True
    for name, ep in targets.items():
        total = 0
        for i in range(0, len(urls), BATCH):
            batch = urls[i : i + BATCH]
            payload = {
                "host": HOST,
                "key": key,
                "keyLocation": key_location,
                "urlList": batch,
            }
            status, body = submit(ep, payload)
            total += len(batch)
            flag = "OK" if status in (200, 202) else "FAIL"
            if status not in (200, 202):
                ok = False
            print(f"[{name}] {flag} status={status} 提交 {len(batch)} 条 (累计 {total}) {body[:120]}")
            time.sleep(1)  # 礼貌间隔，避免触发限流
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
