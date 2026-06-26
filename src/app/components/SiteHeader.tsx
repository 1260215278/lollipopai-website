import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Globe, User, LogOut, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router";
import logoImg from "../../imports/Lollipop1.png";
import { useI18n } from "../i18n";
import { isAppAuthed, getLoginName, clearTokens, subscribeAuthChange } from "../services/auth";

/** 顶栏登录态（已登录 + 展示名），登录/退出后即时刷新。 */
function useAuthSession() {
  const [session, setSession] = useState(() => ({ authed: isAppAuthed(), name: getLoginName() }));
  useEffect(
    () => subscribeAuthChange(() => setSession({ authed: isAppAuthed(), name: getLoginName() })),
    [],
  );
  return session;
}

/** 顶栏导航项。to → react-router 跳转；onClick → 自定义行为（站内滚动/状态切换）。 */
export interface SiteNavItem {
  key: string;
  label: string;
  active?: boolean;
  to?: string;
  onClick?: () => void;
}

/**
 * 全站统一顶栏（figma 15237-33700 顶部）：
 * Logo + 导航(Home/Creating/Distribution/Download/Contact) + Sign Up + Log In + 语言球。
 * 营销站(Navbar) 与发行者入驻页(EnrollHeader) 共用，导航行为由各自传入。
 * 未登录：Sign Up / Log In 均跳 /login（创作者账号由平台创建，仅支持登录）。
 * 已登录：右侧改为「用户信息 + 下拉退出菜单」，登录态由 services/auth 跨页同步。
 */
export function SiteHeader({
  navItems,
  onLogoClick,
  sticky = false,
}: {
  navItems: SiteNavItem[];
  onLogoClick?: () => void;
  /** true → sticky（入驻页，占据布局）；默认 false → fixed（营销站，浮于 hero 之上）。 */
  sticky?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const { messages, languages, currentLanguage, setLocale } = useI18n();
  const navigate = useNavigate();
  const nav = messages.navbar;
  const { authed, name } = useAuthSession();
  const displayName = name || nav.account;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 退出登录：清除 token 与展示名，关闭菜单并回到首页。
  const onLogout = () => {
    clearTokens();
    setUserOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  const renderNavItem = (item: SiteNavItem, mobile = false) => {
    const color = item.active ? "text-white" : "text-gray-300 hover:text-white";
    const close = () => setMobileOpen(false);
    if (mobile) {
      const cls = `block w-full text-left py-3 border-b border-white/5 transition-colors ${color}`;
      return item.to ? (
        <Link key={item.key} to={item.to} onClick={close} className={cls} style={{ fontSize: "0.9rem", fontWeight: 500 }}>
          {item.label}
        </Link>
      ) : (
        <button key={item.key} onClick={() => { close(); item.onClick?.(); }} className={cls} style={{ fontSize: "0.9rem", fontWeight: 500 }}>
          {item.label}
        </button>
      );
    }
    const underline = (
      <span
        className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300 ${
          item.active ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />
    );
    const cls = `transition-colors relative group cursor-pointer ${color}`;
    return item.to ? (
      <Link key={item.key} to={item.to} className={cls} style={{ fontSize: "0.9rem", fontWeight: 500 }}>
        {item.label}
        {underline}
      </Link>
    ) : (
      <button key={item.key} onClick={item.onClick} className={cls} style={{ fontSize: "0.9rem", fontWeight: 500 }}>
        {item.label}
        {underline}
      </button>
    );
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`${sticky ? "sticky" : "fixed left-0 right-0"} top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-red-950/10`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <button onClick={onLogoClick} className="flex items-center gap-2.5 cursor-pointer">
          <img src={logoImg} alt="Lollipop" className="h-9 w-auto rounded-[8px]" />
          <span className="text-white tracking-wide" style={{ fontSize: "1.3rem", fontWeight: 700 }}>
            {messages.common.brand}
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">{navItems.map((i) => renderNavItem(i))}</div>

        {/* Right: 已登录(用户菜单) / 未登录(Sign Up + Log In，均跳 /login) / 语言 */}
        <div className="hidden lg:flex items-center gap-3">
          {authed ? (
            /* 已登录：用户信息 + 下拉退出菜单 */
            <div ref={userRef} className="relative">
              <button
                onClick={() => setUserOpen((v) => !v)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-white/15 text-gray-200 hover:text-white hover:border-white/30 transition-all"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white">
                  <User className="w-4 h-4" />
                </span>
                <span className="max-w-[140px] truncate" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  {displayName}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform ${userOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {userOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-44 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/60 py-1"
                  >
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      style={{ fontSize: "0.85rem" }}
                    >
                      <LogOut className="w-4 h-4" />
                      {nav.logOut}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-full border border-white/15 text-gray-200 hover:text-white hover:border-white/30 transition-all"
                style={{ fontSize: "0.85rem", fontWeight: 600 }}
              >
                {nav.signUp}
              </Link>
              <Link
                to="/login"
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white px-5 py-2.5 rounded-full transition-all shadow-lg shadow-red-900/30 hover:shadow-red-600/40"
                style={{ fontSize: "0.85rem", fontWeight: 600 }}
              >
                {nav.logIn}
              </Link>
            </>
          )}

          {/* 语言球 */}
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
                      className={`w-full text-left px-4 py-2.5 transition-colors ${
                        currentLanguage.code === lang.code
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

        {/* 移动端汉堡 */}
        <button className="lg:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)} aria-label={nav.signUp}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* 移动端菜单 */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-black/90 backdrop-blur-xl border-t border-white/5 px-6 pb-6 overflow-hidden"
          >
            {navItems.map((i) => renderNavItem(i, true))}

            {authed ? (
              /* 已登录：展示用户信息 + 退出登录 */
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2.5 px-1">
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white">
                    <User className="w-4 h-4" />
                  </span>
                  <span className="text-white truncate" style={{ fontWeight: 600 }}>
                    {displayName}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-white/15 text-gray-200"
                  style={{ fontWeight: 600 }}
                >
                  <LogOut className="w-4 h-4" />
                  {nav.logOut}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-4">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-3 rounded-full border border-white/15 text-gray-200"
                  style={{ fontWeight: 600 }}
                >
                  {nav.signUp}
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white"
                  style={{ fontWeight: 600 }}
                >
                  {nav.logIn}
                </Link>
              </div>
            )}

            {/* 移动端语言 */}
            <div className="py-3 mt-2 border-t border-white/5">
              <p
                className="text-gray-500 mb-2"
                style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}
              >
                {messages.common.language}
              </p>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLocale(lang.code)}
                    className={`px-3 py-1.5 rounded-full transition-all ${
                      currentLanguage.code === lang.code
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
