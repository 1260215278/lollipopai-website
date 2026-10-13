"""
只上传 HTML 文件（含 llms-txt link 标签）
使用 tar 打包，在服务器解压
"""
import paramiko
import os
import sys
import time
import tarfile
import io

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

count = 0
with tarfile.open(LOCAL_TAR, 'w:gz') as tar:
    for root, dirs, files in os.walk(DIST_DIR):
        for f in files:
            if f.endswith('.html'):
                full = os.path.join(root, f)
                arc = os.path.relpath(full, DIST_DIR)
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

# Step 4: Rsync HTML files to production (only .html files, no delete)
print("\n=== Step 4: Rsync to production ===")
stdin, stdout, stderr = client.exec_command(
    "sudo rsync -a --include='*/' --include='*.html' --exclude='*' /tmp/html-update/ /srv/www/lollipop/current/ 2>&1",
    timeout=120
)
stdout.read()
print("  /srv/www/lollipop/current/ - Done")

stdin, stdout, stderr = client.exec_command(
    "sudo rsync -a --include='*/' --include='*.html' --exclude='*' /tmp/html-update/ /var/www/lollipop/ 2>&1",
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
