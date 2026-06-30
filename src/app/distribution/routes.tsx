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

/**
 * 发行中心子路由（挂载于 /distribution/*）。
 * - /distribution           → 入驻流程（EnrollPage 内部按 /status 决定四态）
 * - /distribution/enroll    → 入驻申请
 * - /distribution/overview  → 数据概览（带侧边栏 Layout）
 * - /distribution/content   → 上剧中心
 * - /distribution/payment | earnings | withdraw → 结算中心
 */
export function DistributionRoutes() {
  return (
    <ErrorBoundary>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route index element={<Navigate to="enroll" replace />} />
        <Route path="enroll" element={<EnrollPage />} />
        <Route element={<DistributionLayout />}>
          <Route path="overview" element={<OverviewPage />} />
          <Route path="content" element={<ContentPage />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="earnings" element={<EarningsPage />} />
          <Route path="withdraw" element={<WithdrawPage />} />
        </Route>
        <Route path="*" element={<Navigate to="enroll" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
