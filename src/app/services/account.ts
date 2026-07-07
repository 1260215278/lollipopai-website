/**
 * 发行中心账号信息服务。
 * ------------------------------------------------------------------
 * 路径前缀 `/publisher/account/**`，走发行 publisher token。
 * 统一响应 {code,msg,data}；账号信息相关接口仅超管可用，无权由 http 层 toast 后端 msg。
 */
import { http } from "./http";
import type { PageResult } from "./content";

export interface AccountProfile {
  accountCode: string;
  nickname: string;
  avatar: string | null;
  certified: 0 | 1;
  registerTime: string | null;
  lastLoginTime: string | null;
}

export interface AccountContact {
  phoneMask: string | null;
  phoneBound: boolean;
  emailMask: string | null;
  emailBound: boolean;
}

export interface AccountSecurity {
  passwordSet: boolean;
  twoFactorEnabled: boolean;
  securityLevel: 1 | 2 | 3;
}

export interface AccountNotify {
  notifyEmail: 0 | 1;
  notifySms: 0 | 1;
}

export const accountSmsCodeScenes = {
  changePassword: "change_password",
  twoFactorEnable: "two_factor_enable",
  twoFactorDisable: "two_factor_disable",
  cancelAccount: "cancel_account",
} as const;

export type AccountSmsCodeScene = typeof accountSmsCodeScenes[keyof typeof accountSmsCodeScenes];

export interface AccountCompany {
  companyName: string | null;
  creditCode: string | null;
  companyAddress: string | null;
  companyPhone: string | null;
}

export interface AccountInfo {
  profile: AccountProfile;
  contact: AccountContact;
  security: AccountSecurity;
  notify: AccountNotify;
  company: AccountCompany;
}

export interface UpdateCompanyBody {
  companyName: string;
  /** 覆盖式更新：传空字符串表示清空该项。 */
  creditCode?: string;
  /** 覆盖式更新：传空字符串表示清空该项。 */
  companyAddress?: string;
  /** 覆盖式更新：传空字符串表示清空该项。 */
  companyPhone?: string;
}

export interface AccountSession {
  sessionId: string;
  device: string;
  ipMask?: string | null;
  location: string | null;
  loginTime: string | null;
  lastActiveTime: string | null;
  current: boolean;
  online: boolean;
}

export interface AccountLoginRecord {
  device: string;
  location: string | null;
  loginTime: string | null;
  success: boolean;
}

export interface AccountLoginRecordQuery {
  page?: number;
  limit?: number;
}

export function getAccountInfo(): Promise<AccountInfo> {
  return http.get<AccountInfo>("/publisher/account/info");
}

export function updateCompany(body: UpdateCompanyBody): Promise<void> {
  return http.post<void>("/publisher/account/updateCompany", body);
}

export function updateNickname(nickname: string): Promise<void> {
  return http.post<void>("/publisher/account/updateNickname", { nickname });
}

export function updateAvatar(avatar: string): Promise<void> {
  return http.post<void>("/publisher/account/updateAvatar", { avatar });
}

export function updateNotify(body: AccountNotify): Promise<void> {
  return http.post<void>("/publisher/account/notify", body);
}

export function sendAccountEmailCode(email: string): Promise<void> {
  return http.get<void>("/publisher/account/sendEmailCode", { params: { email } });
}

/** 给已绑定手机号发码（改密/开关 2FA 用）；绑新号请用 sendBindPhoneCode，勿混用。 */
export function sendAccountSmsCode(scene: AccountSmsCodeScene): Promise<void> {
  return http.get<void>("/publisher/account/sendSmsCode", { params: { scene } });
}

/**
 * 绑定/换绑登录手机号-发码（20260707 item 15b）。
 * phone 必须是含区号的完整号（E.164，带 "+"，如 +12127128166）；
 * 发码与提交必须用同一个手机号字符串（验证码按手机号为 key 存查）。
 */
export function sendBindPhoneCode(phone: string): Promise<void> {
  return http.get<void>("/publisher/account/sendPhoneCode", { params: { phone } });
}

/**
 * 绑定/换绑登录手机号-提交（@RequestBody JSON，勿用 form）。
 * 失败码：40021 手机号已被占用 / 40023 验证码不正确 / 401179 验证码过期 / 403336 手机号或验证码为空。
 */
export function bindAccountPhone(phone: string, code: string): Promise<void> {
  return http.post<void>("/publisher/account/bindPhone", { phone, code });
}

export function bindAccountEmail(email: string, code: string): Promise<void> {
  return http.post<void>("/publisher/account/bindEmail", { email, code });
}

export interface ChangeAccountPasswordBody {
  oldPassword?: string;
  smsCode?: string;
  newPassword: string;
}

export function changeAccountPassword(body: ChangeAccountPasswordBody): Promise<void> {
  return http.post<void>("/publisher/account/changePassword", body);
}

export interface AccountSmsCodeBody {
  smsCode: string;
}

export function enableAccountTwoFactor(body: AccountSmsCodeBody): Promise<void> {
  return http.post<void>("/publisher/account/twoFactor/enable", body);
}

export function disableAccountTwoFactor(body: AccountSmsCodeBody): Promise<void> {
  return http.post<void>("/publisher/account/twoFactor/disable", body);
}

export function getAccountSessions(): Promise<AccountSession[]> {
  return http.get<AccountSession[]>("/publisher/account/sessions");
}

export function kickAccountSession(sessionId: string): Promise<void> {
  return http.post<void>("/publisher/account/sessions/kick", { sessionId });
}

export function logoutOtherAccountSessions(): Promise<void> {
  return http.post<void>("/publisher/account/sessions/logoutAll", {});
}

export function getAccountLoginRecords(query: AccountLoginRecordQuery = {}): Promise<PageResult<AccountLoginRecord>> {
  return http.get<PageResult<AccountLoginRecord>>("/publisher/account/loginRecords", {
    params: {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    },
  });
}

export function logoutAccount(): Promise<void> {
  return http.post<void>("/publisher/account/logout");
}

export interface CancelAccountBody extends AccountSmsCodeBody {
  confirm: true;
}

export function cancelAccount(body: CancelAccountBody): Promise<void> {
  return http.post<void>("/publisher/account/cancel", body);
}
