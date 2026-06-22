import type { Locale } from "../../i18n";

/**
 * 收款管理文案 —— P3 结算中心。
 * zh-CN / en 为权威（取自 figma 15150-30625/30744/30884/31032 与原型 PaymentPage）；
 * zh-TW / pt 机翻占位，4 语言结构完全一致。
 */
export interface PaymentMessages {
  title: string;
  subtitle: string;
  /** 空态 */
  emptyTitle: string;
  emptyDesc: string;
  addCardTitle: string;
  addCardDesc: string;
  addNow: string;
  /** 表单 */
  addTitle: string;
  editTitle: string;
  formCardTitle: string;
  formCardDesc: string;
  companyNameLabel: string;
  autoFilled: string;
  accountNoLabel: string;
  accountNoPlaceholder: string;
  bankLabel: string;
  bankPlaceholder: string;
  branchLabel: string;
  branchOptional: string;
  branchPlaceholder: string;
  confirm: string;
  cancel: string;
  back: string;
  /** 已绑定查看 */
  accountCardTitle: string;
  bound: string;
  edit: string;
  rowCompany: string;
  rowAccountNo: string;
  rowBank: string;
  rowBranch: string;
  savedTip: string;
  notice: string;
  /** 校验 / 反馈 */
  vAccountNoRequired: string;
  vBankRequired: string;
  addSuccess: string;
  updateSuccess: string;
}

