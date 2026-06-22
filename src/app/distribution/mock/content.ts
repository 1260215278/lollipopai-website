/**
 * 上剧中心 Mock 数据
 * ------------------------------------------------------------------
 * 字段语义全部来自原型 dashboard/ContentPage.tsx，不编造、不撒网 fallback。
 * service 层（services/content.ts）在 VITE_USE_MOCK 时返回这里的数据；
 * 真实接口就绪后由 service 切换为 http 调用，本文件仅作 mock 数据源。
 *
 * 国家收费规则按硬约束「前端写死 US/PH/IN，沿用原型常量、原样移植、不改数值」。
 */

/** 国家收费定价（平台统一定价，只读） */
export interface CountryPricing {
  /** 整部剧价格，如 "$80" */
  full: string;
  /** 单集价格，如 "$10" */
  single: string;
  /** 15s 广告费描述，无广告则为 null（如 "15s广告费: $0.008/次"） */
  ad: string | null;
}

/** 上架国家定义（value 为业务码；label 走 i18n，flag 固定） */
export interface CountryDef {
  value: string;
  flag: string;
  pricing: CountryPricing;
}

/**
 * 国家收费规则常量（US / PH / IN）——原样移植自原型，数值不可改。
 * 名称走 i18n（messages.distribution.content.countries[value]）。
 */
export const COUNTRIES: CountryDef[] = [
  { value: "us", flag: "🇺🇸", pricing: { full: "$80", single: "$10", ad: null } },
  { value: "ph", flag: "🇵🇭", pricing: { full: "$12", single: "$1.5", ad: "15s广告费: $0.008/次" } },
  { value: "in", flag: "🇮🇳", pricing: { full: "$8", single: "$0.8", ad: "15s广告费: $0.005/次" } },
];

/** 可选标签（value 为业务码；label 走 i18n） */
export const TAG_VALUES = [
  "urban",
  "rural",
  "romance",
  "youth",
  "family",
  "mystery",
  "comeback",
  "plot",
  "wuxia",
  "comedy",
  "ancient",
  "campus",
] as const;
export type TagValue = (typeof TAG_VALUES)[number];

/** 频道（value 为业务码；label 走 i18n） */
export const CHANNEL_VALUES = ["male", "female", "general"] as const;
export type ChannelValue = (typeof CHANNEL_VALUES)[number];

/** 版权类型 */
export type CopyrightType = "self" | "licensed";

/** 发布范围：account=仅账号主页 / full=全量推荐 */
export type DistributionType = "account" | "full";

/** 收益方式：account=账户主页订阅 2:8 / full=全量推荐订阅 4:6 */
export type RevenueType = "account" | "full";

/** 剧集上架/审核状态 */
export type DramaStatus = "online" | "offline" | "reviewing" | "not_published";

/** 单集上传状态 */
export type EpisodeStatus = "uploaded" | "processing" | "failed";

/** 列表 / 详情用的短剧记录（字段来自原型 DramaRow，distribution 统一为 account|full） */
export interface DramaRow {
  id: string;
  name: string;
  description: string;
  /** 封面 URL，空串表示未上传 */
  cover: string;
  /** 总集数 */
  episodes: number;
  /** 已上传集数（冗余展示用） */
  uploadedEpisodes: number;
  /** 上架国家 value 列表 */
  countries: string[];
  /** 标签 value 列表 */
  tags: string[];
  distribution: DistributionType;
  status: DramaStatus;
  copyright: CopyrightType;
  revenueType: RevenueType;
  /** 频道 value */
  channel: ChannelValue;
  /** 上传日期 YYYY-MM-DD */
  uploadedAt: string;
}

/** 单集记录（剧集视频管理用，字段来自原型 EpisodeRecord） */
export interface EpisodeRecord {
  ep: number;
  title: string;
  /** 时长 m:ss，未知为 "—" */
  duration: string;
  /** 文件大小，未知为 "—" */
  size: string;
  /** 上传日期，未知为 "—" */
  uploadedAt: string;
  status: EpisodeStatus;
}

