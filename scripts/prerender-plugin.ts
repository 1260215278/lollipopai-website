/**
 * SSG 预渲染插件 — 在 vite build 完成后为所有已知路由生成静态 HTML。
 *
 * 纯 SPA 的问题：爬虫看到空壳 <div id="root"></div>，所有运行时注入的
 * meta/Schema 对不支持 JS 的爬虫不可见。
 *
 * 本插件在 build 产物写入后，读取 dist/index.html 模板，为每个路由
 * 生成独立的 HTML 文件，注入正确的 title/description/canonical/OG/JSON-LD。
 * 爬虫直接从 HTML 源码获取 SEO 数据，无需执行 JS。
 *
 * 生成的文件路径：dist/genre/romance/index.html, dist/drama/temptation-ceo/index.html, ...
 * 服务器需配置 fallback 到 index.html（SPA 模式不变），但静态文件优先匹配。
 */
import type { Plugin } from "vite";
import { build } from "vite";
import react from "@vitejs/plugin-react";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  statSync,
  rmSync,
} from "fs";
import { join, dirname } from "path";
import { pathToFileURL } from "url";
// 预渲染需要全量正文（渲染静态 HTML 与 llms 文件），因此这里导入 blogContent；
// 客户端列表页则刻意只导入 blog.ts 的元数据，见该文件头注释。
import { allBlogPosts as dataBlogPosts } from "../src/app/data/blogContent";
import { blogFaq } from "../src/app/data/blogFaq";
// 多语言预渲染（方案 B，2026-09-01）：
// i18n.seo.ts 是纯函数模块（仅依赖 localePath），Node 端可安全 import。
// getPageSeo()            → 营销页（home/about/creating/download/contact）本地化 title/desc
// getLocalizedDynamicSeo()→ 动态页（genre/blog）本地化 title/desc
import {
  getPageSeo,
  getLocalizedDynamicSeo,
  type PageType,
  type SeoLocale,
} from "../src/app/i18n.seo";
// localePath 提供 URL 前缀映射（/zh/ /zh-TW/ /pt/ /es/ /ar/，en 无前缀）
import { buildLocalizedPath, localizedHref, stripLocalePrefix } from "../src/app/localePath";
// 多语言子集判定（方案 B）：语言版本页面中指向非子集路径的站内链接需回退英文 URL。
// 该模块只依赖 blog.ts / genres.ts 元数据，Node 端安全。
import { isMultilangSubsetPath } from "../src/app/multilangSubset";
// /guides 的三个数据模块（guides.ts / guidesContent.ts / guidesFaq.ts）已于
// 2026-09-01 整体迁入 blog 三件套，此处不再导入。若发现本文件引用它们，说明迁移漏改。

const SITE_URL = "https://www.lollipop.im";

// ── 多语言（方案 B）常量 ──
// 语言前缀段（en 无前缀，不在此列）。zh-TW 必须排在 zh 前避免前缀误匹配。
const MULTILANG_SEGMENTS = ["zh-TW", "zh", "pt", "es", "ar"] as const;
const SEG_TO_LOCALE: Record<(typeof MULTILANG_SEGMENTS)[number], SeoLocale> = {
  "zh-TW": "zh-TW",
  zh: "zh-CN",
  pt: "pt",
  es: "es",
  ar: "ar",
};
/** 完整 hreflang 互指组（en + 5 语言）—— 子集页面用 */
const ALL_SEGMENTS = ["en", ...MULTILANG_SEGMENTS] as const;
/** 阿拉伯语页面需要 <html dir="rtl"> */
const RTL_SEGMENTS = new Set(["ar"]);

/** 将 Markdown 正文转为纯文本（供 articleBody / wordCount 使用）。 */
function stripMd(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*\|.*\|\s*$/gm, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** GEO: 按文章分类生成 about（主题实体）和 mentions（提及实体），供 AI 引擎理解文章主题与关联实体 */
function buildGeoEntities(
  category: string,
  title: string,
  categoryLabel: string,
): { about: object; mentions: object[] } {
  const CATEGORY_ABOUT: Record<string, string> = {
    industry: "Artificial Intelligence in Entertainment",
    creator: "AI Content Creation",
    guide: "AI Video Production",
    workflow: "AI Drama Production Workflow",
    production: "AI Drama Production",
    distribution: "Digital Content Distribution",
  };
  const about = {
    "@type": "Thing",
    name: CATEGORY_ABOUT[category] ?? "AI Short Drama",
    description: `${categoryLabel} content from Lollipop Drama`,
  };

  const titleLower = title.toLowerCase();
  const mentions: object[] = [
    { "@type": "Thing", name: "AI Short Drama" },
    { "@type": "Thing", name: "Lollipop Drama" },
  ];
  const ENTITY_MAP: Record<string, string> = {
    "script": "Large Language Model",
    "storyboard": "AI Storyboarding",
    "video quality": "AI Video Generation",
    "4k": "4K Resolution",
    "character consistency": "Character Consistency",
    "face swap": "AI Face Swap",
    "budget": "Production Budgeting",
    "monetiz": "Content Monetization",
    "distribut": "Content Distribution",
    "multilingual": "Multilingual Localization",
    "legal": "Copyright Law",
    "copyright": "Copyright Law",
    "vertical": "Vertical Video",
    "short-form": "Short-Form Content",
    "creator economy": "Creator Economy",
    "tiktok": "TikTok",
    "reelshort": "ReelShort",
    "youtube": "YouTube Shorts",
    "app store": "App Store Optimization",
    "seo": "Search Engine Optimization",
    "marketing": "Digital Marketing",
    "ai art": "AI Image Generation",
    "voice": "AI Voice Synthesis",
    "music": "AI Music Generation",
    "subtitle": "Subtitle Localization",
    "first vertical drama": "AI Drama Production",
  };
  for (const [keyword, entity] of Object.entries(ENTITY_MAP)) {
    if (titleLower.includes(keyword)) {
      const exists = (mentions as Array<{ name: string }>).some((m) => m.name === entity);
      if (!exists) mentions.push({ "@type": "Thing", name: entity });
    }
  }
  return { about, mentions };
}

interface RouteSeoData {
  path: string;
  title: string;
  description: string;
  schema?: object;
  robots?: string;
  image?: string;
  /** <html lang> 属性值（默认 "en"） */
  lang?: string;
  /** <html dir> 属性值（仅阿拉伯语 "rtl"） */
  dir?: string;
  /**
   * hreflang 互指组（语言前缀段数组）。
   * 子集页面（多语言版）= ALL_SEGMENTS（6 语言互指）；其余页面 = ["en"]（自指 + x-default）。
   */
  hreflangLangs?: readonly string[];
  /** 海报图片 basename（构建时通过 assetMap 解析为 /assets/ 路径） */
  imageBasename?: string;
}

/** P1-3/P1-4: 剧集 slug → 海报图片 basename 映射（用于 og:image 和 VideoObject thumbnailUrl） */
const dramaPosterBasenames: Record<string, string> = {
  "temptation-ceo": "Temptation_CEO.webp",
  "the-bride-who-fell-from-the-sky": "The_bride_who_fell_from_the_sky.webp",
  "the-revenge-of-the-plus-size-wife": "The_Revenge_of_the_Plus-Size_Wife.webp",
  "my-royal-alpha-boyfriend": "My_Royal_Alpha_Boyfriend.webp",
  "dark-secrets": "b27eed6c1c08448293fe93a09e75707b.webp",
  "why-jump-off-the-building": "Why_jump_off_the_building.webp",
  "crimson-dynasty": "00_(10).webp",
  "neon-abyss": "8d3cfa78f86f48afa8907beb0548cccb.png",
  "whispered-love": "335be7f8c5134bcbb15ac57b627c0d8d.webp",
  "the-forgotten": "00_(6).webp",
  "iron-will": "00_(8).webp",
  "cloud-atlas": "e4347dc082a84ac0817906e1a68d5b36.png",
};

/**
 * 构建「SSR 渲染出的 dev 图片 basename → 生产 /assets/ 文件」映射。
 *
 * 优先用 Vite 的 .vite/manifest.json（权威映射：源码资源路径 → 打包后文件），
 * 覆盖括号/连字符/下划线文件名等 hash 剥离会失败的边界情况。manifest 缺失时
 * 退回扫描 dist/assets 目录（尽力而为）。
 */
function buildAssetMap(): Map<string, string> {
  const map = new Map<string, string>();

  // 1) 优先：Vite manifest（key = 源码相对路径，如 src/imports/banner6.png；file = assets/banner6-xxx.png）
  const manifestPath = join("dist", ".vite", "manifest.json");
  if (existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(readFileSync(manifestPath, "utf-8")) as Record<
        string,
        { file?: string; assets?: string[] }
      >;
      for (const [srcPath, val] of Object.entries(manifest)) {
        const file = val.file;
        if (!file) continue;
        if (/\.(png|jpe?g|webp|gif|svg|avif)$/i.test(srcPath)) {
          const base = srcPath.split("/").pop()!;
          // manifest 的 file 形如 assets/xxx.png，只取文件名（与目录扫描分支一致）
          const hashed = file.split("/").pop()!;
          map.set(base, hashed);
        }
      }
    } catch {
      /* manifest 解析失败则退回目录扫描 */
    }
  }

  // 2) 兜底：扫描 dist/assets 目录（处理 manifest 未覆盖的情形）
  const assetsDir = join("dist", "assets");
  if (existsSync(assetsDir)) {
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          walk(full);
          continue;
        }
        if (/\.(png|jpe?g|webp|gif|svg|avif)$/i.test(entry)) {
          const orig = entry.replace(/-[a-zA-Z0-9]{8}(\.[a-z]+)$/i, "$1");
          if (!map.has(orig)) map.set(orig, entry);
        }
      }
    };
    walk(assetsDir);
  }
  return map;
}

/**
 * 把 SSR 渲染 HTML 里所有 dev 专用的图片路径重写为生产可用的 `/assets/X-<hash>.png`。
 *
 * dev 模式 createServer 跑 SSR 时，组件内 `import x from '.../X.png'` 会被解析成
 * dev 专用 URL，常见两种形式（取决于是否有常驻 dev server）：
 *   - /@fs/C:/Users/.../src/imports/X.png
 *   - /src/imports/X.png
 * 两者在生产环境都 404 且泄露源码结构。统一按「末尾 basename → dist/assets 产物」
 * 映射重写。无映射的保留原样（不破坏）。
 */
