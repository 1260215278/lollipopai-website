import { useEffect, useRef, useState, type RefObject } from "react";
import { useNavigate } from "react-router";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "../i18n";
import { Footer } from "../components/Footer";
import { SiteHeader } from "../components/SiteHeader";
import { useNavItems } from "../components/useNavItems";
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

/** 密码最小长度（与 H5 forgetPwd.vue minlength 一致） */
const PWD_MIN = 6;

/** 浏览器 autofill 常只改 DOM 不触发 onChange；发码/提交以 DOM 值为准 */
function readFieldValue(ref: RefObject<HTMLInputElement | null>, stateValue: string): string {
  const dom = ref.current?.value ?? "";
  return (dom || stateValue).trim();
}

function isPhoneAccount(value: string): boolean {
  return /^[0-9]+$/.test(value);
}

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
  const accountRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const isPhoneMode = isPhoneAccount(account);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [countdown]);

  useEffect(() => {
    const syncAutofill = () => {
      const el = accountRef.current;
      if (!el?.value || el.value === account) return;
      const v = el.value;
      if (isPhoneAccount(v) && v.length > 20) return;
      setAccount(v);
    };
    const t1 = window.setTimeout(syncAutofill, 100);
    const t2 = window.setTimeout(syncAutofill, 500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAccountChange = (v: string) => {
    if (isPhoneAccount(v) && v.length > 20) return;
    setAccount(v);
  };

  const resolveAccount = (): string => {
    const acc = readFieldValue(accountRef, account);
    if (acc && acc !== account) onAccountChange(acc);
    return acc;
  };

  const onSendCode = async () => {
    if (countdown > 0 || sending) return;
    const acc = resolveAccount();
    if (!acc) {
      toast.error(t.vAccountRequired);
      return;
    }
    const phoneMode = isPhoneAccount(acc);
    setSending(true);
    try {
      if (phoneMode) {
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
    const acc = resolveAccount();
    const codeVal = readFieldValue(codeRef, code);
    const pwd = passwordRef.current?.value ?? password;
    const confirmPwd = confirmRef.current?.value ?? confirm;
    if (codeVal && codeVal !== code) setCode(codeVal);
    if (pwd && pwd !== password) setPassword(pwd);
    if (confirmPwd && confirmPwd !== confirm) setConfirm(confirmPwd);
    const phoneMode = isPhoneAccount(acc);
    if (!acc) {
      toast.error(t.vAccountRequired);
      return;
    }
    if (!codeVal) {
      toast.error(t.vCodeRequired);
      return;
    }
    if (!pwd) {
      toast.error(t.vPasswordRequired);
      return;
    }
    if (pwd.length < PWD_MIN) {
      toast.error(t.vPasswordTooShort);
      return;
    }
    if (pwd !== confirmPwd) {
      toast.error(t.vPasswordMismatch);
      return;
    }
    setSubmitting(true);
    try {
      if (phoneMode) {
        await resetPhonePassword({ phone: acc, pwd, msg: codeVal, areaCode });
      } else {
        await resetEmailPassword({ email: acc, password: pwd, code: codeVal });
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
                      ref={accountRef}
                      className={inputCls + " flex-1"}
                      value={account}
                      onChange={(e) => onAccountChange(e.target.value)}
                      onBlur={() => {
                        const v = accountRef.current?.value ?? "";
                        if (v && v !== account) onAccountChange(v);
                      }}
                      placeholder={t.accountPlaceholder}
                      name="username"
                      autoComplete="username"
                      inputMode={isPhoneMode ? "tel" : "email"}
                    />
                  </div>

                  {/* 验证码 */}
                  <div className="flex gap-2">
                    <input
                      ref={codeRef}
                      className={inputCls + " flex-1"}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder={t.codePlaceholder}
                      inputMode="numeric"
                      maxLength={8}
                      name="one-time-code"
                      autoComplete="one-time-code"
                    />
                    <button
                      type="button"
                      onClick={() => void onSendCode()}
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
                      ref={passwordRef}
                      className={inputCls + " pr-11"}
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.newPasswordPlaceholder}
                      maxLength={20}
                      name="new-password"
                      autoComplete="new-password"
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
                    ref={confirmRef}
                    className={inputCls}
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder={t.confirmPasswordPlaceholder}
                    maxLength={20}
                    name="confirm-password"
                    autoComplete="new-password"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void onSubmit();
                    }}
                  />

                  {/* 重置 */}
                  <button
                    type="button"
                    onClick={() => void onSubmit()}
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
  const navigate = useNavigate();
  const navItems = useNavItems();
  return <SiteHeader navItems={navItems} onLogoClick={() => navigate("/")} sticky />;
}
