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
 *
 * ⚠️ 路由同步铁律：本文件的 <Routes> 是**第二份**路由表，必须与 src/main.tsx 保持一致。
 * 这里的 <Route path="*"> 兜底会渲染首页，且**不会报错** —— 只要某个路由忘了在这里注册，
 * prerender 仍会生成 HTML，title/description 也正确（来自 getRouteData），
 * 只有正文被静默替换成首页内容。这类缺陷在 dist 里肉眼几乎看不出来，
 * 新增路由时务必同时改两处，并在构建后 grep dist 校验正文关键词。
 */
import { renderToString } from "react-dom/server";
import { StaticRouter, Routes, Route } from "react-router";
import { I18nProvider } from "./app/i18n";
import { getRouterBasename, matchLocalePath } from "./app/localePath";
import { MultilangSubsetGuard } from "./app/components/MultilangSubsetGuard";
import App from "./app/App";
import { BlogListPage } from "./app/pages/BlogListPage";
import { BlogPostPage } from "./app/pages/BlogPostPage";
import { GenrePage } from "./app/pages/GenrePage";
import { DramaPage } from "./app/pages/DramaPage";
import { RegionPage } from "./app/pages/RegionPage";
import { LoginPage } from "./app/pages/LoginPage";
import { ForgotPasswordPage } from "./app/pages/ForgotPasswordPage";
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
        <MultilangSubsetGuard />
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
          {/* 结构化知识区 — HowTo 工作流（GEO 重点）
              ⚠️ 分类静态段必须与 src/main.tsx 一致，且排在 :slug 之前 */}
          {/* 品类 / 剧集 / 区域落地页 */}
          <Route path="/genre/:slug" element={<GenrePage />} />
          <Route path="/drama/:slug" element={<DramaPage />} />
          <Route path="/region/:code" element={<RegionPage />} />
          {/* 法律文档 */}
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          {/* 登录 / 找回密码（noindex，但仍需正确正文——否则会被 * 兜底成首页） */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          {/* 兜底：未知路径渲染首页内容（与 SPA fallback 一致） */}
          <Route path="*" element={<App initialPage="home" />} />
        </Routes>
      </StaticRouter>
    </I18nProvider>,
  );
}
