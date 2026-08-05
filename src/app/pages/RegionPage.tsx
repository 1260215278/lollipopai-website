/**
 * 区域落地页 —— /region/:code
 * 承接 GEO 地理定位搜索流量，展示本地热门剧集和支付方式。
 * SEO: WebPage + BreadcrumbList Schema
 */
import { useEffect } from "react";
import { useParams, Link } from "react-router";
import { motion } from "motion/react";
import { Star, Play, Globe, CreditCard, Lightbulb, ArrowLeft, Film, Download } from "lucide-react";
import { MarketingPageShell } from "../components/MarketingPageShell";
import { applyCustomSeoMeta, setPageSchema, clearPageSchema, getLocalizedDynamicSeo } from "../i18n.seo";
import { useI18n } from "../i18n";
import { getRegionByCode, regions as allRegions } from "../data/regions";
import { getDramasBySlugs, getDramaPoster } from "../data/dramas";

const H5_URL = "https://play.google.com/store/apps/details?id=com.StargetVenturesLLC.hks";

export function RegionPage() {
  const { code = "" } = useParams();
  const { locale, messages } = useI18n();
  const dp = messages.dynamicPages;
  const region = getRegionByCode(code);
  const dramas = region ? getDramasBySlugs(region.popularDramaSlugs) : [];

  useEffect(() => {
    if (!region) {
      clearPageSchema();
      return;
    }

    const seo = getLocalizedDynamicSeo(
      region.seoTitle,
      region.seoDescription,
      locale,
      "region",
      region.country,
    );
    applyCustomSeoMeta(seo, `/region/${region.code}`);

    setPageSchema({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: region.seoTitle,
      description: region.seoDescription,
      url: `https://www.lollipop.im/region/${region.code}`,
      isPartOf: {
        "@type": "WebSite",
        name: "Lollipop AI",
        url: "https://www.lollipop.im",
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.lollipop.im/" },
          { "@type": "ListItem", position: 2, name: "Regions", item: "https://www.lollipop.im/" },
          { "@type": "ListItem", position: 3, name: region.country, item: `https://www.lollipop.im/region/${region.code}` },
        ],
      },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: dramas.length,
        itemListElement: dramas.slice(0, 6).map((d, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `https://www.lollipop.im/drama/${d.slug}`,
          name: d.title,
        })),
      },
    });

    return () => clearPageSchema();
  }, [region, dramas, locale]);

  if (!region) {
    return (
      <MarketingPageShell>
        <div className="flex flex-col items-center justify-center py-40 gap-4 text-white/50">
          <Globe className="w-12 h-12 text-white/20" />
          <p>{dp.notFoundRegion}</p>
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
          <span className="text-white/80">{region.country}</span>
        </div>

        {/* Region Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent" style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            {region.tier} {dp.market}
          </span>
          <h1 className="text-white mt-2" style={{ fontFamily: "Playfair Display", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700 }}>
            {dp.shortDramasIn.replace("{0}", region.country)}
          </h1>
          <p className="text-gray-400 mt-4 max-w-2xl" style={{ fontSize: "1rem", lineHeight: 1.8 }}>
            {region.intro}
          </p>
        </motion.div>

        {/* Popular Dramas */}
        {dramas.length > 0 && (
          <section className="mb-16">
            <h2 className="text-white mb-6" style={{ fontSize: "1.4rem", fontWeight: 700 }}>
              {dp.popularIn.replace("{0}", region.country)}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {dramas.map((drama, i) => (
                <motion.div
                  key={drama.slug}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group cursor-pointer"
                >
                  <Link to={`/drama/${drama.slug}`}>
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/5">
                      {(() => { const poster = getDramaPoster(drama.slug); return poster ? (
                        <img src={poster} alt={drama.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 to-black flex items-center justify-center">
                          <Film className="w-8 h-8 text-white/15" />
                        </div>
                      ); })()}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white/90 bg-black/40 rounded px-1.5 py-0.5">
                        <Play className="w-3 h-3" />{drama.views}
                      </div>
                    </div>
                    <h3 className="mt-2 text-white/90 group-hover:text-red-400 transition-colors truncate" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                      {drama.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-yellow-400" style={{ fontSize: "0.7rem" }}>
                        <Star className="w-3 h-3 fill-yellow-400" />{drama.rating}
                      </span>
                      <span className="text-gray-500" style={{ fontSize: "0.7rem" }}>{drama.episodes} {dp.ep}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Local Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Payment Methods */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-white" style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                {dp.paymentMethodsIn.replace("{0}", region.country)}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {region.paymentMethods.map((method) => (
                <span
                  key={method}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-gray-300"
                  style={{ fontSize: "0.8rem" }}
                >
                  {method}
                </span>
              ))}
            </div>
          </div>

          {/* Local Tip */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-white" style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                {dp.localTips}
              </h3>
            </div>
            <p className="text-gray-400" style={{ fontSize: "0.9rem", lineHeight: 1.7 }}>
              {region.localTip}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-red-600/20 to-orange-600/10 border border-red-500/20 rounded-2xl p-8 text-center mb-16">
          <h2 className="text-white mb-3" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            {dp.startWatchingIn.replace("{0}", region.country)}
          </h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto" style={{ fontSize: "0.9rem" }}>
            {dp.downloadAppDesc}
          </p>
          <a
            href={H5_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold hover:from-red-400 hover:to-orange-400 transition-all"
          >
            <Download className="w-5 h-5" />
            {dp.downloadFree}
          </a>
        </div>

        {/* Other Regions */}
        <div className="pt-8 border-t border-white/5">
          <h2 className="text-white mb-6" style={{ fontSize: "1.2rem", fontWeight: 700 }}>{dp.availableInOtherRegions}</h2>
          <div className="flex flex-wrap gap-3">
            {allRegions.filter((r) => r.code !== region.code).map((r) => (
              <Link
                key={r.code}
                to={`/region/${r.code}`}
                className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-red-500/40 hover:bg-red-500/5 transition-all"
                style={{ fontSize: "0.85rem" }}
              >
                {r.country}
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
