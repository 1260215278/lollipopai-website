import { useEffect } from "react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Footer } from "./Footer";
import { useI18n } from "../i18n";

const heroImg =
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1600&q=70";

/* ── Animated section wrapper (mirrors AboutPage) ── */
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

const highlights = [
  { num: "80%", label: "Max creator revenue share" },
  { num: "Net-30", label: "Payout cycle" },
  { num: "0", label: "Minimum followers required" },
  { num: "80+", label: "Countries for distribution" },
];

const eligibility = [
  "No minimum follower count — start monetizing from your first published episode.",
  "Open to solo creators, small teams, and studios of any size.",
  "Available from the free tier; no paid plan required to earn.",
  "Open to creators in all supported regions (80+ countries, 15+ languages).",
];

const payoutSteps = [
  "Earnings accrue from views, engagement, and subscription conversion on your published dramas.",
  "Payouts settle on a Net-30 cycle — within 30 days after the close of each settlement period.",
  "Supported methods include bank transfer and major digital payment rails; currency follows your payout region.",
  "A transparent earnings dashboard shows gross, platform share, and your net payout at every step.",
];

const ipRules = [
  "Creators retain ownership of original scripts, characters, and footage they author.",
  "AI-assisted output must follow platform labeling and originality rules (no deceptive deepfakes of real persons).",
  "Published content licenses the platform to distribute; it does not transfer your underlying IP.",
  "Use only assets you own or that are licensed for commercial use.",
];

const programRules = [
  "Content must comply with platform community guidelines and applicable laws in every distribution region.",
  "No plagiarism, reposting of third-party copyrighted works, or fabricated engagement.",
  "Revenue is forfeited for content found to violate terms or infringe third-party rights.",
  "Program terms may update; the live Creator Program page is the authoritative source.",
];

const faqs = [
  {
    q: "Do I need followers before I can earn?",
    a: "No. There is no minimum follower requirement. You can begin monetizing as soon as your first drama is published and meets content guidelines.",
  },
  {
    q: "What is the revenue share?",
    a: "Creators keep up to 80% of platform revenue on their content. The exact split is stated in your creator agreement and the official Creator Program terms.",
  },
  {
    q: "When and how do I get paid?",
    a: "Payouts run on a Net-30 cycle through bank transfer or supported digital payment methods, with a full breakdown in your earnings dashboard.",
  },
  {
    q: "Who owns the content I make?",
    a: "You retain ownership of your original IP. Publishing grants the platform a distribution license; it does not transfer your rights.",
  },
];

export function CreatorProgramPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);
  const { messages } = useI18n();
  const brand = messages.common?.brand ?? "Lollipop Drama";

  return (
    <>
      {/* ─ Hero Banner ─ */}
      <section className="relative w-full h-[70vh] min-h-[480px] flex items-center justify-center overflow-hidden">
        <img
          src={heroImg}
          alt="Lollipop Drama creator program — monetize AI short dramas"
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
            {brand} <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Creator Program</span>
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto" style={{ fontSize: "1.1rem" }}>
            Creators keep up to 80% revenue share, payouts on a Net-30 cycle, and there is no minimum follower requirement to start earning.
          </p>
        </motion.div>
      </section>

      {/* ─ Highlights ─ */}
      <Section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {highlights.map((h) => (
            <div key={h.label} className="text-center bg-white/[0.03] border border-white/5 rounded-2xl p-6">
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400" style={{ fontSize: "1.8rem", fontWeight: 800 }}>{h.num}</div>
              <div className="text-gray-500 mt-2" style={{ fontSize: "0.8rem" }}>{h.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ─ Revenue Share ─ */}
      <Section>
        <SectionTitle title="Revenue Share" sub="The core of the program: creators keep the majority of what they earn." />
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-gray-300 mb-5" style={{ fontSize: "0.95rem", lineHeight: 1.8 }}>
              {brand} is built for creators. You keep up to <span className="text-white font-semibold">80% of platform revenue</span> generated by your dramas, across views, engagement, and subscription conversion. The remaining share covers distribution, hosting, payment processing, and the built-in LunoTV creation tools.
            </p>
            <p className="text-gray-300" style={{ fontSize: "0.95rem", lineHeight: 1.8 }}>
              The exact percentage is written into your creator agreement and the official terms on this page — not a verbal promise.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-white/[0.03] p-8">
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400" style={{ fontSize: "3.2rem", fontWeight: 800 }}>80%</div>
            <div className="text-gray-400 mt-1" style={{ fontSize: "0.95rem" }}>Maximum creator revenue share — the highest tier in the program.</div>
          </div>
        </div>
      </Section>

      {/* ─ Eligibility ─ */}
      <Section>
        <SectionTitle title="Who Can Join" sub="No gatekeeping. If you can publish a drama, you can monetize." />
        <ul className="max-w-3xl mx-auto space-y-4">
          {eligibility.map((item) => (
            <li key={item} className="flex items-start gap-3 text-gray-300" style={{ fontSize: "0.95rem", lineHeight: 1.8 }}>
              <span className="mt-2 w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-400 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ─ How Payouts Work ─ */}
      <Section>
        <SectionTitle title="How Payouts Work" sub="A transparent, predictable Net-30 settlement." />
        <div className="grid md:grid-cols-2 gap-6">
          {payoutSteps.map((step, i) => (
            <div key={step} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 font-bold mb-2" style={{ fontSize: "1.1rem" }}>{i + 1}</div>
              <p className="text-gray-300" style={{ fontSize: "0.95rem", lineHeight: 1.8 }}>{step}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ─ Content & IP ─ */}
      <Section>
        <SectionTitle title="Content & Intellectual Property" sub="You create it, you own it." />
        <ul className="max-w-3xl mx-auto space-y-4">
          {ipRules.map((item) => (
            <li key={item} className="flex items-start gap-3 text-gray-300" style={{ fontSize: "0.95rem", lineHeight: 1.8 }}>
              <span className="mt-2 w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-400 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ─ Program Rules ─ */}
      <Section>
        <SectionTitle title="Program Rules" sub="Simple rules that keep the ecosystem fair." />
        <ul className="max-w-3xl mx-auto space-y-4">
          {programRules.map((item) => (
            <li key={item} className="flex items-start gap-3 text-gray-300" style={{ fontSize: "0.95rem", lineHeight: 1.8 }}>
              <span className="mt-2 w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-400 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ─ FAQ ─ */}
      <Section>
        <SectionTitle title="Frequently Asked Questions" />
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((f) => (
            <div key={f.q} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
              <h3 className="text-white mb-2" style={{ fontSize: "1.05rem", fontWeight: 600 }}>{f.q}</h3>
              <p className="text-gray-400" style={{ fontSize: "0.92rem", lineHeight: 1.8 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
    </>
  );
}
