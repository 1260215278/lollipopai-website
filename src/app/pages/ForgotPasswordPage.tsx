import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "../i18n";
import { Footer } from "../components/Footer";
import { SiteHeader, type SiteNavItem } from "../components/SiteHeader";
import { AreaCodeSelect } from "../components/AreaCodeSelect";
import { ApiError } from "../services/http";
import {
  sendForgetPhoneCode,
  sendForgetEmailCode,
  resetPhonePassword,
  resetEmailPassword,
} from "../services/session";
import promoImg from "../../imports/login-promo.jpg";
import appIcon from "../../imports/login-app-icon.png";
import { useDistributionEntryNavigation } from "../distribution/entryNavigation";

/** 密码最小长度（与 H5 forgetPwd.vue minlength 一致） */
const PWD_MIN = 6;

/**
 * 忘记密码 / 重置密码页（bug2）——照搬短剧 H5 pages/login/forgetPwd.vue：
 *   单输入框智能识别（纯数字=手机号显区号，否则邮箱）；
 *   发码：手机 sendMsg/{区号+号}/forget，邮箱 sendEmailMsg?type=2；
 *   重置：手机 forgetPwd { phone, pwd, msg }，邮箱 forgetPassWord { emailName, password, code }。
 */
export function ForgotPasswordPage() {
  const { messages, locale } = useI18n();
  const t = messages.login;
  const navigate = useNavigate();

  const [account, setAccount] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [areaCode, setAreaCode] = useState("+86");
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isPhoneMode = /^[0-9]+$/.test(account);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [countdown]);

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
        await sendForgetPhoneCode(acc, areaCode);
      } else {
        await sendForgetEmailCode(acc);
      }
      setCountdown(60);
      toast.success(t.codeSent);
    } catch {
      // http 已 toast 后端文案
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
    if (!code.trim()) {
      toast.error(t.vCodeRequired);
      return;
    }
    if (!password) {
      toast.error(t.vPasswordRequired);
      return;
    }
    if (password.length < PWD_MIN) {
      toast.error(t.vPasswordTooShort);
      return;
    }
    if (password !== confirm) {
      toast.error(t.vPasswordMismatch);
      return;
    }
    setSubmitting(true);
    try {
      if (isPhoneMode) {
        await resetPhonePassword({ phone: acc, pwd: password, msg: code.trim(), areaCode });
      } else {
        await resetEmailPassword({ email: acc, password, code: code.trim() });
      }
      toast.success(t.resetSuccess);
      navigate("/login");
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

      <div className="min-h-screen flex flex-col">
        <ForgotHeader />

        <main className="flex-1 flex">
          <div className="hidden lg:block lg:w-[46%] relative overflow-hidden">
            <img src={promoImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45" />
          </div>

          <div className="flex-1 flex items-center justify-center bg-[#030301] px-6 py-16">
            <div className="relative w-full max-w-[489px]">
              <img
                src={appIcon}
                alt="Lollipop"
                className="absolute left-1/2 -translate-x-1/2 -top-[45px] w-[134px] h-[134px] rounded-[20px] object-cover"
              />
              <div className="bg-[#1c1c1c] border border-[#666] rounded-[31px] pt-[104px] pb-10 px-8 sm:px-12">
                <h2 className="text-center text-white" style={{ fontWeight: 700, fontSize: "26px", letterSpacing: 0 }}>
                  {t.resetTitle}
                </h2>

                <div className="mt-8 space-y-4">
                  {/* 账号 */}
                  <div className="flex gap-2">
                    {isPhoneMode && <AreaCodeSelect value={areaCode} onChange={setAreaCode} locale={locale} />}
                    <input
                      className={inputCls + " flex-1"}
                      value={account}
                      onChange={(e) => {
                        const v = e.target.value;
                        // 手机号模式（纯数字）限制 ≤20 位；邮箱模式不限
                        if (/^[0-9]+$/.test(v) && v.length > 20) return;
                        setAccount(v);
                      }}
                      placeholder={t.accountPlaceholder}
                    />
                  </div>

                  {/* 验证码 */}
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

                  {/* 新密码 */}
                  <div className="relative">
                    <input
                      className={inputCls + " pr-11"}
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.newPasswordPlaceholder}
                      maxLength={20}
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

                  {/* 确认密码 */}
                  <input
                    className={inputCls}
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder={t.confirmPasswordPlaceholder}
                    maxLength={20}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void onSubmit();
                    }}
                  />

                  {/* 重置 */}
                  <button
                    onClick={onSubmit}
                    disabled={submitting}
                    className="w-full h-12 rounded-[14px] bg-[#f22323] text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-70 mt-2"
                    style={{ fontWeight: 600 }}
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {t.resetButton}
                  </button>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="text-xs text-[#99a1af] hover:text-white transition-colors"
                    >
                      {t.backToLogin}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer onNavigate={(page) => navigate(page === "home" ? "/" : `/${page}`)} />
    </div>
  );
}

function ForgotHeader() {
  const { messages } = useI18n();
  const navigate = useNavigate();
  const enterDistribution = useDistributionEntryNavigation();
  const links = messages.navbar.links;
  const navItems: SiteNavItem[] = [
    { key: "home", label: links.home, onClick: () => navigate("/") },
    { key: "creating", label: links.creating, onClick: () => navigate("/creating") },
    { key: "distribution", label: messages.distribution.nav.entry, onClick: enterDistribution },
    { key: "download", label: links.download, onClick: () => navigate("/download") },
    { key: "contact", label: links.contact, onClick: () => navigate("/contact") },
  ];
  return <SiteHeader navItems={navItems} onLogoClick={() => navigate("/")} sticky />;
}
