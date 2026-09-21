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

# Upload with retry
print('1. Uploading tar...')
local_size = os.path.getsize(LOCAL_TAR)
for attempt in range(3):
    try:
        client.close()
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, username=USER, pkey=pkey, timeout=15)
        sftp = client.open_sftp()
        sftp.put(LOCAL_TAR, REMOTE_TAR)
        remote_size = sftp.stat(REMOTE_TAR).st_size
        print(f'   Local: {local_size}, Remote: {remote_size}')
        sftp.close()
        if remote_size == local_size:
            print('   Upload verified!')
            break
        else:
            print(f'   Size mismatch, retry {attempt+1}...')
            time.sleep(3)
    except Exception as e:
        print(f'   Upload error: {e}, retry {attempt+1}...')
        time.sleep(3)

# Extract
print('2. Extract to temp dir...')
stdin, stdout, stderr = client.exec_command(
    'rm -rf /tmp/lollipop-new && mkdir -p /tmp/lollipop-new && cd /tmp/lollipop-new && tar xzf /tmp/lollipop-deploy.tar.gz 2>&1',
    timeout=120
)
out = stdout.read().decode()
err = stderr.read().decode()
if out.strip():
    print(f'   Extract output: {out[:200]}')
if err.strip():
    print(f'   Extract errors: {err[:200]}')

# Check extracted
stdin, stdout, stderr = client.exec_command(
    'ls /tmp/lollipop-new/blog/ | head -3 && echo "---" && ls /tmp/lollipop-new/zh/blog/ | head -3 2>/dev/null || echo "No zh/blog"',
    timeout=10
)
print(f'   Sample dirs: {stdout.read().decode().strip()}')

# Rsync
print('3. Sudo rsync...')
stdin, stdout, stderr = client.exec_command(
    'sudo rsync -a --delete /tmp/lollipop-new/ /srv/www/lollipop/current/ 2>&1',
    timeout=180
)
out = stdout.read().decode()
err = stderr.read().decode()
if out.strip():
    print(f'   Rsync: {out[-300:]}')
if err.strip():
    print(f'   Rsync err: {err[-300:]}')

# Verify
print('4. Verify...')
checks = [
    ('robots.txt path', 'head -3 /srv/www/lollipop/current/robots.txt'),
    ('sitemap URL', 'grep -o "lollipop/" /srv/www/lollipop/current/sitemap.xml | head -1'),
    ('blog canonical', 'grep -o "canonical.*lollipop" /srv/www/lollipop/current/blog/ai-anyone-can-create/index.html | head -1'),
    ('blog og:type', 'grep "og:type" /srv/www/lollipop/current/blog/ai-anyone-can-create/index.html | head -1'),
    ('zh blog title', 'grep -o "<title>[^<]*</title>" /srv/www/lollipop/current/zh/blog/ai-anyone-can-create/index.html | head -1'),
    ('llms.txt size', 'wc -c /srv/www/lollipop/current/llms.txt'),
]
for label, cmd in checks:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=10)
    result = stdout.read().decode().strip()
    print(f'   {label}: {result[:120]}')

# Cleanup
client.exec_command('rm -f /tmp/lollipop-deploy.tar.gz && rm -rf /tmp/lollipop-new', timeout=10)
client.close()
print('Done!')
