# -*- coding: utf-8 -*-
"""P1 注入：给 38 篇零内链文章各加 5 条同主题内部 /blog/ 链接（EN+ZH 双语）。

策略：每篇正文末尾追加「Related reading / 延伸阅读」区块，锚文本用目标文标题关键词。
注入位置：content 的闭合反引号前（即 `,\n    contentZh:` 定界符之前）、contentZh 同理。
使用与 scripts/audit_ai_visibility.py 相同的定界正则，确保审计能正确计数。

链接格式严格无结尾斜杠：[/blog/<slug>]，保证命中审计正则。
"""
import os, re

ROOT = r"C:\Users\Administrator\Documents\lollipop"
SRC = os.path.join(ROOT, "src", "app", "data")
CONTENT_PATH = os.path.join(SRC, "blogContent.ts")
BLOG_PATH = os.path.join(SRC, "blog.ts")

# 38 篇零内链 slug（来自 audit_ai_visibility.py 的 "Articles with 0 internal links"）
TARGETS = [
    "ai-script-storyboard", "ai-video-quality", "ai-editing-tools", "ai-production-cost",
    "ai-rendering-pipeline", "ai-short-drama-complete-guide", "ai-copyright-compliance",
    "ai-tools-comparison", "what-is-ai-drama", "how-to-create-ai-short-drama",
    "future-of-ai-entertainment", "ai-vs-traditional-drama", "best-ai-storytelling-platforms",
    "ai-new-generation-creators", "what-is-micro-drama", "ai-video-storytelling",
    "ai-anyone-can-create", "complete-guide-ai-entertainment-platforms",
    "lollipop-drama-vs-runway-sora", "ai-drama-character-consistency", "fanvue-vs-lollipop-drama",
    "traditional-vs-ai-short-drama-production-cost", "prompting-cinematic-camera-movements-vertical",
    "web-novel-to-ai-short-drama-pipeline", "ai-audio-soundscapes-short-dramas",
    "ai-short-drama-monetization-copyright", "fixing-ai-video-artifacts",
    "lollipop-vs-reelshort-dramabox", "ai-influencer-platform", "creator-story-taiwan-solo-daily",
    "creator-story-topic-selection", "creator-story-script-licensing", "creator-story-student-graduation",
    "creator-story-warm-story-formula", "creator-story-side-hustle-income", "creator-story-ai-compliance",
    "creator-story-tool-pipeline-comparison", "creator-story-character-bible",
]

