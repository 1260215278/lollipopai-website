"""
检查 Caddy precompressed 是否返回旧的 .gz/.br 文件
"""
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

# 1. Check for .gz and .br versions of llms.txt
print("=== Check precompressed files ===")
for d in ["/srv/www/lollipop/current", "/var/www/lollipop"]:
    for ext in [".gz", ".br", ".zst"]:
        path = f"{d}/llms.txt{ext}"
        stdin, stdout, stderr = client.exec_command(f"ls -la {path} 2>&1", timeout=10)
        result = stdout.read().decode().strip()
        print(f"  {path}: {result}")

# 2. Check content of precompressed files
print("\n=== Check .gz content ===")
stdin, stdout, stderr = client.exec_command(
    "zcat /srv/www/lollipop/current/llms.txt.gz 2>/dev/null | grep -c '## Platform Comparisons'",
    timeout=10
)
print(f"  /srv llms.txt.gz: Platform Comparisons = {stdout.read().decode().strip()}")

stdin, stdout, stderr = client.exec_command(
    "zcat /var/www/lollipop/llms.txt.gz 2>/dev/null | grep -c '## Platform Comparisons'",
    timeout=10
)
print(f"  /var llms.txt.gz: Platform Comparisons = {stdout.read().decode().strip()}")

print("\n=== Check .br content ===")
stdin, stdout, stderr = client.exec_command(
    "zstd -d /srv/www/lollipop/current/llms.txt.zst -c 2>/dev/null | grep -c '## Platform Comparisons'",
    timeout=10
)
print(f"  /srv llms.txt.zst: Platform Comparisons = {stdout.read().decode().strip()}")

# 3. Delete precompressed files and test
print("\n=== Delete precompressed llms.txt files ===")
for d in ["/srv/www/lollipop/current", "/var/www/lollipop"]:
    for ext in [".gz", ".br", ".zst"]:
        path = f"{d}/llms.txt{ext}"
        stdin, stdout, stderr = client.exec_command(f"sudo rm -f {path}", timeout=10)
        stdout.read()
        print(f"  Deleted {path}")

# 4. Test origin again
print("\n=== Test origin after deleting precompressed ===")
stdin, stdout, stderr = client.exec_command(
    "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 -H 'Accept-Encoding: gzip' https://www.lollipop.im/llms.txt | grep -c '## Platform Comparisons'",
    timeout=15
)
print(f"  Origin (gzip): {stdout.read().decode().strip()}")

stdin, stdout, stderr = client.exec_command(
    "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/llms.txt | grep -c '## Platform Comparisons'",
    timeout=15
)
print(f"  Origin (plain): {stdout.read().decode().strip()}")

# 5. Test through Cloudflare
print("\n=== Test through Cloudflare ===")
stdin, stdout, stderr = client.exec_command(
    "curl -s 'https://www.lollipop.im/llms.txt?fresh=1' | grep -c '## Platform Comparisons'",
    timeout=15
)
print(f"  CF (?fresh=1): {stdout.read().decode().strip()}")

stdin, stdout, stderr = client.exec_command(
    "curl -s -H 'Accept: text/plain' 'https://www.lollipop.im/llms.txt' | grep -c '## Platform Comparisons'",
    timeout=15
)
print(f"  CF (text/plain): {stdout.read().decode().strip()}")

# 6. Check last-modified again
print("\n=== Headers after fix ===")
stdin, stdout, stderr = client.exec_command(
    "curl -sI https://www.lollipop.im/llms.txt | grep -i 'last-modified\\|cf-cache\\|etag'",
    timeout=15
)
print(f"  {stdout.read().decode().strip()}")

client.close()
print("\nDone")
