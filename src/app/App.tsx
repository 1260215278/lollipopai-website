import { useState, useEffect } from "react";
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

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (page !== "home") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 跨路由跳回营销站（如发行/入驻页顶栏点击 Home/Creating/Download/Contact）时，
  // 按 URL hash 定位：#contact/#about → 切页；区块 id → 平滑滚动。
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    if (hash === "contact" || hash === "about") {
      setCurrentPage(hash);
      window.scrollTo({ top: 0 });
      return;
    }
    const timer = window.setTimeout(
      () => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }),
      200,
    );
    return () => window.clearTimeout(timer);
  }, []);

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
