import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  Info,
  TrendingUp,
  TrendingDown,
  Play,
  Heart,
  Star,
  Eye,
  ThumbsUp,
  BookmarkCheck,
  Share2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useI18n, type Locale } from "../../i18n";
import {
  getOverview,
  getTrend,
  getRanking,
  getPlayCompare,
  type DashboardOverview,
  type DashboardTrend,
  type RankingItem,
  type PlayCompareItem,
  type TrendMetric,
  type TrendRange,
} from "../../services/dashboard";

/**
 * 数据概览 —— 对接 4 个端点（/publisher/dashboard/overview|trend|ranking|playCompare）。
 * 模块：4 张统计卡 + 数据趋势折线(7/30 日 × 播放/点赞/收藏切换，单指标按需拉取) +
 *       剧集数据排行表 + 各剧集播放量对比柱状图；含 加载 / 错误 态。
 */

/** 指标主题色（播放=黑 / 点赞=品牌红 / 收藏=靛蓝） */
const METRIC_COLOR: Record<TrendMetric, string> = {
  play: "#111111",
  like: "#E8192C",
  collect: "#6366F1",
};

function formatCompact(n: number, locale: Locale): string {
  const cn = locale === "zh-CN" || locale === "zh-TW";
  if (cn) {
    if (n >= 1e8) return `${trimZero(n / 1e8)}亿`;
    if (n >= 1e4) return `${trimZero(n / 1e4)}万`;
    return n.toLocaleString();
  }
  if (n >= 1e6) return `${trimZero(n / 1e6)}M`;
  if (n >= 1e3) return `${trimZero(n / 1e3)}K`;
  return n.toLocaleString();
}

function trimZero(v: number): string {
  return v.toFixed(1).replace(/\.0$/, "");
}

function formatCount(n: number, locale: Locale): string {
  return n.toLocaleString(locale === "en" ? "en-US" : locale);
}

