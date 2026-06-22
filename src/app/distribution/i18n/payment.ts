import type { Locale } from "../../i18n";

/**
 * 收款管理文案 —— 由 P3 功能 subagent 拥有并扩充。
 * 扩充时保持 4 语言（zh-CN/zh-TW/en/pt）结构完全一致；繁中/葡语机翻占位。
 */
export interface PaymentMessages {
  title: string;
  subtitle: string;
}

export const payment: Record<Locale, PaymentMessages> = {
  "zh-CN": { title: "收款管理", subtitle: "管理你的收款账户" },
  "zh-TW": { title: "收款管理", subtitle: "管理你的收款帳戶" },
  en: { title: "Payment Accounts", subtitle: "Manage your payout accounts" },
  pt: { title: "Contas de recebimento", subtitle: "Gerencie suas contas de pagamento" },
};
