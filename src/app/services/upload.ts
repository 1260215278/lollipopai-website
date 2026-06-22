/**
 * 通用上传服务
 * ------------------------------------------------------------------
 * 证照 / 封面 / 视频统一走 POST /alioss/upload（multipart，字段名 file）。
 * 该接口在后端为 anon（可不带 token），但已登录场景下正常携带。
 * 成功时 data 为图片/文件的完整 URL 字符串。
 */
import { toast } from "sonner";
import { getToken } from "./auth";
import { BASE_URL, ApiError, type ApiResponse } from "./http";
import { getMessages } from "../i18n";

const UPLOAD_PATH = "/alioss/upload";

/**
 * 上传单个文件，返回其完整 URL。
 * @param file 待上传文件
 * @returns 文件 URL 字符串
 */
export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["token"] = token;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${UPLOAD_PATH}`, {
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
    throw new ApiError(res.status, msg);
  }

  if (json.code === 0) {
    return json.data;
  }
  toast.error(json.msg);
  throw new ApiError(json.code, json.msg);
}
