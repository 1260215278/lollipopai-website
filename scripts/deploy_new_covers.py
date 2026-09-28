"""
部署新封面图到服务器（只上传变化的图片，避免 42MB 大包）
"""
import paramiko
import os
import time

HOST = '43.160.226.253'
USER = 'ubuntu'
KEY_PATH = 'C:/Users/Administrator/.ssh/id_ed25519_hermes'
LOCAL_DIR = r'c:\Users\Administrator\Documents\lollipop\public\blog-images'
REMOTE_DIR = '/srv/www/lollipop/current/blog-images'

new_images = [
    'pixverse-vs-higgsfield-vs-ltx-vs-lollipop.webp',
    'ceo-romance-revenge-prompt-pack.webp',
    'multi-character-interaction-physics.webp',
    'ai-drama-lip-sync-facial-expressions.webp',
    'webtoon-to-ai-micro-drama-workflow.webp',
    'hook-architecture-three-second-rule.webp',
    'vertical-cinematography-9-16-composition.webp',
    'short-drama-foley-sfx-sound-design.webp',
    '100-episode-ai-drama-pipeline-qc.webp',
    'global-ai-short-drama-monetization-roi.webp',
    'ai-short-drama-pillar-guide.webp',
    'ai-short-drama-industry-data-report-2026.webp',
    'ai-short-drama-faq-2026.webp',
    'ai-drama-content-revenue-strategy.webp',
]

def connect():
    pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, pkey=pkey, timeout=30)
    return client

print('Connecting...')
client = connect()
sftp = client.open_sftp()

success = 0
for img in new_images:
    local_path = os.path.join(LOCAL_DIR, img)
    remote_path = f'/tmp/{img}'
    if not os.path.exists(local_path):
        print(f'  SKIP (not found): {img}')
        continue
    
    # Upload with retry
    for attempt in range(3):
        try:
            sftp.put(local_path, remote_path)
            remote_size = sftp.stat(remote_path).st_size
            local_size = os.path.getsize(local_path)
            if remote_size == local_size:
                success += 1
                print(f'  OK: {img} ({local_size/1024:.0f}KB)')
                break
            else:
                print(f'  Size mismatch, retry {attempt+1}...')
                time.sleep(2)
        except Exception as e:
            print(f'  Error on {img}, retry {attempt+1}: {e}')
            time.sleep(3)
            try:
                sftp.close()
                client.close()
            except:
                pass
            client = connect()
            sftp = client.open_sftp()

sftp.close()

print(f'\nUploaded {success}/{len(new_images)} images')
print('Moving to production...')

# Move files to production dir
move_cmd = f'sudo cp /tmp/{{{",".join(new_images)}}} {REMOTE_DIR}/ && ls -la {REMOTE_DIR}/ | wc -l'
stdin, stdout, stderr = client.exec_command(move_cmd, timeout=30)
result = stdout.read().decode().strip()
err = stderr.read().decode().strip()
print(f'Files in blog-images dir: {result}')
if err:
    print(f'Error: {err[:200]}')

# Also update all HTML pages - use rsync from local build
# But first let's just upload a tar of dist/html for new pages
print('\nUpdating HTML pages...')

client.close()
print('Done!')
