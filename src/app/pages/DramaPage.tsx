/**
 * 剧集详情页 —— /drama/:slug
 * 展示剧集剧情简介、集数、评分等信息，引导用户下载 App 观看。
 * SEO: VideoObject + BreadcrumbList Schema
 */
import { useEffect } from "react";
import { useParams, Link } from "react-router";
import { motion } from "motion/react";
import { Star, Play, Calendar, Film, ArrowLeft, Download, Star as StarIcon } from "lucide-react";
import { MarketingPageShell } from "../components/MarketingPageShell";
import { applyCustomSeoMeta, setPageSchema, clearPageSchema, getLocalizedDynamicSeo } from "../i18n.seo";
import { useI18n } from "../i18n";
import { getDramaBySlug, getDramaPoster } from "../data/dramas";
import { dramas as allDramas } from "../data/dramas";
import { resolveGenre } from "../data/genres";

const H5_URL = "https://play.google.com/store/apps/details?id=com.StargetVenturesLLC.hks";

export function DramaPage() {
  const { slug = "" } = useParams();
  const { locale, messages } = useI18n();
  const dp = messages.dynamicPages;
  const drama = getDramaBySlug(slug);

  // 相关推荐：取同类型的前4部（排除自身）
  const related = drama
    ? allDramas.filter((d) => d.slug !== drama.slug && d.genre.split(" · ")[0] === drama.genre.split(" · ")[0]).slice(0, 4)
    : [];
  // 如果同类型不够4部，补充其他剧集
  const relatedFinal = related.length >= 4 ? related : [...related, ...allDramas.filter((d) => d.slug !== drama?.slug && !related.includes(d))].slice(0, 4);

  useEffect(() => {
    if (!drama) {
      clearPageSchema();
      return;
    }

    const seo = getLocalizedDynamicSeo(
      drama.seoTitle,
      drama.seoDescription,
      locale,
      "drama",
      drama.title,
    );
    applyCustomSeoMeta(seo, `/drama/${drama.slug}`);

    setPageSchema({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: drama.title,
      description: drama.seoDescription,
      thumbnailUrl: getDramaPoster(drama.slug) ? `https://www.lollipop.im${getDramaPoster(drama.slug)}` : `https://www.lollipop.im/og-image.png`,
      uploadDate: drama.uploadDate,
      duration: `PT${drama.durationMin}M`,
      genre: drama.genre,
      numberOfEpisodes: drama.episodes,
      // contentUrl/embedUrl removed — no web player available; pointing to
      // the app store would violate Google's VideoObject spec (requires
      // actual video file URL / embeddable player). App store link is
      // already on the page as a CTA button.
      // aggregateRating removed — platform has no user review system yet;
      // using views (e.g. "52M") as ratingCount violates Google's
      // review snippet spam policy and risks manual action penalty.
      publisher: {
        "@type": "Organization",
        name: "Lollipop Drama",
        url: "https://www.lollipop.im/",
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.lollipop.im/" },
          // ⚠️ 必须走 resolveGenre：drama.genre 是自由文本（如 "Mystery · Suspense"），
          // 直接拿首段拼 URL 会生成 /genre/mystery 这类死链（线上 404）。
          { "@type": "ListItem", position: 2, name: resolveGenre(drama.genre).name, item: `https://www.lollipop.im/genre/${resolveGenre(drama.genre).slug}` },
          { "@type": "ListItem", position: 3, name: drama.title, item: `https://www.lollipop.im/drama/${drama.slug}` },
        ],
      },
    });

    return () => clearPageSchema();
  }, [drama, locale]);

  if (!drama) {
    return (
      <MarketingPageShell>
        <div className="flex flex-col items-center justify-center py-40 gap-4 text-white/50">
          <Film className="w-12 h-12 text-white/20" />
          <p>{dp.notFoundDrama}</p>
          <Link to="/" className="text-red-400 hover:text-red-300">{dp.backToHome}</Link>
        </div>
      </MarketingPageShell>
    );
  }

  return (
    <MarketingPageShell>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-white">{dp.home}</Link>
          <span>/</span>
          <Link to={`/genre/${resolveGenre(drama.genre).slug}`} className="hover:text-white">{resolveGenre(drama.genre).name}</Link>
          <span>/</span>
          <span className="text-white/80 truncate max-w-[200px]">{drama.title}</span>
        </div>

        {/* Drama Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster placeholder */}
            <div className="flex-shrink-0 w-full md:w-[200px]">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-red-900/30 to-black border border-white/10">
                {(() => { const poster = getDramaPoster(drama.slug); return poster ? (
                  <img src={poster} alt={drama.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Film className="w-12 h-12 text-white/15" />
                  </div>
                ); })()}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-600/80 text-white px-2 py-0.5 rounded text-xs font-bold">{drama.episodes} EP</span>
                    <span className="flex items-center gap-1 text-yellow-400 text-xs">
                      <Star className="w-3 h-3 fill-yellow-400" />{drama.rating}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Title + Meta */}
            <div className="flex-1">
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent" style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                {drama.genre}
              </span>
              <h1 className="text-white mt-2" style={{ fontFamily: "Playfair Display", fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 700 }}>
                {drama.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <StarIcon className="w-4 h-4 fill-yellow-400" /> {drama.rating} / 10
                </span>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Play className="w-4 h-4" /> {drama.views} {dp.views}
                </span>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Film className="w-4 h-4" /> {drama.episodes} {dp.episodes}
                </span>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Calendar className="w-4 h-4" /> {drama.uploadDate}
                </span>
              </div>

              {/* Watch CTA */}
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={H5_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-500 hover:to-orange-500 transition-all"
                  style={{ fontWeight: 600, fontSize: "0.9rem" }}
                >
                  <Download className="w-4 h-4" /> {dp.watchOnLollipop}
                </a>
                <Link
                  to="/download"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-white hover:bg-white/10 transition-all"
                  style={{ fontWeight: 600, fontSize: "0.9rem" }}
                >
                  {dp.downloadApp}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Synopsis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
          <h2 className="text-white mb-4" style={{ fontSize: "1.3rem", fontWeight: 700 }}>{dp.synopsis}</h2>
          <div className="text-gray-300" style={{ fontSize: "1rem", lineHeight: 1.9 }}>
            {drama.synopsis.split("\n").map((para, i) => (
              <p key={i} className="mb-4">{para}</p>
            ))}
          </div>
        </motion.div>

        {/* Related Dramas */}
        {relatedFinal.length > 0 && (
          <div className="pt-8 border-t border-white/5">
            <h2 className="text-white mb-6" style={{ fontSize: "1.2rem", fontWeight: 700 }}>{dp.relatedDramas}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedFinal.map((d) => (
                <Link key={d.slug} to={`/drama/${d.slug}`} className="group">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-red-900/20 to-black border border-white/5">
                    {(() => { const poster = getDramaPoster(d.slug); return poster ? (
                      <img src={poster} alt={d.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Film className="w-8 h-8 text-white/15" />
                      </div>
                    ); })()}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-2 left-2">
                      <span className="flex items-center gap-1 text-yellow-400 text-xs">
                        <Star className="w-3 h-3 fill-yellow-400" />{d.rating}
                      </span>
                    </div>
                  </div>
                  <h3 className="mt-2 text-white/80 group-hover:text-red-400 transition-colors truncate" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {d.title}
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: "0.75rem" }}>{d.genre}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

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
