/**
 * 营销站独立页面共享布局 —— 顶栏 + 内容区 + 页脚。
 * 供 GenrePage / DramaPage / BlogListPage / BlogPostPage / RegionPage 复用。
 * 导航项来自 useNavItems（唯一数据源）。
 */
import { useNavigate, useLocation } from "react-router";
import { SiteHeader } from "../components/SiteHeader";
import { Footer } from "../components/Footer";
import { useNavItems } from "./useNavItems";

export function MarketingPageShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const navItems = useNavItems({
    activePage: pathname.startsWith("/blog") ? "blog" : undefined,
  });

  return (
    <div className="w-full bg-[#0a0000] min-h-screen flex flex-col" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <SiteHeader navItems={navItems} onLogoClick={() => navigate("/")} sticky />
      <main className="flex-1">{children}</main>
      <Footer onNavigate={(page) => navigate(page === "home" ? "/" : `/${page}`)} />
    </div>
  );
}
