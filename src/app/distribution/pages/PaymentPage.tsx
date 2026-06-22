import { useI18n } from "../../i18n";
import { PagePlaceholder } from "../components/PagePlaceholder";

/** 收款管理 —— P0 占位，由 P3 功能 subagent 按 figma 15150-* 实现 */
export function PaymentPage() {
  const { messages } = useI18n();
  const t = messages.distribution.payment;
  return <PagePlaceholder title={t.title} subtitle={t.subtitle} />;
}
