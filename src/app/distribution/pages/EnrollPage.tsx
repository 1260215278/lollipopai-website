import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Send, Loader2, CheckCircle2, ArrowRight, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useI18n, type Locale } from "../../i18n";
import { Footer } from "../../components/Footer";
import { AreaCodeSelect } from "../../components/AreaCodeSelect";
import { COUNTRY_CODES } from "../../data/countryCodes";
import { ImageUpload } from "../components/ImageUpload";
import welcomeBanner from "../../../imports/发行入驻-欢迎横幅.png";
import { SiteHeader, type SiteNavItem } from "../../components/SiteHeader";
import { ApiError } from "../../services/http";
import { getLoginName, isAppAuthed, setAppToken, setLoginName } from "../../services/auth";
import {
  getPublisherStatus,
  sendPublisherCode,
  submitPublisher,
  getPublisherAgreement,
  getPublisherTenantStatus,
  retryPublisherTenantSync,
  type PublisherApply,
  type PublisherStatus,
  type PublisherAgreement,
  type PublisherTenantStatus,
} from "../../services/publisher";

/**
 * 已点击「进入发行中心」的标记（按账号手机号区分）。审核通过页只在首次进入时展示，
 * 用户点过一次后，再访问 /distribution/enroll 直接跳转发行中心。
 */
const ENTERED_KEY_PREFIX = "lp_enroll_entered_";
const DEFAULT_AREA_CODE = "+86";

type ContactMode = "phone" | "email";

function isEmailAccount(v: string): boolean {
  return v.includes("@");
}

/** 邮件验证码 language 参数（接口文档 §2.2：zh/en/pt） */
function publisherEmailLanguage(locale: Locale): string {
  switch (locale) {
    case "zh-CN":
    case "zh-TW":
      return "zh";
    case "pt":
      return "pt";
    default:
      return "en";
  }
}

function phoneWithAreaCode(phone: string, areaCode: string): string {
  return `${areaCode}${phone}`;
}

const COUNTRY_CODES_BY_LENGTH = [...COUNTRY_CODES].sort((a, b) => b.dialCode.length - a.dialCode.length);

function splitPhoneAreaCode(phone: string, fallbackAreaCode: string = DEFAULT_AREA_CODE): { areaCode: string; phone: string } {
  const value = phone.trim();
  if (!value) return { areaCode: fallbackAreaCode, phone: "" };
  if (!value.startsWith("+")) return { areaCode: fallbackAreaCode, phone: value.replace(/\D/g, "") };

  const match = COUNTRY_CODES_BY_LENGTH.find((item) => value.startsWith(item.dialCode));
  if (!match) return { areaCode: fallbackAreaCode, phone: value.replace(/\D/g, "") };
  return {
    areaCode: match.dialCode,
    phone: value.slice(match.dialCode.length).replace(/\D/g, ""),
  };
}

function phoneForRequest(phone: string, areaCode: string): string {
  const value = phone.trim();
  if (value.startsWith("+")) return value.replace(/\s/g, "");
  return phoneWithAreaCode(value.replace(/\D/g, ""), areaCode);
}

const AGREEMENT_HTML_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "i",
  "li",
  "ol",
  "p",
  "strong",
  "u",
  "ul",
]);

function sanitizeAgreementHtml(content: string): string {
  if (!/<[a-z][\s\S]*>/i.test(content)) return "";
  const doc = new DOMParser().parseFromString(content, "text/html");
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.remove();
        return;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      const el = child as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (tag === "script" || tag === "style") {
        el.remove();
        return;
      }
      if (!AGREEMENT_HTML_TAGS.has(tag)) {
        el.replaceWith(doc.createTextNode(el.textContent ?? ""));
        return;
      }
      Array.from(el.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (tag === "a" && name === "href" && /^(https?:|mailto:)/i.test(attr.value.trim())) return;
        el.removeAttribute(attr.name);
      });
      if (tag === "a") {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noreferrer");
      }
      walk(el);
    });
  };
  walk(doc.body);
  return doc.body.innerHTML;
}

function enteredKey(account: string): string {
  return ENTERED_KEY_PREFIX + (account || "anon");
}

