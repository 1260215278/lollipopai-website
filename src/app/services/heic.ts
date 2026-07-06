const HEIC_EXT_RE = /\.(heic|heif)$/i;
const HEIC_TYPES = new Set(["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"]);
const OSS_HEIC_JPG_PROCESS = "image/auto-orient,1/format,jpg";

export function isHeicImage(file: File): boolean {
  return HEIC_EXT_RE.test(file.name) || HEIC_TYPES.has(file.type);
}

/**
 * HEIC/HEIF 上传原文件，展示/保存时使用 OSS 图片处理动态转 JPG。
 * 仅适用于公共读 OSS URL；私有签名 URL 需要后端用 SDK/REST API 处理。
 */
export function getOssHeicJpgUrl(file: File, url: string): string {
  if (!isHeicImage(file) || !url || url.includes("x-oss-process=")) return url;
  const hashIndex = url.indexOf("#");
  const body = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  const hash = hashIndex >= 0 ? url.slice(hashIndex) : "";
  return `${body}${body.includes("?") ? "&" : "?"}x-oss-process=${OSS_HEIC_JPG_PROCESS}${hash}`;
}
