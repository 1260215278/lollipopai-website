/**
 * 品类（Genre）数据 —— 供品类分类页 /genre/:slug 使用。
 * 每个品类包含 SEO 文案、描述、关联剧集 ID 列表。
 */

export interface GenreData {
  slug: string;
  name: string;
  count: string;
  /** SEO title（英文，≤60 字符） */
  seoTitle: string;
  /** SEO description（英文，≤160 字符） */
  seoDescription: string;
  /** 品类介绍（150-200 字，展示在页面顶部） */
  intro: string;
  /** 关联剧集 ID 列表（对应 dramas.ts 中的 id） */
  dramaIds: string[];
}

export const genres: GenreData[] = [
  {
    slug: "romance",
    name: "Romance",
    count: "320+ Shows",
    seoTitle: "Romance Short Dramas — Watch Online | Lollipop Drama",
    seoDescription:
      "Watch 320+ romance short dramas on Lollipop Drama. Stream the best love stories, CEO romances, and revenge dramas with AI and live-action content.",
    intro:
      "From forbidden love to second chances, our romance collection features over 320 premium short dramas. Whether you crave CEO romances, enemies-to-lovers tropes, or heartwarming love stories, you'll find your next obsession here. New episodes drop daily.",
    dramaIds: ["temptation-ceo", "the-bride-who-fell-from-the-sky", "the-revenge-of-the-plus-size-wife", "my-royal-alpha-boyfriend", "whispered-love"],
  },
  {
    slug: "revenge",
    name: "Revenge",
    count: "180+ Shows",
    seoTitle: "Revenge Short Dramas — Watch Online | Lollipop Drama",
    seoDescription:
      "Watch 180+ revenge short dramas on Lollipop Drama. Stream thrilling payback stories, betrayal dramas, and satisfying justice series in bite-sized episodes.",
    intro:
      "Sweet vengeance in bite-sized episodes. Our revenge collection delivers satisfying payback stories where the underdog rises. From betrayed spouses to wronged heirs, watch justice served one episode at a time.",
    dramaIds: ["temptation-ceo", "the-revenge-of-the-plus-size-wife"],
  },
  {
    slug: "thriller",
    name: "Thriller",
    count: "150+ Shows",
    seoTitle: "Thriller Short Dramas — Watch Online | Lollipop Drama",
    seoDescription:
      "Watch 150+ thriller short dramas on Lollipop Drama. Stream suspenseful mysteries, psychological thrillers, and edge-of-your-seat series in 1-3 minute episodes.",
    intro:
      "Edge-of-your-seat suspense in every episode. Our thriller collection features 150+ gripping short dramas — from psychological mind-benders to dark mysteries. Perfect for viewers who love a good plot twist and cliffhanger endings.",
    dramaIds: ["dark-secrets", "why-jump-off-the-building", "neon-abyss", "the-forgotten"],
  },
  {
    slug: "ceo-drama",
    name: "CEO Drama",
    count: "260+ Shows",
    seoTitle: "CEO Drama Short Series — Watch Online | Lollipop Drama",
    seoDescription:
      "Watch 260+ CEO drama short series on Lollipop Drama. Stream billionaire romances, workplace power struggles, and corporate intrigue in premium short dramas.",
    intro:
      "Power, wealth, and forbidden romance. Our CEO drama collection brings you 260+ premium short series featuring billionaire love interests, corporate power plays, and office romance. The most addictive genre on Lollipop Drama.",
    dramaIds: ["temptation-ceo"],
  },
  {
    slug: "fantasy",
    name: "Fantasy",
    count: "120+ Shows",
    seoTitle: "Fantasy Short Dramas — Watch Online | Lollipop Drama",
    seoDescription:
      "Watch 120+ fantasy short dramas on Lollipop Drama. Stream magical adventures, supernatural romances, and AI-generated fantasy series in premium quality.",
    intro:
      "Enter magical worlds where anything is possible. Our fantasy collection features 120+ short dramas with supernatural elements, magical realms, and otherworldly romance. Many titles are enhanced with AI-generated visuals for truly unique storytelling.",
    dramaIds: ["the-bride-who-fell-from-the-sky", "my-royal-alpha-boyfriend", "cloud-atlas"],
  },
  {
    slug: "action",
    name: "Action",
    count: "90+ Shows",
    seoTitle: "Action Short Dramas — Watch Online | Lollipop Drama",
    seoDescription:
      "Watch 90+ action short dramas on Lollipop Drama. Stream martial arts, fight scenes, and adrenaline-pumping series in bite-sized episodes optimized for mobile.",
    intro:
      "High-octane action in every frame. Our action collection delivers 90+ short dramas packed with martial arts, chase sequences, and adrenaline-fueled storylines. Perfect for viewers who want excitement in bite-sized episodes.",
    dramaIds: ["iron-will"],
  },
  {
    slug: "horror",
    name: "Horror",
    count: "85+ Shows",
    seoTitle: "Horror Short Dramas — Watch Online | Lollipop Drama",
    seoDescription:
      "Watch 85+ horror short dramas on Lollipop Drama. Stream scary stories, supernatural horror, and psychological terror in short-form episodes. Not for the faint-hearted.",
    intro:
      "Terrifying tales in bite-sized portions. Our horror collection features 85+ short dramas that will keep you up at night. From supernatural hauntings to psychological terror, each episode delivers a quick scare perfect for mobile viewing.",
    dramaIds: [],
  },
  {
    slug: "sci-fi",
    name: "Sci-Fi",
    count: "75+ Shows",
    seoTitle: "Sci-Fi Short Dramas — Watch Online | Lollipop Drama",
    seoDescription:
      "Watch 75+ sci-fi short dramas on Lollipop Drama. Stream futuristic stories, AI-generated science fiction, and cyberpunk series in premium short-form quality.",
    intro:
      "Explore the future in bite-sized episodes. Our sci-fi collection features 75+ short dramas set in futuristic worlds, from cyberpunk dystopias to space adventures. Many titles showcase AI-generated visuals for truly otherworldly storytelling.",
    dramaIds: ["neon-abyss"],
  },
  {
    slug: "family",
    name: "Family",
    count: "110+ Shows",
    seoTitle: "Family Short Dramas — Watch Online | Lollipop Drama",
    seoDescription:
      "Watch 110+ family short dramas on Lollipop Drama. Stream heartwarming family stories, parenting struggles, and domestic drama series in premium short-form quality.",
    intro:
      "Heartwarming stories about family, love, and relationships. Our family collection features 110+ short dramas exploring parenting, marriage, sibling bonds, and domestic life. Perfect for viewers seeking emotional, relatable storytelling.",
    dramaIds: [],
  },
  {
    slug: "historical",
    name: "Historical",
    count: "95+ Shows",
    seoTitle: "Historical Short Dramas — Watch Online | Lollipop Drama",
    seoDescription:
      "Watch 95+ historical short dramas on Lollipop Drama. Stream period pieces, royal court intrigue, and ancient romance series in premium short-form quality.",
    intro:
      "Step back in time with our historical collection. 95+ short dramas set in ancient dynasties, royal courts, and bygone eras. From palace intrigue to epic romances, experience history brought to life in premium short-form storytelling.",
    dramaIds: ["crimson-dynasty"],
  },
];

