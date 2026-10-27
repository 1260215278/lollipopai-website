"""
批量修正三个新文章的 blog.ts metadata（excerpt/titleZh/seoDescription/keyTakeaways）
"""
import re

path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

updates = {
    'ai-short-drama-organic-growth-free-traffic-no-paid-ads': {
        'titleZh': '"零预算涨粉：AI 短剧如何在不投广告的情况下获得观众（2026）"',
        'excerpt': '"Grow an AI short drama audience without paid ads: short-form clip repurposing, Reddit/Discord community seeding, remix-optimized cliffhangers, and Lollipop Drama native discovery. Zero Facebook, zero Google, zero ad spend."',
        'excerptZh': '"不花一分钱也能涨 AI 短剧观众：短视频切片二创、Reddit/Discord 社群播种、为 remix 优化的悬念设计、Lollipop Drama 原生发现引擎。零广告预算。"',
        'seoTitle': '"Organic AI Short Drama Growth: Zero Paid Ads, Real Results (2026) | Lollipop Drama"',
        'seoDescription': '"How to grow an AI short drama audience without paid ads in 2026. Platform-specific playbooks, real creator case studies, and 2026 organic benchmark data."',
        'keyTakeaways': '[\n      "Short-form clip repurposing (30-60s hooks to TikTok/Shorts) drives 70-80% of organic traffic to AI drama series in 2026 (Reelytics).",\n      "Community seeding on 2-3 niche subreddits or Discord servers can reach 5,000-15,000 target viewers with zero spend.",\n      "Remix-optimized cliffhangers (end clips mid-sentence) increase return view rate by 3x vs full-episode uploads.",\n      "Lollipop Drama\'s native discovery engine prioritizes series with 3+ episodes and consistent release cadence.",\n    ]',
        'keyTakeawaysZh': '[\n      "短视频切片二创（30-60 秒钩子发 TikTok/Shorts）2026 年驱动 AI 短剧 70-80% 自然流量（Reelytics）。",\n      "2-3 个垂直 Reddit 子版或 Discord 服务器播种，零成本触达 5,000-15,000 目标观众。",\n      "为 remix 优化的悬念（句子中间截断）回流观看率比整集上传高 3 倍。",\n      "Lollipop Drama 原生发现引擎优先推荐 3 集以上、发布节奏稳定的剧集。",\n    ]',
    },
    'short-drama-release-calendar-episode-frequency-cliffhangers-season-planning': {
        'titleZh': '"短剧发布排期指南：更新频率、悬念设计与季播规划（2026）"',
        'excerpt': '"Release cadence tripled 48-hour retention: Mon/Wed/Fri weekly drops beat daily dumps and full-season dumps by 2-3x (Reelytics). Where to place cliffhangers, 12-week production calendar, platform-specific optimal frequencies."',
        'excerptZh': '"发布节奏能让 48 小时留存翻 3 倍：周一/三/五周更比日更和整季一次性上线留存高 2-3 倍（Reelytics）。悬念放置位置、12 周制作日历、各平台最佳更新频率。"',
        'seoTitle': '"Short Drama Release Calendar: Episode Frequency & Cliffhangers (2026) | Lollipop Drama"',
        'seoDescription': '"Short drama release strategy 2026: optimal episode frequency, cliffhanger placement, season planning, and platform cadence. Reelytics 48-hour retention benchmark data."',
        'keyTakeaways': '[\n      "Mon/Wed/Fri 3x weekly cadence delivers +275% 48-hour retention vs full-season dump-day (Reelytics 2026).",\n      "Cliffhanger placement: Episode 1 (launch hook), Episode 3 (first paywall wall), Episode finale (season 2 tease).",\n      "Platform preference: Lollipop prefers weekly, ReelShort favors daily, TikTok/Shorts benefit from daily short clips.",\n      "48-hour cliffhanger window: paywall episodes land 48h after previous cliffhanger for max conversion.",\n    ]',
        'keyTakeawaysZh': '[\n      "周一/三/五 周更比整季一次性上线 48 小时集间留存高 +275%（Reelytics 2026）。",\n      "悬念最该放三个位置：第 1 集（上线钩子）、第 3 集（第一道付费墙）、季终（第二季引子）。",\n      "平台偏好：Lollipop 喜欢周更、ReelShort 偏好日更、TikTok/Shorts 每天 1-2 条短切片辅助。",\n      "48 小时悬念窗口：付费集在上一集悬念后 48 小时上线，转化率最高。",\n    ]',
    },
    'ai-short-drama-pitch-deck-format-audience-budget-distribution': {
        'titleZh': '"短剧项目提案与 Pitch Deck：格式、受众、预算与发行计划（2026）"',
        'excerpt': '"9-slide mobile-first pitch deck for short drama greenlight: logline, market gap, audience persona, episode arc, budget, distribution, AI tools, team, financial projection. ReelShort acceptance rate 12-18% with this structure vs 3% without (Reelytics)."',
        'excerptZh': '"短剧 greenlight 用 9 张图移动端 pitch deck：Logline、市场缺口、受众画像、集数大纲、预算、发行计划、AI 工具栈、团队、财务预测。Reelytics 数据：用这个结构 ReelShort 接受率 12-18%，不用只有 3%。"',
        'seoTitle': '"Short Drama Pitch Deck: Greenlight Guide 2026 | Lollipop Drama"',
        'seoDescription': '"How to pitch a short drama to ReelShort, DramaBox, or Lollipop Drama in 2026. 9-slide deck structure, acceptance rates, budget template, and real pitch examples."',
        'keyTakeaways': '[\n      "9-slide structured pitch deck increases ReelShort/DramaBox acceptance from 3% to 12-18% (Reelytics Q1 2026).",\n      "Mandatory slides: character bible, comparable shows (3-5), audience persona with real data, budget breakdown.",\n      "Financial projection: $2,000 AI-native budget breaks even at 15,000 Lollipop views (80% share) vs 40,909 ReelShort views (35%).",\n      "Common killers: deck too long (>15 slides), vague audience, no distribution plan beyond one platform.",\n    ]',
        'keyTakeawaysZh': '[\n      "9 张图结构化 pitch deck 把 ReelShort/DramaBox 接受率从 3% 提到 12-18%（Reelytics 2026 Q1）。",\n      "必须的幻灯片：角色圣经、对标剧 3-5 部、有真实数据的受众画像、逐项预算拆解。",\n      "财务预测：$2,000 预算在 Lollipop（80% 分成）需 15,000 观看回本，ReelShort（35%）需 40,909。",\n      "常见杀手：deck 太长、模糊受众、只发一个平台。",\n    ]',
    },
}

