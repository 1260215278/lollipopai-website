import paramiko

HOST = '43.160.226.253'
USER = 'ubuntu'
KEY_PATH = 'C:/Users/Administrator/.ssh/id_ed25519_hermes'
pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=15)

# Check ownership
print('1. Check file ownership...')
stdin, stdout, stderr = client.exec_command('ls -la /srv/www/lollipop/current/llms.txt /srv/www/lollipop/current/index.html', timeout=10)
print(stdout.read().decode())

# Try sudo rsync
print('2. Sudo rsync...')
stdin, stdout, stderr = client.exec_command('sudo rsync -a --delete /tmp/lollipop-new/ /srv/www/lollipop/current/ 2>&1', timeout=120)
out = stdout.read().decode()
err = stderr.read().decode()
print('Output (last 500):', out[-500:] if out else 'none')
if err:
    print('Errors:', err[:300])

# Verify
print('3. Verify llms.txt...')
stdin, stdout, stderr = client.exec_command('wc -c /srv/www/lollipop/current/llms.txt', timeout=10)
print('llms.txt:', stdout.read().decode().strip())

print('4. Verify blog articles...')
stdin, stdout, stderr = client.exec_command('ls /srv/www/lollipop/current/blog/ | wc -l', timeout=10)
print('Blog dir count:', stdout.read().decode().strip())

stdin, stdout, stderr = client.exec_command('ls /srv/www/lollipop/current/blog/ 2>&1', timeout=10)
all_blogs = stdout.read().decode().strip()
for slug in ['top-8-ai', 'mastering-char', 'ai-script', 'ai-short-drama-local', 'traditional-vs', 'prompting-cine', 'web-novel', 'ai-audio', 'ai-short-drama-monet', 'fixing-ai']:
    found = slug in all_blogs
    print(f'  {slug}...: {"FOUND" if found else "NOT FOUND"}')

client.close()
print('Done!')
