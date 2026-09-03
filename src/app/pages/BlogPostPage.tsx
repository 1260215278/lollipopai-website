/**
 * 博客文章详情页 —— /blog/:slug
 *
 * 2026-09-01 起 /guides 的操作型指南已整体迁入本站（见 docs/），本页同时承载两类文章：
 *  - 常规文章（无 steps）→ Article Schema
 *  - 操作型指南（有 steps）→ TechArticle + HowTo Schema，并渲染可见的步骤概览区块
 *
 * ⚠️ GEO 硬要求：HowTo 的 step 必须与页面可见文本完全一致。
 *    因此步骤概览区块直接渲染同一份 steps 数据，不做二次改写。
 */
import { useEffect } from "react";
import { useParams, Link } from "react-router";
import { motion } from "motion/react";
import { Calendar, User, ArrowLeft, ArrowRight, Tag, Clock, BarChart } from "lucide-react";
import { MarketingPageShell } from "../components/MarketingPageShell";
import { applyCustomSeoMeta, setPageSchema, clearPageSchema, getLocalizedDynamicSeo } from "../i18n.seo";
import { useI18n } from "../i18n";
// 详情页需要完整正文 —— 元数据 + 正文两个模块都在这里同步引入
import { blogMeta, isGuideCategory } from "../data/blog";
import { getFullPost } from "../data/blogContent";
import { blogFaq } from "../data/blogFaq";
import { renderMarkdown, stripMarkdown } from "../lib/markdown";
import { blogCategoryLabel } from "../lib/blogCategory";

/** ISO 8601 时长 → 本地化可读文本（P14D → "14 天"，PT3H → "3 小时"） */
function formatIsoDuration(iso: string, unit: { d: string; h: string; m: string }): string {
  const m = /^P(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?)?$/.exec(iso.trim());
  if (!m) return iso;
  const [, d, h, mi] = m;
  if (d) return `${d} ${unit.d}`;
  if (h) return `${h} ${unit.h}`;
  if (mi) return `${mi} ${unit.m}`;
  return iso;
}

const DIFFICULTY_STYLE: Record<string, string> = {
  Beginner: "text-emerald-400 bg-emerald-500/10",
  Intermediate: "text-amber-400 bg-amber-500/10",
  Advanced: "text-red-400 bg-red-500/10",
};




