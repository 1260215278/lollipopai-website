import { useI18n } from "../../i18n";
import { PagePlaceholder } from "../components/PagePlaceholder";

/** 上剧中心 —— P0 占位，由 P2 功能 subagent 按 figma 多 node 实现 */
export function ContentPage() {
  const { messages } = useI18n();
  const t = messages.distribution.content;
  return <PagePlaceholder title={t.title} subtitle={t.subtitle} />;
}
