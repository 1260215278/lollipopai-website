
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import App from "./app/App.tsx";
import { DistributionRoutes } from "./app/distribution/routes";
import { LoginPage } from "./app/pages/LoginPage";
import { I18nProvider } from "./app/i18n.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <I18nProvider>
    <BrowserRouter>
      <Routes>
        {/* 发行中心后台子应用 */}
        <Route path="/distribution/*" element={<DistributionRoutes />} />
        {/* 登录（整页·手机号+验证码） */}
        <Route path="/login" element={<LoginPage />} />
        {/* 营销站（内部状态路由保持不动） */}
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </I18nProvider>
);
