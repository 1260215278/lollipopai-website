import { createContext, useContext, useEffect, useState } from "react";
import { distributionMessages } from "./distribution/i18n.distribution";
import { loginMessages } from "./i18n.login";
import { applySeoMeta, getPageSeo } from "./i18n.seo";

import type { Locale } from "./i18n-types";
export type { Locale };

export const localeOptions = [
  { code: "zh-TW", label: "繁體中文" },
  { code: "zh-CN", label: "简体中文" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
] as const;

const STORAGE_KEY = "lollipop-locale";

const enMessages = {
  common: {
    brand: "Lollipop",
    language: "Language",
    contactUs: "Contact Us",
    appStore: "App Store",
    googlePlay: "Google Play",
    availableNow: "Available Now",
    freeToDownload: "Free to download",
    noAdsInPremium: "No ads in Premium",
    scanToDownload: "Scan to Download",
    pointCameraAtQr: "Point your camera at the QR code",
    scanForAppStore: "App Store",
    scanForGooglePlay: "Google Play",
    stayUpdated: "Stay Updated",
    getReleaseAlerts: "Get new release notifications",
    emailPlaceholder: "your@email.com",
    go: "Go",
    subscribedSuccess: "Subscribed successfully!",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    allRightsReserved: "All rights reserved.",
    previewComingSoon: "Preview Coming Soon",
    fullEpisodeInApp: "Full episode available in the app",
    downloadOnThe: "Download on the",
    getItOn: "GET IT ON",
    languageUpdated: "Language",
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
    taglineLine1: "The World's First AI Creator Ecosystem Entertainment Platform.",
    taglineLine2: "Built for Millions of Users!",
    stats: [
      { label: "Premium Dramas" },
      { label: "Global Users" },
      { label: "Countries & Regions" },
    ],
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
      "70% revenue share — highest in the industry",
      "Full AI creation toolkit access",
      "Dedicated creator success manager",
      "Global distribution across 50+ countries",
      "Monthly bonus rewards for top performers",
    ],
    stats: [
      { label: "Revenue Share", desc: "Industry-leading creator earnings" },
      { label: "Active Creators", desc: "Growing community worldwide" },
      { label: "Avg. Monthly Earnings", desc: "For top-performing creators" },
      { label: "Success Stories", desc: "Creators reaching 1M+ plays" },
    ],
  },
  downloadCta: {
    eyebrow: "Available Now",
    title: "Your Next Obsession is One Tap Away",
    description: "Join millions of viewers worldwide. Download free and get 7 days of Premium access — no commitment.",
    featuredTitle: "Download Lollipop",
    featuredDescription: "Available on iOS & Android. 4K streaming, offline downloads, and 5,000+ premium short dramas.",
    featuredShowTitle: "Obsessed With My Boss · Pt.2",
    featuredTimer: "0:42",
    notification: "New Episode!",
    rating: "4.9",
    stats: [
      { value: "2M+", label: "Downloads" },
      { value: "4.9★", label: "App Rating" },
      { value: "150+", label: "Countries" },
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
      { num: "50M+", label: "Global Users" },
      { num: "100K+", label: "Creators" },
      { num: "30+", label: "Countries" },
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
      businessContact: "Business Contact",
      customerService: "Customer Service",
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
    watchOnLollipop: "Watch on Lollipop AI",
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
    lollipopBlog: "Lollipop AI Blog",
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
    downloadAppDesc: "Download Lollipop AI and enjoy 5,000+ premium short dramas. Free to download, no subscription required to start.",
    organizationName: "Lollipop AI",
    howToSteps: [
      { name: "Write Your Script", text: "Write a compelling story with 1-3 minute episodes. Focus on a single dramatic question per episode with cliffhanger endings." },
      { name: "Design Your Characters", text: "Use LunoTV 1.5 text-to-image tool to create character designs from text descriptions. Maintain consistency across episodes." },
      { name: "Generate Your Scenes", text: "Use text-to-video tool with detailed prompts describing setting, action, and mood to generate video clips." },
      { name: "Add Voice and Music", text: "Record voice acting or collaborate with voice actors. Add background music from Lollipop AI royalty-free library." },
      { name: "Edit and Polish", text: "Use video-to-video tool for consistent visual styles. Add transitions, subtitles, and episode titles." },
      { name: "Publish on Lollipop AI", text: "Upload through creator distribution center. Add title, thumbnail, synopsis, and genre tags." },
      { name: "Promote Your Drama", text: "Share on social media, engage with viewers, collaborate with other creators. Focus on engagement to boost algorithmic promotion." },
    ],
    howToTotalTime: "PT2H",
    relatedPosts: "Related Posts",
  },
  distribution: distributionMessages.en,
  login: loginMessages.en,
};

export type TranslationMessages = typeof enMessages;

const translations: Record<Locale, TranslationMessages> = {
  en: enMessages,
  "zh-CN": {
    common: {
      brand: "Lollipop",
      language: "语言",
      contactUs: "联系我们",
      appStore: "App Store",
      googlePlay: "Google Play",
      availableNow: "现已上线",
      freeToDownload: "免费下载",
      noAdsInPremium: "Premium 无广告",
      scanToDownload: "扫码下载",
      pointCameraAtQr: "打开相机，对准二维码",
      scanForAppStore: "App Store",
      scanForGooglePlay: "Google Play",
      stayUpdated: "获取更新",
      getReleaseAlerts: "订阅最新上新通知",
      emailPlaceholder: "your@email.com",
      go: "订阅",
      subscribedSuccess: "订阅成功！",
      privacyPolicy: "隐私政策",
      termsOfService: "服务条款",
      allRightsReserved: "保留所有权利。",
      previewComingSoon: "预告即将上线",
      fullEpisodeInApp: "完整剧集请在 App 内观看",
      downloadOnThe: "下载自",
      getItOn: "获取于",
      languageUpdated: "语言",
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
      taglineLine1: "全球首个 AI 创作者生态娱乐平台。",
      taglineLine2: "为数百万用户而生！",
      stats: [
        { label: "精品短剧" },
        { label: "全球用户" },
        { label: "国家和地区" },
      ],
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
        "70% 收益分成，行业领先",
        "完整开放 AI 创作工具包",
        "专属创作者成长支持",
        "覆盖 50+ 国家和地区的全球分发",
        "头部创作者每月额外奖励",
      ],
      stats: [
        { label: "收益分成", desc: "行业领先的创作者收入" },
        { label: "活跃创作者", desc: "持续扩大的全球创作社区" },
        { label: "月均收益", desc: "面向头部创作者" },
        { label: "成功案例", desc: "已有创作者突破 100 万播放" },
      ],
    },
    downloadCta: {
      eyebrow: "现已上线",
      title: "你的下一部上头短剧，只差一次点击",
      description: "加入全球数百万观众，免费下载并立即获得 7 天 Premium 体验，无需承诺。",
      featuredTitle: "下载 Lollipop",
      featuredDescription: "支持 iOS 与 Android，提供 4K 播放、离线缓存与 5000+ 精品短剧。",
      featuredShowTitle: "Obsessed With My Boss · 第 2 部",
      featuredTimer: "0:42",
      notification: "新剧更新！",
      rating: "4.9",
      stats: [
        { value: "2M+", label: "下载量" },
        { value: "4.9★", label: "应用评分" },
        { value: "150+", label: "覆盖国家" },
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
        { num: "50M+", label: "全球用户" },
        { num: "100K+", label: "创作者" },
        { num: "30+", label: "国家" },
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
        businessContact: "商务联系",
        customerService: "联系客服",
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
      watchOnLollipop: "在 Lollipop AI 观看",
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
      lollipopBlog: "Lollipop AI 博客",
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
      downloadAppDesc: "下载 Lollipop AI，畅享 5,000+ 精品短剧。免费下载，无需订阅即可开始观看。",
      organizationName: "Lollipop AI",
      howToSteps: [
        { name: "编写剧本", text: "创作一个 1-3 分钟每集的引人入胜的故事。每集聚焦一个戏剧性疑问，结尾留下悬念。" },
        { name: "设计角色", text: "使用 LunoTV 1.5 文生图工具，通过文字描述生成角色设计。保持跨集角色一致性。" },
        { name: "生成场景", text: "使用文生视频工具，通过描述场景、动作和氛围的详细提示词生成视频片段。" },
        { name: "添加配音与音乐", text: "自行录制配音或与声优合作。从 Lollipop AI 免版税音乐库添加背景音乐。" },
        { name: "剪辑与润色", text: "使用视频转视频工具保持一致的视觉风格。添加转场、字幕和剧集标题。" },
        { name: "发布到 Lollipop AI", text: "通过创作者分发中心上传。添加标题、缩略图、剧情简介和类型标签。" },
        { name: "推广你的短剧", text: "在社交媒体分享，与观众互动，与其他创作者合作。专注互动以提升算法推荐。" },
      ],
      howToTotalTime: "PT2H",
      relatedPosts: "相关文章",
    },
    distribution: distributionMessages["zh-CN"],
    login: loginMessages["zh-CN"],
  },
  "zh-TW": {
    common: {
      brand: "Lollipop",
      language: "語言",
      contactUs: "聯絡我們",
      appStore: "App Store",
      googlePlay: "Google Play",
      availableNow: "現已上線",
      freeToDownload: "免費下載",
      noAdsInPremium: "Premium 無廣告",
      scanToDownload: "掃碼下載",
      pointCameraAtQr: "開啟相機，對準二維碼",
      scanForAppStore: "App Store",
      scanForGooglePlay: "Google Play",
      stayUpdated: "獲取更新",
      getReleaseAlerts: "訂閱最新上新通知",
      emailPlaceholder: "your@email.com",
      go: "訂閱",
      subscribedSuccess: "訂閱成功！",
      privacyPolicy: "隱私政策",
      termsOfService: "服務條款",
      allRightsReserved: "保留所有權利。",
      previewComingSoon: "預告即將上線",
      fullEpisodeInApp: "完整劇集請在 App 內觀看",
      downloadOnThe: "下載自",
      getItOn: "獲取於",
      languageUpdated: "語言",
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
      taglineLine1: "全球首個 AI 創作者生態娛樂內容平台。",
      taglineLine2: "為數百萬用戶而生！",
      stats: [
        { label: "精品短劇" },
        { label: "全球用戶" },
        { label: "國家與地區" },
      ],
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
        "70% 收益分成，行業領先",
        "完整開放 AI 創作工具包",
        "專屬創作者成長支持",
        "覆蓋 50+ 國家與地區的全球分發",
        "頭部創作者每月額外獎勵",
      ],
      stats: [
        { label: "收益分成", desc: "行業領先的創作者收入" },
        { label: "活躍創作者", desc: "持續擴大的全球創作社群" },
        { label: "月均收益", desc: "面向頭部創作者" },
        { label: "成功案例", desc: "已有創作者突破 100 萬播放" },
      ],
    },
    downloadCta: {
      eyebrow: "現已上線",
      title: "你的下一部上頭短劇，只差一次點擊",
      description: "加入全球數百萬觀眾，免費下載並立即獲得 7 天 Premium 體驗，無需承諾。",
      featuredTitle: "下載 Lollipop",
      featuredDescription: "支援 iOS 與 Android，提供 4K 播放、離線快取與 5000+ 精品短劇。",
      featuredShowTitle: "Obsessed With My Boss · 第 2 部",
      featuredTimer: "0:42",
      notification: "新劇更新！",
      rating: "4.9",
      stats: [
        { value: "2M+", label: "下載量" },
        { value: "4.9★", label: "應用評分" },
        { value: "150+", label: "覆蓋國家" },
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
        { num: "50M+", label: "全球用戶" },
        { num: "100K+", label: "創作者" },
        { num: "30+", label: "國家" },
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
        businessContact: "商務聯繫",
        customerService: "聯絡客服",
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
      watchOnLollipop: "在 Lollipop AI 觀看",
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
      lollipopBlog: "Lollipop AI 部落格",
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
      downloadAppDesc: "下載 Lollipop AI，暢享 5,000+ 精品短劇。免費下載，無需訂閱即可開始觀看。",
      organizationName: "Lollipop AI",
      howToSteps: [
        { name: "編寫劇本", text: "創作一個 1-3 分鐘每集的引人入勝的故事。每集聚焦一個戲劇性疑問，結尾留下懸念。" },
        { name: "設計角色", text: "使用 LunoTV 1.5 文生圖工具，透過文字描述生成角色設計。保持跨集角色一致性。" },
        { name: "生成場景", text: "使用文生視頻工具，透過描述場景、動作和氛圍的詳細提示詞生成影片片段。" },
        { name: "添加配音與音樂", text: "自行錄製配音或與聲優合作。從 Lollipop AI 免版稅音樂庫添加背景音樂。" },
        { name: "剪輯與潤色", text: "使用影片轉影片工具保持一致的視覺風格。添加轉場、字幕和劇集標題。" },
        { name: "發佈到 Lollipop AI", text: "透過創作者分發中心上傳。添加標題、縮圖、劇情簡介和類型標籤。" },
        { name: "推廣你的短劇", text: "在社群媒體分享，與觀眾互動，與其他創作者合作。專注互動以提升演算法推薦。" },
      ],
      howToTotalTime: "PT2H",
      relatedPosts: "相關文章",
    },
    distribution: distributionMessages["zh-TW"],
    login: loginMessages["zh-TW"],
  },
  pt: {
    common: {
      brand: "Lollipop",
      language: "Idioma",
      contactUs: "Fale Conosco",
      appStore: "App Store",
      googlePlay: "Google Play",
      availableNow: "Disponível Agora",
      freeToDownload: "Download grátis",
      noAdsInPremium: "Sem anúncios no Premium",
      scanToDownload: "Escaneie para baixar",
      pointCameraAtQr: "Aponte a câmera para o QR code",
      scanForAppStore: "App Store",
      scanForGooglePlay: "Google Play",
      stayUpdated: "Fique por dentro",
      getReleaseAlerts: "Receba alertas de lançamentos",
      emailPlaceholder: "seu@email.com",
      go: "Enviar",
      subscribedSuccess: "Inscrição realizada com sucesso!",
      privacyPolicy: "Política de Privacidade",
      termsOfService: "Termos de Serviço",
      allRightsReserved: "Todos os direitos reservados.",
      previewComingSoon: "Prévia em breve",
      fullEpisodeInApp: "Episódio completo disponível no app",
      downloadOnThe: "Baixe na",
      getItOn: "BAIXE NO",
      languageUpdated: "Idioma",
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
      taglineLine1: "A primeira plataforma de entretenimento com ecossistema de criadores em IA do mundo.",
      taglineLine2: "Feita para milhões de usuários!",
      stats: [
        { label: "Dramas Premium" },
        { label: "Usuários Globais" },
        { label: "Países e Regiões" },
      ],
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
        "70% de participação na receita, entre as maiores do mercado",
        "Acesso total ao kit de criação com IA",
        "Suporte dedicado para sucesso do criador",
        "Distribuição global em mais de 50 países",
        "Bônus mensais para os melhores desempenhos",
      ],
      stats: [
        { label: "participação na receita", desc: "Ganhos de criadores em nível líder de mercado" },
        { label: "Criadores Ativos", desc: "Comunidade global em crescimento" },
        { label: "Ganho Médio Mensal", desc: "Para criadores de melhor desempenho" },
        { label: "Casos de Sucesso", desc: "Criadores que já chegaram a 1M+ reproduções" },
      ],
    },
    downloadCta: {
      eyebrow: "Disponível Agora",
      title: "Seu Próximo Vício Está a Um Toque",
      description: "Junte-se a milhões de espectadores. Baixe grátis e ganhe 7 dias de acesso Premium sem compromisso.",
      featuredTitle: "Baixe a Lollipop",
      featuredDescription: "Disponível em iOS e Android com streaming 4K, downloads offline e mais de 5.000 dramas premium.",
      featuredShowTitle: "Obsessed With My Boss · Pt.2",
      featuredTimer: "0:42",
      notification: "Novo episódio!",
      rating: "4.9",
      stats: [
        { value: "2M+", label: "Downloads" },
        { value: "4.9★", label: "Nota do App" },
        { value: "150+", label: "Países" },
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
        { num: "50M+", label: "Usuários Globais" },
        { num: "100K+", label: "Criadores" },
        { num: "30+", label: "Países" },
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
        businessContact: "Contato Comercial",
        customerService: "Atendimento ao Cliente",
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
      watchOnLollipop: "Assistir no Lollipop AI",
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
      lollipopBlog: "Blog do Lollipop AI",
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
      downloadAppDesc: "Baixe o Lollipop AI e desfrute de 5.000+ dramas curtos premium. Download gratuito, sem assinatura necessária para começar.",
      organizationName: "Lollipop AI",
      howToSteps: [
        { name: "Escreva seu Roteiro", text: "Crie uma história envolvente com episódios de 1-3 minutos. Concentre-se em uma única questão dramática por episódio com finais de suspense." },
        { name: "Desenhe seus Personagens", text: "Use a ferramenta de texto para imagem LunoTV 1.5 para criar designs de personagens a partir de descrições textuais. Mantenha a consistência entre episódios." },
        { name: "Gere suas Cenas", text: "Use a ferramenta de texto para vídeo com prompts detalhados descrevendo cenário, ação e atmosfera para gerar clipes de vídeo." },
        { name: "Adicione Voz e Música", text: "Grave dublagem ou colabore com dubladores. Adicione música de fundo da biblioteca livre de royalties do Lollipop AI." },
        { name: "Edite e Refine", text: "Use a ferramenta de vídeo para vídeo para estilos visuais consistentes. Adicione transições, legendas e títulos de episódios." },
        { name: "Publique no Lollipop AI", text: "Faça upload pelo centro de distribuição de criadores. Adicione título, miniatura, sinopse e tags de gênero." },
        { name: "Promova seu Drama", text: "Compartilhe nas redes sociais, interaja com espectadores, colabore com outros criadores. Foque no engajamento para impulsionar a promoção algorítmica." },
      ],
      howToTotalTime: "PT2H",
      relatedPosts: "Artigos Relacionados",
    },
    distribution: distributionMessages.pt,
    login: loginMessages.pt,
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
 * locale → Accept-Language 头取值。取值与短剧 H5 后端约定一致：en/zh/cht/pt
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

  return "en";
}

function getInitialLocale(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }

  // 1. 优先读取 URL ?lang= 参数（GEO: 让搜索引擎爬虫通过 hreflang 链接进入对应语言版本）
  try {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");
    if (urlLang && isLocale(urlLang)) {
      return urlLang;
    }
  } catch {
    // Ignore URL parse failures
  }

  // 2. 读取 localStorage
  try {
    const savedLocale = window.localStorage.getItem(STORAGE_KEY);
    if (savedLocale && isLocale(savedLocale)) {
      return savedLocale;
    }
  } catch {
    // Ignore storage failures and fall back to browser language.
  }

  // 3. 浏览器语言
  return normalizeLocale(window.navigator.languages?.[0] ?? window.navigator.language);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  // 同步非 hook 的文案桥接，供 services 层读取当前语言
  activeMessages = translations[locale];
  activeLocale = locale;

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // Ignore storage failures and still update the document language.
    }

    document.documentElement.lang = locale;

    // 同步 URL ?lang= 参数（replaceState 避免历史栈污染）
    try {
      const url = new URL(window.location.href);
      if (locale === "en" && !url.searchParams.has("lang")) {
        // 默认语言不添加参数，保持干净 URL
      } else {
        url.searchParams.set("lang", locale);
      }
      window.history.replaceState(null, "", url.toString());
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
