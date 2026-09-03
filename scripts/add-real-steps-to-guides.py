# -*- coding: utf-8 -*-
"""给 3 篇旧 guide 文章补真实 HowTo 步骤（2026-09-01，/guides 迁入 /blog 之后）。

背景：旧代码对 `category === "guide"` 的文章输出一份 i18n 通用 HowTo 模板
（`dp.howToSteps` / prerender 里的硬编码 7 步），**多篇共用且步骤在页面上不可见**，
违反 Google「结构化数据必须与可见文本一致」的要求，属合规隐患。

本脚本的处理：
  A. 3 篇正文里本身就有可见有序步骤的文章 → 从正文提炼真实 steps / stepsZh
     （步骤名直接取自正文的 `## Step N:` / `### Stage N:` 标题，保证与可见文本一致）
  B. 另外 4 篇是对比 / 盘点 / 方法 / 风险清单型，没有有序步骤 → 不发 HowTo。
     对应的「删掉通用模板 fallback」在 BlogPostPage.tsx 与 prerender-plugin.ts 手工改。

⚠️ 本脚本一次性（已执行完毕）。写入前会检查 slug 是否已有 steps / stepCount，有则跳过（幂等）。

⚠️ 复用时最关键的坑：**不能用 `Path.read_text()` 读写数据文件**。
    它默认开启通用换行，会把纯 CRLF 的文件整体转成 LF（第一次跑就是这个 bug，
    把 blogContent.ts 的 8841 个 CRLF 全改成了 LF）。
    必须 `open(..., newline="")` 保真读取，内部按 LF 处理，落盘时再还原成原行尾。
"""
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(r"C:\Users\Administrator\Documents\lollipop")
BLOG = ROOT / "src" / "app" / "data" / "blog.ts"
CONTENT = ROOT / "src" / "app" / "data" / "blogContent.ts"


def read(p: Path) -> tuple[str, str]:
    """⚠️ 必须用 newline="" 读取。

    Path.read_text() / open() 默认开启通用换行，会把项目数据文件的 CRLF 全部转成 LF ——
    ① EOL 检测永远得到 "\\n"（检测失效）② 写回时把整个文件从 CRLF 改成 LF（行尾污染）。
    本项目数据文件是纯 CRLF（blogContent.ts 有 8841 个），必须保真读取。

    返回 (LF 归一化的工作副本, 原文件行尾)。处理全程用 LF，落盘时统一还原。
    """
    with p.open(encoding="utf-8", newline="") as f:
        raw = f.read()
    eol = "\r\n" if "\r\n" in raw else "\n"
    return raw.replace("\r\n", "\n"), eol


def write(p: Path, work: str, eol: str) -> None:
    """工作副本（LF）→ 按原行尾还原后落盘。"""
    with p.open("w", encoding="utf-8", newline="") as f:
        f.write(work.replace("\n", eol))




