"""
验证线上 llms.txt 和 llms-full.txt
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

checks = [
    ("Origin llms.txt Platform Comparisons", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/llms.txt | grep -c '## Platform Comparisons'"),
    ("Origin llms.txt 80% share", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/llms.txt | grep -c '80% revenue share'"),
    ("Origin llms.txt 100+ countries", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/llms.txt | grep -c '100+ countries'"),
    ("Origin llms.txt 70% share (should be 0)", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/llms.txt | grep -c 'up to 70%'"),
    ("Origin llms-full.txt Platform Comparisons", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/llms-full.txt | grep -c '## Platform Comparisons'"),
    ("Origin llms-full.txt 80% share", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/llms-full.txt | grep -c '80% revenue share'"),
    ("CF llms.txt Platform Comparisons", "curl -s https://www.lollipop.im/llms.txt | grep -c '## Platform Comparisons'"),
    ("CF llms.txt 80% share", "curl -s https://www.lollipop.im/llms.txt | grep -c '80% revenue share'"),
    ("CF llms.txt 70% share (should be 0)", "curl -s https://www.lollipop.im/llms.txt | grep -c 'up to 70%'"),
    ("CF .well-known/llms.txt Platform Comparisons", "curl -s https://www.lollipop.im/.well-known/llms.txt | grep -c '## Platform Comparisons'"),
]

for label, cmd in checks:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
    result = stdout.read().decode().strip()
    status = "✓" if "0" not in result or "should be 0" in label else "✗"
    if "should be 0" in label:
        status = "✓" if result == "0" else "✗"
    else:
        status = "✓" if result != "0" else "✗"
    print(f"  [{status}] {label}: {result}")

client.close()
print("\nDone")
