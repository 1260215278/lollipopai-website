/**
 * 官网 SEO 文案（title / description / Open Graph / canonical）。
 * 语言集与 i18n.tsx Locale 一致：zh-CN / zh-TW / en / pt / es / ar。
 *
 * 2026-08-03 二次审计修复：
 * - 按页面（home/about/creating/download/contact/privacy/terms）独立设置 title/description
 * - canonical URL 按页面路径生成
 * - 移除 meta keywords（Google 已废弃）
 * - 英文 title 控制在 55 字符以内
 */
import { getDeployBasename, localizedHref, matchLocalePath, stripLocalePrefix } from "./localePath";
import { isMultilangSubsetPath } from "./multilangSubset";

/** 与 i18n.tsx 的 Locale 对齐（避免循环 import） */
export type SeoLocale = "zh-TW" | "zh-CN" | "en" | "pt" | "es" | "ar";

/** 可索引的页面类型 */
export type PageType = "home" | "about" | "creating" | "download" | "contact" | "privacy" | "terms";

export interface SeoMessages {
  /** 浏览器标签 / og:title — 控制在 60 字符以内 */
  title: string;
  /** meta description / og:description — 控制在 160 字符以内 */
  description: string;
}

const SITE_URL = "https://www.lollipop.im";

/** 页面路径映射 */
const pagePaths: Record<PageType, string> = {
  home: "/",
  about: "/about",
  creating: "/creating",
  download: "/download",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
};

/**
 * 按页面 × 语言的 SEO 文案。
 * 每个页面有独立的 title 和 description，避免 Google 索引到重复 meta。
 */
