/**
 * 博客列表页 —— /blog
 * 卡片网格布局，Hero 背景图，分类筛选 Pill Tabs
 * SEO: Blog Schema
 *
 * 2026-09-01 起 /guides 的 9 篇操作型指南已迁入本站（共 30 篇）。
 * 这些指南的 category 是 workflow / production / distribution，
 * 在筛选上统一归入「操作指南」组（见 isGuideCategory），
 * 但卡片徽章仍显示细分名（信息量更大），另附步骤数徽章。
 */
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Calendar, User, ListOrdered, ChevronLeft, ChevronRight } from "lucide-react";
import { MarketingPageShell } from "../components/MarketingPageShell";
import { applyCustomSeoMeta, setPageSchema, clearPageSchema } from "../i18n.seo";
import { useI18n } from "../i18n";
// ⚠️ 只导入元数据：正文在 blogContent.ts，导入它会把 550 kB 正文拉回列表页 bundle
import { blogMeta, isGuideCategory, type BlogMeta } from "../data/blog";
import { blogCategoryLabel } from "../lib/blogCategory";
import { localizedHref } from "../localePath";

/**
 * 筛选维度（不是 BlogPost.category 全集）。
 * workflow / production / distribution 不单独出 chip —— 它们全部归入 guide，
 * 否则 7 个筛选按钮会把工具栏挤爆，而用户心智里它们都是「怎么做的」。
 */
const categoryKeys = ["all", "guide", "industry", "creator"] as const;

/**
 * 每页文章数。
 * SEO 说明：分页是客户端状态（不产生 /blog/page/2 之类的可爬 URL），
 * 因此第 1 页承载的内链数量直接决定爬虫能发现多少篇。20 篇/页让 30 篇中
 * 的 20 篇在第 1 页就有真实内链，其余由 sitemap + JSON-LD ItemList 兜底。
 */
const POSTS_PER_PAGE = 20;

const paginationLabels = {
  "zh-CN": { prev: "上一页", next: "下一页", pageOf: "第 {0} / {1} 页" },
  "zh-TW": { prev: "上一頁", next: "下一頁", pageOf: "第 {0} / {1} 頁" },
  en: { prev: "Previous", next: "Next", pageOf: "Page {0} of {1}" },
  pt: { prev: "Anterior", next: "Próximo", pageOf: "Página {0} de {1}" },
};

const blogListSeo = {
  "zh-CN": {
    title: "博客 — AI短剧行业洞察与教程 | Lollipop Drama",
    description: "Lollipop Drama博客：AI短剧行业动态、创作者经济分析、制作教程和成功案例。了解AI如何改变短剧行业。",
  },
  "zh-TW": {
    title: "部落格 — AI短劇行業洞察與教程 | Lollipop Drama",
    description: "Lollipop Drama部落格：AI短劇行業動態、創作者經濟分析、製作教程和成功案例。了解AI如何改變短劇行業。",
  },
  en: {
    title: "Blog — AI Short Drama Insights & Guides | Lollipop Drama",
    description: "Latest insights on AI short dramas, creator economy, and streaming trends from Lollipop Drama. Read tutorials, industry analysis, and creator success stories.",
  },
  pt: {
    title: "Blog — Insights e Guias sobre Dramas Curtos com IA | Lollipop Drama",
    description: "Ultimos insights sobre dramas curtos com IA, economia de criadores e tendencias de streaming do Lollipop Drama. Tutoriais, analises e historias de sucesso.",
  },
};

