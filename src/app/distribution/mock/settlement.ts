/**
 * 结算中心 mock 数据
 * ------------------------------------------------------------------
 * 字段语义来自原型三页（PaymentPage / EarningsPage / WithdrawPage）与 figma
 * 15150-* / 15151-* / 15135-27153 / 15188-33359。本文件仅供本地演示或回退调试使用；
 * 真实业务已由 services/settlement.ts 对接 `/publisher/**`。
 *
 * 注意：可见的中文标签（收益类型 / 状态 / 账户类型等）不在此处写死，
 * 由各页面经 i18n（messages.distribution.*）渲染；这里只存「枚举值 + 数值/原始串」。
 */
import type {
  PayoutAccount,
  EarningsSummary,
  EarningsDetailRow,
  SettlementRecord,
} from "../../services/settlement";

/** 当前登录企业名称（真实场景由账号信息接口下发，mock 固定）。 */
export const MOCK_COMPANY_NAME = "北京星河文化传媒有限公司";

/**
 * 已绑定收款账户的内存存储（仅 mock 演示用）。
 * 默认 null —— 进入收款管理先看到「尚未添加收款账户」空态；在「收款管理」添加后，
 * service 写入此处，使「收益明细 / 结算记录」在同一会话内联动展示数据态（替代真实接口前的演示链路）。
 * 真实接口接入后此存储不再使用（service 走 http 分支）。
 */
let payoutAccountStore: PayoutAccount | null = null;

/** 读取当前 mock 收款账户。 */
export function getMockPayoutAccount(): PayoutAccount | null {
  return payoutAccountStore;
}

/** 写入 mock 收款账户（新增 / 修改时调用）。 */
export function setMockPayoutAccount(account: PayoutAccount): void {
  payoutAccountStore = account;
}

/** 收益总览统计（figma 15135-27153 顶部卡片）。 */
export const mockEarningsSummary: EarningsSummary = {
  totalCumulativeUsd: 7501.5,
  withdrawableUsd: 3444.0,
  processingUsd: 257.0,
  withdrawnUsd: 3800.5,
  pendingUsd: 98.4,
  yesterdayUsd: 42.6,
  estThisMonthUsd: 1684.5,
  // 本月较上月增长百分比（正数为增长）
  growthRate: 41.4,
  relatedDramas: 3,
  // 月度收益趋势：yyyy-MM，单位 USD
  monthlyTrend: [
    { month: "2026-01", amountUsd: 0 },
    { month: "2026-02", amountUsd: 320 },
    { month: "2026-03", amountUsd: 680 },
    { month: "2026-04", amountUsd: 1240 },
    { month: "2026-05", amountUsd: 3680 },
    { month: "2026-06", amountUsd: 2150 },
  ],
  currency: "USD",
};

/**
 * 收益明细：按日归集（figma 15135-27153 月份 Tab + 明细表）。
 * publishScope：1=账号主页(8:2) / 2=全量推荐(6:4)。
 */