function rewriteFsImageUrls(html: string, assetMap: Map<string, string>): string {
  // 捕获整段 dev 图片路径（兼容两种 dev 形式、允许子目录 figma/ 与括号文件名 00_(10).jpg）
  const DEV_IMG_RE = /(?:\/@fs\/[^"'\s)]*\/)?\/?(?:src\/imports\/)[^"'\s]+\.(?:png|jpe?g|webp|gif|svg|avif)/gi;
  return html.replace(DEV_IMG_RE, (full) => {
    const rawBasename = full.split("/").pop() ?? full;
    let decoded: string;
    try {
      decoded = decodeURIComponent(rawBasename);
    } catch {
      decoded = rawBasename;
    }
    const orig = decoded.replace(/-[a-zA-Z0-9]{8}(\.[a-z]+)$/i, "$1");
    // manifest 映射以原始 basename 为键；目录扫描回退以「去 hash」名为键，两者都试
    const hashed = assetMap.get(decoded) ?? assetMap.get(orig);
    return hashed ? `/assets/${hashed}` : full;
  });
}

/** 所有需要预渲染的路由 + SEO 数据 */
function getRouteData(): RouteSeoData[] {
  const routes: RouteSeoData[] = [];

  // --- 静态页面 ---
  const staticPages: RouteSeoData[] = [
    {
      path: "/",
      title: "Lollipop Drama — AI Short Drama Creation & Streaming Platform",
      description:
        "Lollipop Drama: AI-powered short drama creation and streaming platform. Create videos from text using built-in AI tools, earn 80% revenue share. 15,000+ premium dramas, 100+ countries worldwide.",
      // 首页 Product + Review Schema（SSR 静态输出，AI 爬虫不执行 JS 也能看到）
      // 全局 site-schema（Organization/WebSite/FAQPage 等）仍由 index.html 提供，两者为独立 script 标签
      schema: {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Lollipop Drama — Short Drama Platform",
        description:
          "AI-powered short drama platform with 15,000+ premium shows, AI creation tools, and 80% creator revenue share.",
        review: [
          {
            "@type": "Review",
            author: { "@type": "Person", name: "Sarah M." },
            reviewBody:
              "The AI tools are incredible. I made my first drama in a weekend and it already has 50k views. The 80% revenue share is unreal.",
          },
          {
            "@type": "Review",
            author: { "@type": "Person", name: "James K." },
            reviewBody:
              "As a creator, the revenue share is unbeatable. I earned more here in months than elsewhere in a year.",
          },
          {
            "@type": "Review",
            author: { "@type": "Person", name: "Elena R." },
            reviewBody:
              "Best short drama app I've ever used. 4K quality is amazing and the AI recommendations are spot on.",
          },
          {
            "@type": "Review",
            author: { "@type": "Person", name: "Yuki T." },
            reviewBody:
              "The variety of genres is incredible. I watch at least one drama every day during my commute.",
          },
          {
            "@type": "Review",
            author: { "@type": "Person", name: "Carlos M." },
            reviewBody:
              "The AI tools saved me weeks of production time. The face swap feature alone is worth it.",
          },
          {
            "@type": "Review",
            author: { "@type": "Person", name: "Amira H." },
            reviewBody:
              "Beautiful interface and great content. Love the Arabic subtitles and offline download feature.",
          },
          {
            "@type": "Review",
            author: { "@type": "Person", name: "Mike D." },
            reviewBody:
              "Way better than ReelShort. More original content and the AI-generated shows are actually good.",
          },
          {
            "@type": "Review",
            author: { "@type": "Person", name: "Lisa W." },
            reviewBody:
              "The creator support team is amazing. They helped me optimize my drama for maximum earnings.",
          },
        ],
      },
    },
    {
      path: "/about",
      title: "About Lollipop Drama — AI-Powered Short Drama Platform",
      description:
        "Lollipop Drama is a joint venture by Nyx Entertainment Group and Korean Cultural Investment Fund, revolutionizing short drama entertainment with built-in AI video generation tools. 1M+ users across 100+ countries.",
      schema: withBreadcrumb(
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Lollipop Drama",
          "alternateName": "Lollipop",
          "url": "https://www.lollipop.im",
          "logo": "https://www.lollipop.im/og-image.png",
          "foundingDate": "2024",
          "founder": {
            "@type": "Person",
            "name": "Nyx Entertainment Group"
          },
          "description": "Lollipop Drama is an AI-powered short drama creation and streaming platform. Built-in AI tools for text-to-video, image generation, face swap, and style transfer. 15,000+ premium dramas, 80% creator revenue share, 1M+ users across 100+ countries.",
          "slogan": "Everyone Can Create · Creation Can Be Monetized · Consumption Is an Incentive",
          "sameAs": [
            "https://twitter.com/lollipopai",
            "https://www.instagram.com/lollipopai",
            "https://www.youtube.com/@lollipopai",
            "https://www.tiktok.com/@lollipopai",
            "https://www.facebook.com/lollipopai",
            "https://play.google.com/store/apps/details?id=com.StargetVenturesLLC.hks"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "email": "business@lollipop.im",
            "telephone": "+65-8074-2120",
            "contactType": "customer service",
            "areaServed": "Worldwide"
          },
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "3 Gambas Crescent, Nordcom One",
            "addressLocality": "Singapore",
            "postalCode": "757088",
            "addressCountry": "SG"
          }
        },
        [
          { name: "Home", url: SITE_URL },
          { name: "About Lollipop Drama", url: `${SITE_URL}/about` },
        ],
      ),
    },
    {
      path: "/creating",
      title: "Create AI Short Dramas — Lollipop Drama Tools",
      description:
        "Create short dramas with Lollipop Drama tools: AI image generation, face swap, video creation, and style transfer. 80% revenue share, full AI toolkit, global distribution in 100+ countries.",
    },
    {
      path: "/download",
      title: "Download Lollipop Drama — iOS & Android",
      description:
        "Download Lollipop Drama free on iOS and Android. 15,000+ premium short dramas, 4K streaming, offline downloads, AI creation tools. 2M+ downloads, 100+ countries, 4.9-star rating.",
    },
    {
      path: "/contact",
      title: "Contact Lollipop Drama — Support & Business",
      description:
        "Contact Lollipop Drama: business@lollipop.im for partnerships, service@lollipop.im for support, +65 80742120. Address: 3 Gambas Crescent, Nordcom One, Singapore 757088.",
    },
    {
      path: "/press",
      title: "Press & Media — Lollipop Drama AI Short Drama Platform",
      description:
        "Lollipop Drama press kit: company overview, media assets, news, and press contact. AI-powered short drama platform with 1M+ users, 15,000+ dramas, 80% creator revenue share across 100+ countries.",
      schema: withBreadcrumb(
        {
          "@context": "https://schema.org",
          "@type": "MediaGallery",
          name: "Lollipop Drama Press & Media",
          description:
            "Press kit for Lollipop Drama — AI-powered short drama creation and streaming platform. Company overview, news, media assets, and press contact information.",
          url: `${SITE_URL}/press`,
          about: {
            "@type": "Organization",
            name: "Lollipop Drama",
            url: "https://www.lollipop.im",
          },
        },
        [
          { name: "Home", url: SITE_URL },
          { name: "Press & Media", url: `${SITE_URL}/press` },
        ],
      ),
    },
    {
      path: "/glossary",
      title: "Glossary — AI Short Drama & Creator Economy Terms | Lollipop Drama",
      description:
        "Complete glossary of AI short drama, creator economy, and Lollipop Drama platform terms. Definitions for text-to-video, revenue share, micro drama, vertical drama, and more.",
      schema: withBreadcrumb(
        {
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          name: "Lollipop Drama Glossary",
          description:
            "Comprehensive glossary of key terms for AI short drama, creator economy, and Lollipop Drama platform concepts.",
          url: `${SITE_URL}/glossary`,
          inLanguage: "en",
          hasDefinedTerm: [
            { "@type": "DefinedTerm", name: "AI Creation Tools", description: "Built-in AI creation tools within Lollipop Drama, featuring text-to-image, image-to-image, text-to-video, and video-to-video generation capabilities." },
            { "@type": "DefinedTerm", name: "Creator Economy", description: "An economic model where content creators earn revenue from their work. On Lollipop Drama, creators receive 80% revenue share." },
            { "@type": "DefinedTerm", name: "Short Drama", description: "Episodic video content with 1-3 minute episodes, designed for mobile viewing. Lollipop Drama hosts 15,000+ titles across 10+ genres." },
            { "@type": "DefinedTerm", name: "Text-to-Video (T2V)", description: "AI technology that converts text descriptions into video content." },
            { "@type": "DefinedTerm", name: "Revenue Share", description: "The percentage of revenue that creators receive from their content. Lollipop Drama offers 80%." },
            { "@type": "DefinedTerm", name: "Micro Drama", description: "Ultra-short-form episodic content, typically 1-3 minutes per episode, designed for mobile-first consumption." },
            { "@type": "DefinedTerm", name: "Vertical Drama", description: "Short-form video content shot in vertical (portrait) format, optimized for mobile phone viewing." },
          ],
        },
        [
          { name: "Home", url: SITE_URL },
          { name: "Glossary", url: `${SITE_URL}/glossary` },
        ],
      ),
    },
    {
      path: "/blog",
      title: "Blog — AI Short Drama & Creator Guides | Lollipop Drama",
      description:
        "Read the latest insights on AI short dramas, creator economy trends, and step-by-step guides for making your first AI-generated drama on Lollipop Drama.",
      // SSR 不执行组件内的 useEffect，列表页的 schema 必须在此给出（否则静态 HTML 里没有结构化数据）。
      // 2026-09-01：/guides 的 9 篇操作型指南已迁入，本列表项按文章类型输出 HowTo 或 Article。
      schema: withBreadcrumb(
        {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              name: "Lollipop Drama Blog",
              description:
                "Insights, tutorials, and step-by-step workflows for AI short drama creators.",
              url: `${SITE_URL}/blog`,
              inLanguage: "en",
              publisher: {
                "@type": "Organization",
                name: "Lollipop Drama",
                url: SITE_URL,
              },
              mainEntity: {
                "@type": "ItemList",
                numberOfItems: dataBlogPosts.length,
                itemListElement: dataBlogPosts.map((p, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  url: `${SITE_URL}/blog/${p.slug}`,
                  item:
                    p.steps && p.steps.length
                      ? {
                          "@type": "HowTo",
                          name: p.title,
                          description: p.excerpt,
                          totalTime: p.totalTime,
                          step: p.steps.map((s, si) => ({
                            "@type": "HowToStep",
                            position: si + 1,
                            name: s.name,
                            text: s.text,
                          })),
                        }
                      : {
                          "@type": "Article",
                          name: p.title,
                          description: p.excerpt,
                        },
                })),
              },
            },
          ],
        },
        [
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog` },
        ],
      ),
    },
    {
      path: "/login",
      title: "Sign in to Lollipop Drama — AI Short Drama & Creator Platform",
      description: "Sign in to your Lollipop Drama account to access creator tools and premium short dramas.",
      robots: "noindex, follow",
    },
    {
      path: "/forgot-password",
      title: "Forgot Password — Lollipop Drama",
      description: "Reset your Lollipop Drama account password.",
      robots: "noindex, follow",
    },
    {
      path: "/privacy",
      title: "Privacy Policy & Data Protection — Lollipop Drama",
      description:
        "Lollipop Drama Privacy Policy: Learn how we collect, use, and protect your personal information, including data types, purposes, third-party sharing, and your privacy rights.",
    },
    {
      path: "/terms",
      title: "Terms of Service — Lollipop Drama",
      description:
        "Lollipop Drama Terms of Service: Terms and conditions for using the platform, including user obligations, content policy, intellectual property, disclaimers, and dispute resolution.",
    },
  ];
  routes.push(...staticPages);

  // --- 品类页 (10 genres) ---
  const genres = [
    { slug: "romance", name: "Romance", title: "Romance Short Dramas — Watch Online | Lollipop Drama", desc: "Watch 320+ romance short dramas on Lollipop Drama. Stream the best love stories, CEO romances, and revenge dramas with AI and live-action content." },
    { slug: "revenge", name: "Revenge", title: "Revenge Short Dramas — Watch Online | Lollipop Drama", desc: "Watch 180+ revenge short dramas on Lollipop Drama. Stream thrilling payback stories, betrayal dramas, and satisfying justice series in bite-sized episodes." },
    { slug: "thriller", name: "Thriller", title: "Thriller Short Dramas — Watch Online | Lollipop Drama", desc: "Watch 150+ thriller short dramas on Lollipop Drama. Stream suspenseful mysteries, psychological thrillers, and edge-of-your-seat series in 1-3 minute episodes." },
    { slug: "ceo-drama", name: "CEO Drama", title: "CEO Drama Short Dramas — Watch Online | Lollipop Drama", desc: "Watch CEO drama short dramas on Lollipop Drama. Stream billionaire romances, corporate power struggles, and boss-employee love stories in bite-sized episodes." },
    { slug: "fantasy", name: "Fantasy", title: "Fantasy Short Dramas — Watch Online | Lollipop Drama", desc: "Watch fantasy short dramas on Lollipop Drama. Stream magical worlds, supernatural romances, and AI-generated fantasy series in bite-sized episodes." },
    { slug: "action", name: "Action", title: "Action Short Dramas — Watch Online | Lollipop Drama", desc: "Watch action short dramas on Lollipop Drama. Stream martial arts, combat, and high-octane adventure series in bite-sized episodes." },
    { slug: "horror", name: "Horror", title: "Horror Short Dramas — Watch Online | Lollipop Drama", desc: "Watch horror short dramas on Lollipop Drama. Stream scary, spooky, and atmospheric horror series in bite-sized episodes." },
    { slug: "sci-fi", name: "Sci-Fi", title: "Sci-Fi Short Dramas — Watch Online | Lollipop Drama", desc: "Watch sci-fi short dramas on Lollipop Drama. Stream science fiction, futuristic, and AI-generated series in bite-sized episodes." },
    { slug: "family", name: "Family", title: "Family Short Dramas — Watch Online | Lollipop Drama", desc: "Watch family short dramas on Lollipop Drama. Stream heartwarming family stories, parenting dramas, and relationship series in bite-sized episodes." },
    { slug: "historical", name: "Historical", title: "Historical Short Dramas — Watch Online | Lollipop Drama", desc: "Watch historical short dramas on Lollipop Drama. Stream period dramas, palace intrigues, and historical costume series in bite-sized episodes." },
  ];
  for (const g of genres) {
    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${g.name} Short Dramas`,
      description: g.desc,
      url: `${SITE_URL}/genre/${g.slug}`,
      isPartOf: { "@type": "WebSite", name: "Lollipop Drama", url: SITE_URL },
    };
    routes.push({
      path: `/genre/${g.slug}`,
      title: g.title,
      description: g.desc,
      // 方案 B：10 个 genre 页全部进入多语言子集（6 语言互指）
      hreflangLangs: ALL_SEGMENTS,
      schema: withBreadcrumb(collectionSchema, [
        { name: "Home", url: SITE_URL },
        { name: "Genres", url: SITE_URL },
        { name: `${g.name} Short Dramas`, url: `${SITE_URL}/genre/${g.slug}` },
      ]),
    });
  }

  // --- 剧集详情页 (12 dramas) ---
  const dramas = [
    { slug: "temptation-ceo", title: "Temptation CEO — Watch Free Short Drama | Lollipop Drama", desc: "Watch Temptation CEO, a binge-worthy short drama on Lollipop Drama. A powerful CEO's secret desire turns into an irresistible temptation. Stream all episodes free.", uploadDate: "2026-01-15" },
    { slug: "the-bride-who-fell-from-the-sky", title: "The Bride Who Fell From The Sky — Watch Free | Lollipop Drama", desc: "Watch The Bride Who Fell From The Sky, a romantic short drama on Lollipop Drama. A mysterious bride falls from the sky and changes everything. Stream all episodes free.", uploadDate: "2026-02-01" },
    { slug: "the-revenge-of-the-plus-size-wife", title: "The Revenge of the Plus-Size Wife — Watch Free | Lollipop Drama", desc: "Watch The Revenge of the Plus-Size Wife, a satisfying revenge short drama on Lollipop Drama. She was mocked for her size — now she's back for justice. Stream free.", uploadDate: "2026-01-20" },
    { slug: "my-royal-alpha-boyfriend", title: "My Royal Alpha Boyfriend — Watch Free | Lollipop Drama", desc: "Watch My Royal Alpha Boyfriend, a fantasy romance short drama on Lollipop Drama. A werewolf prince claims her as his mate. Stream all episodes free.", uploadDate: "2026-02-10" },
    { slug: "dark-secrets", title: "Dark Secrets — Watch Free Short Drama | Lollipop Drama", desc: "Watch Dark Secrets, a thrilling short drama on Lollipop Drama. Everyone has secrets, but some are worth killing for. Stream all episodes free.", uploadDate: "2026-01-05" },
    { slug: "why-jump-off-the-building", title: "Why Jump Off The Building — Watch Free | Lollipop Drama", desc: "Watch Why Jump Off The Building, a suspenseful short drama on Lollipop Drama. A woman's desperate jump reveals a web of betrayal. Stream all episodes free.", uploadDate: "2026-01-10" },
    { slug: "crimson-dynasty", title: "Crimson Dynasty — Watch Free Short Drama | Lollipop Drama", desc: "Watch Crimson Dynasty, a historical palace drama on Lollipop Drama. Power, passion, and betrayal in the imperial court. Stream all episodes free.", uploadDate: "2026-02-15" },
    { slug: "neon-abyss", title: "Neon Abyss — Watch Free Short Drama | Lollipop Drama", desc: "Watch Neon Abyss, a cyberpunk sci-fi short drama on Lollipop Drama. In a neon-soaked future, one woman fights to reclaim her identity. Stream free.", uploadDate: "2026-02-20" },
    { slug: "whispered-love", title: "Whispered Love — Watch Free Short Drama | Lollipop Drama", desc: "Watch Whispered Love, a heartwarming romance short drama on Lollipop Drama. Sometimes the quietest love speaks the loudest. Stream all episodes free.", uploadDate: "2026-02-25" },
    { slug: "the-forgotten", title: "The Forgotten — Watch Free Short Drama | Lollipop Drama", desc: "Watch The Forgotten, a mystery thriller short drama on Lollipop Drama. He woke up with no memory, but everyone seems to know him. Stream all episodes free.", uploadDate: "2026-03-01" },
    { slug: "iron-will", title: "Iron Will — Watch Free Short Drama | Lollipop Drama", desc: "Watch Iron Will, an action short drama on Lollipop Drama. A soldier's unbreakable will is tested in the ultimate battle for survival. Stream all episodes free.", uploadDate: "2026-03-05" },
    { slug: "cloud-atlas", title: "Cloud Atlas — Watch Free Short Drama | Lollipop Drama", desc: "Watch Cloud Atlas, a fantasy adventure short drama on Lollipop Drama. Journey across floating islands in a world above the clouds. Stream all episodes free.", uploadDate: "2026-03-10" },
  ];
  for (const d of dramas) {
    const posterBasename = dramaPosterBasenames[d.slug];
    const videoSchema = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: d.title.split(" — ")[0],
      description: d.desc,
      uploadDate: d.uploadDate,
      // P1-4: thumbnailUrl 使用剧集专属海报（构建时通过 assetMap 解析）
      // 会在下方 resolveRouteImages() 中被替换为 /assets/xxx-hash.jpg
      thumbnailUrl: posterBasename ? `__ASSET:${posterBasename}__` : `${SITE_URL}/og-image.png`,
      // P1-4: duration 为平均单集时长（所有剧均为 2 分钟/集）
      duration: "PT2M",
      // P1-4: regionsAllowed 声明可观看地区
      regionsAllowed: ["US", "GB", "CA", "AU", "SG", "MY", "PH", "ID", "JP", "KR", "BR", "IN", "DE", "FR"],
      // contentUrl/embedUrl removed — no web player available; pointing to
      // the page URL would violate Google's VideoObject spec (requires
      // actual video file URL / embeddable player). App store link is
      // already on the page as a CTA button.
      // aggregateRating removed — platform has no user review system yet;
      // using views as ratingCount violates Google's review snippet spam
      // policy and risks manual action penalty.
    };
    routes.push({
      path: `/drama/${d.slug}`,
      title: d.title,
      description: d.desc,
      imageBasename: posterBasename,
      schema: withBreadcrumb(videoSchema, [
        { name: "Home", url: SITE_URL },
        { name: "Drama", url: SITE_URL },
        { name: d.title.split(" — ")[0], url: `${SITE_URL}/drama/${d.slug}` },
      ]),
    });
  }

  // --- 博客文章 (单一数据源：src/app/data/blog.ts，避免 slug 漂移) ---
  for (const p of dataBlogPosts) {
    // 预渲染只生成英文路径（/blog/${slug}），articleBody 须与英文 headline 一致：
    // 用英文正文 p.content，而非中文 p.contentZh（否则英文页面的 Article schema 正文是中文，语义错乱）。
    const plainEn = stripMd(p.content);
    // 2026-09-01 起 9 篇操作型指南由 /guides 迁入，带真实 steps。
    // 有 steps 的文章用 TechArticle（Article 子类型，可承载 proficiencyLevel）。
    const hasSteps = Boolean(p.steps && p.steps.length);
    const geoEntities = buildGeoEntities(p.category, p.title, p.categoryLabel);
    const articleSchema = {
      "@type": hasSteps ? "TechArticle" : "Article",
      headline: p.title,
      description: p.seoDescription,
      datePublished: p.publishDate,
      dateModified: p.updateDate,
      ...(hasSteps && p.difficulty ? { proficiencyLevel: p.difficulty } : {}),
      author: {
        "@type": "Person",
        name: p.author,
        jobTitle: p.authorRole,
        description: p.authorBio,
        worksFor: { "@type": "Organization", name: "Lollipop Drama", url: SITE_URL },
        sameAs: [`${SITE_URL}/about`],
      },
      publisher: {
        "@type": "Organization",
        name: "Lollipop Drama",
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/src/imports/logo.webp` },
      },
      image: {
        "@type": "ImageObject",
        url: `${SITE_URL}${p.coverImage || "/blog-images/guide.png"}`,
      },
      thumbnailUrl: `${SITE_URL}${p.coverImage || "/blog-images/guide.png"}`,
      keywords: `${p.categoryLabel}, AI short drama, Lollipop Drama, ${p.title}`,
      // articleBody 放 keyTakeaways + 更长的英文摘要（1500 字符），利于 GEO/AEO 引擎理解文章主题
      articleBody: (p.keyTakeaways ? "Key Takeaways: " + p.keyTakeaways.join(" ") + " " : "") + plainEn.slice(0, 1500),
      // 英文按空格分词计数（原 replace(/\s/g,"").length 对英文算的是去空格字符数，语义错误）
      wordCount: p.content.split(/\s+/).filter(Boolean).length,
      encodingFormat: "text/html",
      inLanguage: "en",
      isPartOf: { "@type": "Blog", name: "Lollipop Drama Blog", url: `${SITE_URL}/blog` },
      about: geoEntities.about,
      mentions: geoEntities.mentions,
      accessMode: ["textual", "visual"],
      accessibilitySummary: "Text-based article with images. Screen reader compatible.",
      license: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
      ...(hasSteps ? { teaches: [p.categoryLabel] } : {}),
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", ".key-takeaways li", ".faq p"],
      },
    };

    // HowTo Schema（GEO 核心）
    // 只有文章自带 steps 时才输出 HowTo —— 共 12 篇（迁入的 9 篇 + 2026-09-01 补步骤的 3 篇）。
    // 步骤与页面可见的「步骤概览」区块同源，满足「结构化数据 = 可见文本」硬要求。
    //
    // ⚠️ 2026-09-01 移除了原先 `category === "guide"` 的硬编码通用模板分支：
    //    那份模板对多篇共用同一步骤且页面上不可见，违反 Google 结构化数据规范。
    //    对比 / 盘点 / 风险清单型文章本就没有有序步骤，输出 Article 即可。
    const howToSchema = hasSteps
      ? {
          "@type": "HowTo",
          name: p.title,
          description: p.seoDescription,
          step: p.steps!.map((s, i) => ({
            "@type": "HowToStep",
            position: i + 1,
            name: s.name,
            text: s.text,
            url: `${SITE_URL}/blog/${p.slug}#step-${i + 1}`,
          })),
          totalTime: p.totalTime,
          estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
          supply: [{ "@type": "HowToSupply", name: "Lollipop Drama" }],
          tool: [{ "@type": "HowToTool", name: "Lollipop Drama" }],
          author: {
            "@type": "Person",
            name: p.author,
            jobTitle: p.authorRole,
            description: p.authorBio,
            worksFor: { "@type": "Organization", name: "Lollipop Drama", url: SITE_URL },
            sameAs: [`${SITE_URL}/about`],
          },
          publisher: { "@type": "Organization", name: "Lollipop Drama", url: SITE_URL },
          datePublished: p.publishDate,
          dateModified: p.updateDate,
          inLanguage: "en",
          isPartOf: { "@type": "Blog", name: "Lollipop Drama Blog", url: `${SITE_URL}/blog` },
          mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${p.slug}` },
        }
      : null;

    // GEO: FAQPage Schema（与详情页可见 FAQ 对应；blogFaq 按 slug 提供，独立于 blog.ts）
    // ⚠️ 预渲染只生成英文路径，FAQ 必须取 *En 字段，否则英文页面输出中文问答，语义错乱。
    const faqItems = blogFaq[p.slug] ?? [];
    const faqSchema = faqItems.length
      ? {
          "@type": "FAQPage",
          mainEntity: faqItems.map((f) => ({
            "@type": "Question",
            name: f.questionEn ?? f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answerEn ?? f.answer },
          })),
        }
      : null;

    const graphItems = [articleSchema];
    if (howToSchema) graphItems.push(howToSchema);
    if (faqSchema) graphItems.push(faqSchema);

    routes.push({
      path: `/blog/${p.slug}`,
      title: p.seoTitle,
      description: p.seoDescription,
      image: `${SITE_URL}${p.coverImage || "/blog-images/guide.png"}`,
      // 所有有中文标题的文章都进入多语言子集（6 语言互指）。
      hreflangLangs: ALL_SEGMENTS,
      schema: withBreadcrumb(
        graphItems.length > 1
          ? { "@context": "https://schema.org", "@graph": graphItems }
          : { "@context": "https://schema.org", ...articleSchema },
        [
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog` },
          { name: p.title, url: `${SITE_URL}/blog/${p.slug}` },
        ],
      ),
    });
  }

  // --- 区域落地页 (8 regions) ---
  const regions = [
    { code: "us", country: "United States", title: "Best Short Drama Platform in USA | Watch AI Series — Lollipop", desc: "Watch the best short dramas in the USA on Lollipop Drama. Stream 15,000+ AI and live-action series. 80% creator revenue share. Download free on iOS & Android." },
    { code: "uk", country: "United Kingdom", title: "Best Short Drama Platform in UK | Watch AI Series — Lollipop", desc: "Watch the best short dramas in the UK on Lollipop Drama. Stream 15,000+ AI and live-action series with English subtitles. Download free on iOS & Android." },
    { code: "ca", country: "Canada", title: "Best Short Drama Platform in Canada | Watch AI Series", desc: "Watch the best short dramas in Canada on Lollipop Drama. Stream 15,000+ AI and live-action series. Available in English and French. Download free on iOS & Android." },
    { code: "au", country: "Australia", title: "Best Short Drama Platform in Australia | Watch AI Series", desc: "Watch the best short dramas in Australia on Lollipop Drama. Stream 15,000+ AI and live-action series. Download free on iOS & Android. 4K streaming available." },
    { code: "sg", country: "Singapore", title: "Best Short Drama Platform in Singapore | Watch AI Series", desc: "Watch the best short dramas in Singapore on Lollipop Drama. Stream 15,000+ AI and live-action series. Local payment methods supported. Download free on iOS & Android." },
    { code: "my", country: "Malaysia", title: "Best Short Drama Platform in Malaysia | Watch AI Series", desc: "Watch the best short dramas in Malaysia on Lollipop Drama. Stream 15,000+ AI and live-action series with multilingual subtitles. Local payment supported." },
    { code: "ph", country: "Philippines", title: "Best Short Drama Platform in Philippines | Watch AI Series", desc: "Watch the best short dramas in the Philippines on Lollipop Drama. Stream 15,000+ AI and live-action series. GCash and local payment supported. Download free." },
    { code: "id", country: "Indonesia", title: "Best Short Drama Platform in Indonesia | Watch AI Series", desc: "Watch the best short dramas in Indonesia on Lollipop Drama. Stream 15,000+ AI and live-action series. GoPay and local payment supported. Download free on iOS & Android." },
  ];
  for (const r of regions) {
    const regionSchema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: r.title,
      description: r.desc,
      url: `${SITE_URL}/region/${r.code}`,
    };
    routes.push({
      path: `/region/${r.code}`,
      title: r.title,
      description: r.desc,
      schema: withBreadcrumb(regionSchema, [
        { name: "Home", url: SITE_URL },
        { name: "Regions", url: SITE_URL },
        { name: `Short Dramas in ${r.country}`, url: `${SITE_URL}/region/${r.code}` },
      ]),
    });
  }

  // ── 方案 B：多语言预渲染（2026-09-01）──
  // 1) 给营销页（首页/about/creating/download/contact）与 /blog 列表标记 6 语言互指组
  //    （genre 10 页与 12 篇 HowTo 已在各自循环里标记）
  const MULTILANG_APP_PATHS = new Set(["/", "/about", "/creating", "/download", "/contact", "/blog"]);
  for (const r of routes) {
    if (MULTILANG_APP_PATHS.has(r.path)) {
      r.hreflangLangs = ALL_SEGMENTS;
    }
  }
  // 2) 为所有「已标记 6 语言互指」的路由生成 5 个语言版本（zh/zh-TW/pt/es/ar）
  appendMultilangVariants(routes);

  return routes;
}

