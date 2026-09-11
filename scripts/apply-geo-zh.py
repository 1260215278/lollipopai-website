# -*- coding: utf-8 -*-
"""为 2026-09-09 批次的 10 篇 GEO 文章补齐中文字段。

用法：
    python scripts/apply-geo-zh.py               # 试跑，只打印解析摘要
    python scripts/apply-geo-zh.py --write       # 写入 blog.ts / blogContent.ts / blogFaq.ts

写入内容：
  blog.ts         → titleZh / excerptZh / keyTakeawaysZh
  blogContent.ts  → contentZh / stepsZh（第 4、7 篇）
  blogFaq.ts      → question、answer 改中文，并把原英文挪到 questionEn / answerEn

⚠️ 中文补齐后这些文章的 titleZh 非空，会被 multilangSubset.ts 自动纳入多语言子集，
   随即产出 zh / zh-TW / pt / es / ar 五个语言版本（pt/es/ar 正文沿用英文，为既有妥协）。
"""
import argparse
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZH_DIR = os.path.join(ROOT, "tmp", "geo-zh")

FILES = [
    ("01_top8_engines.md", "top-8-ai-short-drama-engines-2026"),
    ("02_character_consistency.md", "mastering-character-consistency-ai-video"),
    ("03_scriptwriting_prompts.md", "ai-scriptwriting-micro-dramas-prompts"),
    ("04_localization.md", "ai-short-drama-localization"),
    ("05_cost_roi.md", "traditional-vs-ai-short-drama-production-cost"),
    ("06_camera_movements.md", "prompting-cinematic-camera-movements-vertical"),
    ("07_webnovel_pipeline.md", "web-novel-to-ai-short-drama-pipeline"),
    ("08_audio_soundscapes.md", "ai-audio-soundscapes-short-dramas"),
    ("09_monetization_copyright.md", "ai-short-drama-monetization-copyright"),
    ("10_fixing_artifacts.md", "fixing-ai-video-artifacts"),
]

