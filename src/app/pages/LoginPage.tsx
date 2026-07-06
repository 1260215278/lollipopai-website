import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "../components/ui/sonner";
import { useI18n } from "../i18n";
import { Footer } from "../components/Footer";
import { SiteHeader, type SiteNavItem } from "../components/SiteHeader";
import { AreaCodeSelect } from "../components/AreaCodeSelect";
import { ApiError } from "../services/http";
import {
  loginByPhone,
  loginByEmail,
  loginByPhonePassword,
  loginByEmailPassword,
  registerByPhone,
  registerByEmail,
  sendPhoneLoginCode,
  sendRegisterEmailCode,
} from "../services/session";
import { setLoginName } from "../services/auth";
import promoImg from "../../imports/login-promo.jpg";
import appIcon from "../../imports/login-app-icon.png";

type Mode = "login" | "register";
type LoginMethod = "password" | "code";

/** 密码最小长度（与 H5 一致） */
const PWD_MIN = 6;
/** 邮箱账号最大长度（后端限制 50） */
const EMAIL_MAX = 50;

/**
 * 登录 / 注册页 —— figma 15141-27973，登录逻辑复用短剧 H5。
 *
 * 双态（顶栏「注册」→ /login?mode=register，「登录」→ /login）：
 *   登录：可切换密码登录 / 验证码登录；单输入框智能识别手机号/邮箱；
 *   注册：账号 + 验证码 + 密码（手机走 registerCode 带 msg，邮箱走 emailRegister）。
 * token 在响应顶层 = appToken，成功后写入并跳首页 /。
 */
