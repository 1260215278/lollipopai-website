import re, urllib.request, ssl, sys

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

ORIGIN = "http://43.160.226.253"
HOST = "www.lollipop.im"
PATHS = ["/about", "/about/", "/zh/about", "/zh/about/", "/zh/", "/zh", "/lollipop/"]

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None

opener = urllib.request.build_opener(NoRedirect)

for p in PATHS:
    u = ORIGIN + p
    try:
        req = urllib.request.Request(u, headers={"Host": HOST, "User-Agent": "Mozilla/5.0"})
        r = opener.open(req, timeout=15)
        body = r.read(200000).decode("utf-8", "ignore")
        status = r.status
        loc = r.headers.get("Location", "")
        srv = r.headers.get("Server", "")
        ctype = r.headers.get("Content-Type", "")
    except urllib.error.HTTPError as e:
        status = e.code
        loc = e.headers.get("Location", "")
        srv = e.headers.get("Server", "")
        ctype = e.headers.get("Content-Type", "")
        body = ""
    except Exception as e:
        print(f"{p} -> EXC {e}")
        continue

    title = re.findall(r"<title>(.*?)</title>", body, re.S)
    canon = re.findall(r'rel="canonical"\s+href="([^"]+)"', body)
    h1 = re.findall(r"<h1[^>]*>(.*?)</h1>", body, re.S)
    h1txt = re.sub(r"<[^>]+>", "", h1[0]).strip()[:70] if h1 else "NONE"
    cjk = len(re.findall(r"[\u4e00-\u9fff]", body))
    print(f"{p} [{status}] server={srv!r} ctype={ctype!r} loc={loc!r}")
    print(f"    title={title[0][:70] if title else 'NONE'}")
    print(f"    canonical={canon[0] if canon else 'NONE'}")
    print(f"    h1={h1txt}  cjk={cjk}")
