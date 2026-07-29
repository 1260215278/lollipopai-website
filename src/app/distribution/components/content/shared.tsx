import React from "react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { ContentMessages } from "../../i18n/content";
import { genderToChannel, type ChannelValue } from "../../mock/content";
import type { LanguageOption } from "../../../services/language";
import type { Highlight } from "./PhoneMockup";

/** /publisher/course/upload 白名单（20260703 上剧全流程文档）。 */
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/gif,image/bmp,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.gif,.bmp,.webp,.heic,.heif";
export const VIDEO_ACCEPT = "video/mp4,video/x-msvideo,video/quicktime,video/x-ms-wmv,video/x-flv,video/x-matroska,video/webm,.mp4,.avi,.mov,.wmv,.flv,.mkv,.webm,.m4v";
export const HIGHLIGHT_ACCEPT = "video/mp4,video/quicktime,.mp4,.mov";
export const COPYRIGHT_PROOF_ACCEPT = `${IMAGE_ACCEPT},application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.doc,.docx`;
/** 前端展示与拦截的视频大小上限（与 /publisher/course/upload 一致）。 */
export const VIDEO_MAX = 500 * 1024 * 1024;
/** 单集标题上限。 */
export const EPISODE_TITLE_LIMIT = 50;

/** 读取视频时长（m:ss），失败返回 "—" */
export const readVideoDuration = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      const s = Math.round(video.duration);
      resolve(isNaN(s) ? "—" : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);
    };
    video.onerror = () => resolve("—");
    video.src = URL.createObjectURL(file);
  });

/* ─── 审核状态（auditStatus 0草稿/1审核中/2通过/3驳回） ─────────── */

export const auditStatusStyle: Record<number, { bg: string; color: string }> = {
  0: { bg: "#F3F4F6", color: "#6B7280" },
  1: { bg: "#FFF7ED", color: "#EA580C" },
  2: { bg: "#F0FDF4", color: "#16A34A" },
  3: { bg: "#FEF2F2", color: "#EF4444" },
};

export function auditStatusLabel(s: number, t: ContentMessages): string {
  switch (s) {
    case 0:
      return t.auditDraft;
    case 1:
      return t.reviewReviewing;
    case 2:
      return t.reviewApproved;
    case 3:
      return t.auditRejected;
    default:
      return "—";
  }
}

/* ─── 上架状态（shelfStatus 0未上架/1已上架/2已下架，仅 auditStatus=2 有意义） ── */

export const shelfStatusStyle: Record<number, { bg: string; color: string }> = {
  0: { bg: "#F3F4F6", color: "#9CA3AF" },
  1: { bg: "#F0FDF4", color: "#16A34A" },
  2: { bg: "#F9FAFB", color: "#6B7280" },
};

export function shelfStatusLabel(s: number, t: ContentMessages): string {
  switch (s) {
    case 0:
      return t.statusNotPublished;
    case 1:
      return t.statusOnline;
    case 2:
      return t.statusOffline;
    default:
      return "—";
  }
}

/* ─── 剧集上传态（1已上传/2上传失败/0待提交虚拟态） ───────────── */

export const uploadStatusStyle: Record<number, { icon: React.ReactNode; color: string }> = {
  0: { icon: <Clock className="w-3.5 h-3.5" />, color: "#6366F1" },
  1: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "#16A34A" },
  2: { icon: <AlertCircle className="w-3.5 h-3.5" />, color: "#EF4444" },
};

export function uploadStatusLabel(s: number, t: ContentMessages): string {
  switch (s) {
    case 1:
      return t.epStatusUploaded;
    case 2:
      return t.epStatusFailed;
    default:
      return t.statPendingSubmit;
  }
}

/* ─── 发布范围 → 手机预览高亮位置 ─────────────────────────────── */

/** publishScope: 1 账号主页 / 2 全量推荐（账号主页 + 首页推荐 + For You） */
export function highlightsOf(publishScope: number): Highlight[] {
  return publishScope === 2 ? ["account", "homepage", "foryou"] : ["account"];
}

/** genderType(1/2/3) → 频道 i18n key */
export function genderChannelKey(genderType: number): ChannelValue {
  return genderToChannel(genderType);
}

export function languageLabel(languageType: string | undefined | null, languages: LanguageOption[]): string {
  if (!languageType) return "—";
  return languages.find((item) => item.language === languageType)?.languageName || languageType;
}

/* ─── 格式化 ──────────────────────────────────────────────────── */

/** 字节 → "15.0 MB"（无效返回 "—"） */
export function formatBytes(bytes: number | undefined | null): string {
  if (!bytes || bytes <= 0) return "—";
  const mb = bytes / 1024 / 1024;
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(1)} MB`;
}

/** 秒 → "m:ss"（无效返回 "—"） */
export function formatDuration(sec: number | undefined | null): string {
  if (!sec || sec <= 0) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** USD 金额 → "$0.59"；null/undefined → "—"（该国不卖单集） */
export function formatUsd(v: number | null | undefined): string {
  return v == null ? "—" : `$${v}`;
}

/** 从 OSS URL 取文件名（去掉 query/hash）；空值返回 "" */
export function fileNameFromUrl(url: string | undefined | null): string {
  if (!url) return "";
  const path = url.split(/[?#]/)[0];
  const name = path.substring(path.lastIndexOf("/") + 1);
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

/* ─── 占位替换 / 布局小组件 ──────────────────────────────────── */

/** 简单占位替换：把 "{key}" 换成 vars[key] */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

/** 详情页基础信息行 */
export const InfoRow: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({
  icon,
  label,
  children,
}) => (
  <div className="flex items-start gap-3 py-3.5 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-2 w-28 flex-shrink-0 mt-0.5">
      <span className="text-gray-400">{icon}</span>
      <span className="text-xs text-gray-500" style={{ fontWeight: 500 }}>
        {label}
      </span>
    </div>
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);

/** 表单字段容器 */
export const Field: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
  /** 提示文案 class，默认与「根据实际集数填写…」一致的灰色小字；可传 text-red-500 等 */
  hintClassName?: string;
}> = ({ label, required, children, hint, hintClassName = "text-gray-400" }) => (
  <div>
    <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
      {label} {required && <span className="text-red-500">*</span>}
      {hint && (
        <span className={`ml-2 text-xs ${hintClassName}`} style={{ fontWeight: 400 }}>
          {hint}
        </span>
      )}
    </label>
    {children}
  </div>
);

/** 文本输入框基础类 */
export const inputClass = (err = false) =>
  `w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all ${
    err ? "border-red-400" : "border-gray-200 hover:border-gray-400 focus:border-black focus:ring-1 focus:ring-black"
  }`;
