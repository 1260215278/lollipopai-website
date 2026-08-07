import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  X,
  RotateCcw,
  Film,
  Files,
  FolderOpen,
  AlertCircle,
  User,
  Home,
  Sparkles,
  Loader2,
  Square,
  PauseCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { ContentMessages } from "../../i18n/content";
import type { CommonMessages } from "../../i18n/common";
import { uploadFile, PUBLISHER_UPLOAD_PATH } from "../../../services/upload";
import { getOssHeicJpgUrl } from "../../../services/heic";
import { ApiError } from "../../../services/http";
import {
  saveBasic,
  saveEpisode,
  publishCourse,
  fetchDraft,
  fetchLabels,
  fetchClassifications,
  fetchPriceRule,
  clearDraft,
  downloadUploadTemplate,
  saveHighlight,
  deleteEpisode,
  fetchRevenueOptions,
  type RevenueOption,
  type PriceRuleCountry,
  type CourseClassification,
} from "../../../services/content";
import { getLanguageTypeList, type LanguageOption } from "../../../services/language";
import { CHANNEL_VALUES, channelToGender, genderToChannel, type ChannelValue } from "../../mock/content";
import type { Highlight } from "./types";
import { StepIndicator } from "../StepIndicator";
import { PhoneMockup } from "./PhoneMockup";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  COPYRIGHT_PROOF_ACCEPT,
  Field,
  HIGHLIGHT_ACCEPT,
  IMAGE_ACCEPT,
  VIDEO_ACCEPT,
  inputClass,
  fmt,
  formatBytes,
  formatDuration,
  formatUsd,
  fileNameFromUrl,
  readVideoDuration,
  VIDEO_MAX,
  EPISODE_TITLE_LIMIT,
} from "./shared";
import { parseEpisodeTemplate } from "./episodeTemplate";
import { getFolderEpisodeTitle, prepareBatchVideoFiles } from "./batchVideoFiles";
import {
  getPendingEpisodeMeta,
  getPendingUploadFiles,
  getUploadTask,
  clearPendingUploadFiles,
  pauseUploadTask,
  removePendingUploadFile,
  setPendingEpisodeMeta,
  setPendingUploadFile,
  startUploadTask,
  subscribeUploadEpisodeComplete,
  updateUploadTask,
  useUploadTasks,
  type UploadTaskCompletedItem,
} from "../../uploadTaskStore";

const DESC_LIMIT = 200;
/** 短剧名称上限 100 字符（bug16：避免超长提交后端异常） */
const NAME_LIMIT = 100;
/** 封面上限 10MB（与后端 /publisher/course/upload 图片校验对齐） */
const COVER_MAX = 10 * 1024 * 1024;
/** 发布配置不进后端草稿，按 courseId 在前端缓存。 */
const PUB_CONFIG_CACHE_PREFIX = "distribution.upload.publishConfig.";

interface BasicInfo {
  cover: string;
  name: string;
  description: string;
  totalEpisodes: string;
  channel: ChannelValue | "";
  languageType: string;
  classificationId: number | null;
  tags: string[];
  /** 版权类型 1自制/2授权 */
  copyrightType: number;
  /** 版权证明文件 URL（自制/授权均必填） */
  copyrightProof: string;
}

interface VideoRow {
  episodeNo: number;
  title: string;
  file: File | null;
  duration: string;
  fileError: string;
  /** 0 待提交 / 1 已上传 / 2 上传失败 */
  uploadStatus: number;
  /** 当前文件的切片上传进度；null 表示未在上传。 */
  uploadProgress: number | null;
  /** 已上传集回显：视频大小（字节，后端回写） */
  videoSize: number;
  /** 已上传集回显：视频时长（秒，后端回写） */
  videoDuration: number;
  /** 已上传集回显：视频 URL（用于推导文件名） */
  videoUrl: string;
  /** 原始文件名（后端 20260703 新增；老数据为空时从 URL 退化显示） */
  fileName: string;
  fileRef: React.RefObject<HTMLInputElement | null>;
}

interface HighlightState {
  videoUrl: string;
  fileName: string;
  fileSize: number | null;
  uploadTime: string;
  file: File | null;
  uploading: boolean;
  error: string;
}

interface PublishConfigState {
  publishScope: number;
  onShelfNow: boolean;
}

interface UploadFormProps {
  t: ContentMessages;
  common: CommonMessages;
  taskId: string;
  /** null 表示新建任务，不读取账户下其他草稿。 */
  resumeCourseId: number | null;
  onCancel: () => void;
  /** 送审成功后回调：上层刷新列表并返回 */
  onSubmitted: () => void;
}

const emptyBasic: BasicInfo = {
  cover: "",
  name: "",
  description: "",
  totalEpisodes: "",
  channel: "",
  languageType: "",
  classificationId: null,
  tags: [],
  copyrightType: 1,
  copyrightProof: "",
};

const pubConfigCacheKey = (id: number) => `${PUB_CONFIG_CACHE_PREFIX}${id}`;

function getCachedPubConfig(id: number): PublishConfigState | null {
  try {
    return parseCachedPubConfig(localStorage.getItem(pubConfigCacheKey(id)));
  } catch {
    return null;
  }
}

function setCachedPubConfig(id: number, config: PublishConfigState) {
  try {
    localStorage.setItem(pubConfigCacheKey(id), JSON.stringify(config));
  } catch {
    // localStorage 不可用时忽略；本次会话内 React 状态仍可继续发布。
  }
}

function removeCachedPubConfig(id: number) {
  try {
    localStorage.removeItem(pubConfigCacheKey(id));
  } catch {
    // ignore
  }
}

function parseCachedPubConfig(raw: string | null): PublishConfigState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PublishConfigState>;
    if (typeof parsed.publishScope !== "number" || typeof parsed.onShelfNow !== "boolean") return null;
    return { publishScope: parsed.publishScope, onShelfNow: parsed.onShelfNow };
  } catch {
    return null;
  }
}

/**
 * 版权证明上传（自制/授权均必填）。支持图片 + PDF + Word，走 /publisher/course/upload（文档 ≤20MB）。
 * 文档无法 <img> 预览，故已上传时展示文件名链接（点开新标签查看）。
 */
