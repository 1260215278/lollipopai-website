import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { motion } from "motion/react";
import { useI18n } from "../i18n";
import { setPageSchema, clearPageSchema } from "../i18n.seo";

const reviewAvatars = [
  "https://images.unsplash.com/photo-1608185383614-43fdb19019ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdoaXRlJTIwd29tYW4lMjBwb3J0cmFpdCUyMGhlYWRzaG90fGVufDF8fHx8MTc3NjY3MzA3Mnww&ixlib=rb-4.1.0&q=80&w=200",
  "https://images.unsplash.com/photo-1769375581646-a31c35f448d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGJsYWNrJTIwbWFuJTIwcG9ydHJhaXQlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NzY2NzMwNzN8MA&ixlib=rb-4.1.0&q=80&w=200",
  "https://images.unsplash.com/photo-1611086551388-f0cf4d044c76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9uZGUlMjB3b21hbiUyMHNtaWxpbmclMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzY2NzMwNzR8MA&ixlib=rb-4.1.0&q=80&w=200",
  "https://images.unsplash.com/photo-1758600431229-191932ccee81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWRkbGUlMjBhZ2VkJTIwd2hpdGUlMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzY2NzMwNzR8MA&ixlib=rb-4.1.0&q=80&w=200",
  "https://images.unsplash.com/photo-1581065178026-390bc4e78dad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHdvbWFuJTIwcHJvZmVzc2lvbmFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc2NjEzNjE0fDA&ixlib=rb-4.1.0&q=80&w=200",
  "https://images.unsplash.com/photo-1564783538911-cd6bb5d6bed2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXRpbm8lMjBtYW4lMjBzbWlsaW5nJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc2NjczMDc1fDA&ixlib=rb-4.1.0&q=80&w=200",
  "https://images.unsplash.com/photo-1520689728498-7dd1a9814607?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHdvbWFuJTIwcG9ydHJhaXQlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NzY2NzMwNzV8MA&ixlib=rb-4.1.0&q=80&w=200",
  "https://images.unsplash.com/photo-1688125287898-ef48c07788e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldXJvcGVhbiUyMHdvbWFuJTIwYmxvbmRlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc2NjczMDc1fDA&ixlib=rb-4.1.0&q=80&w=200",
];

function ReviewCard({ r, ariaHidden }: { r: { name: string; role: string; text: string; avatar: string }; ariaHidden?: boolean }) {
  return (
    <div className="flex-shrink-0 w-[340px] p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-red-500/20 transition-all duration-300 mx-2" aria-hidden={ariaHidden}>
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
        ))}
      </div>
      <p className="text-gray-300 mb-4" style={{ fontSize: "0.85rem", lineHeight: 1.7 }}>"{r.text}"</p>
      <div className="flex items-center gap-3">
        <img src={r.avatar} alt={r.name} className="w-9 h-9 rounded-full object-cover border border-white/10" loading="lazy" />
        <div>
          <p className="text-white" style={{ fontSize: "0.85rem", fontWeight: 600 }}>{r.name}</p>
          <p className="text-gray-500" style={{ fontSize: "0.7rem" }}>{r.role}</p>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({ items, direction }: { items: Array<{ name: string; role: string; text: string; avatar: string }>; direction: "left" | "right" }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  // SSR 只渲染 1 份，客户端渲染 3 份（无缝滚动用）
  const displayItems = isClient ? [...items, ...items, ...items] : items;

  return (
    <div className="group relative overflow-hidden py-2">
      <div
        className="flex group-hover:[animation-play-state:paused]"
        style={{
          animation: isClient ? `${direction === "left" ? "marqueeLeft" : "marqueeRight"} 40s linear infinite` : "none",
        }}
      >
        {displayItems.map((r, i) => (
          <ReviewCard key={`${r.name}-${i}`} r={r} ariaHidden={isClient && i >= items.length} />
        ))}
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const { messages } = useI18n();
  const reviews = messages.testimonials.reviews.map((review, index) => ({
    ...review,
    avatar: reviewAvatars[index],
  }));
  const row1 = reviews.slice(0, 4);
  const row2 = reviews.slice(4);

  // SEO: 部署 Review Schema（rich snippet 机会）。
  // 注意：不输出 AggregateRating —— 目前没有真实评分数据来源，硬编码的
  // ratingValue（4.5/4.9 等）会被 Google 判为欺骗性结构化数据，风险高于收益。
  useEffect(() => {
    const reviewItems = reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name },
      reviewBody: r.text,
    }));

    setPageSchema({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Lollipop Drama — Short Drama Platform",
      description: "AI-powered short drama platform with 15,000+ premium shows, AI creation tools, and 80% creator revenue share.",
      review: reviewItems,
    });

    return () => clearPageSchema();
  }, [reviews]);

  return (
    <section className="py-20 bg-gradient-to-b from-[#0a0000] to-[#0d0000] overflow-hidden">
      <style>{`
        @keyframes marqueeLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes marqueeRight {
          0% { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
      `}</style>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 px-6">
        <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent" style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
          {messages.testimonials.eyebrow}
        </span>
        <h2 className="text-white mt-2" style={{ fontFamily: "Playfair Display", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 700 }}>
          {messages.testimonials.title}
        </h2>
      </motion.div>
      <MarqueeRow items={row1} direction="left" />
      <MarqueeRow items={row2} direction="right" />
    </section>
  );
}
