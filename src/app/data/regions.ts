/**
 * 区域落地页数据 —— 供 /:region/short-dramas 路由使用。
 * 覆盖 T1 核心市场（美/英/加/澳）和 T2 增长市场（新/马/菲/印尼）。
 */

export interface RegionData {
  /** URL 路径段，如 us / sg */
  code: string;
  /** 国家名（英文） */
  country: string;
  /** 市场层级 */
  tier: "T1" | "T2" | "T3";
  /** SEO title（≤65 字符） */
  seoTitle: string;
  /** SEO description（≤160 字符） */
  seoDescription: string;
  /** 区域介绍（150-200 字） */
  intro: string;
  /** 本地热门剧集 slug 列表 */
  popularDramaSlugs: string[];
  /** 本地支付方式 */
  paymentMethods: string[];
  /** 本地化提示 */
  localTip: string;
}

export const regions: RegionData[] = [
  {
    code: "us",
    country: "United States",
    tier: "T1",
    seoTitle: "Best Short Drama Platform in USA | Watch AI Series — Lollipop",
    seoDescription:
      "Watch the best short dramas in the USA on Lollipop Drama. Stream 15,000+ AI and live-action series. 80% creator revenue share. Download free on iOS & Android.",
    intro:
      "Lollipop Drama brings the best short drama entertainment to viewers across the United States. With 15,000+ premium shows including romance, thriller, and AI-generated series, there's always something new to watch. Our platform is optimized for mobile viewing, perfect for your daily commute, lunch break, or late-night binge. Available on both iOS and Android, with content tailored for American audiences.",
    popularDramaSlugs: ["temptation-ceo", "dark-secrets", "neon-abyss", "the-revenge-of-the-plus-size-wife"],
    paymentMethods: ["Visa", "Mastercard", "American Express", "Apple Pay", "Google Pay", "PayPal"],
    localTip: "New US viewers get 7 days of Premium access for free. No commitment, cancel anytime.",
  },
  {
    code: "uk",
    country: "United Kingdom",
    tier: "T1",
    seoTitle: "Best Short Drama Platform in UK | Watch AI Series — Lollipop",
    seoDescription:
      "Watch the best short dramas in the UK on Lollipop Drama. Stream 15,000+ AI and live-action series with English subtitles. Download free on iOS & Android.",
    intro:
      "Lollipop Drama is the premier short drama platform for viewers in the United Kingdom. Whether you're in London, Manchester, Edinburgh, or anywhere else in the UK, enjoy 15,000+ premium short dramas optimized for mobile viewing. Our collection includes British favorites, international hits, and exclusive AI-generated content you won't find anywhere else.",
    popularDramaSlugs: ["why-jump-off-the-building", "the-forgotten", "whispered-love", "cloud-atlas"],
    paymentMethods: ["Visa", "Mastercard", "Apple Pay", "Google Pay", "PayPal"],
    localTip: "UK viewers can enjoy multilingual subtitles including British English localization.",
  },
  {
    code: "ca",
    country: "Canada",
    tier: "T1",
    seoTitle: "Best Short Drama Platform in Canada | Watch AI Series",
    seoDescription:
      "Watch the best short dramas in Canada on Lollipop Drama. Stream 15,000+ AI and live-action series. Available in English and French. Download free on iOS & Android.",
    intro:
      "Canadian viewers can now enjoy the best short drama entertainment on Lollipop Drama. With 15,000+ premium shows and content available in both English and French, our platform serves viewers from Toronto to Vancouver to Montreal. Experience bite-sized episodes perfect for mobile viewing, with new content added weekly.",
    popularDramaSlugs: ["the-bride-who-fell-from-the-sky", "my-royal-alpha-boyfriend", "iron-will", "crimson-dynasty"],
    paymentMethods: ["Visa", "Mastercard", "Apple Pay", "Google Pay", "Interac"],
    localTip: "Canadian viewers can switch between English and French interfaces instantly.",
  },
  {
    code: "au",
    country: "Australia",
    tier: "T1",
    seoTitle: "Best Short Drama Platform in Australia | Watch AI Series",
    seoDescription:
      "Watch the best short dramas in Australia on Lollipop Drama. Stream 15,000+ AI and live-action series. Download free on iOS & Android. 4K streaming available.",
    intro:
      "Lollipop Drama brings premium short drama entertainment to viewers across Australia. From Sydney to Perth to Melbourne, enjoy 15,000+ bite-sized drama series optimized for mobile viewing. Our platform offers 4K streaming quality, offline downloads for when you're traveling, and new exclusive content every week.",
    popularDramaSlugs: ["temptation-ceo", "the-revenge-of-the-plus-size-wife", "dark-secrets", "neon-abyss"],
    paymentMethods: ["Visa", "Mastercard", "Apple Pay", "Google Pay", "PayPal"],
    localTip: "Australian viewers get offline downloads with Premium — perfect for long flights.",
  },
  {
    code: "sg",
    country: "Singapore",
    tier: "T2",
    seoTitle: "Best Short Drama Platform in Singapore | Watch AI Series",
    seoDescription:
      "Watch the best short dramas in Singapore on Lollipop Drama. Stream 15,000+ AI and live-action series. Local payment methods supported. Download free on iOS & Android.",
    intro:
      "As Lollipop Drama's headquarters, Singapore gets the best of everything — exclusive premieres, local creator content, and special promotions. Our platform supports English, Simplified Chinese, and Traditional Chinese, serving Singapore's multilingual audience. Enjoy 15,000+ premium short dramas with PayNow and local payment options, plus exclusive content from Southeast Asian creators.",
    popularDramaSlugs: ["crimson-dynasty", "whispered-love", "cloud-atlas", "the-bride-who-fell-from-the-sky"],
    paymentMethods: ["PayNow", "Visa", "Mastercard", "Apple Pay", "Google Pay", "GrabPay"],
    localTip: "Singapore users get exclusive access to Southeast Asian premieres 24 hours before other regions.",
  },
  {
    code: "my",
    country: "Malaysia",
    tier: "T2",
    seoTitle: "Best Short Drama Platform in Malaysia | Watch AI Series",
    seoDescription:
      "Watch the best short dramas in Malaysia on Lollipop Drama. Stream 15,000+ AI and live-action series with multilingual subtitles. Local payment supported.",
    intro:
      "Lollipop Drama brings premium short drama entertainment to viewers across Malaysia. With content available in English, Chinese, and Malay subtitles, our platform serves Malaysia's diverse multilingual audience. Enjoy 15,000+ bite-sized drama series optimized for mobile viewing, with local payment methods including Touch n Go and Boost.",
    popularDramaSlugs: ["my-royal-alpha-boyfriend", "temptation-ceo", "whispered-love", "iron-will"],
    paymentMethods: ["Touch n Go", "Boost", "Visa", "Mastercard", "Apple Pay", "Google Pay"],
    localTip: "Malaysian viewers can enjoy multilingual subtitles in English, Chinese, and Malay.",
  },
  {
    code: "ph",
    country: "Philippines",
    tier: "T2",
    seoTitle: "Best Short Drama Platform in Philippines | Watch AI Series",
    seoDescription:
      "Watch the best short dramas in the Philippines on Lollipop Drama. Stream 15,000+ AI and live-action series. GCash and local payment supported. Download free.",
    intro:
      "Filipino viewers can now enjoy the best short drama entertainment on Lollipop Drama. With 15,000+ premium shows including romance, thriller, and action series, there's something for every Filipino drama fan. Our platform supports GCash and local payment methods, with English and Filipino subtitles available.",
    popularDramaSlugs: ["the-revenge-of-the-plus-size-wife", "dark-secrets", "why-jump-off-the-building", "the-forgotten"],
    paymentMethods: ["GCash", "Maya", "Visa", "Mastercard", "Apple Pay", "Google Pay"],
    localTip: "Philippine viewers get special data-free streaming promotions with select telecom partners.",
  },
  {
    code: "id",
    country: "Indonesia",
    tier: "T2",
    seoTitle: "Best Short Drama Platform in Indonesia | Watch AI Series",
    seoDescription:
      "Watch the best short dramas in Indonesia on Lollipop Drama. Stream 15,000+ AI and live-action series. GoPay and local payment supported. Download free on iOS & Android.",
    intro:
      "Lollipop Drama brings premium short drama entertainment to viewers across Indonesia. With 15,000+ premium shows and content available with Indonesian subtitles, our platform serves audiences from Jakarta to Surabaya to Bali. Enjoy bite-sized episodes optimized for mobile viewing, with local payment methods including GoPay and OVO.",
    popularDramaSlugs: ["cloud-atlas", "my-royal-alpha-boyfriend", "neon-abyss", "crimson-dynasty"],
    paymentMethods: ["GoPay", "OVO", "DANA", "Visa", "Mastercard", "Apple Pay"],
    localTip: "Indonesian viewers can enjoy special data-saving mode for streaming on mobile networks.",
  },
];

/** 通过区域代码查找 */
export function getRegionByCode(code: string): RegionData | undefined {
  return regions.find((r) => r.code === code);
}
