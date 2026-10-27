"""
Extract FAQ from Article #6 (### Q1: format) and insert into blogFaq.ts
"""
import re

md_path = r'c:\Users\Administrator\Documents\lollipop\drafts\ai-short-drama-studio-economics-break-even-profit-2026-FINAL.md'
faq_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blogFaq.ts'

with open(md_path, 'r', encoding='utf-8') as f:
    md = f.read()

with open(faq_path, 'r', encoding='utf-8') as f:
    faq_ts = f.read()

SLUG = 'ai-short-drama-studio-economics-break-even-profit'

# Check if already exists in blogFaq.ts
if SLUG in faq_ts:
    print(f"WARN: {SLUG} already in blogFaq.ts, skip")
    exit(0)

# Find FAQ section and parse ### Q1: ... **A:** ...
faq_match = re.search(
    r'## Frequently Asked Questions.*?\n(.*?)(?=\n---\n\n## Data Sources)',
    md, re.DOTALL
)

if not faq_match:
    print("ERROR: FAQ section not found")
    exit(1)

faq_text = faq_match.group(1).strip()
print(f"FAQ text ({len(faq_text)} chars):\n{faq_text[:300]}...\n")

# Pattern: ### Q1: question\n\n**Answer:** answer text
qa_pat = re.compile(
    r'### Q\d+: ([^\n]+)\n\n\*\*([^\n]+):\*\*\s*(.+)',
    re.DOTALL
)

# Or simpler: ### Q1: question\n\n(answer text until next ### or ---)
simple_pat = re.compile(
    r'### Q\d+: ([^\n]+)\n\n(.+?)(?=\n### Q\d+|\n---)',
    re.DOTALL
)

items = list(simple_pat.finditer(faq_text))
print(f"Found {len(items)} Q&A pairs")

if not items:
    print("WARN: no items matched, abort")
    exit(1)

ts_items = []
for m in items:
    q = m.group(1).strip()
    a = m.group(2).strip().replace('"', '\\"').replace('\n', ' ')
    q_clean = q.replace('"', '\\"')
    print(f"  Q: {q[:80]}...")
    print(f"  A: {a[:80]}...")
    ts_items.append(f'''    {{
      question: "{q_clean}",
      answer: "{a}",
      questionEn: "{q_clean}",
      answerEn: "{a}",
    }},''')

# Insert
faq_insert_pos = faq_ts.rfind('};')
faq_entry = f'  "{SLUG}": [\n' + '\n'.join(ts_items) + '\n  ],\n'
faq_ts_new = faq_ts[:faq_insert_pos] + '\n' + faq_entry + '\n};\n'

with open(faq_path, 'w', encoding='utf-8') as f:
    f.write(faq_ts_new)

print(f"\n✅ Inserted FAQ ({len(items)} items) into blogFaq.ts")
