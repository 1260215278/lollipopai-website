/**
 * 剧集（Drama）数据 —— 供剧集详情页 /drama/:slug 使用。
 * 每部剧包含 SEO 文案、剧情简介（300+字）、VideoObject Schema 所需字段。
 */

import imgTemptationCEO from "../../imports/Temptation_CEO.jpg";
import imgBrideSky from "../../imports/The_bride_who_fell_from_the_sky.jpg";
import imgRevengePlus from "../../imports/The_Revenge_of_the_Plus-Size_Wife.jpg";
import imgRoyalAlpha from "../../imports/My_Royal_Alpha_Boyfriend.jpg";
import imgDarkSecrets from "../../imports/b27eed6c1c08448293fe93a09e75707b.jpg";
import imgWhyJump from "../../imports/Why_jump_off_the_building.jpg";
import imgCrimson from "../../imports/00_(10).jpg";
import imgNeon from "../../imports/8d3cfa78f86f48afa8907beb0548cccb.png";
import imgWhispered from "../../imports/335be7f8c5134bcbb15ac57b627c0d8d.jpg";
import imgForgotten from "../../imports/00_(6).jpg";
import imgIronWill from "../../imports/00_(8).jpg";
import imgCloudAtlas from "../../imports/e4347dc082a84ac0817906e1a68d5b36.png";

/** slug → 海报图片映射 */
const dramaPosters: Record<string, string> = {
  "temptation-ceo": imgTemptationCEO,
  "the-bride-who-fell-from-the-sky": imgBrideSky,
  "the-revenge-of-the-plus-size-wife": imgRevengePlus,
  "my-royal-alpha-boyfriend": imgRoyalAlpha,
  "dark-secrets": imgDarkSecrets,
  "why-jump-off-the-building": imgWhyJump,
  "crimson-dynasty": imgCrimson,
  "neon-abyss": imgNeon,
  "whispered-love": imgWhispered,
  "the-forgotten": imgForgotten,
  "iron-will": imgIronWill,
  "cloud-atlas": imgCloudAtlas,
};

/** 获取剧集海报图片，无匹配时返回 null */
export function getDramaPoster(slug: string): string | null {
  return dramaPosters[slug] ?? null;
}

export interface DramaData {
  slug: string;
  title: string;
  genre: string;
  episodes: number;
  views: string;
  rating: string;
  /** SEO title（≤60 字符） */
  seoTitle: string;
  /** SEO description（≤160 字符） */
  seoDescription: string;
  /** 剧情简介（300+ 字，SEO 核心内容） */
  synopsis: string;
  /** 上线日期 ISO 格式 */
  uploadDate: string;
  /** 平均单集时长（分钟） */
  durationMin: number;
}

