import type { Locale } from "../../i18n-types";

/** 强制完善发行者资料弹窗（Figma 16590:1513） */
export interface ProfileSetupMessages {
  title: string;
  subtitle: string;
  avatarHint: string;
  nicknameLabel: string;
  nicknamePlaceholder: string;
  nicknameHelper: string;
  nicknameRequired: string;
  nicknameEnglishOnly: string;
  avatarRequired: string;
  submit: string;
  uploading: string;
  saveSuccess: string;
}

const zhCN: ProfileSetupMessages = {
  title: "完善你的发行者资料",
  subtitle: "头像和昵称将展示在 APP 内容页面上，代表你的发行者身份",
  avatarHint: "点击上方头像区域上传你的照片",
  nicknameLabel: "昵称",
  nicknamePlaceholder: "e.g. CloudDrama",
  nicknameHelper: "请输入英文昵称，例如 CloudDrama · 将展示在 APP 发行者页面，代表你的品牌形象",
  nicknameRequired: "请输入昵称",
  nicknameEnglishOnly: "昵称仅支持英文（字母开头，可含数字、空格及 . _ ' -）",
  avatarRequired: "请上传头像",
  submit: "完成，进入创作中心",
  uploading: "上传中…",
  saveSuccess: "资料已保存",
};

export const profileSetup: Record<Locale, ProfileSetupMessages> = {
  "zh-CN": zhCN,
  "zh-TW": {
    ...zhCN,
    title: "完善你的發行者資料",
    subtitle: "頭像和暱稱將展示在 APP 內容頁面上，代表你的發行者身分",
    avatarHint: "點擊上方頭像區域上傳你的照片",
    nicknameLabel: "暱稱",
    nicknameHelper: "請輸入英文暱稱，例如 CloudDrama · 將展示在 APP 發行者頁面，代表你的品牌形象",
    nicknameRequired: "請輸入暱稱",
    nicknameEnglishOnly: "暱稱僅支援英文（字母開頭，可含數字、空格及 . _ ' -）",
    avatarRequired: "請上傳頭像",
    submit: "完成，進入創作中心",
    uploading: "上傳中…",
    saveSuccess: "資料已儲存",
  },
  en: {
    title: "Complete your publisher profile",
    subtitle: "Your avatar and nickname appear on APP content pages as your publisher identity",
    avatarHint: "Tap the avatar above to upload your photo",
    nicknameLabel: "Nickname",
    nicknamePlaceholder: "e.g. CloudDrama",
    nicknameHelper: "Enter an English nickname, e.g. CloudDrama · shown on the APP publisher page as your brand",
    nicknameRequired: "Please enter a nickname",
    nicknameEnglishOnly: "Nickname must be English (start with a letter; letters, numbers, spaces, . _ ' - allowed)",
    avatarRequired: "Please upload an avatar",
    submit: "Done, enter Creator Center",
    uploading: "Uploading…",
    saveSuccess: "Profile saved",
  },
  pt: {
    title: "Complete o perfil de publicador",
    subtitle: "Avatar e apelido aparecem nas páginas de conteúdo do APP como sua identidade de publicador",
    avatarHint: "Toque no avatar acima para enviar sua foto",
    nicknameLabel: "Apelido",
    nicknamePlaceholder: "e.g. CloudDrama",
    nicknameHelper: "Use um apelido em inglês, ex. CloudDrama · exibido na página do publicador no APP",
    nicknameRequired: "Informe um apelido",
    nicknameEnglishOnly: "O apelido deve ser em inglês (começar com letra; letras, números, espaços, . _ ' -)",
    avatarRequired: "Envie um avatar",
    submit: "Concluir e entrar no Centro",
    uploading: "Enviando…",
    saveSuccess: "Perfil salvo",
  },
  es: {
    title: "Completa tu perfil de publicador",
    subtitle: "Tu avatar y apodo aparecen en las páginas de contenido de la APP como tu identidad de publicador",
    avatarHint: "Toca el avatar de arriba para subir tu foto",
    nicknameLabel: "Apodo",
    nicknamePlaceholder: "e.g. CloudDrama",
    nicknameHelper: "Usa un apodo en inglés, p. ej. CloudDrama · se muestra en la página del publicador de la APP",
    nicknameRequired: "Introduce un apodo",
    nicknameEnglishOnly: "El apodo debe estar en inglés (empezar por letra; letras, números, espacios, . _ ' -)",
    avatarRequired: "Sube un avatar",
    submit: "Listo, entrar al Centro",
    uploading: "Subiendo…",
    saveSuccess: "Perfil guardado",
  },
  ar: {
    title: "أكمل ملف الناشر",
    subtitle: "تظهر صورتك واسمك المستعار في صفحات محتوى التطبيق كهوية الناشر",
    avatarHint: "اضغط على الصورة أعلاه لرفع صورتك",
    nicknameLabel: "الاسم المستعار",
    nicknamePlaceholder: "e.g. CloudDrama",
    nicknameHelper: "أدخل اسمًا مستعارًا بالإنجليزية مثل CloudDrama · يظهر في صفحة الناشر بالتطبيق",
    nicknameRequired: "يرجى إدخال اسم مستعار",
    nicknameEnglishOnly: "يجب أن يكون الاسم المستعار بالإنجليزية (يبدأ بحرف؛ أحرف وأرقام ومسافات و . _ ' -)",
    avatarRequired: "يرجى رفع صورة رمزية",
    submit: "تم، ادخل مركز الإبداع",
    uploading: "جارٍ الرفع…",
    saveSuccess: "تم حفظ الملف",
  },
};
