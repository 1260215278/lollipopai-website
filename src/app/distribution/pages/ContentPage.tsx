import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useI18n } from "../../i18n";
import {
  fetchCourseList,
  fetchCourseDetail,
  setShelf,
  type PublisherCourseRow,
  type CourseDetail,
} from "../../services/content";
import { DramaListView } from "../components/content/DramaListView";
import { DramaDetailView } from "../components/content/DramaDetailView";
import { EpisodesView } from "../components/content/EpisodesView";
import { UploadForm } from "../components/content/UploadForm";

type View = "list" | "form" | "detail" | "episodes";

/** 上剧列表每页条数（bug20） */
const PAGE_SIZE = 12;

interface EpisodesCtx {
  courseId: number;
  title: string;
  plannedEpisodes: number;
  backTo: "list" | "detail";
}

/**
 * 上剧中心。单页内切换：列表 → 详情 → 上剧流程 → 剧集视频。
 * 全量对接 /publisher/course/**（services/content）。
 */
export function ContentPage() {
  const { messages } = useI18n();
  const t = messages.distribution.content;

  const [view, setView] = useState<View>("list");
  const [dramas, setDramas] = useState<PublisherCourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  // 分页（bug20）：每页 12 条，与产品「上传 12 个后需翻页」一致
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const [detail, setDetail] = useState<CourseDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [episodesCtx, setEpisodesCtx] = useState<EpisodesCtx | null>(null);
  const [confirmOffline, setConfirmOffline] = useState<PublisherCourseRow | null>(null);

  const loadList = useCallback(async (keyword: string, pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetchCourseList({ keyword, page: pageNum, limit: PAGE_SIZE });
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
  }, [searchQuery]);

  // 按当前页 + 搜索词加载（搜索防抖 300ms）
  useEffect(() => {
    const id = setTimeout(() => {
      void loadList(searchQuery, page);
    }, 300);
    return () => clearTimeout(id);
  }, [searchQuery, page, loadList]);

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
      backTo: "list",
    });
    setView("episodes");
  };

  const openEpisodesFromDetail = (cd: CourseDetail) => {
    setEpisodesCtx({
      courseId: cd.courseId,
      title: cd.title,
      plannedEpisodes: cd.progress.plannedEpisodes,
      backTo: "detail",
    });
    setView("episodes");
  };

  const handleToggleShelf = (d: PublisherCourseRow) => {
    if (d.shelfStatus === 1) {
      setConfirmOffline(d);
    } else {
      void setShelf(d.courseId, true).then(() => loadList(searchQuery, page));
    }
  };

  const doConfirmOffline = async () => {
    if (!confirmOffline) return;
    await setShelf(confirmOffline.courseId, false).catch(() => undefined);
    setConfirmOffline(null);
    void loadList(searchQuery, page);
  };

  /* ── 视图分发 ── */
  if (view === "form") {
    return (
      <UploadForm
        t={t}
        onCancel={() => setView("list")}
        onSubmitted={() => {
          setView("list");
          void loadList(searchQuery, page);
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
        onBack={() => setView(episodesCtx.backTo)}
        onChanged={() => void loadList(searchQuery, page)}
      />
    );
  }

  return (
    <>
      <DramaListView
        t={t}
        dramas={dramas}
        loading={loading}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
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
