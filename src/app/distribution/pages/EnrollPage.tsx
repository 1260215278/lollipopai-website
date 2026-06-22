import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { Globe, ChevronDown, Send, Loader2, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "../../i18n";
import { Footer } from "../../components/Footer";
import { ImageUpload } from "../components/ImageUpload";
import logoImg from "../../../imports/Lollipop1.png";
import { ApiError } from "../../services/http";
import {
  getPublisherStatus,
  sendPublisherCode,
  submitPublisher,
  type PublisherApply,
  type PublisherStatus,
} from "../../services/publisher";

/**
 * 发行者入驻 —— 四态状态机（严格按《发行者入驻-前端接口.md》+ figma）：
 *   auditStatus null  → 可编辑表单（空）
 *   auditStatus 2     → 审核未通过页 →「重新填写申请」→ 回填表单（含驳回原因）
 *   auditStatus 0     → 审核中
 *   auditStatus 1 / isPublisher=1 → 已通过
 */
export function EnrollPage() {
  const { messages } = useI18n();
  const t = messages.distribution.enroll;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<PublisherStatus | null>(null);
  const [editing, setEditing] = useState(false);

  // 表单字段（对应接口 8 字段；图片为上传后 URL）
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [businessLicense, setBusinessLicense] = useState<string | null>(null);
  const [legalPersonName, setLegalPersonName] = useState("");
  const [legalPersonIdNo, setLegalPersonIdNo] = useState("");
  const [idCardFront, setIdCardFront] = useState<string | null>(null);
  const [idCardBack, setIdCardBack] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // 账号已绑定手机号 → 只读锁定（依据接口文档；以 apply.phone 作为已绑定信号）
  const boundPhone = (status?.apply?.phone ?? "").trim();

  const prefill = (apply: PublisherApply) => {
    setPhone(apply.phone ?? "");
    setCompanyName(apply.companyName ?? "");
    setBusinessLicense(apply.businessLicense ?? null);
    setLegalPersonName(apply.legalPersonName ?? "");
    setLegalPersonIdNo(apply.legalPersonIdNo ?? "");
    setIdCardFront(apply.idCardFront ?? null);
    setIdCardBack(apply.idCardBack ?? null);
  };

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const s = await getPublisherStatus();
      setStatus(s);
      if (s.apply) prefill(s.apply);
    } catch {
      // http 已 toast；无登录态/无后端时回退到空表单，便于继续填写
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  // 60s 倒计时
  useEffect(() => {
    if (countdown <= 0) return;
    const id = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [countdown]);

  const clearError = (k: string) =>
    setErrors((p) => {
      if (!p[k]) return p;
      const n = { ...p };
      delete n[k];
      return n;
    });

  const onSendCode = async () => {
    if (sending || countdown > 0) return;
    if (!boundPhone && !phone.trim()) {
      setErrors((e) => ({ ...e, phone: t.vPhoneRequired }));
      return;
    }
    setSending(true);
    try {
      await sendPublisherCode(boundPhone ? undefined : phone.trim());
      toast.success(t.sendCodeSuccess);
      setCountdown(60);
    } catch {
      // http 已 toast（含 401926 / 40034 等）
    } finally {
      setSending(false);
    }
  };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!boundPhone && !phone.trim()) e.phone = t.vPhoneRequired;
    if (!code.trim()) e.code = t.vCodeRequired;
    if (!companyName.trim()) e.companyName = t.vCompanyRequired;
    if (!businessLicense) e.businessLicense = t.vLicenseRequired;
    if (!legalPersonName.trim()) e.legalPersonName = t.vLegalNameRequired;
    if (!legalPersonIdNo.trim()) e.legalPersonIdNo = t.vLegalIdRequired;
    if (!idCardFront) e.idCardFront = t.vIdFrontRequired;
    if (!idCardBack) e.idCardBack = t.vIdBackRequired;
    if (!agree) e.agree = t.vAgreementRequired;
    return e;
  };

  const onSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSubmitting(true);
    try {
      await submitPublisher({
        phone: boundPhone ? undefined : phone.trim(),
        code: code.trim(),
        companyName: companyName.trim(),
        businessLicense: businessLicense!,
        legalPersonName: legalPersonName.trim(),
        legalPersonIdNo: legalPersonIdNo.trim(),
        idCardFront: idCardFront!,
        idCardBack: idCardBack!,
        agreementAgreed: 1,
      });
      toast.success(t.submitSuccess);
      setEditing(false);
      setCode("");
      await loadStatus(); // 回到服务端权威状态（→ 审核中）
    } catch (err) {
      // http 已 toast 后端文案。若已是发行者(401925)/已有审核中申请(401924)，
      // 刷新到对应状态而非停留表单。
      if (err instanceof ApiError && (err.code === 401925 || err.code === 401924)) {
        await loadStatus();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const auditStatus = status?.auditStatus ?? null;
  const isPublisher = status?.isPublisher === 1;

  let view: React.ReactNode;
  if (loading) {
    view = (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-7 h-7 animate-spin text-white/60" />
      </div>
    );
  } else if (auditStatus === 0) {
    view = <ReviewingView t={t} />;
  } else if (auditStatus === 1 || isPublisher) {
    view = <ApprovedView t={t} company={status?.apply?.companyName ?? ""} onEnter={() => navigate("/distribution/overview")} />;
  } else if (auditStatus === 2 && !editing) {
    view = <RejectedView t={t} reason={status?.rejectReason ?? ""} onResubmit={() => setEditing(true)} />;
  } else {
    view = (
      <FormView
        t={t}
        rejectReason={auditStatus === 2 ? status?.rejectReason ?? "" : ""}
        phone={phone}
        setPhone={(v) => { setPhone(v); clearError("phone"); }}
        boundPhone={boundPhone}
        code={code}
        setCode={(v) => { setCode(v); clearError("code"); }}
        onSendCode={onSendCode}
        sending={sending}
        countdown={countdown}
        companyName={companyName}
        setCompanyName={(v) => { setCompanyName(v); clearError("companyName"); }}
        businessLicense={businessLicense}
        setBusinessLicense={(v) => { setBusinessLicense(v); clearError("businessLicense"); }}
        legalPersonName={legalPersonName}
        setLegalPersonName={(v) => { setLegalPersonName(v); clearError("legalPersonName"); }}
        legalPersonIdNo={legalPersonIdNo}
        setLegalPersonIdNo={(v) => { setLegalPersonIdNo(v); clearError("legalPersonIdNo"); }}
        idCardFront={idCardFront}
        setIdCardFront={(v) => { setIdCardFront(v); clearError("idCardFront"); }}
        idCardBack={idCardBack}
        setIdCardBack={(v) => { setIdCardBack(v); clearError("idCardBack"); }}
        agree={agree}
        setAgree={(v) => { setAgree(v); clearError("agree"); }}
        errors={errors}
        submitting={submitting}
        onSubmit={onSubmit}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0000]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <EnrollHeader />
      <main className="flex-1">{view}</main>
      <Footer onNavigate={() => navigate("/")} />
    </div>
  );
}

/* ── 顶部头部（深色，logo + 语言切换） ───────────────────────── */
function EnrollHeader() {
  const { messages, languages, currentLanguage, setLocale } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-[64px] flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2.5 cursor-pointer">
          <img src={logoImg} alt="Lollipop" className="h-9 w-auto rounded-[8px]" />
          <span className="text-white tracking-wide" style={{ fontSize: "1.3rem", fontWeight: 700 }}>
            {messages.common.brand}
          </span>
        </button>

        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={messages.common.language}
            className="flex items-center gap-1.5 px-3 h-10 rounded-full border border-white/10 text-gray-300 hover:text-white hover:border-white/25 transition-all"
          >
            <Globe className="w-[18px] h-[18px]" />
            <span className="text-sm">{currentLanguage.label}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {open && (
            <div className="absolute top-full right-0 mt-2 w-40 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setLocale(lang.code); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    currentLanguage.code === lang.code ? "text-red-400 bg-red-500/10" : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── 深色表单控件 ─────────────────────────────────────────── */
type EM = ReturnType<typeof useI18n>["messages"]["distribution"]["enroll"];

function DarkField({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm mb-2 text-white" style={{ fontWeight: 500 }}>
        {label}
        {required && <span className="text-[#fb2c36] ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[#717182] mt-1.5 leading-relaxed">{hint}</p>}
      {error && <p className="text-xs text-[#fb2c36] mt-1.5">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full h-[45px] px-4 rounded-[10px] bg-[rgba(51,51,51,0.5)] border border-white/10 text-white text-sm placeholder:text-[#99a1af] outline-none transition-all focus:border-white/30 focus:bg-[rgba(51,51,51,0.7)]";

function FormView(props: {
  t: EM;
  rejectReason: string;
  phone: string;
  setPhone: (v: string) => void;
  boundPhone: string;
  code: string;
  setCode: (v: string) => void;
  onSendCode: () => void;
  sending: boolean;
  countdown: number;
  companyName: string;
  setCompanyName: (v: string) => void;
  businessLicense: string | null;
  setBusinessLicense: (v: string | null) => void;
  legalPersonName: string;
  setLegalPersonName: (v: string) => void;
  legalPersonIdNo: string;
  setLegalPersonIdNo: (v: string) => void;
  idCardFront: string | null;
  setIdCardFront: (v: string | null) => void;
  idCardBack: string | null;
  setIdCardBack: (v: string | null) => void;
  agree: boolean;
  setAgree: (v: boolean) => void;
  errors: Record<string, string>;
  submitting: boolean;
  onSubmit: () => void;
}) {
  const { t, errors } = props;
  // 上传区只显示通用提示（具体上传项已由上方 label 标明），多语言下更自然
  const uploadProps = () => ({
    promptText: t.uploadPrompt,
    formatText: t.uploadFormat,
    replaceText: t.uploadReplace,
    uploadFailedText: t.uploadFailed,
    variant: "dark" as const,
    required: true,
  });

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10">
      {/* 欢迎横幅（渐变 + 本地化标题，保证多语言可切换） */}
      <div className="rounded-2xl overflow-hidden mb-8 relative" style={{ background: "linear-gradient(110deg, #1a0a06 0%, #7a2d12 45%, #e8631c 100%)" }}>
        <div className="px-8 py-10 relative z-10">
          <p className="text-white" style={{ fontWeight: 800, fontSize: "1.6rem", letterSpacing: "-0.02em" }}>
            {t.bannerTitle}
          </p>
          <p className="text-white/80 mt-2 text-sm">{t.bannerSubtitle}</p>
        </div>
        <div className="absolute -right-6 -top-8 text-[120px] opacity-20 select-none">🎬</div>
      </div>

      <h1 className="text-white" style={{ fontWeight: 700, fontSize: "1.5rem", letterSpacing: "0.07px" }}>
        {t.welcomeTitle}
      </h1>
      <p className="text-[#717182] text-sm mt-2">{t.welcomeSubtitle}</p>

      {props.rejectReason && (
        <div className="mt-6 rounded-[10px] border border-[#fb2c36]/40 bg-[rgba(231,0,11,0.08)] px-4 py-3">
          <p className="text-[#fb2c36] text-sm" style={{ fontWeight: 600 }}>{t.rejectReasonLabel}</p>
          <p className="text-[#d1d5dc] text-sm mt-1">{props.rejectReason}</p>
        </div>
      )}

      {/* 关联账号 */}
      <section className="mt-8">
        <h2 className="text-white mb-5" style={{ fontWeight: 500, fontSize: "1.25rem" }}>{t.sectionAccount}</h2>
        <div className="space-y-5">
          <DarkField
            label={t.phoneLabel}
            required
            error={errors.phone}
            hint={props.boundPhone ? t.phoneBoundHint : t.phoneRegisterHint}
          >
            <input
              className={inputCls}
              value={props.phone}
              readOnly={!!props.boundPhone}
              placeholder={t.phonePlaceholder}
              onChange={(e) => props.setPhone(e.target.value)}
              inputMode="numeric"
            />
          </DarkField>

          <DarkField label={t.codeLabel} required error={errors.code}>
            <div className="flex gap-3">
              <input
                className={inputCls + " flex-1"}
                value={props.code}
                placeholder={t.codePlaceholder}
                onChange={(e) => props.setCode(e.target.value)}
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={props.onSendCode}
                disabled={props.sending || props.countdown > 0}
                className="h-[45px] px-5 rounded-[10px] bg-[rgba(51,51,51,0.5)] border border-white/10 text-white text-sm whitespace-nowrap flex items-center gap-2 transition-all hover:bg-[rgba(51,51,51,0.7)] disabled:opacity-60"
                style={{ fontWeight: 500 }}
              >
                {props.sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {props.countdown > 0 ? t.resendIn.replace("{s}", String(props.countdown)) : t.sendCode}
              </button>
            </div>
          </DarkField>
        </div>
      </section>

      {/* 公司信息 */}
      <section className="mt-8">
        <h2 className="text-white mb-5" style={{ fontWeight: 500, fontSize: "1.25rem" }}>{t.sectionCompany}</h2>
        <div className="space-y-5">
          <DarkField label={t.companyNameLabel} required error={errors.companyName}>
            <input
              className={inputCls}
              value={props.companyName}
              placeholder={t.companyNamePlaceholder}
              onChange={(e) => props.setCompanyName(e.target.value)}
            />
          </DarkField>

          <ImageUpload
            label={t.businessLicenseLabel}
            value={props.businessLicense}
            onChange={props.setBusinessLicense}
            error={errors.businessLicense}
            {...uploadProps()}
          />

          <div className="grid grid-cols-2 gap-4">
            <DarkField label={t.legalPersonNameLabel} required error={errors.legalPersonName}>
              <input
                className={inputCls}
                value={props.legalPersonName}
                placeholder={t.legalPersonNamePlaceholder}
                onChange={(e) => props.setLegalPersonName(e.target.value)}
              />
            </DarkField>
            <DarkField label={t.legalPersonIdNoLabel} required error={errors.legalPersonIdNo}>
              <input
                className={inputCls}
                value={props.legalPersonIdNo}
                placeholder={t.legalPersonIdNoPlaceholder}
                onChange={(e) => props.setLegalPersonIdNo(e.target.value)}
              />
            </DarkField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ImageUpload
              label={t.idCardFrontLabel}
              value={props.idCardFront}
              onChange={props.setIdCardFront}
              error={errors.idCardFront}
              {...uploadProps()}
            />
            <ImageUpload
              label={t.idCardBackLabel}
              value={props.idCardBack}
              onChange={props.setIdCardBack}
              error={errors.idCardBack}
              {...uploadProps()}
            />
          </div>
        </div>
      </section>

      {/* 合作协议 */}
      <section className="mt-8">
        <h2 className="text-white mb-4" style={{ fontWeight: 500, fontSize: "1.25rem" }}>{t.sectionAgreement}</h2>
        <button
          type="button"
          onClick={() => props.setAgree(!props.agree)}
          className="flex items-start gap-3 text-left"
        >
          <span
            className="mt-0.5 w-[18px] h-[18px] rounded-[4px] flex-shrink-0 flex items-center justify-center border transition-all"
            style={{
              background: props.agree ? "#fb2c36" : "transparent",
              borderColor: props.agree ? "#fb2c36" : "rgba(255,255,255,0.3)",
            }}
          >
            {props.agree && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className="text-sm text-[#d1d5dc] leading-relaxed select-none">{t.agreement}</span>
        </button>
        {errors.agree && <p className="text-xs text-[#fb2c36] mt-2 ml-7">{errors.agree}</p>}
      </section>

      {/* 提交 */}
      <button
        onClick={props.onSubmit}
        disabled={props.submitting}
        className="mt-8 w-full h-[48px] rounded-[10px] bg-white text-[#111] text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-70"
        style={{ fontWeight: 700 }}
      >
        {props.submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {t.submit}
      </button>
    </div>
  );
}

/* ── 审核中 ─────────────────────────────────────────────── */
function ReviewingView({ t }: { t: EM }) {
  const steps = [
    { title: t.step1Title, sub: t.step1Sub, state: "done" as const },
    { title: t.step2Title, sub: t.step2Sub, state: "active" as const },
    { title: t.step3Title, sub: t.step3Sub, state: "pending" as const },
    { title: t.step4Title, sub: t.step4Sub, state: "pending" as const },
  ];
  return (
    <StatusBand>
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center mb-6">
          <Clock className="w-7 h-7 text-gray-400" />
        </div>
        <h2 className="text-[#111111]" style={{ fontWeight: 800, fontSize: "1.5rem" }}>{t.reviewingTitle}</h2>
        <p className="text-gray-500 text-sm mt-3 leading-relaxed max-w-md">{t.reviewingDesc}</p>
      </div>

      <div className="w-full h-px bg-gray-100 my-8" />

      <div className="max-w-sm mx-auto">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                style={{
                  background: s.state === "done" ? "#111111" : "white",
                  border: s.state === "pending" ? "2px solid #E5E7EB" : s.state === "active" ? "2px solid #111111" : "none",
                  color: s.state === "done" ? "white" : s.state === "active" ? "#111111" : "#9CA3AF",
                  fontWeight: 600,
                }}
              >
                {s.state === "done" ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && <div className="w-px flex-1 my-1 min-h-[26px]" style={{ background: "#E5E7EB" }} />}
            </div>
            <div className="pb-6">
              <div className="flex items-center gap-2">
                <p className="text-sm" style={{ fontWeight: s.state === "pending" ? 400 : 600, color: s.state === "pending" ? "#6B7280" : "#111111" }}>
                  {s.title}
                </p>
                {s.state === "active" && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(232,25,44,0.1)", color: "#E8192C", fontWeight: 600 }}>
                    {t.reviewingInProgress}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full h-px bg-gray-100 my-8" />
      <SupportLine t={t} />
    </StatusBand>
  );
}

/* ── 已通过 ─────────────────────────────────────────────── */
function ApprovedView({ t, company, onEnter }: { t: EM; company: string; onEnter: () => void }) {
  return (
    <StatusBand>
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-7 h-7 text-[#111111]" />
        </div>
        <h2 className="text-[#111111]" style={{ fontWeight: 800, fontSize: "1.5rem" }}>{t.approvedTitle}</h2>
        <p className="text-gray-500 text-sm mt-3 leading-relaxed max-w-md">{t.approvedDesc.replace("{company}", company)}</p>

        <button
          onClick={onEnter}
          className="mt-8 flex items-center justify-center gap-2 px-8 h-[46px] rounded-[10px] bg-[#111111] text-white text-sm transition-all hover:opacity-90 active:scale-[0.99]"
          style={{ fontWeight: 600 }}
        >
          {t.enterDashboard}
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="mt-8"><SupportLine t={t} /></div>
      </div>
    </StatusBand>
  );
}

/* ── 已驳回 ─────────────────────────────────────────────── */
function RejectedView({ t, reason, onResubmit }: { t: EM; reason: string; onResubmit: () => void }) {
  return (
    <StatusBand>
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center mb-6">
          <XCircle className="w-7 h-7 text-gray-500" />
        </div>
        <h2 className="text-[#111111]" style={{ fontWeight: 800, fontSize: "1.5rem" }}>{t.rejectedTitle}</h2>
        <p className="text-gray-500 text-sm mt-3 leading-relaxed max-w-md">{t.rejectedDesc}</p>
      </div>

      {reason && (
        <div className="mt-8 max-w-md mx-auto w-full rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="text-sm text-[#E8192C]" style={{ fontWeight: 600 }}>{t.rejectReasonLabel}</p>
          <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">{reason}</p>
        </div>
      )}

      <button
        onClick={onResubmit}
        className="mt-8 w-full max-w-md mx-auto flex items-center justify-center h-[48px] rounded-[10px] bg-[#111111] text-white text-sm transition-all hover:opacity-90 active:scale-[0.99]"
        style={{ fontWeight: 600 }}
      >
        {t.resubmit}
      </button>

      <div className="mt-8"><SupportLine t={t} /></div>
    </StatusBand>
  );
}

/* ── 白色内容带 + 客服联系行 ──────────────────────────────── */
function StatusBand({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16 min-h-[60vh]">{children}</div>
    </div>
  );
}

function SupportLine({ t }: { t: EM }) {
  return (
    <p className="text-center text-xs text-gray-400">
      {t.supportPrefix}{" "}
      <a href={`mailto:${t.supportEmail}`} className="text-[#E8192C] hover:underline">
        {t.supportEmail}
      </a>
    </p>
  );
}
