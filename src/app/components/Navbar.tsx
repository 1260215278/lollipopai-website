import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Phone, Globe } from "lucide-react";
import { Link } from "react-router";
import logoImg from "../../imports/Lollipop1.png";
import { useI18n } from "../i18n";

export function Navbar({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeNavKey, setActiveNavKey] = useState("home");
  const langRef = useRef<HTMLDivElement>(null);
  const { messages, languages, currentLanguage, setLocale } = useI18n();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (currentPage !== "home") {
      setActiveNavKey(currentPage === "about" ? "aboutUs" : "");
      return;
    }

    const handler = () => {
      const sectionIds = ["home", "trending", "genres", "creators"];
      const current = sectionIds.reduce((active, id) => {
        const section = document.getElementById(id);

        if (!section) {
          return active;
        }

        return section.getBoundingClientRect().top <= 120 ? id : active;
      }, "home");

      setActiveNavKey(current);
    };

    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [currentPage]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { key: "home", href: "#home" },
    { key: "trending", href: "#trending" },
    { key: "genres", href: "#genres" },
    { key: "creators", href: "#creators" },
    { key: "aboutUs", href: "__about__" },
  ];

  const handleNavClick = (href: string) => {
    if (href === "__about__") {
      setActiveNavKey("aboutUs");
      onNavigate("about");
    } else {
      setActiveNavKey(href.slice(1));
      if (currentPage !== "home") {
        onNavigate("home");
        setTimeout(() => {
          document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-black/60 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-red-950/10 ${scrolled
        ? ""
        : ""
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#home"
          className="flex items-center gap-2.5 group"
          onClick={(e) => {
            e.preventDefault();
            setActiveNavKey("home");
            onNavigate("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <img src={logoImg} alt="Lollipop" className="h-9 w-auto rounded-[8px]" />
          <span className="text-white tracking-wide" style={{ fontSize: "1.3rem", fontWeight: 700 }}>
            {messages.common.brand}
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((l) =>
            l.href === "__about__" ? (
              <button
                key={l.key}
                onClick={() => {
                  setActiveNavKey("aboutUs");
                  onNavigate("about");
                }}
                className={`transition-colors relative group cursor-pointer ${activeNavKey === l.key ? "text-white" : "text-gray-300 hover:text-white"}`}
                style={{ fontSize: "0.9rem", fontWeight: 500 }}
              >
                {messages.navbar.links[l.key]}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300 ${activeNavKey === l.key ? "w-full" : "w-0 group-hover:w-full"}`} />
              </button>
            ) : (
              <a
                key={l.key}
                href={l.href}
                onClick={(e) => {
                  setActiveNavKey(l.key);
                  if (currentPage !== "home") {
                    e.preventDefault();
                    handleNavClick(l.href);
                  }
                }}
                className={`transition-colors relative group ${activeNavKey === l.key ? "text-white" : "text-gray-300 hover:text-white"}`}
                style={{ fontSize: "0.9rem", fontWeight: 500 }}
              >
                {messages.navbar.links[l.key]}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300 ${activeNavKey === l.key ? "w-full" : "w-0 group-hover:w-full"}`} />
              </a>
            )
          )}

        </div>

        {/* CTA + Language */}
        <div className="hidden lg:flex items-center gap-3">
          {/* 发行中心入口 */}
          <Link
            to="/distribution"
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white px-5 py-2.5 rounded-full transition-all shadow-lg shadow-red-900/30 hover:shadow-red-600/40 cursor-pointer"
            style={{ fontSize: "0.85rem", fontWeight: 600 }}
          >
            {messages.distribution.nav.entry}
          </Link>

          {/* <button
            onClick={() => { onNavigate("contact"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white px-6 py-2.5 rounded-full transition-all shadow-lg shadow-red-900/30 hover:shadow-red-600/40 cursor-pointer"
            style={{ fontSize: "0.85rem", fontWeight: 600 }}
          >
            <Phone className="w-4 h-4" />
            {messages.common.contactUs}
          </button> */}

          {/* Language Globe */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              aria-label={messages.common.language}
              title={currentLanguage.label}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 text-gray-300 hover:text-white hover:border-white/25 transition-all"
            >
              <Globe className="w-[18px] h-[18px]" />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 w-40 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/60 py-1"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLocale(lang.code); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 transition-colors ${currentLanguage.code === lang.code
                        ? "text-red-400 bg-red-500/10"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                        }`}
                      style={{ fontSize: "0.85rem" }}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button className="lg:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="lg:hidden bg-black/90 backdrop-blur-xl border-t border-white/5 px-6 pb-6"
        >
          {navLinks.map((l) =>
            l.href === "__about__" ? (
              <button
                key={l.key}
                onClick={() => { setMobileOpen(false); onNavigate("about"); }}
                className="block w-full text-left py-3 text-gray-300 hover:text-white border-b border-white/5 transition-colors"
                style={{ fontSize: "0.9rem" }}
              >
                {messages.navbar.links[l.key]}
              </button>
            ) : (
              <a
                key={l.key}
                href={l.href}
                onClick={(e) => {
                  setMobileOpen(false);
                  if (currentPage !== "home") {
                    e.preventDefault();
                    handleNavClick(l.href);
                  }
                }}
                className="block py-3 text-gray-300 hover:text-white border-b border-white/5 transition-colors"
                style={{ fontSize: "0.9rem" }}
              >
                {messages.navbar.links[l.key]}
              </a>
            )
          )}

          {/* 发行中心入口（移动端） */}
          <Link
            to="/distribution"
            onClick={() => setMobileOpen(false)}
            className="mt-3 mb-1 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-full"
            style={{ fontWeight: 600 }}
          >
            {messages.distribution.nav.entry}
          </Link>

          {/* Mobile Language Selector */}
          <div className="py-3 border-b border-white/5">
            <p className="text-gray-500 mb-2" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {messages.common.language}
            </p>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLocale(lang.code)}
                  className={`px-3 py-1.5 rounded-full transition-all ${currentLanguage.code === lang.code
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                    : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  style={{ fontSize: "0.8rem" }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* <button
            onClick={() => { setMobileOpen(false); onNavigate("contact"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-full"
            style={{ fontWeight: 600 }}
          >
            <Phone className="w-4 h-4" /> {messages.common.contactUs}
          </button> */}
        </motion.div>
      )}
    </motion.nav>
  );
}
