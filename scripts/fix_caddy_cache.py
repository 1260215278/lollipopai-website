"""
手动编辑 Caddyfile，为 llms.txt 添加短缓存头
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

# Step 1: Print full Caddyfile
print("=== Full Caddyfile ===")
stdin, stdout, stderr = client.exec_command("cat /etc/caddy/Caddyfile", timeout=15)
caddyfile = stdout.read().decode()
print(caddyfile)

# Step 2: Write new Caddyfile with cache headers
# Find the lollipop.im block and add header rule for .txt files
new_caddyfile = caddyfile

# Add header rule for .txt files after root line
if "header /llms" not in caddyfile:
    # Insert after 'root * /srv/www/lollipop/current'
    old_root = "root * /srv/www/lollipop/current"
    new_root = """root * /srv/www/lollipop/current

        # Short cache for llms.txt to force Cloudflare refresh
        header /llms*.txt Cache-Control "public, max-age=60"
        header /llms*.txt Surrogate-Control "public, max-age=0"
        header /llms*.txt CDN-Cache-Control "public, max-age=60\""""
    new_caddyfile = caddyfile.replace(old_root, new_root, 1)

    # Write to temp file
    print("\n=== Step 2: Writing new Caddyfile ===")
    stdin, stdout, stderr = client.exec_command("sudo tee /etc/caddy/Caddyfile.new > /dev/null", timeout=10)
    stdin.write(new_caddyfile)
    stdin.channel.shutdown_write()

    # Replace
    stdin, stdout, stderr = client.exec_command("sudo mv /etc/caddy/Caddyfile.new /etc/caddy/Caddyfile", timeout=10)
    stdout.read()

    # Verify
    stdin, stdout, stderr = client.exec_command("grep -n 'llms\\|Cache-Control' /etc/caddy/Caddyfile", timeout=10)
    print(f"  Caddyfile updated: {stdout.read().decode().strip()}")
else:
    print("\n  Cache header already exists")

# Step 3: Validate
print("\n=== Step 3: Validate ===")
stdin, stdout, stderr = client.exec_command("caddy validate --config /etc/caddy/Caddyfile 2>&1 | tail -5", timeout=15)
print(f"  {stdout.read().decode().strip()}")

# Step 4: Reload
print("\n=== Step 4: Reload Caddy ===")
stdin, stdout, stderr = client.exec_command("sudo caddy reload --config /etc/caddy/Caddyfile --force 2>&1 | tail -5", timeout=30)
print(f"  {stdout.read().decode().strip()}")
time.sleep(3)

# Step 5: Test origin headers
print("\n=== Step 5: Test origin headers ===")
stdin, stdout, stderr = client.exec_command(
    "curl -sI -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/llms.txt | grep -i 'cache\\|cf\\|age'",
    timeout=15
)
print(f"  Origin headers: {stdout.read().decode().strip()}")

# Step 6: Test through Cloudflare
print("\n=== Step 6: Test through Cloudflare ===")
stdin, stdout, stderr = client.exec_command(
    "curl -sI https://www.lollipop.im/llms.txt | grep -i 'cache\\|cf\\|age'",
    timeout=15
)
print(f"  CF headers: {stdout.read().decode().strip()}")

stdin, stdout, stderr = client.exec_command(
    "curl -s 'https://www.lollipop.im/llms.txt?nocache=1' | grep -c '## Platform Comparisons'",
    timeout=15
)
print(f"  CF content (with cache-buster): {stdout.read().decode().strip()}")

client.close()
print("\nDone")
