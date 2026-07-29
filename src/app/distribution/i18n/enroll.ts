import type { Locale } from "../../i18n";

/**
 * 发行者入驻文案。
 * zh-CN 为权威（取自 figma 15237-33700/34130/15098-24872/15123-25540/25742 与接口文档）；
 * en 同步；zh-TW / pt 机翻占位，结构一致。
 * 含 {s}（倒计时秒）/ {company}（公司名）占位，由组件 replace。
 */
export interface EnrollMessages {
  bannerTitle: string;
  bannerSubtitle: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  sectionAccount: string;
  sectionCompany: string;
  sectionAgreement: string;
  /** 关联账号 Tab：手机号 */
  accountModePhone: string;
  /** 关联账号 Tab：邮箱 */
  accountModeEmail: string;
  phoneLabel: string;
  phonePlaceholder: string;
  phoneBoundHint: string;
  phoneRegisterHint: string;
  emailLabel: string;
  emailPlaceholder: string;
  emailBoundHint: string;
  emailRegisterHint: string;
  codeLabel: string;
  codePlaceholder: string;
  sendCode: string;
  resendIn: string;
  companyNameLabel: string;
  companyNamePlaceholder: string;
  businessLicenseLabel: string;
  legalPersonNameLabel: string;
  legalPersonNamePlaceholder: string;
  legalPersonIdNoLabel: string;
  legalPersonIdNoPlaceholder: string;
  idCardFrontLabel: string;
  idCardBackLabel: string;
  uploadPrompt: string;
  uploadFormat: string;
  uploadReplace: string;
  uploadFailed: string;
  /** 勾选文案模板，含 {terms} / {privacy} 两个可点击占位，由组件替换为链接 */
  agreement: string;
  /** 合作协议链接文案（含书名号） */
  agreementTerms: string;
  /** 隐私政策链接文案（含书名号） */
  agreementPrivacy: string;
  /** 合作协议弹窗标题 */
  termsTitle: string;
  /** 隐私政策弹窗标题 */
  privacyTitle: string;
  /** 合作协议正文（占位，TODO(verify) 待补真实条款） */
  termsBody: string;
  /** 隐私政策正文（占位，TODO(verify) 待补真实条款） */
  privacyBody: string;
  /** 弹窗关闭按钮 */
  docClose: string;
  submit: string;
  resubmit: string;
  vPhoneRequired: string;
  vEmailRequired: string;
  vCodeRequired: string;
  vCompanyRequired: string;
  vLicenseRequired: string;
  vLegalNameRequired: string;
  vLegalIdRequired: string;
  vIdFrontRequired: string;
  vIdBackRequired: string;
  vAgreementRequired: string;
  sendCodeSuccess: string;
  submitSuccess: string;
  reviewingTitle: string;
  reviewingDesc: string;
  reviewingInProgress: string;
  step1Title: string;
  step1Sub: string;
  step2Title: string;
  step2Sub: string;
  step3Title: string;
  step3Sub: string;
  step4Title: string;
  step4Sub: string;
  approvedTitle: string;
  approvedDesc: string;
  swiftAccountStatus: string;
  swiftOpening: string;
  swiftReady: string;
  swiftAccount: string;
  swiftInitialPassword: string;
  swiftTenantId: string;
  swiftLastSync: string;
  swiftRetry: string;
  swiftRetrySuccess: string;
  enterDashboard: string;
  rejectedTitle: string;
  rejectedDesc: string;
  rejectReasonLabel: string;
  /** 常见原因区标题（figma 15123-25886；无具体驳回原因时展示） */
  commonReasonsLabel: string;
  /** 常见原因列表（figma 15123-25742 的 4 条静态文案；后端无 rejectReason 时回退展示） */
  commonReasons: string[];
  supportPrefix: string;
  supportEmail: string;
}

