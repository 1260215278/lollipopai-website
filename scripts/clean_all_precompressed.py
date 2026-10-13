"""
清理所有旧的预压缩文件（.gz/.br）并验证
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

# 1. Delete all .gz and .br files for llms*
print("=== Step 1: Delete all precompressed llms files ===")
for d in ["/srv/www/lollipop/current", "/var/www/lollipop"]:
    for pattern in ["llms.txt.gz", "llms.txt.br", "llms-full.txt.gz", "llms-full.txt.br"]:
        for subdir in ["", ".well-known/"]:
            path = f"{d}/{subdir}{pattern}"
            stdin, stdout, stderr = client.exec_command(f"sudo rm -f {path} && echo 'deleted {path}' || echo 'skip {path}'", timeout=10)
            print(f"  {stdout.read().decode().strip()}")

# 2. Verify no precompressed files remain
print("\n=== Step 2: Verify no precompressed files ===")
stdin, stdout, stderr = client.exec_command(
    "find /srv/www/lollipop/current -name 'llms*' -type f",
    timeout=10
)
print(f"  /srv files:\n{stdout.read().decode().strip()}")

stdin, stdout, stderr = client.exec_command(
    "find /var/www/lollipop -name 'llms*' -type f",
    timeout=10
)
print(f"  /var files:\n{stdout.read().decode().strip()}")

# 3. Reload Caddy to clear any in-memory cache
print("\n=== Step 3: Reload Caddy ===")
stdin, stdout, stderr = client.exec_command("sudo caddy reload --config /etc/caddy/Caddyfile --force 2>&1 | tail -3", timeout=30)
print(f"  {stdout.read().decode().strip()}")
time.sleep(3)

# 4. Test origin (all encodings)
print("\n=== Step 4: Test origin ===")
for enc in ["", "-H 'Accept-Encoding: gzip'", "-H 'Accept-Encoding: br'"]:
    label = enc if enc else "plain"
    stdin, stdout, stderr = client.exec_command(
        f"curl -s -k --resolve www.lollipop.im:443:127.0.0.1 {enc} --compressed https://www.lollipop.im/llms.txt | grep -c '## Platform Comparisons'",
        timeout=15
    )
    print(f"  Origin ({label}): {stdout.read().decode().strip()}")

# 5. Test .well-known
print("\n=== Step 5: Test .well-known ===")
stdin, stdout, stderr = client.exec_command(
    "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/.well-known/llms.txt | grep -c '## Platform Comparisons'",
    timeout=15
)
print(f"  .well-known/llms.txt: {stdout.read().decode().strip()}")

# 6. Test through Cloudflare
print("\n=== Step 6: Test through Cloudflare ===")
stdin, stdout, stderr = client.exec_command(
    "curl -s https://www.lollipop.im/llms.txt | grep -c '## Platform Comparisons'",
    timeout=15
)
print(f"  CF llms.txt: {stdout.read().decode().strip()}")

stdin, stdout, stderr = client.exec_command(
    "curl -s https://www.lollipop.im/.well-known/llms.txt | grep -c '## Platform Comparisons'",
    timeout=15
)
print(f"  CF .well-known/llms.txt: {stdout.read().decode().strip()}")

# 7. Check Cloudflare headers
print("\n=== Step 7: CF headers ===")
stdin, stdout, stderr = client.exec_command(
    "curl -sI https://www.lollipop.im/llms.txt | grep -i 'last-modified\\|cf-cache\\|age\\|etag'",
    timeout=15
)
print(f"  {stdout.read().decode().strip()}")

client.close()
print("\nDone")
