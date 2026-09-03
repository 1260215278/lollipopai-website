import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { COUNTRY_CODES } from "../data/countryCodes";

/**
 * 区号选择器（bug3）：可点击展开、带搜索的下拉，数据来自短剧 H5 全量区号表。
 * 点击外部关闭；按 国家名/中文名/区号/ISO 码 过滤。登录页与忘记密码页共用。
 */
export function AreaCodeSelect({
  value,
  onChange,
  locale,
  variant = "dark",
}: {
  value: string;
  onChange: (v: string) => void;
  locale: string;
  variant?: "dark" | "light";
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const zh = locale === "zh-CN" || locale === "zh-TW";
  const raw = query.trim();
  const q = raw.toLowerCase();
  const list = q
    ? COUNTRY_CODES.filter(
        (c) =>
          c.dialCode.includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.nameZh.includes(raw) ||
          c.code.toLowerCase().includes(q),
      )
    : COUNTRY_CODES;
  const light = variant === "light";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`h-[46px] px-3 rounded-[10px] border flex items-center gap-1.5 text-sm outline-none transition-colors whitespace-nowrap ${
          light
            ? "bg-white border-[#e5e7eb] text-[#1e2939] hover:border-gray-400"
            : "bg-[#333] border-white/10 text-white/80 hover:border-white/30"
        }`}
      >
        <span>{value}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${light ? "text-[#99a1af]" : "text-white/50"} ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className={`absolute z-20 top-[52px] left-0 w-[260px] rounded-[10px] border shadow-lg overflow-hidden ${
              light ? "bg-white border-[#e5e7eb]" : "bg-[#1c1c1c] border-[#666]"
            }`}
          >
            <div className={`p-2 border-b ${light ? "border-[#f3f4f6]" : "border-white/10"}`}>
              <div className={`flex items-center gap-2 px-2 h-9 rounded-lg ${light ? "bg-[#f9fafb]" : "bg-[#333]"}`}>
                <Search className={`w-3.5 h-3.5 ${light ? "text-[#99a1af]" : "text-white/40"}`} />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className={`flex-1 bg-transparent text-sm outline-none ${
                    light ? "text-[#1e2939] placeholder:text-[#99a1af]" : "text-white placeholder:text-white/40"
                  }`}
                />
              </div>
            </div>
            <div className="max-h-[260px] overflow-y-auto py-1">
              {list.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onChange(c.dialCode);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`w-full px-3 py-2 flex items-center justify-between gap-3 text-sm text-left ${
                    light
                      ? `text-[#1e2939] hover:bg-[#f9fafb] ${c.dialCode === value ? "bg-[#f9fafb]" : ""}`
                      : `text-white/80 hover:bg-white/10 ${c.dialCode === value ? "bg-white/5" : ""}`
                  }`}
                >
                  <span className="truncate">{zh ? c.nameZh : c.name}</span>
                  <span className={`${light ? "text-[#6a7282]" : "text-white/50"} shrink-0`}>{c.dialCode}</span>
                </button>
              ))}
              {list.length === 0 && <div className={`px-3 py-4 text-center text-xs ${light ? "text-[#99a1af]" : "text-white/40"}`}>—</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
