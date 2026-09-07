"""打人工上传包：完整版（含 .br/.gz 预压缩）与精简版（去掉预压缩）。

用法:
  python scripts/package-upload.py
"""
import os, re, zipfile, datetime, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
OUT = os.path.join(ROOT, "packages")
STAMP = datetime.datetime.now().strftime("%Y%m%d-%H%M")

if not os.path.isdir(DIST):
    sys.exit(f"dist 不存在: {DIST}")
os.makedirs(OUT, exist_ok=True)

# 预压缩副本（Caddy precompressed 用；Cloudflare/面板直传场景可省）
PRECOMPRESSED = re.compile(r"\.(br|gz)$", re.I)


def collect(skip_precompressed: bool):
    files = []
    for dirpath, dirnames, filenames in os.walk(DIST):
        dirnames[:] = [d for d in dirnames if d != ".ssr"]
        for fn in filenames:
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, DIST).replace("\\", "/")
            if skip_precompressed and PRECOMPRESSED.search(rel):
                continue
            files.append((full, rel))
    return sorted(files)


def build(name: str, skip_precompressed: bool):
    path = os.path.join(OUT, name)
    files = collect(skip_precompressed)
    # 覆盖写
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for full, rel in files:
            z.write(full, rel)
    size = os.path.getsize(path) / 1048576
    print(f"  {name}: {len(files)} 文件, {size:.2f} MB")
    return path, len(files), size


print("==> 打包中")
full, n1, s1 = build(f"lollipop-upload-{STAMP}-full.zip", skip_precompressed=False)
slim, n2, s2 = build(f"lollipop-upload-{STAMP}-slim.zip", skip_precompressed=True)

print()
print("==> 包内容自检（关键文件必须在）")
CHECKS = [
    "index.html",
    "sitemap.xml",
    "robots.txt",
    "_redirects",
    "fc327f494d3f4612b851a2972530d549.txt",
    "about/index.html",
    "blog/index.html",
]
with zipfile.ZipFile(full) as z:
    names = set(z.namelist())
    for c in CHECKS:
        print(f"  {'OK ' if c in names else 'MISS'} {c}")
    canon = z.read("index.html").decode("utf-8", "ignore")
    m = re.search(r'<link rel="canonical" href="([^"]+)"', canon)
    print(f"  首页 canonical: {m.group(1) if m else 'NOT FOUND'}")
    prefixed = sum(1 for n in names if n.startswith("lollipop/"))
    print(f"  根目录 lollipop/ 子目录: {prefixed} (应为 0)")

print()
print("==> 产物")
print(f"  完整版（推荐 SSH / 面板 / Caddy 源站）: {full}")
print(f"  精简版（Cloudflare Pages 等自压缩环境）: {slim}")