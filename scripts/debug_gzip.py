"""
深入调试 gzip 问题
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

# 1. Check what Caddy returns with different Accept-Encoding
print("=== Test 1: No Accept-Encoding ===")
stdin, stdout, stderr = client.exec_command(
    "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/llms.txt | head -20",
    timeout=15
)
print(stdout.read().decode())

print("\n=== Test 2: Accept-Encoding: gzip ===")
stdin, stdout, stderr = client.exec_command(
    "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 -H 'Accept-Encoding: gzip' --compressed https://www.lollipop.im/llms.txt | head -20",
    timeout=15
)
print(stdout.read().decode())

print("\n=== Test 3: Accept-Encoding: br ===")
stdin, stdout, stderr = client.exec_command(
    "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 -H 'Accept-Encoding: br' --compressed https://www.lollipop.im/llms.txt | head -20",
    timeout=15
)
print(stdout.read().decode())

# 4. Check Caddy encode directive
print("\n=== Test 4: Caddy encode config ===")
stdin, stdout, stderr = client.exec_command("grep -n 'encode' /etc/caddy/Caddyfile | head -5", timeout=10)
print(f"  {stdout.read().decode().strip()}")

# 5. Check if there's a .gz file still somewhere
print("\n=== Test 5: Check for any .gz/.br files ===")
stdin, stdout, stderr = client.exec_command(
    "find /srv/www/lollipop/current -name 'llms*' -type f",
    timeout=10
)
print(f"  /srv: {stdout.read().decode().strip()}")

stdin, stdout, stderr = client.exec_command(
    "find /var/www/lollipop -name 'llms*' -type f",
    timeout=10
)
print(f"  /var: {stdout.read().decode().strip()}")

# 6. Check .well-known
print("\n=== Test 6: .well-known llms.txt ===")
stdin, stdout, stderr = client.exec_command(
    "ls -la /srv/www/lollipop/current/.well-known/llms*",
    timeout=10
)
print(f"  {stdout.read().decode().strip()}")

stdin, stdout, stderr = client.exec_command(
    "find /srv/www/lollipop/current/.well-known -name 'llms*' -type f",
    timeout=10
)
print(f"  .well-known: {stdout.read().decode().strip()}")

# 7. Check response headers from origin
print("\n=== Test 7: Origin response headers ===")
stdin, stdout, stderr = client.exec_command(
    "curl -sI -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/llms.txt",
    timeout=15
)
print(stdout.read().decode())

# 8. Check with gzip - what content-encoding is returned?
print("\n=== Test 8: Content-Encoding with gzip request ===")
stdin, stdout, stderr = client.exec_command(
    "curl -sI -k --resolve www.lollipop.im:443:127.0.0.1 -H 'Accept-Encoding: gzip' https://www.lollipop.im/llms.txt | grep -i 'content-encoding\\|content-length\\|vary'",
    timeout=15
)
print(f"  {stdout.read().decode().strip()}")

# 9. Decode gzip response manually
print("\n=== Test 9: Raw gzip response decoded ===")
stdin, stdout, stderr = client.exec_command(
    "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 -H 'Accept-Encoding: gzip' https://www.lollipop.im/llms.txt --output - | gunzip 2>/dev/null | head -20",
    timeout=15
)
print(stdout.read().decode())

client.close()
print("Done")
