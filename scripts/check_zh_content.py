import re, urllib.request, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None

opener = urllib.request.build_opener(NoRedirect, urllib.request.HTTPSHandler(context=ctx))

for u in ["https://www.lollipop.im/zh/about/", "https://www.lollipop.im/about/", "https://www.lollipop.im/zh/"]:
    try:
        req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"})
        r = opener.open(req, timeout=20)
        body = r.read(300000).decode("utf-8", "ignore")
        status = r.status
        hdrs = r.headers
    except Exception as e:
        print(f"{u} -> EXC {e}\n")
        continue
    h1 = re.findall(r"<h1[^>]*>(.*?)</h1>", body, re.S)
    h1txt = re.sub(r"<[^>]+>", "", h1[0]).strip()[:90] if h1 else "NONE"
    cjk = len(re.findall(r"[\u4e00-\u9fff]", body))
    title = re.findall(r"<title>(.*?)</title>", body, re.S)
    print(f"{u} status={status}")
    print(f"  server={hdrs.get('server')} cf-cache={hdrs.get('cf-cache-status')} cache={hdrs.get('cache-control')}")
    print(f"  title={title[0][:80] if title else 'NONE'}")
    print(f"  h1={h1txt}")
    print(f"  cjk_chars={cjk}")
    print()