export const pageSeoMessages: Record<PageType, Record<SeoLocale, SeoMessages>> = {
  home: {
    "zh-CN": {
      title: "Lollipop Drama — AI短剧创作工具与精品短剧平台 | AI视频生成",
      description:
        "Lollipop Drama是AI驱动的短剧创作与消费平台，内置AI文生视频等创作工具，支持80%收益分成，帮助创作者变现。15000+精品短剧，覆盖100+国家。",
    },
    "zh-TW": {
      title: "Lollipop Drama — AI短劇創作工具與精品短劇平台 | AI影片生成",
      description:
        "Lollipop Drama是AI驅動的短劇創作與消費平台，內建AI文生影片等創作工具，支持80%收益分成，幫助創作者變現。15000+精品短劇，覆蓋100+國家。",
    },
    en: {
      title: "Lollipop Drama — AI Short Drama Creation & Streaming Platform",
      description:
        "Lollipop Drama: AI-powered short drama creation and streaming platform. Create videos from text using built-in AI tools, earn 80% revenue share. 15,000+ premium dramas, 100+ countries worldwide.",
    },
    pt: {
      title: "Lollipop Drama — Criação e Streaming de Dramas Curtos com IA",
      description:
        "Lollipop Drama: plataforma de criação e streaming de dramas curtos com IA. Crie vídeos a partir de texto usando ferramentas de IA integradas, ganhe 80% da receita. 15.000+ dramas premium, 100+ países.",
    },
    es: {
      title: "Lollipop Drama — Creación y Streaming de Dramas Cortos con IA",
      description:
        "Lollipop Drama: plataforma de creación y streaming de dramas cortos con IA. Crea videos desde texto usando herramientas de IA integradas, gana 80% de los ingresos. 15.000+ dramas premium, 100+ países.",
    },
    ar: {
      title: "Lollipop Drama — منصة إنشاء وبث دراما قصيرة بالذكاء الاصطناعي",
      description:
        "Lollipop Drama: منصة إنشاء وبث دراما قصيرة مدعومة بالذكاء الاصطناعي. أنشئ مقاطع فيديو من النص باستخدام أدوات الذكاء الاصطناعي المدمجة، واحصل على 80% من الإيرادات. 15000+ دراما مميزة، 100+ دولة.",
    },
  },
  about: {
    "zh-CN": {
      title: "关于 Lollipop Drama — AI驱动的全球短剧娱乐平台",
      description:
        "Lollipop Drama由香港Nyx Entertainment Group与韩国文化投资基金联合打造，通过内置AI视频生成技术革新短剧娱乐，已覆盖100万+全球用户和100+国家。",
    },
    "zh-TW": {
      title: "關於 Lollipop Drama — AI驅動的全球短劇娛樂平台",
      description:
        "Lollipop Drama由香港Nyx Entertainment Group與韓國文化投資基金聯合打造，透過內建AI影片生成技術革新短劇娛樂，已覆蓋100萬+全球用戶和100+國家。",
    },
    en: {
      title: "About Lollipop Drama — AI-Powered Short Drama Platform",
      description:
        "Lollipop Drama is a joint venture by Nyx Entertainment Group and Korean Cultural Investment Fund, revolutionizing short drama entertainment with built-in AI video generation tools. 1M+ users across 100+ countries.",
    },
    pt: {
      title: "Sobre a Lollipop Drama — Plataforma de Dramas com IA",
      description:
        "A Lollipop Drama e uma joint venture da Nyx Entertainment Group com o Fundo Coreano de Investimento Cultural, revolucionando dramas com ferramentas integradas de geracao de video por IA.",
    },
    es: {
      title: "Acerca de Lollipop Drama — Plataforma de dramas con IA",
      description:
        "Lollipop Drama es una joint venture de Nyx Entertainment Group y el Fondo Coreano de Inversión Cultural, que transforma el entretenimiento con herramientas integradas de generación de video por IA. Más de 1M de usuarios en 100+ países.",
    },
    ar: {
      title: "حول Lollipop Drama — منصة دراما قصيرة مدعومة بالذكاء الاصطناعي",
      description:
        "Lollipop Drama مشروع مشترك بين Nyx Entertainment Group وصندوق الاستثمار الثقافي الكوري، يحدث ترفيه الدراما القصيرة بأدوات مدمجة لتوليد الفيديو بالذكاء الاصطناعي. أكثر من مليون مستخدم في 100+ دولة.",
    },
  },
  creating: {
    "zh-CN": {
      title: "AI短剧创作工具 — Lollipop Drama 一站式创作与变现平台",
      description:
        "使用Lollipop Drama创作工具制作短剧：AI图片生成、AI换脸、AI视频创作、风格迁移。80%收益分成，完整AI创作工具包，面向全球100+国家分发。",
    },
    "zh-TW": {
      title: "AI短劇創作工具 — Lollipop Drama 一站式創作與變現平台",
      description:
        "使用Lollipop Drama創作工具製作短劇：AI圖像生成、AI換臉、AI影片創作、風格遷移。80%收益分成，完整AI創作工具包，面向全球100+國家分發。",
    },
    en: {
      title: "Create AI Short Dramas — Lollipop Drama Tools",
      description:
        "Create short dramas with Lollipop Drama tools: AI image generation, face swap, video creation, and style transfer. 80% revenue share, full AI toolkit, global distribution in 100+ countries.",
    },
    pt: {
      title: "Crie Dramas com IA — Ferramentas Lollipop Drama",
      description:
        "Crie dramas curtos com as ferramentas Lollipop Drama: geracao de imagens, troca de rosto, criacao de video e transferencia de estilo. 80% de participacao na receita.",
    },
    es: {
      title: "Crea dramas con IA — Herramientas Lollipop Drama",
      description:
        "Crea dramas cortos con las herramientas Lollipop Drama: generación de imágenes, intercambio de rostros, creación de vídeo y transferencia de estilo. 80% de ingresos, kit completo de IA, distribución en 100+ países.",
    },
    ar: {
      title: "أنشئ دراما بالذكاء الاصطناعي — أدوات Lollipop Drama",
      description:
        "أنشئ دراما قصيرة بأدوات Lollipop Drama: توليد الصور وتبديل الوجوه وإنشاء الفيديو ونقل الأسلوب. حصة إيرادات 80% وأدوات كاملة وتوزيع عالمي في 100+ دولة.",
    },
  },
  download: {
    "zh-CN": {
      title: "下载 Lollipop Drama — iOS & Android",
      description:
        "免费下载Lollipop Drama，支持iOS和Android。15000+精品短剧、4K播放、离线缓存、AI创作工具。2M+下载量，100+国家，App Store评分4.9星。",
    },
    "zh-TW": {
      title: "下載 Lollipop Drama — iOS & Android",
      description:
        "免費下載Lollipop Drama，支援iOS和Android。15000+精品短劇、4K播放、離線快取、AI創作工具。2M+下載量，100+國家，App Store評分4.9星。",
    },
    en: {
      title: "Download Lollipop Drama — iOS & Android",
      description:
        "Download Lollipop Drama free on iOS and Android. 15,000+ premium short dramas, 4K streaming, offline downloads, AI creation tools. 2M+ downloads, 100+ countries, 4.9-star rating.",
    },
    pt: {
      title: "Baixar Lollipop Drama — iOS & Android",
      description:
        "Baixe a Lollipop Drama gratis no iOS e Android. 15.000+ dramas premium, streaming 4K, downloads offline, ferramentas de IA. 2M+ downloads, 100+ paises, nota 4.9.",
    },
    es: {
      title: "Descargar Lollipop Drama — iOS y Android",
      description:
        "Descarga Lollipop Drama gratis en iOS y Android. Más de 15.000 dramas premium, streaming 4K, descargas sin conexión y herramientas de IA. 2M+ descargas, 100+ países, 4.9 estrellas.",
    },
    ar: {
      title: "حمّل Lollipop Drama — iOS و Android",
      description:
        "حمّل Lollipop Drama مجانًا على iOS وAndroid. أكثر من 15000 دراما متميزة وبث 4K وتنزيل دون اتصال وأدوات ذكاء اصطناعي. أكثر من 2 مليون تنزيل في 100+ دولة وتقييم 4.9.",
    },
  },
  contact: {
    "zh-CN": {
      title: "联系 Lollipop Drama — 商务合作、客服支持与产品意见反馈",
      description:
        "联系Lollipop Drama团队：商务合作business@lollipop.im，客服service@lollipop.im，电话+65 80742120。地址：3 Gambas Crescent, Nordcom One, Singapore 757088。",
    },
    "zh-TW": {
      title: "聯絡 Lollipop Drama — 商務合作、客服支援與產品意見反饋",
      description:
        "聯絡Lollipop Drama團隊：商務合作business@lollipop.im，客服service@lollipop.im，電話+65 80742120。地址：3 Gambas Crescent, Nordcom One, Singapore 757088。",
    },
    en: {
      title: "Contact Lollipop Drama — Support & Business",
      description:
        "Contact Lollipop Drama: business@lollipop.im for partnerships, service@lollipop.im for support, +65 80742120. Address: 3 Gambas Crescent, Nordcom One, Singapore 757088.",
    },
    pt: {
      title: "Contato Lollipop Drama — Suporte & Comercial",
      description:
        "Contate a Lollipop Drama: business@lollipop.im para parcerias, service@lollipop.im para suporte, +65 80742120. Endereco: 3 Gambas Crescent, Nordcom One, Singapura 757088.",
    },
    es: {
      title: "Contacto Lollipop Drama — Soporte y negocios",
      description:
        "Contacta a Lollipop Drama: business@lollipop.im para alianzas, service@lollipop.im para soporte, +65 80742120. Dirección: 3 Gambas Crescent, Nordcom One, Singapore 757088.",
    },
    ar: {
      title: "تواصل مع Lollipop Drama — الدعم والأعمال",
      description:
        "تواصل مع Lollipop Drama: business@lollipop.im للشراكات، service@lollipop.im للدعم، +65 80742120. العنوان: 3 Gambas Crescent, Nordcom One, Singapore 757088.",
    },
  },
  privacy: {
    "zh-CN": {
      title: "隐私政策 — Lollipop Drama",
      description:
        "Lollipop Drama隐私政策：了解我们如何收集、使用和保护您的个人信息，包括数据类型、使用目的、第三方共享和您的隐私权利。",
    },
    "zh-TW": {
      title: "隱私政策 — Lollipop Drama",
      description:
        "Lollipop Drama隱私政策：了解我們如何收集、使用和保護您的個人資料，包括資料類型、使用目的、第三方共享和您的隱私權利。",
    },
    en: {
      title: "Privacy Policy — Lollipop Drama",
      description:
        "Lollipop Drama Privacy Policy: Learn how we collect, use, and protect your personal information, including data types, purposes, third-party sharing, and your privacy rights.",
    },
    pt: {
      title: "Politica de Privacidade — Lollipop Drama",
      description:
        "Politica de Privacidade da Lollipop Drama: saiba como coletamos, usamos e protegemos suas informacoes pessoais, incluindo tipos de dados e seus direitos de privacidade.",
    },
    es: {
      title: "Política de privacidad — Lollipop Drama",
      description:
        "Política de privacidad de Lollipop Drama: cómo recopilamos, usamos y protegemos tu información personal, incluidos los tipos de datos, finalidades, cesión a terceros y tus derechos de privacidad.",
    },
    ar: {
      title: "سياسة الخصوصية — Lollipop Drama",
      description:
        "سياسة خصوصية Lollipop Drama: تعرّف كيف نجمع معلوماتك الشخصية ونستخدمها ونحميها، بما في ذلك أنواع البيانات والأغراض والمشاركة مع أطراف ثالثة وحقوق الخصوصية.",
    },
  },
  terms: {
    "zh-CN": {
      title: "服务条款 — Lollipop Drama",
      description:
        "Lollipop Drama服务条款：使用平台的服务条款与条件，包括用户义务、内容政策、知识产权、免责声明和争议解决。",
    },
    "zh-TW": {
      title: "服務條款 — Lollipop Drama",
      description:
        "Lollipop Drama服務條款：使用平台的服務條款與條件，包括用戶義務、內容政策、知識產權、免責聲明和爭議解決。",
    },
    en: {
      title: "Terms of Service — Lollipop Drama",
      description:
        "Lollipop Drama Terms of Service: Terms and conditions for using the platform, including user obligations, content policy, intellectual property, disclaimers, and dispute resolution.",
    },
    pt: {
      title: "Termos de Servico — Lollipop Drama",
      description:
        "Termos de Servico da Lollipop Drama: termos e condicoes para uso da plataforma, incluindo obrigacoes do usuario, politica de conteudo e propriedade intelectual.",
    },
    es: {
      title: "Términos de servicio — Lollipop Drama",
      description:
        "Términos de servicio de Lollipop Drama: condiciones de uso de la plataforma, incluidas las obligaciones del usuario, la política de contenido, la propiedad intelectual, las exclusiones de responsabilidad y la resolución de disputas.",
    },
    ar: {
      title: "شروط الخدمة — Lollipop Drama",
      description:
        "شروط خدمة Lollipop Drama: شروط وأحكام استخدام المنصة، بما في ذلك التزامات المستخدم وسياسة المحتوى والملكية الفكرية وإخلاء المسؤولية وتسوية النزاعات.",
    },
  },
};

