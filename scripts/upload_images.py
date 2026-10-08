import paramiko
import os
import time
import tarfile
import io

HOST = '43.160.226.253'
USER = 'ubuntu'
KEY_PATH = 'C:/Users/Administrator/.ssh/id_ed25519_hermes'
LOCAL_IMG_DIR = r'c:\Users\Administrator\Documents\lollipop\dist\blog-images'
REMOTE_IMG_DIR = '/srv/www/lollipop/current/blog-images'

pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)

def connect():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, pkey=pkey, timeout=30, banner_timeout=30, auth_timeout=30)
    return client

# Get all webp files
webp_files = sorted([f for f in os.listdir(LOCAL_IMG_DIR) if f.endswith('.webp')])
print(f'Local WebP files: {len(webp_files)}')

client = connect()
sftp = client.open_sftp()

# Ensure remote dir exists
try:
    sftp.stat(REMOTE_IMG_DIR)
except:
    sftp.mkdir(REMOTE_IMG_DIR)

# Upload each webp file individually
uploaded = 0
failed = []
for i, fname in enumerate(webp_files):
    local_path = os.path.join(LOCAL_IMG_DIR, fname)
    remote_path = f'{REMOTE_IMG_DIR}/{fname}'
    local_size = os.path.getsize(local_path)
    
    # Check if already exists with same size
    try:
        remote_stat = sftp.stat(remote_path)
        if remote_stat.st_size == local_size:
            uploaded += 1
            continue
    except:
        pass
    
    for attempt in range(3):
        try:
            sftp.put(local_path, remote_path)
            remote_size = sftp.stat(remote_path).st_size
            if remote_size == local_size:
                uploaded += 1
                if (i + 1) % 10 == 0:
                    print(f'  Uploaded {i+1}/{len(webp_files)}...')
                break
            else:
                if attempt < 2:
                    time.sleep(2)
        except Exception as e:
            if attempt < 2:
                time.sleep(5)
                try:
                    sftp.close()
                    client.close()
                except:
                    pass
                client = connect()
                sftp = client.open_sftp()
            else:
                failed.append(fname)
                print(f'  FAILED: {fname} ({local_size//1024}KB) - {e}')

sftp.close()

print(f'\nUploaded: {uploaded}/{len(webp_files)}')
print(f'Failed: {len(failed)}')
if failed:
    for f in failed:
        print(f'  - {f}')

# Verify
print('\nVerifying...')
stdin, stdout, stderr = client.exec_command('ls /srv/www/lollipop/current/blog-images/*.webp 2>/dev/null | wc -l', timeout=10)
print(f'  Server WebP files: {stdout.read().decode().strip()}')

stdin, stdout, stderr = client.exec_command('du -sh /srv/www/lollipop/current/blog-images/', timeout=10)
print(f'  Total size: {stdout.read().decode().strip()}')

# Test a few specific files
test_files = [
    'ai-short-drama-faq-2026.webp',
    'ai-short-drama-pillar-guide.webp',
    'pixverse-vs-higgsfield-vs-ltx-vs-lollipop.webp',
]
for f in test_files:
    cmd = f'test -f /srv/www/lollipop/current/blog-images/{f} && echo OK || echo MISSING'
    stdin, stdout, stderr = client.exec_command(cmd, timeout=5)
    print(f'  {f}: {stdout.read().decode().strip()}')

client.close()
print('\nDone!')
