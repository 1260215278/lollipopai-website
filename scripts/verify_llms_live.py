"""
验证 Cloudflare 和源站的 llms.txt 内容
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

# 1. Origin (bypass Cloudflare)
print("=== Origin (bypass CF) ===")
stdin, stdout, stderr = client.exec_command(
    "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/llms.txt | head -30",
    timeout=15
)
print(stdout.read().decode())

# 2. Cloudflare
print("\n=== Cloudflare ===")
stdin, stdout, stderr = client.exec_command(
    "curl -s https://www.lollipop.im/llms.txt | head -30",
    timeout=15
)
print(stdout.read().decode())

# 3. Compare file sizes
print("\n=== File sizes ===")
stdin, stdout, stderr = client.exec_command(
    "ls -la /srv/www/lollipop/current/llms.txt",
    timeout=10
)
print(f"  /srv: {stdout.read().decode().strip()}")

stdin, stdout, stderr = client.exec_command(
    "ls -la /var/www/lollipop/llms.txt",
    timeout=10
)
print(f"  /var: {stdout.read().decode().strip()}")

# 4. Check md5sum
print("\n=== MD5 checksums ===")
stdin, stdout, stderr = client.exec_command(
    "md5sum /srv/www/lollipop/current/llms.txt /var/www/lollipop/llms.txt",
    timeout=10
)
print(f"  {stdout.read().decode().strip()}")

# 5. Check if Caddy is serving from correct root
print("\n=== Caddy root check ===")
stdin, stdout, stderr = client.exec_command(
    "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/llms.txt | md5sum",
    timeout=15
)
print(f"  Origin llms.txt md5: {stdout.read().decode().strip()}")

stdin, stdout, stderr = client.exec_command(
    "curl -s https://www.lollipop.im/llms.txt | md5sum",
    timeout=15
)
print(f"  CF llms.txt md5: {stdout.read().decode().strip()}")

# 6. Check if there's another Caddy instance or config
print("\n=== Caddy processes ===")
stdin, stdout, stderr = client.exec_command("ps aux | grep caddy | grep -v grep", timeout=10)
print(f"  {stdout.read().decode().strip()}")

# 7. Check if file has correct content
print("\n=== Direct file check ===")
stdin, stdout, stderr = client.exec_command(
    "head -25 /srv/www/lollipop/current/llms.txt",
    timeout=10
)
print(stdout.read().decode())

client.close()
print("Done")
