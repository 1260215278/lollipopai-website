import { useI18n } from "../../i18n";
import { PagePlaceholder } from "../components/PagePlaceholder";

/** 结算记录 —— P0 占位，由 P3 功能 subagent 按 figma 15151-31580/15152-* 实现 */
export function WithdrawPage() {
  const { messages } = useI18n();
  const t = messages.distribution.withdraw;
  return <PagePlaceholder title={t.title} subtitle={t.subtitle} />;
}
