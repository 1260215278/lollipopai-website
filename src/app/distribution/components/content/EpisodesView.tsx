import React, { useState, useRef } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Search,
  Upload,
  Film,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { ContentMessages } from "../../i18n/content";
import { uploadFile } from "../../../services/upload";
import { submitEpisodeUploads, type EpisodeUploadMeta } from "../../../services/content";
import type { DramaRow, EpisodeRecord } from "./types";
import { epStatusStyle, epStatusLabel, readVideoDuration, fmt } from "./shared";

interface EpisodesViewProps {
  t: ContentMessages;
  drama: DramaRow;
  episodes: EpisodeRecord[];
  onBack: () => void;
  /** 提交成功后回传最新剧集列表，供上层刷新计数 */
  onUpdated: (eps: EpisodeRecord[]) => void;
}

/** 本地行：在已有记录上叠加「待提交」的新文件 */
interface Row extends EpisodeRecord {
  newFile: File | null;
  newDuration: string;
  fileRef: React.RefObject<HTMLInputElement | null>;
}

/** 剧集视频管理（figma 15081-23236）。视频经 uploadFile 上传，提交转为转码中。 */
export const EpisodesView: React.FC<EpisodesViewProps> = ({
  t,
  drama,
  episodes,
  onBack,
  onUpdated,
}) => {
  const [rows, setRows] = useState<Row[]>(() =>
    Array.from({ length: drama.episodes }, (_, i) => {
      const found = episodes.find((e) => e.ep === i + 1);
      return {
        ep: i + 1,
        title: found?.title || t.epLabelN.replace("{ep}", String(i + 1)),
        duration: found?.duration || "—",
        size: found?.size || "—",
        uploadedAt: found?.uploadedAt || "—",
        status: found?.status || "failed",
        newFile: null,
        newDuration: "",
        fileRef: React.createRef<HTMLInputElement>(),
      };
    }),
  );
  const [searchEp, setSearchEp] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const filtered = rows.filter((e) => String(e.ep).includes(searchEp) || e.title.includes(searchEp));
  const uploadedCount = rows.filter((e) => e.status === "uploaded").length;
  const processingCount = rows.filter((e) => e.status === "processing").length;
  const failedCount = rows.filter((e) => e.status === "failed").length;
  const pendingCount = rows.filter((e) => e.newFile).length;

  const handleFileSelect = (ep: number, file: File) => {
    setRows((prev) => prev.map((e) => (e.ep === ep ? { ...e, newFile: file, newDuration: "" } : e)));
    void readVideoDuration(file).then((dur) =>
      setRows((prev) => prev.map((e) => (e.ep === ep ? { ...e, newDuration: dur } : e))),
    );
  };

  const clearFile = (ep: number) =>
    setRows((prev) => prev.map((e) => (e.ep === ep ? { ...e, newFile: null, newDuration: "" } : e)));

  const handleSave = async () => {
    const pending = rows.filter((e) => e.newFile);
    if (pending.length === 0) return;
    setSaving(true);
    try {
      // 逐个上传视频文件拿到 URL（统一走 uploadFile）
      const metas: EpisodeUploadMeta[] = [];
      for (const r of pending) {
        const url = await uploadFile(r.newFile as File);
        metas.push({
          ep: r.ep,
          videoUrl: url,
          size: `${((r.newFile as File).size / 1024 / 1024).toFixed(1)} MB`,
          duration: r.newDuration || "—",
        });
      }
      const updated = await submitEpisodeUploads(drama.id, metas);
      // 用服务端返回的最新列表重建行状态
      setRows((prev) =>
        prev.map((e) => {
          const fresh = updated.find((u) => u.ep === e.ep);
          return fresh ? { ...e, ...fresh, newFile: null, newDuration: "" } : e;
        }),
      );
      onUpdated(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // uploadFile / http 已 toast；保留待提交状态以便重试
      toast.error(t.videoUploadFailed);
    } finally {
      setSaving(false);
    }
  };

  const cols = [t.colEp, t.colEpTitle, t.colDuration, t.colSize, t.epColUploadDate, t.colStatus, t.colActions];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: "1.0625rem" }}>
              {t.episodesTitle}
            </h2>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-sm text-gray-500">{drama.name}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {fmt(t.episodesBreadcrumbCount, { total: drama.episodes, done: uploadedCount })}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {saved && (
            <div className="flex items-center gap-1.5 text-xs text-green-600" style={{ fontWeight: 500 }}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t.epSaved}
            </div>
          )}
          {pendingCount > 0 && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs hover:opacity-90 disabled:opacity-60"
              style={{ background: "#111111", fontWeight: 600 }}
            >
              {saving ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {t.epUploading}
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  {fmt(t.epSubmitN, { n: pendingCount })}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 mb-5">
        {[
          { icon: <CheckCircle2 className="w-3.5 h-3.5" />, count: uploadedCount, label: t.epStatusUploaded, color: "#16A34A", bg: "#F0FDF4" },
          { icon: <Clock className="w-3.5 h-3.5" />, count: processingCount, label: t.statProcessing, color: "#EA580C", bg: "#FFF7ED" },
          { icon: <AlertCircle className="w-3.5 h-3.5" />, count: failedCount, label: t.epStatusFailed, color: "#EF4444", bg: "#FEF2F2" },
          { icon: <Upload className="w-3.5 h-3.5" />, count: pendingCount, label: t.statPendingSubmit, color: "#6366F1", bg: "#EEF2FF" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl" style={{ background: item.bg }}>
            <span style={{ color: item.color }}>{item.icon}</span>
            <div>
              <span className="text-sm" style={{ fontWeight: 800, color: item.color }}>
                {item.count}
              </span>
              <span className="text-xs ml-1.5" style={{ color: item.color }}>
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={searchEp}
              onChange={(e) => setSearchEp(e.target.value)}
              placeholder={t.episodesSearchPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-white outline-none focus:border-gray-400 transition-colors"
            />
          </div>
          <span className="text-xs text-gray-400 ml-auto">{fmt(t.episodesResultCount, { n: filtered.length })}</span>
        </div>

        <div className="grid grid-cols-[64px_1fr_120px_120px_130px_120px_200px] gap-3 px-5 py-2.5 bg-gray-50/60 border-b border-gray-100">
          {cols.map((col, i) => (
            <span key={i} className="text-xs text-gray-500" style={{ fontWeight: 500 }}>
              {col}
            </span>
          ))}
        </div>

        <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
          {filtered.map((ep) => {
            const st = epStatusStyle[ep.status];
            return (
              <div
                key={ep.ep}
                className={`grid grid-cols-[64px_1fr_120px_120px_130px_120px_200px] gap-3 items-center px-5 py-3 transition-colors ${
                  ep.newFile ? "bg-indigo-50/40" : "hover:bg-gray-50/50"
                }`}
              >
                <div className="flex items-center justify-center h-8 rounded-lg bg-gray-100 flex-shrink-0">
                  <span className="text-xs text-gray-700" style={{ fontWeight: 700 }}>
                    {t.epLabelN.replace("{ep}", String(ep.ep))}
                  </span>
                </div>
                <span className="text-sm text-gray-800 truncate" style={{ fontWeight: 500 }}>
                  {ep.title}
                </span>
                <span className="text-xs text-gray-500">{ep.newFile ? ep.newDuration || t.readingDuration : ep.duration}</span>
                <span className="text-xs text-gray-500">
                  {ep.newFile ? `${(ep.newFile.size / 1024 / 1024).toFixed(1)} MB` : ep.size}
                </span>
                <span className="text-xs text-gray-500">{ep.uploadedAt}</span>
                <div className="flex items-center gap-1.5" style={{ color: st.color }}>
                  {st.icon}
                  <span className="text-xs" style={{ fontWeight: 500 }}>
                    {epStatusLabel(ep.status, t)}
                  </span>
                  {ep.newFile && (
                    <span
                      className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-indigo-100 text-indigo-600"
                      style={{ fontWeight: 600 }}
                    >
                      {t.epStatusNew}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={ep.fileRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileSelect(ep.ep, e.target.files[0]);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />
                  {ep.newFile ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Film className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span className="text-xs text-indigo-700 truncate flex-1" style={{ fontWeight: 500 }}>
                        {ep.newFile.name}
                      </span>
                      <button
                        onClick={() => clearFile(ep.ep)}
                        className="text-gray-400 hover:text-red-500 flex-shrink-0 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => ep.fileRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed text-xs transition-all"
                      style={{
                        borderColor: ep.status === "failed" ? "#EF4444" : "#D1D5DB",
                        color: ep.status === "failed" ? "#EF4444" : "#6B7280",
                        fontWeight: 500,
                      }}
                    >
                      <Upload className="w-3 h-3" />
                      {ep.status === "uploaded"
                        ? t.epActionReplace
                        : ep.status === "failed"
                          ? t.epActionRetry
                          : t.epActionUpload}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
          <span className="text-xs text-gray-500">{fmt(t.epTotalCount, { total: drama.episodes })}</span>
          {pendingCount > 0 && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs hover:opacity-90 disabled:opacity-60"
              style={{ background: "#111111", fontWeight: 600 }}
            >
              {saving ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {t.epUploading}
                </>
              ) : (
                fmt(t.epSubmitNVideos, { n: pendingCount })
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
