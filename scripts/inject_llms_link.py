"""
在服务器端直接用 sed 注入 <link rel="llms-txt" href="/llms.txt" /> 到所有 HTML 文件
这比上传 8MB tar 快得多
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

# Step 1: Count HTML files
print("=== Step 1: Count HTML files ===")
for d in ["/srv/www/lollipop/current", "/var/www/lollipop"]:
    stdin, stdout, stderr = client.exec_command(f"find {d} -name '*.html' -type f | wc -l", timeout=15)
    print(f"  {d}: {stdout.read().decode().strip()} HTML files")

# Step 2: Check if llms-txt link already exists
print("\n=== Step 2: Check existing llms-txt links ===")
for d in ["/srv/www/lollipop/current", "/var/www/lollipop"]:
    stdin, stdout, stderr = client.exec_command(f"grep -rl 'llms-txt' {d} --include='*.html' | wc -l", timeout=15)
    print(f"  {d}: {stdout.read().decode().strip()} files with llms-txt")

# Step 3: Inject llms-txt link into all HTML files that don't have it
# Use sed to insert after the canonical link tag
print("\n=== Step 3: Inject llms-txt link ===")
for d in ["/srv/www/lollipop/current", "/var/www/lollipop"]:
    # Find all HTML files without llms-txt link
    stdin, stdout, stderr = client.exec_command(
        f"grep -rL 'llms-txt' {d} --include='*.html' | wc -l",
        timeout=30
    )
    count = stdout.read().decode().strip()
    print(f"  {d}: {count} files need injection")

    # Inject using sed: insert after <link rel="canonical" ...> line
    # The pattern: after any line containing rel="canonical"
    stdin, stdout, stderr = client.exec_command(
        f"""sudo find {d} -name '*.html' -type f -exec grep -qL 'llms-txt' {{}} \\; -print | """
        f"""xargs -I {{}} sudo sed -i '/rel="canonical"/ a\\  <link rel="llms-txt" href="/llms.txt" />' {{}} 2>&1 | head -5""",
        timeout=120
    )
    result = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if result:
        print(f"  sed output: {result}")
    if err:
        print(f"  sed error: {err[:200]}")

# Step 4: Verify
print("\n=== Step 4: Verification ===")
checks = [
    ("Origin / llms-txt", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/ | grep -c 'llms-txt'"),
    ("Origin /about/ llms-txt", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/about/ | grep -c 'llms-txt'"),
    ("Origin /blog/ llms-txt", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/blog/ | grep -c 'llms-txt'"),
    ("Origin /creating/ llms-txt", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/creating/ | grep -c 'llms-txt'"),
    ("Origin /contact/ llms-txt", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/contact/ | grep -c 'llms-txt'"),
    ("Origin blog post llms-txt", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/blog/ai-short-drama-pillar-guide/ | grep -c 'llms-txt'"),
    ("Origin genre page llms-txt", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/genre/romance/ | grep -c 'llms-txt'"),
    ("Files with llms-txt (/srv)", f"grep -rl 'llms-txt' /srv/www/lollipop/current --include='*.html' | wc -l"),
    ("Files with llms-txt (/var)", f"grep -rl 'llms-txt' /var/www/lollipop --include='*.html' | wc -l"),
    ("Total HTML (/srv)", "find /srv/www/lollipop/current -name '*.html' -type f | wc -l"),
    ("Total HTML (/var)", "find /var/www/lollipop -name '*.html' -type f | wc -l"),
]

for label, cmd in checks:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
    result = stdout.read().decode().strip()
    print(f"  {label}: {result}")

client.close()
print("\nDone")
