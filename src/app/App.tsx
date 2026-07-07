import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Navbar } from "./components/Navbar";
import { HeroSection, StatsSection } from "./components/HeroSection";
import { TrendingSection } from "./components/TrendingSection";
import { NewReleasesSection } from "./components/NewReleasesSection";
import { AIFeaturesSection } from "./components/AIFeaturesSection";
import { GenresSection } from "./components/GenresSection";
import { WhyChooseSection } from "./components/WhyChooseSection";
import { Web2Web3Section } from "./components/Web2Web3Section";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { CreatorSection } from "./components/CreatorSection";
import { DownloadCTA } from "./components/DownloadCTA";
import { Footer } from "./components/Footer";
import { BackToTop } from "./components/BackToTop";
import { AboutPage } from "./components/AboutPage";
import { ContactPage } from "./components/ContactPage";
import { CreatingPage } from "./components/CreatingPage";
import { DownloadPage } from "./components/DownloadPage";

type MarketingPage = "home" | "about" | "creating" | "download" | "contact";

const pagePaths: Record<MarketingPage, string> = {
  home: "/",
  about: "/about",
  creating: "/creating",
  download: "/download",
  contact: "/contact",
};

export default function App({ initialPage = "home" }: { initialPage?: MarketingPage }) {
  const navigate = useNavigate();
  const currentPage = initialPage;

  const handleNavigate = (page: string) => {
    const path = pagePaths[page as MarketingPage] ?? "/";
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          <AIFeaturesSection />
          <GenresSection />
          {/* <WhyChooseSection /> */}
          {/* <PricingSection /> */}
          {/* <Web2Web3Section /> */}
          <TestimonialsSection />
          <CreatorSection onNavigate={handleNavigate} />
          <DownloadCTA />
          <Footer onNavigate={handleNavigate} />
        </>
      )}
      {currentPage === "creating" && (
        <CreatingPage onNavigate={handleNavigate} />
      )}
      {currentPage === "download" && (
        <DownloadPage onNavigate={handleNavigate} />
      )}
      {currentPage === "about" && (
        <AboutPage onNavigate={handleNavigate} />
      )}
      {currentPage === "contact" && (
        <ContactPage onNavigate={handleNavigate} />
      )}
      <BackToTop />
    </div>
  );
}
