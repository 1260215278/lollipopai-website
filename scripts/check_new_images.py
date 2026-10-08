import paramiko
import os

pkey = paramiko.Ed25519Key.from_private_key_file('C:/Users/Administrator/.ssh/id_ed25519_hermes')
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('43.160.226.253', username='ubuntu', pkey=pkey, timeout=30)

# Delete the old tar file
stdin, stdout, stderr = client.exec_command('rm -f /tmp/lollipop-deploy.tar.gz', timeout=10)
stdout.read()
print('Old tar deleted on server')

# Check what's in dist/blog-images locally
local_imgs = os.listdir(r'c:\Users\Administrator\Documents\lollipop\dist\blog-images')
webp_count = len([f for f in local_imgs if f.endswith('.webp')])
jpg_count = len([f for f in local_imgs if f.endswith('.jpg')])
print(f'Local dist/blog-images: {len(local_imgs)} total ({webp_count} webp, {jpg_count} jpg)')

# Check for our new files
new_slugs = [
    'reelshort-alternative-lollipop-vs-reelshort-dramabox-2026',
    'what-is-ai-short-drama-2026',
    'best-ai-short-drama-platforms-2026',
    'ai-short-drama-monetization',
    'ai-short-drama-overseas-compliance',
    'ai-influencer-monetization',
    'ai-short-drama-industry-trends-2026',
    'ai-short-drama-promotion-guide-2026',
    'ai-short-drama-7-day-tutorial-2026',
]
for slug in new_slugs:
    f = slug + '.webp'
    status = 'OK' if f in local_imgs else 'MISSING'
    print(f'  {f}: {status}')

client.close()
