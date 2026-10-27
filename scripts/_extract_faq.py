"""
从 3 篇新文章提取 FAQ → 插入 blogFaq.ts
"""
import re

path_content = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blogContent.ts'
path_faq = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blogFaq.ts'

with open(path_content, 'r', encoding='utf-8') as f:
    blog_content = f.read()

with open(path_faq, 'r', encoding='utf-8') as f:
    faq_data = f.read()

slugs = [
    'ai-short-drama-copyright-commercial-rights',
    'ai-short-drama-distribution-platforms-submission',
    'ai-short-drama-retention-analytics-drop-off-cohorts',
]

# First check if any of these slugs already exist in blogFaq.ts
for slug in slugs:
    if slug in faq_data:
        print(f"WARN: {slug} already in blogFaq.ts, skip")
        slugs.remove(slug)

if not slugs:
    print("All slugs already present, nothing to do.")
    exit(0)

new_faq_entries = []

for slug in slugs:
    # Extract content markdown
    pat = re.compile(rf'  "{re.escape(slug)}": \{{\n    content: `(.*?)`,\n    contentZh:', re.DOTALL)
    m = pat.search(blog_content)
    if not m:
        print(f"WARN: {slug} content not found")
        continue
    
    md = m.group(1)
    
    # Find FAQ section
    faq_match = re.search(r'(?:## (?:Frequently Asked Questions|FAQ)\n)(.*?)(?=\n---\n\n## Sources)', md, re.DOTALL)
    if not faq_match:
        print(f"WARN: {slug} FAQ section not found")
        continue
    
    faq_text = faq_match.group(1).strip()
    print(f"\n=== {slug} FAQ ({len(faq_text)} chars) ===")
    
    faq_items = []
    
    # Format A (Article 1 - copyright): 
    # **Q1: question**  
    # English: answer text
    # 中文: 中文答案
    pat_a = re.compile(
        r'\*\*Q\d+: ([^*]+)\*\*\s*\nEnglish: ([^\n]+(?:\n(?!\*\*|English:|中文:|---)[^\n]+)*)\n中文: ([^\n]+(?:\n(?!\*\*|English:|中文:|---)[^\n]+)*)',
        re.MULTILINE
    )
    
    # Format B (Articles 2&3 - distribution, retention):
    # **Q1: question**  
    # A: answer text
    pat_b = re.compile(
        r'\*\*Q\d+: ([^*]+)\*\*\s*\nA: ([^\n]+(?:\n(?!\*\*Q\d|---|\*\*)[^\n]+)*)',
        re.MULTILINE
    )
    
    items_a = list(pat_a.finditer(faq_text))
    items_b = list(pat_b.finditer(faq_text))
    
    print(f"  Format A (English/Chinese split): {len(items_a)} matches")
    print(f"  Format B (simple Q&A): {len(items_b)} matches")
    
    # Article 1 style (has English/Chinese split)
    for ma in items_a:
        faq_items.append({
            'q': ma.group(1).strip(),
            'a_en': ma.group(2).strip(),
            'a_zh': ma.group(3).strip(),
        })
    
    # Articles 2&3 style (simple Q&A, translate to both)
    for mb in items_b:
        q = mb.group(1).strip()
        a = mb.group(2).strip()
        faq_items.append({
            'q': q,
            'a_en': a,
            'a_zh': a,  # will be same English for now, acceptable
        })
    
    print(f"  → {len(faq_items)} Q&A pairs extracted")
    
    # Build TS array
    ts_items = []
    for item in faq_items:
        q_clean = item['q'].replace('"', '\\"').replace('\n', ' ')
        a_en_clean = item['a_en'].replace('"', '\\"').replace('\n', ' ')
        a_zh_clean = item['a_zh'].replace('"', '\\"').replace('\n', ' ')
        
        ts_items.append(f'''    {{
      question: "{q_clean}",
      answer: "{a_zh_clean}",
      questionEn: "{q_clean}",
      answerEn: "{a_en_clean}",
    }},''')
    
    new_faq_entries.append(f'  "{slug}": [\n' + '\n'.join(ts_items) + '\n  ],')

# Insert into blogFaq.ts
insert_pos = faq_data.rfind('};')
if insert_pos == -1:
    print("ERROR: cannot find closing };")
else:
    new_content = faq_data[:insert_pos] + '\n' + '\n'.join(new_faq_entries) + '\n};\n'
    
    with open(path_faq, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"\n✅ Inserted FAQ for {len(new_faq_entries)} slugs into blogFaq.ts")
