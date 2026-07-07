import type { Locale } from "../../i18n";

export interface WithdrawMessages {
  title: string;
  subtitle: string;
  policyTitle: string;
  policyDesc: string;
  payoutDate: string;
  totalSettled: string;
  settledCount: string;
  pendingTotal: string;
  applySettlement: string;
  resubmitSettlement: string;
  alreadyApplied: string;
  blockNoAccount: string;
  blockAlreadyApplied: string;
  blockNoEarnings: string;
  chartTitle: string;
  chartSubtitle: string;
  chartByTime: string;
  chartByDrama: string;
  chartAmount: string;
  chartCumulative: string;
  compareCourses: string;
  selectCourse: string;
  emptyChart: string;
  recordsTitle: string;
  statusFilter: string;
  statusAll: string;
  scopeAll: string;
  searchPlaceholder: string;
  colOrderNo: string;
  colPeriod: string;
  colType: string;
  colRatio: string;
  colTypeRatio: string;
  colAccountNo: string;
  colCreator: string;
  colDate: string;
  colStatus: string;
  colAction: string;
  colOrders: string;
  typeFull: string;
  typeAccount: string;
  statusApplied: string;
  statusApproved: string;
  statusPaid: string;
  statusRejected: string;
  groupApplied: string;
  groupSettled: string;
  groupFailed: string;
  detail: string;
  detailTitle: string;
  detailOrderNo: string;
  detailApplyTime: string;
  detailPeriod: string;
  detailAccount: string;
  detailAmount: string;
  detailStatus: string;
  detailGross: string;
  detailPlatform: string;
  itemCourse: string;
  itemGross: string;
  itemCreator: string;
  applyConfirmTitle: string;
  applyConfirmDesc: string;
  applyConfirmPeriod: string;
  applyConfirmAmount: string;
  applyConfirmAccount: string;
  applyConfirmTip: string;
  cancel: string;
  confirmApply: string;
  rejectedReason: string;
  emptyTitle: string;
  emptyDesc: string;
  applySuccess: string;
}

