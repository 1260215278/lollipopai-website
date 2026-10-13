"""
等待 Cloudflare 刷新并验证 llms.txt
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

# Try multiple times with cache-busters
for i in range(5):
    cb = f"test{i}_{int(time.time())}"
    stdin, stdout, stderr = client.exec_command(
        f"curl -s 'https://www.lollipop.im/llms.txt?cb={cb}' | grep -c '## Platform Comparisons'",
        timeout=15
    )
    count = stdout.read().decode().strip()
    print(f"  Attempt {i+1} (?cb={cb}): Platform Comparisons count = {count}")
    if count == "1":
        print("  SUCCESS! Cloudflare is now serving the new version!")
        break
    time.sleep(10)

# Also try with explicit no-cache header
print("\n=== With Cache-Control: no-cache ===")
stdin, stdout, stderr = client.exec_command(
    "curl -s -H 'Cache-Control: no-cache' -H 'Pragma: no-cache' https://www.lollipop.im/llms.txt | grep -c '## Platform Comparisons'",
    timeout=15
)
print(f"  Count: {stdout.read().decode().strip()}")

# Try with cf-cache-buster header
print("\n=== With CF cache-buster header ===")
stdin, stdout, stderr = client.exec_command(
    "curl -s -H 'CF-Force-Cache-Update: true' https://www.lollipop.im/llms.txt | grep -c '## Platform Comparisons'",
    timeout=15
)
print(f"  Count: {stdout.read().decode().strip()}")

# Check response headers
print("\n=== Response headers ===")
stdin, stdout, stderr = client.exec_command(
    "curl -sI https://www.lollipop.im/llms.txt",
    timeout=15
)
print(stdout.read().decode())

# Check if Cloudflare has a page rule for .txt
print("\n=== Check Cloudflare age ===")
stdin, stdout, stderr = client.exec_command(
    "curl -sI https://www.lollipop.im/llms.txt | grep -i 'age\\|cf-cache'",
    timeout=15
)
print(f"  {stdout.read().decode().strip()}")

client.close()
print("Done")
