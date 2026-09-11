import paramiko, os, time

HOST = '43.160.226.253'
USER = 'ubuntu'
KEY_PATH = 'C:/Users/Administrator/.ssh/id_ed25519_hermes'
LOCAL_TAR = 'packages/lollipop-deploy.tar.gz'
REMOTE_TAR = '/tmp/lollipop-deploy.tar.gz'

pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=15)

# Upload
print('1. Uploading tar...')
sftp = client.open_sftp()
sftp.put(LOCAL_TAR, REMOTE_TAR)
remote_size = sftp.stat(REMOTE_TAR).st_size
print(f'   Uploaded: {remote_size} bytes')
sftp.close()

# Extract
print('2. Extract to temp dir...')
stdin, stdout, stderr = client.exec_command(
    'rm -rf /tmp/lollipop-new && mkdir -p /tmp/lollipop-new && cd /tmp/lollipop-new && tar xzf /tmp/lollipop-deploy.tar.gz 2>&1',
    timeout=60
)
out = stdout.read().decode()
err = stderr.read().decode()
print(f'   Extract stdout: {out[:300]}')
if err:
    print(f'   Extract stderr: {err[:300]}')

# Check extracted content
stdin, stdout, stderr = client.exec_command('ls /tmp/lollipop-new/blog-images/ | head -5', timeout=10)
print(f'   Sample blog-images: {stdout.read().decode().strip()}')

stdin, stdout, stderr = client.exec_command('test -f /tmp/lollipop-new/blog-images/top-8-ai-engines-comparison-new.jpg && echo FOUND || echo MISSING', timeout=10)
print(f'   Cover image in temp: {stdout.read().decode().strip()}')

# Rsync
print('3. Sudo rsync...')
stdin, stdout, stderr = client.exec_command(
    'sudo rsync -a --delete /tmp/lollipop-new/ /srv/www/lollipop/current/ 2>&1',
    timeout=120
)
out = stdout.read().decode()
print(f'   Rsync: {out[-300:]}')

# Verify
print('4. Verify...')
stdin, stdout, stderr = client.exec_command(
    'test -f /srv/www/lollipop/current/blog-images/top-8-ai-engines-comparison-new.jpg && echo IMAGE_OK || echo IMAGE_MISSING',
    timeout=10
)
print(f'   Cover image: {stdout.read().decode().strip()}')

stdin, stdout, stderr = client.exec_command(
    'grep -c "top-8-ai-engines-comparison" /srv/www/lollipop/current/blog/top-8-ai-short-drama-engines-2026/index.html',
    timeout=10
)
print(f'   Image ref in HTML: {stdout.read().decode().strip()}')

stdin, stdout, stderr = client.exec_command(
    'wc -c /srv/www/lollipop/current/llms.txt',
    timeout=10
)
print(f'   llms.txt: {stdout.read().decode().strip()}')

client.close()
print('Done!')
