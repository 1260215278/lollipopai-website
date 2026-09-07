/**
 * 结算中心服务（收款管理 / 收益明细 / 结算记录）
 * ------------------------------------------------------------------
 * 路径前缀全部走发行中心 publisher token 域 `/publisher/**`（见《前端反馈-20260630-后端契约》§6.1，
 * 此前误写成 `/app/publisher/**` 已纠正）。统一响应 {code,msg,data}，分页接口取 `page`。
 *
 * - 收款账号 / 结算管理：按《发行中心_结算管理与收款信息_前端对接_20260704》切真实多卡 + CNY 结算单接口。
 * - 收益总览 / 收益明细 / 收益日志 / 剧目筛选：按《结算中心字段补充 - 后端契约（20260630）》切真。
 */
import { http } from "./http";
import type { PageResult } from "./content";

// ────────────────────────────────────────────────────────────────
// 收款管理（收款账户 CRUD，bug21）—— 真实接口
// ────────────────────────────────────────────────────────────────

/** 对公收款账户实体（后端 /publisher/payout/account/list 返回）。 */
export interface PayoutAccount {
  id: number;
  companyName: string;
  accountNo: string;
  bank: string;
  branch?: string | null;
  isDefault: 0 | 1;
  status: number;
  createTime: string;
  updateTime: string;
}

export interface PayoutAccountList {
  companyName: string;
  list: PayoutAccount[];
}

/** 默认卡兼容接口（/publisher/payout/account）。 */
export interface DefaultPayoutAccount {
  bound: boolean;
  id?: number;
  companyName?: string;
  accountNo?: string | null;
  bank?: string | null;
  branch?: string | null;
  isDefault?: 0 | 1;
  status?: number | null;
}

/** 新增 / 修改收款账户请求体（create/update 共用）。 */
export interface PayoutAccountBody {
  id?: number;
  /** 银行账号，必填 ≤64 */
  accountNo: string;
  /** 开户银行，必填 ≤128 */
  bank: string;
  /** 支行名称 ≤255，可选 */
  branch?: string;
  /** 直接设为默认卡。 */
  isDefault?: boolean;
}

/** 查询收款账户列表（默认卡在前）。 */
export function getPayoutAccounts(): Promise<PayoutAccountList> {
  return http.get<PayoutAccountList>("/publisher/payout/account/list");
}

/** 查询默认收款账户（兼容/表单带入用）。 */
export function getPayoutAccount(): Promise<DefaultPayoutAccount> {
  return http.get<DefaultPayoutAccount>("/publisher/payout/account");
}

/** 新建收款账户（重复卡号报 403373）。 */
export function addPayoutAccount(body: PayoutAccountBody): Promise<PayoutAccount> {
  return http.post<PayoutAccount>("/publisher/payout/account", body);
}

/** 更新收款账户（不存在/不属于本账户报 403316）。 */
export function updatePayoutAccount(body: PayoutAccountBody): Promise<PayoutAccount> {
  return http.post<PayoutAccount>("/publisher/payout/account/update", body);
}

export function deletePayoutAccount(id: number): Promise<void> {
  return http.post<void>("/publisher/payout/account/delete", { id });
}

export function setDefaultPayoutAccount(id: number): Promise<void> {
  return http.post<void>("/publisher/payout/account/setDefault", { id });
}

// ────────────────────────────────────────────────────────────────
// 收益明细（收益总览 + 明细）—— 真实接口
// ────────────────────────────────────────────────────────────────

/** 月度收益趋势项（yyyy-MM）。 */
export interface MonthlyTrendItem {
  /** 月份 yyyy-MM */
  month: string;
  /** 当月出品方实得，USD */
  amountUsd: number;
}

