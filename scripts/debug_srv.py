"""
诊断 /srv 目录问题
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

# 1. Check /srv structure
print("=== /srv/www/lollipop/ structure ===")
stdin, stdout, stderr = client.exec_command("ls -la /srv/www/lollipop/ 2>&1", timeout=10)
print(stdout.read().decode())

stdin, stdout, stderr = client.exec_command("ls -la /srv/www/lollipop/current/ 2>&1 | head -20", timeout=10)
print(stdout.read().decode())

# 2. Check Caddy root
print("=== Caddy root config ===")
stdin, stdout, stderr = client.exec_command("grep 'root' /etc/caddy/Caddyfile | head -5", timeout=10)
print(stdout.read().decode())

# 3. Check what Caddy is actually serving
print("=== Caddy serving test ===")
stdin, stdout, stderr = client.exec_command(
    "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/ | head -5",
    timeout=15
)
print(stdout.read().decode()[:300])

# 4. Check /var/www/lollipop
print("=== /var/www/lollipop/ ===")
stdin, stdout, stderr = client.exec_command("ls /var/www/lollipop/ | head -20", timeout=10)
print(stdout.read().decode())

# 5. Check file count
print("=== File counts ===")
stdin, stdout, stderr = client.exec_command("find /var/www/lollipop -name '*.html' | wc -l", timeout=10)
print(f"  /var HTML: {stdout.read().decode().strip()}")

stdin, stdout, stderr = client.exec_command("find /srv/www/lollipop/current -name '*.html' 2>/dev/null | wc -l", timeout=10)
print(f"  /srv HTML: {stdout.read().decode().strip()}")

stdin, stdout, stderr = client.exec_command("find /srv/www/lollipop/current -maxdepth 1 -type f 2>/dev/null | wc -l", timeout=10)
print(f"  /srv root files: {stdout.read().decode().strip()}")

stdin, stdout, stderr = client.exec_command("ls /srv/www/lollipop/current 2>&1", timeout=10)
print(f"  /srv ls: {stdout.read().decode().strip()}")

# 6. Check if /srv is a symlink
stdin, stdout, stderr = client.exec_command("ls -ld /srv/www/lollipop/current", timeout=10)
print(f"  /srv symlink check: {stdout.read().decode().strip()}")

# 7. Try sed on /var/www/lollipop directly (simpler approach)
print("\n=== Inject llms-txt into /var/www/lollipop HTML ===")
# Use a simpler sed command that works on all HTML files
stdin, stdout, stderr = client.exec_command(
    r"""find /var/www/lollipop -name '*.html' -type f -exec sh -c 'grep -q "llms-txt" "$1" || sed -i '\''/rel="canonical"/a\  <link rel="llms-txt" href="/llms.txt" />'\'' "$1"' _ {} \;""",
    timeout=300
)
stdout.read()

# Verify
stdin, stdout, stderr = client.exec_command(
    "grep -rl 'llms-txt' /var/www/lollipop --include='*.html' | wc -l",
    timeout=15
)
print(f"  Files with llms-txt: {stdout.read().decode().strip()}")

stdin, stdout, stderr = client.exec_command(
    "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/about/ | grep -c 'llms-txt'",
    timeout=15
)
print(f"  /about/ llms-txt: {stdout.read().decode().strip()}")

stdin, stdout, stderr = client.exec_command(
    "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/blog/ | grep -c 'llms-txt'",
    timeout=15
)
print(f"  /blog/ llms-txt: {stdout.read().decode().strip()}")

client.close()
print("\nDone")
