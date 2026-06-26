import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ChevronDown, Search, Building2, CalendarClock, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "../../i18n";
import { PageLoading } from "../components/settlement/PageHeader";
import { AccountTypeBadge, SettlementStatusBadge } from "../components/settlement/Badge";
import { EmptyState } from "../components/settlement/EmptyState";
import {
  getPayoutAccount,
  getSettlementRecords,
  applySettlement,
  type SettlementRecord,
} from "../../services/settlement";

type WithdrawMsg = ReturnType<typeof useI18n>["messages"]["distribution"]["withdraw"];

const yuan = (n: number) =>
  `¥ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type StatusFilter = "all" | "paid" | "unpaid";

/**
 * 结算记录 —— figma 15151-31580(暂无) / 15188-33359(列表) / 15152-31918(点击结算)。
 * 采用最完整的 15188-33359 版式：结算说明卡 + 明细表（含行内「申请结算」）。
 * 数据走 services/settlement.ts 的 mock + VITE_USE_MOCK 开关。
 */
export function WithdrawPage() {
  const { messages } = useI18n();
  const t = messages.distribution.withdraw;

  const [loading, setLoading] = useState(true);
  const [hasAccount, setHasAccount] = useState(false);
  const [records, setRecords] = useState<SettlementRecord[]>([]);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [statusOpen, setStatusOpen] = useState(false);
  const [search, setSearch] = useState("");
  const statusRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [acc, rows] = await Promise.all([getPayoutAccount(), getSettlementRecords()]);
      setHasAccount(!!acc);
      setRecords(rows);
    } catch {
      // http 已 toast
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const statusOptions: { key: StatusFilter; label: string }[] = [
    { key: "all", label: t.statusAll },
    { key: "paid", label: t.statusPaid },
    { key: "unpaid", label: t.statusUnpaid },
  ];
  const statusLabelMap: Record<StatusFilter, string> = {
    all: t.statusAll,
    paid: t.statusPaid,
    unpaid: t.statusUnpaid,
  };

  const filtered = useMemo(() => {
    if (!hasAccount) return [];
    return records
      .filter((r) => statusFilter === "all" || r.status === statusFilter)
      .filter((r) => !search || r.period.includes(search) || typeLabel(r.type, t).includes(search));
  }, [records, hasAccount, statusFilter, search, t]);

  const handleApply = async (rec: SettlementRecord) => {
    if (applyingId) return;
    setApplyingId(rec.id);
    try {
      await applySettlement(rec.id);
      // 乐观更新：申请后视为进入打款流程，标记为已打款（mock 演示）
      setRecords((prev) => prev.map((r) => (r.id === rec.id ? { ...r, status: "paid" } : r)));
      toast.success(t.applySuccess);
    } catch {
      // http 已 toast
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <PageLoading />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-5">
      {/* ── 结算说明 ── */}
      <div className="bg-white rounded-2xl border border-[#f3f4f6] p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CalendarClock className="w-[18px] h-[18px] text-gray-500" />
          </div>
          <div>
            <p className="text-sm text-[#101828] mb-1" style={{ fontWeight: 700 }}>
              {t.policyTitle}
            </p>
            <p className="text-xs text-[#6a7282] leading-relaxed max-w-xl">{t.policyDesc}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: "#05df72" }} />
              <span className="text-xs text-[#99a1af]">{t.payoutDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 结算记录 ── */}
      <div className="bg-white rounded-2xl border border-[#f3f4f6] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
          <h3 className="text-sm text-[#101828]" style={{ fontWeight: 700 }}>
            {t.recordsTitle}
          </h3>
          <div className="flex items-center gap-2">
            {/* 结算状态筛选 */}
            <div className="relative" ref={statusRef}>
              <button
                onClick={() => setStatusOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-xs text-[#364153] hover:bg-gray-50 transition-all"
                style={{ fontWeight: 500 }}
              >
                <span className="text-[#99a1af]">{t.statusFilter}</span>
                <span className="ml-1">{statusLabelMap[statusFilter]}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              {statusOpen && (
                <div className="absolute top-full right-0 mt-1 w-32 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-10 overflow-hidden">
                  {statusOptions.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => {
                        setStatusFilter(s.key);
                        setStatusOpen(false);
                      }}
                      className="w-full px-3 py-2.5 text-xs text-left text-[#364153] hover:bg-gray-50"
                      style={{ fontWeight: statusFilter === s.key ? 600 : 400 }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* 搜索 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-48 pl-9 pr-3 py-1.5 text-xs border border-[#e5e7eb] rounded-lg bg-white outline-none focus:border-gray-400 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 表格：结算日期 / 周期 / 比例 / 类型 / 账户类型 / 账户号码 / 金额 / 状态 / 操作 */}
        <div className="overflow-x-auto">
        <table className="w-full min-w-[880px]">
          <thead>
            <tr className="border-b border-[#f3f4f6] bg-gray-50/50">
              <Th>{t.colDate}</Th>
              <Th>{t.colPeriod}</Th>
              <Th>
                <span className="block leading-4">{t.colRatio}</span>
                <span className="block leading-4 text-[#bababa]">{t.colRatioSub}</span>
              </Th>
              <Th>{t.colType}</Th>
              <Th>{t.colAccountType}</Th>
              <Th>{t.colAccountNo}</Th>
              <Th>{t.colAmount}</Th>
              <Th>{t.colStatus}</Th>
              <Th>{t.colAction}</Th>
            </tr>
          </thead>
          {filtered.length > 0 && (
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-xs text-[#4a5565]">{row.date}</td>
                  <td className="px-5 py-3.5 text-xs text-[#4a5565]">{row.period}</td>
                  <td className="px-5 py-3.5 text-xs text-[#4a5565]">{row.ratio}</td>
                  <td className="px-5 py-3.5 text-xs text-[#4a5565]">{typeLabel(row.type, t)}</td>
                  <td className="px-5 py-3.5">
                    <AccountTypeBadge label={row.accountType === "cn" ? t.accountCn : t.accountOverseas} />
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#4a5565] font-mono">{row.accountNo}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-[#101828]" style={{ fontWeight: 700 }}>
                      {yuan(row.amount)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <SettlementStatusBadge
                      status={row.status}
                      label={row.status === "paid" ? t.statusPaid : t.statusUnpaid}
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleApply(row)}
                      disabled={row.status === "paid" || applyingId === row.id}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[14px] text-white text-xs transition-opacity disabled:cursor-not-allowed"
                      style={{
                        // 已打款禁用态：实心中灰填充（对齐 figma 15188-33359），而非半透明黑
                        background: row.status === "paid" ? "#9CA3AF" : "#111111",
                        fontWeight: 600,
                        opacity: applyingId === row.id ? 0.7 : 1,
                      }}
                    >
                      {applyingId === row.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      {t.applySettlement}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
        </div>

        {filtered.length === 0 && (
          <EmptyState
            className="py-16"
            icon={<Building2 className="w-6 h-6" />}
            title={t.emptyTitle}
            desc={!hasAccount ? t.emptyDesc : undefined}
          />
        )}
      </div>
    </div>
  );
}

function typeLabel(type: "full" | "account", t: WithdrawMsg) {
  return type === "full" ? t.typeFull : t.typeAccount;
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-left align-top">
      <span className="text-xs text-[#6a7282]" style={{ fontWeight: 500 }}>
        {children}
      </span>
    </th>
  );
}
