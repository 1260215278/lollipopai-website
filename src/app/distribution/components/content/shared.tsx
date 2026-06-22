import React from "react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { ContentMessages } from "../../i18n/content";
import type { DramaStatus, EpisodeStatus, DistributionType, Highlight } from "./types";

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

/** 上架状态视觉样式（颜色固定，文案由调用方按 i18n 决定） */
export const dramaStatusStyle: Record<DramaStatus, { bg: string; color: string }> = {
  online: { bg: "#F0FDF4", color: "#16A34A" },
  offline: { bg: "#F9FAFB", color: "#6B7280" },
  reviewing: { bg: "#FFF7ED", color: "#EA580C" },
  not_published: { bg: "#F3F4F6", color: "#9CA3AF" },
};

/** 上架状态 → i18n 文案 */
export function dramaStatusLabel(status: DramaStatus, t: ContentMessages): string {
  switch (status) {
    case "online":
      return t.statusOnline;
    case "offline":
      return t.statusOffline;
    case "reviewing":
      return t.statusReviewing;
    case "not_published":
      return t.statusNotPublished;
  }
}

/** 单集状态视觉样式 + 图标 */
export const epStatusStyle: Record<EpisodeStatus, { icon: React.ReactNode; color: string }> = {
  uploaded: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "#16A34A" },
  processing: { icon: <Clock className="w-3.5 h-3.5" />, color: "#EA580C" },
  failed: { icon: <AlertCircle className="w-3.5 h-3.5" />, color: "#EF4444" },
};

/** 单集状态 → i18n 文案 */
export function epStatusLabel(status: EpisodeStatus, t: ContentMessages): string {
  switch (status) {
    case "uploaded":
      return t.epStatusUploaded;
    case "processing":
      return t.epStatusProcessing;
    case "failed":
      return t.epStatusFailed;
  }
}

/** 发布范围 → 手机预览高亮位置 */
export function highlightsOf(distribution: DistributionType): Highlight[] {
  return distribution === "full" ? ["account", "homepage", "foryou"] : ["account"];
}

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
export const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode; hint?: string }> = ({
  label,
  required,
  children,
  hint,
}) => (
  <div>
    <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
      {label} {required && <span className="text-red-500">*</span>}
      {hint && <span className="ml-2 text-xs text-gray-400" style={{ fontWeight: 400 }}>{hint}</span>}
    </label>
    {children}
  </div>
);

/** 文本输入框基础类 */
export const inputClass = (err = false) =>
  `w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all ${
    err ? "border-red-400" : "border-gray-200 hover:border-gray-400 focus:border-black focus:ring-1 focus:ring-black"
  }`;
