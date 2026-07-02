/**
 * 鉴权适配层（双 token 模型）
 * ------------------------------------------------------------------
 * 发行中心是独立鉴权域，存在两类 token（见《20260622-发行中心-上剧-接口文档》§0.0）：
 *  - appToken：出品方主账号 App 登录 JWT。用于 `/app/**`（含入驻 `/app/publisher/**`、
 *    语言列表 `/app/languageType/**`）与通用上传 `/file/**`、`/alioss/**`。
 *  - publisherToken：用 appToken 经 `POST /publisher/login/byAppToken` 换取，用于
 *    `@PublisherLogin` 保护的 `/publisher/**`（上剧 / 数据概览）。
 *
 * http.ts 按请求路径自动选择注入哪种 token（`/publisher/**` → publisherToken，
 * 其余 → appToken）。两类 token 均持久化到 localStorage，刷新后保持登录态；
 * 未登录时回退到 .env 注入的联调 token（VITE_APP_TOKEN / VITE_PUBLISHER_TOKEN）。
 */

const APP_TOKEN_KEY = "lp_app_token";
const PUB_TOKEN_KEY = "lp_publisher_token";
/** 登录展示名（当前为登录手机号，登录成功时写入；顶栏「已登录」态展示用） */
const LOGIN_NAME_KEY = "lp_login_name";

/** 登录态变更事件（顶栏据此在登录/退出后即时切换展示） */
const AUTH_CHANGE_EVENT = "lp-auth-change";

/** 防止并发 401 重复跳转登录页 */
let sessionExpiredHandled = false;

function emitAuthChange(): void {
  try {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  } catch {
    /* 非浏览器环境忽略 */
  }
}

/**
 * 订阅登录态变更：自定义事件（同标签页登录/退出）+ storage 事件（跨标签页同步）。
 * 返回取消订阅函数。
 */
export function subscribeAuthChange(callback: () => void): () => void {
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** 联调/开发期可在 .env 注入的回退 token（未走真实登录时使用） */
const ENV_APP_TOKEN: string = import.meta.env.VITE_APP_TOKEN || "";
const ENV_PUBLISHER_TOKEN: string = import.meta.env.VITE_PUBLISHER_TOKEN || "";

function readStorage(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    /* localStorage 不可用时仅保留内存态 */
  }
}

let appToken: string = readStorage(APP_TOKEN_KEY, ENV_APP_TOKEN);
let publisherToken: string = readStorage(PUB_TOKEN_KEY, ENV_PUBLISHER_TOKEN);
let loginName: string = readStorage(LOGIN_NAME_KEY, "");

/** App 主账号 token（/app/**、/file/**、/alioss/**）。取不到返回空串。 */
export function getAppToken(): string {
  return appToken;
}

/** 发行中心 publisher token（/publisher/**）。取不到返回空串。 */
export function getPublisherToken(): string {
  return publisherToken;
}

/** 写入 App 主账号 token（emailAuth 登录成功后调用；null=清除）。 */
export function setAppToken(token: string | null): void {
  appToken = token ?? "";
  writeStorage(APP_TOKEN_KEY, appToken);
  if (token) sessionExpiredHandled = false;
  emitAuthChange();
}

/** 登录展示名（当前为登录手机号）。取不到返回空串。 */
export function getLoginName(): string {
  return loginName;
}

/** 写入登录展示名（登录成功后调用；null=清除）。 */
export function setLoginName(name: string | null): void {
  loginName = name ?? "";
  writeStorage(LOGIN_NAME_KEY, loginName);
  emitAuthChange();
}

/** 写入发行中心 publisher token（byAppToken 换取成功后调用；null=清除）。 */
export function setPublisherToken(token: string | null): void {
  publisherToken = token ?? "";
  writeStorage(PUB_TOKEN_KEY, publisherToken);
}

/**
 * 会话失效（业务 code=401，如 msg=403343）：清除 token 并跳转登录。
 * 见《发行中心-成员与账号-前端对接》§0。
 */
export function handleUnauthorized(): void {
  clearTokens();
  if (sessionExpiredHandled) return;
  const path = window.location.pathname;
  if (path === "/login" || path.startsWith("/login/")) return;
  sessionExpiredHandled = true;
  window.location.replace("/login");
}

/** 退出登录：清除两类 token 与登录展示名。 */
export function clearTokens(): void {
  appToken = "";
  publisherToken = "";
  loginName = "";
  writeStorage(APP_TOKEN_KEY, "");
  writeStorage(PUB_TOKEN_KEY, "");
  writeStorage(LOGIN_NAME_KEY, "");
  emitAuthChange();
}

/** 是否已 App 登录（持有 appToken，可访问 /app/**，含入驻状态查询）。 */
export function isAppAuthed(): boolean {
  return appToken.length > 0;
}

/** 是否已拿到发行中心 publisher token（已可访问 /publisher/**）。 */
export function isPublisherAuthed(): boolean {
  return publisherToken.length > 0;
}
