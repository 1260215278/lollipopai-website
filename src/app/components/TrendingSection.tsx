import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Star, Heart, ChevronLeft, ChevronRight, Flame, Trophy } from "lucide-react";
import img1 from "../../imports/Temptation_CEO.jpg";
import img2 from "../../imports/The_bride_who_fell_from_the_sky.jpg";
import img3 from "../../imports/The_Revenge_of_the_Plus-Size_Wife.jpg";
import img4 from "../../imports/My_Royal_Alpha_Boyfriend.jpg";
import img5 from "../../imports/b27eed6c1c08448293fe93a09e75707b.jpg";
import img6 from "../../imports/Why_jump_off_the_building.jpg";
import { useI18n } from "../i18n";

const showAssets = [
  { id: 1, image: img1, rank: 1, rating: "9.8" },
  { id: 2, image: img2, rank: 2, rating: "9.5" },
  { id: 3, image: img3, rank: 3, rating: "9.6" },
  { id: 4, image: img4, rank: 4, rating: "9.1" },
  { id: 5, image: img5, rank: 5, rating: "9.0" },
  { id: 6, image: img6, rank: 6, rating: "9.4" },
];

const rankColors: Record<number, string> = { 1: "from-yellow-500 to-amber-600", 2: "from-gray-300 to-gray-500", 3: "from-orange-600 to-amber-800" };

export function TrendingSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const { messages } = useI18n();
  const shows = showAssets.map((asset, index) => ({
    ...asset,
    ...messages.trending.shows[index],
  }));

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  const toggleLike = (id: number) => {
    setLiked((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <section id="trending" className="py-20 bg-[#0a0000] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[150px]" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-red-500" />
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent" style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                {messages.trending.eyebrow}
              </span>
            </div>
            <h2 className="text-white" style={{ fontFamily: "Playfair Display", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 700 }}>
              {messages.trending.title}
            </h2>
            <p className="text-gray-500 mt-2 max-w-lg mx-auto" style={{ fontSize: "0.9rem", lineHeight: 1.7 }}>
              {messages.trending.description}
            </p>
          </motion.div>
        </div>

        <div className="relative">
          <button onClick={() => scroll(-1)} className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-white/10 items-center justify-center text-gray-400 hover:text-white hover:border-red-500/60 hover:bg-red-500/10 transition-all bg-black/50 backdrop-blur-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => scroll(1)} className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-white/10 items-center justify-center text-gray-400 hover:text-white hover:border-red-500/60 hover:bg-red-500/10 transition-all bg-black/50 backdrop-blur-sm">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
            {shows.map((show, idx) => (
              <motion.div
                key={show.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="group flex-shrink-0 w-[260px] md:w-[280px] cursor-pointer"
              >
                <div className="relative rounded-xl overflow-hidden mb-3 aspect-[3/4]">
                  <img src={show.image} alt={show.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" decoding="async" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-red-600/10" />

                  {/* Rank badge */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {show.rank <= 3 ? (
                      <span className={`bg-gradient-to-r ${rankColors[show.rank]} text-white px-3 py-1 rounded-lg flex items-center gap-1`} style={{ fontSize: "0.75rem", fontWeight: 800 }}>
                        <Trophy className="w-3 h-3" /> TOP {show.rank}
                      </span>
                    ) : (
                      <span className="bg-white/10 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-md" style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                        #{show.rank}
                      </span>
                    )}
                  </div>

                  {/* Like */}
                  <button onClick={(e) => { e.stopPropagation(); toggleLike(show.id); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/40 transition-colors">
                    <Heart className={`w-4 h-4 transition-colors ${liked.has(show.id) ? "text-red-500 fill-red-500" : "text-white"}`} />
                  </button>

                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-gray-400" style={{ fontSize: "0.7rem" }}>{show.meta}</span>
                  </div>
                </div>

                <h3 className="text-white mb-1 group-hover:text-red-400 transition-colors" style={{ fontWeight: 600 }}>{show.title}</h3>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-yellow-400" style={{ fontSize: "0.8rem" }}>
                    <Star className="w-3 h-3 fill-yellow-400" /> {show.rating}
                  </span>
                  <span className="text-gray-500" style={{ fontSize: "0.8rem" }}>{show.genre}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
