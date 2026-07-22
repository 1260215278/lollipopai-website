/**
 * 登录会话服务（双 token 换取流程）
 * ------------------------------------------------------------------
 * 发行中心登录链（见《20260622-发行中心-上剧-接口文档》§0.0 与 postman）：
 *   1) App 登录拿 appToken：POST /app/Login/emailAuth（返回顶层 token = appToken）
 *   2) 换 publisher token：POST /publisher/login/byAppToken?appToken=<appToken>
 *      （校验是否为有效发行中心成员；返回 data = publisherToken。账号开启两步验证时
 *      响应带顶层 stage=2FA_REQUIRED，需再走 /publisher/login/verify2fa，见文件底部）
 *   3) 之后 /publisher/** 请求头带 publisherToken（由 http.ts 自动注入）
 *
 * 注意：emailAuth 的 token 在响应**顶层**（非 {code,msg,data} 的 data），故用裸 fetch
 * 解析；TODO(verify) 其完整字段以后端为准。
 */
import { BASE_URL, ApiError, http, type ApiResponse } from "./http";
import { setAppToken, setPublisherToken, getAppToken, getPublisherToken } from "./auth";
import { getMessages, getAcceptLanguage } from "../i18n";

/** emailAuth 响应（token 在顶层；其余字段未在文档列全，TODO(verify)） */
interface EmailAuthResponse {
  code?: number;
  msg?: string;
  /** App 登录 token（appToken），位于响应顶层 */
  token?: string;
}

export interface EmailLoginInput {
  emailName: string;
  /** 验证码 */
  code: string;
  /** 平台标识，H5 端为 "h5" */
  platform?: string;
  sysPhone?: number;
}

/**
 * 邮箱验证码登录（App 登录），成功写入 appToken 并返回。
 * TODO(verify): 响应结构以后端为准（当前按「顶层 token」解析）。
 */
export async function loginByEmail(input: EmailLoginInput): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/app/Login/emailAuth`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept-Language": getAcceptLanguage() },
      body: JSON.stringify({
        emailName: input.emailName,
        code: input.code,
        platform: input.platform ?? "h5",
        sysPhone: input.sysPhone ?? 1,
      }),
    });
  } catch {
    throw new ApiError(-1, "network error");
  }
  const json = (await res.json()) as EmailAuthResponse;
  const token = json?.token;
  if (!token) {
    throw new ApiError(json?.code ?? -1, json?.msg ?? "login failed");
  }
  setAppToken(token);
  return token;
}

/* ── 手机号验证码登录（发行中心设计文档要求复用 sms 模块；路径复用 short-play H5 登录逻辑） ──
 *   1) 发码：GET /app/Login/sendMsg/{区号+手机号}/login（区号含 "+"，与号码直接拼接、无分隔，
 *      场景段固定 login）；
 *   2) 登录：POST /app/Login/registerCode { phone: 区号+手机号, msg: 验证码, platform: "h5" }
 *      —— 验证码字段名为 `msg`（非 code）；成功后 token / user 在响应**顶层**（与 emailAuth 同构），
 *      其中 token 即 appToken。登录页固定区号 +86（与 UI 一致；H5 zh 默认 quhao 亦为 "+86"）。 */

/** 默认区号（含 "+"，与登录页 UI +86 一致） */
const DEFAULT_AREA_CODE = "+86";

/** registerCode 响应（token 在顶层，与 emailAuth 同构） */
interface PhoneAuthResponse {
  code?: number;
  msg?: string;
  /** App 登录 token（appToken），位于响应顶层 */
  token?: string;
}

export interface PhoneLoginInput {
  /** 手机号（不含区号） */
  phone: string;
  /** 短信验证码 */
  code: string;
  /** 区号（含 "+"），默认 +86 */
  areaCode?: string;
  /** 平台标识，H5 端为 "h5" */
  platform?: string;
}

/**
 * 发送手机登录验证码（复用 H5：GET /app/Login/sendMsg/{区号+手机号}/login）。
 * 出错时 http.ts 已 toast 后端文案，调用方仅需处理成功态。
 */
export function sendPhoneLoginCode(phone: string, areaCode: string = DEFAULT_AREA_CODE): Promise<unknown> {
  return http.get<unknown>(`/app/Login/sendMsg/${areaCode}${phone}/login`, { auth: false });
}

/**
 * 手机号验证码登录（复用 H5：POST /app/Login/registerCode），成功写入 appToken 并返回。
 * 注意：验证码字段名为 `msg`；token 位于响应顶层（同 emailAuth），故用裸 fetch 解析。
 */
export async function loginByPhone(input: PhoneLoginInput): Promise<string> {
  const areaCode = input.areaCode ?? DEFAULT_AREA_CODE;
  const fullPhone = `${areaCode}${input.phone}`;
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/app/Login/registerCode`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept-Language": getAcceptLanguage() },
      body: JSON.stringify({
        phone: fullPhone,
        msg: input.code,
        platform: input.platform ?? "h5",
      }),
    });
  } catch {
    throw new ApiError(-1, getMessages().distribution.common.networkError);
  }
  const json = (await res.json()) as PhoneAuthResponse;
  const token = json?.token;
  if (!token) {
    throw new ApiError(json?.code ?? -1, json?.msg ?? getMessages().distribution.common.serverError);
  }
  setAppToken(token);
  return token;
}

