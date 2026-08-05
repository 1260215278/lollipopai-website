import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Apple, Smartphone } from "lucide-react";
import bannerImg from "../../imports/banner6.png";
import bannerImg2 from "../../imports/每日新闻海报1-1.png";
import { ParticleBackground } from "./ParticleBackground";
import { useI18n } from "../i18n";

const bannerImages = [bannerImg, bannerImg2];

function AnimatedCounter({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  // SSR/无 JS 环境下直接渲染终值（真实数字），避免爬虫看到 "0+ / 0M+" 占位；
  // 客户端首帧从 0 起跳做计数动画。suppressHydrationWarning 屏蔽 SSR/CSR 初值差异告警。
  const [count, setCount] = useState(typeof window === "undefined" ? target : 0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const dur = 2200;
    const step = target / (dur / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <div ref={ref} className="text-center overflow-visible">
      <div className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent whitespace-nowrap" style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: "clamp(2rem, 5vw, 3.5rem)",
        fontWeight: 900,
        lineHeight: 1.2,
      }} suppressHydrationWarning>
        {count.toLocaleString()}{suffix}
      </div>
      <p className="text-gray-400 mt-1" style={{ fontSize: "0.85rem" }}>{label}</p>
      <div className="mt-4 mx-auto w-16 h-px bg-white/10 rounded-full" />
    </div>
  );
}

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { messages } = useI18n();

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <section id="home" className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center pt-20 pb-0">
        <ParticleBackground />
        {/* Ambient glows */}
        <div className="absolute top-[-200px] right-[-100px] w-[700px] h-[700px] bg-red-600/10 rounded-full blur-[180px]" />
        <div className="absolute bottom-[-150px] left-[-100px] w-[500px] h-[500px] bg-orange-600/8 rounded-full blur-[150px]" />

        {/* Banner Image Carousel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full z-0"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full"
          >
            {bannerImages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={messages.hero.bannerAlt[i]}
                className={`w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${i === 0 ? "relative" : "absolute inset-0"}`}
                style={{ opacity: activeIndex === i ? 1 : 0 }}
                loading={i === 0 ? "eager" : "lazy"}
                fetchpriority={i === 0 ? "high" : "low"}
                decoding="async"
              />
            ))}
          </motion.div>
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/10" />
        </motion.div>

        {/* Indicators */}
        {/* Indicators moved below hero */}

        {/* Download Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4 z-10 relative px-[24px] py-[0px] mx-[0px] mt-[860px] mb-[0px]"
        >
          <a href="https://h5.lollipop.im/" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white px-8 py-3.5 rounded-full transition-all shadow-lg shadow-red-900/40 hover:shadow-red-600/50 hover:scale-105 min-w-[210px] justify-center">
            <Apple className="w-5 h-5" />
            <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>{messages.common.appStore}</span>
          </a>
          <a href="https://play.google.com/store/apps/details?id=com.StargetVenturesLLC.hks" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white px-8 py-3.5 rounded-full transition-all shadow-lg shadow-red-900/40 hover:shadow-red-600/50 hover:scale-105 min-w-[210px] justify-center">
            <Smartphone className="w-5 h-5" />
            <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>{messages.common.googlePlay}</span>
          </a>
        </motion.div>

        {/* Tagline — H1 for SEO（审计报告 P2-14：提升视觉权重） */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="text-center mt-8 px-6 z-10 relative"
        >
          <h1 className="text-white" style={{ fontSize: "clamp(1.3rem, 3.5vw, 2rem)", lineHeight: 1.6, fontWeight: 700, margin: 0, textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>
            {messages.hero.taglineLine1}
          </h1>
          <p className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent" style={{ fontSize: "clamp(1.1rem, 2.8vw, 1.5rem)", fontWeight: 700, lineHeight: 1.8, marginTop: "0.3rem" }}>
            {messages.hero.taglineLine2}
          </p>
        </motion.div>

        {/* Quick Links — 首页快捷入口（Blog / Genres / Popular / Tools） */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-5 px-6 z-10 relative"
        >
          <a href="/blog" className="px-4 py-2 rounded-full border border-white/20 text-gray-300 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all text-sm font-medium">
            {messages.hero.quickLinks?.blog ?? "Blog"}
          </a>
          <a href="/genre/romance" className="px-4 py-2 rounded-full border border-white/20 text-gray-300 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all text-sm font-medium">
            {messages.hero.quickLinks?.genres ?? "Genres"}
          </a>
          <a href="/drama/temptation-ceo" className="px-4 py-2 rounded-full border border-white/20 text-gray-300 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all text-sm font-medium">
            {messages.hero.quickLinks?.popular ?? "Popular"}
          </a>
          <a href="/creating" className="px-4 py-2 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-white hover:border-red-400 hover:bg-red-500/30 transition-all text-sm font-medium">
            {messages.hero.quickLinks?.aiTools ?? "AI Tools"}
          </a>
        </motion.div>

      </section>
      <div className="flex items-center justify-center gap-2 py-4 bg-black">
        {bannerImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${activeIndex === i ? "w-8 bg-gradient-to-r from-red-500 to-orange-500" : "w-3 bg-white/20 hover:bg-white/40"}`}
          />
        ))}
      </div>
    </>
  );
}

export function StatsSection() {
  const { messages } = useI18n();

  return (
    <section className="relative bg-black px-[24px] py-[32px]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-3 gap-4 md:gap-16 py-10 px-6 overflow-visible"
        >
          <AnimatedCounter target={5000} suffix="+" label={messages.hero.stats[0].label} />
          <AnimatedCounter target={10} suffix="M+" label={messages.hero.stats[1].label} />
          <AnimatedCounter target={50} suffix="+" label={messages.hero.stats[2].label} />
        </motion.div>
      </div>
    </section>
  );
}
