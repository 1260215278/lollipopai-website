import type { Locale } from "../../i18n";

/**
 * 发行者入驻文案。
 * zh-CN 为权威（取自 figma 设计稿 15237-33700 与接口文档）；
 * en 同步；zh-TW / pt 机翻占位，结构一致。
 */
export interface EnrollMessages {
  // 头部
  welcomeTitle: string;
  welcomeSubtitle: string;
  // 分区标题
  sectionAccount: string;
  sectionCompany: string;
  sectionAgreement: string;
  // 关联账号
  phoneLabel: string;
  phonePlaceholder: string;
  phoneBoundHint: string;
  phoneRegisterHint: string;
  codeLabel: string;
  codePlaceholder: string;
  sendCode: string;
  resendIn: string; // 含 {s} 占位
  // 公司信息
  companyNameLabel: string;
  companyNamePlaceholder: string;
  businessLicenseLabel: string;
  legalPersonNameLabel: string;
  legalPersonNamePlaceholder: string;
  legalPersonIdNoLabel: string;
  legalPersonIdNoPlaceholder: string;
  idCardFrontLabel: string;
  idCardBackLabel: string;
  // 上传区
  uploadPrompt: string; // "点击或拖拽上传"
  uploadFormat: string; // "支持 JPG、PNG 格式"
  uploadReplace: string;
  uploadFailed: string;
  // 协议
  agreement: string;
  // 提交
  submit: string;
  resubmit: string;
  // 前端校验
  vPhoneRequired: string;
  vCodeRequired: string;
  vCompanyRequired: string;
  vLicenseRequired: string;
  vLegalNameRequired: string;
  vLegalIdRequired: string;
  vIdFrontRequired: string;
  vIdBackRequired: string;
  vAgreementRequired: string;
  // toast
  sendCodeSuccess: string;
  submitSuccess: string;
  // 审核中
  reviewingTitle: string;
  reviewingDesc: string;
  reviewingNotice: string;
  reviewingStepSubmitted: string;
  reviewingStepReviewing: string;
  reviewingStepDone: string;
  // 已通过
  approvedTitle: string;
  approvedDesc: string;
  enterDashboard: string;
  // 已驳回
  rejectedTitle: string;
  rejectReasonLabel: string;
  rejectedHint: string;
}

