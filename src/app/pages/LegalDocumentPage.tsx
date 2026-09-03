/**
 * 用户协议 / 隐私政策独立页
 * ------------------------------------------------------------------
 * 路由：/terms（用户协议 type=154）、/privacy（隐私政策 type=155）
 * 数据源与 H5 me/setting/xieyi、me/setting/mimi 一致。
 */
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { useI18n } from "../i18n";
import { applySeoMeta, getPageSeo, setPageSchema, clearPageSchema, type PageType } from "../i18n.seo";
import { Footer } from "../components/Footer";
import { SiteHeader } from "../components/SiteHeader";
import { useNavItems } from "../components/useNavItems";
import { getLegalDocument, type LegalDocKind } from "../services/legal";
import { legalFallback } from "../data/legalContent";

/** 允许渲染的协议 HTML 标签（与发行入驻协议弹窗一致，防 XSS） */
const AGREEMENT_HTML_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "i",
  "li",
  "ol",
  "p",
  "strong",
  "u",
  "ul",
]);

function sanitizeAgreementHtml(content: string): string {
  if (!/<[a-z][\s\S]*>/i.test(content)) return "";
  const doc = new DOMParser().parseFromString(content, "text/html");
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.remove();
        return;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      const el = child as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (tag === "script" || tag === "style") {
        el.remove();
        return;
      }
      if (!AGREEMENT_HTML_TAGS.has(tag)) {
        el.replaceWith(doc.createTextNode(el.textContent ?? ""));
        return;
      }
      Array.from(el.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (tag === "a" && name === "href" && /^(https?:|mailto:)/i.test(attr.value.trim())) return;
        el.removeAttribute(attr.name);
      });
      if (tag === "a") {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noreferrer");
      }
      walk(el);
    });
  };
  walk(doc.body);
  return doc.body.innerHTML;
}

const richHtmlClassName =
  "text-[#d1d5dc] leading-relaxed break-words text-sm sm:text-[0.95rem] " +
  "[&_a]:text-white [&_a]:underline " +
  "[&_blockquote]:border-l [&_blockquote]:border-white/20 [&_blockquote]:pl-3 " +
  "[&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-bold " +
  "[&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold " +
  "[&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-bold " +
  "[&_li]:mb-1 " +
  "[&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 " +
  "[&_p]:mb-3 " +
  "[&_strong]:font-bold " +
  "[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5";

function LegalDocumentPage({ kind }: { kind: LegalDocKind }) {
  const { messages, locale } = useI18n();
  const navigate = useNavigate();
  // 构建期已净化（scripts/fetch-legal.py）的正文作为初始值：
  // SSR / 预渲染 HTML 直接包含完整条款，搜索引擎首屏即可抓到内容。
  // 此前初始值为空 → 预渲染 HTML 只有 Loading 占位（SEO「内容不足」）。
  const [content, setContent] = useState(() => legalFallback[kind] ?? "");
  /** true = 内容来自构建期净化结果，可直出；false = 运行时拉取，需再净化 */
  const [preSanitized, setPreSanitized] = useState(true);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const title =
    kind === "privacy" ? messages.common.privacyPolicy : messages.common.termsOfService;

  const load = useCallback(() => {
    setLoading(true);
    setFailed(false);
    void getLegalDocument(kind)
      .then((value) => {
        setContent(value ?? "");
        setPreSanitized(false);
        setFailed(false);
      })
      .catch(() => {
        setFailed(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [kind]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [kind]);

  // 语言切换时重新拉配置中心正文
  useEffect(() => {
    load();
  }, [load, locale]);

  useEffect(() => {
    const seoPage = kind as PageType;
    applySeoMeta(getPageSeo(seoPage, locale), seoPage);

    // SEO: 法律页面 Schema（WebPage + LegalDocument 标识）
    setPageSchema({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description: kind === "privacy"
        ? "Lollipop Drama Privacy Policy — how we collect, use, and protect your personal information."
        : "Lollipop Drama Terms of Service — terms and conditions for using the platform.",
      url: `https://www.lollipop.im/lollipop/${kind === "privacy" ? "privacy" : "terms"}`,
      publisher: {
        "@type": "Organization",
        name: "Lollipop Drama",
        url: "https://www.lollipop.im/lollipop/",
      },
    });

    return () => clearPageSchema();
  }, [kind, locale, title]);

  const navItems = useNavItems();

  // 构建期已净化的内容直接直出（SSR 无 DOMParser）；运行时拉取的内容须再净化防 XSS
  const richHtml = preSanitized ? content : sanitizeAgreementHtml(content);

  return (
    <div className="relative bg-[#0a0000] min-h-screen flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
      <SiteHeader navItems={navItems} onLogoClick={() => navigate("/")} />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-white mb-8" style={{ fontSize: "1.75rem", fontWeight: 700 }}>
            {title}
          </h1>

          <div className="rounded-2xl bg-[#1c1c1c] border border-white/10 px-6 py-8 sm:px-8 sm:py-10 min-h-[320px]">
            {/* 首次加载且无预置正文时才转圈；有 fallback 时直接呈现内容 */}
            {loading && !content && (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
                <Loader2 className="w-7 h-7 animate-spin" />
                <span style={{ fontSize: "0.9rem" }}>{messages.common.loading}</span>
              </div>
            )}

            {/* 拉取失败且无内容可展示时才报错；有 fallback 时静默保留旧内容 */}
            {!loading && failed && !content && (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                <p className="text-gray-400" style={{ fontSize: "0.95rem" }}>
                  {messages.common.loadFailed}
                </p>
                <button
                  type="button"
                  onClick={load}
                  className="px-5 h-10 rounded-[10px] bg-white text-[#111] text-sm transition-opacity hover:opacity-90"
                  style={{ fontWeight: 600 }}
                >
                  {messages.common.retry}
                </button>
              </div>
            )}

            {content && richHtml && (
              <div className={richHtmlClassName} dangerouslySetInnerHTML={{ __html: richHtml }} />
            )}

            {content && !richHtml && (
              <div className="text-[#d1d5dc] leading-relaxed whitespace-pre-wrap break-words text-sm sm:text-[0.95rem]">
                {content}
              </div>
            )}

            {!content && !loading && !failed && (
              <p className="text-gray-500 text-center py-16" style={{ fontSize: "0.9rem" }}>
                {messages.common.loadFailed}
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer onNavigate={(page) => navigate(page === "home" ? "/" : `/${page}`)} />
    </div>
  );
}

/** 隐私政策（H5 mimi / type=155） */
export function PrivacyPolicyPage() {
  return <LegalDocumentPage kind="privacy" />;
}

/** 用户协议（H5 xieyi / type=154） */
export function TermsOfServicePage() {
  return <LegalDocumentPage kind="terms" />;
}
