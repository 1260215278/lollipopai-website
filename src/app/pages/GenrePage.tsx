/**
 * 品类分类页 —— /genre/:slug
 * 承接品类搜索流量，展示品类介绍 + 该品类下的剧集列表。
 * SEO: CollectionPage + BreadcrumbList Schema
 */
import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import { Star, Play, ArrowLeft, Film } from "lucide-react";
import { MarketingPageShell } from "../components/MarketingPageShell";
import { applyCustomSeoMeta, setPageSchema, clearPageSchema, getLocalizedDynamicSeo } from "../i18n.seo";
import { useI18n } from "../i18n";
import { getGenreBySlug } from "../data/genres";
import { getDramasBySlugs, getDramaPoster } from "../data/dramas";
import { genres as allGenres } from "../data/genres";

export function GenrePage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { locale, messages } = useI18n();
  const dp = messages.dynamicPages;
  const genre = getGenreBySlug(slug);
  const dramas = genre ? getDramasBySlugs(genre.dramaIds) : [];

  /** 用品类名替换模板占位符，生成品类专属文案（避免 10 品类 × 6 语言 = 60 段硬编码） */
  const fill = (tpl: string) => (genre ? tpl.split("{0}").join(genre.name) : tpl);

  /** 品类 FAQ（可见问答 + FAQPage Schema 同源，GEO 友好且补足页面正文长度） */
  const faq = genre
    ? [
        { q: fill(dp.genreFaq1Q), a: fill(dp.genreFaq1A) },
        { q: fill(dp.genreFaq2Q), a: fill(dp.genreFaq2A) },
        { q: fill(dp.genreFaq3Q), a: fill(dp.genreFaq3A) },
      ]
    : [];

  useEffect(() => {
    if (!genre) {
      clearPageSchema();
      return;
    }

    const seo = getLocalizedDynamicSeo(
      genre.seoTitle,
      genre.seoDescription,
      locale,
      "genre",
      genre.name,
    );
    applyCustomSeoMeta(seo, `/genre/${genre.slug}`);

    const collectionSchema = {
      "@type": "CollectionPage",
      name: `${genre.name} Short Dramas`,
      description: genre.seoDescription,
      url: `https://www.lollipop.im/genre/${genre.slug}`,
      isPartOf: {
        "@type": "WebSite",
        name: "Lollipop Drama",
        url: "https://www.lollipop.im/",
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.lollipop.im/" },
          { "@type": "ListItem", position: 2, name: "Genres", item: "https://www.lollipop.im/#genres" },
          { "@type": "ListItem", position: 3, name: genre.name, item: `https://www.lollipop.im/genre/${genre.slug}` },
        ],
      },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: dramas.length,
        itemListElement: dramas.slice(0, 10).map((d, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `https://www.lollipop.im/drama/${d.slug}`,
          name: d.title,
        })),
      },
    };

    // GEO: FAQPage Schema（与页面可见 FAQ 区块逐字对应）
    const faqSchema = {
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

    setPageSchema({
      "@context": "https://schema.org",
      "@graph": [collectionSchema, faqSchema],
    });

    return () => clearPageSchema();
  }, [genre, dramas, locale]);

  if (!genre) {
    return (
      <MarketingPageShell>
        <div className="flex flex-col items-center justify-center py-40 gap-4 text-white/50">
          <Film className="w-12 h-12 text-white/20" />
          <p>{dp.notFoundGenre}</p>
          <Link to="/" className="text-red-400 hover:text-red-300">{dp.backToHome}</Link>
        </div>
      </MarketingPageShell>
    );
  }

  return (
    <MarketingPageShell>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-white">{dp.home}</Link>
          <span>/</span>
          <Link to="/#genres" className="hover:text-white">{dp.genres}</Link>
          <span>/</span>
          <span className="text-white/80">{genre.name}</span>
        </div>

        {/* Genre Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent" style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            {genre.count}
          </span>
          <h1 className="text-white mt-2" style={{ fontFamily: "Playfair Display", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700 }}>
            {genre.name} {dp.shortDrames}
          </h1>
          <p className="text-gray-400 mt-4 max-w-2xl" style={{ fontSize: "1rem", lineHeight: 1.8 }}>
            {genre.intro}
          </p>
        </motion.div>

        {/* 为什么选择 Lollipop Drama —— 本地化正文，补足品类页内容深度 */}
        <section className="mb-14">
          <h2 className="text-white mb-4" style={{ fontSize: "1.3rem", fontWeight: 700 }}>
            {fill(dp.genreWhyTitle)}
          </h2>
          <p className="text-gray-400 max-w-3xl" style={{ fontSize: "0.95rem", lineHeight: 1.9 }}>
            {fill(dp.genreWhyBody)}
          </p>
        </section>

        {/* Drama Grid */}
        {dramas.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {dramas.map((drama, i) => (
              <motion.div
                key={drama.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/drama/${drama.slug}`)}
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/5">
                  {(() => { const poster = getDramaPoster(drama.slug); return poster ? (
                    <img src={poster} alt={drama.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 to-black flex items-center justify-center">
                      <Film className="w-10 h-10 text-white/15" />
                    </div>
                  ); })()}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white/90 bg-black/40 rounded px-1.5 py-0.5">
                    <Play className="w-3 h-3" />{drama.views}
                  </div>
                </div>
                <h3 className="mt-2 text-white/90 group-hover:text-red-400 transition-colors truncate" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  {drama.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-yellow-400" style={{ fontSize: "0.75rem" }}>
                    <Star className="w-3 h-3 fill-yellow-400" />{drama.rating}
                  </span>
                  <span className="text-gray-500" style={{ fontSize: "0.75rem" }}>{drama.episodes} {dp.ep}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-28 gap-3 text-white/40">
            <Film className="w-10 h-10 text-white/15" />
            <p>{dp.moreDramasComingSoon.replace("{0}", genre.name)}</p>
          </div>
        )}

        {/* FAQ —— 可见问答区块（GEO：与 FAQPage Schema 逐字对应） */}
        <section className="mt-16 pt-8 border-t border-white/5">
          <h2 className="text-white mb-6" style={{ fontSize: "1.3rem", fontWeight: 700 }}>
            {fill(dp.genreFaqTitle)}
          </h2>
          <div className="space-y-6 max-w-3xl">
            {faq.map((f) => (
              <div key={f.q}>
                <h3 className="text-white/90" style={{ fontSize: "1rem", fontWeight: 600 }}>
                  {f.q}
                </h3>
                <p className="text-gray-400 mt-2" style={{ fontSize: "0.95rem", lineHeight: 1.9 }}>
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Other Genres */}
        <div className="mt-16 pt-8 border-t border-white/5">
          <h2 className="text-white mb-6" style={{ fontSize: "1.2rem", fontWeight: 700 }}>{dp.exploreOtherGenres}</h2>
          <div className="flex flex-wrap gap-3">
            {allGenres.filter((g) => g.slug !== genre.slug).map((g) => (
              <Link
                key={g.slug}
                to={`/genre/${g.slug}`}
                className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-red-500/40 hover:bg-red-500/5 transition-all"
                style={{ fontSize: "0.85rem" }}
              >
                {g.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Back link */}
        <div className="mt-12">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors" style={{ fontSize: "0.9rem" }}>
            <ArrowLeft className="w-4 h-4" /> {dp.backToHome}
          </Link>
        </div>
      </div>
    </MarketingPageShell>
  );
}
