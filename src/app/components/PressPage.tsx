import { useEffect } from "react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { ExternalLink, Mail, Phone, MapPin, Twitter, Instagram, Youtube, Facebook } from "lucide-react";
import { Footer } from "./Footer";

const SITE_URL = "https://www.lollipop.im";

const pressReleases = [
  {
    date: "2024",
    title: "Lollipop Drama Launches AI-Powered Short Drama Platform with 80% Creator Revenue Share",
    summary:
      "Lollipop Drama announces the launch of its AI-powered short drama creation and streaming platform, offering creators an industry-leading 80% revenue share and built-in AI video generation tools.",
    source: "Company Announcement",
    url: `${SITE_URL}/about`,
  },
  {
    date: "2024",
    title: "Nyx Entertainment Group and Korean Cultural Investment Fund Joint Venture Targets Global Short Drama Market",
    summary:
      "The joint venture between Hong Kong-based Nyx Entertainment Group and the Korean Cultural Investment Fund aims to systematically promote K-Contents globally through AI-powered short drama production and distribution.",
    source: "Company Announcement",
    url: `${SITE_URL}/about`,
  },
];

const mediaAssets = [
  { label: "Company Logo (PNG)", url: `${SITE_URL}/og-image.png` },
  { label: "App Icon (PNG)", url: `${SITE_URL}/favicon.png` },
  { label: "Brand Guidelines", url: `${SITE_URL}/about` },
];

const socialLinks = [
  { icon: Twitter, label: "Twitter / X", url: "https://twitter.com/lollipopai" },
  { icon: Instagram, label: "Instagram", url: "https://www.instagram.com/lollipopai" },
  { icon: Youtube, label: "YouTube", url: "https://www.youtube.com/@lollipopai" },
  { icon: Facebook, label: "Facebook", url: "https://www.facebook.com/lollipopai" },
];

const stats = [
  { num: "1M+", label: "Global Users (as of 2026)" },
  { num: "15,000+", label: "Premium Short Dramas" },
  { num: "100+", label: "Countries" },
  { num: "80%", label: "Creator Revenue Share" },
];

export function PressPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const heroRef = useRef<HTMLElement>(null);
  const inView = useInView(heroRef, { once: true, margin: "-60px" });

  return (
    <>
      <section className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden pt-24 pb-16 bg-gradient-to-b from-[#1a0000] to-[#0a0000]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-[#0a0000]" />
        <motion.div
          ref={heroRef}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-6 max-w-3xl mx-auto"
        >
          <h1 className="text-white mb-4" style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.15 }}>
            Press & Media
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto" style={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
            Lollipop Drama is an AI-powered short drama creation and streaming platform. Built-in AI tools for text-to-video, image generation, face swap, and style transfer. 15,000+ premium dramas, 80% creator revenue share, 1M+ users across 100+ countries.
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400" style={{ fontSize: "2.2rem", fontWeight: 800 }}>
                {s.num}
              </div>
              <div className="text-gray-500 mt-1" style={{ fontSize: "0.85rem" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Company Overview */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-white mb-6" style={{ fontSize: "1.8rem", fontWeight: 700 }}>
          About Lollipop Drama
        </h2>
        <div className="space-y-4">
          <p className="text-gray-300" style={{ fontSize: "0.95rem", lineHeight: 1.8 }}>
            Lollipop Drama is a joint venture between Hong Kong-based Nyx Entertainment Group and the Korean Cultural Investment Fund. The platform combines built-in AI video generation tools with a premium short drama streaming library, enabling anyone to create and monetize content.
          </p>
          <p className="text-gray-300" style={{ fontSize: "0.95rem", lineHeight: 1.8 }}>
            Creators enjoy an industry-leading 80% revenue share, with built-in AI tools for text-to-video, image generation, face swap, and style transfer. The platform is available in 100+ countries with multilingual subtitles and serves 1M+ users worldwide.
          </p>
          <p className="text-gray-300" style={{ fontSize: "0.95rem", lineHeight: 1.8 }}>
            Founded in 2024 and headquartered in Singapore, Lollipop Drama is committed to the belief that everyone can create, creation can be monetized, and consumption is an incentive.
          </p>
        </div>
      </section>

      {/* Press Releases */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-white mb-6" style={{ fontSize: "1.8rem", fontWeight: 700 }}>
          News & Announcements
        </h2>
        <div className="space-y-6">
          {pressReleases.map((pr) => (
            <article key={pr.title} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-red-500/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-red-400" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  {pr.date}
                </span>
                <span className="text-gray-600" style={{ fontSize: "0.8rem" }}>
                  {pr.source}
                </span>
              </div>
              <h3 className="text-white mb-3" style={{ fontSize: "1.15rem", fontWeight: 600, lineHeight: 1.4 }}>
                {pr.title}
              </h3>
              <p className="text-gray-400 mb-4" style={{ fontSize: "0.9rem", lineHeight: 1.7 }}>
                {pr.summary}
              </p>
              <a
                href={pr.url}
                className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                style={{ fontSize: "0.85rem", fontWeight: 500 }}
              >
                Read more <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* Media Assets */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-white mb-6" style={{ fontSize: "1.8rem", fontWeight: 700 }}>
          Media Assets
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {mediaAssets.map((asset) => (
            <a
              key={asset.label}
              href={asset.url}
              className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:border-red-500/20 hover:bg-white/[0.05] transition-all duration-300"
            >
              <ExternalLink className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-gray-300" style={{ fontSize: "0.85rem" }}>
                {asset.label}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Social Links */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-white mb-6" style={{ fontSize: "1.8rem", fontWeight: 700 }}>
          Follow Us
        </h2>
        <div className="flex flex-wrap gap-4">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-xl px-5 py-3 hover:border-red-500/30 hover:bg-white/[0.05] transition-all duration-300"
            >
              <social.icon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300" style={{ fontSize: "0.85rem" }}>
                {social.label}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-white mb-6" style={{ fontSize: "1.8rem", fontWeight: 700 }}>
          Press Contact
        </h2>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-gray-300" style={{ fontSize: "0.9rem" }}>
            <Mail className="w-4 h-4 text-red-400" />
            <a href="mailto:business@lollipop.im" className="hover:text-white transition-colors">
              business@lollipop.im
            </a>
          </div>
          <div className="flex items-center gap-3 text-gray-300" style={{ fontSize: "0.9rem" }}>
            <Phone className="w-4 h-4 text-red-400" />
            <span>+65 80742120</span>
          </div>
          <div className="flex items-start gap-3 text-gray-300" style={{ fontSize: "0.9rem" }}>
            <MapPin className="w-4 h-4 text-red-400 mt-0.5" />
            <span>3 Gambas Crescent, #04-01, Nordcom One, Singapore 757088</span>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </>
  );
}
