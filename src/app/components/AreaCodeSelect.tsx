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
}: {
  value: string;
  onChange: (v: string) => void;
  locale: string;
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

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-[46px] px-3 rounded-[10px] bg-[#333] border border-white/10 flex items-center gap-1.5 text-sm text-white/80 outline-none transition-colors hover:border-white/30 whitespace-nowrap"
      >
        <span>{value}</span>
        <ChevronDown className={`w-3 h-3 text-white/50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-[52px] left-0 w-[260px] rounded-[10px] bg-[#1c1c1c] border border-[#666] shadow-lg overflow-hidden">
            <div className="p-2 border-b border-white/10">
              <div className="flex items-center gap-2 px-2 h-9 rounded-lg bg-[#333]">
                <Search className="w-3.5 h-3.5 text-white/40" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
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
                  className={`w-full px-3 py-2 flex items-center justify-between gap-3 text-sm text-left text-white/80 hover:bg-white/10 ${
                    c.dialCode === value ? "bg-white/5" : ""
                  }`}
                >
                  <span className="truncate">{zh ? c.nameZh : c.name}</span>
                  <span className="text-white/50 shrink-0">{c.dialCode}</span>
                </button>
              ))}
              {list.length === 0 && <div className="px-3 py-4 text-center text-xs text-white/40">—</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