/**
 * 方案 B：为多语言子集路由生成语言版本（× zh/zh-TW/pt/es/ar）。
 *
 * 触发条件：route.hreflangLangs === ALL_SEGMENTS（已在构建英文路由时标记）。
 * 每个语言版本：
 *  - path  = buildLocalizedPath(locale, appPath)（如 /zh/about、/zh/blog/xxx）
 *  - lang  = 对应 SeoLocale；ar 版本补 dir="rtl"
 *  - title/description 本地化：
 *      营销页 → getPageSeo(pageType, locale)
 *      动态页 → getLocalizedDynamicSeo(英文 title/desc, locale, "genre"|"blog", name)
 *  - schema 本地化：blog 详情（12 篇 HowTo）→ 中文版用 titleZh/stepsZh/中文 FAQ，
 *    pt/es/ar 版正文与 schema 均为英文（正文尚未翻译，页面壳本地化，属已知妥协）；
 *    genre/列表 → 简化 CollectionPage（inLanguage 本地化）
 *  - hreflangLangs = ALL_SEGMENTS（与英文版互指一致）
 */
function appendMultilangVariants(routes: RouteSeoData[]): void {
  const variants: RouteSeoData[] = [];

  // 营销页路径 → i18n.seo 的 PageType（用于 getPageSeo）
  const pageTypeByPath: Record<string, PageType> = {
    "/": "home",
    "/about": "about",
    "/creating": "creating",
    "/download": "download",
    "/contact": "contact",
  };

  // 预索引 blog 元数据（titleZh / stepsZh / FAQ 本地化需要）
  const blogByPath = new Map(dataBlogPosts.map((p) => [`/blog/${p.slug}`, p]));
  // genre 名称索引（getLocalizedDynamicSeo 的 name 参数用品类英文名）
  const GENRE_NAMES: Record<string, string> = {
    romance: "Romance",
    revenge: "Revenge",
    thriller: "Thriller",
    "ceo-drama": "CEO Drama",
    fantasy: "Fantasy",
    action: "Action",
    horror: "Horror",
    "sci-fi": "Sci-Fi",
    family: "Family",
    historical: "Historical",
  };

  for (const base of routes) {
    if (base.hreflangLangs !== ALL_SEGMENTS) continue;
    const appPath = base.path;
    const pageType = pageTypeByPath[appPath];
    const isGenre = appPath.startsWith("/genre/");
    const isBlogDetail = appPath.startsWith("/blog/") && appPath !== "/blog";

    for (const seg of MULTILANG_SEGMENTS) {
      const locale = SEG_TO_LOCALE[seg];
      const localizedPath = buildLocalizedPath(locale, appPath);

      // ── 本地化 title / description ──
      const zh = seg === "zh" || seg === "zh-TW";
      let title = base.title;
      let description = base.description;
      if (pageType) {
        const seo = getPageSeo(pageType, locale);
        title = seo.title;
        description = seo.description;
      } else if (isGenre) {
        const slug = appPath.split("/").pop()!;
        const seo = getLocalizedDynamicSeo(
          base.title,
          base.description,
          locale,
          "genre",
          GENRE_NAMES[slug] ?? slug,
        );
        title = seo.title;
        description = seo.description;
      } else if (isBlogDetail) {
        const p = blogByPath.get(appPath);
        // 中文版用 titleZh / excerptZh 做 name，避免标题英文+品牌中文的混合语言页
        const localizedName = zh ? (p?.titleZh ?? p?.title ?? base.title) : (p?.title ?? base.title);
        const seo = getLocalizedDynamicSeo(
          base.title,
          base.description,
          locale,
          "blog",
          localizedName,
        );
        title = seo.title;
        // 中文有 excerptZh 时直接用它做 description（比模板拼装更自然）
        if (zh && p?.excerptZh) {
          description = p.excerptZh;
        }
      }

      // ── 本地化 schema ──
      let schema: object | undefined;
      if (isBlogDetail) {
        schema = buildLocalizedBlogSchema(appPath, locale, zh);
      } else if (isGenre) {
        schema = {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: title,
          description,
          url: `${SITE_URL}${localizedPath}`,
          inLanguage: locale,
          isPartOf: { "@type": "WebSite", name: "Lollipop Drama", url: SITE_URL },
        };
      } else if (appPath === "/blog") {
        schema = {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: title,
          description,
          url: `${SITE_URL}${localizedPath}`,
          inLanguage: locale,
          publisher: { "@type": "Organization", name: "Lollipop Drama", url: SITE_URL },
        };
      }
      // 营销页不重复注入 schema（首页 site-schema 为全局；about 等英文版也无 page-schema）

      variants.push({
        path: localizedPath,
        title,
        description,
        image: base.image,
        schema,
        lang: locale,
        dir: RTL_SEGMENTS.has(seg) ? "rtl" : undefined,
        hreflangLangs: ALL_SEGMENTS,
      });
    }
  }

  routes.push(...variants);
}

