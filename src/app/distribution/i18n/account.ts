import type { Locale } from "../../i18n";

export interface AccountMessages {
  tabInfo: string;
  tabSecurity: string;
  tabDevices: string;
  certified: string;
  uid: string;
  editNickname: string;
  changeAvatar: string;
  registerTime: string;
  lastLogin: string;
  accountData: string;
  copy: string;
  copied: string;
  phone: string;
  email: string;
  bound: string;
  edit: string;
  companyInfo: string;
  companyName: string;
  creditCode: string;
  companyAddress: string;
  companyPhone: string;
  notification: string;
  emailNotify: string;
  emailNotifyDesc: string;
  smsNotify: string;
  smsNotifyDesc: string;
  save: string;
  cancel: string;
  confirm: string;
  saveSuccess: string;
  requiredCompany: string;
  unset: string;
  securityTitle: string;
  securityDesc: string;
  accountSecurity: string;
  safe: string;
  enabled: string;
  improveSuggested: string;
  phoneVerifyCode: string;
  viewSuggestions: string;
  deviceNotice: string;
  totalDevices: string;
  terminate: string;
  low: string;
  medium: string;
  high: string;
  password: string;
  passwordDesc: string;
  twoFactor: string;
  twoFactorDesc: string;
  emailBind: string;
  emailBindDesc: string;
  set: string;
  notSet: string;
  manage: string;
  suggestions: string;
  suggestPassword: string;
  suggestTwoFactor: string;
  suggestEmail: string;
  noSuggestions: string;
  sessions: string;
  recentLogins: string;
  logoutOthers: string;
  kick: string;
  currentDevice: string;
  currentOnline: string;
  online: string;
  offline: string;
  success: string;
  failed: string;
  unknownLocation: string;
  refresh: string;
  bindEmailTitle: string;
  emailInput: string;
  codeInput: string;
  sendCode: string;
  codeSent: string;
  emailInvalid: string;
  codeRequired: string;
  passwordTitle: string;
  changePasswordAction: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordRequired: string;
  passwordLengthInvalid: string;
  passwordMismatch: string;
  smsCode: string;
  smsScenePending: string;
  emptySessions: string;
  emptyLoginRecords: string;
}

const zhCN: AccountMessages = {
  tabInfo: "账号信息",
  tabSecurity: "隐私与安全",
  tabDevices: "设备管理",
  certified: "已认证",
  uid: "账号 UID",
  editNickname: "修改昵称",
  changeAvatar: "更换头像",
  registerTime: "注册时间",
  lastLogin: "最后登录",
  accountData: "账号资料",
  copy: "复制",
  copied: "已复制",
  phone: "登录手机号",
  email: "绑定邮箱",
  bound: "已绑定",
  edit: "修改",
  companyInfo: "公司信息",
  companyName: "公司名称",
  creditCode: "统一社会信用代码",
  companyAddress: "注册地址",
  companyPhone: "联系电话",
  notification: "消息通知",
  emailNotify: "邮件通知",
  emailNotifyDesc: "结算、合同等重要消息",
  smsNotify: "短信通知",
  smsNotifyDesc: "登录提醒与验证码",
  save: "保存",
  cancel: "取消",
  confirm: "确定",
  saveSuccess: "保存成功",
  requiredCompany: "公司名称不能为空",
  unset: "未设置",
  securityTitle: "安全级别",
  securityDesc: "开启更多安全项可提升账户保护等级",
  accountSecurity: "账号安全",
  safe: "安全",
  enabled: "已开启",
  improveSuggested: "建议提升",
  phoneVerifyCode: "手机验证码",
  viewSuggestions: "查看建议",
  deviceNotice: "如发现不认识的设备，请立即终止该设备的会话并修改密码。",
  totalDevices: "共 {n} 台设备",
  terminate: "终止",
  low: "低",
  medium: "中",
  high: "高",
  password: "登录密码",
  passwordDesc: "用于 App 与发行中心登录",
  twoFactor: "两步验证",
  twoFactorDesc: "登录和敏感操作二次校验",
  emailBind: "邮箱绑定",
  emailBindDesc: "用于安全通知和找回账户",
  set: "已设置",
  notSet: "未设置",
  manage: "管理",
  suggestions: "安全建议",
  suggestPassword: "请先设置登录密码",
  suggestTwoFactor: "建议开启两步验证",
  suggestEmail: "建议绑定邮箱",
  noSuggestions: "当前安全项配置完整",
  sessions: "已登录设备",
  recentLogins: "近期登录记录",
  logoutOthers: "退出其他设备",
  kick: "下线",
  currentDevice: "当前设备",
  currentOnline: "当前在线",
  online: "在线",
  offline: "离线",
  success: "成功",
  failed: "失败",
  unknownLocation: "未知位置",
  refresh: "刷新",
  bindEmailTitle: "绑定邮箱",
  emailInput: "邮箱地址",
  codeInput: "邮箱验证码",
  sendCode: "发送验证码",
  codeSent: "验证码已发送",
  emailInvalid: "请输入正确的邮箱地址",
  codeRequired: "请输入验证码",
  passwordTitle: "修改登录密码",
  changePasswordAction: "修改密码",
  oldPassword: "原密码",
  newPassword: "新密码",
  confirmPassword: "确认新密码",
  passwordRequired: "请输入密码",
  passwordLengthInvalid: "密码长度需为 6-20 位",
  passwordMismatch: "两次输入的新密码不一致",
  smsCode: "短信验证码",
  smsScenePending: "验证码将发送到发行账户主账号手机号",
  emptySessions: "暂无已登录设备",
  emptyLoginRecords: "暂无近期登录记录",
};

