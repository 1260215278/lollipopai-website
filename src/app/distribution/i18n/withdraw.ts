import type { Locale } from "../../i18n";

/**
 * 结算记录文案 —— 由 P3 功能 subagent 拥有并扩充。
 * 扩充时保持 4 语言（zh-CN/zh-TW/en/pt）结构完全一致；繁中/葡语机翻占位。
 */
export interface WithdrawMessages {
  title: string;
  subtitle: string;
}

export const withdraw: Record<Locale, WithdrawMessages> = {
  "zh-CN": { title: "结算记录", subtitle: "查看结算与提现记录" },
  "zh-TW": { title: "結算記錄", subtitle: "查看結算與提現記錄" },
  en: { title: "Settlement Records", subtitle: "View settlement and payout records" },
  pt: { title: "Registros de liquidação", subtitle: "Veja registros de liquidação e saque" },
};
