import type { Locale } from "../../i18n-types";

/**
 * 数据概览文案 —— 由 P2 功能 subagent 拥有并扩充。
 * zh-CN 为权威（取自 Figma 15077-19718 与原型 dashboard/HomePage.tsx）；
 * en 同步；zh-TW / pt / es / ar 机翻占位，6 语言（zh-CN/zh-TW/en/pt/es/ar）结构完全一致。
 *
 * 占位符（由组件 replace）：
 *  - {n}   本月新增部数
 *  - {pct} 较上月环比百分比（已带正负号，如 "+23.4%"）
 */
export interface OverviewMessages {
  title: string;
  subtitle: string;

  // ── 顶部统计卡 ───────────────────────────────
  /** 上剧总数 */
  totalDramas: string;
  /** 累计播放量 */
  totalViews: string;
  /** 累计点赞数 */
  totalLikes: string;
  /** 累计收藏数 */
  totalFavorites: string;
  /** 部数单位（上剧总数右侧小字） */
  unitDrama: string;
  /** 本月新增 {n} 部 */
  monthlyAdded: string;
  /** 较上月 {pct} */
  momChange: string;
  /** 当前余额 */
  balanceUsd: string;
  /** 昨日实得 */
  yesterdayUsd: string;
  /** 本月至今实得 */
  monthToDateUsd: string;

  // ── 趋势图 ───────────────────────────────────
  /** 数据趋势 */
  trendTitle: string;
  /** 近期剧集综合表现 */
  trendSubtitle: string;
  /** 指标：播放量 */
  metricPlays: string;
  /** 指标：点赞 */
  metricLikes: string;
  /** 指标：收藏 */
  metricFavs: string;
  /** 周期：近 7 天 */
  period7: string;
  /** 周期：近 30 天 */
  period30: string;
  /** 汇总：近 7 天播放 */
  sum7Plays: string;
  /** 汇总：近 7 天点赞 */
  sum7Likes: string;
  /** 汇总：近 7 天收藏 */
  sum7Favs: string;
  /** 汇总：近 30 天播放 */
  sum30Plays: string;
  /** 汇总：近 30 天点赞 */
  sum30Likes: string;
  /** 汇总：近 30 天收藏 */
  sum30Favs: string;

  // ── 剧集排行表 ───────────────────────────────
  /** 剧集数据排行 */
  rankTitle: string;
  /** 按播放量排名 */
  rankSubtitle: string;
  colRank: string;
  colDrama: string;
  colEpisodes: string;
  colTotalViews: string;
  colLikes: string;
  colFavorites: string;
  colComments: string;
  colShares: string;
  /** 展开更多排行 */
  expandRanking: string;
  /** 排名上升 / 下降 */
  rankUp: string;
  rankDown: string;
  /** 上期排名 tooltip */
  lastRank: string;
  /** 集数单位（如 24 集 / 24 ep） */
  unitEpisode: string;

  // ── 播放量对比柱状图 ─────────────────────────
  /** 各剧集播放量对比 */
  barTitle: string;
  /** 柱状图播放量图例/tooltip 名 */
  barViews: string;

  // ── 状态 ─────────────────────────────────────
  /** 加载失败提示 */
  loadFailed: string;
}

