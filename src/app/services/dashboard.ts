/**
 * 数据概览服务（发行方端，真实接口）
 * ------------------------------------------------------------------
 * 对接 20260703《发行中心-播放数据-前端对接》：核心接口前缀 /publisher/**，
 * 走 publisher token。统计一律限定当前发行账号可见剧；员工只统计其被分配的剧。
 *  - GET /publisher/dashboard/overview     顶部概览卡片
 *  - GET /publisher/dashboard/trend        数据趋势（折线，按 metric+range）
 *  - GET /publisher/dashboard/ranking      剧集数据排行（data.totalCount + data.list[]）
 *
 * `/publisher/dashboard/playCompare` 不在 20260703 播放数据契约中，仅作为旧柱状图的非阻塞兼容数据源。
 *
 * 字段一律来自接口文档，不臆造。分享数（shareCount）后端在埋点上线前返回 0。
 */
import { http } from "./http";

/* ─── 概览卡片（§1.1） ─────────────────────────────────────────── */

export interface DashboardOverview {
  /** 上剧总数（部） */
  dramaTotal: number;
  /** 本月新增 */
  dramaMonthAdd: number;
  /** 累计播放量 */
  playTotal: number;
  /** 播放较上月环比(%) */
  playMomRate: number;
  /** 累计点赞 */
  likeTotal: number;
  likeMomRate: number;
  /** 累计收藏 */
  collectTotal: number;
  collectMomRate: number;
  /** 当前余额，员工账号不返回。 */
  balanceUsd?: number;
  /** 昨日实得，员工账号不返回。 */
  yesterdayUsd?: number;
  /** 本月至今实得，员工账号不返回。 */
  monthToDateUsd?: number;
}

export function getOverview(): Promise<DashboardOverview> {
  return http.get<DashboardOverview>("/publisher/dashboard/overview");
}

/* ─── 数据趋势（§1.2） ─────────────────────────────────────────── */

/** 趋势指标（后端取值） */
export type TrendMetric = "play" | "like" | "collect";
/** 趋势区间 */
export type TrendRange = 7 | 30;

/** 单日趋势点 */
export interface TrendPoint {
  /** 日期标签，如 "06-04" */
  date: string;
  value: number;
}

export interface DashboardTrend {
  metric: TrendMetric;
  /** 区间累计（图例：近7天播放 16,300） */
  total: number;
  points: TrendPoint[];
}

export function getTrend(metric: TrendMetric, range: TrendRange): Promise<DashboardTrend> {
  return http.get<DashboardTrend>("/publisher/dashboard/trend", {
    params: { metric, range },
  });
}

/* ─── 剧集数据排行（§1.3） ───────────────────────────────────── */

export interface RankingItem {
  rank: number;
  /** 名次趋势：1上升 / -1下降 / 0持平或新剧 */
  rankTrend: 1 | -1 | 0;
  /** 上期名次；新剧无历史快照时为 null */
  lastRank: number | null;
  courseId: number;
  title: string;
  /** 集数 */
  episodeCount: number;
  /** 总播放量 */
  playCount: number;
  likeCount: number;
  collectCount: number;
  commentCount: number;
  /** 分享数（埋点上线前为 0） */
  shareCount: number;
}

export interface RankingResult {
  /** 该账户可见剧总数 */
  totalCount: number;
  list: RankingItem[];
}

/** 剧集数据排行（默认按播放量降序）。 */
export function getRanking(limit = 10, sort: "play" = "play"): Promise<RankingResult> {
  return http.get<RankingResult>("/publisher/dashboard/ranking", {
    params: { sort, limit },
  });
}

/* ─── 各剧集播放量对比（§1.4） ───────────────────────────────── */

export interface PlayCompareItem {
  courseId: number;
  title: string;
  playCount: number;
}

/** 各剧播放量对比（降序取前 N）。data.list[] */
export function getPlayCompare(limit = 5): Promise<PlayCompareItem[]> {
  return http
    .get<{ list: PlayCompareItem[] }>("/publisher/dashboard/playCompare", {
      params: { limit },
    })
    .then((d) => d.list);
}
