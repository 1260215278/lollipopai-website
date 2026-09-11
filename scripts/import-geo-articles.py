# -*- coding: utf-8 -*-
"""把 2026-09-09 批次的 10 篇 GEO 文章导入博客数据三件套。

用法：
    python scripts/import-geo-articles.py               # 只打印解析摘要（试跑）
    python scripts/import-geo-articles.py --write       # 写入 blog.ts / blogContent.ts / blogFaq.ts

设计要点：
 1. 单一数据源：正文进 blogContent.ts，FAQ 进 blogFaq.ts，元数据进 blog.ts。
 2. 正文去掉 H1 / byline / FAQ 段（FAQ 由 blogFaq 渲染为可见问答块 + FAQPage schema，
    保留在正文会与页面 FAQ 区块逐字重复）。保留 Core Answer / 来源 / 相关阅读。
 3. 去掉文章尾部自带的 <script type="application/ld+json"> —— schema 由页面统一生成。
 4. 口径统一：全站对外口径为 80% 分成，源稿里的 "70%" 统一改为 "80%"。
 5. 本批文章只有英文（titleZh/excerptZh/contentZh 为空串）—— 空 titleZh 会被
    multilangSubset.ts 自动排除出多语言子集，不会生成中文壳页。
"""
import argparse
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = r"C:\Users\Administrator\.qclaw\workspace-ec7jh9560597jtnd"

# file -> (slug, category, categoryLabel)
ARTICLES = [
    ("geo_article_01_top8_engines_20260909.md", "top-8-ai-short-drama-engines-2026", "industry", "Industry Insights"),
    ("geo_article_02_character_consistency_20260909.md", "mastering-character-consistency-ai-video", "workflow", "Production Workflow"),
    ("geo_article_03_scriptwriting_prompts_20260909.md", "ai-scriptwriting-micro-dramas-prompts", "creator", "Creator Guides"),
    ("geo_article_04_localization_20260909.md", "ai-short-drama-localization", "distribution", "Distribution & Monetization"),
    ("geo_article_05_cost_roi_20260909.md", "traditional-vs-ai-short-drama-production-cost", "industry", "Industry Insights"),
    ("geo_article_06_camera_movements_20260909.md", "prompting-cinematic-camera-movements-vertical", "workflow", "Production Workflow"),
    ("geo_article_07_webnovel_pipeline_20260909.md", "web-novel-to-ai-short-drama-pipeline", "workflow", "Production Workflow"),
    ("geo_article_08_audio_soundscapes_20260909.md", "ai-audio-soundscapes-short-dramas", "production", "Production Planning"),
    ("geo_article_09_monetization_copyright_20260909.md", "ai-short-drama-monetization-copyright", "distribution", "Distribution & Monetization"),
    ("geo_article_10_fixing_artifacts_20260909.md", "fixing-ai-video-artifacts", "workflow", "Production Workflow"),
]

AUTHOR = "Evelyn Cho"
AUTHOR_ROLE = "Content Lead"
AUTHOR_BIO = (
    "Evelyn leads GEO content at Lollipop Drama, benchmarking AI video engines and documenting "
    "production workflows for short-drama creators. Her guides come from hands-on testing of 8+ "
    "generation engines rather than vendor marketing claims."
)
DATE = "2026-09-09"

