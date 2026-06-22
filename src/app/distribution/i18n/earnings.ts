import type { Locale } from "../../i18n";

/**
 * 收益明细文案 —— 由 P3 功能 subagent 拥有并扩充。
 * 扩充时保持 4 语言（zh-CN/zh-TW/en/pt）结构完全一致；繁中/葡语机翻占位。
 */
export interface EarningsMessages {
  title: string;
  subtitle: string;
}

export const earnings: Record<Locale, EarningsMessages> = {
  "zh-CN": { title: "收益明细", subtitle: "按月查看收益" },
  "zh-TW": { title: "收益明細", subtitle: "按月查看收益" },
  en: { title: "Earnings", subtitle: "View earnings by month" },
  pt: { title: "Receitas", subtitle: "Veja receitas por mês" },
};
