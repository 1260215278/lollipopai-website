import { useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Footer } from "./Footer";

const glossaryTerms = [
  {
    term: "AI Creation Tools",
    definition: "Built-in AI creation tools within Lollipop Drama, featuring text-to-image, image-to-image, text-to-video, and video-to-video generation capabilities. Currently version 1.5.",
    category: "Technology",
  },
  {
    term: "Creator Economy",
    definition: "An economic model where content creators earn revenue from their work. On Lollipop Drama, creators receive 80% revenue share — the highest in the short drama industry.",
    category: "Business",
  },
  {
    term: "Short Drama",
    definition: "Episodic video content with 1-3 minute episodes, designed for mobile viewing. Lollipop Drama hosts 15,000+ titles across 10+ genres including Romance, Thriller, CEO Drama, Fantasy, and more.",
    category: "Content",
  },
  {
    term: "Text-to-Video (T2V)",
    definition: "AI technology that converts text descriptions into video content. On Lollipop Drama, users describe a storyline and the system generates a professional short video.",
    category: "Technology",
  },
  {
    term: "Text-to-Image (T2I)",
    definition: "AI technology that generates high-definition images from text prompts. Used for scene visualization, concept art, and character design in short drama production.",
    category: "Technology",
  },
  {
    term: "Image-to-Image (I2I)",
    definition: "AI technology that edits and personalizes existing images with style transfer. Used for editing, personalization, and generating variations of visual content.",
    category: "Technology",
  },
  {
    term: "Video-to-Video (V2V)",
    definition: "AI technology that transforms images or videos into cinematic video content. Enables creators to produce visually striking content without editing skills.",
    category: "Technology",
  },
  {
    term: "Revenue Share",
    definition: "The percentage of revenue that creators receive from their content. Lollipop Drama offers 80%, meaning creators keep 80% of earnings from ad revenue, premium subscriptions, tips, and brand sponsorships.",
    category: "Business",
  },
  {
    term: "Premium Membership",
    definition: "A paid subscription that provides unlimited access to all content, ad-free viewing, 4K streaming, and offline downloads. New users get 7 days free.",
    category: "Product",
  },
  {
    term: "Micro Drama",
    definition: "Ultra-short-form episodic content, typically 1-3 minutes per episode, designed for mobile-first consumption. Also known as short drama or vertical drama.",
    category: "Content",
  },
  {
    term: "Vertical Drama",
    definition: "Short-form video content shot in vertical (portrait) format, optimized for mobile phone viewing. Lollipop Drama's entire library is vertical-first.",
    category: "Content",
  },
  {
    term: "AI Influencer",
    definition: "A virtual content creator powered by AI technology. Lollipop Drama's platform enables the creation and monetization of AI-generated personalities and content.",
    category: "Technology",
  },
  {
    term: "K-Contents",
    definition: "Korean cultural content including dramas, music, and entertainment. Lollipop Drama's Korean Cultural Investment Fund backing ensures systematic promotion of K-Contents globally.",
    category: "Content",
  },
  {
    term: "Face Swap",
    definition: "AI technology that replaces faces in videos or images. Available as a built-in tool in Lollipop Drama's creation toolkit.",
    category: "Technology",
  },
  {
    term: "Style Transfer",
    definition: "AI technique that applies the visual style of one image to another. Part of Lollipop Drama's built-in AI creation tools for content personalization.",
    category: "Technology",
  },
  {
    term: "Global Distribution",
    definition: "Lollipop Drama's content delivery network spanning 100+ countries. Creators can distribute their content worldwide with multilingual subtitle support.",
    category: "Business",
  },
];

const categories = ["All", "Technology", "Business", "Content", "Product"];

export function GlossaryPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const heroRef = useRef<HTMLElement>(null);
  const inView = useInView(heroRef, { once: true, margin: "-60px" });

  return (
    <>
      <section className="relative w-full min-h-[50vh] flex items-center justify-center overflow-hidden pt-24 pb-16 bg-gradient-to-b from-[#1a0000] to-[#0a0000]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-[#0a0000]" />
        <motion.div
          ref={heroRef}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-6 max-w-3xl mx-auto"
        >
          <h1 className="text-white mb-4" style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.15 }}>
            Glossary
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto" style={{ fontSize: "1.05rem", lineHeight: 1.7 }}>
            Key terms and definitions for AI short drama, creator economy, and Lollipop Drama platform concepts. A reference for creators, users, and media.
          </p>
        </motion.div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((cat) => (
            <span
              key={cat}
              className="px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-gray-400"
              style={{ fontSize: "0.8rem", fontWeight: 500 }}
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="space-y-4">
          {glossaryTerms.map((item) => (
            <div
              key={item.term}
              className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-red-500/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h2 className="text-white" style={{ fontSize: "1.15rem", fontWeight: 600 }}>
                  {item.term}
                </h2>
                <span
                  className="flex-shrink-0 px-3 py-1 rounded-full bg-red-500/10 text-red-400"
                  style={{ fontSize: "0.7rem", fontWeight: 600 }}
                >
                  {item.category}
                </span>
              </div>
              <p className="text-gray-400" style={{ fontSize: "0.9rem", lineHeight: 1.7 }}>
                {item.definition}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </>
  );
}
