import { useState, useEffect, useCallback } from "react";
import { Building2, Check, CreditCard, Edit2, Loader2, Plus, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "../../i18n";
import { PageHeader, PageLoading } from "../components/settlement/PageHeader";
import {
  getPayoutAccounts,
  addPayoutAccount,
  updatePayoutAccount,
  deletePayoutAccount,
  setDefaultPayoutAccount,
  type PayoutAccount,
} from "../../services/settlement";

type PaymentMsg = ReturnType<typeof useI18n>["messages"]["distribution"]["payment"];

interface DraftState {
  accountNo: string;
  bank: string;
  branch: string;
  isDefault: boolean;
}

const emptyDraft: DraftState = { accountNo: "", bank: "", branch: "", isDefault: false };

export function PaymentPage() {
  const { messages } = useI18n();
  const t = messages.distribution.payment;

  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "add" | "edit">("view");
  const [companyName, setCompanyName] = useState("");
  const [accounts, setAccounts] = useState<PayoutAccount[]>([]);
  const [editingAccount, setEditingAccount] = useState<PayoutAccount | null>(null);
  const [draft, setDraft] = useState<DraftState>(emptyDraft);
  const [errors, setErrors] = useState<Partial<DraftState>>({});
  const [saving, setSaving] = useState(false);
  const [actingId, setActingId] = useState<number | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPayoutAccounts();
      setCompanyName(res.companyName);
      setAccounts(res.list);
    } catch {
      setCompanyName("");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const validate = () => {
    const e: Partial<DraftState> = {};
    if (!draft.accountNo.trim()) e.accountNo = t.vAccountNoRequired;
    if (!draft.bank.trim()) e.bank = t.vBankRequired;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const body = {
        id: editingAccount?.id,
        accountNo: draft.accountNo.trim(),
        bank: draft.bank.trim(),
        branch: draft.branch.trim() || undefined,
        isDefault: draft.isDefault,
      };
      if (mode === "edit") await updatePayoutAccount(body);
      else await addPayoutAccount(body);
      setMode("view");
      setEditingAccount(null);
      setSaveSuccess(true);
      window.setTimeout(() => setSaveSuccess(false), 3000);
      toast.success(mode === "edit" ? t.updateSuccess : t.addSuccess);
      await load();
    } catch {
      // http 已 toast
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (account: PayoutAccount) => {
    setEditingAccount(account);
    setDraft({
      accountNo: account.accountNo,
      bank: account.bank,
      branch: account.branch ?? "",
      isDefault: account.isDefault === 1,
    });
    setErrors({});
    setMode("edit");
  };

  const handleAdd = () => {
    setEditingAccount(null);
    setDraft({ ...emptyDraft, isDefault: accounts.length === 0 });
    setErrors({});
    setMode("add");
  };

  const handleDelete = async (id: number) => {
    setActingId(id);
    try {
      await deletePayoutAccount(id);
      toast.success(t.deleteSuccess);
      await load();
    } catch {
      // http 已 toast
    } finally {
      setActingId(null);
    }
  };

  const handleSetDefault = async (id: number) => {
    setActingId(id);
    try {
      await setDefaultPayoutAccount(id);
      toast.success(t.setDefaultSuccess);
      await load();
    } catch {
      // http 已 toast
    } finally {
      setActingId(null);
    }
  };

  const handleCancel = () => {
    setErrors({});
    setEditingAccount(null);
    setMode("view");
  };

  if (loading) {
    return (
      <div className="p-8">
        <PageLoading />
      </div>
    );
  }

  if (mode === "add" || mode === "edit") {
    return (
      <PaymentForm
        t={t}
        mode={mode}
        companyName={companyName || editingAccount?.companyName || ""}
        draft={draft}
        setDraft={setDraft}
        errors={errors}
        clearError={(k) => setErrors((p) => ({ ...p, [k]: "" }))}
        saving={saving}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title={t.title} subtitle={t.subtitle} />
        {accounts.length > 0 && (
          <button
            onClick={handleAdd}
            className="h-10 px-4 rounded-[12px] text-white text-sm hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
            style={{ background: "#111111", fontWeight: 600 }}
          >
            <Plus className="w-4 h-4" />
            {t.addNow}
          </button>
        )}
      </div>

      {accounts.length > 0 ? (
        <BoundView
          t={t}
          accounts={accounts}
          saveSuccess={saveSuccess}
          actingId={actingId}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSetDefault={handleSetDefault}
        />
      ) : (
        <EmptyView t={t} onAdd={handleAdd} />
      )}
    </div>
  );
}

function EmptyView({ t, onAdd }: { t: PaymentMsg; onAdd: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-[#f3f4f6] overflow-hidden min-h-[336px]">
      <div className="min-h-[336px] flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-[16px] bg-[#f3f4f6] flex items-center justify-center">
          <CreditCard className="w-7 h-7 text-[#d1d5dc]" />
        </div>
        <div className="text-center mt-5">
          <p className="text-sm text-[#364153] mb-1" style={{ fontWeight: 600 }}>
            {t.emptyTitle}
          </p>
          <p className="text-xs text-[#99a1af] max-w-[420px]" style={{ lineHeight: "19.5px" }}>
            {t.emptyDesc}
          </p>
        </div>

        <button
          onClick={onAdd}
          className="mt-7 h-10 px-6 rounded-[12px] text-white text-sm hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
          style={{ background: "#111111", fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          {t.addNow}
        </button>
      </div>
    </div>
  );
}

function maskAccount(no: string) {
  const clean = no.replace(/\s+/g, "");
  return clean.length > 8 ? `${clean.slice(0, 4)} **** **** ${clean.slice(-4)}` : clean;
}

function BoundView({
  t,
  accounts,
  saveSuccess,
  actingId,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  t: PaymentMsg;
  accounts: PayoutAccount[];
  saveSuccess: boolean;
  actingId: number | null;
  onEdit: (account: PayoutAccount) => void;
  onDelete: (id: number) => Promise<void>;
  onSetDefault: (id: number) => Promise<void>;
}) {
  return (
    <>
      <div className="grid gap-4 xl:grid-cols-2">
        {accounts.map((account) => {
          const isDefault = account.isDefault === 1;
          const busy = actingId === account.id;
          const rows = [
            { label: t.rowBank, val: account.bank || "—" },
            { label: t.rowBranch, val: account.branch || "—" },
          ];
          return (
            <div key={account.id} className="bg-white rounded-2xl border border-[#f3f4f6] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#f3f4f6]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-[14px] bg-[#f3f4f6] flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-[#6a7282]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm text-[#101828]" style={{ fontWeight: 700 }}>
                        {account.companyName || "—"}
                      </p>
                      {isDefault && (
                        <span className="px-1.5 py-0.5 rounded-md border border-[#fcd34d] bg-[#fffbeb] text-[10px] text-[#d97706]" style={{ fontWeight: 600 }}>
                          {t.defaultBadge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#99a1af] mt-0.5 font-mono">{maskAccount(account.accountNo)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {!isDefault && (
                    <IconButton
                      label={t.setDefault}
                      icon={busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
                      disabled={busy}
                      onClick={() => void onSetDefault(account.id)}
                    />
                  )}
                  <IconButton label={t.edit} icon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => onEdit(account)} />
                  <IconButton
                    label={t.delete}
                    icon={busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    disabled={busy}
                    onClick={() => void onDelete(account.id)}
                  />
                </div>
              </div>

              <div className="px-6 py-2">
                {rows.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-[#99a1af] w-24 flex-shrink-0">{item.label}</span>
                    <span className="text-sm text-[#1e2939] flex-1 text-right" style={{ fontWeight: 700 }}>
                      {item.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {saveSuccess && (
        <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-100">
          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span className="text-xs text-green-700" style={{ fontWeight: 500 }}>
            {t.savedTip}
          </span>
        </div>
      )}

      <div className="mt-4 px-4 py-3 rounded-xl bg-[#fffbeb] border border-[#fde68a] flex items-start gap-2.5">
        <Building2 className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">{t.notice}</p>
      </div>
    </>
  );
}

function IconButton({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="w-8 h-8 rounded-lg border border-[#e5e7eb] text-[#364153] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
    >
      {icon}
    </button>
  );
}

function PaymentForm({
  t,
  mode,
  companyName,
  draft,
  setDraft,
  errors,
  clearError,
  saving,
  onSave,
  onCancel,
}: {
  t: PaymentMsg;
  mode: "add" | "edit";
  companyName: string;
  draft: DraftState;
  setDraft: React.Dispatch<React.SetStateAction<DraftState>>;
  errors: Partial<DraftState>;
  clearError: (k: keyof DraftState) => void;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const inputCls = (err?: string) =>
    `w-full px-4 py-2.5 rounded-[10px] border text-sm outline-none transition-all ${
      err
        ? "border-red-400"
        : "border-[#e5e7eb] hover:border-gray-400 focus:border-[#111] focus:ring-1 focus:ring-[#111]"
    }`;

  return (
    <div className="p-8">
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <div className="bg-white rounded-2xl border border-[#f3f4f6] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f3f4f6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-[#f3f4f6] flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#6a7282]" />
            </div>
            <div>
              <p className="text-sm text-[#101828]" style={{ fontWeight: 600 }}>
                {mode === "add" ? t.addTitle : t.editTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#99a1af] hover:bg-gray-50"
            aria-label={t.cancel}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-[#364153] mb-2" style={{ fontWeight: 600 }}>
                {t.companyNameLabel}
                <span className="text-xs text-[#99a1af] ml-1.5" style={{ fontWeight: 400 }}>
                  {t.autoFilled}
                </span>
              </label>
              <input
                type="text"
                value={companyName}
                disabled
                className="w-full px-4 py-2.5 rounded-[10px] border border-[#f3f4f6] text-sm bg-[#f9fafb] text-[#364153] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm text-[#364153] mb-2" style={{ fontWeight: 600 }}>
                {t.accountNoLabel} <span className="text-[#fb2c36]">*</span>
              </label>
              <input
                type="text"
                value={draft.accountNo}
                onChange={(e) => {
                  setDraft((p) => ({ ...p, accountNo: e.target.value.replace(/\D/g, "") }));
                  clearError("accountNo");
                }}
                placeholder={t.accountNoPlaceholder}
                className={inputCls(errors.accountNo) + " font-mono"}
              />
              {errors.accountNo && <p className="text-xs text-red-500 mt-1">{errors.accountNo}</p>}
            </div>

            <div>
              <label className="block text-sm text-[#364153] mb-2" style={{ fontWeight: 600 }}>
                {t.bankLabel} <span className="text-[#fb2c36]">*</span>
              </label>
              <input
                type="text"
                value={draft.bank}
                onChange={(e) => {
                  setDraft((p) => ({ ...p, bank: e.target.value }));
                  clearError("bank");
                }}
                placeholder={t.bankPlaceholder}
                className={inputCls(errors.bank)}
              />
              {errors.bank && <p className="text-xs text-red-500 mt-1">{errors.bank}</p>}
            </div>

            <div>
              <label className="block text-sm text-[#364153] mb-2" style={{ fontWeight: 600 }}>
                {t.branchLabel}
                <span className="text-xs text-[#99a1af] ml-1.5" style={{ fontWeight: 400 }}>
                  {t.branchOptional}
                </span>
              </label>
              <input
                type="text"
                value={draft.branch}
                onChange={(e) => setDraft((p) => ({ ...p, branch: e.target.value }))}
                placeholder={t.branchPlaceholder}
                className={inputCls()}
              />
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-[#364153]">
              <input
                type="checkbox"
                checked={draft.isDefault}
                onChange={(e) => setDraft((p) => ({ ...p, isDefault: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              {t.setDefault}
            </label>
          </div>

          <div className="flex items-center gap-3 mt-8">
            <button
              onClick={onSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-[14px] text-white text-sm hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
              style={{ background: "#111111", fontWeight: 600 }}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "add" ? t.confirmAdd : t.confirmEdit}
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-2.5 rounded-[14px] border border-[#e5e7eb] text-[#364153] text-sm hover:bg-gray-50"
              style={{ fontWeight: 500 }}
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 px-4 py-3 rounded-xl bg-[#fffbeb] border border-[#fde68a] flex items-start gap-2.5">
        <Building2 className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">{t.notice}</p>
      </div>
    </div>
  );
}
