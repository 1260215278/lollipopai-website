import { useState, useRef } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Star, Heart, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import nrImg1 from "../../imports/00_(10).webp";
import nrImg2 from "../../imports/8d3cfa78f86f48afa8907beb0548cccb.webp";
import nrImg3 from "../../imports/335be7f8c5134bcbb15ac57b627c0d8d.webp";
import nrImg4 from "../../imports/00_(6).webp";
import nrImg5 from "../../imports/00_(8).webp";
import nrImg6 from "../../imports/e4347dc082a84ac0817906e1a68d5b36.webp";
import { useI18n } from "../i18n";

const newShowAssets = [
  { id: 101, slug: "crimson-dynasty", image: nrImg1, rating: "9.2" },
  { id: 102, slug: "neon-abyss", image: nrImg2, rating: "9.0" },
  { id: 103, slug: "whispered-love", image: nrImg3, rating: "9.4" },
  { id: 104, slug: "the-forgotten", image: nrImg4, rating: "8.9" },
  { id: 105, slug: "iron-will", image: nrImg5, rating: "9.1" },
  { id: 106, slug: "cloud-atlas", image: nrImg6, rating: "9.3" },
];

export function NewReleasesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const { messages } = useI18n();
  const newShows = newShowAssets.map((asset, index) => ({
    ...asset,
    ...messages.newReleases.shows[index],
  }));

  const scroll = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  const toggleLike = (id: number) => setLiked((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <section className="py-20 bg-gradient-to-b from-[#0a0000] to-[#0d0000] relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[150px]" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-orange-400" />
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent" style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                {messages.newReleases.eyebrow}
              </span>
            </div>
            <h2 className="text-white" style={{ fontFamily: "Playfair Display", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 700 }}>
              {messages.newReleases.title}
            </h2>
            <p className="text-gray-500 mt-2 max-w-lg mx-auto" style={{ fontSize: "0.9rem", lineHeight: 1.7 }}>
              {messages.newReleases.description}
            </p>
          </motion.div>
        </div>

        <div className="relative">
          <button onClick={() => scroll(-1)} className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-white/10 items-center justify-center text-gray-400 hover:text-white hover:border-orange-500/60 hover:bg-orange-500/10 transition-all bg-black/50 backdrop-blur-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => scroll(1)} className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-white/10 items-center justify-center text-gray-400 hover:text-white hover:border-orange-500/60 hover:bg-orange-500/10 transition-all bg-black/50 backdrop-blur-sm">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
            {newShows.map((show, idx) => (
            <Link
              key={show.id}
              to={`/drama/${show.slug}`}
              className="group flex-shrink-0 w-[260px] md:w-[280px] cursor-pointer block"
            >
              <div className="relative rounded-xl overflow-hidden mb-3 aspect-[3/4]">
                <ImageWithFallback src={show.image} alt={show.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" decoding="async" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-orange-600/10" />

                <div className="absolute top-3 left-3">
                  <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-lg" style={{ fontSize: "0.7rem", fontWeight: 800 }}>
                    {messages.newReleases.badge}
                  </span>
                </div>

                <button onClick={(e) => { e.stopPropagation(); toggleLike(show.id); }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/40 transition-colors">
                  <Heart className={`w-4 h-4 ${liked.has(show.id) ? "text-red-500 fill-red-500" : "text-white"}`} />
                </button>

                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-gray-400" style={{ fontSize: "0.7rem" }}>{show.meta}</span>
                </div>
              </div>

              <h3 className="text-white mb-1 group-hover:text-orange-400 transition-colors" style={{ fontWeight: 600 }}>{show.title}</h3>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-yellow-400" style={{ fontSize: "0.8rem" }}>
                  <Star className="w-3 h-3 fill-yellow-400" /> {show.rating}
                </span>
                <span className="text-gray-500" style={{ fontSize: "0.8rem" }}>{show.genre}</span>
              </div>
            </Link>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
