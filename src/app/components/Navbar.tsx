import { useState, useEffect } from "react";
import { SiteHeader, type SiteNavItem } from "./SiteHeader";
import { useI18n } from "../i18n";

/**
 * 营销站顶栏：基于共享 SiteHeader，按 figma 提供导航项与右侧 Sign Up/Log In。
 * 导航映射现有内容：Home→首页、Creating→创作者区块(#creators)、Distribution→/distribution、
 * Download→下载区(#download)、Contact→联系页。保持 currentPage/onNavigate 接口不变。
 */
export function Navbar({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string) => void }) {
  const { messages } = useI18n();
  const [activeKey, setActiveKey] = useState("home");

  // 滚动高亮：仅在首页时根据区块位置推导当前项；contact 页高亮 Contact。
  useEffect(() => {
    if (currentPage === "contact") {
      setActiveKey("contact");
      return;
    }
    if (currentPage !== "home") {
      setActiveKey("");
      return;
    }
    const sections: [string, string][] = [
      ["home", "home"],
      ["creators", "creating"],
      ["download", "download"],
    ];
    const handler = () => {
      let active = "home";
      for (const [id, key] of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) active = key;
      }
      setActiveKey(active);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [currentPage]);

  // 跳到首页指定锚点（不在首页时先切回首页再滚动）。
  const goHome = (anchor?: string) => {
    if (currentPage !== "home") {
      onNavigate("home");
      if (anchor) {
        setTimeout(() => document.querySelector(anchor)?.scrollIntoView({ behavior: "smooth" }), 120);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }
    if (anchor) document.querySelector(anchor)?.scrollIntoView({ behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const links = messages.navbar.links;
  const navItems: SiteNavItem[] = [
    { key: "home", label: links.home, active: activeKey === "home", onClick: () => goHome() },
    { key: "creating", label: links.creating, active: activeKey === "creating", onClick: () => goHome("#creators") },
    { key: "distribution", label: messages.distribution.nav.entry, to: "/distribution" },
    { key: "download", label: links.download, active: activeKey === "download", onClick: () => goHome("#download") },
    { key: "contact", label: links.contact, active: activeKey === "contact", onClick: () => onNavigate("contact") },
  ];

  return <SiteHeader navItems={navItems} onLogoClick={() => goHome()} />;
}
