import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { distributionMessages } from "./distribution/i18n.distribution";
import { loginMessages } from "./i18n.login";
import { applySeoMeta, getPageSeo } from "./i18n.seo";
import {
  buildLocalizedPath,
  getDeployBasename,
  matchLocalePath,
  stripLocalePrefix,
} from "./localePath";

import type { Locale } from "./i18n-types";
export type { Locale };

export const localeOptions = [
  { code: "zh-TW", label: "繁體中文" },
  { code: "zh-CN", label: "简体中文" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "es", label: "Español" },
  { code: "ar", label: "العربية" },
] as const;

const STORAGE_KEY = "lollipop-locale";

const enMessages = {
  common: {
    brand: "Lollipop Drama",
    language: "Language",
    contactUs: "Contact Us",
    appStore: "App Store",
    googlePlay: "Google Play",
    freeToDownload: "Free to download",
    noAdsInPremium: "No ads in Premium",
    scanToDownload: "Scan to Download",
    pointCameraAtQr: "Point your camera at the QR code",
    stayUpdated: "Stay Updated",
    getReleaseAlerts: "Get new release notifications",
    emailPlaceholder: "your@email.com",
    go: "Go",
    subscribedSuccess: "Subscribed successfully!",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    allRightsReserved: "All rights reserved.",
    downloadOnThe: "Download on the",
    getItOn: "GET IT ON",
    loading: "Loading...",
    loadFailed: "Failed to load. Please try again.",
    retry: "Retry",
  },
  navbar: {
    links: {
      home: "Home",
      creating: "Creating",
      download: "Download",
      blog: "Blog",
      contact: "Contact",
    },
    signUp: "Sign Up",
    logIn: "Log In",
    account: "Account",
    logOut: "Log Out",
  },
  hero: {
    bannerAlt: ["Lollipop Banner 1", "Lollipop Banner 2"],
    taglineLine1: "Stream Short Dramas. Create. Monetize.",
    taglineLine2: "The Next-Generation Global Content Ecosystem for AI Dramas.",
    stats: [
      { label: "Premium Dramas" },
      { label: "Global Users" },
      { label: "Countries & Regions" },
    ],
    aiSummary: "Lollipop Drama is an AI-powered short drama creation and streaming platform. Create professional videos from text with LunoTV 1.5, earn 80% revenue share, and reach 1M+ users across 100+ countries worldwide.",
    quickLinks: { blog: "Blog", genres: "Genres", popular: "Popular", aiTools: "AI Tools" },
  },
  trending: {
    eyebrow: "Trending Now",
    title: "Hottest Dramas · Updated in Real-Time",
    description: "Curated from global viewing data and ratings. The most popular blockbuster dramas are waiting for you.",
    shows: [
      { title: "Temptation CEO", genre: "Romance · Revenge", meta: "80 EP · 52M views" },
      { title: "The Bride Who Fell from the Sky", genre: "Romance · Fantasy", meta: "60 EP · 38M views" },
      { title: "The Revenge of the Plus-Size Wife", genre: "Romance · Revenge", meta: "100 EP · 67M views" },
      { title: "My Royal Alpha Boyfriend", genre: "Romance · Fantasy", meta: "50 EP · 29M views" },
      { title: "Dark Secrets", genre: "Thriller · Drama", meta: "70 EP · 44M views" },
      { title: "Why Jump Off the Building", genre: "Thriller · Mystery", meta: "90 EP · 41M views" },
    ],
  },
  newReleases: {
    eyebrow: "New This Week",
    title: "New Releases · Watch First",
    description: "Fresh exclusives premiere every week, so there is always a new obsession waiting for you.",
    badge: "NEW",
    shows: [
      { title: "Crimson Dynasty", genre: "Historical · Power", meta: "45 EP" },
      { title: "Neon Abyss", genre: "Sci-Fi · Thriller", meta: "36 EP" },
      { title: "Whispered Love", genre: "Romance · Drama", meta: "55 EP" },
      { title: "The Forgotten", genre: "Mystery · Suspense", meta: "40 EP" },
      { title: "Iron Will", genre: "Action · Martial Arts", meta: "48 EP" },
      { title: "Cloud Atlas", genre: "Fantasy · Adventure", meta: "60 EP" },
    ],
  },
  aiFeatures: {
    eyebrow: "AI-Powered Creation",
    title: "Create with AI, Stream on Luno TV",
    description: "Luno TV brings revolutionary AI creation tools to every storyteller — generate, edit, and publish your short dramas directly to a global audience.",
    features: [
      {
        title: "AI Image Generation",
        desc: "Create stunning scene visuals with text prompts. Bring your creative vision to life instantly.",
      },
      {
        title: "AI Face Swap",
        desc: "Seamlessly swap character faces with advanced deep-learning technology for perfect continuity.",
      },
      {
        title: "AI Video Creation",
        desc: "Transform scripts into cinematic short clips. Auto-generate transitions, effects and voiceovers.",
      },
      {
        title: "Style Transfer",
        desc: "Apply cinematic color grading and visual styles from your favorite films with one click.",
      },
    ],
  },
  genres: {
    eyebrow: "Explore by Genre",
    title: "Find Your Favorite",
    description: "Browse dozens of categories and jump straight into the stories that match your mood.",
    items: [
      { name: "Romance", count: "320+ Shows" },
      { name: "Revenge", count: "180+ Shows" },
      { name: "Thriller", count: "150+ Shows" },
      { name: "CEO Drama", count: "260+ Shows" },
      { name: "Fantasy", count: "120+ Shows" },
      { name: "Action", count: "90+ Shows" },
      { name: "Horror", count: "85+ Shows" },
      { name: "Sci-Fi", count: "75+ Shows" },
      { name: "Family", count: "110+ Shows" },
      { name: "Historical", count: "95+ Shows" },
    ],
  },
  whyChoose: {
    eyebrow: "Why Lollipop",
    title: "Why Choose Lollipop",
    description: "We redefine short drama entertainment and make every second more immersive, polished, and rewarding.",
    features: [
      {
        title: "Bite-Sized Episodes",
        desc: "1-3 minute episodes built for mobile viewing, perfect for commutes, breaks, and late-night binges.",
      },
      {
        title: "Offline Viewing",
        desc: "Download your favorites and keep watching anywhere, even without a connection.",
      },
      {
        title: "Multi-Language Subs",
        desc: "Enjoy stories from around the world with subtitles designed for a global audience.",
      },
      {
        title: "Premium Quality",
        desc: "Cinematic visuals, polished pacing, and professional performances in every series.",
      },
      {
        title: "Free Episodes Daily",
        desc: "Unlock new free episodes every day, while Premium members get unlimited access.",
      },
      {
        title: "Ad-Free Experience",
        desc: "No interruptions, just immersive drama from the first frame to the final cliffhanger.",
      },
    ],
  },
  web3: {
    eyebrow: "Blockchain Entertainment",
    titlePrefix: "WEB2",
    titleHighlight: "WEB3",
    floatingTags: ["RWA", "NFT", "DeFi", "Token", "DAO", "Metaverse"],
    stats: [
      { label: "Token Holders" },
      { label: "NFTs Minted" },
      { label: "Chain Partners" },
    ],
    paragraphs: [
      'Lollipop leverages RWA to reconstruct the value system of film and television, building a decentralized parallel universe that ushers entertainment into an era of "Quantifiable, Circulable, and Distributable" value.',
      "Here, content is no longer just content. It becomes a digital asset that can keep growing, and every view becomes a value-creating action.",
      "Lollipop is lighting up screens around the world and opening the door to the next trillion-dollar entertainment opportunity.",
    ],
  },
  testimonials: {
    eyebrow: "User Reviews",
    title: "Loved by Millions Worldwide",
    reviews: [
      {
        name: "Sarah M.",
        role: "Premium · USA",
        text: "I'm completely addicted. The cliffhangers are genius, and I finished three series in one weekend.",
      },
      {
        name: "James L.",
        role: "VIP · UK",
        text: "The production quality is wild for short-form content. Some shows genuinely feel like premium originals.",
      },
      {
        name: "Emily R.",
        role: "Premium · Canada",
        text: "Finally an app that fits my schedule. I watch during lunch, on the subway, and before bed.",
      },
      {
        name: "David K.",
        role: "VIP · Australia",
        text: "I started on the free plan and upgraded in two days. The exclusives alone make it worth it.",
      },
      {
        name: "Mei L.",
        role: "Premium · Singapore",
        text: "The AI tools are incredible. I made my first short drama in just a few hours.",
      },
      {
        name: "Carlos R.",
        role: "VIP · Brazil",
        text: "The multilingual subtitles are excellent, and offline downloads saved me on several flights.",
      },
      {
        name: "Yuki T.",
        role: "Premium · Japan",
        text: "As a creator, the revenue share is unbeatable. I earned more here in months than elsewhere in a year.",
      },
      {
        name: "Anna P.",
        role: "VIP · Germany",
        text: "I was skeptical about 4K on a short drama app, but the visuals are genuinely cinematic.",
      },
    ],
  },
  creator: {
    eyebrow: "Creator Program",
    title: "Become the Next Million-View Creator",
    description: "Lollipop offers the industry's highest revenue share and comprehensive creative support for quality creators. Let great content receive the rewards it deserves.",
    benefits: [
      "80% revenue share — highest in the industry",
      "Full AI creation toolkit access",
      "Dedicated creator success manager",
      "Global distribution across 100+ countries",
      "Monthly bonus rewards for top performers",
    ],
    stats: [
      { label: "Revenue Share", desc: "Industry-leading creator earnings" },
      { label: "Quality Creators", desc: "Growing community worldwide" },
      { label: "Avg. Monthly Earnings", desc: "For top-performing creators" },
      { label: "Success Stories", desc: "Creators reaching 1M+ plays" },
    ],
  },
  downloadCta: {
    eyebrow: "Available Now",
    title: "Your Next Obsession is One Tap Away",
    description: "Join millions of viewers worldwide. Download free and get 7 days of Premium access — no commitment.",
    featuredTitle: "Download Lollipop",
    featuredDescription: "Available on iOS & Android. 4K streaming, offline downloads, and 15,000+ premium short dramas.",
    featuredShowTitle: "Obsessed With My Boss · Pt.2",
    featuredTimer: "0:42",
    notification: "New Episode!",
    rating: "4.9",
    stats: [
      { value: "2M+", label: "Downloads" },
      { value: "4.9★", label: "App Rating" },
      { value: "100+", label: "Countries" },
      { value: "99.9%", label: "Uptime" },
    ],
  },
  about: {
    heroTitle: "About",
    heroHighlight: "Lollipop",
    heroSubtitle: "Opening a New Era of Global Short Drama Entertainment",
    companyTitle: "Company Overview",
    companySub: "A global short drama platform empowering creators and audiences",
    companyParagraphs: [
      "Lollipop is a joint venture between Hong Kong-based Nyx Entertainment Group and the Korean Cultural Investment Fund. The fund's strategic goal is to systematically promote K-Contents globally, with a strong focus on co-productions with international production partners.",
      "It is actively expanding into diversified global markets including China, Japan, North America, Europe, Southeast Asia and the Middle East, while accelerating localization strategies.",
    ],
    companyStats: [
      { num: "1M+", label: "Global Users" },
      { num: "100K+", label: "Quality Creators" },
      { num: "100+", label: "Countries" },
    ],
    teamTitle: "Outstanding Team",
    teamSub: "A world-class leadership team driving innovation in entertainment",
    team: [
      { name: "James C.", role: "Co-Founder", desc: "Veteran in entertainment & technology with extensive industry experience." },
      { name: "Sarah L.", role: "Operations", desc: "Global operations specialist with multi-market scaling expertise." },
      { name: "David P.", role: "Technology", desc: "Expert in AI and distributed systems with deep technical background." },
      { name: "Emily W.", role: "Finance", desc: "Seasoned finance professional with strategic investment background." },
    ],
    partnersTitle: "Strategic Partners",
    partnersSub: "Collaborating with industry leaders across the globe",
    partners: [
      { name: "TechVentures Capital", desc: "Leading venture capital firm focused on emerging tech and digital media across Asia-Pacific." },
      { name: "AsiaMedia Group", desc: "Pan-Asian media group spanning streaming, film production, and talent management." },
      { name: "GlobalStream Inc.", desc: "Cloud infrastructure and CDN provider serving seamless 4K streaming for global audiences." },
      { name: "Dragon Pictures", desc: "Award-winning film studio specializing in premium short-form drama and original content." },
      { name: "PixelForge Studios", desc: "Advanced VFX and post-production studio supporting top entertainment projects worldwide." },
      { name: "SilkRoad Entertainment", desc: "Cross-cultural distributor connecting Eastern and Western storytelling markets." },
      { name: "Horizon Digital", desc: "AI-driven marketing and user acquisition platform for entertainment brands." },
      { name: "StarLight Ventures", desc: "Strategic investor and incubator supporting the next generation of creator economy startups." },
    ],
  },
  contact: {
    title: "Contact Us",
    subtitle: "Reach out through any of the channels below",
    cards: [
      { title: "Phone", detail: "+65 80742120" },
      { title: "Email", detail: "business@lollipop.im" },
      { title: "Telegram", detail: "Contact Us" },
      { title: "WhatsApp", detail: "Contact Us" },
      { title: "Business", detail: "business@lollipop.im" },
      { title: "Customer Service", detail: "service@lollipop.im" },
    ],
  },
  footer: {
    titles: {
      contact: "Contact",
      website: "Website",
      languages: "Services",
    },
    links: {
      home: "Home",
      aboutUs: "About Us",
      creating: "Creating",
      download: "Download",
      contactUs: "Contact Us",
    },
    address: "3 GAMBAS CRESCENT, #04-01, NORDCOM ONE, SINGAPORE 757088",
    },
    videoModal: {
      title: "Preview Coming Soon",
    description: "Full episode available in the app",
  },
  dynamicPages: {
    backToHome: "Back to Home",
    home: "Home",
    blog: "Blog",
    genres: "Genres",
    backToBlog: "Back to Blog",
    explore: "Explore",
    notFoundGenre: "Genre not found.",
    notFoundDrama: "Drama not found.",
    notFoundRegion: "Region not found.",
    notFoundArticle: "Article not found.",
    shortDrames: "Short Dramas",
    exploreOtherGenres: "Explore Other Genres",
    moreDramasComingSoon: "More {0} dramas coming soon. Check back weekly for new releases!",
    ep: "EP",
    synopsis: "Synopsis",
    relatedDramas: "Related Dramas You Might Like",
    watchOnLollipop: "Watch on Lollipop Drama",
    downloadApp: "Download App",
    views: "views",
    episodes: "episodes",
    market: "Market",
    shortDramasIn: "Short Dramas in {0}",
    popularIn: "Popular in {0}",
    paymentMethodsIn: "Payment Methods in {0}",
    localTips: "Local Tips",
    startWatchingIn: "Start Watching in {0}",
    downloadFree: "Download Free",
    availableInOtherRegions: "Available in Other Regions",
    lollipopBlog: "Lollipop Drama Blog",
    insightsGuidesTrends: "Insights, Guides & Trends",
    blogDescription: "Deep dives into AI short dramas, the creator economy, and the future of mobile entertainment.",
    allPosts: "All Posts",
    industryInsights: "Industry Insights",
    creatorEconomy: "Creator Economy",
    creatorGuides: "Creator Guides",
    readMore: "Read more",
    updated: "Updated:",
    previous: "Previous",
    next: "Next",
    downloadAppDesc: "Download Lollipop Drama and enjoy 15,000+ premium short dramas. Free to download, no subscription required to start.",
    organizationName: "Lollipop Drama",
    howToGuides: "How-To Guides",
    relatedPosts: "Related Posts",
    workflowGuides: "Production Workflow",
    productionGuides: "Production Planning",
    distributionGuides: "Distribution & Monetization",
    difficulty: "Difficulty",
    stepsCount: "{0} steps",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    unitMinutes: "minutes",
    unitHours: "hours",
    unitDays: "days",
    genreWhyTitle: "Why Watch {0} Short Dramas on Lollipop Drama",
    genreWhyBody:
      "Lollipop Drama curates {0} short dramas into 1-3 minute episodes built for mobile viewing, so a complete story arc fits into a commute or a coffee break. Every title streams in HD with no download required, new episodes land daily, and AI-generated originals sit alongside live-action productions, giving {0} fans a deeper catalogue than any single studio can offer.",
    genreFaqTitle: "{0} Short Dramas - Frequently Asked Questions",
    genreFaq1Q: "How many {0} short dramas can I watch on Lollipop Drama?",
    genreFaq1A:
      "The {0} catalogue grows every week. The count shown at the top of this page reflects the {0} titles currently available, and new episodes drop daily across both AI-generated originals and live-action series.",
    genreFaq2Q: "Do I need to pay to watch {0} short dramas?",
    genreFaq2A:
      "Downloading Lollipop Drama is free and no subscription is required to start. A portion of the {0} catalogue streams for free, while premium episodes unlock through optional in-app purchases or a creator subscription.",
    genreFaq3Q: "How long is a typical {0} episode?",
    genreFaq3A:
      "Most {0} episodes run between one and three minutes, with full seasons spanning 50 to 100 episodes, roughly the length of a feature film, delivered in mobile-sized installments.",
    downloadWhyTitle: "Why Download the Lollipop Drama App",
    downloadWhyBody:
      "The mobile app is the fastest way to watch: episodes open instantly in vertical full screen, playback adapts to your connection, and new releases are pushed to your device the moment they go live. Your watchlist, progress and creator subscriptions sync across phones and tablets, so you can start an episode on the way to work and finish it at home.",
    downloadFaqTitle: "Lollipop Drama App - Frequently Asked Questions",
    downloadFaq1Q: "Is the Lollipop Drama app free to download?",
    downloadFaq1A:
      "Yes. Lollipop Drama is free to download on iOS and Android, and no subscription is required to start watching. A selection of short dramas streams for free, while premium episodes unlock with optional in-app purchases.",
    downloadFaq2Q: "Can I watch Lollipop Drama offline?",
    downloadFaq2A:
      "Yes. Premium subscribers can download episodes to their device and watch them offline in up to 4K, which is useful when commuting or travelling without a stable connection.",
    downloadFaq3Q: "Which countries is Lollipop Drama available in?",
    downloadFaq3A:
      "Lollipop Drama is available in more than 100 countries worldwide. Episode availability can vary by region because of licensing, so the catalogue you see may differ slightly depending on where you download the app.",
    downloadFaq4Q: "What devices support Lollipop Drama?",
    downloadFaq4A:
      "Lollipop Drama runs on iOS 15 or later and Android 8 or later, on both phones and tablets. The app is optimized for vertical full-screen playback, and a single account can be used across multiple devices with watch progress synced automatically.",
    creatingFaqTitle: "AI Short Drama Creation - Frequently Asked Questions",
    creatingFaq1Q: "Do I need production experience to create an AI short drama?",
    creatingFaq1A:
      "No. The toolkit is built for first-time creators: you write or adapt a script, generate scene visuals from text prompts, keep characters consistent with face swap, and let the pipeline assemble transitions, effects and voiceovers. Most creators publish their first episode within a day.",
    creatingFaq2Q: "How much does it cost to produce an AI short drama?",
    creatingFaq2A:
      "Costs are far lower than live-action production because sets, crews and equipment are replaced by AI generation. A typical first season can be produced for a few hundred dollars in generation credits, and Lollipop Drama provides a free starter allowance so you can test a concept before spending anything.",
    creatingFaq3Q: "How do creators earn money on Lollipop Drama?",
    creatingFaq3A:
      "Creators keep 80% of the revenue generated by their dramas, one of the highest revenue shares in the industry. Earnings come from episode unlocks and creator subscriptions, and top creators receive additional monthly bonuses based on viewership.",
  },
  distribution: distributionMessages.en,
  login: loginMessages.en,
};