/** 收益总览（/publisher/settlement/overview）。金额单位 USD。 */
export interface EarningsSummary {
  /** 累计实得（已扣分润） */
  totalCumulativeUsd: number;
  /** 当前可提现 */
  withdrawableUsd: number;
  /** 结算中（已申请待打款） */
  processingUsd: number;
  /** 已提现（已打款） */
  withdrawnUsd: number;
  /** 待入账（cron 跑前暂挂） */
  pendingUsd: number;
  /** 昨日实得 */
  yesterdayUsd: number;
  /** 本月至今实得 */
  estThisMonthUsd: number;
  /** 本月 vs 上月环比百分比；上月为 0 时返回 null */
  growthRate: number | null;
  /** 产生过收益的不同剧目数 */
  relatedDramas: number;
  /** 结算账单数（publisher_settlement_record 全状态未删条数） */
  settlementBillCount: number;
  /** 本年 1—12 月每月实得，固定 12 项、空月补 0、month 升序 */
  monthlyTrend: MonthlyTrendItem[];
  currency: "USD";
}

/** 发布范围：1 账号主页 / 2 全量推荐。 */
export type EarningsPublishScope = 1 | 2;

/** 收益明细行（/publisher/settlement/earnings）。金额单位 USD。 */
export interface EarningsDetailRow {
  /** 归集日期 yyyy-MM-dd */
  earnDate: string;
  courseId: number;
  courseTitle: string;
  courseImg: string;
  publishScope: EarningsPublishScope;
  /** creator:platform，如 "6:4"；publishScope 缺失时为 null */
  ratioLabel: string | null;
  /** 当日订单数 */
  orderCount: number;
  /** 当日总流水 */
  grossUsd: number;
  /** 当日出品方实得 */
  creatorUsd: number;
  /** 该剧全期创作者累计应得，USD；不随月份筛选变化。后端未返回时页面展示 --。 */
  totalCreatorUsd?: number | null;
  /** 该剧累计已打款结算金额，USD；不随月份筛选变化。后端未返回时页面展示 --。 */
  historySettledUsd?: number | null;
  /** 创作者分成百分比，80 或 60 */
  ratio: number;
  /** 该剧累计播放量（course.view_counts） */
  viewCount: number;
  /** 该剧当日播放量；当日无快照时为 null */
  dailyViewCount: number | null;
  /** 结算状态：0待结算 / 1结算中 / 2已结算 */
  settleStatus: 0 | 1 | 2;
}

/** 收益明细分页数据（分页对象在 data 内）。 */
export interface EarningsDetailPage {
  totalCount: number;
  list: EarningsDetailRow[];
}

/** 收益明细查询。 */
export interface EarningsDetailQuery {
  page?: number;
  limit?: number;
  /** yyyy-MM-dd */
  startDate?: string;
  /** yyyy-MM-dd */
  endDate?: string;
  courseId?: number;
  /** 剧名模糊搜索 */
  keyword?: string;
}

/** 收益日志行（/publisher/settlement/earnings/log）。金额单位 USD。 */
export interface EarningsLogRow {
  payTime: string;
  country: string;
  courseDetailsId: number | null;
  grossUsd: number;
  creatorUsd: number;
  ratio: number;
}

/** 收益日志分页数据。 */
export interface EarningsLogPage {
  totalCount: number;
  list: EarningsLogRow[];
}

/** 收益日志查询。 */
export interface EarningsLogQuery {
  courseId: number;
  /** yyyy-MM-dd */
  earnDate: string;
  page?: number;
  limit?: number;
}

/** 收益剧目筛选项。 */
export interface EarningsCourseOption {
  courseId: number;
  courseTitle: string;
}

/** 获取收益总览。 */
export function getEarningsSummary(): Promise<EarningsSummary> {
  return http.get<EarningsSummary>("/publisher/settlement/overview");
}

/** 查询有收益数据的月份（倒序、跨年）。 */
export function getEarningsMonths(): Promise<string[]> {
  return http.get<string[]>("/publisher/settlement/earnings/months");
}

/** 查询收益明细。 */
export function getEarningsDetail(query: EarningsDetailQuery = {}): Promise<EarningsDetailPage> {
  return http.get<EarningsDetailPage>("/publisher/settlement/earnings", {
    params: {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      startDate: query.startDate,
      endDate: query.endDate,
      courseId: query.courseId,
      keyword: query.keyword,
    },
  });
}

