"""
Publish Article #6 (Studio Economics) to blog.ts + blogContent.ts + blogFaq.ts
"""
import re

# ===== Read inputs =====
md_path = r'c:\Users\Administrator\Documents\lollipop\drafts\ai-short-drama-studio-economics-break-even-profit-2026-FINAL.md'
blog_ts_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts'
content_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blogContent.ts'
faq_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blogFaq.ts'

with open(md_path, 'r', encoding='utf-8') as f:
    md = f.read()

with open(blog_ts_path, 'r', encoding='utf-8') as f:
    blog_ts = f.read()

with open(content_path, 'r', encoding='utf-8') as f:
    content_ts = f.read()

with open(faq_path, 'r', encoding='utf-8') as f:
    faq_ts = f.read()

SLUG = 'ai-short-drama-studio-economics-break-even-profit'

# Check if already exists
if SLUG in blog_ts:
    print(f"ERROR: {SLUG} already in blog.ts")
    exit(1)

# ===== Extract fields from markdown =====
# Title
title_m = re.search(r'^# (.+)$', md, re.MULTILINE)
title = title_m.group(1).strip() if title_m else "AI Short Drama Studio Economics"

# Direct Answer (from blockquote)
da_m = re.search(r'> \*\*Direct Answer:\*\* (.+?)(?:\n|$)', md)
da_text = da_m.group(1).strip() if da_m else ""

# Excerpt (first 150 chars of intro or Direct Answer)
excerpt = da_text[:150] + ("..." if len(da_text) > 150 else "")

# Clean up markdown for template literal
def escape_tl(text):
    """Escape for JS template literal"""
    text = text.replace('\\', '\\\\')
    text = text.replace('`', '\\`')
    text = text.replace('${', '\\${')
    return text

md_escaped = escape_tl(md)

# ===== 1. Insert into blog.ts =====
# Find the closing of blogMeta array
meta_close_marker = '];/** 通过 slug 查找'
meta_close = blog_ts.find(meta_close_marker)
if meta_close == -1:
    # Fallback: just find }; before export function
    meta_close = blog_ts.find('export function getBlogMetaBySlug')
    # Now find }; before this position
    search_back = blog_ts.rfind('};', 0, meta_close)
    # But that might be wrong - let's try the pattern before export function
    # The actual pattern: "},\n];/**"
    last_obj_end = blog_ts.rfind('  },\n', 0, meta_close)
    if last_obj_end == -1:
        print("ERROR: cannot find last object end in blog.ts")
        exit(1)
else:
    # Find "  },\n" right before this marker
    search_region = blog_ts[:meta_close]
    last_obj_end = search_region.rfind('  },\n')
    if last_obj_end == -1:
        print("ERROR: cannot find last object end")
        exit(1)

# Build new metadata object
new_meta = f''',
  {{
    slug: "{SLUG}",
    coverImage: "/blog-images/ai-production-cost-new.webp",
    title: "{title}",
    titleZh: "AI 短剧制作商业模型：收入、成本、盈亏与单集利润（2026）",
    excerpt: "{excerpt}",
    excerptZh: "2026 年 AI 短剧系列成本 $500–$8,000。在 Lollipop Drama 80% 分成下，$2,000 的十集系列盈亏平衡点约 6,250 位付费观众。ReelShort 15% 分成下需要 5 倍以上观众。",
    seoTitle: "AI Short Drama Production Costs & Profitability (2026) | Lollipop Drama",
    seoDescription: "How much does an AI short drama series cost? Real 2026 data on tool pricing, platform revenue shares, break-even calculators, and profit benchmarks. Lollipop Drama's 80% vs ReelShort's 15% — numbers don't lie.",
    category: "creator",
    categoryLabel: "Creator Economics",
    author: "Marcus Liu",
    authorRole: "Creator Economics Analyst",
    authorBio: "Marcus Liu analyzes creator revenue and production economics for AI short drama. His reports on break-even frameworks and platform revenue shares are cited by Reelytics, Duration.live, and independent creator communities. Previously a production cost analyst for traditional short-form studios.",
    publishDate: "2026-10-27",
    updateDate: "2026-10-27",
    keyTakeaways: [
      "AI short drama production ranges $500 (solo) to $8,000 (studio) per ten-episode series in 2026",
      "Platform revenue share is the single biggest profitability factor: Lollipop Drama 80% vs ReelShort 10–20% means 5x fewer viewers to break even",
      "Labor costs (human direction + editing) are 60–75% of total budget, not AI tool subscriptions",
      "Break-even formula: viewers = Fixed Costs / ((RPM × Conversion × Share) - Variable Cost)",
    ],
    keyTakeawaysZh: [
      "2026 年 AI 短剧十集系列成本从 $500（独立创作者）到 $8,000（工作室）不等",
      "平台分成是盈利的最大变量：Lollipop Drama 80% vs ReelShort 10–20% 意味着盈亏平衡点差 5 倍观众",
      "人力成本（人类指导 + 剪辑）占总预算 60–75%，不是 AI 工具订阅费",
      "盈亏平衡公式：观众数 = 固定成本 / ((RPM × 转化率 × 分成) - 单位观众变动成本)",
    ],
  }}'''

