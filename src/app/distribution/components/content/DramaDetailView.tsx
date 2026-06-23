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
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  PlusCircle,
  User,
  Home,
  Sparkles,
} from "lucide-react";
import type { ContentMessages } from "../../i18n/content";
import { COUNTRIES } from "../../mock/content";
import type { DramaRow, EpisodeRecord } from "./types";
import { dramaStatusStyle, dramaStatusLabel, fmt, InfoRow, highlightsOf } from "./shared";
import { PhoneMockup } from "./PhoneMockup";

interface DramaDetailViewProps {
  t: ContentMessages;
  drama: DramaRow;
  episodes: EpisodeRecord[];
  onBack: () => void;
  onManageEpisodes: () => void;
}

/** 短剧详情（figma 15081-23665）。 */
export const DramaDetailView: React.FC<DramaDetailViewProps> = ({
  t,
  drama,
  episodes,
  onBack,
  onManageEpisodes,
}) => {
  const stStyle = dramaStatusStyle[drama.status];
  const uploadedCount = episodes.filter((e) => e.status === "uploaded").length;
  const processingCount = episodes.filter((e) => e.status === "processing").length;
  const failedCount = episodes.filter((e) => e.status === "failed").length;
  const pct = drama.episodes ? Math.round((uploadedCount / drama.episodes) * 100) : 0;

  const highlights = highlightsOf(drama.distribution);
  const distLabel = drama.distribution === "full" ? t.distFull : t.distAccount;
  const distLabelColor = drama.distribution === "full" ? "#E8192C" : "#374151";
  const distLabelBg = drama.distribution === "full" ? "#FFF1F2" : "#F3F4F6";
  const revenueLabel = drama.revenueType === "full" ? t.revenueFullFull : t.revenueAccountFull;

  const phoneLabels = { home: t.phoneHome, forYou: t.phoneForYou, me: t.phoneMe };
  const selectedCountries = COUNTRIES.filter((c) => drama.countries.includes(c.value));

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
              {drama.name}
            </h2>
            {drama.status === "reviewing" ? (
              <span
                className="px-2.5 py-0.5 rounded-full text-xs"
                style={{ background: "#FFF7ED", color: "#EA580C", fontWeight: 500 }}
              >
                {t.statusReviewing}
              </span>
            ) : (
              <span
                className="px-2.5 py-0.5 rounded-full text-xs"
                style={{ background: stStyle.bg, color: stStyle.color, fontWeight: 500 }}
              >
                {dramaStatusLabel(drama.status, t)}
              </span>
            )}
            <span className="text-xs text-gray-400 font-mono">{drama.id}</span>
          </div>
        </div>
        <button
          onClick={onManageEpisodes}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs hover:opacity-90 transition-opacity"
          style={{ background: "#111111", fontWeight: 600 }}
        >
          <Video className="w-3.5 h-3.5" />
          {t.detailEpisodeVideos}
        </button>
      </div>

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
                {drama.cover ? (
                  <img src={drama.cover} alt={t.detailDescription} className="w-full h-full object-cover" />
                ) : (
                  <Film className="w-7 h-7 text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1.5" style={{ fontWeight: 500 }}>
                  {t.detailDescription}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {drama.description || t.detailNoDescription}
                </p>
              </div>
            </div>

            <InfoRow icon={<Globe className="w-3.5 h-3.5" />} label={t.detailCountries}>
              <div className="flex gap-2 flex-wrap">
                {selectedCountries.map((c) => (
                  <div
                    key={c.value}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200"
                  >
                    <span className="text-sm">{c.flag}</span>
                    <span className="text-xs text-gray-700" style={{ fontWeight: 500 }}>
                      {t.countries[c.value as keyof typeof t.countries]}
                    </span>
                  </div>
                ))}
              </div>
            </InfoRow>

            <InfoRow icon={<Tag className="w-3.5 h-3.5" />} label={t.detailTags}>
              <div className="flex gap-1.5 flex-wrap">
                {drama.tags.map((tv) => (
                  <span
                    key={tv}
                    className="px-2 py-0.5 rounded-md text-xs bg-gray-100 text-gray-600"
                    style={{ fontWeight: 500 }}
                  >
                    {t.tags[tv as keyof typeof t.tags] ?? tv}
                  </span>
                ))}
              </div>
            </InfoRow>

            <InfoRow icon={<Hash className="w-3.5 h-3.5" />} label={t.detailChannel}>
              <span className="text-sm text-gray-700">{t.channels[drama.channel]}</span>
            </InfoRow>

            <InfoRow icon={<FileText className="w-3.5 h-3.5" />} label={t.detailCopyright}>
              <span className="text-sm text-gray-700">
                {drama.copyright === "self" ? t.copyrightSelf : t.copyrightLicensed}
              </span>
            </InfoRow>

            <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label={t.detailUploadDate}>
              <span className="text-sm text-gray-700">{drama.uploadedAt}</span>
            </InfoRow>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm text-gray-900 mb-4" style={{ fontWeight: 700 }}>
              {t.detailPricingTitle}
            </h3>
            <div className="space-y-3">
              {selectedCountries.map((c) => (
                <div key={c.value} className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">{c.flag}</span>
                    <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>
                      {t.countries[c.value as keyof typeof t.countries]}
                    </span>
                    <span className="ml-auto text-xs text-gray-400">{t.pricingReadonly}</span>
                  </div>
                  <div className={`grid gap-2.5 ${c.pricing.ad ? "grid-cols-3" : "grid-cols-2"}`}>
                    <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <p className="text-xs text-gray-400 mb-0.5">{t.detailFullSeries}</p>
                      <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>
                        {c.pricing.full}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <p className="text-xs text-gray-400 mb-0.5">{t.detailPerEpisode}</p>
                      <p className="text-sm text-gray-900" style={{ fontWeight: 700 }}>
                        {c.pricing.single}
                      </p>
                    </div>
                    {c.pricing.ad && (
                      <div className="bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
                        <p className="text-xs text-amber-600 mb-0.5">{t.detailAd15s}</p>
                        <p className="text-sm text-amber-700" style={{ fontWeight: 700 }}>
                          {t.adHas}
                        </p>
                      </div>
                    )}
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
                  {fmt(t.detailUploadedOf, { done: uploadedCount, total: drama.episodes })}
                </span>
                <span className="text-xs text-gray-900" style={{ fontWeight: 700 }}>
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-[#111111] transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              {[
                { icon: <CheckCircle2 className="w-3 h-3" />, count: uploadedCount, label: t.statUploaded, color: "#16A34A", bg: "#F0FDF4" },
                { icon: <Clock className="w-3 h-3" />, count: processingCount, label: t.statProcessing, color: "#EA580C", bg: "#FFF7ED" },
                { icon: <AlertCircle className="w-3 h-3" />, count: failedCount, label: t.statFailed, color: "#EF4444", bg: "#FEF2F2" },
              ].map((item, i) => (
                <div key={i} className="flex-1 rounded-xl px-2.5 py-2 text-center" style={{ background: item.bg }}>
                  <div className="flex items-center justify-center gap-1 mb-0.5" style={{ color: item.color }}>
                    {item.icon}
                    <span className="text-sm" style={{ fontWeight: 800 }}>
                      {item.count}
                    </span>
                  </div>
                  <p className="text-[10px]" style={{ color: item.color }}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={onManageEpisodes}
              className="mt-4 w-full py-2 rounded-xl border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
              style={{ fontWeight: 500 }}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {t.detailContinueUpload}
            </button>
          </div>

          {/* Distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm text-gray-900 mb-4" style={{ fontWeight: 700 }}>
              {t.detailDistribution}
            </h3>
            <div className="flex items-center gap-2 mb-4">
              <span
                className="px-2.5 py-1 rounded-full text-xs"
                style={{ background: distLabelBg, color: distLabelColor, fontWeight: 600 }}
              >
                {distLabel}
              </span>
            </div>
            <div className="flex justify-center py-2 mb-4">
              <PhoneMockup
                highlights={highlights}
                dramaName={drama.name}
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
            <p className="text-xs text-gray-600 leading-relaxed">{revenueLabel}</p>
            <div className="flex gap-2.5 mt-3">
              <div className="flex-1 rounded-xl bg-gray-50 px-3 py-2.5 text-center">
                <p className="text-xs text-gray-400 mb-0.5">{t.platform}</p>
                <p className="text-lg text-gray-700" style={{ fontWeight: 800 }}>
                  {drama.revenueType === "full" ? "40%" : "20%"}
                </p>
              </div>
              <div className="flex-1 rounded-xl bg-[#111111] px-3 py-2.5 text-center">
                <p className="text-xs text-white/60 mb-0.5">{t.producer}</p>
                <p className="text-lg text-white" style={{ fontWeight: 800 }}>
                  {drama.revenueType === "full" ? "60%" : "80%"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
