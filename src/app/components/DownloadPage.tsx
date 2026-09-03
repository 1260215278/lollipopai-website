/**
 * 下载页 —— /download
 * ------------------------------------------------------------------
 * 原先只有 DownloadCTA + Footer，正文 1046 字符（zh/zh-TW 仅 652/654），
 * 被 SEO 扫描判为「内容不足」。现补两块本地化内容：
 *   1. 为什么下载 App（本地化长段落）
 *   2. 下载 FAQ（3 问 3 答）+ FAQPage Schema —— 同时提升 AI 引用概率
 * 文案在 i18n.tsx 的 dynamicPages 组（6 语言），见 downloadWhy* / downloadFaq*。
 */
import { useEffect } from "react";
import { DownloadCTA } from "./DownloadCTA";
import { Footer } from "./Footer";
import { useI18n } from "../i18n";
import { setPageSchema, clearPageSchema } from "../i18n.seo";

export function DownloadPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { messages } = useI18n();
  const dp = messages.dynamicPages;

  const faq = [
    { q: dp.downloadFaq1Q, a: dp.downloadFaq1A },
    { q: dp.downloadFaq2Q, a: dp.downloadFaq2A },
    { q: dp.downloadFaq3Q, a: dp.downloadFaq3A },
    { q: dp.downloadFaq4Q, a: dp.downloadFaq4A },
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
    <main className="pt-20 bg-[#080000]">
      <DownloadCTA />

      {/* 为什么下载 App —— 本地化正文，补足页面内容深度 */}
      <section className="max-w-3xl mx-auto px-6 py-14">
        <h2 className="text-white mb-4" style={{ fontSize: "1.3rem", fontWeight: 700 }}>
          {dp.downloadWhyTitle}
        </h2>
        <p className="text-gray-400" style={{ fontSize: "0.95rem", lineHeight: 1.9 }}>
          {dp.downloadWhyBody}
        </p>
      </section>

      {/* 下载 FAQ —— 可见问答 + FAQPage Schema 同源 */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <h2 className="text-white mb-6" style={{ fontSize: "1.3rem", fontWeight: 700 }}>
          {dp.downloadFaqTitle}
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
