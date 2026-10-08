import paramiko
import re

HOST = '43.160.226.253'
USER = 'ubuntu'
KEY_PATH = 'C:/Users/Administrator/.ssh/id_ed25519_hermes'
pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=15)

pages = [
    'ar/genre/romance',
    'zh/genre/romance', 
    'es/genre/action',
    'pt/genre/fantasy',
    'zh-TW/genre/sci-fi',
]

for page in pages:
    cmd = f'grep \'meta name="description"\' /srv/www/lollipop/current/{page}/index.html'
    stdin, stdout, stderr = client.exec_command(cmd, timeout=10)
    result = stdout.read().decode().strip()
    m = re.search(r'content="([^"]+)"', result)
    if m:
        desc = m.group(1)
        has_undefined = 'undefined' in desc.lower()
        print(f'/{page}:')
        print(f'  {len(desc)} chars, undefined={has_undefined}')
        if len(desc) > 120:
            print(f'  "{desc[:120]}..."')
        else:
            print(f'  "{desc}"')
    else:
        print(f'/{page}: NO MATCH')
    print()

client.close()
