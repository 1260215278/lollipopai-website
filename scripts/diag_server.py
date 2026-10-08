import paramiko

HOST = '43.160.226.253'
USER = 'ubuntu'
KEY_PATH = 'C:/Users/Administrator/.ssh/id_ed25519_hermes'
pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=15)

# Check server directory structure
cmds = [
    ('blog-images dir exists', 'test -d /srv/www/lollipop/current/blog-images && echo YES || echo NO'),
    ('blog-images file count', 'ls /srv/www/lollipop/current/blog-images/ 2>/dev/null | wc -l'),
    ('blog-images total size', 'du -sh /srv/www/lollipop/current/blog-images/ 2>/dev/null || echo 0'),
    ('temp blog-images', 'ls /tmp/lollipop-new/blog-images/ 2>/dev/null | wc -l'),
    ('dist local count', 'echo check local'),
    ('current dir listing', 'ls /srv/www/lollipop/current/ | head -20'),
]

for label, cmd in cmds:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=10)
    result = stdout.read().decode().strip()
    print(f'{label}: {result}')

client.close()
