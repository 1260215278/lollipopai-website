import paramiko
import os
import sys
import time
import tarfile

sys.stdout.reconfigure(line_buffering=True)

HOST = "43.160.226.253"
USER = "ubuntu"
KEY_PATH = "C:/Users/Administrator/.ssh/id_ed25519_hermes"
LOCAL_TAR = r"c:\Users\Administrator\Documents\lollipop\packages\lollipop-deploy-clean.tar.gz"
REMOTE_TAR = "/tmp/lollipop-deploy-clean.tar.gz"
DIST_DIR = r"c:\Users\Administrator\Documents\lollipop\dist"

# Step 1: Create fresh tar
print("=== Step 1: Creating fresh deployment package ===")
if os.path.exists(LOCAL_TAR):
    os.remove(LOCAL_TAR)

with tarfile.open(LOCAL_TAR, 'w:gz') as tar:
    for root, dirs, files in os.walk(DIST_DIR):
        for f in files:
            full = os.path.join(root, f)
            arc = os.path.relpath(full, DIST_DIR)
            tar.add(full, arcname=arc)

size = os.path.getsize(LOCAL_TAR)
print(f"  Package size: {size/1024/1024:.1f}MB")

# Step 2: Verify local tar content
print("\n=== Step 2: Verifying local tar content ===")
with tarfile.open(LOCAL_TAR, 'r:gz') as tar:
    try:
        llms_data = tar.extractfile('llms.txt').read().decode()
        has_comparisons = '## Platform Comparisons' in llms_data
        print(f"  llms.txt: has Platform Comparisons = {has_comparisons}")
    except Exception as e:
        print(f"  llms.txt: ERROR - {e}")

# Step 3: Connect and upload
print("\n=== Step 3: Uploading to server ===")
pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=30)
print("  Connected, deleting old remote tar...")
stdin, stdout, stderr = client.exec_command(f"rm -f {REMOTE_TAR}", timeout=10)
stdout.read()
client.close()

file_size = os.path.getsize(LOCAL_TAR)
max_retries = 3
uploaded = False

for attempt in range(1, max_retries + 1):
    print(f"  Upload attempt {attempt}...")
    try:
        transport = paramiko.Transport((HOST, 22))
        transport.set_keepalive(10)
        transport.connect(username=USER, pkey=pkey)
        sftp = paramiko.SFTPClient.from_transport(transport)

        remote_offset = 0
        try:
            remote_stat = sftp.stat(REMOTE_TAR)
            remote_offset = remote_stat.st_size
            if remote_offset > 0 and remote_offset < file_size:
                print(f"  Resuming from {remote_offset/1024/1024:.1f}MB ({remote_offset*100//file_size}%)")
        except:
            pass

        chunk = 256 * 1024
        lfile = open(LOCAL_TAR, 'rb')
        if remote_offset > 0 and remote_offset < file_size:
            lfile.seek(remote_offset)
            rfile = sftp.open(REMOTE_TAR, 'r+b')
            rfile.seek(remote_offset)
        else:
            rfile = sftp.open(REMOTE_TAR, 'wb')

        offset = remote_offset
        last_report = 0
        while offset < file_size:
            data = lfile.read(chunk)
            if not data:
                break
            rfile.write(data)
            offset += len(data)
            now = time.time()
            if now - last_report > 5:
                print(f"    {offset/1024/1024:.1f} MB / {file_size/1024/1024:.1f} MB ({offset*100//file_size}%)")
                last_report = now

        rfile.close()
        lfile.close()

        remote_stat = sftp.stat(REMOTE_TAR)
        if remote_stat.st_size == file_size:
            print(f"  Upload complete! Size verified: {remote_stat.st_size/1024/1024:.1f}MB")
            uploaded = True
        else:
            print(f"  Size mismatch: local={file_size}, remote={remote_stat.st_size}")

        sftp.close()
        transport.close()

        if uploaded:
            break
    except Exception as e:
        print(f"  Attempt {attempt} failed: {e}")
        time.sleep(3)

if not uploaded:
    print("ERROR: Upload failed after all retries!")
    sys.exit(1)

