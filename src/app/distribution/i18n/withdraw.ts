import type { Locale } from "../../i18n";

/**
 * 结算记录文案 —— P3 结算中心。
 * zh-CN / en 权威（figma 15151-31580 暂无 / 15188-33359 列表 / 15152-31918 点击结算 + 原型 WithdrawPage）；
 * zh-TW / pt 机翻占位，4 语言结构完全一致。
 */
export interface WithdrawMessages {
  title: string;
  subtitle: string;
  /** 结算说明卡 */
  policyTitle: string;
  policyDesc: string;
  payoutDate: string;
  /** 列表卡 */
  recordsTitle: string;
  statusFilter: string;
  statusAll: string;
  searchPlaceholder: string;
  /** 表头 */
  colDate: string;
  colPeriod: string;
  colRatio: string;
  colRatioSub: string;
  colType: string;
  colAccountType: string;
  colAccountNo: string;
  colAmount: string;
  colStatus: string;
  colAction: string;
  /** 结算类型 */
  typeFull: string;
  typeAccount: string;
  /** 账户类型 */
  accountCn: string;
  accountOverseas: string;
  /** 状态 + 操作 */
  statusUnpaid: string;
  statusPaid: string;
  applySettlement: string;
  /** 空态 */
  emptyTitle: string;
  emptyDesc: string;
  /** 反馈 */
  applySuccess: string;
}

export const withdraw: Record<Locale, WithdrawMessages> = {
  "zh-CN": {
    title: "结算记录",
    subtitle: "查看结算与提现记录",
    policyTitle: "结算说明",
    policyDesc: "平台每月 15 日为固定出款日，款项将直接打入您绑定的收款账户。请手动提交结算申请，平台审核后按时打款。",
    payoutDate: "每月 15 日固定出款",
    recordsTitle: "结算记录",
    statusFilter: "结算状态",
    statusAll: "全部",
    searchPlaceholder: "搜索结算周期 / 类型",
    colDate: "结算日期",
    colPeriod: "结算周期",
    colRatio: "结算比例",
    colRatioSub: "(平台：出品方)",
    colType: "结算类型",
    colAccountType: "账户类型",
    colAccountNo: "账户号码",
    colAmount: "结算金额",
    colStatus: "结算状态",
    colAction: "操作",
    typeFull: "全量推荐订阅",
    typeAccount: "账户主页订阅",
    accountCn: "中国公户",
    accountOverseas: "海外公户",
    statusUnpaid: "未打款",
    statusPaid: "已打款",
    applySettlement: "申请结算",
    emptyTitle: "暂无结算记录",
    emptyDesc: "请先在「收款管理」中添加收款账户，才能发起结算。",
    applySuccess: "结算申请已提交",
  },
  "zh-TW": {
    title: "結算記錄",
    subtitle: "查看結算與提現記錄",
    policyTitle: "結算說明",
    policyDesc: "平台每月 15 日為固定出款日，款項將直接打入您綁定的收款帳戶。請手動提交結算申請，平台審核後按時打款。",
    payoutDate: "每月 15 日固定出款",
    recordsTitle: "結算記錄",
    statusFilter: "結算狀態",
    statusAll: "全部",
    searchPlaceholder: "搜尋結算週期 / 類型",
    colDate: "結算日期",
    colPeriod: "結算週期",
    colRatio: "結算比例",
    colRatioSub: "(平台：出品方)",
    colType: "結算類型",
    colAccountType: "帳戶類型",
    colAccountNo: "帳戶號碼",
    colAmount: "結算金額",
    colStatus: "結算狀態",
    colAction: "操作",
    typeFull: "全量推薦訂閱",
    typeAccount: "帳戶主頁訂閱",
    accountCn: "中國公戶",
    accountOverseas: "海外公戶",
    statusUnpaid: "未打款",
    statusPaid: "已打款",
    applySettlement: "申請結算",
    emptyTitle: "暫無結算記錄",
    emptyDesc: "請先在「收款管理」中新增收款帳戶，才能發起結算。",
    applySuccess: "結算申請已提交",
  },
  en: {
    title: "Settlement Records",
    subtitle: "View settlement and payout records",
    policyTitle: "Settlement Policy",
    policyDesc: "The platform pays out on the 15th of each month to your bound payment account. Submit a settlement request manually; the platform processes it on schedule.",
    payoutDate: "Fixed payout date: 15th of each month",
    recordsTitle: "Settlement Records",
    statusFilter: "Status",
    statusAll: "All",
    searchPlaceholder: "Search period / type",
    colDate: "Date",
    colPeriod: "Period",
    colRatio: "Split Ratio",
    colRatioSub: "(Platform : Publisher)",
    colType: "Type",
    colAccountType: "Account Type",
    colAccountNo: "Account No.",
    colAmount: "Amount",
    colStatus: "Status",
    colAction: "Action",
    typeFull: "Full Boost Sub.",
    typeAccount: "Account Sub.",
    accountCn: "CN Corporate",
    accountOverseas: "Overseas Corporate",
    statusUnpaid: "Unpaid",
    statusPaid: "Paid",
    applySettlement: "Apply",
    emptyTitle: "No settlement records",
    emptyDesc: "Add a payment account in Payment Management to begin settlements.",
    applySuccess: "Settlement request submitted",
  },
  pt: {
    title: "Registros de Liquidação",
    subtitle: "Veja registros de liquidação e saque",
    policyTitle: "Política de Liquidação",
    policyDesc: "A plataforma paga no dia 15 de cada mês na sua conta de recebimento vinculada. Envie a solicitação de liquidação manualmente; a plataforma processa no prazo.",
    payoutDate: "Data fixa de pagamento: dia 15 de cada mês",
    recordsTitle: "Registros de Liquidação",
    statusFilter: "Status",
    statusAll: "Todos",
    searchPlaceholder: "Buscar período / tipo",
    colDate: "Data",
    colPeriod: "Período",
    colRatio: "Proporção",
    colRatioSub: "(Plataforma : Produtor)",
    colType: "Tipo",
    colAccountType: "Tipo de Conta",
    colAccountNo: "Nº da Conta",
    colAmount: "Valor",
    colStatus: "Status",
    colAction: "Ação",
    typeFull: "Assin. Impulso Total",
    typeAccount: "Assin. de Conta",
    accountCn: "Corporativa CN",
    accountOverseas: "Corporativa Exterior",
    statusUnpaid: "Não pago",
    statusPaid: "Pago",
    applySettlement: "Solicitar",
    emptyTitle: "Sem registros de liquidação",
    emptyDesc: "Adicione uma conta de recebimento em Gestão de Recebimento para iniciar liquidações.",
    applySuccess: "Solicitação de liquidação enviada",
  },
};
