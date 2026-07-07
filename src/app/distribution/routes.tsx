import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "../components/ui/sonner";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { DistributionLayout } from "./DistributionLayout";
import { EnrollPage } from "./pages/EnrollPage";
import { OverviewPage } from "./pages/OverviewPage";
import { ContentPage } from "./pages/ContentPage";
import { PaymentPage } from "./pages/PaymentPage";
import { EarningsPage } from "./pages/EarningsPage";
import { WithdrawPage } from "./pages/WithdrawPage";
import { MembersPage } from "./pages/MembersPage";
import { AccountPage } from "./pages/AccountPage";

/**
 * 发行中心子路由（挂载于 /distribution/*）。
 * - /distribution           → 发行中心入口（Layout 内部按 byAppToken 决定工作台/入驻/登录）
 * - /distribution/enroll    → 入驻申请
 * - /distribution/overview  → 数据概览（带侧边栏 Layout）
 * - /distribution/content   → 上剧中心
 * - /distribution/payment | earnings | withdraw → 结算中心
 * - /distribution/account | members → 账号中心 / 成员管理
 */
export function DistributionRoutes() {
  return (
    <ErrorBoundary>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="enroll" element={<EnrollPage />} />
        <Route element={<DistributionLayout />}>
          <Route path="overview" element={<OverviewPage />} />
          <Route path="content" element={<ContentPage />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="earnings" element={<EarningsPage />} />
          <Route path="withdraw" element={<WithdrawPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="members" element={<MembersPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/distribution/enroll" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