export function LoginPage() {
  const { messages, locale } = useI18n();
  const t = messages.login;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<Mode>(searchParams.get("mode") === "register" ? "register" : "login");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [areaCode, setAreaCode] = useState("+86");
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === "register";
  const isCodeLogin = !isRegister && loginMethod === "code";
  // 纯数字且非空 → 手机号模式（显示区号）；否则按邮箱处理（与 H5 一致）
  const isPhoneMode = /^[0-9]+$/.test(account);

  // 顶栏在本页内切换 ?mode= 时同步状态
  useEffect(() => {
    setMode(searchParams.get("mode") === "register" ? "register" : "login");
  }, [searchParams]);

  // 验证码倒计时
  useEffect(() => {
    if (countdown <= 0) return;
    const id = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [countdown]);

  const onAccountChange = (v: string) => {
    // 手机号模式（纯数字）限制 ≤20 位；邮箱模式限制 ≤50 位
    if (/^[0-9]+$/.test(v)) {
      if (v.length > 20) return;
      setAccount(v);
      return;
    }
    if (v.length > EMAIL_MAX) return;
    setAccount(v);
  };

  const onSendCode = async () => {
    if (countdown > 0 || sending) return;
    const acc = account.trim();
    if (!acc) {
      toast.error(t.vAccountRequired);
      return;
    }
    setSending(true);
    try {
      if (isPhoneMode) {
        await sendPhoneLoginCode(acc, areaCode);
      } else {
        await sendRegisterEmailCode(acc);
      }
      setCountdown(60);
      toast.success(t.codeSent);
    } catch {
      // http 已 toast
    } finally {
      setSending(false);
    }
  };

  const onSubmit = async () => {
    const acc = account.trim();
    if (!acc) {
      toast.error(t.vAccountRequired);
      return;
    }
    if ((isRegister || isCodeLogin) && !code.trim()) {
      toast.error(t.vCodeRequired);
      return;
    }
    if (!isCodeLogin && !password) {
      toast.error(t.vPasswordRequired);
      return;
    }
    if (isRegister && password.length < PWD_MIN) {
      toast.error(t.vPasswordTooShort);
      return;
    }
    setSubmitting(true);
    try {
      if (isRegister) {
        if (isPhoneMode) {
          await registerByPhone({ phone: acc, code: code.trim(), password, areaCode });
        } else {
          await registerByEmail({ email: acc, password, code: code.trim() });
        }
      } else if (loginMethod === "code") {
        if (isPhoneMode) {
          await loginByPhone({ phone: acc, code: code.trim(), areaCode });
        } else {
          await loginByEmail({ emailName: acc, code: code.trim() });
        }
      } else if (isPhoneMode) {
        await loginByPhonePassword({ phone: acc, password, areaCode });
      } else {
        await loginByEmailPassword({ email: acc, password });
      }
      setLoginName(acc);
      toast.success(isRegister ? t.registerSuccess : t.loginSuccess);
      navigate("/");
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full h-[46px] px-4 rounded-[10px] bg-[#333] border border-white/10 text-white text-sm placeholder:text-white/50 outline-none transition-all focus:border-white/30";

  return (
    <div className="w-full bg-black" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <Toaster position="top-center" richColors />

      <div className="min-h-screen flex flex-col">
        <LoginHeader />

        <main className="flex-1 flex">
          {/* 左侧宣传（lg+ 显示） */}
          <div className="hidden lg:block lg:w-[46%] relative overflow-hidden">
            <img src={promoImg} alt="" className="absolute inset-0 w-full h-full object-cover object-[center_42%]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45" />
            <div className="relative z-10 pt-[50px] px-12 text-left max-w-[560px]">
              {/* <p className="text-white leading-[58px]" style={{ fontWeight: 900, fontSize: "50px", letterSpacing: "5px" }}>
                {t.sloganLine1}
              </p>
              <p className="text-white leading-[58px]" style={{ fontWeight: 900, fontSize: "50px", letterSpacing: "5px" }}>
                {t.sloganLine2}
              </p> */}
            </div>
          </div>

          {/* 右侧卡片 */}
          <div className="flex-1 flex items-center justify-center bg-[#030301] px-6 py-16">
            <div className="relative w-full max-w-[489px]">
              <img
                src={appIcon}
                alt="Lollipop"
                className="absolute left-1/2 -translate-x-1/2 -top-[45px] w-[134px] h-[134px] rounded-[20px] object-cover"
              />
              <div className="bg-[#1c1c1c] border border-[#666] rounded-[31px] pt-[104px] pb-10 px-8 sm:px-12">
                <h2 className="text-center text-white" style={{ fontWeight: 700, fontSize: "26px", letterSpacing: 0 }}>
                  {isRegister ? t.registerTitle : t.welcomeTitle}
                </h2>
                <p className="text-center text-[#99a1af] text-sm mt-2">
                  {isRegister ? t.registerSubtitle : t.subtitle}
                </p>

                {!isRegister && (
                  <div className="mt-6 grid grid-cols-2 gap-1 rounded-[12px] border border-white/10 bg-[#333]/60 p-1">
                    {(["password", "code"] as LoginMethod[]).map((method) => {
                      const selected = loginMethod === method;
                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => {
                            setLoginMethod(method);
                            setCode("");
                            setPassword("");
                            setCountdown(0);
                          }}
                          className={`h-9 rounded-[9px] text-sm transition-colors ${selected ? "bg-white text-[#333]" : "text-white/60 hover:text-white"}`}
                          style={{ fontWeight: 600 }}
                        >
                          {method === "password" ? t.passwordLogin : t.codeLogin}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className={`${isRegister ? "mt-8" : "mt-6"} space-y-4`}>
                  {/* 账号：手机号或邮箱（智能识别） */}
                  <div>
                    <label className="block text-xs text-[#6a7282] mb-1.5" style={{ fontWeight: 500 }}>
                      {t.phoneLabel}
                    </label>
                    <div className="flex gap-2">
                      {isPhoneMode && <AreaCodeSelect value={areaCode} onChange={setAreaCode} locale={locale} />}
                      <input
                        className={inputCls + " flex-1"}
                        value={account}
                        onChange={(e) => onAccountChange(e.target.value)}
                        placeholder={t.accountPlaceholder}
                        maxLength={isPhoneMode ? 20 : EMAIL_MAX}
                      />
                    </div>
                  </div>

                  {/* 验证码（注册态 / 验证码登录态） */}
                  {(isRegister || isCodeLogin) && (
                    <div>
                      <label className="block text-xs text-[#6a7282] mb-1.5" style={{ fontWeight: 500 }}>
                        {t.codeLabel}
                      </label>
                      <div className="flex gap-2">
                        <input
                          className={inputCls + " flex-1"}
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder={t.codePlaceholder}
                          inputMode="numeric"
                          maxLength={8}
                        />
                        <button
                          type="button"
                          onClick={onSendCode}
                          disabled={countdown > 0 || sending}
                          className="h-[46px] min-w-[108px] px-4 rounded-[10px] bg-white text-[#333] text-sm whitespace-nowrap flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                          style={{ fontWeight: 500 }}
                        >
                          {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                          {countdown > 0 ? t.resendIn.replace("{s}", String(countdown)) : t.sendCode}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 密码 */}
                  {!isCodeLogin && (
                    <div>
                      <label className="block text-xs text-[#6a7282] mb-1.5" style={{ fontWeight: 500 }}>
                        {t.passwordPlaceholder}
                      </label>
                      <div className="relative">
                        <input
                          className={inputCls + " pr-11"}
                          type={showPwd ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={t.passwordPlaceholder}
                          maxLength={20}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void onSubmit();
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
                          aria-label={showPwd ? "Hide password" : "Show password"}
                        >
                          {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 忘记密码（仅登录态） */}
                  {!isRegister && loginMethod === "password" && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => navigate("/forgot-password")}
                        className="text-xs text-[#99a1af] hover:text-white transition-colors"
                      >
                        {t.forgotPassword}
                      </button>
                    </div>
                  )}

                  {/* 提交 */}
                  <button
                    onClick={onSubmit}
                    disabled={submitting}
                    className="w-full h-12 rounded-[14px] bg-[#f22323] text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-70 mt-2"
                    style={{ fontWeight: 600 }}
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isRegister ? t.registerSubmit : t.submit}
                  </button>

                  {/* 登录/注册切换 */}
                  <div className="flex justify-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCode("");
                        setPassword("");
                        setCountdown(0);
                        setMode(isRegister ? "login" : "register");
                      }}
                      className="text-xs text-[#99a1af] hover:text-white transition-colors"
                    >
                      {isRegister ? t.toLogin : t.toRegister}
                    </button>
                  </div>
                </div>

                {!isRegister && (
                  <p className="text-center text-xs text-[#99a1af] mt-8 leading-relaxed">{t.footerNote}</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer onNavigate={() => navigate("/")} />
    </div>
  );
}

/* ── 公共顶栏：复用全站统一 SiteHeader（figma），导航跳回营销站对应锚点 ── */
function LoginHeader() {
  const { messages } = useI18n();
  const navigate = useNavigate();
  const links = messages.navbar.links;
  const navItems: SiteNavItem[] = [
    { key: "home", label: links.home, onClick: () => navigate("/") },
    { key: "creating", label: links.creating, onClick: () => navigate({ pathname: "/", hash: "#creators" }) },
    { key: "distribution", label: messages.distribution.nav.entry, onClick: () => navigate("/distribution") },
    { key: "download", label: links.download, onClick: () => navigate({ pathname: "/", hash: "#download" }) },
    { key: "contact", label: links.contact, onClick: () => navigate({ pathname: "/", hash: "#contact" }) },
  ];
  return <SiteHeader navItems={navItems} onLogoClick={() => navigate("/")} sticky />;
}