export const overview: Record<Locale, OverviewMessages> = {
  "zh-CN": {
    title: "数据概览",
    subtitle: "发行数据一览",
    totalDramas: "上剧总数",
    totalViews: "累计播放量",
    totalLikes: "累计点赞数",
    totalFavorites: "累计收藏数",
    unitDrama: "部",
    monthlyAdded: "本月新增 {n} 部",
    momChange: "较上月 {pct}",
    balanceUsd: "当前余额",
    yesterdayUsd: "昨日实得",
    monthToDateUsd: "本月至今实得",
    trendTitle: "数据趋势",
    trendSubtitle: "近期剧集综合表现",
    metricPlays: "播放量",
    metricLikes: "点赞",
    metricFavs: "收藏",
    period7: "近7天",
    period30: "近30天",
    sum7Plays: "近7天播放",
    sum7Likes: "近7天点赞",
    sum7Favs: "近7天收藏",
    sum30Plays: "近30天播放",
    sum30Likes: "近30天点赞",
    sum30Favs: "近30天收藏",
    rankTitle: "剧集数据排行",
    rankSubtitle: "按播放量排名",
    colRank: "排名",
    colDrama: "剧集名称",
    colEpisodes: "集数",
    colTotalViews: "总播放量",
    colLikes: "点赞数",
    colFavorites: "收藏数",
    colComments: "评论数",
    colShares: "分享数",
    expandRanking: "展开更多（{n} 部）",
    rankUp: "升",
    rankDown: "降",
    lastRank: "上期排名：第 {rank} 名",
    unitEpisode: "集",
    barTitle: "各剧集播放量对比",
    barViews: "播放量",
    loadFailed: "数据加载失败，请重试",
  },
  "zh-TW": {
    title: "數據概覽",
    subtitle: "發行數據一覽",
    totalDramas: "上劇總數",
    totalViews: "累計播放量",
    totalLikes: "累計點讚數",
    totalFavorites: "累計收藏數",
    unitDrama: "部",
    monthlyAdded: "本月新增 {n} 部",
    momChange: "較上月 {pct}",
    balanceUsd: "目前餘額",
    yesterdayUsd: "昨日實得",
    monthToDateUsd: "本月至今實得",
    trendTitle: "數據趨勢",
    trendSubtitle: "近期劇集綜合表現",
    metricPlays: "播放量",
    metricLikes: "點讚",
    metricFavs: "收藏",
    period7: "近7天",
    period30: "近30天",
    sum7Plays: "近7天播放",
    sum7Likes: "近7天點讚",
    sum7Favs: "近7天收藏",
    sum30Plays: "近30天播放",
    sum30Likes: "近30天點讚",
    sum30Favs: "近30天收藏",
    rankTitle: "劇集數據排行",
    rankSubtitle: "按播放量排名",
    colRank: "排名",
    colDrama: "劇集名稱",
    colEpisodes: "集數",
    colTotalViews: "總播放量",
    colLikes: "點讚數",
    colFavorites: "收藏數",
    colComments: "評論數",
    colShares: "分享數",
    expandRanking: "展開更多（{n} 部）",
    rankUp: "升",
    rankDown: "降",
    lastRank: "上期排名：第 {rank} 名",
    unitEpisode: "集",
    barTitle: "各劇集播放量對比",
    barViews: "播放量",
    loadFailed: "資料載入失敗，請重試",
  },
  en: {
    title: "Overview",
    subtitle: "Your distribution at a glance",
    totalDramas: "Total Dramas",
    totalViews: "Total Views",
    totalLikes: "Total Likes",
    totalFavorites: "Total Favorites",
    unitDrama: "dramas",
    monthlyAdded: "+{n} this month",
    momChange: "{pct} vs last month",
    balanceUsd: "Balance",
    yesterdayUsd: "Yesterday",
    monthToDateUsd: "Month to Date",
    trendTitle: "Data Trend",
    trendSubtitle: "Recent drama performance",
    metricPlays: "Views",
    metricLikes: "Likes",
    metricFavs: "Favs",
    period7: "7d",
    period30: "30d",
    sum7Plays: "7d Views",
    sum7Likes: "7d Likes",
    sum7Favs: "7d Favs",
    sum30Plays: "30d Views",
    sum30Likes: "30d Likes",
    sum30Favs: "30d Favs",
    rankTitle: "Drama Rankings",
    rankSubtitle: "Ranked by views",
    colRank: "Rank",
    colDrama: "Drama",
    colEpisodes: "Episodes",
    colTotalViews: "Total Views",
    colLikes: "Likes",
    colFavorites: "Favorites",
    colComments: "Comments",
    colShares: "Shares",
    expandRanking: "Show more ({n})",
    rankUp: "Up",
    rankDown: "Down",
    lastRank: "Last rank: #{rank}",
    unitEpisode: "ep",
    barTitle: "Drama Views Comparison",
    barViews: "Views",
    loadFailed: "Failed to load data, please try again",
  },
  pt: {
    title: "Visão geral",
    subtitle: "Sua distribuição em resumo",
    totalDramas: "Total de Dramas",
    totalViews: "Total de Visualizações",
    totalLikes: "Total de Curtidas",
    totalFavorites: "Total de Favoritos",
    unitDrama: "dramas",
    monthlyAdded: "+{n} este mês",
    momChange: "{pct} vs mês anterior",
    balanceUsd: "Saldo",
    yesterdayUsd: "Ontem",
    monthToDateUsd: "Mês até hoje",
    trendTitle: "Tendência de Dados",
    trendSubtitle: "Desempenho recente dos dramas",
    metricPlays: "Visualizações",
    metricLikes: "Curtidas",
    metricFavs: "Favoritos",
    period7: "7d",
    period30: "30d",
    sum7Plays: "Views 7d",
    sum7Likes: "Curtidas 7d",
    sum7Favs: "Favoritos 7d",
    sum30Plays: "Views 30d",
    sum30Likes: "Curtidas 30d",
    sum30Favs: "Favoritos 30d",
    rankTitle: "Ranking de Dramas",
    rankSubtitle: "Classificado por visualizações",
    colRank: "Posição",
    colDrama: "Drama",
    colEpisodes: "Episódios",
    colTotalViews: "Total de Visualizações",
    colLikes: "Curtidas",
    colFavorites: "Favoritos",
    colComments: "Comentários",
    colShares: "Compartilhamentos",
    expandRanking: "Mostrar mais ({n})",
    rankUp: "Subiu",
    rankDown: "Caiu",
    lastRank: "Classificação anterior: #{rank}",
    unitEpisode: "ep",
    barTitle: "Comparação de Visualizações",
    barViews: "Visualizações",
    loadFailed: "Falha ao carregar os dados, tente novamente",
  },
  es: {
    title: "Resumen",
    subtitle: "Su distribución de un vistazo",
    totalDramas: "Total de dramas",
    totalViews: "Reproducciones totales",
    totalLikes: "Me gusta totales",
    totalFavorites: "Favoritos totales",
    unitDrama: "dramas",
    monthlyAdded: "+{n} este mes",
    momChange: "{pct} vs el mes anterior",
    balanceUsd: "Saldo",
    yesterdayUsd: "Ayer",
    monthToDateUsd: "Mes hasta hoy",
    trendTitle: "Tendencia de datos",
    trendSubtitle: "Rendimiento reciente de los dramas",
    metricPlays: "Reproducciones",
    metricLikes: "Me gusta",
    metricFavs: "Favoritos",
    period7: "7d",
    period30: "30d",
    sum7Plays: "Reprod. 7d",
    sum7Likes: "Me gusta 7d",
    sum7Favs: "Favoritos 7d",
    sum30Plays: "Reprod. 30d",
    sum30Likes: "Me gusta 30d",
    sum30Favs: "Favoritos 30d",
    rankTitle: "Ranking de dramas",
    rankSubtitle: "Ordenado por reproducciones",
    colRank: "Puesto",
    colDrama: "Drama",
    colEpisodes: "Episodios",
    colTotalViews: "Reproducciones totales",
    colLikes: "Me gusta",
    colFavorites: "Favoritos",
    colComments: "Comentarios",
    colShares: "Compartidos",
    expandRanking: "Mostrar más ({n})",
    rankUp: "Subió",
    rankDown: "Bajó",
    lastRank: "Puesto anterior: #{rank}",
    unitEpisode: "ep",
    barTitle: "Comparación de reproducciones",
    barViews: "Reproducciones",
    loadFailed: "No se pudieron cargar los datos, inténtelo de nuevo",
  },
  ar: {
    title: "نظرة عامة",
    subtitle: "توزيعك في لمحة",
    totalDramas: "إجمالي الدراما",
    totalViews: "إجمالي المشاهدات",
    totalLikes: "إجمالي الإعجابات",
    totalFavorites: "إجمالي المفضلة",
    unitDrama: "أعمال",
    monthlyAdded: "+{n} هذا الشهر",
    momChange: "{pct} مقارنة بالشهر الماضي",
    balanceUsd: "الرصيد",
    yesterdayUsd: "أمس",
    monthToDateUsd: "منذ بداية الشهر",
    trendTitle: "اتجاه البيانات",
    trendSubtitle: "أداء الدراما الأخير",
    metricPlays: "المشاهدات",
    metricLikes: "الإعجابات",
    metricFavs: "المفضلة",
    period7: "7ي",
    period30: "30ي",
    sum7Plays: "مشاهدات 7 أيام",
    sum7Likes: "إعجابات 7 أيام",
    sum7Favs: "مفضلة 7 أيام",
    sum30Plays: "مشاهدات 30 يومًا",
    sum30Likes: "إعجابات 30 يومًا",
    sum30Favs: "مفضلة 30 يومًا",
    rankTitle: "ترتيب الدراما",
    rankSubtitle: "مرتبة حسب المشاهدات",
    colRank: "الترتيب",
    colDrama: "الدراما",
    colEpisodes: "الحلقات",
    colTotalViews: "إجمالي المشاهدات",
    colLikes: "الإعجابات",
    colFavorites: "المفضلة",
    colComments: "التعليقات",
    colShares: "المشاركات",
    expandRanking: "عرض المزيد ({n})",
    rankUp: "ارتفاع",
    rankDown: "انخفاض",
    lastRank: "الترتيب السابق: #{rank}",
    unitEpisode: "حلقة",
    barTitle: "مقارنة مشاهدات الدراما",
    barViews: "المشاهدات",
    loadFailed: "فشل تحميل البيانات، يرجى المحاولة مرة أخرى",
  },
};
