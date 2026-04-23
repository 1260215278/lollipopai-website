import { useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import bannerBg from "../../imports/关于我们-_banner-背景-1.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import companyImg from "../../imports/压缩图片.png";
import { Footer } from "./Footer";
import { useI18n } from "../i18n";

const heroImg = bannerBg;

/* ── Animated section wrapper ── */
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
      className={`max-w-6xl mx-auto px-6 py-20 ${className}`}
    >
      {children}
    </motion.section>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="text-center mb-14">
      <h2 className="text-white mb-3" style={{ fontSize: "2rem", fontWeight: 700 }}>{title}</h2>
      <div className="w-16 h-1 mx-auto rounded-full bg-gradient-to-r from-red-500 to-orange-500 mb-4" />
      {sub && <p className="text-gray-400 max-w-2xl mx-auto" style={{ fontSize: "0.95rem" }}>{sub}</p>}
    </div>
  );
}

/* ── Team ── */
const teamAssets = [
  { photo: "https://images.unsplash.com/photo-1738566061505-556830f8b8f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGJ1c2luZXNzJTIwZXhlY3V0aXZlJTIwcG9ydHJhaXQlMjBtYW58ZW58MXx8fHwxNzc2NjY5NDQ3fDA&ixlib=rb-4.1.0&q=60&w=256" },
  { photo: "https://images.unsplash.com/photo-1758518729459-235dcaadc611?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGV4ZWN1dGl2ZSUyMGhlYWRzaG90fGVufDF8fHx8MTc3NjY2OTQ0OHww&ixlib=rb-4.1.0&q=60&w=256" },
  { photo: "https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbiUyMHBvcnRyYWl0JTIwcHJvZmVzc2lvbmFsJTIwc3VpdHxlbnwxfHx8fDE3NzY2Njk0NDl8MA&ixlib=rb-4.1.0&q=60&w=256" },
  { photo: "https://images.unsplash.com/photo-1610387694365-19fafcc86d86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjB3b21hbiUyMHBvcnRyYWl0JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3NjY2OTQ0OXww&ixlib=rb-4.1.0&q=60&w=256" },
];

/* ── Partners ── */
const partnerAssets = [
  { icon: "TV", color: "from-blue-500 to-cyan-400" },
  { icon: "AM", color: "from-red-500 to-pink-400" },
  { icon: "GS", color: "from-emerald-500 to-teal-400" },
  { icon: "DP", color: "from-orange-500 to-yellow-400" },
  { icon: "PF", color: "from-purple-500 to-violet-400" },
  { icon: "SR", color: "from-rose-500 to-red-400" },
  { icon: "HD", color: "from-sky-500 to-blue-400" },
  { icon: "SV", color: "from-amber-500 to-orange-400" },
];

export function AboutPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);
  const { messages } = useI18n();
  const team = messages.about.team.map((member, index) => ({
    ...member,
    photo: teamAssets[index].photo,
  }));
  const partners = messages.about.partners.map((partner, index) => ({
    ...partner,
    icon: partnerAssets[index].icon,
    color: partnerAssets[index].color,
  }));

  return (
    <>
      {/* ─ Hero Banner ─ */}
      <section className="relative w-full h-[70vh] min-h-[480px] flex items-center justify-center overflow-hidden">
        <img
          src={heroImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[#0a0000]" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-6"
        >
          <h1 className="text-white mb-4" style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 800, lineHeight: 1.15 }}>
            {messages.about.heroTitle}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">{messages.about.heroHighlight}</span>
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto" style={{ fontSize: "1.1rem" }}>
            {messages.about.heroSubtitle}
          </p>
        </motion.div>
      </section>

      {/* ─ Company Intro ─ */}
      <Section>
        <SectionTitle title={messages.about.companyTitle} sub={messages.about.companySub} />
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            {messages.about.companyParagraphs.map((paragraph) => (
              <p key={paragraph} className="text-gray-300 mb-5" style={{ fontSize: "0.95rem", lineHeight: 1.8 }}>
                {paragraph}
              </p>
            ))}
            <div className="flex gap-8 mt-8">
              {messages.about.companyStats.map((s) => (
                <div key={s.label}>
                  <div className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400" style={{ fontSize: "1.8rem", fontWeight: 800 }}>{s.num}</div>
                  <div className="text-gray-500" style={{ fontSize: "0.8rem" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden">
            <ImageWithFallback src={companyImg} alt={messages.common.brand} className="w-full h-full object-contain max-h-[416px]" loading="lazy" />
          </div>
        </div>
      </Section>

      {/* ─ Outstanding Team ─ */}
      <Section>
        <SectionTitle title={messages.about.teamTitle} sub={messages.about.teamSub} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group text-center bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-red-500/30 transition-all duration-500"
            >
              <div className="w-28 h-28 mx-auto mb-5 rounded-full overflow-hidden border-2 border-red-500/20 group-hover:border-red-500/50 transition-colors">
                <ImageWithFallback src={m.photo} alt={m.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <h3 className="text-white mb-1" style={{ fontSize: "1.05rem", fontWeight: 600 }}>{m.name}</h3>
              {/* <p className="text-red-400 mb-3" style={{ fontSize: "0.8rem", fontWeight: 500 }}>{m.role}</p> */}
              <p className="text-gray-500" style={{ fontSize: "0.8rem", lineHeight: 1.6 }}>{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ─ Strategic Partners ─ */}
      <Section>
        <SectionTitle title={messages.about.partnersTitle} sub={messages.about.partnersSub} />
        <div className="relative overflow-hidden">
          {/* Left/right fade masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0a0000] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0a0000] to-transparent z-10 pointer-events-none" />
          <motion.div
            className="flex gap-5 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, ease: "linear", repeat: Infinity }}
          >
            {[...partners, ...partners].map((p, i) => (
              <div
                key={`${p.name}-${i}`}
                className="group relative bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-red-500/30 hover:bg-white/[0.05] transition-all duration-500 flex-shrink-0"
                style={{ width: 280 }}
              >
                {/* Logo icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-white" style={{ fontSize: "0.85rem", fontWeight: 800, letterSpacing: "0.02em" }}>{p.icon}</span>
                </div>
                {/* Company name */}
                <h4 className="text-white mb-2" style={{ fontSize: "0.95rem", fontWeight: 600 }}>{p.name}</h4>
                {/* Description */}
                <p className="text-gray-500" style={{ fontSize: "0.78rem", lineHeight: 1.65 }}>{p.desc}</p>
                {/* Hover glow */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${p.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none`} />
              </div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
    </>
  );
}
