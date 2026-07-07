import { useEffect } from "react";
import { AIFeaturesSection } from "./AIFeaturesSection";
import { CreatorSection } from "./CreatorSection";
import { Footer } from "./Footer";

export function CreatingPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  return (
    <main className="pt-20 bg-[#0a0000]">
      <AIFeaturesSection />
      <CreatorSection onNavigate={onNavigate} />
      <Footer onNavigate={onNavigate} />
    </main>
  );
}
