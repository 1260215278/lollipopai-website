import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import logoImg from "../../imports/Lollipop1.webp";

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPw, setShowPw] = useState(false);

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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#0d0000] border border-white/10 rounded-2xl p-8 shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
              <X className="w-4 h-4" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
              <img src={logoImg} alt="Lollipop" className="h-8 w-auto" />
              <span className="text-white" style={{ fontSize: "1.15rem", fontWeight: 700 }}>Lollipop</span>
            </div>

            <h3 className="text-white mb-1" style={{ fontSize: "1.4rem", fontWeight: 700 }}>
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h3>
            <p className="text-gray-500 mb-6" style={{ fontSize: "0.85rem" }}>
              {mode === "login" ? "Sign in to continue watching" : "Join millions of drama lovers"}
            </p>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {mode === "register" && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input placeholder="Full Name" className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors" style={{ fontSize: "0.9rem" }} />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="email" placeholder="Email address" className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors" style={{ fontSize: "0.9rem" }} />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type={showPw ? "text" : "password"} placeholder="Password" className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors" style={{ fontSize: "0.9rem" }} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white transition-all shadow-lg shadow-red-900/30" style={{ fontWeight: 600 }}>
                {mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-gray-500" style={{ fontSize: "0.85rem" }}>
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-red-400 hover:text-red-300 transition-colors"
                style={{ fontSize: "0.85rem", fontWeight: 600 }}
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </div>

            {mode === "register" && (
              <p className="text-center mt-3 text-gray-600" style={{ fontSize: "0.75rem" }}>
                🎁 Sign up and get 10,000 free coins instantly!
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}