/* ── 密码登录 / 邮箱登录 / 忘记密码（照搬短剧 H5 loginPhone.vue / forgetPwd.vue 逻辑） ──
 *   接口与字段以 H5 为准：
 *   - 手机密码登录：POST /app/Login/registerCode { phone:区号+号, password, platform }（不传 msg 即密码登录）
 *   - 邮箱密码登录：POST /app/Login/emailLogin { emailName, password, isFirebaseEmail:"1" }
 *   - 手机找回：发码 GET /app/Login/sendMsg/{区号+号}/forget；重置 POST /app/Login/forgetPwd { phone, pwd, msg }
 *   - 邮箱找回：发码 POST /app/Login/sendEmailMsg?emailName=&type=2&language=；重置 POST /app/Login/forgetPassWord { emailName, password, code }
 *   登录类响应 token 均在顶层（同 registerCode），故用裸 fetch 解析。*/

/** 通用顶层登录响应解析：成功写 appToken 返回，失败抛后端文案 */
async function parseLoginResponse(res: Response): Promise<string> {
  const json = (await res.json()) as PhoneAuthResponse;
  const token = json?.token;
  if (!token) {
    throw new ApiError(json?.code ?? -1, json?.msg ?? getMessages().distribution.common.serverError);
  }
  setAppToken(token);
  return token;
}

/** 手机号 + 密码登录（H5：registerCode 带 password、不传 msg）。 */
export async function loginByPhonePassword(input: {
  phone: string;
  password: string;
  areaCode?: string;
}): Promise<string> {
  const areaCode = input.areaCode ?? DEFAULT_AREA_CODE;
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/app/Login/registerCode`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept-Language": getAcceptLanguage() },
      body: JSON.stringify({
        phone: `${areaCode}${input.phone}`,
        password: input.password,
        platform: "h5",
      }),
    });
  } catch {
    throw new ApiError(-1, getMessages().distribution.common.networkError);
  }
  return parseLoginResponse(res);
}

/** 邮箱 + 密码登录（H5：POST JSON /app/Login/emailLogin）。 */
export async function loginByEmailPassword(input: { email: string; password: string }): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/app/Login/emailLogin`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept-Language": getAcceptLanguage() },
      body: JSON.stringify({
        emailName: input.email,
        password: input.password,
        isFirebaseEmail: "1",
      }),
    });
  } catch {
    throw new ApiError(-1, getMessages().distribution.common.networkError);
  }
  return parseLoginResponse(res);
}

