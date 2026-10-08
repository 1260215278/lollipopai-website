import paramiko
import os
import sys

sys.stdout.reconfigure(line_buffering=True)

HOST = "43.160.226.253"
USER = "ubuntu"
KEY_PATH = "C:/Users/Administrator/.ssh/id_ed25519_hermes"
LOCAL_DIST = r"c:\Users\Administrator\Documents\lollipop\dist"
REMOTE_DIR = "/srv/www/lollipop/current"

print("Connecting...")
pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=30)
sftp = client.open_sftp()
print("Connected")

# Upload all assets files
assets_dir = os.path.join(LOCAL_DIST, "assets")
remote_assets = f"{REMOTE_DIR}/assets"

files = sorted(os.listdir(assets_dir))
total = len(files)
print(f"Uploading {total} asset files...")

for i, f in enumerate(files, 1):
    local = os.path.join(assets_dir, f)
    remote = f"{remote_assets}/{f}"
    try:
        sftp.put(local, remote)
    except Exception as e:
        print(f"  ERROR uploading {f}: {e}")
    if i % 10 == 0 or i == total:
        print(f"  {i}/{total}")

sftp.close()

print("\nAll assets uploaded!")
client.close()
