"""
为 Caddy 配置 llms.txt 文件的短缓存头，让 Cloudflare 快速刷新
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

# Step 1: Read current Caddyfile
print("=== Step 1: Read Caddyfile ===")
stdin, stdout, stderr = client.exec_command("cat /etc/caddy/Caddyfile", timeout=15)
caddyfile = stdout.read().decode()
print(caddyfile[:500])

# Step 2: Add header rule for .txt files
# Check if header rule already exists
if "header /llms.txt" not in caddyfile and "Cache-Control" not in caddyfile:
    print("\n=== Step 2: Adding cache-control header for .txt files ===")
    # Add header rule for llms.txt files - short cache to force Cloudflare refresh
    # Insert after the root line in lollipop.im block
    cmd = r"""sudo sed -i '/root \* \/srv\/www\/lollipop\/current/a\\theader /llms*.txt Cache-Control "public, max-age=60"\n\theader /llms*.txt Surrogate-Control "public, max-age=0"' /etc/caddy/Caddyfile"""
    stdin, stdout, stderr = client.exec_command(cmd, timeout=10)
    err = stderr.read().decode().strip()
    if err:
        print(f"  sed error: {err}")

    # Verify
    stdin, stdout, stderr = client.exec_command("grep -n 'Cache-Control\\|llms' /etc/caddy/Caddyfile", timeout=10)
    print(f"  After edit: {stdout.read().decode().strip()}")
else:
    print("\n=== Step 2: Cache header already exists ===")

# Step 3: Validate and reload
print("\n=== Step 3: Validate Caddyfile ===")
stdin, stdout, stderr = client.exec_command("caddy validate --config /etc/caddy/Caddyfile 2>&1", timeout=15)
print(f"  {stdout.read().decode().strip()[:300]}")

print("\n=== Step 4: Reload Caddy ===")
stdin, stdout, stderr = client.exec_command("sudo caddy reload --config /etc/caddy/Caddyfile --force 2>&1", timeout=30)
print(f"  {stdout.read().decode().strip()[:300]}")
time.sleep(2)

# Step 5: Test headers
print("\n=== Step 5: Test headers ===")
stdin, stdout, stderr = client.exec_command(
    "curl -sI -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/llms.txt | grep -i 'cache'",
    timeout=15
)
print(f"  Origin headers: {stdout.read().decode().strip()}")

# Step 6: Try purging via curl with cache-buster
print("\n=== Step 6: Test with cache-buster ===")
stdin, stdout, stderr = client.exec_command(
    "curl -s 'https://www.lollipop.im/llms.txt?cb=$(date +%s)' | grep -c '## Platform Comparisons'",
    timeout=15
)
print(f"  Cloudflare with cache-buster: {stdout.read().decode().strip()}")

stdin, stdout, stderr = client.exec_command(
    "curl -s 'https://www.lollipop.im/llms.txt?v=2' | grep -c '## Platform Comparisons'",
    timeout=15
)
print(f"  Cloudflare with ?v=2: {stdout.read().decode().strip()}")

client.close()
print("\nDone")
