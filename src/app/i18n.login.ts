import type { Locale } from "./i18n";

/**
 * 登录页文案（figma 15141-27973：整页·手机号+验证码登录）。
 * zh-CN 以 figma 原文为准；其余语言为翻译，标注 // TODO(verify) 的需人工校对。
 */
export interface LoginMessages {
  /** 左侧宣传标语（两行） */
  sloganLine1: string;
  sloganLine2: string;
  welcomeTitle: string;
  subtitle: string;
  phoneLabel: string;
  phonePlaceholder: string;
  codeLabel: string;
  codePlaceholder: string;
  sendCode: string;
  /** 倒计时按钮文案，含 {s} 占位 */
  resendIn: string;
  submit: string;
  footerNote: string;
  vPhoneRequired: string;
  vCodeRequired: string;
  codeSent: string;
  loginSuccess: string;
}

export const loginMessages: Record<Locale, LoginMessages> = {
  "zh-CN": {
    sloganLine1: "让好创作",
    sloganLine2: "收获好回报",
    welcomeTitle: "欢迎使用 Lollipop",
    subtitle: "请使用手机号登录您的账号",
    phoneLabel: "手机号",
    phonePlaceholder: "请输入手机号",
    codeLabel: "请输入验证码",
    codePlaceholder: "请输入验证码",
    sendCode: "获取验证码",
    resendIn: "{s}s",
    submit: "登录",
    footerNote: "创作者账号由Lollipop平台创建，仅支持已创建的账号登录",
    vPhoneRequired: "请输入手机号",
    vCodeRequired: "请输入验证码",
    codeSent: "验证码已发送",
    loginSuccess: "登录成功",
  },
  "zh-TW": {
    sloganLine1: "讓好創作",
    sloganLine2: "收穫好回報",
    welcomeTitle: "歡迎使用 Lollipop",
    subtitle: "請使用手機號登入您的帳號",
    phoneLabel: "手機號",
    phonePlaceholder: "請輸入手機號",
    codeLabel: "請輸入驗證碼",
    codePlaceholder: "請輸入驗證碼",
    sendCode: "獲取驗證碼",
    resendIn: "{s}s",
    submit: "登入",
    footerNote: "創作者帳號由Lollipop平台創建，僅支援已創建的帳號登入",
    vPhoneRequired: "請輸入手機號",
    vCodeRequired: "請輸入驗證碼",
    codeSent: "驗證碼已發送",
    loginSuccess: "登入成功",
  },
  en: {
    sloganLine1: "Great creation,", // TODO(verify) 标语英译
    sloganLine2: "rewarded well.", // TODO(verify)
    welcomeTitle: "Welcome to Lollipop",
    subtitle: "Sign in with your phone number",
    phoneLabel: "Phone number",
    phonePlaceholder: "Enter phone number",
    codeLabel: "Verification code",
    codePlaceholder: "Enter verification code",
    sendCode: "Get code",
    resendIn: "{s}s",
    submit: "Log In",
    footerNote: "Creator accounts are created by Lollipop. Only existing accounts can sign in.", // TODO(verify)
    vPhoneRequired: "Please enter your phone number",
    vCodeRequired: "Please enter the verification code",
    codeSent: "Verification code sent",
    loginSuccess: "Signed in",
  },
  pt: {
    sloganLine1: "Boa criação,", // TODO(verify) 标语葡译
    sloganLine2: "boas recompensas.", // TODO(verify)
    welcomeTitle: "Bem-vindo ao Lollipop",
    subtitle: "Entre com seu número de telefone",
    phoneLabel: "Número de telefone",
    phonePlaceholder: "Digite o número de telefone",
    codeLabel: "Código de verificação",
    codePlaceholder: "Digite o código de verificação",
    sendCode: "Obter código",
    resendIn: "{s}s",
    submit: "Entrar",
    footerNote: "Contas de criador são criadas pelo Lollipop. Apenas contas existentes podem entrar.", // TODO(verify)
    vPhoneRequired: "Digite seu número de telefone",
    vCodeRequired: "Digite o código de verificação",
    codeSent: "Código de verificação enviado",
    loginSuccess: "Conectado",
  },
};