# Step 4: Extract and verify
print("\n=== Step 4: Extracting to temp directory ===")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=30)

stdin, stdout, stderr = client.exec_command(
    "rm -rf /tmp/lollipop-clean && mkdir -p /tmp/lollipop-clean && "
    "cd /tmp/lollipop-clean && tar xzf /tmp/lollipop-deploy-clean.tar.gz 2>&1",
    timeout=120
)
stdout.read()

# Step 5: Verify temp directory
print("\n=== Step 5: Verifying temp directory ===")
checks = [
    ("HTML file count", "find /tmp/lollipop-clean -name '*.html' -type f | wc -l"),
    ("Sitemap URLs", "grep -c '<loc>' /tmp/lollipop-clean/sitemap.xml"),
    ("llms.txt has Platform Comparisons", "grep -c '## Platform Comparisons' /tmp/lollipop-clean/llms.txt"),
    ("llms.txt Fanvue comparison", "grep 'fanvue-vs-lollipop' /tmp/lollipop-clean/llms.txt | head -1"),
    ("llms.txt ReelShort comparison", "grep 'reelshort-alternative' /tmp/lollipop-clean/llms.txt | head -1"),
    ("Canonical in blog", "grep 'rel=\"canonical\"' /tmp/lollipop-clean/blog/ai-short-drama-pillar-guide/index.html | head -1"),
    ("og:url in blog", "grep 'og:url' /tmp/lollipop-clean/blog/ai-short-drama-pillar-guide/index.html | head -1"),
]

for label, cmd in checks:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
    result = stdout.read().decode().strip()
    print(f"  {label}: {result}")

# Step 6: Rsync to production
print("\n=== Step 6: Deploying to production ===")
stdin, stdout, stderr = client.exec_command(
    "sudo rsync -a --delete /tmp/lollipop-clean/ /srv/www/lollipop/current/ 2>&1",
    timeout=180
)
stdout.read()
print("  /srv/www/lollipop/current/ - Done")

stdin, stdout, stderr = client.exec_command(
    "sudo rsync -a --delete /tmp/lollipop-clean/ /var/www/lollipop/ 2>&1",
    timeout=180
)
stdout.read()
print("  /var/www/lollipop/ - Done")

# Step 7: Final verification
print("\n=== Step 7: Final verification ===")
final_checks = [
    ("HTML files in /srv", "find /srv/www/lollipop/current -name '*.html' -type f | wc -l"),
    ("Sitemap URLs (/srv)", "grep -c '<loc>' /srv/www/lollipop/current/sitemap.xml"),
    ("llms.txt Platform Comparisons (/srv)", "grep -c '## Platform Comparisons' /srv/www/lollipop/current/llms.txt"),
    ("llms.txt Fanvue line (/srv)", "grep 'fanvue-vs-lollipop' /srv/www/lollipop/current/llms.txt | head -1"),
    ("Canonical (/srv)", "grep 'rel=\"canonical\"' /srv/www/lollipop/current/blog/ai-short-drama-pillar-guide/index.html | head -1"),
    ("og:url (/srv)", "grep 'og:url' /srv/www/lollipop/current/blog/ai-short-drama-pillar-guide/index.html | head -1"),
    ("Caddy root", "grep -n 'root' /etc/caddy/Caddyfile | head -3"),
    ("/blog/ (no slash) redirect", "curl -sI -o /dev/null -w '%{http_code} -> %{redirect_url}' https://www.lollipop.im/blog 2>&1"),
    ("/blog/ (with slash) direct", "curl -sI -o /dev/null -w '%{http_code}' https://www.lollipop.im/blog/ 2>&1"),
    ("Homepage direct", "curl -sI -o /dev/null -w '%{http_code}' https://www.lollipop.im/ 2>&1"),
]

for label, cmd in final_checks:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
    result = stdout.read().decode().strip()
    print(f"  {label}: {result}")

# Cleanup
stdin, stdout, stderr = client.exec_command("rm -rf /tmp/lollipop-clean /tmp/lollipop-deploy-clean.tar.gz", timeout=10)
stdout.read()

client.close()
print("\n=== Deployment complete! ===")