# 每篇的 5 条同主题内链目标（cluster-relevant，排除自身）
LINKS = {
    # ---- creator-story (9) ----
    "creator-story-taiwan-solo-daily": ["how-to-create-ai-short-drama", "ai-short-drama-complete-guide", "ai-new-generation-creators", "creator-story-topic-selection", "creator-story-cost-breakdown"],
    "creator-story-topic-selection": ["how-to-create-ai-short-drama", "ai-short-drama-complete-guide", "ai-new-generation-creators", "creator-story-taiwan-solo-daily", "creator-story-script-licensing"],
    "creator-story-script-licensing": ["ai-copyright-compliance", "ai-short-drama-complete-guide", "how-to-create-ai-short-drama", "creator-story-topic-selection", "creator-story-student-graduation"],
    "creator-story-student-graduation": ["how-to-create-ai-short-drama", "ai-short-drama-complete-guide", "script-to-screen-pipeline", "creator-story-taiwan-solo-daily", "creator-story-character-bible"],
    "creator-story-warm-story-formula": ["ai-video-storytelling", "ai-short-drama-complete-guide", "how-to-create-ai-short-drama", "creator-story-side-hustle-income", "creator-story-taiwan-solo-daily"],
    "creator-story-side-hustle-income": ["publish-and-monetize-vertical-drama", "ai-short-drama-monetization-copyright", "ai-new-generation-creators", "creator-story-warm-story-formula", "creator-story-cost-breakdown"],
    "creator-story-ai-compliance": ["ai-copyright-compliance", "ai-short-drama-monetization-copyright", "ai-short-drama-complete-guide", "creator-story-script-licensing", "creator-story-character-bible"],
    "creator-story-tool-pipeline-comparison": ["ai-tools-comparison", "lollipop-drama-vs-runway-sora", "ai-short-drama-complete-guide", "creator-story-character-bible", "creator-story-cost-breakdown"],
    "creator-story-character-bible": ["ai-drama-character-consistency", "character-consistency-workflow", "mastering-character-consistency-ai-video", "ai-short-drama-complete-guide", "creator-story-tool-pipeline-comparison"],
    # ---- industry comparisons (4) ----
    "lollipop-drama-vs-runway-sora": ["fanvue-vs-lollipop-drama", "lollipop-vs-reelshort-dramabox", "ai-influencer-platform", "what-is-ai-drama", "best-ai-storytelling-platforms"],
    "fanvue-vs-lollipop-drama": ["lollipop-drama-vs-runway-sora", "lollipop-vs-reelshort-dramabox", "ai-influencer-platform", "what-is-ai-drama", "best-ai-storytelling-platforms"],
    "lollipop-vs-reelshort-dramabox": ["lollipop-drama-vs-runway-sora", "fanvue-vs-lollipop-drama", "ai-influencer-platform", "best-ai-storytelling-platforms", "what-is-ai-drama"],
    "ai-influencer-platform": ["lollipop-vs-reelshort-dramabox", "lollipop-drama-vs-runway-sora", "fanvue-vs-lollipop-drama", "ai-new-generation-creators", "best-ai-storytelling-platforms"],
    # ---- guides / workflow (25) ----
    "ai-script-storyboard": ["how-to-create-ai-short-drama", "web-novel-to-ai-short-drama-pipeline", "ai-short-drama-complete-guide", "script-to-screen-pipeline", "ai-video-storytelling"],
    "ai-video-quality": ["fixing-ai-video-artifacts", "ai-editing-tools", "ai-rendering-pipeline", "prompting-cinematic-camera-movements-vertical", "ai-video-storytelling"],
    "ai-editing-tools": ["fixing-ai-video-artifacts", "ai-video-quality", "ai-audio-soundscapes-short-dramas", "script-to-screen-pipeline", "ai-short-drama-complete-guide"],
    "ai-production-cost": ["traditional-vs-ai-short-drama-production-cost", "ai-short-drama-complete-guide", "ai-drama-budget-under-1000", "script-to-screen-pipeline", "ai-tools-comparison"],
    "ai-rendering-pipeline": ["ai-video-quality", "fixing-ai-video-artifacts", "ai-editing-tools", "script-to-screen-pipeline", "ai-tools-comparison"],
    "ai-short-drama-complete-guide": ["how-to-create-ai-short-drama", "script-to-screen-pipeline", "ai-new-generation-creators", "what-is-ai-drama", "fixing-ai-video-artifacts"],
    "ai-copyright-compliance": ["ai-short-drama-monetization-copyright", "ai-drama-legal-checklist", "creator-story-ai-compliance", "ai-short-drama-complete-guide", "publish-and-monetize-vertical-drama"],
    "ai-tools-comparison": ["lollipop-drama-vs-runway-sora", "ai-rendering-pipeline", "ai-video-quality", "best-ai-storytelling-platforms", "ai-short-drama-complete-guide"],
    "what-is-ai-drama": ["how-to-create-ai-short-drama", "ai-new-generation-creators", "ai-vs-traditional-drama", "best-ai-storytelling-platforms", "ai-short-drama-complete-guide"],
    "how-to-create-ai-short-drama": ["ai-short-drama-complete-guide", "script-to-screen-pipeline", "web-novel-to-ai-short-drama-pipeline", "ai-script-storyboard", "what-is-ai-drama"],
    "future-of-ai-entertainment": ["what-is-ai-drama", "ai-new-generation-creators", "ai-vs-traditional-drama", "best-ai-storytelling-platforms", "ai-short-drama-complete-guide"],
    "ai-vs-traditional-drama": ["traditional-vs-ai-short-drama-production-cost", "what-is-ai-drama", "ai-production-cost", "ai-short-drama-complete-guide", "ai-new-generation-creators"],
    "best-ai-storytelling-platforms": ["what-is-ai-drama", "lollipop-drama-vs-runway-sora", "ai-tools-comparison", "ai-new-generation-creators", "how-to-create-ai-short-drama"],
    "ai-new-generation-creators": ["what-is-ai-drama", "how-to-create-ai-short-drama", "ai-short-drama-complete-guide", "creator-story-taiwan-solo-daily", "ai-anyone-can-create"],
    "what-is-micro-drama": ["ai-short-drama-complete-guide", "how-to-create-ai-short-drama", "web-novel-to-ai-short-drama-pipeline", "what-is-ai-drama", "ai-video-storytelling"],
    "ai-video-storytelling": ["ai-short-drama-complete-guide", "how-to-create-ai-short-drama", "ai-script-storyboard", "what-is-micro-drama", "ai-video-quality"],
    "ai-anyone-can-create": ["how-to-create-ai-short-drama", "ai-short-drama-complete-guide", "ai-new-generation-creators", "what-is-ai-drama", "creator-story-taiwan-solo-daily"],
    "complete-guide-ai-entertainment-platforms": ["ai-short-drama-complete-guide", "how-to-create-ai-short-drama", "what-is-ai-drama", "ai-new-generation-creators", "best-ai-storytelling-platforms"],
    "ai-drama-character-consistency": ["character-consistency-workflow", "mastering-character-consistency-ai-video", "creator-story-character-bible", "ai-short-drama-complete-guide", "script-to-screen-pipeline"],
    "traditional-vs-ai-short-drama-production-cost": ["ai-production-cost", "ai-vs-traditional-drama", "ai-short-drama-complete-guide", "ai-tools-comparison", "script-to-screen-pipeline"],
    "prompting-cinematic-camera-movements-vertical": ["ai-video-quality", "ai-rendering-pipeline", "fixing-ai-video-artifacts", "ai-video-storytelling", "script-to-screen-pipeline"],
    "web-novel-to-ai-short-drama-pipeline": ["how-to-create-ai-short-drama", "ai-short-drama-complete-guide", "ai-script-storyboard", "ai-video-storytelling", "script-to-screen-pipeline"],
    "ai-audio-soundscapes-short-dramas": ["ai-editing-tools", "fixing-ai-video-artifacts", "ai-video-quality", "script-to-screen-pipeline", "ai-short-drama-complete-guide"],
    "ai-short-drama-monetization-copyright": ["ai-copyright-compliance", "publish-and-monetize-vertical-drama", "ai-drama-legal-checklist", "ai-new-generation-creators", "creator-story-side-hustle-income"],
    "fixing-ai-video-artifacts": ["ai-video-quality", "ai-editing-tools", "ai-rendering-pipeline", "ai-audio-soundscapes-short-dramas", "script-to-screen-pipeline"],
}

