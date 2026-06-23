import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Upload,
  X,
  RotateCcw,
  Film,
  AlertCircle,
  Check,
  Info,
  User,
  Home,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { ContentMessages } from "../../i18n/content";
import { uploadFile } from "../../../services/upload";
import { COUNTRIES, TAG_VALUES, CHANNEL_VALUES } from "../../mock/content";
import type {
  CreateDramaInput,
  CopyrightType,
  ChannelValue,
  DistributionType,
  Highlight,
} from "./types";
import { StepIndicator } from "../StepIndicator";
import { PhoneMockup } from "./PhoneMockup";
import { CountryPricingModal } from "./CountryPricingModal";
import { Field, inputClass, fmt, readVideoDuration } from "./shared";

const DRAFT_KEY = "drama_upload_draft";
const DESC_LIMIT = 200;
const COVER_MAX = 500 * 1024;
const VIDEO_MAX = 500 * 1024 * 1024;

interface BasicInfo {
  name: string;
  description: string;
  /** 已上传的封面 URL（经 uploadFile） */
  cover: string;
  countries: string[];
  tags: string[];
  totalEpisodes: string;
  copyrightType: CopyrightType;
  channel: ChannelValue | "";
}

interface VideoRow {
  ep: number;
  title: string;
  file: File | null;
  duration: string;
  fileError: string;
  fileRef: React.RefObject<HTMLInputElement | null>;
}

interface PublishConfig {
  status: "online" | "offline";
  distribution: DistributionType;
}

interface UploadFormProps {
  t: ContentMessages;
  onCancel: () => void;
  /** 提交：调用方负责调 service 创建并返回列表 */
  onSubmit: (input: CreateDramaInput) => Promise<void>;
}

