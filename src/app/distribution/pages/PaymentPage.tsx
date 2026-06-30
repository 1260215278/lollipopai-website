import { useState, useEffect, useCallback } from "react";
import { Building2, Check, CreditCard, Edit2, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "../../i18n";
import { PageHeader, PageLoading } from "../components/settlement/PageHeader";
import {
  getPayoutAccount,
  addPayoutAccount,
  updatePayoutAccount,
  type PayoutAccount,
} from "../../services/settlement";

type PaymentMsg = ReturnType<typeof useI18n>["messages"]["distribution"]["payment"];

interface DraftState {
  accountNo: string;
  bank: string;
  branch: string;
  accountHolder: string;
  companyName: string;
}

const emptyDraft: DraftState = { accountNo: "", bank: "", branch: "", accountHolder: "", companyName: "" };

/**
 * 收款管理 —— figma 15150-30625(空) / 30744(添加) / 30884(完成) / 31032(编辑)。
 * 收款账户走真实接口 /publisher/payout/account（bug21，不再 mock）。
 */
export function PaymentPage() {
  const { messages } = useI18n();
  const t = messages.distribution.payment;

  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "add" | "edit">("view");
  const [account, setAccount] = useState<PayoutAccount | null>(null);
  const [draft, setDraft] = useState<DraftState>(emptyDraft);
  const [errors, setErrors] = useState<Partial<DraftState>>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const acc = await getPayoutAccount();
      setAccount(acc);
    } catch {
      // http 已 toast；保持空态
      setAccount(null);
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
    const isEdit = mode === "edit";
    try {
      const body = {
        accountNo: draft.accountNo.trim(),
        bank: draft.bank.trim(),
        branch: draft.branch.trim() || undefined,
        accountHolder: draft.accountHolder.trim() || undefined,
        companyName: draft.companyName.trim() || undefined,
        currency: "USD",
      };
      const saved = isEdit ? await updatePayoutAccount(body) : await addPayoutAccount(body);
      setAccount(saved);
      setMode("view");
      setSaveSuccess(true);
      window.setTimeout(() => setSaveSuccess(false), 3000);
      toast.success(isEdit ? t.updateSuccess : t.addSuccess);
    } catch {
      // http 已 toast
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    if (account)
      setDraft({
        accountNo: account.accountNo,
        bank: account.bank,
        branch: account.branch ?? "",
        accountHolder: account.accountHolder ?? "",
        companyName: account.companyName ?? "",
      });
    setErrors({});
    setMode("edit");
  };

  const handleAdd = () => {
    setDraft(emptyDraft);
    setErrors({});
    setMode("add");
  };

  const handleCancel = () => {
    setErrors({});
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

  // ── 查看：空态（满宽卡，figma 15150-30625） vs 已绑定（窄卡，figma 15150-30884） ──
  return (
    <div className="p-8">
      <PageHeader title={t.title} subtitle={t.subtitle} />
      {account ? (
        <div className="max-w-2xl">
          <BoundView t={t} account={account} saveSuccess={saveSuccess} onEdit={handleEdit} />
        </div>
      ) : (
        <EmptyView t={t} onAdd={handleAdd} />
      )}
    </div>
  );
}

/* ── 空态（尚未添加） figma 15150-30625 ─────────────────────── */
function EmptyView({ t, onAdd }: { t: PaymentMsg; onAdd: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-[#f3f4f6] overflow-hidden">
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
          <CreditCard className="w-7 h-7 text-gray-300" />
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-700 mb-1" style={{ fontWeight: 600 }}>
            {t.emptyTitle}
          </p>
          <p className="text-xs text-gray-400 max-w-xs leading-relaxed">{t.emptyDesc}</p>
        </div>

        <div className="mt-2 bg-white rounded-2xl border border-[#f3f4f6] p-5 w-full max-w-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center flex-shrink-0 mt-0.5">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#101828]" style={{ fontWeight: 700 }}>
                {t.addCardTitle}
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t.addCardDesc}</p>
            </div>
          </div>
          <button
            onClick={onAdd}
            className="mt-4 w-full py-2.5 rounded-xl text-white text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            style={{ background: "#111111", fontWeight: 600 }}
          >
            <ArrowRight className="w-4 h-4" />
            {t.addNow}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 已绑定查看 figma 15150-30884 ───────────────────────────── */
function maskAccount(no: string) {
  return no.length > 8 ? `${no.slice(0, 4)} **** **** ${no.slice(-4)}` : no;
}

function BoundView({
  t,
  account,
  saveSuccess,
  onEdit,
}: {
  t: PaymentMsg;
  account: PayoutAccount;
  saveSuccess: boolean;
  onEdit: () => void;
}) {
  const rows = [
    { label: t.rowCompany, val: account.companyName || "—" },
    ...(account.accountHolder ? [{ label: t.accountHolderLabel, val: account.accountHolder }] : []),
    { label: t.rowAccountNo, val: maskAccount(account.accountNo), mono: true },
    { label: t.rowBank, val: account.bank },
    { label: t.rowBranch, val: account.branch || "—" },
  ];
  return (
    <>
      <div className="bg-white rounded-2xl border border-[#f3f4f6] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f3f4f6]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-sm text-[#101828]" style={{ fontWeight: 600 }}>
                {t.accountCardTitle}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Check className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600" style={{ fontWeight: 500 }}>
                  {t.bound}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#e5e7eb] text-xs text-gray-600 hover:bg-gray-50 transition-colors"
            style={{ fontWeight: 500 }}
          >
            <Edit2 className="w-3.5 h-3.5" />
            {t.edit}
          </button>
        </div>

        <div className="px-6 py-2">
          {rows.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <span className="text-xs text-gray-500 w-24 flex-shrink-0">{item.label}</span>
              <span
                className={`text-sm text-gray-800 flex-1 text-right ${item.mono ? "font-mono" : ""}`}
                style={{ fontWeight: 500 }}
              >
                {item.val}
              </span>
            </div>
          ))}
        </div>

        {saveSuccess && (
          <div className="mx-6 mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-100">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-xs text-green-700" style={{ fontWeight: 500 }}>
              {t.savedTip}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2.5">
        <Building2 className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">{t.notice}</p>
      </div>
    </>
  );
}

/* ── 添加 / 编辑表单 figma 15150-30744 / 31032 ──────────────── */
function PaymentForm({
  t,
  mode,
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
      <button
        onClick={onCancel}
        className="text-xs text-[#6a7282] hover:text-gray-700 flex items-center gap-1 mb-4"
        style={{ fontWeight: 500 }}
      >
        ← {t.back}
      </button>
      <h2 className="text-[#101828] mb-5" style={{ fontWeight: 700, fontSize: "0.9375rem" }}>
        {mode === "add" ? t.addTitle : t.editTitle}
      </h2>

      <div className="bg-white rounded-2xl border border-[#f3f4f6] p-8 flex flex-col items-center justify-center min-h-[480px]">
        <div className="w-full max-w-md">
          {/* 卡片标题 */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-[14px] bg-[#f3f4f6] flex items-center justify-center">
              <Building2 className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-sm text-[#101828]" style={{ fontWeight: 600 }}>
                {t.formCardTitle}
              </p>
              <p className="text-xs text-[#99a1af] mt-0.5">{t.formCardDesc}</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* 公司名称（选填） */}
            <div>
              <label className="block text-sm text-[#364153] mb-2" style={{ fontWeight: 600 }}>
                {t.companyNameLabel}
                <span className="text-xs text-[#99a1af] ml-1.5" style={{ fontWeight: 400 }}>
                  {t.branchOptional}
                </span>
              </label>
              <input
                type="text"
                value={draft.companyName}
                onChange={(e) => setDraft((p) => ({ ...p, companyName: e.target.value }))}
                placeholder={t.companyNamePlaceholder}
                className={inputCls()}
              />
            </div>

            {/* 银行账号 */}
            <div>
              <label className="block text-sm text-[#364153] mb-2" style={{ fontWeight: 600 }}>
                {t.accountNoLabel} <span className="text-[#fb2c36]">*</span>
              </label>
              <input
                type="text"
                value={draft.accountNo}
                onChange={(e) => {
                  setDraft((p) => ({ ...p, accountNo: e.target.value }));
                  clearError("accountNo");
                }}
                placeholder={t.accountNoPlaceholder}
                className={inputCls(errors.accountNo) + " font-mono"}
              />
              {errors.accountNo && <p className="text-xs text-red-500 mt-1">{errors.accountNo}</p>}
            </div>

            {/* 开户银行 */}
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

            {/* 支行名称（选填） */}
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

            {/* 户名（选填） */}
            <div>
              <label className="block text-sm text-[#364153] mb-2" style={{ fontWeight: 600 }}>
                {t.accountHolderLabel}
                <span className="text-xs text-[#99a1af] ml-1.5" style={{ fontWeight: 400 }}>
                  {t.branchOptional}
                </span>
              </label>
              <input
                type="text"
                value={draft.accountHolder}
                onChange={(e) => setDraft((p) => ({ ...p, accountHolder: e.target.value }))}
                placeholder={t.accountHolderPlaceholder}
                className={inputCls()}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8">
            <button
              onClick={onSave}
              disabled={saving}
              className="px-8 py-2.5 rounded-[14px] text-white text-sm hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
              style={{ background: "#111111", fontWeight: 600 }}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {t.confirm}
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
    </div>
  );
}
