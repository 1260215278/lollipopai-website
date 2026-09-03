import { Navigate, useLocation } from "react-router";
import { useI18n } from "../i18n";
import { getDeployBasename, stripLocalePrefix } from "../localePath";
import { isMultilangSubsetPath } from "../multilangSubset";

/**
 * 方案 B 运行时兜底（2026-09-01）：
 * 多语言预渲染只对「子集页面」（6 静态页 + 10 genre + 12 HowTo）生成语言版本产物，
 * 其余页面只有英文产物。当用户以「语言前缀 + 非子集路径」进入
 * （例如直链 /ar/blog/what-is-micro-drama，或点击了未被改写的站内链接），
 * 重定向到英文版对应页面 —— 保证任何 URL 都能渲染出匹配的内容。
 *
 * 与 scripts/prerender-plugin.ts 的 rewriteNonSubsetLinks 配合：
 * 静态 HTML 里的非子集链接改写为英文 URL（爬虫无死链），
 * 运行时由本组件保证行为一致（hydration 后重新渲染的 Link 仍带前缀时也会被兜底）。
 *
 * ⚠️ 必须同时挂载在 src/main.tsx（客户端）与 src/entry-server.tsx（SSR）的
 * Router 内，保持两棵树结构一致，避免 hydration mismatch。
 * SSR 端永不触发（prerender 只渲染有产物的路由），仅保持结构占位。
 */
export function MultilangSubsetGuard() {
  const { locale } = useI18n();
  const location = useLocation();
  const deployBase = getDeployBasename();
  const appPath = stripLocalePrefix(location.pathname, deployBase);

  if (locale !== "en" && !isMultilangSubsetPath(appPath)) {
    return <Navigate to={appPath} replace />;
  }
  return null;
}
