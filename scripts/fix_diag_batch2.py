# -*- coding: utf-8 -*-
import io

PATH = r'C:/Users/Administrator/Documents/lollipop/src/app/data/blogContent.ts'

with io.open(PATH, encoding='utf-8') as f:
    text = f.read()

slugs = ['creator-story-cost-breakdown',
         'creator-story-student-graduation',
         'creator-story-warm-story-formula',
         'creator-story-side-hustle-income',
         'creator-story-ai-compliance',
         'creator-story-tool-pipeline-comparison',
         'creator-story-character-bible']

print('--- slug marker positions ---')
pos = {}
for s in slugs:
    p = text.find('"%s": {' % s)
    pos[s] = p
    print(s, p)

# locate the misplaced side-hustle block
mk = '## 全职妈妈做短剧副业，现实吗？'
p = text.find(mk)
print('\n--- side-hustle block header at', p, '---')
print('side-hustle slug pos', pos['creator-story-side-hustle-income'])
print('ai-compliance slug pos', pos['creator-story-ai-compliance'])
print('Is block inside side-hustle range?',
      pos['creator-story-side-hustle-income'] < p < pos['creator-story-ai-compliance'])

# count occurrences of the injected header
print('occurrences of mk:', text.count(mk))

# check half-width FAQ inside side-hustle range
s_start = pos['creator-story-side-hustle-income']
s_end = pos['creator-story-ai-compliance']
seg = text[s_start:s_end]
print('side-hustle segment len', len(seg))
print('has full-width FAQ:', '## 常见问题（FAQ）' in seg)
print('has half-width FAQ:', '## 常见问题(FAQ)' in seg)
