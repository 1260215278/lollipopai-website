import { useEffect } from "react";
import { motion } from "motion/react";
import contactHero from "../../imports/figma/contact-hero.png";
import companyImg from "../../imports/figma/contact-company.png";
import teamJames from "../../imports/figma/team-james.png";
import teamSarah from "../../imports/figma/team-sarah.png";
import teamDavid from "../../imports/figma/team-david.png";
import teamEmily from "../../imports/figma/team-emily.png";
import emailIcon from "../../imports/figma/contact-email-icon.svg";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Footer } from "./Footer";
import { useI18n } from "../i18n";

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="text-center mb-14">
      <h2 className="text-white" style={{ fontSize: "2rem", fontWeight: 700, lineHeight: "48px" }}>{title}</h2>
      <div className="w-16 h-1 mx-auto rounded-full bg-gradient-to-r from-red-500 to-orange-500 mt-3" />
      {sub && <p className="text-gray-400 max-w-2xl mx-auto mt-4" style={{ fontSize: "0.95rem", lineHeight: "22.8px" }}>{sub}</p>}
    </div>
  );
}

const teamPhotos = [teamJames, teamSarah, teamDavid, teamEmily];

export function ContactPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);
  const { messages } = useI18n();
  const team = messages.about.team.map((member, index) => ({
    ...member,
    photo: teamPhotos[index],
  }));
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
      <section className="relative w-full h-[596px] overflow-hidden flex items-center justify-center">
        <img
          src={contactHero}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[#0a0000]" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 text-center px-6"
        >
          <h1 className="text-white" style={{ fontSize: "clamp(2.5rem, 5vw, 3.8rem)", fontWeight: 800, lineHeight: 1.15 }}>
            {messages.about.heroTitle}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">{messages.about.heroHighlight}</span>
          </h1>
          <p className="text-gray-300 mt-4" style={{ fontSize: "1.1rem", lineHeight: "26.4px" }}>
            {messages.about.heroSubtitle}
          </p>
        </motion.div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <SectionTitle title={messages.about.companyTitle} sub={messages.about.companySub} />
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            {messages.about.companyParagraphs.map((paragraph) => (
              <p key={paragraph} className="text-gray-300 mb-5" style={{ fontSize: "0.95rem", lineHeight: 1.8 }}>
                {paragraph}
              </p>
            ))}
            <div className="flex flex-wrap gap-8 mt-8">
              {messages.about.companyStats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400" style={{ fontSize: "1.8rem", fontWeight: 800, lineHeight: "43.2px" }}>
                    {stat.num}
                  </div>
                  <div className="text-gray-500" style={{ fontSize: "0.8rem" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden">
            <ImageWithFallback src={companyImg} alt={messages.common.brand} className="w-full max-h-[416px] object-contain" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <SectionTitle title={messages.about.teamTitle} sub={messages.about.teamSub} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <div
              key={member.name}
              className="text-center bg-white/[0.03] border border-white/5 rounded-2xl p-6 min-h-[303px]"
            >
              <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-red-500/20">
                <ImageWithFallback src={member.photo} alt={member.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <h3 className="text-white mt-5" style={{ fontSize: "1.05rem", fontWeight: 600, lineHeight: "25.2px" }}>{member.name}</h3>
              <p className="text-red-400 mt-1" style={{ fontSize: "0.8rem", fontWeight: 500, lineHeight: "19.2px" }}>{member.role}</p>
              <p className="text-gray-500 mt-3 mx-auto max-w-[209px]" style={{ fontSize: "0.8rem", lineHeight: 1.6 }}>{member.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <SectionTitle title={messages.contact.title} sub={messages.contact.subtitle} />
        <div className="mx-auto grid max-w-[640px] sm:grid-cols-2 gap-5 justify-items-center">
          {contactCards.map((card) => (
            <div
              key={card.title}
              className="w-full max-w-[261px] min-h-[208px] bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 text-center"
            >
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                style={{ background: card.bg }}
              >
                <img src={card.icon} alt="" className="w-8 h-8" loading="lazy" />
              </div>
              <h3 className="text-white mt-5" style={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: "26.4px" }}>{card.title}</h3>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="inline-block text-gray-300 underline underline-offset-2 mt-2"
                style={{ fontSize: "0.9rem", lineHeight: "21.6px" }}
              >
                {card.detail}
              </a>
            </div>
          ))}
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </main>
  );
}
