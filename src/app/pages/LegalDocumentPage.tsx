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
import { Footer } from "../components/Footer";
import { SiteHeader, type SiteNavItem } from "../components/SiteHeader";
import { useDistributionEntryNavigation } from "../distribution/entryNavigation";
import { getLegalDocument, type LegalDocKind } from "../services/legal";

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
  const enterDistribution = useDistributionEntryNavigation();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const title =
    kind === "privacy" ? messages.common.privacyPolicy : messages.common.termsOfService;

  const load = useCallback(() => {
    setLoading(true);
    setFailed(false);
    void getLegalDocument(kind)
      .then((value) => {
        setContent(value);
        setFailed(false);
      })
      .catch(() => {
        setContent("");
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
    const brand = messages.common.brand;
    document.title = `${title} · ${brand}`;
    return () => {
      // 离开时不强制还原 SEO 主 title；I18nProvider 在语言变更时会写回
    };
  }, [title, messages.common.brand]);

  const links = messages.navbar.links;
  const navItems: SiteNavItem[] = [
    { key: "home", label: links.home, onClick: () => navigate("/") },
    { key: "creating", label: links.creating, onClick: () => navigate("/creating") },
    { key: "distribution", label: messages.distribution.nav.entry, onClick: enterDistribution },
    { key: "download", label: links.download, onClick: () => navigate("/download") },
    { key: "contact", label: links.contact, onClick: () => navigate("/contact") },
  ];

  const richHtml = sanitizeAgreementHtml(content);

  return (
    <div className="relative bg-[#0a0000] min-h-screen flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
      <SiteHeader navItems={navItems} onLogoClick={() => navigate("/")} />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-white mb-8" style={{ fontSize: "1.75rem", fontWeight: 700 }}>
            {title}
          </h1>

          <div className="rounded-2xl bg-[#1c1c1c] border border-white/10 px-6 py-8 sm:px-8 sm:py-10 min-h-[320px]">
            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
                <Loader2 className="w-7 h-7 animate-spin" />
                <span style={{ fontSize: "0.9rem" }}>{messages.common.loading}</span>
              </div>
            )}

            {!loading && failed && (
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

            {!loading && !failed && richHtml && (
              <div className={richHtmlClassName} dangerouslySetInnerHTML={{ __html: richHtml }} />
            )}

            {!loading && !failed && !richHtml && content && (
              <div className="text-[#d1d5dc] leading-relaxed whitespace-pre-wrap break-words text-sm sm:text-[0.95rem]">
                {content}
              </div>
            )}

            {!loading && !failed && !content && (
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
