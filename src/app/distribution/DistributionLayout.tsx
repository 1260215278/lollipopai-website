import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router";
import {
  BarChart3,
  Video,
  Wallet,
  ArrowLeft,
  ChevronDown,
  Globe,
  LogOut,
  User,
  Menu,
  X,
  Loader2,
  Bell,
  AlertTriangle,
  ShieldCheck,
  Users,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "../i18n";
import type { DistributionMessages } from "./i18n.distribution";
import { clearTokens, isAppAuthed, isPublisherAuthed } from "../services/auth";
import { ApiError } from "../services/http";
import { logoutAccount } from "../services/account";
import {
  ensurePublisherAccess,
  exchangePublisherToken,
  verifyPublisherTwoFactor,
  type PublisherTwoFactorChallenge,
} from "../services/session";
import {
  AuditStatus,
  getPublisherStatus,
  getPublisherTenantStatus,
  retryPublisherTenantSync,
  type PublisherTenantStatus,
} from "../services/publisher";
import { getCurrentMember, type CurrentPublisherMember } from "../services/member";
import type { DistributionNavigationState } from "./entryNavigation";
import lollipopLogo from "../../imports/Lollipop1.png";

const NAME_PREVIEW_LIMIT = 10;
const PERMISSION = {
  DASHBOARD_VIEW: "DASHBOARD_VIEW",
  COURSE_VIEW_ASSIGNED: "COURSE_VIEW_ASSIGNED",
  COURSE_MANAGE: "COURSE_MANAGE",
  SETTLEMENT_VIEW: "SETTLEMENT_VIEW",
  SETTLEMENT_WITHDRAW: "SETTLEMENT_WITHDRAW",
  ACCOUNT_SETTING: "ACCOUNT_SETTING",
  MEMBER_MANAGE: "MEMBER_MANAGE",
} as const;

export interface DistributionOutletContext {
  currentMember: CurrentPublisherMember | null;
}

function previewName(name: string) {
  const chars = Array.from(name);
  if (chars.length <= NAME_PREVIEW_LIMIT) return name;
  return `${chars.slice(0, NAME_PREVIEW_LIMIT).join("")}...`;
}

function hasPermission(member: CurrentPublisherMember | null, permission: string): boolean {
  return member?.permissions?.includes(permission) === true;
}

function canViewDashboard(member: CurrentPublisherMember | null): boolean {
  return hasPermission(member, PERMISSION.DASHBOARD_VIEW);
}

function canViewContent(member: CurrentPublisherMember | null): boolean {
  return hasPermission(member, PERMISSION.COURSE_VIEW_ASSIGNED) || hasPermission(member, PERMISSION.COURSE_MANAGE);
}

function canViewSettlement(member: CurrentPublisherMember | null): boolean {
  return hasPermission(member, PERMISSION.SETTLEMENT_VIEW);
}

function canWithdraw(member: CurrentPublisherMember | null): boolean {
  return hasPermission(member, PERMISSION.SETTLEMENT_WITHDRAW);
}

function canViewAccount(member: CurrentPublisherMember | null): boolean {
  return hasPermission(member, PERMISSION.ACCOUNT_SETTING);
}

function canViewMembers(member: CurrentPublisherMember | null): boolean {
  return hasPermission(member, PERMISSION.MEMBER_MANAGE);
}

function canAccessPath(member: CurrentPublisherMember | null, path: string): boolean {
  if (path.includes("/overview")) return canViewDashboard(member);
  if (path.includes("/content")) return canViewContent(member);
  if (path.includes("/earnings")) return canViewSettlement(member);
  if (path.includes("/withdraw")) return canWithdraw(member);
  if (path.includes("/payment")) return canViewSettlement(member);
  if (path.includes("/account")) return canViewAccount(member);
  if (path.includes("/members")) return canViewMembers(member);
  return canViewContent(member);
}

function firstAllowedPath(member: CurrentPublisherMember | null): string {
  if (canViewDashboard(member)) return "/distribution/overview";
  if (canViewContent(member)) return "/distribution/content";
  if (canViewSettlement(member)) return "/distribution/earnings";
  if (canWithdraw(member)) return "/distribution/withdraw";
  if (canViewAccount(member)) return "/distribution/account";
  if (canViewMembers(member)) return "/distribution/members";
  return "/distribution/enroll";
}

/** 发行中心后台外壳：左侧边栏 + 顶部头部 + 内容区 <Outlet />
 *  响应式：≥lg 侧边栏常驻；<lg 侧边栏折叠为抽屉，由 header 汉堡按钮唤起。
 *  figma 基准为 1440 桌面单帧，桌面布局保持不变，窄屏优雅降级。 */
export function DistributionLayout() {
  const { messages, languages, currentLanguage, setLocale } = useI18n();
  const t = messages.distribution;
  const navigate = useNavigate();
  const location = useLocation();
  const expectsTwoFactor = (location.state as DistributionNavigationState | null)?.publisherEntryTarget === "CONSOLE_2FA";

  const inSettlement =
    location.pathname.includes("/payment") ||
    location.pathname.includes("/earnings") ||
    location.pathname.includes("/withdraw");

  const [settlementOpen, setSettlementOpen] = useState(true);
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // publisher token 是否就绪：已持有则直接 true；否则等 byAppToken 换取完成再放行子页面，
  // 避免子页面（overview 等）在 token 换到前就发 /publisher/** 请求导致首次 401「token 失效」。
  const [tokenReady, setTokenReady] = useState(() => isPublisherAuthed());
  const [memberReady, setMemberReady] = useState(false);
  const [entryError, setEntryError] = useState("");
  // byAppToken 返回 stage=2FA_REQUIRED 时的待校验载荷：非空则先展示二次验证码界面
  const [twoFactorChallenge, setTwoFactorChallenge] = useState<PublisherTwoFactorChallenge | null>(null);
  // 顶栏展示的公司名（优先取 member/me.publisherName，兜底 /app/publisher/status 的 apply.companyName）
  const [companyName, setCompanyName] = useState("");
  // swift 租户开通状态：失败（tenantSyncStatus=2）时顶栏展示通知铃铛 + 失败弹窗 + 重试
  const [tenant, setTenant] = useState<PublisherTenantStatus | null>(null);
  const [currentMember, setCurrentMember] = useState<CurrentPublisherMember | null>(null);
  const [tenantModalOpen, setTenantModalOpen] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const tenantFailed = tenant?.tenantSyncStatus === 2;
  const publisherName = (currentMember?.publisherName || companyName).trim();
  const memberDisplayName = (currentMember?.phoneMask || currentMember?.nickname || "").trim();
  const hasPublisherName = publisherName.length > 0;
  const headerName = memberDisplayName || (hasPublisherName ? previewName(publisherName) : t.common.publisher);
  const returnHomeLabel =
    currentLanguage.code === "zh-CN"
      ? "返回官网"
      : currentLanguage.code === "zh-TW"
        ? "返回官網"
        : `${t.common.back} ${messages.common.brand}`;

  useEffect(() => {
    if (inSettlement) setSettlementOpen(true);
  }, [inSettlement]);

  // 进入后台页：无登录态直接去入驻申请；有 appToken 但无 publisher token，则优先用 byAppToken 换取。
  // 换取失败不直接拦截：回落 /app/publisher/status，把新用户/审核中/驳回导向入驻状态页。
  useEffect(() => {
    let alive = true;
    if (isPublisherAuthed()) {
      setTokenReady(true);
      setEntryError("");
      setTwoFactorChallenge(null);
      return () => {
        alive = false;
      };
    }
    if (!isAppAuthed()) {
      navigate("/distribution/enroll", { replace: true });
      return () => {
        alive = false;
      };
    }
    setTokenReady(false);
    setMemberReady(false);
    setEntryError("");
    setTwoFactorChallenge(null);
    ensurePublisherAccess()
      .then((result) => {
        if (!alive) return;
        if (result.stage === "2fa") {
          setTwoFactorChallenge(result.challenge);
          return;
        }
        setTwoFactorChallenge(null);
        setTokenReady(true);
      })
      .catch(async (err) => {
        if (!alive) return;
        if (err instanceof ApiError && err.code === 403398) {
          setEntryError(t.twoFactor.bindPhoneFirst);
          return;
        }
        const loginMsg = err instanceof Error ? err.message : t.common.serverError;
        try {
          const status = await getPublisherStatus({ toastOnError: false });
          if (!alive) return;
          if (status.auditStatus === AuditStatus.APPROVED || status.isPublisher === 1) {
            toast.error(loginMsg);
            setEntryError(loginMsg);
            return;
          }
          navigate("/distribution/enroll", { replace: true });
          return;
        } catch (statusErr) {
          if (!alive) return;
          const code = statusErr instanceof ApiError ? statusErr.code : -1;
          if (code === 401 || code === 401181 || code === 401182) {
            clearTokens();
            navigate("/login", { replace: true });
            return;
          }
          // status 无法确认时保留 byAppToken 的后端文案，避免误导用户进入错误状态。
          toast.error(loginMsg);
          setEntryError(loginMsg);
        }
      });
    return () => {
      alive = false;
    };
  }, [navigate, t.twoFactor.bindPhoneFirst]);

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

  useEffect(() => {
    if (!tokenReady) {
      setCurrentMember(null);
      setMemberReady(false);
      return;
    }
    let alive = true;
    setMemberReady(false);
    setEntryError("");
    getCurrentMember()
      .then((member) => {
        if (!alive) return;
        setCurrentMember(member);
        setMemberReady(true);
      })
      .catch((err) => {
        if (!alive) return;
        const msg = err instanceof Error ? err.message : t.common.serverError;
        setCurrentMember(null);
        setEntryError(msg);
        setMemberReady(true);
      });
    return () => {
      alive = false;
    };
  }, [t.common.serverError, tokenReady]);

  useEffect(() => {
    if (!memberReady || !currentMember) return;
    if (!canAccessPath(currentMember, location.pathname)) {
      navigate(firstAllowedPath(currentMember), { replace: true });
    }
  }, [currentMember, location.pathname, memberReady, navigate]);

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

  const handleLogout = async () => {
    setUserMenuOpen(false);
    if (isPublisherAuthed()) {
      try {
        await logoutAccount();
      } catch {
        // 本地退出不能被服务端会话清理失败阻塞。
      }
    }
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
          currentMember={currentMember}
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
              currentMember={currentMember}
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
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex h-9 items-center gap-1.5  pointer rounded-lg px-2.5 text-sm text-[#111111] transition-colors hover:bg-gray-50 flex-shrink-0"
              style={{ fontWeight: 600 }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{returnHomeLabel}</span>
            </button>
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
                    onClick={() => void handleLogout()}
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
          {entryError ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="max-w-md rounded-2xl bg-white border border-gray-100 px-6 py-5 text-center shadow-sm">
                <AlertTriangle className="w-6 h-6 text-[#E8192C] mx-auto" />
                <p className="text-sm text-gray-700 mt-3 leading-relaxed">{entryError}</p>
              </div>
            </div>
          ) : !tokenReady && (twoFactorChallenge || expectsTwoFactor) ? (
            <TwoFactorGate
              t={t}
              challenge={twoFactorChallenge}
              onChallenge={setTwoFactorChallenge}
              onVerified={() => {
                setTwoFactorChallenge(null);
                setTokenReady(true);
              }}
              onBlocked={(msg) => {
                setTwoFactorChallenge(null);
                setEntryError(msg);
              }}
            />
          ) : tokenReady && memberReady && currentMember && canAccessPath(currentMember, location.pathname) ? (
            <Outlet context={{ currentMember } satisfies DistributionOutletContext} />
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

/** 两步验证登录界面（item 12）：entryStatus 已确认 2FA 后立即展示；
 *  challenge 返回前显示发码中，返回后展示 phoneMask + 倒计时并允许校验。
 *  verify2fa 成功才放行后台。
 *  重发 = 重新调 byAppToken（后端会重发短信并返回新 challengeToken）。 */
function TwoFactorGate({
  t,
  challenge,
  onChallenge,
  onVerified,
  onBlocked,
}: {
  t: DistributionMessages;
  challenge: PublisherTwoFactorChallenge | null;
  onChallenge: (challenge: PublisherTwoFactorChallenge) => void;
  onVerified: () => void;
  onBlocked: (msg: string) => void;
}) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [remaining, setRemaining] = useState(challenge?.expireSeconds ?? 0);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const waitingForChallenge = challenge === null;
  const expired = !waitingForChallenge && remaining <= 0;

  useEffect(() => {
    if (!challenge) {
      setRemaining(0);
      return;
    }
    setRemaining(challenge.expireSeconds);
    const id = window.setInterval(() => setRemaining((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [challenge]);

  // 账号/成员/账户状态变化类错误：按各自语义回入驻页或登录页；返回是否已处理
  const handleFatal = (errCode: number): boolean => {
    if (errCode === 40020) {
      navigate("/distribution/enroll", { replace: true });
      return true;
    }
    if (errCode === 401 || errCode === 401181 || errCode === 401182 || errCode === 403347) {
      clearTokens();
      navigate("/login", { replace: true });
      return true;
    }
    return false;
  };

  const resend = async () => {
    if (resending || waitingForChallenge) return;
    setResending(true);
    try {
      const result = await exchangePublisherToken();
      if (result.stage === "2fa") {
        setCode("");
        onChallenge(result.challenge);
        toast.success(t.twoFactor.resent);
      } else {
        // 期间管理员关闭了 2FA：byAppToken 直接给了正式 token，放行
        onVerified();
      }
    } catch (err) {
      const errCode = err instanceof ApiError ? err.code : -1;
      if (handleFatal(errCode)) return;
      if (errCode === 403398) {
        onBlocked(t.twoFactor.bindPhoneFirst);
        return;
      }
      toast.error(err instanceof Error ? err.message : t.common.serverError);
    } finally {
      setResending(false);
    }
  };

  const verify = async () => {
    if (!challenge) return;
    const value = code.trim();
    if (!value) {
      toast.error(t.twoFactor.codeRequired);
      return;
    }
    if (verifying) return;
    setVerifying(true);
    try {
      await verifyPublisherTwoFactor(challenge.challengeToken, value);
      onVerified();
    } catch (err) {
      const errCode = err instanceof ApiError ? err.code : -1;
      if (handleFatal(errCode)) return;
      toast.error(err instanceof Error ? err.message : t.common.serverError);
      // 403397 码错/过期：challengeToken 未失效可重填重试；403396 会话失效：重走 byAppToken 拿新码
      if (errCode === 403396) {
        setCode("");
        await resend();
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="w-full max-w-[400px] rounded-2xl bg-white border border-gray-100 px-6 py-7 shadow-sm">
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mx-auto">
          <ShieldCheck className="w-6 h-6 text-[#111111]" />
        </span>
        <h3 className="mt-4 text-center text-[#111111]" style={{ fontWeight: 700, fontSize: "1rem" }}>
          {t.twoFactor.title}
        </h3>
        <div className="mt-2 flex min-h-[22px] items-center justify-center gap-2 text-center text-sm text-gray-500 leading-relaxed">
          {waitingForChallenge && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          <span>{challenge ? t.twoFactor.desc.replace("{phone}", challenge.phoneMask) : t.twoFactor.pendingDesc}</span>
        </div>
        <label className="block mt-5">
          <span className="mb-1.5 block text-xs text-[#364153]" style={{ fontWeight: 600 }}>
            {t.twoFactor.codeLabel}
          </span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !waitingForChallenge) void verify();
            }}
            placeholder={t.twoFactor.codePlaceholder}
            autoComplete="one-time-code"
            inputMode="numeric"
            className="h-11 w-full rounded-[10px] border border-[#e5e7eb] px-3 text-sm outline-none focus:border-[#111111]"
          />
        </label>
        {challenge && (
          <p className={`mt-2 text-xs ${expired ? "text-[#E8192C]" : "text-gray-400"}`}>
            {expired ? t.twoFactor.expired : t.twoFactor.expireIn.replace("{s}", String(remaining))}
          </p>
        )}
        <button
          type="button"
          onClick={() => void verify()}
          disabled={verifying || expired || waitingForChallenge}
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#111111] text-sm text-white transition-all hover:opacity-90 disabled:opacity-60"
          style={{ fontWeight: 600 }}
        >
          {verifying && <Loader2 className="w-4 h-4 animate-spin" />}
          {t.twoFactor.verify}
        </button>
        <button
          type="button"
          onClick={() => void resend()}
          disabled={resending || waitingForChallenge}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border border-[#e5e7eb] text-sm text-[#4a5565] transition-colors hover:bg-gray-50 disabled:opacity-60"
          style={{ fontWeight: 500 }}
        >
          {resending && <Loader2 className="w-4 h-4 animate-spin" />}
          {t.twoFactor.resend}
        </button>
      </div>
    </div>
  );
}

/** 侧边栏内容（logo + 导航），桌面与移动端抽屉共用 */
function SidebarNav({
  t,
  inSettlement,
  settlementOpen,
  onToggleSettlement,
  currentMember,
}: {
  t: DistributionMessages;
  inSettlement: boolean;
  settlementOpen: boolean;
  onToggleSettlement: () => void;
  currentMember: CurrentPublisherMember | null;
}) {
  const showDashboard = canViewDashboard(currentMember);
  const showContent = canViewContent(currentMember);
  const showSettlement = canViewSettlement(currentMember);
  const showWithdraw = canWithdraw(currentMember);
  const showAccount = canViewAccount(currentMember);
  const showMembers = canViewMembers(currentMember);

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
          style={{ fontWeight: 700, letterSpacing: 0 }}
        >
          {t.common.brand}
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {showDashboard && (
          <SideRow
            to="/distribution/overview"
            icon={<BarChart3 className="w-[15px] h-[15px]" />}
            label={t.overview.title}
          />
        )}
        {showContent && <SideRow to="/distribution/content" icon={<Video className="w-[15px] h-[15px]" />} label={t.nav.content} />}

        {showSettlement && (
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
                <SubRow to="/distribution/earnings" label={t.nav.earnings} />
                {showWithdraw && <SubRow to="/distribution/withdraw" label={t.nav.withdraw} />}
                <SubRow to="/distribution/payment" label={t.nav.payment} />
              </div>
            )}
          </div>
        )}

        {showAccount && (
          <SideRow
            to="/distribution/account"
            icon={<UserRound className="w-[15px] h-[15px]" />}
            label={t.nav.account}
          />
        )}
        {showMembers && (
          <SideRow
            to="/distribution/members"
            icon={<Users className="w-[15px] h-[15px]" />}
            label={t.nav.members}
          />
        )}
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