export type TranslationMessages = typeof enMessages;

const translations: Record<Locale, TranslationMessages> = {
  en: enMessages,
  "zh-CN": {
    common: {
      brand: "Lollipop Drama",
      language: "语言",
      contactUs: "联系我们",
      appStore: "App Store",
      googlePlay: "Google Play",
      freeToDownload: "免费下载",
      noAdsInPremium: "Premium 无广告",
      scanToDownload: "扫码下载",
      pointCameraAtQr: "打开相机，对准二维码",
      stayUpdated: "获取更新",
      getReleaseAlerts: "订阅最新上新通知",
      emailPlaceholder: "your@email.com",
      go: "订阅",
      subscribedSuccess: "订阅成功！",
      privacyPolicy: "隐私政策",
      termsOfService: "服务条款",
      allRightsReserved: "保留所有权利。",
      downloadOnThe: "下载自",
      getItOn: "获取于",
      loading: "加载中...",
      loadFailed: "加载失败，请重试。",
      retry: "重试",
    },
    navbar: {
      links: {
        home: "首页",
        creating: "创作", // TODO(verify) Creating 中文用词
        download: "下载",
        blog: "博客",
        contact: "联系我们",
      },
      signUp: "注册",
      logIn: "登录",
      account: "账户",
      logOut: "退出登录",
    },
    hero: {
      bannerAlt: ["Lollipop 横幅 1", "Lollipop 横幅 2"],
      taglineLine1: "观看短剧 · 人人可创作 · 创作可变现",
    taglineLine2: "消费即激励 · 下一代海外内容生态平台",
      stats: [
        { label: "精品短剧" },
        { label: "全球用户" },
        { label: "国家和地区" },
      ],
      aiSummary: "Lollipop Drama是AI驱动的短剧创作与消费平台。通过LunoTV 1.5实现文生视频，创作者享受80%收益分成，覆盖全球100+国家和100万+用户。",
      quickLinks: { blog: "博客", genres: "分类", popular: "热门", aiTools: "AI 工具" },
    },
    trending: {
      eyebrow: "热门趋势",
      title: "全网爆款 · 实时更新",
      description: "基于全球热度与评分精选，带你直达最火短剧。",
      shows: [
        { title: "Temptation CEO", genre: "爱情 · 复仇", meta: "80 集 · 5200万观看" },
        { title: "The Bride Who Fell from the Sky", genre: "爱情 · 奇幻", meta: "60 集 · 3800万观看" },
        { title: "The Revenge of the Plus-Size Wife", genre: "爱情 · 复仇", meta: "100 集 · 6700万观看" },
        { title: "My Royal Alpha Boyfriend", genre: "爱情 · 奇幻", meta: "50 集 · 2900万观看" },
        { title: "Dark Secrets", genre: "悬疑 · 剧情", meta: "70 集 · 4400万观看" },
        { title: "Why Jump Off the Building", genre: "悬疑 · 推理", meta: "90 集 · 4100万观看" },
      ],
    },
    newReleases: {
      eyebrow: "本周上新",
      title: "最新首发 · 抢先观看",
      description: "每周持续上线独家新作，总有一部会让你停不下来。",
      badge: "NEW",
      shows: [
        { title: "Crimson Dynasty", genre: "古装 · 权谋", meta: "45 集" },
        { title: "Neon Abyss", genre: "科幻 · 惊悚", meta: "36 集" },
        { title: "Whispered Love", genre: "爱情 · 剧情", meta: "55 集" },
        { title: "The Forgotten", genre: "悬疑 · 惊悚", meta: "40 集" },
        { title: "Iron Will", genre: "动作 · 武侠", meta: "48 集" },
        { title: "Cloud Atlas", genre: "奇幻 · 冒险", meta: "60 集" },
      ],
    },
    aiFeatures: {
      eyebrow: "AI 创作引擎",
      title: "用 AI 创作，在 Lollipop 播放",
      description: "Lollipop 将先进的 AI 创作工具带给每一位讲故事的人，让你从生成、编辑到发布都能直达全球观众。",
      features: [
        {
          title: "AI 图片生成",
          desc: "输入文字即可生成高质量场景画面，让灵感快速变成可用镜头。",
        },
        {
          title: "AI 换脸",
          desc: "依托深度学习实现自然换脸，保证角色连续性与观感统一。",
        },
        {
          title: "AI 视频创作",
          desc: "把脚本快速生成电影感短片，自动补齐转场、特效与配音。",
        },
        {
          title: "风格迁移",
          desc: "一键应用电影级调色与视觉风格，轻松做出更成熟的成片效果。",
        },
      ],
    },
    genres: {
      eyebrow: "按题材探索",
      title: "找到你的心头好",
      description: "数十种热门题材随心挑选，想看什么都能很快找到。",
      items: [
        { name: "爱情", count: "320+ 部剧集" },
        { name: "复仇", count: "180+ 部剧集" },
        { name: "惊悚", count: "150+ 部剧集" },
        { name: "霸总", count: "260+ 部剧集" },
        { name: "奇幻", count: "120+ 部剧集" },
        { name: "动作", count: "90+ 部剧集" },
        { name: "恐怖", count: "85+ 部剧集" },
        { name: "科幻", count: "75+ 部剧集" },
        { name: "家庭", count: "110+ 部剧集" },
        { name: "古装", count: "95+ 部剧集" },
      ],
    },
    whyChoose: {
      eyebrow: "为什么选择 Lollipop",
      title: "为什么选择 Lollipop",
      description: "我们重新定义短剧体验，让每一分钟都更沉浸、更精致、更值得停留。",
      features: [
        {
          title: "短时高能剧集",
          desc: "1-3 分钟一集，专为移动端设计，通勤、午休、睡前都能轻松追。",
        },
        {
          title: "离线观看",
          desc: "提前下载喜欢的内容，没有网络也能继续追剧不掉线。",
        },
        {
          title: "多语言字幕",
          desc: "覆盖全球用户的字幕体验，让来自世界各地的故事都没有门槛。",
        },
        {
          title: "高品质制作",
          desc: "电影级视觉、节奏与表演，让每一部短剧都更有沉浸感。",
        },
        {
          title: "每日免费剧集",
          desc: "每天都有免费内容可看，Premium 用户还能畅享全部剧集。",
        },
        {
          title: "纯净无广告",
          desc: "减少打扰，把每一次情绪推进和反转都完整保留下来。",
        },
      ],
    },
    web3: {
      eyebrow: "区块链娱乐",
      titlePrefix: "WEB2",
      titleHighlight: "WEB3",
      floatingTags: ["RWA", "NFT", "DeFi", "Token", "DAO", "元宇宙"],
      stats: [
        { label: "代币持有者" },
        { label: "已铸造 NFT" },
        { label: "链上合作伙伴" },
      ],
      paragraphs: [
        "Lollipop 通过 RWA 重构影视价值体系，打造去中心化的平行娱乐宇宙，推动娱乐产业走向“可量化、可流通、可分配”的新时代。",
        "在这里，内容不再只是内容，而是持续增长的数字资产；观看也不只是观看，而是价值共创的一部分。",
        "Lollipop 正点亮全球屏幕，揭示下一次万亿美元级娱乐机会。",
      ],
    },
    testimonials: {
      eyebrow: "用户评价",
      title: "全球数百万用户的共同选择",
      reviews: [
        {
          name: "Sarah M.",
          role: "Premium · 美国",
          text: "我已经完全上头了，反转和悬念设计得太厉害了，一个周末就刷完了三部。",
        },
        {
          name: "James L.",
          role: "VIP · 英国",
          text: "短剧能做到这种制作水准真的惊艳，有些内容完全像高规格原创剧。",
        },
        {
          name: "Emily R.",
          role: "Premium · 加拿大",
          text: "终于有一款真正适合现代节奏的 App，午休、通勤、睡前都能随时看。",
        },
        {
          name: "David K.",
          role: "VIP · 澳大利亚",
          text: "我从免费版开始，两天就升级了，光独家内容就已经值回票价。",
        },
        {
          name: "Mei L.",
          role: "Premium · 新加坡",
          text: "AI 创作工具非常强大，我几小时内就做出了第一部短剧。",
        },
        {
          name: "Carlos R.",
          role: "VIP · 巴西",
          text: "多语言字幕体验非常好，离线下载功能在飞行途中也特别实用。",
        },
        {
          name: "Yuki T.",
          role: "Premium · 日本",
          text: "作为创作者，这里的分成非常有竞争力，几个月的收入就超过其他平台一整年。",
        },
        {
          name: "Anna P.",
          role: "VIP · 德国",
          text: "原本不太相信短剧平台也能有 4K 观感，但画面质感真的很电影化。",
        },
      ],
    },
    creator: {
      eyebrow: "创作者计划",
      title: "成为下一个百万播放创作者",
      description: "Lollipop 提供行业领先的分成机制与全流程创作支持，让优质创作者真正获得持续回报。",
      benefits: [
        "80% 收益分成，行业领先",
        "完整开放 AI 创作工具包",
        "专属创作者成长支持",
        "覆盖 100+ 国家和地区的全球分发",
        "头部创作者每月额外奖励",
      ],
      stats: [
        { label: "收益分成", desc: "行业领先的创作者收入" },
        { label: "优质创作者", desc: "持续扩大的全球创作社区" },
        { label: "月均收益", desc: "面向头部创作者" },
        { label: "成功案例", desc: "已有创作者突破 100 万播放" },
      ],
    },
    downloadCta: {
      eyebrow: "现已上线",
      title: "你的下一部上头短剧，只差一次点击",
      description: "加入全球数百万观众，免费下载并立即获得 7 天 Premium 体验，无需承诺。",
      featuredTitle: "下载 Lollipop",
      featuredDescription: "支持 iOS 与 Android，提供 4K 播放、离线缓存与 15000+ 精品短剧。",
      featuredShowTitle: "Obsessed With My Boss · 第 2 部",
      featuredTimer: "0:42",
      notification: "新剧更新！",
      rating: "4.9",
      stats: [
        { value: "2M+", label: "下载量" },
        { value: "4.9★", label: "应用评分" },
        { value: "100+", label: "覆盖国家" },
        { value: "99.9%", label: "服务可用率" },
      ],
    },
    about: {
      heroTitle: "关于",
      heroHighlight: "Lollipop",
      heroSubtitle: "开启全球短剧娱乐新时代",
      companyTitle: "公司概览",
      companySub: "一个连接创作者与观众的全球化短剧平台",
      companyParagraphs: [
        "Lollipop 由香港 Nyx Entertainment Group 与韩国文化投资基金共同打造，战略目标是通过联合出品与国际合作系统性推动 K-Contents 走向全球。",
        "平台正积极拓展中国、日本、北美、欧洲、东南亚及中东等多元市场，并加速本地化运营布局。",
      ],
      companyStats: [
        { num: "100万+", label: "全球用户" },
        { num: "10万+", label: "优质创作者" },
        { num: "100+", label: "国家" },
      ],
      teamTitle: "核心团队",
      teamSub: "驱动娱乐创新的世界级领导团队",
      team: [
        { name: "James C.", role: "联合创始人", desc: "深耕娱乐与科技领域，拥有丰富行业经验。" },
        { name: "Sarah L.", role: "运营", desc: "擅长多市场增长与全球化运营。" },
        { name: "David P.", role: "技术", desc: "专注 AI 与分布式系统，具备深厚工程背景。" },
        { name: "Emily W.", role: "财务", desc: "拥有丰富战略投资与财务管理经验。" },
      ],
      partnersTitle: "战略合作伙伴",
      partnersSub: "与全球行业领先者共同协作",
      partners: [
        { name: "TechVentures Capital", desc: "聚焦亚太新兴科技与数字媒体投资的领先风投机构。" },
        { name: "AsiaMedia Group", desc: "覆盖流媒体、影视制作与艺人管理的泛亚洲媒体集团。" },
        { name: "GlobalStream Inc.", desc: "提供稳定 4K 流媒体能力的云基础设施与 CDN 服务商。" },
        { name: "Dragon Pictures", desc: "专注高品质短剧与原创内容的获奖影视工作室。" },
        { name: "PixelForge Studios", desc: "为全球头部娱乐项目提供特效与后期制作支持。" },
        { name: "SilkRoad Entertainment", desc: "连接东西方叙事市场的跨文化内容发行伙伴。" },
        { name: "Horizon Digital", desc: "面向娱乐品牌的 AI 驱动营销与获客平台。" },
        { name: "StarLight Ventures", desc: "支持下一代创作者经济创业公司的战略投资与孵化机构。" },
      ],
    },
    contact: {
      title: "联系我们",
      subtitle: "通过以下任一渠道联系我们",
      cards: [
        { title: "电话", detail: "+65 80742120" },
        { title: "邮箱", detail: "business@lollipop.im" },
        { title: "Telegram", detail: "联系我们" },
        { title: "WhatsApp", detail: "联系我们" },
        { title: "商务联系", detail: "business@lollipop.im" },
        { title: "联系客服", detail: "service@lollipop.im" },
      ],
    },
    footer: {
      titles: {
        contact: "联系方式",
        website: "网站",
        languages: "服务",
      },
      links: {
        home: "首页",
        aboutUs: "关于我们",
        creating: "创作",
        download: "下载",
        contactUs: "联系我们",
      },
      address: "3 GAMBAS CRESCENT, #04-01, NORDCOM ONE, SINGAPORE 757088",
    },
    videoModal: {
      title: "预告即将上线",
      description: "完整剧集请在 App 内观看",
    },
    dynamicPages: {
      backToHome: "返回首页",
      home: "首页",
      blog: "博客",
      genres: "品类",
      backToBlog: "返回博客",
      explore: "探索",
      notFoundGenre: "未找到该品类。",
      notFoundDrama: "未找到该剧集。",
      notFoundRegion: "未找到该地区。",
      notFoundArticle: "未找到该文章。",
      shortDrames: "短剧",
      exploreOtherGenres: "探索其他品类",
      moreDramasComingSoon: "更多{0}短剧即将上线，敬请期待每周更新！",
      ep: "集",
      synopsis: "剧情简介",
      relatedDramas: "你可能喜欢的剧集",
      watchOnLollipop: "在 Lollipop Drama 观看",
      downloadApp: "下载 App",
      views: "次观看",
      episodes: "集",
      market: "市场",
      shortDramasIn: "{0}短剧",
      popularIn: "{0}热门剧集",
      paymentMethodsIn: "{0}支付方式",
      localTips: "本地提示",
      startWatchingIn: "在{0}开始观看",
      downloadFree: "免费下载",
      availableInOtherRegions: "可用的其他地区",
      lollipopBlog: "Lollipop Drama 博客",
      insightsGuidesTrends: "洞察、指南与趋势",
      blogDescription: "深入探讨 AI 短剧、创作者经济和移动娱乐的未来。",
      allPosts: "全部文章",
      industryInsights: "行业洞察",
      creatorEconomy: "创作者经济",
      creatorGuides: "创作者指南",
      readMore: "阅读更多",
      updated: "更新于：",
      previous: "上一篇",
      next: "下一篇",
      downloadAppDesc: "下载 Lollipop Drama，畅享 15000+ 精品短剧。免费下载，无需订阅即可开始观看。",
      organizationName: "Lollipop Drama",
      howToGuides: "操作指南",
      relatedPosts: "相关文章",
      workflowGuides: "制作工作流",
      productionGuides: "制作排期",
      distributionGuides: "发行与变现",
      difficulty: "难度",
      stepsCount: "{0} 个步骤",
      beginner: "入门",
      intermediate: "进阶",
      advanced: "高阶",
      unitMinutes: "分钟",
      unitHours: "小时",
      unitDays: "天",
      genreWhyTitle: "为什么在 Lollipop Drama 观看{0}短剧",
      genreWhyBody:
        "Lollipop Drama 把{0}短剧拆解成 1 到 3 分钟的竖屏分集，通勤路上或喝杯咖啡的时间就能看完一条完整故事线。全部剧集支持高清在线播放，无需下载安装，每天都有新集更新；AI 生成原创剧与真人实拍剧同库并存，为{0}题材爱好者提供比单一制片方更丰富的片库，并支持多语言字幕与竖屏全屏播放。",
      genreFaqTitle: "{0}短剧常见问题",
      genreFaq1Q: "Lollipop Drama 上有多少部{0}短剧？",
      genreFaq1A:
        "片库每周都在扩充。页面顶部显示的数量即为当前可观看的{0}短剧总数，AI 原创剧与真人短剧每天都有新集上线。",
      genreFaq2Q: "观看{0}短剧需要付费吗？",
      genreFaq2A:
        "下载 Lollipop Drama 完全免费，也不需要订阅即可开始观看。部分{0}剧集可免费播放，付费分集可通过应用内购买或创作者订阅解锁。",
      genreFaq3Q: "单集{0}短剧有多长？",
      genreFaq3A:
        "绝大多数{0}短剧单集时长在 1 到 3 分钟之间，整季通常为 50 到 100 集，总时长接近一部电影，但以适合手机观看的碎片化方式呈现。",
      downloadWhyTitle: "为什么要下载 Lollipop Drama 应用",
      downloadWhyBody:
        "手机应用是最快的观看方式：剧集竖屏全屏秒开，播放清晰度随网络自动适配，新剧上线即时推送到你的设备。收藏夹、观看进度与创作者订阅在手机和平板之间自动同步，通勤路上开始的一集，回家可以接着看完。",
      downloadFaqTitle: "Lollipop Drama 应用常见问题",
      downloadFaq1Q: "Lollipop Drama 应用是免费下载的吗？",
      downloadFaq1A:
        "是的。Lollipop Drama 在 iOS 与 Android 上均可免费下载，开始观看无需订阅。部分短剧可免费播放，付费分集通过应用内购买解锁，没有隐藏的订阅绑定。",
      downloadFaq2Q: "可以离线观看吗？",
      downloadFaq2A:
        "可以。Premium 订阅用户可将剧集下载到设备，离线以最高 4K 清晰度观看，适合通勤或网络不稳定的出行场景。",
      downloadFaq3Q: "Lollipop Drama 在哪些国家和地区可用？",
      downloadFaq3A:
        "Lollipop Drama 已在全球 100 多个国家和地区上线。受版权授权影响，各地区的剧集会有差异，你看到的片库可能因下载地区不同而略有不同。",
      downloadFaq4Q: "Lollipop Drama 支持哪些设备？",
      downloadFaq4A:
        "Lollipop Drama 支持 iOS 15 及以上、Android 8 及以上的手机与平板，针对竖屏全屏播放做了优化。同一账号可在多台设备登录，观看进度自动同步。应用体积小，低配机型也能流畅运行，无需高端硬件。",
      creatingFaqTitle: "AI 短剧创作常见问题",
      creatingFaq1Q: "没有制作经验，可以创作 AI 短剧吗？",
      creatingFaq1A:
        "完全可以。创作工具包就是为零基础创作者设计的：写或改编一份脚本，用文字提示词生成场景画面，通过换脸保持角色一致性，再由流水线自动补齐转场、特效与配音。多数创作者在一天内就能发布第一集。平台内置分镜模板与参数预设，照着提示走即可完成首部作品。",
      creatingFaq2Q: "制作一部 AI 短剧需要多少成本？",
      creatingFaq2A:
        "成本远低于真人实拍：场景、剧组和设备都由 AI 生成替代，一季内容的生成额度通常只需几百美元。Lollipop Drama 还提供免费的新手额度，你可以先验证创意再决定是否投入；预算全程可控，随时可以中止，试错成本极低。",
      creatingFaq3Q: "创作者如何在 Lollipop Drama 获得收益？",
      creatingFaq3A:
        "创作者可获得作品收入的 80% 分成，属于行业领先水平。收益来自分集解锁与创作者订阅，头部创作者还会根据播放表现获得额外的月度奖励。收益按自然月结算，明细可在创作者后台实时查看。",
    },
    distribution: distributionMessages["zh-CN"],
    login: loginMessages["zh-CN"],
  },
  "zh-TW": {
    common: {
      brand: "Lollipop Drama",
      language: "語言",
      contactUs: "聯絡我們",
      appStore: "App Store",
      googlePlay: "Google Play",
      freeToDownload: "免費下載",
      noAdsInPremium: "Premium 無廣告",
      scanToDownload: "掃碼下載",
      pointCameraAtQr: "開啟相機，對準二維碼",
      stayUpdated: "獲取更新",
      getReleaseAlerts: "訂閱最新上新通知",
      emailPlaceholder: "your@email.com",
      go: "訂閱",
      subscribedSuccess: "訂閱成功！",
      privacyPolicy: "隱私政策",
      termsOfService: "服務條款",
      allRightsReserved: "保留所有權利。",
      downloadOnThe: "下載自",
      getItOn: "獲取於",
      loading: "載入中...",
      loadFailed: "載入失敗，請重試。",
      retry: "重試",
    },
    navbar: {
      links: {
        home: "首頁",
        creating: "創作", // TODO(verify) Creating 中文用詞
        download: "下載",
        blog: "部落格",
        contact: "聯絡我們",
      },
      signUp: "註冊",
      logIn: "登入",
      account: "帳號",
      logOut: "退出登入",
    },
    hero: {
      bannerAlt: ["Lollipop 橫幅 1", "Lollipop 橫幅 2"],
      taglineLine1: "觀看短劇 · 人人可創作 · 創作可變現",
    taglineLine2: "消費即激勵 · 下一代海外內容生態平台",
      stats: [
        { label: "精品短劇" },
        { label: "全球用戶" },
        { label: "國家與地區" },
      ],
      aiSummary: "Lollipop Drama是AI驅動的短劇創作與消費平台。透過LunoTV 1.5實現文生影片，創作者享受80%收益分成，覆蓋全球100+國家和100萬+用戶。",
      quickLinks: { blog: "部落格", genres: "分類", popular: "熱門", aiTools: "AI 工具" },
    },
    trending: {
      eyebrow: "熱門趨勢",
      title: "全網爆款 · 即時更新",
      description: "依據全球觀看數據與評分精選，把當下最火的短劇帶給你。",
      shows: [
        { title: "Temptation CEO", genre: "愛情 · 復仇", meta: "80 集 · 5200萬觀看" },
        { title: "The Bride Who Fell from the Sky", genre: "愛情 · 奇幻", meta: "60 集 · 3800萬觀看" },
        { title: "The Revenge of the Plus-Size Wife", genre: "愛情 · 復仇", meta: "100 集 · 6700萬觀看" },
        { title: "My Royal Alpha Boyfriend", genre: "愛情 · 奇幻", meta: "50 集 · 2900萬觀看" },
        { title: "Dark Secrets", genre: "懸疑 · 劇情", meta: "70 集 · 4400萬觀看" },
        { title: "Why Jump Off the Building", genre: "懸疑 · 推理", meta: "90 集 · 4100萬觀看" },
      ],
    },
    newReleases: {
      eyebrow: "本週上新",
      title: "最新首發 · 搶先觀看",
      description: "每週持續上線獨家新作，總有一部會讓你停不下來。",
      badge: "NEW",
      shows: [
        { title: "Crimson Dynasty", genre: "古裝 · 權謀", meta: "45 集" },
        { title: "Neon Abyss", genre: "科幻 · 驚悚", meta: "36 集" },
        { title: "Whispered Love", genre: "愛情 · 劇情", meta: "55 集" },
        { title: "The Forgotten", genre: "懸疑 · 驚悚", meta: "40 集" },
        { title: "Iron Will", genre: "動作 · 武俠", meta: "48 集" },
        { title: "Cloud Atlas", genre: "奇幻 · 冒險", meta: "60 集" },
      ],
    },
    aiFeatures: {
      eyebrow: "AI 創作引擎",
      title: "用 AI 創作，在 Lollipop 播放",
      description: "Lollipop 將先進 AI 工具帶給每位說故事的人，讓你從生成、編輯到發布都能直達全球觀眾。",
      features: [
        {
          title: "AI 圖像生成",
          desc: "輸入文字即可生成高質量場景畫面，讓靈感快速變成可用鏡頭。",
        },
        {
          title: "AI 換臉",
          desc: "依託深度學習實現自然換臉，確保角色連續性與觀感一致。",
        },
        {
          title: "AI 影片創作",
          desc: "把腳本快速生成電影感短片，自動補齊轉場、特效與配音。",
        },
        {
          title: "風格遷移",
          desc: "一鍵套用電影級調色與視覺風格，讓成片更成熟完整。",
        },
      ],
    },
    genres: {
      eyebrow: "按題材探索",
      title: "找到你的心頭好",
      description: "數十種熱門題材隨心挑選，想看什麼都能很快找到。",
      items: [
        { name: "愛情", count: "320+ 部劇集" },
        { name: "復仇", count: "180+ 部劇集" },
        { name: "驚悚", count: "150+ 部劇集" },
        { name: "霸總", count: "260+ 部劇集" },
        { name: "奇幻", count: "120+ 部劇集" },
        { name: "動作", count: "90+ 部劇集" },
        { name: "恐怖", count: "85+ 部劇集" },
        { name: "科幻", count: "75+ 部劇集" },
        { name: "家庭", count: "110+ 部劇集" },
        { name: "古裝", count: "95+ 部劇集" },
      ],
    },
    whyChoose: {
      eyebrow: "為什麼選擇 Lollipop",
      title: "為什麼選擇 Lollipop",
      description: "我們重新定義短劇體驗，讓每一分鐘都更沉浸、更精緻、更值得停留。",
      features: [
        {
          title: "短時高能劇集",
          desc: "1-3 分鐘一集，專為行動端設計，通勤、午休、睡前都能輕鬆追。",
        },
        {
          title: "離線觀看",
          desc: "先下載喜歡的內容，即使沒有網路也能繼續追劇。",
        },
        {
          title: "多語字幕",
          desc: "覆蓋全球觀眾的字幕體驗，讓世界各地的故事都沒有門檻。",
        },
        {
          title: "高品質製作",
          desc: "電影級視覺、節奏與表演，讓每一部短劇都更有沉浸感。",
        },
        {
          title: "每日免費劇集",
          desc: "每天都有免費內容可看，Premium 用戶還能暢享全部劇集。",
        },
        {
          title: "純淨無廣告",
          desc: "減少打擾，把每一次情緒推進與反轉完整保留下來。",
        },
      ],
    },
    web3: {
      eyebrow: "區塊鏈娛樂",
      titlePrefix: "WEB2",
      titleHighlight: "WEB3",
      floatingTags: ["RWA", "NFT", "DeFi", "Token", "DAO", "元宇宙"],
      stats: [
        { label: "代幣持有者" },
        { label: "已鑄造 NFT" },
        { label: "鏈上合作夥伴" },
      ],
      paragraphs: [
        "Lollipop 透過 RWA 重構影視價值體系，打造去中心化的平行娛樂宇宙，推動娛樂產業走向「可量化、可流通、可分配」的新時代。",
        "在這裡，內容不再只是內容，而是持續增長的數位資產；觀看也不只是觀看，而是價值共創的一部分。",
        "Lollipop 正點亮全球螢幕，揭示下一個兆美元級娛樂機會。",
      ],
    },
    testimonials: {
      eyebrow: "用戶評價",
      title: "全球數百萬用戶的共同選擇",
      reviews: [
        {
          name: "Sarah M.",
          role: "Premium · 美國",
          text: "我已經完全上頭了，反轉和懸念設計得太厲害，一個週末就刷完三部。",
        },
        {
          name: "James L.",
          role: "VIP · 英國",
          text: "短劇能做到這種製作水準真的很驚艷，有些內容完全像高規格原創劇。",
        },
        {
          name: "Emily R.",
          role: "Premium · 加拿大",
          text: "終於有一款真正符合現代節奏的 App，午休、通勤、睡前都能隨時看。",
        },
        {
          name: "David K.",
          role: "VIP · 澳洲",
          text: "我從免費版開始，兩天就升級了，光獨家內容就已經值回票價。",
        },
        {
          name: "Mei L.",
          role: "Premium · 新加坡",
          text: "AI 創作工具非常強大，我幾小時內就做出了第一部短劇。",
        },
        {
          name: "Carlos R.",
          role: "VIP · 巴西",
          text: "多語字幕體驗很好，離線下載功能在飛行途中也特別實用。",
        },
        {
          name: "Yuki T.",
          role: "Premium · 日本",
          text: "身為創作者，這裡的分成非常有競爭力，幾個月收入就超過其他平台一整年。",
        },
        {
          name: "Anna P.",
          role: "VIP · 德國",
          text: "原本不太相信短劇平台也能有 4K 質感，但畫面真的很電影化。",
        },
      ],
    },
    creator: {
      eyebrow: "創作者計畫",
      title: "成為下一個百萬播放創作者",
      description: "Lollipop 提供行業領先的分成機制與全流程創作支持，讓優質創作者真正獲得持續回報。",
      benefits: [
        "80% 收益分成，行業領先",
        "完整開放 AI 創作工具包",
        "專屬創作者成長支持",
        "覆蓋 100+ 國家與地區的全球分發",
        "頭部創作者每月額外獎勵",
      ],
      stats: [
        { label: "收益分成", desc: "行業領先的創作者收入" },
        { label: "優質創作者", desc: "持續擴大的全球創作社群" },
        { label: "月均收益", desc: "面向頭部創作者" },
        { label: "成功案例", desc: "已有創作者突破 100 萬播放" },
      ],
    },
    downloadCta: {
      eyebrow: "現已上線",
      title: "你的下一部上頭短劇，只差一次點擊",
      description: "加入全球數百萬觀眾，免費下載並立即獲得 7 天 Premium 體驗，無需承諾。",
      featuredTitle: "下載 Lollipop",
      featuredDescription: "支援 iOS 與 Android，提供 4K 播放、離線快取與 15000+ 精品短劇。",
      featuredShowTitle: "Obsessed With My Boss · 第 2 部",
      featuredTimer: "0:42",
      notification: "新劇更新！",
      rating: "4.9",
      stats: [
        { value: "2M+", label: "下載量" },
        { value: "4.9★", label: "應用評分" },
        { value: "100+", label: "覆蓋國家" },
        { value: "99.9%", label: "服務可用率" },
      ],
    },
    about: {
      heroTitle: "關於",
      heroHighlight: "Lollipop",
      heroSubtitle: "開啟全球短劇娛樂新時代",
      companyTitle: "公司概覽",
      companySub: "一個連結創作者與觀眾的全球化短劇平台",
      companyParagraphs: [
        "Lollipop 由香港 Nyx Entertainment Group 與韓國文化投資基金共同打造，戰略目標是透過聯合出品與國際合作系統性推動 K-Contents 走向全球。",
        "平台正積極拓展中國、日本、北美、歐洲、東南亞及中東等多元市場，並加速本地化營運布局。",
      ],
      companyStats: [
        { num: "100萬+", label: "全球用戶" },
        { num: "10萬+", label: "優質創作者" },
        { num: "100+", label: "國家" },
      ],
      teamTitle: "核心團隊",
      teamSub: "驅動娛樂創新的世界級領導團隊",
      team: [
        { name: "James C.", role: "聯合創始人", desc: "深耕娛樂與科技領域，擁有豐富行業經驗。" },
        { name: "Sarah L.", role: "營運", desc: "擅長多市場增長與全球化營運。" },
        { name: "David P.", role: "技術", desc: "專注 AI 與分散式系統，具備深厚工程背景。" },
        { name: "Emily W.", role: "財務", desc: "擁有豐富策略投資與財務管理經驗。" },
      ],
      partnersTitle: "戰略合作夥伴",
      partnersSub: "與全球產業領先者共同協作",
      partners: [
        { name: "TechVentures Capital", desc: "聚焦亞太新興科技與數位媒體投資的領先創投機構。" },
        { name: "AsiaMedia Group", desc: "涵蓋串流、影視製作與藝人管理的泛亞洲媒體集團。" },
        { name: "GlobalStream Inc.", desc: "提供穩定 4K 串流能力的雲端基礎設施與 CDN 服務商。" },
        { name: "Dragon Pictures", desc: "專注高品質短劇與原創內容的獲獎影視工作室。" },
        { name: "PixelForge Studios", desc: "為全球頭部娛樂項目提供特效與後期製作支持。" },
        { name: "SilkRoad Entertainment", desc: "連結東西方敘事市場的跨文化內容發行夥伴。" },
        { name: "Horizon Digital", desc: "面向娛樂品牌的 AI 驅動行銷與獲客平台。" },
        { name: "StarLight Ventures", desc: "支持下一代創作者經濟公司的戰略投資與孵化機構。" },
      ],
    },
    contact: {
      title: "聯絡我們",
      subtitle: "透過以下任一渠道聯絡我們",
      cards: [
        { title: "電話", detail: "+65 80742120" },
        { title: "電子郵件", detail: "business@lollipop.im" },
        { title: "Telegram", detail: "聯絡我們" },
        { title: "WhatsApp", detail: "聯絡我們" },
        { title: "商務聯繫", detail: "business@lollipop.im" },
        { title: "聯絡客服", detail: "service@lollipop.im" },
      ],
    },
    footer: {
      titles: {
        contact: "聯絡方式",
        website: "網站",
        languages: "服務",
      },
      links: {
        home: "首頁",
        aboutUs: "關於我們",
        creating: "創作",
        download: "下載",
        contactUs: "聯絡我們",
      },
      address: "3 GAMBAS CRESCENT, #04-01, NORDCOM ONE, SINGAPORE 757088",
    },
    videoModal: {
      title: "預告即將上線",
      description: "完整劇集請在 App 內觀看",
    },
    dynamicPages: {
      backToHome: "返回首頁",
      home: "首頁",
      blog: "部落格",
      genres: "品類",
      backToBlog: "返回部落格",
      explore: "探索",
      notFoundGenre: "未找到該品類。",
      notFoundDrama: "未找到該劇集。",
      notFoundRegion: "未找到該地區。",
      notFoundArticle: "未找到該文章。",
      shortDrames: "短劇",
      exploreOtherGenres: "探索其他品類",
      moreDramasComingSoon: "更多{0}短劇即將上線，敬請期待每週更新！",
      ep: "集",
      synopsis: "劇情簡介",
      relatedDramas: "你可能喜歡的劇集",
      watchOnLollipop: "在 Lollipop Drama 觀看",
      downloadApp: "下載 App",
      views: "次觀看",
      episodes: "集",
      market: "市場",
      shortDramasIn: "{0}短劇",
      popularIn: "{0}熱門劇集",
      paymentMethodsIn: "{0}支付方式",
      localTips: "本地提示",
      startWatchingIn: "在{0}開始觀看",
      downloadFree: "免費下載",
      availableInOtherRegions: "可用的其他地區",
      lollipopBlog: "Lollipop Drama 部落格",
      insightsGuidesTrends: "洞察、指南與趨勢",
      blogDescription: "深入探討 AI 短劇、創作者經濟和行動娛樂的未來。",
      allPosts: "全部文章",
      industryInsights: "行業洞察",
      creatorEconomy: "創作者經濟",
      creatorGuides: "創作者指南",
      readMore: "閱讀更多",
      updated: "更新於：",
      previous: "上一篇",
      next: "下一篇",
      downloadAppDesc: "下載 Lollipop Drama，暢享 15000+ 精品短劇。免費下載，無需訂閱即可開始觀看。",
      organizationName: "Lollipop Drama",
      howToGuides: "操作指南",
      relatedPosts: "相關文章",
      workflowGuides: "製作工作流",
      productionGuides: "製作排期",
      distributionGuides: "發行與變現",
      difficulty: "難度",
      stepsCount: "{0} 個步驟",
      beginner: "入門",
      intermediate: "進階",
      advanced: "高階",
      unitMinutes: "分鐘",
      unitHours: "小時",
      unitDays: "天",
      genreWhyTitle: "為什麼在 Lollipop Drama 觀看{0}短劇",
      genreWhyBody:
        "Lollipop Drama 把{0}短劇拆解成 1 到 3 分鐘的直式分集，通勤路上或喝杯咖啡的時間就能看完一條完整故事線。全部劇集支援高畫質線上播放，無需下載安裝，每天都有新集更新；AI 生成原創劇與真人實拍劇同庫並存，為{0}題材愛好者提供比單一製片方更豐富的片庫，並支援多語言字幕與直式全螢幕播放。",
      genreFaqTitle: "{0}短劇常見問題",
      genreFaq1Q: "Lollipop Drama 上有多少部{0}短劇？",
      genreFaq1A:
        "片庫每週都在擴充。頁面頂部顯示的數量即為目前可觀看的{0}短劇總數，AI 原創劇與真人短劇每天都有新集上線。",
      genreFaq2Q: "觀看{0}短劇需要付費嗎？",
      genreFaq2A:
        "下載 Lollipop Drama 完全免費，也不需要訂閱即可開始觀看。部分{0}劇集可免費播放，付費分集可透過應用程式內購買或創作者訂閱解鎖。",
      genreFaq3Q: "單集{0}短劇有多長？",
      genreFaq3A:
        "絕大多數{0}短劇單集長度在 1 到 3 分鐘之間，整季通常為 50 到 100 集，總長度接近一部電影，但以適合手機觀看的碎片化方式呈現。",
      downloadWhyTitle: "為什麼要下載 Lollipop Drama 應用程式",
      downloadWhyBody:
        "手機應用程式是最快的觀看方式：劇集直式全螢幕秒開，播放畫質隨網路自動調整，新劇上線即時推送到你的裝置。收藏清單、觀看進度與創作者訂閱在手機和平板之間自動同步，通勤路上開始的一集，回家可以接著看完。",
      downloadFaqTitle: "Lollipop Drama 應用程式常見問題",
      downloadFaq1Q: "Lollipop Drama 應用程式是免費下載的嗎？",
      downloadFaq1A:
        "是的。Lollipop Drama 在 iOS 與 Android 上都可免費下載，開始觀看無需訂閱。部分短劇可免費播放，付費分集透過應用程式內購買解鎖，沒有隱藏的訂閱綁定。",
      downloadFaq2Q: "可以離線觀看嗎？",
      downloadFaq2A:
        "可以。Premium 訂閱用戶可將劇集下載到裝置，離線以最高 4K 畫質觀看，適合通勤或網路不穩定的出行情境。",
      downloadFaq3Q: "Lollipop Drama 在哪些國家和地區可用？",
      downloadFaq3A:
        "Lollipop Drama 已在全球 100 多個國家和地區上線。受版權授權影響，各地區的劇集會有差異，你看到的片庫可能因下載地區不同而略有不同。",
      downloadFaq4Q: "Lollipop Drama 支援哪些裝置？",
      downloadFaq4A:
        "Lollipop Drama 支援 iOS 15 以上、Android 8 以上的手機與平板，並針對直式全螢幕播放最佳化。同一帳號可在多台裝置登入，觀看進度自動同步。應用程式體積小，低階機型也能流暢執行，無需高階硬體。",
      creatingFaqTitle: "AI 短劇創作常見問題",
      creatingFaq1Q: "沒有製作經驗，可以創作 AI 短劇嗎？",
      creatingFaq1A:
        "完全可以。創作工具包就是為零基礎創作者設計的：撰寫或改編一份腳本，用文字提示詞生成場景畫面，透過換臉維持角色一致性，再由流水線自動補齊轉場、特效與配音。多數創作者在一天內就能發布第一集。平台內建分鏡範本與參數預設，照著提示走即可完成第一部作品。",
      creatingFaq2Q: "製作一部 AI 短劇需要多少成本？",
      creatingFaq2A:
        "成本遠低於真人實拍：場景、劇組和設備都由 AI 生成取代，一季內容的生成額度通常只需幾百美元。Lollipop Drama 還提供免費的新手額度，你可以先驗證創意再決定是否投入；預算全程可控，隨時可以中止，試錯成本極低。",
      creatingFaq3Q: "創作者如何在 Lollipop Drama 獲得收益？",
      creatingFaq3A:
        "創作者可獲得作品收入的 80% 分成，屬於業界領先水準。收益來自分集解鎖與創作者訂閱，頭部創作者還會依據播放表現獲得額外的月度獎勵。收益按自然月結算，明細可在創作者後台即時查看。",
    },
    distribution: distributionMessages["zh-TW"],
    login: loginMessages["zh-TW"],
  },
  pt: {
    common: {
      brand: "Lollipop Drama",
      language: "Idioma",
      contactUs: "Fale Conosco",
      appStore: "App Store",
      googlePlay: "Google Play",
      freeToDownload: "Download grátis",
      noAdsInPremium: "Sem anúncios no Premium",
      scanToDownload: "Escaneie para baixar",
      pointCameraAtQr: "Aponte a câmera para o QR code",
      stayUpdated: "Fique por dentro",
      getReleaseAlerts: "Receba alertas de lançamentos",
      emailPlaceholder: "seu@email.com",
      go: "Enviar",
      subscribedSuccess: "Inscrição realizada com sucesso!",
      privacyPolicy: "Política de Privacidade",
      termsOfService: "Termos de Serviço",
      allRightsReserved: "Todos os direitos reservados.",
      downloadOnThe: "Baixe na",
      getItOn: "BAIXE NO",
      loading: "Carregando...",
      loadFailed: "Falha ao carregar. Tente novamente.",
      retry: "Tentar novamente",
    },
    navbar: {
      links: {
        home: "Início",
        creating: "Criação", // TODO(verify) Creating 葡译
        download: "Baixar",
        blog: "Blog",
        contact: "Contato",
      },
      signUp: "Cadastrar",
      logIn: "Entrar",
      account: "Conta",
      logOut: "Sair",
    },
    hero: {
      bannerAlt: ["Banner Lollipop 1", "Banner Lollipop 2"],
      taglineLine1: "Assista Dramas Curtos. Crie. Monetize.",
    taglineLine2: "O ecossistema global de conteúdo da próxima geração.",
      stats: [
        { label: "Dramas Premium" },
        { label: "Usuários Globais" },
        { label: "Países e Regiões" },
      ],
      aiSummary: "Lollipop Drama e uma plataforma de criacao e streaming de dramas curtos com IA. Crie videos profissionais a partir de texto com LunoTV 1.5, ganhe 80% da receita e alcance mais de 1 milhao de usuarios em 100+ paises.",
      quickLinks: { blog: "Blog", genres: "Categorias", popular: "Populares", aiTools: "IA" },
    },
    trending: {
      eyebrow: "Em Alta Agora",
      title: "Dramas em Alta · Atualizados em Tempo Real",
      description: "Selecionados com base em audiência e avaliações globais para você descobrir o que realmente está bombando.",
      shows: [
        { title: "Temptation CEO", genre: "Romance · Vingança", meta: "80 eps · 52 mi visualizações" },
        { title: "The Bride Who Fell from the Sky", genre: "Romance · Fantasia", meta: "60 eps · 38 mi visualizações" },
        { title: "The Revenge of the Plus-Size Wife", genre: "Romance · Vingança", meta: "100 eps · 67 mi visualizações" },
        { title: "My Royal Alpha Boyfriend", genre: "Romance · Fantasia", meta: "50 eps · 29 mi visualizações" },
        { title: "Dark Secrets", genre: "Suspense · Drama", meta: "70 eps · 44 mi visualizações" },
        { title: "Why Jump Off the Building", genre: "Suspense · Mistério", meta: "90 eps · 41 mi visualizações" },
      ],
    },
    newReleases: {
      eyebrow: "Novidades da Semana",
      title: "Novos Lançamentos · Assista Primeiro",
      description: "Toda semana chegam estreias exclusivas, então sempre há algo novo para maratonar.",
      badge: "NOVO",
      shows: [
        { title: "Crimson Dynasty", genre: "Histórico · Intrigas de Poder", meta: "45 eps" },
        { title: "Neon Abyss", genre: "Ficção Científica · Suspense", meta: "36 eps" },
        { title: "Whispered Love", genre: "Romance · Drama", meta: "55 eps" },
        { title: "The Forgotten", genre: "Mistério · Suspense", meta: "40 eps" },
        { title: "Iron Will", genre: "Ação · Artes Marciais", meta: "48 eps" },
        { title: "Cloud Atlas", genre: "Fantasia · Aventura", meta: "60 eps" },
      ],
    },
    aiFeatures: {
      eyebrow: "Criação com IA",
      title: "Crie com IA, publique na Lollipop",
      description: "A Lollipop coloca ferramentas avançadas de IA nas mãos de cada contador de histórias, do conceito à publicação global.",
      features: [
        {
          title: "Geração de Imagens por IA",
          desc: "Transforme prompts em cenas impactantes e gere quadros prontos para produção em segundos.",
        },
        {
          title: "Troca de Rosto por IA",
          desc: "Substitua rostos com continuidade natural para narrativas curtas mais imersivas.",
        },
        {
          title: "Criação de Vídeo por IA",
          desc: "Converta roteiros em clipes cinematográficos com transições, efeitos e locuções automáticas.",
        },
        {
          title: "Transferência de Estilo",
          desc: "Aplique cores e estilos inspirados no cinema com um toque para um acabamento mais profissional.",
        },
      ],
    },
    genres: {
      eyebrow: "Explore por Gênero",
      title: "Encontre Seu Favorito",
      description: "Navegue por dezenas de categorias e vá direto para as histórias que combinam com seu humor.",
      items: [
        { name: "Romance", count: "320+ títulos" },
        { name: "Vingança", count: "180+ títulos" },
        { name: "Suspense", count: "150+ títulos" },
        { name: "Histórias de Bilionários", count: "260+ títulos" },
        { name: "Fantasia", count: "120+ títulos" },
        { name: "Ação", count: "90+ títulos" },
        { name: "Terror", count: "85+ títulos" },
        { name: "Ficção Científica", count: "75+ títulos" },
        { name: "Família", count: "110+ títulos" },
        { name: "Histórico", count: "95+ títulos" },
      ],
    },
    whyChoose: {
      eyebrow: "Por Que Lollipop",
      title: "Por Que Escolher a Lollipop",
      description: "Redefinimos a experiência de dramas curtos com algo mais imersivo, refinado e recompensador.",
      features: [
        {
          title: "Episódios Rápidos",
          desc: "Episódios de 1 a 3 minutos pensados para o celular, perfeitos para deslocamentos, pausas e maratonas rápidas.",
        },
        {
          title: "Visualização Offline",
          desc: "Baixe seus favoritos e continue assistindo em qualquer lugar, mesmo sem conexão.",
        },
        {
          title: "Legendas em Vários Idiomas",
          desc: "Curta histórias do mundo inteiro com uma experiência pensada para uma audiência global.",
        },
        {
          title: "Qualidade Premium",
          desc: "Visual cinematográfico, ritmo refinado e atuações profissionais em cada série.",
        },
        {
          title: "Episódios Grátis Todos os Dias",
          desc: "Desbloqueie novos episódios gratuitos diariamente, enquanto membros Premium têm acesso ilimitado.",
        },
        {
          title: "Experiência Sem Anúncios",
          desc: "Sem interrupções, só drama do primeiro quadro até o último cliffhanger.",
        },
      ],
    },
    web3: {
      eyebrow: "Entretenimento Blockchain",
      titlePrefix: "WEB2",
      titleHighlight: "WEB3",
      floatingTags: ["RWA", "NFT", "DeFi", "Token", "DAO", "Metaverso"],
      stats: [
        { label: "Detentores de Token" },
        { label: "NFTs Cunhados" },
        { label: "Parceiros na Blockchain" },
      ],
      paragraphs: [
        'A Lollipop usa RWA para reconstruir o sistema de valor do audiovisual, criando um universo descentralizado que leva o entretenimento a uma era "quantificável, circulável e distribuível".',
        "Aqui, conteúdo deixa de ser apenas conteúdo e passa a ser um ativo digital em crescimento. Assistir também se transforma em geração de valor.",
        "A Lollipop está iluminando telas ao redor do mundo e abrindo a porta para a próxima oportunidade trilionária do entretenimento.",
      ],
    },
    testimonials: {
      eyebrow: "Avaliações dos Usuários",
      title: "Amada por Milhões no Mundo Todo",
      reviews: [
        {
          name: "Sarah M.",
          role: "Premium · EUA",
          text: "Estou completamente viciada. Os cliffhangers são brilhantes e terminei três séries em um fim de semana.",
        },
        {
          name: "James L.",
          role: "VIP · Reino Unido",
          text: "A qualidade de produção é absurda para conteúdo curto. Alguns títulos parecem produções premium.",
        },
        {
          name: "Emily R.",
          role: "Premium · Canadá",
          text: "Finalmente um app que combina com minha rotina. Assisto no almoço, no metrô e antes de dormir.",
        },
        {
          name: "David K.",
          role: "VIP · Austrália",
          text: "Comecei no plano gratuito e subi para VIP em dois dias. Só os conteúdos exclusivos já valem a pena.",
        },
        {
          name: "Mei L.",
          role: "Premium · Singapura",
          text: "As ferramentas de IA são incríveis. Criei meu primeiro drama curto em poucas horas.",
        },
        {
          name: "Carlos R.",
          role: "VIP · Brasil",
          text: "As legendas multilíngues são excelentes e os downloads offline já me salvaram em vários voos.",
        },
        {
          name: "Yuki T.",
          role: "Premium · Japão",
          text: "Como criadora, a participação na receita aqui é imbatível. Ganhei em meses mais do que em um ano em outras plataformas.",
        },
        {
          name: "Anna P.",
          role: "VIP · Alemanha",
          text: "Eu duvidava de 4K em um app de drama curto, mas o visual é realmente cinematográfico.",
        },
      ],
    },
    creator: {
      eyebrow: "Programa de Criadores",
      title: "Torne-se o Próximo Criador de Milhões de Views",
      description: "A Lollipop oferece participação na receita de ponta e suporte criativo para que grandes criadores construam carreiras sustentáveis.",
      benefits: [
        "80% de participação na receita, entre as maiores do mercado",
        "Acesso total ao kit de criação com IA",
        "Suporte dedicado para sucesso do criador",
        "Distribuição global em mais de 100 países",
        "Bônus mensais para os melhores desempenhos",
      ],
      stats: [
        { label: "participação na receita", desc: "Ganhos de criadores em nível líder de mercado" },
        { label: "Criadores de Qualidade", desc: "Comunidade global em crescimento" },
        { label: "Ganho Médio Mensal", desc: "Para criadores de melhor desempenho" },
        { label: "Casos de Sucesso", desc: "Criadores que já chegaram a 1M+ reproduções" },
      ],
    },
    downloadCta: {
      eyebrow: "Disponível Agora",
      title: "Seu Próximo Vício Está a Um Toque",
      description: "Junte-se a milhões de espectadores. Baixe grátis e ganhe 7 dias de acesso Premium sem compromisso.",
      featuredTitle: "Baixe a Lollipop",
      featuredDescription: "Disponível em iOS e Android com streaming 4K, downloads offline e mais de 15.000 dramas premium.",
      featuredShowTitle: "Obsessed With My Boss · Pt.2",
      featuredTimer: "0:42",
      notification: "Novo episódio!",
      rating: "4.9",
      stats: [
        { value: "2M+", label: "Downloads" },
        { value: "4.9★", label: "Nota do App" },
        { value: "100+", label: "Países" },
        { value: "99.9%", label: "Disponibilidade" },
      ],
    },
    about: {
      heroTitle: "Sobre",
      heroHighlight: "Lollipop",
      heroSubtitle: "Abrindo uma nova era do entretenimento global em dramas curtos",
      companyTitle: "Visão Geral da Empresa",
      companySub: "Uma plataforma global de dramas curtos para criadores e audiências",
      companyParagraphs: [
        "A Lollipop é uma joint venture entre a Nyx Entertainment Group, de Hong Kong, e o Fundo Coreano de Investimento Cultural. O objetivo estratégico é levar K-Contents ao público global por meio de coproduções e parcerias internacionais.",
        "A plataforma está se expandindo pela China, Japão, América do Norte, Europa, Sudeste Asiático e Oriente Médio, acelerando estratégias localizadas de crescimento.",
      ],
      companyStats: [
        { num: "1M+", label: "Usuários Globais" },
        { num: "100K+", label: "Criadores de Qualidade" },
        { num: "100+", label: "Países" },
      ],
      teamTitle: "Equipe de Destaque",
      teamSub: "Uma liderança de classe mundial impulsionando inovação no entretenimento",
      team: [
        { name: "James C.", role: "Cofundador", desc: "Veterano em entretenimento e tecnologia com ampla experiência no setor." },
        { name: "Sarah L.", role: "Operações", desc: "Especialista global em operações com forte experiência em expansão multirregional." },
        { name: "David P.", role: "Tecnologia", desc: "Especialista em IA e sistemas distribuídos com sólida base de engenharia." },
        { name: "Emily W.", role: "Finanças", desc: "Profissional experiente em finanças e investimentos estratégicos." },
      ],
      partnersTitle: "Parceiros Estratégicos",
      partnersSub: "Colaborando com líderes do setor em todo o mundo",
      partners: [
        { name: "TechVentures Capital", desc: "Fundo de venture capital focado em tecnologia emergente e mídia digital na Ásia-Pacífico." },
        { name: "AsiaMedia Group", desc: "Grupo de mídia pan-asiático com streaming, produção audiovisual e gestão de talentos." },
        { name: "GlobalStream Inc.", desc: "Fornecedor de infraestrutura em nuvem e CDN para streaming 4K com escala global." },
        { name: "Dragon Pictures", desc: "Estúdio premiado especializado em dramas curtos de alta qualidade e conteúdo original." },
        { name: "PixelForge Studios", desc: "Estúdio avançado de VFX e pós-produção para grandes projetos de entretenimento." },
        { name: "SilkRoad Entertainment", desc: "Distribuidora multicultural que conecta mercados narrativos do Oriente e do Ocidente." },
        { name: "Horizon Digital", desc: "Plataforma de marketing e aquisição de usuários com IA para marcas de entretenimento." },
        { name: "StarLight Ventures", desc: "Investidor estratégico e incubadora para a nova geração de startups da creator economy." },
      ],
    },
    contact: {
      title: "Fale Conosco",
      subtitle: "Entre em contato por qualquer um dos canais abaixo",
      cards: [
        { title: "Telefone", detail: "+65 80742120" },
        { title: "E-mail", detail: "business@lollipop.im" },
        { title: "Telegram", detail: "Fale conosco" },
        { title: "WhatsApp", detail: "Fale conosco" },
        { title: "Comercial", detail: "business@lollipop.im" },
        { title: "Atendimento", detail: "service@lollipop.im" },
      ],
    },
    footer: {
      titles: {
        contact: "Contato",
        website: "Site",
        languages: "Serviços",
      },
      links: {
        home: "Início",
        aboutUs: "Sobre Nós",
        creating: "Criação",
        download: "Download",
        contactUs: "Fale Conosco",
      },
      address: "3 GAMBAS CRESCENT, #04-01, NORDCOM ONE, SINGAPORE 757088",
    },
    videoModal: {
      title: "Prévia em breve",
      description: "Episódio completo disponível no app",
    },
    dynamicPages: {
      backToHome: "Voltar ao Início",
      home: "Início",
      blog: "Blog",
      genres: "Gêneros",
      backToBlog: "Voltar ao Blog",
      explore: "Explorar",
      notFoundGenre: "Gênero não encontrado.",
      notFoundDrama: "Drama não encontrado.",
      notFoundRegion: "Região não encontrada.",
      notFoundArticle: "Artigo não encontrado.",
      shortDrames: "Dramas Curtos",
      exploreOtherGenres: "Explorar Outros Gêneros",
      moreDramasComingSoon: "Mais dramas de {0} em breve. Volte semanalmente para novos lançamentos!",
      ep: "EP",
      synopsis: "Sinopse",
      relatedDramas: "Dramas Relacionados Que Você Pode Gostar",
      watchOnLollipop: "Assistir no Lollipop Drama",
      downloadApp: "Baixar App",
      views: "visualizações",
      episodes: "episódios",
      market: "Mercado",
      shortDramasIn: "Dramas Curtos em {0}",
      popularIn: "Popular em {0}",
      paymentMethodsIn: "Formas de Pagamento em {0}",
      localTips: "Dicas Locais",
      startWatchingIn: "Comece a Assistir em {0}",
      downloadFree: "Baixar Grátis",
      availableInOtherRegions: "Disponível em Outras Regiões",
      lollipopBlog: "Blog do Lollipop Drama",
      insightsGuidesTrends: "Insights, Guias e Tendências",
      blogDescription: "Análises profundas sobre dramas curtos com IA, economia de criadores e o futuro do entretenimento móvel.",
      allPosts: "Todos os Posts",
      industryInsights: "Insights da Indústria",
      creatorEconomy: "Economia de Criadores",
      creatorGuides: "Guias para Criadores",
      readMore: "Ler mais",
      updated: "Atualizado:",
      previous: "Anterior",
      next: "Próximo",
      downloadAppDesc: "Baixe o Lollipop Drama e desfrute de 15.000+ dramas curtos premium. Download gratuito, sem assinatura necessária para começar.",
      organizationName: "Lollipop Drama",
      howToGuides: "Guias Práticos",
      relatedPosts: "Artigos Relacionados",
      workflowGuides: "Fluxo de producao",
      productionGuides: "Planejamento de producao",
      distributionGuides: "Distribuicao e monetizacao",
      difficulty: "Dificuldade",
      stepsCount: "{0} etapas",
      beginner: "Iniciante",
      intermediate: "Intermediario",
      advanced: "Avancado",
      unitMinutes: "minutos",
      unitHours: "horas",
      unitDays: "dias",
      genreWhyTitle: "Por que assistir dramas curtos de {0} no Lollipop Drama",
      genreWhyBody:
        "O Lollipop Drama organiza dramas curtos de {0} em episodios de 1 a 3 minutos feitos para o celular, para que voce complete um arco de historia inteiro no trajeto para o trabalho ou durante um cafe. Todos os titulos transmitem em HD sem download, novos episodios chegam diariamente e originais gerados por IA convivem com producoes live-action, oferecendo aos fas de {0} um catalogo mais profundo do que qualquer estudio isolado.",
      genreFaqTitle: "Dramas curtos de {0} - Perguntas frequentes",
      genreFaq1Q: "Quantos dramas curtos de {0} posso assistir no Lollipop Drama?",
      genreFaq1A:
        "O catalogo de {0} cresce toda semana. A contagem no topo desta pagina reflete os titulos de {0} disponiveis agora, e novos episodios sao publicados diariamente entre originais de IA e series live-action.",
      genreFaq2Q: "Preciso pagar para assistir dramas curtos de {0}?",
      genreFaq2A:
        "Baixar o Lollipop Drama e gratuito e nenhuma assinatura e necessaria para comecar. Parte do catalogo de {0} transmite gratuitamente, enquanto episodios premium sao liberados por compras opcionais no app ou pela assinatura de criador.",
      genreFaq3Q: "Quanto tempo dura um episodio tipico de {0}?",
      genreFaq3A:
        "A maioria dos episodios de {0} dura entre um e tres minutos, com temporadas completas de 50 a 100 episodios, aproximadamente a duracao de um longa-metragem, entregue em parcelas do tamanho do celular.",
      downloadWhyTitle: "Por que baixar o aplicativo Lollipop Drama",
      downloadWhyBody:
        "O aplicativo movel e a forma mais rapida de assistir: os episodios abrem na hora em tela cheia vertical, a reproducao se adapta a sua conexao e os lancamentos chegam ao seu dispositivo assim que entram no ar. Sua lista, seu progresso e suas assinaturas de criadores sincronizam entre celulares e tablets, para voce comecar um episodio no trajeto e terminar em casa.",
      downloadFaqTitle: "Aplicativo Lollipop Drama - Perguntas frequentes",
      downloadFaq1Q: "O aplicativo Lollipop Drama e gratuito para baixar?",
      downloadFaq1A:
        "Sim. O Lollipop Drama e gratuito para baixar em iOS e Android e nenhuma assinatura e necessaria para comecar a assistir. Parte dos dramas curtos transmite gratuitamente, enquanto episodios premium sao liberados por compras opcionais no app.",
      downloadFaq2Q: "Posso assistir Lollipop Drama offline?",
      downloadFaq2A:
        "Sim. Assinantes premium podem baixar episodios no dispositivo e assisti-los offline em ate 4K, util para trajetos ou viagens sem conexao estavel.",
      downloadFaq3Q: "Em quais paises o Lollipop Drama esta disponivel?",
      downloadFaq3A:
        "O Lollipop Drama esta disponivel em mais de 100 paises. A disponibilidade de episodios pode variar por regiao por causa de licenciamento, entao o catalogo pode mudar um pouco conforme o pais de download.",
      downloadFaq4Q: "Quais dispositivos suportam o Lollipop Drama?",
      downloadFaq4A:
        "O Lollipop Drama funciona em iOS 15 ou superior e Android 8 ou superior, tanto em celulares quanto em tablets. O aplicativo e otimizado para reproducao vertical em tela cheia, e uma unica conta pode ser usada em varios dispositivos com o progresso sincronizado automaticamente.",
      creatingFaqTitle: "Criacao de dramas curtos com IA - Perguntas frequentes",
      creatingFaq1Q: "Preciso de experiencia em producao para criar um drama curto com IA?",
      creatingFaq1A:
        "Nao. O kit de ferramentas foi criado para quem esta comecando: voce escreve ou adapta um roteiro, gera visuais de cena a partir de descricoes em texto, mantem a consistencia dos personagens com a troca de rosto e deixa o pipeline montar transicoes, efeitos e naracao. A maioria dos criadores publica o primeiro episodio em um dia.",
      creatingFaq2Q: "Quanto custa produzir um drama curto com IA?",
      creatingFaq2A:
        "Os custos sao muito menores que os de uma producao live-action porque cenarios, equipe e equipamentos sao substituidos por geracao com IA. Uma primeira temporada tipica sai por algumas centenas de dolares em creditos de geracao, e o Lollipop Drama oferece uma franquia gratuita inicial para voce testar a ideia antes de gastar.",
      creatingFaq3Q: "Como os criadores ganham dinheiro no Lollipop Drama?",
      creatingFaq3A:
        "Os criadores ficam com 80% da receita gerada pelos seus dramas, uma das maiores participacoes do setor. Os ganhos vem da liberacao de episodios e de assinaturas de criadores, e os principais criadores recebem bonus mensais adicionais com base na audiencia.",
    },
    distribution: distributionMessages.pt,
    login: loginMessages.pt,
  },
  es: {
    common: {
      brand: "Lollipop Drama",
      language: "Idioma",
      contactUs: "Contáctenos",
      appStore: "App Store",
      googlePlay: "Google Play",
      freeToDownload: "Descarga gratuita",
      noAdsInPremium: "Sin anuncios en Premium",
      scanToDownload: "Escanee para descargar",
      pointCameraAtQr: "Apunte la cámara al código QR",
      stayUpdated: "Manténgase al día",
      getReleaseAlerts: "Reciba avisos de estrenos",
      emailPlaceholder: "su@email.com",
      go: "Enviar",
      subscribedSuccess: "¡Suscripción realizada con éxito!",
      privacyPolicy: "Política de privacidad",
      termsOfService: "Términos de servicio",
      allRightsReserved: "Todos los derechos reservados.",
      downloadOnThe: "Descargar en",
      getItOn: "DISPONIBLE EN",
      loading: "Cargando...",
      loadFailed: "Error al cargar. Inténtelo de nuevo.",
      retry: "Reintentar",
    },
    navbar: {
      links: {
        home: "Inicio",
        creating: "Creación", // TODO(verify) Creating 西译
        download: "Descargar",
        blog: "Blog",
        contact: "Contacto",
      },
      signUp: "Registrarse",
      logIn: "Iniciar sesión",
      account: "Cuenta",
      logOut: "Cerrar sesión",
    },
    hero: {
      bannerAlt: ["Banner Lollipop 1", "Banner Lollipop 2"],
      taglineLine1: "Mira Dramas Cortos. Crea. Monetiza.",
    taglineLine2: "El ecosistema global de contenido de nueva generación.",
      stats: [
        { label: "Dramas Premium" },
        { label: "Usuarios globales" },
        { label: "Países y regiones" },
      ],
      aiSummary: "Lollipop Drama es una plataforma de creación y streaming de dramas cortos con IA. Crea videos profesionales desde texto con LunoTV 1.5, gana 80% de los ingresos y llega a más de 1M de usuarios en 100+ países.",
      quickLinks: { blog: "Blog", genres: "Géneros", popular: "Popular", aiTools: "IA" },
    },
    trending: {
      eyebrow: "Tendencias ahora",
      title: "Dramas más vistos · Actualizados en tiempo real",
      description: "Seleccionados con datos globales de audiencia y calificaciones. Los dramas de mayor éxito te esperan.",
      shows: [
        { title: "Temptation CEO", genre: "Romance · Venganza", meta: "80 EP · 52M reproducciones" },
        { title: "The Bride Who Fell from the Sky", genre: "Romance · Fantasía", meta: "60 EP · 38M reproducciones" },
        { title: "The Revenge of the Plus-Size Wife", genre: "Romance · Venganza", meta: "100 EP · 67M reproducciones" },
        { title: "My Royal Alpha Boyfriend", genre: "Romance · Fantasía", meta: "50 EP · 29M reproducciones" },
        { title: "Dark Secrets", genre: "Suspenso · Drama", meta: "70 EP · 44M reproducciones" },
        { title: "Why Jump Off the Building", genre: "Suspenso · Misterio", meta: "90 EP · 41M reproducciones" },
      ],
    },
    newReleases: {
      eyebrow: "Novedades de la semana",
      title: "Estrenos · Véalos primero",
      description: "Cada semana hay estrenos exclusivos, así que siempre hay una nueva obsesión esperándole.",
      badge: "NUEVO",
      shows: [
        { title: "Crimson Dynasty", genre: "Histórico · Poder", meta: "45 EP" },
        { title: "Neon Abyss", genre: "Ciencia ficción · Suspenso", meta: "36 EP" },
        { title: "Whispered Love", genre: "Romance · Drama", meta: "55 EP" },
        { title: "The Forgotten", genre: "Misterio · Suspenso", meta: "40 EP" },
        { title: "Iron Will", genre: "Acción · Artes marciales", meta: "48 EP" },
        { title: "Cloud Atlas", genre: "Fantasía · Aventura", meta: "60 EP" },
      ],
    },
    aiFeatures: {
      eyebrow: "Creación con IA",
      title: "Cree con IA, reproduzca en Luno TV",
      description: "Luno TV lleva herramientas revolucionarias de creación con IA a cada narrador: genere, edite y publique sus dramas cortos directamente para una audiencia global.",
      features: [
        {
          title: "Generación de imágenes con IA",
          desc: "Cree visuales de escena impactantes con prompts de texto. Dé vida a su visión al instante.",
        },
        {
          title: "Cambio de rostro con IA",
          desc: "Intercambie rostros de personajes con continuidad natural mediante aprendizaje profundo.",
        },
        {
          title: "Creación de video con IA",
          desc: "Convierta guiones en clips cinematográficos. Genere transiciones, efectos y locuciones de forma automática.",
        },
        {
          title: "Transferencia de estilo",
          desc: "Aplique colorización cinematográfica y estilos visuales de sus películas favoritas con un clic.",
        },
      ],
    },
    genres: {
      eyebrow: "Explorar por género",
      title: "Encuentre su favorito",
      description: "Navegue por decenas de categorías y vaya directo a las historias que coinciden con su estado de ánimo.",
      items: [
        { name: "Romance", count: "320+ títulos" },
        { name: "Venganza", count: "180+ títulos" },
        { name: "Suspenso", count: "150+ títulos" },
        { name: "Drama de CEO", count: "260+ títulos" },
        { name: "Fantasía", count: "120+ títulos" },
        { name: "Acción", count: "90+ títulos" },
        { name: "Terror", count: "85+ títulos" },
        { name: "Ciencia ficción", count: "75+ títulos" },
        { name: "Familia", count: "110+ títulos" },
        { name: "Histórico", count: "95+ títulos" },
      ],
    },
    whyChoose: {
      eyebrow: "Por qué Lollipop",
      title: "Por qué elegir Lollipop",
      description: "Redefinimos el entretenimiento de drama corto para que cada segundo sea más inmersivo, pulido y gratificante.",
      features: [
        {
          title: "Episodios breves",
          desc: "Episodios de 1-3 minutos pensados para el celular, ideales para el trayecto, las pausas y las maratones nocturnas.",
        },
        {
          title: "Visualización sin conexión",
          desc: "Descargue sus favoritos y siga viendo en cualquier lugar, incluso sin conexión.",
        },
        {
          title: "Subtítulos en varios idiomas",
          desc: "Disfrute historias de todo el mundo con subtítulos pensados para una audiencia global.",
        },
        {
          title: "Calidad Premium",
          desc: "Visual cinematográfico, ritmo pulido y actuaciones profesionales en cada serie.",
        },
        {
          title: "Episodios gratis cada día",
          desc: "Desbloquee nuevos episodios gratuitos a diario, mientras los miembros Premium tienen acceso ilimitado.",
        },
        {
          title: "Experiencia sin anuncios",
          desc: "Sin interrupciones, solo drama inmersivo desde el primer fotograma hasta el último cliffhanger.",
        },
      ],
    },
    web3: {
      eyebrow: "Entretenimiento blockchain",
      titlePrefix: "WEB2",
      titleHighlight: "WEB3",
      floatingTags: ["RWA", "NFT", "DeFi", "Token", "DAO", "Metaverso"],
      stats: [
        { label: "Tenedores de token" },
        { label: "NFT acuñados" },
        { label: "Socios de cadena" },
      ],
      paragraphs: [
        'Lollipop aprovecha RWA para reconstruir el sistema de valor del cine y la televisión, construyendo un universo paralelo descentralizado que lleva el entretenimiento a una era de valor "cuantificable, circulable y distribuible".',
        "Aquí el contenido ya no es solo contenido. Se convierte en un activo digital que puede seguir creciendo, y cada visualización se vuelve una acción creadora de valor.",
        "Lollipop está encendiendo pantallas en todo el mundo y abriendo la puerta a la próxima oportunidad billonaria del entretenimiento.",
      ],
    },
    testimonials: {
      eyebrow: "Opiniones de usuarios",
      title: "Amada por millones en todo el mundo",
      reviews: [
        {
          name: "Sarah M.",
          role: "Premium · EE. UU.",
          text: "Estoy completamente enganchada. Los cliffhangers son geniales y terminé tres series en un fin de semana.",
        },
        {
          name: "James L.",
          role: "VIP · Reino Unido",
          text: "La calidad de producción es brutal para contenido corto. Algunas series parecen originales premium.",
        },
        {
          name: "Emily R.",
          role: "Premium · Canadá",
          text: "Por fin una app que encaja con mi horario. Veo en el almuerzo, en el metro y antes de dormir.",
        },
        {
          name: "David K.",
          role: "VIP · Australia",
          text: "Empecé en el plan gratuito y actualicé en dos días. Solo los exclusivos ya valen la pena.",
        },
        {
          name: "Mei L.",
          role: "Premium · Singapur",
          text: "Las herramientas de IA son increíbles. Hice mi primer drama corto en unas pocas horas.",
        },
        {
          name: "Carlos R.",
          role: "VIP · Brasil",
          text: "Los subtítulos en varios idiomas son excelentes y las descargas sin conexión me salvaron en varios vuelos.",
        },
        {
          name: "Yuki T.",
          role: "Premium · Japón",
          text: "Como creadora, la participación en ingresos es imbatible. Gané aquí en meses más que en otras plataformas en un año.",
        },
        {
          name: "Anna P.",
          role: "VIP · Alemania",
          text: "Dudaba del 4K en una app de drama corto, pero el visual es realmente cinematográfico.",
        },
      ],
    },
    creator: {
      eyebrow: "Programa de creadores",
      title: "Sea el próximo creador de un millón de reproducciones",
      description: "Lollipop ofrece la mayor participación en ingresos del sector y un apoyo creativo integral para creadores de calidad. Que el gran contenido reciba las recompensas que merece.",
      benefits: [
        "80% de participación en ingresos — la más alta del sector",
        "Acceso completo al kit de creación con IA",
        "Gestor de éxito de creadores dedicado",
        "Distribución global en más de 100 países",
        "Bonificaciones mensuales para los de mejor desempeño",
      ],
      stats: [
        { label: "Participación en ingresos", desc: "Ganancias de creadores líderes del sector" },
        { label: "Creadores de calidad", desc: "Comunidad global en crecimiento" },
        { label: "Ganancia mensual promedio", desc: "Para creadores de mejor desempeño" },
        { label: "Historias de éxito", desc: "Creadores que llegan a 1M+ reproducciones" },
      ],
    },
    downloadCta: {
      eyebrow: "Disponible ahora",
      title: "Su próxima obsesión está a un toque",
      description: "Únase a millones de espectadores en el mundo. Descargue gratis y obtenga 7 días de acceso Premium, sin compromiso.",
      featuredTitle: "Descargue Lollipop",
      featuredDescription: "Disponible en iOS y Android. Streaming 4K, descargas sin conexión y más de 15.000 dramas cortos premium.",
      featuredShowTitle: "Obsessed With My Boss · Pt.2",
      featuredTimer: "0:42",
      notification: "¡Nuevo episodio!",
      rating: "4.9",
      stats: [
        { value: "2M+", label: "Descargas" },
        { value: "4.9★", label: "Calificación" },
        { value: "100+", label: "Países" },
        { value: "99.9%", label: "Disponibilidad" },
      ],
    },
    about: {
      heroTitle: "Acerca de",
      heroHighlight: "Lollipop",
      heroSubtitle: "Abriendo una nueva era del entretenimiento global de drama corto",
      companyTitle: "Visión general de la empresa",
      companySub: "Una plataforma global de drama corto que empodera a creadores y audiencias",
      companyParagraphs: [
        "Lollipop es una empresa conjunta entre Nyx Entertainment Group, con sede en Hong Kong, y el Fondo Coreano de Inversión Cultural. El objetivo estratégico del fondo es promover sistemáticamente los K-Contents a nivel global, con un fuerte enfoque en coproducciones con socios internacionales.",
        "Se está expandiendo activamente a mercados globales diversificados, incluidos China, Japón, Norteamérica, Europa, Sudeste Asiático y Oriente Medio, al tiempo que acelera las estrategias de localización.",
      ],
      companyStats: [
        { num: "1M+", label: "Usuarios globales" },
        { num: "100K+", label: "Creadores de calidad" },
        { num: "100+", label: "Países" },
      ],
      teamTitle: "Equipo destacado",
      teamSub: "Un equipo de liderazgo de clase mundial impulsando la innovación en el entretenimiento",
      team: [
        { name: "James C.", role: "Cofundador", desc: "Veterano en entretenimiento y tecnología con amplia experiencia en el sector." },
        { name: "Sarah L.", role: "Operaciones", desc: "Especialista en operaciones globales con experiencia en escalado multimercado." },
        { name: "David P.", role: "Tecnología", desc: "Experto en IA y sistemas distribuidos con sólida base técnica." },
        { name: "Emily W.", role: "Finanzas", desc: "Profesional financiera experimentada con trayectoria en inversión estratégica." },
      ],
      partnersTitle: "Socios estratégicos",
      partnersSub: "Colaborando con líderes del sector en todo el mundo",
      partners: [
        { name: "TechVentures Capital", desc: "Firma de capital de riesgo líder centrada en tecnología emergente y medios digitales en Asia-Pacífico." },
        { name: "AsiaMedia Group", desc: "Grupo de medios panasiático que abarca streaming, producción cinematográfica y gestión de talentos." },
        { name: "GlobalStream Inc.", desc: "Proveedor de infraestructura en la nube y CDN para streaming 4K fluido a audiencias globales." },
        { name: "Dragon Pictures", desc: "Estudio galardonado especializado en drama corto premium y contenido original." },
        { name: "PixelForge Studios", desc: "Estudio avanzado de VFX y posproducción que apoya grandes proyectos de entretenimiento en el mundo." },
        { name: "SilkRoad Entertainment", desc: "Distribuidor intercultural que conecta los mercados narrativos de Oriente y Occidente." },
        { name: "Horizon Digital", desc: "Plataforma de marketing y adquisición de usuarios impulsada por IA para marcas de entretenimiento." },
        { name: "StarLight Ventures", desc: "Inversionista estratégico e incubadora que apoya a la próxima generación de startups de la economía de creadores." },
      ],
    },
    contact: {
      title: "Contáctenos",
      subtitle: "Escríbanos por cualquiera de los canales siguientes",
      cards: [
        { title: "Teléfono", detail: "+65 80742120" },
        { title: "Correo", detail: "business@lollipop.im" },
        { title: "Telegram", detail: "Contáctenos" },
        { title: "WhatsApp", detail: "Contáctenos" },
        { title: "Comercial", detail: "business@lollipop.im" },
        { title: "Atención al cliente", detail: "service@lollipop.im" },
      ],
    },
    footer: {
      titles: {
        contact: "Contacto",
        website: "Sitio web",
        languages: "Servicios",
      },
      links: {
        home: "Inicio",
        aboutUs: "Acerca de nosotros",
        creating: "Creación",
        download: "Descargar",
        contactUs: "Contáctenos",
      },
      address: "3 GAMBAS CRESCENT, #04-01, NORDCOM ONE, SINGAPORE 757088",
    },
    videoModal: {
      title: "Avance próximamente",
      description: "Episodio completo disponible en la app",
    },
    dynamicPages: {
      backToHome: "Volver al inicio",
      home: "Inicio",
      blog: "Blog",
      genres: "Géneros",
      backToBlog: "Volver al blog",
      explore: "Explorar",
      notFoundGenre: "Género no encontrado.",
      notFoundDrama: "Drama no encontrado.",
      notFoundRegion: "Región no encontrada.",
      notFoundArticle: "Artículo no encontrado.",
      shortDrames: "Dramas cortos",
      exploreOtherGenres: "Explorar otros géneros",
      moreDramasComingSoon: "Más dramas de {0} próximamente. ¡Vuelva cada semana para ver nuevos estrenos!",
      ep: "EP",
      synopsis: "Sinopsis",
      relatedDramas: "Dramas relacionados que le pueden gustar",
      watchOnLollipop: "Ver en Lollipop Drama",
      downloadApp: "Descargar app",
      views: "reproducciones",
      episodes: "episodios",
      market: "Mercado",
      shortDramasIn: "Dramas cortos en {0}",
      popularIn: "Popular en {0}",
      paymentMethodsIn: "Métodos de pago en {0}",
      localTips: "Consejos locales",
      startWatchingIn: "Empiece a ver en {0}",
      downloadFree: "Descargar gratis",
      availableInOtherRegions: "Disponible en otras regiones",
      lollipopBlog: "Blog de Lollipop Drama",
      insightsGuidesTrends: "Insights, guías y tendencias",
      blogDescription: "Análisis profundos sobre dramas cortos con IA, la economía de creadores y el futuro del entretenimiento móvil.",
      allPosts: "Todas las publicaciones",
      industryInsights: "Insights de la industria",
      creatorEconomy: "Economía de creadores",
      creatorGuides: "Guías para creadores",
      readMore: "Leer más",
      updated: "Actualizado:",
      previous: "Anterior",
      next: "Siguiente",
      downloadAppDesc: "Descargue Lollipop Drama y disfrute de más de 15.000 dramas cortos premium. Descarga gratuita, sin suscripción para empezar.",
      organizationName: "Lollipop Drama",
      howToGuides: "Guías Prácticas",
      relatedPosts: "Publicaciones relacionadas",
      workflowGuides: "Flujo de produccion",
      productionGuides: "Planificacion de produccion",
      distributionGuides: "Distribucion y monetizacion",
      difficulty: "Dificultad",
      stepsCount: "{0} pasos",
      beginner: "Principiante",
      intermediate: "Intermedio",
      advanced: "Avanzado",
      unitMinutes: "minutos",
      unitHours: "horas",
      unitDays: "dias",
      genreWhyTitle: "Por que ver dramas cortos de {0} en Lollipop Drama",
      genreWhyBody:
        "Lollipop Drama organiza los dramas cortos de {0} en episodios de 1 a 3 minutos pensados para el movil, para que puedas completar un arco argumental completo durante el trayecto al trabajo o mientras tomas un cafe. Todos los titulos se emiten en HD sin descargas, se publican episodios nuevos a diario y los originales generados con IA conviven con producciones de accion real, ofreciendo a los fans de {0} un catalogo mas profundo que el de cualquier estudio por si solo.",
      genreFaqTitle: "Dramas cortos de {0} - Preguntas frecuentes",
      genreFaq1Q: "Cuantos dramas cortos de {0} puedo ver en Lollipop Drama?",
      genreFaq1A:
        "El catalogo de {0} crece cada semana. El numero que aparece en la parte superior de esta pagina refleja los titulos de {0} disponibles actualmente, y se publican episodios nuevos a diario tanto de originales con IA como de series de accion real.",
      genreFaq2Q: "Necesito pagar para ver dramas cortos de {0}?",
      genreFaq2A:
        "Descargar Lollipop Drama es gratis y no se requiere suscripcion para empezar. Una parte del catalogo de {0} se emite gratis, mientras que los episodios premium se desbloquean con compras opcionales dentro de la app o con la suscripcion de creador.",
      genreFaq3Q: "Cuanto dura un episodio tipico de {0}?",
      genreFaq3A:
        "La mayoria de los episodios de {0} duran entre uno y tres minutos, con temporadas completas de 50 a 100 episodios, aproximadamente la duracion de una pelicula, entregada en entregas del tamano de un movil.",
      downloadWhyTitle: "Por que descargar la aplicacion Lollipop Drama",
      downloadWhyBody:
        "La aplicacion movil es la forma mas rapida de ver: los episodios se abren al instante en pantalla completa vertical, la reproduccion se adapta a tu conexion y los estrenos llegan a tu dispositivo en cuanto se publican. Tu lista, tu progreso y tus suscripciones de creadores se sincronizan entre telefonos y tablets, para que empieces un episodio camino al trabajo y lo termines en casa.",
      downloadFaqTitle: "Aplicacion Lollipop Drama - Preguntas frecuentes",
      downloadFaq1Q: "La aplicacion Lollipop Drama es gratis para descargar?",
      downloadFaq1A:
        "Si. Lollipop Drama se descarga gratis en iOS y Android y no se requiere suscripcion para empezar a ver. Una parte de los dramas cortos se emite gratis, mientras que los episodios premium se desbloquean con compras opcionales en la app.",
      downloadFaq2Q: "Puedo ver Lollipop Drama sin conexion?",
      downloadFaq2A:
        "Si. Los suscriptores premium pueden descargar episodios en el dispositivo y verlos sin conexion en hasta 4K, util para trayectos o viajes sin una conexion estable.",
      downloadFaq3Q: "En que paises esta disponible Lollipop Drama?",
      downloadFaq3A:
        "Lollipop Drama esta disponible en mas de 100 paises. La disponibilidad de episodios puede variar por region debido a las licencias, por lo que el catalogo puede cambiar ligeramente segun el pais de descarga.",
      downloadFaq4Q: "Que dispositivos son compatibles con Lollipop Drama?",
      downloadFaq4A:
        "Lollipop Drama funciona en iOS 15 o posterior y Android 8 o posterior, tanto en telefonos como en tablets. La aplicacion esta optimizada para la reproduccion vertical a pantalla completa, y una misma cuenta puede usarse en varios dispositivos con el progreso sincronizado automaticamente.",
      creatingFaqTitle: "Creacion de dramas cortos con IA - Preguntas frecuentes",
      creatingFaq1Q: "Necesito experiencia en produccion para crear un drama corto con IA?",
      creatingFaq1A:
        "No. El kit de herramientas esta pensado para quien empieza: escribes o adaptas un guion, generas las escenas a partir de descripciones de texto, mantienes la coherencia de los personajes con el intercambio de rostros y dejas que el proceso añada transiciones, efectos y locuciones. La mayoria de los creadores publica su primer episodio en un dia.",
      creatingFaq2Q: "Cuanto cuesta producir un drama corto con IA?",
      creatingFaq2A:
        "Los costes son mucho mas bajos que en una produccion de accion real, porque los escenarios, el equipo y el material se sustituyen por generacion con IA. Una primera temporada habitual puede hacerse por unos cientos de dolares en creditos de generacion, y Lollipop Drama ofrece una asignacion inicial gratuita para probar la idea antes de gastar.",
      creatingFaq3Q: "Como ganan dinero los creadores en Lollipop Drama?",
      creatingFaq3A:
        "Los creadores conservan el 80% de los ingresos que generan sus dramas, una de las mayores participaciones del sector. Los ingresos proceden del desbloqueo de episodios y de las suscripciones de creadores, y los creadores destacados reciben bonificaciones mensuales adicionales segun la audiencia.",
    },
    distribution: distributionMessages.es,
    login: loginMessages.es,
  },
  ar: {
    common: {
      brand: "Lollipop Drama",
      language: "اللغة",
      contactUs: "اتصل بنا",
      appStore: "App Store",
      googlePlay: "Google Play",
      freeToDownload: "تنزيل مجاني",
      noAdsInPremium: "بدون إعلانات في Premium",
      scanToDownload: "امسح للتنزيل",
      pointCameraAtQr: "وجّه الكاميرا نحو رمز QR",
      stayUpdated: "ابقَ على اطلاع",
      getReleaseAlerts: "احصل على تنبيهات الإصدارات الجديدة",
      emailPlaceholder: "you@email.com",
      go: "إرسال",
      subscribedSuccess: "تم الاشتراك بنجاح!",
      privacyPolicy: "سياسة الخصوصية",
      termsOfService: "شروط الخدمة",
      allRightsReserved: "جميع الحقوق محفوظة.",
      downloadOnThe: "نزّل من",
      getItOn: "احصل عليه من",
      loading: "جارٍ التحميل...",
      loadFailed: "فشل التحميل. يرجى المحاولة مرة أخرى.",
      retry: "إعادة المحاولة",
    },
    navbar: {
      links: {
        home: "الرئيسية",
        creating: "الإنشاء", // TODO(verify) Creating 阿译
        download: "تنزيل",
        blog: "المدونة",
        contact: "اتصل بنا",
      },
      signUp: "إنشاء حساب",
      logIn: "تسجيل الدخول",
      account: "الحساب",
      logOut: "تسجيل الخروج",
    },
    hero: {
      bannerAlt: ["لافتة Lollipop 1", "لافتة Lollipop 2"],
      taglineLine1: "شاهد الدراما القصيرة. أبدع. حقق الدخل.",
    taglineLine2: "النظام البيئي العالمي للمحتوى من الجيل التالي.",
      stats: [
        { label: "دراما متميزة" },
        { label: "مستخدمون عالميون" },
        { label: "دول ومناطق" },
      ],
      aiSummary: "Lollipop Drama هي منصة إنشاء وبث دراما قصيرة مدعومة بالذكاء الاصطناعي. أنشئ مقاطع فيديو احترافية من النص باستخدام LunoTV 1.5، واحصل على 80% من الإيرادات، ووصل إلى أكثر من مليون مستخدم في 100+ دولة.",
      quickLinks: { blog: "المدونة", genres: "الأنواع", popular: "الأكثر رواجًا", aiTools: "أدوات الذكاء الاصطناعي" },
    },
    trending: {
      eyebrow: "الرائج الآن",
      title: "أكثر الدراما سخونة · تُحدَّث في الوقت الفعلي",
      description: "مختارة من بيانات المشاهدة والتقييمات العالمية. أكثر الأعمال نجاحًا بانتظارك.",
      shows: [
        { title: "Temptation CEO", genre: "رومانسية · انتقام", meta: "80 حلقة · 52 مليون مشاهدة" },
        { title: "The Bride Who Fell from the Sky", genre: "رومانسية · فانتازيا", meta: "60 حلقة · 38 مليون مشاهدة" },
        { title: "The Revenge of the Plus-Size Wife", genre: "رومانسية · انتقام", meta: "100 حلقة · 67 مليون مشاهدة" },
        { title: "My Royal Alpha Boyfriend", genre: "رومانسية · فانتازيا", meta: "50 حلقة · 29 مليون مشاهدة" },
        { title: "Dark Secrets", genre: "إثارة · دراما", meta: "70 حلقة · 44 مليون مشاهدة" },
        { title: "Why Jump Off the Building", genre: "إثارة · غموض", meta: "90 حلقة · 41 مليون مشاهدة" },
      ],
    },
    newReleases: {
      eyebrow: "جديد هذا الأسبوع",
      title: "إصدارات جديدة · شاهد أولًا",
      description: "تُعرض حصريات جديدة كل أسبوع، لذا هناك دائمًا هوس جديد بانتظارك.",
      badge: "جديد",
      shows: [
        { title: "Crimson Dynasty", genre: "تاريخي · سلطة", meta: "45 حلقة" },
        { title: "Neon Abyss", genre: "خيال علمي · إثارة", meta: "36 حلقة" },
        { title: "Whispered Love", genre: "رومانسية · دراما", meta: "55 حلقة" },
        { title: "The Forgotten", genre: "غموض · تشويق", meta: "40 حلقة" },
        { title: "Iron Will", genre: "أكشن · فنون قتالية", meta: "48 حلقة" },
        { title: "Cloud Atlas", genre: "فانتازيا · مغامرة", meta: "60 حلقة" },
      ],
    },
    aiFeatures: {
      eyebrow: "إنشاء بالذكاء الاصطناعي",
      title: "أنشئ بالذكاء الاصطناعي، وبث على Luno TV",
      description: "يجلب Luno TV أدوات إنشاء ثورية بالذكاء الاصطناعي لكل راوٍ — ولِّد وحرّر وانشر دراماك القصيرة مباشرة لجمهور عالمي.",
      features: [
        {
          title: "توليد الصور بالذكاء الاصطناعي",
          desc: "أنشئ مشاهد بصرية مذهلة بأوامر نصية. حوّل رؤيتك الإبداعية إلى واقع فورًا.",
        },
        {
          title: "تبديل الوجوه بالذكاء الاصطناعي",
          desc: "بدّل وجوه الشخصيات بسلاسة بتقنية التعلم العميق لضمان الاستمرارية المثالية.",
        },
        {
          title: "إنشاء الفيديو بالذكاء الاصطناعي",
          desc: "حوّل السيناريوهات إلى مقاطع سينمائية قصيرة. ولِّد الانتقالات والمؤثرات والتعليق الصوتي تلقائيًا.",
        },
        {
          title: "نقل الأسلوب",
          desc: "طبّق تدرج الألوان السينمائي والأساليب البصرية من أفلامك المفضلة بنقرة واحدة.",
        },
      ],
    },
    genres: {
      eyebrow: "استكشف حسب النوع",
      title: "اعثر على المفضل لديك",
      description: "تصفح عشرات الفئات وانتقل مباشرة إلى القصص التي تناسب مزاجك.",
      items: [
        { name: "رومانسية", count: "320+ عمل" },
        { name: "انتقام", count: "180+ عمل" },
        { name: "إثارة", count: "150+ عمل" },
        { name: "دراما الرؤساء التنفيذيين", count: "260+ عمل" },
        { name: "فانتازيا", count: "120+ عمل" },
        { name: "أكشن", count: "90+ عمل" },
        { name: "رعب", count: "85+ عمل" },
        { name: "خيال علمي", count: "75+ عمل" },
        { name: "عائلي", count: "110+ عمل" },
        { name: "تاريخي", count: "95+ عمل" },
      ],
    },
    whyChoose: {
      eyebrow: "لماذا Lollipop",
      title: "لماذا تختار Lollipop",
      description: "نعيد تعريف ترفيه الدراما القصيرة لنجعل كل ثانية أكثر غمرًا وصقلًا وجدوى.",
      features: [
        {
          title: "حلقات قصيرة",
          desc: "حلقات من 1-3 دقائق مصممة للمشاهدة على الجوال، مثالية للتنقل والاستراحات والسهر.",
        },
        {
          title: "مشاهدة دون اتصال",
          desc: "نزّل المفضلات واستمر في المشاهدة في أي مكان حتى دون اتصال.",
        },
        {
          title: "ترجمة متعددة اللغات",
          desc: "استمتع بقصص من حول العالم مع ترجمة مصممة لجمهور عالمي.",
        },
        {
          title: "جودة متميزة",
          desc: "صور سينمائية وإيقاع مصقول وأداء احترافي في كل مسلسل.",
        },
        {
          title: "حلقات مجانية يوميًا",
          desc: "افتح حلقات مجانية جديدة كل يوم، بينما يحصل أعضاء Premium على وصول غير محدود.",
        },
        {
          title: "تجربة بلا إعلانات",
          desc: "بلا مقاطعات، دراما غامرة فقط من أول إطار حتى آخر تشويق.",
        },
      ],
    },
    web3: {
      eyebrow: "ترفيه البلوكتشين",
      titlePrefix: "WEB2",
      titleHighlight: "WEB3",
      floatingTags: ["RWA", "NFT", "DeFi", "Token", "DAO", "ميتافيرس"],
      stats: [
        { label: "حاملو التوكن" },
        { label: "NFT المُصكّة" },
        { label: "شركاء السلسلة" },
      ],
      paragraphs: [
        "يستفيد Lollipop من RWA لإعادة بناء نظام قيمة السينما والتلفزيون، وبناء كون موازٍ لامركزي يدخل الترفيه عصر قيمة «قابلة للقياس والتداول والتوزيع».",
        "هنا لم يعد المحتوى مجرد محتوى. يصبح أصلًا رقميًا يمكن أن يستمر في النمو، وتصبح كل مشاهدة فعلًا يخلق قيمة.",
        "يضيء Lollipop الشاشات حول العالم ويفتح الباب أمام فرصة الترفيه التالية بقيمة تريليون دولار.",
      ],
    },
    testimonials: {
      eyebrow: "آراء المستخدمين",
      title: "محبوب من ملايين حول العالم",
      reviews: [
        {
          name: "Sarah M.",
          role: "Premium · الولايات المتحدة",
          text: "أنا مدمنة تمامًا. نهايات التشويق عبقرية وأنهيت ثلاثة مسلسلات في عطلة نهاية أسبوع واحدة.",
        },
        {
          name: "James L.",
          role: "VIP · المملكة المتحدة",
          text: "جودة الإنتاج مذهلة للمحتوى القصير. بعض الأعمال تبدو فعلًا كأعمال أصلية متميزة.",
        },
        {
          name: "Emily R.",
          role: "Premium · كندا",
          text: "أخيرًا تطبيق يناسب جدولي. أشاهد أثناء الغداء وفي المترو وقبل النوم.",
        },
        {
          name: "David K.",
          role: "VIP · أستراليا",
          text: "بدأت بالخطة المجانية ورقّيت خلال يومين. الأعمال الحصرية وحدها تستحق ذلك.",
        },
        {
          name: "Mei L.",
          role: "Premium · سنغافورة",
          text: "أدوات الذكاء الاصطناعي مذهلة. صنعت أول دراما قصيرة لي في ساعات قليلة.",
        },
        {
          name: "Carlos R.",
          role: "VIP · البرازيل",
          text: "الترجمة متعددة اللغات ممتازة، والتنزيلات دون اتصال أنقذتني في عدة رحلات.",
        },
        {
          name: "Yuki T.",
          role: "Premium · اليابان",
          text: "كمبدعة، حصة الإيرادات هنا لا تُقهر. ربحت هنا في أشهر أكثر مما في منصات أخرى خلال سنة.",
        },
        {
          name: "Anna P.",
          role: "VIP · ألمانيا",
          text: "كنت أشك في جودة 4K على تطبيق دراما قصيرة، لكن الصورة سينمائية بحق.",
        },
      ],
    },
    creator: {
      eyebrow: "برنامج المبدعين",
      title: "كن المبدع التالي بمليون مشاهدة",
      description: "يقدم Lollipop أعلى حصة إيرادات في القطاع ودعمًا إبداعيًا شاملًا للمبدعين الجيدين. دع المحتوى العظيم ينال المكافأة التي يستحقها.",
      benefits: [
        "80% حصة إيرادات — الأعلى في القطاع",
        "وصول كامل إلى حزمة أدوات الإنشاء بالذكاء الاصطناعي",
        "مدير نجاح مخصص للمبدعين",
        "توزيع عالمي عبر أكثر من 100 دولة",
        "مكافآت شهرية للمتفوقين",
      ],
      stats: [
        { label: "حصة الإيرادات", desc: "أرباح مبدعين رائدة في القطاع" },
        { label: "مبدعو جودة", desc: "مجتمع عالمي متنامٍ" },
        { label: "متوسط الأرباح الشهرية", desc: "لأفضل المبدعين أداءً" },
        { label: "قصص نجاح", desc: "مبدعون يصلون إلى أكثر من مليون مشاهدة" },
      ],
    },
    downloadCta: {
      eyebrow: "متاح الآن",
      title: "هوسك القادم على بُعد لمسة",
      description: "انضم إلى ملايين المشاهدين حول العالم. نزّل مجانًا واحصل على 7 أيام من Premium — دون التزام.",
      featuredTitle: "نزّل Lollipop",
      featuredDescription: "متاح على iOS وAndroid. بث 4K وتنزيلات دون اتصال وأكثر من 15000 دراما قصيرة متميزة.",
      featuredShowTitle: "Obsessed With My Boss · Pt.2",
      featuredTimer: "0:42",
      notification: "حلقة جديدة!",
      rating: "4.9",
      stats: [
        { value: "2M+", label: "تنزيلات" },
        { value: "4.9★", label: "تقييم التطبيق" },
        { value: "100+", label: "دول" },
        { value: "99.9%", label: "التوفر" },
      ],
    },
    about: {
      heroTitle: "عن",
      heroHighlight: "Lollipop",
      heroSubtitle: "افتتاح عصر جديد لترفيه الدراما القصيرة عالميًا",
      companyTitle: "نظرة عامة على الشركة",
      companySub: "منصة عالمية للدراما القصيرة تمكّن المبدعين والجمهور",
      companyParagraphs: [
        "Lollipop مشروع مشترك بين Nyx Entertainment Group في هونغ كونغ وصندوق الاستثمار الثقافي الكوري. الهدف الاستراتيجي للصندوق هو الترويج المنهجي للمحتوى الكوري عالميًا، مع تركيز قوي على الإنتاج المشترك مع شركاء دوليين.",
        "يتوسع بنشاط في أسواق عالمية متنوعة تشمل الصين واليابان وأمريكا الشمالية وأوروبا وجنوب شرق آسيا والشرق الأوسط، مع تسريع استراتيجيات التوطين.",
      ],
      companyStats: [
        { num: "1M+", label: "مستخدمون عالميون" },
        { num: "100K+", label: "مبدعو جودة" },
        { num: "100+", label: "دول" },
      ],
      teamTitle: "فريق متميز",
      teamSub: "فريق قيادة عالمي المستوى يقود الابتكار في الترفيه",
      team: [
        { name: "James C.", role: "شريك مؤسس", desc: "محنك في الترفيه والتكنولوجيا بخبرة واسعة في القطاع." },
        { name: "Sarah L.", role: "العمليات", desc: "متخصصة في العمليات العالمية مع خبرة في التوسع عبر أسواق متعددة." },
        { name: "David P.", role: "التكنولوجيا", desc: "خبير في الذكاء الاصطناعي والأنظمة الموزعة بخلفية تقنية عميقة." },
        { name: "Emily W.", role: "المالية", desc: "محترفة مالية مخضرمة بخلفية في الاستثمار الاستراتيجي." },
      ],
      partnersTitle: "شركاء استراتيجيون",
      partnersSub: "نتعاون مع قادة القطاع حول العالم",
      partners: [
        { name: "TechVentures Capital", desc: "شركة رأس مال مخاطر رائدة تركز على التقنيات الناشئة والإعلام الرقمي في آسيا والمحيط الهادئ." },
        { name: "AsiaMedia Group", desc: "مجموعة إعلام آسيوية شاملة تغطي البث وإنتاج الأفلام وإدارة المواهب." },
        { name: "GlobalStream Inc.", desc: "مزود بنية سحابية وCDN لبث 4K سلس للجمهور العالمي." },
        { name: "Dragon Pictures", desc: "استوديو سينمائي حائز جوائز متخصص في الدراما القصيرة المتميزة والمحتوى الأصلي." },
        { name: "PixelForge Studios", desc: "استوديو مؤثرات بصرية وما بعد الإنتاج متقدم يدعم أبرز مشاريع الترفيه عالميًا." },
        { name: "SilkRoad Entertainment", desc: "موزع عابر للثقافات يربط أسواق السرد بين الشرق والغرب." },
        { name: "Horizon Digital", desc: "منصة تسويق واكتساب مستخدمين بالذكاء الاصطناعي للعلامات الترفيهية." },
        { name: "StarLight Ventures", desc: "مستثمر استراتيجي وحاضنة تدعم الجيل القادم من شركات اقتصاد المبدعين." },
      ],
    },
    contact: {
      title: "اتصل بنا",
      subtitle: "تواصل عبر أي من القنوات أدناه",
      cards: [
        { title: "الهاتف", detail: "+65 80742120" },
        { title: "البريد الإلكتروني", detail: "business@lollipop.im" },
        { title: "Telegram", detail: "اتصل بنا" },
        { title: "WhatsApp", detail: "اتصل بنا" },
        { title: "الأعمال", detail: "business@lollipop.im" },
        { title: "خدمة العملاء", detail: "service@lollipop.im" },
      ],
    },
    footer: {
      titles: {
        contact: "اتصل بنا",
        website: "الموقع",
        languages: "الخدمات",
      },
      links: {
        home: "الرئيسية",
        aboutUs: "من نحن",
        creating: "الإنشاء",
        download: "تنزيل",
        contactUs: "اتصل بنا",
      },
      address: "3 GAMBAS CRESCENT, #04-01, NORDCOM ONE, SINGAPORE 757088",
    },
    videoModal: {
      title: "المعاينة قريبًا",
      description: "الحلقة الكاملة متاحة في التطبيق",
    },
    dynamicPages: {
      backToHome: "العودة إلى الرئيسية",
      home: "الرئيسية",
      blog: "المدونة",
      genres: "الأنواع",
      backToBlog: "العودة إلى المدونة",
      explore: "استكشف",
      notFoundGenre: "النوع غير موجود.",
      notFoundDrama: "الدراما غير موجودة.",
      notFoundRegion: "المنطقة غير موجودة.",
      notFoundArticle: "المقال غير موجود.",
      shortDrames: "دراما قصيرة",
      exploreOtherGenres: "استكشف أنواعًا أخرى",
      moreDramasComingSoon: "المزيد من دراما {0} قريبًا. عد أسبوعيًا للإصدارات الجديدة!",
      ep: "حلقة",
      synopsis: "الملخص",
      relatedDramas: "دراما ذات صلة قد تعجبك",
      watchOnLollipop: "شاهد على Lollipop Drama",
      downloadApp: "تنزيل التطبيق",
      views: "مشاهدات",
      episodes: "حلقات",
      market: "السوق",
      shortDramasIn: "دراما قصيرة في {0}",
      popularIn: "الأكثر رواجًا في {0}",
      paymentMethodsIn: "طرق الدفع في {0}",
      localTips: "نصائح محلية",
      startWatchingIn: "ابدأ المشاهدة في {0}",
      downloadFree: "تنزيل مجاني",
      availableInOtherRegions: "متاح في مناطق أخرى",
      lollipopBlog: "مدونة Lollipop Drama",
      insightsGuidesTrends: "رؤى وأدلة واتجاهات",
      blogDescription: "تحليلات معمقة عن الدراما القصيرة بالذكاء الاصطناعي واقتصاد المبدعين ومستقبل الترفيه عبر الجوال.",
      allPosts: "كل المقالات",
      industryInsights: "رؤى الصناعة",
      creatorEconomy: "اقتصاد المبدعين",
      creatorGuides: "أدلة المبدعين",
      readMore: "اقرأ المزيد",
      updated: "محدَّث:",
      previous: "السابق",
      next: "التالي",
      downloadAppDesc: "نزّل Lollipop Drama واستمتع بأكثر من 15000 دراما قصيرة متميزة. تنزيل مجاني، دون اشتراك للبدء.",
      organizationName: "Lollipop Drama",
      howToGuides: "أدلة عملية",
      relatedPosts: "مقالات ذات صلة",
      workflowGuides: "مسار عمل الإنتاج",
      productionGuides: "تخطيط الإنتاج",
      distributionGuides: "التوزيع وتحقيق الربح",
      difficulty: "الصعوبة",
      stepsCount: "{0} خطوة",
      beginner: "مبتدئ",
      intermediate: "متوسط",
      advanced: "متقدم",
      unitMinutes: "دقيقة",
      unitHours: "ساعة",
      unitDays: "يوم",
      genreWhyTitle: "لماذا تشاهد الدراما القصيرة من نوع {0} على Lollipop Drama",
      genreWhyBody:
        "تنظّم Lollipop Drama الدراما القصيرة من نوع {0} في حلقات من دقيقة إلى ثلاث دقائق مصمّمة للهاتف، لتتمكّن من إنهاء قصة كاملة أثناء التنقّل أو خلال استراحة قهوة. تُبث جميع العناوين بدقة HD دون حاجة إلى تنزيل، وتُنشر حلقات جديدة يوميًا، وتتجاور الأعمال الأصلية المولّدة بالذكاء الاصطناعي مع إنتاجات حية، ما يمنح عشّاق {0} مكتبة أعمق مما يقدّمه أي استوديو بمفرده.",
      genreFaqTitle: "الدراما القصيرة من نوع {0} - الأسئلة الشائعة",
      genreFaq1Q: "كم عدد الدراما القصيرة من نوع {0} التي يمكنني مشاهدتها على Lollipop Drama؟",
      genreFaq1A:
        "تنمو مكتبة {0} كل أسبوع. يعكس العدد المعروض في أعلى هذه الصفحة عناوين {0} المتاحة حاليًا، وتُنشر حلقات جديدة يوميًا من الأعمال الأصلية المولّدة بالذكاء الاصطناعي ومن السلاسل الحية.",
      genreFaq2Q: "هل أحتاج إلى الدفع لمشاهدة الدراما القصيرة من نوع {0}؟",
      genreFaq2A:
        "تنزيل Lollipop Drama مجاني ولا يلزم أي اشتراك للبدء. يُبث جزء من مكتبة {0} مجانًا، بينما تُفتح الحلقات المميزة عبر عمليات شراء اختيارية داخل التطبيق أو عبر اشتراك المبدعين.",
      genreFaq3Q: "كم تبلغ مدة الحلقة الواحدة من نوع {0}؟",
      genreFaq3A:
        "تتراوح مدة معظم حلقات {0} بين دقيقة وثلاث دقائق، ويمتد الموسم الكامل من 50 إلى 100 حلقة، أي ما يعادل تقريبًا طول فيلم سينمائي، يُقدَّم على دفعات تناسب الهاتف.",
      downloadWhyTitle: "لماذا تنزّل تطبيق Lollipop Drama",
      downloadWhyBody:
        "تطبيق الهاتف هو أسرع طريقة للمشاهدة: تُفتح الحلقات فورًا بملء الشاشة العمودية، ويتكيّف التشغيل مع جودة اتصالك، وتصل الإصدارات الجديدة إلى جهازك بمجرّد طرحها. تتزامن قائمتك وتقدّم مشاهدتك واشتراكاتك بالمبدعين بين الهواتف والأجهزة اللوحية، لتتمكّن من بدء حلقة في الطريق وإكمالها في المنزل.",
      downloadFaqTitle: "تطبيق Lollipop Drama - الأسئلة الشائعة",
      downloadFaq1Q: "هل تنزيل تطبيق Lollipop Drama مجاني؟",
      downloadFaq1A:
        "نعم. تنزيل Lollipop Drama مجاني على iOS وAndroid، ولا يلزم أي اشتراك لبدء المشاهدة. يُبث جزء من الدراما القصيرة مجانًا، بينما تُفتح الحلقات المميزة عبر عمليات شراء اختيارية داخل التطبيق.",
      downloadFaq2Q: "هل يمكنني مشاهدة Lollipop Drama دون اتصال؟",
      downloadFaq2A:
        "نعم. يمكن للمشتركين في Premium تنزيل الحلقات على الجهاز ومشاهدتها دون اتصال بدقة تصل إلى 4K، وهو مفيد أثناء التنقّل أو السفر دون اتصال مستقر.",
      downloadFaq3Q: "في أي البلدان يتوفر Lollipop Drama؟",
      downloadFaq3A:
        "يتوفر Lollipop Drama في أكثر من 100 دولة حول العالم. قد يختلف توفر الحلقات حسب المنطقة بسبب التراخيص، لذا قد تختلف المكتبة التي تراها قليلًا حسب بلد التنزيل.",
      downloadFaq4Q: "ما هي الأجهزة التي يدعمها Lollipop Drama؟",
      downloadFaq4A:
        "يعمل Lollipop Drama على iOS 15 أو أحدث وAndroid 8 أو أحدث، على الهواتف والأجهزة اللوحية. التطبيق محسّن للتشغيل العمودي بملء الشاشة، ويمكن استخدام حساب واحد على عدة أجهزة مع مزامنة تلقائية لتقدّم المشاهدة.",
      creatingFaqTitle: "إنشاء الدراما القصيرة بالذكاء الاصطناعي - الأسئلة الشائعة",
      creatingFaq1Q: "هل أحتاج إلى خبرة في الإنتاج لإنشاء دراما قصيرة بالذكاء الاصطناعي؟",
      creatingFaq1A:
        "لا. صُممت حزمة الأدوات للمبتدئين: تكتب نصًا أو تُعدّله، وتولّد مشاهد من أوصاف نصية، وتحافظ على اتساق الشخصيات عبر تبديل الوجوه، ثم يتولّى خط الإنتاج إضافة الانتقالات والمؤثرات والتعليق الصوتي. معظم المبدعين ينشرون حلقاتهم الأولى في غضون يوم واحد.",
      creatingFaq2Q: "كم تكلّف إنتاج دراما قصيرة بالذكاء الاصطناعي؟",
      creatingFaq2A:
        "التكلفة أقل بكثير من الإنتاج الحي لأن مواقع التصوير والطواقم والمعدات تُستبدل بالتوليد بالذكاء الاصطناعي. يمكن إنتاج موسم أول نموذجي بمئات قليلة من الدولارات من رصيد التوليد، ويوفر Lollipop Drama رصيدًا مجانيًا للمبتدئين لتجربة الفكرة قبل أي إنفاق.",
      creatingFaq3Q: "كيف يربح المبدعون المال على Lollipop Drama؟",
      creatingFaq3A:
        "يحتفظ المبدعون بنسبة 80% من الإيرادات التي تحققها أعمالهم، وهي من أعلى نسب المشاركة في القطاع. تأتي الأرباح من فتح الحلقات واشتراكات المبدعين، ويحصل كبار المبدعين على مكافآت شهرية إضافية بحسب نسب المشاهدة.",
    },
    distribution: distributionMessages.ar,
    login: loginMessages.ar,
  },
};

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: TranslationMessages;
  languages: typeof localeOptions;
  currentLanguage: (typeof localeOptions)[number];
};

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * 非 React 模块的文案桥接：services 层（http.ts / upload.ts）等无法使用
 * useI18n() hook，通过 getMessages() 读取当前语言文案（如网络错误兜底）。
 * 由 I18nProvider 在每次渲染时与当前 locale 保持同步。
 */
