import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Mail, Phone, MapPin, Twitter, Instagram, Youtube, Facebook } from "lucide-react";
import logoImg from "../../imports/Lollipop1.webp";
import { useI18n } from "../i18n";

export function Footer({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { messages, languages, setLocale } = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  // ⚠️ `key` 必须是 `messages.footer.links` 里存在的键 —— 下面第 107 行用
  //    `messages.footer.links[item.key]` **动态取键**，写错不会报错，只会渲染成空白。
  //    （2026-09-01 补 `aboutUs`：/about 此前只有首页 FAQ 区块一条内链，
  //     其余 60+ 页面无入口；放进 Footer 后全站可达，About 页也是信任/EEAT 信号。）
  const websiteLinks = [
    { key: "home", page: "home", to: "/" },
    { key: "creating", page: "creating", to: "/creating" },
    { key: "download", page: "download", to: "/download" },
    { key: "aboutUs", page: "about", to: "/about" },
    { key: "contactUs", page: "contact", to: "/contact" },
  ] as const;

  // Explore links — internal links to genre/blog pages for SEO crawling
  //
  // ⚠️ 品类名（Romance / Thriller …）来自 `src/app/data/genres.ts` 的 `name` 字段，
  //    是**未经 i18n 的数据**，全站（含 GenrePage 的 h1、breadcrumb、JSON-LD）都直接渲染它。
  //    把 Footer 单独本地化反而会与站内其余位置不一致，因此保持原样 ——
  //    要彻底解决需要给 genres.ts 加多语言字段，属独立改造。
  //
  //    Blog / How-To Guides 是纯 UI 标签，走 i18n（`dynamicPages.blog` / `dynamicPages.howToGuides`）。
  const exploreLinks = [
    { label: "Romance Dramas", to: "/genre/romance" },
    { label: "Thriller Dramas", to: "/genre/thriller" },
    { label: "CEO Dramas", to: "/genre/ceo-drama" },
    { label: "Fantasy Dramas", to: "/genre/fantasy" },
    { label: messages.dynamicPages.blog, to: "/blog" },
    // 操作型 HowTo 指南（2026-09-01 由 /guides 整体迁入 /blog 的「操作指南」分类）。
    // 这里直接链到代表性 HowTo 页面而非列表：爬虫拿到的是带步骤的实体页，
    // 且该页的「相关阅读」会把爬虫继续导向其余 15 篇操作指南。
    { label: messages.dynamicPages.howToGuides, to: "/blog/character-consistency-workflow" },
  ] as const;

  return (
    <footer className="bg-[#111] border-t border-white/5 pt-14 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Logo — SSR 不渲染 <img>，避免破裂图标闪现 */}
        <div className="flex items-center gap-2.5 mb-10">
          {mounted ? (
            <img src={logoImg} alt="Lollipop" className="h-9 w-auto rounded-[8px]" />
          ) : (
            <div className="h-9 w-9 rounded-[8px]" aria-hidden="true" />
          )}
          <span className="text-[#ffffff]" style={{ fontSize: "1.5rem", fontWeight: 800, fontStyle: "italic" }}>
            {messages.common.brand}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Contact Column */}
          <div className="mx-[5px] my-[0px]">
            <h4 className="mb-5 text-[#ffffff]" style={{ fontSize: "0.95rem", fontWeight: 700 }}>
              {messages.footer.titles.contact}
            </h4>
            <div className="space-y-3.5">
              <div className="flex items-center gap-3 text-gray-400" style={{ fontSize: "0.85rem" }}>
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>{messages.contact.cards[1].detail}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400" style={{ fontSize: "0.85rem" }}>
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{messages.contact.cards[0].detail}</span>
              </div>
              <div className="flex items-start gap-3 text-gray-400" style={{ fontSize: "0.85rem" }}>
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{messages.footer.address}</span>
              </div>
            </div>
            {/* Social Media Links — GEO: 提升社交信号可见性 */}
            <div className="flex items-center gap-4 mt-5">
              <a href="https://twitter.com/lollipopai" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-gray-500 hover:text-white transition-colors">
                <Twitter className="w-4.5 h-4.5" style={{ width: "1.125rem", height: "1.125rem" }} />
              </a>
              <a href="https://www.instagram.com/lollipopai" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-500 hover:text-white transition-colors">
                <Instagram className="w-4.5 h-4.5" style={{ width: "1.125rem", height: "1.125rem" }} />
              </a>
              <a href="https://www.youtube.com/@lollipopai" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-gray-500 hover:text-white transition-colors">
                <Youtube className="w-4.5 h-4.5" style={{ width: "1.125rem", height: "1.125rem" }} />
              </a>
              <a href="https://www.facebook.com/lollipopai" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-500 hover:text-white transition-colors">
                <Facebook className="w-4.5 h-4.5" style={{ width: "1.125rem", height: "1.125rem" }} />
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.StargetVenturesLLC.hks" target="_blank" rel="noopener noreferrer" aria-label="Google Play" className="text-gray-500 hover:text-white transition-colors" style={{ fontSize: "0.7rem", fontWeight: 600, border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", padding: "2px 6px" }}>
                G Play
              </a>
            </div>
          </div>

          {/* Website Column */}
          <div className="mx-[40px] my-[0px]">
            <h4 className="mb-5 text-[#ffffff]" style={{ fontSize: "0.95rem", fontWeight: 700 }}>
              {messages.footer.titles.website}
            </h4>
            <ul className="space-y-3">
              {websiteLinks.map((item) => (
                <li key={item.key}>
                  <Link
                    to={item.to}
                    className="text-gray-400 hover:text-white transition-colors"
                    style={{ fontSize: "0.85rem" }}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    {messages.footer.links[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore Column — internal links for SEO crawling */}
          <div className="mx-[10px] my-[0px]">
            <h4 className="mb-5 text-[#ffffff]" style={{ fontSize: "0.95rem", fontWeight: 700 }}>
              {messages.dynamicPages.explore}
            </h4>
            <ul className="space-y-3">
              {exploreLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-gray-400 hover:text-white transition-colors"
                    style={{ fontSize: "0.85rem" }}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Column */}
          <div className="mx-[10px] my-[0px]">
            <h4 className="mb-5 text-[#ffffff]" style={{ fontSize: "0.95rem", fontWeight: 700 }}>
              {messages.footer.titles.languages}
            </h4>
            <ul className="space-y-3">
              {languages.map((item) => (
                <li key={item.code}>
                  <button
                    type="button"
                    onClick={() => setLocale(item.code)}
                    className="text-gray-400 hover:text-white transition-colors"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="text-gray-500 hover:text-white transition-colors"
              style={{ fontSize: "0.8rem" }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              {messages.common.privacyPolicy}
            </Link>
            <Link
              to="/terms"
              className="text-gray-500 hover:text-white transition-colors"
              style={{ fontSize: "0.8rem" }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              {messages.common.termsOfService}
            </Link>
          </div>
          <p className="text-gray-600" style={{ fontSize: "0.75rem" }}>
            &copy; 2026 {messages.common.brand}. {messages.common.allRightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}