/** 通过 slug 查找品类 */
export function getGenreBySlug(slug: string): GenreData | undefined {
  return genres.find((g) => g.slug === slug);
}

/**
 * 非规范 genre 标签 → 已有页面的 slug 别名表。
 *
 * dramas.ts 的 `genre` 是**自由文本**展示串（如 "Mystery · Suspense"），
 * 不代表一定有对应的 /genre/<slug> 页面。别名表只兜底「没有任何一段能直接命中
 * 规范 slug」的情况，新增标签时在此补一行即可。
 */
const GENRE_SLUG_ALIAS: Record<string, string> = {
  mystery: "thriller",
  suspense: "thriller",
  crime: "thriller",
  detective: "thriller",
  noir: "thriller",
  martial: "action",
  "martial-arts": "action",
  adventure: "fantasy",
  werewolf: "fantasy",
  vampire: "fantasy",
  magic: "fantasy",
  power: "historical",
  dynasty: "historical",
  period: "historical",
  drama: "romance",
  urban: "romance",
  modern: "romance",
  comedy: "family",
  "slice-of-life": "family",
};

/**
 * 展示型 genre 字符串 → 已存在页面的品类（slug + 规范名）。
 *
 * ⚠️ 用途：任何要把 `drama.genre` 变成 `/genre/<slug>` 链接的地方**必须**走这里，
 * 不能直接 `genre.split(" · ")[0].toLowerCase().replace(/\s+/g, "-")` ——
 * 那样当首段没有对应页面时会生成死链（2026-09-01 实测：The Forgotten 的
 * "Mystery · Suspense" 生成了 /genre/mystery，线上 404）。
 *
 * 解析顺序：
 *   1. 逐段尝试直接命中规范 slug（"Sci-Fi · Thriller" → sci-fi）
 *   2. 逐段查别名表（"Mystery · Suspense" → thriller）
 *   3. 兜底到 genres[0]（保证永不产出死链）
 */
export function resolveGenre(genre: string): { slug: string; name: string } {
  const segments = genre
    .split("·")
    .map((s) => s.trim().toLowerCase().replace(/\s+/g, "-"))
    .filter(Boolean);

  for (const seg of segments) {
    const hit = genres.find((g) => g.slug === seg);
    if (hit) return { slug: hit.slug, name: hit.name };
  }
  for (const seg of segments) {
    const alias = GENRE_SLUG_ALIAS[seg];
    if (alias) {
      const hit = getGenreBySlug(alias);
      if (hit) return { slug: hit.slug, name: hit.name };
    }
  }
  return { slug: genres[0].slug, name: genres[0].name };
}
