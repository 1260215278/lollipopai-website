import paramiko, time

HOST = '43.160.226.253'
USER = 'ubuntu'
KEY_PATH = 'C:/Users/Administrator/.ssh/id_ed25519_hermes'
LOCAL_TAR = 'packages/lollipop-all-covers-webp.tar.gz'
REMOTE_TAR = '/tmp/lollipop-all-covers-webp.tar.gz'

def connect():
    pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, pkey=pkey, timeout=30, banner_timeout=30, auth_timeout=30)
    return client

# Upload with retry
for attempt in range(3):
    try:
        print(f'1. Uploading tar (attempt {attempt+1}/3)...')
        client = connect()
        sftp = client.open_sftp()
        sftp.put(LOCAL_TAR, REMOTE_TAR)
        remote_size = sftp.stat(REMOTE_TAR).st_size
        local_size = __import__('os').path.getsize(LOCAL_TAR)
        print(f'   Uploaded: {remote_size} / {local_size} bytes')
        sftp.close()
        if remote_size == local_size:
            print('   Size match OK')
            break
        else:
            print('   Size mismatch, retrying...')
            client.close()
            continue
    except Exception as e:
        print(f'   Error: {e}')
        if attempt < 2:
            time.sleep(5)
        else:
            raise

# Extract
print('2. Extract...')
stdin, stdout, stderr = client.exec_command(
    'rm -rf /tmp/lollipop-new && mkdir -p /tmp/lollipop-new && cd /tmp/lollipop-new && tar xzf /tmp/lollipop-all-covers-webp.tar.gz 2>&1',
    timeout=120
)
out = stdout.read().decode()
err = stderr.read().decode()
if err:
    print(f'   stderr: {err[:300]}')
print(f'   Extract OK')

# Rsync
print('3. Sudo rsync...')
stdin, stdout, stderr = client.exec_command(
    'sudo rsync -a --delete /tmp/lollipop-new/ /srv/www/lollipop/current/ 2>&1',
    timeout=120
)
print(f'   Rsync done')

# Verify
print('4. Verify...')
stdin, stdout, stderr = client.exec_command(
    'ls /srv/www/lollipop/current/blog-images/ | wc -l', timeout=10
)
print(f'   blog-images count: {stdout.read().decode().strip()}')

stdin, stdout, stderr = client.exec_command(
    'grep -c "coverImage" /srv/www/lollipop/current/blog/ai-script-storyboard/index.html', timeout=10
)
print(f'   coverImage in sample article: {stdout.read().decode().strip()}')

stdin, stdout, stderr = client.exec_command(
    'test -f /srv/www/lollipop/current/blog-images/ai-influencer-platform-new.webp && echo WEBP_OK || echo WEBP_MISSING', timeout=10
)
print(f'   New webp image: {stdout.read().decode().strip()}')

stdin, stdout, stderr = client.exec_command(
    'wc -c /srv/www/lollipop/current/llms.txt', timeout=10
)
print(f'   llms.txt: {stdout.read().decode().strip()}')

client.close()
print('Done!')
