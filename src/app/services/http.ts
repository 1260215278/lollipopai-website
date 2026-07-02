/**
 * HTTP 层
 * ------------------------------------------------------------------
 * 统一 fetch 封装：
 *  - baseURL = VITE_API_BASE + /sqx_fast（context-path）
 *  - 双 token 自动选择：`/publisher/**` 注入 publisherToken，其余（`/app/**`、
 *    `/file/**`、`/alioss/**`）注入 appToken。可用 options.tokenType 覆盖，auth:false 不注入。
 *  - 解包统一响应 { code, msg, data }：code===0 返回 data；否则抛 ApiError
 *  - 业务失败的 msg 已是后端翻译好的文案，可直接 toast 展示
 *  - 业务 code=401（如 msg=403343 会话失效）→ 清 token 并跳转 /login
 *  - 传输/网络异常用 i18n 文案兜底（getMessages，非 hook，供 service 层使用）
 */
import { toast } from "sonner";
import { getAppToken, getPublisherToken, handleUnauthorized } from "./auth";
import { getMessages, getAcceptLanguage } from "../i18n";

// TODO(verify): 临时写死测试环境基址，便于部署后直连测试后端（跨域，需后端开 CORS）。
// 后续应改回由 VITE_API_BASE 配置（留空走相对 /sqx_fast + 同域/代理）。
const API_BASE: string = import.meta.env.VITE_API_BASE || "https://www.testshort.top";
/** 后端统一 context-path */
export const CONTEXT_PATH = "/sqx_fast";
/** 请求基础地址：${VITE_API_BASE}/sqx_fast */
export const BASE_URL = `${API_BASE}${CONTEXT_PATH}`;

/** 统一响应结构。分页接口数据放在顶层 `page`（renren-fast 约定，见接口文档 §0）。 */
export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
  /** 分页接口的列表载荷（`{ totalCount, pageSize, totalPage, currPage, list }`） */
  page?: T;
}

/** 业务/传输错误。code 为后端业务码（如 401923）或 -1（传输层失败） */
export class ApiError extends Error {
  code: number;
  constructor(code: number, msg: string) {
    super(msg);
    this.code = code;
    this.name = "ApiError";
  }
}

/** 注入哪种 token。默认按路径自动判定（/publisher/** → publisher，其余 → app） */
export type TokenType = "app" | "publisher";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  /** 查询参数 */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** JSON 请求体（自动序列化并设置 Content-Type） */
  body?: unknown;
  /** 是否注入 token，默认 true */
  auth?: boolean;
  /** 强制使用的 token 类型；不传则按路径自动判定 */
  tokenType?: TokenType;
  /** 从响应里取哪个字段：默认 "data"；分页接口传 "page"；"raw"=返回完整 {code,msg,data,...} 信封（用于 token 等顶层字段） */
  pick?: "data" | "page" | "raw";
  /** 出错时是否自动 toast，默认 true */
  toastOnError?: boolean;
}

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const url = `${BASE_URL}${path}`;
  if (!params) return url;
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) search.append(k, String(v));
  });
  const qs = search.toString();
  return qs ? `${url}?${qs}` : url;
}

/** 按路径或显式类型解析应注入的 token 字符串 */
function resolveToken(path: string, tokenType?: TokenType): string {
  const type: TokenType = tokenType ?? (path.startsWith("/publisher/") ? "publisher" : "app");
  return type === "publisher" ? getPublisherToken() : getAppToken();
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, auth = true, tokenType, pick = "data", toastOnError = true, headers, method, ...rest } = options;

  const finalHeaders: Record<string, string> = { ...(headers as Record<string, string>) };
  // 携带当前语言：后端据此返回对应语言的短信/错误文案（bug5）。
  // TODO(verify): 后端实际读取的语言头键名与取值映射需联调确认（标准 Accept-Language / BCP-47）。
  if (!finalHeaders["Accept-Language"]) finalHeaders["Accept-Language"] = getAcceptLanguage();
  if (auth) {
    const token = resolveToken(path, tokenType);
    if (token) finalHeaders["token"] = token;
  }

  let payload: BodyInit | undefined;
  if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, params), {
      method: method ?? (body !== undefined ? "POST" : "GET"),
      headers: finalHeaders,
      body: payload,
      ...rest,
    });
  } catch {
    const msg = getMessages().distribution.common.networkError;
    if (toastOnError) toast.error(msg);
    throw new ApiError(-1, msg);
  }

  let json: ApiResponse<T>;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    const msg = getMessages().distribution.common.serverError;
    if (toastOnError) toast.error(msg);
    if (res.status === 401) handleUnauthorized();
    throw new ApiError(res.status, msg);
  }

  if (json.code === 401 || res.status === 401) {
    if (toastOnError) toast.error(json.msg);
    handleUnauthorized();
    throw new ApiError(json.code, json.msg);
  }

  if (json.code === 0) {
    if (pick === "raw") return json as unknown as T;
    return (pick === "page" ? (json.page as T) : json.data);
  }

  // 业务失败：msg 已由后端按当前语言翻译，可直接展示
  if (toastOnError) toast.error(json.msg);
  throw new ApiError(json.code, json.msg);
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
};