/** 手机号注册（H5：registerCode 带 msg(验证码)+password；发码复用 sendPhoneLoginCode）。 */
export async function registerByPhone(input: {
  phone: string;
  code: string;
  password: string;
  areaCode?: string;
}): Promise<string> {
  const areaCode = input.areaCode ?? DEFAULT_AREA_CODE;
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/app/Login/registerCode`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept-Language": getAcceptLanguage() },
      body: JSON.stringify({
        phone: `${areaCode}${input.phone}`,
        msg: input.code,
        password: input.password,
        platform: "h5",
      }),
    });
  } catch {
    throw new ApiError(-1, getMessages().distribution.common.networkError);
  }
  return parseLoginResponse(res);
}

/** 邮箱注册（H5：POST JSON /app/Login/emailRegister；web 不传设备 sysPhone）。 */
export async function registerByEmail(input: { email: string; password: string; code: string }): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/app/Login/emailRegister`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept-Language": getAcceptLanguage() },
      body: JSON.stringify({
        emailName: input.email,
        password: input.password,
        code: input.code,
        platform: "h5",
      }),
    });
  } catch {
    throw new ApiError(-1, getMessages().distribution.common.networkError);
  }
  return parseLoginResponse(res);
}

/** 发送注册-邮箱验证码（H5：POST sendEmailMsg?emailName=&type=1&language=）。 */
export function sendRegisterEmailCode(email: string): Promise<unknown> {
  return http.post<unknown>("/app/Login/sendEmailMsg", undefined, {
    params: { emailName: email, type: 1, language: getAcceptLanguage() },
    auth: false,
  });
}

/** 发送找回密码-手机验证码（H5：GET sendMsg/{区号+号}/forget）。 */
export function sendForgetPhoneCode(phone: string, areaCode: string = DEFAULT_AREA_CODE): Promise<unknown> {
  return http.get<unknown>(`/app/Login/sendMsg/${areaCode}${phone}/forget`, { auth: false });
}

/** 发送找回密码-邮箱验证码（H5：POST sendEmailMsg?emailName=&type=2&language=）。 */
export function sendForgetEmailCode(email: string): Promise<unknown> {
  return http.post<unknown>("/app/Login/sendEmailMsg", undefined, {
    params: { emailName: email, type: 2, language: getAcceptLanguage() },
    auth: false,
  });
}

/** 重置密码-手机（H5：POST /app/Login/forgetPwd { phone, pwd, msg }）。 */
export function resetPhonePassword(input: {
  phone: string;
  pwd: string;
  msg: string;
  areaCode?: string;
}): Promise<unknown> {
  const areaCode = input.areaCode ?? DEFAULT_AREA_CODE;
  return http.post<unknown>(
    "/app/Login/forgetPwd",
    { phone: `${areaCode}${input.phone}`, pwd: input.pwd, msg: input.msg },
    { auth: false },
  );
}

