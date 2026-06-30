
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./app/App.tsx";
import { DistributionRoutes } from "./app/distribution/routes";
import { LoginPage } from "./app/pages/LoginPage";
import { ForgotPasswordPage } from "./app/pages/ForgotPasswordPage";
import { CreatorProfilePage } from "./app/pages/CreatorProfilePage";
import { I18nProvider } from "./app/i18n.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <I18nProvider>
    <BrowserRouter>
      <Routes>
        {/* 发行中心后台子应用 */}
        <Route path="/distribution/*" element={<DistributionRoutes />} />
        {/* 登录（整页·手机号/邮箱 + 密码，复用 H5 逻辑） */}
        <Route path="/login" element={<LoginPage />} />
        {/* 忘记密码 / 重置密码 */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        {/* 出品方公开主页（bug18） */}
        <Route path="/creator/:userId" element={<CreatorProfilePage />} />
        {/* 营销站（内部状态路由保持不动） */}
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </I18nProvider>
);
