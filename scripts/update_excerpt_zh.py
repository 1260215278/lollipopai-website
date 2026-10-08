import re

blog_path = r'c:\Users\Administrator\Documents\lollipop\src\app\data\blog.ts'

with open(blog_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Map of slug -> new excerptZh (60-120 Chinese characters)
NEW_EXCERPTS_ZH = {
    "pixverse-canvas-vs-higgsfield-vs-ltx-vs-lollipop":
        "2026年四款主流AI视频生成工具横向对比：Pixverse Canvas、Higgsfield、LTX Studio与Lollipop Drama，从画质、动作连贯性、角色一致性、批量生成能力与成本效率五个维度实测，附选型决策矩阵。",
    "ceo-romance-revenge-short-drama-prompt-pack":
        "精选120条CEO爱情复仇短剧AI提示词，涵盖霸总人设、契约婚姻、身份反转、复仇打脸等8大经典套路，适配Midjourney、Runway与Lollipop Drama三大平台，开箱即用。",
    "multi-character-interaction-physics-in-ai-drama":
        "AI短剧多角色同框与复杂物理交互的实战修复指南：手部穿模、肢体融合、多人接触、布料碰撞四大高频问题的诊断流程与分层解决方案，从免费重绘到后期补帧逐步升级。",
    "ai-drama-lip-sync-and-facial-expressions":
        "2026年AI短剧口型同步与微表情制作全解：从Wav2Lip、HeyGen到Synthesia的8款工具实测对比，含中文口型精度评测、表情控制参数调校与逐集质检清单。",
    "webtoon-to-ai-micro-drama-workflow":
        "条漫转竖屏动态短剧的完整工作流：一部10话条漫如何通过分镜拆解、动态化处理、配音配乐变成20集可发布的微漫剧，附工时估算与质量控制点。",
    "hook-architecture-and-three-second-rule-in-short-dramas":
        "短剧3秒黄金留存法则深度解析：8种悬念钩子结构的设计原理与适用场景，从开场镜头、台词节奏到BGM切入时机的毫秒级编排，附爆款钩子拆解案例。",
    "vertical-cinematography-9-16-composition-rules":
        "9:16竖屏电影级构图规范手册：三分法、视线引导、框架式构图、负空间等10大构图原则在竖屏中的适配方法，附AI提示词模板与常见构图错误避坑指南。",
    "short-drama-foley-sfx-and-sound-design-guide":
        "AI短剧声音设计完整指南：20种拟音音效库、三层配乐对位表、毫秒级音画同步工作流，从环境音铺垫、情绪音效到高潮爆点的分层制作方法论。",
    "100-episode-ai-drama-pipeline-and-qc-checklist":
        "百集级AI短剧工业化生产管线：从创意池到上线发布的7大阶段、21个质检节点与资产版本控制系统，解释为什么便宜的修改一定要留在便宜的阶段。",
    "global-ai-short-drama-monetization-roi-model":
        "2026年出海AI短剧变现测算与分成模型：欧美与东南亚两大市场的用户付费率、ARPU、推广ROI对比，广告+订阅+打赏三层变现结构的收入拆解与回本周期。",
    "ai-short-drama-pillar-guide":
        "AI短剧制作完全指南（2026版）：从零基础入门到专业制作的全景式教程，涵盖剧本生成、角色设计、视频制作、配音剪辑、发布变现全流程，附工具清单与学习路径。",
    "ai-short-drama-industry-data-report-2026":
        "2026年AI短剧行业数据报告：市场规模、用户画像、内容品类分布、平台格局与增长趋势，基于全球15个主要平台的公开数据与行业调研整理。",
    "ai-short-drama-faq-2026":
        "AI短剧制作60问全解：从工具选择、成本预算、版权合规到发布变现的常见问题一站式解答，适合零基础入门者快速建立完整认知框架。",
}

updated = 0
for slug, new_excerpt in NEW_EXCERPTS_ZH.items():
    # Find the entry
    pattern = f'slug: "{slug}",'
    idx = content.find(pattern)
    if idx == -1:
        print(f'NOT FOUND: {slug}')
        continue
    
    # Find excerptZh in this entry
    end = content.find('\n  },', idx)
    block = content[idx:end]
    
    m = re.search(r'excerptZh:\s*"', block)
    if not m:
        print(f'NO EXCERPTZH: {slug}')
        continue
    
    # Find the closing quote (handle escaped quotes)
    excerpt_start_in_block = m.end()
    excerpt_start_abs = idx + excerpt_start_in_block
    
    # Find end of string (unescaped " followed by , or newline)
    i = 0
    while i < 2000:  # safety limit
        pos = content.find('"', excerpt_start_abs + i)
        if pos == -1 or pos >= idx + end:
            break
        # Check if it's escaped
        if content[pos-1] == '\\':
            i = pos - excerpt_start_abs + 1
            continue
        # Found closing quote
        old_excerpt = content[excerpt_start_abs:pos]
        new_full = f'excerptZh: "{new_excerpt}"'
        old_full_start = content.rfind('excerptZh:', 0, excerpt_start_abs)
        old_full_end = pos + 1  # include closing quote
        
        if len(old_excerpt) < 50 or '，' not in old_excerpt:  # likely just a title
            content = content[:old_full_start] + new_full + content[old_full_end:]
            updated += 1
            print(f'UPDATED: {slug} ({len(old_excerpt)}ch -> {len(new_excerpt)}ch)')
        else:
            print(f'SKIP (already good): {slug} ({len(old_excerpt)}ch)')
        break

with open(blog_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\nTotal updated: {updated}/{len(NEW_EXCERPTS_ZH)}')