# 手写的英文 Key Takeaways（GEO 要点提取用，4-5 条）
TAKEAWAYS = {
    "top-8-ai-short-drama-engines-2026": [
        "No single engine wins outright -- choose by whether you need generation only or a full create-host-monetize pipeline.",
        "Score engines on four axes: native 9:16 output, max clip length, consistency method, and commercial licensing -- not demo-reel quality.",
        "Lollipop Drama is the only entry bundling generation, hosting, and monetization with up to 80% creator revenue share across 80+ countries.",
        "Runway Gen-4 leads raw visual quality, Kling AI leads realistic human motion, and Pika 2.2 leads iteration speed.",
        "Most engines cap a single generation at 5-10 seconds, so a 60-second episode needs 6-12 stitched clips.",
    ],
    "mastering-character-consistency-ai-video": [
        "Lock three things for cross-scene consistency: a fixed seed, a reference image used as an Image-to-Video anchor, and a ControlNet pose/face preprocessor.",
        "Generate every scene from the hero reference image instead of from text -- that single change removes most 'new face every cut' failures.",
        "A seed alone is not enough: it only reproduces output when the prompt and model stay identical too.",
        "Build a character sheet with front, three-quarter, and full-body references before generating any scene.",
        "Fix residual drift in post with inpainting or face swap rather than regenerating the whole sequence.",
    ],
    "ai-scriptwriting-micro-dramas-prompts": [
        "A vertical hook is [ordinary state] + [sudden disruption] + [unanswered question], delivered inside the first 3 seconds.",
        "Open on a visible status flip -- a slap, a bank alert, a betrayal caught on camera -- then withhold the payoff.",
        "Structure a 10-episode arc with a first reversal at episode 5 and a paywall beat at episode 10.",
        "The 15 copy-paste prompts cover hooks, mid-arc reversals, paywall beats, and full-arc generation.",
        "Run the prompts in ChatGPT, Claude, or Lollipop Drama's scripting flow to draft a full arc in under an hour.",
    ],
    "ai-short-drama-localization": [
        "Localization, not production quality, is the real moat -- the fastest localizer wins the market.",
        "Run a four-step SOP: auto-translate the script, clone a voice per language, align lip-sync, then re-render or overlay.",
        "AI cuts overseas localization from roughly $3,000 to under $30 per episode.",
        "Keep tone markers ('angry', 'whisper') in the translated script so the voice step preserves the performance.",
        "Lollipop Drama ships 15+ languages natively, covering the distribution half of the pipeline.",
    ],
    "traditional-vs-ai-short-drama-production-cost": [
        "A 10-episode AI vertical series costs roughly $500-1,000 versus $15,000-50,000 for a traditional shoot.",
        "Production time drops from about 15 days to 2 days, and team size from 20+ people to 1-3.",
        "The ROI curve flips positive at episode 3 for AI production instead of episode 20 for traditional.",
        "AI budgets are dominated by generation credits and iteration loops, not crew or equipment.",
        "Traditional shooting still wins when the brief demands live-action realism or physical stunts.",
    ],
    "prompting-cinematic-camera-movements-vertical": [
        "Name the camera move explicitly in the prompt -- 'slow dolly-in on face', 'whip pan to reveal', 'Hitchcock zoom' -- instead of hoping for motion.",
        "Match the move to the emotion: push-in for tension, pull-out for isolation, handheld for chaos.",
        "Default text-to-video returns a locked, floating subject; that static look is what makes AI video feel dead.",
        "In 9:16 keep subjects centered or on rule-of-thirds -- side pans waste vertical space.",
        "LunoTV reads motion prompts directly, so you direct the camera in words rather than in an editor.",
    ],
    "web-novel-to-ai-short-drama-pipeline": [
        "A 200-chapter web novel compresses to roughly 10 drama episodes by keeping only the spine: inciting incident, three reversals, payoff.",
        "Run five steps: extract the hook arc, build a beat sheet, create a character bible with reference images, script with 3-second hooks, then generate via Image-to-Video.",
        "Generate every scene from the character bible references so the cast stays consistent across episodes.",
        "Webtoons are the easiest source -- panels are already consistent character art and work directly as Image-to-Video anchors.",
        "Secure adaptation rights before you start: a licensed novel is the cheapest source of proven story structure.",
    ],
    "ai-audio-soundscapes-short-dramas": [
        "Build audio in three layers: a genre-matched BGM bed, a dramatic SFX hit on the beat, and a subtle ambient bed.",
        "Timing matters more than volume -- a slap needs its transient on the exact frame of impact.",
        "Use an AI BGM generator such as Suno or Udio for tracks and ElevenLabs or CapCut for sound effects.",
        "Keep BGM well under dialogue level so lines stay intelligible on phone speakers.",
        "Verify commercial licensing for every track before publishing to monetized platforms.",
    ],
    "ai-short-drama-monetization-copyright": [
        "Monetize only on platforms with clear commercial licensing -- most free tiers forbid commercial use.",
        "Lollipop Drama pays up to 80% creator revenue share across 80+ countries.",
        "Disclose AI-generated content on TikTok, YouTube Shorts, and WeChat Channels, and never impersonate real people.",
        "You likely own the arrangement -- prompts, edits, and script -- while raw model output remains legally contested.",
        "Keep training images and cloned voices rights-clean to avoid takedowns and copyright claims.",
    ],
    "fixing-ai-video-artifacts": [
        "Fix artifacts on two fronts: prevent them with negative prompts, then repair the remainder in post.",
        "Negative prompts for 'extra limbs, distorted hands, flickering' cut the artifact rate before any editing.",
        "Stabilize flicker with frame interpolation or denoise; remove extra fingers with inpainting.",
        "Re-anchor a melting face by regenerating with Image-to-Video from a clean reference frame.",
        "Decide fix versus regenerate by cost -- a two-second reshoot is usually cheaper than a 20-minute cleanup.",
    ],
}


def strip_md_links(s: str) -> str:
    return re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", s)