# ── 步骤数据 ────────────────────────────────────────────────────────────────
# 步骤名逐字取自正文可见标题；步骤说明提炼自该节正文（"What to do" / 核心要点）。
STEPS = {
    # 正文 H2 = "## Step 1: ..." ~ "## Step 8: ..."（新手向，10 集系列 5–15 天）
    "how-to-create-ai-short-drama": {
        "stepCount": 8,
        "totalTime": "P10D",
        "difficulty": "Beginner",
        "steps": [
            ("Develop Your Story Concept",
             "Define a clear core conflict that resolves within 1-3 episodes, pick a strong emotional baseline "
             "(romance, mystery, suspense, comedy - never neutral), and lay out a serialized episode structure."),
            ("Generate the Script with AI",
             "Feed your concept, character descriptions, and episode count into an AI script tool, then generate "
             "a full series outline followed by per-episode scripts."),
            ("Design Consistent Characters",
             "Create locked reference images for each main character covering face, body type, clothing style, "
             "and key expressions, and reuse them for every later generation."),
            ("Create Storyboards",
             "Turn each scene into a shot list with camera angle, character positioning, setting description, "
             "and emotional tone."),
            ("Generate Video Scenes",
             "Input the storyboard shots into an AI video generator and produce the individual scenes."),
            ("Add AI Voice and Lip-Sync",
             "Synthesize character dialogue, pick character-appropriate voice profiles with emotional variation, "
             "and align the audio to the video with lip-sync."),
            ("Edit, Color Grade, and Subtitle",
             "Sequence the scenes per script, apply color grading, auto-generate subtitles with ASR, and export."),
            ("Publish and Monetize",
             "Upload to your target platform, enable monetization, and promote the series to your audience."),
        ],
        "stepsZh": [
            ("构思故事内核",
             "设定 1–3 集内解决的核心冲突，选定明确的情感基调（爱情、悬疑、惊悚、喜剧，不要中立），并规划分集连载结构。"),
            ("用 AI 生成剧本",
             "把故事概念、角色设定和集数输入 AI 剧本工具，先产出整季大纲，再逐集生成剧本。"),
            ("设计一致的角色",
             "为每个主要角色生成并锁定参考图，覆盖面部、体型、服装风格与关键表情，后续所有生成都复用同一套参考。"),
            ("制作分镜",
             "把每场戏拆成镜头清单，写明机位、人物站位、场景描述与情绪基调。"),
            ("生成视频片段",
             "把分镜镜头输入 AI 视频生成工具，逐镜头产出素材。"),
            ("配音与口型对齐",
             "合成角色对白，为角色选择合适的音色与情绪参数，再用口型同步技术把声音对齐到画面。"),
            ("剪辑、调色与字幕",
             "按剧本顺序组接镜头，统一调色，用语音识别自动生成字幕，最后导出成片。"),
            ("发布与变现",
             "上传到目标平台，开启变现，并向受众推广这部短剧。"),
        ],
    },
    # 正文 H3 = "### Stage 1: ..." ~ "### Stage 8: ..."，每节有 "**What to do:**"
    "ai-video-storytelling": {
        "stepCount": 8,
        "totalTime": "P10D",
        "difficulty": "Intermediate",
        "steps": [
            ("Story Concept Development",
             "Define the story's genre, core conflict, protagonist goal, and antagonistic force. Write a "
             "one-sentence logline. Develop an episode-by-episode outline."),
            ("Script Writing and Locking",
             "Write the full episode scripts with dialogue, scene descriptions, and emotional notes. Lock the "
             "script before proceeding to production."),
            ("Character Design and Visual Style",
             "Create visual reference images for each main character and define the overall visual style."),
            ("Storyboarding and Shot List",
             "Convert each scene into a shot list. For each shot, define: camera angle, character positioning, "
             "setting, and emotional tone."),
            ("AI Video Generation",
             "Input storyboard shots into an AI video generator and produce individual scenes."),
            ("AI Voice and Lip-Sync",
             "Generate character dialogue audio and align with video character lip movements."),
            ("Editing, Color Grading, and Subtitling",
             "Assemble scenes, apply color grading, add subtitles, and export."),
            ("Publishing and Performance Tracking",
             "Upload to target platform, set up analytics, monitor performance."),
        ],
        "stepsZh": [
            ("故事概念开发",
             "确定题材、核心冲突、主角目标与对抗力量，写一句话故事简介，并细化分集大纲。"),
            ("剧本写作与锁定",
             "完成全部分集剧本，包含对白、场景描述与情绪提示；进入制作前必须锁定剧本。"),
            ("角色设计与视觉风格",
             "为每个主要角色制作视觉参考图，并确定整体视觉风格。"),
            ("分镜与镜头清单",
             "把每场戏转成镜头清单，逐镜写明机位、人物站位、场景与情绪基调。"),
            ("AI 视频生成",
             "把分镜镜头输入 AI 视频生成工具，产出各个片段。"),
            ("AI 配音与口型同步",
             "生成角色对白音频，并与画面中角色的口型对齐。"),
            ("剪辑、调色与字幕",
             "组接片段、统一调色、添加字幕并导出。"),
            ("发布与数据追踪",
             "上传到目标平台，配置数据分析，持续监测表现。"),
        ],
    },
    # 正文 H2 = "## II. Stage 1: ..." ~ "## VIII. Stage 7: ..."（全流程手册，4–8 天）
    "ai-short-drama-complete-guide": {
        "stepCount": 7,
        "totalTime": "P6D",
        "difficulty": "Advanced",
        "steps": [
            ("Creative Concept",
             "Feed a structured creative seed into a large language model and let it generate multiple complete "
             "options in minutes. The more specific your constraints, the better the output."),
            ("Script Writing",
             "Let AI produce the narrative skeleton - scene conflicts, emotional arcs, transition beats - while "
             "humans write all dialogue in their own voice. Dialogue is your copyright moat."),
            ("Character Design",
             "Generate character text profiles with AI, then build original avatars. Never use real celebrities "
             "or unauthorized likenesses of real people."),
            ("Storyboarding",
             "Lock the script first, let an AI storyboard tool generate shot descriptions, then produce visual "
             "references per shot. Humans own pacing and emotional storytelling."),
            ("Video Generation",
             "Grade your shots and spend compute only where it shows: character close-ups and emotional climax "
             "scenes. Shot grading cuts rendering cost by roughly 40%."),
            ("Voiceover & Post-Production",
             "Generate voiceover and captions with speech recognition, then human-check lip-sync and dialect "
             "handling - recognition accuracy tops out at 93-97%."),
            ("Distribution & Monetization",
             "Pick from platform revenue share, brand sponsorships, and international licensing, then distribute "
             "to match the path you chose."),
        ],
        "stepsZh": [
            ("创意构思",
             "把结构化的「创意种子」输入大语言模型，几分钟内让它产出多套完整方案。约束给得越具体，输出越好。"),
            ("剧本写作",
             "让 AI 生成叙事骨架——场景冲突、情绪弧线、转场节拍；对白全部由人用自己的语言写，这是你的版权护城河。"),
            ("角色设计",
             "用 AI 生成角色文字设定，再据此制作原创形象。绝不使用真实明星或未经授权的真人肖像。"),
            ("分镜制作",
             "先锁定剧本，再用 AI 分镜工具生成镜头描述，然后逐镜产出视觉参考。节奏与情绪叙事由人把控。"),
            ("视频生成",
             "对镜头分级，把算力花在看得见的地方：人物特写和情绪高潮场次。分级渲染可省约 40% 成本。"),
            ("配音与后期",
             "用语音识别生成配音与字幕，再由人工校对口型与方言处理——识别准确率上限在 93–97%。"),
            ("发行与变现",
             "在平台分成、品牌赞助、海外授权三条路径中选择，并按所选路径匹配发行渠道。"),
        ],
    },
}


