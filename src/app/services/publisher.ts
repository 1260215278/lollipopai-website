/**
 * 发行者入驻服务（真接口，严格按《发行者入驻-前端接口.md》）
 * ------------------------------------------------------------------
 * 全局 context-path=/sqx_fast（由 http.ts 注入），鉴权 header: token。
 * 统一响应 {code,msg,data}：code=0 成功；非 0 时 http.ts 已 toast 后端翻译好的 msg。
 * 错误码（后端返回 msg 可直接展示）：
 *   401923 未勾选协议 / 401924 重复提交 / 401925 已是发行者 / 403360 手机号邮箱均未填 /
 *   403361 邮箱已被占用 / 403362 邮箱格式不正确 / 40023 验证码错误 / 401179 验证码过期 /
 *   40021 手机号占用 / 40034 发码频繁 / 40038 邮件发送失败
 */
import { http } from "./http";
import type { PageResult } from "./content";

/** 申请详情对象（status.apply / 列表 records[]） */
export interface PublisherApply {
  id?: number;
  userId?: number;
  phone?: string;
  /** 申请邮箱（手机号入驻时为 null；2026-07-02 新增） */
  email?: string;
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

/** POST /app/publisher/submit 请求体（严格按接口文档；phone/email 二选一） */
export interface PublisherSubmitBody {
  /** 二选一：申请手机号（与 email 都传时后端手机号优先） */
  phone?: string;
  /** 二选一：申请邮箱（2026-07-02 新增） */
  email?: string;
  /** 验证码（发到哪个通道就校验哪个） */
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
  /** 合作协议当前版本号，来自 app/common/type/3017 */
  agreementVersion?: string;
}

/** 入驻协议类型：合作协议 / 隐私政策 */
export type AgreementType = "cooperation" | "privacy";

interface AppCommonConfig {
  id: number;
  type: number;
  value: string;
  min: string;
  max: string | null;
  conditionFrom: string | null;
  createAt: string | null;
}

const PUBLISHER_AGREEMENT_COMMON_TYPE = {
  cooperationVersion: 3017,
  privacyVersion: 3018,
  cooperationContent: 3104,
  privacyContent: 3105,
} as const;

/** GET /app/common/type/{type} 配置响应 */
function getAppCommonConfig(type: number): Promise<AppCommonConfig> {
  return http.get<AppCommonConfig>(`/app/common/type/${type}`, { auth: false });
}

/** 入驻协议配置（正文与版本来自配置中心 type=3017/3018/3104/3105） */
export interface PublisherAgreement {
  type: AgreementType;
  /** 协议版本号 */
  version: string;
  /** 协议正文 */
  content: string;
}

/**
 * 查询入驻协议配置：type=cooperation 合作协议 / privacy 隐私政策。
 * 当前版本号：3017/3018；富文本正文：3104/3105。
 */
export function getPublisherAgreement(type: AgreementType): Promise<PublisherAgreement> {
  const versionType = type === "cooperation"
    ? PUBLISHER_AGREEMENT_COMMON_TYPE.cooperationVersion
    : PUBLISHER_AGREEMENT_COMMON_TYPE.privacyVersion;
  const contentType = type === "cooperation"
    ? PUBLISHER_AGREEMENT_COMMON_TYPE.cooperationContent
    : PUBLISHER_AGREEMENT_COMMON_TYPE.privacyContent;
  return Promise.all([
    getAppCommonConfig(versionType),
    getAppCommonConfig(contentType),
  ]).then(([version, content]) => ({
    type,
    version: version.value,
    content: content.value,
  }));
}

/** 入驻状态机审核态枚举 */
export const AuditStatus = {
  NOT_APPLIED: null as null,
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
} as const;

/** 查询入驻状态（进页面先调用，决定展示哪种状态） */
export function getPublisherStatus(options: { toastOnError?: boolean } = {}): Promise<PublisherStatus> {
  return http.get<PublisherStatus>("/app/publisher/status", options);
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

/** sendCode 请求参数：phone/email 二选一（都传时后端手机号优先） */
export interface PublisherSendCodeParams {
  phone?: string;
  email?: string;
  /** 邮件验证码语言（zh/en/pt，仅邮箱通道；默认 zh） */
  language?: string;
}

/**
 * 发送验证码（2026-06-26 起免登录；2026-07-02 起支持手机号或邮箱二选一）。
 * 免登录 endpoint（Shiro anon），带 token 无害；http.ts 未登录时不会注入 token。
 */
export function sendPublisherCode(params: PublisherSendCodeParams): Promise<unknown> {
  return http.get<unknown>("/app/publisher/sendCode", { params, auth: false });
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
  user?: { userId?: number; phone?: string; email?: string };
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

/* ── 出品方公开主页（bug18，免登录；上架闸口 audit_status=2 & publish_scope=2 & shelf_status=1）── */

/** GET /app/publisher/profile/{userId} 响应 */
export interface PublisherProfile {
  userId: number;
  userName: string;
  avatar: string;
  /** 0=否 1=是 */
  isPublisher: number;
  /** 已上架剧目数 */
  totalDramas: number;
  /** 累计播放量 */
  totalPlays: number;
}

/** 出品方主页已上架剧目行（GET /app/publisher/profile/{userId}/courses 的 list 项） */
export interface PublisherProfileCourse {
  courseId: number;
  title: string;
  titleImg: string;
  img: string;
  classifyId: number;
  courseType: number;
  languageType: string;
  viewCounts: number;
  collectNum: number;
  priceUsd: number;
  /** 是否完结 0/1 */
  over: number;
  updateTime: string;
}

/** 出品方公开主页基础信息（非发行方返回 403312）。 */
export function getPublisherProfile(userId: number | string): Promise<PublisherProfile> {
  return http.get<PublisherProfile>(`/app/publisher/profile/${userId}`, { auth: false });
}

/** 出品方已上架剧列表（非发行方/不存在返回空分页，不报错）。 */
export function getPublisherProfileCourses(
  userId: number | string,
  query: { page?: number; limit?: number } = {},
): Promise<PageResult<PublisherProfileCourse>> {
  // 该接口分页对象在 data 内（非顶层 page），故用默认 pick:"data"
  return http.get<PageResult<PublisherProfileCourse>>(`/app/publisher/profile/${userId}/courses`, {
    params: { page: query.page ?? 1, limit: query.limit ?? 20 },
    auth: false,
  });
}