def trim_sentences(s: str, limit: int) -> str:
    s = s.strip()
    if len(s) <= limit:
        return s
    parts = re.split(r"(?<=[.!?])\s+", s)
    out = ""
    for p in parts:
        if out and len(out) + 1 + len(p) > limit:
            break
        out = p if not out else f"{out} {p}"
    return out or s[:limit].rstrip() + "..."


def ts_str(s: str) -> str:
    """转成 TS 双引号字符串字面量（转义反斜杠/引号/换行）。"""
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n") + '"'


def ts_template(s: str) -> str:
    """转成 TS 模板字符串字面量（转义反引号与 ${）。"""
    return "`" + s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${") + "`"


# 自动截断会切断单词时的手工 seoTitle
SEO_TITLE_OVERRIDE = {
    "prompting-cinematic-camera-movements-vertical": "Vertical AI Drama Camera Prompts | Lollipop Drama",
}


def short_title(title: str, slug: str = "") -> str:
    """seoTitle 用：去掉副标题（冒号后），控制在 60 字符内。"""
    if slug in SEO_TITLE_OVERRIDE:
        return SEO_TITLE_OVERRIDE[slug]
    base = title.split(": ")[0].strip() if ": " in title else title
    suffix = " | Lollipop Drama"
    if len(base) + len(suffix) <= 60:
        return base + suffix
    base = base[: 60 - len(suffix) - 1].rstrip(" ,—-")
    return base + suffix


def parse(path):
    raw = io.open(path, encoding="utf-8").read()
    # 去掉尾部自带的 JSON-LD（schema 由页面统一生成）
    raw = re.sub(r"\n*<script type=\"application/ld\+json\">[\s\S]*?</script>\s*$", "\n", raw)
    raw = raw.rstrip() + "\n"
    # 口径统一
    raw = raw.replace("70% revenue share", "80% revenue share").replace("70% creator revenue share", "80% creator revenue share")
    raw = raw.replace("70% creator revenue", "80% creator revenue").replace("up to 70%", "up to 80%")
    raw = raw.replace("(up to 70% revenue share)", "(up to 80% revenue share)")
    raw = re.sub(r"\b70%", "80%", raw)

    lines = raw.split("\n")
    title = lines[0].lstrip("# ").strip()
    core = ""
    for l in lines:
        if l.startswith("**Core Answer:**"):
            core = l[len("**Core Answer:**"):].strip()
            break

    # FAQ 段
    faq_start = raw.find("\n## Frequently Asked Questions")
    faq_end = raw.find("\n## ", faq_start + 10) if faq_start > 0 else -1
    faq = []
    if faq_start > 0:
        seg = raw[faq_start: faq_end if faq_end > 0 else len(raw)]
        cur_q = None
        buf = []
        for l in seg.split("\n"):
            if l.startswith("### "):
                if cur_q:
                    faq.append((cur_q, " ".join(buf).strip()))
                cur_q = l[4:].strip()
                buf = []
            elif l.strip() and not l.startswith("## "):
                buf.append(l.strip())
        if cur_q:
            faq.append((cur_q, " ".join(buf).strip()))

    # 正文：去掉 H1 / byline / FAQ 段
    body = raw
    if faq_start > 0:
        body = body[:faq_start] + (body[faq_end:] if faq_end > 0 else "")
    body_lines = [l for l in body.split("\n") if not l.startswith("# ") and not l.startswith("> *By ")]
    body = "\n".join(body_lines).strip()

    # 步骤（仅 "### Step N: xxx" 形态的文章）
    steps = []
    for m in re.finditer(r"### Step (\d+): ([^\n]+)\n+([\s\S]*?)(?=\n### Step \d+:|\n## |\Z)", raw):
        if m.start() > (faq_start if faq_start > 0 else 0) and faq_start > 0 and faq_end > 0 and faq_start < m.start() < faq_end:
            continue
        name = m.group(2).strip()
        text = " ".join(x.strip() for x in m.group(3).split("\n") if x.strip() and not x.strip().startswith("|"))
        text = strip_md_links(text)
        steps.append({"name": name, "text": text})

    return {
        "title": title,
        "core": core,
        "body": body,
        "faq": faq,
        "steps": steps,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true", help="真正写入数据文件")
    ap.add_argument("--src", default=SRC_DIR)
    args = ap.parse_args()

    posts = []
    for fname, slug, category, label in ARTICLES:
        p = os.path.join(args.src, fname)
        if not os.path.exists(p):
            sys.exit(f"缺少源文件：{p}")
        d = parse(p)
        d.update(slug=slug, category=category, label=label)
        posts.append(d)

    # 试跑摘要
    for d in posts:
        print(f"{d['slug']}")
        print(f"  title   : {d['title']}")
        st = short_title(d["title"], d["slug"])
        print(f"  seoTitle: {st} ({len(st)})")
        print(f"  excerpt : {len(d['core'])} chars | body {len(d['body'])} chars | FAQ {len(d['faq'])} | steps {len(d['steps'])}")
        print(f"  takeaways: {len(TAKEAWAYS[d['slug']])}")
    if not args.write:
        print("\n（试跑完毕，加 --write 写入）")
        return

    # ── blog.ts ──（数据文件是 CRLF，锚点用正则兼容 \r\n）
    blog_path = os.path.join(ROOT, "src", "app", "data", "blog.ts")
    s = io.open(blog_path, encoding="utf-8", newline="").read()
    m = re.search(r"\n\];\r?\n\r?\n/\*\* 通过 slug 查找", s)
    if not m:
        sys.exit("blog.ts 插入锚点未找到")
    block = []
    for d in posts:
        steps_len = len(d["steps"])
        block.append("  {")
        block.append(f'    slug: "{d["slug"]}",')
        block.append(f'    title: {ts_str(d["title"])},')
        block.append('    titleZh: "",')
        block.append(f'    excerpt: {ts_str(trim_sentences(strip_md_links(d["core"]), 300))},')
        block.append('    excerptZh: "",')
        block.append(f'    seoTitle: {ts_str(short_title(d["title"], d["slug"]))},')
        block.append(f'    seoDescription: {ts_str(trim_sentences(strip_md_links(d["core"]), 155))},')
        block.append(f'    category: "{d["category"]}",')
        block.append(f'    categoryLabel: "{d["label"]}",')
        block.append(f'    author: {ts_str(AUTHOR)},')
        block.append(f'    authorRole: {ts_str(AUTHOR_ROLE)},')
        block.append(f'    authorBio: {ts_str(AUTHOR_BIO)},')
        block.append(f'    publishDate: "{DATE}",')
        block.append(f'    updateDate: "{DATE}",')
        block.append("    keyTakeaways: [" + ",".join(ts_str(t) for t in TAKEAWAYS[d["slug"]]) + "],")
        if steps_len:
            block.append(f"    stepCount: {steps_len},")
        block.append("  },")
    eol = "\r\n" if "\r\n" in s else "\n"
    insert = eol.join(block) + eol
    s = s[: m.start() + 1] + insert + "];" + s[m.end() - len("/** 通过 slug 查找"):]
    io.open(blog_path, "w", encoding="utf-8", newline="").write(s)

    # ── blogContent.ts ──
    content_path = os.path.join(ROOT, "src", "app", "data", "blogContent.ts")
    s = io.open(content_path, encoding="utf-8", newline="").read()
    m = re.search(r"\n\};\r?\n\r?\n/\*\* 合并元数据", s)
    if not m:
        sys.exit("blogContent.ts 插入锚点未找到")
    block = []
    for d in posts:
        block.append(f'  "{d["slug"]}": {{')
        block.append(f'    content: {ts_template(d["body"])},')
        block.append('    contentZh: "",')
        if d["steps"]:
            block.append("    steps: [")
            for st in d["steps"]:
                block.append(f'      {{ name: {ts_str(st["name"])}, text: {ts_str(st["text"])} }},')
            block.append("    ],")
            block.append('    totalTime: "PT2H",')
            block.append('    difficulty: "Intermediate",')
        block.append("  },")
    eol = "\r\n" if "\r\n" in s else "\n"
    insert = eol.join(block) + eol
    s = s[: m.start() + 1] + insert + "};" + s[m.end() - len("/** 合并元数据"):]
    io.open(content_path, "w", encoding="utf-8", newline="").write(s)

    # ── blogFaq.ts ──
    faq_path = os.path.join(ROOT, "src", "app", "data", "blogFaq.ts")
    s = io.open(faq_path, encoding="utf-8", newline="").read()
    m = re.search(r"\n\};\r?\n?\Z", s)
    if not m:
        sys.exit("blogFaq.ts 插入锚点未找到")
    block = []
    for d in posts:
        block.append(f'  "{d["slug"]}": [')
        for q, a in d["faq"]:
            block.append("    {")
            block.append(f"      question: {ts_str(strip_md_links(q))},")
            block.append(f"      answer: {ts_str(strip_md_links(a))},")
            block.append("    },")
        block.append("  ],")
    eol = "\r\n" if "\r\n" in s else "\n"
    insert = eol.join(block) + eol
    s = s[: m.start() + 1] + insert + "};" + eol
    io.open(faq_path, "w", encoding="utf-8", newline="").write(s)

    print(f"\n已写入 {len(posts)} 篇：blog.ts / blogContent.ts / blogFaq.ts")


if __name__ == "__main__":
    main()
