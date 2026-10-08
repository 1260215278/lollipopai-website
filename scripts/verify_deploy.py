import paramiko

pkey = paramiko.Ed25519Key.from_private_key_file('C:/Users/Administrator/.ssh/id_ed25519_hermes')
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('43.160.226.253', username='ubuntu', pkey=pkey, timeout=30)

# Check blog list page for cover images
stdin, stdout, stderr = client.exec_command('grep -c "blog-images" /srv/www/lollipop/current/blog/index.html', timeout=10)
result = stdout.read().decode().strip()
print(f'Blog list page: {result} blog-image references')

# Check one blog post
stdin, stdout, stderr = client.exec_command(
    'grep -o "blog-images/[^\"]*\\.webp" /srv/www/lollipop/current/blog/reelshort-alternative-lollipop-vs-reelshort-dramabox-2026/index.html | head -3',
    timeout=10
)
result = stdout.read().decode().strip()
print('Sample blog post cover images:')
for line in result.split('\n'):
    if line:
        print(f'  {line}')

# Check image count
stdin, stdout, stderr = client.exec_command(
    'ls /srv/www/lollipop/current/blog-images/*.webp 2>/dev/null | wc -l',
    timeout=10
)
result = stdout.read().decode().strip()
print(f'WebP images on server: {result}')

stdin, stdout, stderr = client.exec_command(
    'ls /srv/www/lollipop/current/blog-images/ | wc -l',
    timeout=10
)
result = stdout.read().decode().strip()
print(f'Total images on server: {result}')

client.close()
