"""
修正 Article #9 的 blog.ts metadata
"""
import re

path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

slug = 'ai-short-drama-voice-music-image-rights-tool-licenses'

updates = {
    'titleZh': '"AI 短剧声音/音乐/图像授权清单：你需要哪些许可才能用？（2026）"',
    'excerpt': '"Runway free-tier is the only major video generator allowing commercial use (2026). Suno\'s Sept 3 TOS change restricted free-tier songs to personal use only. Udio allows ZERO commercial use on any plan. This article is the tool-by-tool license matrix every AI short drama creator needs."',
    'excerptZh': '"Runway 免费版是唯一允许商用的主流视频生成工具（2026）。Suno 9 月 3 日 TOS 变更把免费版歌曲锁死为个人使用。Udio 所有计划均零商用许可。本文是 AI 短剧创作者必备的工具授权矩阵。"',
    'seoTitle': '"AI Short Drama Tool License Matrix 2026 | Voice, Music, Video Rights | Lollipop Drama"',
    'seoDescription': '"Exact commercial-use licenses for Runway, Kling, Sora 2, ElevenLabs, Suno, Udio, Epidemic Sound. 2026 TOS changes that kill monetization. Decision guide for common creator scenarios."',
    'keyTakeaways': '[\n      "Runway is the only major video generator allowing commercial use on FREE tier (Runway TOS Oct 23, 2026).",\n      "Suno Sept 3, 2026 TOS change: free-tier songs are Suno property; commercial use requires paid-plan download (Pro $10/mo).",\n      "Udio allows ZERO commercial use on ANY plan (Nov 12, 2025 TOS revision, still in effect 2026).",\n      "ElevenLabs Instant Voice Cloning: can clone ANY voice but MUST get written consent. Professional Voice Cloning: can ONLY clone your own voice.",\n      "Epidemic Sound / Artlist issue sync licenses, never ownership — they always retain rights to the music itself.",\n    ]',
    'keyTakeawaysZh': '[\n      "Runway 是唯一免费版允许商用的主流视频生成工具（Runway TOS 2026.10.23）。",\n      "Suno 9 月 3 日 TOS 变更：免费版歌曲归 Suno 所有；商用需付费计划下载（Pro $10/月）。",\n      "Udio 所有计划均零商用许可（2025.11.12 TOS 修订，2026 仍有效）。",\n      "ElevenLabs Instant Voice Cloning 可克隆任何声音但必须书面同意；Professional 只能克隆自己的。",\n      "Epidemic Sound / Artlist 发 sync 许可，你永远不拥有音乐本身。",\n    ]',
}

def replace_field(content, slug, field, new_value):
    slug_pattern = re.compile(rf'(\n\s*\{{\s*\n\s*slug:\s*"{re.escape(slug)}",.*?)(\n\s*\}},\s*\n)', re.DOTALL)
    m = slug_pattern.search(content)
    if not m:
        print(f"  WARN: object for {slug} not found")
        return content
    obj_start = m.group(1)
    obj_end = m.group(2)
    field_pattern = re.compile(
        rf'(\n\s*{re.escape(field)}:\s*)(?:"[^"]*"|\[[^\]]*\])',
        re.DOTALL
    )
    new_obj_start, count = field_pattern.subn(lambda f: f.group(1) + new_value, obj_start)
    if count == 0:
        print(f"  WARN: field '{field}' not found")
    else:
        print(f"  ✅ {field} ({count} occurrence)")
    return content[:m.start(1)] + new_obj_start + obj_end + content[m.end(2):]

print(f"=== Fixing {slug} ===")
for field, val in updates.items():
    content = replace_field(content, slug, field, val)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone!")
