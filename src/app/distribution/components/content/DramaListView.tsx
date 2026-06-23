import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Film,
  MoreHorizontal,
  FileText,
  Video,
  EyeOff,
  Eye,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { ContentMessages } from "../../i18n/content";
import { COUNTRIES } from "../../mock/content";
import type { DramaRow } from "./types";
import { dramaStatusStyle, dramaStatusLabel, fmt } from "./shared";

interface DramaListViewProps {
  t: ContentMessages;
  dramas: DramaRow[];
  loading: boolean;
  /** 各剧已上传集数（uploaded 计数），用于"M/N集已上传" */
  uploadedCounts: Record<string, number>;
  searchQuery: string;
  onSearch: (v: string) => void;
  onUpload: () => void;
  onViewDetail: (d: DramaRow) => void;
  onManageEpisodes: (d: DramaRow) => void;
  /** 切换上下架（online→请求下架确认；其余→直接上架） */
  onToggleStatus: (d: DramaRow) => void;
}

/** 短剧列表（figma 15293-178 / 15294-663）。表格 + 行内操作菜单。 */
export const DramaListView: React.FC<DramaListViewProps> = ({
  t,
  dramas,
  loading,
  uploadedCounts,
  searchQuery,
  onSearch,
  onUpload,
  onViewDetail,
  onManageEpisodes,
  onToggleStatus,
}) => {
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setActionMenuId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const columns = [
    t.colDramaInfo,
    t.colCountries,
    t.colDistribution,
    t.colReview,
    t.colPublishStatus,
    t.colCopyright,
    t.colRevenue,
    t.colActions,
  ];

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg bg-white outline-none focus:border-gray-400"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onUpload}
            className="px-4 py-2 rounded-lg text-white text-xs flex items-center gap-1.5 hover:opacity-90"
            style={{ background: "#111111", fontWeight: 600 }}
          >
            <Film className="w-3.5 h-3.5" />
            {t.uploadDrama}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[880px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <span className="text-xs text-gray-500" style={{ fontWeight: 500 }}>
                    {col}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </td>
              </tr>
            ) : dramas.length > 0 ? (
              dramas.map((drama, idx) => {
                const stStyle = dramaStatusStyle[drama.status];
                const distLabel = drama.distribution === "full" ? t.distFull : t.distAccount;
                const revenueLabel =
                  drama.revenueType === "full" ? t.revenueFullShort : t.revenueAccountShort;
                const epDone = uploadedCounts[drama.id] ?? drama.uploadedEpisodes;
                const isOpen = actionMenuId === drama.id;
                // 末 2 行的操作菜单向上展开，避免被表格横向滚动容器/卡片 overflow 裁切
                const openUp = dramas.length > 2 && idx >= dramas.length - 2;
                return (
                  <tr key={drama.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {drama.cover ? (
                            <img src={drama.cover} alt={drama.name} className="w-full h-full object-cover" />
                          ) : (
                            <Film className="w-4 h-4 text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => onViewDetail(drama)}
                            className="text-sm text-gray-900 truncate hover:underline text-left"
                            style={{ fontWeight: 600 }}
                          >
                            {drama.name}
                          </button>
                          <p className="text-xs text-gray-400 mt-0.5 font-mono">{drama.id}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {fmt(t.episodesUploaded, { done: epDone, total: drama.episodes })} ·{" "}
                            {t.channels[drama.channel]}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {drama.countries.map((c) => {
                          const country = COUNTRIES.find((x) => x.value === c);
                          return country ? (
                            <span
                              key={c}
                              className="text-sm"
                              title={t.countries[c as keyof typeof t.countries]}
                            >
                              {country.flag}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{
                          background: drama.distribution === "full" ? "#FFF1F2" : "#F3F4F6",
                          color: drama.distribution === "full" ? "#E8192C" : "#374151",
                          fontWeight: 500,
                        }}
                      >
                        {distLabel}
                      </span>
                    </td>
                    {/* 审核状态 */}
                    <td className="px-4 py-4">
                      {drama.status === "reviewing" ? (
                        <span
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs w-fit"
                          style={{ background: "#FFF7ED", color: "#EA580C", fontWeight: 500 }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                          {t.reviewReviewing}
                        </span>
                      ) : (
                        <span
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs w-fit"
                          style={{ background: "#F0FDF4", color: "#16A34A", fontWeight: 500 }}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {t.reviewApproved}
                        </span>
                      )}
                    </td>
                    {/* 上架状态 */}
                    <td className="px-4 py-4">
                      {drama.status === "reviewing" ? (
                        <span className="text-xs text-gray-300">—</span>
                      ) : (
                        <span
                          className="px-2.5 py-1 rounded-full text-xs"
                          style={{ background: stStyle.bg, color: stStyle.color, fontWeight: 500 }}
                        >
                          {dramaStatusLabel(drama.status, t)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-gray-600">
                        {drama.copyright === "self" ? t.copyrightSelf : t.copyrightLicensed}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="px-2 py-0.5 rounded text-xs"
                        style={{
                          background: drama.revenueType === "full" ? "#FFF1F2" : "#EFF6FF",
                          color: drama.revenueType === "full" ? "#E8192C" : "#3B82F6",
                          fontWeight: 500,
                        }}
                      >
                        {revenueLabel}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative" ref={isOpen ? menuRef : undefined}>
                        <button
                          onClick={() => setActionMenuId(isOpen ? null : drama.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {isOpen && (
                          <div
                            className={`absolute right-0 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden ${
                              openUp ? "bottom-full mb-1" : "top-full mt-1"
                            }`}
                          >
                            {drama.status === "reviewing" && (
                              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border-b border-amber-100">
                                <AlertCircle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                                <span className="text-[10px] text-amber-600" style={{ fontWeight: 500 }}>
                                  {t.actionReviewLocked}
                                </span>
                              </div>
                            )}
                            <button
                              onClick={() => {
                                onViewDetail(drama);
                                setActionMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left text-gray-700 hover:bg-gray-50"
                              style={{ fontWeight: 500 }}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              {t.actionViewDetail}
                            </button>
                            <button
                              onClick={() => {
                                onManageEpisodes(drama);
                                setActionMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left text-gray-700 hover:bg-gray-50"
                              style={{ fontWeight: 500 }}
                            >
                              <Video className="w-3.5 h-3.5" />
                              {t.actionEpisodes}
                            </button>
                            {drama.status !== "reviewing" && (
                              <>
                                <div className="h-px bg-gray-100 mx-3" />
                                <button
                                  onClick={() => {
                                    onToggleStatus(drama);
                                    setActionMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left text-gray-700 hover:bg-gray-50"
                                  style={{ fontWeight: 500 }}
                                >
                                  {drama.status === "online" ? (
                                    <>
                                      <EyeOff className="w-3.5 h-3.5" />
                                      {t.actionTakeOffline}
                                    </>
                                  ) : drama.status === "not_published" ? (
                                    <>
                                      <Eye className="w-3.5 h-3.5" />
                                      {t.actionPublishNow}
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-3.5 h-3.5" />
                                      {t.actionRepublish}
                                    </>
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <Film className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400">{t.emptyTitle}</p>
                    <button
                      onClick={onUpload}
                      className="mt-1 px-5 py-2 rounded-lg text-white text-xs hover:opacity-90"
                      style={{ background: "#111111", fontWeight: 600 }}
                    >
                      {t.uploadNow}
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};
