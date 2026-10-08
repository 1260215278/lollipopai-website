import paramiko
import os
import time

HOST = '43.160.226.253'
USER = 'ubuntu'
KEY_PATH = 'C:/Users/Administrator/.ssh/id_ed25519_hermes'
LOCAL_TAR = r'c:\Users\Administrator\Documents\lollipop\packages\lollipop-deploy.tar.gz'
REMOTE_TAR = '/tmp/lollipop-deploy.tar.gz'

pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=30, banner_timeout=30, auth_timeout=30)
print('Connected')

# Upload
local_size = os.path.getsize(LOCAL_TAR)
print(f'Uploading {local_size/1024/1024:.1f}MB...')
sftp = client.open_sftp()
sftp.put(LOCAL_TAR, REMOTE_TAR)
remote_size = sftp.stat(REMOTE_TAR).st_size
print(f'Uploaded: {remote_size/1024/1024:.1f}MB')
sftp.close()

# Clean and extract
print('Extracting...')
stdin, stdout, stderr = client.exec_command(
    'rm -rf /tmp/lollipop-new && mkdir -p /tmp/lollipop-new && cd /tmp/lollipop-new && tar xzf /tmp/lollipop-deploy.tar.gz 2>&1',
    timeout=120
)
out = stdout.read().decode()
err = stderr.read().decode()
if out:
    print(f'  stdout: {out[:300]}')
if err:
    print(f'  stderr: {err[:300]}')

# Verify extraction
stdin, stdout, stderr = client.exec_command(
    'ls /tmp/lollipop-new/blog-images/ | wc -l',
    timeout=10
)
temp_count = stdout.read().decode().strip()
print(f'  Temp blog-images: {temp_count} files')

stdin, stdout, stderr = client.exec_command(
    'ls /tmp/lollipop-new/blog-images/*.webp 2>/dev/null | wc -l',
    timeout=10
)
temp_webp = stdout.read().decode().strip()
print(f'  Temp WebP files: {temp_webp}')

if temp_count == '0':
    print('ERROR: Extraction failed - no blog-images in temp dir!')
    # Try listing what IS in the temp dir
    stdin, stdout, stderr = client.exec_command('ls /tmp/lollipop-new/', timeout=10)
    print(f'  Temp dir contents: {stdout.read().decode().strip()[:200]}')
    client.close()
    exit(1)

# Rsync to production
print('Rsyncing...')
stdin, stdout, stderr = client.exec_command(
    'sudo rsync -a --delete /tmp/lollipop-new/ /srv/www/lollipop/current/ 2>&1',
    timeout=120
)
stdout.read()
print('  Done')

# Verify production
print('Verifying...')
checks = [
    ('Prod blog-images count', 'ls /srv/www/lollipop/current/blog-images/ | wc -l'),
    ('Prod WebP count', 'ls /srv/www/lollipop/current/blog-images/*.webp 2>/dev/null | wc -l'),
    ('Prod JPG count', 'ls /srv/www/lollipop/current/blog-images/*.jpg 2>/dev/null | wc -l'),
    ('Sample WebP exists', 'test -f /srv/www/lollipop/current/blog-images/ai-short-drama-faq-2026.webp && echo YES || echo NO'),
    ('Sitemap URLs', 'grep -c "<loc>" /srv/www/lollipop/current/sitemap.xml'),
]

for label, cmd in checks:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=10)
    result = stdout.read().decode().strip()
    print(f'  {label}: {result}')

client.close()
print('\nDone!')
