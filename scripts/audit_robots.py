import os
import re

dist_dir = r'c:\Users\Administrator\Documents\lollipop\dist'

# 1. Read current robots.txt
robots_path = os.path.join(dist_dir, 'robots.txt')
with open(robots_path, 'r', encoding='utf-8') as f:
    robots = f.read()
print('=== Current robots.txt ===')
print(robots)
print()

# 2. Check if disallowed paths exist
disallow_paths = re.findall(r'Disallow:\s*(\S+)', robots)
print('=== Disallow path validation ===')
for path in disallow_paths:
    # Strip leading / and trailing /
    clean = path.strip('/')
    if not clean:
        continue
    dir_path = os.path.join(dist_dir, clean)
    file_path = os.path.join(dist_dir, clean + '.html')
    index_path = os.path.join(dist_dir, clean, 'index.html')
    
    exists = os.path.isdir(dir_path) or os.path.exists(file_path) or os.path.exists(index_path)
    print(f'  {path}: exists={exists}')

# 3. Check for pages that should be disallowed but aren't
print('\n=== Pages that might need disallow ===')

# Check common admin/private paths
suspect_paths = [
    'admin', 'dashboard', 'settings', 'account', 'profile',
    'api', 'assets', 'static', 'cdn-cgi',
]

# Also check for noindex pages that should match robots
noindex_pages = []
for root, dirs, files in os.walk(dist_dir):
    for f in files:
        if f == 'index.html':
            fp = os.path.join(root, f)
            with open(fp, 'r', encoding='utf-8') as fh:
                content = fh.read()
            if re.search(r'<meta\s+name=["\']robots["\']\s+content=["\'][^"\']*noindex', content, re.I):
                rel = fp.replace(dist_dir, '').replace('\\index.html', '').replace('\\', '/')
                if not rel:
                    rel = '/'
                noindex_pages.append(rel)

print(f'  Pages with noindex meta tag: {len(noindex_pages)}')
for p in sorted(noindex_pages):
    # Check if covered by any Disallow rule
    covered = False
    for d in disallow_paths:
        if d.endswith('/') and p.startswith(d):
            covered = True
            break
        if p == d.rstrip('/'):
            covered = True
            break
    if not covered:
        print(f'  ⚠️  {p} (noindex but not in robots.txt)')

# 4. Check sitemap URL
sitemap_match = re.search(r'Sitemap:\s*(\S+)', robots, re.I)
if sitemap_match:
    sitemap_url = sitemap_match.group(1)
    print(f'\n=== Sitemap URL ===')
    print(f'  {sitemap_url}')
    # Check if sitemap exists
    sitemap_path = os.path.join(dist_dir, 'sitemap.xml')
    print(f'  sitemap.xml exists: {os.path.exists(sitemap_path)}')

# 5. Check for duplicate/overlapping rules
print('\n=== Rule overlap analysis ===')
user_agents = re.findall(r'User-agent:\s*(\S+)', robots)
print(f'  Total User-agent blocks: {len(user_agents)}')
print(f'  User-agents: {user_agents}')

# Check how many have Allow: / only
allow_all = []
for ua in user_agents:
    # Find block for this UA
    block_match = re.search(rf'User-agent:\s*{re.escape(ua)}\s*\n((?:Allow|Disallow):.*\n?)*', robots)
    if block_match:
        block = block_match.group(0)
        if 'Allow: /' in block and 'Disallow:' not in block.replace('User-agent:', ''):
            allow_all.append(ua)
print(f'  Blocks with only "Allow: /": {len(allow_all)}')
for ua in allow_all:
    print(f'    - {ua}')

# 6. Check llms.txt reference
print('\n=== llms.txt reference ===')
has_llms = 'llms.txt' in robots.lower()
print(f'  llms.txt mentioned: {has_llms}')
llms_path = os.path.join(dist_dir, 'llms.txt')
print(f'  llms.txt exists: {os.path.exists(llms_path)}')
