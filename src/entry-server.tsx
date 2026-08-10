/**
 * 服务端渲染入口（仅供 build-time 预渲染使用，不进入浏览器 bundle）。
 *
 * 与 src/main.tsx 的区别：
 *  - 使用 StaticRouter（而非 BrowserRouter），由预渲染器按路由注入 location。
 *  - 所有路由组件改为「静态 import」，避免使用 React.lazy —— 因为
 *    renderToString 不会 resolve Suspense/lazy 边界，一旦命中 lazy 只会吐出
 *    骨架屏（转圈 div），SEO 价值为零。
 *  - 不渲染 <Toaster />：sonner 在渲染期调用 createPortal，renderToString 不支持
 *    portal 会抛错；且 Toaster 挂到 #root 之外的 body 节点，不影响 root 子树 hydration。
 *  - I18nProvider 已内置 typeof window 守卫，SSR 下默认 locale = "en"，无副作用。
 *
 * 导出 renderRoute(path) → 返回该路由完整渲染后的 HTML 字符串（不含外层 <html>）。
 */
import { renderToString } from "react-dom/server";
import { StaticRouter, Routes, Route } from "react-router";
import { I18nProvider } from "./app/i18n";
import { getRouterBasename, matchLocalePath } from "./app/localePath";
import App from "./app/App";
import { BlogListPage } from "./app/pages/BlogListPage";
import { BlogPostPage } from "./app/pages/BlogPostPage";
import { GenrePage } from "./app/pages/GenrePage";
import { DramaPage } from "./app/pages/DramaPage";
import { RegionPage } from "./app/pages/RegionPage";
import {
  PrivacyPolicyPage,
  TermsOfServicePage,
} from "./app/pages/LegalDocumentPage";

/**
 * 渲染指定路由为完整 HTML 字符串。
 * @param path 路由路径，例如 "/blog/ai-script-storyboard" 或 "/zh/about"
 *
 * 语言前缀进入 StaticRouter basename，业务 Route 仍为无前缀路径，
 * 与客户端 BrowserRouter 行为一致。
 */
export function renderRoute(path: string): string {
  const localeMatch = matchLocalePath(path, "");
  const basename = getRouterBasename(path);
  const routerBasename = basename === "/" ? undefined : basename;

  return renderToString(
    <I18nProvider initialLocale={localeMatch?.locale ?? "en"}>
      <StaticRouter basename={routerBasename} location={path}>
        <Routes>
          {/* 营销站首页（完全同步，无 lazy） */}
          <Route path="/" element={<App initialPage="home" />} />
          {/* 营销子页：App 内部已改为静态 import，可同步渲染 */}
          <Route path="/about" element={<App initialPage="about" />} />
          <Route path="/creating" element={<App initialPage="creating" />} />
          <Route path="/download" element={<App initialPage="download" />} />
          <Route path="/contact" element={<App initialPage="contact" />} />
          {/* 博客系统 */}
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          {/* 品类 / 剧集 / 区域落地页 */}
          <Route path="/genre/:slug" element={<GenrePage />} />
          <Route path="/drama/:slug" element={<DramaPage />} />
          <Route path="/region/:code" element={<RegionPage />} />
          {/* 法律文档 */}
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          {/* 兜底：未知路径渲染首页内容（与 SPA fallback 一致） */}
          <Route path="*" element={<App initialPage="home" />} />
        </Routes>
      </StaticRouter>
    </I18nProvider>,
  );
}
