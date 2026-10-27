"""
上传 HTML + llms + Markdown + sitemap/robots 文件
使用 tar 打包，在服务器解压

2026-10-24 修复：原脚本只 include *.html，导致 llms.txt / llms-full.txt /
.well-known/* / *.md / sitemap.xml / robots.txt 被静默跳过。
"""
import paramiko
import os
import sys
import time
import tarfile
import io
import re
import json
import urllib.request
import urllib.error

sys.stdout.reconfigure(line_buffering=True)

HOST = "43.160.226.253"
USER = "ubuntu"
KEY_PATH = "C:/Users/Administrator/.ssh/id_ed25519_hermes"
DIST_DIR = r"c:\Users\Administrator\Documents\lollipop\dist"
LOCAL_TAR = r"c:\Users\Administrator\Documents\lollipop\packages\html-only.tar.gz"
REMOTE_TAR = "/tmp/html-only.tar.gz"

pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)

# Step 1: Create tar with only HTML files
print("=== Step 1: Creating HTML-only tar ===")
if os.path.exists(LOCAL_TAR):
    os.remove(LOCAL_TAR)

DEPLOY_EXTS = ('.html', '.txt', '.md', '.xml')
DEPLOY_EXACT = {'robots.txt', 'llms.txt', 'llms-full.txt', 'sitemap.xml', 'BingSiteAuth.xml', 'Google*.html', 'yandex*.html', '*.txt'}
count = 0
with tarfile.open(LOCAL_TAR, 'w:gz') as tar:
    for root, dirs, files in os.walk(DIST_DIR):
        for f in files:
            full = os.path.join(root, f)
            arc = os.path.relpath(full, DIST_DIR)
            include = (
                f.endswith(DEPLOY_EXTS)
                or f == 'llms.txt'
                or f == 'llms-full.txt'
                or f.startswith('llms')
            )
            # Skip source maps and asset hashed files
            if f.endswith('.map'):
                continue
            # Only include llms*.txt files from root or .well-known/
            if f.startswith('llms') and os.path.dirname(arc) not in ('', '.well-known'):
                continue
            if include:
                tar.add(full, arcname=arc)
                count += 1

size = os.path.getsize(LOCAL_TAR)
print(f"  Files: {count}, Size: {size/1024/1024:.1f}MB")

# Step 2: Upload tar
print("\n=== Step 2: Uploading tar ===")
file_size = os.path.getsize(LOCAL_TAR)
for attempt in range(3):
    try:
        transport = paramiko.Transport((HOST, 22))
        transport.set_keepalive(5)
        transport.connect(username=USER, pkey=pkey)
        sftp = paramiko.SFTPClient.from_transport(transport)

        # Delete old tar
        try:
            sftp.remove(REMOTE_TAR)
        except:
            pass

        # Upload
        sftp.put(LOCAL_TAR, REMOTE_TAR)
        remote_stat = sftp.stat(REMOTE_TAR)
        if remote_stat.st_size == file_size:
            print(f"  Upload complete! {remote_stat.st_size/1024/1024:.1f}MB")
            sftp.close()
            transport.close()
            break
        else:
            print(f"  Size mismatch: local={file_size}, remote={remote_stat.st_size}")
            sftp.close()
            transport.close()
    except Exception as e:
        print(f"  Attempt {attempt+1} failed: {e}")
        time.sleep(2)
else:
    print("  FAILED after 3 attempts")
    sys.exit(1)

# Step 3: Extract on server
print("\n=== Step 3: Extracting ===")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=30)

# Extract to temp, then rsync
stdin, stdout, stderr = client.exec_command(
    "rm -rf /tmp/html-update && mkdir -p /tmp/html-update && "
    "cd /tmp/html-update && tar xzf /tmp/html-only.tar.gz 2>&1",
    timeout=120
)
stdout.read()
print("  Extracted")

