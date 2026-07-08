import type { Locale } from "../../i18n";

/** 两步验证登录文案（byAppToken 返回 stage=2FA_REQUIRED 时的二次校验界面） */
export interface TwoFactorMessages {
  title: string;
  /** {phone} 占位为后端返回的 phoneMask */
  desc: string;
  pendingDesc: string;
  codeLabel: string;
  codePlaceholder: string;
  codeRequired: string;
  verify: string;
  resend: string;
  resent: string;
  /** {s} 占位为剩余秒数 */
  expireIn: string;
  expired: string;
  /** 403398：已开 2FA 但登录成员未绑手机号 */
  bindPhoneFirst: string;
}

export const twoFactor: Record<Locale, TwoFactorMessages> = {
  "zh-CN": {
    title: "两步验证",
    desc: "验证码已发送至 {phone}，请输入短信验证码完成登录",
    pendingDesc: "验证码发送中，收到后可直接填写",
    codeLabel: "短信验证码",
    codePlaceholder: "请输入验证码",
    codeRequired: "请输入验证码",
    verify: "验证并登录",
    resend: "重新发送",
    resent: "验证码已重新发送",
    expireIn: "验证码将在 {s} 秒后失效",
    expired: "验证码已失效，请重新发送",
    bindPhoneFirst: "该账号已开启两步验证，登录成员需先绑定手机号。请联系账号管理员关闭两步验证或补绑手机号后重试。",
  },
  "zh-TW": {
    title: "兩步驗證",
    desc: "驗證碼已發送至 {phone}，請輸入簡訊驗證碼完成登入",
    pendingDesc: "驗證碼發送中，收到後可直接填寫",
    codeLabel: "簡訊驗證碼",
    codePlaceholder: "請輸入驗證碼",
    codeRequired: "請輸入驗證碼",
    verify: "驗證並登入",
    resend: "重新發送",
    resent: "驗證碼已重新發送",
    expireIn: "驗證碼將在 {s} 秒後失效",
    expired: "驗證碼已失效，請重新發送",
    bindPhoneFirst: "該帳號已開啟兩步驗證，登入成員需先綁定手機號。請聯絡帳號管理員關閉兩步驗證或補綁手機號後重試。",
  },
  en: {
    title: "Two-factor Verification",
    desc: "A verification code has been sent to {phone}. Enter the SMS code to finish signing in.",
    pendingDesc: "The code is being sent. You can enter it as soon as it arrives.",
    codeLabel: "SMS Code",
    codePlaceholder: "Enter the code",
    codeRequired: "Enter the code",
    verify: "Verify & Sign In",
    resend: "Resend",
    resent: "Code resent",
    expireIn: "The code expires in {s}s",
    expired: "The code has expired, please resend",
    bindPhoneFirst: "Two-factor verification is enabled for this account, and your member profile has no phone number bound. Contact the account admin to disable two-factor verification or bind your phone number first.",
  },
  pt: {
    title: "Verificação em Duas Etapas",
    desc: "Um código de verificação foi enviado para {phone}. Digite o código SMS para concluir o login.",
    pendingDesc: "O código está sendo enviado. Você pode digitá-lo assim que chegar.",
    codeLabel: "Código SMS",
    codePlaceholder: "Digite o código",
    codeRequired: "Digite o código",
    verify: "Verificar e Entrar",
    resend: "Reenviar",
    resent: "Código reenviado",
    expireIn: "O código expira em {s}s",
    expired: "O código expirou, reenvie",
    bindPhoneFirst: "A verificação em duas etapas está ativada para esta conta e seu perfil de membro não tem telefone vinculado. Contate o administrador da conta para desativar a verificação em duas etapas ou vincular seu telefone primeiro.",
  },
};
