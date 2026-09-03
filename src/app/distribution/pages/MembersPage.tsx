import { useState, useEffect, useCallback, useRef } from "react";
import { Info, X, User, ChevronDown, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "../../i18n";
import { AreaCodeSelect } from "../../components/AreaCodeSelect";
import { PageLoading } from "../components/settlement/PageHeader";
import {
  getMemberList,
  getMemberRoles,
  addMember,
  removeMember,
  type PublisherMember,
  type MemberRoleCard,
  type AddableMemberRole,
} from "../../services/member";

type MembersMsg = ReturnType<typeof useI18n>["messages"]["distribution"]["members"];

const BANNER_DISMISS_KEY = "lollipop-members-banner-dismissed";

/** 角色徽标 / 权限圆点配色（figma：超管 #ea580c / 管理员 #3b82f6 / 员工 #6b7280）。 */
const ROLE_THEME: Record<number, { bg: string; text: string; dot: string }> = {
  1: { bg: "#fff7ed", text: "#ea580c", dot: "#ea580c" },
  2: { bg: "#eff6ff", text: "#3b82f6", dot: "#3b82f6" },
  3: { bg: "#f9fafb", text: "#6b7280", dot: "#6b7280" },
};

/** 20260704 后端回执：成员手机号支持海外区号格式，前端只做非空校验。 */
function isValidPhone(v: string) {
  return v.trim().length > 0;
}

function defaultAddableRole(roles: MemberRoleCard[]): AddableMemberRole {
  const addable = roles.filter((r) => r.addable);
  const staff = addable.find((r) => r.code === 3);
  return (staff?.code ?? addable[0]?.code ?? 3) as AddableMemberRole;
}

function roleLabel(role: number, t: MembersMsg, fallback?: string) {
  switch (role) {
    case 1:
      return t.roleOwner;
    case 2:
      return t.roleAdmin;
    case 3:
      return t.roleStaff;
    default:
      return fallback || "—";
  }
}

function statusLabel(status: number, t: MembersMsg, fallback?: string) {
  switch (status) {
    case 1:
      return t.statusActive;
    case 0:
      return t.statusInactive;
    default:
      return fallback || "—";
  }
}

function permissionLabel(key: string, name: string, t: MembersMsg) {
  const normalized = key.toUpperCase();
  return t.permissionLabels[key] || t.permissionLabels[normalized] || t.permissionLabels[key.toLowerCase()] || name;
}

/**
 * 成员管理 —— figma 15149-28384(列表) / 28629(添加) / 28908(下拉) /
 * 29474(校验错误) / 29755(移除确认)。
 * 对接 /publisher/member/list、/roles、/add、/remove。
 */
export function MembersPage() {
  const { messages, locale } = useI18n();
  const t = messages.distribution.members;

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<PublisherMember[]>([]);
  const [roles, setRoles] = useState<MemberRoleCard[]>([]);
  const [bannerVisible, setBannerVisible] = useState(
    () => localStorage.getItem(BANNER_DISMISS_KEY) !== "1",
  );

  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<PublisherMember | null>(null);

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      try {
        setMembers(await getMemberList());
      } catch {
        if (showLoading) setMembers([]);
      }
      try {
        setRoles(await getMemberRoles());
      } catch {
        if (showLoading) setRoles([]);
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const dismissBanner = () => {
    localStorage.setItem(BANNER_DISMISS_KEY, "1");
    setBannerVisible(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <PageLoading />
      </div>
    );
  }

  const addableRoles = roles.filter((r) => r.addable);

  return (
    <div className="p-8">
      {/* ── 页头 figma 15149-28466 ── */}
      <div className="flex items-center justify-between gap-4">
        <h1
          className="text-[#101828]"
          style={{ fontWeight: 700, fontSize: "20px", lineHeight: "30px" }}
        >
          {t.title}
        </h1>
        <button
          onClick={() => setAddOpen(true)}
          className="px-4 py-2 rounded-[10px] text-white text-sm hover:opacity-90 transition-opacity flex-shrink-0"
          style={{ background: "#111111", fontWeight: 600 }}
        >
          {t.addAccount}
        </button>
      </div>

      {/* ── 蓝色提示条 figma 15149-28473 ── */}
      {bannerVisible && (
        <div className="mt-6 flex items-start gap-3 px-4 py-3 rounded-[14px] bg-[#eff6ff] border border-[#dbeafe]">
          <Info className="w-4 h-4 text-[#1447e6] flex-shrink-0 mt-0.5" />
          <p className="flex-1 text-xs text-[#1447e6]" style={{ lineHeight: "19.5px" }}>
            {t.bannerText}
          </p>
          <button
            onClick={dismissBanner}
            className="p-0 text-[#1447e6] hover:opacity-70 transition-opacity flex-shrink-0 mt-0.5"
            aria-label={messages.distribution.common.close}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── 成员表格 figma 15149-28486 ── */}
      <div className="mt-6 bg-white rounded-2xl border border-[#f3f4f6] overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_176px_176px_150px] px-6 py-3 border-b border-[#f3f4f6] bg-[#f9fafb]/50">
          {[t.colMemberInfo, t.colAccountStatus, t.colMemberType, t.colAction].map((label) => (
            <span key={label} className="text-xs text-[#6a7282]" style={{ fontWeight: 500 }}>
              {label}
            </span>
          ))}
        </div>

        {members.length === 0 ? (
          <div className="py-16" />
        ) : (
          members.map((m) => (
            <MemberRow key={m.memberUserId} member={m} t={t} onRemove={() => setRemoveTarget(m)} />
          ))
        )}
      </div>

      {/* ── 角色权限说明 figma 15149-28527 ── */}
      {roles.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm text-[#101828]" style={{ fontWeight: 600 }}>
            {t.rolesSectionTitle}
          </h3>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((role) => (
              <RoleCard key={role.code} role={role} t={t} />
            ))}
          </div>
        </div>
      )}

      {/* ── 添加账号弹窗 ── */}
      {addOpen && (
        <AddMemberModal
          t={t}
          locale={locale}
          addableRoles={addableRoles}
          defaultRole={defaultAddableRole(roles)}
          onClose={() => setAddOpen(false)}
          onSuccess={() => {
            setAddOpen(false);
            toast.success(t.addSuccess);
            void load(false);
          }}
        />
      )}

      {/* ── 移除确认弹窗 ── */}
      {removeTarget && (
        <RemoveMemberModal
          t={t}
          member={removeTarget}
          onClose={() => setRemoveTarget(null)}
          onSuccess={() => {
            setMembers((prev) => prev.filter((m) => m.memberUserId !== removeTarget.memberUserId));
            setRemoveTarget(null);
            toast.success(t.removeSuccess);
            void load(false);
          }}
        />
      )}
    </div>
  );
}

/* ── 成员行 figma 15149-28496 ───────────────────────────────── */

function MemberRow({
  member: m,
  t,
  onRemove,
}: {
  member: PublisherMember;
  t: MembersMsg;
  onRemove: () => void;
}) {
  const theme = ROLE_THEME[m.role] ?? ROLE_THEME[3];
  const active = m.status === 1;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_176px_176px_150px] items-center px-6 h-[72px] border-b border-[#f9fafb] last:border-0">
      {/* 成员信息 */}
      <div className="flex items-center gap-3 min-w-0">
        <MemberAvatar avatar={m.avatar} size={40} />
        <div className="min-w-0">
          <p className="text-sm text-[#101828] truncate" style={{ fontWeight: 600, lineHeight: "20px" }}>
            {m.nickname}
            {m.self && (
              <span className="text-xs text-[#99a1af]" style={{ fontWeight: 400 }}>
                {t.selfTag}
              </span>
            )}
          </p>
          <p className="text-xs text-[#99a1af] mt-0.5 truncate">
            {t.phoneLine.replace("{phone}", m.phoneMask)}
          </p>
        </div>
      </div>

      {/* 账号状态：浅绿 pill + 圆点（figma 15149-28505） */}
      <div>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
          style={{
            fontWeight: 500,
            background: active ? "#f0fdf4" : "#f9fafb",
            color: active ? "#16a34a" : "#9ca3af",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: active ? "#16a34a" : "#9ca3af" }}
          />
          {statusLabel(m.status, t, m.statusName)}
        </span>
      </div>

      {/* 成员类型徽标（figma 15149-28508） */}
      <div>
        <span
          className="inline-block px-2.5 py-1 rounded-[8px] text-xs"
          style={{ fontWeight: 700, background: theme.bg, color: theme.text }}
        >
          {roleLabel(m.role, t, m.roleName)}
        </span>
      </div>

      {/* 操作 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!m.removable}
          onClick={() => m.removable && onRemove()}
          className="text-xs transition-opacity"
          style={{
            fontWeight: 500,
            color: m.removable ? "#ea580c" : "#d1d5dc",
            cursor: m.removable ? "pointer" : "not-allowed",
          }}
        >
          {t.remove}
        </button>
      </div>
    </div>
  );
}

function MemberAvatar({ avatar, size = 40 }: { avatar: string | null; size?: number }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt=""
        className="rounded-full object-cover flex-shrink-0 bg-gray-100"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundImage: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
      }}
    >
      <User className="text-[#9ca3af]" style={{ width: size / 2, height: size / 2 }} />
    </div>
  );
}

/* ── 角色权限卡 figma 15149-28532 ───────────────────────────── */

function RoleCard({ role, t }: { role: MemberRoleCard; t: MembersMsg }) {
  const theme = ROLE_THEME[role.code] ?? ROLE_THEME[3];

  return (
    <div className="bg-white rounded-2xl border border-[#f3f4f6] p-5">
      <span
        className="inline-block px-2.5 py-1 rounded-[8px] text-xs"
        style={{ fontWeight: 700, background: theme.bg, color: theme.text }}
      >
        {roleLabel(role.code, t, role.name)}
      </span>
      <p className="mt-3 text-xs text-[#6a7282]" style={{ lineHeight: "19.5px" }}>
        {t.roleDescriptions[role.code] || role.description}
      </p>
      <ul className="mt-4 space-y-1.5">
        {role.permissions.map((p) => (
          <li key={p.key} className="flex items-center gap-2">
            <span
              className="w-1 h-1 rounded-full flex-shrink-0"
              style={{ background: p.allowed ? theme.dot : "#d1d5db" }}
            />
            {p.allowed ? (
              <span className="text-xs text-[#374151]" style={{ fontWeight: 500 }}>
                {permissionLabel(p.key, p.name, t)}
              </span>
            ) : (
              <span className="text-xs text-[#9ca3af]" style={{ fontWeight: 400 }}>
                ✕ {permissionLabel(p.key, p.name, t)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── 添加账号弹窗 figma 15149-28874（宽 420 / p-24 / 圆角 16） ── */

function AddMemberModal({
  t,
  locale,
  addableRoles,
  defaultRole,
  onClose,
  onSuccess,
}: {
  t: MembersMsg;
  locale: string;
  addableRoles: MemberRoleCard[];
  defaultRole: AddableMemberRole;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [role, setRole] = useState<AddableMemberRole>(defaultRole);
  const [areaCode, setAreaCode] = useState("+86");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedRole = addableRoles.find((r) => r.code === role);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleConfirm = async () => {
    if (!isValidPhone(phone)) {
      setPhoneError(t.vPhoneInvalid);
      return;
    }
    setSubmitting(true);
    try {
      await addMember({ phone: `${areaCode}${phone.trim()}`, role });
      onSuccess();
    } catch {
      // http 已 toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-6">
        {/* 标题（17px bold） */}
        <div className="flex items-center justify-between">
          <h3 className="text-[#101828]" style={{ fontWeight: 700, fontSize: "17px", lineHeight: "25.5px" }}>
            {t.addModalTitle}
          </h3>
          <button
            onClick={onClose}
            className="text-[#99a1af] hover:text-gray-600 transition-colors"
            aria-label={t.cancel}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 成员类型下拉 */}
        <div ref={dropdownRef} className="relative mt-6">
          <label className="flex items-center gap-1 text-xs text-[#364153]" style={{ fontWeight: 500 }}>
            <span className="text-[#fb2c36]">*</span>
            {t.memberTypeLabel}
          </label>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="mt-1.5 w-full h-[45px] flex items-center justify-between px-4 rounded-[14px] border border-[#e5e7eb] text-sm bg-white hover:border-gray-400 transition-colors"
          >
            <span className="text-[#1e2939]" style={{ fontWeight: 500 }}>
              {selectedRole ? roleLabel(selectedRole.code, t, selectedRole.name) : "—"}
            </span>
            <ChevronDown
              className="w-4 h-4 text-[#99a1af] transition-transform"
              style={{ transform: dropdownOpen ? "rotate(180deg)" : undefined }}
            />
          </button>

          {dropdownOpen && addableRoles.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-[14px] shadow-lg z-10 py-1 overflow-hidden">
              {addableRoles.map((r) => (
                <button
                  key={r.code}
                  type="button"
                  onClick={() => {
                    setRole(r.code as AddableMemberRole);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-[#101828] transition-colors ${
                    r.code === role ? "bg-[#f9fafb]" : "hover:bg-gray-50"
                  }`}
                  style={{ fontWeight: r.code === role ? 500 : 400 }}
                >
                  {roleLabel(r.code, t, r.name)}
                  {r.code === role && <Check className="w-4 h-4 text-[#101828]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 账号手机号 */}
        <div className="mt-4">
          <label className="flex items-center gap-1 text-xs text-[#364153]" style={{ fontWeight: 500 }}>
            <span className="text-[#fb2c36]">*</span>
            {t.phoneLabel}
          </label>
          <div className="mt-1.5 flex gap-2">
            <AreaCodeSelect value={areaCode} onChange={setAreaCode} locale={locale} variant="light" />
            <input
              type="text"
              inputMode="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 20));
                if (phoneError) setPhoneError("");
              }}
              placeholder={t.phonePlaceholder}
              maxLength={20}
              className={`min-w-0 flex-1 h-[46px] px-4 rounded-[14px] border text-sm outline-none transition-all placeholder:text-[rgba(10,10,10,0.5)] ${
                phoneError
                  ? "border-[#fb2c36] focus:border-[#fb2c36]"
                  : "border-[#e5e7eb] hover:border-gray-400 focus:border-[#111]"
              }`}
            />
          </div>
          {phoneError && <p className="text-xs text-[#fb2c36] mt-1.5">{phoneError}</p>}
        </div>

        {/* 底部按钮：等宽两枚（figma 15149-28902） */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 h-[45px] rounded-[14px] border border-[#e5e7eb] text-sm text-[#364153] hover:bg-gray-50 transition-colors disabled:opacity-60"
            style={{ fontWeight: 500 }}
          >
            {t.cancel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 h-[45px] rounded-[14px] bg-[#111111] text-white text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ fontWeight: 600 }}
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {t.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 移除确认弹窗 figma 15149-30016（宽 500 / p-32 / 按钮右对齐） ── */

function RemoveMemberModal({
  t,
  member,
  onClose,
  onSuccess,
}: {
  t: MembersMsg;
  member: PublisherMember;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await removeMember({ memberUserId: member.memberUserId });
      onSuccess();
    } catch {
      // http 已 toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-2xl p-8">
        {/* 标题（18px bold） */}
        <div className="flex items-start justify-between">
          <h3 className="text-[#101828]" style={{ fontWeight: 700, fontSize: "18px", lineHeight: "27px" }}>
            {t.removeModalTitle}
          </h3>
          <button
            onClick={onClose}
            className="text-[#99a1af] hover:text-gray-600 transition-colors mt-0.5"
            aria-label={t.cancel}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 说明文案（14px #4a5565） */}
        <p className="mt-5 text-sm text-[#4a5565]" style={{ lineHeight: "22.75px" }}>
          {t.removeModalDesc}
        </p>

        {/* 成员卡（灰底 / 48px 头像 / figma 15149-30028） */}
        <div className="mt-6 flex items-center gap-4 px-5 py-4 rounded-2xl bg-[#f9fafb]">
          <MemberAvatar avatar={member.avatar} size={48} />
          <div className="min-w-0">
            <p className="text-sm text-[#101828] truncate" style={{ fontWeight: 600, lineHeight: "20px" }}>
              {member.nickname}
            </p>
            <p className="text-xs text-[#99a1af] mt-1 truncate">
              {roleLabel(member.role, t, member.roleName)}
              <span className="text-[#d1d5dc]">|</span>
              {member.phoneMask}
            </p>
          </div>
        </div>

        {/* 底部按钮：右对齐（figma 15149-30037） */}
        <div className="flex items-center justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            disabled={submitting}
            className="h-[45px] px-8 rounded-[14px] border border-[#e5e7eb] text-sm text-[#364153] hover:bg-gray-50 transition-colors disabled:opacity-60"
            style={{ fontWeight: 500 }}
          >
            {t.cancel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="h-[45px] px-8 rounded-[14px] bg-[#111111] text-white text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ fontWeight: 600 }}
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {t.removeConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
