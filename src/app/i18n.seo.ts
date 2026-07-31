/**
 * 官网 SEO 文案（title / description / keywords / Open Graph）。
 * 语言集与 i18n.tsx Locale 一致：zh-CN / zh-TW / en / pt。
 * 简中为产品原文；其余语言为翻译。
 */
/** 与 i18n.tsx 的 Locale 对齐（避免循环 import） */
type SeoLocale = "zh-TW" | "zh-CN" | "en" | "pt";

export interface SeoMessages {
  /** 浏览器标签 / og:title */
  title: string;
  /** meta description / og:description */
  description: string;
  /** meta keywords */
  keywords: string;
}

export const seoMessages: Record<SeoLocale, SeoMessages> = {
  "zh-CN": {
    title: "Lollipop AI——AI × 创作者经济 × 短视频娱乐新时代",
    description:
      "欢迎来到Lollipop AI——AI × 创作者经济 × 短视频娱乐新时代。在这里，内容不仅是表达，更是价值的延伸。Lollipop 打造新一代 AI 创作者与观众互动平台，将 AI 创作、视频内容与用户激励机制相结合，带来沉浸式的数字娱乐体验。【LunoTV1.5 AI创作工具】文生图：一键将你的创意想法生成高清精美图片。图生图：借助专属AI风格，对现有图片进行编辑和个性化定制。文生视频：只需描述剧情，即可生成专业视频或短剧。图/视频生视频：无需剪辑功底，也能制作极具视觉冲击力的爆款内容，新手也能轻松上手。所有工具操作简单、门槛极低，出片速度快，成片质感在各大社交平台都极具吸引力。【海量优质短剧随心看】数千部独家精品短剧与AI原创视频，涵盖全品类题材，满足各类喜好。",
    keywords:
      "Lollipop AI,LunoTV,AI创作,文生图,图生图,文生视频,图生视频,视频生视频,短剧,AI短视频,创作者经济,AI短剧,Lollipop",
  },
  "zh-TW": {
    title: "Lollipop AI——AI × 創作者經濟 × 短視頻娛樂新時代",
    description:
      "歡迎來到Lollipop AI——AI × 創作者經濟 × 短視頻娛樂新時代。在這裡，內容不僅是表達，更是價值的延伸。Lollipop 打造新一代 AI 創作者與觀眾互動平台，將 AI 創作、視頻內容與用戶激勵機制相結合，帶來沉浸式的數字娛樂體驗。【LunoTV1.5 AI創作工具】文生圖：一鍵將你的創意想法生成高清精美圖片。圖生圖：借助專屬AI風格，對現有圖片進行編輯和個性化定制。文生視頻：只需描述劇情，即可生成專業視頻或短劇。圖/視頻生視頻：無需剪輯功底，也能製作極具視覺衝擊力的爆款內容，新手也能輕鬆上手。所有工具操作簡單、門檻極低，出片速度快，成片質感在各大社交平台都極具吸引力。【海量優質短劇隨心看】數千部獨家精品短劇與AI原創視頻，涵蓋全品類題材，滿足各類喜好。",
    keywords:
      "Lollipop AI,LunoTV,AI創作,文生圖,圖生圖,文生視頻,圖生視頻,視頻生視頻,短劇,AI短視頻,創作者經濟,AI短劇,Lollipop",
  },
  en: {
    title: "Lollipop AI — AI × Creator Economy × A New Era of Short-Form Entertainment",
    description:
      "Welcome to Lollipop AI — AI × Creator Economy × A New Era of Short-Form Entertainment. Here, content is more than expression — it is an extension of value. Lollipop builds a next-generation platform where AI creators and audiences interact, combining AI creation, video content, and user incentives for an immersive digital entertainment experience. [LunoTV 1.5 AI Creation Tools] Text-to-Image: Turn your ideas into high-definition, polished images in one click. Image-to-Image: Edit and personalize existing images with exclusive AI styles. Text-to-Video: Describe a storyline and generate professional videos or short dramas. Image/Video-to-Video: Create visually striking viral content without editing skills — beginners welcome. All tools are simple, low-barrier, and fast to produce, with social-ready quality. [Premium Short Dramas On Demand] Thousands of exclusive premium short dramas and AI original videos across every genre — something for every taste.",
    keywords:
      "Lollipop AI,LunoTV,AI creation,text to image,image to image,text to video,image to video,video to video,short drama,AI short video,creator economy,AI short drama,Lollipop",
  },
  pt: {
    title: "Lollipop AI — IA × Economia dos Criadores × Nova Era do Entretenimento em Vídeo Curto",
    description:
      "Bem-vindo ao Lollipop AI — IA × Economia dos Criadores × Nova Era do Entretenimento em Vídeo Curto. Aqui, o conteúdo não é só expressão — é uma extensão de valor. A Lollipop cria uma plataforma de nova geração em que criadores de IA e público interagem, unindo criação com IA, conteúdo em vídeo e incentivos aos usuários para uma experiência imersiva de entretenimento digital. [Ferramentas de Criação LunoTV 1.5] Texto para Imagem: transforme ideias em imagens nítidas e refinadas com um clique. Imagem para Imagem: edite e personalize imagens existentes com estilos exclusivos de IA. Texto para Vídeo: descreva o enredo e gere vídeos ou minisséries profissionais. Imagem/Vídeo para Vídeo: crie conteúdo viral de alto impacto visual sem experiência em edição — ideal para iniciantes. Todas as ferramentas são simples, com baixa barreira e produção rápida, com qualidade pronta para as redes. [Minisséries Premium à Vontade] Milhares de minisséries exclusivas e vídeos originais com IA em todos os gêneros — algo para cada gosto.",
    keywords:
      "Lollipop AI,LunoTV,criação com IA,texto para imagem,imagem para imagem,texto para vídeo,imagem para vídeo,vídeo para vídeo,minissérie,vídeo curto com IA,economia dos criadores,drama curto com IA,Lollipop",
  },
};

/** 写入/更新 document head 中的 SEO meta（浏览器端） */
export function applySeoMeta(seo: SeoMessages): void {
  if (typeof document === "undefined") return;

  document.title = seo.title;

  setMetaByName("description", seo.description);
  setMetaByName("keywords", seo.keywords);
  setMetaByProperty("og:title", seo.title);
  setMetaByProperty("og:description", seo.description);
  setMetaByProperty("og:type", "website");
  setMetaByName("twitter:card", "summary_large_image");
  setMetaByName("twitter:title", seo.title);
  setMetaByName("twitter:description", seo.description);
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