/**
 * 写入/更新 document head 中的 SEO meta（浏览器端）。
 * @param seo  当前页面的 SEO 文案
 * @param page  当前页面类型，用于生成 canonical URL
 */
export function applySeoMeta(seo: SeoMessages, page: PageType = "home"): void {
  if (typeof document === "undefined") return;
  applyCustomSeoMeta(seo, pagePaths[page]);
}

/**
 * 为动态页面（genre/drama/blog/region/creator 等）设置 SEO meta。
 * 与 applySeoMeta 功能相同，但接受自定义 canonical 路径而非 PageType。
 * canonicalPath 为无语言前缀的业务路径（如 /about）；最终 canonical 会按当前语言补前缀。
 */
export function applyCustomSeoMeta(seo: SeoMessages, canonicalPath: string): void {
  if (typeof document === "undefined") return;

  const locale = resolveSeoLocale();
  const localizedPath = localizedHref(locale, canonicalPath);
  const canonicalUrl = SITE_URL + localizedPath;

  document.title = seo.title;

  setMetaByName("description", seo.description);
  setMetaByName("author", "Lollipop Drama");
  setMetaByName("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

  // 动态更新 hreflang（路径前缀版）
  updateHreflang(canonicalPath);

  // Open Graph
  setMetaByProperty("og:type", "website");
  setMetaByProperty("og:site_name", "Lollipop Drama");
  setMetaByProperty("og:title", seo.title);
  setMetaByProperty("og:description", seo.description);
  setMetaByProperty("og:url", canonicalUrl);
  setMetaByProperty("og:image", SITE_URL + "/og-image.png");

  // Twitter Card
  setMetaByName("twitter:card", "summary_large_image");
  setMetaByName("twitter:site", "@lollipopai");
  setMetaByName("twitter:title", seo.title);
  setMetaByName("twitter:description", seo.description);
  setMetaByName("twitter:image", SITE_URL + "/og-image.png");

  // Canonical — 移除旧的再添加，确保唯一
  const existingCanonical = document.querySelector('link[rel="canonical"]');
  if (existingCanonical) {
    existingCanonical.setAttribute("href", canonicalUrl);
  } else {
    const link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", canonicalUrl);
    document.head.appendChild(link);
  }
}

/**
 * 动态更新 hreflang 链接标签（路径前缀版）。
 *
 * 与预渲染方案 B 对齐：
 * - 多语言子集页面（首页/about/creating/download/contact/blog + 10 genre + 有中文标题的文章）
 *   输出完整 6 语言互指 + x-default
 * - 其余页面只输出自指 en + x-default
 *
 * 声明 hreflang 的前提是对应 URL 真的有产物（预渲染生成了对应语言的静态 HTML）。
 * 子集规则由 multilangSubset.ts 统一维护，与 prerender-plugin.ts 共享同一套判定逻辑。
 */
function updateHreflang(pagePath: string): void {
  if (typeof document === "undefined") return;

  // 先剥离语言前缀，得到纯应用路径
  const appPath = stripLocalePrefix(pagePath);

  // 根据页面是否属于多语言子集决定 hreflang 语言组
  const isSubset = isMultilangSubsetPath(appPath);
  const langs: { hreflang: string; locale: SeoLocale }[] = isSubset
    ? [
        { hreflang: "en", locale: "en" },
        { hreflang: "zh", locale: "zh-CN" },
        { hreflang: "zh-TW", locale: "zh-TW" },
        { hreflang: "pt", locale: "pt" },
        { hreflang: "es", locale: "es" },
        { hreflang: "ar", locale: "ar" },
      ]
    : [{ hreflang: "en", locale: "en" }];

  // 清理旧的 hreflang 标签（防止子集/非子集切换时残留）
  const existingHreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
  existingHreflangs.forEach((el) => el.remove());

  langs.forEach(({ hreflang, locale }) => {
    const url = `${SITE_URL}${localizedHref(locale, appPath)}`;
    const el = document.createElement("link");
    el.setAttribute("rel", "alternate");
    el.setAttribute("hreflang", hreflang);
    el.setAttribute("href", url);
    document.head.appendChild(el);
  });

  // x-default 指向无语言前缀的干净 URL（默认英文）
  const defaultEl = document.createElement("link");
  defaultEl.setAttribute("rel", "alternate");
  defaultEl.setAttribute("hreflang", "x-default");
  defaultEl.setAttribute("href", `${SITE_URL}${localizedHref("en", appPath)}`);
  document.head.appendChild(defaultEl);
}

/** 从 URL 语言前缀（优先）或 <html lang> 解析当前 SEO 语言 */
function resolveSeoLocale(): SeoLocale {
  try {
    const matched = matchLocalePath(window.location.pathname, getDeployBasename());
    if (matched) return matched.locale;
  } catch {
    // ignore
  }
  const htmlLang = document.documentElement.lang;
  if (
    htmlLang === "zh-CN" ||
    htmlLang === "zh-TW" ||
    htmlLang === "en" ||
    htmlLang === "pt" ||
    htmlLang === "es" ||
    htmlLang === "ar"
  ) {
    return htmlLang;
  }
  return "en";
}

/**
 * 为需要登录的后台页面设置 noindex + title。
 * 发行中心等私有页面不应被搜索引擎索引。
 */
export function applyNoIndexMeta(title: string): void {
  if (typeof document === "undefined") return;

  document.title = title;

  // noindex — 阻止搜索引擎索引后台页面
  setMetaByName("robots", "noindex, nofollow");

  // 移除 canonical（noindex 页面不需要）
  const existingCanonical = document.querySelector('link[rel="canonical"]');
  if (existingCanonical) existingCanonical.remove();

  // 清除 Open Graph（避免社交分享暴露后台 URL）
  removeMetaByProperty("og:title");
  removeMetaByProperty("og:description");
  removeMetaByProperty("og:url");
  removeMetaByProperty("og:image");
  removeMetaByName("twitter:card");
  removeMetaByName("twitter:title");
  removeMetaByName("twitter:description");
  removeMetaByName("twitter:image");
}

/**
 * 注入或更新页面级 JSON-LD 结构化数据。
 * 每次调用会移除上一个 page-schema 标签，再插入新的。
 */
export function setPageSchema(schema: object): void {
  if (typeof document === "undefined") return;

  // 移除上一个 page-schema
  const existing = document.getElementById("page-schema");
  if (existing) existing.remove();

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "page-schema";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/**
 * 清除页面级 JSON-LD（切换到无 Schema 页面时调用）。
 */
export function clearPageSchema(): void {
  if (typeof document === "undefined") return;
  const existing = document.getElementById("page-schema");
  if (existing) existing.remove();
}

/** 获取指定页面的 SEO 文案 */
export function getPageSeo(page: PageType, locale: SeoLocale): SeoMessages {
  return pageSeoMessages[page]?.[locale] ?? pageSeoMessages.home[locale] ?? pageSeoMessages.home.en;
}

function setMetaByName(name: string, content: string): void {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setMetaByProperty(property: string, content: string): void {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMetaByName(name: string): void {
  const el = document.querySelector(`meta[name="${name}"]`);
  if (el) el.remove();
}

function removeMetaByProperty(property: string): void {
  const el = document.querySelector(`meta[property="${property}"]`);
  if (el) el.remove();
}

/**
 * 为动态页面（genre/drama/blog/region）生成多语言 SEO。
 * 英文使用原始数据，其他语言自动生成本地化 title/description。
 *
 * @param enTitle       英文 SEO title
 * @param enDescription 英文 SEO description
 * @param locale        当前语言
 * @param pageType      页面类型（用于选择本地化模板）
 * @param name          页面主体名称（品类名/剧名/文章标题等）
 */
export function getLocalizedDynamicSeo(
  enTitle: string,
  enDescription: string,
  locale: SeoLocale,
  pageType: "genre" | "drama" | "blog" | "region",
  name: string,
): SeoMessages {
  if (locale === "en") {
    return { title: enTitle, description: enDescription };
  }

  const brand = "Lollipop Drama";

  if (locale === "zh-CN") {
    const templates: Record<typeof pageType, { title: string; desc: string }> = {
      genre: {
        title: `${name}短剧 — 在线观看 | ${brand}`,
        desc: `在${brand}上观看${name}题材短剧。海量精品${name}短剧，AI与真人创作内容，支持免费在线观看。`,
      },
      drama: {
        title: `${name} — 免费观看短剧 | ${brand}`,
        desc: `在${brand}上观看《${name}》。精彩短剧免费在线观看，支持多语言字幕，移动端畅享4K观影体验。`,
      },
      blog: {
        title: `${name} | ${brand}博客`,
        desc: `阅读${brand}博客文章《${name}》。了解AI短剧行业动态、创作者经济和制作教程。`,
      },
      region: {
        title: `${name}短剧 — 本地热门 | ${brand}`,
        desc: `为${name}用户推荐热门短剧，支持本地支付方式，畅享${brand}优质内容。`,
      },
    };
    return templates[pageType];
  }

  if (locale === "zh-TW") {
    const templates: Record<typeof pageType, { title: string; desc: string }> = {
      genre: {
        title: `${name}短劇 — 線上觀看 | ${brand}`,
        desc: `在${brand}上觀看${name}題材短劇。海量精品${name}短劇，AI與真人創作內容，支持免費線上觀看。`,
      },
      drama: {
        title: `${name} — 免費觀看短劇 | ${brand}`,
        desc: `在${brand}上觀看《${name}》。精彩短劇免費線上觀看，支援多語言字幕，行動端暢享4K觀影體驗。`,
      },
      blog: {
        title: `${name} | ${brand}部落格`,
        desc: `閱讀${brand}部落格文章《${name}》。了解AI短劇行業動態、創作者經濟和製作教程。`,
      },
      region: {
        title: `${name}短劇 — 本地熱門 | ${brand}`,
        desc: `為${name}用戶推薦熱門短劇，支援本地支付方式，暢享${brand}優質內容。`,
      },
    };
    return templates[pageType];
  }

  if (locale === "es") {
    const templates: Record<typeof pageType, { title: string; desc: string }> = {
      genre: {
        title: `Dramas cortos de ${name} — Ver online | ${brand}`,
        desc: `Mira dramas cortos de ${name} en ${brand}. Producciones destacadas de ${name}, creadas con IA y por humanos. Gratis para ver online.`,
      },
      drama: {
        title: `${name} — Ver drama corto gratis | ${brand}`,
        desc: `Mira "${name}" en ${brand}. Dramas cortos disponibles online gratis, con subtítulos en varios idiomas y streaming 4K.`,
      },
      blog: {
        title: `${name} | Blog de ${brand}`,
        desc: `Lee el artículo "${name}" en el blog de ${brand}. Tendencias de dramas cortos con IA, economía de creadores y tutoriales.`,
      },
      region: {
        title: `Dramas cortos en ${name} — Populares en tu zona | ${brand}`,
        desc: `Dramas cortos populares para usuarios en ${name}, con métodos de pago locales. Disfruta lo mejor de ${brand}.`,
      },
    };
    return templates[pageType];
  }

  if (locale === "ar") {
    const templates: Record<typeof pageType, { title: string; desc: string }> = {
      genre: {
        title: `دراما قصيرة من نوع ${name} — مشاهدة عبر الإنترنت | ${brand}`,
        desc: `شاهد دراما قصيرة من نوع ${name} على ${brand}. أعمال ${name} مميزة من صنع الذكاء الاصطناعي والبشر. مجانًا عبر الإنترنت.`,
      },
      drama: {
        title: `${name} — شاهد دراما قصيرة مجانًا | ${brand}`,
        desc: `شاهد "${name}" على ${brand}. دراما قصيرة متاحة مجانًا عبر الإنترنت، مع ترجمة متعددة اللغات وبث 4K.`,
      },
      blog: {
        title: `${name} | مدونة ${brand}`,
        desc: `اقرأ مقال "${name}" في مدونة ${brand}. اتجاهات الدراما القصيرة بالذكاء الاصطناعي واقتصاد المبدعين ودروس الإنتاج.`,
      },
      region: {
        title: `دراما قصيرة في ${name} — الأكثر رواجًا محليًا | ${brand}`,
        desc: `دراما قصيرة رائجة لمستخدمي ${name} مع طرق دفع محلية. استمتع بأفضل محتوى ${brand}.`,
      },
    };
    return templates[pageType];
  }

  if (locale === "pt") {
    const templates: Record<typeof pageType, { title: string; desc: string }> = {
      genre: {
        title: `Dramas Curtos de ${name} — Assistir Online | ${brand}`,
        desc: `Assista a dramas curtos de ${name} no ${brand}. Grandes producoes de ${name}, criadas por IA e humanos. Gratis para assistir online.`,
      },
      drama: {
        title: `${name} — Assistir Drama Curto Gratis | ${brand}`,
        desc: `Assista a "${name}" no ${brand}. Dramas curtos emocionantes disponiveis online gratis, com legendas multilinguas e streaming 4K.`,
      },
      blog: {
        title: `${name} | Blog ${brand}`,
        desc: `Leia o artigo "${name}" no blog do ${brand}. Descubra tendencias da industria de dramas curtos com IA, economia de criadores e tutoriais.`,
      },
      region: {
        title: `Dramas Curtos em ${name} — Populares Localmente | ${brand}`,
        desc: `Dramas curtos populares para usuarios em ${name}, com metodos de pagamento locais. Desfrute do melhor do ${brand}.`,
      },
    };
    return templates[pageType];
  }

  return { title: enTitle, description: enDescription };
}
