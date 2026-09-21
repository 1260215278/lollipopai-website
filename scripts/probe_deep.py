import urllib.request, ssl, re, warnings
warnings.filterwarnings("ignore")

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")
ctx = ssl.create_default_context(); ctx.check_hostname=False; ctx.verify_mode=ssl.CERT_NONE

def fetch(url, follow=True):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
            return r.status, dict(r.getheaders()), r.read().decode("utf-8","replace")
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), (e.read().decode("utf-8","replace") if e.fp else "")
    except Exception as e:
        return None, {}, f"ERR {e}"

BASE="https://www.lollipop.im"

# 1) sitemap URLs
st, sh, sm = fetch(BASE+"/sitemap.xml")
urls = re.findall(r"<loc>(.*?)</loc>", sm)
print(f"sitemap URLs={len(urls)}")
lang_prefix = {}
for u in urls:
    m = re.match(rf"{BASE}/(en|zh|zh-TW|pt|es|ar)/", u)
    lang_prefix[m.group(1) if m else "root"] = lang_prefix.get(m.group(1) if m else "root",0)+1
print("by lang prefix:", lang_prefix)

# 2) probe login/forgot (expect noindex)
for p in ["/login","/forgot-password"]:
    s,h,b = fetch(BASE+p)
    print(f"{p}: status={s} noindex={'noindex' in b.lower()} has_canonical={('canonical' in b.lower())}")

# 3) sample real sitemap URLs for noindex
import random
random.seed(1)
sample = random.sample(urls, min(20, len(urls)))
print("\n--- sample sitemap URL noindex check ---")
noidx_found=[]
for u in sample:
    s,h,b = fetch(u)
    ni = "noindex" in b.lower()
    if ni: noidx_found.append(u)
    print(f"  {u}  status={s}  noindex={ni}")
print(f"\nnoindex among {len(sample)} sampled: {len(noidx_found)}")

# 4) probe guessed /lollipop/* legacy URLs -> confirm 301
print("\n--- legacy /lollipop/* probe (status only) ---")
for p in ["/lollipop/about","/lollipop/blog","/lollipop/","/lollipop/en/about"]:
    s,h,b = fetch(BASE+p, follow=False)
    loc = h.get("Location")
    print(f"  {p}: status={s} Location={loc}")
