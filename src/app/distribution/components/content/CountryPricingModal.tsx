import React from "react";
import { X, Loader2 } from "lucide-react";
import type { ContentMessages } from "../../i18n/content";
import type { PriceRuleCountry } from "./types";
import { formatUsd } from "./shared";

interface CountryPricingModalProps {
  open: boolean;
  onClose: () => void;
  t: ContentMessages;
  /** 各国家收费规则（GET /publisher/course/priceRule） */
  rows: PriceRuleCountry[];
  loading?: boolean;
}

/**
 * 各国家收费规则弹窗（img_17，只读）。
 * 数据来自 `/publisher/course/priceRule`：平台按国家统一定价（USD），
 * 列为 单集 / 整剧(≤50集) / 整剧(>50集)；单集价为 NULL 时显示 "—"（该国不卖单集）。
 * 已去除 15s 广告列（本期不做）。
 */
export const CountryPricingModal: React.FC<CountryPricingModalProps> = ({
  open,
  onClose,
  t,
  rows,
  loading,
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-gray-900" style={{ fontWeight: 700 }}>
            {t.pricingTitle}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
            aria-label={t.cancel}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-xs text-gray-400 mb-4">{t.pricingDesc}</p>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">{t.emptyTitle}</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-2 text-xs text-gray-500" style={{ fontWeight: 500 }}>
                    {t.pricingColCountry}
                  </th>
                  <th className="text-left pb-2 text-xs text-gray-500" style={{ fontWeight: 500 }}>
                    {t.pricingColSingle}
                  </th>
                  <th className="text-left pb-2 text-xs text-gray-500" style={{ fontWeight: 500 }}>
                    {t.pricingColWholeLe50}
                  </th>
                  <th className="text-left pb-2 text-xs text-gray-500" style={{ fontWeight: 500 }}>
                    {t.pricingColWholeGt50}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.country} className="border-b border-gray-50 last:border-0">
                    <td className="py-3">
                      <span className="text-gray-800" style={{ fontWeight: 600 }}>
                        {c.countryName || c.country}
                      </span>
                    </td>
                    <td className="py-3 text-gray-900" style={{ fontWeight: 700 }}>
                      {formatUsd(c.episodePriceUsd)}
                    </td>
                    <td className="py-3 text-gray-900" style={{ fontWeight: 700 }}>
                      {formatUsd(c.wholePriceLe50Usd)}
                    </td>
                    <td className="py-3 text-gray-900" style={{ fontWeight: 700 }}>
                      {formatUsd(c.wholePriceGt50Usd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
