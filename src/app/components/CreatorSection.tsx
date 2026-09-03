import { motion, useInView } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { TrendingUp, Users, DollarSign, Award, ArrowRight } from "lucide-react";
import { useI18n } from "../i18n";

function Counter({ target, suffix }: { target: number; suffix: string }) {
  // SSR 直接渲染终值，避免爬虫看到 0；客户端做计数动画（suppressHydrationWarning 屏蔽初值差异）
  const [count, setCount] = useState(typeof window === "undefined" ? target : 0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let s = 0;
    const step = target / (2000 / 16);
    const t = setInterval(() => {
      s += step;
      if (s >= target) { setCount(target); clearInterval(t); } else setCount(Math.floor(s));
    }, 16);
    return () => clearInterval(t);
  }, [inView, target]);
  return <span className="font-[Inter]" ref={ref} suppressHydrationWarning>{count.toLocaleString()}{suffix}</span>;
}

const statAssets = [
  { icon: DollarSign, value: 80, suffix: "%" },
  { icon: Users, value: 100, suffix: "K+" },
  { icon: TrendingUp, value: 5000, suffix: "$" },
  { icon: Award, value: 500, suffix: "+" },
];

export function CreatorSection({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { messages } = useI18n();
  const stats = statAssets.map((stat, index) => ({
    ...stat,
    ...messages.creator.stats[index],
  }));

  return (
    <section id="creators" className="py-20 bg-gradient-to-b from-[#0d0000] to-[#0a0000] relative overflow-hidden">
      <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[200px]" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent" style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              {messages.creator.eyebrow}
            </span>
            <h2 className="text-white mt-3" style={{ fontFamily: "Playfair Display", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 700, lineHeight: 1.3 }}>
              {messages.creator.title}
            </h2>
            <p className="text-gray-400 mt-4" style={{ fontSize: "0.95rem", lineHeight: 1.8 }}>
              {messages.creator.description}
            </p>

            <div className="mt-8 space-y-4">
              {messages.creator.benefits.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex-shrink-0" />
                  <span className="text-gray-300" style={{ fontSize: "0.9rem" }}>{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <button
                onClick={() => onNavigate?.("contact")}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white px-8 py-3.5 rounded-full transition-all shadow-lg shadow-red-900/30 hover:shadow-red-600/40"
                style={{ fontWeight: 600 }}
              >
                {messages.common.contactUs} <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          </motion.div>

          {/* Right - Stats Grid */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-orange-500/20 transition-all duration-300"
                >
                  <s.icon className="w-6 h-6 text-orange-400 mb-3" />
                  <div className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent" style={{ fontSize: "1.8rem", fontWeight: 800, lineHeight: 1.2 }}>
                    <Counter target={s.value} suffix={s.suffix} />
                  </div>
                  <p className="text-white mt-1" style={{ fontSize: "0.85rem", fontWeight: 600 }}>{s.label}</p>
                  <p className="text-gray-500" style={{ fontSize: "0.75rem" }}>{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
