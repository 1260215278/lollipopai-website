import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ChevronDown, Search, Building2, CalendarClock, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "../../i18n";
import { PageLoading } from "../components/settlement/PageHeader";
import { EmptyState } from "../components/settlement/EmptyState";
import {
  getPayoutAccount,
  getSettlementRecords,
  applySettlement,
  type SettlementRecord,
} from "../../services/settlement";

type WithdrawMsg = ReturnType<typeof useI18n>["messages"]["distribution"]["withdraw"];

const usd = (n: number) =>
  `$ ${(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** 状态筛选：'all' 或具体状态 0-4 */
type StatusFilter = "all" | 0 | 1 | 2 | 3 | 4;

/**
 * 结算记录 —— 对接 /publisher/settlement/records（bug22）。
 * 结算说明卡 + 结算单表（草稿可「申请结算」）。金额单位 USD。
 */
export function WithdrawPage() {
  const { messages } = useI18n();
  const t = messages.distribution.withdraw;

  const [loading, setLoading] = useState(true);
  const [hasAccount, setHasAccount] = useState(false);
  const [records, setRecords] = useState<SettlementRecord[]>([]);
  const [applyingId, setApplyingId] = useState<number | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [statusOpen, setStatusOpen] = useState(false);
  const [search, setSearch] = useState("");
  const statusRef = useRef<HTMLDivElement>(null);

  const statusText = useCallback(
    (s: number) =>
      s === 0
        ? t.statusDraft
        : s === 1
          ? t.statusApplied
          : s === 2
            ? t.statusApproved
            : s === 3
              ? t.statusPaid
              : t.statusRejected,
    [t],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [acc, page] = await Promise.all([getPayoutAccount(), getSettlementRecords({ page: 1, limit: 50 })]);
      setHasAccount(!!acc);
      setRecords(page.list);
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
    { key: 0, label: t.statusDraft },
    { key: 1, label: t.statusApplied },
    { key: 2, label: t.statusApproved },
    { key: 3, label: t.statusPaid },
    { key: 4, label: t.statusRejected },
  ];
  const statusFilterLabel = statusFilter === "all" ? t.statusAll : statusText(statusFilter);

  const filtered = useMemo(() => {
    return records
      .filter((r) => statusFilter === "all" || r.status === statusFilter)
      .filter(
        (r) =>
          !search ||
          r.periodStart?.includes(search) ||
          r.periodEnd?.includes(search) ||
          r.ratioLabel?.includes(search),
      );
  }, [records, statusFilter, search]);

  const handleApply = async (rec: SettlementRecord) => {
    if (applyingId) return;
    setApplyingId(rec.id);
    try {
      const updated = await applySettlement(rec.id);
      // 用后端返回的新状态更新该行
      setRecords((prev) => prev.map((r) => (r.id === rec.id ? { ...r, ...updated } : r)));
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
                <span className="ml-1">{statusFilterLabel}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              {statusOpen && (
                <div className="absolute top-full right-0 mt-1 w-32 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-10 overflow-hidden">
                  {statusOptions.map((s) => (
                    <button
                      key={String(s.key)}
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

        {/* 表格：周期 / 比例 / 总额 / 出品方实得 / 平台分成 / 状态 / 操作 */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px]">
            <thead>
              <tr className="border-b border-[#f3f4f6] bg-gray-50/50">
                <Th>{t.colPeriod}</Th>
                <Th>
                  <span className="block leading-4">{t.colRatio}</span>
                  <span className="block leading-4 text-[#bababa]">{t.colRatioSub}</span>
                </Th>
                <Th>{t.colGross}</Th>
                <Th>{t.colCreator}</Th>
                <Th>{t.colPlatform}</Th>
                <Th>{t.colStatus}</Th>
                <Th>{t.colAction}</Th>
              </tr>
            </thead>
            {filtered.length > 0 && (
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-xs text-[#4a5565]">
                      {row.periodStart} ~ {row.periodEnd}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#4a5565]">{row.ratioLabel}</td>
                    <td className="px-5 py-3.5 text-xs text-[#4a5565]">{usd(row.grossUsd)}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-[#101828]" style={{ fontWeight: 700 }}>
                        {usd(row.creatorUsd)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#4a5565]">{usd(row.platformUsd)}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={row.status} label={statusText(row.status)} />
                    </td>
                    <td className="px-5 py-3.5">
                      {row.status === 0 ? (
                        <button
                          onClick={() => handleApply(row)}
                          disabled={applyingId === row.id}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[14px] text-white text-xs transition-opacity disabled:cursor-not-allowed"
                          style={{ background: "#111111", fontWeight: 600, opacity: applyingId === row.id ? 0.7 : 1 }}
                        >
                          {applyingId === row.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          {t.applySettlement}
                        </button>
                      ) : (
                        <span className="text-xs text-[#9ca3af]">—</span>
                      )}
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

/** 结算单状态徽章（0草稿 灰 / 1已申请 橙 / 2审核通过 蓝 / 3已打款 绿 / 4驳回 红）。 */
function StatusBadge({ status, label }: { status: number; label: string }) {
  const map: Record<number, { background: string; color: string }> = {
    0: { background: "#F9FAFB", color: "#6B7280" },
    1: { background: "#FFF7ED", color: "#ea580c" },
    2: { background: "#EFF6FF", color: "#3b82f6" },
    3: { background: "#F0FDF4", color: "#16a34a" },
    4: { background: "#FEF2F2", color: "#dc2626" },
  };
  const style = map[status] ?? map[0];
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs w-fit whitespace-nowrap"
      style={{ ...style, fontWeight: 500 }}
    >
      {label}
    </span>
  );
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
