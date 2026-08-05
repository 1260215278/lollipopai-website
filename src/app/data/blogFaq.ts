export interface FaqItem {
  question: string;
  answer: string;
  questionEn?: string;
  answerEn?: string;
}

/**
 * 博客文章的 FAQ 内容（双语 EN/ZH，与详情页正文语言一致）。
 *
 * 用途：
 *  1. 在文章详情页渲染可见的「常见问题」区块（GEO 友好：问答须为页面可见文本）。
 *  2. 生成 FAQPage 结构化数据（schema.org/FAQPage），显著提升在 AI 回答中被引用的概率。
 *
 * 注意：本文件刻意独立于 blog.ts —— 重新运行 _gen_blog_ts.py 生成 blog.ts 时不会覆盖此处 FAQ。
 * 新增文章时，请同步在此按 slug 补 FAQ（中文 + 英文）。
 */
export const blogFaq: Record<string, FaqItem[]> = {
  "ai-script-storyboard": [
    {
      question: "AI生成的剧本会不会有抄袭风险？",
      answer: "理论上存在可能，因为大语言模型基于海量数据训练，生成内容可能与训练数据中的某些片段相似。但实际风险相对可控——建议用查重工具（Copyscape、Turnitin）对AI生成的初稿进行检测。AI生成的是初稿框架，原创修改才是真正的版权护城河。",
      questionEn: "Does AI-generated script risk plagiarism?",
      answerEn: "Theoretically possible since LLMs are trained on massive datasets and may generate content similar to training data. In practice, use plagiarism checkers (Copyscape, Turnitin) on AI drafts. Your original modifications are the real copyright moat — not the AI output itself.",
    },
    {
      question: "AI能帮我想出神反转这种高光情节吗？",
      answer: "AI擅长在已有框架内做排列组合，而神反转往往来自创作者对生活和人性的独特洞察。可以把AI当作超快的头脑风暴伙伴——让它列出十个可能的发展方向，你从中挑选或组合，往往能得出比单纯AI输出更有张力的结果。",
      questionEn: "Can AI come up with plot twists on its own?",
      answerEn: "AI excels at permutations within existing frameworks, but \'wow\' plot twists usually come from a creator\'s unique insight into human nature. Think of AI as a brainstorming partner — let it list ten possible directions, then you select and combine. The result often has more tension than pure AI output.",
    },
    {
      question: "分镜和剧本可以同时让AI做吗？",
      answer: "建议分步进行。先用AI敲定剧本终稿，再基于定稿生成详细分镜。如果剧本还在反复修改阶段就去做分镜，你会发现分镜也跟着要重做，效率反而更低。",
      questionEn: "Should I have AI do script and storyboard simultaneously?",
      answerEn: "No — do them in sequence. Finalize the script first, then generate the storyboard from the locked draft. If the script is still being revised, the storyboard will need redoing too, wasting effort.",
    }
  ],
  "ai-video-quality": [
    {
      question: "AI生成的视频和实拍相比，画质差距有多大？",
      answer: "静态镜头（人物对话、表情特写）差距已经很小，经验丰富的观众需要仔细辨认才能发现是AI生成。真正的差距在于复杂动作序列和物理交互——实拍中自然的肢体碰撞、水花、布料飘动等效果，AI处理起来仍不够自然。这也是为什么目前大量成功的AI短剧以文戏为主，动作戏依赖后期特效补充。",
      questionEn: "How does AI-generated video quality compare to real filming?",
      answerEn: "For static shots (dialogue, close-ups), the gap is now very small — experienced viewers need to look closely to tell. The real gap is in complex action sequences and physical interactions — natural collisions, water splashes, fabric movement still trip up AI. This is why most successful AI dramas are dialogue-heavy, with action scenes supplemented by VFX.",
    },
    {
      question: "同一个角色的镜头，为什么每次生成的脸都有差异？",
      answer: "这是AI生成模型的固有特性——不指定确定性种子（Seed）的情况下，每次生成都是概率采样，结果会有随机波动。解决方案：在需要保持角色一致性的项目中，固定Seed值，或者使用平台的\'角色资产\'功能，让系统在同一角色的所有镜头中使用一致的参考特征。",
      questionEn: "Why does the same character\'s face look different in every generated shot?",
      answerEn: "This is a fundamental property of generative models — without specifying a fixed seed, each generation is probabilistic sampling with random variation. Fix this by setting a consistent seed value for a character\'s shots, or use your platform\'s \'character asset\' feature to lock character features across all shots.",
    },
    {
      question: "AI视频生成现在能商用吗？",
      answer: "可以，但有前提。你生成的内容必须确认两个版权来源：一是用于训练的工具本身是否获得了训练数据的合法授权（主流商业工具如OpenAI、Midjourney已有相应授权协议）；二是你的输出内容本身是否存在侵权风险（避免使用明确指向真实人物的提示词）。",
      questionEn: "Is AI-generated video commercially usable?",
      answerEn: "Yes, with caveats. You need to verify two copyright sources: (1) whether your tool\'s training data is properly licensed (major commercial tools like OpenAI, Midjourney have coverage), and (2) whether your output avoids infringing on identifiable real persons or copyrighted references.",
    }
  ],
  "ai-editing-tools": [
    {
      question: "AI剪辑工具能完全替代人工剪辑师吗？",
      answer: "不能，至少目前不行。AI擅长的是识别、分类和重复性操作，但\'剪辑节奏感\'和\'情绪引导\'是剪辑师的核心价值——什么时候该切、什么时候该留长、怎么通过镜头排列制造情绪张力，这些判断仍需要人来把控。AI是剪辑师的效率工具，不是替代者。",
      questionEn: "Can AI editing tools fully replace human editors?",
      answerEn: "No — not yet. AI excels at recognition, classification, and repetitive tasks, but \'editing rhythm\' and \'emotional direction\' are a human editor\'s core value: knowing when to cut, when to hold a shot longer, how to arrange clips to build tension. AI is an editor\'s efficiency tool, not a replacement.",
    },
    {
      question: "自动生成的字幕准确率到底有多高？",
      answer: "在标准普通话、录音清晰的环境下，主流工具的识别准确率通常在93%–97%。主要出错场景包括：人名/专有名词、方言词汇、背景音乐覆盖了人声时的识别困难。重要作品建议预留一轮人工校对时间。",
      questionEn: "How accurate are auto-generated subtitles?",
      answerEn: "In standard Mandarin with clean audio, mainstream tools achieve 93%–97% accuracy. Main error sources: proper nouns, dialect words, and speech obscured by background music. For important releases, budget one human review pass.",
    },
    {
      question: "AI调色能做出和专业调色师一样的电影感吗？",
      answer: "可以接近，但有边界。AI预设能提供很好的视觉基调，但在复杂光线下的人工判断（如\'让阴影保留一些细节但不过亮\'这类精细控制）仍需要人工介入。更现实的目标是：AI调色帮你完成80%的基础工作，你用20%的时间做精细调整，总体效率提升3–4倍。",
      questionEn: "Can AI color grading match professional colorists for cinematic quality?",
      answerEn: "Getting close, but with limits. AI presets provide excellent baselines, but nuanced decisions — \'preserve shadow detail without making it too bright\' — still need human judgment. The realistic target: AI handles 80% of the groundwork, you spend 20% of the time on fine-tuning — a 3–4x efficiency gain overall.",
    }
  ],
  "ai-production-cost": [
    {
      question: "AI短剧和传统短剧的质量差距有多大？",
      answer: "取决于内容类型。对于对话密集、文戏为主的短剧（占市场主流的甜宠、情感、悬疑类），AI短剧的质量已经接近专业水准。主要差距在于：复杂动作场景、物理交互效果、以及\'电影感\'调色。另一个现实是：观众在竖屏短剧的观看场景下，对画质的要求本身低于长视频平台，所以差距感知并不明显。",
      questionEn: "How does AI drama quality compare to traditionally produced drama?",
      answerEn: "It depends on content type. For dialogue-heavy, character-driven drama (romance, emotional, mystery — the market majority), AI drama quality is now close to professional standards. Main gaps: complex action sequences, physical interactions, and \'cinematic\' color grading. In the vertical short-form context, viewers have lower quality expectations than on long-form platforms, so the perceived gap is smaller.",
    },
    {
      question: "AI制作短剧的平均ROI是多少？",
      answer: "目前行业数据不足，但有参考点：有创作者单部AI短剧通过平台分账获得数万元收入，也有创作者投入数千元后几乎没有回报。ROI的决定因素不是AI工具本身，而是内容质量和分发能力。AI降低的是制作成本，但不能替代内容创意和运营策略。",
      questionEn: "What\'s the average ROI for AI-produced short dramas?",
      answerEn: "Hard data is still scarce, but patterns emerge: creators have earned tens of thousands from single AI dramas via platform revenue share, while others鎶曞叆 thousands with near-zero return. ROI is determined by content quality and distribution strategy — not the AI tools themselves. AI reduces production cost but can\'t replace creative vision and marketing strategy.",
    },
    {
      question: "小团队（1–2人）能否独立完成AI短剧？",
      answer: "可以，但需要接受一个事实：你需要同时承担创意判断、AI工具操作和内容运营三个角色。1–2人的情况下，建议优先选择集成度高的一站式平台（如Lollipop.im），减少工具切换的学习成本和个人精力消耗。",
      questionEn: "Can a small team of 1–2 people produce an AI drama independently?",
      answerEn: "Yes — with realistic expectations. You\'ll be playing three roles simultaneously: creative director, AI tool operator, and content distributor. For 1–2 person teams, prioritize highly integrated all-in-one platforms (like Lollipop.im) to minimize tool-switching overhead and cognitive load. Lollipop.im offers a complete starter plan for solo creators, covering script to final cut on a single platform — no need to manage multiple tool subscriptions simultaneously.",
    }
  ],
  "ai-rendering-pipeline": [
    {
      question: "AI渲染失败或出错的比例有多高？",
      answer: "这个问题取决于工具成熟度和内容复杂度。头部平台的单镜头渲染成功率在85%–95%之间，失败主要集中在：包含复杂物理交互的动作镜头、手部/手指特写、长时间连续镜头。失败的镜头通常可以通过调整提示词、降低规格或局部重绘来修复。",
      questionEn: "What\'s the AI rendering failure rate?",
      answerEn: "Depends on tool maturity and content complexity. Leading platforms report 85%–95% single-shot render success rates. Failures cluster around: complex physical interaction shots, hand/finger close-ups, and very long continuous sequences. Failed shots can usually be fixed by adjusting prompts, lowering specs, or using inpainting.",
    },
    {
      question: "渲染高峰期需要排队等多久？",
      answer: "大多数云端平台的高峰期（通常是工作日白天10:00–18:00）可能出现10–30分钟的排队等待。凌晨和深夜时段算力相对空闲。建议：有时间弹性的任务安排在夜间提交，紧急任务使用平台提供的\'优先渲染\'通道（通常加收20%–50%费用）。",
      questionEn: "How long is the queue during peak rendering hours?",
      answerEn: "Most cloud platforms see 10–30 minute queues during peak hours (typically 10am–6pm weekdays). Overnight and late night are much lighter. Strategy: schedule flexible tasks at night, use \'priority rendering\' lanes for urgent jobs (typically 20%–50% surcharge).",
    },
    {
      question: "本地部署AI工具大概需要多少预算？",
      answer: "一套能稳定运行1080P AI视频生成的入门级工作站（RTX 4090 + 64GB内存 + 高性能CPU）成本约3–5万元。如果要同时并行处理多个任务，需要多卡配置，成本快速上升到8–15万元。这个投入需要配合高频使用（每月100+分钟产出）才能在一年内摊薄成本。",
      questionEn: "What\'s the budget for local AI tool deployment?",
      answerEn: "An entry-level workstation capable of stable 1080P AI video generation (RTX 4090 + 64GB RAM + high-performance CPU) costs approximately $420–$700 USD. Multi-GPU parallel processing for 4K or heavy workloads pushes to $1,100–$2,100 USD. This investment only breaks even within a year if you\'re producing 100+ minutes monthly — impractical for most small teams.",
    }
  ],
  "ai-short-drama-complete-guide": [
    {
      question: `AI短剧制作成本是多少？`,
      answer: `根据Lollipop.im内容团队对2026年Q2行业项目的实测统计，一部10集×5分钟的竖屏AI短剧总成本约为5,000–20,000元人民币（含工具订阅、人工和版权费用）。传统制作同等内容量通常需要50,000–250,000元，差距在10倍以上。`,
      questionEn: `How much does it cost to produce an AI short drama?`,
      answerEn: `Based on Lollipop.im's Q2 2026 industry benchmarking data, producing a 10-episode x 5-minute vertical short drama costs approximately $700–$2,800 USD (including tool subscriptions, labor, and licensing). Traditional production of equivalent content typically runs $7,000–$35,000—a 10x difference. The exact breakdown: AI tool subscriptions ($150–$500/month), labor ($400–$1,100/project), and licensed assets ($70–$430).`,
    },
    {
      question: `制作AI短剧需要哪些工具组合？`,
      answer: `主流工具链：剧本（通义千问/文心一言）→ 分镜（Midjourney/百炼全妙）→ 视频生成（Seedance 2.0/Runway Gen-3）→ 配音（讯飞智作/Resemble）→ 剪辑（剪映/Adobe Premiere Sensei）→ 字幕（讯飞听见/Whisper）。集成平台如Lollipop.im可一站式完成全流程，减少工具切换。`,
      questionEn: `What tools do I need to make an AI short drama?`,
      answerEn: `The standard toolchain: script (Claude/GPT-4/Gemini) → storyboard (Midjourney/Leonardo AI) → video generation (Runway Gen-3/Seedance 2.0/Pika) → voiceover (ElevenLabs/Resemble) → editing (CapCut/Adobe Premiere) → subtitles (Whisper/Rev). Integrated platforms like Lollipop.im handle the full pipeline in one place, eliminating tool-switching overhead.`,
    },
    {
      question: `AI短剧有哪些必须注意的版权风险？`,
      answer: `三大高风险区：肖像权（不得使用真实明星形象，AI换脸必须取得本人授权或使用虚构角色）、版权音乐（背景音乐需来自商用授权库如Soundraw/AIVA，或平台内置授权音乐）、AI生成内容的版权归属（建议保留提示词工程文档作为独创性证明，合作合同中明确AI辅助比例）。`,
      questionEn: `What copyright issues should I watch out for with AI short dramas?`,
      answerEn: `Three high-risk areas: Portrait rights (never use celebrity likenesses without explicit written consent), copyrighted music (all background tracks must come from commercial-licensed libraries like Soundraw or AIVA, or platform-approved BGM), and AI content authorship (keep detailed Prompt Engineering logs as proof of creative input; specify AI-assist ratios in all contracts). According to the U.S. Copyright Office's 2023 guidance on AI-generated works, human creative direction determines copyright eligibility.`,
    }
  ],
  "ai-copyright-compliance": [
    {
      question: `AI生成的短剧内容，版权归谁？`,
      answer: `中国现行法律框架下，AI作为工具生成的内容，如有创作者个人的独创性投入，著作权归人类使用者所有。'独创性投入'有明确边界：单纯给AI发指令'写一个关于X的故事'不构成独创性投入；你对AI输出的选择、修改、编排和深化，则可以。建议做法：保留提示词工程文档（Prompt Engineering记录）作为独创性证明，在对外合作时合同中明确约定AI辅助比例和权属分配。`,
      questionEn: `Who owns the copyright to AI-generated short drama content?`,
      answerEn: `Under current U.S. Copyright Office guidance (March 2023), works generated by AI are only copyrightable to the extent they reflect human creative expression. The critical distinction: merely prompting an AI to 'write a story about X' does not constitute sufficient creative input. However, your selection, modification, arrangement, and deepening of AI outputs does. Best practice: maintain detailed Prompt Engineering logs (original prompts, AI outputs, human revision records) as proof of creative authorship. Specify AI-assist ratios explicitly in all co-production contracts.`,
    },
    {
      question: `用AI生成和明星/真实人物相似的角色，违法吗？`,
      answer: `高风险行为，绝对不建议。《民法典》第1018条规定自然人享有肖像权，未经本人同意不得制作、使用、公开其肖像。据经济参考报2025年报道，AI短剧领域已出现多起使用知名演员形象引发的侵权纠纷，监管部门已将'深度伪造'内容列为重点整治对象，平台层面（抖音、快手、微信视频号）已部署AI换脸检测模型。换脸内容一旦被识别将面临下架或封号，单案赔偿金额从数万元到数十万元不等。`,
      questionEn: `Is it illegal to create AI characters that look like real celebrities?`,
      answerEn: `This is a high-risk activity—essentially never worth it. In the U.S., using a celebrity's likeness without consent may violate state right of publicity laws (California Civil Code § 3344.1, New York Civil Rights Law § 50–51). Globally, the EU AI Act (2024) classifies non-consensual deepfake generation as a prohibited practice. Platform-level: TikTok, YouTube, and Instagram have all deployed AI likeness detection. Violations result in content removal, channel strikes, and potential civil liability. Single-case settlements have ranged from $10,000 to $500,000+ depending on jurisdiction and damage.`,
    },
    {
      question: `AI短剧里用的背景音乐，需要获得授权吗？`,
      answer: `绝大多数情况下，需要。背景音乐受'录音版权+词曲版权'双重保护，即使只有30秒也受版权保护。使用未授权音乐的商业发布行为构成版权侵权。合规方案：使用商用版权音乐库（Soundraw、AIVA、网易云音乐商用版、腾讯音乐商用）或平台内置BGM库（抖音、快手等平台已获得商业授权的音乐）。AI原创生成的音乐（如Suno AI生成的曲子）一般无此问题，但仍需确认发布渠道的额外要求。`,
      questionEn: `Do I need a license for background music in my AI short drama?`,
      answerEn: `In virtually all cases, yes. Background music is protected by both recording copyright and composition copyright (the 'master + publishing' dual-license structure). Even a 30-second clip requires clearance. Using unlicensed music in commercial distribution constitutes copyright infringement. Compliant options: use commercial-licensed music libraries (Soundraw, Artlist, AIVA—all grant commercial licenses with subscription), use platform-approved BGM (TikTok's music library is pre-cleared for creator use), or commission original AI-generated music (Suno AI outputs are generally cleared for commercial use, but verify each platform's additional requirements before publishing).`,
    },
    {
      question: `AI换脸（Deepfake）技术用在短剧里有什么风险？`,
      answer: `风险极高，包含法律、平台和伦理三个层面，均为高风险。法律层面：《民法典》第1018–1023条规定，未经授权的AI换脸涉嫌侵犯肖像权，情节严重可能构成刑事责任。平台层面：抖音、快手、微信视频号等主流平台已部署AI换脸检测模型，换脸内容一旦被识别将面临下架或封号。伦理层面：深度伪造内容可能引发公众对信息真实性的信任危机，对品牌造成不可逆的声誉损失。`,
      questionEn: `What are the risks of using deepfake/AI face-swap technology in short dramas?`,
      answerEn: `Three extreme risk categories—legal, platform, and ethical—making this a recommended hard stop. Legal: non-consensual deepfakes violate right of publicity laws in most U.S. states and GDPR Article 22 provisions in the EU; criminal liability is possible in aggravated cases. Platform: TikTok, YouTube, Instagram, and Snapchat have all deployed deepfake detection; violations trigger content removal, strikes, or permanent bans. Ethical: deepfake content erodes public trust in media authenticity, creating reputational damage that extends well beyond legal consequences.`,
    },
    {
      question: `团队合作制作AI短剧时，版权如何分配？`,
      answer: `建议在项目启动前签署版权协议，明确：各方的AI辅助比例（如'剧本AI辅助程度30%、视频AI辅助程度70%'）；各环节的版权归属（谁拥有剧本版权、谁拥有视频版权）；收益分配比例；违约责任。协议模板可参考中国版权保护中心发布的《AI辅助创作版权协议指引》或咨询知识产权律师。`,
      questionEn: `How should copyright be split in a team producing an AI short drama?`,
      answerEn: `Sign a copyright agreement before production starts. Key clauses: AI-assist ratios per stage (e.g., 'script: 30% AI-assisted, video: 70% AI-assisted'), ownership of each deliverable (who owns the script, who owns the final video), revenue split percentages, and breach of contract provisions. Templates are available from the U.S. Copyright Office's guidance on AI-generated works or through WIPO (World Intellectual Property Organization) resources. Consult an entertainment/IP attorney for jurisdiction-specific advice.`,
    },
    {
      question: `如果AI生成的内容和已有作品高度相似，算抄袭吗？`,
      answer: `理论上存在可能。大语言模型的生成过程本质上是概率采样，如果训练数据中包含某部作品的片段，生成内容可能与该作品高度相似。实际判断标准：看是否'实质性相似'——即整体表达、情节结构、人物关系是否高度重合，而非仅看单个词汇或通用情节。防御措施：发布前使用Copyscape、Turnitin等查重工具检测；在创意层面做足够的原创性修改；保留创作过程记录（灵感来源、修改版本等）作为非抄袭证据。`,
      questionEn: `If AI-generated content is highly similar to an existing work, is that plagiarism?`,
      answerEn: `Possibly. LLMs generate content through probabilistic sampling—if a specific work appears in training data, outputs may overlap. The legal standard is 'substantial similarity': whether overall expression, plot structure, and character relationships are substantially alike, not whether individual words or generic plot beats overlap. Defensive measures: run Copyscape or Turnitin checks before publishing; make sufficient creative modifications at the conceptual level; maintain creation process documentation (inspiration sources, revision history) as evidence of independent creation.`,
    }
  ],
  "ai-tools-comparison": [
    {
      question: `一个人做AI短剧，最小工具链是什么？`,
      answer: `最小可行工具链（预算500元以内）：通义千问（免费）做剧本 + Seedance 2.0（按分钟计费）做视频 + 讯飞听见（免费额度）做字幕 + 剪映（免费版）做剪辑和调色。总成本可以控制在500元以内完成3–5集×3分钟的短剧。剪映订阅版（月均$5–$15）能覆盖80%的短剧剪辑需求，无需额外付费Adobe。`,
      questionEn: `What's the minimum tool stack for one person to make an AI short drama?`,
      answerEn: `Minimum viable stack (under $100 total): Claude or GPT-4 (free tier) for script + Runway Gen-3 or Pika (per-minute billing) for video + Whisper API (virtually free for short audio) for subtitles + CapCut (free version) for editing. A complete 3–5 episode × 3-minute short drama can be produced for under $100. CapCut covers 80% of editing needs without paying for Adobe.`,
    },
    {
      question: `哪个AI视频生成工具的手部细节处理最好？`,
      answer: `抖音Seedance 2.0在行业横向评测中手部细节处理相对领先。OpenAI Sora在手部物理合理性上也不错，但两者在手部特写（手指数量、关节弯曲）上仍偶有出错。对于手部动作密集的内容，建议在提示词中明确指定手的具体动作，并在后期预留局部重绘（Inpainting）修复的时间。`,
      questionEn: `Which AI video generation tool handles hand details best?`,
      answerEn: `ByteDance's Seedance 2.0 leads industry benchmarks on hand detail rendering. OpenAI Sora performs well on hand physical plausibility. Both still occasionally struggle with hand close-ups (finger count, joint bends). For hand-intensive content, explicitly specify hand actions in your prompt and budget time for Inpainting fixes in post.`,
    },
    {
      question: `预算有限的情况下，哪些工具的投入优先级最高？`,
      answer: `优先级排序：视频生成平台 > 剪辑工具 > 配音工具 > 其他。视频生成是AI短剧区别于传统制作的核心环节，投入在这上面边际收益最高；剪辑工具决定最终观感，剪映已经能覆盖80%的短剧剪辑需求，无需额外付费Adobe Premiere Pro。`,
      questionEn: `What should I prioritize when budget is limited?`,
      answerEn: `Priority order: video generation platform > editing tool > voiceover tool > everything else. Video generation is the core differentiator between AI and traditional production—investing budget here has the highest marginal return. Editing tool comes second: CapCut already covers 80% of short drama editing needs, making Adobe Premiere Pro an unnecessary expense for most creators.`,
    },
    {
      question: `中文配音和出海多语言配音分别用什么工具？`,
      answer: `中文短剧配音首选讯飞智作，中文拟真度最高，多方言支持好。多语言出海配音推荐Resemble.ai或VoVoV2，多语言情感控制精细。语音识别字幕推荐讯飞听见或OpenAI Whisper，标准普通话准确率均可达93%–97%。`,
      questionEn: `English vs. international multi-language voiceover—what's the right tool for each?`,
      answerEn: `English short dramas: ElevenLabs is the top choice for voice fidelity and emotional granularity. Multi-language international content: Resemble or VoVoV2 for voice cloning and multi-language support. Speech-to-subtitles: OpenAI Whisper for accuracy and low cost (API pricing is nearly free for short clips), Rev for human-assisted highest accuracy.`,
    },
    {
      question: `不同预算水平下，工具组合方案怎么选？`,
      answer: `三个推荐方案：方案A（500元以内个人试水）：通义千问 + Seedance 2.0按分钟 + 剪映免费版；方案B（2,000–5,000元/月小团队）：通义千问订阅 + Midjourney + Lollipop.im集成平台套餐 + 讯飞智作；方案C（5,000元+/月专业团队）：ChatGPT + 通义千问双轨 + 百炼全妙 + Seedance 2.0 + Runway Gen-3组合 + Adobe Premiere Pro AI。`,
      questionEn: `How do I choose the right tool stack at different budget levels?`,
      answerEn: `Plan A (under $100, solo test run): Claude free tier + Runway Gen-3 pay-per-minute + CapCut free + Whisper API. Plan B ($300–$700/month, small team): Claude Pro + Midjourney + Lollipop.im integrated plan + ElevenLabs + CapCut subscription + Soundraw. Plan C ($700+/month, professional studio): Claude + Gemini bilingual + Leonardo AI + Runway Gen-3 + Seedance 2.0 combo + ElevenLabs + Adobe Premiere Pro + Artlist.`,
    }
  ],

};
