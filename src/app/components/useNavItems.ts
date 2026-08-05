import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useI18n } from "../i18n";
import { useDistributionEntryNavigation } from "../distribution/entryNavigation";
import type { SiteNavItem } from "./SiteHeader";

interface UseNavItemsOptions {
  /** 当前激活页 key（用于高亮）。 */
  activePage?: string;
  /**
   * 自定义导航回调。传入时（如营销站顶栏）导航走此回调（参数为页面 key）；
   * 不传时直接走 react-router 的 navigate（参数为路由路径）。
   */
  onNavigate?: (page: string) => void;
}

/**
 * 全站统一导航项（唯一数据源）。
 * 营销站顶栏(Navbar)、入驻页 / 各静态页共用，避免导航逻辑分散重复。
 */
export function useNavItems(options: UseNavItemsOptions = {}): SiteNavItem[] {
  const { activePage, onNavigate } = options;
  const { messages } = useI18n();
  const navigate = useNavigate();
  const enterDistribution = useDistributionEntryNavigation();
  const links = messages.navbar.links;

  const go = useCallback(
    (page: string, path: string) => {
      if (onNavigate) {
        onNavigate(page);
      } else {
        navigate(path);
      }
    },
    [onNavigate, navigate],
  );

  return [
    { key: "home", label: links.home, active: activePage === "home", to: "/", onClick: () => go("home", "/") },
    { key: "creating", label: links.creating, active: activePage === "creating", to: "/creating", onClick: () => go("creating", "/creating") },
    { key: "distribution", label: messages.distribution.nav.entry, to: "/distribution", onClick: enterDistribution },
    { key: "download", label: links.download, active: activePage === "download", to: "/download", onClick: () => go("download", "/download") },
    { key: "blog", label: links.blog, active: activePage === "blog", to: "/blog" },
    { key: "contact", label: links.contact, active: activePage === "contact", to: "/contact", onClick: () => go("contact", "/contact") },
  ];
}