export const mockEarningsDetail: EarningsDetailRow[] = [
  { earnDate: "2026-06-29", courseId: 101, courseTitle: "星河恋人", courseImg: "", publishScope: 2, ratioLabel: "6:4", orderCount: 12, grossUsd: 2807.5, creatorUsd: 1684.5, ratio: 60 },
  { earnDate: "2026-05-28", courseId: 101, courseTitle: "星河恋人", courseImg: "", publishScope: 2, ratioLabel: "6:4", orderCount: 18, grossUsd: 3600.0, creatorUsd: 2160.0, ratio: 60 },
  { earnDate: "2026-05-26", courseId: 102, courseTitle: "穿越千年寻你", courseImg: "", publishScope: 1, ratioLabel: "8:2", orderCount: 10, grossUsd: 1500.0, creatorUsd: 1200.0, ratio: 80 },
  { earnDate: "2026-05-21", courseId: 103, courseTitle: "总裁的秘密", courseImg: "", publishScope: 2, ratioLabel: "6:4", orderCount: 5, grossUsd: 428.33, creatorUsd: 257.0, ratio: 60 },
  { earnDate: "2026-04-18", courseId: 101, courseTitle: "星河恋人", courseImg: "", publishScope: 2, ratioLabel: "6:4", orderCount: 14, grossUsd: 2702.5, creatorUsd: 1621.5, ratio: 60 },
  { earnDate: "2026-04-11", courseId: 102, courseTitle: "穿越千年寻你", courseImg: "", publishScope: 1, ratioLabel: "8:2", orderCount: 8, grossUsd: 1500.0, creatorUsd: 1200.0, ratio: 80 },
  { earnDate: "2026-03-09", courseId: 101, courseTitle: "星河恋人", courseImg: "", publishScope: 2, ratioLabel: "6:4", orderCount: 11, grossUsd: 2240.0, creatorUsd: 1344.0, ratio: 60 },
];

/**
 * 结算记录（figma 15188-33359）。
 * ratio：结算比例「平台：出品方」原始串（如 "4：6"）。
 * type：'full'=全量推荐订阅 / 'account'=账户主页订阅。
 * accountType：'cn'=中国公户 / 'overseas'=海外公户。
 * accountNo：账户号码尾号（已脱敏，如 "****4567"）。
 * status：'unpaid'=未打款 / 'paid'=已打款。
 */
export const mockSettlementRecords: SettlementRecord[] = [
  { id: 1001, periodStart: "2026-05-01", periodEnd: "2026-05-31", grossUsd: 3600.0, creatorUsd: 2160.0, platformUsd: 1440.0, ratioLabel: "6:4", status: 1, auditRemark: null, applyTime: "2026-06-10 09:30:00", payTime: null, payVoucherUrl: null, accountSnapshot: null, createTime: "2026-06-10 09:00:00", updateTime: "2026-06-10 09:30:00" },
  { id: 1002, periodStart: "2026-05-01", periodEnd: "2026-05-31", grossUsd: 1500.0, creatorUsd: 1200.0, platformUsd: 300.0, ratioLabel: "8:2", status: 1, auditRemark: null, applyTime: "2026-06-10 09:30:00", payTime: null, payVoucherUrl: null, accountSnapshot: null, createTime: "2026-06-10 09:00:00", updateTime: "2026-06-10 09:30:00" },
  { id: 1003, periodStart: "2026-04-01", periodEnd: "2026-04-30", grossUsd: 2702.5, creatorUsd: 1621.5, platformUsd: 1081.0, ratioLabel: "6:4", status: 3, auditRemark: null, applyTime: "2026-05-15 09:30:00", payTime: "2026-05-18 15:00:00", payVoucherUrl: null, accountSnapshot: null, createTime: "2026-05-15 09:00:00", updateTime: "2026-05-18 15:00:00" },
  { id: 1004, periodStart: "2026-04-01", periodEnd: "2026-04-30", grossUsd: 1500.0, creatorUsd: 1200.0, platformUsd: 300.0, ratioLabel: "8:2", status: 3, auditRemark: null, applyTime: "2026-05-15 09:30:00", payTime: "2026-05-18 15:00:00", payVoucherUrl: null, accountSnapshot: null, createTime: "2026-05-15 09:00:00", updateTime: "2026-05-18 15:00:00" },
  { id: 1005, periodStart: "2026-03-01", periodEnd: "2026-03-31", grossUsd: 2240.0, creatorUsd: 1344.0, platformUsd: 896.0, ratioLabel: "6:4", status: 3, auditRemark: null, applyTime: "2026-04-15 09:30:00", payTime: "2026-04-18 15:00:00", payVoucherUrl: null, accountSnapshot: null, createTime: "2026-04-15 09:00:00", updateTime: "2026-04-18 15:00:00" },
];
