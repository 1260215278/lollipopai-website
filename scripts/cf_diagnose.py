"""
尝试更多方法清除 Cloudflare 缓存
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

# 1. Check Cloudflare response headers in detail
print("=== Full CF response headers ===")
stdin, stdout, stderr = client.exec_command(
    "curl -sI https://www.lollipop.im/llms.txt",
    timeout=15
)
print(stdout.read().decode())

# 2. Try with different URL casing (Cloudflare may cache by URL)
print("=== Try /LLMS.txt ===")
stdin, stdout, stderr = client.exec_command(
    "curl -s https://www.lollipop.im/LLMS.txt | grep -c '## Platform Comparisons' 2>&1",
    timeout=15
)
print(f"  /LLMS.txt: {stdout.read().decode().strip()}")

# 3. Try with trailing slash
print("\n=== Try /llms.txt/ ===")
stdin, stdout, stderr = client.exec_command(
    "curl -s 'https://www.lollipop.im/llms.txt/' | head -5 2>&1",
    timeout=15
)
print(f"  /llms.txt/: {stdout.read().decode().strip()[:200]}")

# 4. Try origin directly via IP with Host header (HTTP, not HTTPS)
print("\n=== Try HTTP origin with Host header ===")
stdin, stdout, stderr = client.exec_command(
    "curl -s -H 'Host: www.lollipop.im' http://127.0.0.1/llms.txt | grep -c '## Platform Comparisons'",
    timeout=15
)
print(f"  HTTP origin: {stdout.read().decode().strip()}")

# 5. Try through Cloudflare with Purge header
print("\n=== Try with Cloudflare purge headers ===")
stdin, stdout, stderr = client.exec_command(
    "curl -s -H 'CF-Purge-Everything: 1' -H 'Cache-Control: no-cache, no-store, must-revalidate' -H 'Pragma: no-cache' https://www.lollipop.im/llms.txt | grep -c '## Platform Comparisons'",
    timeout=15
)
print(f"  With purge headers: {stdout.read().decode().strip()}")

# 6. Check if Cloudflare has Always Online or Tiered Cache
print("\n=== Check CF response for tiered cache ===")
stdin, stdout, stderr = client.exec_command(
    "curl -sI https://www.lollipop.im/llms.txt | grep -i 'cf-\\|tier\\|edge\\|col'",
    timeout=15
)
print(f"  {stdout.read().decode().strip()}")

# 7. Try via different edge (use --resolve to a different CF IP)
print("\n=== Try different CF edge ===")
stdin, stdout, stderr = client.exec_command(
    "dig www.lollipop.im +short",
    timeout=10
)
ips = stdout.read().decode().strip()
print(f"  DNS IPs: {ips}")

# 8. Check if Cloudflare is configured to cache everything (Page Rule)
print("\n=== Check if CF caches .txt by default ===")
stdin, stdout, stderr = client.exec_command(
    "curl -sI 'https://www.lollipop.im/test-nonexistent.txt' | grep -i 'cf-cache'",
    timeout=15
)
print(f"  Nonexistent .txt CF status: {stdout.read().decode().strip()}")

# 9. Try to use Cloudflare API if token exists in .hermes/.env
print("\n=== Search for CF API credentials ===")
stdin, stdout, stderr = client.exec_command(
    "cat /home/ubuntu/.hermes/.env 2>/dev/null",
    timeout=10
)
hermes_env = stdout.read().decode().strip()
if hermes_env:
    # Look for CF-related vars
    for line in hermes_env.split('\n'):
        if any(kw in line.upper() for kw in ['CLOUD', 'CF_', 'ZONE', 'API', 'TOKEN']):
            print(f"  Found: {line}")
else:
    print("  .hermes/.env not found or empty")

# 10. Check if there's a Cloudflare config file
print("\n=== Search for CF config ===")
stdin, stdout, stderr = client.exec_command(
    "find /home/ubuntu -maxdepth 3 -name '*.cloudflare*' -o -name 'cloudflare*' -o -name 'wrangler*' 2>/dev/null | head -5",
    timeout=10
)
print(f"  CF config files: {stdout.read().decode().strip()}")

stdin, stdout, stderr = client.exec_command(
    "find /etc -maxdepth 2 -name '*cloudflare*' 2>/dev/null | head -5",
    timeout=10
)
print(f"  /etc CF files: {stdout.read().decode().strip()}")

client.close()
print("\nDone")
