import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Film,
  MoreHorizontal,
  FileText,
  Video,
  EyeOff,
  Eye,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import type { ContentMessages } from "../../i18n/content";
import type { PublisherCourseRow } from "./types";
import {
  auditStatusStyle,
  auditStatusLabel,
  shelfStatusStyle,
  shelfStatusLabel,
  genderChannelKey,
  fmt,
} from "./shared";

interface DramaListViewProps {
  t: ContentMessages;
  dramas: PublisherCourseRow[];
  loading: boolean;
  searchQuery: string;
  onSearch: (v: string) => void;
  onUpload: () => void;
  onViewDetail: (d: PublisherCourseRow) => void;
  onManageEpisodes: (d: PublisherCourseRow) => void;
  /** 上架/下架（仅 auditStatus=2 可点）；下架的确认弹窗由上层处理 */
  onToggleShelf: (d: PublisherCourseRow) => void;
}

/** 短剧列表（img_1 / img_9）。表格 + 行内操作菜单。 */
export const DramaListView: React.FC<DramaListViewProps> = ({
  t,
  dramas,
  loading,
  searchQuery,
  onSearch,
  onUpload,
  onViewDetail,
  onManageEpisodes,
  onToggleShelf,
}) => {
  // 操作菜单：用 fixed 定位 + portal 渲染到 body，避免被表格的 overflow-x-auto / 卡片 overflow-hidden 裁切
  const [menu, setMenu] = useState<{ id: number; rect: DOMRect } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      // 点击菜单内部或触发按钮（带 data-action-trigger）时不关闭
      if (menuRef.current?.contains(target)) return;
      if ((target as HTMLElement).closest?.("[data-action-trigger]")) return;
      setMenu(null);
    };
    document.addEventListener("mousedown", onPointer);
    // fixed 坐标会随滚动/缩放失效，发生时直接关闭
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [menu]);

  const columns = [
    t.colDramaInfo,
    t.colLanguage,
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
                dramas.map((drama) => {
                  const isApproved = drama.auditStatus === 2;
                  const isReviewing = drama.auditStatus === 1;
                  const onShelf = drama.shelfStatus === 1;
                  const distLabel = drama.publishScope === 2 ? t.distFull : t.distAccount;
                  const auStyle = auditStatusStyle[drama.auditStatus] ?? { bg: "#F3F4F6", color: "#6B7280" };
                  const shStyle = shelfStatusStyle[drama.shelfStatus] ?? { bg: "#F3F4F6", color: "#9CA3AF" };
                  const isOpen = menu?.id === drama.courseId;
                  return (
                    <tr
                      key={drama.courseId}
                      className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {drama.titleImg ? (
                              <img src={drama.titleImg} alt={drama.title} className="w-full h-full object-cover" />
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
                              {drama.title}
                            </button>
                            <p className="text-xs text-gray-400 mt-0.5 font-mono">{drama.dramaNo}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {fmt(t.episodesUploaded, {
                                done: drama.uploadedEpisodes,
                                total: drama.plannedEpisodes,
                              })}{" "}
                              · {t.channels[genderChannelKey(drama.genderType)]}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-gray-600">{drama.languageName || drama.languageType}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{
                            background: drama.publishScope === 2 ? "#FFF1F2" : "#F3F4F6",
                            color: drama.publishScope === 2 ? "#E8192C" : "#374151",
                            fontWeight: 500,
                          }}
                        >
                          {distLabel}
                        </span>
                      </td>
                      {/* 审核状态（驳回时附后端驳回原因 auditRemark） */}
                      <td className="px-4 py-4">
                        <span
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs w-fit"
                          style={{ background: auStyle.bg, color: auStyle.color, fontWeight: 500 }}
                        >
                          {isReviewing && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                          )}
                          {/* 已通过：附绿色 ✓ 图标（对齐 figma 15293-178，色值随 auditStatusStyle[2] 的 #16A34A） */}
                          {isApproved && <CheckCircle2 className="w-3 h-3" />}
                          {auditStatusLabel(drama.auditStatus, t)}
                        </span>
                        {drama.auditStatus === 3 && drama.auditRemark && (
                          <p
                            className="mt-1.5 text-[11px] text-red-500 leading-snug max-w-[180px] line-clamp-2"
                            title={drama.auditRemark}
                          >
                            {drama.auditRemark}
                          </p>
                        )}
                      </td>
                      {/* 上架状态（仅审核通过显示） */}
                      <td className="px-4 py-4">
                        {isApproved ? (
                          <span
                            className="px-2.5 py-1 rounded-full text-xs"
                            style={{ background: shStyle.bg, color: shStyle.color, fontWeight: 500 }}
                          >
                            {shelfStatusLabel(drama.shelfStatus, t)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-gray-600">
                          {drama.copyrightType === 1 ? t.copyrightSelf : t.copyrightLicensed}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className="px-2 py-0.5 rounded text-xs"
                          style={{
                            background: drama.publishScope === 2 ? "#FFF1F2" : "#EFF6FF",
                            color: drama.publishScope === 2 ? "#E8192C" : "#3B82F6",
                            fontWeight: 500,
                          }}
                        >
                          {drama.publishScope === 2 ? t.revenueFullShort : t.revenueAccountShort}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="relative">
                          <button
                            data-action-trigger
                            onClick={(e) =>
                              setMenu(
                                isOpen
                                  ? null
                                  : {
                                      id: drama.courseId,
                                      rect: e.currentTarget.getBoundingClientRect(),
                                    },
                              )
                            }
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {isOpen &&
                            menu &&
                            createPortal(
                              (() => {
                                const MENU_W = 192; // w-48
                                const gap = 6;
                                const left = Math.max(8, Math.min(menu.rect.right - MENU_W, window.innerWidth - MENU_W - 8));
                                // 下方空间不足则向上展开
                                const openUp = window.innerHeight - menu.rect.bottom < 260;
                                const posStyle: React.CSSProperties = openUp
                                  ? { bottom: window.innerHeight - menu.rect.top + gap }
                                  : { top: menu.rect.bottom + gap };
                                return (
                                  <div
                                    ref={menuRef}
                                    className="fixed bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                                    style={{ left, width: MENU_W, ...posStyle }}
                                  >
                                    {isReviewing && (
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
                                  setMenu(null);
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
                                  setMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left text-gray-700 hover:bg-gray-50"
                                style={{ fontWeight: 500 }}
                              >
                                <Video className="w-3.5 h-3.5" />
                                {t.actionEpisodes}
                              </button>
                              {isApproved && (
                                <>
                                  <div className="h-px bg-gray-100 mx-3" />
                                  <button
                                    onClick={() => {
                                      onToggleShelf(drama);
                                      setMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left text-gray-700 hover:bg-gray-50"
                                    style={{ fontWeight: 500 }}
                                  >
                                    {onShelf ? (
                                      <>
                                        <EyeOff className="w-3.5 h-3.5" />
                                        {t.actionTakeOffline}
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="w-3.5 h-3.5" />
                                        {drama.shelfStatus === 2 ? t.actionRepublish : t.actionPublishNow}
                                      </>
                                    )}
                                  </button>
                                </>
                              )}
                                  </div>
                                );
                              })(),
                              document.body,
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
