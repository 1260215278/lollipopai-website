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
  pending: string;
  relatedDramas: string;
  settlementBills: string;
  yesterday: string;
  estThisMonth: string;
  monthlyTrend: string;
  chartEarnings: string;
  /** 月度趋势 X 轴标签，"{n}月" / "M{n}" */
  monthLabel: string;
  /** 收益详情 */
  detailTitle: string;
  searchPlaceholder: string;
  updatedDaily: string;
  colDate: string;
  colDrama: string;
  colType: string;
  colShare: string;
  colOrders: string;
  colViewCount: string;
  colAmount: string;
  colSettleStatus: string;
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
    withdrawable: "可结算",
    processing: "结算中",
    withdrawn: "已结算",
    pending: "待入账",
    relatedDramas: "关联剧集",
    settlementBills: "结算账单",
    yesterday: "昨日实得",
    estThisMonth: "本月预估",
    monthlyTrend: "月度收益趋势",
    chartEarnings: "收益",
    monthLabel: "{n}月",
    detailTitle: "收益详情",
    searchPlaceholder: "搜索剧集名称",
    updatedDaily: "数据每日更新",
    colDate: "归集日期",
    colDrama: "剧集名称",
    colType: "收益类型",
    colShare: "分成",
    colOrders: "订单数",
    colViewCount: "播放量",
    colAmount: "出品方实得",
    colSettleStatus: "结算状态",
    typeFull: "全量推荐",
    typeAccount: "账号主页",
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
    withdrawable: "可結算",
    processing: "結算中",
    withdrawn: "已結算",
    pending: "待入帳",
    relatedDramas: "關聯劇集",
    settlementBills: "結算帳單",
    yesterday: "昨日實得",
    estThisMonth: "本月預估",
    monthlyTrend: "月度收益趨勢",
    chartEarnings: "收益",
    monthLabel: "{n}月",
    detailTitle: "收益詳情",
    searchPlaceholder: "搜尋劇集名稱",
    updatedDaily: "資料每日更新",
    colDate: "歸集日期",
    colDrama: "劇集名稱",
    colType: "收益類型",
    colShare: "分成",
    colOrders: "訂單數",
    colViewCount: "播放量",
    colAmount: "出品方實得",
    colSettleStatus: "結算狀態",
    typeFull: "全量推薦",
    typeAccount: "帳號主頁",
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
    withdrawable: "Available to Settle",
    processing: "Processing",
    withdrawn: "Settled",
    pending: "Pending Posting",
    relatedDramas: "Dramas",
    settlementBills: "Settlement Bills",
    yesterday: "Yesterday",
    estThisMonth: "Est. This Month",
    monthlyTrend: "Monthly Trend",
    chartEarnings: "Earnings",
    monthLabel: "M{n}",
    detailTitle: "Earnings Detail",
    searchPlaceholder: "Search drama name",
    updatedDaily: "Updated daily",
    colDate: "Date",
    colDrama: "Drama",
    colType: "Type",
    colShare: "Share",
    colOrders: "Orders",
    colViewCount: "Views",
    colAmount: "Creator Earned",
    colSettleStatus: "Settlement Status",
    typeFull: "Full Distribution",
    typeAccount: "Account Homepage",
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
    withdrawable: "Disponível para liquidar",
    processing: "Em processamento",
    withdrawn: "Liquidado",
    pending: "Pendente de crédito",
    relatedDramas: "Dramas",
    settlementBills: "Faturas de Liquidação",
    yesterday: "Ontem",
    estThisMonth: "Estim. deste mês",
    monthlyTrend: "Tendência Mensal",
    chartEarnings: "Receita",
    monthLabel: "M{n}",
    detailTitle: "Detalhe de Receitas",
    searchPlaceholder: "Buscar nome do drama",
    updatedDaily: "Atualizado diariamente",
    colDate: "Data",
    colDrama: "Drama",
    colType: "Tipo",
    colShare: "Divisão",
    colOrders: "Pedidos",
    colViewCount: "Visualizações",
    colAmount: "Receita do criador",
    colSettleStatus: "Status de Liquidação",
    typeFull: "Distribuição total",
    typeAccount: "Página da conta",
    statusSettled: "Liquidado",
    statusProcessing: "Em processamento",
    statusPending: "Pendente",
    emptyMonth: "Sem registros neste mês",
    emptyTitle: "Ainda sem receitas",
    emptyDesc: "Adicione uma conta de recebimento em Gestão de Recebimento; os detalhes são gerados automaticamente após a liquidação.",
  },
};
