import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Volume2 } from "lucide-react";
import { useI18n } from "../i18n";

export function VideoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { messages } = useI18n();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500/60 transition-colors">
              <X className="w-5 h-5" />
            </button>

            {/* Simulated video player */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-950/50 to-black">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center mb-4 animate-pulse shadow-2xl shadow-red-600/40">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-white ml-1" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <p className="text-white" style={{ fontSize: "1.1rem", fontWeight: 600 }}>{messages.videoModal.title}</p>
              <p className="text-gray-400 mt-1" style={{ fontSize: "0.85rem" }}>{messages.videoModal.description}</p>
            </div>

            {/* Bottom controls bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-4">
              <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full" />
              </div>
              <Volume2 className="w-4 h-4 text-white/60" />
              <span className="text-white/60" style={{ fontSize: "0.75rem" }}>0:45 / 1:30</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
