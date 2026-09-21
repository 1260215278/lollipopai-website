#!/usr/bin/env python3
import re, json

P = r"C:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts"
T = open(P, encoding="utf-8").read()
TARGET = [
    "lollipop-vs-reelshort-dramabox",
    "ai-influencer-platform",
    "creator-story-taiwan-solo-daily",
    "creator-story-topic-selection",
    "creator-story-script-licensing",
    "creator-story-cost-breakdown",
    "creator-story-student-graduation",
    "creator-story-warm-story-formula",
    "creator-story-side-hustle-income",
    "creator-story-ai-compliance",
    "creator-story-tool-pipeline-comparison",
    "creator-story-character-bible",
]
data = {}
for m in re.finditer(r'\{\s*slug:\s*"([a-z0-9-]+)"(.*?)\n\s*\},', T, re.S):
    slug = m.group(1)
    if slug not in TARGET:
        continue
    blk = m.group(2)

    def g(field):
        mm = re.search(field + r':\s*"((?:[^"\\]|\\.)*)"', blk)
        return mm.group(1) if mm else ""

    kt = re.search(r"keyTakeaways:\s*\[(.*?)\]", blk, re.S)
    ktz = re.search(r"keyTakeawaysZh:\s*\[(.*?)\]", blk, re.S)
    data[slug] = {
        "title": g("title"),
        "titleZh": g("titleZh"),
        "excerpt": g("excerpt"),
        "excerptZh": g("excerptZh"),
        "kt": kt.group(1) if kt else "",
        "ktz": ktz.group(1) if ktz else "",
    }
json.dump(data, open(r"C:\Users\Administrator\Documents\lollipop\tmp\faq_seed.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("extracted", len(data), "slugs")
