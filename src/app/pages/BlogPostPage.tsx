/**
 * 博客文章详情页 —— /blog/:slug
 * 展示完整文章内容。
 * SEO: Article + BreadcrumbList Schema
 */
import { useEffect, type ReactNode } from "react";
import { useParams, Link } from "react-router";
import { motion } from "motion/react";
import { Calendar, User, ArrowLeft, ArrowRight, Tag } from "lucide-react";
import { MarketingPageShell } from "../components/MarketingPageShell";
import { applyCustomSeoMeta, setPageSchema, clearPageSchema, getLocalizedDynamicSeo } from "../i18n.seo";
import { useI18n } from "../i18n";
import { getBlogPostBySlug } from "../data/blog";
import { blogPosts } from "../data/blog";
import { blogFaq } from "../data/blogFaq";

/** 轻量 Markdown 渲染（无第三方依赖）：支持标题/加粗/斜体/行内代码/链接/引用/有序无序列表/表格/分隔线 */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[2] !== undefined) {
      nodes.push(<strong key={key++}>{m[2]}</strong>);
    } else if (m[3] !== undefined) {
      nodes.push(<em key={key++}>{m[3]}</em>);
    } else if (m[4] !== undefined) {
      nodes.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-white/10 text-[#FF4D00] text-[0.9em]">
          {m[4]}
        </code>,
      );
    } else if (m[5] !== undefined) {
      nodes.push(
        <a key={key++} href={m[6]} target="_blank" rel="noopener noreferrer" className="text-[#FF4D00] hover:underline">
          {m[5]}
        </a>,
      );
    }
    last = regex.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function renderMarkdown(md: string): ReactNode[] {
  const lines = md.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;
  const isList = (l: string) => /^\s*[-*]\s+/.test(l);
  const isOrdered = (l: string) => /^\s*\d+\.\s+/.test(l);
  const isHeading = (l: string) => /^(#{1,6})\s+/.test(l);
  const isTableRow = (l: string) => l.trim().startsWith("|");
  const isSep = (l: string) => l.trim() === "---" || l.trim() === "***";

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }
    if (isSep(line)) {
      i++;
      continue;
    }
    // Heading
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const txt = h[2];
      const cls =
        level <= 2
          ? "text-2xl font-bold text-white mt-10 mb-4"
          : "text-xl font-semibold text-white mt-8 mb-3";
      blocks.push(level === 2 ? (
        <h2 key={key++} className={cls}>{renderInline(txt)}</h2>
      ) : (
        <h3 key={key++} className={cls}>{renderInline(txt)}</h3>
      ));
      i++;
      continue;
    }
    // Blockquote
    if (line.startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote key={key++} className="border-l-4 border-[#FF4D00] pl-4 my-6 text-gray-300 italic">
          {buf.map((b, bi) => (
            <p key={bi} className="mb-1">{renderInline(b)}</p>
          ))}
        </blockquote>,
      );
      continue;
    }
    // Table
    if (isTableRow(line)) {
      const rows: string[] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(lines[i].trim());
        i++;
      }
      const parsed = rows
        .filter((r) => !/^\|[\s:|-]+\|$/.test(r))
        .map((r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
      if (parsed.length) {
        const [head, ...bodyRows] = parsed;
        blocks.push(
          <div key={key++} className="my-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {head.map((c, ci) => (
                    <th key={ci} className="border border-white/10 bg-white/5 px-3 py-2 text-left text-white font-semibold">
                      {renderInline(c)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((r, ri) => (
                  <tr key={ri}>
                    {r.map((c, ci) => (
                      <td key={ci} className="border border-white/10 px-3 py-2 text-gray-300">
                        {renderInline(c)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
      }
      continue;
    }
    // Unordered list
    if (isList(line)) {
      const items: string[] = [];
      while (i < lines.length && isList(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="list-disc pl-6 my-4 space-y-2 text-gray-300">
          {items.map((it, ii) => (
            <li key={ii}>{renderInline(it)}</li>
          ))}
        </ul>,
      );
      continue;
    }
    // Ordered list
    if (isOrdered(line)) {
      const items: string[] = [];
      while (i < lines.length && isOrdered(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="list-decimal pl-6 my-4 space-y-2 text-gray-300">
          {items.map((it, ii) => (
            <li key={ii}>{renderInline(it)}</li>
          ))}
        </ol>,
      );
      continue;
    }
    // Paragraph: collect consecutive plain lines
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !isHeading(lines[i]) &&
      !lines[i].startsWith(">") &&
      !isTableRow(lines[i]) &&
      !isList(lines[i]) &&
      !isOrdered(lines[i]) &&
      !isSep(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="mb-5 text-gray-300" style={{ lineHeight: 1.9 }}>
        {renderInline(para.join(" "))}
      </p>,
    );
  }
  return blocks;
}

/** 将 Markdown 正文转为纯文本（供 Article Schema 的 articleBody / wordCount 使用）。 */
function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*\|.*\|\s*$/gm, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function BlogPostPage() {
  const { slug = "" } = useParams();
  const { locale, messages } = useI18n();
  const useZh = locale === "zh-CN" || locale === "zh-TW";
  const dp = messages.dynamicPages;
  const post = getBlogPostBySlug(slug);

  // 按 locale 选择中/英字段（与 BlogListPage 保持一致）
  const postTitle = useZh ? post?.titleZh : post?.title;
  const postExcerpt = useZh ? post?.excerptZh : post?.excerpt;
  const postContent = useZh ? post?.contentZh : post?.content;

  // 当前文章的 FAQ（中文，与 contentZh 同语言）；独立于 blog.ts，重生成不会被覆盖
  const faq = post ? blogFaq[post.slug] ?? [] : [];

  // Localized category label from i18n (not hardcoded blog.ts data)
  const localizedCategoryLabel =
    post?.category === "industry" ? dp.industryInsights :
    post?.category === "creator" ? dp.creatorEconomy :
    post?.category === "guide" ? dp.creatorGuides :
    post?.categoryLabel ?? "";

  const currentIndex = post ? blogPosts.findIndex((p) => p.slug === post.slug) : -1;
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost = currentIndex >= 0 && currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

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
      worksFor: {
        "@type": "Organization",
        name: dp.organizationName,
        url: "https://www.lollipop.im",
      },
      url: "https://www.lollipop.im/about",
    };

    const articleSchema = {
      "@type": "Article",
      headline: postTitle ?? post.title,
      description: useZh ? post.excerptZh : post.seoDescription,
      datePublished: post.publishDate,
      dateModified: post.updateDate,
      author: authorPerson,
      publisher: {
        "@type": "Organization",
        name: dp.organizationName,
        url: "https://www.lollipop.im",
        logo: {
          "@type": "ImageObject",
          url: "https://www.lollipop.im/src/imports/logo.png",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://www.lollipop.im/blog/${post.slug}`,
      },
      articleSection: localizedCategoryLabel,
      image: {
        "@type": "ImageObject",
        url: `https://www.lollipop.im${post.coverImage ?? "/blog-images/guide.png"}`,
      },
      keywords: `${localizedCategoryLabel}, AI short drama, Lollipop AI, ${post.title}`,
      articleBody: stripMarkdown(postContent ?? post.contentZh).slice(0, 500),
      wordCount: stripMarkdown(postContent ?? post.contentZh).replace(/\s/g, "").length,
      encodingFormat: "text/html",
      citation: {
        "@type": "CreativeWork",
        name: dp.organizationName,
        url: "https://www.lollipop.im",
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: dp.home, item: "https://www.lollipop.im/" },
          { "@type": "ListItem", position: 2, name: dp.blog, item: "https://www.lollipop.im/blog" },
          { "@type": "ListItem", position: 3, name: post.title, item: `https://www.lollipop.im/blog/${post.slug}` },
        ],
      },
    };

    // P1#4: 教程类文章额外添加 HowTo Schema（多语言）
    const isGuide = post.category === "guide";
    const howToSchema = isGuide ? {
      "@type": "HowTo",
      name: post.title,
      description: post.seoDescription,
      step: dp.howToSteps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
      totalTime: dp.howToTotalTime,
      author: authorPerson,
      publisher: {
        "@type": "Organization",
        name: dp.organizationName,
        url: "https://www.lollipop.im",
      },
    } : null;

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
          <div className="flex items-center gap-3 mb-4 text-xs">
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400" style={{ fontWeight: 600 }}>
              <Tag className="w-3 h-3" /> {localizedCategoryLabel}
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-3 h-3" /> {post.publishDate}
            </span>
            {post.updateDate !== post.publishDate && (
              <span className="flex items-center gap-1 text-gray-600">
                ({dp.updated} {post.updateDate})
              </span>
            )}
            <span className="flex items-center gap-1 text-gray-500">
              <User className="w-3 h-3" /> {post.author}
            </span>
          </div>
          <h1 className="text-white" style={{ fontFamily: "Playfair Display", fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", fontWeight: 700, lineHeight: 1.2 }}>
            {postTitle}
          </h1>
          <p className="text-gray-400 mt-4" style={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
            {postExcerpt}
          </p>
        </motion.div>

        {/* Article Body */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="text-gray-300" style={{ fontSize: "1rem", lineHeight: 1.9 }}>
            {renderMarkdown(postContent ?? post.contentZh)}
          </div>
        </motion.div>

        {/* FAQ — 可见问答区块（GEO：与 FAQPage Schema 对应，提升 AI 引用概率） */}
        {faq.length > 0 && (
          <div className="mt-12 pt-8 border-t border-white/5">
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
          const related = blogPosts.filter((p) => p.slug !== post.slug);
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
                    <span className="text-xs text-red-400 font-semibold">{rp.category === "industry" ? dp.industryInsights : rp.category === "creator" ? dp.creatorEconomy : rp.category === "guide" ? dp.creatorGuides : rp.categoryLabel}</span>
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
