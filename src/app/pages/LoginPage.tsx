import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "../components/ui/sonner";
import { useI18n } from "../i18n";
import promoImg from "../../imports/login-promo.jpg";
import appIcon from "../../imports/login-app-icon.png";

/**
 * 登录页 —— figma 15141-27973（整页·手机号+验证码，仅登录已创建的创作者账号）。
 * 左侧宣传图 + 标语；右侧深色登录卡。
 * 发送验证码 / 登录暂为 mock（auth.ts 当前仅 token 适配，无登录端点）；
 * 真接口到位后替换 // TODO(verify) 处即可（成功后 setToken + 跳转）。
 */
export function LoginPage() {
  const { messages } = useI18n();
  const t = messages.login;
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [countdown]);

  const onSendCode = () => {
    if (countdown > 0) return;
    if (!phone.trim()) {
      toast.error(t.vPhoneRequired);
      return;
    }
    // TODO(verify): 接入真实「登录-发送验证码」接口（待后端文档）。当前仅 mock 倒计时。
    setCountdown(60);
    toast.success(t.codeSent);
  };

  const onSubmit = () => {
    if (!phone.trim()) {
      toast.error(t.vPhoneRequired);
      return;
    }
    if (!code.trim()) {
      toast.error(t.vCodeRequired);
      return;
    }
    setSubmitting(true);
    // TODO(verify): 接入真实登录接口；成功后 setToken(token) 再跳转。当前为 mock 演示。
    window.setTimeout(() => {
      setSubmitting(false);
      toast.success(t.loginSuccess);
      navigate("/distribution");
    }, 600);
  };

  const inputCls =
    "w-full h-[46px] px-4 rounded-[10px] bg-[#333]/80 border border-white/10 text-white text-sm placeholder:text-white/40 outline-none transition-all focus:border-white/30";

  return (
    <div className="min-h-screen w-full flex bg-black" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <Toaster position="top-center" richColors />

      {/* 左侧宣传（lg+ 显示） */}
      <div className="hidden lg:block lg:w-[46%] relative overflow-hidden">
        <img src={promoImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45" />
        <div className="relative z-10 pt-[68px] px-12 text-center">
          <p className="text-white leading-[1.18]" style={{ fontWeight: 900, fontSize: "3.2rem", letterSpacing: "0.08em" }}>
            {t.sloganLine1}
          </p>
          <p className="text-white leading-[1.18]" style={{ fontWeight: 900, fontSize: "3.2rem", letterSpacing: "0.08em" }}>
            {t.sloganLine2}
          </p>
        </div>
      </div>

      {/* 右侧登录卡 */}
      <div className="flex-1 flex items-center justify-center bg-[#030301] px-6 py-16">
        <div className="relative w-full max-w-[460px]">
          {/* app 图标（叠在卡片顶部） */}
          <img
            src={appIcon}
            alt="Lollipop"
            className="absolute left-1/2 -translate-x-1/2 -top-[60px] w-[120px] h-[120px] rounded-[20px] border border-[#f8fed0] object-cover"
            style={{ boxShadow: "0px 4px 14px 0px rgba(255,220,224,0.35)" }}
          />
          <div className="bg-[#1c1c1c] border border-[#666] rounded-[28px] pt-[80px] pb-10 px-8 sm:px-12">
            <h2 className="text-center text-white" style={{ fontWeight: 700, fontSize: "1.6rem", letterSpacing: "-0.78px" }}>
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
                  <div className="h-[46px] px-3 rounded-[10px] bg-[#333]/80 border border-white/10 flex items-center gap-1.5 text-sm text-white/80 select-none">
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
                    disabled={countdown > 0}
                    className="h-[46px] min-w-[108px] px-4 rounded-[10px] bg-white text-[#333] text-sm whitespace-nowrap transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ fontWeight: 500 }}
                  >
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
    </div>
  );
}
