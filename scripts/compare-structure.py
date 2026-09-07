"""部署包目录结构 vs 生产实际路径 对拍。

逻辑：dist 里每个 <dir>/index.html 或 <name>.html 都对应一个可访问 URL 路径。
把这些路径拿去探测生产，看是否 200 且非兜底壳 —— 验证「dist 内容放到网站根目录」
这个上传位置假设是否成立。

用法:
  python scripts/compare-structure.py
  python scripts/compare-structure.py --sample 60   # 抽样数
"""
import argparse, os, re, ssl, sys, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
UA = {"User-Agent": "Mozilla/5.0 (compatible; LollipopVerify/1.0; +https://www.lollipop.im)"}
SHELL_H1 = "Stream Short Dramas. Create. Monetize."
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE


def dist_url_paths():
    """从 dist 提取所有页面 URL 路径（/about, /blog/xxx ...）"""
    paths = []
    for dirpath, dirnames, filenames in os.walk(DIST):
        dirnames[:] = [d for d in dirnames if d not in (".ssr", "assets")]
        for fn in filenames:
            if not fn.endswith(".html"):
                continue
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, DIST).replace("\\", "/")
            if rel == "index.html":
                paths.append("/")
            elif rel.endswith("/index.html"):
                paths.append("/" + rel[: -len("/index.html")])
            else:
                paths.append("/" + rel[: -len(".html")])
    return sorted(set(paths))


def fetch(url, timeout=15):
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
            return r.status, r.read().decode("utf-8", "ignore")
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception:
        return 0, ""


def is_shell(body):
    m = re.search(r"<h1[^>]*>(.*?)</h1>", body, re.S)
    h1 = re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else ""
    return h1 == SHELL_H1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="https://www.lollipop.im")
    ap.add_argument("--sample", type=int, default=80)
    a = ap.parse_args()
    base = a.base.rstrip("/")

    paths = dist_url_paths()
    print(f"=== dist 页面路径总数: {len(paths)} ===")

    # 顶层目录结构
    print("\n[1] dist 顶层结构")
    tops = sorted(os.listdir(DIST))
    print(f"  {len(tops)} 项: {', '.join(tops[:25])}")

    # 抽样：覆盖各语言与各内容区
    def bucket(p):
        seg = p.strip("/").split("/")
        return seg[0] if seg[0] else "(root)"
    by_bucket = {}
    for p in paths:
        by_bucket.setdefault(bucket(p), []).append(p)
    print(f"\n[2] 路径分布（{len(by_bucket)} 组）")
    for k in sorted(by_bucket):
        print(f"  {k:12} {len(by_bucket[k]):4} 条")

    # 均匀抽样
    sample = []
    for k in sorted(by_bucket):
        lst = by_bucket[k]
        take = max(1, min(len(lst), 8))
        step = max(1, len(lst) // take)
        sample += lst[::step][:take]
    sample = sorted(set(sample))[: a.sample]
    print(f"\n[3] 抽样探测生产 {len(sample)} 条路径")

    def probe(p):
        s, b = fetch(base + p)
        # ⚠️ 首页(/)的 h1 本来就等于 SHELL_H1，不能按兜底壳判 —— 单独排除
        if p == "/":
            return p, s, ("OK" if s == 200 else f"HTTP {s}")
        return p, s, ("兜底壳" if (s == 200 and is_shell(b)) else
                      "OK" if s == 200 else f"HTTP {s}")
    ok, shell, bad = [], [], []
    with ThreadPoolExecutor(max_workers=8) as ex:
        for p, s, verdict in ex.map(probe, sample):
            if verdict == "OK":
                ok.append(p)
            elif verdict == "兜底壳":
                shell.append(p)
            else:
                bad.append((p, verdict))

    print(f"\n  真页面 OK : {len(ok)}")
    print(f"  兜底壳    : {len(shell)}")
    print(f"  非 200    : {len(bad)}")

    if shell:
        print(f"\n  ⚠️ 兜底壳路径（生产拿不到该路径的文件）:")
        for p in shell[:15]:
            print(f"    {p}")
    if bad:
        print(f"\n  ❌ 非 200 路径:")
        for p, v in bad[:15]:
            print(f"    {p}  {v}")

    # 结论
    print("\n" + "=" * 60)
    total = len(sample)
    rate = len(ok) / total * 100 if total else 0
    print(f"结构一致率: {rate:.0f}% ({len(ok)}/{total})")
    if rate >= 90:
        print("✅ dist 根目录结构 == 生产网站根目录。直接把 zip 内容解压到网站根目录即可。")
    elif rate >= 50:
        print("⚠️ 部分对不上。生产可能不是纯根部署，或旧构建缺页面。看上面明细判断。")
    else:
        print("❌ 结构严重不一致。上传前必须先确认生产真实的网站根目录。")

    # 反向：生产有而 dist 没有的（残留旧文件）
    print("\n[4] 生产 /lollipop/* 是否仍可达（旧构建残留检测）")
    for p in ["/lollipop", "/lollipop/about", "/lollipop/blog"]:
        s, b = fetch(base + p)
        print(f"  {p:20} HTTP {s} {'兜底壳' if (s == 200 and is_shell(b)) else ''}")
    return 0


if __name__ == "__main__":
    sys.exit(main())