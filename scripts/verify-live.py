"""上传后线上验证：确认生产是否已切到根部署新构建。

用法:
  python scripts/verify-live.py                       # 默认验证 https://www.lollipop.im
  python scripts/verify-live.py --base https://x.com  # 验证其它站点

判定逻辑（2026-09-07 沉淀的三件套）:
  1. canonical —— 最可靠，决定 Google 抓哪个 URL
  2. sitemap 前缀 —— 应为 0 条 /lollipop/
  3. 真页面 vs 兜底壳 —— h1 是否为首页文「Stream Short Dramas. Create. Monetize.」
"""
import argparse, re, ssl, sys, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

UA = {"User-Agent": "Mozilla/5.0 (compatible; LollipopVerify/1.0; +https://www.lollipop.im)"}
# 首页 h1 —— 子页若返回它即为 SPA 兜底壳
SHELL_H1 = "Stream Short Dramas. Create. Monetize."

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

PASS, FAIL, WARN = [], [], []


def fetch(url, timeout=20):
    """返回 (status, body, headers)；异常返回 (0, '', {})"""
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
            body = r.read().decode("utf-8", "ignore")
            return r.status, body, dict(r.headers)
    except urllib.error.HTTPError as e:
        try:
            body = e.read().decode("utf-8", "ignore")
        except Exception:
            body = ""
        return e.code, body, dict(e.headers)
    except Exception as e:
        print(f"    ! {url}: {type(e).__name__}: {e}")
        return 0, "", {}


def check(name, ok, detail=""):
    if not isinstance(detail, str):
        detail = ", ".join(str(x) for x in detail) if isinstance(detail, (list, tuple)) else str(detail)
    (PASS if ok else FAIL).append(name)
    print(f"  [{'PASS' if ok else 'FAIL'}] {name}{(' — ' + detail) if detail else ''}")
    return ok


def title_of(html):
    m = re.search(r"<title>([^<]*)", html)
    return m.group(1).strip() if m else ""


def h1_of(html):
    m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S)
    if not m:
        return ""
    return re.sub(r"<[^>]+>", "", m.group(1)).strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="https://www.lollipop.im")
    a = ap.parse_args()
    base = a.base.rstrip("/")

    print(f"=== 线上验证: {base} ===\n")

    # 1) 首页
    print("[1] 首页")
    st, html, hdr = fetch(base + "/")
    if not check("首页可达 (200)", st == 200, f"HTTP {st}"):
        print("  首页都不通，后续检查跳过")
        return 1
    canon = re.search(r'<link rel="canonical" href="([^"]+)"', html)
    canon = canon.group(1) if canon else ""
    check("首页 canonical 为根路径（无 /lollipop/）",
          bool(canon) and "/lollipop" not in canon, canon or "NOT FOUND")
    t = title_of(html)
    print(f"    title: {t}")
    print(f"    Last-Modified: {hdr.get('Last-Modified', '?')}")
    HOME_TITLE = t  # 供子页「兜底壳」判定（title 与首页一致 = SPA fallback）

    # 2) sitemap
    print("\n[2] sitemap.xml")
    st, sm, _ = fetch(base + "/sitemap.xml")
    urls = re.findall(r"<loc>([^<]+)</loc>", sm) if st == 200 else []
    check("sitemap 可达 (200)", st == 200, f"HTTP {st}  条数 {len(urls)}")
    prefixed = [u for u in urls if "/lollipop/" in u]
    check("sitemap 无 /lollipop/ 前缀 URL", len(prefixed) == 0,
          f"含前缀 {len(prefixed)} 条" if prefixed else "0 条")
    if urls:
        print(f"    示例: {urls[0]}")

    # 3) 真页面（关键：非兜底壳）
    print("\n[3] 子页面真实性（h1 不得为首页文）")
    pages = ["/about", "/blog", "/genre/romance", "/privacy", "/download",
             "/blog/how-to-create-ai-short-drama"]
    def probe(p):
        s, b, _ = fetch(base + p)
        return p, s, title_of(b), h1_of(b)
    with ThreadPoolExecutor(max_workers=6) as ex:
        for p, s, ti, h1 in ex.map(probe, pages):
            if not h1:
                # h1 抓不到可能是页面结构差异（动态渲染/无 h1），不算兜底壳，
                # 只按 title 是否等于首页 title 判断
                is_shell = ti == HOME_TITLE
                check(f"{p} 真页面", s == 200 and not is_shell,
                      f"HTTP {s} title='{ti[:40]}'（未抓到 h1，按 title 判定）"
                      + ("  ← 疑似兜底壳" if is_shell else ""))
            else:
                is_shell = h1 == SHELL_H1
                check(f"{p} 真页面", s == 200 and not is_shell,
                      f"HTTP {s} h1='{h1[:40]}'" + ("  ← 兜底壳!" if is_shell else ""))

    # 4) 旧前缀 301
    print("\n[4] 旧 /lollipop/* URL 处理")
    for p in ["/lollipop", "/lollipop/about"]:
        s, b, h = fetch(base + p)
        loc = h.get("Location", "")
        if s in (301, 308):
            ok = "/lollipop" not in loc
            check(f"{p} 301 到根路径", ok, f"HTTP {s} → {loc or '(空)'}")
        elif s == 200:
            h1 = h1_of(b)
            is_shell = h1 == SHELL_H1
            # 200 但若是兜底壳 = 问题未解决
            check(f"{p} 未返回兜底壳", not is_shell,
                  f"HTTP 200 h1='{h1[:40]}'" + ("  ← 兜底壳，301 未生效" if is_shell else ""))
            if is_shell:
                WARN.append(f"{p} 仍是 200 兜底壳，_redirects/Caddyfile 301 未生效")
        else:
            check(f"{p} 已处理（非 200）", True, f"HTTP {s}")

    # 5) IndexNow key
    print("\n[5] IndexNow key 文件")
    s, body, _ = fetch(base + "/fc327f494d3f4612b851a2972530d549.txt")
    check("key 文件可访问且内容正确", s == 200 and body.strip() == "fc327f494d3f4612b851a2972530d549",
          f"HTTP {s} 内容='{body.strip()[:40]}'")

    # 6) robots.txt
    print("\n[6] robots.txt")
    s, rb, _ = fetch(base + "/robots.txt")
    check("robots.txt 可达", s == 200, f"HTTP {s}")
    if s == 200:
        check("robots 含 Sitemap 指令", "Sitemap:" in rb,
              [l for l in rb.splitlines() if l.lower().startswith("sitemap")] or "无")

    # 汇总
    print("\n" + "=" * 60)
    print(f"结果: {len(PASS)} PASS / {len(FAIL)} FAIL")
    if FAIL:
        print("\n未通过项:")
        for f in FAIL:
            print(f"  - {f}")
        print("\n→ 生产仍是旧构建（或 301 未生效），Coverage 问题不会改善。")
    else:
        print("\n✅ 生产已切到根部署新构建。接下来:")
        print("   1. GSC 重新提交 sitemap")
        print("   2. 对「自动重定向」「备用网页」点「验证修复」")
        print(f"   3. IndexNow 全量提交: python scripts/indexnow-submit.py")
    if WARN:
        print("\n提示:")
        for w in WARN:
            print(f"  - {w}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())