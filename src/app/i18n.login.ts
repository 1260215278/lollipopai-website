import type { Locale } from "./i18n-types";

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
  /** 密码登录 / 邮箱登录 / 忘记密码（照搬 H5 逻辑新增） */
  passwordLogin: string;
  codeLogin: string;
  accountPlaceholder: string;
  passwordPlaceholder: string;
  forgotPassword: string;
  vAccountRequired: string;
  vPasswordRequired: string;
  resetTitle: string;
  newPasswordPlaceholder: string;
  confirmPasswordPlaceholder: string;
  resetButton: string;
  backToLogin: string;
  vPasswordMismatch: string;
  vPasswordTooShort: string;
  resetSuccess: string;
  /** 注册态（注册/登录双态切换） */
  registerTitle: string;
  registerSubtitle: string;
  registerSubmit: string;
  toLogin: string;
  toRegister: string;
  registerSuccess: string;
}

export const loginMessages: Record<Locale, LoginMessages> = {
  "zh-CN": {
    sloganLine1: "让好创作",
    sloganLine2: "收获好回报",
    welcomeTitle: "欢迎使用 Lollipop",
    subtitle: "请使用手机号或邮箱登录您的账号",
    phoneLabel: "账号",
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
    passwordLogin: "密码登录",
    codeLogin: "验证码登录",
    accountPlaceholder: "请输入手机号或邮箱",
    passwordPlaceholder: "请输入密码",
    forgotPassword: "忘记密码？",
    vAccountRequired: "请输入手机号或邮箱",
    vPasswordRequired: "请输入密码",
    resetTitle: "重置密码",
    newPasswordPlaceholder: "请输入新密码",
    confirmPasswordPlaceholder: "请再次输入新密码",
    resetButton: "重置密码",
    backToLogin: "返回登录",
    vPasswordMismatch: "两次输入的密码不一致",
    vPasswordTooShort: "密码至少 6 位",
    resetSuccess: "密码重置成功，请登录",
    registerTitle: "注册账号",
    registerSubtitle: "请使用手机号或邮箱注册账号",
    registerSubmit: "注册",
    toLogin: "已有账号？去登录",
    toRegister: "没有账号？去注册",
    registerSuccess: "注册成功",
  },
  "zh-TW": {
    sloganLine1: "讓好創作",
    sloganLine2: "收穫好回報",
    welcomeTitle: "歡迎使用 Lollipop",
    subtitle: "請使用手機號或郵箱登入您的帳號",
    phoneLabel: "帳號",
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
    passwordLogin: "密碼登入",
    codeLogin: "驗證碼登入",
    accountPlaceholder: "請輸入手機號或郵箱",
    passwordPlaceholder: "請輸入密碼",
    forgotPassword: "忘記密碼？",
    vAccountRequired: "請輸入手機號或郵箱",
    vPasswordRequired: "請輸入密碼",
    resetTitle: "重設密碼",
    newPasswordPlaceholder: "請輸入新密碼",
    confirmPasswordPlaceholder: "請再次輸入新密碼",
    resetButton: "重設密碼",
    backToLogin: "返回登入",
    vPasswordMismatch: "兩次輸入的密碼不一致",
    vPasswordTooShort: "密碼至少 6 位",
    resetSuccess: "密碼重設成功，請登入",
    registerTitle: "註冊帳號",
    registerSubtitle: "請使用手機號或郵箱註冊帳號",
    registerSubmit: "註冊",
    toLogin: "已有帳號？去登入",
    toRegister: "沒有帳號？去註冊",
    registerSuccess: "註冊成功",
  },
  en: {
    sloganLine1: "Great creation,", // TODO(verify) 标语英译
    sloganLine2: "rewarded well.", // TODO(verify)
    welcomeTitle: "Welcome to Lollipop",
    subtitle: "Sign in with your phone number or email",
    phoneLabel: "Account",
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
    passwordLogin: "Password",
    codeLogin: "Code",
    accountPlaceholder: "Phone number or email",
    passwordPlaceholder: "Enter password",
    forgotPassword: "Forgot password?",
    vAccountRequired: "Please enter your phone number or email",
    vPasswordRequired: "Please enter your password",
    resetTitle: "Reset password",
    newPasswordPlaceholder: "Enter new password",
    confirmPasswordPlaceholder: "Re-enter new password",
    resetButton: "Reset password",
    backToLogin: "Back to login",
    vPasswordMismatch: "Passwords do not match",
    vPasswordTooShort: "Password must be at least 6 characters",
    resetSuccess: "Password reset successful, please log in",
    registerTitle: "Create account",
    registerSubtitle: "Sign up with your phone number or email",
    registerSubmit: "Sign Up",
    toLogin: "Already have an account? Log in",
    toRegister: "No account? Sign up",
    registerSuccess: "Registration successful",
  },
  pt: {
    sloganLine1: "Boa criação,", // TODO(verify) 标语葡译
    sloganLine2: "boas recompensas.", // TODO(verify)
    welcomeTitle: "Bem-vindo ao Lollipop",
    subtitle: "Entre com seu telefone ou e-mail",
    phoneLabel: "Conta",
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
    passwordLogin: "Senha",
    codeLogin: "Código",
    accountPlaceholder: "Telefone ou e-mail",
    passwordPlaceholder: "Digite a senha",
    forgotPassword: "Esqueceu a senha?",
    vAccountRequired: "Digite seu telefone ou e-mail",
    vPasswordRequired: "Digite sua senha",
    resetTitle: "Redefinir senha",
    newPasswordPlaceholder: "Digite a nova senha",
    confirmPasswordPlaceholder: "Digite novamente a nova senha",
    resetButton: "Redefinir senha",
    backToLogin: "Voltar ao login",
    vPasswordMismatch: "As senhas não coincidem",
    vPasswordTooShort: "A senha deve ter pelo menos 6 caracteres",
    resetSuccess: "Senha redefinida com sucesso, faça login",
    registerTitle: "Criar conta",
    registerSubtitle: "Cadastre-se com seu telefone ou e-mail",
    registerSubmit: "Cadastrar",
    toLogin: "Já tem conta? Entrar",
    toRegister: "Não tem conta? Cadastre-se",
    registerSuccess: "Cadastro concluído",
  },
  es: {
    sloganLine1: "Buena creación,", // TODO(verify) 标语西译
    sloganLine2: "buena recompensa.", // TODO(verify)
    welcomeTitle: "Bienvenido a Lollipop",
    subtitle: "Inicia sesión con tu teléfono o correo",
    phoneLabel: "Cuenta",
    phonePlaceholder: "Introduce el número de teléfono",
    codeLabel: "Código de verificación",
    codePlaceholder: "Introduce el código de verificación",
    sendCode: "Obtener código",
    resendIn: "{s}s",
    submit: "Iniciar sesión",
    footerNote: "Las cuentas de creador las crea Lollipop. Solo pueden iniciar sesión las cuentas existentes.", // TODO(verify)
    vPhoneRequired: "Introduce tu número de teléfono",
    vCodeRequired: "Introduce el código de verificación",
    codeSent: "Código de verificación enviado",
    loginSuccess: "Sesión iniciada",
    passwordLogin: "Contraseña",
    codeLogin: "Código",
    accountPlaceholder: "Teléfono o correo",
    passwordPlaceholder: "Introduce la contraseña",
    forgotPassword: "¿Olvidaste la contraseña?",
    vAccountRequired: "Introduce tu teléfono o correo",
    vPasswordRequired: "Introduce tu contraseña",
    resetTitle: "Restablecer contraseña",
    newPasswordPlaceholder: "Introduce la nueva contraseña",
    confirmPasswordPlaceholder: "Vuelve a introducir la nueva contraseña",
    resetButton: "Restablecer contraseña",
    backToLogin: "Volver al inicio de sesión",
    vPasswordMismatch: "Las contraseñas no coinciden",
    vPasswordTooShort: "La contraseña debe tener al menos 6 caracteres",
    resetSuccess: "Contraseña restablecida, inicia sesión",
    registerTitle: "Crear cuenta",
    registerSubtitle: "Regístrate con tu teléfono o correo",
    registerSubmit: "Registrarse",
    toLogin: "¿Ya tienes cuenta? Inicia sesión",
    toRegister: "¿No tienes cuenta? Regístrate",
    registerSuccess: "Registro completado",
  },
  ar: {
    sloganLine1: "إبداع جيد،", // TODO(verify) 标语阿译
    sloganLine2: "ومكافأة جيدة.", // TODO(verify)
    welcomeTitle: "مرحبًا بك في Lollipop",
    subtitle: "سجّل الدخول برقم هاتفك أو بريدك الإلكتروني",
    phoneLabel: "الحساب",
    phonePlaceholder: "أدخل رقم الهاتف",
    codeLabel: "رمز التحقق",
    codePlaceholder: "أدخل رمز التحقق",
    sendCode: "الحصول على الرمز",
    resendIn: "{s}s",
    submit: "تسجيل الدخول",
    footerNote: "حسابات المبدعين ينشئها Lollipop. يمكن للحسابات الحالية فقط تسجيل الدخول.", // TODO(verify)
    vPhoneRequired: "يرجى إدخال رقم هاتفك",
    vCodeRequired: "يرجى إدخال رمز التحقق",
    codeSent: "تم إرسال رمز التحقق",
    loginSuccess: "تم تسجيل الدخول",
    passwordLogin: "كلمة المرور",
    codeLogin: "الرمز",
    accountPlaceholder: "الهاتف أو البريد الإلكتروني",
    passwordPlaceholder: "أدخل كلمة المرور",
    forgotPassword: "هل نسيت كلمة المرور؟",
    vAccountRequired: "يرجى إدخال هاتفك أو بريدك الإلكتروني",
    vPasswordRequired: "يرجى إدخال كلمة المرور",
    resetTitle: "إعادة تعيين كلمة المرور",
    newPasswordPlaceholder: "أدخل كلمة المرور الجديدة",
    confirmPasswordPlaceholder: "أعد إدخال كلمة المرور الجديدة",
    resetButton: "إعادة تعيين كلمة المرور",
    backToLogin: "العودة لتسجيل الدخول",
    vPasswordMismatch: "كلمتا المرور غير متطابقتين",
    vPasswordTooShort: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل",
    resetSuccess: "تمت إعادة تعيين كلمة المرور، يرجى تسجيل الدخول",
    registerTitle: "إنشاء حساب",
    registerSubtitle: "سجّل برقم هاتفك أو بريدك الإلكتروني",
    registerSubmit: "إنشاء حساب",
    toLogin: "لديك حساب؟ سجّل الدخول",
    toRegister: "ليس لديك حساب؟ سجّل",
    registerSuccess: "تم التسجيل بنجاح",
  },
};
