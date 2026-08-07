import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Search,
  Upload,
  Film,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import type { ContentMessages } from "../../i18n/content";
import { uploadFile, PUBLISHER_UPLOAD_PATH } from "../../../services/upload";
import { AuditStatus, deleteEpisode, downloadUploadTemplate, fetchEpisodes, saveEpisode, type EpisodesResponse } from "../../../services/content";
import { ApiError } from "../../../services/http";
import {
  uploadStatusStyle,
  uploadStatusLabel,
  readVideoDuration,
  formatBytes,
  formatDuration,
  fileNameFromUrl,
  fmt,
  VIDEO_ACCEPT,
  VIDEO_MAX,
  EPISODE_TITLE_LIMIT,
} from "./shared";
import { parseEpisodeTemplate } from "./episodeTemplate";

interface EpisodesViewProps {
  t: ContentMessages;
  courseId: number;
  title: string;
  plannedEpisodes: number;
  auditStatus: number;
  canUploadCourse?: boolean;
  onBack: () => void;
  /** 保存成功后通知上层刷新列表计数 */
  onChanged?: () => void;
}

/** 行：服务端集 + 本地待提交文件 */
interface Row {
  episodeNo: number;
  title: string;
  /** 0 待提交（无行）/ 1 已上传 / 2 上传失败 */
  uploadStatus: number;
  /** 转码状态 0未转码/1转码中/2已完成/3失败（20260707 item 8） */
  vodStatus?: number;
  /** 是否可播放（vodStatus===2）；false 时按 vodStatus 展示转码中/转码失败 */
  playable?: boolean;
  /** 转码失败原因（vodStatus===3 时有值，如外链 URL 不可达） */
  transcodeMsg?: string | null;
  videoDuration: number;
  videoSize: number;
  videoUrl: string;
  fileName: string;
  uploadDate?: string;
  newFile: File | null;
  newDuration: string;
  /** 当前本地文件的切片上传进度；null 表示未在上传。 */
  uploadProgress: number | null;
  fileRef: React.RefObject<HTMLInputElement | null>;
}

type PendingFileState = Pick<Row, "title" | "newFile" | "newDuration">;

/**
 * 剧集视频管理（img_10）。
 * 列表来自 GET /publisher/course/episodes（仅已建行的集）；未建行的集号按 plannedEpisodes
 * 补「待提交」虚拟行。上传走 /publisher/course/upload/* 切片协议 → saveEpisode（同 episodeNo 覆盖）。
 * 状态列在已上传但 playable=false 时按 vodStatus 展示转码中/转码失败（20260707 item 8）。
 */