/** 查询某剧某日收益日志。 */
export function getEarningsLog(query: EarningsLogQuery): Promise<EarningsLogPage> {
  return http.get<EarningsLogPage>("/publisher/settlement/earnings/log", {
    params: {
      courseId: query.courseId,
      earnDate: query.earnDate,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    },
  });
}

/** 查询收益明细筛选剧目。 */
export function getEarningsCoursesDropdown(): Promise<EarningsCourseOption[]> {
  return http.get<EarningsCourseOption[]>("/publisher/settlement/courses");
}

// ────────────────────────────────────────────────────────────────
// 会员相关（订阅池分账，看剧会员 P4）—— 真实接口
// 契约：后端设计稿《2026-09-04 看剧会员/自动续费/订阅池分账》§4.4，字段以下方 interface 注释为准。
// 后端未上线前接口 404/异常：本层吞掉 toast、返回空，由页面展示空态。
// ────────────────────────────────────────────────────────────────

/** 会员分账月度行（/publisher/vipPool/months）。金额 USD。 */
export interface VipPoolMonthRow {
  /** 月份 yyyy-MM */
  periodMonth: string;
  /** 本月在本账户剧上有有效播放的去重会员数 */
  memberCount: number;
  /** 当月本账户订阅池分账合计（status=0 为预估、1 为入账定值） */
  creatorUsd: number;
  /** 环比百分比（正数为增长），首月无对比为 null */
  momRate: number | null;
  /** 0 预估 / 1 已入账 */
  status: 0 | 1;
  /** 本账户当月有效播放秒数 */
  effectiveSeconds: number;
}

/** 某月每剧明细行（/publisher/vipPool/courses）。 */
export interface VipPoolCourseRow {
  courseId: number;
  courseName: string;
  courseImg?: string | null;
  /** 1 账号主页 / 2 全量推荐（与收益明细 publishScope 同口径） */
  publishScope: 1 | 2;
  /** 剧方分成比例（剧方所得），0–1 小数或 0–100 百分数（页面两种都兼容） */
  creatorRatio: number;
  effectiveSeconds: number;
  /** 该剧有效时长占全平台百分比 */
  sharePct: number;
  memberCount: number;
  creatorUsd: number;
  status: 0 | 1;
}

/** 本月至今实时汇总（/publisher/vipPool/current）。 */
export interface VipPoolCurrent {
  periodMonth: string;
  effectiveSeconds: number;
  /** 本账户有效时长占全平台百分比 */
  platformSharePct: number;
  /** 预估分账 USD */
  estimatedUsd: number;
  /** 刷新时间 yyyy-MM-dd HH:mm:ss */
  refreshTime: string;
}

export interface VipPoolMonthsQuery {
  page?: number;
  limit?: number;
}

const EMPTY_PAGE = { totalCount: 0, pageSize: 10, totalPage: 0, currPage: 1, list: [] };

/** 会员相关月度列表（倒序）。接口不可用时返回空页。 */
export async function getVipPoolMonths(query: VipPoolMonthsQuery = {}): Promise<PageResult<VipPoolMonthRow>> {
  try {
    const res = await http.get<PageResult<VipPoolMonthRow>>("/publisher/vipPool/months", {
      params: { page: query.page ?? 1, limit: query.limit ?? 10 },
      toastOnError: false,
    });
    return res && Array.isArray(res.list) ? res : { ...EMPTY_PAGE, list: [] };
  } catch {
    return { ...EMPTY_PAGE, list: [] };
  }
}

