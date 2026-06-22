import { Loader2 } from "lucide-react";

/**
 * 结算中心页面标题区（标题 + 副标题）。
 * figma 收款管理标题 text-[#101828] 15px 加粗、副标题 #6a7282 12px。
 */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-[#101828]" style={{ fontWeight: 700, fontSize: "0.9375rem" }}>
        {title}
      </h2>
      {subtitle && <p className="text-xs text-[#99a1af] mt-1">{subtitle}</p>}
    </div>
  );
}

/** 加载中占位（浅色仪表盘）。 */
export function PageLoading() {
  return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
    </div>
  );
}
