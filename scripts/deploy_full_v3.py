"""
简单直接：重新打包全量并部署
"""
import paramiko
import os
import time

HOST = '43.160.226.253'
USER = 'ubuntu'
KEY_PATH = 'C:/Users/Administrator/.ssh/id_ed25519_hermes'
LOCAL_TAR = r'c:\Users\Administrator\Documents\lollipop\packages\lollipop-deploy.tar.gz'
REMOTE_TAR = '/tmp/lollipop-deploy.tar.gz'

def connect():
    pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, pkey=pkey, timeout=30, banner_timeout=30)
    return client

local_size = os.path.getsize(LOCAL_TAR)
print(f'Local package: {local_size/1024/1024:.1f}MB')

# Upload with retry
for attempt in range(5):
    print(f'Upload attempt {attempt+1}/5...')
    try:
        client = connect()
        sftp = client.open_sftp()
        sftp.put(LOCAL_TAR, REMOTE_TAR)
        remote_size = sftp.stat(REMOTE_TAR).st_size
        sftp.close()
        if remote_size == local_size:
            print(f'Upload verified: {remote_size/1024/1024:.1f}MB')
            break
        else:
            print(f'Size mismatch: {remote_size} vs {local_size}')
            client.close()
            time.sleep(10)
    except Exception as e:
        print(f'Error: {e}')
        time.sleep(15)
        try:
            client.close()
        except:
            pass
else:
    print('Upload failed after 5 attempts')
    exit(1)

# Extract
print('Extracting...')
stdin, stdout, stderr = client.exec_command(
    'rm -rf /tmp/lollipop-new && mkdir -p /tmp/lollipop-new && cd /tmp/lollipop-new && tar xzf /tmp/lollipop-deploy.tar.gz 2>&1',
    timeout=60
)
out = stdout.read().decode()
err = stderr.read().decode()
if err:
    print(f'Extract stderr: {err[:200]}')

# Count files
stdin, stdout, stderr = client.exec_command('find /tmp/lollipop-new -name "*.html" | wc -l')
html_count = stdout.read().decode().strip()
print(f'HTML files: {html_count}')

# Rsync
print('Rsyncing to production...')
stdin, stdout, stderr = client.exec_command(
    'sudo rsync -a --delete /tmp/lollipop-new/ /srv/www/lollipop/current/ 2>&1',
    timeout=120
)
out = stdout.read().decode()
err = stderr.read().decode()
if err:
    print(f'Rsync error: {err[:200]}')

# Verify
print('\nVerifying...')
checks = [
    ('Blog post with new cover', 'grep -c "ceo-romance-revenge-prompt-pack.webp" /srv/www/lollipop/current/blog/ceo-romance-revenge-short-drama-prompt-pack/index.html'),
    ('Blog images count', 'ls /srv/www/lollipop/current/blog-images/ | wc -l'),
    ('Sitemap URLs', 'grep -c "<loc>" /srv/www/lollipop/current/sitemap.xml'),
    ('llms.txt size', 'wc -c /srv/www/lollipop/current/llms.txt'),
]

for label, cmd in checks:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=10)
    result = stdout.read().decode().strip()
    print(f'  {label}: {result}')

client.close()
print('\nDone!')
