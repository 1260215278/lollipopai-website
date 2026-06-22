/**
 * 结算中心服务（收款管理 / 收益明细 / 结算记录）
 * ------------------------------------------------------------------
 * 结算相关接口后端尚未定义（见《开发计划-短剧发行中心.md》§6.2），故本服务
 * 采用「mock + VITE_USE_MOCK 开关」：默认 mock，接口就绪后逐个把 http 真实分支
 * 的路径/字段对齐《contract-draft-settlement.md》并切真，调用方（页面）无需改动。
 *
 * 约定（同 http.ts）：context-path=/sqx_fast（http 注入），鉴权 header: token，
 * 统一响应 {code,msg,data}，code=0 取 data，非 0 由 http.ts toast 后端 msg。
 *
 * 字段一律来自原型三页 + figma，未编造、无撒网式 fallback；接口未定的部分以
 * 精确 interface 收敛后再写逻辑。
 */
import { http } from "./http";
import {
  MOCK_COMPANY_NAME,
  getMockPayoutAccount,
  setMockPayoutAccount,
  mockEarningsSummary,
  mockEarningsDetail,
  mockSettlementRecords,
} from "../distribution/mock/settlement";

/** 默认走 mock；显式设置 VITE_USE_MOCK="false" 时走真实接口。 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

/** 模拟网络延迟，便于演示 loading 态。 */
function delay<T>(data: T, ms = 320): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

// ────────────────────────────────────────────────────────────────
// 收款管理（收款账户增删改查）
// ────────────────────────────────────────────────────────────────

/** 对公收款账户（figma 15150-30744/30884）。 */
export interface PayoutAccount {
  /** 公司名称（自动带入，只读） */
  companyName: string;
  /** 银行账号 */
  accountNo: string;
  /** 开户银行 */
  bank: string;
  /** 支行名称（选填） */
  branch?: string;
}

/** 新增 / 修改收款账户的请求体（公司名称后端按账号带入，不随表单提交银行账号以外的可改字段以外内容）。 */
export interface PayoutAccountBody {
  accountNo: string;
  bank: string;
  branch?: string;
}

/** 进入收款管理时获取已绑定账户（无则 null）。 */
export function getPayoutAccount(): Promise<PayoutAccount | null> {
  if (USE_MOCK) {
    return delay(getMockPayoutAccount());
  }
  return http.get<PayoutAccount | null>("/app/publisher/payout/account");
}

/** 新增收款账户（mock 写入内存存储并回显，公司名称用账号带入的固定值）。 */
export function addPayoutAccount(body: PayoutAccountBody): Promise<PayoutAccount> {
  if (USE_MOCK) {
    const account: PayoutAccount = { companyName: MOCK_COMPANY_NAME, ...body };
    setMockPayoutAccount(account);
    return delay(account);
  }
  return http.post<PayoutAccount>("/app/publisher/payout/account", body);
}

/** 修改收款账户。 */
export function updatePayoutAccount(body: PayoutAccountBody): Promise<PayoutAccount> {
  if (USE_MOCK) {
    const account: PayoutAccount = { companyName: MOCK_COMPANY_NAME, ...body };
    setMockPayoutAccount(account);
    return delay(account);
  }
  return http.post<PayoutAccount>("/app/publisher/payout/account/update", body);
}

/** 获取自动带入的公司名称（收款账户表单只读字段）。 */
export function getPayoutCompanyName(): Promise<string> {
  if (USE_MOCK) {
    return delay(MOCK_COMPANY_NAME);
  }
  return http.get<string>("/app/publisher/payout/company");
}

// ────────────────────────────────────────────────────────────────
// 收益明细（收益总览 + 按月查询）
// ────────────────────────────────────────────────────────────────

/** 月度收益趋势项（1-12 月）。 */
export interface MonthlyTrendItem {
  /** 月份 1-12 */
  month: number;
  /** 当月收益（元） */
  total: number;
}

