# -*- coding: utf-8 -*-
import io

PATH = r'C:/Users/Administrator/Documents/lollipop/src/app/data/blogContent.ts'

START_MK = "\n---\n\n## 全职妈妈做短剧副业，现实吗？"
AI_MK = "\n---\n\n## AI 生成短剧合规，到底要管几件事？"
S_SLUG = '"creator-story-side-hustle-income": {'
AI_SLUG = '"creator-story-ai-compliance": {'
HW_FAQ = "## 常见问题(FAQ)"

with io.open(PATH, encoding='utf-8') as f:
    text = f.read()

start = text.find(START_MK)
if start == -1:
    print('ERROR: side-hustle block start not found'); raise SystemExit(1)

cand1 = text.find(AI_MK, start + 10)          # ai-compliance own injected block
cand2 = text.find("## 常见问题（FAQ）", start + 10)  # ai-compliance FAQ
cands = [c for c in (cand1, cand2) if c != -1]
if not cands:
    print('ERROR: no end boundary found'); raise SystemExit(1)
end = min(cands)

block = text[start:end]
print('extracted block chars =', len(block))

# sanity assertions
assert '婉姐' in block, 'block missing 婉姐'
assert '避坑清单 6 条' in block, 'block missing 避坑清单'
assert '林砚' not in block, 'block wrongly contains ai-compliance content (林砚)'
assert 'AI 生成短剧合规' not in block, 'block wrongly contains ai-compliance content'
print('sanity assertions OK')

# 1) remove from ai-compliance
text = text[:start] + text[end:]
print('removed from ai-compliance')

# 2) insert into side-hustle-income before its half-width FAQ
s_idx = text.find(S_SLUG)
if s_idx == -1:
    print('ERROR: side-hustle slug not found'); raise SystemExit(1)
ai_idx = text.find(AI_SLUG, s_idx)
if ai_idx == -1:
    print('ERROR: ai slug not found'); raise SystemExit(1)
hw = text.find(HW_FAQ, s_idx, ai_idx)
if hw == -1:
    print('ERROR: half-width FAQ not found inside side-hustle range'); raise SystemExit(1)
print('inserting at', hw, 'inside range', s_idx, ai_idx)

text = text[:hw] + block + '\n' + text[hw:]

with io.open(PATH, 'w', encoding='utf-8') as f:
    f.write(text)
print('WRITE DONE')
