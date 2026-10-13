"""
快速部署：只上传 llms.txt / llms-full.txt 及 .well-known 副本
HTML 文件上次已部署，无需重复上传 43.9MB
"""
import paramiko
import os
import sys
import time

sys.stdout.reconfigure(line_buffering=True)

HOST = "43.160.226.253"
USER = "ubuntu"
KEY_PATH = "C:/Users/Administrator/.ssh/id_ed25519_hermes"
DIST_DIR = r"c:\Users\Administrator\Documents\lollipop\dist"

pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)

# 要上传的文件列表（相对 dist 目录）
files_to_upload = [
    ("llms.txt", "/srv/www/lollipop/current/llms.txt"),
    ("llms.txt", "/var/www/lollipop/llms.txt"),
    ("llms-full.txt", "/srv/www/lollipop/current/llms-full.txt"),
    ("llms-full.txt", "/var/www/lollipop/llms-full.txt"),
    (".well-known/llms.txt", "/srv/www/lollipop/current/.well-known/llms.txt"),
    (".well-known/llms.txt", "/var/www/lollipop/.well-known/llms.txt"),
    (".well-known/llms-full.txt", "/srv/www/lollipop/current/.well-known/llms-full.txt"),
    (".well-known/llms-full.txt", "/var/www/lollipop/.well-known/llms-full.txt"),
]

print("=== Uploading llms.txt files ===")
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
        # Verify
        remote_stat = sftp.stat(remote_path)
        local_size = os.path.getsize(local_path)
        status = "OK" if remote_stat.st_size == local_size else "SIZE MISMATCH"
        print(f"  {status} {local_rel} -> {remote_path} ({remote_stat.st_size} bytes)")
    except Exception as e:
        print(f"  FAIL {local_rel}: {e}")

sftp.close()
transport.close()

# Verify on server
print("\n=== Verification ===")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=30)

checks = [
    ("llms.txt Platform Comparisons (/srv)", "grep -c '## Platform Comparisons' /srv/www/lollipop/current/llms.txt"),
    ("llms.txt Fanvue line (/srv)", "grep 'fanvue-vs-lollipop' /srv/www/lollipop/current/llms.txt | head -1"),
    ("llms.txt ReelShort line (/srv)", "grep 'reelshort-alternative' /srv/www/lollipop/current/llms.txt | head -1"),
    ("llms-full.txt Platform Comparisons (/srv)", "grep -c '## Platform Comparisons' /srv/www/lollipop/current/llms-full.txt"),
    ("llms.txt Platform Comparisons (/var)", "grep -c '## Platform Comparisons' /var/www/lollipop/llms.txt"),
    ("llms.txt line count (/srv)", "wc -l /srv/www/lollipop/current/llms.txt"),
    ("Curl https://www.lollipop.im/llms.txt", "curl -s https://www.lollipop.im/llms.txt | grep -c '## Platform Comparisons'"),
    ("Curl Fanvue line", "curl -s https://www.lollipop.im/llms.txt | grep 'fanvue-vs-lollipop' | head -1"),
    ("Curl ReelShort line", "curl -s https://www.lollipop.im/llms.txt | grep 'reelshort-alternative' | head -1"),
]

for label, cmd in checks:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
    result = stdout.read().decode().strip()
    print(f"  {label}: {result}")

client.close()
print("\n=== Done ===")
