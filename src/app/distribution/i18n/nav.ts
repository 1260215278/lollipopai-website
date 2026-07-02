import type { Locale } from "../../i18n";

/** 导航文案：营销站 Navbar 入口 + 发行中心侧边栏菜单 */
export interface NavMessages {
  /** 营销站 Navbar 的发行中心入口 */
  entry: string;
  overview: string;
  content: string;
  settlement: string;
  payment: string;
  earnings: string;
  withdraw: string;
  members: string;
}

export const nav: Record<Locale, NavMessages> = {
  "zh-CN": {
    entry: "发行中心",
    overview: "数据概览",
    content: "上剧中心",
    settlement: "结算中心",
    payment: "收款管理",
    earnings: "收益明细",
    withdraw: "结算记录",
    members: "成员管理",
  },
  "zh-TW": {
    entry: "發行中心",
    overview: "數據概覽",
    content: "上劇中心",
    settlement: "結算中心",
    payment: "收款管理",
    earnings: "收益明細",
    withdraw: "結算記錄",
    members: "成員管理",
  },
  en: {
    entry: "Distribution",
    overview: "Overview",
    content: "Upload Drama",
    settlement: "Settlement",
    payment: "Payment Accounts",
    earnings: "Earnings",
    withdraw: "Settlement Records",
    members: "Members",
  },
  pt: {
    entry: "Distribuição",
    overview: "Visão geral",
    content: "Publicar drama",
    settlement: "Liquidação",
    payment: "Contas de recebimento",
    earnings: "Receitas",
    withdraw: "Registros de liquidação",
    members: "Membros",
  },
};
