import { useEffect, Suspense } from "react";
import { useNavigate } from "react-router";
import { Navbar } from "./components/Navbar";
import { HeroSection, StatsSection } from "./components/HeroSection";
import { TrendingSection } from "./components/TrendingSection";
import { NewReleasesSection } from "./components/NewReleasesSection";
import { GenresSection } from "./components/GenresSection";
import { WhyChooseSection } from "./components/WhyChooseSection";
import { Web2Web3Section } from "./components/Web2Web3Section";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { FAQSection, TrustSignalsSection } from "./components/FAQSection";
import { Footer } from "./components/Footer";
import { BackToTop } from "./components/BackToTop";
// ── 非首页页面组件：静态导入，保证 SSR 预渲染可同步渲染（同时消除客户端骨架屏）──
import { AboutPage } from "./components/AboutPage";
import { ContactPage } from "./components/ContactPage";
import { CreatingPage } from "./components/CreatingPage";
import { DownloadPage } from "./components/DownloadPage";
import { useI18n } from "./i18n";
import { applySeoMeta, getPageSeo, setPageSchema, clearPageSchema, type PageType } from "./i18n.seo";

type MarketingPage = "home" | "about" | "creating" | "download" | "contact";

const pagePaths: Record<MarketingPage, string> = {
  home: "/",
  about: "/about",
  creating: "/creating",
  download: "/download",
  contact: "/contact",
};

/** 页面级 JSON-LD Schema 定义 */
const pageSchemas: Partial<Record<MarketingPage, (locale: string) => object>> = {
  about: () => ({
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      // 2026-09-09 审计 P2-4：引用站点级 Organization（同 @id 自动合并），
      // 只保留补充字段，避免与 index.html 的站点级 Organization 形成双实体
      // 2026-09-10 审计修复：补 @type。此前节点只有 @id 无 @type，
      // 若站点级 schema 未加载会吐出无类型无 name 的悬空节点（解析器不做图合并时更明显）
      "@type": "Organization",
      "@id": "https://www.lollipop.im/#organization",
      "founder": {
        "@type": "Person",
        "name": "James C.",
        "jobTitle": "Co-Founder",
        "description": "15+ years in entertainment technology. Previously led content strategy at a top-3 streaming platform in Southeast Asia.",
        "url": "https://www.lollipop.im/about#team",
        "worksFor": {
          "@id": "https://www.lollipop.im/#organization",
        },
      },
      "foundingLocation": {
        "@type": "Place",
        "address": "3 Gambas Crescent, #04-01, Nordcom One, Singapore 757088",
      },
    },
  }),
  download: () => ({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Lollipop Drama",
        "operatingSystem": "iOS, Android",
        "applicationCategory": "EntertainmentApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        // aggregateRating removed — ratingCount "2000000" was using download
        // count as review count, which violates Google's review snippet spam
        // policy. Re-add only when a real user review system is in place.
        "downloadUrl": "https://play.google.com/store/apps/details?id=com.StargetVenturesLLC.hks",
        "featureList": [
          "15,000+ premium short dramas across 10+ genres",
          "AI creation tools (Text-to-Image, Image-to-Image, Text-to-Video, Video-to-Video)",
          "80% creator revenue share",
          "4K streaming and offline downloads",
          "Available in 100+ countries with multilingual subtitles",
        ],
        "url": "https://www.lollipop.im/download",
      },
      {
        "@type": "Product",
        "name": "Lollipop Drama Premium Subscription",
        "description": "Premium subscription for ad-free 4K streaming, exclusive dramas, and unlimited offline downloads.",
        "brand": { "@type": "Brand", "name": "Lollipop Drama" },
        "offers": {
          "@type": "Offer",
          "price": "12.99",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": "https://www.lollipop.im/download",
        },
        // aggregateRating removed from Product — same reason as above
      },
    ],
  }),
  creating: () => ({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": "Lollipop Drama Creation Tools",
    "description": "AI-powered short drama creation tools including text-to-video, image-to-video, face swap, and style transfer.",
    "creator": {
      "@type": "Organization",
      "name": "Lollipop Drama",
      "url": "https://www.lollipop.im/",
    },
    "url": "https://www.lollipop.im/creating",
    "hasPart": [
      {
        "@type": "SoftwareApplication",
        "name": "Text-to-Image",
        "applicationCategory": "MultimediaApplication",
        "description": "Generate high-definition images from text prompts.",
      },
      {
        "@type": "SoftwareApplication",
        "name": "Text-to-Video",
        "applicationCategory": "MultimediaApplication",
        "description": "Generate professional short videos or dramas from storyline descriptions.",
      },
      {
        "@type": "SoftwareApplication",
        "name": "Image-to-Image",
        "applicationCategory": "MultimediaApplication",
        "description": "Edit and personalize images with AI-powered style transfer.",
      },
      {
        "@type": "SoftwareApplication",
        "name": "Video-to-Video",
        "applicationCategory": "MultimediaApplication",
        "description": "Create visually striking content from images or videos without editing skills.",
      },
    ],
  }),
  contact: () => ({
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "Lollipop Drama",
      "telephone": "+65 80742120",
      "email": "business@lollipop.im",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "3 Gambas Crescent, #04-01, Nordcom One",
        "addressLocality": "Singapore",
        "postalCode": "757088",
        "addressCountry": "SG",
      },
    },
  }),
};

export default function App({ initialPage = "home" }: { initialPage?: MarketingPage }) {
  const navigate = useNavigate();
  const { locale } = useI18n();
  const currentPage = initialPage;

  const handleNavigate = (page: string) => {
    const path = pagePaths[page as MarketingPage] ?? "/";
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 按页面 × 语言动态应用 SEO meta + JSON-LD Schema
  useEffect(() => {
    const seoPage = currentPage as PageType;
    applySeoMeta(getPageSeo(seoPage, locale), seoPage);

    const schemaFn = pageSchemas[currentPage];
    if (schemaFn) {
      setPageSchema(schemaFn(locale));
    } else {
      clearPageSchema();
    }
  }, [currentPage, locale]);

  // 兼容旧入口：历史链接中的 #creators/#download/#contact 改跳独立页面。
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    if (hash === "creators") navigate("/creating", { replace: true });
    if (hash === "download") navigate("/download", { replace: true });
    if (hash === "contact" || hash === "about") navigate(`/${hash}`, { replace: true });
  }, [navigate]);

  return (
    <div className="relative bg-[#0a0000] min-h-screen" style={{ fontFamily: "Inter, sans-serif" }}>
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      {currentPage === "home" && (
        <>
          <HeroSection />
          <StatsSection />
          <TrendingSection />
          <NewReleasesSection />
          <GenresSection />
          {/* <WhyChooseSection /> */}
          {/* <PricingSection /> */}
          {/* <Web2Web3Section /> */}
          <TrustSignalsSection />
          <TestimonialsSection />
          <FAQSection onNavigate={handleNavigate} />
          <Footer onNavigate={handleNavigate} />
        </>
      )}
      {/* 非首页子页面：按需加载，各自独立的 chunk */}
      {currentPage !== "home" && (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0000] flex items-center justify-center"><div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" /></div>}>
          {currentPage === "creating" && <CreatingPage onNavigate={handleNavigate} />}
          {currentPage === "download" && <DownloadPage onNavigate={handleNavigate} />}
          {currentPage === "about" && <AboutPage onNavigate={handleNavigate} />}
          {currentPage === "contact" && <ContactPage onNavigate={handleNavigate} />}
        </Suspense>
      )}
      <BackToTop />
    </div>
  );
}