export const enroll: Record<Locale, EnrollMessages> = {
  "zh-CN": {
    bannerTitle: "欢迎入驻 Lollipop",
    bannerSubtitle: "全球首家 AI 视频创作平台",
    welcomeTitle: "填写以下信息，即可在 Lollipop 发行剧集",
    welcomeSubtitle: "完成入驻后即可上架内容、接入分成，让优质剧集触达更多观众。",
    sectionAccount: "关联账号",
    sectionCompany: "公司信息",
    sectionAgreement: "合作协议",
    accountModePhone: "手机号",
    accountModeEmail: "邮箱",
    phoneLabel: "手机号",
    phonePlaceholder: "请输入手机号",
    phoneBoundHint: "已绑定账号手机号，无需修改",
    phoneRegisterHint: "该手机号将自动注册为您的 Lollipop 平台账号，亦可用于登录 AI 视频创作工具 Swift",
    emailLabel: "邮箱",
    emailPlaceholder: "请输入邮箱地址",
    emailBoundHint: "已绑定账号邮箱，无需修改",
    emailRegisterHint: "该邮箱将自动注册为您的 Lollipop 平台账号；邮箱入驻暂不支持自动开通 Swift 租户，待 Swift 支持邮箱后可重试开通",
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
    uploadFormat: "支持 JPG、PNG、HEIC 格式",
    uploadReplace: "点击替换",
    uploadFailed: "上传失败，请重试",
    agreement: "我已阅读并同意{terms}和{privacy}",
    agreementTerms: "《平台入驻合作协议》",
    agreementPrivacy: "《隐私政策》",
    termsTitle: "平台入驻合作协议",
    privacyTitle: "隐私政策",
    // TODO(verify): 占位正文，待法务/产品提供《平台入驻合作协议》正式条款后替换
    termsBody: "【协议正文待补充】请在此填入《平台入驻合作协议》正式条款。",
    // TODO(verify): 占位正文，待法务/产品提供《隐私政策》正式条款后替换
    privacyBody: "【隐私政策正文待补充】请在此填入《隐私政策》正式内容。",
    docClose: "关闭",
    submit: "提交入驻申请",
    resubmit: "重新填写申请",
    vPhoneRequired: "请输入手机号",
    vEmailRequired: "请输入邮箱",
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
    reviewingTitle: "审核中",
    reviewingDesc: "您的入驻申请已提交，我们将在 3-5 个工作日内完成审核，请留意短信通知。",
    reviewingInProgress: "进行中",
    step1Title: "提交申请",
    step1Sub: "资料已成功提交",
    step2Title: "资料审核",
    step2Sub: "预计 3-5 个工作日",
    step3Title: "结果通知",
    step3Sub: "人工线上通知",
    step4Title: "完成入驻",
    step4Sub: "开通平台账号",
    approvedTitle: "审核通过",
    approvedDesc: "恭喜，{company} 的入驻申请已通过审核，欢迎加入 Lollipop 平台！",
    swiftAccountStatus: "Swift 账号状态",
    swiftOpening: "Swift 账号开通中，请稍后。",
    swiftReady: "Swift 账号已开通。",
    swiftAccount: "登录账号",
    swiftInitialPassword: "初始密码",
    swiftTenantId: "团队邀请码",
    swiftLastSync: "最近同步时间",
    swiftRetry: "重试开通",
    swiftRetrySuccess: "已触发重试，请稍后刷新查看结果",
    enterDashboard: "进入发行中心",
    rejectedTitle: "审核未通过",
    rejectedDesc: "很遗憾，您提交的入驻资料未能通过审核，请检查并重新提交。",
    rejectReasonLabel: "驳回原因",
    commonReasonsLabel: "常见原因",
    commonReasons: [
      "营业执照图片模糊或信息不完整",
      "身份证正反面上传有误或不清晰",
      "统一社会信用代码与营业执照不符",
      "企业信息与工商登记不一致",
    ],
    supportPrefix: "如有疑问请联系",
    supportEmail: "support@lollipop.com",
  },
  "zh-TW": {
    bannerTitle: "歡迎入駐 Lollipop",
    bannerSubtitle: "全球首家 AI 影片創作平台",
    welcomeTitle: "填寫以下資訊，即可在 Lollipop 發行劇集",
    welcomeSubtitle: "完成入駐後即可上架內容、接入分成，讓優質劇集觸達更多觀眾。",
    sectionAccount: "關聯帳號",
    sectionCompany: "公司資訊",
    sectionAgreement: "合作協議",
    accountModePhone: "手機號",
    accountModeEmail: "郵箱",
    phoneLabel: "手機號",
    phonePlaceholder: "請輸入手機號",
    phoneBoundHint: "已綁定帳號手機號，無需修改",
    phoneRegisterHint: "該手機號將自動註冊為您的 Lollipop 平台帳號，亦可用於登入 AI 影片創作工具 Swift",
    emailLabel: "郵箱",
    emailPlaceholder: "請輸入郵箱地址",
    emailBoundHint: "已綁定帳號郵箱，無需修改",
    emailRegisterHint: "該郵箱將自動註冊為您的 Lollipop 平台帳號；郵箱入駐暫不支援自動開通 Swift 租戶，待 Swift 支援郵箱後可重試開通",
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
    uploadFormat: "支援 JPG、PNG、HEIC 格式",
    uploadReplace: "點擊替換",
    uploadFailed: "上傳失敗，請重試",
    agreement: "我已閱讀並同意{terms}和{privacy}",
    agreementTerms: "《平台入駐合作協議》",
    agreementPrivacy: "《隱私政策》",
    termsTitle: "平台入駐合作協議",
    privacyTitle: "隱私政策",
    // TODO(verify): 占位正文，待法務/產品提供《平台入駐合作協議》正式條款後替換
    termsBody: "【協議正文待補充】請在此填入《平台入駐合作協議》正式條款。",
    // TODO(verify): 占位正文，待法務/產品提供《隱私政策》正式條款後替換
    privacyBody: "【隱私政策正文待補充】請在此填入《隱私政策》正式內容。",
    docClose: "關閉",
    submit: "提交入駐申請",
    resubmit: "重新填寫申請",
    vPhoneRequired: "請輸入手機號",
    vEmailRequired: "請輸入郵箱",
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
    reviewingTitle: "審核中",
    reviewingDesc: "您的入駐申請已提交，我們將在 3-5 個工作日內完成審核，請留意簡訊通知。",
    reviewingInProgress: "進行中",
    step1Title: "提交申請",
    step1Sub: "資料已成功提交",
    step2Title: "資料審核",
    step2Sub: "預計 3-5 個工作日",
    step3Title: "結果通知",
    step3Sub: "人工線上通知",
    step4Title: "完成入駐",
    step4Sub: "開通平台帳號",
    approvedTitle: "審核通過",
    approvedDesc: "恭喜，{company} 的入駐申請已通過審核，歡迎加入 Lollipop 平台！",
    swiftAccountStatus: "Swift 帳號狀態",
    swiftOpening: "Swift 帳號開通中，請稍後。",
    swiftReady: "Swift 帳號已開通。",
    swiftAccount: "登入帳號",
    swiftInitialPassword: "初始密碼",
    swiftTenantId: "團隊邀請碼",
    swiftLastSync: "最近同步時間",
    swiftRetry: "重試開通",
    swiftRetrySuccess: "已觸發重試，請稍後重新整理查看結果",
    enterDashboard: "進入發行中心",
    rejectedTitle: "審核未通過",
    rejectedDesc: "很遺憾，您提交的入駐資料未能通過審核，請檢查並重新提交。",
    rejectReasonLabel: "駁回原因",
    commonReasonsLabel: "常見原因",
    commonReasons: [
      "營業執照圖片模糊或資訊不完整",
      "身分證正反面上傳有誤或不清晰",
      "統一社會信用代碼與營業執照不符",
      "企業資訊與工商登記不一致",
    ],
    supportPrefix: "如有疑問請聯絡",
    supportEmail: "support@lollipop.com",
  },
  en: {
    bannerTitle: "Welcome to Lollipop",
    bannerSubtitle: "The world's first AI video creation platform",
    welcomeTitle: "Fill in the details below to distribute dramas on Lollipop",
    welcomeSubtitle: "Once onboarded, you can publish content, join revenue sharing, and reach more viewers.",
    sectionAccount: "Linked Account",
    sectionCompany: "Company Information",
    sectionAgreement: "Cooperation Agreement",
    accountModePhone: "Phone",
    accountModeEmail: "Email",
    phoneLabel: "Phone Number",
    phonePlaceholder: "Enter your phone number",
    phoneBoundHint: "Bound to your account phone number; no change needed",
    phoneRegisterHint: "This number will be registered as your Lollipop account and can also log in to the AI video tool Swift",
    emailLabel: "Email",
    emailPlaceholder: "Enter your email address",
    emailBoundHint: "Bound to your account email; no change needed",
    emailRegisterHint: "This email will be registered as your Lollipop account. Email enrollment cannot auto-provision a Swift tenant yet; retry after Swift supports email login.",
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
    uploadFormat: "Supports JPG, PNG, HEIC",
    uploadReplace: "Click to replace",
    uploadFailed: "Upload failed, please try again",
    agreement: "I have read and agree to the {terms} and {privacy}",
    agreementTerms: "Platform Onboarding Agreement",
    agreementPrivacy: "Privacy Policy",
    termsTitle: "Platform Onboarding Agreement",
    privacyTitle: "Privacy Policy",
    // TODO(verify): placeholder body, replace with the official Platform Onboarding Agreement text
    termsBody: "[Agreement text pending] Please insert the official Platform Onboarding Agreement here.",
    // TODO(verify): placeholder body, replace with the official Privacy Policy text
    privacyBody: "[Privacy Policy text pending] Please insert the official Privacy Policy here.",
    docClose: "Close",
    submit: "Submit Application",
    resubmit: "Edit & Resubmit",
    vPhoneRequired: "Please enter your phone number",
    vEmailRequired: "Please enter your email",
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
    reviewingTitle: "Under Review",
    reviewingDesc: "Your application has been submitted. We will complete the review within 3-5 business days. Please watch for SMS notifications.",
    reviewingInProgress: "In progress",
    step1Title: "Application Submitted",
    step1Sub: "Documents received",
    step2Title: "Under Review",
    step2Sub: "Est. 3-5 business days",
    step3Title: "Result Notification",
    step3Sub: "Manual online notification",
    step4Title: "Onboarding Complete",
    step4Sub: "Platform account activated",
    approvedTitle: "Approved",
    approvedDesc: "Congratulations, the application for {company} has been approved. Welcome to Lollipop!",
    swiftAccountStatus: "Swift Account Status",
    swiftOpening: "Swift account provisioning is in progress. Please check again later.",
    swiftReady: "Swift account is ready.",
    swiftAccount: "Login account",
    swiftInitialPassword: "Initial password",
    swiftTenantId: "Team invitation code",
    swiftLastSync: "Last sync time",
    swiftRetry: "Retry",
    swiftRetrySuccess: "Retry triggered. Please check again later.",
    enterDashboard: "Enter Distribution Center",
    rejectedTitle: "Not Approved",
    rejectedDesc: "Unfortunately, your application was not approved. Please review and resubmit.",
    rejectReasonLabel: "Rejection Reason",
    commonReasonsLabel: "Common Reasons",
    commonReasons: [
      "Business license image is blurry or incomplete",
      "ID card front/back uploaded incorrectly or unclear",
      "Unified social credit code does not match the business license",
      "Company information does not match commercial registration",
    ],
    supportPrefix: "Questions? Contact",
    supportEmail: "support@lollipop.com",
  },
  pt: {
    bannerTitle: "Bem-vindo à Lollipop",
    bannerSubtitle: "A primeira plataforma de criação de vídeo com IA do mundo",
    welcomeTitle: "Preencha os dados abaixo para distribuir dramas na Lollipop",
    welcomeSubtitle: "Após a integração, você pode publicar conteúdo, participar da divisão de receita e alcançar mais espectadores.",
    sectionAccount: "Conta Vinculada",
    sectionCompany: "Informações da Empresa",
    sectionAgreement: "Acordo de Cooperação",
    accountModePhone: "Telefone",
    accountModeEmail: "E-mail",
    phoneLabel: "Número de Telefone",
    phonePlaceholder: "Digite seu número de telefone",
    phoneBoundHint: "Vinculado ao telefone da conta; não é necessário alterar",
    phoneRegisterHint: "Este número será registrado como sua conta Lollipop e também pode acessar a ferramenta de vídeo IA Swift",
    emailLabel: "E-mail",
    emailPlaceholder: "Digite seu endereço de e-mail",
    emailBoundHint: "Vinculado ao e-mail da conta; não é necessário alterar",
    emailRegisterHint: "Este e-mail será registrado como sua conta Lollipop. Integração por e-mail ainda não provisiona automaticamente o tenant Swift; tente novamente quando o Swift suportar e-mail.",
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
    uploadFormat: "Suporta JPG, PNG, HEIC",
    uploadReplace: "Clique para substituir",
    uploadFailed: "Falha no envio, tente novamente",
    agreement: "Li e concordo com o {terms} e a {privacy}",
    agreementTerms: "Acordo de Integração da Plataforma",
    agreementPrivacy: "Política de Privacidade",
    termsTitle: "Acordo de Integração da Plataforma",
    privacyTitle: "Política de Privacidade",
    // TODO(verify): texto provisório, substituir pelo Acordo de Integração da Plataforma oficial
    termsBody: "[Texto do acordo pendente] Insira aqui o Acordo de Integração da Plataforma oficial.",
    // TODO(verify): texto provisório, substituir pela Política de Privacidade oficial
    privacyBody: "[Texto da política pendente] Insira aqui a Política de Privacidade oficial.",
    docClose: "Fechar",
    submit: "Enviar Solicitação",
    resubmit: "Editar e Reenviar",
    vPhoneRequired: "Digite seu número de telefone",
    vEmailRequired: "Digite seu e-mail",
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
    reviewingTitle: "Em Análise",
    reviewingDesc: "Sua solicitação foi enviada. Concluiremos a análise em 3-5 dias úteis. Fique atento às notificações por SMS.",
    reviewingInProgress: "Em andamento",
    step1Title: "Solicitação Enviada",
    step1Sub: "Documentos recebidos",
    step2Title: "Em Análise",
    step2Sub: "Est. 3-5 dias úteis",
    step3Title: "Notificação de Resultado",
    step3Sub: "Notificação online manual",
    step4Title: "Integração Concluída",
    step4Sub: "Conta da plataforma ativada",
    approvedTitle: "Aprovado",
    approvedDesc: "Parabéns, a solicitação de {company} foi aprovada. Bem-vindo à Lollipop!",
    swiftAccountStatus: "Status da Conta Swift",
    swiftOpening: "A conta Swift está sendo provisionada. Verifique novamente mais tarde.",
    swiftReady: "A conta Swift está pronta.",
    swiftAccount: "Conta de login",
    swiftInitialPassword: "Senha inicial",
    swiftTenantId: "Código de convite da equipe",
    swiftLastSync: "Última sincronização",
    swiftRetry: "Tentar novamente",
    swiftRetrySuccess: "Nova tentativa acionada. Verifique novamente mais tarde.",
    enterDashboard: "Entrar no Centro de Distribuição",
    rejectedTitle: "Não Aprovado",
    rejectedDesc: "Infelizmente, sua solicitação não foi aprovada. Revise e reenvie.",
    rejectReasonLabel: "Motivo da Rejeição",
    commonReasonsLabel: "Motivos Comuns",
    commonReasons: [
      "Imagem da licença comercial está borrada ou incompleta",
      "Frente/verso da identidade enviados incorretamente ou pouco nítidos",
      "Código de crédito social unificado não corresponde à licença comercial",
      "Informações da empresa não correspondem ao registro comercial",
    ],
    supportPrefix: "Dúvidas? Contate",
    supportEmail: "support@lollipop.com",
  },
};
