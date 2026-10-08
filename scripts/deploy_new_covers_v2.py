import paramiko
import os
import sys

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)

HOST = "43.160.226.253"
USER = "ubuntu"
KEY_PATH = "C:/Users/Administrator/.ssh/id_ed25519_hermes"
LOCAL_IMG_DIR = r"c:\Users\Administrator\Documents\lollipop\public\blog-images"
REMOTE_IMG_DIR = "/srv/www/lollipop/current/blog-images"

new_images = [
    "reelshort-alternative-lollipop-vs-reelshort-dramabox-2026.webp",
    "what-is-ai-short-drama-2026.webp",
    "best-ai-short-drama-platforms-2026.webp",
    "ai-short-drama-monetization.webp",
    "ai-short-drama-overseas-compliance.webp",
    "ai-influencer-monetization.webp",
    "ai-short-drama-industry-trends-2026.webp",
    "ai-short-drama-promotion-guide-2026.webp",
    "ai-short-drama-7-day-tutorial-2026.webp",
]

print("Connecting...")
pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=30)
sftp = client.open_sftp()
print("Connected")

# Upload new images
for i, img in enumerate(new_images, 1):
    local_path = os.path.join(LOCAL_IMG_DIR, img)
    remote_path = f"{REMOTE_IMG_DIR}/{img}"
    size = os.path.getsize(local_path)
    print(f"  [{i}/9] Uploading {img} ({size/1024:.0f}KB)...")
    sftp.put(local_path, remote_path)
    print(f"    Done")

# Verify
print("\nVerifying images...")
all_ok = True
for img in new_images:
    try:
        sftp.stat(f"{REMOTE_IMG_DIR}/{img}")
        print(f"  {img}: OK")
    except:
        print(f"  {img}: MISSING!")
        all_ok = False

sftp.close()

# Now update HTML files - rebuild needed
print("\nUpdating blog HTML files...")
# We need to upload the updated index.html and blog pages
# The dist folder has prerendered HTML

# Upload key HTML files
LOCAL_DIST = r"c:\Users\Administrator\Documents\lollipop\dist"

# Upload main index and blog list
html_files = [
    "index.html",
    "blog/index.html",
    "blog/category/guide/index.html",
    "blog/category/tutorial/index.html",
    "blog/category/industry/index.html",
    "blog/category/review/index.html",
    "blog/category/prompt/index.html",
]

print("Uploading HTML files...")
sftp = client.open_sftp()
for i, hf in enumerate(html_files, 1):
    local = os.path.join(LOCAL_DIST, hf)
    remote = f"/srv/www/lollipop/current/{hf}"
    if os.path.exists(local):
        size = os.path.getsize(local)
        print(f"  [{i}] {hf} ({size/1024:.0f}KB)")
        # Ensure remote dir exists
        remote_dir = os.path.dirname(remote)
        try:
            sftp.stat(remote_dir)
        except:
            # Create directory recursively
            parts = remote_dir.split('/')
            for j in range(2, len(parts)+1):
                d = '/'.join(parts[:j])
                try:
                    sftp.stat(d)
                except:
                    sftp.mkdir(d)
        sftp.put(local, remote)
    else:
        print(f"  [{i}] {hf}: NOT FOUND LOCALLY")

# Upload individual blog post HTML files
print("\nUploading individual blog post pages...")
blog_slugs = [
    "reelshort-alternative-lollipop-vs-reelshort-dramabox-2026",
    "what-is-ai-short-drama-2026",
    "best-ai-short-drama-platforms-2026",
    "ai-short-drama-monetization",
    "ai-short-drama-overseas-compliance",
    "ai-influencer-monetization",
    "ai-short-drama-industry-trends-2026",
    "ai-short-drama-promotion-guide-2026",
    "ai-short-drama-7-day-tutorial-2026",
]

for i, slug in enumerate(blog_slugs, 1):
    local = os.path.join(LOCAL_DIST, "blog", slug, "index.html")
    remote = f"/srv/www/lollipop/current/blog/{slug}/index.html"
    if os.path.exists(local):
        size = os.path.getsize(local)
        print(f"  [{i}/9] blog/{slug}/ ({size/1024:.0f}KB)")
        remote_dir = f"/srv/www/lollipop/current/blog/{slug}"
        try:
            sftp.stat(remote_dir)
        except:
            sftp.mkdir(remote_dir)
        sftp.put(local, remote)
    else:
        print(f"  [{i}/9] blog/{slug}/: NOT FOUND")

# Upload sitemap and llms.txt
print("\nUploading sitemap & llms...")
for f in ["sitemap.xml", "llms.txt", "llms-full.txt", "robots.txt"]:
    local = os.path.join(LOCAL_DIST, f)
    remote = f"/srv/www/lollipop/current/{f}"
    if os.path.exists(local):
        sftp.put(local, remote)
        print(f"  {f}: OK")

# Upload assets (CSS/JS)
print("\nUploading assets (CSS/JS)...")
assets_dir = os.path.join(LOCAL_DIST, "assets")
remote_assets = "/srv/www/lollipop/current/assets"

# Get list of asset files
asset_files = os.listdir(assets_dir)
css_js = [f for f in asset_files if f.endswith('.css') or f.endswith('.js')]
print(f"  Found {len(css_js)} CSS/JS files")
for i, f in enumerate(css_js, 1):
    local = os.path.join(assets_dir, f)
    remote = f"{remote_assets}/{f}"
    sftp.put(local, remote)
    if i % 5 == 0 or i == len(css_js):
        print(f"    {i}/{len(css_js)}")

sftp.close()

# Final verification
print("\n=== Final Verification ===")
stdin, stdout, stderr = client.exec_command(
    f"ls {REMOTE_IMG_DIR}/*.webp 2>/dev/null | wc -l", timeout=10
)
webp_count = stdout.read().decode().strip()
print(f"  WebP images on server: {webp_count}")

stdin, stdout, stderr = client.exec_command(
    f"ls {REMOTE_IMG_DIR}/ | wc -l", timeout=10
)
total = stdout.read().decode().strip()
print(f"  Total blog-images: {total}")

# Check specific new files
for img in new_images:
    stdin, stdout, stderr = client.exec_command(
        f"test -f {REMOTE_IMG_DIR}/{img} && echo OK || echo MISSING", timeout=5
    )
    result = stdout.read().decode().strip()
    status = "OK" if result == "OK" else "MISSING"
    if status == "MISSING":
        all_ok = False

print(f"  All 9 new images: {'YES' if all_ok else 'NO'}")

client.close()
print("\nDone!")
