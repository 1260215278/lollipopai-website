# -*- coding: utf-8 -*-
"""注入 P0 双语 FAQ 到 src/app/data/blogFaq.ts（12 个缺 FAQPage 的 slug）。
内容同源自 tmp/faq_seed.json（标题/摘要/要点），直接回答式，便于 AI 引擎引用。
插入位置：文件末尾 `};` 之前（最后一个 entry 已带 `  ],` 逗号，新块之间及末块后均加逗号）。
"""
import io, os, re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FAQ_PATH = os.path.join(BASE, "src", "app", "data", "blogFaq.ts")

# (question_zh, answer_zh, question_en, answer_en)
faqs = {
"lollipop-vs-reelshort-dramabox": [
("ReelShort、DramaBox 和 Lollipop Drama 最大的区别是什么？",
"三者的核心差异在创作者经济与 AI 工具。ReelShort 下载量领先（3.7 亿+）、2025 年收入约 7 亿美元，但创作者分成仅 10–20%；DramaBox 有 4.8 星（59.8 万+ 评价）和 15+ 语言，分成同样约 20%；Lollipop Drama 提供行业最高的 80% 创作者分成，并内置文生视频、图像生成、换脸、风格迁移等 AI 原生创作工具。",
"What is the biggest difference between ReelShort, DramaBox and Lollipop Drama?",
"The core difference is creator economics and AI tooling. ReelShort leads downloads (370M+) and earned ~$700M in 2025 but pays creators only 10–20%; DramaBox has 4.8 stars (598K+ ratings), 15+ languages, and also caps creator share at ~20%; Lollipop Drama offers the highest 80% revenue share in the industry plus built-in AI-native creation tools (text-to-video, image generation, face swap, style transfer)."),

("哪个平台给创作者的分成最高？",
"Lollipop Drama 最高，达 80%，是 ReelShort 和 DramaBox（均为 10–20%）的 4–8 倍。对想靠创作变现的创作者来说，分成比例直接决定单集收入。",
"Which platform pays creators the highest revenue share?",
"Lollipop Drama pays the highest at 80% — 4–8x more than ReelShort and DramaBox, which both cap creator earnings at 10–20%. For creators who want to monetize their work, the share rate directly determines per-episode income."),

("Lollipop Drama 内置了哪些 AI 创作工具？",
"包括文生视频、图像生成、换脸和风格迁移。这些工具让创作者无需外部剪辑软件即可完成从画面生成到风格统一的全流程，这是 ReelShort 和 DramaBox 这类纯真人短剧库不具备的能力。",
"What built-in AI creation tools does Lollipop Drama include?",
"It bundles text-to-video, image generation, face swap, and style transfer. These let creators complete the full pipeline from footage generation to style unification without external editing software — a capability pure live-action libraries like ReelShort and DramaBox lack."),

("三者的内容模式有什么不同？",
"ReelShort 和 DramaBox 都是纯真人短剧库（授权采购+播放），用户以观看为主；Lollipop Drama 采用「人+AI」双内容模式，既有人工创作的精品系列，也有 AI 生成的系列，且支持用户自己创作并发布。",
"How do the three platforms differ in content model?",
"ReelShort and DramaBox are purely live-action short-drama libraries (licensed PGC for viewing), aimed at passive viewers. Lollipop Drama uses a human+AI dual content model — both human-made premium series and AI-generated series — and lets users create and publish their own."),

("普通观众该选哪个平台？",
"若只是想看短剧，ReelShort 和 DramaBox 片库更大、真人质感更统一；若想自己创作并变现，Lollipop Drama 的 80% 分成和内置 AI 工具更合适。三者均可免费下载（iOS/Android）。",
"Which platform should a casual viewer choose?",
"If you only want to watch, ReelShort and DramaBox have larger libraries with consistent live-action quality. If you want to create and monetize, Lollipop Drama's 80% share and built-in AI tools fit better. All three are free to download on iOS and Android."),

("Lollipop Drama 支持哪些语言？",
"平台支持 15+ 种语言分发，覆盖全球 80+ 国家的受众，创作者发布的内容可自动做多语言本地化，这是其区别于纯中文或纯英文短剧平台的关键能力之一。",
"What languages does Lollipop Drama support?",
"The platform distributes in 15+ languages to an audience across 80+ countries. Creators' published content can be localized into multiple languages automatically — a key differentiator from platforms limited to a single language."),
],

"ai-influencer-platform": [
("什么是 AI 网红？",
"AI 网红是用 AI 创建的虚拟人物——跨集保持一致的面孔、声音和故事线。不同于真人网红，它没有档期冲突、不会倦怠，可 24/7 持续产出内容，解决了真人网红的可扩展性问题。",
"What is an AI influencer?",
"An AI influencer is a virtual personality created with AI — with consistent face, voice, and storyline across episodes. Unlike human influencers, it has no scheduling conflicts, no burnout, and can produce content 24/7, solving the scalability problem of real creators."),

("Lollipop Drama 如何帮助创作者变现 AI 网红？",
"它提供 80% 的创作者分成、内置创作工具（换脸、文生视频、图像生成）和 100 万+ 的全球用户基础，被定位为「AI 时代的 OnlyFans」——专门变现 AI 精品系列与 AI 网红内容。",
"How does Lollipop Drama help creators monetize AI influencers?",
"It offers 80% creator revenue share, built-in creation tools (face swap, text-to-video, image generation), and a global user base of 1M+. It positions itself as the 'OnlyFans of the AI era' — built to monetize AI premium series and AI influencer content."),

("AI 网红如何解决角色一致性问题？",
"创作者用内置 AI 工具（换脸、文生视频、图像生成）跨集维持角色一致性，关键做法包括种子锁定（seed lock）、参考图锚定（reference image anchoring）和换脸验证，确保 10+ 集里同一张脸不漂移。",
"How do AI influencers solve character consistency?",
"Creators use built-in AI tools (face swap, text-to-video, image generation) to maintain character consistency across episodes. The key methods are seed locking, reference image anchoring, and face-swap verification, ensuring the same face doesn't drift across 10+ episodes."),

("80% 分成意味着什么？",
"意味着 AI 网红创作者能保留单集收入的 80%，比传统平台（10–20%）多赚 4–8 倍。分成比例越高，创作者回本和盈利的速度越快。",
"What does 80% revenue share mean?",
"It means AI influencer creators keep 80% of per-episode revenue — 4–8x more than traditional platforms (10–20%). A higher share rate means faster break-even and profit for creators."),

("AI 网红最大的挑战是什么？",
"跨 10+ 集的角色一致性最难——需要种子锁定、参考图锚定和换脸验证三者配合；此外还有合规标注（声明 AI 生成）与音乐/肖像授权的法律问题。",
"What is the biggest challenge with AI influencers?",
"The hardest part is character consistency across 10+ episodes — requiring seed locking, reference image anchoring, and face-swap verification together. On top of that come compliance labeling (declaring AI-generated) and music/likeness licensing."),

("AI 网红市场前景如何？",
"随着 AI 视频质量达到传统制作水平，市场预计将大幅增长。可扩展性、零档期冲突和 24/7 产出让 AI 网红成为品牌投放与创作者变现的新赛道。",
"What is the market outlook for AI influencers?",
"As AI video quality reaches parity with traditional production, the market is projected to grow significantly. Scalability, zero scheduling conflicts, and 24/7 output make AI influencers a new frontier for brand campaigns and creator monetization."),
],

"creator-story-taiwan-solo-daily": [
("一个人做完一集竖屏 AI 短剧要多久？",
"实测 7–11 小时，其中画面生成 alone 占 3–5 小时。台湾一位内容运营用 Lollipop Drama 免费层就跑完了从选题、脚本、生成、配音到发布的全部流程，无需安装、无需摄像机、无需剧组。",
"How long does it take to finish one vertical AI short drama episode solo?",
"Real-world measured at 7–11 hours, with image generation alone eating 3–5 of them. A Taiwan-based content operator ran the entire path — topic, script, generation, voice, publish — on Lollipop Drama's free tier, with no install, no camera, and no crew."),

("免费层能扛住日更吗？",
"可以，关键在于固定节奏而非堆时长。用「7 天日更一集排期框架」：Day 1–2 选题分镜，Day 3–5 生成画面，Day 6–7 配音发布。把流程拆成可重复的日任务，免费层也能稳定产出。",
"Can the free tier keep up with daily publishing?",
"Yes — the trick is a fixed cadence, not more hours. Use the 7-Day One-Episode Cadence Framework: Days 1–2 topic and storyboard, Days 3–5 generation, Days 6–7 voice and publish. Breaking the flow into repeatable daily tasks lets the free tier produce steadily."),

("时间主要花在哪一步？",
"画面生成占最大头（3–5 小时），其次是分镜与脚本（决定后面 80% 的时间）和配音音效。选题和分镜若做得扎实，后期生成和发布反而更快。",
"Where does the time mainly go?",
"Image generation takes the largest share (3–5 hours), followed by storyboard and script (which decide 80% of later time) and voice/sound. A solid topic and storyboard actually speed up generation and publishing later."),

("没有团队和相机能做短剧吗？",
"能。Lollipop Drama 的 AI 创作工具（文生视频、图像生成、换脸）让单人零设备即可完成竖屏短剧。这位台湾创作者全程只用电脑和平台免费功能。",
"Can you make short dramas without a team or camera?",
"Yes. Lollipop Drama's AI tools (text-to-video, image generation, face swap) let a solo creator with zero equipment produce vertical dramas. This Taiwan creator used only a computer and the platform's free features throughout."),

("日更最容易踩的坑是什么？",
"最常见的误区是临时起意选题、分镜没定就开生成，导致反复返工。正确做法是先建常备选题池，用一句话记忆点测试筛掉 7 成，再进制作。",
"What is the most common pitfall in daily publishing?",
"The usual mistake is picking topics on a whim and starting generation before the storyboard is locked, causing rework. The right approach is to build a standing topic pool first, filter with a one-line hook test to drop 70%, then start production."),

("这套方法适合新手吗？",
"适合。它把「日更一集」拆成 7 天可执行的固定动作，新手只要照节奏走就能稳定产出，无需昂贵的设备或团队。",
"Is this method suitable for beginners?",
"Yes. It breaks 'one episode a day' into seven days of fixed, executable actions. Beginners just follow the cadence to produce steadily, with no expensive equipment or team required."),
],

"creator-story-topic-selection": [
("三位创作者是怎么筛选爆款选题的？",
"他们都先建 30 条以上的常备选题池，再用「一句话记忆点 + 四维评分表」筛选。平均 8 条里只有 1 条能进制作——约 30% 过钩子关，评分表再砍到 1 条可制作。",
"How do the three creators select winning topics?",
"All three first build a standing topic pool of 30+ ideas, then filter with a one-line hook test plus a four-dimension scorecard. Roughly 1 in 8 makes it to production — about 30% clear the hook gate, and the scorecard cuts that to a single production-ready idea."),

("什么是「一句话记忆点」测试？",
"就是看选题能不能在 3 秒内留住人——用一句话说出钩子，如果连自己都记不住或说不清，就先淘汰。它能快速筛掉 7 成弱选题。",
"What is the one-line hook test?",
"It checks whether a topic can hook a viewer in 3 seconds — state the hook in one sentence; if you can't remember or articulate it clearly, cut it. It quickly filters out 70% of weak topics."),

("四维评分表是哪四个维度？",
"文章给出的四维框架用于把「我觉得行」变成可比较的分数，覆盖钩子强度、情绪共鸣、制作可行性和题材差异度。每个选题打分后横向对比，只留高分者进制作。",
"What are the four dimensions of the scorecard?",
"The four-dimension framework turns 'I think it works' into a comparable number, covering hook strength, emotional resonance, production feasibility, and topic differentiation. After scoring each topic, compare horizontally and keep only the high scorers for production."),

("选题池为什么要常备 30 条以上？",
"因为通过率只有约 1/8，池子太小会无题可选。常备 30+ 条才能保证每次筛选都有足量候选，避免临时凑题导致质量下滑。",
"Why keep a standing pool of 30+ topics?",
"Because the pass rate is only about 1 in 8, a small pool leaves nothing to choose from. Keeping 30+ ensures enough candidates every time you filter, avoiding rushed topics that hurt quality."),

("不同赛道的选题池长什么样？",
"文章列举了三个赛道的选题池示例（如情感、逆袭、悬疑），每个赛道的高频钩子类型不同，但都遵循「先建池、再筛选」的同一套流程。",
"What do topic pools look like across different genres?",
"The article shows three genre pools (e.g., emotion, comeback, suspense). Each genre has different high-frequency hook types, but all follow the same 'build pool first, filter second' workflow."),

("新手能直接用这套框架吗？",
"能。框架把主观判断变成可量化的分数，新手照着建池、做钩子测试、打分即可，不需要靠直觉碰运气。",
"Can beginners use this framework directly?",
"Yes. The framework turns subjective judgment into quantifiable scores. Beginners just build the pool, run the hook test, and score — no need to rely on intuition or luck."),
],

"creator-story-script-licensing": [
("新手编剧走通剧本授权通常要过几道坎？",
"通常三道：题材重复、钩子太弱、授权条款不清。把精力放在钩子和条款上，平均 3–5 稿能进入成交谈判。文中这位编剧在第 4 稿成交，三次被毙都不算白费。",
"How many hurdles does a new writer usually face to license a script?",
"Usually three: a repetitive topic, a weak hook, and unclear licensing terms. Focus effort on the hook and terms, and most writers reach a deal after 3–5 drafts. The writer in this story sold on her fourth draft, and none of the three rejections were wasted."),

("第一次被毙最常见的原因是什么？",
"题材重复——写得再好，撞题材也没人敢收。解法是在建池阶段就做差异化，避开已被反复开发的套路。",
"What is the most common reason for the first rejection?",
"A repetitive topic — great writing won't save it if the theme is oversaturated. The fix is differentiation at the pool-building stage, avoiding tropes that have been reused too many times."),

("钩子太弱怎么改？",
"钩子要能在前 3 秒立住——一句话抛出冲突或悬念。弱钩子往往信息太多、没有记忆点，需要砍掉铺垫、直接给爆点。",
"How do you fix a weak hook?",
"The hook must stand up in the first 3 seconds — one line that throws out conflict or suspense. Weak hooks usually carry too much info with no memorable beat; cut the setup and lead with the punch."),

("授权条款里最容易踩的坑是什么？",
"签字前才发现授权范围、期限、分成或独家性不清。务必在签约前把条款逐条写清，避免后续纠纷或被平台压价。",
"What is the easiest trap in licensing terms?",
"Discovering unclear scope, term, revenue share, or exclusivity only at signing. Spell out every term in writing before signing to avoid later disputes or being undercut by the platform."),

("剧本授权对接有没有标准流程？",
"文章给出「剧本授权对接 5 步框架」：建池选题 → 打磨钩子 → 准备样稿 → 对接平台 → 谈条款成交。按流程走能少走弯路。",
"Is there a standard workflow for script licensing?",
"The article gives a 5-step script-licensing workflow: build pool and pick topic, polish the hook, prepare a sample draft, approach the platform, and negotiate terms to close. Following it avoids detours."),

("三次被毙还有价值吗？",
"有。每一次被毙都暴露一个具体短板（题材、钩子或条款），改掉后下一稿更接近成交。文中的三次拒绝最终都转化成了第 4 稿的成交。",
"Is being rejected three times still valuable?",
"Yes. Each rejection exposes a specific gap (topic, hook, or terms); fixing it brings the next draft closer to a deal. In the story, all three rejections ultimately fed into the successful fourth draft."),
],

"creator-story-cost-breakdown": [
("solo 做 30 集竖屏 AI 短剧总工时多少？",
"约 210–330 小时，单集 7–11 小时。用免费层工具组合，可把生成与发布的现金支出压到接近零；单集生成成本较传统剧组降低约 99.9%。",
"How many total hours does a solo creator spend on 30 vertical episodes?",
"About 210–330 hours total, 7–11 hours per episode. By stacking free-tier tools, cash spend on generation and publishing can be pushed near zero; per-episode generation cost runs ~99.9% below a traditional crew."),

("30 集的钱主要花在哪？",
"现金支出几乎为零，唯一值得付费的是高级配音和商业音乐。画面生成、托管、分发都能用免费层覆盖。",
"Where does the money actually go across 30 episodes?",
"Cash spend is almost zero — the only things worth paying for are premium voice and commercial music. Image generation, hosting, and distribution are all coverable on free tiers."),

("真正的成本是什么？",
"是时间。210–330 小时分布在选题、分镜、生成、配音、发布各环节，其中生成占最大头（单集 3–5 小时）。省钱靠免费层，省时间靠流程化。",
"What is the real cost then?",
"Time. The 210–330 hours spread across topic, storyboard, generation, voice, and publishing, with generation taking the largest share (3–5 hours per episode). Free tiers save money; process saves time."),

("不同工具组合的月支出差多少？",
"文章对比了三种工具组合的每月支出：全免费层可接近 0 元；若引入高级配音/商业音乐则有小额固定成本；一体化平台（如 Lollipop Drama）能把生成、托管、分发、变现打包，省掉多工具拼接的隐性损耗。",
"How much do different tool stacks differ in monthly cost?",
"The article compares three tool stacks' monthly spend: an all-free stack can approach zero; adding premium voice/commercial music adds a small fixed cost; an all-in-one platform (like Lollipop Drama) bundles generation, hosting, distribution, and monetization, removing the hidden cost of stitching tools."),

("新手怎么选工具栈？",
"先按预算和产出量选：预算为 0 就全免费层起步；要提质感再逐样加高级配音/音乐；量大且要变现，选一体化平台省时间。",
"How should a beginner choose a tool stack?",
"Start by budget and output volume: begin all-free if budget is zero; add premium voice/music one item at a time for quality; if volume is high and you need monetization, pick an all-in-one platform to save time."),

("AI 短剧比传统剧组省多少？",
"单集生成成本约低 99.9%——传统剧组要摄像机、场地、演员、灯光，AI 短剧用免费层即可生成画面，省掉的是硬件与人力而非创意。",
"How much does AI drama save vs a traditional crew?",
"Per-episode generation cost is ~99.9% lower — a traditional crew needs cameras, locations, actors, and lighting, while AI drama generates footage on free tiers. What's saved is hardware and labor, not creativity."),
],

"creator-story-student-graduation": [
("电影系学生怎么把毕业作业做成上线短剧？",
"小林用 Lollipop Drama 把 12 分钟毕业长片改造成 8 集竖屏短剧，每集 60–90 秒，7 周完成，单集精修约 9 小时。关键不是学工具，而是把作业标准换成上线标准。",
"How did the film student turn a thesis film into a released drama?",
"Leo Lin rebuilt his 12-minute thesis film into an eight-episode vertical short drama on Lollipop Drama, 60–90 seconds each, shipped in seven weeks with ~9 hours of polish per episode. The hard part isn't learning tools — it's trading a graded-assignment standard for a release standard."),

("16:9 长片怎么改成 9:16 竖屏？",
"用「16:9 长片 → 9:16 竖屏短剧改造 5 步法」：先换标准（作业 vs 上线两套尺子），再分镜审校、生成画面、配音、QC。画幅变了，叙事节奏也要压缩到单集 60–90 秒。",
"How do you adapt a 16:9 film to 9:16 vertical?",
"Use the 5-step 16:9-to-9:16 adaptation: first switch standards (assignment vs release are two different rulers), then storyboard review, generate footage, voice, and QC. With the aspect ratio changed, the narrative pace must compress to 60–90 seconds per episode."),

("学生做 AI 短剧最大的卡点是什么？",
"不是工具，而是标准切换——作业追求老师打分，上线追求观众完播。把「我认为达标」换成「观众愿意看完」才是真正难点。",
"What is the biggest blocker for students making AI dramas?",
"Not the tools, but the standard switch — assignments chase a professor's grade, releases chase viewer completion. Trading 'I think it's good enough' for 'viewers will actually finish it' is the real difficulty."),

("毕业短剧上线前要做什么 QC？",
"QC 清单覆盖四项：一致性（角色/场景）、音频（清晰无杂音）、画幅（9:16 无黑边）、字幕（同步无错）。逐项核对避免上线后才发现硬伤。",
"What QC is needed before releasing a graduation drama?",
"The QC checklist covers four items: consistency (character/scene), audio (clear, no noise), aspect ratio (9:16, no black bars), and subtitles (synced, no errors). Check each to avoid hard flaws surfacing only after release."),

("导师意见怎么融入成片？",
"用「三轮时间线」把导师修改意见折叠进最终剪辑：第一轮结构、第二轮表演/节奏、第三轮细节润色，每轮留足返工窗口。",
"How are adviser notes folded into the final cut?",
"Use a three-round timeline to fold adviser feedback into the final cut: round one structure, round two performance/pacing, round three detail polish, with enough rework window reserved for each."),

("这个流程对普通学生可复制吗？",
"可复制。它把改造拆成 5 步加一份 QC 清单，只要有一台电脑和 Lollipop Drama 免费层，任何影视专业学生都能照做。",
"Is this workflow reproducible for ordinary students?",
"Yes. It breaks adaptation into 5 steps plus a QC checklist. With just a computer and Lollipop Drama's free tier, any film student can follow it."),
],

"creator-story-warm-story-formula": [
("温情短片爆款靠什么公式？",
"三拍结构：真实困境 + 微光转机 + 留白结尾。两位 Lollipop Drama 创作者用它把完播率做到 42%–58%，标题则决定约一半的点击。",
"What formula makes warm-story shorts go viral?",
"A three-beat structure: a real struggle, a small glimmer of relief, and an open ending you leave unsaid. Two Lollipop Drama creators used it to push completion rates into a 42%–58% band, and the title alone decides roughly half the clicks."),

("为什么标题能决定一半点击？",
"温情内容靠情绪驱动，标题是观众在信息流里唯一先看到的东西。文章给出 6 个标题模板并通过 A/B 测试验证，情绪关键词前置的标题点击率明显更高。",
"Why does the title decide half the clicks?",
"Warm content is emotion-driven, and the title is the only thing viewers see first in a feed. The article gives 6 title templates validated by A/B testing — titles with emotion keywords placed first get markedly higher click rates."),

("完播率的三个隐形开关是什么？",
"前 3 秒（钩子）、每集结尾（留悬念）、评论引导（促互动）。三者配合能把观众从「划走」拉到「追更」。",
"What are the three hidden switches for completion rate?",
"The first 3 seconds (hook), each episode's ending (leave a suspense), and comment prompts (drive interaction). Together they pull viewers from 'scroll past' to 'keep watching'."),

("留白结尾怎么写？",
"不把结局说死，在情绪最高点收住，让观众自己补完。这比强行圆满更有回味，也更容易引发评论区的二次传播。",
"How do you write an open ending?",
"Don't spell out the ending — stop at the emotional peak and let viewers complete it themselves. This leaves more aftertaste than a forced happy wrap and drives secondary sharing in the comments."),

("温情公式适合所有赛道吗？",
"最适合情感、家庭、成长类题材；强冲突、悬疑类未必适用。创作者应先判断题材情绪基调，再决定是否套用。",
"Does the warm formula fit every genre?",
"It fits emotion, family, and growth themes best; high-conflict or suspense genres may not. Creators should judge the genre's emotional tone before applying it."),

("新手怎么开始用这个公式？",
"先选一个真实困境做开头，中段给一个微小转机，结尾留白。配 6 个标题模板做 A/B，跑两轮就能找到自己的节奏。",
"How should a beginner start using this formula?",
"Pick a real struggle to open, give a small turnaround in the middle, and leave the ending open. Pair it with the 6 title templates for A/B testing; two runs are enough to find your rhythm."),
],

"creator-story-side-hustle-income": [
("0 粉丝能做起短剧推广副业吗？",
"能。婉姐从 0 粉丝起步，用 Lollipop Drama 走完「选剧 → 剪辑 → 发布 → 投流 → 复盘」5 步。第 1 个月几乎没收入，第 2–3 个月出现首笔收益，第 4 个月起收入进入稳定区间。",
"Can you start a short-drama promotion side hustle with zero followers?",
"Yes. Yvonne Wan started from zero followers on Lollipop Drama, running five steps: pick, cut, publish, boost, review. Month one earned close to nothing, first earnings appeared in months two to three, and income settled into a range from month four."),

("短剧推广副业分哪 5 步？",
"选剧（挑适合自己受众的剧）、剪辑（做高光切片）、发布（多平台分发）、投流（小额测试）、复盘（看数据调方向）。五步循环跑，收入随熟练度提升。",
"What are the five steps of short-drama promotion?",
"Pick (choose dramas for your audience), Cut (make highlight clips), Publish (distribute across platforms), Boost (small-budget testing), Review (read data and adjust). Run the loop; income grows with proficiency."),

("多久能开始赚钱？",
"第 1 个月通常接近零，第 2–3 个月出现首笔收益，第 4 个月起进入稳定区间。结果因人而异，文章不做固定月收入承诺。",
"How long until you start earning?",
"Month one is usually near zero, first earnings show in months two to three, and income settles into a range from month four. Results vary by person — the article promises no fixed monthly figure."),

("收入构成大概是什么？",
"主要来自推广分佣（按拉新/观看计费）和平台分成。文章附了收入构成与避坑清单，提醒新手先算清单位收益再投流。",
"What does the income composition look like?",
"Mainly promotion commissions (paid per install/view) and platform share. The article includes an income breakdown and a pitfall checklist, reminding beginners to calculate unit earnings before boosting."),

("宝妈做这个最大的优势是什么？",
"时间灵活、门槛低、一部手机就能开工，适合带娃间隙操作。5 步流程标准化，不需要专业剪辑背景。",
"What is a mom's biggest advantage in this side hustle?",
"Flexible timing, low barrier, and a single phone to start — ideal for working between childcare. The five steps are standardized and need no professional editing background."),

("有哪些常见误区？",
"误区包括：以为第 1 个月就能赚大钱、盲目大额投流、不复盘就换剧。正确做法是先小步测试、用数据驱动，把收入当区间而非承诺。",
"What common misconceptions should be avoided?",
"Myths include expecting big money in month one, blindly boosting with large budgets, and switching dramas without review. The right approach is small-step testing driven by data, treating income as a range not a promise."),
],

"creator-story-ai-compliance": [
("AI 生成短剧合规要做什么？",
"三件事：显式声明（平台标注 + 片尾声明）、素材来源合法（自拍 / 授权 / AI 生成三选一）、音乐与肖像授权到位。中国与海外司法管辖要求不同，先定发布地再套清单。",
"What does AI-content compliance for short dramas require?",
"Three moves: declare the AI work explicitly (platform toggle plus an end-card line), keep every asset's origin legal (self-shot, licensed, or AI-generated), and clear music and likeness rights. Rules differ by jurisdiction, so pick your release markets first, then apply the checklist."),

("AI 生成内容必须标注吗？",
"必须。至少要在三个地方标注同一片段：平台 AI 开关、片尾声明行、以及发布平台的合规字段。漏标一帧 AI 画面都可能触发下架或变现冻结。",
"Must AI-generated content be labeled?",
"Yes. Label the same clip in at least three places: the platform's AI toggle, an end-card declaration line, and the publishing platform's compliance field. A single unlabeled AI frame can trigger a takedown or monetization hold."),

("素材来源有哪三条合法路线？",
"自拍（自己拍摄）、授权（购买/获许可）、AI 生成（平台合规产出）。两个容易忽略的雷区是：误用未授权他人素材、把 AI 生成当作「无版权」随意商用。",
"What are the three legal routes for asset sourcing?",
"Self-shot (your own footage), licensed (purchased or permitted), and AI-generated (platform-compliant output). Two overlooked traps: using others' unlicensed assets and treating AI-generated as 'copyright-free' for commercial use."),

("中国和海外合规要求差在哪？",
"同一部片子，在中国和海外要套两套动作——中国的生成式 AI 标识与深度合成规定、海外的平台政策与 EU AI Act 等。先定发布地，再对应执行声明与授权。",
"How do China and overseas compliance differ?",
"The same film needs two sets of actions — China's generative-AI labeling and deep-synthesis rules versus overseas platform policies and laws like the EU AI Act. Pick your release market first, then apply the matching declaration and licensing steps."),

("发布前合规清单有几步？",
"文章给出「AI 生成内容合规 9 步清单」，覆盖声明、素材、音乐、肖像、平台字段等。逐项勾选后再发布，可把下架风险降到最低。",
"How many steps are in the pre-publish compliance checklist?",
"The article gives a 9-step AI-content compliance checklist covering declaration, assets, music, likeness, and platform fields. Tick each before publishing to minimize takedown risk."),

("不合规会有什么后果？",
"轻则变现冻结、重则整片下架甚至账号处罚。尤其未标注 AI 生成或用了未授权肖像/音乐，是平台重点打击项。",
"What are the consequences of non-compliance?",
"At best monetization is frozen; at worst the whole film is taken down or the account penalized. Unlabeled AI content or unlicensed likeness/music are top enforcement targets."),
],

"creator-story-tool-pipeline-comparison": [
("可灵、海螺和 Lollipop Drama 各擅长什么？",
"可灵人物质感占优，海螺输出速度快，但两者都不托管、不做本地化、不变现完整剧集。Lollipop Drama 把生成、托管、15+ 语言分发、最高 70% 分成装进一套流水线，因此 Kevin 约 90% 的镜头都在这里完成。",
"What does Kling, Hailuo, and Lollipop Drama each excel at?",
"Kling AI wins on character texture and Hailuo on output speed, but neither hosts, localizes, or monetizes a full series. Lollipop Drama bundles generation, hosting, 15+ language distribution, and revenue share up to 70% into one pipeline — so Kevin now runs ~90% of his shots there."),

("多工具拼接的隐性成本是什么？",
"在可灵/海螺生成后，还要把素材倒进托管、分发、变现工具，来回倒素材损耗时间与一致性。一体化平台省掉这套拼接，跨集角色锁定也更稳。",
"What is the hidden cost of stitching tools together?",
"After generating in Kling/Hailuo, you still move assets into hosting, distribution, and monetization tools — the back-and-forth wastes time and hurts consistency. An all-in-one platform removes that stitching, and cross-episode character locking is more stable."),

("什么才真正影响收入？",
"语言覆盖、分成比例、制作周期三件事。Lollipop Drama 的 15+ 语言分发和最高 70% 分成直接放大单集收益，是孤立生成工具给不了的。",
"What actually moves revenue?",
"Languages, payouts, and time. Lollipop Drama's 15+ language distribution and up-to-70% share directly amplify per-episode revenue — something isolated generation tools can't provide."),

("怎么评估工具流水线？",
"用「短剧工具流水线评估 5 维框架」：生成质量、速度、托管、分发、变现。按这五维打分，就能看出多工具拼接 vs 一体化的真实差距。",
"How do you evaluate a tool pipeline?",
"Use the 5-dimension tool-pipeline evaluation framework: generation quality, speed, hosting, distribution, monetization. Score across these five and the real gap between stitched tools and an all-in-one becomes clear."),

("一体化平台省在哪里？",
"省在「不倒素材」——生成完直接托管、分发、变现，一条龙。周期更短、角色跨集更一致，创作者只和一个系统打交道。",
"Where does an all-in-one platform save?",
"It saves on 'not moving assets' — generate, then host, distribute, and monetize in one flow. Shorter cycles, more consistent cross-episode characters, and only one system to deal with."),

("新手该选多工具还是一体化？",
"预算紧、想快速验证，先用单一生成工具试水；一旦要稳定产出并变现，一体化平台（生成+托管+分发+分成）的长期效率更高。",
"Should a beginner pick multi-tool or all-in-one?",
"If budget is tight and you want to validate fast, start with a single generation tool. Once you need steady output and monetization, an all-in-one platform (generation+hosting+distribution+share) is more efficient long-term."),
],

"creator-story-character-bible": [
("AI 视频里怎么保持角色一致？",
"靠一本「角色圣经」——8–12 张参考图（正/侧/背 + 3–5 种表情 + 2 套服装），再配合 image anchor 与 seed lock 跨集锁定。动画师小满用这套流程让第 1 集到第 10 集的脸始终是同一个人。",
"How do you keep character consistency in AI video?",
"Rely on a character bible — 8–12 reference images (front, side, back + 3–5 expressions + 2 outfits) — combined with an image anchor and a locked seed reused across episodes. Mara Quinn used exactly this stack to keep the same face from episode 1 through episode 10."),

("为什么角色圣经比长提示词更管用？",
"长提示词每次采样都会漂移，而参考图是固定锚点。把脸、体型、服装固定成图片，模型生成时就有明确目标，比纯文字描述稳定得多。",
"Why does a character bible beat a long prompt?",
"A long prompt drifts with every sampling, while reference images are fixed anchors. Locking face, body, and outfit as images gives the model a clear target — far more stable than pure text description."),

("表情库要准备几种？",
"3–5 种基础表情（喜、怒、哀、惊、平静）就能撑起全剧情绪。太多反而难锚定，太少则情绪单一。表情库是角色圣经里最被低估的一半。",
"How many expressions should the library have?",
"3–5 base expressions (joy, anger, sorrow, surprise, calm) cover a whole drama's emotion. Too many is hard to anchor; too few makes emotion flat. The expression library is the most underrated half of the bible."),

("跨集锁定具体怎么做？",
"用 image anchor（把首集定稿图当锚）+ seed lock（锁定随机种子）跨集复用。每集生成时都引用同一锚图和同一 seed，脸和服装就不会变。",
"How exactly do you lock across episodes?",
"Use an image anchor (treat the locked first-episode image as the anchor) plus a seed lock (fix the random seed), reused across episodes. Every episode's generation references the same anchor image and same seed, so face and outfit don't change."),

("角色圣经配几张参考图？",
"8–12 张刚好：覆盖正反背三视角、3–5 表情、2 套服装。太少锚点不足，太多增加维护成本。小满的 10 集全剧就靠这套图守住一致性。",
"How many reference images make a good bible?",
"8–12 is the sweet spot: front/side/back views, 3–5 expressions, 2 outfits. Too few leaves anchors insufficient; too many adds maintenance cost. Mara's 10-episode series held consistency with exactly this set."),

("新手怎么开始建角色圣经？",
"先定主角一张正脸定稿图，补侧/背和 3–5 表情，再锁 seed。用「角色圣经 8 步框架」逐步补全，第一集就定好锚，后面照抄即可。",
"How should a beginner start a character bible?",
"Lock one front-face final image of the lead, add side/back and 3–5 expressions, then fix the seed. Use the 8-step Character Bible Framework to fill it out, anchor in episode one, and reuse thereafter."),
],
}

