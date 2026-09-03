import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Smartphone, Wifi, Globe2, Sparkles, DollarSign, Shield } from "lucide-react";
import { useI18n } from "../i18n";

const featureAssets = [
  { icon: Smartphone, progress: 95 },
  { icon: Wifi, progress: 88 },
  { icon: Globe2, progress: 92 },
  { icon: Sparkles, progress: 97 },
  { icon: DollarSign, progress: 85 },
  { icon: Shield, progress: 90 },
];

function ProgressBar({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-4">
      <motion.div
        initial={{ width: 0 }}
        animate={inView ? { width: `${value}%` } : { width: 0 }}
        transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
      />
    </div>
  );
}

export function WhyChooseSection() {
  const { messages } = useI18n();
  const features = featureAssets.map((feature, index) => ({
    ...feature,
    ...messages.whyChoose.features[index],
  }));

  return (
    <section className="py-20 bg-gradient-to-b from-[#0d0000] to-[#0a0000]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent" style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            {messages.whyChoose.eyebrow}
          </span>
          <h2 className="text-white mt-2" style={{ fontFamily: "Playfair Display", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 700 }}>
            {messages.whyChoose.title}
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto" style={{ fontSize: "0.9rem", lineHeight: 1.7 }}>
            {messages.whyChoose.description}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-red-500/20 transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mb-4 group-hover:from-red-500/30 group-hover:to-orange-500/30 transition-all">
                <f.icon className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-white mb-2" style={{ fontSize: "1.1rem", fontWeight: 600 }}>{f.title}</h3>
              <p className="text-gray-400" style={{ fontSize: "0.85rem", lineHeight: 1.7 }}>{f.desc}</p>
              <ProgressBar value={f.progress} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
