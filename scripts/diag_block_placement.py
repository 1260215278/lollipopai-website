# -*- coding: utf-8 -*-
import io

PATH = r'C:/Users/Administrator/Documents/lollipop/src/app/data/blogContent.ts'

ALL = ['creator-story-taiwan-solo-daily',
       'creator-story-topic-selection',
       'creator-story-script-licensing',
       'creator-story-cost-breakdown',
       'creator-story-student-graduation',
       'creator-story-warm-story-formula',
       'creator-story-side-hustle-income',
       'creator-story-ai-compliance',
       'creator-story-tool-pipeline-comparison',
       'creator-story-character-bible']

with io.open(PATH, encoding='utf-8') as f:
    text = f.read()

# fresh (current) positions
pos = []
for s in ALL:
    p = text.find('"%s": {' % s)
    pos.append((p, s))
pos.sort()
print('--- current slug order ---')
for p, s in pos:
    print(p, s)

def owner(idx):
    own = None
    for p, s in pos:
        if p <= idx:
            own = s
    return own

HEADERS = {
    'cost-breakdown(c)': '## 单集成本到底怎么逐项记账？',
    'student-graduation(c)': '## 竖屏分镜到底怎么画才对？',
    'warm-story-formula(c)': '## 前 3 秒怎么写，才能把人留住？',
    'side-hustle-income(c)': '## 第一个月具体做什么？30 天路径',
    'ai-compliance(c)': '## 平台条款会变，怎么持续跟踪？',
    'tool-pipeline(c)': '## 从拼接模式切到一体化，迁移成本有多高？',
    'character-bible(c)': '## 多个角色怎么管理？建角色档案',
}

print('\n--- batch2c block placement ---')
for k, h in HEADERS.items():
    idx = text.find(h)
    if idx == -1:
        print('%-28s NOT FOUND' % k)
    else:
        print('%-28s at %8d  -> owner: %s' % (k, idx, owner(idx)))