function hasEnteredDashboard(account: string): boolean {
  try {
    return localStorage.getItem(enteredKey(account)) === "1";
  } catch {
    return false;
  }
}

function markEnteredDashboard(account: string): void {
  try {
    localStorage.setItem(enteredKey(account), "1");
  } catch {
    /* localStorage 不可用时忽略，本次会话仍正常进入 */
  }
}

/**
 * 发行者入驻 —— 四态状态机（严格按《发行者入驻-前端接口.md》+ figma）：
 *   auditStatus null  → 可编辑表单（空）
 *   auditStatus 2     → 审核未通过页 →「重新填写申请」→ 回填表单（含驳回原因）
 *   auditStatus 0     → 审核中
 *   auditStatus 1 / isPublisher=1 → 已通过（首次展示通过页，点过「进入发行中心」后再访问直接跳转）
 */
export function EnrollPage() {
  const { messages, locale } = useI18n();
  const t = messages.distribution.enroll;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<PublisherStatus | null>(null);
  const [editing, setEditing] = useState(false);
  // 合作协议 / 隐私政策 弹窗（null=关闭）
  const [docOpen, setDocOpen] = useState<"terms" | "privacy" | null>(null);
  // 协议正文/版本（bug12：随当前语言从后端拉；失败回退静态文案）
  const [agreements, setAgreements] = useState<{ cooperation: PublisherAgreement | null; privacy: PublisherAgreement | null }>({
    cooperation: null,
    privacy: null,
  });
  const [tenantStatus, setTenantStatus] = useState<PublisherTenantStatus | null>(null);
  const [tenantLoading, setTenantLoading] = useState(false);
  const [tenantRetrying, setTenantRetrying] = useState(false);

  // 表单字段（对应接口字段；图片为上传后 URL）
  const [contactMode, setContactMode] = useState<ContactMode>("phone");
  const [areaCode, setAreaCode] = useState(DEFAULT_AREA_CODE);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
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

  // 账号已绑定手机/邮箱 → 只读锁定对应输入框；发码/提交按当前通道传参（见入驻文档 §2.2/§2.5）。
  const loginAccount = getLoginName().trim();
  const applyPhone = (status?.apply?.phone ?? "").trim();
  const applyEmail = (status?.apply?.email ?? "").trim();
  const boundPhone = isEmailAccount(loginAccount) ? applyPhone : (loginAccount || applyPhone);
  const boundEmail = isEmailAccount(loginAccount) ? (loginAccount || applyEmail) : applyEmail;
  const boundAccount = boundPhone || boundEmail;
  const canSwitchContactMode = !boundPhone && !boundEmail;

  const setPhoneValue = (value: string, fallbackAreaCode: string = DEFAULT_AREA_CODE) => {
    const parsed = splitPhoneAreaCode(value, fallbackAreaCode);
    setAreaCode(parsed.areaCode);
    setPhone(parsed.phone);
  };

  const prefill = (apply: PublisherApply, fallbackAreaCode: string = DEFAULT_AREA_CODE) => {
    if (apply.phone?.trim()) {
      setPhoneValue(apply.phone, fallbackAreaCode);
      setContactMode("phone");
    }
    if (apply.email?.trim()) {
      setEmail(apply.email);
      if (!apply.phone?.trim()) setContactMode("email");
    }
    setCompanyName(apply.companyName ?? "");
    setBusinessLicense(apply.businessLicense ?? null);
    setLegalPersonName(apply.legalPersonName ?? "");
    setLegalPersonIdNo(apply.legalPersonIdNo ?? "");
    setIdCardFront(apply.idCardFront ?? null);
    setIdCardBack(apply.idCardBack ?? null);
  };

  const loadStatus = useCallback(async () => {
    // 仅在已登录（持有 appToken）时才查询入驻状态；未登录直接展示空表单，不打无效请求
    if (!isAppAuthed()) {
      setStatus(null);
      setLoading(false);
      return;
    }
    // 已登录默认回填登录账号（手机或邮箱）；若存在历史申请则由下方 prefill 覆盖
    const login = getLoginName().trim();
    let fallbackAreaCode = DEFAULT_AREA_CODE;
    if (login) {
      if (isEmailAccount(login)) {
        setEmail(login);
        setContactMode("email");
      } else {
        const parsed = splitPhoneAreaCode(login);
        fallbackAreaCode = parsed.areaCode;
        setAreaCode(parsed.areaCode);
        setPhone(parsed.phone);
        setContactMode("phone");
      }
    }
    setLoading(true);
    try {
      const s = await getPublisherStatus();
      setStatus(s);
      if (s.apply) prefill(s.apply, fallbackAreaCode);
    } catch {
      // http 已 toast；登录态失效/无后端时回退到空表单，便于继续填写
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // bug12：按当前语言拉协议正文/版本（失败回退静态文案）
  useEffect(() => {
    let alive = true;
    void Promise.all([
      getPublisherAgreement("cooperation").catch(() => null),
      getPublisherAgreement("privacy").catch(() => null),
    ]).then(([cooperation, privacy]) => {
      if (alive) setAgreements({ cooperation, privacy });
    });
    return () => {
      alive = false;
    };
  }, [locale]);

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
    const mode = boundPhone ? "phone" : boundEmail ? "email" : contactMode;
    if (mode === "phone") {
      if (!phone.trim()) {
        setErrors((e) => ({ ...e, phone: t.vPhoneRequired }));
        return;
      }
    } else if (!email.trim()) {
      setErrors((e) => ({ ...e, email: t.vEmailRequired }));
      return;
    }
    setSending(true);
    try {
      if (mode === "phone") {
        await sendPublisherCode({ phone: phoneForRequest(phone, areaCode) });
      } else {
        await sendPublisherCode({ email: email.trim(), language: publisherEmailLanguage(locale) });
      }
      toast.success(t.sendCodeSuccess);
      setCountdown(60);
    } catch {
      // http 已 toast（含 403360 / 403362 / 40034 / 40038 等）
    } finally {
      setSending(false);
    }
  };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    const mode = boundPhone ? "phone" : boundEmail ? "email" : contactMode;
    if (mode === "phone" && !phone.trim()) e.phone = t.vPhoneRequired;
    if (mode === "email" && !email.trim()) e.email = t.vEmailRequired;
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
      const mode = boundPhone ? "phone" : boundEmail ? "email" : contactMode;
      const submitPhone = phoneForRequest(phone, areaCode);
      const res = await submitPublisher({
        ...(mode === "phone" ? { phone: submitPhone } : { email: email.trim() }),
        code: code.trim(),
        companyName: companyName.trim(),
        businessLicense: businessLicense!,
        legalPersonName: legalPersonName.trim(),
        legalPersonIdNo: legalPersonIdNo.trim(),
        idCardFront: idCardFront!,
        idCardBack: idCardBack!,
        agreementAgreed: 1,
        ...(agreements.cooperation?.version ? { agreementVersion: agreements.cooperation.version } : {}),
      });
      toast.success(t.submitSuccess);
      setEditing(false);
      setCode("");
      // 提交即登录：后端在响应顶层返回登录 token（匿名/登录态均返回），写入并替换本地登录态。
      // 展示名优先用后端权威标识（账号已绑定时后端以账号为准）。
      if (res.token) {
        setAppToken(res.token);
        const displayName =
          res.user?.phone ?? res.user?.email ?? (mode === "phone" ? submitPhone : email.trim());
        setLoginName(displayName);
      }
      await loadStatus(); // 回到服务端权威状态（登录态 → 审核中）
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
  const approved = auditStatus === 1 || isPublisher;
  // 已通过且此前点过「进入发行中心」→ 直接跳转，不再展示通过页
  const redirectDashboard = approved && hasEnteredDashboard(boundAccount);

  const loadTenantStatus = useCallback(async () => {
    if (!isAppAuthed()) {
      setTenantStatus(null);
      return;
    }
    setTenantLoading(true);
    try {
      const s = await getPublisherTenantStatus();
      setTenantStatus(s);
    } catch {
      setTenantStatus(null);
    } finally {
      setTenantLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && approved && !redirectDashboard) {
      void loadTenantStatus();
      return;
    }
    setTenantStatus(null);
  }, [loading, approved, redirectDashboard, loadTenantStatus]);

  useEffect(() => {
    if (!loading && redirectDashboard) {
      navigate("/distribution/overview", { replace: true });
    }
  }, [loading, redirectDashboard, navigate]);

  const enterDashboard = () => {
    markEnteredDashboard(boundAccount);
    navigate("/distribution/overview");
  };

  const onRetryTenantSync = async () => {
    if (tenantRetrying) return;
    setTenantRetrying(true);
    try {
      await retryPublisherTenantSync();
      toast.success(t.swiftRetrySuccess);
      await loadTenantStatus();
    } catch {
      // http 已 toast 后端文案（含 401933 等）
    } finally {
      setTenantRetrying(false);
    }
  };

  let view: React.ReactNode;
  if (loading || redirectDashboard) {
    view = (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-7 h-7 animate-spin text-white/60" />
      </div>
    );
  } else if (auditStatus === 0) {
    view = <ReviewingView t={t} />;
  } else if (approved) {
    view = (
      <ApprovedView
        t={t}
        company={status?.apply?.companyName ?? ""}
        tenantStatus={tenantStatus}
        tenantLoading={tenantLoading}
        tenantRetrying={tenantRetrying}
        tenantUsername={status?.apply?.tenantUsername ?? boundPhone}
        onRetryTenantSync={onRetryTenantSync}
        onEnter={enterDashboard}
      />
    );
  } else if (auditStatus === 2 && !editing) {
    view = <RejectedView t={t} reason={status?.rejectReason ?? ""} onResubmit={() => setEditing(true)} />;
  } else {
    view = (
      <FormView
        t={t}
        contactMode={boundPhone ? "phone" : boundEmail ? "email" : contactMode}
        areaCode={areaCode}
        setAreaCode={setAreaCode}
        locale={locale}
        setContactMode={(mode) => {
          setContactMode(mode);
          clearError("phone");
          clearError("email");
        }}
        canSwitchContactMode={canSwitchContactMode}
        phone={phone}
        setPhone={(v) => { setPhone(v); clearError("phone"); }}
        boundPhone={boundPhone}
        email={email}
        setEmail={(v) => { setEmail(v); clearError("email"); }}
        boundEmail={boundEmail}
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
        onOpenDoc={setDocOpen}
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
      <Footer onNavigate={(page) => navigate(page === "home" ? "/" : `/${page}`)} />

      {/* 合作协议 / 隐私政策 弹窗 */}
      <AgreementModal
        open={docOpen !== null}
        title={docOpen === "privacy" ? t.privacyTitle : t.termsTitle}
        body={
          docOpen === "privacy"
            ? agreements.privacy?.content ?? t.privacyBody
            : agreements.cooperation?.content ?? t.termsBody
        }
        closeLabel={t.docClose}
        onClose={() => setDocOpen(null)}
      />
    </div>
  );
}

/* ── 顶部头部：复用全站统一顶栏（figma），导航跳回营销站对应锚点 ── */
function EnrollHeader() {
  const { messages } = useI18n();
  const navigate = useNavigate();
  const links = messages.navbar.links;
  const navItems: SiteNavItem[] = [
    { key: "home", label: links.home, onClick: () => navigate("/") },
    { key: "creating", label: links.creating, onClick: () => navigate("/creating") },
    { key: "distribution", label: messages.distribution.nav.entry, active: true, onClick: () => navigate("/distribution") },
    { key: "download", label: links.download, onClick: () => navigate("/download") },
    { key: "contact", label: links.contact, onClick: () => navigate("/contact") },
  ];
  return <SiteHeader navItems={navItems} onLogoClick={() => navigate("/")} sticky />;
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
  contactMode: ContactMode;
  areaCode: string;
  setAreaCode: (v: string) => void;
  locale: Locale;
  setContactMode: (mode: ContactMode) => void;
  canSwitchContactMode: boolean;
  phone: string;
  setPhone: (v: string) => void;
  boundPhone: string;
  email: string;
  setEmail: (v: string) => void;
  boundEmail: string;
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
  onOpenDoc: (doc: "terms" | "privacy") => void;
  errors: Record<string, string>;
  submitting: boolean;
  onSubmit: () => void;
}) {
  const { t, errors, contactMode } = props;
  const isPhoneMode = contactMode === "phone";

  // 勾选文案：将 {terms}/{privacy} 占位渲染为可点击链接（点击打开弹窗，不触发勾选切换）；
  // 其余纯文本点击仍可切换勾选框。
  const agreementNodes = t.agreement.split(/(\{terms\}|\{privacy\})/).map((part, i) => {
    if (part === "{terms}" || part === "{privacy}") {
      const doc = part === "{terms}" ? "terms" : "privacy";
      const label = part === "{terms}" ? t.agreementTerms : t.agreementPrivacy;
      return (
        <button
          key={i}
          type="button"
          onClick={() => props.onOpenDoc(doc)}
          className="text-white hover:underline"
          style={{ fontWeight: 500 }}
        >
          {label}
        </button>
      );
    }
    if (!part) return null;
    return (
      <span key={i} onClick={() => props.setAgree(!props.agree)} className="cursor-pointer select-none">
        {part}
      </span>
    );
  });
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
    <div className="max-w-[672px] mx-auto px-6 py-10">
      {/* 申请表单卡片（figma 15237-33706：#090101 + 24px 内边距 + 16px 圆角） */}
      <div className="bg-[#090101] rounded-[16px] p-6">
        {/* 欢迎横幅：figma 15237-33708 导出的图片资源，整图出血至卡片边缘并保留顶部圆角 */}
        <div className="-mx-6 -mt-6 mb-6">
          <img
            src={welcomeBanner}
            alt={t.bannerTitle}
            className="block w-full rounded-t-[16px] select-none pointer-events-none"
          />
        </div>

        <h1 className="text-white" style={{ fontWeight: 500, fontSize: "1.5rem", letterSpacing: "0.07px" }}>
          {t.welcomeTitle}
        </h1>
        <p className="text-[#717182] text-sm mt-2">{t.welcomeSubtitle}</p>

      {/* 关联账号 */}
      <section className="mt-8">
        <h2 className="text-white mb-5" style={{ fontWeight: 500, fontSize: "1.25rem" }}>{t.sectionAccount}</h2>
        <div className="space-y-5">
          {props.canSwitchContactMode && (
            <div className="inline-flex p-1 rounded-[10px] bg-[rgba(51,51,51,0.5)] border border-white/10">
              {(["phone", "email"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => props.setContactMode(mode)}
                  className="px-4 h-9 rounded-[8px] text-sm transition-all"
                  style={{
                    fontWeight: contactMode === mode ? 600 : 400,
                    background: contactMode === mode ? "white" : "transparent",
                    color: contactMode === mode ? "#111" : "rgba(255,255,255,0.65)",
                  }}
                >
                  {mode === "phone" ? t.accountModePhone : t.accountModeEmail}
                </button>
              ))}
            </div>
          )}

          {isPhoneMode ? (
            <DarkField
              label={t.phoneLabel}
              required
              error={errors.phone}
              hint={props.boundPhone ? t.phoneBoundHint : t.phoneRegisterHint}
            >
              <div className="flex gap-2">
                {props.boundPhone ? (
                  <div className="flex h-[46px] items-center whitespace-nowrap rounded-[10px] border border-white/10 bg-[#333] px-3 text-sm text-white/80">
                    {props.areaCode}
                  </div>
                ) : (
                  <AreaCodeSelect value={props.areaCode} onChange={props.setAreaCode} locale={props.locale} />
                )}
                <input
                  className={`${inputCls} flex-1${props.boundPhone ? " opacity-60 cursor-not-allowed" : ""}`}
                  value={props.phone}
                  placeholder={t.phonePlaceholder}
                  readOnly={!!props.boundPhone}
                  onChange={(e) => props.setPhone(e.target.value.replace(/\D/g, "").slice(0, 20))}
                  inputMode="numeric"
                  maxLength={20}
                />
              </div>
            </DarkField>
          ) : (
            <DarkField
              label={t.emailLabel}
              required
              error={errors.email}
              hint={props.boundEmail ? t.emailBoundHint : t.emailRegisterHint}
            >
              <input
                className={inputCls + (props.boundEmail ? " opacity-60 cursor-not-allowed" : "")}
                value={props.email}
                placeholder={t.emailPlaceholder}
                readOnly={!!props.boundEmail}
                onChange={(e) => props.setEmail(e.target.value.trimStart())}
                type="email"
                autoComplete="email"
              />
            </DarkField>
          )}

          <DarkField label={t.codeLabel} required error={errors.code}>
            <div className="flex gap-2">
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
                className="h-[45px] px-6 rounded-[10px] bg-white text-[#111] text-sm whitespace-nowrap flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
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
              maxLength={50}
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
                maxLength={50}
              />
            </DarkField>
            <DarkField label={t.legalPersonIdNoLabel} required error={errors.legalPersonIdNo}>
              <input
                className={inputCls}
                value={props.legalPersonIdNo}
                placeholder={t.legalPersonIdNoPlaceholder}
                onChange={(e) => props.setLegalPersonIdNo(e.target.value)}
                maxLength={50}
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
        {/* figma 15237-33811：勾选区整体置于 rgba(51,51,51,0.5) 浅色框内 */}
        <div className="flex items-start gap-3 bg-[rgba(51,51,51,0.5)] rounded-[10px] p-4">
          <button
            type="button"
            role="checkbox"
            aria-checked={props.agree}
            onClick={() => props.setAgree(!props.agree)}
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
          </button>
          <p className="text-sm text-white/55 leading-relaxed">{agreementNodes}</p>
        </div>
        {errors.agree && <p className="text-xs text-[#fb2c36] mt-2 ml-7">{errors.agree}</p>}
      </section>

        {/* 提交 */}
        <button
          onClick={props.onSubmit}
          disabled={props.submitting}
          className="mt-8 w-full h-[48px] rounded-[10px] bg-white text-[#111] text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-70"
          style={{ fontWeight: 500 }}
        >
          {props.submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {t.submit}
        </button>
      </div>
    </div>
  );
}

/* ── 入驻状态图标：直接内联 figma 导出的 SVG 路径（viewBox 27.995 / stroke 2.333 / currentColor 取色），
 *    与设计稿像素级一致。审核通过=CircleCheckBig（缺口圆+大对勾）、审核失败=CircleX、审核中=Clock。 ── */
function ApprovedCheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 27.995 27.995" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M25.43 11.6646C25.9627 14.279 25.583 16.997 24.3543 19.3653C23.1256 21.7336 21.1221 23.6092 18.6779 24.6791C16.2338 25.7491 13.4967 25.9488 10.9231 25.2449C8.34948 24.5411 6.09497 22.9762 4.53551 20.8113C2.97606 18.6464 2.20592 16.0123 2.35352 13.3482C2.50113 10.6842 3.55756 8.15132 5.34664 6.17193C7.13572 4.19254 9.54931 2.88632 12.1849 2.47109C14.8205 2.05585 17.5188 2.55671 19.8298 3.89014"
        stroke="currentColor" strokeWidth="2.33292" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M10.4981 12.831L13.9975 16.3304L25.6621 4.66583" stroke="currentColor" strokeWidth="2.33292" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RejectedXIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 27.995 27.995" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.9975 25.6621C20.4397 25.6621 25.6621 20.4397 25.6621 13.9975C25.6621 7.55533 20.4397 2.33292 13.9975 2.33292C7.55533 2.33292 2.33292 7.55533 2.33292 13.9975C2.33292 20.4397 7.55533 25.6621 13.9975 25.6621Z"
        stroke="currentColor" strokeWidth="2.33292" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M17.4969 10.4981L10.4981 17.4969" stroke="currentColor" strokeWidth="2.33292" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.4981 10.4981L17.4969 17.4969" stroke="currentColor" strokeWidth="2.33292" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ReviewingClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 27.995 27.995" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.9975 25.6621C20.4397 25.6621 25.6621 20.4397 25.6621 13.9975C25.6621 7.55533 20.4397 2.33292 13.9975 2.33292C7.55533 2.33292 2.33292 7.55533 2.33292 13.9975C2.33292 20.4397 7.55533 25.6621 13.9975 25.6621Z"
        stroke="currentColor" strokeWidth="2.33292" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M13.9975 6.99875V13.9975L18.6633 16.3304" stroke="currentColor" strokeWidth="2.33292" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
        {/* 审核中图标：figma 15098 外圈 #d1d5dc + 28px 时钟图标（描边 #6a7282），SVG 取自设计稿 */}
        <div className="w-16 h-16 rounded-full border-2 border-[#d1d5dc] flex items-center justify-center mb-6">
          <ReviewingClockIcon className="w-7 h-7 text-[#6a7282]" />
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
              {/* 已完成步骤向下的连线为深色，其余为灰色（对齐设计稿） */}
              {i < steps.length - 1 && (
                <div className="w-px flex-1 my-1 min-h-[26px]" style={{ background: s.state === "done" ? "#111111" : "#E5E7EB" }} />
              )}
            </div>
            <div className="pb-6">
              <div className="flex items-center gap-2">
                {/* 仅进行中(active)步骤标题为深色加粗，已完成/待处理均为灰色（对齐设计稿） */}
                <p className="text-sm" style={{ fontWeight: s.state === "active" ? 600 : s.state === "done" ? 500 : 400, color: s.state === "active" ? "#111111" : "#6B7280" }}>
                  {s.title}
                </p>
                {s.state === "active" && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-[4px]"
                    style={{ border: "1px solid #99a1af", color: "#6a7282", fontWeight: 400 }}
                  >
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
function ApprovedView({
  t,
  company,
  tenantStatus,
  tenantLoading,
  tenantRetrying,
  tenantUsername,
  onRetryTenantSync,
  onEnter,
}: {
  t: EM;
  company: string;
  tenantStatus: PublisherTenantStatus | null;
  tenantLoading: boolean;
  tenantRetrying: boolean;
  tenantUsername: string;
  onRetryTenantSync: () => void;
  onEnter: () => void;
}) {
  const syncStatus = tenantStatus?.tenantSyncStatus ?? null;
  const showTenantPanel = tenantLoading || syncStatus !== null;

  return (
    <StatusBand>
      <div className="flex flex-col items-center text-center">
        {/* 审核通过图标：figma 15123:25722 外圈 #1e2939 + 28px CircleCheckBig（描边 #1e2939），SVG 取自设计稿 */}
        <div className="w-16 h-16 rounded-full border-2 border-[#1e2939] flex items-center justify-center mb-6">
          <ApprovedCheckIcon className="w-7 h-7 text-[#1e2939]" />
        </div>
        <h2 className="text-[#111111]" style={{ fontWeight: 800, fontSize: "1.5rem" }}>{t.approvedTitle}</h2>
        <p className="text-gray-500 text-sm mt-3 leading-relaxed max-w-md">{t.approvedDesc.replace("{company}", company)}</p>
      </div>

      {/* 描述与按钮之间的分隔线（对齐 figma 15123-25540） */}
      <div className="w-full h-px bg-gray-100 my-8" />

      <div className="flex flex-col items-center">
        {showTenantPanel && (
          <div className="w-full mb-6 rounded-[12px] bg-[#f9fafb] border border-[#e5e7eb] p-4 text-left">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-[#111111]" style={{ fontWeight: 600 }}>{t.swiftAccountStatus}</p>
                {tenantLoading ? (
                  <p className="text-sm text-[#6b7280] mt-2">{t.swiftOpening}</p>
                ) : syncStatus === 1 ? (
                  <div className="mt-2 space-y-1.5 text-sm text-[#4a5565]">
                    <p>{t.swiftReady}</p>
                    {tenantUsername && <p>{t.swiftAccount}: {tenantUsername}</p>}
                    {tenantUsername && <p>{t.swiftInitialPassword}: {tenantUsername}</p>}
                    {tenantStatus?.tenantId && <p>{t.swiftTenantId}: {tenantStatus.tenantId}</p>}
                    {tenantStatus?.tenantSyncTime && <p>{t.swiftLastSync}: {tenantStatus.tenantSyncTime}</p>}
                  </div>
                ) : syncStatus === 2 ? (
                  <div className="mt-2 space-y-1.5 text-sm text-[#4a5565]">
                    {tenantStatus?.tenantSyncMsg && <p>{tenantStatus.tenantSyncMsg}</p>}
                    {tenantStatus?.tenantSyncTime && <p>{t.swiftLastSync}: {tenantStatus.tenantSyncTime}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-[#6b7280] mt-2">{t.swiftOpening}</p>
                )}
              </div>
              {syncStatus === 2 && (
                <button
                  type="button"
                  onClick={onRetryTenantSync}
                  disabled={tenantRetrying}
                  className="h-9 px-3 rounded-[8px] bg-[#111111] text-white text-xs flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ fontWeight: 600 }}
                >
                  {tenantRetrying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  {t.swiftRetry}
                </button>
              )}
            </div>
          </div>
        )}

        <button
          onClick={onEnter}
          className="flex items-center justify-center gap-2 px-8 h-[46px] rounded-[10px] bg-[#111111] text-white text-sm transition-all hover:opacity-90 active:scale-[0.99]"
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
        {/* 审核未通过图标：figma 15123:25872 外圈 #d1d5dc + 28px CircleX（描边 #6a7282），SVG 取自设计稿 */}
        <div className="w-16 h-16 rounded-full border-2 border-[#d1d5dc] flex items-center justify-center mb-6">
          <RejectedXIcon className="w-7 h-7 text-[#6a7282]" />
        </div>
        <h2 className="text-[#111111]" style={{ fontWeight: 800, fontSize: "1.5rem" }}>{t.rejectedTitle}</h2>
        <p className="text-gray-500 text-sm mt-3 leading-relaxed max-w-md">{t.rejectedDesc}</p>
      </div>

      {/* 分隔线 + 原因区 + 分隔线 + 全宽按钮：对齐 figma 15123-25742 的节奏 */}
      <div className="w-full h-px bg-gray-100 my-8" />

      {/* 原因区（figma 15123-25884）：后端有具体驳回原因则展示真实原因，否则回退展示常见原因列表 */}
      <div className="w-full text-left">
        {reason ? (
          <>
            <p className="text-xs uppercase tracking-[0.3px] text-[#99a1af]">{t.rejectReasonLabel}</p>
            <p className="text-sm text-[#4a5565] mt-3 leading-relaxed whitespace-pre-wrap break-words">{reason}</p>
          </>
        ) : (
          <>
            <p className="text-xs uppercase tracking-[0.3px] text-[#99a1af]">{t.commonReasonsLabel}</p>
            <ul className="mt-3 space-y-3">
              {t.commonReasons.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#99a1af] flex-shrink-0" />
                  <span className="text-sm text-[#4a5565] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="w-full h-px bg-gray-100 my-8" />

      {/* figma 15123-25913：深色按钮 #101828 + 刷新图标 */}
      <button
        onClick={onResubmit}
        className="w-full flex items-center justify-center gap-2 h-[48px] rounded-[10px] bg-[#101828] text-white text-sm transition-all hover:opacity-90 active:scale-[0.99]"
        style={{ fontWeight: 600 }}
      >
        <RefreshCw className="w-4 h-4" />
        {t.resubmit}
      </button>

      <div className="mt-8"><SupportLine t={t} /></div>
    </StatusBand>
  );
}

/* ── 合作协议 / 隐私政策 弹窗 ─────────────────────────────── */
function AgreementModal({
  open,
  title,
  body,
  closeLabel,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  closeLabel: string;
  onClose: () => void;
}) {
  const richHtml = sanitizeAgreementHtml(body);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-[640px] max-h-[80vh] bg-[#1c1c1c] border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl shadow-black/60"
            initial={{ y: 16, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 16, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-white" style={{ fontWeight: 700, fontSize: "1.1rem" }}>{title}</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label={closeLabel}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className={`px-6 py-5 overflow-y-auto text-sm text-[#d1d5dc] leading-relaxed break-words ${richHtml ? "[&_a]:text-white [&_a]:underline [&_blockquote]:border-l [&_blockquote]:border-white/20 [&_blockquote]:pl-3 [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_strong]:font-bold [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5" : "whitespace-pre-wrap"}`}>
              {richHtml ? <div dangerouslySetInnerHTML={{ __html: richHtml }} /> : body}
            </div>
            <div className="px-6 py-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 h-10 rounded-[10px] bg-white text-[#111] text-sm transition-opacity hover:opacity-90"
                style={{ fontWeight: 600 }}
              >
                {closeLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
      <a href={`mailto:${t.supportEmail}`} className="text-[#4a5565] hover:underline">
        {t.supportEmail}
      </a>
    </p>
  );
}
