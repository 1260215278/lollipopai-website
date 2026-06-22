import type { Locale } from "../../i18n";

/**
 * 数据概览文案 —— 由 P2 功能 subagent 拥有并扩充。
 * 扩充时保持 4 语言（zh-CN/zh-TW/en/pt）结构完全一致；繁中/葡语机翻占位。
 */
export interface OverviewMessages {
  title: string;
  subtitle: string;
}

export const overview: Record<Locale, OverviewMessages> = {
  "zh-CN": { title: "数据概览", subtitle: "发行数据一览" },
  "zh-TW": { title: "數據概覽", subtitle: "發行數據一覽" },
  en: { title: "Overview", subtitle: "Your distribution at a glance" },
  pt: { title: "Visão geral", subtitle: "Sua distribuição em resumo" },
};