/** 重置密码-邮箱（H5：POST JSON /app/Login/forgetPassWord { emailName, password, code }）。 */
export async function resetEmailPassword(input: {
  email: string;
  password: string;
  code: string;
}): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/app/Login/forgetPassWord`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept-Language": getAcceptLanguage() },
      body: JSON.stringify({
        emailName: input.email,
        password: input.password,
        code: input.code,
      }),
    });
  } catch {
    throw new ApiError(-1, getMessages().distribution.common.networkError);
  }
  const json = (await res.json()) as PhoneAuthResponse;
  if (json?.code !== 0) {
    throw new ApiError(json?.code ?? -1, json?.msg ?? getMessages().distribution.common.serverError);
  }
}

/* ── 两步验证登录（20260707 后端反馈 item 12） ──
 *   已开 2FA 的账号调 byAppToken 时后端先发短信码，响应新增顶层 stage="2FA_REQUIRED"，
 *   data 为 { challengeToken, phoneMask, expireSeconds }；未开 2FA 响应不变（无 stage 字段）。
 *   二次校验走 POST /publisher/login/verify2fa，入参为 @RequestParam（query，非 JSON body）。 */

/** byAppToken 的 2FA 待校验载荷（stage=2FA_REQUIRED 时的 data） */
export interface PublisherTwoFactorChallenge {
  /** 临时 token，5 分钟有效 */
  challengeToken: string;
  /** 收码手机号掩码，如 +86****2400 */
  phoneMask: string;
  /** 验证码有效秒数（300） */
  expireSeconds: number;
}

/** byAppToken 换取结果：直接拿到 token，或进入 2FA 二次校验 */
export type PublisherLoginResult =
  | { stage: "token"; token: string }
  | { stage: "2fa"; challenge: PublisherTwoFactorChallenge };

/** byAppToken 完整响应信封（判定 2FA 只看顶层 stage 字段，不推断 data 形态） */
interface ByAppTokenEnvelope {
  code: number;
  msg: string;
  stage?: string;
  data: string | { token: string } | PublisherTwoFactorChallenge;
}

/**
 * 用 appToken 换取发行中心 publisher token（byAppToken）。
 * - 未开 2FA：成功写入 publisher token 并返回 { stage:"token" }（原逻辑不变）；
 * - 已开 2FA：后端已发短信码，返回 { stage:"2fa", challenge }，待 verify2fa 后才有正式 token；
 * - 已开 2FA 但成员未绑手机号：抛 403398（提示联系账号管理员）。
 * 校验账号是否为有效发行中心成员；无成员身份时后端返回 40020。
 */
export async function exchangePublisherToken(appToken?: string): Promise<PublisherLoginResult> {
  const at = appToken ?? getAppToken();
  if (!at) {
    throw new ApiError(401, "missing app token");
  }
  // byAppToken 是登录换取动作，自身不需要带 token 头；stage 在响应顶层，故 pick raw
  const envelope = await http.post<ByAppTokenEnvelope>("/publisher/login/byAppToken", undefined, {
    params: { appToken: at },
    auth: false,
    toastOnError: false,
    pick: "raw",
  });
  if (envelope.stage === "2FA_REQUIRED") {
    const challenge = envelope.data as PublisherTwoFactorChallenge;
    if (!challenge?.challengeToken) {
      throw new ApiError(-1, "byAppToken: empty 2FA challenge");
    }
    return { stage: "2fa", challenge };
  }
  // 两份官方材料口径不一：接口文档 §0.0 称 data 直接是 token 字符串；postman 倾向 data.token。
  // 故兼容两种形态（非撒网猜测，均为文档明列形态），联调时以后端实测为准。
  const data = envelope.data as string | { token: string };
  const publisherToken = typeof data === "string" ? data : data?.token;
  if (!publisherToken) {
    throw new ApiError(-1, "byAppToken: empty publisher token");
  }
  setPublisherToken(publisherToken);
  return { stage: "token", token: publisherToken };
}

/**
 * 提交两步验证短信码（POST /publisher/login/verify2fa，公开接口）。
 * ⚠️ 入参是 @RequestParam（query），不能用 JSON body。成功响应与普通登录同结构，
 * 写入 publisher token 并返回。失败错误码：403397 码错/过期可重试；403396 会话失效需重走 byAppToken。
 */
export async function verifyPublisherTwoFactor(challengeToken: string, code: string): Promise<string> {
  const data = await http.post<string | { token: string }>("/publisher/login/verify2fa", undefined, {
    params: { challengeToken, code },
    auth: false,
    toastOnError: false,
  });
  const publisherToken = typeof data === "string" ? data : data?.token;
  if (!publisherToken) {
    throw new ApiError(-1, "verify2fa: empty publisher token");
  }
  setPublisherToken(publisherToken);
  return publisherToken;
}

/**
 * 确保已持有 publisher token：已有则直接返回；否则用 appToken 换取（可能进入 2FA 分支）。
 * 进入发行中心（/publisher/** 调用前）调用。
 */
export async function ensurePublisherAccess(): Promise<PublisherLoginResult> {
  const existing = getPublisherToken();
  if (existing) return { stage: "token", token: existing };
  return exchangePublisherToken();
}

/** http.ts 的 ApiResponse 复用导出，避免重复定义 */
export type { ApiResponse };
