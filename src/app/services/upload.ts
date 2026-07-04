/**
 * 通用上传服务（multipart，字段名 file，成功时 data 为完整 URL 字符串）
 * ------------------------------------------------------------------
 * 端点按业务链路区分（见《20260625-后端答复与变更》一·1）：
 *  - 上剧封面 / 剧集视频 / 高光视频 / 版权证明：`POST /publisher/course/upload`
 *    （@PublisherLogin，走 publisher token）。后端按扩展名区分大小：图片 ≤10MB、
 *    视频 ≤500MB、文档（pdf/doc/docx）≤20MB，成功返回 OSS URL。
 *  - 入驻证照：`POST /alioss/upload`（anon，走 app token / 无鉴权），与发行方上传隔离。
 *  - 旧 `/file/upload` 属另一套鉴权域（sys/后管登录），不认发行方 token，已弃用。
 * token 与 http.ts 一致按路径自动注入：`/publisher/**` → publisherToken，其余 → appToken。
 * 由调用方按场景显式指定 path（默认发行方上传端点）。
 */
import { toast } from "sonner";
import { getAppToken, getPublisherToken, handleUnauthorized } from "./auth";
import { BASE_URL, ApiError, type ApiResponse } from "./http";
import { getMessages, getAcceptLanguage } from "../i18n";

/** 上剧素材上传端点（发行方专用，publisher token） */
export const PUBLISHER_UPLOAD_PATH = "/publisher/course/upload";
/** 入驻证照上传端点（anon） */
export const ALIOSS_UPLOAD_PATH = "/alioss/upload";

/** 按路径解析应注入的 token（与 http.ts resolveToken 对齐） */
function resolveUploadToken(path: string): string {
  return path.startsWith("/publisher/") ? getPublisherToken() : getAppToken();
}

/**
 * 上传单个文件，返回其完整 URL。
 * @param file 待上传文件
 * @param path 上传端点（默认发行方专用 /publisher/course/upload；入驻证照传 /alioss/upload）
 * @returns 文件 URL 字符串
 */
export async function uploadFile(file: File, path: string = PUBLISHER_UPLOAD_PATH): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const headers: Record<string, string> = { "Accept-Language": getAcceptLanguage() };
  const token = resolveUploadToken(path);
  if (token) headers["token"] = token;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers, // 不手动设置 Content-Type，交给浏览器带 boundary
      body: form,
    });
  } catch {
    const msg = getMessages().distribution.common.networkError;
    toast.error(msg);
    throw new ApiError(-1, msg);
  }

  let json: ApiResponse<string>;
  try {
    json = (await res.json()) as ApiResponse<string>;
  } catch {
    const msg = getMessages().distribution.common.serverError;
    toast.error(msg);
    if (res.status === 401) handleUnauthorized();
    throw new ApiError(res.status, msg);
  }

  if (json.code === 401 || res.status === 401) {
    toast.error(json.msg);
    handleUnauthorized();
    throw new ApiError(json.code, json.msg);
  }

  if (json.code === 0) {
    return json.data;
  }
  toast.error(json.msg);
  throw new ApiError(json.code, json.msg);
}
