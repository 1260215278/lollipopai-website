import React from "react";
import { X } from "lucide-react";
import { COUNTRIES } from "../../mock/content";
import type { ContentMessages } from "../../i18n/content";

interface CountryPricingModalProps {
  open: boolean;
  onClose: () => void;
  t: ContentMessages;
}

/**
 * 国家收费规则弹窗（figma 15081-22048）。
 * 数据来自前端写死的 COUNTRIES 常量（US/PH/IN，平台统一定价，只读）。
 * 名称走 i18n（t.countries[value]），数值原样取常量、不可修改。
 */
export const CountryPricingModal: React.FC<CountryPricingModalProps> = ({ open, onClose, t }) => {
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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-2 text-xs text-gray-500" style={{ fontWeight: 500 }}>
                  {t.pricingColCountry}
                </th>
                <th className="text-left pb-2 text-xs text-gray-500" style={{ fontWeight: 500 }}>
                  {t.pricingColFull}
                </th>
                <th className="text-left pb-2 text-xs text-gray-500" style={{ fontWeight: 500 }}>
                  {t.pricingColSingle}
                </th>
                <th className="text-left pb-2 text-xs text-gray-500" style={{ fontWeight: 500 }}>
                  {t.pricingColAd}
                </th>
              </tr>
            </thead>
            <tbody>
              {COUNTRIES.map((c) => (
                <tr key={c.value} className="border-b border-gray-50 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{c.flag}</span>
                      <span className="text-gray-800" style={{ fontWeight: 600 }}>
                        {t.countries[c.value as keyof typeof t.countries]}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-gray-900" style={{ fontWeight: 700 }}>
                    {c.pricing.full}
                  </td>
                  <td className="py-3 text-gray-900" style={{ fontWeight: 700 }}>
                    {c.pricing.single}
                  </td>
                  <td className="py-3">
                    {c.pricing.ad ? (
                      <span className="text-amber-600" style={{ fontWeight: 600 }}>
                        {t.adHas}
                      </span>
                    ) : (
                      <span className="text-gray-300">{t.adNone}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
