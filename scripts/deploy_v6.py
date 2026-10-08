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
client.connect(HOST, username=USER, pkey=pkey, timeout=30, banner_timeout=30)
print('Connected')

sftp = client.open_sftp()
local_size = os.path.getsize(LOCAL_TAR)
print(f'Uploading {local_size/1024/1024:.1f}MB...')
sftp.put(LOCAL_TAR, REMOTE_TAR)
remote_size = sftp.stat(REMOTE_TAR).st_size
print(f'Uploaded: {remote_size/1024/1024:.1f}MB')
sftp.close()

print('Extracting...')
stdin, stdout, stderr = client.exec_command(
    'rm -rf /tmp/lollipop-new && mkdir -p /tmp/lollipop-new && cd /tmp/lollipop-new && tar xzf /tmp/lollipop-deploy.tar.gz',
    timeout=60
)
stdout.read()
stderr.read()

stdin, stdout, stderr = client.exec_command(
    'grep -c "sr-only" /tmp/lollipop-new/creating/index.html',
    timeout=10
)
print(f'Temp creating H1: {stdout.read().decode().strip()}')

print('Rsync...')
stdin, stdout, stderr = client.exec_command(
    'sudo rsync -a --delete /tmp/lollipop-new/ /srv/www/lollipop/current/ 2>&1',
    timeout=120
)
stdout.read()
print('Done')

verify_cmds = [
    ('Prod creating H1', 'grep -c "sr-only" /srv/www/lollipop/current/creating/index.html'),
    ('Prod download H1', 'grep -c "sr-only" /srv/www/lollipop/current/download/index.html'),
    ('Prod about alt', 'grep -c "Lollipop Drama AI short drama" /srv/www/lollipop/current/about/index.html'),
    ('Sitemap URLs', 'grep -c "<loc>" /srv/www/lollipop/current/sitemap.xml'),
]

for label, cmd in verify_cmds:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=10)
    result = stdout.read().decode().strip()
    print(f'  {label}: {result}')

client.close()
print('All done!')
