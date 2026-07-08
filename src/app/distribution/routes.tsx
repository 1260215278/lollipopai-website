import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "../components/ui/sonner";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { DistributionLayout } from "./DistributionLayout";
import { EnrollPage } from "./pages/EnrollPage";
import { ContentPage } from "./pages/ContentPage";
import { PaymentPage } from "./pages/PaymentPage";
import { EarningsPage } from "./pages/EarningsPage";
import { WithdrawPage } from "./pages/WithdrawPage";
import { MembersPage } from "./pages/MembersPage";
import { AccountPage } from "./pages/AccountPage";

/**
 * 发行中心子路由（挂载于 /distribution/*）。
 * - /distribution           → 发行中心入口（Layout 内部按登录态/byAppToken 决定后台/入驻）
 * - /distribution/enroll    → 入驻申请
 * - /distribution/content   → 上剧中心
 * - /distribution/payment | earnings | withdraw → 结算中心
 * - /distribution/account | members → 账号中心 / 成员管理
 */
export function DistributionRoutes() {
  return (
    <ErrorBoundary>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route index element={<Navigate to="content" replace />} />
        <Route path="enroll" element={<EnrollPage />} />
        <Route path="overview" element={<Navigate to="/distribution/content" replace />} />
        <Route element={<DistributionLayout />}>
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
