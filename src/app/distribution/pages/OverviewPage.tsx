import { useI18n } from "../../i18n";
import { PagePlaceholder } from "../components/PagePlaceholder";

/** 数据概览 —— P0 占位，由 P2 功能 subagent 按 figma 15077-19718 实现 */
export function OverviewPage() {
  const { messages } = useI18n();
  const t = messages.distribution.overview;
  return <PagePlaceholder title={t.title} subtitle={t.subtitle} />;
}