/**
 * 语言版本 blog 详情页的本地化 schema。
 * 中文版（zh/zh-TW）：headline=titleZh、HowTo 步骤=stepsZh、FAQ=中文 question/answer、inLanguage=zh。
 * pt/es/ar 版：正文与 schema 均为英文（正文翻译到位后此处应改为对应语言字段）。
 */
function buildLocalizedBlogSchema(
  appPath: string,
  locale: SeoLocale,
  zh: boolean,
): object | undefined {
  const p = dataBlogPosts.find((x) => `/blog/${x.slug}` === appPath);
  if (!p) return undefined;
  const hasSteps = Boolean(p.steps && p.steps.length);

  const geoEntities = buildGeoEntities(p.category, zh ? p.titleZh : p.title, p.categoryLabel);
  const articleSchema = {
    "@type": hasSteps ? "TechArticle" : "Article",
    headline: zh ? p.titleZh : p.title,
    description: zh ? (p.excerptZh ?? p.titleZh) : p.seoDescription,
    datePublished: p.publishDate,
    dateModified: p.updateDate,
    ...(hasSteps && p.difficulty ? { proficiencyLevel: p.difficulty } : {}),
    author: {
      "@type": "Person",
      name: p.author,
      jobTitle: p.authorRole,
      description: p.authorBio,
      worksFor: { "@type": "Organization", name: "Lollipop Drama", url: SITE_URL },
      sameAs: [`${SITE_URL}/about`],
    },
    publisher: { "@type": "Organization", name: "Lollipop Drama", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/src/imports/logo.webp` } },
    image: { "@type": "ImageObject", url: `${SITE_URL}${p.coverImage || "/blog-images/guide.png"}` },
    thumbnailUrl: `${SITE_URL}${p.coverImage || "/blog-images/guide.png"}`,
    keywords: `${p.categoryLabel}, AI short drama, Lollipop Drama, ${zh ? p.titleZh : p.title}`,
    inLanguage: zh ? "zh" : locale,
    isPartOf: { "@type": "Blog", name: "Lollipop Drama Blog", url: `${SITE_URL}/blog` },
    about: geoEntities.about,
    mentions: geoEntities.mentions,
    accessMode: ["textual", "visual"],
    accessibilitySummary: "Text-based article with images. Screen reader compatible.",
    license: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    ...(hasSteps ? { teaches: [p.categoryLabel] } : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${appPath}` },
    ...(zh && p.keyTakeawaysZh ? { articleBody: "关键要点: " + p.keyTakeawaysZh.join(" ") } : {}),
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".key-takeaways li", ".faq p"] },
  };

  const howToSchema = hasSteps
    ? {
        "@type": "HowTo",
        name: zh ? p.titleZh : p.title,
        description: zh ? (p.excerptZh ?? p.titleZh) : p.seoDescription,
        step: (zh ? p.stepsZh : p.steps)!.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.name,
          text: s.text,
          url: `${SITE_URL}${appPath}#step-${i + 1}`,
        })),
        totalTime: p.totalTime,
        author: {
          "@type": "Person",
          name: p.author,
          jobTitle: p.authorRole,
          description: p.authorBio,
          worksFor: { "@type": "Organization", name: "Lollipop Drama", url: SITE_URL },
          sameAs: [`${SITE_URL}/about`],
        },
        inLanguage: zh ? "zh" : locale,
        isPartOf: { "@type": "Blog", name: "Lollipop Drama Blog", url: `${SITE_URL}/blog` },
        mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${appPath}` },
      }
    : null;

  const faqItems = blogFaq[p.slug] ?? [];
  const faqSchema = faqItems.length
    ? {
        "@type": "FAQPage",
        mainEntity: faqItems.map((f) => ({
          "@type": "Question",
          name: zh ? f.question : (f.questionEn ?? f.question),
          acceptedAnswer: { "@type": "Answer", text: zh ? f.answer : (f.answerEn ?? f.answer) },
        })),
      }
    : null;

  const graphItems: object[] = [articleSchema];
  if (howToSchema) graphItems.push(howToSchema);
  if (faqSchema) graphItems.push(faqSchema);

  return graphItems.length > 1
    ? { "@context": "https://schema.org", "@graph": graphItems }
    : { "@context": "https://schema.org", ...articleSchema };
}

/**
 * 调整子目录 HTML 文件的相对资源路径。
 *
 * base: './' 时，模板 HTML 中是 ./assets/xxx.js。
 * 根目录 dist/index.html 没问题，但 dist/genre/romance/index.html
 * 中 ./assets/ 会解析成 /genre/romance/assets/ — 错误。
 *
 * 此函数按路由深度把 ./assets/ 替换成 ../../assets/ 等。
 */
function adjustAssetPaths(html: string, routePath: string): string {
  const depth = routePath.split("/").filter(Boolean).length;
  if (depth === 0) return html; // 根路径，无需调整
  const relativePrefix = "../".repeat(depth);
  // 替换 ./assets/ → ../../assets/（按深度）
  return html.replace(/\.\/assets\//g, `${relativePrefix}assets/`);
}

/**
 * 方案 B 静态产物兜底（2026-09-01）：
 * 语言版本页面（/zh/ /zh-TW/ /pt/ /es/ /ar/）里，UI 通过 Router basename 自动把
 * <Link to="/blog/x"> 渲染成 href="/ar/blog/x"。若目标路径不在多语言子集
 * （没有语言版本产物，见 isMultilangSubsetPath），则改写为英文 URL（去掉前缀），
 * 避免产物层面出现死链（check-dist-links.py 校验）。
 *
 * 只处理相对 href（站内 <a>）；hreflang / canonical / schema 均为绝对 URL，
 * 不会被 href="/ 匹配到；/assets/ 静态资源无语言前缀，天然不受影响。
 * 运行时行为由 MultilangSubsetGuard（client + SSR）保证一致。
 */
function rewriteNonSubsetLinks(html: string, routePath: string): string {
  const segMatch = routePath.match(/^\/(zh-TW|zh|pt|es|ar)(?:\/|$)/);
  if (!segMatch) return html;
  const seg = segMatch[1];
  return html.replace(
    new RegExp(`href="/${seg}/([^"#?]+)([^"]*)"`, "g"),
    (whole: string, appPart: string, suffix: string) => {
      const target = `/${appPart}`;
      if (!isMultilangSubsetPath(target)) {
        return `href="${target}${suffix}"`;
      }
      return whole;
    },
  );
}

