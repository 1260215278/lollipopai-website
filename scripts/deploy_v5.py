import paramiko
import os
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

local_size = os.path.getsize(LOCAL_TAR)
print(f'Local: {local_size/1024/1024:.1f}MB')

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
            print(f'  Size mismatch: {remote_size} vs {local_size}')
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

print('Extracting...')
stdin, stdout, stderr = client.exec_command(
    'rm -rf /tmp/lollipop-new && mkdir -p /tmp/lollipop-new && cd /tmp/lollipop-new && tar xzf /tmp/lollipop-deploy.tar.gz',
    timeout=60
)
err = stderr.read().decode()
if err:
    print(f'  Extract error: {err[:300]}')

# Verify temp has new content
stdin, stdout, stderr = client.exec_command('grep -c "sr-only" /tmp/lollipop-new/creating/index.html', timeout=10)
temp_creating = stdout.read().decode().strip()
print(f'  Temp creating H1: {temp_creating}')

stdin, stdout, stderr = client.exec_command('grep -c "Lollipop Drama AI short drama platform banner" /tmp/lollipop-new/about/index.html', timeout=10)
temp_about = stdout.read().decode().strip()
print(f'  Temp about alt: {temp_about}')

if temp_creating == '0' or temp_about == '0':
    print('ERROR: Temp dir does not have new content!')
    client.close()
    exit(1)

print('\nRsyncing to production...')
stdin, stdout, stderr = client.exec_command(
    f'sudo rsync -a --delete /tmp/lollipop-new/ {REMOTE_DIR}/ 2>&1',
    timeout=120
)
out = stdout.read().decode()
print(f'  Done')

print('\nVerifying production:')
checks = [
    ('Creating H1', 'grep -c "sr-only" /srv/www/lollipop/current/creating/index.html'),
    ('Download H1', 'grep -c "sr-only" /srv/www/lollipop/current/download/index.html'),
    ('About alt', 'grep -c "Lollipop Drama AI short drama platform banner" /srv/www/lollipop/current/about/index.html'),
    ('Contact alt', 'grep -c "Lollipop Drama contact page banner" /srv/www/lollipop/current/contact/index.html'),
    ('Login alt', 'grep -c "Lollipop Drama AI short drama platform promotional visual" /srv/www/lollipop/current/login/index.html'),
    ('ZH creator excerpt', 'grep -c "角色圣经" /srv/www/lollipop/current/zh/blog/creator-story-character-bible/index.html'),
    ('Sitemap URLs', 'grep -c "<loc>" /srv/www/lollipop/current/sitemap.xml'),
    ('llms.txt', 'wc -c /srv/www/lollipop/current/llms.txt'),
]

for label, cmd in checks:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=10)
    result = stdout.read().decode().strip()
    print(f'  {label}: {result}')

client.close()
print('\nAll done!')
