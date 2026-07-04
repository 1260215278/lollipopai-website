import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useOutletContext } from "react-router";
import { useI18n } from "../../i18n";
import type { DistributionOutletContext } from "../DistributionLayout";
import {
  fetchCourseList,
  fetchCourseStats,
  fetchCourseDetail,
  setShelf,
  type PublisherCourseRow,
  type CourseDetail,
  type CourseStats,
} from "../../services/content";
import { getLanguageTypeList, type LanguageOption } from "../../services/language";
import { DramaListView } from "../components/content/DramaListView";
import { DramaDetailView } from "../components/content/DramaDetailView";
import { EpisodesView } from "../components/content/EpisodesView";
import { UploadForm } from "../components/content/UploadForm";

type View = "list" | "form" | "detail" | "episodes";
type ListFilter = "all" | "onShelf" | "auditing" | "offShelf";

/** 上剧列表每页条数（bug20） */
const PAGE_SIZE = 12;

interface EpisodesCtx {
  courseId: number;
  title: string;
  plannedEpisodes: number;
  auditStatus: number;
  backTo: "list" | "detail";
}

/**
 * 上剧中心。单页内切换：列表 → 详情 → 上剧流程 → 剧集视频。
 * 全量对接 /publisher/course/**（services/content）。
 */
export function ContentPage() {
  const { messages } = useI18n();
  const { currentMember } = useOutletContext<DistributionOutletContext>();
  const t = messages.distribution.content;
  const canManageCourse = currentMember?.role !== 3;

  const [view, setView] = useState<View>("list");
  const [dramas, setDramas] = useState<PublisherCourseRow[]>([]);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<ListFilter>("all");
  // 分页（bug20）：每页 12 条，与产品「上传 12 个后需翻页」一致
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const [detail, setDetail] = useState<CourseDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [episodesCtx, setEpisodesCtx] = useState<EpisodesCtx | null>(null);
  const [confirmOffline, setConfirmOffline] = useState<PublisherCourseRow | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setStats(await fetchCourseStats());
    } catch {
      setStats(null);
    }
  }, []);

  const loadList = useCallback(async (keyword: string, pageNum: number, currentFilter: ListFilter) => {
    setLoading(true);
    try {
      const res = await fetchCourseList({
        keyword,
        page: pageNum,
        limit: PAGE_SIZE,
        auditStatus: currentFilter === "auditing" ? 1 : undefined,
        shelfStatus: currentFilter === "onShelf" ? 1 : currentFilter === "offShelf" ? 2 : undefined,
      });
      setDramas(res.list);
      setTotalPage(res.totalPage > 0 ? res.totalPage : 1);
    } catch {
      // service 已 toast
    } finally {
      setLoading(false);
    }
  }, []);

  // 搜索词变化回到第 1 页
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filter]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    void getLanguageTypeList()
      .then(setLanguages)
      .catch(() => setLanguages([]));
  }, []);

  useEffect(() => {
    if (!canManageCourse && view === "form") setView("list");
  }, [canManageCourse, view]);

  // 按当前页 + 搜索词加载（搜索防抖 300ms）
  useEffect(() => {
    const id = setTimeout(() => {
      void loadList(searchQuery, page, filter);
    }, 300);
    return () => clearTimeout(id);
  }, [searchQuery, page, filter, loadList]);

  const openDetail = async (d: PublisherCourseRow) => {
    setView("detail");
    setDetail(null);
    setDetailLoading(true);
    try {
      const data = await fetchCourseDetail(d.courseId);
      setDetail(data);
    } catch {
      setView("list");
    } finally {
      setDetailLoading(false);
    }
  };

  const openEpisodes = (d: PublisherCourseRow) => {
    setEpisodesCtx({
      courseId: d.courseId,
      title: d.title,
      plannedEpisodes: d.plannedEpisodes,
      auditStatus: d.auditStatus,
      backTo: "list",
    });
    setView("episodes");
  };

  const openEpisodesFromDetail = (cd: CourseDetail) => {
    setEpisodesCtx({
      courseId: cd.courseId,
      title: cd.title,
      plannedEpisodes: cd.progress.plannedEpisodes,
      auditStatus: cd.auditStatus,
      backTo: "detail",
    });
    setView("episodes");
  };

  const handleToggleShelf = (d: PublisherCourseRow) => {
    if (!canManageCourse) return;
    if (d.shelfStatus === 1) {
      setConfirmOffline(d);
    } else {
      void setShelf(d.courseId, true).then(() => {
        void loadStats();
        void loadList(searchQuery, page, filter);
      });
    }
  };

  const doConfirmOffline = async () => {
    if (!confirmOffline || !canManageCourse) return;
    await setShelf(confirmOffline.courseId, false).catch(() => undefined);
    setConfirmOffline(null);
    void loadStats();
    void loadList(searchQuery, page, filter);
  };

  /* ── 视图分发 ── */
  if (view === "form" && canManageCourse) {
    return (
      <UploadForm
        t={t}
        onCancel={() => setView("list")}
        onSubmitted={() => {
          setView("list");
          void loadStats();
          void loadList(searchQuery, page, filter);
        }}
      />
    );
  }

  if (view === "detail") {
    if (detailLoading || !detail) {
      return (
        <div className="p-8 flex items-center justify-center py-32 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      );
    }
    return (
      <DramaDetailView
        t={t}
        detail={detail}
        languages={languages}
        canManageCourse={canManageCourse}
        onBack={() => setView("list")}
        onManageEpisodes={() => openEpisodesFromDetail(detail)}
      />
    );
  }

  if (view === "episodes" && episodesCtx) {
    return (
      <EpisodesView
        t={t}
        courseId={episodesCtx.courseId}
        title={episodesCtx.title}
        plannedEpisodes={episodesCtx.plannedEpisodes}
        auditStatus={episodesCtx.auditStatus}
        canManageCourse={canManageCourse}
        onBack={() => setView(episodesCtx.backTo)}
        onChanged={() => {
          void loadStats();
          void loadList(searchQuery, page, filter);
        }}
      />
    );
  }

  return (
    <>
      <DramaListView
        t={t}
        dramas={dramas}
        stats={stats}
        languages={languages}
        filter={filter}
        onFilterChange={setFilter}
        loading={loading}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        canManageCourse={canManageCourse}
        onUpload={() => setView("form")}
        onViewDetail={(d) => void openDetail(d)}
        onManageEpisodes={(d) => openEpisodes(d)}
        onToggleShelf={handleToggleShelf}
        page={page}
        totalPage={totalPage}
        onPageChange={setPage}
      />

      {/* 下架确认弹窗（img_16） */}
      {confirmOffline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="p-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-gray-900 mb-2" style={{ fontWeight: 700, fontSize: "1rem" }}>
                {t.offlineConfirmTitle}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">{t.offlineConfirmDesc}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmOffline(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={() => void doConfirmOffline()}
                  className="flex-1 py-2.5 rounded-xl text-sm text-white transition-colors hover:opacity-90"
                  style={{ background: "#111111", fontWeight: 600 }}
                >
                  {t.offlineConfirmOk}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