export function BlogListPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { locale, messages } = useI18n();
  const dp = messages.dynamicPages;
  // 中文（简/繁）用 *Zh 字段，其余语言用英文 title/excerpt
  const useZh = locale === "zh-CN" || locale === "zh-TW";
  const pgLabels = paginationLabels[locale] ?? paginationLabels.en;

  const categoryLabels: Record<string, string> = {
    all: dp.allPosts,
    industry: dp.industryInsights,
    creator: dp.creatorEconomy,
    guide: dp.creatorGuides,
  };

  // Localized category label for card tags (overrides hardcoded blog.ts data)
  // 迁入的细分分类（workflow/production/distribution）显示细分名而非「操作指南」
  const getLocalizedCategoryLabel = (category: string, fallback = category) =>
    isGuideCategory(category) && category !== "guide"
      ? blogCategoryLabel(category, fallback, dp)
      : (categoryLabels[category] ?? fallback);

  useEffect(() => {
    const seo = blogListSeo[locale] ?? blogListSeo.en;
    const useZh = locale === "zh-CN" || locale === "zh-TW";
    applyCustomSeoMeta(seo, "/blog");

    setPageSchema({
      "@context": "https://schema.org",
      "@type": "Blog",
      name: dp.lollipopBlog,
      description: blogListSeo[locale].description,
      url: "https://www.lollipop.im/lollipop/blog",
      publisher: {
        "@type": "Organization",
        name: dp.organizationName,
        url: "https://www.lollipop.im/lollipop/",
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: dp.home, item: "https://www.lollipop.im/lollipop/" },
          { "@type": "ListItem", position: 2, name: dp.blog, item: "https://www.lollipop.im/lollipop/blog" },
        ],
      },
      blogPost: blogMeta.map((p) => ({
        "@type": "BlogPosting",
        headline: useZh ? p.titleZh : p.title,
        description: useZh ? p.excerptZh : p.excerpt,
        datePublished: p.publishDate,
        dateModified: p.updateDate,
        image: {
          "@type": "ImageObject",
          url: `https://www.lollipop.im/lollipop${p.coverImage ?? "/blog-images/guide.webp"}`,
        },
        author: { "@type": "Person", name: p.author, jobTitle: p.authorRole, description: p.authorBio },
        url: `https://www.lollipop.im/lollipop${localizedHref(locale, `/blog/${p.slug}`)}`,
      })),
    });

    return () => clearPageSchema();
  }, [locale]);

  // 按发布日期降序排序（最新的排最前面）
  const sortedPosts = [...blogMeta].sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );

  const filteredPosts: BlogMeta[] =
    activeCategory === "all"
      ? sortedPosts
      : // 「操作指南」按组筛选：guide + workflow + production + distribution
        isGuideCategory(activeCategory)
        ? sortedPosts.filter((p) => isGuideCategory(p.category))
        : sortedPosts.filter((p) => p.category === activeCategory);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const safePage = Math.min(currentPage, totalPages || 1);
  const paginatedPosts = useMemo(
    () => filteredPosts.slice((safePage - 1) * POSTS_PER_PAGE, safePage * POSTS_PER_PAGE),
    [filteredPosts, safePage]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <MarketingPageShell>
      {/* Hero Section */}
      <section
        className="relative w-full flex flex-col items-center justify-center text-center overflow-hidden"
        style={{ height: "70vh", minHeight: 420 }}
      >
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/blog-images/hero-bg.webp')" }}
        />
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.6) 60%, #000000 100%)",
          }}
        />
        {/* Content */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 text-white font-bold px-6"
          style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", lineHeight: 1.15 }}
        >
          {dp.insightsGuidesTrends}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative z-10 text-gray-400 mt-5 max-w-xl px-6"
          style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", lineHeight: 1.6 }}
        >
          {dp.blogDescription}
        </motion.p>
      </section>

      {/* Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 -mt-12 pb-24">
        {/* Category Filter Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mb-14"
        >
          {categoryKeys.map((key) => (
            <button
              key={key}
              onClick={() => { setActiveCategory(key); setCurrentPage(1); }}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                activeCategory === key
                  ? "text-white"
                  : "bg-[#1A1A1A] border border-[#333] text-gray-400 hover:text-white hover:border-red-500/40"
              }`}
              style={
                activeCategory === key
                  ? {
                      background: "#FF4D00",
                      borderColor: "#FF4D00",
                      boxShadow: "0 0 20px rgba(255, 77, 0, 0.3)",
                    }
                  : {}
              }
            >
              {categoryLabels[key]}
            </button>
          ))}
        </motion.div>

        {/* Blog Grid */}
        <div className="grid gap-8" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))" }}>
          {paginatedPosts.map((post, i) => {
            const cardTitle = useZh ? post.titleZh : post.title;
            const cardExcerpt = useZh ? post.excerptZh : post.excerpt;
            return (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
            >
              <Link
                to={`/blog/${post.slug}`}
                className="group block rounded-2xl overflow-hidden border border-[#222] bg-[#121212] transition-all duration-400 hover:-translate-y-2.5 hover:border-[#FF4D00]/60"
                style={{
                  transitionTimingFunction: "cubic-bezier(0.165, 0.84, 0.44, 1)",
                }}
              >
                {/* Card Image */}
                <div className="relative h-56 overflow-hidden">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={cardTitle}
                      className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-110"
                      style={{ transitionTimingFunction: "cubic-bezier(0.165, 0.84, 0.44, 1)" }}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-[#FF4D00] font-bold text-lg px-4 text-center"
                      style={{ background: "linear-gradient(135deg, rgba(255,77,0,0.18), #121212)" }}
                    >
                      {cardTitle}
                    </div>
                  )}
                  {/* Category Tag —— 迁入的指南显示细分名（制作工作流 / 制作排期 / 发行与变现） */}
                  <span
                    className="absolute top-4 left-4 px-3 py-1 rounded text-xs font-bold text-white"
                    style={{ background: "#FF4D00" }}
                  >
                    {getLocalizedCategoryLabel(post.category, post.categoryLabel)}
                  </span>
                  {/* 步骤数徽章 —— 仅操作型指南有（stepCount 来自 blog.ts 元数据） */}
                  {post.stepCount ? (
                    <span
                      className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold text-white/90"
                      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
                    >
                      <ListOrdered className="w-3 h-3" />
                      {dp.stepsCount.replace("{0}", String(post.stepCount))}
                    </span>
                  ) : null}
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {post.publishDate}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> {post.author}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-white font-bold mb-3 transition-colors duration-300 group-hover:text-[#FF4D00]"
                    style={{ fontSize: "1.15rem", lineHeight: 1.4 }}
                  >
                    {cardTitle}
                  </h3>

                  {/* Excerpt */}
                  <p
                    className="text-gray-400 mb-5"
                    style={{
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {cardExcerpt}
                  </p>

                  {/* Read More */}
                  <span className="inline-flex items-center gap-1.5 text-[#FF4D00] font-bold text-sm">
                    {dp.readMore}
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-14">
            <button
              onClick={() => handlePageChange(safePage - 1)}
              disabled={safePage === 1}
              className="flex items-center gap-1 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-[#1A1A1A] border border-[#333] text-gray-400 hover:text-white hover:border-[#FF4D00]/60"
            >
              <ChevronLeft className="w-4 h-4" />
              {pgLabels.prev}
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-10 h-10 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer ${
                  safePage === pageNum
                    ? "text-white"
                    : "bg-[#1A1A1A] border border-[#333] text-gray-400 hover:text-white hover:border-[#FF4D00]/60"
                }`}
                style={
                  safePage === pageNum
                    ? { background: "#FF4D00", borderColor: "#FF4D00", boxShadow: "0 0 20px rgba(255, 77, 0, 0.3)" }
                    : {}
                }
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(safePage + 1)}
              disabled={safePage === totalPages}
              className="flex items-center gap-1 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-[#1A1A1A] border border-[#333] text-gray-400 hover:text-white hover:border-[#FF4D00]/60"
            >
              {pgLabels.next}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </MarketingPageShell>
  );
}
