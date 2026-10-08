import paramiko

HOST = '43.160.226.253'
USER = 'ubuntu'
KEY_PATH = 'C:/Users/Administrator/.ssh/id_ed25519_hermes'
pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, pkey=pkey, timeout=15)

# Check server image inventory
stdin, stdout, stderr = client.exec_command('ls /srv/www/lollipop/current/blog-images/ | wc -l', timeout=10)
print(f'Server blog-images count: {stdout.read().decode().strip()}')

stdin, stdout, stderr = client.exec_command('ls /srv/www/lollipop/current/blog-images/*.webp 2>/dev/null | wc -l', timeout=10)
print(f'Server WebP files: {stdout.read().decode().strip()}')

stdin, stdout, stderr = client.exec_command('ls /srv/www/lollipop/current/blog-images/*.jpg 2>/dev/null | wc -l', timeout=10)
print(f'Server JPG files: {stdout.read().decode().strip()}')

# Check the 13 new article images
NEW_IMAGES = [
    "pixverse-vs-higgsfield-vs-ltx-vs-lollipop.webp",
    "ceo-romance-revenge-prompt-pack.webp",
    "multi-character-interaction-physics.webp",
    "ai-drama-lip-sync-facial-expressions.webp",
    "webtoon-to-ai-micro-drama-workflow.webp",
    "hook-architecture-three-second-rule.webp",
    "vertical-cinematography-9-16-composition.webp",
    "short-drama-foley-sfx-sound-design.webp",
    "100-episode-ai-drama-pipeline-qc.webp",
    "global-ai-short-drama-monetization-roi.webp",
    "ai-short-drama-pillar-guide.webp",
    "ai-short-drama-industry-data-report-2026.webp",
    "ai-short-drama-faq-2026.webp",
]

print("\n=== 13 New Article Images on Server ===")
for img in NEW_IMAGES:
    cmd = f'test -f /srv/www/lollipop/current/blog-images/{img} && echo OK || echo MISSING'
    stdin, stdout, stderr = client.exec_command(cmd, timeout=5)
    status = stdout.read().decode().strip()
    if status == 'MISSING':
        print(f"  {img}: MISSING!")
    else:
        cmd = f'stat -c %s /srv/www/lollipop/current/blog-images/{img}'
        stdin, stdout, stderr = client.exec_command(cmd, timeout=5)
        size = stdout.read().decode().strip()
        print(f"  {img}: OK ({int(size)//1024}KB)")

client.close()
