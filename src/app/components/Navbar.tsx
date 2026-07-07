import { SiteHeader, type SiteNavItem } from "./SiteHeader";
import { useI18n } from "../i18n";

/**
 * 营销站顶栏：基于共享 SiteHeader，按 figma 提供导航项与右侧 Sign Up/Log In。
 * 导航映射现有内容：Home→首页、Creating/Download/Contact→独立页面、Distribution→/distribution。
 */
export function Navbar({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string) => void }) {
  const { messages } = useI18n();

  const links = messages.navbar.links;
  const navItems: SiteNavItem[] = [
    { key: "home", label: links.home, active: currentPage === "home", onClick: () => onNavigate("home") },
    { key: "creating", label: links.creating, active: currentPage === "creating", onClick: () => onNavigate("creating") },
    { key: "distribution", label: messages.distribution.nav.entry, to: "/distribution" },
    { key: "download", label: links.download, active: currentPage === "download", onClick: () => onNavigate("download") },
    { key: "contact", label: links.contact, active: currentPage === "contact", onClick: () => onNavigate("contact") },
  ];

  return <SiteHeader navItems={navItems} onLogoClick={() => onNavigate("home")} />;
}