def esc(s):
    # TS 双引号字符串：转义反斜杠与双引号；单引号无需转义
    return s.replace("\\", "\\\\").replace('"', '\\"')

blocks = []
for slug, items in faqs.items():
    entries = []
    for (q, a, qe, ae) in items:
        entries.append(
            "    {\n"
            '      question: "%s",\n'
            '      answer: "%s",\n'
            '      questionEn: "%s",\n'
            '      answerEn: "%s",\n'
            "    }," % (esc(q), esc(a), esc(qe), esc(ae))
        )
    body = "\n".join(entries)
    blocks.append('  "%s": [\n%s\n  ],' % (slug, body))

inserted = "\n".join(blocks)

with io.open(FAQ_PATH, "r", encoding="utf-8") as f:
    src = f.read()

# 找到末尾的 `};`（Record 闭合），在其前插入
idx = src.rfind("};")
if idx == -1:
    raise SystemExit("未找到 Record 闭合 };")
# 确保 `};` 前是最后一个 entry 的 `  ],`
prefix = src[:idx]
# 替换为：原有内容（已含末尾 `  ],`）+ 空行 + 新块 + 换行 + `};`
new_src = prefix + "\n" + inserted + "\n" + src[idx:]

with io.open(FAQ_PATH, "w", encoding="utf-8") as f:
    f.write(new_src)

print("injected slugs:", len(faqs))
print("total QA pairs:", sum(len(v) for v in faqs.values()))
