import { useEffect } from "react";
import { DownloadCTA } from "./DownloadCTA";
import { Footer } from "./Footer";

export function DownloadPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  return (
    <main className="pt-20 bg-[#080000]">
      <DownloadCTA />
      <Footer onNavigate={onNavigate} />
    </main>
  );
}