# Step 4: Rsync to production (HTML + llms + md + sitemap/robots, no delete)
RSYNC_INCLUDES = "--include='*/' --include='.well-known/' --include='*.html' --include='*.md' --include='*.xml' --include='*.txt' --include='llms.txt' --include='llms-full.txt' --exclude='*'"
print("\n=== Step 4: Rsync to production ===")
stdin, stdout, stderr = client.exec_command(
    f"sudo rsync -a {RSYNC_INCLUDES} /tmp/html-update/ /srv/www/lollipop/current/ 2>&1",
    timeout=120
)
stdout.read()
print("  /srv/www/lollipop/current/ - Done")

stdin, stdout, stderr = client.exec_command(
    f"sudo rsync -a {RSYNC_INCLUDES} /tmp/html-update/ /var/www/lollipop/ 2>&1",
    timeout=120
)
stdout.read()
print("  /var/www/lollipop/ - Done")

# Step 5: Cleanup
stdin, stdout, stderr = client.exec_command("rm -rf /tmp/html-update /tmp/html-only.tar.gz", timeout=10)
stdout.read()

# Step 6: Verify
print("\n=== Step 6: Verification ===")
checks = [
    ("Origin / llms-txt link", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/ | grep -c 'llms-txt'"),
    ("Origin /about/ llms-txt link", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/about/ | grep -c 'llms-txt'"),
    ("Origin /blog/ llms-txt link", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/blog/ | grep -c 'llms-txt'"),
    ("Origin /creating/ llms-txt link", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/creating/ | grep -c 'llms-txt'"),
    ("Origin blog post llms-txt link", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/blog/ai-short-drama-pillar-guide/ | grep -c 'llms-txt'"),
    ("Origin llms.txt Platform Comparisons", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/llms.txt | grep -c '## Platform Comparisons'"),
    ("Origin llms.txt 80% share", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/llms.txt | grep -c '80% revenue share'"),
    ("CF / llms-txt link", "curl -s https://www.lollipop.im/ | grep -c 'llms-txt'"),
    ("CF llms.txt Platform Comparisons", "curl -s https://www.lollipop.im/llms.txt | grep -c '## Platform Comparisons'"),
]

for label, cmd in checks:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
    result = stdout.read().decode().strip()
    print(f"  {label}: {result}")

client.close()
print("\nDone")

# Step 7: IndexNow 推送（加速 Bing/Google 索引）
print("\n=== Step 7: IndexNow 推送 ===")
INDEXNOW_KEY = "9424f6f511b0ebf9e69d43cf9f260e25"
INDEXNOW_HOST = "www.lollipop.im"
INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow"

# 从本地 dist sitemap.xml 提取所有 URL
sitemap_path = os.path.join(DIST_DIR, "sitemap.xml")
if os.path.exists(sitemap_path):
    sitemap_xml = open(sitemap_path, encoding="utf-8").read()
    all_urls = re.findall(r"<loc>([^<]+)</loc>", sitemap_xml)
    # 只推 500 个（IndexNow 建议单次不超过 10000）
    push_urls = all_urls[:500]
    print(f"  Sitemap 共 {len(all_urls)} URL，推送前 {len(push_urls)} 个")

    payload = json.dumps({
        "host": INDEXNOW_HOST,
        "key": INDEXNOW_KEY,
        "urlList": push_urls,
    }).encode("utf-8")

    req = urllib.request.Request(
        INDEXNOW_ENDPOINT,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            status = resp.status
            body = resp.read().decode("utf-8", errors="replace")
            print(f"  IndexNow POST status: {status}")
            if status == 200:
                print(f"  ✅ 推送成功（Bing 通常 24-48h 内开始爬取）")
            else:
                print(f"  ⚠️ 非 200 响应: {body[:200]}")
    except urllib.error.HTTPError as e:
        print(f"  ❌ HTTP {e.code}: {e.read().decode(errors='replace')[:200]}")
    except Exception as e:
        print(f"  ❌ 推送失败: {e}")
else:
    print(f"  ⚠️ 未找到 sitemap.xml（{sitemap_path}），跳过 IndexNow")
