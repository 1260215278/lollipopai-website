import { useCallback, useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useI18n } from "../../i18n";
import {
  fetchDramaList,
  fetchEpisodes,
  createDrama,
  setDramaStatus,
} from "../../services/content";
import type { DramaRow, EpisodeRecord, CreateDramaInput } from "../components/content/types";
import { DramaListView } from "../components/content/DramaListView";
import { DramaDetailView } from "../components/content/DramaDetailView";
import { EpisodesView } from "../components/content/EpisodesView";
import { UploadForm } from "../components/content/UploadForm";

type View = "list" | "form" | "detail" | "episodes";

/**
 * 上剧中心（figma 多 node）。单页内切换：列表 → 详情 → 上剧流程 → 剧集视频。
 * 数据走 services/content（mock + VITE_USE_MOCK 开关），可点击演示闭环：
 * 列表 → 详情 → 上剧(基本信息→上传剧集→发布配置→上剧成功回列表) → 下架 → 国家收费规则弹窗。
 */
export function ContentPage() {
  const { messages } = useI18n();
  const t = messages.distribution.content;

  const [view, setView] = useState<View>("list");
  const [dramas, setDramas] = useState<DramaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<DramaRow | null>(null);
  const [selectedEpisodes, setSelectedEpisodes] = useState<EpisodeRecord[]>([]);
  /** 各剧已上传集数缓存（列表展示 "M/N集已上传"） */
  const [uploadedCounts, setUploadedCounts] = useState<Record<string, number>>({});
  const [confirmOfflineId, setConfirmOfflineId] = useState<string | null>(null);

  const loadList = useCallback(
    async (keyword: string) => {
      setLoading(true);
      try {
        const list = await fetchDramaList({ keyword });
        setDramas(list);
        // 列表已自带 uploadedEpisodes；用其作为计数兜底（精确计数在进入详情/剧集页时刷新）
        setUploadedCounts((prev) => {
          const next = { ...prev };
          list.forEach((d) => {
            if (next[d.id] === undefined) next[d.id] = d.uploadedEpisodes;
          });
          return next;
        });
      } catch {
        // service 已 toast
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadList("");
  }, [loadList]);

  // 搜索防抖（mock 也走 service，保持开关一致）
  useEffect(() => {
    const id = setTimeout(() => {
      void loadList(searchQuery);
    }, 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const openDetail = async (d: DramaRow) => {
    setSelected(d);
    const eps = await fetchEpisodes(d.id).catch(() => [] as EpisodeRecord[]);
    setSelectedEpisodes(eps);
    setUploadedCounts((prev) => ({ ...prev, [d.id]: eps.filter((e) => e.status === "uploaded").length }));
    setView("detail");
  };

  const openEpisodes = async (d: DramaRow) => {
    setSelected(d);
    const eps = await fetchEpisodes(d.id).catch(() => [] as EpisodeRecord[]);
    setSelectedEpisodes(eps);
    setView("episodes");
  };

  const handleToggleStatus = (d: DramaRow) => {
    if (d.status === "online") {
      setConfirmOfflineId(d.id);
    } else {
      void setDramaStatus(d.id, "online").then(() => loadList(searchQuery));
    }
  };

  const confirmOffline = async () => {
    if (!confirmOfflineId) return;
    await setDramaStatus(confirmOfflineId, "offline").catch(() => undefined);
    setConfirmOfflineId(null);
    void loadList(searchQuery);
  };

  const handleSubmitCreate = async (input: CreateDramaInput) => {
    await createDrama(input);
    setView("list");
    await loadList(searchQuery);
  };

  const handleEpisodesUpdated = (eps: EpisodeRecord[]) => {
    setSelectedEpisodes(eps);
    if (selected) {
      setUploadedCounts((prev) => ({
        ...prev,
        [selected.id]: eps.filter((e) => e.status === "uploaded").length,
      }));
    }
  };

  /* ── 视图分发 ── */
  if (view === "form") {
    return <UploadForm t={t} onCancel={() => setView("list")} onSubmit={handleSubmitCreate} />;
  }
  if (view === "detail" && selected) {
    return (
      <DramaDetailView
        t={t}
        drama={selected}
        episodes={selectedEpisodes}
        onBack={() => setView("list")}
        onManageEpisodes={() => void openEpisodes(selected)}
      />
    );
  }
  if (view === "episodes" && selected) {
    return (
      <EpisodesView
        t={t}
        drama={selected}
        episodes={selectedEpisodes}
        onBack={() => setView("detail")}
        onUpdated={handleEpisodesUpdated}
      />
    );
  }

  return (
    <>
      <DramaListView
        t={t}
        dramas={dramas}
        loading={loading}
        uploadedCounts={uploadedCounts}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onUpload={() => setView("form")}
        onViewDetail={(d) => void openDetail(d)}
        onManageEpisodes={(d) => void openEpisodes(d)}
        onToggleStatus={handleToggleStatus}
      />

      {/* 下架确认弹窗（figma 15294-423） */}
      {confirmOfflineId && (
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
                  onClick={() => setConfirmOfflineId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={() => void confirmOffline()}
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