let activeMessages: TranslationMessages = translations[getInitialLocale()];
export function getMessages(): TranslationMessages {
  return activeMessages;
}

/** 当前 locale 的非 hook 桥接，供 services 层（http.ts/session.ts）拼 Accept-Language 用 */
let activeLocale: Locale = getInitialLocale();
export function getLocale(): Locale {
  return activeLocale;
}

/**
 * locale → Accept-Language 头取值。取值与短剧 H5 后端约定一致：en/zh/cht/pt/es/ar
 * （见 short-play common/http.interceptor.js、bind.vue zoneLanguageMap）。后端据此返回
 * 对应语言的短信/邮件/错误文案。
 */
export function getAcceptLanguage(): string {
  switch (activeLocale) {
    case "zh-CN":
      return "zh";
    case "zh-TW":
      return "cht";
    case "pt":
      return "pt";
    case "es":
      return "es";
    case "ar":
      return "ar";
    default:
      return "en";
  }
}

function isLocale(value: string): value is Locale {
  return localeOptions.some((item) => item.code === value);
}

function normalizeLocale(value?: string | null): Locale {
  const locale = value?.toLowerCase() ?? "";

  if (locale.startsWith("zh-hk") || locale.startsWith("zh-tw") || locale.startsWith("zh-mo") || locale.includes("hant")) {
    return "zh-TW";
  }

  if (locale.startsWith("zh")) {
    return "zh-CN";
  }

  if (locale.startsWith("pt")) {
    return "pt";
  }

  if (locale.startsWith("es")) {
    return "es";
  }

  if (locale.startsWith("ar")) {
    return "ar";
  }

  return "en";
}

