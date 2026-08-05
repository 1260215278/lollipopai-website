import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useI18n } from "../i18n";
import { applySeoMeta, getPageSeo } from "../i18n.seo";

/**
 * 404 页面 — 替换之前的 Navigate to="/" 软 404。
 * 设置 noindex meta 防止搜索引擎索引不存在的内容。
 */
export function NotFoundPage() {
  const navigate = useNavigate();
  const { locale, messages } = useI18n();

  useEffect(() => {
    // 404 页面使用 noindex，防止搜索引擎索引
    document.title = "404 — Page Not Found | Lollipop AI";
    const meta = document.querySelector('meta[name="robots"]');
    if (meta) {
      meta.setAttribute("content", "noindex, nofollow");
    } else {
      const m = document.createElement("meta");
      m.setAttribute("name", "robots");
      m.setAttribute("content", "noindex, nofollow");
      document.head.appendChild(m);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0000] flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div
          className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"
          style={{ fontSize: "clamp(4rem, 15vw, 8rem)", fontWeight: 900, lineHeight: 1, fontFamily: "'Orbitron', monospace" }}
        >
          404
        </div>
        <h1 className="text-white text-2xl font-bold mt-4 mb-2">
          {locale === "zh-CN" ? "页面未找到" : locale === "zh-TW" ? "頁面未找到" : locale === "pt" ? "Pagina nao encontrada" : "Page Not Found"}
        </h1>
        <p className="text-gray-400 mb-8" style={{ fontSize: "1rem", lineHeight: 1.6 }}>
          {locale === "zh-CN"
            ? "您访问的页面不存在或已被移除。"
            : locale === "zh-TW"
            ? "您造訪的頁面不存在或已被移除。"
            : locale === "pt"
            ? "A pagina que voce procura nao existe ou foi removida."
            : "The page you're looking for doesn't exist or has been removed."}
        </p>
        <button
          onClick={() => {
            navigate("/");
            window.scrollTo({ top: 0 });
          }}
          className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white px-8 py-3.5 rounded-full transition-all shadow-lg shadow-red-900/40 hover:scale-105 font-semibold"
        >
          {locale === "zh-CN" ? "返回首页" : locale === "zh-TW" ? "返回首頁" : locale === "pt" ? "Voltar ao inicio" : "Back to Home"}
        </button>
      </div>
    </div>
  );
}
