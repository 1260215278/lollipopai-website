"""
增量部署：只上传 HTML 页面和更新的资源文件
"""
import paramiko
import os
import tarfile
import tempfile
import time

HOST = '43.160.226.253'
USER = 'ubuntu'
KEY_PATH = 'C:/Users/Administrator/.ssh/id_ed25519_hermes'
DIST_DIR = r'c:\Users\Administrator\Documents\lollipop\dist'
REMOTE_DIR = '/srv/www/lollipop/current'

# Only upload HTML files, sitemap, robots.txt, llms.txt (small text files)
# Images already uploaded separately
print('Creating HTML-only tar package...')

html_tar = r'c:\Users\Administrator\Documents\lollipop\packages\html-update.tar.gz'
with tarfile.open(html_tar, 'w:gz') as tar:
    for root, dirs, files in os.walk(DIST_DIR):
        for f in files:
            fp = os.path.join(root, f)
            rel = os.path.relpath(fp, DIST_DIR)
            # Include HTML, XML, TXT, JS, CSS files
            if f.endswith(('.html', '.xml', '.txt', '.json')):
                tar.add(fp, arcname=rel)
            # Also include asset files (JS/CSS)
            elif '/assets/' in rel.replace('\\', '/'):
                tar.add(fp, arcname=rel)

tar_size = os.path.getsize(html_tar)
print(f'Package size: {tar_size/1024/1024:.1f}MB')

def connect():
    pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, pkey=pkey, timeout=30)
    return client

print('Uploading...')
client = connect()
sftp = client.open_sftp()

for attempt in range(3):
    try:
        sftp.put(html_tar, '/tmp/html-update.tar.gz')
        remote_size = sftp.stat('/tmp/html-update.tar.gz').st_size
        if remote_size == tar_size:
            print(f'Upload verified: {remote_size} bytes')
            break
        else:
            print(f'Size mismatch: {remote_size} vs {tar_size}, retry...')
            time.sleep(5)
    except Exception as e:
        print(f'Upload error: {e}, retry {attempt+1}...')
        time.sleep(5)
        try:
            sftp.close()
            client.close()
        except:
            pass
        client = connect()
        sftp = client.open_sftp()

sftp.close()

print('Extracting to temp...')
stdin, stdout, stderr = client.exec_command(
    'rm -rf /tmp/html-new && mkdir -p /tmp/html-new && cd /tmp/html-new && tar xzf /tmp/html-update.tar.gz 2>&1',
    timeout=60
)
out = stdout.read().decode()
err = stderr.read().decode()
if err:
    print(f'Extract error: {err[:200]}')

print('Rsync to production...')
stdin, stdout, stderr = client.exec_command(
    f'sudo rsync -a --include="*.html" --include="*.xml" --include="*.txt" --include="*.json" --include="assets/**" --exclude="*" /tmp/html-new/ {REMOTE_DIR}/ 2>&1',
    timeout=120
)
out = stdout.read().decode()
print(f'Rsync result: {out[-200:]}')

# Verify
print('\nVerifying...')
checks = [
    ('New cover ref in romance genre', f'grep -l "ceo-romance-revenge-prompt-pack.webp" {REMOTE_DIR}/blog/ceo-romance-revenge-short-drama-prompt-pack/index.html'),
    ('Sitemap URLs', f'grep -c "<loc>" {REMOTE_DIR}/sitemap.xml'),
    ('HTML file count', f'find {REMOTE_DIR} -name "index.html" | wc -l'),
]

for label, cmd in checks:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=10)
    result = stdout.read().decode().strip()
    print(f'  {label}: {result}')

client.close()
print('\nDone!')
