import paramiko
import time

HOST = '43.160.226.253'
USER = 'ubuntu'
KEY_PATH = 'C:/Users/Administrator/.ssh/id_ed25519_hermes'
LOCAL_TAR = r'c:\Users\Administrator\Documents\lollipop\packages\lollipop-deploy.tar.gz'
REMOTE_TAR = '/tmp/lollipop-deploy.tar.gz'
REMOTE_DIR = '/srv/www/lollipop/current'

def connect():
    pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, pkey=pkey, timeout=30, banner_timeout=30, auth_timeout=30)
    return client

import os
local_size = os.path.getsize(LOCAL_TAR)
print(f'Local: {local_size/1024/1024:.1f}MB')

# Upload with progress
print('Uploading...')
client = connect()
sftp = client.open_sftp()

for attempt in range(5):
    try:
        print(f'  Attempt {attempt+1}...')
        sftp.put(LOCAL_TAR, REMOTE_TAR)
        remote_size = sftp.stat(REMOTE_TAR).st_size
        if remote_size == local_size:
            print(f'  OK: {remote_size/1024/1024:.1f}MB')
            break
        else:
            print(f'  Size mismatch: {remote_size} vs {local_size}, retrying...')
            time.sleep(10)
    except Exception as e:
        print(f'  Error: {e}')
        time.sleep(15)
        try:
            sftp.close()
            client.close()
        except:
            pass
        client = connect()
        sftp = client.open_sftp()
else:
    print('Upload FAILED')
    exit(1)

sftp.close()

# Extract
print('Extracting...')
stdin, stdout, stderr = client.exec_command(
    'rm -rf /tmp/lollipop-new && mkdir -p /tmp/lollipop-new && cd /tmp/lollipop-new && tar xzf /tmp/lollipop-deploy.tar.gz',
    timeout=60
)
err = stderr.read().decode()
if err:
    print(f'  Extract error: {err[:300]}')

stdin, stdout, stderr = client.exec_command('find /tmp/lollipop-new -name "*.html" | wc -l', timeout=10)
print(f'  HTML files: {stdout.read().decode().strip()}')

# Rsync
print('Rsyncing...')
stdin, stdout, stderr = client.exec_command(
    f'sudo rsync -a --delete /tmp/lollipop-new/ {REMOTE_DIR}/ 2>&1',
    timeout=120
)
out = stdout.read().decode()
err = stderr.read().decode()
if err:
    print(f'  Rsync error: {err[:200]}')
print('  Done')

# Verify
print('\nVerification:')
checks = [
    ('AR genre romance description (was undefined)', f'grep -m1 "description" {REMOTE_DIR}/ar/genre/romance/index.html | head -1'),
    ('ZH genre romance description (was undefined)', f'grep -m1 "description" {REMOTE_DIR}/zh/genre/romance/index.html | head -1'),
    ('Sitemap URLs', f'grep -c "<loc>" {REMOTE_DIR}/sitemap.xml'),
    ('Blog images count', f'ls {REMOTE_DIR}/blog-images/ | wc -l'),
    ('llms.txt size', f'wc -c {REMOTE_DIR}/llms.txt'),
]

for label, cmd in checks:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
    result = stdout.read().decode().strip()[:200]
    print(f'  {label}: {result}')

client.close()
print('\nAll done!')
