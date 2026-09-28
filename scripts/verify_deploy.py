import paramiko
HOST = '43.160.226.253'
USER = 'ubuntu'
KEY_PATH = 'C:/Users/Administrator/.ssh/id_ed25519_hermes'
pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=15)

checks = [
    ('Romance genre SEO divs', 'grep -c "genre-seo-content" /srv/www/lollipop/current/genre/romance/index.html'),
    ('Romance genre FAQ', 'grep -c "Frequently Asked Questions" /srv/www/lollipop/current/genre/romance/index.html'),
    ('Romance page size', 'wc -c /srv/www/lollipop/current/genre/romance/index.html'),
    ('ZH Romance genre SEO', 'grep -c "genre-seo-content" /srv/www/lollipop/current/zh/genre/romance/index.html'),
    ('ZH-TW Romance genre SEO', 'grep -c "genre-seo-content" /srv/www/lollipop/current/zh-TW/genre/romance/index.html'),
    ('Sitemap URLs count', 'grep -c "<loc>" /srv/www/lollipop/current/sitemap.xml'),
]

for label, cmd in checks:
    stdin, stdout, stderr = client.exec_command(cmd, timeout=10)
    result = stdout.read().decode().strip()
    print(f'{label}: {result}')

client.close()
