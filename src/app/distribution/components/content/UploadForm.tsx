import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Upload,
  X,
  RotateCcw,
  Film,
  AlertCircle,
  Info,
  User,
  Home,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { ContentMessages } from "../../i18n/content";
import { uploadFile, PUBLISHER_UPLOAD_PATH } from "../../../services/upload";
import { normalizeImageFile } from "../../../services/heic";
import {
  saveBasic,
  saveEpisode,
  publishCourse,
  fetchDraft,
  fetchLabels,
  fetchPriceRule,
  clearDraft,
  type PriceRuleCountry,
} from "../../../services/content";
import { getLanguageTypeList, type LanguageOption } from "../../../services/language";
import { CHANNEL_VALUES, channelToGender, genderToChannel, type ChannelValue } from "../../mock/content";
import type { Highlight } from "./types";
import { StepIndicator } from "../StepIndicator";
import { PhoneMockup } from "./PhoneMockup";
import { CountryPricingModal } from "./CountryPricingModal";
import { Field, inputClass, fmt, formatBytes, formatDuration, fileNameFromUrl, readVideoDuration } from "./shared";

const DESC_LIMIT = 200;
/** 短剧名称上限 100 字符（bug16：避免超长提交后端异常） */
const NAME_LIMIT = 100;
/** 封面上限 10MB（与后端 /publisher/course/upload 图片校验对齐） */
const COVER_MAX = 10 * 1024 * 1024;
/** 剧集视频上限 500MB（与后端 /publisher/course/upload 视频校验对齐） */
const VIDEO_MAX = 500 * 1024 * 1024;

interface BasicInfo {
  cover: string;
  name: string;
  description: string;
  totalEpisodes: string;
  channel: ChannelValue | "";
  languageType: string;
  tags: string[];
  /** 版权类型 1自制/2授权 */
  copyrightType: number;
  /** 版权证明文件 URL（仅授权 copyrightType=2 时使用） */
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
  /** 已上传集回显：视频大小（字节，后端回写） */
  videoSize: number;
  /** 已上传集回显：视频时长（秒，后端回写） */
  videoDuration: number;
  /** 已上传集回显：视频 URL（用于推导文件名） */
  videoUrl: string;
  fileRef: React.RefObject<HTMLInputElement | null>;
}

interface UploadFormProps {
  t: ContentMessages;
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
  tags: [],
  copyrightType: 1,
  copyrightProof: "",
};

/**
 * 版权证明上传（授权版权必填）。支持图片 + PDF，走 /publisher/course/upload（文档 ≤20MB）。
 * PDF 无法 <img> 预览，故已上传时展示文件名链接（点开新标签查看）。
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
      // bug9：HEIC 图片证明先转 JPEG；PDF 等原样上传
      const norm = await normalizeImageFile(file);
      const url = await uploadFile(norm, PUBLISHER_UPLOAD_PATH);
      onChange(url);
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
        accept="image/*,.pdf"
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

/**
 * 上剧流程（三步，分步草稿暂存）：
 *  Step1 基本信息 → POST saveBasic（含语言/标签，返回 courseId）
 *  Step2 上传剧集 → 每个视频直传 OSS → POST saveEpisode（同 episodeNo 覆盖）
 *  Step3 发布配置 → POST publish（仅 发布范围 + 上架设置；价格按国家平台只读）
 * 进入时自动恢复服务端草稿（GET draft）。
 */
