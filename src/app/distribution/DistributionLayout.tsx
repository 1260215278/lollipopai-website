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
  Menu,
  X,
  Loader2,
  Bell,
  AlertTriangle,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "../i18n";
import type { DistributionMessages } from "./i18n.distribution";
import { clearTokens, isAppAuthed, isPublisherAuthed } from "../services/auth";
import { ApiError } from "../services/http";
import { ensurePublisherToken } from "../services/session";
import {
  getPublisherStatus,
  getPublisherTenantStatus,
  retryPublisherTenantSync,
  type PublisherTenantStatus,
} from "../services/publisher";
import lollipopLogo from "../../imports/Lollipop1.png";

const NAME_PREVIEW_LIMIT = 10;

function previewName(name: string) {
  const chars = Array.from(name);
  if (chars.length <= NAME_PREVIEW_LIMIT) return name;
  return `${chars.slice(0, NAME_PREVIEW_LIMIT).join("")}...`;
}

/** 发行中心后台外壳：左侧边栏 + 顶部头部 + 内容区 <Outlet />
 *  响应式：≥lg 侧边栏常驻；<lg 侧边栏折叠为抽屉，由 header 汉堡按钮唤起。
 *  figma 基准为 1440 桌面单帧，桌面布局保持不变，窄屏优雅降级。 */
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // publisher token 是否就绪：已持有则直接 true；否则等 byAppToken 换取完成再放行子页面，
  // 避免子页面（overview 等）在 token 换到前就发 /publisher/** 请求导致首次 401「token 失效」。
  const [tokenReady, setTokenReady] = useState(() => isPublisherAuthed());
  // 顶栏展示的公司名（取自 /app/publisher/status 的 apply.companyName）
  const [companyName, setCompanyName] = useState("");
  // swift 租户开通状态：失败（tenantSyncStatus=2）时顶栏展示通知铃铛 + 失败弹窗 + 重试
  const [tenant, setTenant] = useState<PublisherTenantStatus | null>(null);
  const [tenantModalOpen, setTenantModalOpen] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const tenantFailed = tenant?.tenantSyncStatus === 2;
  const publisherName = companyName.trim();
  const hasPublisherName = publisherName.length > 0;
  const headerName = hasPublisherName ? previewName(publisherName) : t.common.publisher;

  useEffect(() => {
    if (inSettlement) setSettlementOpen(true);
  }, [inSettlement]);

  // 进入后台页：无登录态直接去登录；有 appToken 但无 publisher token，则用 byAppToken 换取。
  // 换取失败说明还不是发行者或登录态失效，回入驻页，不放行子页面请求 /publisher/**。
  useEffect(() => {
    let alive = true;
    if (isPublisherAuthed()) {
      setTokenReady(true);
      return () => {
        alive = false;
      };
    }
    if (!isAppAuthed()) {
      navigate("/login", { replace: true });
      return () => {
        alive = false;
      };
    }
    setTokenReady(false);
    ensurePublisherToken()
      .then(() => {
        if (alive) setTokenReady(true);
      })
      .catch((err) => {
        if (!alive) return;
        // 401 已由 http 层清 token 并跳登录，勿再误导向入驻页
        if (err instanceof ApiError && err.code === 401) return;
        navigate("/distribution/enroll", { replace: true });
      });
    return () => {
      alive = false;
    };
  }, [navigate]);

  // 拉取入驻状态，用 apply.companyName 作为顶栏展示名（status 用 appToken，登录后即可用）
  useEffect(() => {
    if (!isAppAuthed()) return;
    let alive = true;
    getPublisherStatus()
      .then((s) => {
        if (alive && s.apply?.companyName) setCompanyName(s.apply.companyName);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  // 拉取 swift 租户开通状态：失败时顶栏出现通知铃铛（开通在审核通过后异步进行，此处只读一次即可）
  useEffect(() => {
    if (!isAppAuthed()) return;
    let alive = true;
    getPublisherTenantStatus()
      .then((s) => {
        if (alive) setTenant(s);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  // 手动重试 swift 开通（开通失败时），成功后刷新状态；状态恢复非失败则关闭弹窗
  const handleRetryTenant = async () => {
    if (retrying) return;
    setRetrying(true);
    try {
      await retryPublisherTenantSync();
      toast.success(t.tenant.retrySuccess);
      const s = await getPublisherTenantStatus();
      setTenant(s);
      if (s.tenantSyncStatus !== 2) setTenantModalOpen(false);
    } catch {
      // http 已 toast 后端文案
    } finally {
      setRetrying(false);
    }
  };

  // 路由切换时收起移动端抽屉
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

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
    clearTokens();
    navigate("/login");
  };

  return (
    <div
      className="flex h-screen bg-[#F5F5F5] overflow-hidden"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* ── 桌面侧边栏（≥lg 常驻） ─────────────────────── */}
      <aside className="hidden lg:flex w-[220px] flex-shrink-0 bg-white border-r border-gray-100 flex-col overflow-y-auto">
        <SidebarNav
          t={t}
          inSettlement={inSettlement}
          settlementOpen={settlementOpen}
          onToggleSettlement={() => setSettlementOpen((v) => !v)}
        />
      </aside>

      {/* ── 移动端抽屉（<lg） ──────────────────────────── */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative w-[240px] max-w-[80vw] bg-white border-r border-gray-100 flex flex-col overflow-y-auto shadow-xl">
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 z-10"
              aria-label={t.common.close}
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarNav
              t={t}
              inSettlement={inSettlement}
              settlementOpen={settlementOpen}
              onToggleSettlement={() => setSettlementOpen((v) => !v)}
            />
          </aside>
        </div>
      )}

      {/* ── 右侧 ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white border-b border-gray-100 flex-shrink-0 h-[60px] flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label={t.common.menu}
            >
              <Menu className="w-5 h-5" />
            </button>
            <span
              className="hidden sm:inline-block text-sm whitespace-nowrap"
              style={{ fontWeight: 600, color: "#111111" }}
            >
              {t.common.workspace}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* swift 开通失败通知铃铛（仅失败时出现，点击打开说明弹窗可重试） */}
            {tenantFailed && (
              <button
                onClick={() => setTenantModalOpen(true)}
                className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                title={t.tenant.notifyTitle}
                aria-label={t.tenant.notifyTitle}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E8192C] border border-white" />
              </button>
            )}

            {/* 语言切换（4 语言） */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-all"
                style={{ fontWeight: 500 }}
                title={t.common.language}
              >
                <Globe className="w-3 h-3" />
                <span className="hidden sm:inline">{currentLanguage.label}</span>
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
                <div className="hidden sm:block text-left leading-tight min-w-0 max-w-[120px]">
                  <p className="text-xs whitespace-nowrap" style={{ fontWeight: 600, color: "#111111" }}>
                    {headerName}
                  </p>
                  {hasPublisherName && <p className="text-[11px] text-gray-400 mt-0.5">{t.common.publisher}</p>}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
              </div>
              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-[240px] bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  {hasPublisherName && (
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-[11px] text-gray-400" style={{ fontWeight: 500 }}>{t.common.publisher}</p>
                      <p className="mt-1 text-sm text-gray-800 break-words" style={{ fontWeight: 600 }}>
                        {publisherName}
                      </p>
                    </div>
                  )}
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
          {tokenReady ? (
            <Outlet />
          ) : (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
            </div>
          )}
        </main>
      </div>

      {/* swift 开通失败说明弹窗（点击通知铃铛打开，可手动重试） */}
      {tenantModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setTenantModalOpen(false)} />
          <div className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 pt-6 pb-5">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-[#E8192C]" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[#111111]" style={{ fontWeight: 700, fontSize: "1rem" }}>
                    {t.tenant.failedTitle}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{t.tenant.failedDesc}</p>
                </div>
              </div>
              {tenant?.tenantSyncMsg && (
                <div className="mt-4 rounded-lg bg-gray-50 border border-gray-100 px-3.5 py-2.5">
                  <p className="text-xs text-gray-400" style={{ fontWeight: 600 }}>{t.tenant.reasonLabel}</p>
                  <p className="text-sm text-gray-600 mt-1 break-words">{tenant.tenantSyncMsg}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setTenantModalOpen(false)}
                className="flex-1 h-10 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                style={{ fontWeight: 500 }}
              >
                {t.common.close}
              </button>
              <button
                onClick={handleRetryTenant}
                disabled={retrying}
                className="flex-1 h-10 rounded-lg bg-[#111111] text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                style={{ fontWeight: 600 }}
              >
                {retrying && <Loader2 className="w-4 h-4 animate-spin" />}
                {t.common.retry}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** 侧边栏内容（logo + 导航），桌面与移动端抽屉共用 */
function SidebarNav({
  t,
  inSettlement,
  settlementOpen,
  onToggleSettlement,
}: {
  t: DistributionMessages;
  inSettlement: boolean;
  settlementOpen: boolean;
  onToggleSettlement: () => void;
}) {
  return (
    <>
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
            onClick={onToggleSettlement}
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

        <SideRow
          to="/distribution/members"
          icon={<Users className="w-[15px] h-[15px]" />}
          label={t.nav.members}
        />
      </nav>
    </>
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
