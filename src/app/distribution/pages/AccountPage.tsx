import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Bell,
  Building2,
  CheckCircle2,
  Copy,
  Edit2,
  Globe2,
  Hash,
  KeyRound,
  Loader2,
  LogOut,
  MapPin,
  Monitor,
  Phone,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n, type Locale } from "../../i18n";
import { PageLoading } from "../components/settlement/PageHeader";
import {
  bindAccountEmail,
  changeAccountPassword,
  getAccountInfo,
  getAccountLoginRecords,
  getAccountSessions,
  kickAccountSession,
  logoutOtherAccountSessions,
  sendAccountEmailCode,
  updateAvatar,
  updateCompany,
  updateNickname,
  updateNotify,
  type AccountCompany,
  type AccountInfo,
  type AccountLoginRecord,
  type AccountNotify,
  type AccountSession,
} from "../../services/account";
import { ALIOSS_UPLOAD_PATH, uploadFile } from "../../services/upload";
import { normalizeImageFile } from "../../services/heic";

type AccountMsg = ReturnType<typeof useI18n>["messages"]["distribution"]["account"];
type TabKey = "info" | "security" | "devices";
type AccountProfilePatch = Partial<Pick<AccountInfo["profile"], "nickname" | "avatar">>;

const emptyCompany: AccountCompany = {
  companyName: "",
  creditCode: "",
  companyAddress: "",
  companyPhone: "",
};

