import React from "react";
import {
  ArrowLeft,
  Video,
  Film,
  Globe,
  Tag,
  Hash,
  FileText,
  Calendar,
  ChevronRight,
  PlusCircle,
  Pencil,
  User,
  Home,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import type { ContentMessages } from "../../i18n/content";
import type { LanguageOption } from "../../../services/language";
import type { CourseDetail } from "./types";
import {
  auditStatusStyle,
  auditStatusLabel,
  shelfStatusStyle,
  shelfStatusLabel,
  highlightsOf,
  genderChannelKey,
  languageLabel,
  formatUsd,
  formatBytes,
  fileNameFromUrl,
  fmt,
  InfoRow,
} from "./shared";
import { PhoneMockup } from "./PhoneMockup";

interface DramaDetailViewProps {
  t: ContentMessages;
  detail: CourseDetail;
  languages: LanguageOption[];
  canUploadCourse: boolean;
  onBack: () => void;
  onManageEpisodes: () => void;
  onResubmit: () => void;
}

/** 短剧详情（img_11）。数据来自 GET /publisher/course/detail。 */
export const DramaDetailView: React.FC<DramaDetailViewProps> = ({
  t,
  detail,
  languages,
  canUploadCourse,
  onBack,
  onManageEpisodes,
  onResubmit,
}) => {
  const { basic, progress, publish, priceRule, revenue } = detail;
  const auStyle = auditStatusStyle[detail.auditStatus] ?? { bg: "#F3F4F6", color: "#6B7280" };
  const pct = progress.percent;

  // 上架状态仅在审核通过（auditStatus=2）时有意义
  const showShelf = detail.auditStatus === 2;
  const shStyle = shelfStatusStyle[publish.shelfStatus] ?? { bg: "#F3F4F6", color: "#9CA3AF" };

  const highlights = highlightsOf(publish.publishScope);
  const distLabel = publish.publishScope === 2 ? t.distFull : t.distAccount;
  const distLabelColor = publish.publishScope === 2 ? "#E8192C" : "#374151";
  const distLabelBg = publish.publishScope === 2 ? "#FFF1F2" : "#F3F4F6";

  const phoneLabels = { home: t.phoneHome, forYou: t.phoneForYou, me: t.phoneMe };
  const canContinueUpload = canUploadCourse && detail.canEdit === true;
  const canResubmit = canUploadCourse && detail.canEdit === true && detail.canResubmit === true;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: "1.0625rem" }}>
              {detail.title}
            </h2>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs"
              style={{ background: auStyle.bg, color: auStyle.color, fontWeight: 500 }}
            >
              {auditStatusLabel(detail.auditStatus, t)}
            </span>
            <span className="text-xs text-gray-400 font-mono">{detail.dramaNo}</span>
          </div>
        </div>
        {canResubmit && (
          <button
            onClick={onResubmit}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
            style={{ fontWeight: 600 }}
          >
            <Pencil className="w-3.5 h-3.5" />
            {t.actionResubmit}
          </button>
        )}
        <button
          onClick={onManageEpisodes}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs hover:opacity-90 transition-opacity"
          style={{ background: "#111111", fontWeight: 600 }}
        >
          <Video className="w-3.5 h-3.5" />
          {t.detailEpisodeVideos}
        </button>
      </div>

      {/* 审核驳回原因（仅 auditStatus=3） */}
      {detail.auditStatus === 3 && detail.auditRemark && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-100 mb-6">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs text-red-600 mb-0.5" style={{ fontWeight: 600 }}>
              {t.rejectReasonTitle}
            </p>
            <p className="text-sm text-red-700 leading-relaxed">{detail.auditRemark}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
        {/* Left */}
        <div className="space-y-5">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm text-gray-900 mb-1" style={{ fontWeight: 700 }}>
              {t.detailBasicInfo}
            </h3>
            <p className="text-xs text-gray-400 mb-4">{t.detailBasicInfoDesc}</p>

            <div className="flex gap-5 mb-5">
              <div className="w-24 h-32 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {basic.titleImg ? (
                  <img src={basic.titleImg} alt={t.detailDescription} className="w-full h-full object-cover" />
                ) : (
                  <Film className="w-7 h-7 text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1.5" style={{ fontWeight: 500 }}>
                  {t.detailDescription}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-all">
                  {basic.details || t.detailNoDescription}
                </p>
              </div>
            </div>

            <InfoRow icon={<Globe className="w-3.5 h-3.5" />} label={t.detailLanguage}>
              <span className="text-sm text-gray-700">{languageLabel(basic.languageType, languages)}</span>
            </InfoRow>

            <InfoRow icon={<Tag className="w-3.5 h-3.5" />} label={t.detailTags}>
              <div className="flex gap-1.5 flex-wrap">
                {basic.courseLabel.map((label) => (
                  <span
                    key={label}
                    className="px-2 py-0.5 rounded-md text-xs bg-gray-100 text-gray-600"
                    style={{ fontWeight: 500 }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </InfoRow>

            <InfoRow icon={<Hash className="w-3.5 h-3.5" />} label={t.detailChannel}>
              <span className="text-sm text-gray-700">{t.channels[genderChannelKey(basic.genderType)]}</span>
            </InfoRow>

            <InfoRow icon={<Tag className="w-3.5 h-3.5" />} label={t.classificationLabel}>
              <span className="text-sm text-gray-700">{basic.classificationName || "--"}</span>
            </InfoRow>

            <InfoRow icon={<FileText className="w-3.5 h-3.5" />} label={t.detailCopyright}>
              <span className="text-sm text-gray-700">
                {basic.copyrightType === 1 ? t.copyrightSelf : t.copyrightLicensed}
              </span>
            </InfoRow>

            <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label={t.detailUploadDate}>
              <span className="text-sm text-gray-700">{basic.createTime}</span>
            </InfoRow>
          </div>

          {/* Pricing（按国家，平台只读） */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm text-gray-900 mb-4" style={{ fontWeight: 700 }}>
              {t.detailPricingTitle}
            </h3>
            <div className="space-y-3">
              {priceRule.length === 0 && (
                <p className="text-sm text-gray-400">{t.pricingEmpty}</p>
              )}
              {priceRule.map((c) => (
                <div key={c.country} className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>
                      {c.countryName || c.country}
                    </span>
                    <span className="ml-auto text-xs text-gray-400">{t.pricingReadonly}</span>
                  </div>
                  <div className="grid gap-2.5 grid-cols-2">
                    <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <p className="text-xs text-gray-400 mb-0.5">{t.detailFullSeries}</p>
                      <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>
                        {formatUsd(c.wholePriceUsd)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <p className="text-xs text-gray-400 mb-0.5">{t.detailPerEpisode}</p>
                      <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>
                        {formatUsd(c.episodePriceUsd)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-5">
          {/* Episode Progress */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-900" style={{ fontWeight: 700 }}>
                {t.detailEpisodeProgress}
              </h3>
              <button
                onClick={onManageEpisodes}
                className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
                style={{ fontWeight: 500 }}
              >
                {t.detailManageEpisodes}
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500">
                  {fmt(t.detailUploadedOf, {
                    done: progress.uploadedEpisodes,
                    total: progress.plannedEpisodes,
                  })}
                </span>
                <span className="text-xs text-gray-900" style={{ fontWeight: 700 }}>
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-[#111111] transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-1 rounded-lg text-xs bg-green-50 text-green-600" style={{ fontWeight: 600 }}>
                {t.statUploaded} {progress.uploadedEpisodes}
              </span>
              <span className="px-2 py-1 rounded-lg text-xs bg-red-50 text-red-500" style={{ fontWeight: 600 }}>
                {fmt(t.detailFailedEpisodes, { n: progress.failedEpisodes ?? 0 })}
              </span>
              <span className="px-2 py-1 rounded-lg text-xs bg-indigo-50 text-indigo-600" style={{ fontWeight: 600 }}>
                {fmt(t.detailPendingEpisodes, { n: progress.pendingEpisodes ?? 0 })}
              </span>
            </div>

            <button
              onClick={onManageEpisodes}
              disabled={!canContinueUpload}
              className="mt-4 w-full py-2 rounded-xl border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-colors"
              style={{ fontWeight: 500 }}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {t.detailContinueUpload}
            </button>
          </div>

          {/* Highlight Video */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm text-gray-900 mb-3" style={{ fontWeight: 700 }}>
              {t.detailHighlightVideo}
            </h3>
            {basic.highlightVideoUrl ? (
              <a
                href={basic.highlightVideoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                  <Film className="w-4 h-4 text-gray-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-700 truncate" style={{ fontWeight: 600 }}>
                    {basic.highlightFileName || fileNameFromUrl(basic.highlightVideoUrl)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {basic.highlightFileSize ? formatBytes(basic.highlightFileSize) : "—"}
                    {basic.highlightUploadTime ? ` · ${fmt(t.detailHighlightUploadedAt, { time: basic.highlightUploadTime })}` : ""}
                  </p>
                </div>
              </a>
            ) : (
              <p className="text-xs text-gray-400">{t.detailHighlightMissing}</p>
            )}
          </div>

          {/* Distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm text-gray-900 mb-4" style={{ fontWeight: 700 }}>
              {t.detailDistribution}
            </h3>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span
                className="px-2.5 py-1 rounded-full text-xs"
                style={{ background: distLabelBg, color: distLabelColor, fontWeight: 600 }}
              >
                {distLabel}
              </span>
              {showShelf && (
                <span
                  className="px-2.5 py-1 rounded-full text-xs"
                  style={{ background: shStyle.bg, color: shStyle.color, fontWeight: 600 }}
                >
                  {shelfStatusLabel(publish.shelfStatus, t)}
                </span>
              )}
            </div>
            <div className="flex justify-center py-2 mb-4">
              <PhoneMockup
                highlights={highlights}
                dramaName={detail.title}
                labels={phoneLabels}
                homepageLabel={t.tagHomepage}
                placeholderName={t.nameLabel}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {highlights.map((h) => (
                <span
                  key={h}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-gray-100 text-gray-600"
                  style={{ fontWeight: 500 }}
                >
                  {h === "account" && <User className="w-3 h-3" />}
                  {h === "homepage" && <Home className="w-3 h-3" />}
                  {h === "foryou" && <Sparkles className="w-3 h-3" />}
                  {h === "account" ? t.tagAccount : h === "homepage" ? t.tagHomepage : t.tagForYou}
                </span>
              ))}
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm text-gray-900 mb-3" style={{ fontWeight: 700 }}>
              {t.detailRevenue}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {publish.publishScope === 2 ? t.revenueFullFull : t.revenueAccountFull}
            </p>
            <div className="flex gap-2.5 mt-3">
              <div className="flex-1 rounded-xl bg-gray-50 px-3 py-2.5 text-center">
                <p className="text-xs text-gray-400 mb-0.5">{t.platform}</p>
                <p className="text-lg text-gray-700" style={{ fontWeight: 800 }}>
                  {revenue.platformRatio}%
                </p>
              </div>
              <div className="flex-1 rounded-xl bg-[#111111] px-3 py-2.5 text-center">
                <p className="text-xs text-white/60 mb-0.5">{t.producer}</p>
                <p className="text-lg text-white" style={{ fontWeight: 800 }}>
                  {revenue.creatorRatio}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
