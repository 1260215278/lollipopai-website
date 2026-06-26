/**
 * 发行者入驻服务（真接口，严格按《发行者入驻-前端接口.md》）
 * ------------------------------------------------------------------
 * 全局 context-path=/sqx_fast（由 http.ts 注入），鉴权 header: token。
 * 统一响应 {code,msg,data}：code=0 成功；非 0 时 http.ts 已 toast 后端翻译好的 msg。
 * 错误码（后端返回 msg 可直接展示）：
 *   401923 未勾选协议 / 401924 重复提交 / 401925 已是发行者 / 401926 手机号空 /
 *   40023 验证码错误 / 401179 验证码过期 / 40021 手机号占用 / 40034 发码频繁
 */
import { http } from "./http";

/** 申请详情对象（status.apply / 列表 records[]） */
export interface PublisherApply {
  id?: number;
  userId?: number;
  phone?: string;
  companyName?: string;
  businessLicense?: string;
  legalPersonName?: string;
  legalPersonIdNo?: string;
  idCardFront?: string;
  idCardBack?: string;
  agreementAgreed?: number;
  auditStatus?: number;
  rejectReason?: string | null;
  auditorId?: number;
  auditTime?: string;
  /** swift 租户字段（2026-06-26 新增；审核通过后异步开通，见接口文档 §2.6/§3.6） */
  tenantId?: string;
  /** swift 登录账号（手机号） */
  tenantUsername?: string;
  /** swift 同步状态：0=未同步 1=成功 2=失败 */
  tenantSyncStatus?: number;
  tenantSyncTime?: string;
  tenantSyncMsg?: string;
  createTime?: string;
  updateTime?: string;
}

/** GET /app/publisher/status 响应 */
export interface PublisherStatus {
  /** null=未申请 0=待审核 1=已通过 2=已驳回 */
  auditStatus: number | null;
  /** 驳回原因（仅 auditStatus=2 有值） */
  rejectReason: string | null;
  /** 0=否 1=是（已是发行者） */
  isPublisher: number;
  /** 申请详情，未申请为 null，可用于回填 */
  apply: PublisherApply | null;
}

/** POST /app/publisher/submit 请求体（8 字段，严格按接口文档，不增不改） */
export interface PublisherSubmitBody {
  /** 条件必填：账号已绑定手机号可空；未绑定必填 */
  phone?: string;
  /** 手机验证码 */
  code: string;
  companyName: string;
  /** 营业执照图片 URL */
  businessLicense: string;
  legalPersonName: string;
  legalPersonIdNo: string;
  /** 身份证人像面 URL */
  idCardFront: string;
  /** 身份证国徽面 URL */
  idCardBack: string;
  /** 是否同意合作协议，必须为 1 */
  agreementAgreed: number;
}

/** 入驻状态机审核态枚举 */
export const AuditStatus = {
  NOT_APPLIED: null as null,
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
} as const;

/** 查询入驻状态（进页面先调用，决定展示哪种状态） */
export function getPublisherStatus(): Promise<PublisherStatus> {
  return http.get<PublisherStatus>("/app/publisher/status");
}

/** GET /app/publisher/tenantStatus 响应（swift 租户开通状态，2026-06-26 新增；需登录） */
export interface PublisherTenantStatus {
  /** 是否有入驻申请记录（无则其余字段为 null） */
  hasRecord: boolean;
  /** null=无记录 0=未同步（审核未过/排队中）1=开通成功 2=开通失败（后台自动重试） */
  tenantSyncStatus: number | null;
  /** 开通成功后的 swift 租户编号 */
  tenantId: string | null;
  /** 最近一次同步结果/失败原因 */
  tenantSyncMsg: string | null;
  /** 最近一次同步时间 */
  tenantSyncTime: string | null;
}

/** 查询 swift 租户开通状态（需登录；审核通过后异步开通，可轮询至 tenantSyncStatus=1） */
export function getPublisherTenantStatus(): Promise<PublisherTenantStatus> {
  return http.get<PublisherTenantStatus>("/app/publisher/tenantStatus");
}

/**
 * 发送手机验证码（2026-06-26 起免登录；phone 必传，即输入框值）。
 * 免登录 endpoint（Shiro anon），带 token 无害；http.ts 未登录时不会注入 token。
 */
export function sendPublisherCode(phone: string): Promise<unknown> {
  return http.get<unknown>("/app/publisher/sendCode", { params: { phone } });
}

/**
 * POST /app/publisher/submit 成功响应（完整信封）。
 * 「提交即登录」：token/expire/user/action 在**响应顶层**（与登录/registerCode 一致，非 data 内），
 * 故 submitPublisher 用 pick:"raw" 取整个信封后读顶层 token。见接口文档 §2.4。
 */
export interface PublisherSubmitResult {
  /** 提交即登录返回的登录 token（顶层；匿名/登录态均返回） */
  token?: string;
  /** token 有效期（秒） */
  expire?: number;
  /** 动作标识（如 "login"） */
  action?: string;
  /** 登录用户信息 */
  user?: { userId?: number; phone?: string };
}

/**
 * 提交 / 重新提交入驻申请（2026-06-26 起免登录）。
 * 未登录=匿名提交，按手机号自动注册/复用 Lollipop 账号；成功后后端在**响应顶层**返回登录 token（提交即登录）。
 * 已登录会自动带 appToken（http.ts 注入）= 登录态提交。成功后进入待审核。
 */
export function submitPublisher(body: PublisherSubmitBody): Promise<PublisherSubmitResult> {
  return http.post<PublisherSubmitResult>("/app/publisher/submit", body, { pick: "raw" });
}

/**
 * 发行者自助重试 swift 租户开通（appToken、无参，作用于当前账号最新申请；见接口文档 §2.7）。
 * 仅在开通失败 tenantSyncStatus=2 时调用；无可重试记录时后端返回 401933（http 已 toast）。
 */
export function retryPublisherTenantSync(): Promise<unknown> {
  return http.post<unknown>("/app/publisher/retrySyncTenant");
}
