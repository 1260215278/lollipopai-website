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
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import type { ContentMessages } from "../../i18n/content";
import type { CommonMessages } from "../../i18n/common";
import { uploadFile, PUBLISHER_UPLOAD_PATH } from "../../../services/upload";
import { getOssHeicJpgUrl } from "../../../services/heic";
import { ApiError, getApiBizCode } from "../../../services/http";
import {
  AuditStatus,
  saveBasic,
  saveEpisode,
  publishCourse,
  fetchDraft,
  fetchLabels,
  fetchGenres,
  fetchExternalPlatforms,
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
  type CourseGenre,
  type CourseLabelGroup,
  type ExternalPlatform,
  type DraftResponse,
} from "../../../services/content";
import { getLanguageTypeList, type LanguageOption } from "../../../services/language";
import { CHANNEL_VALUES, channelToGender, genderToChannel, type ChannelValue } from "../../mock/content";
import type { Highlight } from "./types";
import { StepIndicator } from "../StepIndicator";
import { PhoneMockup } from "./PhoneMockup";
import { CountryPricingModal } from "./CountryPricingModal";
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
  clearTaskAsset,
  getPendingEpisodeMeta,
  getPendingUploadFiles,
  getTaskAsset,
  getUploadTask,
  clearPendingUploadFiles,
  pauseUploadTask,
  removePendingUploadFile,
  setPendingEpisodeMeta,
  setPendingUploadFile,
  startTaskAssetUpload,
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

/**
 * 自制确权材料类型（UI 二选一，落库仍走 copyrightProof）：
 * 1 作品登记证书 / 2 成片可信时间戳
 * 20260929 稿件 18033-780 去掉了原来的「AI 工程截图（4–20 张）」这一项。
 */
type SelfProofKind = 1 | 2;
const SELF_PROOF = {
  REGISTRATION: 1 as SelfProofKind,
  TIMESTAMP: 2 as SelfProofKind,
};

/**
 * 附加材料可接受的类型 = 后端 PublisherUploadController 的图片/视频/文档白名单。
 * 稿面提到的 PR 工程文件、人物建模源文件不在白名单内（后端会直接 -100 拒收），
 * 这类源文件走下方「源文件网盘链接」交付，不在此处伪装成可上传。
 */
const EXTRA_MATERIALS_ACCEPT = `${IMAGE_ACCEPT},${VIDEO_ACCEPT},${COPYRIGHT_PROOF_ACCEPT}`;
/** 附加材料条数上限（前端护栏，避免误选整个目录把 extra_materials 撑爆） */
const EXTRA_MATERIALS_MAX = 20;

/**
 * 模版图：列表 56px 缩略图 + 弹层全清预览（Figma 17195:516）。
 * 预览保留源分辨率（AI 3222×1842），不再压到 1200 以免弹层发糊。
 */
const SELF_PROOF_THUMBS: Record<SelfProofKind, string> = {
  1: "/distribution/copyright-templates/work-registration-thumb.webp",
  2: "/distribution/copyright-templates/timestamp-thumb.webp",
};
const SELF_PROOF_PREVIEWS: Record<SelfProofKind, string> = {
  1: "/distribution/copyright-templates/work-registration.webp",
  2: "/distribution/copyright-templates/timestamp.webp",
};

/** 作品登记：截图/PDF；时间戳：PDF */
const SELF_PROOF_ACCEPT: Record<SelfProofKind, string> = {
  1: `${IMAGE_ACCEPT},application/pdf,.pdf`,
  2: "application/pdf,.pdf",
};

/** 多 URL 逗号分隔（copyrightProof 历史数据 / 附加材料 extraMaterials） */
function splitProofUrls(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function joinProofUrls(urls: string[]): string {
  return urls.filter(Boolean).join(",");
}

/** course_label_ids 回显：逗号分隔 id 串 → number[]，非法项丢弃不猜 */
function parseIdList(raw: string | null | undefined): number[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((x) => Number(x.trim()))
    .filter((x) => Number.isInteger(x) && x > 0);
}

/**
 * 老草稿只存了 URL，无法反推是登记证书还是时间戳，统一回落到第一项。
 * 2026-09-29 前用「AI 工程截图」提交的草稿会是多 URL，本次改版后该选项已删除，
 * 这类草稿会因为 proofValid 不通过而要求重新上传一份二选一材料——不静默放行。
 */
function inferSelfProofKind(_proof: string): SelfProofKind {
  return SELF_PROOF.REGISTRATION;
}

function isPublisherBiz(err: unknown, key: string): boolean {
  return getApiBizCode(err) === key;
}

interface BasicInfo {
  /** 竖版封面 9:16 */
  cover: string;
  /** 横版封面 4:3（20260929 稿件新增） */
  coverLandscape: string;
  /** 短剧原名 */
  name: string;
  /** 翻译中文名（20260929 稿件新增） */
  titleTranslated: string;
  description: string;
  totalEpisodes: string;
  /** 总时长（分钟，20260929 稿件新增） */
  totalDuration: string;
  channel: ChannelValue | "";
  /** 剧集语言（单选）：决定类别候选与题材/标签小字翻译的语种 */
  languageType: string;
  classificationId: number | null;
  /** 题材 ID（一级分类，20260929 稿件新增；标签挂在题材下） */
  genreId: number | null;
  /** 标签 ID（后端渲染显示名后写库，前端不再回传标签名） */
  tagIds: number[];
  /** 版权类型 1自制/2授权 */
  copyrightType: number;
  /** 版权证明文件 URL（自制/授权均必填） */
  copyrightProof: string;
  /** 附加材料 URL（可选，逗号分隔多 URL） */
  extraMaterials: string;
  /** 源文件网盘链接（可选） */
  sourceFileUrl: string;
  /** 源文件网盘提取码（可选） */
  sourceFileCode: string;
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

function emptyVideoRow(episodeNo: number): VideoRow {
  return {
    episodeNo,
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
  };
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
  /** 授权平台（Lollipop 分组，必选）1账号主页/2全量推荐 */
  publishScope: number;
  /**
   * 可选外部平台 code（20260929 稿件新增）。
   * 「上架设置（立即上架/暂不上架）」整卡已按稿件删除，过审即立即上架。
   */
  externalPlatforms: string[];
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
  coverLandscape: "",
  name: "",
  titleTranslated: "",
  description: "",
  totalEpisodes: "",
  totalDuration: "",
  channel: "",
  languageType: "",
  classificationId: null,
  genreId: null,
  tagIds: [],
  copyrightType: 1,
  copyrightProof: "",
  extraMaterials: "",
  sourceFileUrl: "",
  sourceFileCode: "",
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
    if (typeof parsed.publishScope !== "number") return null;
    return {
      publishScope: parsed.publishScope,
      // 老缓存里没有这个键（当时还是 onShelfNow），按空数组读，不去猜
      externalPlatforms: Array.isArray(parsed.externalPlatforms)
        ? parsed.externalPlatforms.filter((x): x is string => typeof x === "string")
        : [],
    };
  } catch {
    return null;
  }
}

/**
 * 单文件版权证明上传（授权 / 自制登记证书 / 自制时间戳）。
 * 上传挂在 task store 上：任务切换 / 表单 unmount 后仍继续，完成 URL 写回 onChange。
 */
function CopyrightProofUpload({
  t,
  taskId,
  value,
  onChange,
  accept = COPYRIGHT_PROOF_ACCEPT,
  prompt,
  formatHint,
  emptyHeightClass = "h-[88px]",
}: {
  t: ContentMessages;
  taskId: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  prompt?: string;
  formatHint?: string;
  emptyHeightClass?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  // 订阅全局任务快照，asset 状态变更时会 commit 触发重渲染
  useUploadTasks();
  const asset = getTaskAsset(taskId, "copyrightProof");
  const uploading = asset.status === "uploading";
  // 多 URL（AI 截图）场景下单文件组件只看第一个；切换 kind 会清空
  const singleValue = value.includes(",") ? "" : value;
  const displayUrl = asset.status === "done" && asset.url ? asset.url : singleValue;

  useEffect(() => {
    if (asset.status === "done" && asset.url && asset.url !== singleValue) {
      onChange(asset.url);
    }
  }, [asset.status, asset.url, onChange, singleValue]);

  const pick = (file: File | undefined) => {
    if (!file) return;
    // HEIC 转 JPG URL 在 store 内处理；此处只负责发起
    void startTaskAssetUpload(taskId, "copyrightProof", file);
  };

  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          pick(f);
        }}
      />
      {displayUrl ? (
        <div className="flex items-center gap-3 px-4 h-[45px] rounded-lg border border-gray-200 bg-gray-50">
          <a
            href={displayUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 truncate text-sm text-gray-700 hover:underline"
            title={fileNameFromUrl(displayUrl)}
          >
            {uploading && asset.fileName ? asset.fileName : fileNameFromUrl(displayUrl)}
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
          className={`w-full ${emptyHeightClass} rounded-[14px] border border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 text-gray-500 hover:border-gray-400 transition-colors disabled:opacity-60`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {asset.progress > 0 ? (
                <span className="text-xs text-gray-400">{asset.progress}%</span>
              ) : null}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span className="text-xs" style={{ fontWeight: 500 }}>
                {prompt ?? t.copyrightProofPrompt}
              </span>
              {formatHint ? <span className="text-[10px] text-gray-400">{formatHint}</span> : null}
            </>
          )}
        </button>
      )}
    </div>
  );
}

