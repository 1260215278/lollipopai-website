import { useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Footer } from "./Footer";

interface EditorialPolicyPageProps {
  onNavigate?: (page: string) => void;
}

const sections = [
  {
    title: "Our Mission",
    body: "Lollipop Drama's editorial content (blog articles, guides, and creator resources) exists to help independent AI short drama creators succeed. We publish educational, practical, and honest information — never misleading content designed solely for search rankings.",
  },
  {
    title: "Content Creation Process",
    body: "Every article follows a research → outline → draft → review → publish workflow. Our Content Lead researches the topic using primary sources, competitor data, and creator community feedback before writing. Technical claims are cross-referenced against official documentation where available.",
  },
  {
    title: "Fact-Checking & Accuracy",
    body: "We verify numerical claims (app store data, revenue figures, user counts) against third-party sources. Where data is estimated or proprietary, we clearly state this. Statistics are tied to a date stamp — our 15,000+ dramas count reflects our library as of the publish date, for example.",
  },
  {
    title: "AI Content Disclosure",
    body: "Some of our articles use AI assistance for initial drafts, research synthesis, or language translation. All AI-assisted content is reviewed, fact-checked, and edited by our human editorial team before publication. We do not publish AI-generated content without human review. When our platform's own AI creation tools are discussed, we disclose this relationship clearly.",
  },
  {
    title: "Corrections & Updates",
    body: "If a reader identifies an error, factual inaccuracy, or outdated claim, email business@lollipop.im with the article URL and specific correction. We will review promptly — confirmed errors get corrected within 72 hours with a note added at the bottom of the article. Major updates are logged in the article's dateModified field.",
  },
  {
    title: "Affiliate & Disclosure Policy",
    body: "We do not accept sponsored posts, paid reviews, or affiliate commissions. Our comparison articles (e.g., Lollipop Drama vs ReelShort vs DramaBox) reflect our genuine editorial assessment. When discussing competitors, we strive for factual accuracy and clearly distinguish between verifiable claims and competitive positioning.",
  },
  {
    title: "Creator Input",
    body: "Our creator community is invited to contribute feedback, story ideas, and real-world monetization data. If you are a creator using Lollipop Drama and would like to share your experience for a case study or article, contact business@lollipop.im.",
  },
];

export function EditorialPolicyPage({ onNavigate }: EditorialPolicyPageProps) {
  const heroRef = useRef<HTMLElement>(null);
  const inView = useInView(heroRef, { once: true, margin: "-60px" });

  useEffect(() => {
    const existing = document.getElementById("editorial-schema");
    if (existing) existing.remove();
    const schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.id = "editorial-schema";
    schema.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Editorial Policy — Lollipop Drama",
      description: "Lollipop Drama's editorial policy: content creation process, fact-checking methodology, AI content disclosure, corrections, and reader feedback.",
      url: "https://www.lollipop.im/editorial-policy",
      dateModified: "2026-10-27",
      isPartOf: {
        "@type": "WebSite",
        name: "Lollipop Drama",
        url: "https://www.lollipop.im/",
      },
      publisher: {
        "@type": "Organization",
        "@id": "https://www.lollipop.im/#organization",
        name: "Lollipop Drama",
      },
    });
    document.head.appendChild(schema);
    return () => {
      const s = document.getElementById("editorial-schema");
      if (s) s.remove();
    };
  }, []);

  return (
    <>
    <main>
      <section
        ref={heroRef}
        className="relative w-full min-h-[45vh] flex items-center justify-center overflow-hidden pt-24 pb-16 bg-gradient-to-b from-[#1a0000] to-[#0a0000]"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-[#0a0000]" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        >
          <h1
            className="text-white mb-4"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", fontWeight: 800, lineHeight: 1.15 }}
          >
            Editorial Policy
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto" style={{ fontSize: "1.05rem", lineHeight: 1.75 }}>
            How we research, write, fact-check, and correct our content. Transparency for creators, readers, and AI engines alike.
          </p>
          <p className="text-gray-500 text-sm mt-6">Last updated: October 27, 2026</p>
        </motion.div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-8">
        <div className="space-y-10">
          {sections.map((sec, i) => (
            <article key={i} className="group">
              <h2 className="text-white text-xl font-bold mb-3 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20 text-red-400 text-sm font-bold">
                  {i + 1}
                </span>
                {sec.title}
              </h2>
              <p className="text-gray-300 leading-relaxed pl-11">{sec.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="p-6 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
          <h3 className="text-white font-bold mb-2">Questions or Corrections?</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Email <a href="mailto:business@lollipop.im" className="text-red-400 hover:text-red-300 underline">business@lollipop.im</a> with the article URL and details. We review every message within 48 hours.
          </p>
        </div>
      </section>
    </main>
    <Footer onNavigate={onNavigate} />
    </>
  );
}