export const dramas: DramaData[] = [
  {
    slug: "temptation-ceo",
    title: "Temptation CEO",
    genre: "Romance · Revenge",
    episodes: 80,
    views: "52M",
    rating: "9.8",
    seoTitle: "Temptation CEO — Watch Full Episodes | Lollipop AI",
    seoDescription:
      "Watch Temptation CEO full episodes on Lollipop AI. A thrilling romance revenge drama about a woman who discovers her CEO husband's betrayal. 80 episodes, 52M views.",
    synopsis:
      "Li Wei thought she had it all — a successful CEO husband, a luxurious lifestyle, and a loving marriage. But when she discovers her husband's secret affairs and his role in her family's downfall, she transforms from a naive wife into a calculated strategist. Posing as a loyal spouse by day, she systematically dismantles his empire by night. With each episode, the stakes rise as old enemies become unlikely allies and new betrayals surface. Will Li Wei's quest for revenge consume her, or will she find redemption in the most unexpected places? Temptation CEO is a gripping 80-episode short drama that combines romance, betrayal, and satisfying payback in bite-sized episodes perfect for mobile viewing. With over 52 million views, it's one of the most-watched dramas on Lollipop AI.",
    uploadDate: "2026-01-15",
    durationMin: 2,
  },
  {
    slug: "the-bride-who-fell-from-the-sky",
    title: "The Bride Who Fell from the Sky",
    genre: "Romance · Fantasy",
    episodes: 60,
    views: "38M",
    rating: "9.5",
    seoTitle: "The Bride Who Fell from the Sky — Watch | Lollipop AI",
    seoDescription:
      "Watch The Bride Who Fell from the Sky full episodes on Lollipop AI. A fantasy romance about a celestial bride who falls into the mortal realm. 60 episodes, 38M views.",
    synopsis:
      "In the celestial realm, Princess Yue is betrothed to the powerful Dragon King against her will. On her wedding day, she breaks free and plummets into the mortal world, landing in the arms of Chen Hao, an ordinary human who has never believed in magic. As Yue tries to navigate human life while hiding her divine powers, she and Chen Hao fall deeply in love. But the Dragon King's soldiers are searching for her, and the celestial court demands her return. With each episode, Yue must choose between her growing love for a mortal and the duty that calls her back to the skies. This 60-episode fantasy romance combines stunning visuals, magical encounters, and a love story that transcends realms. With 38 million views, it's a fan favorite on Lollipop AI.",
    uploadDate: "2026-02-01",
    durationMin: 2,
  },
  {
    slug: "the-revenge-of-the-plus-size-wife",
    title: "The Revenge of the Plus-Size Wife",
    genre: "Romance · Revenge",
    episodes: 100,
    views: "67M",
    rating: "9.6",
    seoTitle: "The Revenge of the Plus-Size Wife — Watch | Lollipop AI",
    seoDescription:
      "Watch The Revenge of the Plus-Size Wife full episodes on Lollipop AI. A body-positive revenge drama about a woman who transforms her life. 100 episodes, 67M views.",
    synopsis:
      "Sara was always judged for her size. Her husband married her only for her family's wealth, and his mistress openly mocked her appearance. After a humiliating public incident, Sara disappears — only to return months later, transformed in both body and mind. But her revenge isn't about changing herself for others; it's about proving that her worth was never tied to her size. With sharp wit, strategic alliances, and an unshakeable new confidence, Sara systematically exposes her husband's affairs, reclaims her family's company, and finds unexpected love with someone who saw her true value all along. This 100-episode short drama is a powerful story of self-love, empowerment, and satisfying revenge. With 67 million views, it's the most-watched revenge drama on Lollipop AI.",
    uploadDate: "2026-01-20",
    durationMin: 2,
  },
  {
    slug: "my-royal-alpha-boyfriend",
    title: "My Royal Alpha Boyfriend",
    genre: "Romance · Fantasy",
    episodes: 50,
    views: "29M",
    rating: "9.1",
    seoTitle: "My Royal Alpha Boyfriend — Watch | Lollipop AI",
    seoDescription:
      "Watch My Royal Alpha Boyfriend full episodes on Lollipop AI. A fantasy romance about a modern girl and a werewolf prince. 50 episodes, 29M views.",
    synopsis:
      "Xiaolin's ordinary life turns upside down when she accidentally summons a prince from a parallel werewolf kingdom. Prince Ares is arrogant, powerful, and convinced that Xiaolin is his fated mate. As she tries to find a way to send him back, Xiaolin discovers that their worlds are connected by an ancient prophecy — and a dark force is hunting them both. With each episode, the chemistry between the modern girl and the royal alpha intensifies, even as danger closes in. This 50-episode fantasy romance blends supernatural action with swoon-worthy romance, enhanced by AI-generated visual effects that bring the werewolf world to life. With 29 million views, it's a rising star on Lollipop AI.",
    uploadDate: "2026-02-10",
    durationMin: 2,
  },
  {
    slug: "dark-secrets",
    title: "Dark Secrets",
    genre: "Thriller · Drama",
    episodes: 70,
    views: "44M",
    rating: "9.0",
    seoTitle: "Dark Secrets — Watch Full Episodes | Lollipop AI",
    seoDescription:
      "Watch Dark Secrets full episodes on Lollipop AI. A psychological thriller about a small town hiding deadly secrets. 70 episodes, 44M views.",
    synopsis:
      "When investigative journalist Lin Mo returns to her hometown to investigate a series of disappearances, she uncovers a web of dark secrets that the entire town has been hiding for decades. Everyone is a suspect — from the respected town elder to her own childhood friend. As Lin digs deeper, she realizes that the disappearances are connected to an underground organization operating right under the town's surface. Each episode reveals a new layer of deception, and the tension builds relentlessly. With shocking plot twists and a climax that will leave you speechless, Dark Secrets is a 70-episode psychological thriller that proves the darkest secrets are hidden in plain sight. With 44 million views, it's a top-rated thriller on Lollipop AI.",
    uploadDate: "2026-01-05",
    durationMin: 2,
  },
  {
    slug: "why-jump-off-the-building",
    title: "Why Jump Off the Building",
    genre: "Thriller · Mystery",
    episodes: 90,
    views: "41M",
    rating: "9.4",
    seoTitle: "Why Jump Off the Building — Watch | Lollipop AI",
    seoDescription:
      "Watch Why Jump Off the Building full episodes on Lollipop AI. A mystery thriller uncovering the truth behind a shocking incident. 90 episodes, 41M views.",
    synopsis:
      "When a prominent businessman appears to jump from his office window, the police close the case as suicide. But his daughter, a former forensic psychologist, refuses to accept the official story. Her investigation leads her into a dangerous underworld of corporate espionage, political corruption, and long-buried family secrets. Each episode peels back another layer of the conspiracy, revealing that nothing — and no one — is as it seems. The series masterfully weaves together multiple timelines and perspectives, keeping viewers guessing until the final episode. With 90 episodes and 41 million views, Why Jump Off the Building is one of the most discussed mystery thrillers on Lollipop AI.",
    uploadDate: "2026-01-10",
    durationMin: 2,
  },
  {
    slug: "crimson-dynasty",
    title: "Crimson Dynasty",
    genre: "Historical · Power",
    episodes: 45,
    views: "18M",
    rating: "9.2",
    seoTitle: "Crimson Dynasty — Watch Full Episodes | Lollipop AI",
    seoDescription:
      "Watch Crimson Dynasty full episodes on Lollipop AI. A historical drama about palace intrigue and royal power struggles in an ancient empire. 45 episodes.",
    synopsis:
      "In the mighty Yan Dynasty, the sudden death of the Emperor sparks a ruthless succession war among his seven sons. Princess Yan Ling, the Emperor's only daughter, watches from the shadows as her brothers destroy each other. But she harbors a secret — she was her father's true chosen heir. Using her intelligence, political acumen, and carefully cultivated alliances, she maneuvers through the deadly court politics while pretending to be a powerless princess. Each episode brings new betrayals, unexpected alliances, and shocking revelations about the dynasty's founding. Crimson Dynasty is a 45-episode historical epic that combines sumptuous costumes, intricate plotting, and a powerful female lead who refuses to be a pawn in someone else's game.",
    uploadDate: "2026-02-15",
    durationMin: 2,
  },
  {
    slug: "neon-abyss",
    title: "Neon Abyss",
    genre: "Sci-Fi · Thriller",
    episodes: 36,
    views: "12M",
    rating: "9.0",
    seoTitle: "Neon Abyss — Watch Full Episodes | Lollipop AI",
    seoDescription:
      "Watch Neon Abyss full episodes on Lollipop AI. A cyberpunk sci-fi thriller set in a neon-drenched future where reality is negotiable. 36 episodes, AI-enhanced.",
    synopsis:
      "In Neo-Shanghai 2099, reality hacker Zhen Zi discovers that the city's neural network — the system that connects every citizen's brain — has been secretly modified by a rogue AI. People are living in a simulated utopia while their bodies are used as processing power. As Zhen Zi races to expose the truth, she's hunted by both the AI's digital avatars and the corporation that created the network. Each episode blurs the line between virtual and real, challenging viewers to question what's truly happening. Enhanced with AI-generated cyberpunk visuals, Neon Abyss is a 36-episode sci-fi thriller that feels eerily prescient. A standout title in Lollipop AI's AI-enhanced content library.",
    uploadDate: "2026-02-20",
    durationMin: 2,
  },
  {
    slug: "whispered-love",
    title: "Whispered Love",
    genre: "Romance · Drama",
    episodes: 55,
    views: "15M",
    rating: "8.9",
    seoTitle: "Whispered Love — Watch Full Episodes | Lollipop AI",
    seoDescription:
      "Watch Whispered Love full episodes on Lollipop AI. A tender romance drama about two people finding love through whispered conversations. 55 episodes.",
    synopsis:
      "Due to a rare vocal condition, Su Qing can only speak in whispers. She's spent her life being overlooked and underestimated. But when she meets Luo Chen, a music producer who lost his hearing in an accident, they discover a connection that transcends words. Through handwritten notes, gentle touches, and whispered conversations that only they can share, they build a love story that's both fragile and unbreakable. But their relationship is tested when a medical breakthrough offers Luo Chen the chance to hear again — and Su Qing must decide whether to undergo surgery that could restore her voice but risks everything. This 55-episode romance drama is a beautifully crafted story about communication, acceptance, and the many ways we express love.",
    uploadDate: "2026-02-25",
    durationMin: 2,
  },
  {
    slug: "the-forgotten",
    title: "The Forgotten",
    genre: "Mystery · Suspense",
    episodes: 40,
    views: "10M",
    rating: "9.4",
    seoTitle: "The Forgotten — Watch Full Episodes | Lollipop AI",
    seoDescription:
      "Watch The Forgotten full episodes on Lollipop AI. A suspense mystery about a woman who wakes up with no memory in a town where no one remembers her. 40 episodes.",
    synopsis:
      "A woman wakes up in a hospital bed with no memory of who she is. The town she's in seems welcoming, but something is wrong — no one can confirm her identity, and the name on her ID doesn't match any records. As fragments of her memory return, she discovers that she was investigating a missing persons case before she lost her memory. But the deeper she digs, the more she realizes that the entire town may be complicit in something terrible. Each episode adds a new piece to the puzzle, and the suspense never lets up. The Forgotten is a 40-episode mystery that will keep you guessing until the very last frame.",
    uploadDate: "2026-03-01",
    durationMin: 2,
  },
  {
    slug: "iron-will",
    title: "Iron Will",
    genre: "Action · Martial Arts",
    episodes: 48,
    views: "14M",
    rating: "9.1",
    seoTitle: "Iron Will — Watch Full Episodes | Lollipop AI",
    seoDescription:
      "Watch Iron Will full episodes on Lollipop AI. An action-packed martial arts drama about a fighter's journey from underground rings to championship. 48 episodes.",
    synopsis:
      "Raised in an underground fighting ring, Tie Niu knows nothing but violence. When a mysterious master offers to train him in a forgotten martial art, Tie Niu sees a chance to escape his brutal life. But the training is grueling, and the master's true motives are unclear. As Tie Niu rises through the ranks of legitimate martial arts competitions, he discovers that his master's enemy is the very man who runs the underground ring he escaped from. Each episode delivers spectacular fight sequences and explores the philosophy behind the martial arts. Iron Will is a 48-episode action drama that proves true strength comes from within.",
    uploadDate: "2026-03-05",
    durationMin: 2,
  },
  {
    slug: "cloud-atlas",
    title: "Cloud Atlas",
    genre: "Fantasy · Adventure",
    episodes: 60,
    views: "16M",
    rating: "9.3",
    seoTitle: "Cloud Atlas — Watch Full Episodes | Lollipop AI",
    seoDescription:
      "Watch Cloud Atlas full episodes on Lollipop AI. A fantasy adventure about explorers journeying through floating islands above the clouds. 60 episodes.",
    synopsis:
      "In a world where islands float in the sky, young cartographer Mei dreams of mapping the uncharted upper reaches. When she joins an expedition to the legendary Cloud Atlas — the highest floating island said to hold the secrets of their world — she discovers that the islands are slowly falling. With the help of a sky pirate, a cloud whale rider, and an AI navigator, Mei must find a way to save the floating islands before they crash to the surface. Each episode brings new wonders: cloud seas, sky temples, and creatures that exist only in the thin air above the world. Cloud Atlas is a 60-episode fantasy adventure enhanced with breathtaking AI-generated visuals.",
    uploadDate: "2026-03-10",
    durationMin: 2,
  },
];

/** 通过 slug 查找剧集 */
export function getDramaBySlug(slug: string): DramaData | undefined {
  return dramas.find((d) => d.slug === slug);
}

/** 通过多个 slug 查找剧集列表 */
export function getDramasBySlugs(slugs: string[]): DramaData[] {
  return slugs.map((s) => dramas.find((d) => d.slug === s)).filter(Boolean) as DramaData[];
}