export const UploadForm: React.FC<UploadFormProps> = ({ t, onCancel, onSubmitted }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(emptyBasic);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [pubConfig, setPubConfig] = useState<{ publishScope: number; onShelfNow: boolean }>({
    publishScope: 1,
    onShelfNow: true,
  });

  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [labelOptions, setLabelOptions] = useState<string[]>([]);
  const [labelsLoading, setLabelsLoading] = useState(false);

  const [coverError, setCoverError] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [priceRows, setPriceRows] = useState<PriceRuleCountry[]>([]);
  const [priceLoading, setPriceLoading] = useState(false);
  const [savingBasic, setSavingBasic] = useState(false);
  const [uploadingEps, setUploadingEps] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const coverRef = useRef<HTMLInputElement>(null);

  const bi = (field: Partial<BasicInfo>) => setBasicInfo((p) => ({ ...p, ...field }));

  /** 计划集数（一旦草稿已建则锁定） */
  const plannedLocked = courseId !== null;

  // 语言列表
  useEffect(() => {
    void getLanguageTypeList()
      .then(setLanguages)
      .catch(() => undefined);
  }, []);

  // 恢复服务端草稿
  useEffect(() => {
    void fetchDraft()
      .then((draft) => {
        if (!draft) return;
        const c = draft.course;
        setCourseId(c.courseId);
        setBasicInfo({
          cover: c.titleImg || "",
          name: c.title || "",
          description: c.details || "",
          totalEpisodes: c.plannedEpisodes ? String(c.plannedEpisodes) : "",
          channel: genderToChannel(c.genderType),
          languageType: c.languageType || "",
          tags: c.courseLabel ? c.courseLabel.split(",").filter(Boolean) : [],
          copyrightType: c.copyrightType || 1,
          copyrightProof: c.copyrightProof || "",
        });
        // 已上传集回显
        const planned = c.plannedEpisodes || 0;
        setVideos(
          Array.from({ length: planned }, (_, i) => {
            const no = i + 1;
            const ep = draft.episodes.find((e) => e.episodeNo === no);
            return {
              episodeNo: no,
              title: ep?.title || "",
              file: null,
              duration: "",
              fileError: "",
              uploadStatus: ep?.uploadStatus ?? 0,
              videoSize: ep?.videoSize ?? 0,
              videoDuration: ep?.videoDuration ?? 0,
              videoUrl: ep?.videoUrl || "",
              fileRef: React.createRef<HTMLInputElement>(),
            };
          }),
        );
        setDraftRestored(true);
      })
      .catch(() => undefined);
  }, []);

  // 语言变化时加载标签集
  useEffect(() => {
    if (!basicInfo.languageType) {
      setLabelOptions([]);
      return;
    }
    setLabelsLoading(true);
    fetchLabels(basicInfo.languageType)
      .then((opts) => setLabelOptions(opts))
      .catch(() => setLabelOptions([]))
      .finally(() => setLabelsLoading(false));
  }, [basicInfo.languageType]);

  const discardDraft = async () => {
    if (courseId !== null) {
      await clearDraft(courseId).catch(() => undefined);
      toast.success(t.draftCleared);
    }
    setCourseId(null);
    setBasicInfo(emptyBasic);
    setVideos([]);
    setStep(1);
    setPubConfig({ publishScope: 1, onShelfNow: true });
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
      // bug9：HEIC 先转 JPEG；封面走发行方专用 /publisher/course/upload（@PublisherLogin）。
      const norm = await normalizeImageFile(file);
      const url = await uploadFile(norm, PUBLISHER_UPLOAD_PATH);
      bi({ cover: url });
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
    basicInfo.tags.length > 0 &&
    // 授权版权需上传版权证明
    (basicInfo.copyrightType !== 2 || !!basicInfo.copyrightProof);

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
        copyrightType: basicInfo.copyrightType,
        // 仅授权时提交版权证明（字段名 TODO(verify) 待后端确认）
        copyrightProof: basicInfo.copyrightType === 2 ? basicInfo.copyrightProof : "",
      });
      setCourseId(res.courseId);
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
              videoSize: 0,
              videoDuration: 0,
              videoUrl: "",
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

  const updateVideo = (ep: number, field: Partial<VideoRow>) =>
    setVideos((v) => v.map((item) => (item.episodeNo === ep ? { ...item, ...field } : item)));

  const onPickVideo = (ep: number, file: File | undefined) => {
    if (!file) return;
    if (file.size > VIDEO_MAX) {
      updateVideo(ep, { file: null, duration: "", fileError: t.fileTooLarge });
      return;
    }
    updateVideo(ep, { file, fileError: "", duration: "" });
    void readVideoDuration(file).then((dur) => updateVideo(ep, { duration: dur }));
  };

  /** Step2 → 上传已选视频（直传 OSS + saveEpisode）→ Step3 */
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
      setStep(3);
      return;
    }
    setUploadingEps(true);
    let anyFail = false;
    for (const r of pending) {
      try {
        // 视频同封面，走发行方专用 /publisher/course/upload（publisher token，视频上限 500MB）。
        const url = await uploadFile(r.file as File, PUBLISHER_UPLOAD_PATH);
        const res = await saveEpisode({
          courseId,
          episodeNo: r.episodeNo,
          title: r.title || undefined,
          videoUrl: url,
        });
        updateVideo(r.episodeNo, {
          uploadStatus: res.uploadStatus,
          file: null,
          duration: "",
          videoSize: res.videoSize,
          videoDuration: res.videoDuration,
          videoUrl: url,
        });
        if (res.uploadStatus === 1) {
          uploaded.add(r.episodeNo);
        } else {
          anyFail = true;
        }
      } catch {
        anyFail = true;
        updateVideo(r.episodeNo, { uploadStatus: 2 });
      }
    }
    setUploadingEps(false);
    if (anyFail || uploaded.size < videos.length) {
      toast.error(t.videoUploadFailed);
      return;
    }
    setStep(3);
  };

  const openPricing = () => {
    setShowPricing(true);
    setPriceLoading(true);
    fetchPriceRule(parseInt(basicInfo.totalEpisodes) || undefined)
      .then((rows) => setPriceRows(rows))
      .catch(() => setPriceRows([]))
      .finally(() => setPriceLoading(false));
  };

  /** Step3 → publish 送审 */
  const handleSubmit = async () => {
    if (courseId === null || submitting) return;
    setSubmitting(true);
    try {
      await publishCourse({
        courseId,
        publishScope: pubConfig.publishScope,
        onShelfNow: pubConfig.onShelfNow,
      });
      toast.success(t.submitSuccess);
      onSubmitted();
    } catch {
      /* http 已 toast（如「请先上传全部剧集」） */
    } finally {
      setSubmitting(false);
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
          {t.uploadTitle}
        </h2>
      </div>

      {draftRestored && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 mb-5">
          <RotateCcw className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700 flex-1">{t.draftRestored}</p>
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
                accept="image/png,image/jpeg,image/heic,image/heif,.heic,.heif"
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
              <Field label={t.nameLabel} required>
                <input
                  type="text"
                  value={basicInfo.name}
                  onChange={(e) => bi({ name: e.target.value })}
                  placeholder={t.namePlaceholder}
                  className={inputClass(false)}
                  maxLength={NAME_LIMIT}
                />
              </Field>

              <Field label={t.descLabel} required>
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
                  onChange={(e) => bi({ languageType: e.target.value, tags: [] })}
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

              {/* 授权版权 → 需上传版权证明（copyrightType=2 必填；支持图片/PDF，走 /publisher/course/upload） */}
              {basicInfo.copyrightType === 2 && (
                <Field label={t.copyrightProofLabel} required>
                  <CopyrightProofUpload
                    t={t}
                    value={basicInfo.copyrightProof}
                    onChange={(url) => bi({ copyrightProof: url })}
                  />
                </Field>
              )}
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
                        onChange={(e) => updateVideo(v.episodeNo, { title: e.target.value })}
                        placeholder={fmt(t.epTitlePlaceholder, { ep: v.episodeNo })}
                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none hover:border-gray-400 focus:border-black transition-all min-w-0"
                      />
                      <div>
                        <input
                          ref={v.fileRef}
                          type="file"
                          accept="video/*"
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
                              className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : v.file ? (
                          <div className="flex items-center gap-2">
                            <Film className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-700 truncate flex-1 max-w-[140px]">{v.file.name}</span>
                            <button
                              onClick={() => updateVideo(v.episodeNo, { file: null, duration: "" })}
                              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : isUploaded ? (
                          <div className="flex items-center gap-2">
                            <Film className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-700 truncate flex-1 max-w-[120px]">
                              {fileNameFromUrl(v.videoUrl) || fmt(t.epLabelN, { ep: v.episodeNo })}
                            </span>
                            <button
                              onClick={() => v.fileRef.current?.click()}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 hover:border-gray-400 flex-shrink-0"
                              style={{ fontWeight: 500 }}
                            >
                              <Upload className="w-3 h-3" />
                              {t.epActionReplace}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => v.fileRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 hover:border-gray-400"
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
                            : isUploaded
                              ? "#16A34A"
                              : v.file
                                ? "#16A34A"
                                : "#9CA3AF",
                          fontWeight: v.file || v.fileError || isUploaded ? 500 : 400,
                        }}
                      >
                        {v.fileError
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
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/40">
            <span className="text-xs text-gray-500">
              {fmt(t.episodesBreadcrumbCount, { total: videos.length, done: uploadedCount })}
              {selectedVideoCount > 0 && ` · ${fmt(t.uploadSummary, { total: videos.length, selected: selectedVideoCount })}`}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-gray-50"
                style={{ fontWeight: 500 }}
              >
                {t.prev}
              </button>
              <button
                onClick={() => void goStep3()}
                disabled={uploadingEps}
                className="px-5 py-2 rounded-xl text-white text-sm hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
                style={{ background: "#111111", fontWeight: 600 }}
              >
                {uploadingEps && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {uploadingEps ? t.epUploading : t.next}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3 发布配置（仅 发布范围 + 上架设置） ── */}
      {step === 3 && (
        <div className="max-w-4xl space-y-5">
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
                  rows: [
                    { label: t.platform, val: "20%" },
                    { label: t.producer, val: "80%", highlight: true },
                  ],
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
                  rows: [
                    { label: t.platform, val: "40%" },
                    { label: t.producer, val: "60%", highlight: true },
                  ],
                },
              ].map((opt) => {
                const active = pubConfig.publishScope === opt.scope;
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
                        {opt.rows.map((r, ri) => (
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

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* 各国家收费规则（只读入口） */}
            <div className="p-6 border-b border-gray-100">
              <button
                type="button"
                onClick={openPricing}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                style={{ fontWeight: 500 }}
              >
                <Info className="w-3.5 h-3.5" />
                {t.viewPricingRules}
              </button>
            </div>

            {/* 上架设置 */}
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm text-gray-900 mb-4" style={{ fontWeight: 700 }}>
                {t.publishSettingsTitle}
              </h3>
              <div className="flex gap-5">
                {[
                  { val: true, label: t.publishNowOption },
                  { val: false, label: t.publishLaterOption },
                ].map((opt) => (
                  <label key={String(opt.val)} className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setPubConfig((p) => ({ ...p, onShelfNow: opt.val }))}
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: pubConfig.onShelfNow === opt.val ? "#111111" : "#D1D5DB" }}
                    >
                      {pubConfig.onShelfNow === opt.val && <div className="w-2 h-2 rounded-full bg-[#111111]" />}
                    </div>
                    <span
                      className="text-sm text-gray-700"
                      style={{ fontWeight: pubConfig.onShelfNow === opt.val ? 600 : 400 }}
                    >
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
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
                  disabled={submitting}
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

      <CountryPricingModal open={showPricing} onClose={() => setShowPricing(false)} t={t} rows={priceRows} loading={priceLoading} />
    </div>
  );
};
