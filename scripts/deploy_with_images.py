import paramiko, os, time

HOST = '43.160.226.253'
USER = 'ubuntu'
KEY_PATH = 'C:/Users/Administrator/.ssh/id_ed25519_hermes'
LOCAL_TAR = 'packages/lollipop-geo-articles-with-images-20260911.tar.gz'
REMOTE_TAR = '/tmp/lollipop-full-deploy.tar.gz'

pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=15)

# Step 1: Upload tar
print(f'1. Uploading {LOCAL_TAR}...')
sftp = client.open_sftp()
sftp.put(LOCAL_TAR, REMOTE_TAR)
sftp.close()
print('   Upload done.')

# Step 2: Extract to temp dir
print('2. Extract to temp dir...')
stdin, stdout, stderr = client.exec_command('rm -rf /tmp/lollipop-new && mkdir -p /tmp/lollipop-new && cd /tmp/lollipop-new && tar xzf /tmp/lollipop-full-deploy.tar.gz 2>&1', timeout=60)
out = stdout.read().decode()
err = stderr.read().decode()
print(f'   Extract: {out[:200]}' if out else '   Extract: OK')
if err:
    print(f'   Errors: {err[:200]}')

# Step 3: Rsync to deploy dir
print('3. Sudo rsync to deploy dir...')
stdin, stdout, stderr = client.exec_command('sudo rsync -a --delete /tmp/lollipop-new/ /srv/www/lollipop/current/ 2>&1', timeout=120)
out = stdout.read().decode()
print(f'   Rsync: done (last 200: {out[-200:]})')

# Step 4: Verify
print('4. Verify...')
stdin, stdout, stderr = client.exec_command('wc -c /srv/www/lollipop/current/llms.txt', timeout=10)
print(f'   llms.txt: {stdout.read().decode().strip()}')

stdin, stdout, stderr = client.exec_command('ls /srv/www/lollipop/current/blog/ | wc -l', timeout=10)
print(f'   Blog dirs: {stdout.read().decode().strip()}')

# Check cover images
for img in ['top-8-ai-engines-comparison-new.jpg', 'mastering-character-consistency-ai-video-new.jpg', 'fix-ai-video-artifacts-new.webp']:
    stdin, stdout, stderr = client.exec_command(f'test -f /srv/www/lollipop/current/blog-images/{img} && echo OK || echo MISSING', timeout=10)
    print(f'   {img}: {stdout.read().decode().strip()}')

# Check a blog article has coverImage in HTML
stdin, stdout, stderr = client.exec_command('grep -o "coverImage" /srv/www/lollipop/current/blog/top-8-ai-short-drama-engines-2026/index.html | wc -l', timeout=10)
print(f'   coverImage in article HTML: {stdout.read().decode().strip()}')

stdin, stdout, stderr = client.exec_command('grep -o "top-8-ai-engines-comparison-new" /srv/www/lollipop/current/blog/top-8-ai-short-drama-engines-2026/index.html | wc -l', timeout=10)
print(f'   cover image reference in HTML: {stdout.read().decode().strip()}')

client.close()
print('Done!')