def replace_field(content, slug, field, new_value):
    """在 slug 对象里替换 field 的值。"""
    # 找到 slug 对象
    slug_pattern = re.compile(rf'(\n\s*\{{\s*\n\s*slug:\s*"{re.escape(slug)}",.*?)(\n\s*\}},\s*\n)', re.DOTALL)
    m = slug_pattern.search(content)
    if not m:
        print(f"  WARN: object for {slug} not found")
        return content
    
    obj_start = m.group(1)
    obj_end = m.group(2)
    
    # 在 obj_start 里替换 field: "old_value" → field: new_value
    # Match: field: "anything" or field: ["..."]
    field_pattern = re.compile(
        rf'(\n\s*{re.escape(field)}:\s*)(?:"[^"]*"|\[[^\]]*\])',
        re.DOTALL
    )
    
    new_obj_start, count = field_pattern.subn(lambda f: f.group(1) + new_value, obj_start)
    
    if count == 0:
        print(f"  WARN: field '{field}' not found in {slug}")
    else:
        print(f"  ✅ {slug}.{field} replaced ({count} occurrence)")
    
    return content[:m.start(1)] + new_obj_start + obj_end + content[m.end(2):]

for slug, fields in updates.items():
    print(f"\n=== Fixing {slug} ===")
    for field, new_val in fields.items():
        content = replace_field(content, slug, field, new_val)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone! blog.ts metadata fixed.")