function getInitialLocale(ssrLocale?: Locale): Locale {
  if (typeof window === "undefined") {
    return ssrLocale ?? "en";
  }

  const deployBase = getDeployBasename();

  // 1. 路径前缀优先（与 Nginx /zh/ /en/ /pt/ /es/ /ar/ /zh-TW/ 对齐，SEO 真源）
  try {
    const matched = matchLocalePath(window.location.pathname, deployBase);
    if (matched) {
      return matched.locale;
    }
  } catch {
    // Ignore path parse failures
  }

  // 2. 兼容旧链接 ?lang=xx（后续 effect 会规范化为路径前缀）
  try {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");
    if (urlLang && isLocale(urlLang)) {
      return urlLang;
    }
  } catch {
    // Ignore URL parse failures
  }

  // 3. 读取 localStorage
  try {
    const savedLocale = window.localStorage.getItem(STORAGE_KEY);
    if (savedLocale && isLocale(savedLocale)) {
      return savedLocale;
    }
  } catch {
    // Ignore storage failures and fall back to browser language.
  }

  // 4. 浏览器语言
  return normalizeLocale(window.navigator.languages?.[0] ?? window.navigator.language);
}

/** 在整页跳转前必须写入，否则 en（无路径前缀）会回落到旧 localStorage 语言 */
function persistLocale(next: Locale): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Ignore storage failures
  }
}

