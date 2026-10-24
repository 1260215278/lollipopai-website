import re, urllib.request, ssl, sys

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    "https://www.lollipop.im/about/",
    "https://www.lollipop.im/zh/about/",
    "https://www.lollipop.im/about/?lang=zh-CN",
    "https://www.lollipop.im/blog/",
    "https://www.lollipop.im/zh/blog/",
]

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

opener = urllib.request.build_opener(NoRedirect, urllib.request.HTTPSHandler(context=ctx))

for u in urls:
    try:
        req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (SEO audit)"})
        r = opener.open(req, timeout=20)
        body = r.read(200000).decode("utf-8", "ignore")
        status = r.status
        loc = ""
    except urllib.error.HTTPError as e:
        status = e.code
        loc = e.headers.get("Location", "")
        body = ""
    except Exception as e:
        print(f"{u}\n  ERROR {e}\n")
        continue
    canon = re.findall(r'<link[^>]*rel="canonical"[^>]*href="([^"]+)"', body) or re.findall(r'href="([^"]+)"[^>]*rel="canonical"', body)
    hrefl = re.findall(r'hreflang="([^"]+)"[^>]*href="([^"]+)"', body)
    if not hrefl:
        hrefl = re.findall(r'href="([^"]+)"[^>]*hreflang="([^"]+)"', body)
    robots = re.findall(r'<meta[^>]*name="robots"[^>]*content="([^"]+)"', body)
    print(f"{u}")
    print(f"  status={status}" + (f" Location={loc}" if loc else ""))
    print(f"  canonical={canon[0] if canon else 'NONE'}")
    print(f"  robots={robots[0] if robots else 'NONE'}")
    print(f"  hreflang={len(hrefl)} {[h[0] if isinstance(h,tuple) else h for h in hrefl[:8]]}")
    print()
