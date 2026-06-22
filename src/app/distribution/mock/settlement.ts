/**
 * 结算中心 mock 数据
 * ------------------------------------------------------------------
 * 字段语义来自原型三页（PaymentPage / EarningsPage / WithdrawPage）与 figma
 * 15150-* / 15151-* / 15135-27153 / 15188-33359。结算接口尚未定义，全部走 mock；
 * 接口就绪后由 services/settlement.ts 的 http 真实分支替换，本文件仅供 mock 分支使用。
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
  totalCumulative: 7501.5,
  withdrawable: 3444.0,
  processing: 257.0,
  withdrawn: 3800.5,
  relatedDramas: 3,
  estThisMonth: 1684.5,
  bills: 7,
  // 本月较上月增长百分比（正数为增长）
  growthRate: 41.4,
  // 月度收益趋势：1-12 月，单位元（figma 柱状图 1月~12月）
  monthlyTrend: [
    { month: 1, total: 0 },
    { month: 2, total: 320 },
    { month: 3, total: 680 },
    { month: 4, total: 1240 },
    { month: 5, total: 3680 },
    { month: 6, total: 2150 },
    { month: 7, total: 0 },
    { month: 8, total: 0 },
    { month: 9, total: 0 },
    { month: 10, total: 0 },
    { month: 11, total: 0 },
    { month: 12, total: 0 },
  ],
};

/**
 * 收益明细：按 yyyy-MM 归集（figma 15135-27153 月份 Tab + 明细表）。
 * type：'full'=全量推荐订阅(4:6) / 'account'=账户主页订阅(2:8)。
 * status：'settled'=已结算 / 'processing'=结算中 / 'pending'=待结算。
 */
export const mockEarningsDetail: EarningsDetailRow[] = [
  { month: "2026-06", drama: "星河恋人", type: "full", ratio: "60%", views: "112.3万", amount: 1684.5, status: "processing" },
  { month: "2026-05", drama: "星河恋人", type: "full", ratio: "60%", views: "148.2万", amount: 2160.0, status: "settled" },
  { month: "2026-05", drama: "穿越千年寻你", type: "account", ratio: "80%", views: "92.6万", amount: 1200.0, status: "settled" },
  { month: "2026-05", drama: "总裁的秘密", type: "full", ratio: "60%", views: "67.4万", amount: 257.0, status: "processing" },
  { month: "2026-04", drama: "星河恋人", type: "full", ratio: "60%", views: "108.1万", amount: 1621.5, status: "settled" },
  { month: "2026-04", drama: "穿越千年寻你", type: "account", ratio: "80%", views: "71.2万", amount: 1200.0, status: "settled" },
  { month: "2026-03", drama: "星河恋人", type: "full", ratio: "60%", views: "89.6万", amount: 1344.0, status: "settled" },
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
  { id: "ST20260610001", date: "2026-06-10", period: "2026-05", ratio: "4：6", type: "full", accountType: "cn", accountNo: "****4567", amount: 2160.0, status: "unpaid" },
  { id: "ST20260610002", date: "2026-06-10", period: "2026-05", ratio: "2：8", type: "account", accountType: "cn", accountNo: "****4567", amount: 1200.0, status: "unpaid" },
  { id: "ST20260515001", date: "2026-05-15", period: "2026-04", ratio: "4：6", type: "full", accountType: "overseas", accountNo: "****4567", amount: 1621.5, status: "paid" },
  { id: "ST20260515002", date: "2026-05-15", period: "2026-04", ratio: "2：8", type: "account", accountType: "overseas", accountNo: "****4567", amount: 1200.0, status: "paid" },
  { id: "ST20260415001", date: "2026-04-15", period: "2026-03", ratio: "4：6", type: "full", accountType: "cn", accountNo: "****4567", amount: 1344.0, status: "paid" },
];