/** 收益总览（figma 15135-27153 顶部统计卡）。 */
export interface EarningsSummary {
  /** 累计总收益 */
  totalCumulative: number;
  /** 可提现 */
  withdrawable: number;
  /** 结算中 */
  processing: number;
  /** 已提现 */
  withdrawn: number;
  /** 关联剧集数 */
  relatedDramas: number;
  /** 本月预估收益 */
  estThisMonth: number;
  /** 结算账单数 */
  bills: number;
  /** 本月较上月增长百分比 */
  growthRate: number;
  /** 月度收益趋势 */
  monthlyTrend: MonthlyTrendItem[];
}

/** 收益类型：全量推荐订阅 / 账户主页订阅。 */
export type EarningsType = "full" | "account";
/** 收益明细行状态：已结算 / 结算中 / 待结算。 */
export type EarningsRowStatus = "settled" | "processing" | "pending";

/** 收益明细行（figma 15135-27153 明细表）。 */
export interface EarningsDetailRow {
  /** 归集月份 yyyy-MM */
  month: string;
  /** 剧集名称 */
  drama: string;
  /** 收益类型 */
  type: EarningsType;
  /** 分成比例（出品方占比，如 "60%"） */
  ratio: string;
  /** 播放量（原始展示串，如 "112.3万"） */
  views: string;
  /** 结算金额（元） */
  amount: number;
  /** 状态 */
  status: EarningsRowStatus;
}

/** 获取收益总览。 */
export function getEarningsSummary(): Promise<EarningsSummary> {
  if (USE_MOCK) {
    return delay(mockEarningsSummary);
  }
  return http.get<EarningsSummary>("/app/publisher/earnings/summary");
}

/**
 * 按月查询收益明细。
 * @param month yyyy-MM；不传则返回全部（页面用全部数据派生可选月份 Tab）。
 */
export function getEarningsDetail(month?: string): Promise<EarningsDetailRow[]> {
  if (USE_MOCK) {
    const rows = month ? mockEarningsDetail.filter((r) => r.month === month) : mockEarningsDetail;
    return delay(rows);
  }
  return http.get<EarningsDetailRow[]>("/app/publisher/earnings/detail", {
    params: month ? { month } : undefined,
  });
}

// ────────────────────────────────────────────────────────────────
// 结算记录（列表 + 提交结算申请）
// ────────────────────────────────────────────────────────────────

/** 账户类型：中国公户 / 海外公户。 */
export type SettlementAccountType = "cn" | "overseas";
/** 结算记录状态：未打款 / 已打款。 */
export type SettlementStatus = "unpaid" | "paid";

/** 结算记录行（figma 15188-33359）。 */
export interface SettlementRecord {
  /** 记录 id */
  id: string;
  /** 结算日期 yyyy-MM-dd */
  date: string;
  /** 结算周期 yyyy-MM */
  period: string;
  /** 结算比例「平台：出品方」原始串（如 "4：6"） */
  ratio: string;
  /** 结算类型 */
  type: EarningsType;
  /** 账户类型 */
  accountType: SettlementAccountType;
  /** 账户号码（脱敏尾号，如 "****4567"） */
  accountNo: string;
  /** 结算金额（元） */
  amount: number;
  /** 结算状态 */
  status: SettlementStatus;
}

/** 获取结算记录列表。 */
export function getSettlementRecords(): Promise<SettlementRecord[]> {
  if (USE_MOCK) {
    return delay(mockSettlementRecords);
  }
  return http.get<SettlementRecord[]>("/app/publisher/settlement/records");
}

/**
 * 提交结算申请（figma 15188-33359 行内「申请结算」）。
 * @param recordId 目标结算记录 id。
 * mock 分支不修改后端状态，仅回执成功；页面据此乐观更新行状态/提示。
 */
export function applySettlement(recordId: string): Promise<void> {
  if (USE_MOCK) {
    return delay(undefined);
  }
  return http.post<void>("/app/publisher/settlement/apply", { recordId });
}
