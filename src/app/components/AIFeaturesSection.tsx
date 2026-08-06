import { motion } from "motion/react";
import { ImagePlus, UserRound, Video, Palette, BrainCircuit } from "lucide-react";
import aiImg1 from "../../imports/figma/creating-phone-left.webp";
import aiImg2 from "../../imports/figma/creating-phone-right.webp";
import { useI18n } from "../i18n";

const featureAssets = [
  { icon: ImagePlus, gradient: "from-red-500 to-pink-600" },
  { icon: UserRound, gradient: "from-orange-500 to-red-500" },
  { icon: Video, gradient: "from-amber-500 to-orange-500" },
  { icon: Palette, gradient: "from-rose-500 to-red-600" },
];

function PhoneMockup({ src, rotate, delay, glowColor }: { src: string; rotate: number; delay: number; glowColor: string }) {
  const { messages } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      style={{ rotate }}
      className="relative flex-shrink-0"
    >
      {/* Glow behind phone */}
      <div className={`absolute inset-0 rounded-[2.8rem] blur-2xl opacity-30 ${glowColor}`} style={{ transform: "scale(0.85)" }} />

      {/* Phone frame */}
      <div
        className="relative overflow-hidden bg-black shadow-2xl"
        style={{
          width: 200,
          height: 420,
          borderRadius: "2.6rem",
          border: "5px solid rgba(255,255,255,0.15)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), 0 30px 80px rgba(0,0,0,0.8)",
        }}
      >
        {/* Side buttons */}
        <div className="absolute -right-[7px] top-20 w-[5px] h-10 bg-white/15 rounded-r-sm" />
        <div className="absolute -left-[7px] top-16 w-[5px] h-7 bg-white/15 rounded-l-sm" />
        <div className="absolute -left-[7px] top-28 w-[5px] h-7 bg-white/15 rounded-l-sm" />

        {/* Dynamic island */}
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center"
          style={{ width: 90, height: 22, borderRadius: 20, background: "#000" }}>
          <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a] border border-white/10 mr-1" />
          <div className="w-1 h-1 rounded-full bg-white/20" />
        </div>

        {/* Screen image */}
        <img
          src={src}
          alt={`${messages.common.brand} AI`}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />

        {/* Screen overlay shimmer */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

        {/* Bottom home bar */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-24 h-1 rounded-full bg-white/30" />
      </div>

      {/* Screen reflection */}
      <div
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          width: 200,
          height: 420,
          borderRadius: "2.6rem",
          background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)",
        }}
      />
    </motion.div>
  );
}

export function AIFeaturesSection() {
  const { messages } = useI18n();
  const features = featureAssets.map((feature, index) => ({
    ...feature,
    ...messages.aiFeatures.features[index],
  }));

  return (
    <section className="py-24 bg-gradient-to-b from-[#0d0000] to-[#0a0000] relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/5 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-orange-600/4 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* ─── Layout: Phones left · Content right ─── */}
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

          {/* ── Left: Two Phone Mockups ── */}
          <div className="flex-shrink-0 flex items-end justify-center gap-0 relative" style={{ minHeight: 460 }}>
            {/* Back phone (left, tilted) */}
            <div style={{ marginRight: -36, marginBottom: -14, zIndex: 1 }}>
              <PhoneMockup src={aiImg1} rotate={-8} delay={0.1} glowColor="bg-orange-500" />
            </div>
            {/* Front phone (right, slightly tilted) */}
            <div style={{ zIndex: 2 }}>
              <PhoneMockup src={aiImg2} rotate={6} delay={0.25} glowColor="bg-red-500" />
            </div>
          </div>

          {/* ── Right: Title + Feature Cards ── */}
          <div className="flex-1 min-w-0">
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 lg:text-left text-center"
            >
              <div className="flex items-center lg:justify-start justify-center gap-2 mb-3">
                <BrainCircuit className="w-5 h-5 text-red-400" />
                <span
                  className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"
                  style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}
                >
                  {messages.aiFeatures.eyebrow}
                </span>
              </div>

              <h2 className="text-white mt-1" style={{ fontFamily: "Playfair Display", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 700, lineHeight: 1.3 }}>
                {messages.aiFeatures.title}
              </h2>

              <p className="text-gray-500 mt-3 max-w-lg" style={{ fontSize: "0.9rem", lineHeight: 1.75 }}>
                {messages.aiFeatures.description}
              </p>
            </motion.div>

            {/* Feature cards 2×2 */}
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group relative p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-red-500/20 transition-all duration-500 cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-red-500/5 to-orange-500/5" />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                      <f.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white mb-1" style={{ fontSize: "0.95rem", fontWeight: 600 }}>{f.title}</h3>
                      <p className="text-gray-400" style={{ fontSize: "0.8rem", lineHeight: 1.65 }}>{f.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
