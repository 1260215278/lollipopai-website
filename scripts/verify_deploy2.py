import paramiko

pkey = paramiko.Ed25519Key.from_private_key_file('C:/Users/Administrator/.ssh/id_ed25519_hermes')
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('43.160.226.253', username='ubuntu', pkey=pkey, timeout=30)

# Check blog post for og:image
stdin, stdout, stderr = client.exec_command(
    'grep "og:image" /srv/www/lollipop/current/blog/reelshort-alternative-lollipop-vs-reelshort-dramabox-2026/index.html',
    timeout=10
)
result = stdout.read().decode().strip()
print('og:image tags:')
for line in result.split('\n'):
    if line:
        print(f'  {line.strip()[:150]}')

# Check for any webp references
stdin, stdout, stderr = client.exec_command(
    'grep -c "\\.webp" /srv/www/lollipop/current/blog/reelshort-alternative-lollipop-vs-reelshort-dramabox-2026/index.html',
    timeout=10
)
result = stdout.read().decode().strip()
print(f'WebP references in post page: {result}')

# Check blog list
stdin, stdout, stderr = client.exec_command(
    'grep -c "\\.webp" /srv/www/lollipop/current/blog/index.html',
    timeout=10
)
result = stdout.read().decode().strip()
print(f'WebP references in blog list: {result}')

# Check if new images exist
new_images = [
    "reelshort-alternative-lollipop-vs-reelshort-dramabox-2026.webp",
    "what-is-ai-short-drama-2026.webp",
    "best-ai-short-drama-platforms-2026.webp",
    "ai-short-drama-monetization.webp",
    "ai-short-drama-overseas-compliance.webp",
    "ai-influencer-monetization.webp",
    "ai-short-drama-industry-trends-2026.webp",
    "ai-short-drama-promotion-guide-2026.webp",
    "ai-short-drama-7-day-tutorial-2026.webp",
]
print('\nNew images on server:')
all_ok = True
for img in new_images:
    stdin, stdout, stderr = client.exec_command(
        f'test -f /srv/www/lollipop/current/blog-images/{img} && echo OK || echo MISSING',
        timeout=5
    )
    result = stdout.read().decode().strip()
    status = 'OK' if result == 'OK' else 'MISSING'
    if status == 'MISSING':
        all_ok = False
    print(f'  {img}: {status}')

print(f'\nAll 9 new images present: {all_ok}')

client.close()
