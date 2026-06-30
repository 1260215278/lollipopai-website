import type { Locale } from "../../i18n";

/**
 * 结算记录文案 —— P3 结算中心（对接后端 /publisher/settlement/records，金额单位 USD）。
 * zh-CN / en 权威；zh-TW / pt 翻译，4 语言结构一致。
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
  colPeriod: string;
  colRatio: string;
  colRatioSub: string;
  colGross: string;
  colCreator: string;
  colPlatform: string;
  colStatus: string;
  colAction: string;
  /** 结算单状态 0-4 */
  statusDraft: string;
  statusApplied: string;
  statusApproved: string;
  statusPaid: string;
  statusRejected: string;
  /** 操作 */
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
    policyDesc: "平台按结算周期生成结算单，款项将打入您绑定的收款账户。请对草稿状态的结算单手动提交申请，平台审核后打款。",
    payoutDate: "结算款项打入已绑定收款账户",
    recordsTitle: "结算记录",
    statusFilter: "结算状态",
    statusAll: "全部",
    searchPlaceholder: "搜索结算周期 / 比例",
    colPeriod: "结算周期",
    colRatio: "结算比例",
    colRatioSub: "(平台：出品方)",
    colGross: "总额 (USD)",
    colCreator: "出品方实得 (USD)",
    colPlatform: "平台分成 (USD)",
    colStatus: "结算状态",
    colAction: "操作",
    statusDraft: "待申请",
    statusApplied: "已申请",
    statusApproved: "审核通过",
    statusPaid: "已打款",
    statusRejected: "已驳回",
    applySettlement: "申请结算",
    emptyTitle: "暂无结算记录",
    emptyDesc: "请先在「收款管理」中添加收款账户，才能发起结算。",
    applySuccess: "结算申请已提交",
  },
  "zh-TW": {
    title: "結算記錄",
    subtitle: "查看結算與提現記錄",
    policyTitle: "結算說明",
    policyDesc: "平台按結算週期生成結算單，款項將打入您綁定的收款帳戶。請對草稿狀態的結算單手動提交申請，平台審核後打款。",
    payoutDate: "結算款項打入已綁定收款帳戶",
    recordsTitle: "結算記錄",
    statusFilter: "結算狀態",
    statusAll: "全部",
    searchPlaceholder: "搜尋結算週期 / 比例",
    colPeriod: "結算週期",
    colRatio: "結算比例",
    colRatioSub: "(平台：出品方)",
    colGross: "總額 (USD)",
    colCreator: "出品方實得 (USD)",
    colPlatform: "平台分成 (USD)",
    colStatus: "結算狀態",
    colAction: "操作",
    statusDraft: "待申請",
    statusApplied: "已申請",
    statusApproved: "審核通過",
    statusPaid: "已打款",
    statusRejected: "已駁回",
    applySettlement: "申請結算",
    emptyTitle: "暫無結算記錄",
    emptyDesc: "請先在「收款管理」中新增收款帳戶，才能發起結算。",
    applySuccess: "結算申請已提交",
  },
  en: {
    title: "Settlement Records",
    subtitle: "View settlement and payout records",
    policyTitle: "Settlement Policy",
    policyDesc: "The platform generates settlement statements per period and pays out to your bound account. Submit draft statements manually; the platform pays after review.",
    payoutDate: "Payouts go to your bound payment account",
    recordsTitle: "Settlement Records",
    statusFilter: "Status",
    statusAll: "All",
    searchPlaceholder: "Search period / ratio",
    colPeriod: "Period",
    colRatio: "Split Ratio",
    colRatioSub: "(Platform : Publisher)",
    colGross: "Gross (USD)",
    colCreator: "Publisher Net (USD)",
    colPlatform: "Platform (USD)",
    colStatus: "Status",
    colAction: "Action",
    statusDraft: "Pending Apply",
    statusApplied: "Applied",
    statusApproved: "Approved",
    statusPaid: "Paid",
    statusRejected: "Rejected",
    applySettlement: "Apply",
    emptyTitle: "No settlement records",
    emptyDesc: "Add a payment account in Payment Management to begin settlements.",
    applySuccess: "Settlement request submitted",
  },
  pt: {
    title: "Registros de Liquidação",
    subtitle: "Veja registros de liquidação e saque",
    policyTitle: "Política de Liquidação",
    policyDesc: "A plataforma gera extratos de liquidação por período e paga na sua conta vinculada. Envie os extratos em rascunho manualmente; a plataforma paga após a revisão.",
    payoutDate: "Os pagamentos vão para sua conta vinculada",
    recordsTitle: "Registros de Liquidação",
    statusFilter: "Status",
    statusAll: "Todos",
    searchPlaceholder: "Buscar período / proporção",
    colPeriod: "Período",
    colRatio: "Proporção",
    colRatioSub: "(Plataforma : Produtor)",
    colGross: "Bruto (USD)",
    colCreator: "Líquido do Produtor (USD)",
    colPlatform: "Plataforma (USD)",
    colStatus: "Status",
    colAction: "Ação",
    statusDraft: "Aguardando",
    statusApplied: "Solicitado",
    statusApproved: "Aprovado",
    statusPaid: "Pago",
    statusRejected: "Rejeitado",
    applySettlement: "Solicitar",
    emptyTitle: "Sem registros de liquidação",
    emptyDesc: "Adicione uma conta de recebimento em Gestão de Recebimento para iniciar liquidações.",
    applySuccess: "Solicitação de liquidação enviada",
  },
};
