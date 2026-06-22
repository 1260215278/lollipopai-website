/**
 * HTTP 层
 * ------------------------------------------------------------------
 * 统一 fetch 封装：
 *  - baseURL = VITE_API_BASE + /sqx_fast（context-path）
 *  - 请求头注入 token（取自 auth.getToken()）
 *  - 解包统一响应 { code, msg, data }：code===0 返回 data；否则抛 ApiError
 *  - 业务失败的 msg 已是后端翻译好的文案，可直接 toast 展示
 *  - 传输/网络异常用 i18n 文案兜底（getMessages，非 hook，供 service 层使用）
 */
import { toast } from "sonner";
import { getToken } from "./auth";
import { getMessages } from "../i18n";

const API_BASE: string = import.meta.env.VITE_API_BASE || "";
/** 后端统一 context-path */
export const CONTEXT_PATH = "/sqx_fast";
/** 请求基础地址：${VITE_API_BASE}/sqx_fast */
export const BASE_URL = `${API_BASE}${CONTEXT_PATH}`;

/** 统一响应结构 */
export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
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

export interface RequestOptions extends Omit<RequestInit, "body"> {
  /** 查询参数 */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** JSON 请求体（自动序列化并设置 Content-Type） */
  body?: unknown;
  /** 是否注入 token，默认 true */
  auth?: boolean;
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

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, auth = true, toastOnError = true, headers, method, ...rest } = options;

  const finalHeaders: Record<string, string> = { ...(headers as Record<string, string>) };
  if (auth) {
    const token = getToken();
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
    throw new ApiError(res.status, msg);
  }

  if (json.code === 0) {
    return json.data;
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