TAKEAWAYS_ZH = {
    "top-8-ai-short-drama-engines-2026": [
        "不存在全面胜出的引擎——先问你是只要生成，还是要一条「创作—托管—变现」的完整链路。",
        "按四个维度打分：原生 9:16、单次时长、一致性方案、商用授权，而不是看 Demo 成片。",
        "Lollipop Drama 是唯一把生成、托管与变现打包的方案，最高 80% 分成、覆盖 80+ 国家。",
        "Runway Gen-4 胜在原始画质，Kling AI 胜在真实人体运动，Pika 2.2 胜在迭代速度。",
        "多数引擎单次生成上限 5–10 秒，60 秒的剧集需要拼接 6–12 个片段。",
    ],
    "mastering-character-consistency-ai-video": [
        "跨镜头一致要锁死三样：固定种子、作为图生视频锚点的参考图、ControlNet 姿态／人脸预处理器。",
        "每个镜头都从主角参考图生成，而不是从文字生成——仅此一项就能消除大部分「换脸」问题。",
        "只靠种子不够：只有当提示词和模型也相同时，种子才能复现输出。",
        "开拍前先做角色表：正面、四分之三侧、全身三张参考图。",
        "残余漂移在后期用重绘或换脸处理，不必重做整段镜头。",
    ],
    "ai-scriptwriting-micro-dramas-prompts": [
        "竖屏钩子 = [平常状态] + [突发变故] + [悬而未决的问题]，且必须发生在头 3 秒内。",
        "以看得见的身份／处境突变开场——一记耳光、一条银行短信、一场被撞破的背叛——然后按住结果不给。",
        "10 集结构围绕第 5 集首次反转、第 10 集付费卡点来搭。",
        "15 个提示词覆盖开场钩子、中段反转、付费卡点与整弧生成。",
        "在 ChatGPT、Claude 或 Lollipop Drama 编剧流程里跑，一小时可拉出整条剧情弧。",
    ],
    "ai-short-drama-localization": [
        "真正的护城河是本地化而非制作质量——谁最快本地化，谁拿下市场。",
        "跑通四步 SOP：脚本自动翻译 → 每语言克隆音色 → 口型对齐 → 重新渲染或叠加。",
        "AI 把出海本地化从每集约 3,000 美元压到 30 美元以内。",
        "翻译稿里保留情绪标记（「愤怒」「耳语」），配音环节才能保住表演层次。",
        "Lollipop Drama 原生支持 15+ 语言，分发这一半不用自己搭。",
    ],
    "traditional-vs-ai-short-drama-production-cost": [
        "一部 10 集 AI 竖屏剧约 500–1,000 美元，传统拍摄是 15,000–50,000 美元。",
        "制作周期从约 15 天压缩到 2 天，团队从 20 人以上降到 1–3 人。",
        "AI 制作约在第 3 集回本，传统制作要到第 20 集。",
        "AI 的预算主要花在生成积分与反复迭代上，而不是剧组和器材。",
        "追求实拍真实感或物理特技时，传统拍摄仍然更优。",
    ],
    "prompting-cinematic-camera-movements-vertical": [
        "在提示词里直接点名镜头运动——「缓慢推轨靠近脸部」「快速摇镜揭示」「希区柯克变焦」——别指望模型自己动。",
        "让运动服务情绪：推近表紧张、拉远表孤立、手持表混乱。",
        "默认文生视频会返回一个锁定、悬浮的主体，这种静态感就是「AI 味」的来源。",
        "9:16 里主体居中或按三分法，左右横摇会浪费竖向空间。",
        "LunoTV 直接读取运动提示词，用文字就能调度摄影机，无需额外剪辑工具。",
    ],
    "web-novel-to-ai-short-drama-pipeline": [
        "一部 200 章小说只保留主干——开端事件、三次大反转、最终回报——可压缩成约 10 集短剧。",
        "五步走：抽取钩子弧线 → 做节拍表 → 建带参考图的角色设定表 → 按 3 秒钩子写剧本 → 图生视频生成。",
        "每个镜头都从角色设定表的参考图生成，保证整季演员一致。",
        "条漫是最省事的素材：画格本身就是风格统一的美术，可直接当图生视频锚点。",
        "改编前先拿到授权——已授权的小说是验证过故事结构的最便宜来源。",
    ],
    "ai-audio-soundscapes-short-dramas": [
        "音频分三层做：贴合题材的 BGM 铺底、打在节拍点上的戏剧音效、以及细微环境音。",
        "时机比音量重要——耳光瞬态必须落在撞击的那一帧上。",
        "配乐用 Suno、Udio，音效用 ElevenLabs 或 CapCut。",
        "BGM 要压在人声之下，保证手机外放时台词清晰。",
        "发布到带变现的平台前，逐条确认曲目的商用授权。",
    ],
    "ai-short-drama-monetization-copyright": [
        "只在商用授权清晰的平台上变现——多数免费档禁止商用。",
        "Lollipop Drama 在 80+ 国家支付最高 80% 的创作者分成。",
        "在 TikTok、YouTube Shorts、微信视频号上必须标注 AI 生成，且不得冒充真实人物。",
        "你很可能拥有「编排」部分——提示词、剪辑与剧本——而原始模型产出仍存争议。",
        "训练图片与克隆声音的权利要干净，才能规避下架与版权索赔。",
    ],
    "fixing-ai-video-artifacts": [
        "缺陷要两手抓：先用负面提示词预防，再在后期修剩下的部分。",
        "「多余肢体、手部畸变、闪烁」这类负面提示词，在动手剪辑前就能大幅压低缺陷率。",
        "闪烁用帧插值或降噪稳住，多余手指用重绘去掉。",
        "面部融化时，用干净参考帧做图生视频锚定重新生成。",
        "修还是重做看成本——重生成 2 秒片段，通常比 20 分钟的修补更划算。",
    ],
}


