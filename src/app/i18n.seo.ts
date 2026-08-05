/**
 * 官网 SEO 文案（title / description / Open Graph / canonical）。
 * 语言集与 i18n.tsx Locale 一致：zh-CN / zh-TW / en / pt。
 *
 * 2026-08-03 二次审计修复：
 * - 按页面（home/about/creating/download/contact/privacy/terms）独立设置 title/description
 * - canonical URL 按页面路径生成
 * - 移除 meta keywords（Google 已废弃）
 * - 英文 title 控制在 55 字符以内
 */
/** 与 i18n.tsx 的 Locale 对齐（避免循环 import） */
export type SeoLocale = "zh-TW" | "zh-CN" | "en" | "pt";

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
      title: "Lollipop AI — AI短剧创作与创作者经济平台",
      description:
        "Lollipop AI是全球AI短剧平台，拥有5000+精品短剧、AI创作工具（文生视频、图生视频）及70%创作者收益分成，支持iOS和Android。",
    },
    "zh-TW": {
      title: "Lollipop AI — AI短劇創作與創作者經濟平台",
      description:
        "Lollipop AI是全球AI短劇平台，擁有5000+精品短劇、AI創作工具（文生影片、圖生影片）及70%創作者收益分成，支援iOS和Android。",
    },
    en: {
      title: "Lollipop AI — AI Short Drama & Creator Platform",
      description:
        "Lollipop AI is a global AI-powered short drama platform with 5,000+ premium shows, AI creation tools (text-to-video, image-to-video), and 70% creator revenue share.",
    },
    pt: {
      title: "Lollipop AI — Plataforma de Drama Curto com IA",
      description:
        "Lollipop AI e a plataforma global de drama curto com IA: 5.000+ series premium, ferramentas de criacao com IA e 70% de participacao na receita para criadores.",
    },
  },
  about: {
    "zh-CN": {
      title: "关于 Lollipop AI — 全球AI短剧娱乐平台",
      description:
        "Lollipop AI由香港Nyx Entertainment Group与韩国文化投资基金联合打造，致力于通过AI技术革新短剧娱乐，已覆盖50M+全球用户和30+国家。",
    },
    "zh-TW": {
      title: "關於 Lollipop AI — 全球AI短劇娛樂平台",
      description:
        "Lollipop AI由香港Nyx Entertainment Group與韓國文化投資基金聯合打造，致力於透過AI技術革新短劇娛樂，已覆蓋50M+全球用戶和30+國家。",
    },
    en: {
      title: "About Lollipop AI — AI Short Drama Platform",
      description:
        "Lollipop AI is a joint venture by Nyx Entertainment Group and Korean Cultural Investment Fund, revolutionizing short drama entertainment with AI. 50M+ users across 30+ countries.",
    },
    pt: {
      title: "Sobre a Lollipop AI — Plataforma de Drama com IA",
      description:
        "A Lollipop AI e uma joint venture da Nyx Entertainment Group com o Fundo Coreano de Investimento Cultural, revolucionando o entretenimento de dramas curtos com IA.",
    },
  },
  creating: {
    "zh-CN": {
      title: "AI创作工具 — Lollipop AI短剧创作平台",
      description:
        "使用Lollipop AI创作工具制作短剧：AI图片生成、AI换脸、AI视频创作、风格迁移。70%收益分成，完整AI创作工具包，面向全球50+国家分发。",
    },
    "zh-TW": {
      title: "AI創作工具 — Lollipop AI短劇創作平台",
      description:
        "使用Lollipop AI創作工具製作短劇：AI圖像生成、AI換臉、AI影片創作、風格遷移。70%收益分成，完整AI創作工具包，面向全球50+國家分發。",
    },
    en: {
      title: "Create AI Short Dramas — Lollipop AI Tools",
      description:
        "Create short dramas with Lollipop AI tools: AI image generation, face swap, video creation, and style transfer. 70% revenue share, full AI toolkit, global distribution in 50+ countries.",
    },
    pt: {
      title: "Crie Dramas com IA — Ferramentas Lollipop AI",
      description:
        "Crie dramas curtos com as ferramentas Lollipop AI: geracao de imagens, troca de rosto, criacao de video e transferencia de estilo. 70% de participacao na receita.",
    },
  },
  download: {
    "zh-CN": {
      title: "下载 Lollipop AI — iOS & Android",
      description:
        "免费下载Lollipop AI，支持iOS和Android。5000+精品短剧、4K播放、离线缓存、AI创作工具。2M+下载量，150+国家，App Store评分4.9星。",
    },
    "zh-TW": {
      title: "下載 Lollipop AI — iOS & Android",
      description:
        "免費下載Lollipop AI，支援iOS和Android。5000+精品短劇、4K播放、離線快取、AI創作工具。2M+下載量，150+國家，App Store評分4.9星。",
    },
    en: {
      title: "Download Lollipop AI — iOS & Android",
      description:
        "Download Lollipop AI free on iOS and Android. 5,000+ premium short dramas, 4K streaming, offline downloads, AI creation tools. 2M+ downloads, 150+ countries, 4.9-star rating.",
    },
    pt: {
      title: "Baixar Lollipop AI — iOS & Android",
      description:
        "Baixe a Lollipop AI gratis no iOS e Android. 5.000+ dramas premium, streaming 4K, downloads offline, ferramentas de IA. 2M+ downloads, 150+ paises, nota 4.9.",
    },
  },
  contact: {
    "zh-CN": {
      title: "联系 Lollipop AI — 商务合作与客服支持",
      description:
        "联系Lollipop AI团队：商务合作business@lollipop.im，客服service@lollipop.im，电话+65 80742120。地址：3 Gambas Crescent, Nordcom One, Singapore 757088。",
    },
    "zh-TW": {
      title: "聯絡 Lollipop AI — 商務合作與客服支援",
      description:
        "聯絡Lollipop AI團隊：商務合作business@lollipop.im，客服service@lollipop.im，電話+65 80742120。地址：3 Gambas Crescent, Nordcom One, Singapore 757088。",
    },
    en: {
      title: "Contact Lollipop AI — Support & Business",
      description:
        "Contact Lollipop AI: business@lollipop.im for partnerships, service@lollipop.im for support, +65 80742120. Address: 3 Gambas Crescent, Nordcom One, Singapore 757088.",
    },
    pt: {
      title: "Contato Lollipop AI — Suporte & Comercial",
      description:
        "Contate a Lollipop AI: business@lollipop.im para parcerias, service@lollipop.im para suporte, +65 80742120. Endereco: 3 Gambas Crescent, Nordcom One, Singapura 757088.",
    },
  },
  privacy: {
    "zh-CN": {
      title: "隐私政策 — Lollipop AI",
      description:
        "Lollipop AI隐私政策：了解我们如何收集、使用和保护您的个人信息，包括数据类型、使用目的、第三方共享和您的隐私权利。",
    },
    "zh-TW": {
      title: "隱私政策 — Lollipop AI",
      description:
        "Lollipop AI隱私政策：了解我們如何收集、使用和保護您的個人資料，包括資料類型、使用目的、第三方共享和您的隱私權利。",
    },
    en: {
      title: "Privacy Policy — Lollipop AI",
      description:
        "Lollipop AI Privacy Policy: Learn how we collect, use, and protect your personal information, including data types, purposes, third-party sharing, and your privacy rights.",
    },
    pt: {
      title: "Politica de Privacidade — Lollipop AI",
      description:
        "Politica de Privacidade da Lollipop AI: saiba como coletamos, usamos e protegemos suas informacoes pessoais, incluindo tipos de dados e seus direitos de privacidade.",
    },
  },
  terms: {
    "zh-CN": {
      title: "服务条款 — Lollipop AI",
      description:
        "Lollipop AI服务条款：使用平台的服务条款与条件，包括用户义务、内容政策、知识产权、免责声明和争议解决。",
    },
    "zh-TW": {
      title: "服務條款 — Lollipop AI",
      description:
        "Lollipop AI服務條款：使用平台的服務條款與條件，包括用戶義務、內容政策、知識產權、免責聲明和爭議解決。",
    },
    en: {
      title: "Terms of Service — Lollipop AI",
      description:
        "Lollipop AI Terms of Service: Terms and conditions for using the platform, including user obligations, content policy, intellectual property, disclaimers, and dispute resolution.",
    },
    pt: {
      title: "Termos de Servico — Lollipop AI",
      description:
        "Termos de Servico da Lollipop AI: termos e condicoes para uso da plataforma, incluindo obrigacoes do usuario, politica de conteudo e propriedade intelectual.",
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
 */
export function applyCustomSeoMeta(seo: SeoMessages, canonicalPath: string): void {
  if (typeof document === "undefined") return;

  const canonicalUrl = SITE_URL + canonicalPath;

  document.title = seo.title;

  setMetaByName("description", seo.description);
  setMetaByName("author", "Lollipop AI");
  setMetaByName("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

  // 动态更新 hreflang（查询参数版）
  updateHreflang(canonicalPath);

  // Open Graph
  setMetaByProperty("og:type", "website");
  setMetaByProperty("og:site_name", "Lollipop AI");
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
 * 动态更新 hreflang 链接标签（查询参数版）。
 * 各语言版本通过 ?lang=xx 区分，让搜索引擎识别多语言内容。
 */
function updateHreflang(pagePath: string): void {
  if (typeof document === "undefined") return;

  const langs: { hreflang: string; lang: string }[] = [
    { hreflang: "en", lang: "en" },
    { hreflang: "zh-CN", lang: "zh-CN" },
    { hreflang: "zh-TW", lang: "zh-TW" },
    { hreflang: "pt", lang: "pt" },
  ];

  langs.forEach(({ hreflang, lang }) => {
    const url = `${SITE_URL}${pagePath}?lang=${lang}`;
    let el = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`) as HTMLLinkElement | null;
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", "alternate");
      el.setAttribute("hreflang", hreflang);
      document.head.appendChild(el);
    }
    el.setAttribute("href", url);
  });

  // x-default 指向无参数的干净 URL
  let defaultEl = document.querySelector('link[rel="alternate"][hreflang="x-default"]') as HTMLLinkElement | null;
  if (!defaultEl) {
    defaultEl = document.createElement("link");
    defaultEl.setAttribute("rel", "alternate");
    defaultEl.setAttribute("hreflang", "x-default");
    document.head.appendChild(defaultEl);
  }
  defaultEl.setAttribute("href", `${SITE_URL}${pagePath}`);
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

  const brand = "Lollipop AI";

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

  // pt (Português)
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
