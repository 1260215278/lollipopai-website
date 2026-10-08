import paramiko

HOST = '43.160.226.253'
USER = 'ubuntu'
KEY_PATH = 'C:/Users/Administrator/.ssh/id_ed25519_hermes'
pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=15)

# Check temp dir content
checks = [
    ('Temp creating H1', 'grep -c "sr-only" /tmp/lollipop-new/creating/index.html'),
    ('Temp about alt', 'grep -c "Lollipop Drama AI short drama platform banner" /tmp/lollipop-new/about/index.html'),
    ('Temp download H1', 'grep -c "sr-only" /tmp/lollipop-new/download/index.html'),
    ('Prod creating H1', 'grep -c "sr-only" /srv/www/lollipop/current/creating/index.html'),
    ('Prod about alt', 'grep -c "Lollipop Drama AI short drama platform banner" /srv/www/lollipop/current/about/index.html'),
    ('Prod llms.txt', 'wc -c /srv/www/lollipop/current/llms.txt'),
    ('Temp llms.txt', 'wc -c /tmp/lollipop-new/llms.txt'),
]

for label, cmd in checks:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=10)
    result = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    print(f'{label}: {result}')
    if err:
        print(f'  err: {err[:100]}')

# Force rsync
print('\nRunning rsync...')
stdin, stdout, stderr = client.exec_command(
    'sudo rsync -av --delete /tmp/lollipop-new/ /srv/www/lollipop/current/ 2>&1 | tail -5',
    timeout=120
)
out = stdout.read().decode()
print(f'Rsync: {out[-300:]}')

# Verify again
print('\nPost-rsync verification:')
for label, cmd in [
    ('Prod creating H1', 'grep -c "sr-only" /srv/www/lollipop/current/creating/index.html'),
    ('Prod about alt', 'grep -c "Lollipop Drama AI short drama platform banner" /srv/www/lollipop/current/about/index.html'),
]:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=10)
    result = stdout.read().decode().strip()
    print(f'  {label}: {result}')

client.close()
