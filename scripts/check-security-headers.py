"""线上安全响应头体检 —— 对应首页 SEO 审计「安全与传输」分组（权重 5%）。

背景（2026-10-07 实测）：
  审计该分组 92/100，是唯一带 ❌ 的分组：
    ❌ HSTS 安全传输 0/20  —— 缺 Strict-Transport-Security
    ⚠️ 安全响应头   9/15   —— 缺 x-frame-options、content-security-policy
  仓库根 Caddyfile 里这 6 个头其实都配好了，但线上实测全部缺失，
  且 Caddyfile 里的 /guides/*、/lollipop/* 301 也没生效 →
  判定「源站未加载本仓库的 Caddyfile」，不是配置写错。
  本脚本就是修完源站之后用来验收的那把尺子。

用法:
  python scripts/check-security-headers.py                      # 默认列表
  python scripts/check-security-headers.py --url https://x.com  # 只测一个 URL
  python scripts/check-security-headers.py --timeout 30

评分口径（与首页 SEO 审计一致，满分 35）:
  Strict-Transport-Security  20 分
  Content-Security-Policy     3 分
  X-Frame-Options             3 分
  X-Content-Type-Options      3 分
  Referrer-Policy             3 分
  Permissions-Policy          3 分

铁律: 必须伪装 User-Agent。urllib 默认的 Python-urllib/3.x 会被 Cloudflare
风控直接 403（或返回挑战页），那样会「因为被拦而误判成缺头」。
UA 常量沿用 scripts/probe-live.py，请求方式沿用 scripts/verify-live.py。

退出码: 全部通过 0，否则 1。
"""
import argparse
import re
import ssl
import sys
import urllib.error
import urllib.request

# ── 复用 scripts/probe-live.py 的 UA 常量（项目铁律：不伪装就被 CF 风控 403）──
UA = "Mozilla/5.0 (compatible; LollipopAudit/1.0; +https://www.lollipop.im)"
REQ_HEADERS = {"User-Agent": UA, "Accept": "text/html,application/xhtml+xml,*/*"}

# 沿用 scripts/verify-live.py 的 SSL 上下文写法，避免个别节点的证书链问题干扰判定
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

BASE = "https://www.lollipop.im"
DEFAULT_URLS = [
    BASE + "/",          # 首页 —— 审计取样页
    BASE + "/about",
    BASE + "/blog/",
    BASE + "/zh/",       # 若 404 则跳过并注明
]
# 专门测一次 http:// 首页：确认明文访问是否 301 跳 https
HTTP_PROBE_URL = "http://www.lollipop.im/"

# HSTS 及格线：15552000 秒 = 180 天（低于此值多数评分器不给分）
HSTS_MIN_AGE = 15552000

TIMEOUT = 20

# 表头（用英文缩写，避免中文列宽在等宽字体下对不齐）
COLUMNS = [
    ("Strict-Transport-Security", "HSTS", 20),
    ("Content-Security-Policy", "CSP", 3),
    ("X-Frame-Options", "XFO", 3),
    ("X-Content-Type-Options", "XCTO", 3),
    ("Referrer-Policy", "RefPol", 3),
    ("Permissions-Policy", "PermPol", 3),
]
MAX_SCORE = sum(w for _, _, w in COLUMNS)

# 单元格状态
OK, BAD, UNKNOWN = "PASS", "FAIL", "????"


class _RedirectRecorder(urllib.request.HTTPRedirectHandler):
    """跟随重定向，但把每一跳记下来（用来判断 http:// 是否 301 到 https://）。"""

    def __init__(self):
        self.chain = []  # [(状态码, 源 URL, 目标 URL)]

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        self.chain.append((code, req.full_url, newurl))
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def fetch(url, timeout=TIMEOUT):
    """返回 (status, headers(dict), chain, err)。

    status == 0 表示网络层异常（连不上/超时/DNS 失败），headers 为空。
    """
    rec = _RedirectRecorder()
    opener = urllib.request.build_opener(rec, urllib.request.HTTPSHandler(context=CTX))
    req = urllib.request.Request(url, headers=REQ_HEADERS)
    try:
        with opener.open(req, timeout=timeout) as r:
            return r.status, dict(r.headers), rec.chain, ""
    except urllib.error.HTTPError as e:
        # 4xx/5xx 也带响应头，照样能读
        return e.code, dict(e.headers), rec.chain, ""
    except Exception as e:
        return 0, {}, rec.chain, f"{type(e).__name__}: {e}"


