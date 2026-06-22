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

/**
 * 发送手机验证码。
 * @param phone 账号已绑定手机号时可不传（后端强制用账号手机号）；未绑定必传。
 */
export function sendPublisherCode(phone?: string): Promise<unknown> {
  return http.get<unknown>("/app/publisher/sendCode", {
    params: phone ? { phone } : undefined,
  });
}

/** 提交 / 重新提交入驻申请（成功后进入待审核） */
export function submitPublisher(body: PublisherSubmitBody): Promise<unknown> {
  return http.post<unknown>("/app/publisher/submit", body);
}
