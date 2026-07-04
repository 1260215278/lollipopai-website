import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  AlertCircle,
  BarChart3,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Search,
  Send,
  Wallet,
  X,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { useI18n } from "../../i18n";
import { PageLoading } from "../components/settlement/PageHeader";
import { EmptyState } from "../components/settlement/EmptyState";
import {
  getSettlementSummary,
  getSettlementRecords,
  getSettlementRecordDetail,
  getSettlementChart,
  getEarningsCoursesDropdown,
  applySettlement,
  type EarningsCourseOption,
  type SettlementChart,
  type SettlementRecord,
  type SettlementRecordDetail,
  type SettlementStatus,
  type SettlementStatusGroup,
  type SettlementSummary,
} from "../../services/settlement";

type WithdrawMsg = ReturnType<typeof useI18n>["messages"]["distribution"]["withdraw"];

const RECORD_PAGE_SIZE = 10;
const chartColors = ["#111111", "#e8192c", "#3b82f6", "#16a34a", "#f59e0b"];

const cny = (n: number) =>
  `¥ ${(n ?? 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type StatusFilter = "all" | SettlementStatus;
type ChartMode = "time" | "drama";

interface SettlementAccountSnapshot {
  companyName?: string;
  accountNo?: string;
  bank?: string;
  branch?: string;
  accountHolder?: string;
  currency?: string;
}

function parseAccountSnapshot(raw: string | null): SettlementAccountSnapshot | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SettlementAccountSnapshot;
  } catch {
    return null;
  }
}

function accountText(bank?: string | null, accountNo?: string | null): string {
  return [bank, accountNo].filter(Boolean).join(" ");
}

function periodText(months: string[]): string {
  if (months.length <= 1) return months[0] ?? "—";
  return `${months[0]} ~ ${months[months.length - 1]}`;
}

function addMonth(month: string, offset: number): string {
  const [year, m] = month.split("-").map(Number);
  const d = new Date(year, m - 1 + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function recentMonthRange(): { startMonth: string; endMonth: string } {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const endMonth = addMonth(currentMonth, -1);
  return { startMonth: addMonth(endMonth, -5), endMonth };
}

function makeLineData(chart: SettlementChart) {
  return chart.months.map((month, index) => {
    const row: Record<string, string | number> = { month, label: chartMonthLabel(month) };
    chart.series.forEach((series) => {
      row[String(series.courseId)] = series.points[index] ?? 0;
    });
    return row;
  });
}

function chartMonthLabel(month: string): string {
  return `${Number(month.slice(5, 7))}月`;
}

export function WithdrawPage() {
  const { messages } = useI18n();
  const t = messages.distribution.withdraw;
  const allLabel = t.statusAll;
  const initialRange = useMemo(() => recentMonthRange(), []);

  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [summary, setSummary] = useState<SettlementSummary | null>(null);
  const [records, setRecords] = useState<SettlementRecord[]>([]);
  const [courses, setCourses] = useState<EarningsCourseOption[]>([]);
  const [chart, setChart] = useState<SettlementChart>({ months: [], series: [] });
  const [applying, setApplying] = useState(false);
  const [confirmApply, setConfirmApply] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<SettlementRecordDetail | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [statusOpen, setStatusOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [chartMode, setChartMode] = useState<ChartMode>("time");
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [startMonth] = useState(initialRange.startMonth);
  const [endMonth] = useState(initialRange.endMonth);
  const statusRef = useRef<HTMLDivElement>(null);
  const didInitialLoad = useRef(false);

  const statusText = useCallback(
    (s: SettlementStatus) => (s === 1 ? t.statusApplied : s === 2 ? t.statusApproved : s === 3 ? t.statusPaid : t.statusRejected),
    [t],
  );
  const groupText = useCallback(
    (group: SettlementStatusGroup) => (group === "settled" ? t.groupSettled : group === "failed" ? t.groupFailed : t.groupApplied),
    [t],
  );

  const loadSummary = useCallback(async () => {
    const [nextSummary, courseOptions] = await Promise.all([getSettlementSummary(), getEarningsCoursesDropdown()]);
    setSummary(nextSummary);
    setCourses(courseOptions);
  }, []);

  const loadRecords = useCallback(async () => {
    setRecordsLoading(true);
    try {
      const pageData = await getSettlementRecords({
        page,
        limit: RECORD_PAGE_SIZE,
        status: statusFilter === "all" ? undefined : statusFilter,
        keyword: search.trim() || undefined,
      });
      setRecords(pageData.list);
      setTotalPage(pageData.totalPage > 0 ? pageData.totalPage : 1);
    } catch {
      // http 已 toast
    } finally {
      setRecordsLoading(false);
    }
  }, [page, statusFilter, search]);

  const loadChart = useCallback(async () => {
    setChartLoading(true);
    try {
      setChart(
        await getSettlementChart({
          startMonth: startMonth || undefined,
          endMonth: endMonth || undefined,
          courseIds: selectedCourseIds.length > 0 ? selectedCourseIds : undefined,
        }),
      );
    } catch {
      // http 已 toast
    } finally {
      setChartLoading(false);
    }
  }, [startMonth, endMonth, selectedCourseIds]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        await Promise.all([loadSummary(), loadRecords(), loadChart()]);
      } finally {
        didInitialLoad.current = true;
        setLoading(false);
      }
    };
    void run();
  }, []);

  useEffect(() => {
    if (didInitialLoad.current) void loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    if (didInitialLoad.current) void loadChart();
  }, [loadChart]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const statusOptions: { key: StatusFilter; label: string }[] = [
    { key: "all", label: allLabel },
    { key: 1, label: t.statusApplied },
    { key: 2, label: t.statusApproved },
    { key: 3, label: t.statusPaid },
    { key: 4, label: t.statusRejected },
  ];

  const statusFilterLabel = statusFilter === "all" ? allLabel : statusText(statusFilter);
  const canApply = Boolean(summary?.canApply);
  const applyButtonText = summary?.blockReason === "ALREADY_APPLIED_THIS_MONTH"
    ? t.alreadyApplied
    : summary?.resubmit
      ? t.resubmitSettlement
      : t.applySettlement;
  const blockReasonText =
    summary?.blockReason === "NO_PAYOUT_ACCOUNT"
      ? t.blockNoAccount
      : summary?.blockReason === "ALREADY_APPLIED_THIS_MONTH"
        ? t.blockAlreadyApplied
        : summary?.blockReason === "NO_SETTLEABLE_EARNINGS"
          ? t.blockNoEarnings
          : "";

  const openDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      setDetail(await getSettlementRecordDetail(id));
    } catch {
      // http 已 toast
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApply = async () => {
    if (applying) return;
    setApplying(true);
    try {
      await applySettlement();
      toast.success(t.applySuccess);
      setConfirmApply(false);
      await Promise.all([loadSummary(), loadRecords()]);
    } catch {
      // http 已 toast
    } finally {
      setApplying(false);
    }
  };

  const lineData = useMemo(() => makeLineData(chart), [chart]);
  const barData = useMemo(
    () => chart.series.map((series) => ({ name: series.courseName, total: series.cumulativeCny })),
    [chart],
  );

  if (loading) {
    return (
      <div className="p-8">
        <PageLoading />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-5">
      <SummaryCard
        t={t}
        summary={summary}
        canApply={canApply}
        applyButtonText={applyButtonText}
        blockReasonText={blockReasonText}
        applying={applying}
        onApply={() => setConfirmApply(true)}
      />

      <ChartCard
        t={t}
        summary={summary}
        mode={chartMode}
        setMode={setChartMode}
        courses={courses}
        selectedCourseIds={selectedCourseIds}
        setSelectedCourseIds={setSelectedCourseIds}
        chart={chart}
        lineData={lineData}
        barData={barData}
        loading={chartLoading}
      />

      <RecordsCard
        t={t}
        records={records}
        loading={recordsLoading}
        statusFilterLabel={statusFilterLabel}
        statusOpen={statusOpen}
        statusRef={statusRef}
        statusOptions={statusOptions}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        setStatusOpen={setStatusOpen}
        search={search}
        setSearch={setSearch}
        setPage={setPage}
        totalPage={totalPage}
        page={page}
        groupText={groupText}
        onDetail={(id) => void openDetail(id)}
      />

      {confirmApply && summary && (
        <ApplyModal
          t={t}
          summary={summary}
          applying={applying}
          onClose={() => setConfirmApply(false)}
          onApply={() => void handleApply()}
        />
      )}

      {(detail || detailLoading) && (
        <DetailModal
          t={t}
          detail={detail}
          loading={detailLoading}
          groupText={groupText}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}

function SummaryCard({
  t,
  summary,
  canApply,
  applyButtonText,
  blockReasonText,
  applying,
  onApply,
}: {
  t: WithdrawMsg;
  summary: SettlementSummary | null;
  canApply: boolean;
  applyButtonText: string;
  blockReasonText: string;
  applying: boolean;
  onApply: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#f3f4f6] p-5">
      <div className="flex flex-wrap items-start justify-between gap-5">
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

        <div>
          <button
            type="button"
            disabled={!canApply || applying}
            onClick={onApply}
            className="h-10 min-w-[146px] px-5 rounded-[14px] text-sm text-white disabled:text-[#6a7282] disabled:bg-gray-100 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            style={{ background: canApply ? "#111111" : undefined, fontWeight: 600 }}
          >
            {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {applyButtonText}
          </button>
          {blockReasonText && <p className="text-[11px] text-[#99a1af] mt-1 text-right">{blockReasonText}</p>}
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  t,
  summary,
  mode,
  setMode,
  courses,
  selectedCourseIds,
  setSelectedCourseIds,
  chart,
  lineData,
  barData,
  loading,
}: {
  t: WithdrawMsg;
  summary: SettlementSummary | null;
  mode: ChartMode;
  setMode: (mode: ChartMode) => void;
  courses: EarningsCourseOption[];
  selectedCourseIds: number[];
  setSelectedCourseIds: React.Dispatch<React.SetStateAction<number[]>>;
  chart: SettlementChart;
  lineData: Record<string, string | number>[];
  barData: { name: string; total: number }[];
  loading: boolean;
}) {
  const activeCourseIds = new Set(
    selectedCourseIds.length > 0 ? selectedCourseIds : chart.series.map((series) => series.courseId),
  );
  const selectableCourses = courses.filter((course) => !activeCourseIds.has(course.courseId));
  const removeCourse = (courseId: number) => {
    if (selectedCourseIds.length > 0) {
      setSelectedCourseIds((ids) => ids.filter((id) => id !== courseId));
      return;
    }
    setSelectedCourseIds(chart.series.filter((series) => series.courseId !== courseId).map((series) => series.courseId));
  };
  const addCourse = (courseId: number) => {
    setSelectedCourseIds((ids) => {
      const baseIds = ids.length > 0 ? ids : chart.series.map((series) => series.courseId);
      return Array.from(new Set([...baseIds, courseId]));
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#f3f4f6] overflow-hidden p-6 min-h-[340px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-sm leading-5 text-[#101828]" style={{ fontWeight: 700 }}>
            {t.chartTitle}
          </h3>
          <p className="text-xs leading-4 text-[#99a1af] mt-0.5">{t.chartSubtitle}</p>
        </div>
        <div className="flex flex-wrap items-start gap-3">
          <ChartMetric label={t.totalSettled} value={cny(summary?.totalSettledCny ?? 0)} />
          <ChartMetric label={t.groupSettled} value={String(summary?.settledCount ?? 0)} accent />
          <div className="h-[29px] rounded-full border border-[#f3f4f6] bg-white p-[1px] flex items-center">
            <button
              type="button"
              onClick={() => setMode("time")}
              className="h-[27px] w-16 rounded-full text-xs transition-colors"
              style={{ background: mode === "time" ? "#111111" : "transparent", color: mode === "time" ? "#fff" : "#6a7282", fontWeight: 600 }}
            >
              {t.chartByTime}
            </button>
            <button
              type="button"
              onClick={() => setMode("drama")}
              className="h-[27px] w-16 rounded-full text-xs transition-colors"
              style={{ background: mode === "drama" ? "#111111" : "transparent", color: mode === "drama" ? "#fff" : "#6a7282", fontWeight: 600 }}
            >
              {t.chartByDrama}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-h-[29px] flex flex-wrap items-center gap-2">
          <span className="text-xs leading-4 text-[#6a7282]">{t.compareCourses}</span>
          {chart.series.map((series, index) => (
            <CourseChip
              key={series.courseId}
              label={series.courseName}
              color={chartColors[index % chartColors.length]}
              onRemove={() => removeCourse(series.courseId)}
            />
          ))}
        </div>
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) addCourse(Number(e.target.value));
          }}
          className="h-[29px] w-[92px] rounded-full border border-[#e5e7eb] bg-white px-3 text-xs text-[#364153] outline-none"
          style={{ fontWeight: 500 }}
        >
          <option value="">{t.selectCourse}</option>
          {selectableCourses.map((course) => (
            <option key={course.courseId} value={course.courseId}>
              {course.courseTitle}
            </option>
          ))}
        </select>
      </div>

      <div className="h-[192px] mt-1">
        {loading ? (
          <PageLoading />
        ) : chart.series.length === 0 ? (
          <EmptyState className="py-12" icon={<BarChart3 className="w-6 h-6" />} title={t.emptyChart} />
        ) : mode === "time" ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 18, right: 6, left: 0, bottom: 2 }}>
              <CartesianGrid strokeDasharray="2 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [cny(v), t.chartAmount]} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              {chart.series.map((series, index) => (
                <Line
                  key={series.courseId}
                  type="monotone"
                  dataKey={String(series.courseId)}
                  name={series.courseName}
                  stroke={chartColors[index % chartColors.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 18, right: 6, left: 8, bottom: 2 }}>
              <CartesianGrid strokeDasharray="2 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={112} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [cny(v), t.chartCumulative]} />
              <Bar dataKey="total" name={t.chartCumulative} fill="#111111" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function ChartMetric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-[#f9fafb] px-4 py-2 min-w-[61px]">
      <p className="text-[11px] leading-[17px] text-[#99a1af]">{label}</p>
      <p className="text-sm leading-5 tabular-nums" style={{ fontWeight: 800, color: accent ? "#16a34a" : "#101828" }}>
        {value}
      </p>
    </div>
  );
}

function CourseChip({ label, color, onRemove }: { label: string; color: string; onRemove: () => void }) {
  return (
    <span
      className="h-[21px] inline-flex items-center gap-1.5 rounded-full px-2.5 text-xs whitespace-nowrap"
      style={{ background: `${color}14`, color, fontWeight: 500 }}
    >
      {label}
      <button type="button" onClick={onRemove} className="text-current opacity-70 hover:opacity-100" aria-label={label}>
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function RecordsCard({
  t,
  records,
  loading,
  statusFilterLabel,
  statusOpen,
  statusRef,
  statusOptions,
  statusFilter,
  setStatusFilter,
  setStatusOpen,
  search,
  setSearch,
  setPage,
  totalPage,
  page,
  groupText,
  onDetail,
}: {
  t: WithdrawMsg;
  records: SettlementRecord[];
  loading: boolean;
  statusFilterLabel: string;
  statusOpen: boolean;
  statusRef: React.RefObject<HTMLDivElement>;
  statusOptions: { key: StatusFilter; label: string }[];
  statusFilter: StatusFilter;
  setStatusFilter: (status: StatusFilter) => void;
  setStatusOpen: (open: boolean | ((value: boolean) => boolean)) => void;
  search: string;
  setSearch: (search: string) => void;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPage: number;
  page: number;
  groupText: (group: SettlementStatusGroup) => string;
  onDetail: (id: number) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#f3f4f6] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
        <h3 className="text-sm text-[#101828]" style={{ fontWeight: 700 }}>
          {t.recordsTitle}
        </h3>
        <div className="flex items-center gap-2">
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
                      setPage(1);
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t.searchPlaceholder}
              className="w-52 pl-9 pr-3 py-1.5 text-xs border border-[#e5e7eb] rounded-lg bg-white outline-none focus:border-gray-400 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px]">
          <colgroup>
            <col className="w-[180px]" />
            <col className="w-[120px]" />
            <col className="w-[110px]" />
            <col className="w-[200px]" />
            <col className="w-[130px]" />
            <col className="w-[185px]" />
            <col className="w-[110px]" />
            <col className="w-[100px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-[#f3f4f6] bg-gray-50/50">
              <Th>{t.colOrderNo}</Th>
              <Th>{t.colDate}</Th>
              <Th>{t.colPeriod}</Th>
              <Th>{t.colTypeRatio}</Th>
              <Th>{t.colAccountNo}</Th>
              <Th>{t.colCreator}</Th>
              <Th>{t.colStatus}</Th>
              <Th>{t.colAction}</Th>
            </tr>
          </thead>
          {!loading && records.length > 0 && (
            <tbody>
              {records.map((row) => (
                <tr key={row.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-[18px] text-xs text-[#4a5565] tabular-nums">{row.orderNo}</td>
                  <td className="px-5 py-[18px] text-xs text-[#4a5565] whitespace-nowrap">
                    {row.statusGroup === "settled" ? row.payTime ?? "—" : row.applyTime ?? "—"}
                  </td>
                  <td className="px-5 py-[18px] text-xs text-[#4a5565]">{row.periodMonth}</td>
                  <td className="px-5 py-3.5">
                    <TypeRatioBadge
                      type={row.publishScope === 2 ? "full" : "account"}
                      label={`${row.publishScope === 2 ? t.typeFull : t.typeAccount} ${row.ratioLabel}`}
                    />
                  </td>
                  <td className="px-5 py-[18px] text-xs text-[#4a5565] tabular-nums">{row.accountNoMasked ?? "—"}</td>
                  <td className="px-5 py-[18px]">
                    <span className="text-sm text-[#101828]" style={{ fontWeight: 700 }}>
                      {cny(row.creatorCny)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge group={row.statusGroup} label={groupText(row.statusGroup)} />
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => onDetail(row.id)}
                      className="inline-flex items-center gap-1 h-8 text-xs text-[#99a1af] hover:text-[#4a5565]"
                      style={{ fontWeight: 500 }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {t.detail}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <PageLoading />
        </div>
      )}

      {!loading && records.length === 0 && <EmptyState className="py-16" icon={<Wallet className="w-6 h-6" />} title={t.emptyTitle} />}

      {!loading && totalPage > 1 && (
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
    </div>
  );
}

function ApplyModal({
  t,
  summary,
  applying,
  onClose,
  onApply,
}: {
  t: WithdrawMsg;
  summary: SettlementSummary;
  applying: boolean;
  onClose: () => void;
  onApply: () => void;
}) {
  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-[#101828]" style={{ fontWeight: 700, fontSize: "1rem" }}>
            {t.applyConfirmTitle}
          </h3>
        </div>
        <CloseButton onClose={onClose} />
      </div>
      <div className="p-6">
        <p className="text-sm text-[#6a7282] leading-relaxed mb-4">{t.applyConfirmDesc}</p>
        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-3">
          <InfoLine label={t.applyConfirmPeriod} value={periodText(summary.pendingMonths)} />
          <InfoLine label={t.applyConfirmAmount} value={cny(summary.pendingTotalCny)} strong />
          <InfoLine label={t.applyConfirmAccount} value={summary.payoutAccount ? accountText(summary.payoutAccount.bank, summary.payoutAccount.accountNoMasked) : "—"} />
        </div>
        <p className="text-xs text-[#99a1af] mt-3">{t.applyConfirmTip}</p>
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors" style={{ fontWeight: 500 }}>
            {t.cancel}
          </button>
          <button type="button" onClick={onApply} disabled={applying} className="flex-1 py-2.5 rounded-xl text-sm text-white transition-opacity disabled:cursor-not-allowed inline-flex items-center justify-center gap-2" style={{ background: "#111111", fontWeight: 600, opacity: applying ? 0.7 : 1 }}>
            {applying && <Loader2 className="w-4 h-4 animate-spin" />}
            {t.confirmApply}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function DetailModal({
  t,
  detail,
  loading,
  groupText,
  onClose,
}: {
  t: WithdrawMsg;
  detail: SettlementRecordDetail | null;
  loading: boolean;
  groupText: (group: SettlementStatusGroup) => string;
  onClose: () => void;
}) {
  const snapshot = parseAccountSnapshot(detail?.accountSnapshot ?? null);
  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <h3 className="text-[#101828]" style={{ fontWeight: 700, fontSize: "1rem" }}>
          {t.detailTitle}
        </h3>
        <CloseButton onClose={onClose} />
      </div>
      <div className="p-6">
        {loading || !detail ? (
          <PageLoading />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <InfoLine label={t.detailOrderNo} value={detail.orderNo} />
              <InfoLine label={t.detailApplyTime} value={detail.applyTime ?? "—"} />
              <InfoLine label={t.detailPeriod} value={detail.periodMonth} />
              <InfoLine label={t.detailAccount} value={accountText(snapshot?.bank, detail.accountNoMasked)} />
              <InfoLine label={t.detailAmount} value={cny(detail.creatorCny)} strong />
              <InfoLine label={t.detailStatus} value={groupText(detail.statusGroup)} />
              <InfoLine label={t.detailGross} value={cny(detail.grossCny)} />
              <InfoLine label={t.detailPlatform} value={cny(detail.platformCny)} />
            </div>
            {detail.statusGroup === "failed" && detail.auditRemark && (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {t.rejectedReason}: {detail.auditRemark}
              </div>
            )}
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-[#f3f4f6] bg-gray-50/50">
                    <Th>{t.itemCourse}</Th>
                    <Th>{t.colType}</Th>
                    <Th>{t.colOrders}</Th>
                    <Th>{t.itemGross}</Th>
                    <Th>{t.itemCreator}</Th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map((item) => (
                    <tr key={`${item.courseId}-${item.periodMonth}-${item.publishScope}`} className="border-t border-gray-50">
                      <td className="px-5 py-3 text-xs text-[#4a5565]">{item.courseId}</td>
                      <td className="px-5 py-3 text-xs text-[#4a5565]">{item.publishScope === 2 ? t.typeFull : t.typeAccount}</td>
                      <td className="px-5 py-3 text-xs text-[#4a5565]">{item.orderCount}</td>
                      <td className="px-5 py-3 text-xs text-[#4a5565]">{cny(item.grossCny)}</td>
                      <td className="px-5 py-3 text-xs text-[#101828]" style={{ fontWeight: 700 }}>{cny(item.creatorCny)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </ModalShell>
  );
}

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[86vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600" aria-label="Close">
      <X className="w-4 h-4" />
    </button>
  );
}

function InfoLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3">
      <span className="text-xs text-[#99a1af]">{label}</span>
      <span className="text-sm text-[#101828] tabular-nums text-right" style={{ fontWeight: strong ? 800 : 600 }}>
        {value || "—"}
      </span>
    </div>
  );
}

function StatusBadge({ group, label }: { group: SettlementStatusGroup; label: string }) {
  const map = {
    applied: { background: "#FFF7ED", color: "#ea580c" },
    settled: { background: "#F0FDF4", color: "#16a34a" },
    failed: { background: "#F3F4F6", color: "#9ca3af" },
  } as const;
  const style = map[group];
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs w-fit whitespace-nowrap" style={{ ...style, fontWeight: 500 }}>
      {label}
    </span>
  );
}

function TypeRatioBadge({ type, label }: { type: "full" | "account"; label: string }) {
  const style =
    type === "full"
      ? { background: "#FFF1F2", color: "#e8192c" }
      : { background: "#EFF6FF", color: "#3b82f6" };
  return (
    <span className="inline-flex h-6 items-center rounded-full px-2.5 text-xs whitespace-nowrap" style={{ ...style, fontWeight: 600 }}>
      {label}
    </span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-2.5 text-left align-top">
      <span className="text-xs text-[#6a7282]" style={{ fontWeight: 500 }}>
        {children}
      </span>
    </th>
  );
}
