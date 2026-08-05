import { SiteHeader } from "./SiteHeader";
import { useNavItems } from "./useNavItems";

/**
 * 营销站顶栏：基于共享 SiteHeader，导航项来自 useNavItems（唯一数据源）。
 */
export function Navbar({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string) => void }) {
  const navItems = useNavItems({ activePage: currentPage, onNavigate });

  return <SiteHeader navItems={navItems} onLogoClick={() => onNavigate("home")} />;
}
