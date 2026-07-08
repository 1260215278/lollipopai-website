import type { Locale } from "../../i18n";

/** 导航文案：营销站 Navbar 入口 + 发行中心侧边栏菜单 */
export interface NavMessages {
  /** 营销站 Navbar 的发行中心入口 */
  entry: string;
  content: string;
  settlement: string;
  payment: string;
  earnings: string;
  withdraw: string;
  account: string;
  members: string;
}

export const nav: Record<Locale, NavMessages> = {
  "zh-CN": {
    entry: "发行中心",
    content: "发行新剧",
    settlement: "收益中心",
    payment: "收款信息",
    earnings: "收益明细",
    withdraw: "结算管理",
    account: "账号信息",
    members: "成员管理",
  },
  "zh-TW": {
    entry: "發行中心",
    content: "上劇",
    settlement: "結算中心",
    payment: "收款管理",
    earnings: "收益明細",
    withdraw: "結算記錄",
    account: "帳號資訊",
    members: "成員管理",
  },
  en: {
    entry: "Distribution",
    content: "Upload Drama",
    settlement: "Settlement",
    payment: "Payment Accounts",
    earnings: "Earnings",
    withdraw: "Settlement Records",
    account: "Account",
    members: "Members",
  },
  pt: {
    entry: "Distribuição",
    content: "Publicar drama",
    settlement: "Liquidação",
    payment: "Contas de recebimento",
    earnings: "Receitas",
    withdraw: "Registros de liquidação",
    account: "Conta",
    members: "Membros",
  },
};
