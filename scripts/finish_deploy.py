import paramiko

HOST = '43.160.226.253'
USER = 'ubuntu'
KEY_PATH = 'C:/Users/Administrator/.ssh/id_ed25519_hermes'
pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=15)

print('Running rsync...')
stdin, stdout, stderr = client.exec_command(
    'sudo rsync -a --delete /tmp/lollipop-new/ /srv/www/lollipop/current/ 2>&1',
    timeout=120
)
out = stdout.read().decode()
err = stderr.read().decode()
print(f'Rsync done: {out[-200:]}')
if err:
    print(f'Error: {err[:200]}')

print('\nVerifying...')
checks = [
    ('Creating page H1', 'grep -c "sr-only" /srv/www/lollipop/current/creating/index.html'),
    ('Download page H1', 'grep -c "sr-only" /srv/www/lollipop/current/download/index.html'),
    ('About alt tag', 'grep -c "Lollipop Drama AI short drama platform banner" /srv/www/lollipop/current/about/index.html'),
    ('Contact alt tag', 'grep -c "Lollipop Drama contact page banner" /srv/www/lollipop/current/contact/index.html'),
    ('ZH creator-story excerpt', 'grep -c "角色圣经" /srv/www/lollipop/current/zh/blog/creator-story-character-bible/index.html'),
    ('Sitemap URLs', 'grep -c "<loc>" /srv/www/lollipop/current/sitemap.xml'),
    ('llms.txt size', 'wc -c /srv/www/lollipop/current/llms.txt'),
]

for label, cmd in checks:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=10)
    result = stdout.read().decode().strip()
    print(f'  {label}: {result}')

client.close()
print('\nDone!')
