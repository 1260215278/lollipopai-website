import { useState, useEffect, useCallback } from "react";
import { Search, Wallet, Clock, CheckCircle2, TrendingUp, Info, Film, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Crown, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useI18n } from "../../i18n";
import { PageLoading } from "../components/settlement/PageHeader";
import { TypeBadge } from "../components/settlement/Badge";
import {
  getEarningsSummary,
  getEarningsMonths,
  getEarningsDetail,
  getEarningsCoursesDropdown,
  getVipPoolMonths,
  getVipPoolCourses,
  getVipPoolCurrent,
  type EarningsSummary,
  type EarningsDetailRow,
  type EarningsCourseOption,
  type VipPoolMonthRow,
  type VipPoolCourseRow,
  type VipPoolCurrent,
} from "../../services/settlement";

const DETAIL_PAGE_SIZE = 10;

const usd = (n: number) =>
  `$ ${(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const optionalUsd = (n?: number | null) => (n == null ? "--" : usd(n));

const formatViews = (n: number | null, locale: string) =>
  n === null ? "--" : new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(n);

/** 有效播放秒数 → "{h}小时{m}分"（模板来自 i18n durationHm）。 */
function formatDuration(seconds: number | null | undefined, template: string): string {
  const total = Math.max(0, Math.floor(seconds ?? 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return template.replace("{h}", String(h)).replace("{m}", String(m));
}

/** 百分比（后端已是百分数），空值 "--"。 */
const formatPct = (n: number | null | undefined) => (n == null ? "--" : `${Number(n).toFixed(2)}%`);

/** 环比：带正号，首月无对比为 "--"。 */
const formatMom = (n: number | null | undefined) => (n == null ? "--" : `${Number(n) > 0 ? "+" : ""}${Number(n).toFixed(1)}%`);

/** 剧方分成比例（creatorRatio）归一成 0–100 百分数：≤1 视为小数比例，否则已是百分数。 */
const creatorPct = (ratio: number | null | undefined) => {
  if (ratio == null) return null;
  return Number(ratio) <= 1 ? Number(ratio) * 100 : Number(ratio);
};

/** 分成比例列：剧方所得百分比，如 "72%"。 */
const shareRatioLabel = (ratio: number | null | undefined) => {
  const pct = creatorPct(ratio);
  return pct == null ? "--" : `${Math.round(pct * 100) / 100}%`;
};

/**
 * 收益类型标签里的「平台:剧方」比例，与剧相关 tab / 结算单的 ratioLabel 同一规则
 * （后端 ratioLabelOf）：两边都是 10 的倍数时按十份显示 "4:6"，否则原样 "28:72"。
 */
const platformCreatorLabel = (ratio: number | null | undefined) => {
  const pct = creatorPct(ratio);
  if (pct == null) return "";
  const creator = Math.round(pct);
  const platform = 100 - creator;
  return platform % 10 === 0 && creator % 10 === 0 ? `${platform / 10}:${creator / 10}` : `${platform}:${creator}`;
};

/** 当前日历年月（yyyy-MM）。 */
function currentCalendarMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** 默认选中月：优先本月；否则取有收益的最新月；再否则本月。 */
function getDefaultMonth(months: string[]): string {
  const currentMonth = currentCalendarMonth();
  if (months.includes(currentMonth)) return currentMonth;
  return months[0] ?? currentMonth;
}

function monthDateRange(month: string): { startDate: string; endDate: string } {
  const [year, m] = month.split("-").map(Number);
  const lastDay = new Date(year, m, 0).getDate();
  return {
    startDate: `${month}-01`,
    endDate: `${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

function toMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

/** 该月是否晚于当前自然月（不可选未来月）。 */
function isFutureMonth(year: number, month: number): boolean {
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  return year > cy || (year === cy && month > cm);
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

/** 会员分账状态徽标：0 预估灰 / 1 已入账绿。 */
function PoolStatusBadge({ status, label }: { status: 0 | 1; label: string }) {
  const style = status === 1 ? { background: "#F0FDF4", color: "#16a34a" } : { background: "#F9FAFB", color: "#6B7280" };
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
 * 收益明细 —— 对接 /publisher/settlement/overview、/earnings、/courses；
 * 「会员相关」tab 对接 /publisher/vipPool/months、/courses、/current（看剧会员 P4 订阅池分账）。
 * 收益数据与收款账户是否绑定解耦；未绑定收款账户时仍展示已产生的收益明细。
 */
export function EarningsPage() {
  const { messages, locale } = useI18n();
  const t = messages.distribution.earnings;
  const allLabel = messages.distribution.withdraw.statusAll;

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [detail, setDetail] = useState<EarningsDetailRow[]>([]);
  const [detailTotal, setDetailTotal] = useState(0);
  const [courses, setCourses] = useState<EarningsCourseOption[]>([]);
  /** 有收益数据的 yyyy-MM 列表（接口倒序、跨年），用于月份浅底高亮与年份边界。 */
  const [monthsWithData, setMonthsWithData] = useState<string[]>([]);
  const [activeMonth, setActiveMonth] = useState<string>(currentCalendarMonth);
  /** 年份切换器当前展示年。 */
  const [viewYear, setViewYear] = useState<number>(() => new Date().getFullYear());
  const [courseFilter, setCourseFilter] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  /** 收益详情 tab：剧相关（单独购买分账）/ 会员相关（订阅池分账） */
  const [detailTab, setDetailTab] = useState<"drama" | "vip">("drama");
  const [vipLoading, setVipLoading] = useState(false);
  const [vipMonths, setVipMonths] = useState<VipPoolMonthRow[]>([]);
  const [vipTotal, setVipTotal] = useState(0);
  const [vipPage, setVipPage] = useState(1);
  const [vipCurrent, setVipCurrent] = useState<VipPoolCurrent | null>(null);
  /** 展开查看每剧明细的月份（同时只展开一个） */
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [vipCourses, setVipCourses] = useState<VipPoolCourseRow[]>([]);
  const [vipCoursesLoading, setVipCoursesLoading] = useState(false);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const [sum, courseOptions, availableMonths] = await Promise.all([
        getEarningsSummary(),
        getEarningsCoursesDropdown(),
        getEarningsMonths(),
      ]);
      setSummary(sum);
      setCourses(courseOptions);
      setMonthsWithData(availableMonths);
      setActiveMonth((prev) => {
        if (prev && !isFutureMonth(Number(prev.slice(0, 4)), Number(prev.slice(5, 7)))) {
          return prev;
        }
        return getDefaultMonth(availableMonths);
      });
    } catch {
      // http 已 toast
    } finally {
      setLoading(false);
    }
  }, []);

  // 选中月变化时把年份切换器对齐到该年
  useEffect(() => {
    if (!activeMonth) return;
    const y = Number(activeMonth.slice(0, 4));
    if (!Number.isNaN(y)) setViewYear(y);
  }, [activeMonth]);

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
    if (!activeMonth) return;
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
  }, [activeMonth, page, courseFilter, debouncedSearch]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  /** 会员相关：月度列表按页拉取；首页顺带拉「本月至今」实时汇总。service 层已吞错，接口未上线时得到空态。 */
  const loadVipMonths = useCallback(async () => {
    setVipLoading(true);
    try {
      const [res, current] = await Promise.all([
        getVipPoolMonths({ page: vipPage, limit: DETAIL_PAGE_SIZE }),
        vipPage === 1 ? getVipPoolCurrent() : Promise.resolve(undefined),
      ]);
      setVipMonths(res.list);
      setVipTotal(res.totalCount);
      if (current !== undefined) setVipCurrent(current);
    } finally {
      setVipLoading(false);
    }
  }, [vipPage]);

  useEffect(() => {
    if (detailTab === "vip") void loadVipMonths();
  }, [detailTab, loadVipMonths]);

  const toggleMonth = async (month: string) => {
    if (expandedMonth === month) {
      setExpandedMonth(null);
      return;
    }
    setExpandedMonth(month);
    setVipCourses([]);
    setVipCoursesLoading(true);
    try {
      setVipCourses(await getVipPoolCourses(month));
    } finally {
      setVipCoursesLoading(false);
    }
  };

  const totalPage = Math.max(1, Math.ceil(detailTotal / DETAIL_PAGE_SIZE));
  const vipTotalPage = Math.max(1, Math.ceil(vipTotal / DETAIL_PAGE_SIZE));

  const calendarYear = new Date().getFullYear();
  const yearsFromData = monthsWithData.map((m) => Number(m.slice(0, 4)));
  const minYear = yearsFromData.length > 0 ? Math.min(...yearsFromData) : calendarYear;
  const maxYear = Math.max(calendarYear, ...(yearsFromData.length > 0 ? yearsFromData : [calendarYear]));
  const canPrevYear = viewYear > minYear;
  const canNextYear = viewYear < maxYear;

  const selectMonth = (year: number, month: number) => {
    if (isFutureMonth(year, month)) return;
    setActiveMonth(toMonthKey(year, month));
    setViewYear(year);
    setPage(1);
  };

  const shiftYear = (delta: number) => {
    const next = viewYear + delta;
    if (next < minYear || next > maxYear) return;
    setViewYear(next);
  };

  if (loading) {
    return (
      <div className="p-8">
        <PageLoading />
      </div>
    );
  }

  const typeLabel = (scope: EarningsDetailRow["publishScope"]) => (scope === 2 ? t.typeFull : t.typeAccount);
  const typeValue = (scope: EarningsDetailRow["publishScope"]) => (scope === 2 ? "full" : "account");
  const hasSummary = summary !== null;
  const growthText = summary?.growthRate === null ? "--" : t.growthVsLastMonth.replace("{rate}", String(summary?.growthRate ?? 0));

  const settleStatusLabel = (status: EarningsDetailRow["settleStatus"]) => {
    if (status === 2) return t.statusSettled;
    if (status === 1) return t.statusProcessing;
    return t.statusPending;
  };

  const chartData = (summary?.monthlyTrend ?? []).map((m) => ({
    label: t.monthLabel.replace("{n}", String(Number(m.month.slice(5, 7)))),
    total: m.amountUsd,
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
    t.colHistorySettled,
    t.colTotalCreator,
  ];

  /** 设计稿 figma 15607-11611：年份箭头 + 固定 1–12 月；选中黑底；有数据月浅底；未来月禁用。 */
  const yearMonthSwitcher = (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => shiftYear(-1)}
          disabled={!canPrevYear}
          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous year"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="min-w-[3rem] text-center text-sm text-[#101828] tabular-nums" style={{ fontWeight: 600 }}>
          {viewYear}
        </span>
        <button
          type="button"
          onClick={() => shiftYear(1)}
          disabled={!canNextYear}
          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next year"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
          const key = toMonthKey(viewYear, month);
          const selected = activeMonth === key;
          const future = isFutureMonth(viewYear, month);
          const hasData = monthsWithData.includes(key);
          return (
            <button
              key={key}
              type="button"
              disabled={future}
              onClick={() => selectMonth(viewYear, month)}
              className="px-2.5 py-1.5 rounded-md text-xs transition-all whitespace-nowrap"
              style={{
                background: selected ? "#111111" : hasData && !future ? "#F3F4F6" : "transparent",
                color: selected ? "#FFFFFF" : future ? "#D1D5DB" : "#9CA3AF",
                fontWeight: selected ? 600 : 400,
                cursor: future ? "not-allowed" : "pointer",
              }}
            >
              {t.monthLabel.replace("{n}", String(month))}
            </button>
          );
        })}
      </div>
    </div>
  );

  const vipCols = [t.colMonth, t.colMemberCount, t.colEffectiveDuration, t.colVipIncome, t.colMom, t.colPoolStatus, t.colAction];
  const vipGrid = "grid-cols-[120px_130px_170px_180px_110px_110px_minmax(120px,1fr)]";
  const courseCols = [t.colCourse, t.colType, t.colShare, t.colEffectiveDuration, t.colPlatformShare, t.colMemberCount, t.colPayout, t.colPoolStatus];
  const courseGrid = "grid-cols-[minmax(220px,1fr)_140px_80px_150px_110px_110px_120px_100px]";
  const poolStatusLabel = (status: 0 | 1) => (status === 1 ? t.statusPosted : t.statusEstimated);

  /** 会员相关：本月至今汇总 + 按月列表（点开一个月 → 每剧明细） */
  const vipSection = (
    <>
      {vipCurrent && (
        <div className="flex flex-wrap items-center gap-6 px-5 py-3 border-b border-[#f3f4f6] bg-gray-50/30">
          <span className="text-xs text-[#101828] whitespace-nowrap" style={{ fontWeight: 600 }}>
            {t.vipCurrentTitle} · {vipCurrent.periodMonth}
          </span>
          {[
            { label: t.vipCurrentEffective, val: formatDuration(vipCurrent.effectiveSeconds, t.durationHm), accent: false },
            { label: t.vipCurrentShare, val: formatPct(vipCurrent.platformSharePct), accent: false },
            { label: t.vipCurrentEstimate, val: usd(vipCurrent.estimatedUsd), accent: true },
          ].map((item, i) => (
            <div key={i} className="flex items-baseline gap-1.5">
              <span className="text-xs text-gray-400">{item.label}</span>
              <span className="text-sm tabular-nums" style={{ fontWeight: 700, color: item.accent ? "#e8192c" : "#101828" }}>
                {item.val}
              </span>
            </div>
          ))}
          <span className="ml-auto text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap">
            <RefreshCw className="w-3 h-3" />
            {t.vipCurrentRefreshed.replace("{time}", vipCurrent.refreshTime)}
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[960px]">
          <div className={`grid ${vipGrid} px-5 py-2.5 bg-gray-50/60 border-b border-[#f3f4f6]`}>
            {vipCols.map((col, i) => (
              <span key={i} className="text-xs text-[#6a7282] whitespace-nowrap" style={{ fontWeight: 500 }}>
                {col}
              </span>
            ))}
          </div>

          <div className="divide-y divide-gray-50">
            {vipLoading ? (
              <div className="flex items-center justify-center py-12">
                <PageLoading />
              </div>
            ) : (
              <>
                {vipMonths.map((row) => {
                  const expanded = expandedMonth === row.periodMonth;
                  return (
                    <div key={row.periodMonth}>
                      <div className={`grid ${vipGrid} px-5 py-3.5 items-center hover:bg-gray-50/50 transition-colors`}>
                        <span className="text-sm text-[#101828] whitespace-nowrap tabular-nums" style={{ fontWeight: 600 }}>
                          {row.periodMonth}
                        </span>
                        <span className="text-xs text-gray-600 whitespace-nowrap tabular-nums">{row.memberCount}</span>
                        <span className="text-xs text-gray-600 whitespace-nowrap tabular-nums">
                          {formatDuration(row.effectiveSeconds, t.durationHm)}
                        </span>
                        <span className="text-sm text-[#101828] whitespace-nowrap tabular-nums" style={{ fontWeight: 700 }}>
                          {usd(row.creatorUsd)}
                        </span>
                        <span
                          className="text-xs whitespace-nowrap tabular-nums"
                          style={{ color: row.momRate == null ? "#9CA3AF" : row.momRate >= 0 ? "#16a34a" : "#e8192c", fontWeight: 600 }}
                        >
                          {formatMom(row.momRate)}
                        </span>
                        <div>
                          <PoolStatusBadge status={row.status} label={poolStatusLabel(row.status)} />
                        </div>
                        <button
                          type="button"
                          onClick={() => void toggleMonth(row.periodMonth)}
                          className="inline-flex items-center gap-1 text-xs text-[#3b82f6] hover:underline w-fit"
                        >
                          {expanded ? t.actionCollapse : t.actionDetail}
                          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {expanded && (
                        <div className="px-5 pb-4 bg-gray-50/40">
                          <p className="text-xs text-gray-500 py-2" style={{ fontWeight: 500 }}>
                            {t.vipDetailTitle.replace("{month}", row.periodMonth)}
                          </p>
                          {vipCoursesLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <PageLoading />
                            </div>
                          ) : vipCourses.length === 0 ? (
                            <p className="text-xs text-gray-400 py-4 text-center">{t.vipDetailEmpty}</p>
                          ) : (
                            <div className="rounded-xl border border-[#f3f4f6] bg-white overflow-hidden">
                              <div className={`grid ${courseGrid} px-4 py-2 bg-gray-50/60 border-b border-[#f3f4f6]`}>
                                {courseCols.map((col, i) => (
                                  <span key={i} className="text-xs text-[#6a7282] whitespace-nowrap" style={{ fontWeight: 500 }}>
                                    {col}
                                  </span>
                                ))}
                              </div>
                              <div className="divide-y divide-gray-50">
                                {vipCourses.map((c) => (
                                  <div key={c.courseId} className={`grid ${courseGrid} px-4 py-3 items-center`}>
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-7 h-9 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                                        {c.courseImg ? (
                                          <img src={c.courseImg} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                          <Film className="w-3.5 h-3.5 text-gray-300" />
                                        )}
                                      </div>
                                      <p className="text-sm text-[#101828] truncate" title={c.courseName} style={{ fontWeight: 600 }}>
                                        {c.courseName}
                                      </p>
                                    </div>
                                    <div>
                                      <TypeBadge
                                        type={typeValue(c.publishScope)}
                                        label={`${typeLabel(c.publishScope)} ${platformCreatorLabel(c.creatorRatio)}`.trim()}
                                      />
                                    </div>
                                    <span className="text-sm text-gray-700 whitespace-nowrap tabular-nums" style={{ fontWeight: 600 }}>
                                      {shareRatioLabel(c.creatorRatio)}
                                    </span>
                                    <span className="text-xs text-gray-600 whitespace-nowrap tabular-nums">
                                      {formatDuration(c.effectiveSeconds, t.durationHm)}
                                    </span>
                                    <span className="text-xs text-gray-600 whitespace-nowrap tabular-nums">{formatPct(c.sharePct)}</span>
                                    <span className="text-xs text-gray-600 whitespace-nowrap tabular-nums">{c.memberCount}</span>
                                    <span className="text-sm text-[#101828] whitespace-nowrap tabular-nums" style={{ fontWeight: 700 }}>
                                      {usd(c.creatorUsd)}
                                    </span>
                                    <div>
                                      <PoolStatusBadge status={c.status} label={poolStatusLabel(c.status)} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {vipMonths.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <Crown className="w-7 h-7 text-gray-200" />
                    <p className="text-sm text-gray-400">{t.vipEmpty}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {!vipLoading && vipTotalPage > 1 && (
        <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setVipPage((p) => p - 1)}
            disabled={vipPage <= 1}
            className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 tabular-nums">
            {vipPage} / {vipTotalPage}
          </span>
          <button
            type="button"
            onClick={() => setVipPage((p) => p + 1)}
            disabled={vipPage >= vipTotalPage}
            className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );

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
                color: hasSummary ? "#101828" : "#D1D5DB",
              }}
            >
              {usd(summary?.totalCumulativeUsd ?? 0)}
            </p>
            {summary && (
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
                  <p className="text-sm mt-0.5" style={{ fontWeight: 700, color: hasSummary ? "#101828" : "#D1D5DB" }}>
                    {usd(item.val)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-4">
            {[
              { label: t.relatedDramas, val: String(summary?.relatedDramas ?? 0), accent: false },
              { label: t.settlementBills, val: String(summary?.settlementBillCount ?? 0), accent: false },
              { label: t.yesterday, val: usd(summary?.yesterdayUsd ?? 0), accent: false },
              { label: t.estThisMonth, val: usd(summary?.estThisMonthUsd ?? 0), accent: true },
            ].map((item, i) => (
              <div key={i} className="text-center px-4 py-2 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                <p
                  className="text-sm"
                  style={{
                    fontWeight: 700,
                    color: hasSummary ? (item.accent ? "#e8192c" : "#101828") : "#D1D5DB",
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
            <ResponsiveContainer key={`earnings-bar-${hasSummary}`} width="100%" height="100%">
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
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#f3f4f6] flex-wrap">
          <div className="flex items-center gap-4 flex-wrap">
            <h3 className="text-sm text-[#101828]" style={{ fontWeight: 700 }}>
              {t.detailTitle}
            </h3>
            {/* 剧相关 / 会员相关 分段切换（设计稿「收益详情 › 剧相关 | 会员相关」） */}
            <div className="flex items-center rounded-lg bg-gray-100 p-0.5">
              {(["drama", "vip"] as const).map((tab) => {
                const active = detailTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setDetailTab(tab)}
                    className="px-3 py-1 text-xs rounded-md transition-colors whitespace-nowrap"
                    style={{
                      background: active ? "#FFFFFF" : "transparent",
                      color: active ? "#101828" : "#6B7280",
                      fontWeight: active ? 600 : 400,
                      boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                    }}
                  >
                    {tab === "drama" ? t.tabDrama : t.tabVip}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            {detailTab === "drama" ? t.updatedDaily : t.vipHint}
          </div>
        </div>

        {detailTab === "drama" ? (
        <>
            {/* 设计稿：左侧筛选/搜索，右侧年份 + 1–12 月切换 */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-[#f3f4f6] bg-gray-50/30 flex-wrap">
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
              <div className="relative max-w-xs w-full sm:w-auto sm:flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#e5e7eb] rounded-lg bg-white outline-none focus:border-gray-400 transition-colors"
                />
              </div>
              <div className="ml-auto">{yearMonthSwitcher}</div>
            </div>

            {/* 表头 */}
            <div className="overflow-x-auto">
              <div className="min-w-[1380px]">
                <div className="grid grid-cols-[110px_90px_minmax(220px,1fr)_150px_90px_80px_100px_100px_130px_120px_120px] px-5 py-2.5 bg-gray-50/60 border-b border-[#f3f4f6]">
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
                          className="grid grid-cols-[110px_90px_minmax(220px,1fr)_150px_90px_80px_100px_100px_130px_120px_120px] px-5 py-3.5 items-center hover:bg-gray-50/50 transition-colors"
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
                          <span className="text-sm text-gray-700 whitespace-nowrap tabular-nums" style={{ fontWeight: 600 }}>
                            {optionalUsd(row.historySettledUsd)}
                          </span>
                          <span className="text-sm text-[#101828] whitespace-nowrap tabular-nums" style={{ fontWeight: 700 }}>
                            {optionalUsd(row.totalCreatorUsd)}
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
          vipSection
        )}
      </div>
    </div>
  );
}