export const payment: Record<Locale, PaymentMessages> = {
  "zh-CN": {
    title: "收款管理",
    subtitle: "管理平台结算打款的对公收款账户信息",
    emptyTitle: "尚未添加收款账户",
    emptyDesc: "添加对公银行账户后，平台结算款项将直接打款至您的账户。",
    addCardTitle: "添加收款账户",
    addCardDesc: "绑定对公银行账户，平台结算后直接打款到账。",
    addNow: "立即添加",
    addTitle: "添加收款账户",
    editTitle: "修改收款账户",
    formCardTitle: "对公收款账户",
    formCardDesc: "请填写对公收款信息，用于平台结算打款",
    companyNameLabel: "公司名称",
    autoFilled: "自动带入",
    accountNoLabel: "银行账号",
    accountNoPlaceholder: "请输入银行账号",
    bankLabel: "开户银行",
    bankPlaceholder: "如：中国工商银行",
    branchLabel: "支行名称",
    branchOptional: "（选填）",
    branchPlaceholder: "如：北京朝阳支行",
    confirm: "确认提交",
    cancel: "取消",
    back: "返回",
    accountCardTitle: "对公收款账户",
    bound: "已绑定",
    edit: "修改",
    rowCompany: "公司名称",
    rowAccountNo: "银行账号",
    rowBank: "开户银行",
    rowBranch: "支行名称",
    savedTip: "收款账户信息已保存",
    notice: "收款账户仅支持对公银行账户，结算款项将直接打款至该账户。如需修改，请联系平台客服。",
    vAccountNoRequired: "请填写银行账号",
    vBankRequired: "请填写开户银行",
    addSuccess: "收款账户添加成功",
    updateSuccess: "收款账户信息已更新",
  },
  "zh-TW": {
    title: "收款管理",
    subtitle: "管理平台結算打款的對公收款帳戶資訊",
    emptyTitle: "尚未新增收款帳戶",
    emptyDesc: "新增對公銀行帳戶後，平台結算款項將直接打款至您的帳戶。",
    addCardTitle: "新增收款帳戶",
    addCardDesc: "綁定對公銀行帳戶，平台結算後直接打款到帳。",
    addNow: "立即新增",
    addTitle: "新增收款帳戶",
    editTitle: "修改收款帳戶",
    formCardTitle: "對公收款帳戶",
    formCardDesc: "請填寫對公收款資訊，用於平台結算打款",
    companyNameLabel: "公司名稱",
    autoFilled: "自動帶入",
    accountNoLabel: "銀行帳號",
    accountNoPlaceholder: "請輸入銀行帳號",
    bankLabel: "開戶銀行",
    bankPlaceholder: "如：中國工商銀行",
    branchLabel: "支行名稱",
    branchOptional: "（選填）",
    branchPlaceholder: "如：北京朝陽支行",
    confirm: "確認提交",
    cancel: "取消",
    back: "返回",
    accountCardTitle: "對公收款帳戶",
    bound: "已綁定",
    edit: "修改",
    rowCompany: "公司名稱",
    rowAccountNo: "銀行帳號",
    rowBank: "開戶銀行",
    rowBranch: "支行名稱",
    savedTip: "收款帳戶資訊已儲存",
    notice: "收款帳戶僅支援對公銀行帳戶，結算款項將直接打款至該帳戶。如需修改，請聯絡平台客服。",
    vAccountNoRequired: "請填寫銀行帳號",
    vBankRequired: "請填寫開戶銀行",
    addSuccess: "收款帳戶新增成功",
    updateSuccess: "收款帳戶資訊已更新",
  },
  en: {
    title: "Payment Management",
    subtitle: "Manage the corporate bank account for platform settlements",
    emptyTitle: "No payment account added",
    emptyDesc: "Add a corporate bank account to receive settlement payments directly.",
    addCardTitle: "Add Payment Account",
    addCardDesc: "Bind a corporate bank account to receive direct settlements.",
    addNow: "Add Now",
    addTitle: "Add Payment Account",
    editTitle: "Edit Payment Account",
    formCardTitle: "Corporate Bank Account",
    formCardDesc: "Fill in the corporate account info used for platform settlements",
    companyNameLabel: "Company Name",
    autoFilled: "Auto-filled",
    accountNoLabel: "Account Number",
    accountNoPlaceholder: "Enter bank account number",
    bankLabel: "Bank Name",
    bankPlaceholder: "e.g. Bank of China",
    branchLabel: "Branch Name",
    branchOptional: "(optional)",
    branchPlaceholder: "e.g. Beijing Chaoyang Branch",
    confirm: "Submit",
    cancel: "Cancel",
    back: "Back",
    accountCardTitle: "Corporate Bank Account",
    bound: "Bound",
    edit: "Edit",
    rowCompany: "Company",
    rowAccountNo: "Account No.",
    rowBank: "Bank",
    rowBranch: "Branch",
    savedTip: "Payment account saved",
    notice: "Only corporate bank accounts are supported. Settlements are paid directly to this account. Contact support to update.",
    vAccountNoRequired: "Please enter the bank account number",
    vBankRequired: "Please enter the bank name",
    addSuccess: "Payment account added",
    updateSuccess: "Payment account updated",
  },
  pt: {
    title: "Gestão de Recebimento",
    subtitle: "Gerencie a conta bancária corporativa para liquidações da plataforma",
    emptyTitle: "Nenhuma conta de recebimento adicionada",
    emptyDesc: "Adicione uma conta bancária corporativa para receber liquidações diretamente.",
    addCardTitle: "Adicionar Conta de Recebimento",
    addCardDesc: "Vincule uma conta bancária corporativa para receber liquidações diretas.",
    addNow: "Adicionar Agora",
    addTitle: "Adicionar Conta de Recebimento",
    editTitle: "Editar Conta de Recebimento",
    formCardTitle: "Conta Bancária Corporativa",
    formCardDesc: "Preencha os dados da conta corporativa usados nas liquidações da plataforma",
    companyNameLabel: "Nome da Empresa",
    autoFilled: "Preenchido automaticamente",
    accountNoLabel: "Número da Conta",
    accountNoPlaceholder: "Digite o número da conta bancária",
    bankLabel: "Banco",
    bankPlaceholder: "ex.: Banco do Brasil",
    branchLabel: "Agência",
    branchOptional: "(opcional)",
    branchPlaceholder: "ex.: Agência Centro",
    confirm: "Enviar",
    cancel: "Cancelar",
    back: "Voltar",
    accountCardTitle: "Conta Bancária Corporativa",
    bound: "Vinculada",
    edit: "Editar",
    rowCompany: "Empresa",
    rowAccountNo: "Nº da Conta",
    rowBank: "Banco",
    rowBranch: "Agência",
    savedTip: "Conta de recebimento salva",
    notice: "Apenas contas bancárias corporativas são aceitas. As liquidações são pagas diretamente nesta conta. Contate o suporte para alterar.",
    vAccountNoRequired: "Digite o número da conta bancária",
    vBankRequired: "Digite o nome do banco",
    addSuccess: "Conta de recebimento adicionada",
    updateSuccess: "Conta de recebimento atualizada",
  },
};
