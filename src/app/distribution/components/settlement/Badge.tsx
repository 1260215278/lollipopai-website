/**
 * 结算中心徽章组件（收益类型 / 结算状态 / 账户类型）。
 * 颜色严格取自 figma：
 *   收益类型 全量推荐订阅 #e8192c（粉底）/ 账户主页订阅 #3b82f6（蓝底）
 *   状态 已结算/已打款 #16a34a（绿底）/ 结算中/未打款 #ea580c（橙底）/ 待结算 灰
 *   账户类型 #4a5565（灰底 #f3f4f6）
 * 文案由调用方传入（走 i18n），此处只负责样式。
 */

/** 收益/结算类型徽章（full=全量推荐订阅 / account=账户主页订阅）。 */
export function TypeBadge({ type, label }: { type: "full" | "account"; label: string }) {
  const style =
    type === "full"
      ? { background: "#FFF1F2", color: "#e8192c" }
      : { background: "#EFF6FF", color: "#3b82f6" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs whitespace-nowrap"
      style={{ ...style, fontWeight: 500 }}
    >
      {label}
    </span>
  );
}

/** 收益明细行状态徽章。 */
export function EarningsStatusBadge({
  status,
  label,
}: {
  status: "settled" | "processing" | "pending";
  label: string;
}) {
  const map = {
    settled: { background: "#F0FDF4", color: "#16a34a" },
    processing: { background: "#FFF7ED", color: "#ea580c" },
    pending: { background: "#F9FAFB", color: "#6B7280" },
  } as const;
  const style = map[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs w-fit whitespace-nowrap"
      style={{ ...style, fontWeight: 500 }}
    >
      {label}
    </span>
  );
}

/** 结算记录状态徽章（unpaid=未打款 橙 / paid=已打款 绿）。 */
export function SettlementStatusBadge({
  status,
  label,
}: {
  status: "unpaid" | "paid";
  label: string;
}) {
  const style =
    status === "paid"
      ? { background: "#F0FDF4", color: "#16a34a" }
      : { background: "#FFF7ED", color: "#ea580c" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs w-fit whitespace-nowrap"
      style={{ ...style, fontWeight: 500 }}
    >
      {label}
    </span>
  );
}

/** 账户类型徽章（中国公户 / 海外公户）。 */
export function AccountTypeBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs whitespace-nowrap"
      style={{ background: "#f3f4f6", color: "#4a5565", fontWeight: 500 }}
    >
      {label}
    </span>
  );
}