/** 上剧流程：基本信息 → 上传剧集 → 发布配置（figma 15077-20404 / 15081-20916 / 15081-21629·22516）。 */
export const UploadForm: React.FC<UploadFormProps> = ({ t, onCancel, onSubmit }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    name: "",
    description: "",
    cover: "",
    countries: [],
    tags: [],
    totalEpisodes: "",
    copyrightType: "self",
    channel: "",
  });
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [pubConfig, setPubConfig] = useState<PublishConfig>({ status: "online", distribution: "account" });
  const [coverError, setCoverError] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);

  const bi = (field: Partial<BasicInfo>) => setBasicInfo((p) => ({ ...p, ...field }));
  const pc = (field: Partial<PublishConfig>) => setPubConfig((p) => ({ ...p, ...field }));

  // 进入时尝试恢复草稿（不含文件，仅文本/选择项）
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return;
    try {
      const draft = JSON.parse(saved);
      if (draft.basicInfo) setBasicInfo({ ...draft.basicInfo, cover: draft.basicInfo.cover ?? "" });
      if (draft.step) setStep(draft.step as 1 | 2 | 3);
      if (draft.videos?.length) {
        setVideos(
          draft.videos.map((v: { ep: number; title: string }) => ({
            ep: v.ep,
            title: v.title,
            file: null,
            duration: "",
            fileError: "",
            fileRef: React.createRef<HTMLInputElement>(),
          })),
        );
      }
      if (draft.pubConfig) setPubConfig(draft.pubConfig);
      setDraftRestored(true);
    } catch {
      /* 草稿损坏则忽略 */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 自动保存草稿
  useEffect(() => {
    const draft = {
      basicInfo,
      step,
      videos: videos.map((v) => ({ ep: v.ep, title: v.title })),
      pubConfig,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [basicInfo, step, videos, pubConfig]);

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setBasicInfo({
      name: "",
      description: "",
      cover: "",
      countries: [],
      tags: [],
      totalEpisodes: "",
      copyrightType: "self",
      channel: "",
    });
    setVideos([]);
    setStep(1);
    setPubConfig({ status: "online", distribution: "account" });
    setDraftRestored(false);
  };

  const goStep2 = () => {
    const total = parseInt(basicInfo.totalEpisodes) || 0;
    if (total < 1) return;
    // 保留已填标题（草稿恢复或回退场景）
    setVideos((prev) =>
      Array.from({ length: total }, (_, i) => {
        const found = prev.find((v) => v.ep === i + 1);
        return (
          found ?? {
            ep: i + 1,
            title: "",
            file: null,
            duration: "",
            fileError: "",
            fileRef: React.createRef<HTMLInputElement>(),
          }
        );
      }),
    );
    setStep(2);
  };

  const onPickCover = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > COVER_MAX) {
      setCoverError(t.coverHint);
      return;
    }
    setCoverError("");
    setCoverUploading(true);
    try {
      const url = await uploadFile(file);
      bi({ cover: url });
    } catch {
      setCoverError(t.coverUploadFailed);
    } finally {
      setCoverUploading(false);
    }
  };

  const updateVideo = (ep: number, field: Partial<VideoRow>) =>
    setVideos((v) => v.map((item) => (item.ep === ep ? { ...item, ...field } : item)));

  const onPickVideo = (ep: number, file: File | undefined) => {
    if (!file) return;
    if (file.size > VIDEO_MAX) {
      updateVideo(ep, { file: null, duration: "", fileError: t.fileTooLarge });
      return;
    }
    updateVideo(ep, { file, fileError: "", duration: "" });
    void readVideoDuration(file).then((dur) => updateVideo(ep, { duration: dur }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const input: CreateDramaInput = {
        name: basicInfo.name,
        description: basicInfo.description,
        cover: basicInfo.cover,
        countries: basicInfo.countries,
        tags: basicInfo.tags,
        totalEpisodes: parseInt(basicInfo.totalEpisodes) || 0,
        copyrightType: basicInfo.copyrightType,
        channel: (basicInfo.channel || "general") as ChannelValue,
        distribution: pubConfig.distribution,
        publishStatus: pubConfig.status,
      };
      await onSubmit(input);
      localStorage.removeItem(DRAFT_KEY);
      toast.success(t.submitSuccess);
      // 上层在 onSubmit 后切回列表
    } catch {
      // service 已 toast
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [{ label: t.step1 }, { label: t.step2 }, { label: t.step3 }];
  const phoneLabels = { home: t.phoneHome, forYou: t.phoneForYou, me: t.phoneMe };
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
            onClick={discardDraft}
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
                {t.coverLabel} <span className="text-red-400">*</span>
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
                accept="image/png,image/jpeg"
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
                    onChange={(e) => bi({ totalEpisodes: e.target.value })}
                    placeholder={t.episodesPlaceholder}
                    className={inputClass(false)}
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

              <Field label={t.tagsLabel} required>
                <div className="flex flex-wrap gap-1.5">
                  {TAG_VALUES.map((tv) => {
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
                        {t.tags[tv]}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label={t.copyrightLabel} required>
                <div className="flex gap-5">
                  {([
                    { val: "self" as const, label: t.copyrightSelf },
                    { val: "licensed" as const, label: t.copyrightLicensed },
                  ]).map((opt) => (
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
                onClick={goStep2}
                disabled={
                  !basicInfo.name ||
                  !basicInfo.totalEpisodes ||
                  parseInt(basicInfo.totalEpisodes) < 1
                }
                className="px-5 py-2 rounded-xl text-white text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#111111", fontWeight: 600 }}
              >
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
            {videos.map((v) => (
              <div
                key={v.ep}
                className="grid grid-cols-[72px_1fr_1fr_100px_90px_90px] gap-3 items-center px-5 py-3 hover:bg-gray-50/50"
              >
                <div className="flex items-center justify-center min-w-0 px-2 h-8 rounded-lg bg-gray-100 flex-shrink-0">
                  <span className="text-xs text-gray-700 whitespace-nowrap" style={{ fontWeight: 700 }}>
                    {fmt(t.epLabelN, { ep: v.ep })}
                  </span>
                </div>
                <input
                  type="text"
                  value={v.title}
                  onChange={(e) => updateVideo(v.ep, { title: e.target.value })}
                  placeholder={fmt(t.epTitlePlaceholder, { ep: v.ep })}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none hover:border-gray-400 focus:border-black transition-all"
                />
                <div>
                  <input
                    ref={v.fileRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      onPickVideo(v.ep, f);
                    }}
                    className="hidden"
                  />
                  {v.fileError ? (
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      <span className="text-xs text-red-500 truncate">{v.fileError}</span>
                      <button
                        onClick={() => updateVideo(v.ep, { fileError: "" })}
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
                        onClick={() => updateVideo(v.ep, { file: null, duration: "" })}
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
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
                  {v.file ? `${(v.file.size / 1024 / 1024).toFixed(1)} MB` : "—"}
                </span>
                <span className="text-xs text-gray-500">{v.file ? v.duration || t.readingDuration : "—"}</span>
                <span
                  className="text-xs"
                  style={{
                    color: v.fileError ? "#EF4444" : v.file ? "#16A34A" : "#9CA3AF",
                    fontWeight: v.file || v.fileError ? 500 : 400,
                  }}
                >
                  {v.fileError ? t.epStatusError : v.file ? t.epStatusReady : t.epStatusPending}
                </span>
              </div>
            ))}
          </div>
          </div>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/40">
            <span className="text-xs text-gray-500">
              {fmt(t.uploadSummary, { total: videos.length, selected: selectedVideoCount })}
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
                onClick={() => setStep(3)}
                className="px-5 py-2 rounded-xl text-white text-sm hover:opacity-90"
                style={{ background: "#111111", fontWeight: 600 }}
              >
                {t.next}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3 发布配置 ── */}
      {step === 3 && (
        <div className="max-w-4xl space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm text-gray-900 mb-1" style={{ fontWeight: 700 }}>
              {t.distSectionTitle}
            </h3>
            <p className="text-xs text-gray-400 mb-5">{t.distSectionDesc}</p>
            <div className="grid grid-cols-2 gap-5">
              {([
                {
                  key: "account" as DistributionType,
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
                  key: "full" as DistributionType,
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
              ]).map((opt) => {
                const active = pubConfig.distribution === opt.key;
                return (
                  <div
                    key={opt.key}
                    onClick={() => pc({ distribution: opt.key })}
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
            {/* 上架国家 */}
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm text-gray-900 mb-1" style={{ fontWeight: 700 }}>
                {t.countriesSectionTitle}
              </h3>
              <p className="text-xs text-gray-400 mb-4">{t.countriesSectionDesc}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {COUNTRIES.map((c) => {
                  const selected = basicInfo.countries.includes(c.value);
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => {
                        const next = selected
                          ? basicInfo.countries.filter((v) => v !== c.value)
                          : [...basicInfo.countries, c.value];
                        bi({ countries: next });
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm transition-all"
                      style={{
                        borderColor: selected ? "#111111" : "#E5E7EB",
                        background: selected ? "#111111" : "white",
                        color: selected ? "white" : "#374151",
                        fontWeight: selected ? 600 : 400,
                      }}
                    >
                      <span className="text-base">{c.flag}</span>
                      <span>{t.countries[c.value as keyof typeof t.countries]}</span>
                      {selected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setShowPricing(true)}
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
                {([
                  { val: "online" as const, label: t.publishNowOption },
                  { val: "offline" as const, label: t.publishLaterOption },
                ]).map((opt) => (
                  <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => pc({ status: opt.val })}
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: pubConfig.status === opt.val ? "#111111" : "#D1D5DB" }}
                    >
                      {pubConfig.status === opt.val && <div className="w-2 h-2 rounded-full bg-[#111111]" />}
                    </div>
                    <span
                      className="text-sm text-gray-700"
                      style={{ fontWeight: pubConfig.status === opt.val ? 600 : 400 }}
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
                  onClick={handleSubmit}
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

      <CountryPricingModal open={showPricing} onClose={() => setShowPricing(false)} t={t} />
    </div>
  );
};