export function BlogPostPage() {
  const { slug = "" } = useParams();
  const { locale, messages } = useI18n();
  const useZh = locale === "zh-CN" || locale === "zh-TW";
  const dp = messages.dynamicPages;
  const post = getFullPost(slug);

  // 按 locale 选择中/英字段（与 BlogListPage 保持一致）
  const postTitle = useZh ? post?.titleZh : post?.title;
  const postExcerpt = useZh ? post?.excerptZh : post?.excerpt;
  const postContent = useZh ? post?.contentZh : post?.content;
  const postTakeaways = useZh ? post?.keyTakeawaysZh : post?.keyTakeaways;
  /** HowTo 步骤同样按 locale 取（仅操作型指南有值） */
  const postSteps = useZh ? post?.stepsZh : post?.steps;
  /**
   * ⚠️ 必须在组件顶层定义：这个变量同时被 useEffect（HowTo schema）和
   * JSX（步骤概览区块）使用。若只在 useEffect 内部声明，JSX 里会 ReferenceError，
   * SSR 预渲染整页失败（表现为「所有 blog 页 SSR render failed」）。
   */
  const steps = postSteps ?? post?.steps ?? [];

  // 当前文章的 FAQ（中文，与 contentZh 同语言）；独立于 blog.ts，重生成不会被覆盖
  const faq = post ? blogFaq[post.slug] ?? [] : [];

  const difficultyLabels: Record<string, string> = {
    Beginner: dp.beginner,
    Intermediate: dp.intermediate,
    Advanced: dp.advanced,
  };
  const durationUnit = { d: dp.unitDays, h: dp.unitHours, m: dp.unitMinutes };

  // Localized category label from i18n (not hardcoded blog.ts data)
  const localizedCategoryLabel = post ? blogCategoryLabel(post.category, post.categoryLabel, dp) : "";

  // 按发布日期降序排序（与列表页一致，最新的排最前面）
  const sortedPosts = [...blogMeta].sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );
  const currentIndex = post ? sortedPosts.findIndex((p) => p.slug === post.slug) : -1;
  const prevPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;
  const nextPost = currentIndex >= 0 && currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null;

  useEffect(() => {
    if (!post) {
      clearPageSchema();
      return;
    }

    const seo = getLocalizedDynamicSeo(
      post.seoTitle,
      post.seoDescription,
      locale,
      "blog",
      post.title,
    );
    applyCustomSeoMeta(seo, `/blog/${post.slug}`);

    // E-E-A-T: 具名作者 Person Schema（非匿名 Organization）
    const authorPerson = {
      "@type": "Person",
      name: post.author,
      jobTitle: post.authorRole,
      description: post.authorBio,
      worksFor: {
        "@type": "Organization",
        name: dp.organizationName,
        url: "https://www.lollipop.im/lollipop/",
      },
      url: "https://www.lollipop.im/lollipop/about",
      sameAs: ["https://www.lollipop.im/lollipop/about"],
    };

    const bodyText = stripMarkdown(postContent ?? post.contentZh);
    /** 是否有文章自带的真实步骤（2026-09-01 由 /guides 迁入的 9 篇） */
    const hasRealSteps = steps.length > 0;

    // GEO: 按文章分类生成主题实体与提及实体
    const CATEGORY_ABOUT: Record<string, string> = {
      industry: "Artificial Intelligence in Entertainment",
      creator: "AI Content Creation",
      guide: "AI Video Production",
      workflow: "AI Drama Production Workflow",
      production: "AI Drama Production",
      distribution: "Digital Content Distribution",
    };
    const aboutEntity = {
      "@type": "Thing",
      name: CATEGORY_ABOUT[post.category] ?? "AI Short Drama",
      description: `${post.categoryLabel} content from Lollipop Drama`,
    };
    const mentionsEntities = [
      { "@type": "Thing", name: "AI Short Drama" },
      { "@type": "Thing", name: "Lollipop Drama" },
    ];

    const articleSchema = {
      // 有真实步骤的操作型指南用 TechArticle（Article 子类型），可承载 proficiencyLevel
      "@type": hasRealSteps ? "TechArticle" : "Article",
      headline: postTitle ?? post.title,
      description: useZh ? post.excerptZh : post.seoDescription,
      datePublished: post.publishDate,
      dateModified: post.updateDate,
      ...(hasRealSteps && post.difficulty ? { proficiencyLevel: post.difficulty } : {}),
      author: authorPerson,
      publisher: {
        "@type": "Organization",
        name: dp.organizationName,
        url: "https://www.lollipop.im/lollipop/",
        logo: {
          "@type": "ImageObject",
          url: "https://www.lollipop.im/lollipop/src/imports/logo.webp",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://www.lollipop.im/lollipop/blog/${post.slug}`,
      },
      articleSection: localizedCategoryLabel,
      image: {
        "@type": "ImageObject",
        url: `https://www.lollipop.im/lollipop${post.coverImage ?? "/blog-images/guide.webp"}`,
      },
      thumbnailUrl: `https://www.lollipop.im/lollipop${post.coverImage ?? "/blog-images/guide.webp"}`,
      keywords: `${localizedCategoryLabel}, AI short drama, Lollipop Drama, ${post.title}`,
      articleBody: bodyText.slice(0, 500),
      wordCount: useZh ? bodyText.replace(/\s/g, "").length : bodyText.split(/\s+/).filter(Boolean).length,
      encodingFormat: "text/html",
      inLanguage: useZh ? "zh" : "en",
      isPartOf: { "@type": "Blog", name: "Lollipop Drama Blog", url: "https://www.lollipop.im/lollipop/blog" },
      about: aboutEntity,
      mentions: mentionsEntities,
      accessMode: ["textual", "visual"],
      accessibilitySummary: "Text-based article with images. Screen reader compatible.",
      license: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
      ...(hasRealSteps ? { teaches: [post.categoryLabel] } : {}),
      speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".key-takeaways li", ".faq p"] },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: dp.home, item: "https://www.lollipop.im/lollipop/" },
          { "@type": "ListItem", position: 2, name: dp.blog, item: "https://www.lollipop.im/lollipop/blog" },
          { "@type": "ListItem", position: 3, name: post.title, item: `https://www.lollipop.im/lollipop/blog/${post.slug}` },
        ],
      },
    };

    // HowTo Schema（GEO 核心）
    // 只有文章自带 steps 时才输出 HowTo，并带上 totalTime / supply / tool。
    // 步骤与页面可见的「步骤概览」区块同源，满足「结构化数据 = 可见文本」硬要求。
    //
    // ⚠️ 2026-09-01 移除了原先 `category === "guide"` 的通用模板分支：
    //    那份 i18n 模板（`dp.howToSteps`）对多篇共用同一步骤，且步骤在页面上完全不可见，
    //    违反 Google「结构化数据必须与可见文本一致」的要求，属合规隐患。
    //    对比 / 盘点 / 风险清单型的文章本就没有有序步骤，不该发 HowTo —— 发 Article 即可。
    const howToSchema = hasRealSteps
      ? {
          "@type": "HowTo",
          name: postTitle ?? post.title,
          description: useZh ? post.excerptZh : post.seoDescription,
          step: steps.map((s, i) => ({
            "@type": "HowToStep",
            position: i + 1,
            name: s.name,
            text: s.text,
            url: `https://www.lollipop.im/lollipop/blog/${post.slug}#step-${i + 1}`,
          })),
          totalTime: post.totalTime,
          estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
          supply: [{ "@type": "HowToSupply", name: dp.organizationName }],
          tool: [{ "@type": "HowToTool", name: dp.organizationName }],
          author: authorPerson,
          publisher: {
            "@type": "Organization",
            name: dp.organizationName,
            url: "https://www.lollipop.im/lollipop/",
            logo: {
              "@type": "ImageObject",
              url: "https://www.lollipop.im/lollipop/src/imports/logo.webp",
            },
          },
          datePublished: post.publishDate,
          dateModified: post.updateDate,
          inLanguage: locale,
          isPartOf: { "@type": "Blog", name: "Lollipop Drama Blog", url: "https://www.lollipop.im/lollipop/blog" },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://www.lollipop.im/lollipop/blog/${post.slug}`,
          },
        }
      : null;

    // GEO: FAQPage Schema（审计重点——显著提升 AI 回答引用率）
    const faqSchema = faq.length
      ? {
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: useZh ? f.question : (f.questionEn ?? f.question),
            acceptedAnswer: { "@type": "Answer", text: useZh ? f.answer : (f.answerEn ?? f.answer) },
          })),
        }
      : null;

    const graphItems = [articleSchema];
    if (howToSchema) graphItems.push(howToSchema);
    if (faqSchema) graphItems.push(faqSchema);
    setPageSchema(
      graphItems.length > 1
        ? { "@context": "https://schema.org", "@graph": graphItems }
        : { "@context": "https://schema.org", ...articleSchema }
    );

    return () => clearPageSchema();
  }, [post, locale]);

  if (!post) {
    return (
      <MarketingPageShell>
        <div className="flex flex-col items-center justify-center py-40 gap-4 text-white/50">
          <p>{dp.notFoundArticle}</p>
          <Link to="/blog" className="text-red-400 hover:text-red-300">{dp.backToBlog}</Link>
        </div>
      </MarketingPageShell>
    );
  }

  return (
    <MarketingPageShell>
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-white">{dp.home}</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-white">{dp.blog}</Link>
          <span>/</span>
          <span className="text-white/80 truncate max-w-[200px]">{postTitle}</span>
        </div>

        {/* Article Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4 text-xs flex-wrap">
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400" style={{ fontWeight: 600 }}>
              <Tag className="w-3 h-3" /> {localizedCategoryLabel}
            </span>
            {/* 难度 / 总时长 —— 仅操作型指南有（与 HowTo Schema 同源） */}
            {post.difficulty && (
              <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full ${DIFFICULTY_STYLE[post.difficulty] ?? "text-gray-400 bg-white/5"}`} style={{ fontWeight: 600 }}>
                <BarChart className="w-3 h-3" /> {difficultyLabels[post.difficulty] ?? post.difficulty}
              </span>
            )}
            {post.totalTime && (
              <span className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3 h-3" /> {formatIsoDuration(post.totalTime, durationUnit)}
              </span>
            )}
            <span className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-3 h-3" /> {post.publishDate}
            </span>
            {post.updateDate !== post.publishDate && (
              <span className="flex items-center gap-1 text-gray-600">
                ({dp.updated} {post.updateDate})
              </span>
            )}
            <span className="flex items-center gap-1 text-gray-500">
              <User className="w-3 h-3" /> {post.author} · {post.authorRole}
            </span>
          </div>
          <h1 className="text-white" style={{ fontFamily: "Playfair Display", fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 700, lineHeight: 1.2 }}>
            {postTitle}
          </h1>
          <p className="text-gray-400 mt-4" style={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
            {postExcerpt}
          </p>
        </motion.div>

        {/* 关键要点 —— GEO/AEO 引擎提取用，可见文本与结构化数据同源 */}
        {postTakeaways && postTakeaways.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 }}
            className="mb-10 rounded-2xl border border-[#FF4D00]/20 bg-[#FF4D00]/[0.03] p-6"
          >
            <h2 className="text-white font-bold mb-4" style={{ fontSize: "1.05rem" }}>
              {useZh ? "关键要点" : "Key Takeaways"}
            </h2>
            <ul className="key-takeaways space-y-2.5">
              {postTakeaways.map((t, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "#FF4D00" }} />
                  <p className="text-gray-300" style={{ fontSize: "0.95rem", lineHeight: 1.7 }}>{t}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* 步骤概览 —— 与 HowTo Schema 同源，保证结构化数据与可见文本一致（GEO 硬要求） */}
        {steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6"
          >
            <h2 className="text-white font-bold mb-4" style={{ fontSize: "1.05rem" }}>
              {dp.stepsCount.replace("{0}", String(steps.length))}
            </h2>
            <ol className="space-y-3">
              {steps.map((s, i) => (
                <li key={i} id={`step-${i + 1}`} className="flex gap-3">
                  <span
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                    style={{ background: "#FF4D00" }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-white font-semibold" style={{ fontSize: "0.95rem", lineHeight: 1.5 }}>{s.name}</p>
                    <p className="text-gray-400 mt-0.5" style={{ fontSize: "0.9rem", lineHeight: 1.7 }}>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>
        )}

        {/* Article Body */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="text-gray-300" style={{ fontSize: "1rem", lineHeight: 1.9 }}>
            {renderMarkdown(postContent ?? post.contentZh)}
          </div>
        </motion.div>

        {/* FAQ — 可见问答区块（GEO：与 FAQPage Schema 对应，提升 AI 引用概率） */}
        {faq.length > 0 && (
          <div className="faq mt-12 pt-8 border-t border-white/5">
            <h2 className="text-white font-bold mb-6" style={{ fontSize: "1.25rem" }}>{useZh ? "常见问题（FAQ）" : "Frequently Asked Questions (FAQ)"}</h2>
            <div className="space-y-4">
              {faq.map((f, i) => (
                <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                  <p className="text-white font-semibold" style={{ fontSize: "1rem", lineHeight: 1.5 }}>{useZh ? "Q：" : "Q: "}{useZh ? f.question : (f.questionEn ?? f.question)}</p>
                  <p className="text-gray-300 mt-2" style={{ fontSize: "0.95rem", lineHeight: 1.8 }}>{useZh ? f.answer : (f.answerEn ?? f.answer)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prev/Next Navigation */}
        <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevPost ? (
            <Link to={`/blog/${prevPost.slug}`} className="group block rounded-xl border border-white/5 hover:border-red-500/30 p-4 transition-all">
              <span className="text-gray-500 text-xs flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> {dp.previous}</span>
              <p className="text-white/80 group-hover:text-red-400 transition-colors mt-1" style={{ fontSize: "0.9rem", fontWeight: 600 }}>{useZh ? prevPost.titleZh : prevPost.title}</p>
            </Link>
          ) : <div />}
          {nextPost ? (
            <Link to={`/blog/${nextPost.slug}`} className="group block rounded-xl border border-white/5 hover:border-red-500/30 p-4 transition-all text-right">
              <span className="text-gray-500 text-xs flex items-center gap-1 justify-end">{dp.next} <ArrowRight className="w-3 h-3" /></span>
              <p className="text-white/80 group-hover:text-red-400 transition-colors mt-1" style={{ fontSize: "0.9rem", fontWeight: 600 }}>{useZh ? nextPost.titleZh : nextPost.title}</p>
            </Link>
          ) : <div />}
        </div>

        {/* Related Posts — 内部链接网络（修复审计 P0-2：原 Markdown Related 链接全部指向首页） */}
        {(() => {
          // 操作型内容按「组」匹配相关阅读，否则 distribution 只有 2 篇、相关阅读会剩 1 条
          const related = sortedPosts
            .filter((p) => {
              if (p.slug === post.slug) return false;
              return isGuideCategory(post.category)
                ? isGuideCategory(p.category)
                : p.category === post.category;
            })
            .slice(0, 6);
          return (
            <div className="mt-14 pt-8 border-t border-white/5">
              <h2 className="text-white font-bold mb-6" style={{ fontSize: "1.25rem" }}>{dp.relatedPosts}</h2>
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                {related.map((rp) => (
                  <Link
                    key={rp.slug}
                    to={`/blog/${rp.slug}`}
                    className="group block rounded-xl border border-white/5 hover:border-red-500/30 bg-white/[0.02] p-4 transition-all"
                  >
                    <span className="text-xs text-red-400 font-semibold">{blogCategoryLabel(rp.category, rp.categoryLabel, dp)}</span>
                    <p className="text-white/90 group-hover:text-red-400 transition-colors mt-1.5" style={{ fontSize: "0.95rem", fontWeight: 600, lineHeight: 1.4 }}>
                      {useZh ? rp.titleZh : rp.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Back to Blog */}
        <div className="mt-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors" style={{ fontSize: "0.9rem" }}>
            <ArrowLeft className="w-4 h-4" /> {dp.backToBlog}
          </Link>
        </div>
      </div>
    </MarketingPageShell>
  );
}
