import type { ReactNode } from "react";

/**
 * 结算中心通用空态（暂无数据）。
 * 居中图标 + 标题 + 说明，配合各页 figma 暂无态（15150-30625 / 15151-31377 / 15151-31580）。
 */
export function EmptyState({
  icon,
  title,
  desc,
  className = "",
}: {
  icon: ReactNode;
  title: string;
  desc?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <div className="w-14 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-1 text-gray-300">
        {icon}
      </div>
      <p className="text-sm text-gray-500" style={{ fontWeight: 500 }}>
        {title}
      </p>
      {desc && <p className="text-xs text-gray-400 text-center max-w-xs leading-relaxed">{desc}</p>}
    </div>
  );
}