export function AccountPage() {
  const { messages, locale } = useI18n();
  const t = messages.distribution.account;
  const [active, setActive] = useState<TabKey>("info");
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<AccountInfo | null>(null);
  const [sessions, setSessions] = useState<AccountSession[]>([]);
  const [loginRecords, setLoginRecords] = useState<AccountLoginRecord[]>([]);
  const [deviceLoading, setDeviceLoading] = useState(false);

  const loadInfo = useCallback(async () => {
    setLoading(true);
    try {
      setInfo(await getAccountInfo());
    } catch {
      setInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshInfo = useCallback(async () => {
    try {
      setInfo(await getAccountInfo());
    } catch {
      // 保存后的静默刷新失败时保留当前页面状态，避免回到整页空态。
    }
  }, []);

  const patchProfile = useCallback((profile: AccountProfilePatch) => {
    setInfo((prev) => prev ? { ...prev, profile: { ...prev.profile, ...profile } } : prev);
  }, []);

  const patchCompany = useCallback((company: AccountCompany) => {
    setInfo((prev) => prev ? { ...prev, company } : prev);
  }, []);

  const patchNotify = useCallback((notify: AccountNotify) => {
    setInfo((prev) => prev ? { ...prev, notify } : prev);
  }, []);

  const loadDevices = useCallback(async () => {
    setDeviceLoading(true);
    try {
      const [nextSessions, nextLoginRecords] = await Promise.all([
        getAccountSessions().catch(() => []),
        getAccountLoginRecords().catch(() => []),
      ]);
      setSessions(nextSessions);
      setLoginRecords(nextLoginRecords);
    } finally {
      setDeviceLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInfo();
  }, [loadInfo]);

  useEffect(() => {
    if (active === "devices") void loadDevices();
  }, [active, loadDevices]);

  if (loading) {
    return (
      <div className="p-8">
        <PageLoading />
      </div>
    );
  }

  if (!info) {
    return <div className="p-8" />;
  }

  return (
    <div className="p-8">
      <Tabs t={t} active={active} onChange={setActive} />
      <div className="mt-7">
        {active === "info" && <AccountInfoTab t={t} info={info} onReload={refreshInfo} onProfileChange={patchProfile} onCompanyChange={patchCompany} onNotifyChange={patchNotify} />}
        {active === "security" && <SecurityTab t={t} info={info} onReload={refreshInfo} />}
        {active === "devices" && (
          <DevicesTab
            t={t}
            loading={deviceLoading}
            sessions={sessions}
            loginRecords={loginRecords}
            locale={locale}
            onReload={loadDevices}
          />
        )}
      </div>
    </div>
  );
}

function Tabs({ t, active, onChange }: { t: AccountMsg; active: TabKey; onChange: (tab: TabKey) => void }) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: "info", label: t.tabInfo },
    { key: "security", label: t.tabSecurity },
    { key: "devices", label: t.tabDevices },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-[#f3f4f6]">
      {tabs.map((tab) => {
        const selected = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className="relative px-4 py-2.5 text-sm"
            style={{ fontWeight: selected ? 700 : 400, color: selected ? "#111111" : "#9ca3af" }}
          >
            {tab.label}
            {selected && <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-[#111111]" />}
          </button>
        );
      })}
    </div>
  );
}

function AccountInfoTab({
  t,
  info,
  onReload,
  onProfileChange,
  onCompanyChange,
  onNotifyChange,
}: {
  t: AccountMsg;
  info: AccountInfo;
  onReload: () => Promise<void>;
  onProfileChange: (profile: AccountProfilePatch) => void;
  onCompanyChange: (company: AccountCompany) => void;
  onNotifyChange: (notify: AccountNotify) => void;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,752px)_366px]">
      <div className="space-y-5">
        <ProfileCard t={t} info={info} onProfileChange={onProfileChange} />
        <DataCard t={t} info={info} onReload={onReload} />
        <CompanyCard t={t} company={info.company ?? emptyCompany} onCompanyChange={onCompanyChange} />
      </div>
      <NotificationCard t={t} notify={info.notify} onNotifyChange={onNotifyChange} />
    </div>
  );
}

function ProfileCard({ t, info, onProfileChange }: { t: AccountMsg; info: AccountInfo; onProfileChange: (profile: AccountProfilePatch) => void }) {
  const avatarText = (info.profile.nickname || "创").trim().slice(0, 1).toUpperCase();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [nicknameOpen, setNicknameOpen] = useState(false);

  const changeAvatar = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const normalized = await normalizeImageFile(file);
      const url = await uploadFile(normalized, ALIOSS_UPLOAD_PATH);
      await updateAvatar(url);
      onProfileChange({ avatar: url });
      toast.success(t.saveSuccess);
    } catch {
      // uploadFile / http 已 toast
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <>
      <div className="flex items-center gap-5 rounded-2xl border border-[#f3f4f6] bg-white p-6">
        {info.profile.avatar ? (
          <img src={info.profile.avatar} alt="" className="h-20 w-20 rounded-full bg-gray-100 object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#111111] text-[28px] text-white" style={{ fontWeight: 700 }}>
            {avatarText}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base text-[#101828]" style={{ fontWeight: 700 }}>
              {info.profile.nickname || t.unset}
            </h2>
            {info.profile.certified === 1 && (
              <span className="rounded-md bg-[#dcfce7] px-2 py-0.5 text-xs text-[#16a34a]" style={{ fontWeight: 600 }}>
                {t.certified}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[#99a1af]">UID: {info.profile.accountCode || "—"}</p>
          <div className="mt-3 flex items-center gap-2">
            <GhostButton icon={<Edit2 className="h-3.5 w-3.5" />} label={t.editNickname} onClick={() => setNicknameOpen(true)} />
            <GhostButton
              icon={uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Edit2 className="h-3.5 w-3.5" />}
              label={t.changeAvatar}
              onClick={() => !uploading && fileRef.current?.click()}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif"
              className="hidden"
              onChange={(e) => void changeAvatar(e.target.files?.[0])}
            />
          </div>
        </div>
        <div className="min-w-[120px] space-y-2 text-right text-xs text-[#99a1af]">
          <p>
            {t.registerTime}
            <br />
            <span className="text-[#4a5565]">{info.profile.registerTime || "—"}</span>
          </p>
          <p>
            {t.lastLogin}
            <br />
            <span className="text-[#4a5565]">{info.profile.lastLoginTime || "—"}</span>
          </p>
        </div>
      </div>
      {nicknameOpen && (
        <NicknameModal
          t={t}
          initialNickname={info.profile.nickname || ""}
          onClose={() => setNicknameOpen(false)}
          onSaved={async (nickname) => {
            setNicknameOpen(false);
            onProfileChange({ nickname });
          }}
        />
      )}
    </>
  );
}

function DataCard({ t, info, onReload }: { t: AccountMsg; info: AccountInfo; onReload: () => Promise<void> }) {
  const [emailOpen, setEmailOpen] = useState(false);
  const copyCode = async () => {
    await navigator.clipboard?.writeText(info.profile.accountCode);
    toast.success(t.copied);
  };

  return (
    <>
      <Card title={t.accountData}>
        <InfoRow icon={<Hash className="h-4 w-4" />} label={t.uid} value={info.profile.accountCode || "—"} actionIcon={<Copy className="h-3.5 w-3.5" />} actionLabel={t.copy} onAction={copyCode} />
        <InfoRow icon={<Phone className="h-4 w-4" />} label={t.phone} value={info.contact.phoneMask || t.unset} badge={info.contact.phoneBound ? t.bound : undefined} />
        <InfoRow icon={<Globe2 className="h-4 w-4" />} label={t.email} value={info.contact.emailMask || t.unset} actionIcon={<Edit2 className="h-3.5 w-3.5" />} actionLabel={t.edit} onAction={() => setEmailOpen(true)} last />
      </Card>
      {emailOpen && (
        <BindEmailModal
          t={t}
          initialEmail={info.contact.emailMask || ""}
          onClose={() => setEmailOpen(false)}
          onSaved={async () => {
            setEmailOpen(false);
            await onReload();
          }}
        />
      )}
    </>
  );
}

function CompanyCard({ t, company, onCompanyChange }: { t: AccountMsg; company: AccountCompany; onCompanyChange: (company: AccountCompany) => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(() => normalizeCompany(company));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editing) setDraft(normalizeCompany(company));
  }, [company, editing]);

  const save = async () => {
    if (!draft.companyName.trim()) {
      setError(t.requiredCompany);
      return;
    }
    setSaving(true);
    try {
      const nextCompany: AccountCompany = {
        companyName: draft.companyName.trim(),
        creditCode: draft.creditCode.trim(),
        companyAddress: draft.companyAddress.trim(),
        companyPhone: draft.companyPhone.trim(),
      };
      await updateCompany(nextCompany);
      toast.success(t.saveSuccess);
      setEditing(false);
      onCompanyChange(nextCompany);
    } catch {
      // http 已 toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      title={t.companyInfo}
      action={
        editing ? (
          <div className="flex items-center gap-2">
            <button type="button" className="text-xs text-[#6a7282]" onClick={() => setEditing(false)} disabled={saving}>
              {t.cancel}
            </button>
            <button type="button" className="flex h-8 items-center gap-1.5 rounded-lg bg-[#111111] px-3 text-xs text-white" onClick={save} disabled={saving} style={{ fontWeight: 600 }}>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {t.save}
            </button>
          </div>
        ) : (
          <GhostButton icon={<Edit2 className="h-3.5 w-3.5" />} label={t.edit} onClick={() => setEditing(true)} />
        )
      }
    >
      {editing ? (
        <div className="space-y-4 p-5">
          <CompanyInput label={t.companyName} value={draft.companyName} onChange={(v) => { setDraft((p) => ({ ...p, companyName: v })); setError(""); }} error={error} required />
          <CompanyInput label={t.creditCode} value={draft.creditCode} onChange={(v) => setDraft((p) => ({ ...p, creditCode: v }))} />
          <CompanyInput label={t.companyAddress} value={draft.companyAddress} onChange={(v) => setDraft((p) => ({ ...p, companyAddress: v }))} />
          <CompanyInput label={t.companyPhone} value={draft.companyPhone} onChange={(v) => setDraft((p) => ({ ...p, companyPhone: v }))} />
        </div>
      ) : (
        <>
          <InfoRow icon={<Building2 className="h-4 w-4" />} label={t.companyName} value={company.companyName || t.unset} />
          <InfoRow icon={<Hash className="h-4 w-4" />} label={t.creditCode} value={company.creditCode || t.unset} />
          <InfoRow icon={<Globe2 className="h-4 w-4" />} label={t.companyAddress} value={company.companyAddress || t.unset} />
          <InfoRow icon={<Phone className="h-4 w-4" />} label={t.companyPhone} value={company.companyPhone || t.unset} last />
        </>
      )}
    </Card>
  );
}

function NotificationCard({ t, notify, onNotifyChange }: { t: AccountMsg; notify: AccountNotify; onNotifyChange: (notify: AccountNotify) => void }) {
  const [saving, setSaving] = useState<keyof AccountNotify | null>(null);
  const toggle = async (key: keyof AccountNotify) => {
    setSaving(key);
    try {
      const nextValue: 0 | 1 = notify[key] === 1 ? 0 : 1;
      const nextNotify: AccountNotify = { ...notify, [key]: nextValue };
      await updateNotify(nextNotify);
      onNotifyChange(nextNotify);
    } catch {
      // http 已 toast
    } finally {
      setSaving(null);
    }
  };
  return (
    <Card title={t.notification}>
      <NotifyRow icon={<Bell className="h-4 w-4" />} title={t.emailNotify} desc={t.emailNotifyDesc} enabled={notify.notifyEmail === 1} saving={saving === "notifyEmail"} onToggle={() => toggle("notifyEmail")} />
      <NotifyRow icon={<Phone className="h-4 w-4" />} title={t.smsNotify} desc={t.smsNotifyDesc} enabled={notify.notifySms === 1} saving={saving === "notifySms"} onToggle={() => toggle("notifySms")} last />
    </Card>
  );
}

function SecurityTab({ t, info, onReload }: { t: AccountMsg; info: AccountInfo; onReload: () => Promise<void> }) {
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const levelLabel = info.security.securityLevel === 3 ? t.high : info.security.securityLevel === 2 ? t.medium : t.low;
  const suggestions = buildSecuritySuggestions(t, info);

  return (
    <div className="max-w-[672px]">
      <Card title={t.accountSecurity}>
        <SecurityRow icon={<KeyRound className="h-4 w-4" />} label={t.password} value={info.security.passwordSet ? t.set : t.notSet} badge={info.security.passwordSet ? t.safe : t.improveSuggested} tone={info.security.passwordSet ? "green" : "orange"} actionLabel={t.changePasswordAction} onManage={() => setPasswordOpen(true)} />
        <SecurityRow icon={<ShieldCheck className="h-4 w-4" />} label={t.twoFactor} value={t.phoneVerifyCode} badge={info.security.twoFactorEnabled ? t.enabled : t.notSet} tone={info.security.twoFactorEnabled ? "green" : "orange"} actionLabel={t.manage} onManage={() => toast.info(t.smsScenePending)} />
        <SecurityRow icon={<AlertCircle className="h-4 w-4" />} label={t.securityTitle} value={levelLabel} badge={info.security.securityLevel === 3 ? t.safe : t.improveSuggested} tone={info.security.securityLevel === 3 ? "green" : "orange"} actionLabel={t.viewSuggestions} onManage={() => setSuggestionsOpen(true)} last />
      </Card>
      {passwordOpen && (
        <PasswordModal
          t={t}
          passwordSet={info.security.passwordSet}
          onClose={() => setPasswordOpen(false)}
          onSaved={async () => {
            setPasswordOpen(false);
            await onReload();
          }}
        />
      )}
      {suggestionsOpen && <SecuritySuggestionsModal t={t} suggestions={suggestions} onClose={() => setSuggestionsOpen(false)} />}
    </div>
  );
}

function DevicesTab({
  t,
  loading,
  sessions,
  loginRecords,
  locale,
  onReload,
}: {
  t: AccountMsg;
  loading: boolean;
  sessions: AccountSession[];
  loginRecords: AccountLoginRecord[];
  locale: Locale;
  onReload: () => Promise<void>;
}) {
  const [acting, setActing] = useState<string | null>(null);
  const logoutOthers = async () => {
    setActing("all");
    try {
      await logoutOtherAccountSessions();
      await onReload();
    } finally {
      setActing(null);
    }
  };
  const kick = async (sessionId: string) => {
    setActing(sessionId);
    try {
      await kickAccountSession(sessionId);
      await onReload();
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="max-w-[672px] space-y-5">
      <div className="flex items-center gap-3 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3">
        <ShieldCheck className="h-4 w-4 flex-shrink-0 text-[#2563eb]" />
        <p className="text-xs text-[#2563eb]" style={{ lineHeight: "19.5px", fontWeight: 500 }}>
          {t.deviceNotice}
        </p>
      </div>
      <Card
        title={t.sessions}
        subtitle={t.totalDevices.replace("{n}", String(sessions.length))}
        action={
          <button type="button" onClick={logoutOthers} disabled={acting === "all"} className="flex h-8 items-center gap-1.5 rounded-lg border border-[#fecaca] bg-white px-3 text-xs text-[#fb2c36]" style={{ fontWeight: 600 }}>
            {acting === "all" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
            {t.logoutOthers}
          </button>
        }
      >
        {loading ? (
          <PageLoading />
        ) : sessions.length === 0 ? (
          <EmptyCardText>{t.emptySessions}</EmptyCardText>
        ) : (
          sessions.map((session, index) => (
            <DeviceRow key={session.sessionId} t={t} locale={locale} session={session} acting={acting === session.sessionId} onKick={() => kick(session.sessionId)} last={index === sessions.length - 1} />
          ))
        )}
      </Card>
      <Card title={t.recentLogins}>
        {loginRecords.length === 0 ? (
          <EmptyCardText>{t.emptyLoginRecords}</EmptyCardText>
        ) : (
          loginRecords.map((record, index) => <LoginRecordRow key={`${record.loginTime}-${index}`} t={t} locale={locale} record={record} last={index === loginRecords.length - 1} />)
        )}
      </Card>
    </div>
  );
}

function Card({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#f3f4f6] bg-white">
      <div className="flex items-center justify-between border-b border-[#f3f4f6] px-6 py-4">
        <div>
          <h3 className="text-sm text-[#101828]" style={{ fontWeight: 600 }}>{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-[#99a1af]">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value, badge, actionIcon, actionLabel, onAction, last }: { icon: React.ReactNode; label: string; value: string; badge?: string; actionIcon?: React.ReactNode; actionLabel?: string; onAction?: () => void; last?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-6 py-4 ${last ? "" : "border-b border-[#f3f4f6]"}`}>
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] border border-[#f3f4f6] bg-[#f9fafb] text-[#99a1af]">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[#99a1af]">{label}</p>
        <p className="mt-0.5 truncate text-sm text-[#1e2939]" style={{ fontWeight: 600 }}>{value}</p>
      </div>
      {badge && <span className="rounded-full border border-[#f3f4f6] bg-[#f9fafb] px-2 py-1 text-xs text-[#6a7282]">{badge}</span>}
      {actionLabel && <GhostButton icon={actionIcon} label={actionLabel} onClick={onAction} />}
    </div>
  );
}

function GhostButton({ icon, label, onClick }: { icon?: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-xs text-[#4a5565] hover:bg-gray-50" style={{ fontWeight: 500 }}>
      {icon ?? null}
      {label}
    </button>
  );
}

function CompanyInput({ label, value, onChange, error, required }: { label: string; value: string; onChange: (value: string) => void; error?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-[#364153]" style={{ fontWeight: 600 }}>
        {label}
        {required && <span className="ml-1 text-[#fb2c36]">*</span>}
      </span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={`h-10 w-full rounded-[10px] border px-3 text-sm outline-none ${error ? "border-[#fb2c36]" : "border-[#e5e7eb] focus:border-[#111111]"}`} />
      {error && <span className="mt-1 block text-xs text-[#fb2c36]">{error}</span>}
    </label>
  );
}

function NotifyRow({ icon, title, desc, enabled, saving, onToggle, last }: { icon: React.ReactNode; title: string; desc: string; enabled: boolean; saving: boolean; onToggle: () => void; last?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 px-6 py-4 ${last ? "" : "border-b border-[#f3f4f6]"}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#f3f4f6] bg-[#f9fafb] text-[#99a1af]">{icon}</div>
        <div>
          <p className="text-sm text-[#1e2939]" style={{ fontWeight: 500 }}>{title}</p>
          <p className="mt-0.5 text-xs text-[#99a1af]">{desc}</p>
        </div>
      </div>
      <button type="button" onClick={onToggle} disabled={saving} className="relative mt-0.5 h-[22px] w-10 rounded-full transition-colors" style={{ background: enabled ? "#111111" : "#e5e7eb" }}>
        <span className="absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-all" style={{ left: enabled ? 20 : 2 }} />
      </button>
    </div>
  );
}

function SecurityRow({ icon, label, value, badge, tone, actionLabel, onManage, last }: { icon: React.ReactNode; label: string; value: string; badge: string; tone: "green" | "orange"; actionLabel: string; onManage: () => void; last?: boolean }) {
  const badgeStyle = tone === "green" ? { background: "#dcfce7", color: "#16a34a" } : { background: "#ffedd5", color: "#f97316" };
  return (
    <div className={`flex min-h-[72px] items-center gap-3 px-6 py-4 ${last ? "" : "border-b border-[#f3f4f6]"}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#f3f4f6] bg-[#f9fafb] text-[#99a1af]">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-[#99a1af]">{label}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-sm text-[#1e2939]" style={{ fontWeight: 700 }}>{value}</span>
          <span className="rounded-md px-2 py-0.5 text-xs" style={{ ...badgeStyle, fontWeight: 600 }}>{badge}</span>
        </div>
      </div>
      <GhostButton icon={<Edit2 className="h-3.5 w-3.5" />} label={actionLabel} onClick={onManage} />
    </div>
  );
}

function DeviceRow({ t, locale, session, acting, onKick, last }: { t: AccountMsg; locale: Locale; session: AccountSession; acting: boolean; onKick: () => void; last?: boolean }) {
  const mobile = isMobileDevice(session.device);
  return (
    <div className={`flex items-center gap-3 px-6 py-4 ${last ? "" : "border-b border-[#f3f4f6]"}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-[#f3f4f6] bg-[#f9fafb] text-[#99a1af]">
        {mobile ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm text-[#1e2939]" style={{ fontWeight: 600 }}>{session.device}</p>
          {session.current && <span className="rounded-md bg-[#dcfce7] px-2 py-0.5 text-xs text-[#16a34a]" style={{ fontWeight: 600 }}>{t.currentDevice}</span>}
        </div>
        <p className="mt-1 text-xs text-[#99a1af]">{formatLocation(t, locale, session.location)} · {session.lastActiveTime || session.loginTime || "—"}</p>
      </div>
      {!session.current && (
        <button type="button" onClick={onKick} disabled={acting} className="h-8 rounded-lg border border-[#e5e7eb] px-3 text-xs text-[#4a5565]">
          {acting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t.terminate}
        </button>
      )}
    </div>
  );
}

function LoginRecordRow({ t, locale, record, last }: { t: AccountMsg; locale: Locale; record: AccountLoginRecord; last?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-6 py-4 ${last ? "" : "border-b border-[#f3f4f6]"}`}>
      <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: record.success ? "#22c55e" : "#fb2c36" }} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-[#1e2939]" style={{ fontWeight: 600 }}>{record.device}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-[#99a1af]">
          <MapPin className="h-3 w-3" />
          {formatLocation(t, locale, record.location)} · {record.loginTime || "—"}
        </p>
      </div>
      <span className="rounded-full px-2 py-1 text-xs" style={{ background: record.success ? "#f0fdf4" : "#fef2f2", color: record.success ? "#16a34a" : "#dc2626" }}>
        {record.success ? t.success : t.failed}
      </span>
    </div>
  );
}

function NicknameModal({ t, initialNickname, onClose, onSaved }: { t: AccountMsg; initialNickname: string; onClose: () => void; onSaved: (nickname: string) => Promise<void> }) {
  const [nickname, setNickname] = useState(initialNickname);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    const next = nickname.trim();
    if (!next) return;
    setSaving(true);
    try {
      await updateNickname(next);
      toast.success(t.saveSuccess);
      await onSaved(next);
    } catch {
      // http 已 toast
    } finally {
      setSaving(false);
    }
  };
  return (
    <DialogShell title={t.editNickname} onClose={onClose}>
      <DialogInput label={t.editNickname} value={nickname} onChange={setNickname} autoComplete="nickname" />
      <DialogActions t={t} saving={saving} onCancel={onClose} onConfirm={() => void save()} />
    </DialogShell>
  );
}

function BindEmailModal({ t, initialEmail, onClose, onSaved }: { t: AccountMsg; initialEmail: string; onClose: () => void; onSaved: () => Promise<void> }) {
  const [email, setEmail] = useState(initialEmail.includes("*") ? "" : initialEmail);
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);

  const sendCode = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error(t.emailInvalid);
      return;
    }
    setSending(true);
    try {
      await sendAccountEmailCode(email.trim());
      toast.success(t.codeSent);
    } catch {
      // http 已 toast
    } finally {
      setSending(false);
    }
  };
  const save = async () => {
    if (!code.trim()) {
      toast.error(t.codeRequired);
      return;
    }
    setSaving(true);
    try {
      await bindAccountEmail(email.trim(), code.trim());
      toast.success(t.saveSuccess);
      await onSaved();
    } catch {
      // http 已 toast
    } finally {
      setSaving(false);
    }
  };
  return (
    <DialogShell title={t.bindEmailTitle} onClose={onClose}>
      <div className="space-y-4">
        <DialogInput label={t.emailInput} value={email} onChange={setEmail} autoComplete="email" />
        <div className="grid grid-cols-[1fr_auto] items-end gap-2">
          <DialogInput label={t.codeInput} value={code} onChange={setCode} />
          <button type="button" onClick={() => void sendCode()} disabled={sending} className="flex h-10 items-center gap-1.5 rounded-[10px] border border-[#e5e7eb] px-3 text-xs text-[#4a5565]" style={{ fontWeight: 600 }}>
            {sending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {t.sendCode}
          </button>
        </div>
      </div>
      <DialogActions t={t} saving={saving} onCancel={onClose} onConfirm={() => void save()} />
    </DialogShell>
  );
}

function PasswordModal({ t, passwordSet, onClose, onSaved }: { t: AccountMsg; passwordSet: boolean; onClose: () => void; onSaved: () => Promise<void> }) {
  const [oldPassword, setOldPassword] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (newPassword !== confirmPassword) {
      toast.error(t.passwordMismatch);
      return;
    }
    setSaving(true);
    try {
      await changeAccountPassword({ ...(passwordSet ? { oldPassword: oldPassword.trim() } : { smsCode: smsCode.trim() }), newPassword });
      toast.success(t.saveSuccess);
      await onSaved();
    } catch {
      // http 已 toast
    } finally {
      setSaving(false);
    }
  };
  return (
    <DialogShell title={t.passwordTitle} onClose={onClose}>
      <div className="space-y-4">
        {passwordSet ? <DialogInput label={t.oldPassword} value={oldPassword} onChange={setOldPassword} type="password" /> : <DialogInput label={t.smsCode} value={smsCode} onChange={setSmsCode} />}
        <DialogInput label={t.newPassword} value={newPassword} onChange={setNewPassword} type="password" />
        <DialogInput label={t.confirmPassword} value={confirmPassword} onChange={setConfirmPassword} type="password" />
      </div>
      <DialogActions t={t} saving={saving} onCancel={onClose} onConfirm={() => void save()} />
    </DialogShell>
  );
}

function SecuritySuggestionsModal({ t, suggestions, onClose }: { t: AccountMsg; suggestions: string[]; onClose: () => void }) {
  return (
    <DialogShell title={t.suggestions} onClose={onClose}>
      <ul className="space-y-3">
        {suggestions.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-[#4a5565]" style={{ lineHeight: "22px" }}>
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#16a34a]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex justify-end">
        <button type="button" onClick={onClose} className="h-10 rounded-[10px] bg-[#111111] px-4 text-sm text-white" style={{ fontWeight: 600 }}>
          {t.confirm}
        </button>
      </div>
    </DialogShell>
  );
}

function DialogShell({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base text-[#101828]" style={{ fontWeight: 700 }}>{title}</h3>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-50">
            <X className="h-4 w-4 text-[#6a7282]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DialogInput({ label, value, onChange, type = "text", autoComplete }: { label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-[#364153]" style={{ fontWeight: 600 }}>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} className="h-10 w-full rounded-[10px] border border-[#e5e7eb] px-3 text-sm outline-none focus:border-[#111111]" />
    </label>
  );
}

function DialogActions({ t, saving, onCancel, onConfirm }: { t: AccountMsg; saving: boolean; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="mt-6 flex justify-end gap-2">
      <button type="button" onClick={onCancel} disabled={saving} className="h-10 rounded-[10px] border border-[#e5e7eb] px-4 text-sm text-[#4a5565]">{t.cancel}</button>
      <button type="button" onClick={onConfirm} disabled={saving} className="flex h-10 items-center gap-1.5 rounded-[10px] bg-[#111111] px-4 text-sm text-white" style={{ fontWeight: 600 }}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {t.confirm}
      </button>
    </div>
  );
}

function EmptyCardText({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-10 text-center text-sm text-[#99a1af]">{children}</div>;
}

function normalizeCompany(company: AccountCompany) {
  return {
    companyName: company.companyName || "",
    creditCode: company.creditCode || "",
    companyAddress: company.companyAddress || "",
    companyPhone: company.companyPhone || "",
  };
}

function buildSecuritySuggestions(t: AccountMsg, info: AccountInfo): string[] {
  const suggestions: string[] = [];
  if (!info.security.passwordSet) suggestions.push(t.suggestPassword);
  if (!info.security.twoFactorEnabled) suggestions.push(t.suggestTwoFactor);
  if (!info.contact.emailBound) suggestions.push(t.suggestEmail);
  return suggestions.length ? suggestions : [t.noSuggestions];
}

function isMobileDevice(device: string) {
  const normalized = device.toLowerCase();
  return normalized.includes("iphone") || normalized.includes("ipad") || normalized.includes("android") || normalized.includes("mobile");
}

function formatLocation(t: AccountMsg, locale: Locale, location: string | null) {
  if (!location) return t.unknownLocation;
  if (locale === "zh-CN" || locale === "zh-TW") return location;
  return location;
}
