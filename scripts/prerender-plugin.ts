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
import { blogPosts as dataBlogPosts } from "../src/app/data/blog";
import { blogFaq } from "../src/app/data/blogFaq";

const SITE_URL = "https://www.lollipop.im";

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

interface RouteSeoData {
  path: string;
  title: string;
  description: string;
  schema?: object;
  robots?: string;
  image?: string;
  /** P1-2: <html lang> 属性值（默认 "en"） */
  lang?: string;
  /** P1-3: 海报图片 basename（构建时通过 assetMap 解析为 /assets/ 路径） */
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
      title: "Lollipop AI — AI Short Drama & Creator Platform",
      description:
        "Lollipop AI: 15,000+ AI short dramas, AI creation tools (text-to-video, face swap), 80% creator revenue share. Free on iOS & Android in 100+ countries.",
      // 首页结构化数据交由 index.html 的全局 site-schema（含 WebSite/Organization/FAQPage 等）提供，避免重复
    },
    {
      path: "/about",
      title: "About Lollipop AI — AI Short Drama Platform",
      description:
        "Lollipop AI is a joint venture by Nyx Entertainment Group and Korean Cultural Investment Fund, revolutionizing short drama entertainment with AI. 1M+ users across 100+ countries.",
    },
    {
      path: "/creating",
      title: "Create AI Short Dramas — Lollipop AI Tools",
      description:
        "Create short dramas with Lollipop AI tools: AI image generation, face swap, video creation, and style transfer. 80% revenue share, full AI toolkit, global distribution in 100+ countries.",
    },
    {
      path: "/download",
      title: "Download Lollipop AI — iOS & Android",
      description:
        "Download Lollipop AI free on iOS and Android. 15,000+ premium short dramas, 4K streaming, offline downloads, AI creation tools. 2M+ downloads, 100+ countries, 4.9-star rating.",
    },
    {
      path: "/contact",
      title: "Contact Lollipop AI — Support & Business",
      description:
        "Contact Lollipop AI: business@lollipop.im for partnerships, service@lollipop.im for support, +65 80742120. Address: 3 Gambas Crescent, Nordcom One, Singapore 757088.",
    },
    {
      path: "/blog",
      title: "Blog — AI Short Drama & Creator Guides | Lollipop AI",
      description:
        "Read the latest insights on AI short dramas, creator economy trends, and step-by-step guides for making your first AI-generated drama on Lollipop AI.",
    },
    {
      path: "/login",
      title: "Login — Lollipop AI",
      description: "Sign in to your Lollipop AI account to access creator tools and premium short dramas.",
      robots: "noindex, follow",
    },
    {
      path: "/forgot-password",
      title: "Forgot Password — Lollipop AI",
      description: "Reset your Lollipop AI account password.",
      robots: "noindex, follow",
    },
    {
      path: "/privacy",
      title: "Privacy Policy — Lollipop AI",
      description:
        "Lollipop AI Privacy Policy: Learn how we collect, use, and protect your personal information, including data types, purposes, third-party sharing, and your privacy rights.",
    },
    {
      path: "/terms",
      title: "Terms of Service — Lollipop AI",
      description:
        "Lollipop AI Terms of Service: Terms and conditions for using the platform, including user obligations, content policy, intellectual property, disclaimers, and dispute resolution.",
    },
  ];
  routes.push(...staticPages);

  // --- 品类页 (10 genres) ---
  const genres = [
    { slug: "romance", name: "Romance", title: "Romance Short Dramas — Watch Online | Lollipop AI", desc: "Watch 320+ romance short dramas on Lollipop AI. Stream the best love stories, CEO romances, and revenge dramas with AI and live-action content." },
    { slug: "revenge", name: "Revenge", title: "Revenge Short Dramas — Watch Online | Lollipop AI", desc: "Watch 180+ revenge short dramas on Lollipop AI. Stream thrilling payback stories, betrayal dramas, and satisfying justice series in bite-sized episodes." },
    { slug: "thriller", name: "Thriller", title: "Thriller Short Dramas — Watch Online | Lollipop AI", desc: "Watch 150+ thriller short dramas on Lollipop AI. Stream suspenseful mysteries, psychological thrillers, and edge-of-your-seat series in 1-3 minute episodes." },
    { slug: "ceo-drama", name: "CEO Drama", title: "CEO Drama Short Dramas — Watch Online | Lollipop AI", desc: "Watch CEO drama short dramas on Lollipop AI. Stream billionaire romances, corporate power struggles, and boss-employee love stories in bite-sized episodes." },
    { slug: "fantasy", name: "Fantasy", title: "Fantasy Short Dramas — Watch Online | Lollipop AI", desc: "Watch fantasy short dramas on Lollipop AI. Stream magical worlds, supernatural romances, and AI-generated fantasy series in bite-sized episodes." },
    { slug: "action", name: "Action", title: "Action Short Dramas — Watch Online | Lollipop AI", desc: "Watch action short dramas on Lollipop AI. Stream martial arts, combat, and high-octane adventure series in bite-sized episodes." },
    { slug: "horror", name: "Horror", title: "Horror Short Dramas — Watch Online | Lollipop AI", desc: "Watch horror short dramas on Lollipop AI. Stream scary, spooky, and atmospheric horror series in bite-sized episodes." },
    { slug: "sci-fi", name: "Sci-Fi", title: "Sci-Fi Short Dramas — Watch Online | Lollipop AI", desc: "Watch sci-fi short dramas on Lollipop AI. Stream science fiction, futuristic, and AI-generated series in bite-sized episodes." },
    { slug: "family", name: "Family", title: "Family Short Dramas — Watch Online | Lollipop AI", desc: "Watch family short dramas on Lollipop AI. Stream heartwarming family stories, parenting dramas, and relationship series in bite-sized episodes." },
    { slug: "historical", name: "Historical", title: "Historical Short Dramas — Watch Online | Lollipop AI", desc: "Watch historical short dramas on Lollipop AI. Stream period dramas, palace intrigues, and historical costume series in bite-sized episodes." },
  ];
  for (const g of genres) {
    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${g.name} Short Dramas`,
      description: g.desc,
      url: `${SITE_URL}/genre/${g.slug}`,
      isPartOf: { "@type": "WebSite", name: "Lollipop AI", url: SITE_URL },
    };
    routes.push({
      path: `/genre/${g.slug}`,
      title: g.title,
      description: g.desc,
      schema: withBreadcrumb(collectionSchema, [
        { name: "Home", url: SITE_URL },
        { name: "Genres", url: SITE_URL },
        { name: `${g.name} Short Dramas`, url: `${SITE_URL}/genre/${g.slug}` },
      ]),
    });
  }

  // --- 剧集详情页 (12 dramas) ---
  const dramas = [
    { slug: "temptation-ceo", title: "Temptation CEO — Watch Free Short Drama | Lollipop AI", desc: "Watch Temptation CEO, a binge-worthy short drama on Lollipop AI. A powerful CEO's secret desire turns into an irresistible temptation. Stream all episodes free.", uploadDate: "2026-01-15" },
    { slug: "the-bride-who-fell-from-the-sky", title: "The Bride Who Fell From The Sky — Watch Free | Lollipop AI", desc: "Watch The Bride Who Fell From The Sky, a romantic short drama on Lollipop AI. A mysterious bride falls from the sky and changes everything. Stream all episodes free.", uploadDate: "2026-02-01" },
    { slug: "the-revenge-of-the-plus-size-wife", title: "The Revenge of the Plus-Size Wife — Watch Free | Lollipop AI", desc: "Watch The Revenge of the Plus-Size Wife, a satisfying revenge short drama on Lollipop AI. She was mocked for her size — now she's back for justice. Stream free.", uploadDate: "2026-01-20" },
    { slug: "my-royal-alpha-boyfriend", title: "My Royal Alpha Boyfriend — Watch Free | Lollipop AI", desc: "Watch My Royal Alpha Boyfriend, a fantasy romance short drama on Lollipop AI. A werewolf prince claims her as his mate. Stream all episodes free.", uploadDate: "2026-02-10" },
    { slug: "dark-secrets", title: "Dark Secrets — Watch Free Short Drama | Lollipop AI", desc: "Watch Dark Secrets, a thrilling short drama on Lollipop AI. Everyone has secrets, but some are worth killing for. Stream all episodes free.", uploadDate: "2026-01-05" },
    { slug: "why-jump-off-the-building", title: "Why Jump Off The Building — Watch Free | Lollipop AI", desc: "Watch Why Jump Off The Building, a suspenseful short drama on Lollipop AI. A woman's desperate jump reveals a web of betrayal. Stream all episodes free.", uploadDate: "2026-01-10" },
    { slug: "crimson-dynasty", title: "Crimson Dynasty — Watch Free Short Drama | Lollipop AI", desc: "Watch Crimson Dynasty, a historical palace drama on Lollipop AI. Power, passion, and betrayal in the imperial court. Stream all episodes free.", uploadDate: "2026-02-15" },
    { slug: "neon-abyss", title: "Neon Abyss — Watch Free Short Drama | Lollipop AI", desc: "Watch Neon Abyss, a cyberpunk sci-fi short drama on Lollipop AI. In a neon-soaked future, one woman fights to reclaim her identity. Stream free.", uploadDate: "2026-02-20" },
    { slug: "whispered-love", title: "Whispered Love — Watch Free Short Drama | Lollipop AI", desc: "Watch Whispered Love, a heartwarming romance short drama on Lollipop AI. Sometimes the quietest love speaks the loudest. Stream all episodes free.", uploadDate: "2026-02-25" },
    { slug: "the-forgotten", title: "The Forgotten — Watch Free Short Drama | Lollipop AI", desc: "Watch The Forgotten, a mystery thriller short drama on Lollipop AI. He woke up with no memory, but everyone seems to know him. Stream all episodes free.", uploadDate: "2026-03-01" },
    { slug: "iron-will", title: "Iron Will — Watch Free Short Drama | Lollipop AI", desc: "Watch Iron Will, an action short drama on Lollipop AI. A soldier's unbreakable will is tested in the ultimate battle for survival. Stream all episodes free.", uploadDate: "2026-03-05" },
    { slug: "cloud-atlas", title: "Cloud Atlas — Watch Free Short Drama | Lollipop AI", desc: "Watch Cloud Atlas, a fantasy adventure short drama on Lollipop AI. Journey across floating islands in a world above the clouds. Stream all episodes free.", uploadDate: "2026-03-10" },
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
    const plain = stripMd(p.contentZh);
    const articleSchema = {
      "@type": "Article",
      headline: p.title,
      description: p.seoDescription,
      datePublished: p.publishDate,
      dateModified: p.updateDate,
      author: {
        "@type": "Person",
        name: p.author,
        jobTitle: p.authorRole,
        worksFor: { "@type": "Organization", name: "Lollipop AI", url: SITE_URL },
      },
      publisher: {
        "@type": "Organization",
        name: "Lollipop AI",
        url: SITE_URL,
      },
      image: {
        "@type": "ImageObject",
        url: `${SITE_URL}${p.coverImage || "/blog-images/guide.png"}`,
      },
      keywords: `${p.categoryLabel}, AI short drama, Lollipop AI, ${p.title}`,
      articleBody: plain.slice(0, 500),
      wordCount: plain.replace(/\s/g, "").length,
      encodingFormat: "text/html",
    };

    const isGuide = p.category === "guide";
    const howToSchema = isGuide
      ? {
          "@type": "HowTo",
          name: p.title,
          description: p.seoDescription,
          step: [
            { "@type": "HowToStep", position: 1, name: "Write Your Script", text: "Write a compelling story with 1-3 minute episodes." },
            { "@type": "HowToStep", position: 2, name: "Design Your Characters", text: "Use LunoTV 1.5 text-to-image tool to create character designs." },
            { "@type": "HowToStep", position: 3, name: "Generate Your Scenes", text: "Use text-to-video tool with detailed prompts." },
            { "@type": "HowToStep", position: 4, name: "Add Voice and Music", text: "Record voice acting and add background music." },
            { "@type": "HowToStep", position: 5, name: "Edit and Polish", text: "Use video-to-video tool for consistent visual styles." },
            { "@type": "HowToStep", position: 6, name: "Publish on Lollipop AI", text: "Upload through creator distribution center." },
            { "@type": "HowToStep", position: 7, name: "Promote Your Drama", text: "Share on social media and engage with viewers." },
          ],
          totalTime: "PT2H",
        }
      : null;

    // GEO: FAQPage Schema（与详情页可见 FAQ 对应；blogFaq 按 slug 提供，独立于 blog.ts）
    const faqItems = blogFaq[p.slug] ?? [];
    const faqSchema = faqItems.length
      ? {
          "@type": "FAQPage",
          mainEntity: faqItems.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
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
    { code: "us", country: "United States", title: "Best Short Drama Platform in USA | Watch AI Series — Lollipop", desc: "Watch the best short dramas in the USA on Lollipop AI. Stream 15,000+ AI and live-action series. 80% creator revenue share. Download free on iOS & Android." },
    { code: "uk", country: "United Kingdom", title: "Best Short Drama Platform in UK | Watch AI Series — Lollipop", desc: "Watch the best short dramas in the UK on Lollipop AI. Stream 15,000+ AI and live-action series with English subtitles. Download free on iOS & Android." },
    { code: "ca", country: "Canada", title: "Best Short Drama Platform in Canada | Watch AI Series", desc: "Watch the best short dramas in Canada on Lollipop AI. Stream 15,000+ AI and live-action series. Available in English and French. Download free on iOS & Android." },
    { code: "au", country: "Australia", title: "Best Short Drama Platform in Australia | Watch AI Series", desc: "Watch the best short dramas in Australia on Lollipop AI. Stream 15,000+ AI and live-action series. Download free on iOS & Android. 4K streaming available." },
    { code: "sg", country: "Singapore", title: "Best Short Drama Platform in Singapore | Watch AI Series", desc: "Watch the best short dramas in Singapore on Lollipop AI. Stream 15,000+ AI and live-action series. Local payment methods supported. Download free on iOS & Android." },
    { code: "my", country: "Malaysia", title: "Best Short Drama Platform in Malaysia | Watch AI Series", desc: "Watch the best short dramas in Malaysia on Lollipop AI. Stream 15,000+ AI and live-action series with multilingual subtitles. Local payment supported." },
    { code: "ph", country: "Philippines", title: "Best Short Drama Platform in Philippines | Watch AI Series", desc: "Watch the best short dramas in the Philippines on Lollipop AI. Stream 15,000+ AI and live-action series. GCash and local payment supported. Download free." },
    { code: "id", country: "Indonesia", title: "Best Short Drama Platform in Indonesia | Watch AI Series", desc: "Watch the best short dramas in Indonesia on Lollipop AI. Stream 15,000+ AI and live-action series. GoPay and local payment supported. Download free on iOS & Android." },
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

  return routes;
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
 * 将 SEO 数据注入 HTML 模板，生成静态 HTML。
 * 策略：替换 <title>、插入/更新 <meta>、插入 canonical、OG tags、JSON-LD。
 */
function injectSeoIntoHtml(html: string, data: RouteSeoData): string {
  let result = stripSeoMeta(html);

  // P1-2: 更新 <html lang> 属性（默认 "en"，区域页可按目标语言设置）
  const lang = data.lang ?? "en";
  result = result.replace(/<html\s+lang="[^"]*"/i, `<html lang="${lang}"`);

  // 1. 替换 <title>
  result = result.replace(/<title>.*?<\/title>/i, `<title>${data.title}</title>`);

  // 2. 构建注入的 meta 标签
  const canonicalUrl = `${SITE_URL}${data.path}`;
  const metaTags: string[] = [
    `<meta name="description" content="${data.description}" />`,
    `<meta name="robots" content="${data.robots ?? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Lollipop AI" />`,
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

  // hreflang（路径前缀版，与 Nginx /zh/ /zh-TW/ /en/ /pt/ 对齐；en 默认无前缀）
  const hreflangPaths: { hreflang: string; prefix: string }[] = [
    { hreflang: "en", prefix: "" },
    { hreflang: "zh-CN", prefix: "/zh" },
    { hreflang: "zh-TW", prefix: "/zh-TW" },
    { hreflang: "pt", prefix: "/pt" },
  ];
  const appPath = data.path === "/" ? "" : data.path;
  for (const { hreflang, prefix } of hreflangPaths) {
    const hrefPath =
      !prefix && !appPath
        ? "/"
        : prefix && !appPath
          ? `${prefix}/`
          : `${prefix}${appPath || "/"}`;
    metaTags.push(
      `<link rel="alternate" hreflang="${hreflang}" href="${SITE_URL}${hrefPath}" />`,
    );
  }
  metaTags.push(`<link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />`);

  // 3. JSON-LD Schema
  if (data.schema) {
    metaTags.push(
      `<script type="application/ld+json" id="page-schema">${JSON.stringify(data.schema)}</script>`,
    );
  }

  // 3.5 全量 SSR 覆盖：framer-motion 的 initial={{opacity:0}} 会把内容渲染成
  // 隐形态（opacity:0），静态快照下对纯 HTML 爬虫/无 JS 环境不可见。
  // 用 !important 强制显示，确保预渲染内容对所有抓取器可见。
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
<h1>Lollipop AI — The World's First AI Creator Ecosystem Entertainment Platform</h1>
<h2>AI Short Dramas, AI Creator Tools, 80% Revenue Share</h2>
<p>
  Lollipop AI is a global AI-powered short drama platform combining premium streaming content with cutting-edge AI creation tools.
  Watch 15,000+ short dramas across 10 genres including Romance, Revenge, Thriller, CEO Drama, Fantasy, Action, Horror, Sci-Fi, Family, and Historical.
  Create your own AI-generated short dramas with text-to-video, image-to-video, face swap, and style transfer — no editing experience required.
  Creators earn <strong>80% revenue share</strong>, the highest in the industry. Available on iOS and Android with 1M+ users across 100+ countries.
</p>
<ul>
  <li><strong>15,000+ Premium Short Dramas</strong> — Bite-sized episodes across 10 genres</li>
  <li><strong>1M+ Global Users</strong> — Available in 100+ countries with multilingual subtitles</li>
  <li><strong>AI Creation Tools</strong> — LunoTV 1.5: text-to-video, image-to-video, face swap, style transfer</li>
  <li><strong>80% Creator Revenue Share</strong> — Industry-leading monetization for independent creators</li>
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
  return {
    name: "lollipop-prerender",
    apply: "build",
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
      const SSR_BUNDLE_DIR = join(outDir, ".ssr");
      const SSR_BUNDLE_PATH = join(SSR_BUNDLE_DIR, "entry-server.js");

      try {
        console.log("[prerender] Building SSR bundle...");
        await build({
          configFile: false,
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

      // P2-1: 更新 sitemap.xml 的 lastmod 为构建日期
      const sitemapPath = join(outDir, "sitemap.xml");
      if (existsSync(sitemapPath)) {
        try {
          const today = new Date().toISOString().split("T")[0];
          let sitemap = readFileSync(sitemapPath, "utf-8");
          sitemap = sitemap.replace(/<lastmod>[^<]+<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
          writeFileSync(sitemapPath, sitemap, "utf-8");
          console.log(`[prerender] Updated sitemap.xml lastmod to ${today}`);
        } catch {
          /* sitemap 更新失败忽略 */
        }
      }

      console.log(
        `[prerender] Generated ${count} static HTML files (SSR ${renderRouteFn ? "enabled — full content rendered" : "disabled — meta-only mode"}) for ${routes.length} routes`,
      );
    },
  };
}