function tpl(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

function signedPct(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${trimZero(pct)}%`;
}

export function OverviewPage() {
  const { messages, locale } = useI18n();
  const t = messages.distribution.overview;

  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [playCompare, setPlayCompare] = useState<PlayCompareItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [period, setPeriod] = useState<TrendRange>(7);
  const [metric, setMetric] = useState<TrendMetric>("play");
  const [trend, setTrend] = useState<DashboardTrend | null>(null);
  const [trendLoading, setTrendLoading] = useState(false);

  const loadCore = useCallback(() => {
    setLoading(true);
    setError(false);
    Promise.all([getOverview(), getRanking(), getPlayCompare()])
      .then(([ov, rk, pc]) => {
        setOverview(ov);
        setRanking(rk);
        setPlayCompare(pc);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCore();
  }, [loadCore]);

  // 趋势按 metric+period 单独拉取
  useEffect(() => {
    setTrendLoading(true);
    getTrend(metric, period)
      .then((d) => setTrend(d))
      .catch(() => setTrend(null))
      .finally(() => setTrendLoading(false));
  }, [metric, period]);

  if (loading) return <OverviewSkeleton />;

  if (error || !overview) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-gray-100 bg-white h-64 flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-gray-500">{t.loadFailed}</p>
          <button
            onClick={loadCore}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#111111] text-white text-sm hover:opacity-90 transition-opacity"
            style={{ fontWeight: 500 }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {messages.distribution.common.retry}
          </button>
        </div>
      </div>
    );
  }

  const statCards: StatCard[] = [
    {
      icon: <Play className="w-4 h-4" />,
      iconBg: "#F3F4F6",
      iconColor: "#111111",
      label: t.totalDramas,
      value: formatCount(overview.dramaTotal, locale),
      unit: t.unitDrama,
      sub: tpl(t.monthlyAdded, { n: overview.dramaMonthAdd }),
      subUp: overview.dramaMonthAdd >= 0,
    },
    {
      icon: <Eye className="w-4 h-4" />,
      iconBg: "#EFF6FF",
      iconColor: "#3B82F6",
      label: t.totalViews,
      value: formatCompact(overview.playTotal, locale),
      unit: "",
      sub: tpl(t.momChange, { pct: signedPct(overview.playMomRate) }),
      subUp: overview.playMomRate >= 0,
    },
    {
      icon: <ThumbsUp className="w-4 h-4" />,
      iconBg: "#FFF1F2",
      iconColor: "#E8192C",
      label: t.totalLikes,
      value: formatCompact(overview.likeTotal, locale),
      unit: "",
      sub: tpl(t.momChange, { pct: signedPct(overview.likeMomRate) }),
      subUp: overview.likeMomRate >= 0,
    },
    {
      icon: <BookmarkCheck className="w-4 h-4" />,
      iconBg: "#F5F3FF",
      iconColor: "#6366F1",
      label: t.totalFavorites,
      value: formatCompact(overview.collectTotal, locale),
      unit: "",
      sub: tpl(t.momChange, { pct: signedPct(overview.collectMomRate) }),
      subUp: overview.collectMomRate >= 0,
    },
  ];

  const metricTabs: { key: TrendMetric; label: string }[] = [
    { key: "play", label: t.metricPlays },
    { key: "like", label: t.metricLikes },
    { key: "collect", label: t.metricFavs },
  ];

  const periodTabs: { key: TrendRange; label: string }[] = [
    { key: 7, label: t.period7 },
    { key: 30, label: t.period30 },
  ];

  const sumLabel =
    period === 7
      ? { play: t.sum7Plays, like: t.sum7Likes, collect: t.sum7Favs }[metric]
      : { play: t.sum30Plays, like: t.sum30Likes, collect: t.sum30Favs }[metric];

  const barData = playCompare.map((d, idx) => ({
    id: `drama-${idx}`,
    name: d.title.slice(0, 4),
    plays: d.playCount,
  }));

  return (
    <div className="p-8 space-y-6">
      {/* ── 顶部核心指标卡 ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500" style={{ fontWeight: 500 }}>
                {card.label}
              </span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: card.iconBg, color: card.iconColor }}
              >
                {card.icon}
              </div>
            </div>
            <p
              className="text-gray-900 mb-1"
              style={{ fontWeight: 700, fontSize: "1.5rem", letterSpacing: "-0.03em" }}
            >
              {card.value}{" "}
              {card.unit && (
                <span className="text-sm text-gray-500" style={{ fontWeight: 400 }}>
                  {card.unit}
                </span>
              )}
            </p>
            <p
              className="text-xs flex items-center gap-1"
              style={{ color: card.subUp ? "#16a34a" : "#E8192C" }}
            >
              {card.subUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── 趋势图 ───────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: "0.9375rem" }}>
              {t.trendTitle}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{t.trendSubtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {metricTabs.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMetric(m.key)}
                  className="px-3 py-1 text-xs rounded-lg transition-all"
                  style={{
                    background: metric === m.key ? METRIC_COLOR[m.key] : "#F3F4F6",
                    color: metric === m.key ? "white" : "#6B7280",
                    fontWeight: metric === m.key ? 600 : 400,
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1 border border-gray-200 rounded-lg p-0.5">
              {periodTabs.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className="px-3 py-1 text-xs rounded-md transition-all"
                  style={{
                    background: period === p.key ? "#111111" : "transparent",
                    color: period === p.key ? "white" : "#6B7280",
                    fontWeight: period === p.key ? 600 : 400,
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-52 relative">
          {trendLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
              <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
            </div>
          )}
          <ResponsiveContainer key={`${period}-${metric}`} width="100%" height="100%">
            <LineChart data={trend?.points ?? []} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: "12px" }}
                itemStyle={{ color: "#111111" }}
                labelStyle={{ color: "#6B7280" }}
                formatter={(v: number) => [v.toLocaleString(), metricTabs.find((m) => m.key === metric)?.label ?? ""]}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={metric}
                stroke={METRIC_COLOR[metric]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: METRIC_COLOR[metric] }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 汇总行（单指标区间累计） */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: METRIC_COLOR[metric] }} />
            <span className="text-xs text-gray-500">{sumLabel}</span>
            <span className="text-xs text-gray-900" style={{ fontWeight: 600 }}>
              {formatCount(trend?.total ?? 0, locale)}
            </span>
          </div>
        </div>
      </div>

      {/* ── 剧集排名榜 ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: "0.9375rem" }}>
            {t.rankTitle}
          </h2>
          <span className="text-xs text-gray-400">{t.rankSubtitle}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="bg-gray-50/60">
                {[
                  t.colRank,
                  t.colDrama,
                  t.colEpisodes,
                  t.colTotalViews,
                  t.colLikes,
                  t.colFavorites,
                  t.colComments,
                  t.colShares,
                ].map((col, i) => (
                  <th key={i} className="px-5 py-3 text-left">
                    <span className="text-xs text-gray-500" style={{ fontWeight: 500 }}>
                      {col}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranking.map((row) => (
                <tr key={row.courseId} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span
                      className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
                      style={{
                        background: row.rank <= 3 ? "#111111" : "#F3F4F6",
                        color: row.rank <= 3 ? "white" : "#6B7280",
                        fontWeight: 700,
                      }}
                    >
                      {row.rank}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>
                      {row.title}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-gray-600">
                      {row.episodeCount}
                      {t.unitEpisode}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-gray-900" style={{ fontWeight: 600 }}>
                      {formatCompact(row.playCount, locale)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Heart className="w-3 h-3 text-red-400" />
                      {formatCompact(row.likeCount, locale)}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Star className="w-3 h-3 text-indigo-400" />
                      {formatCompact(row.collectCount, locale)}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-gray-600">{formatCount(row.commentCount, locale)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Share2 className="w-3 h-3 text-gray-400" />
                      {formatCount(row.shareCount, locale)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 播放量柱状图 ─────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: "0.9375rem" }}>
            {t.barTitle}
          </h2>
          <Info className="w-4 h-4 text-gray-300" />
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => formatCompact(v, locale)}
              />
              <Tooltip
                contentStyle={{ borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: "12px" }}
                formatter={(v: number) => [formatCompact(v, locale), t.barViews]}
              />
              <Bar dataKey="plays" name={t.barViews} fill="#111111" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

interface StatCard {
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  unit: string;
  sub: string;
  subUp: boolean;
}

/** 加载骨架屏 */
function OverviewSkeleton() {
  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-3 w-16 rounded bg-gray-100 animate-pulse" />
              <div className="w-7 h-7 rounded-lg bg-gray-100 animate-pulse" />
            </div>
            <div className="h-6 w-24 rounded bg-gray-100 animate-pulse mb-2" />
            <div className="h-3 w-20 rounded bg-gray-100 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="h-4 w-32 rounded bg-gray-100 animate-pulse mb-5" />
        <div className="h-52 rounded-xl bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="h-4 w-32 rounded bg-gray-100 animate-pulse mb-5" />
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 rounded bg-gray-50 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