def clean_anchor(s):
    return s.replace("[", "").replace("]", "").replace("`", "").strip()

def main():
    blog_ts = open(BLOG_PATH, encoding="utf-8").read()
    # parse title / titleZh per slug
    titles, titles_zh = {}, {}
    for m in re.finditer(r'\{\s*slug:\s*"([a-z0-9-]+)"(.*?)\n\s*\},', blog_ts, re.S):
        slug = m.group(1); blk = m.group(2)
        tm = re.search(r'title:\s*"((?:[^"\\]|\\.)*)"', blk)
        tzm = re.search(r'titleZh:\s*"((?:[^"\\]|\\.)*)"', blk)
        titles[slug] = tm.group(1) if tm else slug
        titles_zh[slug] = tzm.group(1) if tzm else (tm.group(1) if tm else slug)

    content_ts = open(CONTENT_PATH, encoding="utf-8").read()

    # sanity: every target present in blogContent, every link target valid
    missing = [s for s in TARGETS if f'  "{s}": {{' not in content_ts]
    if missing:
        raise SystemExit("target slug not in blogContent: " + str(missing))
    bad_links = [t for t in set(x for v in LINKS.values() for x in v) if t not in titles]
    if bad_links:
        raise SystemExit("link target has no title: " + str(bad_links))

    insertions = []  # (position, text) in ORIGINAL content_ts
    for slug in TARGETS:
        key = f'  "{slug}": {{'
        base = content_ts.index(key)
        ci = content_ts.index("content: `", base)
        m1 = re.search(r'`,\s*\n\s*contentZh:\s*`', content_ts[ci:])
        if not m1:
            raise SystemExit(f"content delimiter not found for {slug}")
        cclose = ci + m1.start()  # position of the backtick before contentZh
        zi = content_ts.index("contentZh: `", ci)
        m2 = re.search(r'`,\s*\n\s*\},', content_ts[zi:])
        if not m2:
            raise SystemExit(f"contentZh delimiter not found for {slug}")
        zhclose = zi + m2.start()

        targets = [t for t in LINKS[slug] if t != slug]
        if len(targets) < 5:
            raise SystemExit(f"{slug} has <5 distinct link targets")
        en_items = "\n".join(f"- [{clean_anchor(titles[t])}](/blog/{t})" for t in targets)
        zh_items = "\n".join(f"- [{clean_anchor(titles_zh[t])}](/blog/{t})" for t in targets)
        en_block = "\n\n---\n\n## Related reading\n\n" + en_items + "\n"
        zh_block = "\n\n---\n\n## 延伸阅读\n\n" + zh_items + "\n"
        insertions.append((cclose, en_block))
        insertions.append((zhclose, zh_block))

    # apply right-to-left so earlier positions stay valid
    for pos, text in sorted(insertions, reverse=True):
        content_ts = content_ts[:pos] + text + content_ts[pos:]

    with open(CONTENT_PATH, "w", encoding="utf-8") as f:
        f.write(content_ts)

    print("targets processed:", len(TARGETS))
    print("links added per article:", 5)
    print("total internal links added (EN+ZH):", len(TARGETS) * 5 * 2)
    # quick self-check: count backtick balance roughly
    print("content_ts length:", len(content_ts))

if __name__ == "__main__":
    main()
