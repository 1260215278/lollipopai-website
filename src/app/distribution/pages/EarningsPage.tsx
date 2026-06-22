import { useI18n } from "../../i18n";
import { PagePlaceholder } from "../components/PagePlaceholder";

/** 收益明细 —— P0 占位，由 P3 功能 subagent 按 figma 15151-31377/15135-27153 实现 */
export function EarningsPage() {
  const { messages } = useI18n();
  const t = messages.distribution.earnings;
  return <PagePlaceholder title={t.title} subtitle={t.subtitle} />;
}
