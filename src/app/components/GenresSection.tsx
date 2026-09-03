import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Heart, Swords, Skull, Crown, Sparkles, Zap, Ghost, FlaskConical, Home, Flame } from "lucide-react";
import { useI18n } from "../i18n";

const genreAssets = [
  { icon: Heart, slug: "romance", image: "https://images.unsplash.com/photo-1602301534298-10c4fc7f06a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbnRpYyUyMGNvdXBsZSUyMGNpbmVtYXRpYyUyMGRyYW1hfGVufDF8fHx8MTc3NjY2NTk5NHww&ixlib=rb-4.1.0&q=80&w=1080" },
  { icon: Swords, slug: "revenge", image: "https://images.unsplash.com/photo-1598669266271-358c3cd2980e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJ0aWFsJTIwYXJ0cyUyMHdhcnJpb3IlMjBiYXR0bGV8ZW58MXx8fHwxNzc2NjY1OTk4fDA&ixlib=rb-4.1.0&q=80&w=1080" },
  { icon: Skull, slug: "thriller", image: "https://images.unsplash.com/photo-1760800185553-120f11121066?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwdGhyaWxsZXIlMjBteXN0ZXJ5JTIwc2NlbmV8ZW58MXx8fHwxNzc2NjY1OTk0fDA&ixlib=rb-4.1.0&q=80&w=1080" },
  { icon: Crown, slug: "ceo-drama", image: "https://images.unsplash.com/photo-1667391187178-4668539fca79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMGNpdHklMjBuaWdodCUyMGFjdGlvbnxlbnwxfHx8fDE3NzY2NjU5OTV8MA&ixlib=rb-4.1.0&q=80&w=1080" },
  { icon: Sparkles, slug: "fantasy", image: "https://images.unsplash.com/photo-1770034285769-4a5a3f410346?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwbWFnaWNhbCUyMHdvcmxkJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc3NjY2NTk5NXww&ixlib=rb-4.1.0&q=80&w=1080" },
  { icon: Zap, slug: "action", image: "https://images.unsplash.com/photo-1583748709524-5f42ab1d3df0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXZlbmdlJTIwZHJhbWElMjBzY2VuZSUyMGRhcmt8ZW58MXx8fHwxNzc2NjU1MjkxfDA&ixlib=rb-4.1.0&q=80&w=1080" },
  { icon: Ghost, slug: "horror", image: "https://images.unsplash.com/photo-1775831991024-c664ac9012c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3Jyb3IlMjBkYXJrJTIwc2NhcnklMjBhdG1vc3BoZXJlfGVufDF8fHx8MTc3NjY2NTc2NXww&ixlib=rb-4.1.0&q=80&w=1080" },
  { icon: FlaskConical, slug: "sci-fi", image: "https://images.unsplash.com/photo-1549394325-200e58997f69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwZmljdGlvbiUyMGZ1dHVyaXN0aWMlMjBuZW9ufGVufDF8fHx8MTc3NjY2NTk5N3ww&ixlib=rb-4.1.0&q=80&w=1080" },
  { icon: Home, slug: "family", image: "https://images.unsplash.com/photo-1758977403375-d4a2a4cf26bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjB3YXJtdGglMjBob21lJTIwY296eXxlbnwxfHx8fDE3NzY2NjU5OTd8MA&ixlib=rb-4.1.0&q=80&w=1080" },
  { icon: Flame, slug: "historical", image: "https://images.unsplash.com/photo-1666611121264-72ddbd2a1c9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b3JpY2FsJTIwcGFsYWNlJTIwZHJhbWElMjBjb3N0dW1lfGVufDF8fHx8MTc3NjY2NTk5NXww&ixlib=rb-4.1.0&q=80&w=1080" },
];

export function GenresSection() {
  const [hovered, setHovered] = useState<number | null>(null);
  const { messages } = useI18n();
  const genres = genreAssets.map((genre, index) => ({
    ...genre,
    ...messages.genres.items[index],
  }));

  return (
    <section id="genres" className="py-20 bg-gradient-to-b from-[#0a0000] to-[#0d0000]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent" style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            {messages.genres.eyebrow}
          </span>
          <h2 className="text-white mt-2" style={{ fontFamily: "Playfair Display", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 700 }}>
            {messages.genres.title}
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto" style={{ fontSize: "0.9rem", lineHeight: 1.7 }}>
            {messages.genres.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {genres.map((g, i) => (
            <Link
              key={g.name}
              to={`/genre/${g.slug}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={`relative group cursor-pointer rounded-2xl overflow-hidden aspect-[3/4] transition-all duration-500 block ${hovered === i ? "-translate-y-2 shadow-2xl shadow-red-600/20" : ""}`}
            >
              <img src={g.image} alt={g.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              {/* Red glow on hover */}
              <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/15 transition-colors duration-500" />
              {/* Red bottom border glow */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

              <div className="relative z-10 h-full flex flex-col justify-end p-4">
                <g.icon className="w-7 h-7 text-white/80 mb-2 group-hover:text-red-400 transition-colors" />
                <h3 className="text-white" style={{ fontSize: "1.05rem", fontWeight: 700 }}>{g.name}</h3>
                <p className="text-gray-400" style={{ fontSize: "0.75rem" }}>{g.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