/**
 * 将当前 URL 切换到目标语言的路径前缀（去掉 ?lang=）。
 * basename 含语言段时必须整页跳转，以便 Router 以新 basename 重新挂载。
 * @returns true 表示已发起跳转；false 表示路径已对齐，仅需更新 state
 */
function navigateToLocale(next: Locale): boolean {
  if (typeof window === "undefined") return false;

  // 关键：en 默认无 /en 前缀，刷新后 getInitialLocale 会读 localStorage。
  // 若 assign 前未写入目标语言，会从 zh 等旧值再次 navigate 回去，表现为「切不了英语」。
  persistLocale(next);

  const deployBase = getDeployBasename();
  const appPath = stripLocalePrefix(window.location.pathname, deployBase);
  const nextPath = buildLocalizedPath(next, appPath, deployBase);

  const url = new URL(window.location.href);
  const hadLangQuery = url.searchParams.has("lang");
  url.searchParams.delete("lang");
  url.pathname = nextPath;

  const nextHref = url.pathname + url.search + url.hash;
  const currentHref =
    window.location.pathname + window.location.search + window.location.hash;

  if (nextHref !== currentHref) {
    // 路径或 query 变化：完整导航以重置 BrowserRouter basename
    window.location.assign(nextHref);
    return true;
  }

  if (hadLangQuery) {
    window.history.replaceState(null, "", nextHref);
  }
  return false;
}

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  /** SSR / 预渲染时由入口注入，避免 window 缺失时落到 en */
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(() => getInitialLocale(initialLocale));

  // 同步非 hook 的文案桥接，供 services 层读取当前语言
  activeMessages = translations[locale];
  activeLocale = locale;

  const setLocale = useCallback((next: Locale) => {
    // 先于可能发生的整页跳转持久化，避免仅依赖下方 useEffect（navigated 时不会 setState）
    persistLocale(next);

    if (next === activeLocale) {
      // 仍尝试规范化 URL（例如旧 ?lang= 链到路径式）
      navigateToLocale(next);
      return;
    }
    const navigated = navigateToLocale(next);
    if (!navigated) {
      setLocaleState(next);
    }
    // navigated=true 时页面即将卸载，不必 setState
  }, []);

  useEffect(() => {
    persistLocale(locale);

    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";

    // 规范化：?lang= 旧链 → 路径前缀；去掉残留 query
    try {
      navigateToLocale(locale);
    } catch {
      // Ignore URL update failures
    }

    // 切换语言时同步 SEO title / description / Open Graph
    // 默认设置首页 SEO，各页面组件会通过 applySeoMeta 覆盖为页面专属 meta
    applySeoMeta(getPageSeo("home", locale), "home");
  }, [locale]);

  const currentLanguage = localeOptions.find((item) => item.code === locale) ?? localeOptions[2];

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        messages: translations[locale],
        languages: localeOptions,
        currentLanguage,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider.");
  }

  return context;
}
