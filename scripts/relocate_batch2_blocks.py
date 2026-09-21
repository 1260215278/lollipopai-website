# -*- coding: utf-8 -*-
"""
Relocate P2 batch-2 injected blocks to their CORRECT articles.

Bug being fixed: batch2c pre-computed all slug marker positions once, then
inserted text (which shifts every later marker). Result: the last 4 blocks
landed in the previous article, and character-bible got nothing.

This script:
  1. extracts every injected block (A/B/C) by its unique first H2 header
  2. removes them all from wherever they currently are
  3. re-inserts them into the owning slug, recomputing positions FRESH
     after every single insertion, with a bounded [slug..next slug) anchor
     search so a half-width FAQ can never be skipped.
"""
import io

PATH = r'C:/Users/Administrator/Documents/lollipop/src/app/data/blogContent.ts'

ORDER = ['creator-story-cost-breakdown',
         'creator-story-student-graduation',
         'creator-story-warm-story-formula',
         'creator-story-side-hustle-income',
         'creator-story-ai-compliance',
         'creator-story-tool-pipeline-comparison',
         'creator-story-character-bible']

# ordered list of (block label, unique first H2 header) per slug
BLOCKS = {
 'creator-story-cost-breakdown': [
    ('A', '## 30 集做下来，真实总账到底是多少？'),
    ('B', '## 免费层能不能完整跑完 30 集？'),
    ('C', '## 单集成本到底怎么逐项记账？'),
 ],
 'creator-story-student-graduation': [
    ('A', '## 毕业作品为什么要从横屏改成竖屏？'),
    ('B', '## 学生党预算怎么压到最低？'),
    ('C', '## 竖屏分镜到底怎么画才对？'),
 ],
 'creator-story-warm-story-formula': [
    ('A', '## 共鸣公式到底是什么？'),
    ('B', '## 完播率 42%-58%，到底是怎么做到的？'),
    ('C', '## 前 3 秒怎么写，才能把人留住？'),
 ],
 'creator-story-side-hustle-income': [
    ('A', '## 全职妈妈做短剧副业，现实吗？'),
    ('B', '## 避坑清单 6 条，都是真金白银换来的'),
    ('C', '## 第一个月具体做什么？30 天路径'),
 ],
 'creator-story-ai-compliance': [
    ('A', '## AI 生成短剧合规，到底要管几件事？'),
    ('B', '## 中国和海外要求，差在哪？'),
    ('C', '## 平台条款会变，怎么持续跟踪？'),
 ],
 'creator-story-tool-pipeline-comparison': [
    ('A', '## 可灵、海螺、Lollipop，各自强在哪？'),
    ('B', '## 一体化到底省在哪里？'),
    ('C', '## 从拼接模式切到一体化，迁移成本有多高？'),
 ],
 'creator-story-character-bible': [
    ('A', '## 角色圣经到底要几张参考图？'),
    ('B', '## 跨集崩脸，怎么用 QC 拦住？'),
    ('C', '## 多个角色怎么管理？建角色档案'),
 ],
}

FAQ_VARIANTS = ['## 常见问题（FAQ）', '## 常见问题(FAQ)']

with io.open(PATH, encoding='utf-8') as f:
    text = f.read()

# ---------- 1. extract ----------
extracted = {}   # slug -> list of (label, block_text)
spans = []       # (start, end) to remove

for slug in ORDER:
    items = BLOCKS[slug]
    found = []
    for label, header in items:
        mk = '\n---\n\n' + header
        s = text.find(mk)
        if s == -1:
            print('  WARN not found:', slug, label, header)
            continue
        # end = next block separator or next FAQ, whichever comes first
        nxt_sep = text.find('\n---\n\n## ', s + 10)
        cands = [c for c in
                 [text.find('\n' + v, s + 10) for v in FAQ_VARIANTS] + [nxt_sep]
                 if c != -1]
        if not cands:
            print('  WARN no end boundary:', slug, label)
            continue
        e = min(cands)
        block = text[s:e]
        found.append((label, block))
        spans.append((s, e))
        print('  extracted %-40s %s len=%d' % (slug, label, len(block)))
    extracted[slug] = found

# ---------- 2. remove (backwards so indices stay valid) ----------
for s, e in sorted(spans, reverse=True):
    text = text[:s] + text[e:]
print('removed %d blocks' % len(spans))

# ---------- 3. re-insert with FRESH positions ----------
for slug in ORDER:
    # fresh slug position
    idx = text.find('"%s": {' % slug)
    if idx == -1:
        print('ERROR slug missing', slug); continue
    # fresh next-slug boundary: nearest slug marker (of any of the 10 stories) after idx
    end = len(text)
    for other in ORDER:
        p = text.find('"%s": {' % other, idx + 1)
        if p != -1 and p < end:
            end = p
    aidx = -1; anchor = None
    for v in FAQ_VARIANTS + ['## 来源与方法论']:
        j = text.find(v, idx, end)
        if j != -1:
            aidx, anchor = j, v
            break
    if aidx == -1:
        print('ERROR no anchor for', slug); continue
    insert = ''
    for label, block in extracted[slug]:
        insert += block + '\n'
    text = text[:aidx] + insert + text[aidx:]
    print('  INSERTED %-40s anchor=%-22s blocks=%d chars=%d'
          % (slug, anchor, len(extracted[slug]), len(insert)))

with io.open(PATH, 'w', encoding='utf-8') as f:
    f.write(text)
print('WRITE DONE')