/** 某月每剧明细。接口不可用时返回空数组。 */
export async function getVipPoolCourses(month: string): Promise<VipPoolCourseRow[]> {
  try {
    const res = await http.get<VipPoolCourseRow[]>("/publisher/vipPool/courses", {
      params: { month },
      toastOnError: false,
    });
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

/** 本月至今实时汇总。接口不可用或无数据返回 null。 */
export async function getVipPoolCurrent(): Promise<VipPoolCurrent | null> {
  try {
    const res = await http.get<VipPoolCurrent | null>("/publisher/vipPool/current", { toastOnError: false });
    return res && typeof res === "object" && res.periodMonth ? res : null;
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────────────────────────
// 结算记录（列表 + 申请结算，bug22）—— 真实接口
// ────────────────────────────────────────────────────────────────

/** 结算单状态：1已申请 / 2审核通过待打款 / 3已打款 / 4驳回或打款失败。 */
export type SettlementStatus = 1 | 2 | 3 | 4;
export type SettlementStatusGroup = "applied" | "settled" | "failed";
export type SettlementBlockReason = "NO_PAYOUT_ACCOUNT" | "ALREADY_APPLIED_THIS_MONTH" | "NO_SETTLEABLE_EARNINGS";

export interface SettlementSummary {
  hasPayoutAccount: boolean;
  canApply: boolean;
  resubmit: boolean;
  blockReason: SettlementBlockReason | null;
  totalSettledCny: number;
  settledCount: number;
  pendingMonths: string[];
  pendingTotalCny: number;
  payoutAccount: {
    bank: string;
    accountNoMasked: string;
  } | null;
  currency: "CNY";
}

export interface SettlementApplyResult {
  orderNo: string;
  periodMonth: string;
  publishScope: EarningsPublishScope;
  ratioLabel: string;
  creatorCny: number;
}

/** 结算单（后端 /publisher/settlement/records 行）。金额单位 CNY。 */
export interface SettlementRecord {
  id: number;
  orderNo: string;
  periodMonth: string;
  publishScope: EarningsPublishScope;
  ratioLabel: string;
  creatorCny: number;
  status: SettlementStatus;
  statusGroup: SettlementStatusGroup;
  /** 驳回备注 */
  auditRemark: string | null;
  applyTime: string | null;
  payTime: string | null;
  accountNoMasked: string | null;
}

export interface SettlementRecordDetail extends SettlementRecord {
  grossCny: number;
  platformCny: number;
  creatorUsd: number;
  rateSnapshot: number;
  accountSnapshot: string | null;
  auditTime: string | null;
  /** 打款凭证 URL */
  payVoucherUrl: string | null;
  items: SettlementRecordItem[];
}

export interface SettlementRecordItem {
  courseId: number;
  periodMonth: string;
  publishScope: EarningsPublishScope;
  orderCount: number;
  grossUsd: number;
  creatorUsd: number;
  grossCny: number;
  creatorCny: number;
}

export interface SettlementChartSeries {
  courseId: number;
  courseName: string;
  points: number[];
  totalCny: number;
  cumulativeCny: number;
}

export interface SettlementChart {
  months: string[];
  series: SettlementChartSeries[];
}

/** 结算记录查询。status 不传=全部。 */
export interface SettlementRecordQuery {
  status?: SettlementStatus;
  keyword?: string;
  scope?: EarningsPublishScope;
  page?: number;
  limit?: number;
}

/** 结算记录列表（分页）。注意：分页对象 {totalCount,list,...} 在 `data` 里（非顶层 page），用默认 pick:"data"。 */
export function getSettlementRecords(query: SettlementRecordQuery = {}): Promise<PageResult<SettlementRecord>> {
  return http.get<PageResult<SettlementRecord>>("/publisher/settlement/records", {
    params: {
      status: query.status,
      keyword: query.keyword,
      scope: query.scope,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    },
  });
}

export function getSettlementSummary(): Promise<SettlementSummary> {
  return http.get<SettlementSummary>("/publisher/settlement/summary");
}

export function applySettlement(): Promise<SettlementApplyResult[]> {
  return http.post<SettlementApplyResult[]>("/publisher/settlement/apply");
}

export function getSettlementRecordDetail(id: number): Promise<SettlementRecordDetail> {
  return http.get<SettlementRecordDetail>(`/publisher/settlement/records/${id}`);
}

export interface SettlementChartQuery {
  startMonth?: string;
  endMonth?: string;
  courseIds?: number[];
}

export function getSettlementChart(query: SettlementChartQuery = {}): Promise<SettlementChart> {
  return http.get<SettlementChart>("/publisher/settlement/chart", {
    params: {
      startMonth: query.startMonth,
      endMonth: query.endMonth,
      courseIds: query.courseIds?.join(","),
    },
  });
}