export const account: Record<Locale, AccountMessages> = {
  "zh-CN": zhCN,
  "zh-TW": {
    ...zhCN,
    tabInfo: "帳號資訊",
    tabSecurity: "隱私與安全",
    tabDevices: "設備管理",
    certified: "已認證",
    editNickname: "修改暱稱",
    registerTime: "註冊時間",
    lastLogin: "最後登入",
    accountData: "帳號資料",
    copied: "已複製",
    phone: "登入手機號",
    email: "綁定信箱",
    companyInfo: "公司資訊",
    creditCode: "統一社會信用代碼",
    companyAddress: "註冊地址",
    companyPhone: "聯絡電話",
    notification: "訊息通知",
    emailNotify: "郵件通知",
    smsNotify: "簡訊通知",
    saveSuccess: "儲存成功",
    confirm: "確定",
    requiredCompany: "公司名稱不能為空",
    unset: "未設定",
    securityTitle: "安全等級",
    accountSecurity: "帳號安全",
    safe: "安全",
    enabled: "已開啟",
    improveSuggested: "建議提升",
    phoneVerifyCode: "手機驗證碼",
    viewSuggestions: "查看建議",
    deviceNotice: "如發現不認識的設備，請立即終止該設備的會話並修改密碼。",
    totalDevices: "共 {n} 台設備",
    terminate: "終止",
    password: "登入密碼",
    twoFactor: "兩步驗證",
    emailBind: "信箱綁定",
    set: "已設定",
    notSet: "未設定",
    suggestions: "安全建議",
    sessions: "已登入設備",
    recentLogins: "近期登入記錄",
    logoutOthers: "退出其他設備",
    currentDevice: "目前設備",
    currentOnline: "目前在線",
    online: "在線",
    offline: "離線",
    refresh: "重新整理",
    bindEmailTitle: "綁定信箱",
    emailInput: "信箱地址",
    codeInput: "信箱驗證碼",
    sendCode: "發送驗證碼",
    codeSent: "驗證碼已發送",
    emailInvalid: "請輸入正確的信箱地址",
    codeRequired: "請輸入驗證碼",
    passwordTitle: "修改登入密碼",
    changePasswordAction: "修改密碼",
    oldPassword: "原密碼",
    newPassword: "新密碼",
    confirmPassword: "確認新密碼",
    passwordRequired: "請輸入密碼",
    passwordLengthInvalid: "密碼長度需為 6-20 位",
    passwordMismatch: "兩次輸入的新密碼不一致",
    smsCode: "簡訊驗證碼",
    smsScenePending: "驗證碼將發送到發行帳戶主帳號手機號",
    emptySessions: "暫無已登入設備",
    emptyLoginRecords: "暫無近期登入記錄",
  },
  en: {
    ...zhCN,
    tabInfo: "Account Info",
    tabSecurity: "Privacy & Security",
    tabDevices: "Device Management",
    certified: "Certified",
    uid: "Account UID",
    editNickname: "Edit Nickname",
    changeAvatar: "Change Avatar",
    registerTime: "Registered",
    lastLogin: "Last Login",
    accountData: "Account Data",
    copy: "Copy",
    copied: "Copied",
    phone: "Login Phone",
    email: "Bound Email",
    bound: "Bound",
    edit: "Edit",
    companyInfo: "Company Info",
    companyName: "Company Name",
    creditCode: "Credit Code",
    companyAddress: "Registered Address",
    companyPhone: "Company Phone",
    notification: "Notifications",
    emailNotify: "Email Notifications",
    emailNotifyDesc: "Important settlement and contract messages",
    smsNotify: "SMS Notifications",
    smsNotifyDesc: "Login alerts and verification codes",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    saveSuccess: "Saved",
    requiredCompany: "Company name is required",
    unset: "Not set",
    securityTitle: "Security Level",
    securityDesc: "Enable more protections to improve account security",
    accountSecurity: "Account Security",
    safe: "Safe",
    enabled: "Enabled",
    improveSuggested: "Improve",
    phoneVerifyCode: "Phone Code",
    viewSuggestions: "View Suggestions",
    deviceNotice: "If you notice an unknown device, terminate its session immediately and change your password.",
    totalDevices: "{n} devices",
    terminate: "Terminate",
    low: "Low",
    medium: "Medium",
    high: "High",
    password: "Password",
    passwordDesc: "Used for App and distribution center login",
    twoFactor: "Two-factor Verification",
    twoFactorDesc: "Extra verification for login and sensitive actions",
    emailBind: "Email Binding",
    emailBindDesc: "Used for security notices and account recovery",
    set: "Set",
    notSet: "Not Set",
    manage: "Manage",
    suggestions: "Suggestions",
    suggestPassword: "Set a login password",
    suggestTwoFactor: "Enable two-factor verification",
    suggestEmail: "Bind an email address",
    noSuggestions: "All security items are configured",
    sessions: "Signed-in Devices",
    recentLogins: "Recent Login Records",
    logoutOthers: "Log Out Other Devices",
    kick: "Kick",
    currentDevice: "Current Device",
    currentOnline: "Current Online",
    online: "Online",
    offline: "Offline",
    success: "Success",
    failed: "Failed",
    unknownLocation: "Unknown Location",
    refresh: "Refresh",
    bindEmailTitle: "Bind Email",
    emailInput: "Email Address",
    codeInput: "Email Code",
    sendCode: "Send Code",
    codeSent: "Code sent",
    emailInvalid: "Enter a valid email address",
    codeRequired: "Enter the code",
    passwordTitle: "Change Password",
    changePasswordAction: "Change Password",
    oldPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    passwordRequired: "Enter the password",
    passwordLengthInvalid: "Password must be 6-20 characters",
    passwordMismatch: "The new passwords do not match",
    smsCode: "SMS Code",
    smsScenePending: "The code will be sent to the publisher account owner phone number",
    emptySessions: "No signed-in devices",
    emptyLoginRecords: "No recent login records",
  },
  pt: {
    ...zhCN,
    tabInfo: "Informações da Conta",
    tabSecurity: "Privacidade e Segurança",
    tabDevices: "Dispositivos",
    certified: "Certificado",
    editNickname: "Editar Apelido",
    changeAvatar: "Alterar Avatar",
    registerTime: "Cadastro",
    lastLogin: "Último Login",
    accountData: "Dados da Conta",
    copy: "Copiar",
    copied: "Copiado",
    phone: "Telefone de Login",
    email: "E-mail Vinculado",
    bound: "Vinculado",
    edit: "Editar",
    companyInfo: "Informações da Empresa",
    companyName: "Nome da Empresa",
    creditCode: "Código Fiscal",
    companyAddress: "Endereço Registrado",
    companyPhone: "Telefone",
    notification: "Notificações",
    emailNotify: "Notificações por E-mail",
    smsNotify: "Notificações por SMS",
    save: "Salvar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    saveSuccess: "Salvo",
    requiredCompany: "Nome da empresa é obrigatório",
    unset: "Não definido",
    securityTitle: "Nível de Segurança",
    accountSecurity: "Segurança da Conta",
    safe: "Seguro",
    enabled: "Ativado",
    improveSuggested: "Melhorar",
    phoneVerifyCode: "Código SMS",
    viewSuggestions: "Ver Sugestões",
    deviceNotice: "Se encontrar um dispositivo desconhecido, encerre a sessão imediatamente e altere a senha.",
    totalDevices: "{n} dispositivos",
    terminate: "Encerrar",
    low: "Baixo",
    medium: "Médio",
    high: "Alto",
    password: "Senha",
    twoFactor: "Verificação em Duas Etapas",
    emailBind: "E-mail",
    set: "Definido",
    notSet: "Não definido",
    manage: "Gerenciar",
    suggestions: "Sugestões",
    sessions: "Dispositivos Conectados",
    recentLogins: "Logins Recentes",
    logoutOthers: "Sair de Outros Dispositivos",
    kick: "Desconectar",
    currentDevice: "Dispositivo Atual",
    currentOnline: "Atual online",
    online: "Online",
    offline: "Offline",
    success: "Sucesso",
    failed: "Falha",
    unknownLocation: "Local desconhecido",
    refresh: "Atualizar",
    bindEmailTitle: "Vincular E-mail",
    emailInput: "Endereço de E-mail",
    codeInput: "Código do E-mail",
    sendCode: "Enviar Código",
    codeSent: "Código enviado",
    emailInvalid: "Digite um e-mail válido",
    codeRequired: "Digite o código",
    passwordTitle: "Alterar Senha",
    changePasswordAction: "Alterar Senha",
    oldPassword: "Senha Atual",
    newPassword: "Nova Senha",
    confirmPassword: "Confirmar Nova Senha",
    passwordRequired: "Digite a senha",
    passwordLengthInvalid: "A senha deve ter 6 a 20 caracteres",
    passwordMismatch: "As novas senhas não coincidem",
    smsCode: "Código SMS",
    smsScenePending: "O código será enviado ao telefone do titular da conta publisher",
    emptySessions: "Nenhum dispositivo conectado",
    emptyLoginRecords: "Nenhum login recente",
  },
};