def hsts_verdict(value):
    """HSTS 判定：存在 + max-age >= 180 天；includeSubDomains 只提示不强求。"""
    if not value:
        return False, "缺失"
    m = re.search(r"max-age\s*=\s*(\d+)", value, re.I)
    if not m:
        return False, f"{value}（无 max-age）"
    age = int(m.group(1))
    note = value
    if "includesubdomains" not in value.lower():
        note += "  ← 建议补 includeSubDomains"
    if "preload" not in value.lower():
        note += "  ← 建议补 preload"
    return age >= HSTS_MIN_AGE, note + ("" if age >= HSTS_MIN_AGE else f"  ← max-age {age} < {HSTS_MIN_AGE}(180天)")


def verdict(name, value):
    """返回 (是否通过, 展示用的实际值/说明)。"""
    v = (value or "").strip()
    if name == "Strict-Transport-Security":
        return hsts_verdict(v)
    if not v:
        return False, "缺失"
    if name == "X-Content-Type-Options":
        return v.lower() == "nosniff", v
    if name == "X-Frame-Options":
        ok = v.upper().replace("ALLOW-FROM", "") in ("DENY", "SAMEORIGIN") or v.upper() in ("DENY", "SAMEORIGIN")
        return ok, v
    return True, v


def probe_one(url, timeout):
    """测一个 URL，返回 (url, 结果 dict)。"""
    status, hdrs, chain, err = fetch(url, timeout)
    res = {
        "status": status,
        "err": err,
        "chain": chain,
        "headers": hdrs,
        "cells": {},
        "score": 0,
        # 可判定性：既没拿到 2xx/3xx 响应，也没有任何响应头 → 无法判断”真缺头还是被拦/断网“
        "decidable": False,
        "skip": False,
        "skip_reason": "",
    }
    if status == 0:
        res["skip"] = True
        res["skip_reason"] = f"请求异常（网络不通/DNS/超时）: {err}"
        return url, res
    if status == 404:
        res["skip"] = True
        res["skip_reason"] = "HTTP 404，跳过（该路径不存在）"
        return url, res
    if status == 403:
        res["skip"] = True
        res["skip_reason"] = "HTTP 403 —— 疑似被 Cloudflare 风控拦截，无法据此判定响应头"
        return url, res

    res["decidable"] = True
    for name, col, w in COLUMNS:
        ok, shown = verdict(name, hdrs.get(name, ""))
        res["cells"][col] = (OK if ok else BAD, shown)
        if ok:
            res["score"] += w
    return url, res


