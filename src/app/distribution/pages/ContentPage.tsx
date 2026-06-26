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

  const [detail, setDetail] = useState<CourseDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [episodesCtx, setEpisodesCtx] = useState<EpisodesCtx | null>(null);
  const [confirmOffline, setConfirmOffline] = useState<PublisherCourseRow | null>(null);

  const loadList = useCallback(async (keyword: string) => {
    setLoading(true);
    try {
      const page = await fetchCourseList({ keyword });
      setDramas(page.list);
    } catch {
      // service 已 toast
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadList("");
  }, [loadList]);

  // 搜索防抖
  useEffect(() => {
    const id = setTimeout(() => {
      void loadList(searchQuery);
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

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
      void setShelf(d.courseId, true).then(() => loadList(searchQuery));
    }
  };

  const doConfirmOffline = async () => {
    if (!confirmOffline) return;
    await setShelf(confirmOffline.courseId, false).catch(() => undefined);
    setConfirmOffline(null);
    void loadList(searchQuery);
  };

  /* ── 视图分发 ── */
  if (view === "form") {
    return (
      <UploadForm
        t={t}
        onCancel={() => setView("list")}
        onSubmitted={() => {
          setView("list");
          void loadList(searchQuery);
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
        onChanged={() => void loadList(searchQuery)}
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
