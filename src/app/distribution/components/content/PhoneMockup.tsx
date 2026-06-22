import React from "react";
import { Home, User, Sparkles, PlayCircle, Film } from "lucide-react";

/** 发布范围预览的高亮位置 */
export type Highlight = "homepage" | "foryou" | "account";

interface PhoneMockupProps {
  highlights: Highlight[];
  dramaName: string;
  /** 底部 tab 文案（i18n 注入） */
  labels: { home: string; forYou: string; me: string };
  /** "首页推荐" 区块标题（i18n 注入） */
  homepageLabel: string;
  /** 占位短剧名（dramaName 为空时） */
  placeholderName: string;
}

/**
 * 手机内嵌预览（移植自原型 PhoneMockup，纯展示，文案由调用方注入）。
 * 用于上剧发布配置 Step3 与详情页发布配置卡片，直观展示曝光位置。
 */
export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  highlights,
  dramaName,
  labels,
  homepageLabel,
  placeholderName,
}) => {
  const on = (key: Highlight) => highlights.includes(key);
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative rounded-[2rem] overflow-hidden shadow-2xl"
        style={{ width: 160, height: 300, background: "#111", border: "6px solid #222" }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-4 bg-black rounded-b-xl z-10" />
        <div className="absolute inset-0 bg-white flex flex-col">
          <div className="h-6 bg-gray-50 flex-shrink-0" />
          <div className="flex-1 overflow-hidden relative">
            <div className={`absolute inset-0 transition-all ${on("foryou") ? "" : "opacity-30"}`}>
              <div className="flex flex-col gap-0.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 px-2 py-1 ${i === 1 && on("foryou") ? "bg-red-50" : ""}`}
                  >
                    <div
                      className={`w-7 h-7 rounded flex-shrink-0 flex items-center justify-center ${
                        i === 1 && on("foryou") ? "bg-[#E8192C]" : "bg-gray-200"
                      }`}
                    >
                      <PlayCircle
                        className={`w-4 h-4 ${i === 1 && on("foryou") ? "text-white" : "text-gray-400"}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[7px] truncate leading-tight ${
                          i === 1 && on("foryou") ? "text-gray-800 font-bold" : "text-gray-400"
                        }`}
                      >
                        {i === 1 && on("foryou") ? dramaName || placeholderName : "···"}
                      </div>
                      <div className="w-8 h-1 rounded bg-gray-200 mt-0.5" />
                    </div>
                  </div>
                ))}
              </div>
              {on("homepage") && (
                <div className="px-1.5 mt-1">
                  <div className="text-[6px] font-bold mb-1 px-0.5 text-[#E8192C]">{homepageLabel}</div>
                  <div className="grid grid-cols-3 gap-0.5">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`rounded aspect-[9/14] ${
                          i === 1 ? "bg-[#E8192C]/20 border border-[#E8192C]/40" : "bg-gray-100"
                        }`}
                      >
                        {i === 1 && (
                          <div className="flex items-center justify-center h-full">
                            <Film className="w-3 h-3 text-[#E8192C]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 h-10 border-t border-gray-100 flex items-center justify-around px-1 bg-white">
            {(
              [
                { key: "homepage", icon: <Home className="w-3.5 h-3.5" />, label: labels.home },
                { key: "foryou", icon: <Sparkles className="w-3.5 h-3.5" />, label: labels.forYou },
                { key: "account", icon: <User className="w-3.5 h-3.5" />, label: labels.me },
              ] as { key: Highlight; icon: React.ReactNode; label: string }[]
            ).map((item) => {
              const active = highlights.includes(item.key);
              return (
                <div key={item.key} className="flex flex-col items-center gap-0.5">
                  <div style={{ color: active ? "#E8192C" : "#9CA3AF" }}>{item.icon}</div>
                  <span
                    className="text-[6px]"
                    style={{ color: active ? "#E8192C" : "#9CA3AF", fontWeight: active ? 700 : 400 }}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
