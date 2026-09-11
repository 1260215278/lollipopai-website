import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Globe, Film, TrendingUp, Star, CheckCircle2, Sparkles, Target, Eye } from "lucide-react";
import { useI18n } from "../i18n";

/* ── Images ── */
const IMG_FILM_CREW = "https://images.unsplash.com/photo-1612544409025-e1f6a56c1152?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900&q=80";
const IMG_WORLD = "https://images.unsplash.com/photo-1633098096956-afdc8bcc8552?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900&q=80";
const IMG_CREATOR = "https://images.unsplash.com/photo-1759393852314-59dc00faeed3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900&q=80";
const IMG_CLAPPER = "https://images.unsplash.com/photo-1485846234645-a62644f84728?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900&q=80";

/* ── Bilingual content ── */
const T = {
  zh: {
    badge: "核心优势",
    title: "产品概览",
    intro1: "Lollipop Drama是全球 AIGC 短剧创作者生态平台，面向全球用户提供精品短剧消费与创作者内容订阅服务，打造「人人可创作、创作可变现、消费即激励」的下一代海外内容生态平台。",
    intro2: "Lollipop 致力于实现 AI 精品剧集和 AI 网红的创作变现，将传统内容消费转化为对「创作者」的订阅和追随。",
    pillars: [
      { icon: Target, label: "一、定位", text: "面向全球用户提供精品短剧消费与创作者内容订阅服务的变现平台。" },
      { icon: Sparkles, label: "二、使命", text: "让创作被订阅，让追随有价值。" },
      { icon: Eye, label: "三、愿景", text: "人人可创作、创作可变现、消费即激励。" },
    ],
    coreBadge: "核心竞争优势",
    adv1: {
      num: "①", title: "全球布局",
      headline: "深耕 8 大核心国家，辐射 100+ 市场",
      desc: "深耕 8 大核心国家与地区，辐射海外主流市场覆盖 100+ 国家和地区，包括美国、英国、加拿大、澳大利亚、新加坡、日本、巴西、德国等主流市场。",
      countries: [
        { flag: "🇺🇸", name: "美国" }, { flag: "🇬🇧", name: "英国" },
        { flag: "🇨🇦", name: "加拿大" }, { flag: "🇦🇺", name: "澳大利亚" },
        { flag: "🇸🇬", name: "新加坡" }, { flag: "🇯🇵", name: "日本" },
        { flag: "🇧🇷", name: "巴西" }, { flag: "🇩🇪", name: "德国" },
        { flag: "🇦🇪", name: "阿拉伯" }, { flag: "🇪🇸", name: "西班牙" },
      ],
      langLabel: "多语言字幕支持",
      langs: ["简体中文", "繁体中文", "English", "Português"],
      stats: [{ val: "100+", label: "覆盖国家" }, { val: "8", label: "核心市场" }, { val: "4", label: "语言支持" }],
    },
    adv2: {
      num: "②", title: "正版储备",
      headline: "500+ 部正版授权，15,000+ 精品短剧",
      desc: "平台拥有 15,000+ 精品短剧，覆盖十多类题材分类，每周持续上线独家新作，保障内容持续供给。",
      stats: [
        { val: "500+", label: "正版授权剧集" },
        { val: "15,000+", label: "精品短剧总量" },
        { val: "每周", label: "独家新作上线" },
        { val: "10+", label: "题材分类" },
      ],
      genres: [
        { emoji: "💕", name: "爱情", count: "320+" },
        { emoji: "⚔️", name: "复仇", count: "180+" },
        { emoji: "🎭", name: "惊悚", count: "150+" },
        { emoji: "💼", name: "霸总", count: "260+" },
        { emoji: "✨", name: "奇幻", count: "120+" },
        { emoji: "🔥", name: "动作", count: "90+" },
        { emoji: "👻", name: "恐怖", count: "85+" },
        { emoji: "🚀", name: "科幻", count: "75+" },
        { emoji: "🏠", name: "家庭", count: "110+" },
        { emoji: "👘", name: "古装", count: "95+" },
      ],
      weeklyBadge: "每周上新独家剧集",
    },
    adv3: {
      num: "③", title: "专业产能",
      headline: "40+ 签约剧方 · 10 万+ 优质创作者",
      desc: "全球 10 万+ 优质创作者入驻，部分头部创作者已突破 100 万播放量。兼容 PGC 精品与大众 AIGC 创作，构建三级供给体系。",
      tiers: [
        { label: "超 S 级产能", sub: "顶级内容品质保障", color: "from-red-500 to-rose-600", icon: "🌟" },
        { label: "专业剧方 40+", sub: "签约专业制作团队", color: "from-orange-500 to-red-500", icon: "🎬" },
        { label: "大众创作者 10万+", sub: "AIGC 大众内容生态", color: "from-amber-500 to-orange-500", icon: "👥" },
      ],
      milestoneLabel: "头部创作者突破",
      milestone: "100万",
      milestoneUnit: "播放量",
    },
    adv4: {
      num: "④", title: "分账诚意",
      headline: "行业最高 80% 分账比例",
      desc: "短剧行业最高水平的收益分成，创作者保留短剧收入的 80%，平台全额承担投流成本。",
      ourLabel: "Lollipop",
      industryLabel: "行业平均",
      industryRange: "30–50%",
      bullets: [
        "平台全额承担投流成本",
        "头部创作者可获得每月额外奖励",
        "让优质内容获得应有回报",
      ],
      comparisonTitle: "收益分成对比",
    },
    adv5: {
      num: "⑤", title: "伙伴信任",
      headline: "85% 合作续约率 · 大多数伙伴的长期选择",
      desc: "高续约率证明平台的长期价值与稳定性，全球用户与创作者的信任背书。",
      metrics: [
        { val: "85%", label: "合作续约率", color: "from-red-400 to-orange-400" },
        { val: "100万+", label: "全球用户", color: "from-orange-400 to-amber-400" },
        { val: "10万+", label: "优质创作者", color: "from-amber-400 to-yellow-400" },
        { val: "99.9%", label: "服务可用率", color: "from-emerald-400 to-teal-400" },
      ],
    },
  },
  en: {
    badge: "Platform Overview",
    title: "Product Summary",
    intro1: "Lollipop Drama is a global AIGC short-form drama creator ecosystem platform that offers premium short-form drama consumption and creator content subscription services to users worldwide, aiming to build a next-generation international content ecosystem where \"everyone can create, creations can be monetized, and consumption translates into rewards.\"",
    intro2: "Lollipop is committed to enabling the monetization of AI-generated premium series and AI-driven influencers, transforming traditional content consumption into subscriptions and engagement with \"creators.\"",
    pillars: [
      { icon: Target, label: "I. Positioning", text: "A monetization platform offering premium short-form drama consumption and creator content subscription services to global users." },
      { icon: Sparkles, label: "II. Mission", text: "Make creation accessible through subscription – make following worthwhile." },
      { icon: Eye, label: "III. Vision", text: "Everyone can create; creation can be monetized; consumption serves as an incentive." },
    ],
    coreBadge: "Core Competitive Advantages",
    adv1: {
      num: "①", title: "Global Presence",
      headline: "8 Key Markets · 100+ Countries Reached",
      desc: "Deeply rooted in eight key countries and regions, extending into mainstream overseas markets covering 100+ countries and regions, including the US, UK, Canada, Australia, Singapore, Japan, Brazil, Germany, and more.",
      countries: [
        { flag: "🇺🇸", name: "USA" }, { flag: "🇬🇧", name: "UK" },
        { flag: "🇨🇦", name: "Canada" }, { flag: "🇦🇺", name: "Australia" },
        { flag: "🇸🇬", name: "Singapore" }, { flag: "🇯🇵", name: "Japan" },
        { flag: "🇧🇷", name: "Brazil" }, { flag: "🇩🇪", name: "Germany" },
        { flag: "🇦🇪", name: "Arab" }, { flag: "🇪🇸", name: "Spain" },
      ],
      langLabel: "Multilingual Subtitle Support",
      langs: ["简体中文", "繁体中文", "English", "Português"],
      stats: [{ val: "100+", label: "Countries" }, { val: "8", label: "Core Markets" }, { val: "4", label: "Languages" }],
    },
    adv2: {
      num: "②", title: "Official License Portfolio",
      headline: "500+ Licensed Titles · 15,000+ Premium Dramas",
      desc: "The platform features over 15,000 premium short-form dramas across more than a dozen genres. Exclusive new titles are released weekly to ensure a steady stream of content.",
      stats: [
        { val: "500+", label: "Licensed Titles" },
        { val: "15,000+", label: "Total Dramas" },
        { val: "Weekly", label: "Exclusive Releases" },
        { val: "10+", label: "Genre Categories" },
      ],
      genres: [
        { emoji: "💕", name: "Romance", count: "320+" },
        { emoji: "⚔️", name: "Revenge", count: "180+" },
        { emoji: "🎭", name: "Thriller", count: "150+" },
        { emoji: "💼", name: "CEO", count: "260+" },
        { emoji: "✨", name: "Fantasy", count: "120+" },
        { emoji: "🔥", name: "Action", count: "90+" },
        { emoji: "👻", name: "Horror", count: "85+" },
        { emoji: "🚀", name: "Sci-Fi", count: "75+" },
        { emoji: "🏠", name: "Family", count: "110+" },
        { emoji: "👘", name: "Period", count: "95+" },
      ],
      weeklyBadge: "Weekly Exclusive New Titles",
    },
    adv3: {
      num: "③", title: "Professional Production",
      headline: "40+ Contracted Studios · 100K+ Quality Creators",
      desc: "Over 100,000 high-quality creators worldwide have joined the platform, with some top creators surpassing 1 million views. Supports both PGC premium and AIGC content, establishing a three-tiered supply chain.",
      tiers: [
        { label: "Ultra-S Production", sub: "Premium quality assurance", color: "from-red-500 to-rose-600", icon: "🌟" },
        { label: "40+ Pro Studios", sub: "Contracted professional teams", color: "from-orange-500 to-red-500", icon: "🎬" },
        { label: "100K+ Creators", sub: "AIGC content ecosystem", color: "from-amber-500 to-orange-500", icon: "👥" },
      ],
      milestoneLabel: "Top creators reaching",
      milestone: "1M+",
      milestoneUnit: "views",
    },
    adv4: {
      num: "④", title: "Transparent Revenue Share",
      headline: "Industry-Leading 80% Revenue Share",
      desc: "The highest revenue-sharing model in the short-form drama industry — creators retain 80% of their earnings. The platform bears the full investment traffic cost.",
      ourLabel: "Lollipop",
      industryLabel: "Industry Avg.",
      industryRange: "30–50%",
      bullets: [
        "Platform bears the full investment traffic cost",
        "Top-tier creators receive additional monthly rewards",
        "Ensuring high-quality content receives fair compensation",
      ],
      comparisonTitle: "Revenue Share Comparison",
    },
    adv5: {
      num: "⑤", title: "Partner Trust",
      headline: "85% Contract Renewal Rate — Long-Term Choice",
      desc: "The high contract renewal rate demonstrates the platform's long-term value and stability, backed by the trust of global users and creators.",
      metrics: [
        { val: "85%", label: "Renewal Rate", color: "from-red-400 to-orange-400" },
        { val: "1M+", label: "Global Users", color: "from-orange-400 to-amber-400" },
        { val: "100K+", label: "Quality Creators", color: "from-amber-400 to-yellow-400" },
        { val: "99.9%", label: "Service Uptime", color: "from-emerald-400 to-teal-400" },
      ],
    },
  },
};

