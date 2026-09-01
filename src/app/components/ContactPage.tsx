import { useEffect, useRef, type ReactNode } from "react";
import { motion, useInView } from "motion/react";
import { Phone, Mail } from "lucide-react";
import bannerBg from "../../imports/about-banner-bg.webp";
import teamJames from "../../imports/figma/team-james.webp";
import teamSarah from "../../imports/figma/team-sarah.webp";
import teamDavid from "../../imports/figma/team-david.webp";
import teamEmily from "../../imports/figma/team-emily.webp";
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

const teamPhotos = [teamJames, teamSarah, teamDavid, teamEmily];

function TelegramIcon() {
  return (
    <div className="w-16 h-16 rounded-full bg-[#29a9eb] flex items-center justify-center mx-auto mb-5">
      <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-current">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <div className="w-16 h-16 rounded-full bg-[#25d366] flex items-center justify-center mx-auto mb-5">
      <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
      </svg>
    </div>
  );
}

export function ContactPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { messages } = useI18n();

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  const team = messages.about.team.map((member, index) => ({
    ...member,
    photo: teamPhotos[index],
  }));

  const contactCards = [
    {
      icon: (
        <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-5">
          <Phone className="w-8 h-8 text-white" />
        </div>
      ),
      title: messages.contact.cards[0].title,
      detail: messages.contact.cards[0].detail,
      isLink: false,
    },
    {
      icon: (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 via-yellow-400 to-green-500 flex items-center justify-center mx-auto mb-5">
          <Mail className="w-8 h-8 text-white" />
        </div>
      ),
      title: messages.contact.cards[1].title,
      detail: messages.contact.cards[1].detail,
      isLink: false,
    },
    {
      icon: <TelegramIcon />,
      title: messages.contact.cards[2].title,
      detail: messages.contact.cards[2].detail,
      isLink: true,
    },
    {
      icon: <WhatsAppIcon />,
      title: messages.contact.cards[3].title,
      detail: messages.contact.cards[3].detail,
      isLink: true,
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
        <SectionTitle title={messages.about.teamTitle} sub={messages.about.teamSub} />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {contactCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className="bg-white/[0.03] border border-white/8 rounded-2xl p-8 text-center hover:bg-white/[0.06] hover:border-red-500/30 transition-all duration-300"
              >
                {card.icon}
                <h3 className="text-white mb-2" style={{ fontSize: "1.1rem", fontWeight: 700 }}>{card.title}</h3>
                {card.isLink ? (
                  <a href="#" className="text-gray-300 underline underline-offset-4 hover:text-white transition-colors" style={{ fontSize: "0.9rem" }}>
                    {card.detail}
                  </a>
                ) : (
                  <p className="text-gray-300" style={{ fontSize: "0.9rem" }}>{card.detail}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </main>
  );
}
