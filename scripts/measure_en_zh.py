# -*- coding: utf-8 -*-
import io

PATH = r'C:/Users/Administrator/Documents/lollipop/src/app/data/blogContent.ts'

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

with io.open(PATH, encoding='utf-8') as f:
    text = f.read()

def body_len(idx, key):
    cs = text.find('%s: `' % key, idx)
    if cs == -1:
        return None
    cs += len('%s: `' % key)
    end = text.find('\n`', cs)
    if end == -1:
        end = text.find('`\n', cs)
    return len(text[cs:end])

print('%-40s %8s %8s %8s' % ('slug', 'EN', 'ZH', 'gap'))
for s in SLUGS:
    idx = text.find('"%s": {' % s)
    if idx == -1:
        print(s, 'NOT FOUND'); continue
    en = body_len(idx, 'content')
    zh = body_len(idx, 'contentZh')
    print('%-40s %8s %8s %8s' % (s, en, zh, (en - zh) if (en and zh) else '?'))