export const EpisodesView: React.FC<EpisodesViewProps> = ({
  t,
  courseId,
  title,
  plannedEpisodes,
  auditStatus,
  canUploadCourse = true,
  onBack,
  onChanged,
}) => {
  const [data, setData] = useState<EpisodesResponse | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEp, setSearchEp] = useState("");
  const [debouncedSearchEp, setDebouncedSearchEp] = useState("");
  const [saving, setSaving] = useState(false);
  const [templateDownloading, setTemplateDownloading] = useState(false);
  const [templateImporting, setTemplateImporting] = useState(false);
  const [saved, setSaved] = useState(false);
  const templateInputRef = useRef<HTMLInputElement>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);
  const uploadStoppedByUserRef = useRef(false);

  const buildRows = useCallback(
    (resp: EpisodesResponse): Row[] => {
      const planned = resp.plannedEpisodes || plannedEpisodes;
      const keyword = debouncedSearchEp.trim();
      const toRow = (no: number, found?: EpisodesResponse["episodes"][number]): Row => {
        return {
          episodeNo: no,
          title: found?.title || fmt(t.epLabelN, { ep: no }),
          uploadStatus: found?.uploadStatus ?? 0,
          vodStatus: found?.vodStatus,
          playable: found?.playable,
          transcodeMsg: found?.transcodeMsg,
          videoDuration: found?.videoDuration ?? 0,
          videoSize: found?.videoSize ?? 0,
          videoUrl: found?.videoUrl ?? "",
          fileName: found?.fileName ?? "",
          uploadDate: found?.uploadDate,
          newFile: null,
          newDuration: "",
          uploadProgress: null,
          fileRef: React.createRef<HTMLInputElement>(),
        };
      };

      if (!keyword) {
        return Array.from({ length: planned }, (_, i) => {
          const no = i + 1;
          const found = resp.episodes.find((e) => e.episodeNo === no);
          return toRow(no, found);
        });
      }

      const matched = new Map<number, Row>();
      for (const episode of resp.episodes) {
        matched.set(episode.episodeNo, toRow(episode.episodeNo, episode));
      }
      for (let no = 1; no <= planned; no += 1) {
        if (String(no).includes(keyword) && !matched.has(no)) {
          matched.set(no, toRow(no));
        }
      }
      return [...matched.values()].sort((a, b) => a.episodeNo - b.episodeNo);
    },
    [debouncedSearchEp, plannedEpisodes, t],
  );

  const load = useCallback(async (pendingFiles?: Map<number, PendingFileState>) => {
    setLoading(true);
    try {
      const resp = await fetchEpisodes(courseId, {
        keyword: debouncedSearchEp.trim() || undefined,
        limit: Math.max(plannedEpisodes, 10),
      });
      setData(resp);
      const nextRows = buildRows(resp);
      setRows(
        pendingFiles
          ? nextRows.map((row) => {
              const pending = pendingFiles.get(row.episodeNo);
              return pending ? { ...row, ...pending } : row;
            })
          : nextRows,
      );
    } catch {
      /* http 已 toast */
    } finally {
      setLoading(false);
    }
  }, [courseId, debouncedSearchEp, plannedEpisodes, buildRows]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => () => uploadAbortRef.current?.abort(), []);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearchEp(searchEp), 300);
    return () => window.clearTimeout(id);
  }, [searchEp]);

  const stat = data?.stat ?? { uploaded: 0, failed: 0, pending: plannedEpisodes };
  const pendingLocal = rows.filter((e) => e.newFile).length;
  const canEditEpisodes = canUploadCourse && (auditStatus === AuditStatus.DRAFT || auditStatus === AuditStatus.REJECTED);

  const handleFileSelect = (ep: number, file: File) => {
    if (!canEditEpisodes || saving) return;
    if (file.size > VIDEO_MAX) {
      toast.error(t.fileTooLarge);
      return;
    }
    setRows((prev) =>
      prev.map((e) =>
        e.episodeNo === ep ? { ...e, newFile: file, newDuration: "", uploadProgress: null } : e,
      ),
    );
    void readVideoDuration(file).then((dur) =>
      setRows((prev) => prev.map((e) => (e.episodeNo === ep ? { ...e, newDuration: dur } : e))),
    );
  };

  const clearFile = (ep: number) =>
    setRows((prev) =>
      prev.map((e) =>
        e.episodeNo === ep ? { ...e, newFile: null, newDuration: "", uploadProgress: null } : e,
      ),
    );

  const removeEpisode = async (ep: number) => {
    if (!canEditEpisodes || saving) return;
    try {
      await deleteEpisode(courseId, ep);
      await load();
      onChanged?.();
    } catch {
      // http 已 toast
    }
  };

  const downloadTemplate = async () => {
    setTemplateDownloading(true);
    try {
      const blob = await downloadUploadTemplate(courseId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `批量录入模版_D${courseId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t.templateDownloadFailed);
    } finally {
      setTemplateDownloading(false);
    }
  };

  const importTemplate = async (file: File | undefined) => {
    if (!file || !canEditEpisodes || saving) return;
    setTemplateImporting(true);
    try {
      const entries = await parseEpisodeTemplate(file, plannedEpisodes);
      if (entries.length === 0) {
        toast.error(t.templateImportEmpty);
        return;
      }
      for (const entry of entries) {
        await saveEpisode({
          courseId,
          episodeNo: entry.episodeNo,
          title: entry.title,
          videoUrl: entry.videoUrl,
          fileName: entry.fileName,
        });
      }
      await load();
      onChanged?.();
      toast.success(fmt(t.templateImportSuccess, { n: entries.length }));
    } catch {
      toast.error(t.templateImportFailed);
    } finally {
      setTemplateImporting(false);
      if (templateInputRef.current) templateInputRef.current.value = "";
    }
  };

  const updateTitle = (ep: number, title: string) =>
    setRows((prev) => prev.map((e) => (e.episodeNo === ep ? { ...e, title: title.slice(0, EPISODE_TITLE_LIMIT) } : e)));

  const handleSave = async () => {
    if (!canEditEpisodes) return;
    const pending = rows.filter((e) => e.newFile);
    if (pending.length === 0 || saving) return;
    const controller = new AbortController();
    uploadAbortRef.current = controller;
    uploadStoppedByUserRef.current = false;
    setSaving(true);
    let anyFail = false;
    let stoppedByUser = false;
    const unresolved = new Map<number, PendingFileState>(
      pending.map((row) => [
        row.episodeNo,
        { title: row.title, newFile: row.newFile, newDuration: row.newDuration },
      ]),
    );
    // 逐个：切片上传 → saveEpisode（一个文件一次，互不影响）
    try {
      for (const r of pending) {
        if (controller.signal.aborted) break;
        try {
          setRows((prev) =>
            prev.map((row) => (row.episodeNo === r.episodeNo ? { ...row, uploadProgress: 0 } : row)),
          );
          const url = await uploadFile(
            r.newFile as File,
            PUBLISHER_UPLOAD_PATH,
            controller.signal,
            (percent, phase = "uploading") =>
              setRows((prev) =>
                prev.map((row) =>
                  row.episodeNo === r.episodeNo
                    ? {
                        ...row,
                        // complete 阶段固定展示 100%，文案走 epMerging
                        uploadProgress: phase === "merging" ? 100 : percent,
                      }
                    : row,
                ),
              ),
          );
          const result = await saveEpisode({
            courseId,
            episodeNo: r.episodeNo,
            title: r.title,
            videoUrl: url,
            fileName: r.newFile?.name,
          });
          unresolved.delete(r.episodeNo);
          setRows((prev) =>
            prev.map((row) =>
              row.episodeNo === r.episodeNo
                ? {
                    ...row,
                    uploadStatus: result.uploadStatus,
                    videoDuration: result.videoDuration ?? 0,
                    videoSize: result.videoSize ?? 0,
                    videoUrl: url,
                    fileName: r.newFile?.name || "",
                    newFile: null,
                    newDuration: "",
                    uploadProgress: null,
                  }
                : row,
            ),
          );
        } catch {
          if (controller.signal.aborted) break;
          anyFail = true; // uploadFile / http 已 toast
          setRows((prev) =>
            prev.map((row) =>
              row.episodeNo === r.episodeNo ? { ...row, uploadProgress: null } : row,
            ),
          );
          // 单集失败立即停止后续集，避免长队列静默继续看起来像卡住
          break;
        }
      }
    } finally {
      stoppedByUser = controller.signal.aborted && uploadStoppedByUserRef.current;
      if (uploadAbortRef.current === controller) uploadAbortRef.current = null;
      uploadStoppedByUserRef.current = false;
      await load(unresolved);
      setSaving(false);
    }
    if (controller.signal.aborted) {
      if (stoppedByUser) toast(t.uploadStopped);
      onChanged?.();
      return;
    }
    if (anyFail) {
      toast.error(t.videoUploadFailed);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    onChanged?.();
  };

  const stopEpisodeUpload = () => {
    uploadStoppedByUserRef.current = true;
    uploadAbortRef.current?.abort();
  };

  const cols = [t.colEp, t.colEpTitle, t.colDuration, t.colSize, t.epColUploadDate, t.colStatus, t.colActions];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          disabled={saving}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: "1.0625rem" }}>
              {t.episodesTitle}
            </h2>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-sm text-gray-500">{title}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {fmt(t.episodesBreadcrumbCount, { total: plannedEpisodes, done: stat.uploaded })}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
          <input
            ref={templateInputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            disabled={saving}
            className="hidden"
            onChange={(e) => void importTemplate(e.target.files?.[0])}
          />
          <button
            onClick={() => void downloadTemplate()}
            disabled={templateDownloading || saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-60"
            style={{ fontWeight: 600 }}
          >
            {templateDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {t.downloadTemplate}
          </button>
          {canEditEpisodes && (
            <button
              onClick={() => templateInputRef.current?.click()}
              disabled={templateImporting || saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-60"
              style={{ fontWeight: 600 }}
            >
              {templateImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {templateImporting ? t.templateImporting : t.importTemplate}
            </button>
          )}
          {saved && (
            <div className="flex items-center gap-1.5 text-xs text-green-600" style={{ fontWeight: 500 }}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t.epSaved}
            </div>
          )}
          {saving && (
            <button
              type="button"
              onClick={stopEpisodeUpload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs hover:bg-red-50"
              style={{ fontWeight: 600 }}
            >
              <Square className="w-3.5 h-3.5" fill="currentColor" />
              {t.stopUpload}
            </button>
          )}
          {pendingLocal > 0 && (
            <button
              onClick={handleSave}
              disabled={saving || !canEditEpisodes}
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
                  {fmt(t.epSubmitN, { n: pendingLocal })}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Stats（已上传 / 上传失败 / 待提交） */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {[
          { icon: <CheckCircle2 className="w-3.5 h-3.5" />, count: stat.uploaded, label: t.epStatusUploaded, color: "#16A34A", bg: "#F0FDF4" },
          { icon: <AlertCircle className="w-3.5 h-3.5" />, count: stat.failed, label: t.epStatusFailed, color: "#EF4444", bg: "#FEF2F2" },
          { icon: <Clock className="w-3.5 h-3.5" />, count: stat.pending, label: t.statPendingSubmit, color: "#6366F1", bg: "#EEF2FF" },
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
              disabled={saving}
              placeholder={t.episodesSearchPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-white outline-none focus:border-gray-400 transition-colors"
            />
          </div>
          <span className="text-xs text-gray-400 ml-auto">{fmt(t.episodesResultCount, { n: rows.length })}</span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[960px]">
            <div className="grid grid-cols-[64px_1fr_120px_120px_130px_120px_200px] gap-3 px-5 py-2.5 bg-gray-50/60 border-b border-gray-100">
              {cols.map((col, i) => (
                <span key={i} className="text-xs text-gray-500" style={{ fontWeight: 500 }}>
                  {col}
                </span>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
                {rows.map((ep) => {
                  const st = uploadStatusStyle[ep.uploadStatus] ?? uploadStatusStyle[0];
                  const isUploading = ep.newFile !== null && ep.uploadProgress !== null;
                  // item 8：已上传但不可播时按转码态展示（uploadStatus 只表示已入库，不代表能播）
                  const showTranscode = !ep.newFile && ep.uploadStatus === 1 && ep.playable === false;
                  const transcodeFailed = showTranscode && ep.vodStatus === 3;
                  const statusColor = isUploading
                    ? "#4F46E5"
                    : transcodeFailed
                      ? "#EF4444"
                      : showTranscode
                        ? "#EA580C"
                        : st.color;
                  const statusIcon = isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : transcodeFailed ? (
                    <AlertCircle className="w-3.5 h-3.5" />
                  ) : showTranscode ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : (
                    st.icon
                  );
                  const statusLabel = isUploading
                    ? ep.uploadProgress === 100
                      ? t.epMerging
                      : `${t.epUploading} ${ep.uploadProgress}%`
                    : transcodeFailed
                      ? t.epTranscodeFailed
                      : showTranscode
                        ? t.epStatusProcessing
                        : uploadStatusLabel(ep.uploadStatus, t);
                  return (
                    <div
                      key={ep.episodeNo}
                      className={`grid grid-cols-[64px_1fr_120px_120px_130px_120px_200px] gap-3 items-center px-5 py-3 transition-colors ${
                        ep.newFile ? "bg-indigo-50/40" : "hover:bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-center h-8 rounded-lg bg-gray-100 flex-shrink-0">
                        <span className="text-xs text-gray-700" style={{ fontWeight: 700 }}>
                          {fmt(t.epLabelN, { ep: ep.episodeNo })}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={ep.title}
                        onChange={(e) => updateTitle(ep.episodeNo, e.target.value)}
                        disabled={!canEditEpisodes || saving}
                        placeholder={fmt(t.epTitlePlaceholder, { ep: ep.episodeNo })}
                        maxLength={EPISODE_TITLE_LIMIT}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none hover:border-gray-400 focus:border-black transition-all min-w-0 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                      />
                      <span className="text-xs text-gray-500">
                        {ep.newFile ? ep.newDuration || t.readingDuration : formatDuration(ep.videoDuration)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {ep.newFile ? `${((ep.newFile.size) / 1024 / 1024).toFixed(1)} MB` : formatBytes(ep.videoSize)}
                      </span>
                      <span className="text-xs text-gray-500">{ep.uploadDate || "—"}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5" style={{ color: statusColor }}>
                          {statusIcon}
                          <span className="text-xs" style={{ fontWeight: 500 }}>
                            {statusLabel}
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
                        {transcodeFailed && ep.transcodeMsg && (
                          <p className="mt-0.5 text-[10px] text-red-400 truncate" title={ep.transcodeMsg}>
                            {ep.transcodeMsg}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          ref={ep.fileRef}
                          type="file"
                          accept={VIDEO_ACCEPT}
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleFileSelect(ep.episodeNo, e.target.files[0]);
                            e.target.value = "";
                          }}
                          disabled={!canEditEpisodes || saving}
                          className="hidden"
                        />
                        {ep.newFile ? (
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Film className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                            <span className="text-xs text-indigo-700 truncate flex-1" style={{ fontWeight: 500 }}>
                              {ep.newFile.name}
                            </span>
                            <button
                              onClick={() => clearFile(ep.episodeNo)}
                              disabled={!canEditEpisodes || saving}
                              className="text-gray-400 hover:text-red-500 flex-shrink-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 min-w-0">
                            {ep.uploadStatus === 1 && (
                              <span
                                className="text-xs text-gray-500 truncate max-w-[92px]"
                                title={ep.fileName || fileNameFromUrl(ep.videoUrl)}
                              >
                                {ep.fileName || fileNameFromUrl(ep.videoUrl)}
                              </span>
                            )}
                            <button
                              onClick={() => ep.fileRef.current?.click()}
                              disabled={!canEditEpisodes || saving}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed text-xs transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                              style={{
                                borderColor: ep.uploadStatus === 2 ? "#EF4444" : "#D1D5DB",
                                color: ep.uploadStatus === 2 ? "#EF4444" : "#6B7280",
                                fontWeight: 500,
                              }}
                            >
                              <Upload className="w-3 h-3" />
                              {ep.uploadStatus === 1
                                ? t.epActionReplace
                                : ep.uploadStatus === 2
                                  ? t.epActionRetry
                                  : t.epActionUpload}
                            </button>
                          </div>
                        )}
                        {ep.uploadStatus !== 0 && !ep.newFile && (
                          <button
                            onClick={() => void removeEpisode(ep.episodeNo)}
                            disabled={!canEditEpisodes || saving}
                            className="text-gray-400 hover:text-red-500 flex-shrink-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
          <span className="text-xs text-gray-500">{fmt(t.epTotalCount, { total: plannedEpisodes })}</span>
          <div className="flex items-center gap-3">
            {saving && (
              <button
                type="button"
                onClick={stopEpisodeUpload}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs hover:bg-red-50"
                style={{ fontWeight: 600 }}
              >
                <Square className="w-3.5 h-3.5" fill="currentColor" />
                {t.stopUpload}
              </button>
            )}
            {pendingLocal > 0 && (
              <button
                onClick={handleSave}
                disabled={saving || !canEditEpisodes}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs hover:opacity-90 disabled:opacity-60"
                style={{ background: "#111111", fontWeight: 600 }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t.epUploading}
                  </>
                ) : (
                  fmt(t.epSubmitNVideos, { n: pendingLocal })
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
