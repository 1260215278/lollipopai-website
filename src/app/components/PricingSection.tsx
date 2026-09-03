import { useState } from "react";
import { motion } from "motion/react";
import { Check, Zap, Gift } from "lucide-react";

const plans = [
  {
    name: "Free",
    monthly: "$0",
    yearly: "$0",
    desc: "Get started with daily free episodes",
    features: ["5 free episodes daily", "SD quality", "Ad-supported", "Limited library", "1 device"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Premium",
    monthly: "$9.99",
    yearly: "$6.99",
    desc: "Unlimited access to all content",
    features: ["Unlimited episodes", "Full HD quality", "Ad-free", "Full library access", "3 devices", "Offline download", "Early access to new shows"],
    cta: "Start Free Trial",
    popular: true,
    badge: "MOST POPULAR",
  },
  {
    name: "VIP",
    monthly: "$19.99",
    yearly: "$14.99",
    desc: "The ultimate premium experience",
    features: ["Everything in Premium", "4K Ultra HD", "6 devices", "Exclusive VIP shows", "Behind-the-scenes", "Priority support", "Gift episodes to friends"],
    cta: "Go VIP",
    popular: false,
  },
];

export function PricingSection() {
  const [yearly, setYearly] = useState(true);

  return (
    <section id="pricing" className="py-20 bg-[#0a0000] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(220,20,60,0.06),transparent_60%)]" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent" style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>Membership Plans</span>
          <h2 className="text-white mt-2" style={{ fontFamily: "Playfair Display", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 700 }}>
            Choose Your Plan
          </h2>

          {/* Promo */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <Gift className="w-4 h-4 text-green-400" />
            <span className="text-green-400" style={{ fontSize: "0.85rem", fontWeight: 600 }}>First Month FREE on any paid plan!</span>
          </div>

          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`transition-colors ${!yearly ? "text-white" : "text-gray-500"}`} style={{ fontSize: "0.875rem" }}>Monthly</span>
            <button
              onClick={() => setYearly(!yearly)}
              className={`w-12 h-6 rounded-full relative transition-colors ${yearly ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-gray-700"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${yearly ? "left-[1.625rem]" : "left-0.5"}`} />
            </button>
            <span className={`transition-colors ${yearly ? "text-white" : "text-gray-500"}`} style={{ fontSize: "0.875rem" }}>
              Yearly <span className="text-green-400" style={{ fontSize: "0.75rem", fontWeight: 600 }}>Save 30%</span>
            </span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`relative rounded-2xl p-7 transition-all duration-500 ${
                plan.popular
                  ? "bg-gradient-to-b from-red-900/30 to-red-950/10 border-2 border-red-500/40 shadow-2xl shadow-red-900/30 scale-[1.03]"
                  : "bg-white/[0.02] border border-white/5 hover:border-red-800/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-1 rounded-full flex items-center gap-1 shadow-lg" style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                  <Zap className="w-3 h-3" /> {plan.badge}
                </div>
              )}
              <h3 className="text-white mb-1" style={{ fontSize: "1.25rem", fontWeight: 700 }}>{plan.name}</h3>
              <p className="text-gray-500 mb-4" style={{ fontSize: "0.8rem" }}>{plan.desc}</p>
              <div className="mb-6">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent" style={{ fontFamily: "Playfair Display", fontSize: "2.5rem", fontWeight: 800 }}>
                  {yearly ? plan.yearly : plan.monthly}
                </span>
                <span className="text-gray-500" style={{ fontSize: "0.85rem" }}>/month</span>
              </div>
              <button className={`w-full py-3 rounded-full mb-6 transition-all duration-300 ${
                plan.popular
                  ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white shadow-lg shadow-red-900/40 hover:shadow-red-600/50"
                  : "border border-white/10 text-white hover:bg-white/5 hover:border-red-500/30"
              }`} style={{ fontWeight: 600 }}>
                {plan.cta}
              </button>
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-gray-300" style={{ fontSize: "0.85rem" }}>
                    <Check className="w-4 h-4 text-red-400 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* 10000 coins promo */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-900/30 to-orange-900/20 border border-red-700/20 text-orange-300" style={{ fontSize: "0.85rem" }}>
            🎁 Sign up today and get 10,000 bonus coins to redeem premium membership
          </span>
        </motion.div>
      </div>
    </section>
  );
}
