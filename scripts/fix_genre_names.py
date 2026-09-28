import re

fp = r'c:\Users\Administrator\Documents\lollipop\scripts\prerender-plugin.ts'
with open(fp, 'r', encoding='utf-8') as f:
    content = f.read()

genre_names = {
    'thriller': 'Thriller',
    'ceo-drama': 'CEO Drama',
    'fantasy': 'Fantasy',
    'action': 'Action',
    'horror': 'Horror',
    'sci-fi': 'Sci-Fi',
    'family': 'Family',
    'historical': 'Historical',
}

for slug, name in genre_names.items():
    pattern = f'(  {slug}: \{{\n)(    about:)'
    replacement = f'\\1    name: "{name}",\\2'
    content = re.sub(pattern, replacement, content)

with open(fp, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')
