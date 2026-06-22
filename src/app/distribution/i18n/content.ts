import type { Locale } from "../../i18n";

/**
 * 上剧中心文案 —— 由 P2 功能 subagent 拥有并扩充。
 * 扩充时保持 4 语言（zh-CN/zh-TW/en/pt）结构完全一致；繁中/葡语机翻占位。
 */
export interface ContentMessages {
  title: string;
  subtitle: string;
}

export const content: Record<Locale, ContentMessages> = {
  "zh-CN": { title: "上剧中心", subtitle: "上传与管理你的剧集" },
  "zh-TW": { title: "上劇中心", subtitle: "上傳與管理你的劇集" },
  en: { title: "Upload Drama", subtitle: "Upload and manage your dramas" },
  pt: { title: "Publicar drama", subtitle: "Envie e gerencie seus dramas" },
};