export const enroll: Record<Locale, EnrollMessages> = {
  "zh-CN": {
    welcomeTitle: "填写以下信息，即可在 Lollipop 发行剧集",
    welcomeSubtitle: "完成入驻后即可上架内容、接入分成，让优质剧集触达更多观众。",
    sectionAccount: "关联账号",
    sectionCompany: "公司信息",
    sectionAgreement: "合作协议",
    phoneLabel: "手机号",
    phonePlaceholder: "请输入手机号",
    phoneBoundHint: "已绑定账号手机号，无需修改",
    phoneRegisterHint: "该手机号将自动注册为您的 Lollipop 平台账号，亦可用于登录 AI 视频创作工具 Swift",
    codeLabel: "验证码",
    codePlaceholder: "请输入验证码",
    sendCode: "发送验证码",
    resendIn: "{s}s 后重发",
    companyNameLabel: "公司名称",
    companyNamePlaceholder: "请输入公司名称",
    businessLicenseLabel: "营业执照上传",
    legalPersonNameLabel: "法人姓名",
    legalPersonNamePlaceholder: "请输入法人姓名",
    legalPersonIdNoLabel: "法人身份证号",
    legalPersonIdNoPlaceholder: "请输入18位身份证号",
    idCardFrontLabel: "身份证人像面",
    idCardBackLabel: "身份证国徽面",
    uploadPrompt: "点击或拖拽上传",
    uploadFormat: "支持 JPG、PNG 格式",
    uploadReplace: "点击替换",
    uploadFailed: "上传失败，请重试",
    agreement: "我已阅读并同意《平台入驻合作协议》和《隐私政策》",
    submit: "提交入驻申请",
    resubmit: "重新提交申请",
    vPhoneRequired: "请输入手机号",
    vCodeRequired: "请输入验证码",
    vCompanyRequired: "请输入公司名称",
    vLicenseRequired: "请上传营业执照",
    vLegalNameRequired: "请输入法人姓名",
    vLegalIdRequired: "请输入法人身份证号",
    vIdFrontRequired: "请上传身份证人像面",
    vIdBackRequired: "请上传身份证国徽面",
    vAgreementRequired: "请先勾选同意合作协议与隐私政策",
    sendCodeSuccess: "验证码已发送",
    submitSuccess: "提交成功，正在进入审核",
    reviewingTitle: "您的入驻申请正在审核中",
    reviewingDesc: "预计 1-3 个工作日完成审核",
    reviewingNotice: "审核结果将通过短信通知，请保持手机畅通",
    reviewingStepSubmitted: "资料已提交",
    reviewingStepReviewing: "平台审核中",
    reviewingStepDone: "审核完成",
    approvedTitle: "恭喜，您已成为 Lollipop 发行者",
    approvedDesc: "现在可以进入发行中心上架剧集、查看收益与结算。",
    enterDashboard: "进入发行中心",
    rejectedTitle: "您的入驻申请未通过",
    rejectReasonLabel: "驳回原因",
    rejectedHint: "请根据驳回原因修改资料后重新提交。",
  },
  "zh-TW": {
    welcomeTitle: "填寫以下資訊，即可在 Lollipop 發行劇集",
    welcomeSubtitle: "完成入駐後即可上架內容、接入分成，讓優質劇集觸達更多觀眾。",
    sectionAccount: "關聯帳號",
    sectionCompany: "公司資訊",
    sectionAgreement: "合作協議",
    phoneLabel: "手機號",
    phonePlaceholder: "請輸入手機號",
    phoneBoundHint: "已綁定帳號手機號，無需修改",
    phoneRegisterHint: "該手機號將自動註冊為您的 Lollipop 平台帳號，亦可用於登入 AI 影片創作工具 Swift",
    codeLabel: "驗證碼",
    codePlaceholder: "請輸入驗證碼",
    sendCode: "發送驗證碼",
    resendIn: "{s}s 後重發",
    companyNameLabel: "公司名稱",
    companyNamePlaceholder: "請輸入公司名稱",
    businessLicenseLabel: "營業執照上傳",
    legalPersonNameLabel: "法人姓名",
    legalPersonNamePlaceholder: "請輸入法人姓名",
    legalPersonIdNoLabel: "法人身分證號",
    legalPersonIdNoPlaceholder: "請輸入18位身分證號",
    idCardFrontLabel: "身分證人像面",
    idCardBackLabel: "身分證國徽面",
    uploadPrompt: "點擊或拖曳上傳",
    uploadFormat: "支援 JPG、PNG 格式",
    uploadReplace: "點擊替換",
    uploadFailed: "上傳失敗，請重試",
    agreement: "我已閱讀並同意《平台入駐合作協議》和《隱私政策》",
    submit: "提交入駐申請",
    resubmit: "重新提交申請",
    vPhoneRequired: "請輸入手機號",
    vCodeRequired: "請輸入驗證碼",
    vCompanyRequired: "請輸入公司名稱",
    vLicenseRequired: "請上傳營業執照",
    vLegalNameRequired: "請輸入法人姓名",
    vLegalIdRequired: "請輸入法人身分證號",
    vIdFrontRequired: "請上傳身分證人像面",
    vIdBackRequired: "請上傳身分證國徽面",
    vAgreementRequired: "請先勾選同意合作協議與隱私政策",
    sendCodeSuccess: "驗證碼已發送",
    submitSuccess: "提交成功，正在進入審核",
    reviewingTitle: "您的入駐申請正在審核中",
    reviewingDesc: "預計 1-3 個工作日完成審核",
    reviewingNotice: "審核結果將透過簡訊通知，請保持手機暢通",
    reviewingStepSubmitted: "資料已提交",
    reviewingStepReviewing: "平台審核中",
    reviewingStepDone: "審核完成",
    approvedTitle: "恭喜，您已成為 Lollipop 發行者",
    approvedDesc: "現在可以進入發行中心上架劇集、查看收益與結算。",
    enterDashboard: "進入發行中心",
    rejectedTitle: "您的入駐申請未通過",
    rejectReasonLabel: "駁回原因",
    rejectedHint: "請根據駁回原因修改資料後重新提交。",
  },
  en: {
    welcomeTitle: "Fill in the details below to distribute dramas on Lollipop",
    welcomeSubtitle: "Once onboarded, you can publish content, join revenue sharing, and reach more viewers.",
    sectionAccount: "Linked Account",
    sectionCompany: "Company Information",
    sectionAgreement: "Cooperation Agreement",
    phoneLabel: "Phone Number",
    phonePlaceholder: "Enter your phone number",
    phoneBoundHint: "Bound to your account phone number; no change needed",
    phoneRegisterHint: "This number will be registered as your Lollipop account and can also log in to the AI video tool Swift",
    codeLabel: "Verification Code",
    codePlaceholder: "Enter verification code",
    sendCode: "Send Code",
    resendIn: "Resend in {s}s",
    companyNameLabel: "Company Name",
    companyNamePlaceholder: "Enter company name",
    businessLicenseLabel: "Business License",
    legalPersonNameLabel: "Legal Representative Name",
    legalPersonNamePlaceholder: "Enter legal representative name",
    legalPersonIdNoLabel: "Legal Representative ID Number",
    legalPersonIdNoPlaceholder: "Enter 18-digit ID number",
    idCardFrontLabel: "ID Card (Portrait Side)",
    idCardBackLabel: "ID Card (Emblem Side)",
    uploadPrompt: "Click or drag to upload",
    uploadFormat: "Supports JPG, PNG",
    uploadReplace: "Click to replace",
    uploadFailed: "Upload failed, please try again",
    agreement: "I have read and agree to the Platform Onboarding Agreement and Privacy Policy",
    submit: "Submit Application",
    resubmit: "Resubmit Application",
    vPhoneRequired: "Please enter your phone number",
    vCodeRequired: "Please enter the verification code",
    vCompanyRequired: "Please enter company name",
    vLicenseRequired: "Please upload the business license",
    vLegalNameRequired: "Please enter legal representative name",
    vLegalIdRequired: "Please enter legal representative ID number",
    vIdFrontRequired: "Please upload the ID card portrait side",
    vIdBackRequired: "Please upload the ID card emblem side",
    vAgreementRequired: "Please agree to the cooperation agreement and privacy policy first",
    sendCodeSuccess: "Verification code sent",
    submitSuccess: "Submitted successfully, entering review",
    reviewingTitle: "Your application is under review",
    reviewingDesc: "Estimated 1-3 business days to complete",
    reviewingNotice: "Results will be sent via SMS. Please keep your phone reachable.",
    reviewingStepSubmitted: "Documents submitted",
    reviewingStepReviewing: "Under review",
    reviewingStepDone: "Completed",
    approvedTitle: "Congratulations, you are now a Lollipop distributor",
    approvedDesc: "You can now enter the Distribution Center to publish dramas and view earnings.",
    enterDashboard: "Enter Distribution Center",
    rejectedTitle: "Your application was not approved",
    rejectReasonLabel: "Rejection Reason",
    rejectedHint: "Please revise according to the reason and resubmit.",
  },
  pt: {
    welcomeTitle: "Preencha os dados abaixo para distribuir dramas na Lollipop",
    welcomeSubtitle: "Após a integração, você pode publicar conteúdo, participar da divisão de receita e alcançar mais espectadores.",
    sectionAccount: "Conta Vinculada",
    sectionCompany: "Informações da Empresa",
    sectionAgreement: "Acordo de Cooperação",
    phoneLabel: "Número de Telefone",
    phonePlaceholder: "Digite seu número de telefone",
    phoneBoundHint: "Vinculado ao telefone da conta; não é necessário alterar",
    phoneRegisterHint: "Este número será registrado como sua conta Lollipop e também pode acessar a ferramenta de vídeo IA Swift",
    codeLabel: "Código de Verificação",
    codePlaceholder: "Digite o código de verificação",
    sendCode: "Enviar Código",
    resendIn: "Reenviar em {s}s",
    companyNameLabel: "Nome da Empresa",
    companyNamePlaceholder: "Digite o nome da empresa",
    businessLicenseLabel: "Licença Comercial",
    legalPersonNameLabel: "Nome do Representante Legal",
    legalPersonNamePlaceholder: "Digite o nome do representante legal",
    legalPersonIdNoLabel: "Número de Identidade do Representante Legal",
    legalPersonIdNoPlaceholder: "Digite o número de identidade de 18 dígitos",
    idCardFrontLabel: "Identidade (Frente)",
    idCardBackLabel: "Identidade (Verso)",
    uploadPrompt: "Clique ou arraste para enviar",
    uploadFormat: "Suporta JPG, PNG",
    uploadReplace: "Clique para substituir",
    uploadFailed: "Falha no envio, tente novamente",
    agreement: "Li e concordo com o Acordo de Integração da Plataforma e a Política de Privacidade",
    submit: "Enviar Solicitação",
    resubmit: "Reenviar Solicitação",
    vPhoneRequired: "Digite seu número de telefone",
    vCodeRequired: "Digite o código de verificação",
    vCompanyRequired: "Digite o nome da empresa",
    vLicenseRequired: "Envie a licença comercial",
    vLegalNameRequired: "Digite o nome do representante legal",
    vLegalIdRequired: "Digite o número de identidade do representante legal",
    vIdFrontRequired: "Envie a frente da identidade",
    vIdBackRequired: "Envie o verso da identidade",
    vAgreementRequired: "Primeiro concorde com o acordo de cooperação e a política de privacidade",
    sendCodeSuccess: "Código de verificação enviado",
    submitSuccess: "Enviado com sucesso, entrando em análise",
    reviewingTitle: "Sua solicitação está em análise",
    reviewingDesc: "Estimativa de 1-3 dias úteis para concluir",
    reviewingNotice: "Os resultados serão enviados por SMS. Mantenha seu telefone acessível.",
    reviewingStepSubmitted: "Documentos enviados",
    reviewingStepReviewing: "Em análise",
    reviewingStepDone: "Concluído",
    approvedTitle: "Parabéns, você agora é um distribuidor Lollipop",
    approvedDesc: "Agora você pode entrar no Centro de Distribuição para publicar dramas e ver receitas.",
    enterDashboard: "Entrar no Centro de Distribuição",
    rejectedTitle: "Sua solicitação não foi aprovada",
    rejectReasonLabel: "Motivo da Rejeição",
    rejectedHint: "Revise de acordo com o motivo e reenvie.",
  },
};
