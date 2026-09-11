import paramiko

HOST = '43.160.226.253'
USER = 'ubuntu'
KEY_PATH = 'C:/Users/Administrator/.ssh/id_ed25519_hermes'
LOCAL_TAR = 'packages/lollipop-geo-articles-with-images-20260911.tar.gz'
REMOTE_TAR = '/tmp/lollipop-full-deploy.tar.gz'

pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=15)

print('1. Uploading tar...')
sftp = client.open_sftp()
sftp.put(LOCAL_TAR, REMOTE_TAR)
sftp.close()
print('   Done.')

print('2. Extract...')
stdin, stdout, stderr = client.exec_command(
    'rm -rf /tmp/lollipop-new && mkdir -p /tmp/lollipop-new && cd /tmp/lollipop-new && tar xzf /tmp/lollipop-full-deploy.tar.gz 2>&1',
    timeout=60
)
print('   ', stdout.read().decode()[:200])

print('3. Rsync...')
stdin, stdout, stderr = client.exec_command(
    'sudo rsync -a --delete /tmp/lollipop-new/ /srv/www/lollipop/current/ 2>&1',
    timeout=120
)
print('   ', stdout.read().decode()[-200:])

print('4. Verify...')
stdin, stdout, stderr = client.exec_command(
    'test -f /srv/www/lollipop/current/blog-images/top-8-ai-engines-comparison-new.jpg && echo IMAGE_OK || echo IMAGE_MISSING',
    timeout=10
)
print('   Cover image:', stdout.read().decode().strip())

stdin, stdout, stderr = client.exec_command(
    'grep -c "top-8-ai-engines-comparison-new" /srv/www/lollipop/current/blog/top-8-ai-short-drama-engines-2026/index.html',
    timeout=10
)
print('   Image ref in HTML:', stdout.read().decode().strip())

stdin, stdout, stderr = client.exec_command(
    'grep -c "coverImage" /srv/www/lollipop/current/blog/top-8-ai-short-drama-engines-2026/index.html',
    timeout=10
)
print('   coverImage in HTML:', stdout.read().decode().strip())

client.close()
print('Done!')