def print_detail(url, res):
    print(f"  {url}")
    if res["skip"]:
        print(f"      ⚠️  {res['skip_reason']}")
        return
    print(f"      HTTP {res['status']}")
    for name, col, w in COLUMNS:
        mark, shown = res["cells"][col]
        print(f"      [{'PASS' if mark == OK else 'FAIL'}] {name:<28} {shown}")
    print(f"      小计: {res['score']}/{MAX_SCORE}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", help="只测这一个 URL，覆盖默认列表")
    ap.add_argument("--timeout", type=int, default=TIMEOUT)
    a = ap.parse_args()

    urls = [a.url] if a.url else list(DEFAULT_URLS)

    print("=" * 78)
    print("线上安全响应头体检 —— www.lollipop.im")
    print(f"UA: {UA}")
    print("=" * 78)

    results = []
    for u in urls:
        url, res = probe_one(u, a.timeout)
        results.append((url, res))

    print("\n[1] 逐项明细")
    for url, res in results:
        print_detail(url, res)

    # ── http:// 明文访问专项 ──
    print("\n[2] http:// 明文访问（应 301 跳 https）")
    st, hdrs, chain, err = fetch(HTTP_PROBE_URL, a.timeout)
    if st == 0:
        print(f"  [????] {HTTP_PROBE_URL} 请求异常: {err}")
        http_ok, http_note = None, "无法判定（网络层异常）"
    elif chain:
        code, src, dst = chain[0]
        http_ok = code in (301, 302, 307, 308) and dst.lower().startswith("https://")
        http_note = f"HTTP {code} → {dst}"
    else:
        http_ok = False
        http_note = f"HTTP {st} 未跳转（明文可直接访问）"
    print(f"  [{'PASS' if http_ok else ('????' if http_ok is None else 'FAIL')}] {HTTP_PROBE_URL} — {http_note}")
    if hdrs.get("Strict-Transport-Security"):
        print(f"      注: http 响应上也带了 HSTS = {hdrs['Strict-Transport-Security']}")
    elif http_ok is not None:
        print("      注: http 响应无 HSTS（正常，HSTS 只在 https 响应下发才有效）")

    # ── 汇总表 ──
    print("\n[3] 汇总表（URL × 6 项）")
    cols = [c for _, c, _ in COLUMNS]
    url_w = max([len("URL")] + [len(u) for u, _ in results])
    cell_w = 8
    head = "  " + "URL".ljust(url_w) + "".join(c.rjust(cell_w) for c in cols) + "得分".rjust(8)
    print(head)
    print("  " + "-" * (len(head) - 2))
    decidable_seen = False
    for url, res in results:
        if res["skip"]:
            cells = ["--".rjust(cell_w) for _ in cols]
            score_txt = "跳过"
        else:
            decidable_seen = True
            cells = [res["cells"][c][0].rjust(cell_w) for c in cols]
            score_txt = f"{res['score']}/{MAX_SCORE}"
        print("  " + url.ljust(url_w) + "".join(cells) + score_txt.rjust(8))
    for u, r in results:
        if r["skip"]:
            print(f"      · {u} 跳过原因: {r['skip_reason']}")

    # ── 结论 ──
    print("\n" + "=" * 78)
    target = results[0][1] if results else None  # 首页 = 审计取样页
    if target and not target["skip"]:
        score = target["score"]
        print(f"首页得分: {score}/{MAX_SCORE}   修复后预计: {MAX_SCORE}/{MAX_SCORE}")
        missing = [name for name, col, _ in COLUMNS if target["cells"][col][0] == BAD]
        if missing:
            print(f"仍缺/不合格的响应头: {', '.join(missing)}")
        else:
            print("✅ 6 项安全头全部到位。")
        print(f"http→https 跳转: {http_note}")
    else:
        print("首页未能取得有效响应，无法给出得分（详见下方判定说明）。")

    # ── 可判定性说明（区分「真缺头」还是「网络不通/被风控」）──
    print("\n判定说明:")
    if not decidable_seen:
        print("  ⚠️  所有 URL 都没拿到有效响应 —— 这既可能是「真的缺头」，也可能是")
        print("      「网络不通 / 被 Cloudflare 风控拦截」。本脚本无法区分这两种情况，")
        print("      请勿据此下结论。请先手工复核:")
        print("        curl -I -A \"Mozilla/5.0\" https://www.lollipop.im/")
    else:
        bad = [(u, r) for u, r in results if r["skip"]]
        print(f"  · {len(results) - len(bad)}/{len(results)} 个 URL 拿到了有效响应，"
              f"其 PASS/FAIL 是响应头的真实情况（不是被拦导致的误判）。")
        if bad:
            print("  · 以下 URL 无法判定（非 2xx/3xx 或无响应），不能算作「缺头」:")
            for u, r in bad:
                print(f"      - {u}: {r['skip_reason']}")

    all_ok = (http_ok is True) and all(
        (not r["skip"]) and all(v[0] == OK for v in r["cells"].values())
        for _, r in results
    )
    print("\n退出码: " + ("0（全部通过）" if all_ok else "1（存在 FAIL 或无法判定的 URL）"))
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
