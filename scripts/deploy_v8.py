import paramiko, os, time

HOST = "43.160.226.253"
USER = "ubuntu"
KEY_PATH = "C:/Users/Administrator/.ssh/id_ed25519_hermes"
LOCAL_TAR = r"c:\Users\Administrator\Documents\lollipop\packages\lollipop-deploy.tar.gz"
REMOTE_TAR = "/tmp/lollipop-deploy.tar.gz"
DEPLOY_DIR = "/srv/www/lollipop/current"

def upload_with_resume(max_retries=20):
    file_size = os.path.getsize(LOCAL_TAR)
    print(f"Uploading ({file_size/1024/1024:.1f} MB) with resume support...")
    
    for attempt in range(1, max_retries + 1):
        transport = None
        try:
            pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
            transport = paramiko.Transport((HOST, 22))
            transport.set_keepalive(15)
            transport.connect(username=USER, pkey=pkey)
            sftp = paramiko.SFTPClient.from_transport(transport)
            
            # Check for partial upload
            offset = 0
            try:
                remote_stat = sftp.stat(REMOTE_TAR)
                offset = remote_stat.st_size
                if offset >= file_size:
                    print(f"  Upload already complete ({offset/1024/1024:.1f} MB)")
                    sftp.close()
                    transport.close()
                    return True
                print(f"  Attempt {attempt}: resuming from {offset/1024/1024:.1f} MB ({offset*100//file_size}%)")
            except IOError:
                print(f"  Attempt {attempt}: starting fresh (0.0 MB)")
                offset = 0
            
            # Upload in chunks
            lfile = open(LOCAL_TAR, 'rb')
            lfile.seek(offset)
            rfile = sftp.open(REMOTE_TAR, 'ab' if offset > 0 else 'wb')
            
            chunk = 512 * 1024  # 512KB
            last_report = time.time()
            while offset < file_size:
                data = lfile.read(chunk)
                if not data:
                    break
                rfile.write(data)
                offset += len(data)
                
                now = time.time()
                if now - last_report > 5:
                    print(f"    {offset/1024/1024:.1f} MB / {file_size/1024/1024:.1f} MB ({offset*100//file_size}%)")
                    last_report = now
            
            rfile.close()
            lfile.close()
            
            # Verify
            remote_stat = sftp.stat(REMOTE_TAR)
            if remote_stat.st_size == file_size:
                print(f"  Upload complete! ({file_size/1024/1024:.1f} MB)")
                sftp.close()
                transport.close()
                return True
            else:
                print(f"  Size mismatch: local={file_size}, remote={remote_stat.st_size}")
                sftp.close()
                transport.close()
                time.sleep(2)
                
        except Exception as e:
            print(f"  Attempt {attempt} failed: {str(e)[:100]}")
            try:
                if transport:
                    transport.close()
            except:
                pass
            time.sleep(3)
    
    print("ERROR: All upload attempts failed!")
    return False

# === Main ===
if not upload_with_resume():
    exit(1)

# Connect for commands
pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=30)
print("Connected for deployment")

# Extract
print("Extracting...")
stdin, stdout, stderr = client.exec_command(
    "rm -rf /tmp/lollipop-new && mkdir -p /tmp/lollipop-new && cd /tmp/lollipop-new && tar xzf /tmp/lollipop-deploy.tar.gz 2>&1",
    timeout=120
)
out = stdout.read().decode()
err = stderr.read().decode()
if err:
    print(f"  stderr: {err[:200]}")

# Verify extraction
stdin, stdout, stderr = client.exec_command("ls /tmp/lollipop-new/blog-images/ 2>/dev/null | wc -l", timeout=10)
img_count = stdout.read().decode().strip()
print(f"  Extracted blog-images: {img_count} files")

# Rsync to production
print("Rsyncing to production...")
stdin, stdout, stderr = client.exec_command(
    "sudo rsync -a --delete /tmp/lollipop-new/ /srv/www/lollipop/current/ 2>&1",
    timeout=120
)
stdout.read()
print("  Done")

# Verify
print("\n=== Verification ===")
checks = [
    ("blog-images total", "ls /srv/www/lollipop/current/blog-images/ | wc -l"),
    ("WebP files", "ls /srv/www/lollipop/current/blog-images/*.webp 2>/dev/null | wc -l"),
    ("JPG files", "ls /srv/www/lollipop/current/blog-images/*.jpg 2>/dev/null | wc -l"),
    ("Sitemap URLs", "grep -c '<loc>' /srv/www/lollipop/current/sitemap.xml"),
    ("index.html exists", "test -f /srv/www/lollipop/current/index.html && echo YES || echo NO"),
]

for label, cmd in checks:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=10)
    result = stdout.read().decode().strip()
    print(f"  {label}: {result}")

client.close()
print("\nDeployment complete!")
