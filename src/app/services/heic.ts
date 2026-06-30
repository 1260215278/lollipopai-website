/**
 * HEIC/HEIF → JPEG 前端转码（bug9）。
 * 浏览器原生不渲染 HEIC，且部分浏览器读 HEIC 时 file.type 为空，故按扩展名 + MIME 双判。
 * 非 HEIC（含 PDF / 普通图片）原样返回。heic2any 体积较大，用动态 import 按需加载。
 */
export async function normalizeImageFile(file: File): Promise<File> {
  const isHeic =
    /\.(heic|heif)$/i.test(file.name) || file.type === "image/heic" || file.type === "image/heif";
  if (!isHeic) return file;
  try {
    const heic2any = (await import("heic2any")).default;
    const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
    const blob = Array.isArray(out) ? out[0] : out;
    const name = file.name.replace(/\.(heic|heif)$/i, ".jpg");
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    // 转码失败则回退原文件：后端已接受 HEIC，至少不阻断上传（仅预览可能空白）
    return file;
  }
}
