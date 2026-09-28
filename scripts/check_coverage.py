import os, re

dist_dir = r'c:\Users\Administrator\Documents\lollipop\dist'

# Count all HTML files
html_files = []
for root, dirs, files in os.walk(dist_dir):
    for f in files:
        if f.endswith('.html'):
            html_files.append(os.path.join(root, f))
print(f'Total HTML files: {len(html_files)}')

# Count noindex pages
noindex_files = []
for fp in html_files:
    with open(fp, 'r', encoding='utf-8') as fh:
        content = fh.read()
        if re.search(r'<meta\s+name=["\']robots["\']\s+content=["\'][^"\']*noindex', content, re.I):
            noindex_files.append(fp)
print(f'Noindex pages: {len(noindex_files)}')
for f in noindex_files[:20]:
    rel = f.replace(dist_dir, '')
    print(f'  {rel}')

# Check for canonical tags
no_canonical = []
for fp in html_files:
    with open(fp, 'r', encoding='utf-8') as fh:
        content = fh.read()
        if 'rel="canonical"' not in content and "rel='canonical'" not in content:
            no_canonical.append(fp)
print(f'\nPages without canonical: {len(no_canonical)}')
for f in no_canonical[:10]:
    rel = f.replace(dist_dir, '')
    print(f'  {rel}')

# Check sitemap vs actual pages mismatch
sitemap_path = os.path.join(dist_dir, 'sitemap.xml')
with open(sitemap_path, 'r', encoding='utf-8') as f:
    sitemap = f.read()
sitemap_urls = re.findall(r'<loc>([^<]+)</loc>', sitemap)
print(f'\nSitemap URLs: {len(sitemap_urls)}')

# Check sitemap for /login and /forgot-password
login_in_sitemap = any('/login' in u for u in sitemap_urls)
forgot_in_sitemap = any('/forgot-password' in u for u in sitemap_urls)
print(f'Login in sitemap: {login_in_sitemap}')
print(f'Forgot password in sitemap: {forgot_in_sitemap}')

# Check distribution pages
dist_count = sum(1 for u in sitemap_urls if '/distribution/' in u)
print(f'Distribution pages in sitemap: {dist_count}')

# Check zh/ alternate pages
zh_count = sum(1 for u in sitemap_urls if '/zh/' in u)
print(f'ZH pages in sitemap: {zh_count}')
