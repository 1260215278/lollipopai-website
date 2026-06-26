import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "../components/ui/sonner";
import { useI18n } from "../i18n";
import { Footer } from "../components/Footer";
import { SiteHeader, type SiteNavItem } from "../components/SiteHeader";
import { ApiError } from "../services/http";
import { loginByPhone, sendPhoneLoginCode } from "../services/session";
import { setLoginName } from "../services/auth";
import promoImg from "../../imports/login-promo.jpg";
import appIcon from "../../imports/login-app-icon.png";

/**
 * 登录页 —— figma 15141-27973（整页·手机号+验证码，仅登录已创建的创作者账号）。
 * 左侧宣传图 + 标语；右侧深色登录卡；公共顶栏/底栏与全站一致。
 *
 * 登录逻辑复用 short-play H5（pages/login/loginPhone.vue）：
 *   发码 services/session.sendPhoneLoginCode（GET /app/Login/sendMsg/{区号+手机号}/login）；
 *   登录 services/session.loginByPhone（POST /app/Login/registerCode，验证码字段名 msg，
 *   token 在响应顶层 = appToken）。成功后写 appToken 并跳转首页 /，后续进入发行中心时
 *   publisher token 由 DistributionLayout/ensurePublisherToken 按需换取。
 */
export function LoginPage() {
  const { messages } = useI18n();
  const t = messages.login;
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [countdown]);

  const onSendCode = async () => {
    if (countdown > 0 || sendingCode) return;
    const p = phone.trim();
    if (!p) {
      toast.error(t.vPhoneRequired);
      return;
    }
    setSendingCode(true);
    try {
      await sendPhoneLoginCode(p);
      setCountdown(60);
      toast.success(t.codeSent);
    } catch {
      // http 已 toast 后端错误文案
    } finally {
      setSendingCode(false);
    }
  };

  const onSubmit = async () => {
    const p = phone.trim();
    if (!p) {
      toast.error(t.vPhoneRequired);
      return;
    }
    if (!code.trim()) {
      toast.error(t.vCodeRequired);
      return;
    }
    setSubmitting(true);
    try {
      // 复用 H5 登录：成功写入 appToken；publisher token 进入发行中心后按需换取
      await loginByPhone({ phone: p, code: code.trim() });
      // 记录登录展示名（当前用登录手机号，顶栏「已登录」态展示用）
      setLoginName(p);
      toast.success(t.loginSuccess);
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

      {/* 顶栏 + 中间主区合计占满一屏：顶栏 sticky 占位，main flex-1 吃掉剩余高度（= 一屏减顶栏），底栏落在首屏之下 */}
      <div className="min-h-screen flex flex-col">
        {/* 公共顶栏（全站统一） */}
        <LoginHeader />

        <main className="flex-1 flex">
      {/* 左侧宣传（lg+ 显示） */}
      <div className="hidden lg:block lg:w-[46%] relative overflow-hidden">
        <img src={promoImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45" />
        <div className="relative z-10 pt-[68px] px-12 text-center">
          <p className="text-white leading-[65px]" style={{ fontWeight: 900, fontSize: "54px", letterSpacing: "5px" }}>
            {t.sloganLine1}
          </p>
          <p className="text-white leading-[65px]" style={{ fontWeight: 900, fontSize: "54px", letterSpacing: "5px" }}>
            {t.sloganLine2}
          </p>
        </div>
      </div>

      {/* 右侧登录卡 */}
      <div className="flex-1 flex items-center justify-center bg-[#030301] px-6 py-16">
        <div className="relative w-full max-w-[489px]">
          {/* app 图标（叠在卡片顶部，figma 15141:27983 size 134 / top -45） */}
          <img
            src={appIcon}
            alt="Lollipop"
            className="absolute left-1/2 -translate-x-1/2 -top-[45px] w-[134px] h-[134px] rounded-[20px] border border-[#f8fed0] object-cover"
            style={{ boxShadow: "0px 4px 12.4px 0px rgba(255,220,224,0.35)" }}
          />
          <div className="bg-[#1c1c1c] border border-[#666] rounded-[31px] pt-[104px] pb-10 px-8 sm:px-12">
            <h2 className="text-center text-white" style={{ fontWeight: 700, fontSize: "26px", letterSpacing: "-0.78px" }}>
              {t.welcomeTitle}
            </h2>
            <p className="text-center text-[#99a1af] text-sm mt-2">{t.subtitle}</p>

            <div className="mt-8 space-y-4">
              {/* 手机号 */}
              <div>
                <label className="block text-xs text-[#6a7282] mb-1.5" style={{ fontWeight: 500 }}>
                  {t.phoneLabel}
                </label>
                <div className="flex gap-2">
                  <div className="h-[46px] px-3 rounded-[10px] bg-[#333] border border-white/10 flex items-center gap-1.5 text-sm text-white/80 select-none">
                    <span>🇨🇳</span>
                    <span>+86</span>
                    <ChevronDown className="w-3 h-3 text-white/50" />
                  </div>
                  <input
                    className={inputCls + " flex-1"}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    inputMode="numeric"
                  />
                </div>
              </div>

              {/* 验证码 */}
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
                  />
                  <button
                    type="button"
                    onClick={onSendCode}
                    disabled={countdown > 0 || sendingCode}
                    className="h-[46px] min-w-[108px] px-4 rounded-[10px] bg-white text-[#333] text-sm whitespace-nowrap flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ fontWeight: 500 }}
                  >
                    {sendingCode && <Loader2 className="w-4 h-4 animate-spin" />}
                    {countdown > 0 ? t.resendIn.replace("{s}", String(countdown)) : t.sendCode}
                  </button>
                </div>
              </div>

              {/* 登录 */}
              <button
                onClick={onSubmit}
                disabled={submitting}
                className="w-full h-12 rounded-[14px] bg-[#f22323] text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-70 mt-2"
                style={{ fontWeight: 600 }}
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {t.submit}
              </button>
            </div>

            <p className="text-center text-xs text-[#99a1af] mt-8 leading-relaxed">{t.footerNote}</p>
          </div>
        </div>
      </div>
        </main>
      </div>

      {/* 公共底栏（全站统一，位于首屏之下） */}
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
