"""
快速部署：只上传首页 HTML（含 llms-txt link 标签）
"""
import paramiko
import os
import sys

sys.stdout.reconfigure(line_buffering=True)

HOST = "43.160.226.253"
USER = "ubuntu"
KEY_PATH = "C:/Users/Administrator/.ssh/id_ed25519_hermes"
DIST_DIR = r"c:\Users\Administrator\Documents\lollipop\dist"

pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)

# 上传首页 HTML + llms.txt 文件
files_to_upload = [
    ("index.html", "/srv/www/lollipop/current/index.html"),
    ("index.html", "/var/www/lollipop/index.html"),
    ("llms.txt", "/srv/www/lollipop/current/llms.txt"),
    ("llms.txt", "/var/www/lollipop/llms.txt"),
    ("llms-full.txt", "/srv/www/lollipop/current/llms-full.txt"),
    ("llms-full.txt", "/var/www/lollipop/llms-full.txt"),
    (".well-known/llms.txt", "/srv/www/lollipop/current/.well-known/llms.txt"),
    (".well-known/llms.txt", "/var/www/lollipop/.well-known/llms.txt"),
    (".well-known/llms-full.txt", "/srv/www/lollipop/current/.well-known/llms-full.txt"),
    (".well-known/llms-full.txt", "/var/www/lollipop/.well-known/llms-full.txt"),
]

print("=== Uploading files ===")
transport = paramiko.Transport((HOST, 22))
transport.set_keepalive(10)
transport.connect(username=USER, pkey=pkey)
sftp = paramiko.SFTPClient.from_transport(transport)

for local_rel, remote_path in files_to_upload:
    local_path = os.path.join(DIST_DIR, local_rel.replace("/", os.sep))
    if not os.path.exists(local_path):
        print(f"  SKIP {local_rel} (not found)")
        continue
    try:
        sftp.put(local_path, remote_path)
        remote_stat = sftp.stat(remote_path)
        local_size = os.path.getsize(local_path)
        status = "OK" if remote_stat.st_size == local_size else "SIZE MISMATCH"
        print(f"  {status} {local_rel} -> {remote_path} ({remote_stat.st_size} bytes)")
    except Exception as e:
        print(f"  FAIL {local_rel}: {e}")

sftp.close()
transport.close()

# 验证
print("\n=== Verification ===")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=30)

checks = [
    ("Origin index.html llms-txt link", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/ | grep -c 'llms-txt'"),
    ("Origin llms.txt Platform Comparisons", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/llms.txt | grep -c '## Platform Comparisons'"),
    ("Origin llms.txt 80% share", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/llms.txt | grep -c '80% revenue share'"),
    ("Origin llms.txt 70% (should be 0)", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/llms.txt | grep -c 'up to 70%'"),
    ("CF index.html llms-txt link", "curl -s https://www.lollipop.im/ | grep -c 'llms-txt'"),
    ("CF llms.txt Platform Comparisons", "curl -s https://www.lollipop.im/llms.txt | grep -c '## Platform Comparisons'"),
]

for label, cmd in checks:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
    result = stdout.read().decode().strip()
    print(f"  {label}: {result}")

client.close()
print("\nDone")
