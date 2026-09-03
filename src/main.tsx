import { createRoot } from "react-dom/client";
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./app/App.tsx";
// ── 路由级懒加载：非首页路由全部按需加载，首屏只下载首页 bundle ──
const DistributionRoutes = lazy(() => import("./app/distribution/routes").then(m => ({ default: m.DistributionRoutes })));
const LoginPage = lazy(() => import("./app/pages/LoginPage").then(m => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import("./app/pages/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));
const CreatorProfilePage = lazy(() => import("./app/pages/CreatorProfilePage").then(m => ({ default: m.CreatorProfilePage })));
const GenrePage = lazy(() => import("./app/pages/GenrePage").then(m => ({ default: m.GenrePage })));
const DramaPage = lazy(() => import("./app/pages/DramaPage").then(m => ({ default: m.DramaPage })));
const BlogListPage = lazy(() => import("./app/pages/BlogListPage").then(m => ({ default: m.BlogListPage })));
const BlogPostPage = lazy(() => import("./app/pages/BlogPostPage").then(m => ({ default: m.BlogPostPage })));
const RegionPage = lazy(() => import("./app/pages/RegionPage").then(m => ({ default: m.RegionPage })));
const LegalDocumentPage = lazy(() => import("./app/pages/LegalDocumentPage").then(m => ({ default: m.PrivacyPolicyPage })));
const LegalTosPage = lazy(() => import("./app/pages/LegalDocumentPage").then(m => ({ default: m.TermsOfServicePage })));
const NotFoundPage = lazy(() => import("./app/components/NotFoundPage").then(m => ({ default: m.NotFoundPage })));
import { I18nProvider } from "./app/i18n.tsx";
import { getRouterBasename } from "./app/localePath";
import { MultilangSubsetGuard } from "./app/components/MultilangSubsetGuard";
import { Toaster } from "./app/components/ui/sonner";
import "./styles/index.css";

/**
 * 预渲染会在 <head> 注入 #prerender-anti-hidden：把 motion 的
 * inline opacity:0 / transform 强制成可见，方便无 JS 爬虫读正文。
 * 这段 CSS 的 !important 会盖掉打包后的入场动画，首屏提交后再撤掉。
 */
function ReleaseMotionLock() {
  useEffect(() => {
    document.getElementById("prerender-anti-hidden")?.remove();
  }, []);
  return null;
}

/** 路由切换时的轻量骨架屏，避免白屏闪烁 */
function PageFallback() {
  return (
    <div className="min-h-screen bg-[#0a0000] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
    </div>
  );
}

/**
 * BrowserRouter basename = 部署根 + 语言路径前缀。
 * - /about              → basename "/"
 * - /zh/about           → basename "/zh"
 * - /lollipop/pt/blog   → basename "/lollipop/pt"
 *
 * 语言段进入 basename 后，业务路由仍写 /distribution/*、/about，
 * Link/navigate 会自动带上 /zh 等前缀，无需改各页面。
 */
createRoot(document.getElementById("root")!).render(
  <I18nProvider>
    <ReleaseMotionLock />
    <Toaster position="top-center" richColors closeButton offset="80px" mobileOffset="72px" />
    <BrowserRouter basename={getRouterBasename()}>
      <MultilangSubsetGuard />
      <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* 发行中心后台子应用 — 懒加载，登录后才使用 */}
        <Route path="/distribution/*" element={<DistributionRoutes />} />
        {/* 登录（整页·手机号/邮箱 + 密码，复用 H5 逻辑）— 懒加载 */}
        <Route path="/login" element={<LoginPage />} />
        {/* 忘记密码 / 重置密码 — 懒加载 */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        {/* 出品方公开主页（bug18）— 懒加载 */}
        <Route path="/creator/:userId" element={<CreatorProfilePage />} />
        {/* 品类分类页 — 承接品类搜索流量，懒加载 */}
        <Route path="/genre/:slug" element={<GenrePage />} />
        {/* 剧集详情页 — VideoObject Schema，懒加载 */}
        <Route path="/drama/:slug" element={<DramaPage />} />
        {/* 博客系统 — 长尾内容引流，懒加载 */}
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        {/* ⚠️ 原「结构化知识区 /guides」已于 2026-09-01 整体迁入 /blog 的「操作指南」分类，
            路由与页面组件均已删除，旧路径由 Caddyfile 301 到 /blog。勿再新增该路由。 */}
        {/* 区域落地页 — GEO 地理定位，懒加载 */}
        <Route path="/region/:code" element={<RegionPage />} />
        {/* 用户协议 / 隐私政策（与 H5 me/setting/xieyi、mimi 同源配置）— 懒加载 */}
        <Route path="/terms" element={<LegalTosPage />} />
        <Route path="/privacy" element={<LegalDocumentPage />} />
        {/* 营销站 — 首页保持同步加载（首屏关键路径） */}
        <Route path="/" element={<App initialPage="home" />} />
        <Route path="/creating" element={<App initialPage="creating" />} />
        <Route path="/download" element={<App initialPage="download" />} />
        <Route path="/contact" element={<App initialPage="contact" />} />
        <Route path="/about" element={<App initialPage="about" />} />
        {/* 404 — 返回真实 404 页面而非重定向到首页，懒加载 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  </I18nProvider>
);

/* React 挂载后移除加载遮罩。
   生产环境：index.html 脚本已监听 CSS 加载并隐藏遮罩，此处为兜底。
   Dev 环境：React 挂载后立即隐藏，无需等待图片（logo 由客户端挂载后渲染）。 */
(function hideLoader() {
  var loader = document.getElementById('app-loader');
  if (!loader || loader.classList.contains('hidden')) return;
  loader.classList.add('hidden');
  setTimeout(function() { loader && loader.remove(); }, 350);
})();
