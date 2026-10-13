"""
诊断 Caddy 实际服务的目录，并在正确的目录注入 llms-txt
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

# 1. Check what Caddy actually serves (follow symlink)
print("=== /srv/www/lollipop/current (follow symlink) ===")
stdin, stdout, stderr = client.exec_command("readlink -f /srv/www/lollipop/current", timeout=10)
real_path = stdout.read().decode().strip()
print(f"  Real path: {real_path}")

stdin, stdout, stderr = client.exec_command(f"find -L /srv/www/lollipop/current -name '*.html' -type f | wc -l", timeout=15)
print(f"  HTML files (follow symlink): {stdout.read().decode().strip()}")

stdin, stdout, stderr = client.exec_command(f"ls -la {real_path}/index.html", timeout=10)
print(f"  index.html: {stdout.read().decode().strip()}")

# 2. Check if /var/www/lollipop is the same as the symlink target
print("\n=== Compare /var/www/lollipop vs symlink target ===")
stdin, stdout, stderr = client.exec_command(f"diff <(ls {real_path}/) <(ls /var/www/lollipop/) | head -10", timeout=10)
print(f"  diff: {stdout.read().decode().strip()}")

# 3. Inject llms-txt into the REAL serving directory
print(f"\n=== Inject llms-txt into {real_path} ===")
stdin, stdout, stderr = client.exec_command(
    f"""find -L {real_path} -name '*.html' -type f -exec sh -c 'grep -q "llms-txt" "$1" || sed -i '\\''/rel="canonical"/a\\  <link rel="llms-txt" href="/llms.txt" />'\\'' "$1"' _ {{}} \\;""",
    timeout=300
)
stdout.read()

# 4. Also inject into /srv/www/lollipop/current directly (following symlink)
print(f"\n=== Inject llms-txt into /srv/www/lollipop/current (follow symlink) ===")
stdin, stdout, stderr = client.exec_command(
    f"""find -L /srv/www/lollipop/current -name '*.html' -type f -exec sh -c 'grep -q "llms-txt" "$1" || sed -i '\\''/rel="canonical"/a\\  <link rel="llms-txt" href="/llms.txt" />'\\'' "$1"' _ {{}} \\;""",
    timeout=300
)
stdout.read()

# 5. Verify
print("\n=== Verification ===")
checks = [
    ("Origin / llms-txt", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/ | grep -c 'llms-txt'"),
    ("Origin /about/ llms-txt", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/about/ | grep -c 'llms-txt'"),
    ("Origin /blog/ llms-txt", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/blog/ | grep -c 'llms-txt'"),
    ("Origin /creating/ llms-txt", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/creating/ | grep -c 'llms-txt'"),
    ("Origin /contact/ llms-txt", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/contact/ | grep -c 'llms-txt'"),
    ("Origin blog post llms-txt", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/blog/ai-short-drama-pillar-guide/ | grep -c 'llms-txt'"),
    ("Origin genre llms-txt", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/genre/romance/ | grep -c 'llms-txt'"),
    ("Files with llms-txt (real path)", f"grep -rl 'llms-txt' {real_path} --include='*.html' | wc -l"),
    ("Files with llms-txt (/var)", "grep -rl 'llms-txt' /var/www/lollipop --include='*.html' | wc -l"),
]

for label, cmd in checks:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
    result = stdout.read().decode().strip()
    print(f"  {label}: {result}")

client.close()
print("\nDone")
