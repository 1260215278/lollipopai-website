# -*- coding: utf-8 -*-
import io, re

PATH = r'C:/Users/Administrator/Documents/lollipop/src/app/data/blogContent.ts'

SLUGS = [
    'creator-story-cost-breakdown',
    'creator-story-student-graduation',
    'creator-story-warm-story-formula',
    'creator-story-side-hustle-income',
    'creator-story-ai-compliance',
    'creator-story-tool-pipeline-comparison',
    'creator-story-character-bible',
]

with io.open(PATH, encoding='utf-8') as f:
    text = f.read()

def contentZh_len(slug):
    marker = '"%s": {' % slug
    idx = text.find(marker)
    if idx == -1:
        return None, None
    cstart = text.find('contentZh: `', idx)
    if cstart == -1:
        return idx, None
    cstart += len('contentZh: `')
    # find closing backtick at line start
    end = text.find('\n`', cstart)
    if end == -1:
        end = text.find('`\n', cstart)
    body = text[cstart:end]
    return idx, len(body)

for s in SLUGS:
    idx, ln = contentZh_len(s)
    print(s, 'idx=', idx, 'zh_len=', ln)
