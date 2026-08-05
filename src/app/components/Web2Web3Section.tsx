import { useRef, useState, useEffect } from "react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import bgImg from "../../imports/WEB2-WEB3-背景.png";
import { useI18n } from "../i18n";

const floatingTagPositions = [
  { x: "12%", y: "30%" },
  { x: "82%", y: "25%" },
  { x: "8%", y: "60%" },
  { x: "88%", y: "55%" },
  { x: "18%", y: "45%" },
  { x: "78%", y: "42%" },
];

const statAssets = [
  { end: 100, suffix: "M+" },
  { end: 50, suffix: "K+" },
  { end: 30, suffix: "+" },
];

function AnimatedCounter({ end, suffix, inView }: { end: number; suffix: string; inView: boolean }) {
  // SSR 直接渲染终值，避免爬虫看到 0；客户端做计数动画（suppressHydrationWarning 屏蔽初值差异）
  const [count, setCount] = useState(typeof window === "undefined" ? end : 0);
  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const duration = 2000;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, end]);
  return <span suppressHydrationWarning>{count}{suffix}</span>;
}

export function Web2Web3Section() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { messages } = useI18n();
  const floatingTags = floatingTagPositions.map((tag, index) => ({
    ...tag,
    label: messages.web3.floatingTags[index],
  }));
  const stats = statAssets.map((stat, index) => ({
    ...stat,
    label: messages.web3.stats[index].label,
  }));

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
    layoutEffect: false,
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 0.3, 0.7]);

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ minHeight: "90vh" }}
    >
      {/* Parallax background */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <ImageWithFallback
          src={bgImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-110"
          loading="lazy"
          decoding="async"
        />
      </motion.div>

      {/* Dynamic overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70"
        style={{ opacity: overlayOpacity }}
      />

      {/* Floating tags */}
      {floatingTags.map((tag, i) => (
        <motion.div
          key={tag.label}
          initial={{ opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 + i * 0.12, type: "spring", stiffness: 200 }}
          className="absolute z-10 hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
          style={{ left: tag.x, top: tag.y }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-white/70" style={{ fontSize: "0.75rem", fontWeight: 500 }}>{tag.label}</span>
          </motion.div>
        </motion.div>
      ))}

      {/* Animated particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`p-${i}`}
          className="absolute rounded-full"
          style={{
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            background: i % 2 === 0 ? "rgba(239,68,68,0.4)" : "rgba(251,146,60,0.3)",
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full min-h-[90vh] px-6 py-20">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center pt-8"
        >
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.3em" }}
            animate={inView ? { opacity: 1, letterSpacing: "0.15em" } : {}}
            transition={{ duration: 1, delay: 0.3 }}
            className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent inline-block"
            style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase" as const }}
          >
            {messages.web3.eyebrow}
          </motion.span>
          <h2
            className="text-white mt-2"
            style={{
              fontFamily: "Playfair Display",
              fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
              fontWeight: 800,
              letterSpacing: "0.02em",
            }}
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-block"
            >
              {messages.web3.titlePrefix}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 1.5 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="inline-block mx-1"
            >
              -
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400"
            >
              {messages.web3.titleHighlight}
            </motion.span>
          </h2>

          {/* Animated underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 1 }}
            className="mx-auto mt-4 h-[2px] w-24 bg-gradient-to-r from-red-500 to-orange-400 origin-center rounded-full"
          />
        </motion.div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex gap-10 md:gap-16 mb-10"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.7 + i * 0.15 }}
              className="text-center"
              whileHover={{ scale: 1.1 }}
            >
              <div
                className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800 }}
              >
                <AnimatedCounter end={stat.end} suffix={stat.suffix} inView={inView} />
              </div>
              <div className="text-gray-400 mt-1" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Description */}
        <div className="text-center max-w-4xl pb-8">
          {messages.web3.paragraphs.map((content, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 + i * 0.2 }}
              whileHover={{ x: 4 }}
            >
              <p
                className={`${i === 0 ? "text-gray-200 mb-3" : i === 1 ? "text-gray-300" : "text-gray-400 mt-3"}`}
                style={{ fontSize: i === 0 ? "clamp(0.85rem, 1.5vw, 1rem)" : "clamp(0.8rem, 1.3vw, 0.95rem)", lineHeight: 1.9 }}
              >
                {content}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
