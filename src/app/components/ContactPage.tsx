import { useEffect, useRef, type ReactNode } from "react";
import { motion, useInView } from "motion/react";
import bannerBg from "../../imports/about-banner-bg.webp";
import emailIcon from "../../imports/figma/contact-email-icon.svg";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Footer } from "./Footer";
import { ProductOverview } from "./ProductOverview";
import { useI18n } from "../i18n";

function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
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

const team = [
  { name: "James C.", role: "Co-Founder", desc: "Veteran in entertainment & technology with extensive industry experience.", photo: "https://images.unsplash.com/photo-1605980776566-0486c3ac7617?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=256" },
  { name: "Sarah L.", role: "Operations", desc: "Global operations specialist with multi-market scaling expertise.", photo: "https://images.unsplash.com/photo-1585240975858-7264fd020798?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=256" },
  { name: "David P.", role: "Technology", desc: "Expert in AI and distributed systems with deep technical background.", photo: "https://images.unsplash.com/photo-1787647560650-3d6c82618cea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=256" },
  { name: "Emily W.", role: "Finance", desc: "Seasoned finance professional with strategic investment background.", photo: "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=256" },
];

const teamHeading = {
  zh: { title: "核心团队", sub: "引领娱乐行业创新的世界级领导团队" },
  en: { title: "Outstanding Team", sub: "A world-class leadership team driving innovation in entertainment" },
};

export function ContactPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { messages, locale } = useI18n();
  const heading = locale === "zh-CN" || locale === "zh-TW" ? teamHeading.zh : teamHeading.en;

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  const contactCards = [
    {
      icon: emailIcon,
      title: messages.contact.cards[5].title,
      detail: messages.contact.cards[5].detail,
      bg: "linear-gradient(135deg, #fb2c36 0%, #fdc700 50%, #00c950 100%)",
    },
    {
      icon: emailIcon,
      title: messages.contact.cards[4].title,
      detail: messages.contact.cards[4].detail,
      bg: "linear-gradient(135deg, #fb2c36 0%, #fdc700 50%, #00c950 100%)",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0a0000]">
      <section className="relative w-full h-[70vh] min-h-[480px] flex items-center justify-center overflow-hidden">
        <img
          src={bannerBg}
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
          <p className="text-gray-300 max-w-2xl mx-auto" style={{ fontSize: "1.1rem" }}>{messages.about.heroSubtitle}</p>
        </motion.div>
      </section>

      <ProductOverview />

      <Section>
        <SectionTitle title={heading.title} sub={heading.sub} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group text-center bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-red-500/30 transition-all duration-500"
            >
              <div className="w-28 h-28 mx-auto mb-5 rounded-full overflow-hidden border-2 border-red-500/20 group-hover:border-red-500/50 transition-colors">
                <ImageWithFallback src={member.photo} alt={member.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <h3 className="text-white mb-1" style={{ fontSize: "1.05rem", fontWeight: 600 }}>{member.name}</h3>
              <p className="text-red-400 mb-3" style={{ fontSize: "0.8rem", fontWeight: 500 }}>{member.role}</p>
              <p className="text-gray-500" style={{ fontSize: "0.8rem", lineHeight: 1.6 }}>{member.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <SectionTitle title={messages.contact.title} sub={messages.contact.subtitle} />
          <div className="mx-auto grid max-w-[640px] sm:grid-cols-2 gap-5 justify-items-center">
            {contactCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className="w-full max-w-[261px] min-h-[208px] bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 text-center hover:bg-white/[0.06] hover:border-red-500/30 transition-all duration-300"
              >
                <div
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                  style={{ background: card.bg }}
                >
                  <img src={card.icon} alt="" className="w-8 h-8" loading="lazy" />
                </div>
                <h3 className="text-white mt-5" style={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: "26.4px" }}>{card.title}</h3>
                <a
                  href={`mailto:${card.detail}`}
                  className="inline-block text-gray-300 underline underline-offset-2 mt-2"
                  style={{ fontSize: "0.9rem", lineHeight: "21.6px" }}
                >
                  {card.detail}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </main>
  );
}
