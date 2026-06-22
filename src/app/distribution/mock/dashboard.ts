/**
 * 数据概览 mock 数据
 * ------------------------------------------------------------------
 * 字段与数值均来自原型 `dashboard/HomePage.tsx`（Figma 15077-19718 的实现底子），
 * 不编造字段、不撒网 fallback。接口契约见仓库根 `contract-draft-overview.md`。
 *
 * 数值口径：
 *  - 统计卡用「原始数值 + 变化百分比/数量」，由页面按当前语言格式化展示
 *    （Figma 简中稿展示 380.2万 / 本月新增 2 部 / 较上月 +23.4%）。
 *  - 趋势/排行的播放量等同样存原始数值，页面统一做紧凑数字格式化。
 */
import type { DashboardData } from "../../services/dashboard";

/** 近 7 天趋势（原型 trendData7，逐日） */
const trend7 = [
  { date: "6/4", plays: 1240, likes: 380, favs: 210 },
  { date: "6/5", plays: 1820, likes: 540, favs: 310 },
  { date: "6/6", plays: 1560, likes: 420, favs: 270 },
  { date: "6/7", plays: 2340, likes: 780, favs: 490 },
  { date: "6/8", plays: 3100, likes: 1020, favs: 640 },
  { date: "6/9", plays: 2760, likes: 890, favs: 570 },
  { date: "6/10", plays: 3480, likes: 1150, favs: 730 },
];

/** 近 30 天趋势（原型 trendData30，隔日采样） */
const trend30 = [
  { date: "5/11", plays: 800, likes: 200, favs: 120 },
  { date: "5/13", plays: 1100, likes: 310, favs: 180 },
  { date: "5/15", plays: 950, likes: 260, favs: 155 },
  { date: "5/17", plays: 1400, likes: 420, favs: 240 },
  { date: "5/19", plays: 1650, likes: 510, favs: 295 },
  { date: "5/21", plays: 1200, likes: 350, favs: 200 },
  { date: "5/23", plays: 1900, likes: 580, favs: 340 },
  { date: "5/25", plays: 2100, likes: 640, favs: 390 },
  { date: "5/27", plays: 1800, likes: 540, favs: 320 },
  { date: "5/29", plays: 2400, likes: 730, favs: 450 },
  { date: "5/31", plays: 2700, likes: 820, favs: 510 },
  { date: "6/2", plays: 2300, likes: 700, favs: 430 },
  { date: "6/4", plays: 3000, likes: 920, favs: 580 },
  { date: "6/6", plays: 2800, likes: 860, favs: 530 },
  { date: "6/8", plays: 3480, likes: 1150, favs: 730 },
];

/**
 * 剧集数据排行（原型 dramaRankData，按播放量降序）。
 * plays/likes/favs 为原始数值；comments/shares 同；trend 涨跌。
 * Figma 展示：星河恋人 148.2万 / ♡3.2万 / ☆1.8万 / 评论 4,521 / 分享 9,830。
 */
const ranking: DashboardData["ranking"] = [
  { rank: 1, title: "星河恋人", episodes: 24, plays: 1482000, likes: 32000, favs: 18000, comments: 4521, shares: 9830, trend: "up" },
  { rank: 2, title: "穿越千年寻你", episodes: 36, plays: 926000, likes: 21000, favs: 12000, comments: 2870, shares: 5640, trend: "up" },
  { rank: 3, title: "总裁的秘密", episodes: 18, plays: 674000, likes: 15000, favs: 8900, comments: 1980, shares: 3210, trend: "down" },
  { rank: 4, title: "盛夏光年", episodes: 30, plays: 431000, likes: 9800, favs: 5600, comments: 1320, shares: 2180, trend: "up" },
  { rank: 5, title: "错位时空", episodes: 12, plays: 289000, likes: 6200, favs: 3400, comments: 890, shares: 1450, trend: "down" },
];

/**
 * 完整 mock 概览数据。
 * 统计卡数值对齐 Figma：上剧总数 5（本月新增 2）、累计播放 380.2万（+23.4%）、
 * 累计点赞 13.8万（+18.7%）、累计收藏 7.6万（+15.2%）。
 */
export const dashboardMock: DashboardData = {
  stats: {
    totalDramas: { value: 5, monthlyAdded: 2 },
    totalViews: { value: 3802000, momPercent: 23.4 },
    totalLikes: { value: 138000, momPercent: 18.7 },
    totalFavorites: { value: 76000, momPercent: 15.2 },
  },
  trend: {
    "7": trend7,
    "30": trend30,
  },
  ranking,
};