/* ── Helper: ring progress (SVG) ── */
function RingProgress({ pct, size = 220, stroke = 18, inView }: { pct: number; size?: number; stroke?: number; inView: boolean }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="url(#rg)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={inView ? { strokeDashoffset: circ * (1 - pct / 100) } : {}}
        transition={{ duration: 2, ease: "easeOut", delay: 0.4 }}
      />
      <defs>
        <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Helper: advantage section header ── */
function AdvHeader({ num, title, headline, badge }: { num: string; title: string; headline: string; badge: string }) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold tracking-widest uppercase text-red-400">{badge}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
      </div>
      <div className="flex items-baseline gap-4">
        <span className="text-[4rem] font-black leading-none select-none" style={{ WebkitTextStroke: "1px rgba(239,68,68,0.2)", color: "transparent" }}>{num}</span>
        <div>
          <h3 className="text-white" style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.9rem)", fontWeight: 700, lineHeight: 1.2 }}>{title}</h3>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400 mt-1" style={{ fontSize: "clamp(0.85rem, 1.5vw, 1.05rem)", fontWeight: 500 }}>{headline}</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ */
export function ProductOverview() {
  const { locale } = useI18n();
  const t = locale === "zh-CN" || locale === "zh-TW" ? T.zh : T.en;

  /* refs for section visibility */
  const introRef = useRef<HTMLDivElement>(null);
  const adv1Ref = useRef<HTMLDivElement>(null);
  const adv2Ref = useRef<HTMLDivElement>(null);
  const adv3Ref = useRef<HTMLDivElement>(null);
  const adv4Ref = useRef<HTMLDivElement>(null);
  const adv5Ref = useRef<HTMLDivElement>(null);

  const introIn = useInView(introRef, { once: true, margin: "-60px" });
  const adv1In = useInView(adv1Ref, { once: true, margin: "-60px" });
  const adv2In = useInView(adv2Ref, { once: true, margin: "-60px" });
  const adv3In = useInView(adv3Ref, { once: true, margin: "-60px" });
  const adv4In = useInView(adv4Ref, { once: true, margin: "-60px" });
  const adv5In = useInView(adv5Ref, { once: true, margin: "-60px" });

  return (
    <div className="bg-[#0a0000]">

      {/* ══ INTRO ══════════════════════════════════════════════ */}
      <div ref={introRef} className="max-w-6xl mx-auto px-6 py-20">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={introIn ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5">
              <Film className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-400 text-xs font-semibold tracking-widest uppercase">{t.badge}</span>
            </span>
          </div>
          <h2 className="text-white mb-6" style={{ fontFamily: "Playfair Display", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, lineHeight: 1.15 }}>
            {t.title}
          </h2>
          <div className="grid lg:grid-cols-5 gap-10 items-center">
            <div className="lg:col-span-3 space-y-4">
              <p className="text-gray-300" style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)", lineHeight: 1.85 }}>
                {t.intro1}
              </p>
              <p className="text-gray-400" style={{ fontSize: "clamp(0.85rem, 1.3vw, 0.95rem)", lineHeight: 1.85 }}>
                {t.intro2}
              </p>
            </div>
            {/* Cinematic image panel */}
            <div className="lg:col-span-2 relative rounded-2xl overflow-hidden" style={{ height: 260 }}>
              <img src={IMG_CLAPPER} alt="Film production" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0000]/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-xs text-red-400 font-semibold tracking-wider uppercase mb-1">Lollipop Drama</div>
                <div className="text-white font-bold" style={{ fontSize: "1.05rem" }}>Global AIGC Creator Ecosystem</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Pillars: Positioning / Mission / Vision ── */}
        <div className="grid md:grid-cols-3 gap-5">
          {t.pillars.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 30 }}
              animate={introIn ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.12 }}
              className="group relative rounded-2xl border border-white/8 bg-white/[0.02] p-6 overflow-hidden hover:border-red-500/30 hover:bg-white/[0.04] transition-all duration-500"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-red-500/0 via-red-500/40 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <p.icon className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-red-400 text-xs font-semibold tracking-widest uppercase mb-2">{p.label}</div>
              <p className="text-gray-300" style={{ fontSize: "0.88rem", lineHeight: 1.75 }}>{p.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Core advantages label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={introIn ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-center gap-4 mt-20"
        >
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/15 to-orange-500/10 border border-red-500/20 rounded-full px-5 py-2">
              <Star className="w-4 h-4 text-orange-400 fill-orange-400/30" />
              <span className="text-white font-semibold text-sm">{t.coreBadge}</span>
            </span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
        </motion.div>
      </div>

      {/* ══ ADV ① GLOBAL ══════════════════════════════════════ */}
      <div ref={adv1Ref} className="py-20 bg-gradient-to-b from-[#0a0000] to-[#0d0000]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={adv1In ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
            <AdvHeader num={t.adv1.num} title={t.adv1.title} headline={t.adv1.headline} badge={t.coreBadge} />
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-10 items-stretch">
            {/* Left: content */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={adv1In ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.1 }}>
              <p className="text-gray-400 mb-8" style={{ fontSize: "0.93rem", lineHeight: 1.8 }}>{t.adv1.desc}</p>

              {/* Stats row */}
              <div className="flex gap-6 mb-8">
                {t.adv1.stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 font-black" style={{ fontSize: "2rem" }}>{s.val}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Country tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {t.adv1.countries.map((c) => (
                  <motion.div
                    key={c.name}
                    whileHover={{ scale: 1.06, y: -2 }}
                    className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1.5 hover:border-red-500/30 hover:bg-white/[0.07] transition-all cursor-default"
                  >
                    <span className="text-base">{c.flag}</span>
                    <span className="text-gray-300 text-xs font-medium">{c.name}</span>
                  </motion.div>
                ))}
              </div>

              {/* Language support */}
              <div>
                <div className="text-gray-500 text-xs mb-2 tracking-wider uppercase">{t.adv1.langLabel}</div>
                <div className="flex flex-wrap gap-2">
                  {t.adv1.langs.map((l) => (
                    <span key={l} className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-lg px-3 py-1 text-red-300 text-xs font-medium">{l}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right: world image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={adv1In ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative rounded-3xl overflow-hidden"
              style={{ minHeight: 340 }}
            >
              <img src={IMG_WORLD} alt="Global coverage" className="w-full h-full object-cover absolute inset-0" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-black/70" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Globe className="w-16 h-16 text-red-400/60 mx-auto mb-4" />
                  <div className="text-white font-black" style={{ fontSize: "3.5rem", lineHeight: 1 }}>100+</div>
                  <div className="text-gray-300 mt-2 tracking-wider text-sm uppercase">Countries & Regions</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══ ADV ② LICENSE ══════════════════════════════════════ */}
      <div ref={adv2Ref} className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={adv2In ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
            <AdvHeader num={t.adv2.num} title={t.adv2.title} headline={t.adv2.headline} badge={t.coreBadge} />
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={adv2In ? { opacity: 1 } : {}} transition={{ delay: 0.15 }} className="text-gray-400 mb-10" style={{ fontSize: "0.93rem", lineHeight: 1.8 }}>
            {t.adv2.desc}
          </motion.p>

          {/* Top stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={adv2In ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          >
            {t.adv2.stats.map((s, i) => (
              <div key={s.label} className="relative rounded-2xl border border-white/8 bg-white/[0.03] p-5 text-center overflow-hidden group hover:border-red-500/30 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-orange-500/0 group-hover:from-red-500/5 group-hover:to-orange-500/5 transition-all" />
                <div className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 font-black relative z-10" style={{ fontSize: "1.6rem" }}>{s.val}</div>
                <div className="text-gray-500 text-xs mt-1 relative z-10">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Genre bento grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {t.adv2.genres.map((g, i) => (
              <motion.div
                key={g.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={adv2In ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.05 * i }}
                whileHover={{ scale: 1.05, y: -3 }}
                className="group relative bg-white/[0.03] border border-white/8 rounded-2xl p-4 hover:border-red-500/30 hover:bg-white/[0.06] transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-orange-500/0 group-hover:from-red-500/8 group-hover:to-orange-500/5 transition-all duration-500" />
                <div className="text-2xl mb-2 relative z-10">{g.emoji}</div>
                <div className="text-white font-semibold relative z-10" style={{ fontSize: "0.85rem" }}>{g.name}</div>
                <div className="mt-2 relative z-10">
                  <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full px-2.5 py-0.5 font-bold" style={{ fontSize: "0.7rem" }}>{g.count}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Weekly badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={adv2In ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="flex justify-center mt-8"
          >
            <span className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 rounded-full px-5 py-2 text-orange-300 font-semibold text-sm">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              {t.adv2.weeklyBadge}
            </span>
          </motion.div>
        </div>
      </div>

      {/* ══ ADV ③ PRODUCTION ════════════════════════════════════ */}
      <div ref={adv3Ref} className="py-20 bg-gradient-to-b from-[#0d0000] to-[#0a0000]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={adv3In ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
            <AdvHeader num={t.adv3.num} title={t.adv3.title} headline={t.adv3.headline} badge={t.coreBadge} />
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: 3-tier pyramid */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={adv3In ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.1 }}>
              <p className="text-gray-400 mb-10" style={{ fontSize: "0.93rem", lineHeight: 1.8 }}>{t.adv3.desc}</p>

              {/* Pyramid tiers — top to bottom, narrowing at top */}
              <div className="flex flex-col gap-3">
                {t.adv3.tiers.map((tier, i) => (
                  <motion.div
                    key={tier.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={adv3In ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
                    style={{ marginLeft: `${i === 0 ? "20%" : i === 1 ? "10%" : "0%"}` }}
                    className="group relative rounded-xl border border-white/8 bg-white/[0.03] p-4 flex items-center gap-4 hover:border-white/15 transition-all overflow-hidden"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${tier.color} rounded-l-xl`} />
                    <span className="text-xl ml-2">{tier.icon}</span>
                    <div>
                      <div className="text-white font-bold" style={{ fontSize: "0.95rem" }}>{tier.label}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{tier.sub}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Milestone badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={adv3In ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.6 }}
                className="mt-6 inline-flex items-center gap-3 border border-red-500/25 bg-red-500/8 rounded-2xl px-5 py-3"
              >
                <TrendingUp className="w-5 h-5 text-red-400" />
                <span className="text-gray-300 text-sm">{t.adv3.milestoneLabel}</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 font-black text-xl">{t.adv3.milestone}</span>
                <span className="text-gray-400 text-sm">{t.adv3.milestoneUnit}</span>
              </motion.div>
            </motion.div>

            {/* Right: image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={adv3In ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative rounded-3xl overflow-hidden"
              style={{ height: 420 }}
            >
              <img src={IMG_FILM_CREW} alt="Film crew" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0000]/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3">
                  <div className="w-px h-8 bg-red-500/60" />
                  <div>
                    <div className="text-white font-bold">Professional Production</div>
                    <div className="text-gray-400 text-xs">PGC + AIGC Three-Tier Supply Chain</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══ ADV ④ REVENUE ══════════════════════════════════════ */}
      <div ref={adv4Ref} className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={adv4In ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
            <AdvHeader num={t.adv4.num} title={t.adv4.title} headline={t.adv4.headline} badge={t.coreBadge} />
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left: ring + number */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={adv4In ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <RingProgress pct={80} size={220} stroke={18} inView={adv4In} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 font-black" style={{ fontSize: "3rem", lineHeight: 1 }}>80%</div>
                  <div className="text-gray-500 text-xs mt-1">{t.adv4.ourLabel}</div>
                </div>
              </div>

              {/* Comparison bars */}
              <div className="w-full mt-8 space-y-4 max-w-xs">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-4">{t.adv4.comparisonTitle}</p>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-gray-400 text-sm">{t.adv4.industryLabel}</span>
                    <span className="text-gray-400 text-sm">{t.adv4.industryRange}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-white/20"
                      initial={{ width: 0 }}
                      animate={adv4In ? { width: "42%" } : {}}
                      transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-white font-semibold text-sm">{t.adv4.ourLabel}</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 font-bold text-sm">80%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500"
                      initial={{ width: 0 }}
                      animate={adv4In ? { width: "80%" } : {}}
                      transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: content + creator image */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={adv4In ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.2 }}>
              <p className="text-gray-400 mb-8" style={{ fontSize: "0.93rem", lineHeight: 1.8 }}>{t.adv4.desc}</p>

              <div className="space-y-3 mb-8">
                {t.adv4.bullets.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={adv4In ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300" style={{ fontSize: "0.9rem" }}>{b}</span>
                  </motion.div>
                ))}
              </div>

              {/* Creator image */}
              <div className="relative rounded-2xl overflow-hidden" style={{ height: 200 }}>
                <img src={IMG_CREATOR} alt="Creator" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0000]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="text-white font-bold" style={{ fontSize: "1.1rem" }}>Create & Earn</div>
                  <div className="text-gray-300 text-xs">Turn creativity into income</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══ ADV ⑤ TRUST ════════════════════════════════════════ */}
      <div ref={adv5Ref} className="py-20 bg-gradient-to-b from-[#0a0000] to-[#0d0000]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={adv5In ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
            <AdvHeader num={t.adv5.num} title={t.adv5.title} headline={t.adv5.headline} badge={t.coreBadge} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={adv5In ? { opacity: 1 } : {}}
            transition={{ delay: 0.15 }}
            className="text-gray-400 mb-12 max-w-2xl"
            style={{ fontSize: "0.93rem", lineHeight: 1.8 }}
          >
            {t.adv5.desc}
          </motion.p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {t.adv5.metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 30 }}
                animate={adv5In ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                whileHover={{ scale: 1.04, y: -4 }}
                className="group relative rounded-2xl border border-white/8 bg-white/[0.02] p-6 text-center overflow-hidden hover:border-red-500/25 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-orange-500/0 group-hover:from-red-500/5 group-hover:to-orange-500/5 transition-all duration-500" />
                <div className={`text-transparent bg-clip-text bg-gradient-to-r ${m.color} font-black relative z-10`} style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", lineHeight: 1.2 }}>
                  {m.val}
                </div>
                <div className="text-gray-500 text-xs mt-2 relative z-10">{m.label}</div>
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${m.color} opacity-0 group-hover:opacity-40 transition-opacity`} />
              </motion.div>
            ))}
          </div>

          {/* Trust statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={adv5In ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 flex items-center justify-center gap-3"
          >
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            ))}
            <span className="text-gray-400 ml-2 text-sm">Trusted by creators & studios worldwide</span>
          </motion.div>
        </div>
      </div>

    </div>
  );
}
