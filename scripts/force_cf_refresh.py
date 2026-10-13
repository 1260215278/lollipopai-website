"""
强制 Cloudflare 重新获取 llms.txt
方法：touch 文件更新 last-modified，然后多次请求触发重新验证
"""
import paramiko
import sys
import time

sys.stdout.reconfigure(line_buffering=True)

HOST = "43.160.226.253"
USER = "ubuntu"
KEY_PATH = "C:/Users/Administrator/.ssh/id_ed25519_hermes"

pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=30)
print("Connected\n")

# 1. Touch llms.txt to update last-modified
print("=== Step 1: Touch files to update last-modified ===")
for d in ["/srv/www/lollipop/current", "/var/www/lollipop"]:
    for f in ["llms.txt", "llms-full.txt", ".well-known/llms.txt", ".well-known/llms-full.txt"]:
        path = f"{d}/{f}"
        stdin, stdout, stderr = client.exec_command(f"touch {path}", timeout=10)
        stdout.read()

# Verify last-modified
stdin, stdout, stderr = client.exec_command("stat -c '%y' /srv/www/lollipop/current/llms.txt", timeout=10)
print(f"  /srv llms.txt mtime: {stdout.read().decode().strip()}")

# 2. Reload Caddy
print("\n=== Step 2: Reload Caddy ===")
stdin, stdout, stderr = client.exec_command("sudo caddy reload --config /etc/caddy/Caddyfile --force 2>&1 | tail -3", timeout=30)
stdout.read()
time.sleep(3)

# 3. Make multiple requests to trigger CF revalidation
print("\n=== Step 3: Multiple CF requests to trigger revalidation ===")
for i in range(10):
    stdin, stdout, stderr = client.exec_command(
        f"curl -s -H 'Cache-Control: no-cache' 'https://www.lollipop.im/llms.txt?r={i}_{int(time.time())}' | grep -c '## Platform Comparisons'",
        timeout=15
    )
    count = stdout.read().decode().strip()
    print(f"  Request {i+1}: Platform Comparisons = {count}")
    if count == "1":
        print("  SUCCESS!")
        break
    time.sleep(5)

# 4. Final check
print("\n=== Step 4: Final check ===")
stdin, stdout, stderr = client.exec_command(
    "curl -sI https://www.lollipop.im/llms.txt | grep -i 'last-modified\\|cf-cache\\|etag'",
    timeout=15
)
print(f"  Headers: {stdout.read().decode().strip()}")

stdin, stdout, stderr = client.exec_command(
    "curl -s https://www.lollipop.im/llms.txt | grep -c '## Platform Comparisons'",
    timeout=15
)
print(f"  Content: {stdout.read().decode().strip()}")

# 5. Also try with a completely different URL (maybe CF respects query strings for .txt)
print("\n=== Step 5: Try with query string variations ===")
for qs in ["?v=2", "?t=20261012", "?cb=12345", "?_=" + str(int(time.time()))]:
    stdin, stdout, stderr = client.exec_command(
        f"curl -s 'https://www.lollipop.im/llms.txt{qs}' | grep -c '## Platform Comparisons'",
        timeout=15
    )
    print(f"  {qs}: {stdout.read().decode().strip()}")

client.close()
print("\nDone")
