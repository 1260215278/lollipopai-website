import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router";
import {
  BarChart2,
  Video,
  Wallet,
  ChevronDown,
  Globe,
  LogOut,
  User,
} from "lucide-react";
import { useI18n } from "../i18n";
import { setToken } from "../services/auth";
import lollipopLogo from "../../imports/Lollipop1.png";

/** 发行中心后台外壳：左侧边栏 + 顶部头部 + 内容区 <Outlet /> */
export function DistributionLayout() {
  const { messages, languages, currentLanguage, setLocale } = useI18n();
  const t = messages.distribution;
  const navigate = useNavigate();
  const location = useLocation();

  const inSettlement =
    location.pathname.includes("/payment") ||
    location.pathname.includes("/earnings") ||
    location.pathname.includes("/withdraw");

  const [settlementOpen, setSettlementOpen] = useState(inSettlement);
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inSettlement) setSettlementOpen(true);
  }, [inSettlement]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setUserMenuOpen(false);
    setToken(null);
    navigate("/");
  };

  return (
    <div
      className="flex h-screen bg-[#F5F5F5] overflow-hidden"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* ── 侧边栏 ───────────────────────────────── */}
      <aside className="w-[220px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-y-auto">
        <div className="px-4 h-[60px] flex items-center gap-2 border-b border-gray-100 flex-shrink-0">
          <img
            src={lollipopLogo}
            alt="Lollipop"
            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
          />
          <span
            className="text-[#111111] text-xs leading-tight"
            style={{ fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            {t.common.brand}
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <SideRow to="/distribution/overview" icon={<BarChart2 className="w-[15px] h-[15px]" />} label={t.nav.overview} />
          <SideRow to="/distribution/content" icon={<Video className="w-[15px] h-[15px]" />} label={t.nav.content} />

          {/* 结算中心（可折叠分组） */}
          <div>
            <button
              onClick={() => setSettlementOpen((v) => !v)}
              className="w-full flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-left transition-colors hover:bg-gray-50"
            >
              <Wallet
                className="w-[15px] h-[15px] flex-shrink-0 transition-colors"
                style={{ color: inSettlement ? "#111111" : "#9CA3AF" }}
              />
              <span
                className="flex-1 text-sm transition-colors"
                style={{ fontWeight: 500, color: inSettlement ? "#111111" : "#374151" }}
              >
                {t.nav.settlement}
              </span>
              <ChevronDown
                className="w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0"
                style={{ transform: settlementOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
              />
            </button>

            {settlementOpen && (
              <div className="ml-[34px] mt-0.5 space-y-0.5">
                <SubRow to="/distribution/payment" label={t.nav.payment} />
                <SubRow to="/distribution/earnings" label={t.nav.earnings} />
                <SubRow to="/distribution/withdraw" label={t.nav.withdraw} />
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* ── 右侧 ────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 flex-shrink-0 h-[60px] flex items-center justify-between px-6">
          <span
            className="px-3.5 py-1.5 text-sm rounded-lg"
            style={{ fontWeight: 600, color: "#111111", background: "#F3F4F6" }}
          >
            {t.common.workspace}
          </span>

          <div className="flex items-center gap-2">
            {/* 语言切换（4 语言） */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-all"
                style={{ fontWeight: 500 }}
                title={t.common.language}
              >
                <Globe className="w-3 h-3" />
                {currentLanguage.label}
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              {langOpen && (
                <div className="absolute top-full right-0 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLocale(lang.code);
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        currentLanguage.code === lang.code
                          ? "text-[#E8192C] bg-red-50"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* 用户菜单 */}
            <div ref={userRef} className="relative">
              <div
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
                onClick={() => setUserMenuOpen((v) => !v)}
              >
                <div className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-400 leading-tight">{t.common.publisher}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
              </div>
              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t.common.logout}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SideRow({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink to={to} end>
      {({ isActive }) => (
        <span
          className="w-full flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-sm transition-all"
          style={{
            background: isActive ? "#111111" : "transparent",
            color: isActive ? "white" : "#374151",
            fontWeight: isActive ? 600 : 400,
          }}
        >
          <span style={{ color: isActive ? "rgba(255,255,255,0.8)" : "#9CA3AF" }}>{icon}</span>
          {label}
        </span>
      )}
    </NavLink>
  );
}

function SubRow({ to, label }: { to: string; label: string }) {
  return (
    <NavLink to={to} end>
      {({ isActive }) => (
        <span
          className="w-full block text-left px-3 py-[7px] rounded-lg text-sm transition-all"
          style={{
            color: isActive ? "#111111" : "#6B7280",
            fontWeight: isActive ? 600 : 400,
            border: isActive ? "1.5px solid #111111" : "1.5px solid transparent",
            background: isActive ? "rgba(0,0,0,0.02)" : "transparent",
          }}
        >
          {label}
        </span>
      )}
    </NavLink>
  );
}