/** 创建/编辑短剧基本信息入参（来自原型 BasicInfo，cover 为已上传 URL） */
export interface CreateDramaInput {
  name: string;
  description: string;
  /** 封面 URL（经 uploadFile 上传后得到） */
  cover: string;
  countries: string[];
  tags: string[];
  totalEpisodes: number;
  copyrightType: CopyrightType;
  channel: ChannelValue;
  distribution: DistributionType;
  /** online=立即上架（提交后转审核中）/ offline=暂不上架 */
  publishStatus: "online" | "offline";
}

/* ─── Mock 数据 ─────────────────────────────────────────────────── */

/** Mock 剧集列表（原样移植原型 mockDramas，channel 转为 value） */
export const mockDramas: DramaRow[] = [
  {
    id: "D20260105001",
    name: "星河恋人",
    description:
      "一段跨越星际的爱情故事，讲述了一位普通女孩与星际联盟将领之间缘分交织的浪漫旅程。情感细腻，画面唯美，深受女性观众喜爱。",
    cover: "",
    episodes: 30,
    uploadedEpisodes: 28,
    countries: ["us", "ph"],
    tags: ["romance", "youth", "plot"],
    distribution: "full",
    status: "online",
    copyright: "self",
    revenueType: "full",
    channel: "female",
    uploadedAt: "2026-01-05",
  },
  {
    id: "D20260201002",
    name: "穿越千年寻你",
    description:
      "现代女作家意外穿越到古代，与命中注定的王爷相遇。历史与现代交融，爱情与宿命缠绕，演绎一段感人至深的千年之恋。",
    cover: "",
    episodes: 24,
    uploadedEpisodes: 24,
    countries: ["us"],
    tags: ["ancient", "romance", "comeback"],
    distribution: "account",
    status: "online",
    copyright: "licensed",
    revenueType: "account",
    channel: "general",
    uploadedAt: "2026-02-01",
  },
  {
    id: "D20260310003",
    name: "总裁的秘密",
    description:
      "看似冷漠的商业帝国掌舵者，内心深藏着不为人知的秘密。当真相一层层揭开，爱情与权谋之间的选择让人窒息。",
    cover: "",
    episodes: 40,
    uploadedEpisodes: 35,
    countries: ["ph", "in"],
    tags: ["urban", "mystery", "romance"],
    distribution: "full",
    status: "reviewing",
    copyright: "self",
    revenueType: "full",
    channel: "female",
    uploadedAt: "2026-03-10",
  },
];

/**
 * 各剧集的单集明细（原样移植原型 mockEpisodes 的生成逻辑）。
 * 注：使用确定性的伪随机派生，避免每次渲染抖动。
 */
function pseudoDuration(seed: number): string {
  const m = 2 + (seed % 3);
  const s = (seed * 7) % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
function pseudoSize(base: number, seed: number): string {
  return `${(base + (seed % 8) * 10).toFixed(1)} MB`;
}

export const mockEpisodes: Record<string, EpisodeRecord[]> = {
  D20260105001: Array.from({ length: 30 }, (_, i) => ({
    ep: i + 1,
    title: `第${i + 1}集`,
    duration: pseudoDuration(i + 1),
    size: pseudoSize(120, i + 1),
    uploadedAt: "2026-01-05",
    status: (i < 28 ? "uploaded" : i === 28 ? "processing" : "failed") as EpisodeStatus,
  })),
  D20260201002: Array.from({ length: 24 }, (_, i) => ({
    ep: i + 1,
    title: `第${i + 1}集`,
    duration: pseudoDuration(i + 5),
    size: pseudoSize(100, i + 3),
    uploadedAt: "2026-02-01",
    status: "uploaded" as EpisodeStatus,
  })),
  D20260310003: Array.from({ length: 40 }, (_, i) => ({
    ep: i + 1,
    title: `第${i + 1}集`,
    duration: pseudoDuration(i + 2),
    size: pseudoSize(90, i + 6),
    uploadedAt: "2026-03-10",
    status: (i < 35 ? "uploaded" : "processing") as EpisodeStatus,
  })),
};
