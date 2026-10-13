import paramiko
import sys

sys.stdout.reconfigure(line_buffering=True)

HOST = "43.160.226.253"
USER = "ubuntu"
KEY_PATH = "C:/Users/Administrator/.ssh/id_ed25519_hermes"

pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=30)
print("Connected\n")

# Step 1: Fix sitemap.xml - add trailing slashes to all URLs
# Pattern: <loc>https://www.lollipop.im/XXXX</loc> -> <loc>https://www.lollipop.im/XXXX/</loc>
# But don't double-slash the root: <loc>https://www.lollipop.im/</loc> should stay as is
print("=== Step 1: Fix sitemap.xml ===")
for remote_dir in ["/srv/www/lollipop/current", "/var/www/lollipop"]:
    sitemap = f"{remote_dir}/sitemap.xml"
    # Use sed to add trailing slash before </loc> for URLs that don't end with /
    # Skip root URL (https://www.lollipop.im/</loc>) which already has trailing slash
    cmd = f"""sed -i 's|<loc>https://www.lollipop.im/\\([^"]*[^/]\\)</loc>|<loc>https://www.lollipop.im/\\1/</loc>|g' {sitemap}"""
    stdin, stdout, stderr = client.exec_command(cmd, timeout=30)
    err = stderr.read().decode()
    if err:
        print(f"  {remote_dir}: sed error: {err[:100]}")
    
    # Also fix hreflang URLs in sitemap
    cmd2 = f"""sed -i 's|href="https://www.lollipop.im/\\([^"]*[^/"]\\)" />|href="https://www.lollipop.im/\\1/" />|g' {sitemap}"""
    stdin, stdout, stderr = client.exec_command(cmd2, timeout=30)
    err = stderr.read().decode()
    if err:
        print(f"  {remote_dir}: hreflang sed error: {err[:100]}")
    
    # Verify
    stdin, stdout, stderr = client.exec_command(f"head -10 {sitemap} | grep '<loc>'", timeout=10)
    result = stdout.read().decode().strip()
    print(f"  {remote_dir} sample sitemap:")
    for line in result.split('\n'):
        print(f"    {line.strip()}")

# Step 2: Fix canonical tags in HTML files
# Pattern: href="https://www.lollipop.im/XXXX" -> href="https://www.lollipop.im/XXXX/"
# Skip root URL and URLs that already have trailing slash
print("\n=== Step 2: Fix canonical/og:url/hreflang in HTML files ===")
for remote_dir in ["/srv/www/lollipop/current", "/var/www/lollipop"]:
    # Find all HTML files
    stdin, stdout, stderr = client.exec_command(f"find {remote_dir} -name '*.html' -type f", timeout=30)
    html_files = stdout.read().decode().strip().split('\n')
    print(f"  {remote_dir}: {len(html_files)} HTML files to process")
    
    # Use sed to fix canonical, og:url, and hreflang in each file
    # This sed handles: href="https://www.lollipop.im/PATH" where PATH doesn't end with /
    # and PATH is not empty (i.e., not the root URL)
    fixed = 0
    for html_file in html_files:
        if not html_file:
            continue
        # Fix canonical and hreflang: add trailing slash
        # Pattern: href="https://www.lollipop.im/word" or href="https://www.lollipop.im/word/word"
        # But NOT: href="https://www.lollipop.im/" (root)
        # And NOT: href="https://www.lollipop.im/word/" (already has slash)
        cmd = f"""sed -i 's|href="https://www.lollipop.im/\\([^"]*[^/"]\\)"|href="https://www.lollipop.im/\\1/"|g' '{html_file}'"""
        stdin, stdout, stderr = client.exec_command(cmd, timeout=10)
        
        # Fix og:url: content="https://www.lollipop.im/PATH" -> content="https://www.lollipop.im/PATH/"
        cmd2 = f"""sed -i 's|content="https://www.lollipop.im/\\([^"]*[^/"]\\)"|content="https://www.lollipop.im/\\1/"|g' '{html_file}'"""
        stdin, stdout, stderr = client.exec_command(cmd2, timeout=10)
        
        fixed += 1
        if fixed % 100 == 0:
            print(f"    Processed {fixed}/{len(html_files)}")
    
    print(f"  {remote_dir}: {fixed} files processed")

# Step 3: Fix llms.txt and llms-full.txt
print("\n=== Step 3: Fix llms.txt ===")
for remote_dir in ["/srv/www/lollipop/current", "/var/www/lollipop"]:
    for llms_file in ["llms.txt", "llms-full.txt", ".well-known/llms.txt", ".well-known/llms-full.txt"]:
        path = f"{remote_dir}/{llms_file}"
        cmd = f"""sed -i 's|({S}/\\([^)]*[^/)]\\))|({S}/\\1/)|g' '{path}' 2>/dev/null"""
        S = "https://www.lollipop.im"
        cmd = f"""sed -i 's|(https://www.lollipop.im/\\([^)]*[^/)]\\))|(https://www.lollipop.im/\\1/)|g' '{path}' 2>/dev/null"""
        stdin, stdout, stderr = client.exec_command(cmd, timeout=10)

# Step 4: Verify
print("\n=== VERIFICATION ===")
checks = [
    ("Sitemap URLs", "grep -c '<loc>' /srv/www/lollipop/current/sitemap.xml"),
    ("Sample sitemap", "head -5 /srv/www/lollipop/current/sitemap.xml | grep '<loc>' | head -3"),
    ("Canonical in blog", "grep 'rel=\"canonical\"' /srv/www/lollipop/current/blog/ai-short-drama-pillar-guide/index.html | head -1"),
    ("og:url in blog", "grep 'og:url' /srv/www/lollipop/current/blog/ai-short-drama-pillar-guide/index.html | head -1"),
    ("hreflang en", "grep 'hreflang=\"en\"' /srv/www/lollipop/current/blog/ai-short-drama-pillar-guide/index.html | head -1"),
    ("hreflang zh", "grep 'hreflang=\"zh\"' /srv/www/lollipop/current/blog/ai-short-drama-pillar-guide/index.html | head -1"),
    ("Caddy root", "grep 'root' /etc/caddy/Caddyfile | head -2"),
    ("www /blog/ test", "curl -sI -o /dev/null -w '%{http_code}' https://www.lollipop.im/blog/ 2>&1"),
    ("www /about/ test", "curl -sI -o /dev/null -w '%{http_code}' https://www.lollipop.im/about/ 2>&1"),
    ("www /blog redirect", "curl -sI -o /dev/null -w '%{http_code} -> %{redirect_url}' https://www.lollipop.im/blog 2>&1"),
]

for label, cmd in checks:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
    result = stdout.read().decode().strip()
    print(f"  {label}: {result}")

# Step 5: Check how many URLs now have trailing slash
stdin, stdout, stderr = client.exec_command(
    "grep '<loc>' /srv/www/lollipop/current/sitemap.xml | grep -v '/</loc>' | grep -v '/\"' | head -5",
    timeout=10
)
result = stdout.read().decode().strip()
if result:
    print(f"\n  URLs WITHOUT trailing slash (should be empty):")
    for line in result.split('\n'):
        print(f"    {line.strip()}")
else:
    print(f"\n  All sitemap URLs have trailing slashes: OK")

client.close()
print("\nDone!")
