# -*- coding: utf-8 -*-
# Add coverImage to the 10 creator-story entries in blog.ts.
# File is CRLF -> read/write with newline="" and insert \r\n lines.
# Insert once (right after the slug line) to avoid duplicate-key warnings.
import io

PATH = r'C:/Users/Administrator/Documents/lollipop/src/app/data/blog.ts'

SLUGS = [
    'creator-story-taiwan-solo-daily',
    'creator-story-topic-selection',
    'creator-story-script-licensing',
    'creator-story-cost-breakdown',
    'creator-story-student-graduation',
    'creator-story-warm-story-formula',
    'creator-story-side-hustle-income',
    'creator-story-ai-compliance',
    'creator-story-tool-pipeline-comparison',
    'creator-story-character-bible',
]

NL = '\r\n'

with io.open(PATH, encoding='utf-8', newline='') as f:
    text = f.read()

if '\r\n' not in text:
    NL = '\n'
    print('NOTE: file is LF, using LF')

inserts = []   # (position, line)
for slug in SLUGS:
    marker = '    slug: "%s",' % slug
    i = text.find(marker)
    if i == -1:
        print('NOT FOUND:', slug); continue
    line_end = text.find(NL, i)
    if line_end == -1:
        print('NO LINE END:', slug); continue
    pos = line_end + len(NL)
    # safety: skip if a coverImage already directly follows
    nxt = text[pos:pos + 40]
    if 'coverImage' in nxt:
        print('ALREADY HAS coverImage:', slug); continue
    line = '    coverImage: "/blog-images/%s-new.webp",' % slug
    inserts.append((pos, line))
    print('queued %-42s at %d' % (slug, pos))

# insert from the end so earlier positions stay valid
for pos, line in sorted(inserts, reverse=True):
    text = text[:pos] + line + NL + text[pos:]

with io.open(PATH, 'w', encoding='utf-8', newline='') as f:
    f.write(text)
print('INSERTED %d coverImage lines; WRITE DONE' % len(inserts))