function CopyrightProofUpload({
  t,
  value,
  onChange,
}: {
  t: ContentMessages;
  value: string;
  onChange: (url: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      // bug9：HEIC 图片证明上传原文件，保存 OSS 动态转 JPG URL；PDF 等原样上传
      const url = await uploadFile(file, PUBLISHER_UPLOAD_PATH);
      onChange(getOssHeicJpgUrl(file, url));
    } catch {
      // uploadFile 已 toast
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept={COPYRIGHT_PROOF_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          void pick(f);
        }}
      />
      {value ? (
        <div className="flex items-center gap-3 px-4 h-[45px] rounded-lg border border-gray-200 bg-gray-50">
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="flex-1 truncate text-sm text-gray-700 hover:underline"
            title={fileNameFromUrl(value)}
          >
            {fileNameFromUrl(value)}
          </a>
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={uploading}
            className="text-xs text-gray-500 hover:text-gray-900 disabled:opacity-50 flex items-center"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t.coverReplace}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="w-full h-[88px] rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-gray-400 transition-colors disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span className="text-sm">{t.copyrightProofPrompt}</span>
              <span className="text-xs text-gray-300">{t.copyrightProofFormat}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

/** 各国收费规则内联表每页条数 */
const PRICE_RULE_PAGE_SIZE = 5;

/**
 * 上剧流程（三步，分步草稿暂存）：
 *  Step1 基本信息 → POST saveBasic（含语言/标签，返回 courseId）
 *  Step2 上传剧集 → 每个视频切片上传 → POST saveEpisode（同 episodeNo 覆盖）
 *  Step3 发布配置 → POST publish（高光 + 发布范围 + 各国收费规则；上架固定立即上架）
 * 进入时自动恢复服务端草稿（GET draft）。
 */
export const UploadForm: React.FC<UploadFormProps> = ({
  t,
  common,
  taskId,
  resumeCourseId,
  onCancel,
  onSubmitted,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(() => getUploadTask(taskId)?.step ?? (resumeCourseId === null ? 1 : 2));
  const [courseId, setCourseId] = useState<number | null>(() => resumeCourseId);
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(emptyBasic);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [pubConfig, setPubConfig] = useState<PublishConfigState>({
    publishScope: 1,
    onShelfNow: true,
  });
  const [highlight, setHighlight] = useState<HighlightState>({
    videoUrl: "",
    fileName: "",
    fileSize: null,
    uploadTime: "",
    file: null,
    uploading: false,
    error: "",
  });

  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [labelOptions, setLabelOptions] = useState<string[]>([]);
  const [classificationOptions, setClassificationOptions] = useState<CourseClassification[]>([]);
  const [labelsLoading, setLabelsLoading] = useState(false);
  const [classificationsLoading, setClassificationsLoading] = useState(false);

  const [coverError, setCoverError] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [priceRows, setPriceRows] = useState<PriceRuleCountry[]>([]);
  const [priceLoading, setPriceLoading] = useState(false);
  const [pricePage, setPricePage] = useState(1);
  const [revenueOptions, setRevenueOptions] = useState<RevenueOption[]>([]);
  const [savingBasic, setSavingBasic] = useState(false);
  const [uploadingEps, setUploadingEps] = useState(false);
  const [templateDownloading, setTemplateDownloading] = useState(false);
  const [templateImporting, setTemplateImporting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const coverRef = useRef<HTMLInputElement>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);
  const batchVideoInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const highlightRef = useRef<HTMLInputElement>(null);
  const restoredPubConfigCourse = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const pendingFilesRef = useRef<Map<number, File>>(getPendingUploadFiles(taskId));
  const taskSnapshot = useUploadTasks().find((task) => task.id === taskId) ?? null;

  const bi = (field: Partial<BasicInfo>) => setBasicInfo((p) => ({ ...p, ...field }));

  /** 计划集数（一旦草稿已建则锁定） */
  const plannedLocked = courseId !== null;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // 语言列表
  useEffect(() => {
    void getLanguageTypeList()
      .then(setLanguages)
      .catch(() => undefined);
    void fetchRevenueOptions()
      .then((rows) => {
        setRevenueOptions(rows);
        if (rows.length > 0) {
          setPubConfig((prev) =>
            rows.some((item) => item.publishScope === prev.publishScope)
              ? prev
              : { ...prev, publishScope: rows[0].publishScope },
          );
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (courseId === null || restoredPubConfigCourse.current === courseId) return;
    restoredPubConfigCourse.current = courseId;
    const cached = getCachedPubConfig(courseId);
    if (!cached) return;
    setPubConfig(() => {
      if (revenueOptions.length > 0 && !revenueOptions.some((item) => item.publishScope === cached.publishScope)) {
        return { ...cached, publishScope: revenueOptions[0].publishScope };
      }
      return cached;
    });
  }, [courseId, revenueOptions]);

  useEffect(() => {
    if (courseId === null) return;
    setCachedPubConfig(courseId, pubConfig);
  }, [courseId, pubConfig]);

  useEffect(() => {
    updateUploadTask(taskId, { step });
  }, [step, taskId]);

  useEffect(() => {
    if (step === 2) folderInputRef.current?.setAttribute("webkitdirectory", "");
  }, [step]);

  // Step3 进入时加载各国收费规则（内联展示，不再走弹窗）
  useEffect(() => {
    if (step !== 3) return;
    let active = true;
    setPriceLoading(true);
    setPricePage(1);
    fetchPriceRule(parseInt(basicInfo.totalEpisodes) || undefined)
      .then((rows) => {
        if (active) setPriceRows(rows);
      })
      .catch(() => {
        if (active) setPriceRows([]);
      })
      .finally(() => {
        if (active) setPriceLoading(false);
      });
    return () => {
      active = false;
    };
  }, [step, basicInfo.totalEpisodes]);

  useEffect(() => {
    setUploadingEps(taskSnapshot?.status === "uploading");
  }, [taskSnapshot?.status]);

  /** 将单集上传结果写回表格行（整批中途即可变「已上传」，不依赖整批结束） */
  const applyCompletedEpisode = React.useCallback(
    (item: UploadTaskCompletedItem) => {
      pendingFilesRef.current.delete(item.episodeNo);
      setVideos((prev) =>
        prev.map((video) => {
          if (video.episodeNo !== item.episodeNo) return video;
          return {
            ...video,
            uploadStatus: item.result.uploadStatus,
            file: null,
            duration: "",
            fileError: item.result.uploadStatus === 1 ? "" : t.videoUploadFailed,
            uploadProgress: null,
            videoSize: item.result.videoSize ?? 0,
            videoDuration: item.result.videoDuration ?? 0,
            videoUrl: item.videoUrl,
            fileName: item.fileName,
          };
        }),
      );
    },
    [t.videoUploadFailed],
  );

  // 恢复服务端草稿 + 内存中的待传 File/标题/时长
  useEffect(() => {
    if (resumeCourseId === null) return;
    let active = true;
    void fetchDraft(resumeCourseId)
      .then((draft) => {
        if (!active || !draft) return;
        const c = draft.course;
        const existingTask = getUploadTask(taskId);
        // 以 store 实时快照为准（勿用 remount 前的过期 Map 副本）
        const storedFiles = getPendingUploadFiles(taskId);
        const storedMeta = getPendingEpisodeMeta(taskId);
        pendingFilesRef.current = new Map(storedFiles);

        setCourseId(c.courseId);
        setBasicInfo({
          cover: c.titleImg || "",
          name: c.title || "",
          description: c.details || "",
          totalEpisodes: c.plannedEpisodes ? String(c.plannedEpisodes) : "",
          channel: genderToChannel(c.genderType),
          languageType: c.languageType || "",
          classificationId: c.classificationId ?? null,
          tags: c.courseLabel ? c.courseLabel.split(",").filter(Boolean) : [],
          copyrightType: c.copyrightType || 1,
          copyrightProof: c.copyrightProof || "",
        });
        setHighlight((p) => ({
          ...p,
          videoUrl: c.highlightVideoUrl || "",
          fileName: c.highlightFileName || "",
          fileSize: c.highlightFileSize ?? null,
          uploadTime: c.highlightUploadTime || "",
        }));
        // 已上传集回显；服务端已成功的集清掉本地 File，避免仍显示「已选择」
        const planned = c.plannedEpisodes || 0;
        const rows = Array.from({ length: planned }, (_, i) => {
          const no = i + 1;
          const ep = draft.episodes.find((e) => e.episodeNo === no);
          const serverUploaded = (ep?.uploadStatus ?? 0) === 1;
          if (serverUploaded && storedFiles.has(no)) {
            removePendingUploadFile(taskId, no);
            pendingFilesRef.current.delete(no);
          }
          const localFile = serverUploaded ? null : storedFiles.get(no) ?? null;
          const meta = storedMeta.get(no);
          return {
            episodeNo: no,
            // 本地未提交的标题优先，否则用草稿
            title: (meta?.title && meta.title.length > 0 ? meta.title : ep?.title) || "",
            file: localFile,
            duration: localFile ? meta?.duration || "" : "",
            fileError: "",
            uploadStatus: ep?.uploadStatus ?? 0,
            uploadProgress:
              existingTask?.status === "uploading" && existingTask.currentEpisode === no
                ? existingTask.currentFileProgress
                : null,
            videoSize: ep?.videoSize ?? 0,
            videoDuration: ep?.videoDuration ?? 0,
            videoUrl: ep?.videoUrl || "",
            fileName: ep?.fileName || "",
            fileRef: React.createRef<HTMLInputElement>(),
          };
        });
        setVideos(rows);
        // 恢复后补读时长，避免一直「读取中…」
        rows.forEach((row) => {
          if (!row.file || row.duration) return;
          void readVideoDuration(row.file).then((dur) => {
            if (!active) return;
            setPendingEpisodeMeta(taskId, row.episodeNo, { duration: dur });
            setVideos((prev) =>
              prev.map((video) =>
                video.episodeNo === row.episodeNo && video.file ? { ...video, duration: dur } : video,
              ),
            );
          });
        });
        const uploadedEpisodes = draft.episodes.filter((episode) => episode.uploadStatus === 1).length;
        const totalEpisodes = c.plannedEpisodes || 0;
        const isUploading = existingTask?.status === "uploading";
        const liveSelected = getPendingUploadFiles(taskId).size;
        updateUploadTask(taskId, {
          courseId: c.courseId,
          title: c.title,
          totalEpisodes,
          uploadedEpisodes,
          selectedEpisodes: liveSelected,
          currentEpisode: isUploading ? existingTask.currentEpisode : null,
          currentFileProgress: isUploading ? existingTask.currentFileProgress : 0,
          currentFilePhase: isUploading ? existingTask.currentFilePhase : "idle",
          progress: isUploading
            ? existingTask.progress
            : totalEpisodes > 0
              ? Math.round((uploadedEpisodes / totalEpisodes) * 100)
              : 0,
          step: existingTask?.step ?? (uploadedEpisodes >= totalEpisodes && totalEpisodes > 0 ? 3 : 2),
          status: isUploading
            ? "uploading"
            : existingTask?.status === "failed"
              ? "failed"
              : uploadedEpisodes >= totalEpisodes && totalEpisodes > 0
                ? "ready"
                : "paused",
        });
        setDraftRestored(true);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [resumeCourseId, taskId]);

  // 上传任务在表单外运行：每集完成即时刷新行；卸载再进也能订阅到后续完成
  useEffect(() => {
    return subscribeUploadEpisodeComplete(taskId, (item) => {
      if (!mountedRef.current) return;
      applyCompletedEpisode(item);
    });
  }, [taskId, applyCompletedEpisode]);

  useEffect(() => {
    if (courseId === null) return;
    setVideos((prev) =>
      prev.map((video) => ({
        ...video,
        uploadProgress:
          taskSnapshot?.status === "uploading" && taskSnapshot.currentEpisode === video.episodeNo
            ? taskSnapshot.currentFileProgress
            : null,
      })),
    );
  }, [courseId, taskSnapshot?.currentEpisode, taskSnapshot?.currentFileProgress, taskSnapshot?.status]);

  // 语言变化时加载标签集和类别集
  useEffect(() => {
    if (!basicInfo.languageType) {
      setLabelOptions([]);
      setClassificationOptions([]);
      return;
    }
    setLabelsLoading(true);
    fetchLabels(basicInfo.languageType)
      .then((opts) => setLabelOptions(opts))
      .catch(() => setLabelOptions([]))
      .finally(() => setLabelsLoading(false));
    setClassificationsLoading(true);
    fetchClassifications(basicInfo.languageType)
      .then((opts) => setClassificationOptions(opts))
      .catch(() => setClassificationOptions([]))
      .finally(() => setClassificationsLoading(false));
  }, [basicInfo.languageType]);

  const discardDraft = async () => {
    if (courseId !== null) {
      await clearDraft(courseId).catch(() => undefined);
      removeCachedPubConfig(courseId);
      toast.success(t.draftCleared);
    }
    pendingFilesRef.current.clear();
    clearPendingUploadFiles(taskId);
    updateUploadTask(taskId, {
      courseId: null,
      title: "",
      totalEpisodes: 0,
      uploadedEpisodes: 0,
      selectedEpisodes: 0,
      currentEpisode: null,
      progress: 0,
      step: 1,
      status: "draft",
      error: "",
    });
    setCourseId(null);
    setBasicInfo(emptyBasic);
    setVideos([]);
    setStep(1);
    setPubConfig({ publishScope: 1, onShelfNow: true });
    setHighlight({ videoUrl: "", fileName: "", fileSize: null, uploadTime: "", file: null, uploading: false, error: "" });
    setDraftRestored(false);
  };

  const onPickCover = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > COVER_MAX) {
      setCoverError(t.coverTooLarge);
      return;
    }
    setCoverError("");
    setCoverUploading(true);
    try {
      // bug9：HEIC 上传原文件，保存 OSS 动态转 JPG URL；封面走发行方专用 /publisher/course/upload（@PublisherLogin）。
      const url = await uploadFile(file, PUBLISHER_UPLOAD_PATH);
      bi({ cover: getOssHeicJpgUrl(file, url) });
    } catch {
      setCoverError(t.coverUploadFailed);
    } finally {
      setCoverUploading(false);
    }
  };

  const step1Valid =
    !!basicInfo.cover &&
    !!basicInfo.name &&
    !!basicInfo.description &&
    parseInt(basicInfo.totalEpisodes) >= 1 &&
    !!basicInfo.channel &&
    !!basicInfo.languageType &&
    basicInfo.classificationId !== null &&
    basicInfo.tags.length > 0 &&
    // 自制/授权均需上传版权证明
    !!basicInfo.copyrightProof;

  /** Step1 → saveBasic → Step2 */
  const goStep2 = async () => {
    if (!step1Valid || savingBasic) return;
    const planned = parseInt(basicInfo.totalEpisodes) || 0;
    setSavingBasic(true);
    try {
      const res = await saveBasic({
        courseId,
        titleImg: basicInfo.cover,
        title: basicInfo.name,
        details: basicInfo.description,
        plannedEpisodes: planned,
        genderType: channelToGender(basicInfo.channel as ChannelValue),
        languageType: basicInfo.languageType,
        courseLabel: basicInfo.tags.join(","),
        classificationId: basicInfo.classificationId as number,
        copyrightType: basicInfo.copyrightType,
        copyrightProof: basicInfo.copyrightProof,
      });
      setCourseId(res.courseId);
      const uploadedEpisodes = videos.filter((video) => video.uploadStatus === 1).length;
      updateUploadTask(taskId, {
        courseId: res.courseId,
        title: basicInfo.name,
        totalEpisodes: planned,
        uploadedEpisodes,
        selectedEpisodes: pendingFilesRef.current.size,
        currentEpisode: null,
        progress: planned > 0 ? (uploadedEpisodes / planned) * 100 : 0,
        step: 2,
        status: "paused",
        error: "",
      });
      // 构建/保留剧集行
      setVideos((prev) =>
        Array.from({ length: planned }, (_, i) => {
          const no = i + 1;
          const found = prev.find((v) => v.episodeNo === no);
          return (
            found ?? {
              episodeNo: no,
              title: "",
              file: null,
              duration: "",
              fileError: "",
              uploadStatus: 0,
              uploadProgress: null,
              videoSize: 0,
              videoDuration: 0,
              videoUrl: "",
              fileName: "",
              fileRef: React.createRef<HTMLInputElement>(),
            }
          );
        }),
      );
      setStep(2);
    } catch {
      /* http 已 toast */
    } finally {
      setSavingBasic(false);
    }
  };

  const updateVideo = (ep: number, field: Partial<VideoRow>) => {
    if (field.title !== undefined || field.duration !== undefined) {
      setPendingEpisodeMeta(taskId, ep, {
        ...(field.title !== undefined ? { title: field.title } : {}),
        ...(field.duration !== undefined ? { duration: field.duration } : {}),
      });
    }
    setVideos((v) => v.map((item) => (item.episodeNo === ep ? { ...item, ...field } : item)));
  };

  const onPickVideo = (ep: number, file: File | undefined, title?: string) => {
    if (!file) return;
    if (file.size > VIDEO_MAX) {
      removePendingUploadFile(taskId, ep);
      pendingFilesRef.current.delete(ep);
      updateVideo(ep, { file: null, duration: "", fileError: t.fileTooLarge, uploadProgress: null });
      return;
    }
    pendingFilesRef.current.set(ep, file);
    setPendingUploadFile(taskId, ep, file);
    const nextTitle = title ? title.slice(0, EPISODE_TITLE_LIMIT) : undefined;
    if (nextTitle) setPendingEpisodeMeta(taskId, ep, { title: nextTitle, duration: "" });
    else setPendingEpisodeMeta(taskId, ep, { duration: "" });
    updateVideo(ep, {
      file,
      fileError: "",
      duration: "",
      uploadProgress: null,
      ...(nextTitle ? { title: nextTitle } : {}),
    });
    void readVideoDuration(file).then((dur) => {
      setPendingEpisodeMeta(taskId, ep, { duration: dur });
      updateVideo(ep, { duration: dur });
    });
  };

  const onPickBatchVideos = (fileList: FileList | null) => {
    if (!fileList) return;
    const files = prepareBatchVideoFiles(fileList, VIDEO_ACCEPT);
    if (files.length === 0) return;
    if (files.length > videos.length) {
      toast.error(fmt(t.batchUploadTooMany, { total: videos.length, selected: files.length }));
      return;
    }
    files.forEach((file, index) => {
      onPickVideo(videos[index].episodeNo, file, getFolderEpisodeTitle(file) || undefined);
    });
  };

  const clearSelectedVideo = (episodeNo: number) => {
    pendingFilesRef.current.delete(episodeNo);
    removePendingUploadFile(taskId, episodeNo);
    updateVideo(episodeNo, { file: null, duration: "", uploadProgress: null });
  };

  /** Step2 → 切片上传已选视频 + saveEpisode → Step3（进入 Step3 后内联拉价规则，不再调用 openPricing） */
  const goStep3 = async () => {
    if (courseId === null || uploadingEps) return;
    const pending = videos.filter((v) => v.file);
    const uploaded = new Set(videos.filter((v) => v.uploadStatus === 1).map((v) => v.episodeNo));
    const missing = videos.filter((v) => v.uploadStatus !== 1 && !v.file);
    if (missing.length > 0) {
      toast.error(t.videoIncomplete);
      return;
    }
    if (pending.length === 0 && uploaded.size === videos.length) {
      updateUploadTask(taskId, { status: "ready", step: 3, progress: 100, uploadedEpisodes: uploaded.size });
      setStep(3);
      return;
    }
    setUploadingEps(true);
    try {
      const run = startUploadTask(
        taskId,
        courseId,
        videos.length,
        pending.map((video) => ({
          episodeNo: video.episodeNo,
          title: video.title,
          file: video.file as File,
          // 替换已上传集时不得再累加 uploadedEpisodes
          alreadyUploaded: video.uploadStatus === 1,
        })),
      );
      const result = await run;
      if (!mountedRef.current) return;
      // 单集完成已由 subscribeUploadEpisodeComplete 即时写回；此处再兜底对齐整批结果
      if (result.completed.length > 0) {
        result.completed.forEach((item) => applyCompletedEpisode(item));
      }
      if (result.stopped) {
        toast(t.uploadStopped);
        return;
      }
      if (result.failedEpisodes.length > 0) {
        toast.error(t.videoUploadFailed);
        return;
      }
      setStep(3);
    } finally {
      if (mountedRef.current) setUploadingEps(false);
    }
  };

  const stopEpisodeUpload = () => {
    pauseUploadTask(taskId);
  };

  const onPickHighlight = async (file: File | undefined) => {
    if (!file || courseId === null) return;
    if (file.size > VIDEO_MAX) {
      setHighlight((p) => ({ ...p, error: t.fileTooLarge }));
      return;
    }
    setHighlight((p) => ({ ...p, file, uploading: true, error: "" }));
    try {
      const url = await uploadFile(file, PUBLISHER_UPLOAD_PATH);
      const saved = await saveHighlight(courseId, url, file.name);
      setHighlight({
        videoUrl: saved.highlightVideoUrl,
        fileName: saved.highlightFileName || file.name,
        fileSize: saved.highlightFileSize,
        uploadTime: saved.highlightUploadTime || "",
        file: null,
        uploading: false,
        error: "",
      });
      toast.success(t.highlightSaved);
    } catch {
      setHighlight((p) => ({ ...p, uploading: false, error: t.highlightUploadFailed }));
    }
  };

  const removeHighlight = async () => {
    if (courseId === null) return;
    setHighlight((p) => ({ ...p, uploading: true, error: "" }));
    try {
      await saveHighlight(courseId, "");
      setHighlight({ videoUrl: "", fileName: "", fileSize: null, uploadTime: "", file: null, uploading: false, error: "" });
    } catch {
      setHighlight((p) => ({ ...p, uploading: false }));
    }
  };

  const removeUploadedVideo = async (episodeNo: number) => {
    if (courseId === null) return;
    try {
      await deleteEpisode(courseId, episodeNo);
      updateVideo(episodeNo, {
        file: null,
        duration: "",
        fileError: "",
        uploadStatus: 0,
        uploadProgress: null,
        videoSize: 0,
        videoDuration: 0,
        videoUrl: "",
        fileName: "",
      });
      const uploadedEpisodes = Math.max(0, videos.filter((video) => video.uploadStatus === 1).length - 1);
      updateUploadTask(taskId, {
        uploadedEpisodes,
        progress: videos.length > 0 ? (uploadedEpisodes / videos.length) * 100 : 0,
        status: "paused",
        step: 2,
      });
    } catch {
      // http 已 toast
    }
  };

  const downloadTemplate = async () => {
    if (courseId === null) return;
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
    if (!file || courseId === null) return;
    setTemplateImporting(true);
    try {
      const entries = await parseEpisodeTemplate(file, videos.length);
      if (entries.length === 0) {
        toast.error(t.templateImportEmpty);
        return;
      }
      for (const entry of entries) {
        const res = await saveEpisode({
          courseId,
          episodeNo: entry.episodeNo,
          title: entry.title,
          videoUrl: entry.videoUrl,
          fileName: entry.fileName,
        });
        const patch: Partial<VideoRow> = {
          file: null,
          duration: "",
          fileError: "",
          uploadStatus: res.uploadStatus,
          uploadProgress: null,
          videoSize: res.videoSize,
          videoDuration: res.videoDuration,
          videoUrl: entry.videoUrl,
          fileName: entry.fileName,
        };
        if (entry.title) patch.title = entry.title;
        updateVideo(entry.episodeNo, patch);
      }
      const importedEpisodes = new Set(entries.map((entry) => entry.episodeNo));
      const alreadyUploaded = videos.filter((video) => video.uploadStatus === 1 && !importedEpisodes.has(video.episodeNo)).length;
      const uploadedEpisodes = alreadyUploaded + entries.length;
      updateUploadTask(taskId, {
        uploadedEpisodes,
        progress: videos.length > 0 ? (uploadedEpisodes / videos.length) * 100 : 0,
        step: uploadedEpisodes >= videos.length && videos.length > 0 ? 3 : 2,
        status: uploadedEpisodes >= videos.length && videos.length > 0 ? "ready" : "paused",
      });
      toast.success(fmt(t.templateImportSuccess, { n: entries.length }));
    } catch {
      toast.error(t.templateImportFailed);
    } finally {
      setTemplateImporting(false);
      if (templateInputRef.current) templateInputRef.current.value = "";
    }
  };

  /** Step3 → publish 送审（上架固定立即上架，不再暴露上架设置） */
  const handleSubmit = async () => {
    if (courseId === null || submitting) return;
    if (!highlight.videoUrl) {
      setHighlight((p) => ({ ...p, error: t.highlightRequired }));
      toast.error(t.highlightRequired);
      return;
    }
    setSubmitting(true);
    try {
      await publishCourse({
        courseId,
        publishScope: pubConfig.publishScope,
        onShelfNow: true,
      });
      removeCachedPubConfig(courseId);
      toast.success(t.submitSuccess);
      onSubmitted();
    } catch (err) {
      if (isPublishError(err, "publisher_course_basic_incomplete")) {
        setStep(1);
      } else if (isPublishError(err, "publisher_course_upload_all_first")) {
        setStep(2);
      } else if (isPublishError(err, "publisher_course_highlight_required")) {
        setHighlight((p) => ({ ...p, error: t.highlightRequired }));
      } else if (isPublishError(err, "publisher_course_not_submittable")) {
        onSubmitted();
      }
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  };

  const steps = [{ label: t.step1 }, { label: t.step2 }, { label: t.step3 }];
  const phoneLabels = { home: t.phoneHome, forYou: t.phoneForYou, me: t.phoneMe };
  const uploadedCount = videos.filter((v) => v.uploadStatus === 1).length;
  const selectedVideoCount = videos.filter((v) => v.file).length;
  const priceTotalPage = Math.max(1, Math.ceil(priceRows.length / PRICE_RULE_PAGE_SIZE));
  const safePricePage = Math.min(pricePage, priceTotalPage);
  const pagedPriceRows = priceRows.slice(
    (safePricePage - 1) * PRICE_RULE_PAGE_SIZE,
    safePricePage * PRICE_RULE_PAGE_SIZE,
  );

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => {
            if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
            else onCancel();
          }}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: "1.0625rem" }}>
          {t.uploadTitle}
        </h2>
        {courseId !== null && (
          <button
            type="button"
            onClick={() => {
              if (taskSnapshot?.status !== "uploading") {
                updateUploadTask(taskId, {
                  courseId,
                  title: basicInfo.name,
                  totalEpisodes: videos.length,
                  uploadedEpisodes: uploadedCount,
                  selectedEpisodes: pendingFilesRef.current.size,
                  currentEpisode: null,
                  currentFileProgress: 0,
                  progress: videos.length > 0 ? (uploadedCount / videos.length) * 100 : 0,
                  step,
                  status: uploadedCount >= videos.length && videos.length > 0 ? "ready" : "paused",
                });
              }
              onCancel();
            }}
            className="ml-auto inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 transition-colors hover:bg-gray-50"
            style={{ fontWeight: 600 }}
          >
            <PauseCircle className="h-3.5 w-3.5" />
            {common.pauseUpload}
          </button>
        )}
      </div>

      {draftRestored && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 mb-5">
          <RotateCcw className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-amber-700">{t.draftRestored}</p>
            <p className="text-xs text-amber-600/90 mt-0.5">{t.draftRestoredReselect}</p>
          </div>
          <button
            onClick={() => void discardDraft()}
            className="text-xs text-amber-600 hover:text-amber-800 underline flex-shrink-0"
            style={{ fontWeight: 500 }}
          >
            {t.draftStartFresh}
          </button>
        </div>
      )}

      <div className="mb-8" style={{ maxWidth: 520 }}>
        <StepIndicator steps={steps} current={step - 1} />
      </div>

      {/* ── Step 1 基本信息 ── */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col max-w-4xl">
          <div className="flex flex-1 min-h-0">
            {/* 封面 */}
            <div
              className="w-[200px] flex-shrink-0 flex flex-col items-center justify-start p-5 gap-3"
              style={{ background: "#F8F8F9", borderRight: "1px solid #F0F0F0" }}
            >
              <p className="text-xs text-gray-500 self-start" style={{ fontWeight: 600 }}>
                {t.coverLabel} <span className="text-red-500">*</span>
              </p>
              <div
                onClick={() => !coverUploading && coverRef.current?.click()}
                className="mx-auto rounded-2xl overflow-hidden cursor-pointer transition-all group"
                style={{
                  width: 140,
                  height: 197,
                  background: "#ECECEE",
                  border: `2px dashed ${coverError ? "#EF4444" : "#D1D5DB"}`,
                  position: "relative",
                }}
              >
                {coverUploading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : basicInfo.cover ? (
                  <>
                    <img src={basicInfo.cover} alt={t.coverLabel} className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        bi({ cover: "" });
                        setCoverError("");
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 group-hover:bg-gray-100 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Upload className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-[11px] text-gray-400 text-center leading-tight px-3">{t.coverPrompt}</span>
                    <span className="text-[10px] text-gray-300 bg-white/60 px-2 py-0.5 rounded-full">
                      {t.coverRatio}
                    </span>
                  </div>
                )}
              </div>
              <input
                ref={coverRef}
                type="file"
                accept={IMAGE_ACCEPT}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  void onPickCover(f);
                }}
                className="hidden"
              />
              {coverError ? (
                <p className="text-[10px] text-red-500 text-center leading-relaxed">{coverError}</p>
              ) : (
                <p className="text-[10px] text-gray-400 text-center leading-relaxed">{t.coverHint}</p>
              )}
            </div>

            {/* 字段 */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              <Field label={t.nameLabel} required hint={t.nameLangHint} hintClassName="text-red-500">
                <input
                  type="text"
                  value={basicInfo.name}
                  onChange={(e) => bi({ name: e.target.value })}
                  placeholder={t.namePlaceholder}
                  className={inputClass(false)}
                  maxLength={NAME_LIMIT}
                />
              </Field>

              <Field label={t.descLabel} required hint={t.descLangHint} hintClassName="text-red-500">
                <div className="relative">
                  <textarea
                    value={basicInfo.description}
                    onChange={(e) => {
                      if (e.target.value.length <= DESC_LIMIT) bi({ description: e.target.value });
                    }}
                    placeholder={t.descPlaceholder}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm outline-none hover:border-gray-400 focus:border-black focus:ring-1 focus:ring-black transition-all resize-none"
                  />
                  <span className="absolute bottom-2.5 right-3 text-xs text-gray-400">
                    {basicInfo.description.length}/{DESC_LIMIT}
                  </span>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label={t.episodesLabel} required hint={t.episodesLockHint}>
                  <input
                    type="number"
                    min="1"
                    value={basicInfo.totalEpisodes}
                    disabled={plannedLocked}
                    onChange={(e) => bi({ totalEpisodes: e.target.value })}
                    placeholder={t.episodesPlaceholder}
                    className={`${inputClass(false)} ${plannedLocked ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}`}
                  />
                </Field>
                <Field label={t.channelLabel} required>
                  <div className="flex gap-2">
                    {CHANNEL_VALUES.map((c) => {
                      const active = basicInfo.channel === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => bi({ channel: c })}
                          className="flex-1 py-2.5 rounded-lg text-sm border transition-all"
                          style={{
                            background: active ? "#111111" : "white",
                            color: active ? "white" : "#374151",
                            borderColor: active ? "#111111" : "#E5E7EB",
                            fontWeight: active ? 600 : 500,
                          }}
                        >
                          {t.channels[c]}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>

              {/* 剧集语言（单选，移到 step1） */}
              <Field label={t.langLabel} required>
                <select
                  value={basicInfo.languageType}
                  onChange={(e) => bi({ languageType: e.target.value, classificationId: null, tags: [] })}
                  className={inputClass(false)}
                >
                  <option value="">{t.langPlaceholder}</option>
                  {languages.map((l) => (
                    <option key={l.language} value={l.language}>
                      {l.languageName}
                    </option>
                  ))}
                </select>
              </Field>

              {/* 类别（按语言取 classifications 接口） */}
              <Field label={t.classificationLabel} required>
                {!basicInfo.languageType ? (
                  <p className="text-xs text-gray-400">{t.classificationSelectLangFirst}</p>
                ) : classificationsLoading ? (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {t.readingDuration}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {classificationOptions.map((item) => {
                      const selected = basicInfo.classificationId === item.classificationId;
                      return (
                        <button
                          key={item.classificationId}
                          type="button"
                          onClick={() => bi({ classificationId: item.classificationId })}
                          className="px-2.5 py-1 rounded-lg text-xs border transition-all"
                          style={{
                            background: selected ? "#111111" : "#FAFAFA",
                            color: selected ? "white" : "#6B7280",
                            borderColor: selected ? "#111111" : "#E5E7EB",
                            fontWeight: selected ? 600 : 400,
                          }}
                        >
                          {item.classificationName}
                        </button>
                      );
                    })}
                    {classificationOptions.length === 0 && (
                      <p className="text-xs text-gray-400">{t.classificationEmpty}</p>
                    )}
                  </div>
                )}
              </Field>

              {/* 标签（按语言取 labels 接口） */}
              <Field label={t.tagsLabel} required>
                {!basicInfo.languageType ? (
                  <p className="text-xs text-gray-400">{t.tagsSelectLangFirst}</p>
                ) : labelsLoading ? (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {t.readingDuration}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {labelOptions.map((tv) => {
                      const selected = basicInfo.tags.includes(tv);
                      return (
                        <button
                          key={tv}
                          type="button"
                          onClick={() => {
                            const tags = selected
                              ? basicInfo.tags.filter((x) => x !== tv)
                              : [...basicInfo.tags, tv];
                            bi({ tags });
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs border transition-all"
                          style={{
                            background: selected ? "#111111" : "#FAFAFA",
                            color: selected ? "white" : "#6B7280",
                            borderColor: selected ? "#111111" : "#E5E7EB",
                            fontWeight: selected ? 600 : 400,
                          }}
                        >
                          {tv}
                        </button>
                      );
                    })}
                  </div>
                )}
              </Field>

              <Field label={t.copyrightLabel} required>
                <div className="flex gap-5">
                  {[
                    { val: 1, label: t.copyrightSelf },
                    { val: 2, label: t.copyrightLicensed },
                  ].map((opt) => (
                    <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => bi({ copyrightType: opt.val })}
                        className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: basicInfo.copyrightType === opt.val ? "#111111" : "#D1D5DB" }}
                      >
                        {basicInfo.copyrightType === opt.val && <div className="w-2 h-2 rounded-full bg-[#111111]" />}
                      </div>
                      <span
                        className="text-sm text-gray-700"
                        style={{ fontWeight: basicInfo.copyrightType === opt.val ? 600 : 400 }}
                      >
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </Field>

              {/* 自制/授权均须上传版权证明（图片/PDF/Word，走 /publisher/course/upload） */}
              <Field label={t.copyrightProofLabel} required>
                <CopyrightProofUpload
                  t={t}
                  value={basicInfo.copyrightProof}
                  onChange={(url) => bi({ copyrightProof: url })}
                />
              </Field>
            </div>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/40 flex-shrink-0">
            <span className="text-xs text-gray-400">{t.stepFooter1}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={onCancel}
                className="px-5 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-gray-50"
                style={{ fontWeight: 500 }}
              >
                {t.cancel}
              </button>
              <button
                onClick={() => void goStep2()}
                disabled={!step1Valid || savingBasic}
                className="px-5 py-2 rounded-xl text-white text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ background: "#111111", fontWeight: 600 }}
              >
                {savingBasic && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {t.next}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2 上传剧集 ── */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden max-w-4xl">
          {/* 工具栏：进度 + 下载模版 / 批量上传（Figma 15607:16524，位于表格上方） */}
          <div className="flex flex-col gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/30 sm:flex-row sm:items-center sm:justify-between">
            <span
              className="text-xs whitespace-nowrap min-w-0"
              style={{
                fontWeight: 500,
                color: selectedVideoCount + uploadedCount >= videos.length && videos.length > 0 ? "#16A34A" : "#6B7280",
              }}
            >
              {fmt(t.uploadSummary, { total: videos.length, selected: selectedVideoCount + uploadedCount })}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <input
                ref={templateInputRef}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={(e) => void importTemplate(e.target.files?.[0])}
              />
              <input
                ref={batchVideoInputRef}
                type="file"
                accept={VIDEO_ACCEPT}
                multiple
                disabled={uploadingEps}
                className="hidden"
                onChange={(e) => {
                  onPickBatchVideos(e.target.files);
                  e.target.value = "";
                }}
              />
              <input
                ref={folderInputRef}
                type="file"
                accept={VIDEO_ACCEPT}
                multiple
                disabled={uploadingEps}
                className="hidden"
                onChange={(e) => {
                  onPickBatchVideos(e.target.files);
                  e.target.value = "";
                }}
              />
              {/* <button
                type="button"
                onClick={() => void downloadTemplate()}
                disabled={templateDownloading || uploadingEps}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-60 inline-flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
                style={{ fontWeight: 500 }}
              >
                {templateDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {t.downloadTemplate}
              </button>  */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={uploadingEps}
                    className="px-3 py-1.5 rounded-lg text-white text-xs hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
                    style={{ background: "#374151", fontWeight: 500 }}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {t.batchUpload}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[168px]">
                  <DropdownMenuItem onSelect={() => batchVideoInputRef.current?.click()}>
                    <Files />
                    {t.batchUploadEpisodes}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => folderInputRef.current?.click()}>
                    <FolderOpen />
                    {t.uploadFolder}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[680px]">
              <div className="grid grid-cols-[72px_1fr_1fr_100px_90px_90px] gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
                {[t.colEp, t.colEpTitle, t.colVideoFile, t.colSize, t.colDuration, t.colStatus].map((col, i) => (
                  <span key={i} className="text-xs text-gray-500" style={{ fontWeight: 500 }}>
                    {col}
                  </span>
                ))}
              </div>
              <div className="divide-y divide-gray-50 max-h-[460px] overflow-y-auto">
                {videos.map((v) => {
                  const isUploaded = v.uploadStatus === 1;
                  const isUploading = v.file !== null && v.uploadProgress !== null;
                  const isMerging =
                    isUploading &&
                    taskSnapshot?.status === "uploading" &&
                    taskSnapshot.currentEpisode === v.episodeNo &&
                    taskSnapshot.currentFilePhase === "merging";
                  return (
                    <div
                      key={v.episodeNo}
                      className="grid grid-cols-[72px_1fr_1fr_100px_90px_90px] gap-3 items-center px-5 py-3 hover:bg-gray-50/50"
                    >
                      <div className="flex items-center justify-center min-w-0 px-2 h-8 rounded-lg bg-gray-100 flex-shrink-0">
                        <span className="text-xs text-gray-700 whitespace-nowrap" style={{ fontWeight: 700 }}>
                          {fmt(t.epLabelN, { ep: v.episodeNo })}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={v.title}
                        onChange={(e) => updateVideo(v.episodeNo, { title: e.target.value.slice(0, EPISODE_TITLE_LIMIT) })}
                        disabled={uploadingEps}
                        placeholder={fmt(t.epTitlePlaceholder, { ep: v.episodeNo })}
                        maxLength={EPISODE_TITLE_LIMIT}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none hover:border-gray-400 focus:border-black transition-all min-w-0"
                      />
                      <div>
                        <input
                          ref={v.fileRef}
                          type="file"
                          accept={VIDEO_ACCEPT}
                          disabled={uploadingEps}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            e.target.value = "";
                            onPickVideo(v.episodeNo, f);
                          }}
                          className="hidden"
                        />
                        {v.fileError ? (
                          <div className="flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                            <span className="text-xs text-red-500 truncate">{v.fileError}</span>
                            <button
                              onClick={() => updateVideo(v.episodeNo, { fileError: "" })}
                              disabled={uploadingEps}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-50 flex-shrink-0 ml-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : v.file ? (
                          <div className="flex items-center gap-2">
                            <Film className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-700 truncate flex-1 max-w-[140px]">{v.file.name}</span>
                            <button
                              onClick={() => clearSelectedVideo(v.episodeNo)}
                              disabled={uploadingEps}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-50 flex-shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : isUploaded ? (
                          <div className="flex items-center gap-2">
                            <Film className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-700 truncate flex-1 max-w-[120px]">
                              {v.fileName || fileNameFromUrl(v.videoUrl) || fmt(t.epLabelN, { ep: v.episodeNo })}
                            </span>
                            <button
                              onClick={() => v.fileRef.current?.click()}
                              disabled={uploadingEps}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 hover:border-gray-400 disabled:opacity-50 flex-shrink-0"
                              style={{ fontWeight: 500 }}
                            >
                              <Upload className="w-3 h-3" />
                              {t.epActionReplace}
                            </button>
                            <button
                              onClick={() => void removeUploadedVideo(v.episodeNo)}
                              disabled={uploadingEps}
                              className="text-gray-400 hover:text-red-500 disabled:opacity-50 flex-shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => v.fileRef.current?.click()}
                            disabled={uploadingEps}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 hover:border-gray-400 disabled:opacity-50"
                            style={{ fontWeight: 500 }}
                          >
                            <Upload className="w-3.5 h-3.5" />
                            {t.chooseFile}
                          </button>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {v.file ? formatBytes(v.file.size) : formatBytes(v.videoSize)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {v.file ? v.duration || t.readingDuration : formatDuration(v.videoDuration)}
                      </span>
                      <span
                        className="text-xs flex items-center gap-1"
                        style={{
                          color: v.fileError
                            ? "#EF4444"
                            : isUploading
                              ? "#4F46E5"
                            : isUploaded
                              ? "#16A34A"
                              : v.file
                                ? "#16A34A"
                                : "#9CA3AF",
                          fontWeight: v.file || v.fileError || isUploaded ? 500 : 400,
                        }}
                      >
                        {isUploading && <Loader2 className="w-3 h-3 animate-spin" />}
                        {isMerging
                          ? t.epMerging
                          : isUploading
                            ? `${t.epUploading} ${v.uploadProgress}%`
                            : v.fileError
                              ? t.epStatusError
                              : isUploaded
                                ? t.epStatusUploaded
                                : v.file
                                  ? t.epStatusReady
                                  : t.epStatusPending}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 px-5 py-3.5 border-t border-gray-100 bg-gray-50/40 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {fmt(t.episodesBreadcrumbCount, { total: videos.length, done: uploadedCount })}
              {selectedVideoCount > 0 && ` · ${fmt(t.uploadSummary, { total: videos.length, selected: selectedVideoCount })}`}
            </span>
            <div className="flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setStep(1)}
                disabled={uploadingEps}
                className="px-5 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontWeight: 500 }}
              >
                {t.prev}
              </button>
              {uploadingEps && (
                <button
                  type="button"
                  onClick={stopEpisodeUpload}
                  className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm hover:bg-red-50 inline-flex items-center gap-2"
                  style={{ fontWeight: 600 }}
                >
                  <Square className="w-3.5 h-3.5" fill="currentColor" />
                  {t.stopUpload}
                </button>
              )}
              <button
                onClick={() => void goStep3()}
                disabled={uploadingEps}
                className="px-5 py-2 rounded-xl text-white text-sm hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
                style={{ background: "#111111", fontWeight: 600 }}
              >
                {uploadingEps && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {uploadingEps
                  ? taskSnapshot?.currentFilePhase === "merging"
                    ? t.epMerging
                    : t.epUploading
                  : t.next}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3 发布配置：高光 → 发布范围 → 各国收费规则（默认立即上架） ── */}
      {step === 3 && (
        <div className="max-w-4xl space-y-5">
          {/* 高光时刻（置顶） */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm text-gray-900 mb-4" style={{ fontWeight: 700 }}>
              {t.uploadHighlight} <span className="text-red-500">*</span>
            </h3>
            <input
              ref={highlightRef}
              type="file"
              accept={HIGHLIGHT_ACCEPT}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                void onPickHighlight(f);
              }}
            />
            {highlight.videoUrl ? (
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <Film className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-gray-800" style={{ fontWeight: 600 }}>
                    {highlight.fileName || fileNameFromUrl(highlight.videoUrl)}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {highlight.fileSize !== null ? formatBytes(highlight.fileSize) : "—"}{" "}
                    {highlight.uploadTime ? `· ${highlight.uploadTime}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => highlightRef.current?.click()}
                  disabled={highlight.uploading}
                  className="text-xs text-gray-500 hover:text-gray-900 disabled:opacity-50"
                  style={{ fontWeight: 500 }}
                >
                  {highlight.uploading ? t.highlightUploading : t.epActionReplace}
                </button>
                <button
                  type="button"
                  onClick={() => void removeHighlight()}
                  disabled={highlight.uploading}
                  className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => highlightRef.current?.click()}
                disabled={highlight.uploading}
                className="w-full h-[88px] rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-gray-400 transition-colors disabled:opacity-60"
              >
                {highlight.uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                <span className="text-sm">{highlight.uploading ? t.highlightUploading : t.uploadHighlight}</span>
              </button>
            )}
            {highlight.error && <p className="mt-2 text-xs text-red-500">{highlight.error}</p>}
          </div>

          {/* 发布范围 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm text-gray-900 mb-1" style={{ fontWeight: 700 }}>
              {t.distSectionTitle}
            </h3>
            <p className="text-xs text-gray-400 mb-5">{t.distSectionDesc}</p>
            <div className="grid grid-cols-2 gap-5">
              {[
                {
                  scope: 1,
                  title: t.optAccountTitle,
                  desc: t.optAccountDesc,
                  highlights: ["account"] as Highlight[],
                  badge: t.optAccountBadge,
                  badgeBg: "#F3F4F6",
                  badgeColor: "#374151",
                  revenueTitle: t.revenueAccountTitle,
                },
                {
                  scope: 2,
                  title: t.optFullTitle,
                  desc: t.optFullDesc,
                  highlights: ["account", "homepage", "foryou"] as Highlight[],
                  badge: t.optFullBadge,
                  badgeBg: "#FFF1F2",
                  badgeColor: "#E8192C",
                  revenueTitle: t.revenueFullTitle,
                },
              ]
                .map((meta) => {
                  const revenue = revenueOptions.find((item) => item.publishScope === meta.scope);
                  return revenue ? { ...meta, revenue } : null;
                })
                .filter((opt): opt is {
                  scope: number;
                  title: string;
                  desc: string;
                  highlights: Highlight[];
                  badge: string;
                  badgeBg: string;
                  badgeColor: string;
                  revenueTitle: string;
                  revenue: RevenueOption;
                } => opt !== null)
                .map((opt) => {
                const active = pubConfig.publishScope === opt.scope;
                const rows = [
                  { label: t.platform, val: `${opt.revenue.platformRatio}%` },
                  { label: t.producer, val: `${opt.revenue.creatorRatio}%`, highlight: true },
                ];
                return (
                  <div
                    key={opt.scope}
                    onClick={() => setPubConfig((p) => ({ ...p, publishScope: opt.scope }))}
                    className="rounded-2xl border-2 p-5 cursor-pointer transition-all"
                    style={{ borderColor: active ? "#111111" : "#E5E7EB", background: active ? "#FAFAFA" : "white" }}
                  >
                    <div className="flex items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <div
                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                            style={{ borderColor: active ? "#111111" : "#D1D5DB" }}
                          >
                            {active && <div className="w-2 h-2 rounded-full bg-[#111111]" />}
                          </div>
                          <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>
                            {opt.title}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs flex-shrink-0"
                            style={{ background: opt.badgeBg, color: opt.badgeColor, fontWeight: 500 }}
                          >
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed pl-6">{opt.desc}</p>
                      </div>
                    </div>
                    <div className="flex justify-center py-2">
                      <PhoneMockup
                        highlights={opt.highlights}
                        dramaName={basicInfo.name}
                        labels={phoneLabels}
                        homepageLabel={t.tagHomepage}
                        placeholderName={t.nameLabel}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {opt.highlights.map((h) => (
                        <span
                          key={h}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
                          style={{
                            background: active ? "#111111" : "#F3F4F6",
                            color: active ? "white" : "#6B7280",
                            fontWeight: 500,
                          }}
                        >
                          {h === "account" && <User className="w-3 h-3" />}
                          {h === "homepage" && <Home className="w-3 h-3" />}
                          {h === "foryou" && <Sparkles className="w-3 h-3" />}
                          {h === "account" ? t.tagAccount : h === "homepage" ? t.tagHomepage : t.tagForYou}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-700 mb-2.5" style={{ fontWeight: 600 }}>
                        {opt.revenueTitle}
                      </p>
                      <div className="flex gap-3">
                        {rows.map((r, ri) => (
                          <div
                            key={ri}
                            className="flex-1 rounded-lg px-3 py-2"
                            style={{ background: r.highlight ? (active ? "#111111" : "#F3F4F6") : "#F9FAFB" }}
                          >
                            <p
                              className="text-xs mb-0.5"
                              style={{ color: r.highlight && active ? "rgba(255,255,255,0.7)" : "#9CA3AF" }}
                            >
                              {r.label}
                            </p>
                            <p
                              className="text-sm"
                              style={{ fontWeight: 800, color: r.highlight ? (active ? "white" : "#111111") : "#6B7280" }}
                            >
                              {r.val}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 各国收费规则：默认展开，每页 5 条 */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm text-gray-900 mb-1" style={{ fontWeight: 700 }}>
                {t.pricingTitle}
              </h3>
              <p className="text-xs text-gray-400 mb-4">{t.pricingDesc}</p>
              {priceLoading ? (
                <div className="flex items-center justify-center py-12 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : priceRows.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">{t.emptyTitle}</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] table-fixed text-sm">
                      <colgroup>
                        <col className="w-[160px]" />
                        <col className="w-[120px]" />
                        <col className="w-[120px]" />
                        <col className="w-[120px]" />
                      </colgroup>
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left pb-2 pr-4 text-xs text-gray-500 whitespace-nowrap" style={{ fontWeight: 500 }}>
                            {t.pricingColCountry}
                          </th>
                          <th className="text-left pb-2 pr-4 text-xs text-gray-500 whitespace-nowrap" style={{ fontWeight: 500 }}>
                            {t.pricingColSingle}
                          </th>
                          <th className="text-left pb-2 pr-4 text-xs text-gray-500 whitespace-nowrap" style={{ fontWeight: 500 }}>
                            {t.pricingColWholeLe50}
                          </th>
                          <th className="text-left pb-2 text-xs text-gray-500 whitespace-nowrap" style={{ fontWeight: 500 }}>
                            {t.pricingColWholeGt50}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedPriceRows.map((c) => {
                          const countryName = c.countryName || c.country;
                          return (
                            <tr key={c.country} className="border-b border-gray-50 last:border-0">
                              <td className="py-3 pr-4 min-w-0">
                                <span className="block truncate text-gray-800" title={countryName} style={{ fontWeight: 600 }}>
                                  {countryName}
                                </span>
                              </td>
                              <td className="py-3 pr-4 text-gray-900 whitespace-nowrap" style={{ fontWeight: 700 }}>
                                {formatUsd(c.episodePriceUsd)}
                              </td>
                              <td className="py-3 pr-4 text-gray-900 whitespace-nowrap" style={{ fontWeight: 700 }}>
                                {formatUsd(c.wholePriceLe50Usd)}
                              </td>
                              <td className="py-3 text-gray-900 whitespace-nowrap" style={{ fontWeight: 700 }}>
                                {formatUsd(c.wholePriceGt50Usd)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {priceTotalPage > 1 && (
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        disabled={safePricePage <= 1}
                        onClick={() => setPricePage(Math.max(1, safePricePage - 1))}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="prev page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="min-w-[3.5rem] text-center text-xs text-gray-500" style={{ fontWeight: 600 }}>
                        {safePricePage} / {priceTotalPage}
                      </span>
                      <button
                        type="button"
                        disabled={safePricePage >= priceTotalPage}
                        onClick={() => setPricePage(Math.min(priceTotalPage, safePricePage + 1))}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="next page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50/40">
              <span className="text-xs text-gray-400">{t.stepFooter3}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={onCancel}
                  className="px-5 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-gray-50"
                  style={{ fontWeight: 500 }}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-gray-50"
                  style={{ fontWeight: 500 }}
                >
                  {t.prev}
                </button>
                <button
                  onClick={() => void handleSubmit()}
                  disabled={submitting || revenueOptions.length === 0}
                  className="px-5 py-2 rounded-xl text-white text-sm hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
                  style={{ background: "#111111", fontWeight: 600 }}
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {t.submitPublish}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function isPublishError(err: unknown, key: string): boolean {
  return err instanceof ApiError && err.message.includes(key);
}
