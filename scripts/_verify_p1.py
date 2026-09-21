# -*- coding: utf-8 -*-
import re
p = r"C:/Users/Administrator/Documents/lollipop/src/app/data/blogContent.ts"
s = open(p, encoding="utf-8").read()
print("Related reading (EN H2) count:", s.count("## Related reading"))
print("延伸阅读 (ZH H2) count:", s.count("## 延伸阅读"))
print("total backticks:", s.count("`"), "(expect 208 = 4 x 52 articles, unchanged)")
TARGETS = [
    "ai-script-storyboard","ai-video-quality","ai-editing-tools","ai-production-cost",
    "ai-rendering-pipeline","ai-short-drama-complete-guide","ai-copyright-compliance",
    "ai-tools-comparison","what-is-ai-drama","how-to-create-ai-short-drama",
    "future-of-ai-entertainment","ai-vs-traditional-drama","best-ai-storytelling-platforms",
    "ai-new-generation-creators","what-is-micro-drama","ai-video-storytelling",
    "ai-anyone-can-create","complete-guide-ai-entertainment-platforms",
    "lollipop-drama-vs-runway-sora","ai-drama-character-consistency","fanvue-vs-lollipop-drama",
    "traditional-vs-ai-short-drama-production-cost","prompting-cinematic-camera-movements-vertical",
    "web-novel-to-ai-short-drama-pipeline","ai-audio-soundscapes-short-dramas",
    "ai-short-drama-monetization-copyright","fixing-ai-video-artifacts",
    "lollipop-vs-reelshort-dramabox","ai-influencer-platform","creator-story-taiwan-solo-daily",
    "creator-story-topic-selection","creator-story-script-licensing","creator-story-student-graduation",
    "creator-story-warm-story-formula","creator-story-side-hustle-income","creator-story-ai-compliance",
    "creator-story-tool-pipeline-comparison","creator-story-character-bible",
]
for slug in TARGETS[:6]:
    key = '  "%s": {' % slug
    i = s.index(key)
    rest = s[i:]
    m = re.search(r'`,\s*\n\s*contentZh:\s*`', rest)
    en = rest[:m.start()]
    n = len(re.findall(r'\]\(/blog/[a-z0-9-]+\)', en))
    print(slug, "EN /blog/ links =", n)
