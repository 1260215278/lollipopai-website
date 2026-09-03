/**
 * 创作页 —— /creating
 * ------------------------------------------------------------------
 * 原先只有 AIFeaturesSection + CreatorSection + Footer，中文版正文仅 830 字符
 * （zh-TW 824），被 SEO 扫描判为「内容不足」。现补创作 FAQ（3 问 3 答）
 * + FAQPage Schema —— 既补足正文，也提升在 AI 回答中被引用的概率。
 * 文案在 i18n.tsx 的 dynamicPages 组（6 语言），见 creatingFaq*。
 */
import { useEffect } from "react";
import { AIFeaturesSection } from "./AIFeaturesSection";
import { CreatorSection } from "./CreatorSection";
import { Footer } from "./Footer";
import { useI18n } from "../i18n";
import { setPageSchema, clearPageSchema } from "../i18n.seo";

export function CreatingPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { messages } = useI18n();
  const dp = messages.dynamicPages;

  const faq = [
    { q: dp.creatingFaq1Q, a: dp.creatingFaq1A },
    { q: dp.creatingFaq2Q, a: dp.creatingFaq2A },
    { q: dp.creatingFaq3Q, a: dp.creatingFaq3A },
  ];

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  // GEO: FAQPage Schema（与页面可见 FAQ 逐字对应）
  useEffect(() => {
    setPageSchema({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
    return () => clearPageSchema();
  }, [dp]);

  return (
    <main className="pt-20 bg-[#0a0000]">
      <AIFeaturesSection />
      <CreatorSection onNavigate={onNavigate} />

      {/* 创作 FAQ —— 可见问答 + FAQPage Schema 同源 */}
      <section className="max-w-3xl mx-auto px-6 py-14">
        <h2 className="text-white mb-6" style={{ fontSize: "1.3rem", fontWeight: 700 }}>
          {dp.creatingFaqTitle}
        </h2>
        <div className="space-y-6">
          {faq.map((f) => (
            <div key={f.q}>
              <h3 className="text-white/90" style={{ fontSize: "1rem", fontWeight: 600 }}>
                {f.q}
              </h3>
              <p className="text-gray-400 mt-2" style={{ fontSize: "0.95rem", lineHeight: 1.9 }}>
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </main>
  );
}
