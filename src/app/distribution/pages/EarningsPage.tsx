import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Wallet, Clock, CheckCircle2, TrendingUp, Info, Film } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useI18n } from "../../i18n";
import { PageLoading } from "../components/settlement/PageHeader";
import { TypeBadge, EarningsStatusBadge } from "../components/settlement/Badge";
import { EmptyState } from "../components/settlement/EmptyState";
import {
  getPayoutAccount,
  getEarningsSummary,
  getEarningsDetail,
  type EarningsSummary,
  type EarningsDetailRow,
} from "../../services/settlement";

const yuan = (n: number) =>
  `¥ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * 收益明细 —— figma 15151-31377(暂无) / 15135-27153(列表)。
 * 数据走 services/settlement.ts 的 mock + VITE_USE_MOCK 开关。
 * 是否有收款账户决定展示数据态还是暂无态（同原型 hasPaymentAccount）。
 */
export function EarningsPage() {
  const { messages } = useI18n();
  const t = messages.distribution.earnings;

  const [loading, setLoading] = useState(true);
  const [hasAccount, setHasAccount] = useState(false);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [detail, setDetail] = useState<EarningsDetailRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [acc, sum, rows] = await Promise.all([
        getPayoutAccount(),
        getEarningsSummary(),
        getEarningsDetail(),
      ]);
      setHasAccount(!!acc);
      setSummary(sum);
      setDetail(rows);
    } catch {
      // http 已 toast
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // 月份 Tab：由全部明细派生，降序
  const months = useMemo(
    () => [...new Set(detail.map((d) => d.month))].sort().reverse(),
    [detail],
  );
  const [activeMonth, setActiveMonth] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (months.length && !months.includes(activeMonth)) setActiveMonth(months[0]);
  }, [months, activeMonth]);

  const monthRows = useMemo(
    () =>
      detail
        .filter((r) => r.month === activeMonth)
        .filter((r) => !search || r.drama.includes(search)),
    [detail, activeMonth, search],
  );

  if (loading) {
    return (
      <div className="p-8">
        <PageLoading />
      </div>
    );
  }

  const typeLabel = (type: "full" | "account") => (type === "full" ? t.typeFull : t.typeAccount);
  const statusLabel = (s: EarningsDetailRow["status"]) =>
    s === "settled" ? t.statusSettled : s === "processing" ? t.statusProcessing : t.statusPending;

  const chartData = (summary?.monthlyTrend ?? []).map((m) => ({
    label: `${m.month}月`,
    total: hasAccount ? m.total : 0,
  }));

  return (
    <div className="p-8 space-y-5">
      {/* ── 收益总览 ── */}
      <div className="bg-white rounded-2xl border border-[#f3f4f6] p-6">
        <div className="mb-5">
          <h2 className="text-[#101828]" style={{ fontWeight: 700, fontSize: "0.9375rem" }}>
            {t.overviewTitle}
          </h2>
          <p className="text-xs text-[#99a1af] mt-0.5">{t.overviewSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-8 mb-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">{t.totalCumulative}</p>
            <p
              style={{
                fontWeight: 800,
                fontSize: "2.25rem",
                letterSpacing: "-0.04em",
                color: hasAccount ? "#101828" : "#D1D5DB",
              }}
            >
              {yuan(hasAccount ? summary?.totalCumulative ?? 0 : 0)}
            </p>
            {hasAccount && summary && (
              <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                {t.growthVsLastMonth.replace("{rate}", String(summary.growthRate))}
              </div>
            )}
          </div>

          <div className="w-px h-12 bg-gray-100 flex-shrink-0" />

          <div className="flex flex-wrap gap-8">
            {[
              { icon: <Wallet className="w-4 h-4" />, label: t.withdrawable, val: summary?.withdrawable ?? 0 },
              { icon: <Clock className="w-4 h-4" />, label: t.processing, val: summary?.processing ?? 0 },
              { icon: <CheckCircle2 className="w-4 h-4" />, label: t.withdrawn, val: summary?.withdrawn ?? 0 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm mt-0.5" style={{ fontWeight: 700, color: hasAccount ? "#101828" : "#D1D5DB" }}>
                    {yuan(hasAccount ? item.val : 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-4">
            {[
              { label: t.relatedDramas, val: hasAccount ? String(summary?.relatedDramas ?? 0) : "0", accent: false },
              { label: t.estThisMonth, val: yuan(hasAccount ? summary?.estThisMonth ?? 0 : 0), accent: false },
              { label: t.bills, val: hasAccount ? String(summary?.bills ?? 0) : "0", accent: true },
            ].map((item, i) => (
              <div key={i} className="text-center px-4 py-2 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                <p
                  className="text-sm"
                  style={{
                    fontWeight: 700,
                    color: hasAccount ? (item.accent ? "#e8192c" : "#101828") : "#D1D5DB",
                  }}
                >
                  {item.val}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 月度收益趋势 */}
        <div>
          <p className="text-xs text-gray-500 mb-3" style={{ fontWeight: 500 }}>
            {t.monthlyTrend}
          </p>
          <div className="h-44">
            <ResponsiveContainer key={`earnings-bar-${hasAccount}`} width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "12px" }}
                  formatter={(v: number) => [yuan(v), t.chartEarnings]}
                />
                <Bar dataKey="total" name={t.chartEarnings} fill="#111111" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── 收益详情 ── */}
      <div className="bg-white rounded-2xl border border-[#f3f4f6] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
          <h3 className="text-sm text-[#101828]" style={{ fontWeight: 700 }}>
            {t.detailTitle}
          </h3>
          {hasAccount && months.length > 0 && (
            <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 flex-wrap">
              {months.map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveMonth(m)}
                  className="px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{
                    background: activeMonth === m ? "white" : "transparent",
                    color: activeMonth === m ? "#101828" : "#9CA3AF",
                    fontWeight: activeMonth === m ? 600 : 400,
                    boxShadow: activeMonth === m ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        {hasAccount ? (
          <>
            <div className="flex items-center gap-3 px-5 py-3 border-b border-[#f3f4f6] bg-gray-50/30">
              <div className="relative max-w-xs flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#e5e7eb] rounded-lg bg-white outline-none focus:border-gray-400 transition-colors"
                />
              </div>
              <div className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                {t.updatedDaily}
              </div>
            </div>

            {/* 表头 */}
            <div className="grid grid-cols-[1fr_160px_80px_100px_120px_100px] px-5 py-2.5 bg-gray-50/60 border-b border-[#f3f4f6]">
              {[t.colDrama, t.colType, t.colShare, t.colViews, t.colAmount, t.colStatus].map((col, i) => (
                <span key={i} className="text-xs text-[#6a7282]" style={{ fontWeight: 500 }}>
                  {col}
                </span>
              ))}
            </div>

            <div className="divide-y divide-gray-50">
              {monthRows.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_160px_80px_100px_120px_100px] px-5 py-3.5 items-center hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Film className="w-3.5 h-3.5 text-gray-300" />
                    </div>
                    <span className="text-sm text-[#101828] truncate" style={{ fontWeight: 600 }}>
                      {row.drama}
                    </span>
                  </div>
                  <div>
                    <TypeBadge type={row.type} label={typeLabel(row.type)} />
                  </div>
                  <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>
                    {row.ratio}
                  </span>
                  <span className="text-xs text-gray-600">{row.views}</span>
                  <span className="text-sm text-[#101828]" style={{ fontWeight: 700 }}>
                    {yuan(row.amount)}
                  </span>
                  <EarningsStatusBadge status={row.status} label={statusLabel(row.status)} />
                </div>
              ))}
              {monthRows.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Wallet className="w-7 h-7 text-gray-200" />
                  <p className="text-sm text-gray-400">{t.emptyMonth}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <EmptyState
            className="py-16"
            icon={<Wallet className="w-7 h-7" />}
            title={t.emptyTitle}
            desc={t.emptyDesc}
          />
        )}
      </div>
    </div>
  );
}
