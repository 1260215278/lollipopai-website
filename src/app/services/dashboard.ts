/**
 * 数据概览服务（mock + 真接口并存，开关切换）
 * ------------------------------------------------------------------
 * 概览接口后端尚未定义，故默认走本地 mock；接口就绪后设 VITE_USE_MOCK=false
 * 即切真实分支，业务/页面代码无需改动。
 *   const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
 * 真实分支复用 http.ts（/sqx_fast + token + {code,msg,data} 解包 + 错误 toast）。
 *
 * 字段口径来自原型 `dashboard/HomePage.tsx`，不编造、不在 any 上猜字段；
 * 草案见仓库根 `contract-draft-overview.md`，待后端确认后锁定。
 */
import { http } from "./http";
import { dashboardMock } from "../distribution/mock/dashboard";

/** 涨跌方向 */
export type TrendDirection = "up" | "down";

/** 趋势可切换的指标维度 */
export type TrendMetric = "plays" | "likes" | "favs";

/** 趋势可切换的周期（近 7 天 / 近 30 天） */
export type TrendPeriod = "7" | "30";

/** 单日趋势点：日期标签 + 三项指标原始数值 */
export interface TrendPoint {
  /** 日期标签，如 "6/10" */
  date: string;
  /** 当日播放量 */
  plays: number;
  /** 当日点赞数 */
  likes: number;
  /** 当日收藏数 */
  favs: number;
}

/** 顶部统计卡：上剧总数（含本月新增数量） */
export interface TotalDramasStat {
  /** 上剧总数 */
  value: number;
  /** 本月新增部数 */
  monthlyAdded: number;
}

/** 顶部统计卡：累计指标（含较上月环比百分比） */
export interface CumulativeStat {
  /** 累计原始数值 */
  value: number;
  /** 较上月环比百分比（正数为增长，如 23.4 表示 +23.4%） */
  momPercent: number;
}

/** 顶部四张统计卡 */
export interface DashboardStats {
  totalDramas: TotalDramasStat;
  totalViews: CumulativeStat;
  totalLikes: CumulativeStat;
  totalFavorites: CumulativeStat;
}

/** 7/30 日趋势数据 */
export interface DashboardTrend {
  "7": TrendPoint[];
  "30": TrendPoint[];
}

/** 剧集排行单行 */
export interface DramaRankItem {
  /** 排名（从 1 起） */
  rank: number;
  /** 剧集名称 */
  title: string;
  /** 集数 */
  episodes: number;
  /** 总播放量（原始数值） */
  plays: number;
  /** 点赞数（原始数值） */
  likes: number;
  /** 收藏数（原始数值） */
  favs: number;
  /** 评论数（原始数值） */
  comments: number;
  /** 分享数（原始数值） */
  shares: number;
  /** 排名涨跌 */
  trend: TrendDirection;
}

/** 数据概览聚合响应 */
export interface DashboardData {
  stats: DashboardStats;
  trend: DashboardTrend;
  ranking: DramaRankItem[];
}

/** 业务数据 mock 开关（默认开；显式设为 'false' 才走真接口） */
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

/** mock 网络延迟，便于演示 loading 态 */
function delay<T>(value: T, ms = 360): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/**
 * 获取数据概览（统计卡 + 7/30 日趋势 + 剧集排行）。
 * - mock：返回本地数据（含模拟延迟）。
 * - 真接口（草案）：GET /app/publisher/dashboard/overview。
 */
export function getDashboardOverview(): Promise<DashboardData> {
  if (USE_MOCK) {
    return delay(dashboardMock);
  }
  return http.get<DashboardData>("/app/publisher/dashboard/overview");
}
