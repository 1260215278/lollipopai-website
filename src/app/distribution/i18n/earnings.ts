import type { Locale } from "../../i18n";

/**
 * 收益明细文案 —— P3 结算中心。
 * zh-CN / en 权威（figma 15151-31377 暂无 / 15135-27153 列表 + 原型 EarningsPage）；
 * zh-TW / pt 机翻占位，4 语言结构完全一致。
 */
export interface EarningsMessages {
  title: string;
  subtitle: string;
  /** 收益总览 */
  overviewTitle: string;
  overviewSubtitle: string;
  totalCumulative: string;
  growthVsLastMonth: string;
  withdrawable: string;
  processing: string;
  withdrawn: string;
  relatedDramas: string;
  estThisMonth: string;
  bills: string;
  monthlyTrend: string;
  chartEarnings: string;
  /** 月度趋势 X 轴标签，"{n}月" / "M{n}" */
  monthLabel: string;
  /** 收益详情 */
  detailTitle: string;
  searchPlaceholder: string;
  updatedDaily: string;
  colDrama: string;
  colType: string;
  colShare: string;
  colViews: string;
  colAmount: string;
  colStatus: string;
  /** 收益类型 */
  typeFull: string;
  typeAccount: string;
  /** 状态 */
  statusSettled: string;
  statusProcessing: string;
  statusPending: string;
  /** 空态 */
  emptyMonth: string;
  emptyTitle: string;
  emptyDesc: string;
}

export const earnings: Record<Locale, EarningsMessages> = {
  "zh-CN": {
    title: "收益明细",
    subtitle: "按月查看收益",
    overviewTitle: "收益总览",
    overviewSubtitle: "所有数据不含历史线下结算部分",
    totalCumulative: "累计总收益",
    growthVsLastMonth: "本月较上月增长 {rate}%",
    withdrawable: "可提现",
    processing: "结算中",
    withdrawn: "已提现",
    relatedDramas: "关联剧集",
    estThisMonth: "本月预估",
    bills: "结算账单",
    monthlyTrend: "月度收益趋势",
    chartEarnings: "收益",
    monthLabel: "{n}月",
    detailTitle: "收益详情",
    searchPlaceholder: "搜索剧集名称",
    updatedDaily: "数据每日更新",
    colDrama: "剧集名称",
    colType: "收益类型",
    colShare: "分成",
    colViews: "播放量",
    colAmount: "结算金额",
    colStatus: "状态",
    typeFull: "全量推荐订阅",
    typeAccount: "账户主页订阅",
    statusSettled: "已结算",
    statusProcessing: "结算中",
    statusPending: "待结算",
    emptyMonth: "当月暂无收益记录",
    emptyTitle: "暂无收益明细",
    emptyDesc: "请先在「收款管理」中添加收款账户，平台结算后将自动生成收益明细。",
  },
  "zh-TW": {
    title: "收益明細",
    subtitle: "按月查看收益",
    overviewTitle: "收益總覽",
    overviewSubtitle: "所有資料不含歷史線下結算部分",
    totalCumulative: "累計總收益",
    growthVsLastMonth: "本月較上月增長 {rate}%",
    withdrawable: "可提現",
    processing: "結算中",
    withdrawn: "已提現",
    relatedDramas: "關聯劇集",
    estThisMonth: "本月預估",
    bills: "結算帳單",
    monthlyTrend: "月度收益趨勢",
    chartEarnings: "收益",
    monthLabel: "{n}月",
    detailTitle: "收益詳情",
    searchPlaceholder: "搜尋劇集名稱",
    updatedDaily: "資料每日更新",
    colDrama: "劇集名稱",
    colType: "收益類型",
    colShare: "分成",
    colViews: "播放量",
    colAmount: "結算金額",
    colStatus: "狀態",
    typeFull: "全量推薦訂閱",
    typeAccount: "帳戶主頁訂閱",
    statusSettled: "已結算",
    statusProcessing: "結算中",
    statusPending: "待結算",
    emptyMonth: "當月暫無收益記錄",
    emptyTitle: "暫無收益明細",
    emptyDesc: "請先在「收款管理」中新增收款帳戶，平台結算後將自動生成收益明細。",
  },
  en: {
    title: "Earnings",
    subtitle: "View earnings by month",
    overviewTitle: "Earnings Overview",
    overviewSubtitle: "Excludes historical offline settlements",
    totalCumulative: "Total Cumulative",
    growthVsLastMonth: "+{rate}% vs last month",
    withdrawable: "Withdrawable",
    processing: "Processing",
    withdrawn: "Withdrawn",
    relatedDramas: "Dramas",
    estThisMonth: "Est. This Month",
    bills: "Bills",
    monthlyTrend: "Monthly Trend",
    chartEarnings: "Earnings",
    monthLabel: "M{n}",
    detailTitle: "Earnings Detail",
    searchPlaceholder: "Search drama name",
    updatedDaily: "Updated daily",
    colDrama: "Drama",
    colType: "Type",
    colShare: "Share",
    colViews: "Views",
    colAmount: "Amount",
    colStatus: "Status",
    typeFull: "Full Boost Sub.",
    typeAccount: "Account Sub.",
    statusSettled: "Settled",
    statusProcessing: "Processing",
    statusPending: "Pending",
    emptyMonth: "No records for this month",
    emptyTitle: "No earnings yet",
    emptyDesc: "Add a payment account in Payment Management; earnings details are generated automatically after settlement.",
  },
  pt: {
    title: "Receitas",
    subtitle: "Veja receitas por mês",
    overviewTitle: "Visão Geral de Receitas",
    overviewSubtitle: "Exclui liquidações offline históricas",
    totalCumulative: "Total Acumulado",
    growthVsLastMonth: "+{rate}% vs mês anterior",
    withdrawable: "Disponível",
    processing: "Em processamento",
    withdrawn: "Sacado",
    relatedDramas: "Dramas",
    estThisMonth: "Estim. deste mês",
    bills: "Faturas",
    monthlyTrend: "Tendência Mensal",
    chartEarnings: "Receita",
    monthLabel: "M{n}",
    detailTitle: "Detalhe de Receitas",
    searchPlaceholder: "Buscar nome do drama",
    updatedDaily: "Atualizado diariamente",
    colDrama: "Drama",
    colType: "Tipo",
    colShare: "Divisão",
    colViews: "Visualizações",
    colAmount: "Valor",
    colStatus: "Status",
    typeFull: "Assin. Impulso Total",
    typeAccount: "Assin. de Conta",
    statusSettled: "Liquidado",
    statusProcessing: "Em processamento",
    statusPending: "Pendente",
    emptyMonth: "Sem registros neste mês",
    emptyTitle: "Ainda sem receitas",
    emptyDesc: "Adicione uma conta de recebimento em Gestão de Recebimento; os detalhes são gerados automaticamente após a liquidação.",
  },
};