def js_str(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def render_steps(rows) -> str:
    out = ["    steps: ["]
    for name, text in rows:
        out.append(f"      {{ name: {js_str(name)}, text: {js_str(text)} }},")
    out.append("    ],")
    return "\n".join(out)


def render_steps_zh(rows) -> str:
    out = ["    stepsZh: ["]
    for name, text in rows:
        out.append(f"      {{ name: {js_str(name)}, text: {js_str(text)} }},")
    out.append("    ],")
    return "\n".join(out)


# ── A. blog.ts：补 stepCount / totalTime / difficulty ────────────────────────
blog, blog_eol = read(BLOG)
blog_changed = False

for slug, d in STEPS.items():
    i = blog.find(f'    slug: "{slug}",')
    if i < 0:
        print(f"[SKIP] blog.ts 找不到 {slug}")
        continue
    # 块边界：下一个 slug 或数组结尾
    nxt = blog.find("\n    slug: \"", i + 1)
    end = nxt if nxt > 0 else len(blog)
    block = blog[i:end]

    if re.search(r"^\s*stepCount:", block, re.M):
        print(f"[SKIP] blog.ts {slug} 已有 stepCount")
        continue

    m = list(re.finditer(r"^\s*(?:coverImage|updateDate): .*,$", block, re.M))
    if not m:
        print(f"[SKIP] blog.ts {slug} 找不到插入锚点")
        continue
    anchor_end = i + m[-1].end()

    insert = (
        f"\n    stepCount: {d['stepCount']},"
        f"\n    totalTime: \"{d['totalTime']}\","
        f"\n    difficulty: \"{d['difficulty']}\","
    )
    blog = blog[:anchor_end] + insert + blog[anchor_end:]
    blog_changed = True
    print(f"[OK]   blog.ts {slug} +stepCount={d['stepCount']} totalTime={d['totalTime']} difficulty={d['difficulty']}")

# ── B. blogContent.ts：补 steps / stepsZh ───────────────────────────────────
content, content_eol = read(CONTENT)
content_changed = False

for slug, d in STEPS.items():
    i = content.find(f'  "{slug}": {{')
    if i < 0:
        print(f"[SKIP] blogContent.ts 找不到 {slug}")
        continue
    close0 = content.find("\n  },\n", i)
    if close0 > 0 and "    steps: [" in content[i:close0]:
        print(f"[SKIP] blogContent.ts {slug} 已有 steps")
        continue

    # 插入点：块结束标记 `\n  },\n` 之前（先定位 contentZh，避免误命中更早的 `},`）
    zh = content.find("    contentZh:", i)
    if zh < 0:
        print(f"[SKIP] blogContent.ts {slug} 没有 contentZh")
        continue
    close = content.find("\n  },\n", zh)
    if close < 0:
        print(f"[SKIP] blogContent.ts {slug} 找不到块结束")
        continue

    insert = "\n" + render_steps(d["steps"]) + "\n" + render_steps_zh(d["stepsZh"])
    content = content[:close] + insert + content[close:]
    content_changed = True
    print(f"[OK]   blogContent.ts {slug} +steps({len(d['steps'])}) +stepsZh({len(d['stepsZh'])})")

# ── 落盘 ────────────────────────────────────────────────────────────────────
if blog_changed:
    write(BLOG, blog, blog_eol)
    print(f"\n[WRITE] blog.ts → {len(blog)} chars，按原行尾 {blog_eol!r} 还原")
if content_changed:
    write(CONTENT, content, content_eol)
    print(f"[WRITE] blogContent.ts → {len(content)} chars，按原行尾 {content_eol!r} 还原")
if not (blog_changed or content_changed):
    print("\n[NO-OP] 无改动（可能已执行过）")
