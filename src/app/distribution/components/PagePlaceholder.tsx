import { useI18n } from "../../i18n";

/** P0 阶段的页面占位骨架；P2/P3 功能实现后将整体替换对应页面文件。 */
export function PagePlaceholder({ title, subtitle }: { title: string; subtitle: string }) {
  const { messages } = useI18n();
  return (
    <div className="p-8">
      <h1 className="text-[#111111]" style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: 0 }}>
        {title}
      </h1>
      <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
      <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white h-64 flex items-center justify-center">
        <span className="text-gray-400 text-sm">{messages.distribution.common.empty}</span>
      </div>
    </div>
  );
}