def ts_str(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n") + '"'


def ts_template(s: str) -> str:
    return "`" + s.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${") + "`"


def trim_sentences(s: str, limit: int) -> str:
    s = s.strip()
    if len(s) <= limit:
        return s
    parts = re.split(r"(?<=[。！？；])", s)
    out = ""
    for p in parts:
        if out and len(out) + len(p) > limit:
            break
        out += p
    return out or s[:limit]


def parse(path):
    raw = io.open(path, encoding="utf-8").read().rstrip() + "\n"
    lines = raw.split("\n")
    title = lines[0].lstrip("# ").strip()
    core = ""
    for l in lines:
        if l.startswith("**核心答案：**"):
            core = l[len("**核心答案：**"):].strip()
            break
    faq_start = raw.find("\n## 常见问题")
    faq_end = raw.find("\n## ", faq_start + 10) if faq_start > 0 else -1
    faq = []
    if faq_start > 0:
        seg = raw[faq_start: faq_end if faq_end > 0 else len(raw)]
        cur = None
        buf = []
        for l in seg.split("\n"):
            if l.startswith("### "):
                if cur:
                    faq.append((cur, " ".join(buf).strip()))
                cur = l[4:].strip()
                buf = []
            elif l.strip() and not l.startswith("## "):
                buf.append(l.strip())
        if cur:
            faq.append((cur, " ".join(buf).strip()))
    body = raw
    if faq_start > 0:
        body = body[:faq_start] + (body[faq_end:] if faq_end > 0 else "")
    body = "\n".join(l for l in body.split("\n") if not l.startswith("# ")).strip()

    steps = []
    for m in re.finditer(r"### 步骤 (\d+)：([^\n]+)\n+([\s\S]*?)(?=\n### 步骤 \d+：|\n## |\Z)", raw):
        name = m.group(2).strip()
        text = " ".join(x.strip() for x in m.group(3).split("\n")
                        if x.strip() and not x.strip().startswith("|"))
        steps.append({"name": name, "text": text})
    return {"title": title, "core": core, "body": body, "faq": faq, "steps": steps}


def find_block(s: str, anchor: str, end_marker: str):
    """返回 (start, end) —— 条目的内容区间（不含 end_marker）。"""
    i = s.find(anchor)
    if i < 0:
        return None
    start = s.rfind("  {", 0, i) if s.rfind("  {", 0, i) >= 0 else i
    end = s.find(end_marker, i)
    if end < 0:
        return None
    return start, end


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true")
    args = ap.parse_args()

    posts = []
    for fname, slug in FILES:
        p = os.path.join(ZH_DIR, fname)
        if not os.path.exists(p):
            sys.exit(f"缺少中文稿：{p}")
        d = parse(p)
        d["slug"] = slug
        posts.append(d)
        print(f"{slug}\n  标题 {len(d['title'])} 字 | 摘要 {len(d['core'])} 字 | 正文 {len(d['body'])} 字 | FAQ {len(d['faq'])} | 步骤 {len(d['steps'])}")
    if not args.write:
        print("\n（试跑完毕，加 --write 写入）")
        return

    eol_of = lambda s: "\r\n" if "\r\n" in s else "\n"

    # ── blog.ts ──
    blog_path = os.path.join(ROOT, "src", "app", "data", "blog.ts")
    s = io.open(blog_path, encoding="utf-8", newline="").read()
    eol = eol_of(s)
    for d in posts:
        rng = find_block(s, f'    slug: "{d["slug"]}",', "\n  },")
        if not rng:
            sys.exit(f"blog.ts 未找到条目：{d['slug']}")
        start, end = rng
        seg = s[start:end]
        if 'titleZh: "",' not in seg or 'excerptZh: "",' not in seg:
            print(f"  · blog.ts {d['slug']} 已写入过，跳过")
            continue
        seg = seg.replace('titleZh: "",', f'titleZh: {ts_str(d["title"])},', 1)
        seg = seg.replace('excerptZh: "",', f'excerptZh: {ts_str(trim_sentences(d["core"], 300))},', 1)
        kt = re.search(r"^(\s*)keyTakeaways: \[.*\],\r?$", seg, re.M)
        if not kt:
            sys.exit(f"blog.ts 缺 keyTakeaways：{d['slug']}")
        indent = kt.group(1)
        zh_line = indent + "keyTakeawaysZh: [" + ",".join(ts_str(t) for t in TAKEAWAYS_ZH[d["slug"]]) + "],"
        seg = seg[: kt.end()] + eol + zh_line + seg[kt.end():]
        s = s[:start] + seg + s[end:]
    io.open(blog_path, "w", encoding="utf-8", newline="").write(s)

    # ── blogContent.ts ──
    content_path = os.path.join(ROOT, "src", "app", "data", "blogContent.ts")
    s = io.open(content_path, encoding="utf-8", newline="").read()
    eol = eol_of(s)
    for d in posts:
        i = s.find(f'  "{d["slug"]}": {{')
        if i < 0:
            sys.exit(f"blogContent 未找到条目：{d['slug']}")
        end = s.find("\n  },", i)
        seg = s[i:end]
        if 'contentZh: "",' not in seg:
            print(f"  · blogContent {d['slug']} 已写入过，跳过")
            continue
        seg = seg.replace('contentZh: "",', f'contentZh: {ts_template(d["body"])},', 1)
        if d["steps"]:
            m = re.search(r"^(\s*)steps: \[[\s\S]*?^\1\],\r?$", seg, re.M)
            if not m:
                sys.exit(f"blogContent 缺 steps：{d['slug']}")
            indent = m.group(1)
            lines = [indent + "stepsZh: ["]
            for st in d["steps"]:
                lines.append(f'{indent}  {{ name: {ts_str(st["name"])}, text: {ts_str(st["text"])} }},')
            lines.append(indent + "],")
            seg = seg[: m.end()] + eol + eol.join(lines) + seg[m.end():]
        s = s[:i] + seg + s[end:]
    io.open(content_path, "w", encoding="utf-8", newline="").write(s)

    # ── blogFaq.ts ──
    faq_path = os.path.join(ROOT, "src", "app", "data", "blogFaq.ts")
    s = io.open(faq_path, encoding="utf-8", newline="").read()
    eol = eol_of(s)
    for d in posts:
        start = s.find(f'  "{d["slug"]}": [')
        if start < 0:
            sys.exit(f"blogFaq 未找到条目：{d['slug']}")
        end = s.find("\n  ],", start)
        seg = s[start:end]
        en = re.findall(r'^\s*question: "(.*)",\r?\n\s*answer: "(.*)",\r?$', seg, re.M)
        if len(en) != len(d["faq"]):
            sys.exit(f"blogFaq 条目数与中文 FAQ 不匹配：{d['slug']} ({len(en)} vs {len(d['faq'])})")
        if "questionEn:" in seg:
            print(f"  · blogFaq {d['slug']} 已写入过，跳过")
            continue
        lines = [f'  "{d["slug"]}": [']
        for (q_en, a_en), (q_zh, a_zh) in zip(en, d["faq"]):
            lines.append("    {")
            lines.append(f"      question: {ts_str(q_zh)},")
            lines.append(f"      answer: {ts_str(a_zh)},")
            lines.append(f"      questionEn: {ts_str(q_en)},")
            lines.append(f"      answerEn: {ts_str(a_en)},")
            lines.append("    },")
        s = s[:start] + eol.join(lines) + s[end:]
    io.open(faq_path, "w", encoding="utf-8", newline="").write(s)

    print(f"\n已为 {len(posts)} 篇补齐中文字段")


if __name__ == "__main__":
    main()
