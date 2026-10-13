"""
通过 Cloudflare API 清除缓存（需要 API token）
如果没有 token，提供手动操作指引
"""
import paramiko
import sys
import json

sys.stdout.reconfigure(line_buffering=True)

HOST = "43.160.226.253"
USER = "ubuntu"
KEY_PATH = "C:/Users/Administrator/.ssh/id_ed25519_hermes"

pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=30)
print("Connected\n")

# Step 1: Verify origin serves correct content (bypass Cloudflare)
print("=== Step 1: Verify origin (bypass Cloudflare) ===")
stdin, stdout, stderr = client.exec_command(
    "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/llms.txt | grep -c '## Platform Comparisons'",
    timeout=15
)
origin_count = stdout.read().decode().strip()
print(f"  Origin llms.txt Platform Comparisons count: {origin_count}")

stdin, stdout, stderr = client.exec_command(
    "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/llms.txt | grep 'fanvue-vs-lollipop' | head -1",
    timeout=15
)
origin_fanvue = stdout.read().decode().strip()
print(f"  Origin Fanvue line: {origin_fanvue[:150]}")

# Step 2: Check Cloudflare cached version
print("\n=== Step 2: Check Cloudflare cached version ===")
stdin, stdout, stderr = client.exec_command(
    "curl -s https://www.lollipop.im/llms.txt | grep -c '## Platform Comparisons'",
    timeout=15
)
cf_count = stdout.read().decode().strip()
print(f"  Cloudflare llms.txt Platform Comparisons count: {cf_count}")

# Step 3: Try to purge cache via Caddy headers (set low TTL for llms.txt)
print("\n=== Step 3: Checking Caddy cache headers for llms.txt ===")
stdin, stdout, stderr = client.exec_command(
    "curl -sI -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/llms.txt | grep -i 'cache\\|cf-\\|age\\|expires'",
    timeout=15
)
print(f"  Headers: {stdout.read().decode().strip()}")

# Step 4: Check for Cloudflare API token in environment
print("\n=== Step 4: Looking for CF API token ===")
stdin, stdout, stderr = client.exec_command(
    "grep -r 'CF_API\\|CLOUDFLARE_API\\|CF_TOKEN\\|CLOUDFLARE_TOKEN' /home/ubuntu/.hermes/ 2>/dev/null | head -5",
    timeout=10
)
print(f"  Hermes dir: {stdout.read().decode().strip()}")

stdin, stdout, stderr = client.exec_command(
    "cat /home/ubuntu/.hermes/.env 2>/dev/null | grep -i 'cloud\\|cf_' | head -5",
    timeout=10
)
result = stdout.read().decode().strip()
print(f"  .hermes/.env CF vars: {result}")

# Step 5: Try to find zone ID via dig
print("\n=== Step 5: DNS/Zone info ===")
stdin, stdout, stderr = client.exec_command(
    "dig lollipop.im NS +short 2>&1",
    timeout=10
)
print(f"  NS records: {stdout.read().decode().strip()}")

client.close()
print("\nDone")
