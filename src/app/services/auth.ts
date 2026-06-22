/**
 * 鉴权适配层
 * ------------------------------------------------------------------
 * 业务代码统一通过 getToken() 取用户 JWT，不直接接触登录态细节。
 * 当前 VITE_AUTH_MODE=mock：返回 .env 里的 VITE_MOCK_TOKEN（联调真入驻
 * 接口时把后端下发的真实 token 填进去即可）。
 * 待登录接口文档到位后，新增 real 分支从登录态读取 token，业务代码无需改动。
 */

type AuthMode = "mock" | "real";

const AUTH_MODE: AuthMode = (import.meta.env.VITE_AUTH_MODE as AuthMode) || "mock";
const MOCK_TOKEN: string = import.meta.env.VITE_MOCK_TOKEN || "";

/** 真实登录态 token 的内存缓存（real 模式下由登录流程写入） */
let realToken: string | null = null;

/** 登录成功后调用，写入真实 token（real 模式）。登录接口接入后使用。 */
export function setToken(token: string | null): void {
  realToken = token;
}

/** 获取当前用户 JWT，注入到请求头 `token`。取不到返回空串。 */
export function getToken(): string {
  if (AUTH_MODE === "real") {
    return realToken ?? "";
  }
  return MOCK_TOKEN;
}

/** 是否已登录（有可用 token）。 */
export function isAuthenticated(): boolean {
  return getToken().length > 0;
}