export const withdraw: Record<Locale, WithdrawMessages> = {
  "zh-CN": {
    title: "结算管理",
    subtitle: "提交结算申请并查看结算记录",
    policyTitle: "结算说明",
    policyDesc: "每月 15 日出款，提交申请后平台将在 1-3 个工作日内审核，审核通过后按默认收款账户打款。",
    payoutDate: "结算款项打入默认收款账户",
    totalSettled: "累计结算",
    settledCount: "已结算笔数",
    pendingTotal: "可结算金额",
    applySettlement: "提交结算申请",
    resubmitSettlement: "重新提交结算申请",
    alreadyApplied: "✓ 本月已提交申请",
    blockNoAccount: "请先添加收款账户",
    blockAlreadyApplied: "本月已提交申请",
    blockNoEarnings: "暂无可结算收益（仅可提交截至上月末的完整自然月收益）",
    chartTitle: "结算概况",
    chartSubtitle: "各剧集按月结算趋势",
    chartByTime: "按时间",
    chartByDrama: "按剧集",
    chartAmount: "结算金额",
    chartCumulative: "累计结算总额",
    compareCourses: "对比剧集：",
    selectCourse: "选择剧集",
    emptyChart: "暂无结算图表数据",
    recordsTitle: "结算记录",
    statusFilter: "结算状态",
    statusAll: "全部",
    scopeAll: "全部类型",
    searchPlaceholder: "搜索订单编号 / 结算周期",
    colOrderNo: "订单编号",
    colPeriod: "结算周期",
    colType: "结算类型",
    colRatio: "结算比例",
    colTypeRatio: "结算类型比例",
    colAccountNo: "账户号码",
    colCreator: "结算金额",
    colDate: "结算日期",
    colStatus: "结算状态",
    colAction: "操作",
    colOrders: "订单数",
    typeFull: "全量推荐",
    typeAccount: "账号主页",
    statusApplied: "待审核",
    statusApproved: "待打款",
    statusPaid: "已打款",
    statusRejected: "驳回/打款失败",
    groupApplied: "已申请",
    groupSettled: "已结算",
    groupFailed: "结算失败",
    detail: "详情",
    detailTitle: "结算单详情",
    detailOrderNo: "申请编号",
    detailApplyTime: "申请时间",
    detailPeriod: "结算周期",
    detailAccount: "收款账户",
    detailAmount: "申请金额",
    detailStatus: "申请状态",
    detailGross: "总流水",
    detailPlatform: "平台分成",
    itemCourse: "剧集 ID",
    itemGross: "总流水",
    itemCreator: "出品方实得",
    applyConfirmTitle: "确认提交结算申请？",
    applyConfirmDesc: "提交后将把截至上月末所有未结算的完整自然月生成结算单。",
    applyConfirmPeriod: "结算周期",
    applyConfirmAmount: "可结算金额",
    applyConfirmAccount: "收款账户",
    applyConfirmTip: "平台审核 1-3 个工作日，15 日前完成打款。",
    cancel: "取消",
    confirmApply: "确认提交",
    rejectedReason: "失败原因",
    emptyTitle: "暂无结算记录",
    emptyDesc: "暂无可展示的结算申请记录。",
    applySuccess: "结算申请已提交",
  },
  "zh-TW": {
    title: "結算管理",
    subtitle: "提交結算申請並查看結算記錄",
    policyTitle: "結算說明",
    policyDesc: "每月 15 日出款，提交申請後平台將在 1-3 個工作日內審核，通過後按預設收款帳戶打款。",
    payoutDate: "結算款項打入預設收款帳戶",
    totalSettled: "累計結算",
    settledCount: "已結算筆數",
    pendingTotal: "可結算金額",
    applySettlement: "提交結算申請",
    resubmitSettlement: "重新提交結算申請",
    alreadyApplied: "✓ 本月已提交申請",
    blockNoAccount: "請先新增收款帳戶",
    blockAlreadyApplied: "本月已提交申請",
    blockNoEarnings: "暫無可結算收益（僅可提交截至上月末的完整自然月收益）",
    chartTitle: "結算概況",
    chartSubtitle: "各劇集按月結算趨勢",
    chartByTime: "按時間",
    chartByDrama: "按劇集",
    chartAmount: "結算金額",
    chartCumulative: "累計結算總額",
    compareCourses: "對比劇集：",
    selectCourse: "選擇劇集",
    emptyChart: "暫無結算圖表資料",
    recordsTitle: "結算記錄",
    statusFilter: "結算狀態",
    statusAll: "全部",
    scopeAll: "全部類型",
    searchPlaceholder: "搜尋訂單編號 / 結算週期",
    colOrderNo: "訂單編號",
    colPeriod: "結算週期",
    colType: "結算類型",
    colRatio: "結算比例",
    colTypeRatio: "結算類型比例",
    colAccountNo: "帳戶號碼",
    colCreator: "結算金額",
    colDate: "結算日期",
    colStatus: "結算狀態",
    colAction: "操作",
    colOrders: "訂單數",
    typeFull: "全量推薦",
    typeAccount: "帳號主頁",
    statusApplied: "待審核",
    statusApproved: "待打款",
    statusPaid: "已打款",
    statusRejected: "駁回/打款失敗",
    groupApplied: "已申請",
    groupSettled: "已結算",
    groupFailed: "結算失敗",
    detail: "詳情",
    detailTitle: "結算單詳情",
    detailOrderNo: "申請編號",
    detailApplyTime: "申請時間",
    detailPeriod: "結算週期",
    detailAccount: "收款帳戶",
    detailAmount: "申請金額",
    detailStatus: "申請狀態",
    detailGross: "總流水",
    detailPlatform: "平台分成",
    itemCourse: "劇集 ID",
    itemGross: "總流水",
    itemCreator: "出品方實得",
    applyConfirmTitle: "確認提交結算申請？",
    applyConfirmDesc: "提交後將把截至上月末所有未結算的完整自然月生成結算單。",
    applyConfirmPeriod: "結算週期",
    applyConfirmAmount: "可結算金額",
    applyConfirmAccount: "收款帳戶",
    applyConfirmTip: "平台審核 1-3 個工作日，15 日前完成打款。",
    cancel: "取消",
    confirmApply: "確認提交",
    rejectedReason: "失敗原因",
    emptyTitle: "暫無結算記錄",
    emptyDesc: "暫無可展示的結算申請記錄。",
    applySuccess: "結算申請已提交",
  },
  en: {
    title: "Settlement Management",
    subtitle: "Submit settlement requests and view records",
    policyTitle: "Settlement Policy",
    policyDesc: "Payouts are issued on the 15th each month. Requests are reviewed in 1-3 business days and paid to the default payment account after approval.",
    payoutDate: "Settlements are paid to the default payment account",
    totalSettled: "Total Settled",
    settledCount: "Settled Orders",
    pendingTotal: "Settleable Amount",
    applySettlement: "Submit Request",
    resubmitSettlement: "Resubmit Request",
    alreadyApplied: "✓ Submitted This Month",
    blockNoAccount: "Add a payment account first",
    blockAlreadyApplied: "Already submitted this month",
    blockNoEarnings: "No settleable earnings from completed calendar months through last month",
    chartTitle: "Settlement Overview",
    chartSubtitle: "Monthly settlement trends by drama",
    chartByTime: "By Time",
    chartByDrama: "By Drama",
    chartAmount: "Settlement Amount",
    chartCumulative: "Cumulative Settled",
    compareCourses: "Compare dramas:",
    selectCourse: "Select",
    emptyChart: "No chart data",
    recordsTitle: "Settlement Records",
    statusFilter: "Status",
    statusAll: "All",
    scopeAll: "All Types",
    searchPlaceholder: "Search order no. / period",
    colOrderNo: "Order No.",
    colPeriod: "Period",
    colType: "Type",
    colRatio: "Ratio",
    colTypeRatio: "Type / Ratio",
    colAccountNo: "Account No.",
    colCreator: "Amount",
    colDate: "Settlement Date",
    colStatus: "Status",
    colAction: "Action",
    colOrders: "Orders",
    typeFull: "Full Distribution",
    typeAccount: "Account Homepage",
    statusApplied: "Pending Review",
    statusApproved: "Pending Payout",
    statusPaid: "Paid",
    statusRejected: "Rejected/Failed",
    groupApplied: "Applied",
    groupSettled: "Settled",
    groupFailed: "Failed",
    detail: "Detail",
    detailTitle: "Settlement Detail",
    detailOrderNo: "Request No.",
    detailApplyTime: "Applied At",
    detailPeriod: "Period",
    detailAccount: "Payment Account",
    detailAmount: "Request Amount",
    detailStatus: "Request Status",
    detailGross: "Gross",
    detailPlatform: "Platform Share",
    itemCourse: "Course ID",
    itemGross: "Gross",
    itemCreator: "Publisher Net",
    applyConfirmTitle: "Submit settlement request?",
    applyConfirmDesc: "This will generate settlement orders for all complete unsettled natural months up to the end of last month.",
    applyConfirmPeriod: "Period",
    applyConfirmAmount: "Settleable Amount",
    applyConfirmAccount: "Payment Account",
    applyConfirmTip: "Review takes 1-3 business days, with payout before the 15th.",
    cancel: "Cancel",
    confirmApply: "Submit",
    rejectedReason: "Failure Reason",
    emptyTitle: "No settlement records",
    emptyDesc: "No settlement requests to show yet.",
    applySuccess: "Settlement request submitted",
  },
  pt: {
    title: "Gestão de Liquidação",
    subtitle: "Envie solicitações e veja registros de liquidação",
    policyTitle: "Política de Liquidação",
    policyDesc: "Os pagamentos são emitidos no dia 15 de cada mês. As solicitações são revisadas em 1-3 dias úteis e pagas na conta padrão.",
    payoutDate: "As liquidações são pagas na conta padrão",
    totalSettled: "Total Liquidado",
    settledCount: "Ordens Liquidadas",
    pendingTotal: "Valor Disponível",
    applySettlement: "Enviar Solicitação",
    resubmitSettlement: "Reenviar Solicitação",
    alreadyApplied: "✓ Enviado este mês",
    blockNoAccount: "Adicione uma conta de recebimento primeiro",
    blockAlreadyApplied: "Já enviado este mês",
    blockNoEarnings: "Sem receitas liquidáveis de meses completos até o mês passado",
    chartTitle: "Visão de Liquidação",
    chartSubtitle: "Tendências mensais por drama",
    chartByTime: "Por Tempo",
    chartByDrama: "Por Drama",
    chartAmount: "Valor de Liquidação",
    chartCumulative: "Total Acumulado",
    compareCourses: "Comparar dramas:",
    selectCourse: "Selecionar",
    emptyChart: "Sem dados de gráfico",
    recordsTitle: "Registros de Liquidação",
    statusFilter: "Status",
    statusAll: "Todos",
    scopeAll: "Todos os tipos",
    searchPlaceholder: "Buscar nº do pedido / período",
    colOrderNo: "Nº do Pedido",
    colPeriod: "Período",
    colType: "Tipo",
    colRatio: "Proporção",
    colTypeRatio: "Tipo / Proporção",
    colAccountNo: "Nº da Conta",
    colCreator: "Valor",
    colDate: "Data de Liquidação",
    colStatus: "Status",
    colAction: "Ação",
    colOrders: "Pedidos",
    typeFull: "Distribuição total",
    typeAccount: "Página da conta",
    statusApplied: "Em revisão",
    statusApproved: "Aguardando pagamento",
    statusPaid: "Pago",
    statusRejected: "Rejeitado/Falhou",
    groupApplied: "Solicitado",
    groupSettled: "Liquidado",
    groupFailed: "Falhou",
    detail: "Detalhe",
    detailTitle: "Detalhe da Liquidação",
    detailOrderNo: "Nº da Solicitação",
    detailApplyTime: "Solicitado em",
    detailPeriod: "Período",
    detailAccount: "Conta de recebimento",
    detailAmount: "Valor solicitado",
    detailStatus: "Status",
    detailGross: "Bruto",
    detailPlatform: "Parcela da plataforma",
    itemCourse: "ID do Curso",
    itemGross: "Bruto",
    itemCreator: "Líquido do produtor",
    applyConfirmTitle: "Enviar solicitação de liquidação?",
    applyConfirmDesc: "Isto criará ordens para todos os meses naturais completos e não liquidados até o fim do mês passado.",
    applyConfirmPeriod: "Período",
    applyConfirmAmount: "Valor disponível",
    applyConfirmAccount: "Conta de recebimento",
    applyConfirmTip: "A revisão leva 1-3 dias úteis, com pagamento antes do dia 15.",
    cancel: "Cancelar",
    confirmApply: "Enviar",
    rejectedReason: "Motivo da falha",
    emptyTitle: "Sem registros de liquidação",
    emptyDesc: "Ainda não há solicitações de liquidação.",
    applySuccess: "Solicitação de liquidação enviada",
  },
};