/**
 * 附加材料多文件上传（稿件 18033-780 ②，可选）。
 * URL 逗号拼接写入 course.extra_materials；图片给缩略预览，其余类型给文件名卡片。
 */
function ExtraMaterialsUpload({
  t,
  value,
  onChange,
}: {
  t: ContentMessages;
  value: string;
  onChange: (joined: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const urls = splitProofUrls(value);
  const canAdd = urls.length < EXTRA_MATERIALS_MAX;

  const pick = async (files: FileList | null) => {
    if (!files || files.length === 0 || !canAdd) return;
    const remaining = EXTRA_MATERIALS_MAX - urls.length;
    const batch = Array.from(files).slice(0, remaining);
    if (batch.length === 0) return;
    setUploading(true);
    setProgress(0);
    const next = [...urls];
    try {
      for (let i = 0; i < batch.length; i++) {
        const file = batch[i];
        const url = await uploadFile(file, PUBLISHER_UPLOAD_PATH);
        next.push(getOssHeicJpgUrl(file, url));
        setProgress(Math.round(((i + 1) / batch.length) * 100));
        onChange(joinProofUrls(next));
      }
    } catch {
      toast.error(t.coverUploadFailed);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeAt = (idx: number) => {
    onChange(joinProofUrls(urls.filter((_, i) => i !== idx)));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-400" style={{ fontWeight: 600 }}>
          {urls.length > 0 ? `${urls.length} / ${EXTRA_MATERIALS_MAX}` : t.extraMaterialsOptional}
        </span>
        {urls.length > 0 && canAdd ? (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-800 disabled:opacity-50"
            style={{ fontWeight: 500 }}
          >
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            {t.extraMaterialsAdd}
          </button>
        ) : null}
      </div>
      <input
        ref={ref}
        type="file"
        accept={EXTRA_MATERIALS_ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          void pick(e.target.files);
          e.target.value = "";
        }}
      />
      {urls.length > 0 ? (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {urls.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group"
            >
              {/^https?:\/\/[^?]+\.(jpg|jpeg|png|gif|bmp|webp)(\?|$)/i.test(url) ? (
                <img src={url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-1.5 text-gray-400">
                  <Files className="w-4 h-4" />
                  <span className="text-[9px] leading-tight text-center break-all line-clamp-2">
                    {fileNameFromUrl(url)}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {canAdd ? (
            <button
              type="button"
              onClick={() => ref.current?.click()}
              disabled={uploading}
              className="aspect-square rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gray-400 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="w-full rounded-[14px] border border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 py-[18px] text-gray-500 hover:border-gray-400 transition-colors disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {progress > 0 ? <span className="text-xs text-gray-400">{progress}%</span> : null}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span className="text-xs" style={{ fontWeight: 500 }}>
                {t.extraMaterialsAdd}
              </span>
              <span className="text-[10px] text-gray-400">{t.extraMaterialsDesc}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

/** 模板预览弹层（Figma 17132:5228 / 17132:5517 / 17195:516） */
function TemplatePreviewModal({
  src,
  caption,
  onClose,
  /** AI 工程截图为宽屏，弹层加宽；证书/时间戳保持竖版合适宽度 */
  wide = false,
}: {
  src: string;
  caption: string;
  onClose: () => void;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full ${wide ? "max-w-[min(1100px,94vw)]" : "max-w-[min(720px,92vw)]"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-600 hover:text-gray-900"
          aria-label="close"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="rounded-2xl overflow-hidden shadow-2xl bg-white">
          <img
            src={src}
            alt=""
            className="w-full max-h-[min(80vh,900px)] object-contain bg-[#f9f6ee]"
            // 高清源图；禁止浏览器默认模糊缩放
            style={{ imageRendering: "auto" }}
            decoding="async"
          />
        </div>
        <p className="mt-3 text-center text-xs text-white/90" style={{ fontWeight: 500 }}>
          {caption}
        </p>
      </div>
    </div>
  );
}

/**
 * 自制确权材料区：三选一卡片 + 对应上传区 + 底部说明（Figma 17195:516）
 */
function SelfCopyrightUpload({
  t,
  taskId,
  kind,
  onKindChange,
  value,
  onChange,
}: {
  t: ContentMessages;
  taskId: string;
  kind: SelfProofKind;
  onKindChange: (k: SelfProofKind) => void;
  value: string;
  onChange: (url: string) => void;
}) {
  const [previewKind, setPreviewKind] = useState<SelfProofKind | null>(null);

  const options: {
    kind: SelfProofKind;
    title: string;
    desc: string;
  }[] = [
    {
      kind: SELF_PROOF.REGISTRATION,
      title: t.selfProofRegistrationTitle,
      desc: t.selfProofRegistrationDesc,
    },
    {
      kind: SELF_PROOF.TIMESTAMP,
      title: t.selfProofTimestampTitle,
      desc: t.selfProofTimestampDesc,
    },
  ];

  return (
    <div className="pt-3 space-y-3">
      <p className="text-xs text-gray-500" style={{ fontWeight: 500 }}>
        {t.selfProofPickHint}
      </p>

      <div className="space-y-2.5">
        {options.map((opt) => {
          const selected = kind === opt.kind;
          return (
            <button
              key={opt.kind}
              type="button"
              onClick={() => onKindChange(opt.kind)}
              className="w-full rounded-[14px] border overflow-hidden text-left transition-colors"
              style={{
                borderColor: selected ? "#111111" : "#E5E7EB",
                background: selected ? "#FAFAFA" : "#FFFFFF",
                borderWidth: selected ? 1.85 : 1,
              }}
            >
              <div className="flex items-center">
                <div
                  className="p-2.5 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewKind(opt.kind);
                  }}
                >
                  <div className="relative w-14 h-14 rounded-[14px] overflow-hidden bg-[#f9f6ee]">
                    <img
                      src={SELF_PROOF_THUMBS[opt.kind]}
                      alt=""
                      className="w-full h-full object-cover opacity-80"
                    />
                    <span
                      className="absolute left-1 bottom-1 rounded px-1 py-0.5 text-white bg-black/50 leading-none whitespace-nowrap"
                      style={{ fontSize: 8, fontWeight: 600 }}
                    >
                      {t.selfProofTemplateBadge}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-3.5 py-3">
                  <div
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: selected ? "#111111" : "#D1D5DB" }}
                  >
                    {selected ? <div className="w-2 h-2 rounded-full bg-[#111111]" /> : null}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 600 }}>
                      {opt.title}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">{opt.desc}</p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <CopyrightProofUpload
        t={t}
        taskId={taskId}
        value={value}
        onChange={onChange}
        accept={SELF_PROOF_ACCEPT[kind]}
        prompt={t.selfProofUploadFile}
        emptyHeightClass="h-[52px]"
      />

      <div className="rounded-[14px] border border-amber-200 bg-amber-50 px-3.5 py-2.5">
        <p className="text-[10px] text-amber-900 leading-[16px]">{t.selfProofNote}</p>
      </div>

      {previewKind !== null ? (
        <TemplatePreviewModal
          src={SELF_PROOF_PREVIEWS[previewKind]}
          caption={t.selfProofTemplateCaption}
          onClose={() => setPreviewKind(null)}
        />
      ) : null}
    </div>
  );
}

/**
 * 上剧流程（三步，分步草稿暂存）：
 *  Step1 基本信息 → POST saveBasic（含语言/标签，返回 courseId）
 *  Step2 上传剧集 → 每个视频切片上传 → POST saveEpisode（同 episodeNo 覆盖）
 *  Step3 发布配置 → POST publish（高光 + 发布范围 + 上架意向 + 各国收费规则）
 * 进入时自动恢复服务端草稿或已驳回短剧（GET draft）。
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
  /** 自制确权材料类型（仅 UI；落库仅 copyrightProof） */
  const [selfProofKind, setSelfProofKind] = useState<SelfProofKind>(SELF_PROOF.REGISTRATION);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [pubConfig, setPubConfig] = useState<PublishConfigState>({
    publishScope: 1,
    externalPlatforms: [],
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
  const [labelGroups, setLabelGroups] = useState<CourseLabelGroup[]>([]);
  const [genreOptions, setGenreOptions] = useState<CourseGenre[]>([]);
  const [classificationOptions, setClassificationOptions] = useState<CourseClassification[]>([]);
  const [externalPlatformOptions, setExternalPlatformOptions] = useState<ExternalPlatform[]>([]);
  const [labelsLoading, setLabelsLoading] = useState(false);
  const [genresLoading, setGenresLoading] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [classificationsLoading, setClassificationsLoading] = useState(false);

  const [coverError, setCoverError] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverLandscapeError, setCoverLandscapeError] = useState("");
  const [coverLandscapeUploading, setCoverLandscapeUploading] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [auditStatus, setAuditStatus] = useState<number | null>(resumeCourseId === null ? AuditStatus.DRAFT : null);
  const [auditRemark, setAuditRemark] = useState<string | null>(null);
  const [savedPlanned, setSavedPlanned] = useState(0);
  const [nameError, setNameError] = useState(false);
  const [reduceConfirm, setReduceConfirm] = useState<{ from: number; to: number } | null>(null);
  const [priceRows, setPriceRows] = useState<PriceRuleCountry[]>([]);
  const [priceLoading, setPriceLoading] = useState(false);
  const [revenueOptions, setRevenueOptions] = useState<RevenueOption[]>([]);
  const [savingBasic, setSavingBasic] = useState(false);
  const [uploadingEps, setUploadingEps] = useState(false);
  const [templateDownloading, setTemplateDownloading] = useState(false);
  const [templateImporting, setTemplateImporting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const coverRef = useRef<HTMLInputElement>(null);
  const coverLandscapeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);
  const batchVideoInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const highlightRef = useRef<HTMLInputElement>(null);
  const restoredPubConfigCourse = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const pendingFilesRef = useRef<Map<number, File>>(getPendingUploadFiles(taskId));
  const taskSnapshot = useUploadTasks().find((task) => task.id === taskId) ?? null;
  const copyrightAsset = getTaskAsset(taskId, "copyrightProof");
  const highlightAsset = getTaskAsset(taskId, "highlight");

  const bi = (field: Partial<BasicInfo>) => setBasicInfo((p) => ({ ...p, ...field }));

  const isRejected = auditStatus === AuditStatus.REJECTED;
  /** 草稿选定计划集数后锁定；驳回态可改 */
  const plannedLocked = auditStatus === AuditStatus.DRAFT && courseId !== null;

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

  // Step3 进入时加载各国收费规则（稿件 18033-1599：footer 入口弹层展示）
  useEffect(() => {
    if (step !== 3) return;
    let active = true;
    setPriceLoading(true);
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

  // 任务切换回来：用 store 中已完成的版权证明 URL 回填（saveBasic 前仅存会话内存）
  // 版权证明现在恒为单文件（二选一），附加材料走自己的 state，不与该 asset 混用
  useEffect(() => {
    if (copyrightAsset.status === "done" && copyrightAsset.url && copyrightAsset.url !== basicInfo.copyrightProof) {
      bi({ copyrightProof: copyrightAsset.url });
    }
  }, [copyrightAsset.status, copyrightAsset.url, basicInfo.copyrightProof]);

  // 高光上传在 store 内跑：切换任务再进时同步 uploading / 完成 / 失败，避免本地 state 卡死
  useEffect(() => {
    if (highlightAsset.status === "uploading") {
      setHighlight((p) => ({
        ...p,
        uploading: true,
        error: "",
        fileName: highlightAsset.fileName || p.fileName,
      }));
      return;
    }
    if (highlightAsset.status === "done" && highlightAsset.url) {
      setHighlight({
        videoUrl: highlightAsset.url,
        fileName: highlightAsset.fileName,
        fileSize: highlightAsset.fileSize,
        uploadTime: highlightAsset.uploadTime,
        file: null,
        uploading: false,
        error: "",
      });
      return;
    }
    if (highlightAsset.status === "failed") {
      setHighlight((p) => ({
        ...p,
        uploading: false,
        error: highlightAsset.error || t.highlightUploadFailed,
      }));
      return;
    }
    // idle：仅清掉「上传中」假态，不抹掉草稿/已保存 URL
    setHighlight((p) => (p.uploading ? { ...p, uploading: false } : p));
  }, [
    highlightAsset.status,
    highlightAsset.url,
    highlightAsset.fileName,
    highlightAsset.fileSize,
    highlightAsset.uploadTime,
    highlightAsset.error,
    t.highlightUploadFailed,
  ]);

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
        const rejected = draft.auditStatus === AuditStatus.REJECTED;
        setAuditStatus(draft.auditStatus);
        setAuditRemark(draft.auditRemark);
        setSavedPlanned(c.plannedEpisodes || 0);
        if (rejected && draft.publish) {
          restoredPubConfigCourse.current = c.courseId;
          setPubConfig({
            publishScope: draft.publish.publishScope,
            externalPlatforms: draft.publish.externalPlatforms ?? [],
          });
        }
        const existingTask = getUploadTask(taskId);
        // 以 store 实时快照为准（勿用 remount 前的过期 Map 副本）
        const storedFiles = getPendingUploadFiles(taskId);
        const storedMeta = getPendingEpisodeMeta(taskId);
        pendingFilesRef.current = new Map(storedFiles);

        setCourseId(c.courseId);
        setBasicInfo({
          cover: c.titleImg || "",
          coverLandscape: c.coverLandscape || "",
          name: c.title || "",
          titleTranslated: c.titleTranslated || "",
          description: c.details || "",
          totalEpisodes: c.plannedEpisodes ? String(c.plannedEpisodes) : "",
          totalDuration: c.totalDuration ? String(c.totalDuration) : "",
          channel: genderToChannel(c.genderType),
          languageType: c.languageType || "",
          classificationId: c.classificationId ?? null,
          genreId: c.genreId ?? null,
          tagIds: parseIdList(c.courseLabelIds),
          copyrightType: c.copyrightType || 1,
          copyrightProof: c.copyrightProof || "",
          extraMaterials: c.extraMaterials || "",
          sourceFileUrl: c.sourceFileUrl || "",
          sourceFileCode: c.sourceFileCode || "",
        });
        setSelfProofKind(inferSelfProofKind(c.copyrightProof || ""));
        // 草稿高光 + store 进行中/已完成态合并：store 优先（任务切换后后台刚传完）
        const liveHighlight = getTaskAsset(taskId, "highlight");
        if (liveHighlight.status === "done" && liveHighlight.url) {
          setHighlight({
            videoUrl: liveHighlight.url,
            fileName: liveHighlight.fileName,
            fileSize: liveHighlight.fileSize,
            uploadTime: liveHighlight.uploadTime,
            file: null,
            uploading: false,
            error: "",
          });
        } else if (liveHighlight.status === "uploading") {
          setHighlight((p) => ({
            ...p,
            videoUrl: c.highlightVideoUrl || p.videoUrl,
            fileName: liveHighlight.fileName || c.highlightFileName || "",
            fileSize: c.highlightFileSize ?? null,
            uploadTime: c.highlightUploadTime || "",
            uploading: true,
            error: "",
          }));
        } else {
          setHighlight((p) => ({
            ...p,
            videoUrl: c.highlightVideoUrl || "",
            fileName: c.highlightFileName || "",
            fileSize: c.highlightFileSize ?? null,
            uploadTime: c.highlightUploadTime || "",
            uploading: false,
          }));
        }
        const liveCopyright = getTaskAsset(taskId, "copyrightProof");
        if (liveCopyright.status === "done" && liveCopyright.url) {
          setBasicInfo((prev) => ({ ...prev, copyrightProof: liveCopyright.url }));
        }
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
          step:
            existingTask?.step ??
            (rejected ? 1 : uploadedEpisodes >= totalEpisodes && totalEpisodes > 0 ? 3 : 2),
          status: isUploading
            ? "uploading"
            : existingTask?.status === "failed"
              ? "failed"
              : uploadedEpisodes >= totalEpisodes && totalEpisodes > 0
                ? "ready"
                : "paused",
        });
        setDraftRestored(true);
        if (rejected && existingTask?.step == null) setStep(1);
        else if (existingTask?.step) setStep(existingTask.step);
      })
      .catch((err) => {
        if (
          isPublisherBiz(err, "publisher_course_no_auth") ||
          isPublisherBiz(err, "publisher_course_not_editable")
        ) {
          onSubmitted();
        }
      });
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

  // 主语言变化时加载题材 / 标签分组 / 类别 / 外部平台（题材与标签语言无关，仅显示名按主语言渲染）
  useEffect(() => {
    if (!basicInfo.languageType) {
      setLabelGroups([]);
      setGenreOptions([]);
      setClassificationOptions([]);
      setExternalPlatformOptions([]);
      return;
    }
    setGenresLoading(true);
    fetchGenres(basicInfo.languageType)
      .then((opts) => setGenreOptions(opts))
      .catch(() => setGenreOptions([]))
      .finally(() => setGenresLoading(false));
    setLabelsLoading(true);
    fetchLabels(basicInfo.languageType)
      .then((groups) => setLabelGroups(groups))
      .catch(() => setLabelGroups([]))
      .finally(() => setLabelsLoading(false));
    setClassificationsLoading(true);
    fetchClassifications(basicInfo.languageType)
      .then((opts) => setClassificationOptions(opts))
      .catch(() => setClassificationOptions([]))
      .finally(() => setClassificationsLoading(false));
    fetchExternalPlatforms(basicInfo.languageType)
      .then((opts) => setExternalPlatformOptions(opts))
      .catch(() => setExternalPlatformOptions([]));
  }, [basicInfo.languageType]);

  const discardDraft = async () => {
    if (isRejected) return;
    if (courseId !== null) {
      await clearDraft(courseId).catch(() => undefined);
      removeCachedPubConfig(courseId);
      toast.success(t.draftCleared);
    }
    pendingFilesRef.current.clear();
    clearPendingUploadFiles(taskId);
    clearTaskAsset(taskId, "copyrightProof");
    clearTaskAsset(taskId, "highlight");
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
    setSelfProofKind(SELF_PROOF.REGISTRATION);
    setVideos([]);
    setStep(1);
    setPubConfig({ publishScope: 1, externalPlatforms: [] });
    setHighlight({ videoUrl: "", fileName: "", fileSize: null, uploadTime: "", file: null, uploading: false, error: "" });
    setDraftRestored(false);
    setAuditStatus(AuditStatus.DRAFT);
    setAuditRemark(null);
    setSavedPlanned(0);
    setNameError(false);
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

  const onPickCoverLandscape = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > COVER_MAX) {
      setCoverLandscapeError(t.coverTooLarge);
      return;
    }
    setCoverLandscapeError("");
    setCoverLandscapeUploading(true);
    try {
      const url = await uploadFile(file, PUBLISHER_UPLOAD_PATH);
      bi({ coverLandscape: getOssHeicJpgUrl(file, url) });
    } catch {
      setCoverLandscapeError(t.coverUploadFailed);
    } finally {
      setCoverLandscapeUploading(false);
    }
  };

  const toggleExternalPlatform = (code: string) => {
    setPubConfig((p) => ({
      ...p,
      externalPlatforms: p.externalPlatforms.includes(code)
        ? p.externalPlatforms.filter((x) => x !== code)
        : [...p.externalPlatforms, code],
    }));
  };

  const proofUrls = splitProofUrls(basicInfo.copyrightProof);
  const proofValid = basicInfo.copyrightType === 2 ? proofUrls.length >= 1 : proofUrls.length === 1;

  const step1Valid =
    !!basicInfo.cover &&
    !!basicInfo.coverLandscape &&
    !!basicInfo.name &&
    !!basicInfo.titleTranslated &&
    !!basicInfo.description &&
    parseInt(basicInfo.totalEpisodes) >= 1 &&
    parseInt(basicInfo.totalDuration) >= 1 &&
    !!basicInfo.channel &&
    !!basicInfo.languageType &&
    basicInfo.classificationId !== null &&
    basicInfo.genreId !== null &&
    basicInfo.tagIds.length > 0 &&
    // 自制：二选一对应材料；授权：版权证明
    proofValid;

  /** Step1 → saveBasic → Step2 */
  const persistBasicAndGoStep2 = async () => {
    if (!step1Valid || savingBasic) return;
    const planned = parseInt(basicInfo.totalEpisodes) || 0;
    setSavingBasic(true);
    try {
      const res = await saveBasic({
        courseId,
        titleImg: basicInfo.cover,
        coverLandscape: basicInfo.coverLandscape,
        title: basicInfo.name,
        titleTranslated: basicInfo.titleTranslated,
        details: basicInfo.description,
        totalDuration: parseInt(basicInfo.totalDuration) || 0,
        plannedEpisodes: planned,
        genderType: channelToGender(basicInfo.channel as ChannelValue),
        languageType: basicInfo.languageType,
        genreId: basicInfo.genreId as number,
        // 标签送 id，显示名由后端渲染写 course.course_label
        courseLabelIds: basicInfo.tagIds.join(","),
        classificationId: basicInfo.classificationId as number,
        copyrightType: basicInfo.copyrightType,
        copyrightProof: basicInfo.copyrightProof,
        extraMaterials: basicInfo.extraMaterials || undefined,
        sourceFileUrl: basicInfo.sourceFileUrl || undefined,
        sourceFileCode: basicInfo.sourceFileCode || undefined,
      });
      setCourseId(res.courseId);
      setSavedPlanned(planned);
      if (auditStatus == null) setAuditStatus(AuditStatus.DRAFT);
      const keptVideos = videos.filter((video) => video.episodeNo <= planned);
      for (const video of videos) {
        if (video.episodeNo > planned) {
          pendingFilesRef.current.delete(video.episodeNo);
          removePendingUploadFile(taskId, video.episodeNo);
        }
      }
      const nextRows = Array.from({ length: planned }, (_, i) => {
        const no = i + 1;
        return keptVideos.find((v) => v.episodeNo === no) ?? emptyVideoRow(no);
      });
      setVideos(nextRows);
      const uploadedEpisodes = nextRows.filter((video) => video.uploadStatus === 1).length;
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
      setStep(2);
    } catch (err) {
      if (
        isPublisherBiz(err, "publisher_course_no_auth") ||
        isPublisherBiz(err, "publisher_course_not_editable")
      ) {
        onSubmitted();
        return;
      }
      if (isPublisherBiz(err, "publisher_course_episodes_locked") && savedPlanned > 0) {
        bi({ totalEpisodes: String(savedPlanned) });
        return;
      }
      if (isPublisherBiz(err, "publisher_course_title_duplicate")) {
        setNameError(true);
        nameRef.current?.focus();
        return;
      }
      if (isPublisherBiz(err, "publisher_course_classification_invalid")) {
        bi({ classificationId: null });
        if (basicInfo.languageType) {
          fetchClassifications(basicInfo.languageType)
            .then(setClassificationOptions)
            .catch(() => setClassificationOptions([]));
        }
        return;
      }
      // 题材/标签字典被后管改过：清掉已失效的选择并重新拉候选，不让用户对着旧选项反复提交
      if (isPublisherBiz(err, "publisher_course_genre_invalid")) {
        bi({ genreId: null, tagIds: [] });
        if (basicInfo.languageType) {
          fetchGenres(basicInfo.languageType).then(setGenreOptions).catch(() => setGenreOptions([]));
        }
        return;
      }
      if (
        isPublisherBiz(err, "publisher_course_label_invalid") ||
        isPublisherBiz(err, "publisher_course_label_genre_mismatch")
      ) {
        bi({ tagIds: [] });
        if (basicInfo.languageType) {
          fetchLabels(basicInfo.languageType).then(setLabelGroups).catch(() => setLabelGroups([]));
        }
        return;
      }
      if (isPublisherBiz(err, "publisher_course_language_invalid")) {
        bi({ languageType: "", classificationId: null, genreId: null, tagIds: [] });
        return;
      }
      if (isPublisherBiz(err, "publisher_course_episode_no_range")) {
        const id = courseId ?? resumeCourseId;
        if (id != null) {
          void fetchDraft(id).then((draft: DraftResponse | null) => {
            if (!draft) return;
            setSavedPlanned(draft.course.plannedEpisodes || 0);
            bi({ totalEpisodes: draft.course.plannedEpisodes ? String(draft.course.plannedEpisodes) : "" });
          });
        }
      }
    } finally {
      setSavingBasic(false);
    }
  };

  const goStep2 = async () => {
    if (!step1Valid || savingBasic) return;
    const planned = parseInt(basicInfo.totalEpisodes) || 0;
    if (isRejected && savedPlanned > 0 && planned < savedPlanned) {
      setReduceConfirm({ from: savedPlanned, to: planned });
      return;
    }
    await persistBasicAndGoStep2();
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

  const onPickHighlight = (file: File | undefined) => {
    if (!file || courseId === null) return;
    if (file.size > VIDEO_MAX) {
      setHighlight((p) => ({ ...p, error: t.fileTooLarge }));
      return;
    }
    setHighlight((p) => ({ ...p, file, uploading: true, error: "" }));
    void startTaskAssetUpload(taskId, "highlight", file, { courseId }).then((result) => {
      if (!mountedRef.current) return;
      if (result.status === "done") {
        toast.success(t.highlightSaved);
      } else if (result.status === "failed") {
        toast.error(t.highlightUploadFailed);
      }
    });
  };

  const removeHighlight = async () => {
    if (courseId === null) return;
    // 先中止进行中的高光上传，避免删完后又被后台完成写回
    clearTaskAsset(taskId, "highlight");
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
    } catch (err) {
      if (
        isPublisherBiz(err, "publisher_course_not_editable") ||
        isPublisherBiz(err, "publisher_course_no_auth")
      ) {
        onSubmitted();
      }
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

  /** Step3 → publish 送审（授权平台 + 可选外部平台；驳回重提 resubmitted=true） */
  const handleSubmit = async () => {
    if (courseId === null || submitting) return;
    if (!highlight.videoUrl) {
      setHighlight((p) => ({ ...p, error: t.highlightRequired }));
      toast.error(t.highlightRequired);
      return;
    }
    setSubmitting(true);
    try {
      const res = await publishCourse({
        courseId,
        publishScope: pubConfig.publishScope,
        externalPlatforms: pubConfig.externalPlatforms,
      });
      removeCachedPubConfig(courseId);
      toast.success(res.resubmitted ? t.resubmitSuccess : t.submitSuccess);
      onSubmitted();
    } catch (err) {
      if (isPublisherBiz(err, "publisher_course_basic_incomplete")) {
        setStep(1);
      } else if (isPublisherBiz(err, "publisher_course_upload_all_first")) {
        setStep(2);
      } else if (isPublisherBiz(err, "publisher_course_external_platform_invalid")) {
        setPubConfig((prev) => ({ ...prev, externalPlatforms: [] }));
        if (basicInfo.languageType) {
          fetchExternalPlatforms(basicInfo.languageType)
            .then(setExternalPlatformOptions)
            .catch(() => setExternalPlatformOptions([]));
        }
      } else if (isPublisherBiz(err, "publisher_course_highlight_required")) {
        setHighlight((p) => ({ ...p, error: t.highlightRequired }));
        highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (
        isPublisherBiz(err, "publisher_course_not_submittable") ||
        isPublisherBiz(err, "publisher_course_not_editable") ||
        isPublisherBiz(err, "publisher_course_no_auth")
      ) {
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
          {isRejected ? t.resubmitTitle : t.uploadTitle}
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

      {isRejected && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-100 mb-5">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-red-600 mb-0.5" style={{ fontWeight: 600 }}>
              {t.rejectReasonTitle}
            </p>
            {auditRemark ? (
              <p className="text-sm text-red-700 leading-relaxed">{auditRemark}</p>
            ) : null}
            <p className="text-xs text-red-600/80 mt-1">{t.rejectEditHint}</p>
          </div>
        </div>
      )}

      {draftRestored && !isRejected && (
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
              {/* 竖版 9:16 */}
              <div
                onClick={() => !coverUploading && coverRef.current?.click()}
                className="mx-auto rounded-2xl overflow-hidden cursor-pointer transition-all group"
                style={{
                  width: 140,
                  height: 187,
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
                      {t.coverPortraitHint}
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
              ) : null}

              {/* 横版 4:3（20260929 稿件新增，与竖版同为送审必填） */}
              <div
                onClick={() => !coverLandscapeUploading && coverLandscapeRef.current?.click()}
                className="mx-auto rounded-2xl overflow-hidden cursor-pointer transition-all group"
                style={{
                  width: 140,
                  height: 105,
                  background: "#ECECEE",
                  border: `2px dashed ${coverLandscapeError ? "#EF4444" : "#D1D5DB"}`,
                  position: "relative",
                }}
              >
                {coverLandscapeUploading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : basicInfo.coverLandscape ? (
                  <>
                    <img
                      src={basicInfo.coverLandscape}
                      alt={t.coverLandscapeHint}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        bi({ coverLandscape: "" });
                        setCoverLandscapeError("");
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 group-hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Upload className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-[11px] text-gray-400 text-center leading-tight px-3">{t.coverPrompt}</span>
                    <span className="text-[10px] text-gray-300 bg-white/60 px-2 py-0.5 rounded-full">
                      {t.coverLandscapeHint}
                    </span>
                  </div>
                )}
              </div>
              <input
                ref={coverLandscapeRef}
                type="file"
                accept={IMAGE_ACCEPT}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  void onPickCoverLandscape(f);
                }}
                className="hidden"
              />
              {coverLandscapeError ? (
                <p className="text-[10px] text-red-500 text-center leading-relaxed">{coverLandscapeError}</p>
              ) : (
                <p className="text-[10px] text-gray-400 text-center leading-relaxed">{t.coverHint}</p>
              )}
            </div>

            {/* 字段 */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              <Field label={t.nameLabel} required hint={t.nameLangHint} hintClassName="text-red-500">
                <input
                  ref={nameRef}
                  type="text"
                  value={basicInfo.name}
                  onChange={(e) => {
                    if (nameError) setNameError(false);
                    bi({ name: e.target.value });
                  }}
                  placeholder={t.namePlaceholder}
                  className={inputClass(nameError)}
                  maxLength={NAME_LIMIT}
                />
              </Field>

              <Field label={t.titleTranslatedLabel} required>
                <input
                  type="text"
                  value={basicInfo.titleTranslated}
                  onChange={(e) => bi({ titleTranslated: e.target.value })}
                  placeholder={t.titleTranslatedPlaceholder}
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
                <Field label={t.episodesLabel} required hint={isRejected ? t.episodesUnlockHint : t.episodesLockHint}>
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
                <Field label={t.totalDurationLabel} required>
                  <input
                    type="number"
                    min="1"
                    value={basicInfo.totalDuration}
                    onChange={(e) => bi({ totalDuration: e.target.value })}
                    placeholder={t.totalDurationPlaceholder}
                    className={inputClass(false)}
                  />
                </Field>
              </div>

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

              {/* 剧集语言：单选，同时决定类别候选与题材/标签小字翻译的语种 */}
              <Field label={t.langLabel} required>
                <select
                  value={basicInfo.languageType}
                  onChange={(e) =>
                    bi({
                      languageType: e.target.value,
                      classificationId: null,
                      genreId: null,
                      tagIds: [],
                    })
                  }
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

              {/* 题材：一级分类，语言无关字典，显示名按主语言渲染（稿件 18033-780） */}
              <Field label={t.genreLabel} required>
                {!basicInfo.languageType ? (
                  <p className="text-xs text-gray-400">{t.genreSelectLangFirst}</p>
                ) : genresLoading ? (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {t.readingDuration}
                  </div>
                ) : genreOptions.length === 0 ? (
                  <p className="text-xs text-gray-400">{t.genreEmpty}</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {genreOptions.map((item) => {
                      const selected = basicInfo.genreId === item.genreId;
                      return (
                        <button
                          key={item.genreId}
                          type="button"
                          onClick={() =>
                            bi(
                              selected
                                ? { genreId: null }
                                : // 换题材时清掉旧题材下的标签，避免提交出 label_genre_mismatch
                                  { genreId: item.genreId, tagIds: [] },
                            )
                          }
                          className="px-2.5 py-1 rounded-lg text-xs border transition-all"
                          style={{
                            background: selected ? "#111111" : "#FAFAFA",
                            color: selected ? "white" : "#6B7280",
                            borderColor: selected ? "#111111" : "#E5E7EB",
                            fontWeight: selected ? 600 : 400,
                          }}
                        >
                          {item.genreName}
                          {/* 小字是同一个题材的翻译，纯展示；英文界面下后端不下发，这里自然不渲染 */}
                          {item.genreNameLocal ? (
                            <span
                              className="ml-1.5 text-[10px]"
                              style={{ color: selected ? "#D1D5DB" : "#9CA3AF", fontWeight: 400 }}
                            >
                              {item.genreNameLocal}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </Field>

              {/* 标签（按题材分组；提交 labelId，显示名由后端渲染） */}
              <Field label={t.tagsLabel} required>
                {!basicInfo.languageType ? (
                  <p className="text-xs text-gray-400">{t.tagsSelectLangFirst}</p>
                ) : labelsLoading ? (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {t.readingDuration}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {labelGroups
                      // 选了题材就只展示该题材组。未归类的历史词条（genreId=null）此时必须隐藏：
                      // 后端要求标签的 genreId 与所选题材一致，选中它们必然被判 label_genre_mismatch，
                      // 要等运营在后管把它们挂到题材下才可用。
                      .filter(
                        (group) =>
                          basicInfo.genreId === null || group.genreId === basicInfo.genreId,
                      )
                      .map((group) => (
                        <div key={group.genreId ?? "ungrouped"}>
                          <p className="text-[11px] text-gray-400 mb-1.5" style={{ fontWeight: 600 }}>
                            {group.genreName || t.tagsUngrouped}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {group.labels.map((label) => {
                              const selected = basicInfo.tagIds.includes(label.labelId);
                              return (
                                <button
                                  key={label.labelId}
                                  type="button"
                                  onClick={() =>
                                    bi({
                                      tagIds: selected
                                        ? basicInfo.tagIds.filter((x) => x !== label.labelId)
                                        : [...basicInfo.tagIds, label.labelId],
                                    })
                                  }
                                  className="px-2.5 py-1 rounded-lg text-xs border transition-all"
                                  style={{
                                    background: selected ? "#111111" : "#FAFAFA",
                                    color: selected ? "white" : "#6B7280",
                                    borderColor: selected ? "#111111" : "#E5E7EB",
                                    fontWeight: selected ? 600 : 400,
                                  }}
                                >
                                  {label.labelName}
                                  {/* 小字 = 该标签的翻译，纯展示，不是另一个标签 */}
                                  {label.labelNameLocal ? (
                                    <span
                                      className="ml-1.5 text-[10px]"
                                      style={{ color: selected ? "#D1D5DB" : "#9CA3AF", fontWeight: 400 }}
                                    >
                                      {label.labelNameLocal}
                                    </span>
                                  ) : null}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </Field>

              {/* 版权与交付资料：① 版权证书 ② 附加材料（可选）③ 源文件网盘链接（稿件 18033-780） */}
              <Field label={t.deliveryLabel} required>
                <p className="mb-2 flex items-center gap-1.5 text-xs text-gray-700" style={{ fontWeight: 600 }}>
                  <span className="text-gray-400">①</span>
                  {t.proofSectionTitle}
                </p>
                <div className="flex gap-5">
                  {[
                    { val: 1, label: t.copyrightSelf },
                    { val: 2, label: t.copyrightLicensed },
                  ].map((opt) => (
                    <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => {
                          if (basicInfo.copyrightType === opt.val) return;
                          clearTaskAsset(taskId, "copyrightProof");
                          bi({ copyrightType: opt.val, copyrightProof: "" });
                          if (opt.val === 1) setSelfProofKind(SELF_PROOF.REGISTRATION);
                        }}
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

                {/* 自制：三选一确权材料（Figma 17195:516） */}
                {basicInfo.copyrightType === 1 && (
                  <SelfCopyrightUpload
                    t={t}
                    taskId={taskId}
                    kind={selfProofKind}
                    onKindChange={(k) => {
                      if (k === selfProofKind) return;
                      clearTaskAsset(taskId, "copyrightProof");
                      bi({ copyrightProof: "" });
                      setSelfProofKind(k);
                    }}
                    value={basicInfo.copyrightProof}
                    onChange={(url) => bi({ copyrightProof: url })}
                  />
                )}
              </Field>

              {/* 授权：版权证明（图片/PDF/Word） */}
              {basicInfo.copyrightType === 2 && (
                <Field label={t.copyrightProofLabel} required>
                  <CopyrightProofUpload
                    t={t}
                    taskId={taskId}
                    value={basicInfo.copyrightProof}
                    onChange={(url) => bi({ copyrightProof: url })}
                  />
                </Field>
              )}

              {/* ② 附加材料上传（可选，多文件） */}
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-xs text-gray-700" style={{ fontWeight: 600 }}>
                  <span className="text-gray-400">②</span>
                  {t.extraMaterialsTitle}
                  <span className="text-gray-400" style={{ fontWeight: 400 }}>
                    {t.extraMaterialsOptional}
                  </span>
                </p>
                <p className="mb-2 text-[11px] text-gray-400 leading-relaxed">{t.extraMaterialsDesc}</p>
                <ExtraMaterialsUpload
                  t={t}
                  value={basicInfo.extraMaterials}
                  onChange={(joined) => bi({ extraMaterials: joined })}
                />
              </div>

              {/* ③ 源文件网盘链接（可选） */}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs text-gray-700" style={{ fontWeight: 600 }}>
                  <span className="text-gray-400">③</span>
                  {t.sourceFileTitle}
                </p>
                <input
                  type="url"
                  value={basicInfo.sourceFileUrl}
                  onChange={(e) => bi({ sourceFileUrl: e.target.value })}
                  placeholder={t.sourceFilePlaceholder}
                  className={inputClass(false)}
                />
                {/* 提取码：网盘链接自带密码时才填，独立可选字段 */}
                <input
                  type="text"
                  value={basicInfo.sourceFileCode}
                  onChange={(e) => bi({ sourceFileCode: e.target.value })}
                  placeholder={t.sourceFileCodePlaceholder}
                  maxLength={64}
                  className={`${inputClass(false)} mt-2`}
                />
                <div className="mt-2 rounded-[14px] border border-gray-100 bg-gray-50 px-3.5 py-2.5">
                  <p className="text-[11px] text-gray-600" style={{ fontWeight: 600 }}>
                    {t.sourceFileNeedTitle}
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {[t.sourceFileNeed1, t.sourceFileNeed2, t.sourceFileNeed3, t.sourceFileNeed4].map((line) => (
                      <li key={line} className="text-[11px] text-gray-500 leading-[18px]">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
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
          {/* 发布范围 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm text-gray-900 mb-1" style={{ fontWeight: 700 }}>
              {t.distSectionTitle}
            </h3>
            <p className="text-xs text-gray-400 mb-4">{t.distSectionDesc}</p>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>
                {t.lollipopGroupLabel}
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: "#FFF1F2", color: "#E8192C", fontWeight: 500 }}
              >
                {t.lollipopRequiredBadge}
              </span>
            </div>
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

          {/* 可选外部平台（稿件 18033-1599）：比例走后管 common_info(3171)，前端不写死 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm text-gray-900 mb-1" style={{ fontWeight: 700 }}>
              {t.extPlatformTitle}
            </h3>
            <p className="text-xs text-gray-400 mb-4">{t.extPlatformDesc}</p>
            {externalPlatformOptions.length === 0 ? (
              <p className="text-xs text-gray-400">{t.emptyTitle}</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {externalPlatformOptions.map((item) => {
                  const active = pubConfig.externalPlatforms.includes(item.code);
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => toggleExternalPlatform(item.code)}
                      className="flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all"
                      style={{ borderColor: active ? "#111111" : "#E5E7EB", background: active ? "#FAFAFA" : "white" }}
                    >
                      <span
                        className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                        style={{
                          borderColor: active ? "#111111" : "#D1D5DB",
                          background: active ? "#111111" : "white",
                        }}
                      >
                        {active && <div className="w-1.5 h-1.5 rounded-[1px] bg-white" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-gray-900" style={{ fontWeight: 600 }}>
                          {item.platformName}
                        </span>
                        {item.subtitle ? (
                          <span className="block truncate text-[11px] text-gray-400">{item.subtitle}</span>
                        ) : null}
                      </span>
                      <span className="flex gap-3 flex-shrink-0">
                        <span className="text-right">
                          <span className="block text-[10px] text-gray-400">{t.platform}</span>
                          <span className="block text-xs text-gray-600" style={{ fontWeight: 700 }}>
                            {item.platformRatio === null ? t.extPlatformRatioNA : `${item.platformRatio}%`}
                          </span>
                        </span>
                        <span className="text-right">
                          <span className="block text-[10px] text-gray-400">{t.producer}</span>
                          <span className="block text-xs text-gray-900" style={{ fontWeight: 800 }}>
                            {item.creatorRatio === null ? t.extPlatformRatioNA : `${item.creatorRatio}%`}
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 高光时刻 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-sm text-gray-900" style={{ fontWeight: 700 }}>
                {t.uploadHighlight} <span className="text-red-500">*</span>
              </h3>
              <span
                className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: "#FFF1F2", color: "#E8192C", fontWeight: 500 }}
              >
                {t.highlightRequiredBadge}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">{t.highlightDesc}</p>
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
                <span className="text-sm">
                  {highlight.uploading ? t.highlightUploading : t.highlightUploadPrompt}
                </span>
                {!highlight.uploading && <span className="text-[11px] text-gray-300">{t.highlightFormatHint}</span>}
              </button>
            )}
            {highlight.error && <p className="mt-2 text-xs text-red-500">{highlight.error}</p>}
          </div>

          {/* 提交条：收费规则改为左下入口弹层（稿件 18033-1599），不再内嵌整表 */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50/40">
              <button
                type="button"
                onClick={() => setPricingModalOpen(true)}
                className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-900"
                style={{ fontWeight: 500 }}
              >
                {t.viewPricingRules}
              </button>
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
                  {isRejected ? t.submitResubmit : t.submitPublish}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CountryPricingModal
        open={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        t={t}
        rows={priceRows}
        loading={priceLoading}
      />

      {reduceConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="p-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-gray-900 mb-2" style={{ fontWeight: 700, fontSize: "1rem" }}>
                {t.episodesLabel}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                {fmt(t.episodesReduceConfirm, {
                  from: reduceConfirm.from,
                  to: reduceConfirm.to,
                  next: reduceConfirm.to + 1,
                })}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setReduceConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReduceConfirm(null);
                    void persistBasicAndGoStep2();
                  }}
                  className="flex-1 py-2.5 rounded-xl text-sm text-white transition-colors hover:opacity-90"
                  style={{ background: "#111111", fontWeight: 600 }}
                >
                  {t.episodesReduceConfirmOk}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
