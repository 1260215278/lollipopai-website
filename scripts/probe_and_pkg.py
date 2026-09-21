import urllib.request, ssl, re, glob, os, zipfile, warnings
warnings.filterwarnings("ignore")

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
            body = r.read().decode("utf-8", "replace")
            return r.status, dict(r.getheaders()), body
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace") if e.fp else ""
        return e.code, dict(e.headers), body
    except Exception as e:
        return None, {}, f"ERR {e}"

BASE = "https://www.lollipop.im"

print("========== PRODUCTION PROBE ==========")
paths = ["/", "/about", "/blog", "/lollipop/about", "/sitemap.xml"]
for p in paths:
    url = BASE + p
    status, hdr, body = fetch(url)
    lm = hdr.get("Last-Modified", "?")
    canon = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)', body)
    canon2 = re.search(r'href=["\']([^"\']+)["\'][^>]*rel=["\']canonical', body)
    canon = canon or canon2
    noidx = ("noindex" in body.lower())
    idx = ("index" in body.lower() and "noindex" not in body.lower())
    print(f"\n--- {p}  status={status}  Last-Modified={lm}")
    print(f"    canonical={canon.group(1) if canon else 'NONE'}")
    print(f"    noindex_present={noidx}")
    if p == "/sitemap.xml":
        urls = re.findall(r"<loc>(.*?)</loc>", body)
        print(f"    sitemap <loc> count={len(urls)}")
        pref = [u for u in urls if "/lollipop/" in u]
        print(f"    contains /lollipop/ prefix = {len(pref)}  (sample: {pref[:2]})")
        root = [u for u in urls if "/lollipop/" not in u]
        print(f"    clean root URLs = {len(root)}  (sample: {root[:2]})")

print("\n========== UPLOAD PACKAGE CHECK ==========")
zips = sorted(glob.glob(r"C:\Users\Administrator\Documents\lollipop\packages\*upload*.zip"),
              key=os.path.getmtime, reverse=True)
print("Found packages:", [os.path.basename(z) for z in zips])
if zips:
    z = zips[0]
    print("Inspecting:", os.path.basename(z))
    with zipfile.ZipFile(z) as zf:
        names = zf.namelist()
        # find about.html and sitemap.xml
        about = [n for n in names if n.endswith("about.html")][:1]
        sm = [n for n in names if n.endswith("sitemap.xml")][:1]
        for target in about + sm:
            data = zf.read(target).decode("utf-8", "replace")
            if "sitemap" in target:
                urls = re.findall(r"<loc>(.*?)</loc>", data)
                pref = [u for u in urls if "/lollipop/" in u]
                print(f"  PKG {target}: <loc>={len(urls)}  /lollipop/ prefix={len(pref)}")
            else:
                canon = re.search(r'rel=["\']canonical["\'][^>]+href=["\']([^"\']+)', data)
                canon2 = re.search(r'href=["\']([^"\']+)["\'][^>]*rel=["\']canonical', data)
                canon = canon or canon2
                noidx = "noindex" in data.lower()
                print(f"  PKG {target}: canonical={canon.group(1) if canon else 'NONE'}  noindex={noidx}")
