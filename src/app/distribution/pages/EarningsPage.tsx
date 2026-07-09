import { useState, useEffect, useCallback } from "react";
import { Search, Wallet, Clock, CheckCircle2, TrendingUp, Info, Film, ChevronLeft, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useI18n } from "../../i18n";
import { PageLoading } from "../components/settlement/PageHeader";
import { TypeBadge } from "../components/settlement/Badge";
import { EmptyState } from "../components/settlement/EmptyState";
import {
  getPayoutAccount,
  getEarningsSummary,
  getEarningsMonths,
  getEarningsDetail,
  getEarningsCoursesDropdown,
  type EarningsSummary,
  type EarningsDetailRow,
  type EarningsCourseOption,
} from "../../services/settlement";

const DETAIL_PAGE_SIZE = 10;

const usd = (n: number) =>
  `$ ${(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatViews = (n: number | null, locale: string) =>
  n === null ? "--" : new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(n);

function getDefaultMonth(months: string[]): string {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return months.includes(currentMonth) ? currentMonth : months[0] ?? "";
}

function monthDateRange(month: string): { startDate: string; endDate: string } {
  const [year, m] = month.split("-").map(Number);
  const lastDay = new Date(year, m, 0).getDate();
  return {
    startDate: `${month}-01`,
    endDate: `${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

function monthTabLabel(month: string, template: string): string {
  return template.replace("{n}", String(Number(month.slice(5, 7))));
}

/** 结算状态徽标：0待结算灰 / 1结算中蓝 / 2已结算绿。 */
function SettleStatusBadge({ status, label }: { status: 0 | 1 | 2; label: string }) {
  const map = {
    0: { background: "#F9FAFB", color: "#6B7280" },
    1: { background: "#EFF6FF", color: "#3b82f6" },
    2: { background: "#F0FDF4", color: "#16a34a" },
  } as const;
  const style = map[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs w-fit whitespace-nowrap"
      style={{ ...style, fontWeight: 500 }}
    >
      {label}
    </span>
  );
}

/**
 * 收益明细 —— 对接 /publisher/settlement/overview、/earnings、/courses。
 * 是否有收款账户决定展示数据态还是暂无态（同原型 hasPaymentAccount）。
 */
export function EarningsPage() {
  const { messages, locale } = useI18n();
  const t = messages.distribution.earnings;
  const allLabel = messages.distribution.withdraw.statusAll;

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [detail, setDetail] = useState<EarningsDetailRow[]>([]);
  const [detailTotal, setDetailTotal] = useState(0);
  const [courses, setCourses] = useState<EarningsCourseOption[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [activeMonth, setActiveMonth] = useState<string>("");
  const [courseFilter, setCourseFilter] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const [acc, sum, courseOptions, availableMonths] = await Promise.all([
        getPayoutAccount(),
        getEarningsSummary(),
        getEarningsCoursesDropdown(),
        getEarningsMonths(),
      ]);
      setHasAccount(acc.bound);
      setSummary(sum);
      setCourses(courseOptions);
      setMonths(availableMonths);
      setActiveMonth((prev) => (availableMonths.includes(prev) ? prev : getDefaultMonth(availableMonths)));
    } catch {
      // http 已 toast
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  // 搜索框 300ms 防抖
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  // 搜索防抖后重置页码
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const loadDetail = useCallback(async () => {
    if (!hasAccount || !activeMonth) return;
    setDetailLoading(true);
    try {
      const { startDate, endDate } = monthDateRange(activeMonth);
      const res = await getEarningsDetail({
        page,
        limit: DETAIL_PAGE_SIZE,
        startDate,
        endDate,
        courseId: courseFilter === "all" ? undefined : courseFilter,
        keyword: debouncedSearch.trim() || undefined,
      });
      setDetail(res.list);
      setDetailTotal(res.totalCount);
    } catch {
      // http 已 toast
    } finally {
      setDetailLoading(false);
    }
  }, [hasAccount, activeMonth, page, courseFilter, debouncedSearch]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const totalPage = Math.max(1, Math.ceil(detailTotal / DETAIL_PAGE_SIZE));

  if (loading) {
    return (
      <div className="p-8">
        <PageLoading />
      </div>
    );
  }

  const typeLabel = (scope: EarningsDetailRow["publishScope"]) => (scope === 2 ? t.typeFull : t.typeAccount);
  const typeValue = (scope: EarningsDetailRow["publishScope"]) => (scope === 2 ? "full" : "account");
  const growthText = summary?.growthRate === null ? "--" : t.growthVsLastMonth.replace("{rate}", String(summary?.growthRate ?? 0));

  const settleStatusLabel = (status: EarningsDetailRow["settleStatus"]) => {
    if (status === 2) return t.statusSettled;
    if (status === 1) return t.statusProcessing;
    return t.statusPending;
  };

  const chartData = (summary?.monthlyTrend ?? []).map((m) => ({
    label: t.monthLabel.replace("{n}", String(Number(m.month.slice(5, 7)))),
    total: hasAccount ? m.amountUsd : 0,
  }));

  const tableCols = [
    t.colDate,
    t.colDramaId,
    t.colDrama,
    t.colType,
    t.colShare,
    t.colOrders,
    t.colViewCount,
    t.colSettleStatus,
    t.colAmount,
  ];

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
                letterSpacing: 0,
                color: hasAccount ? "#101828" : "#D1D5DB",
              }}
            >
              {usd(hasAccount ? summary?.totalCumulativeUsd ?? 0 : 0)}
            </p>
            {hasAccount && summary && (
              <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                {growthText}
              </div>
            )}
          </div>

          <div className="w-px h-12 bg-gray-100 flex-shrink-0" />

          <div className="flex flex-wrap gap-8">
            {[
              { icon: <Wallet className="w-4 h-4" />, label: t.withdrawable, val: summary?.withdrawableUsd ?? 0 },
              { icon: <Clock className="w-4 h-4" />, label: t.processing, val: summary?.processingUsd ?? 0 },
              { icon: <CheckCircle2 className="w-4 h-4" />, label: t.withdrawn, val: summary?.withdrawnUsd ?? 0 },
              { icon: <Info className="w-4 h-4" />, label: t.pending, val: summary?.pendingUsd ?? 0 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm mt-0.5" style={{ fontWeight: 700, color: hasAccount ? "#101828" : "#D1D5DB" }}>
                    {usd(hasAccount ? item.val : 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-4">
            {[
              { label: t.relatedDramas, val: hasAccount ? String(summary?.relatedDramas ?? 0) : "0", accent: false },
              { label: t.settlementBills, val: hasAccount ? String(summary?.settlementBillCount ?? 0) : "0", accent: false },
              { label: t.yesterday, val: usd(hasAccount ? summary?.yesterdayUsd ?? 0 : 0), accent: false },
              { label: t.estThisMonth, val: usd(hasAccount ? summary?.estThisMonthUsd ?? 0 : 0), accent: true },
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

        {/* 月度收益趋势（后端固定返回本年 12 月） */}
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
                  formatter={(v: number) => [usd(v), t.chartEarnings]}
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
                  onClick={() => {
                    setActiveMonth(m);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{
                    background: activeMonth === m ? "white" : "transparent",
                    color: activeMonth === m ? "#101828" : "#9CA3AF",
                    fontWeight: activeMonth === m ? 600 : 400,
                    boxShadow: activeMonth === m ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {monthTabLabel(m, t.monthLabel)}
                </button>
              ))}
            </div>
          )}
        </div>

        {hasAccount ? (
          <>
            <div className="flex items-center gap-3 px-5 py-3 border-b border-[#f3f4f6] bg-gray-50/30">
              <select
                value={courseFilter}
                onChange={(e) => {
                  setCourseFilter(e.target.value === "all" ? "all" : Number(e.target.value));
                  setPage(1);
                }}
                className="h-9 px-3 text-xs border border-[#e5e7eb] rounded-lg bg-white outline-none focus:border-gray-400 transition-colors"
                aria-label={t.colDrama}
              >
                <option value="all">{allLabel}</option>
                {courses.map((course) => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.courseTitle}
                  </option>
                ))}
              </select>
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
            <div className="overflow-x-auto">
              <div className="min-w-[1120px]">
                <div className="grid grid-cols-[110px_90px_minmax(220px,1fr)_150px_90px_80px_100px_100px_130px] px-5 py-2.5 bg-gray-50/60 border-b border-[#f3f4f6]">
                  {tableCols.map((col, i) => (
                    <span key={i} className="text-xs text-[#6a7282] whitespace-nowrap" style={{ fontWeight: 500 }}>
                      {col}
                    </span>
                  ))}
                </div>

                <div className="divide-y divide-gray-50">
                  {detailLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <PageLoading />
                    </div>
                  ) : (
                    <>
                      {detail.map((row) => (
                        <div
                          key={`${row.courseId}-${row.earnDate}`}
                          className="grid grid-cols-[110px_90px_minmax(220px,1fr)_150px_90px_80px_100px_100px_130px] px-5 py-3.5 items-center hover:bg-gray-50/50 transition-colors"
                        >
                          <span className="text-xs text-gray-500 whitespace-nowrap">{row.earnDate}</span>
                          <span className="text-xs text-gray-500 whitespace-nowrap tabular-nums">{row.courseId}</span>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-9 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                              {row.courseImg ? (
                                <img src={row.courseImg} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Film className="w-3.5 h-3.5 text-gray-300" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-[#101828] truncate" title={row.courseTitle} style={{ fontWeight: 600 }}>
                                {row.courseTitle}
                              </p>
                            </div>
                          </div>
                          <div>
                            <TypeBadge type={typeValue(row.publishScope)} label={typeLabel(row.publishScope)} />
                          </div>
                          <span className="text-sm text-gray-700 whitespace-nowrap" style={{ fontWeight: 600 }}>
                            {row.ratioLabel ?? "--"}
                          </span>
                          <span className="text-xs text-gray-600 whitespace-nowrap">{row.orderCount}</span>
                          <span className="text-xs text-gray-600 whitespace-nowrap tabular-nums">
                            {formatViews(row.dailyViewCount, locale)}
                          </span>
                          <div>
                            <SettleStatusBadge
                              status={row.settleStatus}
                              label={settleStatusLabel(row.settleStatus)}
                            />
                          </div>
                          <span className="text-sm text-[#101828] whitespace-nowrap" style={{ fontWeight: 700 }}>
                            {usd(row.creatorUsd)}
                          </span>
                        </div>
                      ))}
                      {detail.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                          <Wallet className="w-7 h-7 text-gray-200" />
                          <p className="text-sm text-gray-400">{t.emptyMonth}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 分页（样式参照 ContentPage / DramaListView） */}
            {!detailLoading && totalPage > 1 && (
              <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 tabular-nums">
                  {page} / {totalPage}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPage}
                  className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
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
