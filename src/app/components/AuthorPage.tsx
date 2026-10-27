import { useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Footer } from "./Footer";

interface AuthorPageProps {
  slug?: string;
  onNavigate?: (page: string) => void;
}

const authors: Record<string, {
  name: string;
  role: string;
  bio: string;
  expertise: string[];
  articles: { slug: string; title: string }[];
}> = {
  "evelyn-cho": {
    name: "Evelyn Cho",
    role: "Content Lead",
    bio: "Evelyn Cho leads content strategy at Lollipop Drama, overseeing the editorial calendar, SEO research, and GEO optimization for the company's 84+ English-language blog articles. With a background in entertainment media and digital content production, Evelyn focuses on helping AI short drama creators succeed through educational content and actionable guides.",
    expertise: [
      "AI Short Drama Production",
      "Creator Economy & Monetization",
      "SEO / GEO Content Strategy",
      "Entertainment Media Analytics",
      "Digital Video Distribution",
    ],
    articles: [
      { slug: "best-short-drama-apps-2026", title: "Best Short Drama Apps 2026: Complete Comparison Guide" },
      { slug: "lollipop-vs-reelshort-dramabox", title: "Lollipop Drama vs ReelShort vs DramaBox: 2026 Full Comparison" },
      { slug: "ai-short-drama-monetization", title: "How Creators Make Money with AI Short Dramas in 2026" },
      { slug: "publish-and-monetize-vertical-drama", title: "Publish & Monetize Your Vertical AI Drama Series" },
      { slug: "ai-influencer-monetization", title: "AI Influencer Platform: Monetizing AI-Generated Personalities" },
      { slug: "how-to-create-ai-short-drama", title: "How to Create AI Short Dramas: Complete Step-by-Step Guide" },
    ],
  },
};

export function AuthorPage({ slug = "evelyn-cho", onNavigate }: AuthorPageProps) {
  const heroRef = useRef<HTMLElement>(null);
  const inView = useInView(heroRef, { once: true, margin: "-60px" });
  const author = authors[slug];

  useEffect(() => {
    // JSON-LD Person schema for GEO
    const existing = document.getElementById("author-person-schema");
    if (existing) existing.remove();
    if (!author) return;
    const schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.id = "author-person-schema";
    schema.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `https://www.lollipop.im/authors/${slug}#person`,
      name: author.name,
      jobTitle: author.role,
      description: author.bio,
      url: `https://www.lollipop.im/authors/${slug}`,
      sameAs: [
        "https://www.lollipop.im/about#team",
      ],
      worksFor: {
        "@type": "Organization",
        "@id": "https://www.lollipop.im/#organization",
        name: "Lollipop Drama",
        url: "https://www.lollipop.im/",
      },
      knowsAbout: author.expertise,
    });
    document.head.appendChild(schema);
    return () => {
      const s = document.getElementById("author-person-schema");
      if (s) s.remove();
    };
  }, [author, slug]);

  if (!author) {
    return (
      <>
      <main>
        <section className="pt-32 pb-16 px-6 text-center">
          <h1 className="text-white text-3xl font-bold">Author Not Found</h1>
          <p className="text-gray-400 mt-4">The requested author profile could not be found.</p>
        </section>
      </main>
      </>
    );
  }

  return (
    <>
    <main>
      <section
        ref={heroRef}
        className="relative w-full min-h-[50vh] flex items-center justify-center overflow-hidden pt-24 pb-16 bg-gradient-to-b from-[#1a0000] to-[#0a0000]"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-[#0a0000]" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
            <span className="text-red-400 text-sm font-medium">Content Author</span>
          </div>
          <h1
            className="text-white mb-4"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.15 }}
          >
            {author.name}
          </h1>
          <p className="text-red-400 text-lg font-semibold mb-6">{author.role}</p>
          <p className="text-gray-300 max-w-2xl mx-auto" style={{ fontSize: "1.05rem", lineHeight: 1.75 }}>
            {author.bio}
          </p>
        </motion.div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-white text-xl font-bold mb-6">Areas of Expertise</h2>
        <div className="flex flex-wrap gap-3 mb-12">
          {author.expertise.map((exp) => (
            <span
              key={exp}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm"
            >
              {exp}
            </span>
          ))}
        </div>

        <h2 className="text-white text-xl font-bold mb-6">Published Articles</h2>
        <div className="space-y-3">
          {author.articles.map((art) => (
            <a
              key={art.slug}
              href={`/blog/${art.slug}`}
              className="block group p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-red-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-200 group-hover:text-white font-medium">
                  {art.title}
                </span>
                <span className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
    <Footer onNavigate={onNavigate} />
    </>
  );
}