/**
 * 注入每路由 SEO 前，先剥离模板（index.html）里会被覆盖的标签，避免重复。
 * 保留 id="site-schema" 的全局结构化数据（Organization/MobileApplication/
 * WebSite/FAQPage/Breadcrumb），只对每路由专属标签去重。
 */
function stripSeoMeta(html: string): string {
  let out = html;
  // 通用 name meta（description/robots/author）
  out = out.replace(/<meta\s+name="(description|robots|author)"[^>]*>/gi, "");
  // Open Graph / Twitter Card
  out = out.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, "");
  out = out.replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, "");
  // canonical
  out = out.replace(/<link\s+rel="canonical"[^>]*>/gi, "");
  // hreflang alternates
  out = out.replace(/<link\s+rel="alternate"[^>]*>/gi, "");
  // 上一轮插件注入的 page-schema（不碰 site-schema）
  out = out.replace(
    /<script type="application\/ld\+json" id="page-schema">[\s\S]*?<\/script>/gi,
    "",
  );
  return out;
}

/** 给某页 Schema 追加 BreadcrumbList（与现有 schema 合并为 @graph）。 */
function withBreadcrumb(schema: object, items: { name: string; url: string }[]): object {
  const bl = {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
  const base = schema as Record<string, unknown>;
  if (Array.isArray(base["@graph"])) {
    return { "@context": "https://schema.org", "@graph": [...(base["@graph"] as object[]), bl] };
  }
  return { "@context": "https://schema.org", "@graph": [schema, bl] };
}

/**
 * 生成 llms.txt 与 llms-full.txt（GEO — Generative Engine Optimization 核心）。
 *
 * llms.txt（llmstxt.org 规范）让 ChatGPT / Claude / Perplexity / Gemini 等
 * AI 引擎在抓取站点时能结构化理解内容架构、核心页面与博客目录，
 * 显著提升站点在 AI 生成式回答中被引用的概率。
 *
 * 数据源复用 getRouteData() 的路由 + dataBlogPosts / blogFaq（单一数据源），
 * 博客新增时无需手动同步（对比 sitemap.xml 的手动维护痛点，避免漏收录）。
 */
function generateLlmsFiles(routes: RouteSeoData[]): void {
  const S = SITE_URL;
  const cleanTitle = (t: string) => t.split(" — ")[0].split(" | ")[0].trim();

  // 方案 B：routes 现在包含多语言变体（/zh/genre/xxx 等）。
  // llms.txt 只列英文规范 URL（AI 引擎抓取入口），过滤掉带语言前缀的路由。
  const LANG_SEGS = new Set(["zh", "zh-TW", "pt", "es", "ar"]);
  const isEn = (p: string) => !LANG_SEGS.has(p.split("/")[1] ?? "");

  const genreRoutes = routes.filter((r) => r.path.startsWith("/genre/") && isEn(r.path));
  const dramaRoutes = routes.filter((r) => r.path.startsWith("/drama/") && isEn(r.path));
  const regionRoutes = routes.filter((r) => r.path.startsWith("/region/") && isEn(r.path));

  const corePages: { name: string; path: string; desc: string }[] = [
    { name: "Home", path: "/", desc: "Overview of the AI short drama platform" },
    { name: "AI Creator Tools", path: "/creating", desc: "text-to-video, image-to-video, face swap, style transfer" },
    { name: "Download App", path: "/download", desc: "iOS & Android" },
    { name: "About", path: "/about", desc: "Company background and mission" },
    // /guides 已于 2026-09-01 迁入 /blog 的「操作指南」分类，不再作为独立核心页
    { name: "Blog", path: "/blog", desc: "AI drama insights, tutorials, and step-by-step HowTo workflows" },
    { name: "Contact", path: "/contact", desc: "Business partnerships and support" },
  ];

  const coreFaq: { q: string; a: string }[] = [
    { q: "What is Lollipop Drama?", a: "A next-generation global content ecosystem platform offering premium short-drama consumption and creator content subscription services. Built on the belief that everyone can create, creation can be monetized, and consumption is an incentive, Lollipop Drama is committed to becoming 'the OnlyFans of the AI era'." },
    { q: "Is Lollipop Drama free to download?", a: "Yes. Free on App Store and Google Play; premium dramas and advanced AI features via optional in-app purchases." },
    { q: "How do creators make money on Lollipop Drama?", a: "80% revenue share (industry-highest) from ads, premium subscriptions, tips, and brand sponsorships." },
    { q: "What AI tools does Lollipop Drama offer?", a: "Four core built-in AI creation tools: text-to-image, image-to-image, text-to-video, and image/video-to-video, supporting 4K output." },
    { q: "Which devices and countries support Lollipop Drama?", a: "iOS and Android in 100+ countries, with multilingual subtitles, 4K streaming, and offline downloads." },
    { q: "Can I watch short dramas offline?", a: "Yes. Lollipop Drama supports offline downloads on both iOS and Android for watching anywhere without an internet connection." },
    { q: "How many episodes does each short drama have?", a: "Most short dramas have 20-100 episodes, each lasting 1-3 minutes. New episodes are released daily." },
    { q: "What video quality does Lollipop Drama support?", a: "Up to 4K Ultra HD streaming with automatic quality adjustment based on network speed." },
    { q: "Is my personal data safe on Lollipop Drama?", a: "Yes. We follow strict data protection protocols in compliance with international privacy standards and never sell user data to third parties." },
    { q: "Can I cancel my subscription anytime?", a: "Yes. Subscriptions can be cancelled anytime through App Store or Google Play settings, with access continuing until the end of the billing period." },
    { q: "How long does it take to create an AI short drama?", a: "With Lollipop Drama's AI tools, you can create a complete short drama episode in under an hour, no editing experience required." },
    { q: "Do I need editing experience to use AI creation tools?", a: "No. The built-in AI toolkit provides guided workflows for text-to-image, image-to-video, and style transfer, designed for beginners." },
    { q: "What languages are supported on Lollipop Drama?", a: "English, Chinese (Simplified and Traditional), Portuguese, Spanish, and Arabic subtitles and app interface, with more languages being added." },
    { q: "How do creators withdraw their earnings?", a: "Multiple payment methods including bank transfer, PayPal, and regional payment platforms. The 80% revenue share covers ad revenue, subscriptions, tips, and sponsorships." },
    { q: "Can I share my AI-created dramas on social media?", a: "Yes. Creators retain full rights to their AI-generated content and can share it on social media, subject to community guidelines and copyright laws." },
  ];

  const contactLines = [
    "## Contact",
    "- Business: business@lollipop.im",
    "- Support: service@lollipop.im",
    "- Phone: +65 80742120",
    "- Address: 3 Gambas Crescent, Nordcom One, Singapore 757088",
  ];

  // ── llms.txt（精简版：供 AI 引擎快速理解站点骨架）──
  const lines: string[] = [];
  lines.push("# Lollipop Drama");
  lines.push("");
  lines.push("> Lollipop Drama is a next-generation global content ecosystem platform offering premium short-drama consumption and creator content subscription services — everyone can create, creation can be monetized, and consumption is an incentive. Lollipop Drama is committed to becoming 'the OnlyFans of the AI era', monetizing AI premium series and AI influencers.");
  lines.push("");
  lines.push("## Core Pages");
  for (const c of corePages) lines.push(`- [${c.name}](${S}${c.path}): ${c.desc}`);
  lines.push("");
  lines.push("## Genres");
  for (const g of genreRoutes) lines.push(`- [${cleanTitle(g.title)}](${S}${g.path})`);
  lines.push("");
  lines.push("## Short Dramas");
  for (const d of dramaRoutes) lines.push(`- [${cleanTitle(d.title)}](${S}${d.path})`);
  lines.push("");
  lines.push("## Regions");
  for (const r of regionRoutes) lines.push(`- [${cleanTitle(r.title)}](${S}${r.path})`);
  lines.push("");
  // Blog 区块同时承载常规文章与操作型 HowTo 指南（/guides 已迁入）。
  // 带步骤的文章额外标注 [HowTo: N steps, 时长, 难度]，
  // 让 AI 引擎在一行之内就能判断这篇是可直接引用的操作性内容。
  lines.push("## Blog (includes HowTo guides)");
  for (const p of dataBlogPosts) {
    const howto =
      p.steps && p.steps.length
        ? ` [HowTo: ${p.steps.length} steps, ${p.totalTime}, ${p.difficulty}]`
        : "";
    lines.push(`- [${p.title}](${S}/blog/${p.slug}): ${p.excerpt}${howto}`);
  }
  lines.push("");
  lines.push("## FAQ");
  for (const f of coreFaq) {
    lines.push(`### ${f.q}`);
    lines.push(f.a);
    lines.push("");
  }
  lines.push(...contactLines);

  const llmsTxt = lines.join("\n") + "\n";

  // ── llms-full.txt（完整版：博客含作者/日期/分类 + 每篇博客 FAQ）──
  const full: string[] = [];
  full.push("# Lollipop Drama — Full Content Index");
  full.push("");
  full.push("> Lollipop Drama is a next-generation global content ecosystem platform for premium short-drama consumption and creator content subscriptions. This file is a comprehensive index for AI engines to understand and cite our content.");
  full.push("");
  full.push("## Core Pages");
  for (const c of corePages) full.push(`- [${c.name}](${S}${c.path}): ${c.desc}`);
  full.push("");
  full.push("## Genres");
  for (const g of genreRoutes) full.push(`- [${cleanTitle(g.title)}](${S}${g.path}): ${g.description}`);
  full.push("");
  full.push("## Short Dramas");
  for (const d of dramaRoutes) full.push(`- [${cleanTitle(d.title)}](${S}${d.path}): ${d.description}`);
  full.push("");
  full.push("## Regions");
  for (const r of regionRoutes) full.push(`- [${cleanTitle(r.title)}](${S}${r.path}): ${r.description}`);
  full.push("");
  // /guides 已迁入：操作型指南在此处输出完整步骤，供 AI 引擎直接引用
  full.push("## Blog Articles (includes HowTo guides)");
  for (const p of dataBlogPosts) {
    const hasSteps = Boolean(p.steps && p.steps.length);
    full.push(`### ${p.title}`);
    full.push(`- URL: ${S}/blog/${p.slug}`);
    full.push(`- Category: ${p.categoryLabel}`);
    full.push(`- Author: ${p.author} (${p.authorRole})`);
    full.push(`- Published: ${p.publishDate} | Updated: ${p.updateDate}`);
    if (hasSteps) full.push(`- Total time: ${p.totalTime} | Difficulty: ${p.difficulty}`);
    full.push(`- Summary: ${p.excerpt}`);
    if (hasSteps) {
      full.push("- Steps:");
      for (const [i, s] of p.steps!.entries()) {
        full.push(`  ${i + 1}. ${s.name}: ${s.text}`);
      }
    }
    const faqs = blogFaq[p.slug] ?? [];
    if (faqs.length) {
      full.push("- FAQ:");
      for (const f of faqs) {
        full.push(`  - Q: ${f.questionEn ?? f.question}`);
        full.push(`    A: ${f.answerEn ?? f.answer}`);
      }
    }
    full.push("");
  }
  full.push(...contactLines);

  const llmsFullTxt = full.join("\n") + "\n";

  // 写入 dist/（vite 已复制 public/，此处覆盖为动态最新版）
  try {
    writeFileSync(join("dist", "llms.txt"), llmsTxt, "utf-8");
    writeFileSync(join("dist", "llms-full.txt"), llmsFullTxt, "utf-8");
    console.log(`[prerender] Generated llms.txt (${llmsTxt.length} chars) + llms-full.txt (${llmsFullTxt.length} chars)`);
  } catch (e) {
    console.warn("[prerender] llms.txt generation failed:", e instanceof Error ? e.message : String(e));
  }
}

/**
 * 将 SEO 数据注入 HTML 模板，生成静态 HTML。
 * 策略：替换 <title>、插入/更新 <meta>、插入 canonical、OG tags、JSON-LD。
 */
function injectSeoIntoHtml(html: string, data: RouteSeoData): string {
  let result = stripSeoMeta(html);

  // 更新 <html lang>（默认 "en"）；阿拉伯语版本补 dir="rtl"
  const lang = data.lang ?? "en";
  const dirAttr = data.dir ? ` dir="${data.dir}"` : "";
  result = result.replace(/<html\s+lang="[^"]*"/i, `<html lang="${lang}"${dirAttr}`);

  // 1. 替换 <title>
  result = result.replace(/<title>.*?<\/title>/i, `<title>${data.title}</title>`);

  // 2. 构建注入的 meta 标签
  const canonicalUrl = `${SITE_URL}${data.path}`;
  const metaTags: string[] = [
    `<meta name="description" content="${data.description}" />`,
    `<meta name="robots" content="${data.robots ?? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Lollipop Drama" />`,
    `<meta property="og:title" content="${data.title}" />`,
    `<meta property="og:description" content="${data.description}" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    `<meta property="og:image" content="${data.image ?? `${SITE_URL}/og-image.png`}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${data.title}" />`,
    `<meta name="twitter:description" content="${data.description}" />`,
    `<meta name="twitter:image" content="${data.image ?? `${SITE_URL}/og-image.png`}" />`,
    `<link rel="canonical" href="${canonicalUrl}" />`,
  ];

  // hreflang 互指组（方案 B，2026-09-01 落地）
  //
  // 多语言子集页面（营销页 5 + /blog 列表 + 12 篇 HowTo + 10 genre）声明
  // 完整 6 语言互指 + x-default；其余页面只声明自指 en + x-default。
  // x-default 始终指向英文版本（无前缀路径），不随当前页面语言漂移。
  //
  // ⚠️ 止血复盘（2026-09-01 下午）：旧代码曾对全站 6 语言声明 hreflang，
  //    但 dist 里根本没有对应语言目录，460 个 URL 全 fallback 到英文首页
  //    → hreflang 整组失效 + 340 个重复内容页。声明 hreflang 的前提是
  //    **对应 URL 真的有产物**，此处 langs 与 getRouteData() 的变体生成一一对应，
  //    由 verify-blog.py 第 11/12 组强制校验。
  const langs: readonly string[] = data.hreflangLangs ?? ["en"];
  // data.path 可能已带语言前缀（如 /zh/about），先剥离得到应用路径，
  // 再按目标语言重新拼前缀 —— 否则 localizedHref 会把语言段当 appPath 的一部分。
  const appPath = stripLocalePrefix(data.path);
  for (const seg of langs) {
    const locale: SeoLocale =
      seg === "en" ? "en" : SEG_TO_LOCALE[seg as (typeof MULTILANG_SEGMENTS)[number]];
    metaTags.push(
      `<link rel="alternate" hreflang="${seg}" href="${SITE_URL}${localizedHref(locale, appPath)}" />`,
    );
  }
  const xDefaultHref = `${SITE_URL}${localizedHref("en", appPath)}`;
  metaTags.push(`<link rel="alternate" hreflang="x-default" href="${xDefaultHref}" />`);

  // 3. JSON-LD Schema
  if (data.schema) {
    metaTags.push(
      `<script type="application/ld+json" id="page-schema">${JSON.stringify(data.schema)}</script>`,
    );
  }

  // 3.5 无 JS 爬虫可见性：framer-motion 的 initial={{opacity:0}} 会把 SSR HTML
  // 渲染成隐形态。用 !important 强制显示给纯 HTML 抓取器。
  // 客户端首屏提交后由 main.tsx ReleaseMotionLock 移除，否则会盖掉入场动画。
  metaTags.push(
    `<style id="prerender-anti-hidden">[style*="opacity:0"],[style*="opacity: 0"]{opacity:1!important;transform:none!important}</style>`,
  );

  // 4. 在 </head> 前注入所有 meta 标签
  // 先移除可能已存在的预渲染 meta（防止重复）
  result = result.replace(/<!--PRENDER_META_START-->[\s\S]*?<!--PRENDER_META_END-->/, "");
  const injection = `<!--PRENDER_META_START-->\n  ${metaTags.join("\n  ")}\n  <!--PRENDER_META_END-->`;
  result = result.replace("</head>", `${injection}\n</head>`);

  return result;
}

/**
 * 为首页注入静态 HTML 内容到 <div id="root"> 中。
 *
 * React SPA 的 index.html 只有一个 <div id="root"></div> 空壳，
 * 所有文字/H1/链接/图片都是浏览器运行时渲染的。不执行 JS 的爬虫
 * （包括 AI 搜索引擎、某些审计工具）看到的是空页面。
 *
 * 此函数把核心内容写入 root div，React 在 hydrate 时会覆盖它，
 * 所以真实用户不会看到重复内容，但爬虫能读到完整页面。
 */
function injectHomepageContent(html: string): string {
  const content = `
<h1>Lollipop Drama — AI Short Drama Creation & Streaming Platform</h1>
<h2>Create Professional Videos from Text with AI · 80% Creator Revenue Share · 15,000+ Premium Dramas</h2>
<p>
  <strong>Lollipop Drama is an AI-powered short drama creation and streaming platform.</strong>
  Create professional short dramas from text using built-in AI tools — featuring text-to-video generation, AI image generation, face swap, and style transfer.
  Watch 15,000+ premium short dramas across 10 genres including Romance, Revenge, Thriller, CEO Drama, Fantasy, Action, Horror, Sci-Fi, Family, and Historical.
  Creators earn <strong>80% revenue share</strong>, the highest in the industry. Available on iOS and Android with 1M+ users across 100+ countries worldwide.
</p>
<ul>
  <li><strong>AI-Powered Creation</strong> — Built-in AI tools: text-to-video, image generation, face swap, style transfer</li>
  <li><strong>15,000+ Premium Short Dramas</strong> — Bite-sized episodes across 10 genres, updated daily</li>
  <li><strong>80% Creator Revenue Share</strong> — Industry-leading monetization for independent creators</li>
  <li><strong>1M+ Global Users</strong> — Available in 100+ countries with multilingual subtitles</li>
  <li><strong>4K Streaming & Offline Downloads</strong> — Premium viewing experience on iOS and Android</li>
</ul>
<p>
  <a href="https://www.lollipop.im/download">Download on App Store & Google Play</a> ·
  <a href="https://www.lollipop.im/creating">AI Creator Tools</a> ·
  <a href="https://www.lollipop.im/about">About Lollipop</a> ·
  <a href="https://www.lollipop.im/blog">Creator Blog</a>
</p>
<p>Popular genres:
  <a href="https://www.lollipop.im/genre/romance">Romance</a> ·
  <a href="https://www.lollipop.im/genre/revenge">Revenge</a> ·
  <a href="https://www.lollipop.im/genre/ceo-drama">CEO Drama</a> ·
  <a href="https://www.lollipop.im/genre/thriller">Thriller</a> ·
  <a href="https://www.lollipop.im/genre/fantasy">Fantasy</a> ·
  <a href="https://www.lollipop.im/genre/sci-fi">Sci-Fi</a> ·
  <a href="https://www.lollipop.im/genre/horror">Horror</a> ·
  <a href="https://www.lollipop.im/genre/action">Action</a>
</p>
<p>Popular short dramas:
  <a href="https://www.lollipop.im/drama/temptation-ceo">Temptation CEO</a> ·
  <a href="https://www.lollipop.im/drama/the-bride-who-fell-from-the-sky">The Bride Who Fell From The Sky</a> ·
  <a href="https://www.lollipop.im/drama/the-revenge-of-the-plus-size-wife">The Revenge of the Plus-Size Wife</a> ·
  <a href="https://www.lollipop.im/drama/dark-secrets">Dark Secrets</a> ·
  <a href="https://www.lollipop.im/drama/crimson-dynasty">Crimson Dynasty</a> ·
  <a href="https://www.lollipop.im/drama/neon-abyss">Neon Abyss</a>
</p>
<p>
  <a href="https://www.lollipop.im/privacy">Privacy Policy</a> ·
  <a href="https://www.lollipop.im/terms">Terms of Service</a> ·
  <a href="https://www.lollipop.im/contact">Contact</a> ·
  <a href="https://x.com/wwwLollipopim">X (Twitter)</a> ·
  <a href="https://youtube.com/@Lollipop-AI-one">YouTube</a> ·
  <a href="https://instagram.com/lollipopaiapp">Instagram</a>
</p>`;

  // 注入到 <div id="root"> 内部
  return html.replace('<div id="root"></div>', `<div id="root">${content}</div>`);
}

/**
 * P1-3/P1-4: 构建 assetMap 后，解析路由数据中的图片占位符。
 * - route.imageBasename → route.image（og:image 用）
 * - schema JSON 中的 __ASSET:basename__ → /assets/hash.ext（thumbnailUrl 用）
 */
function resolveRouteImages(routes: RouteSeoData[], assetMap: Map<string, string>): void {
  for (const route of routes) {
    // 解析 og:image
    if (route.imageBasename) {
      const hashed = assetMap.get(route.imageBasename) ?? route.imageBasename;
      route.image = `${SITE_URL}/assets/${hashed}`;
    }
    // 解析 schema 中的 __ASSET:basename__ 占位符
    if (route.schema) {
      let schemaStr = JSON.stringify(route.schema);
      schemaStr = schemaStr.replace(/__ASSET:(.+?)__/g, (_, basename) => {
        const hashed = assetMap.get(basename) ?? basename;
        return `${SITE_URL}/assets/${hashed}`;
      });
      route.schema = JSON.parse(schemaStr);
    }
  }
}

export function prerenderPlugin(): Plugin {
  let resolvedBase = "/";
  return {
    name: "lollipop-prerender",
    apply: "build",
    configResolved(config) {
      resolvedBase = config.base;
    },
    async closeBundle() {
      const outDir = "dist";
      const templatePath = join(outDir, "index.html");

      if (!existsSync(templatePath)) {
        console.warn("[prerender] dist/index.html not found, skipping pre-rendering");
        return;
      }

      const template = readFileSync(templatePath, "utf-8");
      const routes = getRouteData();

      // 资源映射：dev-mode SSR 会把图片解析成 /@fs/ 本地路径，需重写为 /assets/ 产物路径
      const assetMap = buildAssetMap();
      console.log(`[prerender] asset map built: ${assetMap.size} image(s) for dev-URL → /assets/ rewrite`);

      // P1-3/P1-4: 解析剧集海报图片路径（og:image + VideoObject thumbnailUrl）
      resolveRouteImages(routes, assetMap);

      // ── 初始化 SSR 渲染器（build-time 全量预渲染）──
      // 使用 Vite build (SSR mode) 编译 entry-server.tsx 为独立 SSR bundle，
      // 然后 dynamic import() 加载该 bundle 获取 renderRoute 函数。
      // Rollup 在编译期解析循环依赖，不会像 ssrLoadModule 那样死锁。
      // 若 SSR 构建失败，降级为 meta-only 模式，
      // 此时仅注入 SEO 标签，页面正文为空（爬虫可执行 JS 时仍可获取内容）。
      let renderRouteFn: ((path: string) => string) | null = null;
      // SSR bundle 输出在项目内（dist/.ssr），确保 Node 能解析 react 等依赖（向上找到项目根 node_modules）。
      // publicDir:false 避免把 public/ 复制进 .ssr，清理体积降到个位数，不触发 safe-delete 50 文件阈值。
      const SSR_BUNDLE_DIR = join(outDir, ".ssr");
      const SSR_BUNDLE_PATH = join(SSR_BUNDLE_DIR, "entry-server.js");

      try {
        console.log("[prerender] Building SSR bundle...");
        await build({
          configFile: false,
          base: resolvedBase,
          publicDir: false,
          logLevel: "error",
          plugins: [
            react(),
            {
              name: "figma-asset-resolver",
              resolveId(id) {
                if (id.startsWith("figma:asset/")) {
                  return join(process.cwd(), "src/assets", id.replace("figma:asset/", ""));
                }
              },
            },
          ],
          resolve: {
            alias: { "@": join(process.cwd(), "src") },
          },
          build: {
            ssr: join("src", "entry-server.tsx"),
            outDir: SSR_BUNDLE_DIR,
            write: true,
            minify: false,
            sourcemap: false,
          },
        });
        console.log("[prerender] SSR bundle built, loading module...");
        const entryUrl = pathToFileURL(SSR_BUNDLE_PATH).href;
        const entryModule = await import(entryUrl);
        renderRouteFn = entryModule.renderRoute as (path: string) => string;
        console.log("[prerender] SSR module loaded — full content rendering enabled");
      } catch (e) {
        console.warn(
          "[prerender] SSR build failed, falling back to meta-only mode:",
          e instanceof Error ? e.message : String(e),
        );
        renderRouteFn = null;
      }

      const renderAppHtml = async (path: string): Promise<string | null> => {
        if (!renderRouteFn) return null;
        try {
          const raw = renderRouteFn(path);
          // 把 dev /@fs/ 图片路径重写为生产 /assets/ 路径
          return rewriteFsImageUrls(raw, assetMap);
        } catch (e) {
          console.warn(
            `[prerender] SSR render failed for ${path}:`,
            e instanceof Error ? e.message : String(e),
          );
          return null;
        }
      };

      let count = 0;
      for (const route of routes) {
        // 跳过首页（已有正确的 index.html，单独处理）
        if (route.path === "/") continue;

        const appHtml = await renderAppHtml(route.path);
        let html = template;
        if (appHtml) {
          // 把真实渲染的 React HTML 注入 #root，爬虫可直接读到完整内容
          html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
        }
        html = injectSeoIntoHtml(html, route);
        html = adjustAssetPaths(html, route.path);
        html = rewriteNonSubsetLinks(html, route.path);
        const filePath = join(outDir, `${route.path}/index.html`);
        mkdirSync(dirname(filePath), { recursive: true });
        writeFileSync(filePath, html, "utf-8");
        count++;
      }

      // 同时更新首页 index.html：优先用 SSR 渲染，失败则降级为手写静态内容
      const homeRoute = routes.find((r) => r.path === "/");
      if (homeRoute) {
        const appHtml = await renderAppHtml("/");
        let homeHtml = template;
        if (appHtml) {
          homeHtml = homeHtml.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
        } else {
          homeHtml = injectHomepageContent(homeHtml);
        }
        homeHtml = injectSeoIntoHtml(homeHtml, homeRoute);
        writeFileSync(join(outDir, "index.html"), homeHtml, "utf-8");
      }

      // 清理临时 SSR bundle
      try {
        if (existsSync(SSR_BUNDLE_DIR)) {
          rmSync(SSR_BUNDLE_DIR, { recursive: true, force: true });
        }
      } catch {
        /* 清理失败忽略 */
      }

      // P1-2: 从 routes 数据生成 sitemap.xml（取代静态文件，确保多语言 URL 不遗漏）
      const sitemapPath = join(outDir, "sitemap.xml");
      try {
        const today = new Date().toISOString().split("T")[0];
        const urls: string[] = ['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'];

        for (const r of routes) {
          // noindex 页面不得进 sitemap：sitemap 是「请收录」信号，
          // 与页面里的 noindex 冲突会向搜索引擎发混合信号，触发 Coverage
          // 报告里的「已提交但被 noindex 排除」。当前跳过 /login、/forgot-password。
          if (r.robots?.includes("noindex")) continue;
          const loc = `${SITE_URL}${r.path}`;
          const langs: readonly string[] = r.hreflangLangs ?? ["en"];
          const appPath = stripLocalePrefix(r.path);
          urls.push("  <url>");
          urls.push(`    <loc>${loc}</loc>`);
          urls.push(`    <lastmod>${today}</lastmod>`);
          urls.push("    <changefreq>weekly</changefreq>");
          urls.push(`    <priority>${r.path === "/" ? "1.0" : r.path.startsWith("/blog/") ? "0.6" : "0.5"}</priority>`);
          for (const seg of langs) {
            const segLocale: SeoLocale =
              seg === "en" ? "en" : SEG_TO_LOCALE[seg as (typeof MULTILANG_SEGMENTS)[number]];
            urls.push(`    <xhtml:link rel="alternate" hreflang="${seg}" href="${SITE_URL}${localizedHref(segLocale, appPath)}" />`);
          }
          if (langs.length > 1 || langs[0] === "en") {
            urls.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${localizedHref("en", appPath)}" />`);
          }
          urls.push("  </url>");
        }
        urls.push("</urlset>");
        writeFileSync(sitemapPath, urls.join("\n"), "utf-8");
        const skipped = routes.filter((r) => r.robots?.includes("noindex")).map((r) => r.path);
        console.log(
          `[prerender] Generated sitemap.xml with ${routes.length - skipped.length} URLs` +
            (skipped.length ? ` (skipped noindex: ${skipped.join(", ")})` : ""),
        );
      } catch (e) {
        /* sitemap 生成失败，保留静态文件 */
        console.log(`[prerender] Sitemap generation failed: ${e}`);
      }

      // GEO: 生成 llms.txt / llms-full.txt（AI 引擎结构化索引）
      generateLlmsFiles(routes);

      console.log(
        `[prerender] Generated ${count} static HTML files (SSR ${renderRouteFn ? "enabled — full content rendered" : "disabled — meta-only mode"}) for ${routes.length} routes`,
      );
    },
  };
}
