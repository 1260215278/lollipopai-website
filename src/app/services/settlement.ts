/**
 * 结算中心服务（收款管理 / 收益明细 / 结算记录）
 * ------------------------------------------------------------------
 * 路径前缀全部走发行中心 publisher token 域 `/publisher/**`（见《前端反馈-20260630-后端契约》§6.1，
 * 此前误写成 `/app/publisher/**` 已纠正）。统一响应 {code,msg,data}，分页接口取 `page`。
 *
 * - 收款账号（bug21）/ 结算记录（bug22）：后端已提供完整字段契约 → 走真实接口（不再 mock）。
 * - 收益总览 / 收益明细 / 收益日志 / 剧目筛选：按《结算中心字段补充 - 后端契约（20260630）》切真。
 */
import { http } from "./http";
import type { PageResult } from "./content";

// ────────────────────────────────────────────────────────────────
// 收款管理（收款账户 CRUD，bug21）—— 真实接口
// ────────────────────────────────────────────────────────────────

/** 对公收款账户实体（后端 /publisher/payout/account 返回）。 */
export interface PayoutAccount {
  /** false=未添加(空态); true=已绑定 */
  bound: boolean;
  id?: number;
  publisherUserId?: number;
  /** 服务端按入驻资料回填，前端只读 */
  companyName: string;
  /** 银行账号；未绑定时 null */
  accountNo: string | null;
  /** 开户银行；未绑定时 null */
  bank: string | null;
  /** 支行名称；未绑定时 null */
  branch: string | null;
  /** 户名（本表单不采集） */
  accountHolder?: string | null;
  /** 币种，缺省 USD；未绑定时 null */
  currency: string | null;
  /** 0禁用 1启用；未绑定时 null */
  status: number | null;
  createTime?: string;
  updateTime?: string;
}

/** 新增 / 修改收款账户请求体（create/update 共用）。 */
export interface PayoutAccountBody {
  /** 银行账号，必填 ≤64 */
  accountNo: string;
  /** 开户银行，必填 ≤128 */
  bank: string;
  /** 支行名称 ≤255，可选 */
  branch?: string;
  /** 户名 ≤128，可选 */
  accountHolder?: string;
  /** 币种 ≤8，缺省 USD */
  currency?: string;
}

/** 查询当前收款账户（未绑定也返回对象，bound=false）。 */
export function getPayoutAccount(): Promise<PayoutAccount> {
  return http.get<PayoutAccount>("/publisher/payout/account");
}

/** 新建收款账户（已存在报 403315）。 */
export function addPayoutAccount(body: PayoutAccountBody): Promise<PayoutAccount> {
  return http.post<PayoutAccount>("/publisher/payout/account", body);
}

/** 更新收款账户（不存在报 403316）。 */
export function updatePayoutAccount(body: PayoutAccountBody): Promise<PayoutAccount> {
  return http.post<PayoutAccount>("/publisher/payout/account/update", body);
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
  /** 创作者分成百分比，80 或 60 */
  ratio: number;
  /** 该剧累计播放量（course.view_counts） */
  viewCount: number;
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
// 结算记录（列表 + 申请结算，bug22）—— 真实接口
// ────────────────────────────────────────────────────────────────

/** 结算单状态：0草稿 / 1已申请 / 2审核通过 / 3已打款 / 4驳回。 */
export type SettlementStatus = 0 | 1 | 2 | 3 | 4;

/** 结算单（后端 /publisher/settlement/records 行）。金额单位 USD。 */
export interface SettlementRecord {
  id: number;
  /** 结算周期起 yyyy-MM-dd */
  periodStart: string;
  /** 结算周期止 yyyy-MM-dd */
  periodEnd: string;
  /** 总额 */
  grossUsd: number;
  /** 出品方实得（已扣分润，发行方到手） */
  creatorUsd: number;
  /** 平台分成 */
  platformUsd: number;
  /** 分成比例文案，如 "8:2" */
  ratioLabel: string;
  /** 状态 0-4 */
  status: number;
  /** 驳回备注 */
  auditRemark: string | null;
  applyTime: string | null;
  payTime: string | null;
  /** 打款凭证 URL */
  payVoucherUrl: string | null;
  /** 申请时的收款账号快照 */
  accountSnapshot: string | null;
  createTime: string;
  updateTime: string;
}

/** 结算记录查询。status 不传=全部。 */
export interface SettlementRecordQuery {
  status?: number;
  page?: number;
  limit?: number;
}

/** 结算记录列表（分页）。注意：分页对象 {totalCount,list,...} 在 `data` 里（非顶层 page），用默认 pick:"data"。 */
export function getSettlementRecords(query: SettlementRecordQuery = {}): Promise<PageResult<SettlementRecord>> {
  return http.get<PageResult<SettlementRecord>>("/publisher/settlement/records", {
    params: { status: query.status, page: query.page ?? 1, limit: query.limit ?? 10 },
  });
}

/**
 * 申请结算（仅 status=0 草稿可申请）。
 * 成功返回新状态（status=1）的 record；异常 403317/403318/403319 由 http.ts toast 后端文案。
 */
export function applySettlement(recordId: number): Promise<SettlementRecord> {
  return http.post<SettlementRecord>("/publisher/settlement/apply", { recordId });
}
