import urllib.request, ssl, re, warnings
warnings.filterwarnings("ignore")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")
ctx = ssl.create_default_context(); ctx.check_hostname=False; ctx.verify_mode=ssl.CERT_NONE
def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
            return r.status, dict(r.getheaders()), r.read().decode("utf-8","replace")
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), (e.read().decode("utf-8","replace") if e.fp else "")
    except Exception as e:
        return None, {}, f"ERR {e}"

BASE="https://www.lollipop.im"
tests = [
    "/lollipop/about",
    "/lollipop/blog",
    "/lollipop/blog/web-novel-to-ai-short-drama-pipeline",
    "/lollipop/genre/fantasy",
    "/lollipop/zh/blog/ai-new-generation-creators",
    "/lollipop/en/about",
    "/lollipop/pt/blog/ai-tools-comparison",
    "/lollipop/ar/blog/ai-vs-traditional-drama",
]
for p in tests:
    s,h,b = fetch(BASE+p)
    ni = "noindex" in b.lower()
    canon = re.search(r'rel=["\']canonical["\'][^>]+href=["\']([^"\']+)', b)
    canon2 = re.search(r'href=["\']([^"\']+)["\'][^>]*rel=["\']canonical', b)
    canon = canon or canon2
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", b, re.S)
    print(f"{p}\n  status={s} noindex={ni} canonical={canon.group(1) if canon else 'NONE'}")
    print(f"  h1={h1.group(1).strip()[:60] if h1 else 'NONE'}")