blog_ts_new = blog_ts[:last_obj_end] + new_meta + blog_ts[last_obj_end:]

with open(blog_ts_path, 'w', encoding='utf-8') as f:
    f.write(blog_ts_new)

print("✅ Inserted metadata into blog.ts")

# ===== 2. Insert into blogContent.ts =====
# Find the closing of blogContent Record
content_close_marker = '};/** 合并元数据'
content_close = content_ts.find(content_close_marker)
if content_close == -1:
    content_close = content_ts.rfind('};')

new_content_entry = f'''  "{SLUG}": {{
    content: `{md_escaped}`,
    contentZh: `{md_escaped}`,
  }},
'''

content_ts_new = content_ts[:content_close] + new_content_entry + content_ts[content_close:]

with open(content_path, 'w', encoding='utf-8') as f:
    f.write(content_ts_new)

print(f"✅ Inserted content + contentZh (fallback) into blogContent.ts ({len(md_escaped)} chars)")

# ===== 3. Extract FAQ into blogFaq.ts =====
# Parse FAQ section from markdown
faq_match = re.search(
    r'(?:## Frequently Asked Questions.*?\n|## FAQ\n)(.*?)(?=\n---\n\n## |\n---\n\n\*\*|\n---\n\n$)',
    md, re.DOTALL
)

if faq_match:
    faq_text = faq_match.group(1).strip()
    print(f"FAQ section found ({len(faq_text)} chars)")
    
    # Try simple Q&A format
    pat_b = re.compile(
        r'\*\*Q\d+: ([^*]+)\*\*\s*\nA: ([^\n]+(?:\n(?!\*\*Q\d|---|\*\*)[^\n]+)*)',
        re.MULTILINE
    )
    
    faq_items = list(pat_b.finditer(faq_text))
    print(f"  Found {len(faq_items)} Q&A pairs")
    
    if faq_items:
        ts_items = []
        for m_faq in faq_items:
            q = m_faq.group(1).strip()
            a = m_faq.group(2).strip().replace('"', '\\"').replace('\n', ' ')
            q_clean = q.replace('"', '\\"')
            ts_items.append(f'''    {{
      question: "{q_clean}",
      answer: "{a}",
      questionEn: "{q_clean}",
      answerEn: "{a}",
    }},''')
        
        faq_insert_pos = faq_ts.rfind('};')
        faq_entry = f'  "{SLUG}": [\n' + '\n'.join(ts_items) + '\n  ],\n'
        faq_ts_new = faq_ts[:faq_insert_pos] + '\n' + faq_entry + '\n};\n'
        
        with open(faq_path, 'w', encoding='utf-8') as f:
            f.write(faq_ts_new)
        
        print(f"✅ Inserted FAQ ({len(faq_items)} items) into blogFaq.ts")
    else:
        print("WARN: no Q&A pairs matched")
else:
    print("WARN: FAQ section not found in markdown")

print(f"\n🎉 All done for {SLUG}!")
