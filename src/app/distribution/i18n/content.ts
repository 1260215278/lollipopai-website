import type { Locale } from "../../i18n";
import { TAG_VALUES, CHANNEL_VALUES } from "../mock/content";

/**
 * 上剧中心文案 —— 由 P2 功能 subagent 拥有并扩充。
 * zh-CN 为权威（取自 figma 15293-178/15294-663/15294-423/15077-20404/15081-20689/
 * 15081-20916/15081-21259/15081-21629/15081-22516/15081-22048/15081-22937/
 * 15081-23236/15081-23665 与原型 ContentPage）；en 同步；zh-TW / pt 机翻占位。
 * 4 语言结构完全一致；含 {n} / {m} / {total} / {pct} / {pending} 等占位，由组件 replace。
 */

/** 标签 value → label 映射类型（与 mock TAG_VALUES 对齐） */
type TagLabels = Record<(typeof TAG_VALUES)[number], string>;
/** 频道 value → label 映射类型（与 mock CHANNEL_VALUES 对齐） */
type ChannelLabels = Record<(typeof CHANNEL_VALUES)[number], string>;
/** 国家 value → label 映射（US/PH/IN） */
type CountryLabels = { us: string; ph: string; in: string };

export interface ContentMessages {
  title: string;
  subtitle: string;

  // ── 通用动作 / 共享 ──
  next: string;
  prev: string;
  cancel: string;
  back: string;

  // ── 列表页 ──
  searchPlaceholder: string;
  uploadDrama: string;
  emptyTitle: string;
  uploadNow: string;
  colDramaInfo: string;
  colCountries: string;
  colDistribution: string;
  colReview: string;
  colPublishStatus: string;
  colCopyright: string;
  colRevenue: string;
  colActions: string;
  /** "{done}/{total}集已上传" */
  episodesUploaded: string;

  // ── 状态 / 标签 ──
  statusOnline: string;
  statusOffline: string;
  statusReviewing: string;
  statusNotPublished: string;
  reviewApproved: string;
  reviewReviewing: string;
  distAccount: string;
  distFull: string;
  revenueAccountShort: string;
  revenueFullShort: string;
  copyrightSelf: string;
  copyrightLicensed: string;

  // ── 行内操作菜单 ──
  actionViewDetail: string;
  actionEpisodes: string;
  actionTakeOffline: string;
  actionRepublish: string;
  actionPublishNow: string;
  actionReviewLocked: string;

  // ── 下架确认弹窗 ──
  offlineConfirmTitle: string;
  offlineConfirmDesc: string;
  offlineConfirmOk: string;

  // ── 上剧流程通用 ──
  uploadTitle: string;
  draftRestored: string;
  draftStartFresh: string;
  step1: string;
  step2: string;
  step3: string;
  stepFooter1: string;
  stepFooter2: string;
  stepFooter3: string;

  // ── Step 1 基本信息 ──
  coverLabel: string;
  coverPrompt: string;
  coverHint: string;
  coverRatio: string;
  coverReplace: string;
  coverUploadFailed: string;
  nameLabel: string;
  namePlaceholder: string;
  descLabel: string;
  descPlaceholder: string;
  episodesLabel: string;
  episodesLockHint: string;
  episodesPlaceholder: string;
  channelLabel: string;
  tagsLabel: string;
  copyrightLabel: string;

  // ── Step 2 上传剧集 ──
  colEp: string;
  colEpTitle: string;
  colVideoFile: string;
  colSize: string;
  colDuration: string;
  colStatus: string;
  epTitlePlaceholder: string;
  chooseFile: string;
  epStatusPending: string;
  epStatusReady: string;
  epStatusError: string;
  fileTooLarge: string;
  readingDuration: string;
  /** "共 {total} 集，已选择 {selected} 集" */
  uploadSummary: string;

  // ── Step 3 发布配置 ──
  distSectionTitle: string;
  distSectionDesc: string;
  optAccountTitle: string;
  optAccountDesc: string;
  optAccountBadge: string;
  optFullTitle: string;
  optFullDesc: string;
  optFullBadge: string;
  revenueAccountTitle: string;
  revenueFullTitle: string;
  platform: string;
  producer: string;
  countriesSectionTitle: string;
  countriesSectionDesc: string;
  viewPricingRules: string;
  publishSettingsTitle: string;
  publishNowOption: string;
  publishLaterOption: string;
  submitPublish: string;
  submitSuccess: string;

  // 手机预览底部标签
  phoneHome: string;
  phoneForYou: string;
  phoneMe: string;
  tagAccount: string;
  tagHomepage: string;
  tagForYou: string;

  // ── 收费规则弹窗 ──
  pricingTitle: string;
  pricingDesc: string;
  pricingColCountry: string;
  pricingColFull: string;
  pricingColSingle: string;
  pricingColAd: string;
  pricingReadonly: string;
  adNone: string;
  /** 广告列「有」 */
  adHas: string;
  /** 剧集序号标签，"第{ep}集" / "Episode {ep}" */
  epLabelN: string;

  // ── 详情页 ──
  detailEpisodeVideos: string;
  detailBasicInfo: string;
  detailBasicInfoDesc: string;
  detailDescription: string;
  detailNoDescription: string;
  detailCountries: string;
  detailTags: string;
  detailChannel: string;
  detailCopyright: string;
  detailUploadDate: string;
  detailPricingTitle: string;
  detailFullSeries: string;
  detailPerEpisode: string;
  detailAd15s: string;
  detailEpisodeProgress: string;
  detailManageEpisodes: string;
  detailUploadedOf: string;
  detailContinueUpload: string;
  detailDistribution: string;
  detailRevenue: string;
  revenueAccountFull: string;
  revenueFullFull: string;
  statUploaded: string;
  statProcessing: string;
  statFailed: string;

  // ── 剧集视频管理页 ──
  episodesTitle: string;
  episodesBreadcrumbCount: string;
  episodesSearchPlaceholder: string;
  episodesResultCount: string;
  statPendingSubmit: string;
  epColUploadDate: string;
  epActionReplace: string;
  epActionRetry: string;
  epActionUpload: string;
  epStatusUploaded: string;
  epStatusProcessing: string;
  epStatusFailed: string;
  epStatusNew: string;
  epUploading: string;
  /** "提交上传 ({n})" */
  epSubmitN: string;
  /** "提交 {n} 个视频" */
  epSubmitNVideos: string;
  epSaved: string;
  epTotalCount: string;
  videoUploadFailed: string;

  // ── 加载 / 错误 ──
  loadFailed: string;

  // ── 维度映射 ──
  countries: CountryLabels;
  tags: TagLabels;
  channels: ChannelLabels;
}

export const content: Record<Locale, ContentMessages> = {
  "zh-CN": {
    title: "上剧中心",
    subtitle: "上传与管理你的剧集",

    next: "下一步",
    prev: "上一步",
    cancel: "取消",
    back: "返回",

    searchPlaceholder: "搜索短剧名称 / ID",
    uploadDrama: "上传短剧",
    emptyTitle: "暂无短剧，点击上传",
    uploadNow: "立即上传短剧",
    colDramaInfo: "剧集信息",
    colCountries: "上架国家",
    colDistribution: "发布范围",
    colReview: "审核状态",
    colPublishStatus: "上架状态",
    colCopyright: "版权类型",
    colRevenue: "收益方式",
    colActions: "操作",
    episodesUploaded: "{done}/{total}集已上传",

    statusOnline: "已上架",
    statusOffline: "已下架",
    statusReviewing: "审核中",
    statusNotPublished: "未上架",
    reviewApproved: "已通过",
    reviewReviewing: "审核中",
    distAccount: "账号主页",
    distFull: "全量推荐",
    revenueAccountShort: "账户主页订阅 2:8",
    revenueFullShort: "全量推荐订阅 4:6",
    copyrightSelf: "自制",
    copyrightLicensed: "授权",

    actionViewDetail: "查看详情",
    actionEpisodes: "剧集视频",
    actionTakeOffline: "下架",
    actionRepublish: "重新上架",
    actionPublishNow: "立即上架",
    actionReviewLocked: "审核中，暂不可操作",

    offlineConfirmTitle: "确认下架此短剧？",
    offlineConfirmDesc: "下架后该剧集将对用户不可见，收益将暂停结算。您可以随时重新上架。",
    offlineConfirmOk: "确认下架",

    uploadTitle: "上传短剧",
    draftRestored: "已恢复上次未完成的草稿内容。",
    draftStartFresh: "清空重填",
    step1: "短剧基本信息",
    step2: "上传剧集",
    step3: "发布配置",
    stepFooter1: "步骤 1 / 3：基本信息",
    stepFooter2: "步骤 2 / 3：上传剧集",
    stepFooter3: "步骤 3 / 3：发布配置",

    coverLabel: "封面",
    coverPrompt: "点击上传封面",
    coverHint: "9:16 · JPG / PNG · 300 ~ 500 KB",
    coverRatio: "9:16",
    coverReplace: "点击替换",
    coverUploadFailed: "封面上传失败，请重试",
    nameLabel: "短剧名称",
    namePlaceholder: "请输入短剧名称",
    descLabel: "剧情简介",
    descPlaceholder: "请输入剧情简介，介绍人物背景、核心矛盾与情感主线……",
    episodesLabel: "集数",
    episodesLockHint: "选择集数后不可修改",
    episodesPlaceholder: "请输入集数",
    channelLabel: "频道",
    tagsLabel: "标签",
    copyrightLabel: "版权类型",

    colEp: "集数",
    colEpTitle: "剧集标题",
    colVideoFile: "视频文件（最大 500MB）",
    colSize: "大小",
    colDuration: "时长",
    colStatus: "状态",
    epTitlePlaceholder: "第{ep}集标题（选填）",
    chooseFile: "选择文件",
    epStatusPending: "待上传",
    epStatusReady: "已选择",
    epStatusError: "错误",
    fileTooLarge: "文件超过 500MB 限制",
    readingDuration: "读取中…",
    uploadSummary: "共 {total} 集，已选择 {selected} 集",

    distSectionTitle: "发布范围",
    distSectionDesc: "选择短剧的展示位置，影响曝光量与收益方式",
    optAccountTitle: "账号主页",
    optAccountDesc: "短剧仅展示在您的账号主页，适合精准粉丝转化。",
    optAccountBadge: "基础曝光",
    optFullTitle: "账号主页 + 首页推荐 + For You 推荐",
    optFullDesc: "同步推送至首页推荐位与 For You 流量池，最大化曝光与收益。",
    optFullBadge: "全量推荐",
    revenueAccountTitle: "收益方式：账户主页订阅费",
    revenueFullTitle: "收益方式：首页+For You+账户主页订阅费",
    platform: "平台",
    producer: "出品方",
    countriesSectionTitle: "上架国家",
    countriesSectionDesc: "选择短剧上架发行的目标国家（可多选）",
    viewPricingRules: "查看各国收费规则",
    publishSettingsTitle: "上架设置",
    publishNowOption: "立即上架",
    publishLaterOption: "暂不上架",
    submitPublish: "提交发布",
    submitSuccess: "提交成功，短剧已进入审核",

    phoneHome: "首页",
    phoneForYou: "For You",
    phoneMe: "我的",
    tagAccount: "账号主页",
    tagHomepage: "首页推荐",
    tagForYou: "For You",

    pricingTitle: "各国收费规则",
    pricingDesc: "以下为平台统一定价，不可修改。",
    pricingColCountry: "国家",
    pricingColFull: "整部剧",
    pricingColSingle: "单集",
    pricingColAd: "15s广告",
    pricingReadonly: "平台定价，不可修改",
    adNone: "无",
    adHas: "有",
    epLabelN: "第{ep}集",

    detailEpisodeVideos: "剧集视频",
    detailBasicInfo: "基本信息",
    detailBasicInfoDesc: "上剧时填写的基础资料",
    detailDescription: "作品简介",
    detailNoDescription: "暂无简介",
    detailCountries: "上架国家",
    detailTags: "标签",
    detailChannel: "频道类型",
    detailCopyright: "版权类型",
    detailUploadDate: "上传日期",
    detailPricingTitle: "收费规则",
    detailFullSeries: "整部剧",
    detailPerEpisode: "单集",
    detailAd15s: "15s广告费",
    detailEpisodeProgress: "剧集进度",
    detailManageEpisodes: "管理剧集",
    detailUploadedOf: "已上传 {done} / {total} 集",
    detailContinueUpload: "继续上传剧集",
    detailDistribution: "发布配置",
    detailRevenue: "收益方式",
    revenueAccountFull: "账户主页订阅（平台2 : 出品方8）",
    revenueFullFull: "全量推荐订阅（平台4 : 出品方6）",
    statUploaded: "已上传",
    statProcessing: "转码中",
    statFailed: "失败",

    episodesTitle: "剧集视频管理",
    episodesBreadcrumbCount: "共 {total} 集，已上传 {done} 集",
    episodesSearchPlaceholder: "搜索集数或标题",
    episodesResultCount: "显示 {n} 条",
    statPendingSubmit: "待提交",
    epColUploadDate: "上传日期",
    epActionReplace: "替换",
    epActionRetry: "重新上传",
    epActionUpload: "上传",
    epStatusUploaded: "已上传",
    epStatusProcessing: "转码中",
    epStatusFailed: "上传失败",
    epStatusNew: "待提交",
    epUploading: "上传中…",
    epSubmitN: "提交上传 ({n})",
    epSubmitNVideos: "提交 {n} 个视频",
    epSaved: "已保存",
    epTotalCount: "共 {total} 集",
    videoUploadFailed: "视频上传失败，请重试",

    loadFailed: "加载失败，请重试",

    countries: { us: "美国", ph: "菲律宾", in: "印度" },
    tags: {
      urban: "都市日常",
      rural: "乡村",
      romance: "职场婚恋",
      youth: "青春",
      family: "家庭",
      mystery: "悬疑",
      comeback: "逆袭",
      plot: "剧情",
      wuxia: "武侠",
      comedy: "喜剧",
      ancient: "古风",
      campus: "校园",
    },
    channels: { male: "男频", female: "女频", general: "通用" },
  },

  "zh-TW": {
    title: "上劇中心",
    subtitle: "上傳與管理你的劇集",

    next: "下一步",
    prev: "上一步",
    cancel: "取消",
    back: "返回",

    searchPlaceholder: "搜尋短劇名稱 / ID",
    uploadDrama: "上傳短劇",
    emptyTitle: "暫無短劇，點擊上傳",
    uploadNow: "立即上傳短劇",
    colDramaInfo: "劇集資訊",
    colCountries: "上架國家",
    colDistribution: "發佈範圍",
    colReview: "審核狀態",
    colPublishStatus: "上架狀態",
    colCopyright: "版權類型",
    colRevenue: "收益方式",
    colActions: "操作",
    episodesUploaded: "{done}/{total}集已上傳",

    statusOnline: "已上架",
    statusOffline: "已下架",
    statusReviewing: "審核中",
    statusNotPublished: "未上架",
    reviewApproved: "已通過",
    reviewReviewing: "審核中",
    distAccount: "帳號主頁",
    distFull: "全量推薦",
    revenueAccountShort: "帳戶主頁訂閱 2:8",
    revenueFullShort: "全量推薦訂閱 4:6",
    copyrightSelf: "自製",
    copyrightLicensed: "授權",

    actionViewDetail: "查看詳情",
    actionEpisodes: "劇集影片",
    actionTakeOffline: "下架",
    actionRepublish: "重新上架",
    actionPublishNow: "立即上架",
    actionReviewLocked: "審核中，暫不可操作",

    offlineConfirmTitle: "確認下架此短劇？",
    offlineConfirmDesc: "下架後該劇集將對使用者不可見，收益將暫停結算。您可以隨時重新上架。",
    offlineConfirmOk: "確認下架",

    uploadTitle: "上傳短劇",
    draftRestored: "已還原上次未完成的草稿內容。",
    draftStartFresh: "清空重填",
    step1: "短劇基本資訊",
    step2: "上傳劇集",
    step3: "發佈設定",
    stepFooter1: "步驟 1 / 3：基本資訊",
    stepFooter2: "步驟 2 / 3：上傳劇集",
    stepFooter3: "步驟 3 / 3：發佈設定",

    coverLabel: "封面",
    coverPrompt: "點擊上傳封面",
    coverHint: "9:16 · JPG / PNG · 300 ~ 500 KB",
    coverRatio: "9:16",
    coverReplace: "點擊替換",
    coverUploadFailed: "封面上傳失敗，請重試",
    nameLabel: "短劇名稱",
    namePlaceholder: "請輸入短劇名稱",
    descLabel: "劇情簡介",
    descPlaceholder: "請輸入劇情簡介，介紹人物背景、核心衝突與情感主線……",
    episodesLabel: "集數",
    episodesLockHint: "選擇集數後不可修改",
    episodesPlaceholder: "請輸入集數",
    channelLabel: "頻道",
    tagsLabel: "標籤",
    copyrightLabel: "版權類型",

    colEp: "集數",
    colEpTitle: "劇集標題",
    colVideoFile: "影片檔案（最大 500MB）",
    colSize: "大小",
    colDuration: "時長",
    colStatus: "狀態",
    epTitlePlaceholder: "第{ep}集標題（選填）",
    chooseFile: "選擇檔案",
    epStatusPending: "待上傳",
    epStatusReady: "已選擇",
    epStatusError: "錯誤",
    fileTooLarge: "檔案超過 500MB 限制",
    readingDuration: "讀取中…",
    uploadSummary: "共 {total} 集，已選擇 {selected} 集",

    distSectionTitle: "發佈範圍",
    distSectionDesc: "選擇短劇的展示位置，影響曝光量與收益方式",
    optAccountTitle: "帳號主頁",
    optAccountDesc: "短劇僅展示在您的帳號主頁，適合精準粉絲轉化。",
    optAccountBadge: "基礎曝光",
    optFullTitle: "帳號主頁 + 首頁推薦 + For You 推薦",
    optFullDesc: "同步推送至首頁推薦位與 For You 流量池，最大化曝光與收益。",
    optFullBadge: "全量推薦",
    revenueAccountTitle: "收益方式：帳戶主頁訂閱費",
    revenueFullTitle: "收益方式：首頁+For You+帳戶主頁訂閱費",
    platform: "平台",
    producer: "出品方",
    countriesSectionTitle: "上架國家",
    countriesSectionDesc: "選擇短劇上架發行的目標國家（可多選）",
    viewPricingRules: "查看各國收費規則",
    publishSettingsTitle: "上架設定",
    publishNowOption: "立即上架",
    publishLaterOption: "暫不上架",
    submitPublish: "提交發佈",
    submitSuccess: "提交成功，短劇已進入審核",

    phoneHome: "首頁",
    phoneForYou: "For You",
    phoneMe: "我的",
    tagAccount: "帳號主頁",
    tagHomepage: "首頁推薦",
    tagForYou: "For You",

    pricingTitle: "各國收費規則",
    pricingDesc: "以下為平台統一定價，不可修改。",
    pricingColCountry: "國家",
    pricingColFull: "整部劇",
    pricingColSingle: "單集",
    pricingColAd: "15s廣告",
    pricingReadonly: "平台定價，不可修改",
    adNone: "無",
    adHas: "有",
    epLabelN: "第{ep}集",

    detailEpisodeVideos: "劇集影片",
    detailBasicInfo: "基本資訊",
    detailBasicInfoDesc: "上劇時填寫的基礎資料",
    detailDescription: "作品簡介",
    detailNoDescription: "暫無簡介",
    detailCountries: "上架國家",
    detailTags: "標籤",
    detailChannel: "頻道類型",
    detailCopyright: "版權類型",
    detailUploadDate: "上傳日期",
    detailPricingTitle: "收費規則",
    detailFullSeries: "整部劇",
    detailPerEpisode: "單集",
    detailAd15s: "15s廣告費",
    detailEpisodeProgress: "劇集進度",
    detailManageEpisodes: "管理劇集",
    detailUploadedOf: "已上傳 {done} / {total} 集",
    detailContinueUpload: "繼續上傳劇集",
    detailDistribution: "發佈設定",
    detailRevenue: "收益方式",
    revenueAccountFull: "帳戶主頁訂閱（平台2 : 出品方8）",
    revenueFullFull: "全量推薦訂閱（平台4 : 出品方6）",
    statUploaded: "已上傳",
    statProcessing: "轉碼中",
    statFailed: "失敗",

    episodesTitle: "劇集影片管理",
    episodesBreadcrumbCount: "共 {total} 集，已上傳 {done} 集",
    episodesSearchPlaceholder: "搜尋集數或標題",
    episodesResultCount: "顯示 {n} 條",
    statPendingSubmit: "待提交",
    epColUploadDate: "上傳日期",
    epActionReplace: "替換",
    epActionRetry: "重新上傳",
    epActionUpload: "上傳",
    epStatusUploaded: "已上傳",
    epStatusProcessing: "轉碼中",
    epStatusFailed: "上傳失敗",
    epStatusNew: "待提交",
    epUploading: "上傳中…",
    epSubmitN: "提交上傳 ({n})",
    epSubmitNVideos: "提交 {n} 個影片",
    epSaved: "已儲存",
    epTotalCount: "共 {total} 集",
    videoUploadFailed: "影片上傳失敗，請重試",

    loadFailed: "載入失敗，請重試",

    countries: { us: "美國", ph: "菲律賓", in: "印度" },
    tags: {
      urban: "都市日常",
      rural: "鄉村",
      romance: "職場婚戀",
      youth: "青春",
      family: "家庭",
      mystery: "懸疑",
      comeback: "逆襲",
      plot: "劇情",
      wuxia: "武俠",
      comedy: "喜劇",
      ancient: "古風",
      campus: "校園",
    },
    channels: { male: "男頻", female: "女頻", general: "通用" },
  },

  en: {
    title: "Upload Drama",
    subtitle: "Upload and manage your dramas",

    next: "Next",
    prev: "Back",
    cancel: "Cancel",
    back: "Back",

    searchPlaceholder: "Search drama name / ID",
    uploadDrama: "Upload Drama",
    emptyTitle: "No dramas yet",
    uploadNow: "Upload Now",
    colDramaInfo: "Drama Info",
    colCountries: "Countries",
    colDistribution: "Distribution",
    colReview: "Review",
    colPublishStatus: "Publish Status",
    colCopyright: "Copyright",
    colRevenue: "Revenue",
    colActions: "Actions",
    episodesUploaded: "{done}/{total} eps uploaded",

    statusOnline: "Online",
    statusOffline: "Offline",
    statusReviewing: "Reviewing",
    statusNotPublished: "Not Published",
    reviewApproved: "Approved",
    reviewReviewing: "Reviewing",
    distAccount: "Account Only",
    distFull: "Full Boost",
    revenueAccountShort: "Account Sub 2:8",
    revenueFullShort: "Full Boost 4:6",
    copyrightSelf: "Original",
    copyrightLicensed: "Licensed",

    actionViewDetail: "View Details",
    actionEpisodes: "Episode Videos",
    actionTakeOffline: "Take Offline",
    actionRepublish: "Re-publish",
    actionPublishNow: "Publish Now",
    actionReviewLocked: "Under review, locked",

    offlineConfirmTitle: "Take this drama offline?",
    offlineConfirmDesc:
      "The drama will be hidden from users and earnings will pause. You can re-publish anytime.",
    offlineConfirmOk: "Confirm Offline",

    uploadTitle: "Upload Drama",
    draftRestored: "Draft restored from your last session.",
    draftStartFresh: "Start fresh",
    step1: "Basic Info",
    step2: "Upload Episodes",
    step3: "Publish Config",
    stepFooter1: "Step 1 / 3: Basic Info",
    stepFooter2: "Step 2 / 3: Upload Episodes",
    stepFooter3: "Step 3 / 3: Publish Config",

    coverLabel: "Cover",
    coverPrompt: "Click to upload",
    coverHint: "9:16 · JPG / PNG · 300 ~ 500 KB",
    coverRatio: "9:16",
    coverReplace: "Replace",
    coverUploadFailed: "Cover upload failed, please retry",
    nameLabel: "Drama Name",
    namePlaceholder: "Enter drama name",
    descLabel: "Description",
    descPlaceholder: "Introduce characters, conflict, and emotional arc...",
    episodesLabel: "Episodes",
    episodesLockHint: "Cannot be changed once set",
    episodesPlaceholder: "e.g. 30",
    channelLabel: "Channel",
    tagsLabel: "Tags",
    copyrightLabel: "Copyright Type",

    colEp: "Ep.",
    colEpTitle: "Title",
    colVideoFile: "Video File (max 500MB)",
    colSize: "Size",
    colDuration: "Duration",
    colStatus: "Status",
    epTitlePlaceholder: "Episode {ep} title (optional)",
    chooseFile: "Choose file",
    epStatusPending: "Pending",
    epStatusReady: "Ready",
    epStatusError: "Error",
    fileTooLarge: "File exceeds 500MB limit",
    readingDuration: "Reading…",
    uploadSummary: "{selected} / {total} selected",

    distSectionTitle: "Distribution",
    distSectionDesc: "Choose where your drama appears — affects exposure and revenue method",
    optAccountTitle: "Account Homepage",
    optAccountDesc: "Drama appears only on your account homepage.",
    optAccountBadge: "Basic Reach",
    optFullTitle: "Account + Homepage + For You",
    optFullDesc: "Pushed to homepage and For You feed for maximum exposure.",
    optFullBadge: "Full Boost",
    revenueAccountTitle: "Revenue: Account Subscription",
    revenueFullTitle: "Revenue: Full Boost Subscription",
    platform: "Platform",
    producer: "Producer",
    countriesSectionTitle: "Target Countries",
    countriesSectionDesc: "Select countries where this drama will be available",
    viewPricingRules: "View pricing rules by country",
    publishSettingsTitle: "Publishing Settings",
    publishNowOption: "Publish Now",
    publishLaterOption: "Save Draft",
    submitPublish: "Submit & Publish",
    submitSuccess: "Submitted. Your drama is now under review.",

    phoneHome: "Home",
    phoneForYou: "For You",
    phoneMe: "Me",
    tagAccount: "Account",
    tagHomepage: "Homepage",
    tagForYou: "For You",

    pricingTitle: "Pricing Rules by Country",
    pricingDesc: "Platform-set pricing, read-only.",
    pricingColCountry: "Country",
    pricingColFull: "Full Series",
    pricingColSingle: "Per Episode",
    pricingColAd: "15s Ad",
    pricingReadonly: "Platform pricing, read-only",
    adNone: "—",
    adHas: "Yes",
    epLabelN: "Episode {ep}",

    detailEpisodeVideos: "Episode Videos",
    detailBasicInfo: "Basic Info",
    detailBasicInfoDesc: "Info filled during upload",
    detailDescription: "Description",
    detailNoDescription: "No description",
    detailCountries: "Countries",
    detailTags: "Tags",
    detailChannel: "Channel",
    detailCopyright: "Copyright",
    detailUploadDate: "Upload Date",
    detailPricingTitle: "Pricing Rules",
    detailFullSeries: "Full Series",
    detailPerEpisode: "Per Episode",
    detailAd15s: "15s Ad",
    detailEpisodeProgress: "Episode Progress",
    detailManageEpisodes: "Manage",
    detailUploadedOf: "{done} / {total} uploaded",
    detailContinueUpload: "Continue Uploading",
    detailDistribution: "Distribution",
    detailRevenue: "Revenue",
    revenueAccountFull: "Account Subscription (Platform 2 : Producer 8)",
    revenueFullFull: "Full Boost Subscription (Platform 4 : Producer 6)",
    statUploaded: "Uploaded",
    statProcessing: "Processing",
    statFailed: "Failed",

    episodesTitle: "Episode Videos",
    episodesBreadcrumbCount: "{done} / {total} episodes uploaded",
    episodesSearchPlaceholder: "Search episode",
    episodesResultCount: "{n} results",
    statPendingSubmit: "Pending Submit",
    epColUploadDate: "Upload Date",
    epActionReplace: "Replace",
    epActionRetry: "Retry",
    epActionUpload: "Upload",
    epStatusUploaded: "Uploaded",
    epStatusProcessing: "Processing",
    epStatusFailed: "Failed",
    epStatusNew: "New",
    epUploading: "Uploading…",
    epSubmitN: "Submit ({n})",
    epSubmitNVideos: "Submit {n} videos",
    epSaved: "Saved",
    epTotalCount: "Total {total} episodes",
    videoUploadFailed: "Video upload failed, please retry",

    loadFailed: "Failed to load, please retry",

    countries: { us: "United States", ph: "Philippines", in: "India" },
    tags: {
      urban: "Urban",
      rural: "Rural",
      romance: "Workplace Romance",
      youth: "Youth",
      family: "Family",
      mystery: "Mystery",
      comeback: "Comeback",
      plot: "Drama",
      wuxia: "Wuxia",
      comedy: "Comedy",
      ancient: "Historical",
      campus: "Campus",
    },
    channels: { male: "Male", female: "Female", general: "General" },
  },

  pt: {
    title: "Publicar drama",
    subtitle: "Envie e gerencie seus dramas",

    next: "Avançar",
    prev: "Voltar",
    cancel: "Cancelar",
    back: "Voltar",

    searchPlaceholder: "Buscar nome do drama / ID",
    uploadDrama: "Enviar drama",
    emptyTitle: "Nenhum drama ainda",
    uploadNow: "Enviar agora",
    colDramaInfo: "Informações do drama",
    colCountries: "Países",
    colDistribution: "Distribuição",
    colReview: "Análise",
    colPublishStatus: "Status de publicação",
    colCopyright: "Direitos autorais",
    colRevenue: "Receita",
    colActions: "Ações",
    episodesUploaded: "{done}/{total} eps enviados",

    statusOnline: "Publicado",
    statusOffline: "Despublicado",
    statusReviewing: "Em análise",
    statusNotPublished: "Não publicado",
    reviewApproved: "Aprovado",
    reviewReviewing: "Em análise",
    distAccount: "Apenas perfil",
    distFull: "Impulso total",
    revenueAccountShort: "Assinatura perfil 2:8",
    revenueFullShort: "Impulso total 4:6",
    copyrightSelf: "Original",
    copyrightLicensed: "Licenciado",

    actionViewDetail: "Ver detalhes",
    actionEpisodes: "Vídeos dos episódios",
    actionTakeOffline: "Despublicar",
    actionRepublish: "Republicar",
    actionPublishNow: "Publicar agora",
    actionReviewLocked: "Em análise, bloqueado",

    offlineConfirmTitle: "Despublicar este drama?",
    offlineConfirmDesc:
      "O drama ficará oculto para os usuários e a receita será pausada. Você pode republicar a qualquer momento.",
    offlineConfirmOk: "Confirmar",

    uploadTitle: "Enviar drama",
    draftRestored: "Rascunho restaurado da sua última sessão.",
    draftStartFresh: "Começar do zero",
    step1: "Informações básicas",
    step2: "Enviar episódios",
    step3: "Configuração de publicação",
    stepFooter1: "Etapa 1 / 3: Informações básicas",
    stepFooter2: "Etapa 2 / 3: Enviar episódios",
    stepFooter3: "Etapa 3 / 3: Configuração de publicação",

    coverLabel: "Capa",
    coverPrompt: "Clique para enviar",
    coverHint: "9:16 · JPG / PNG · 300 ~ 500 KB",
    coverRatio: "9:16",
    coverReplace: "Substituir",
    coverUploadFailed: "Falha no envio da capa, tente novamente",
    nameLabel: "Nome do drama",
    namePlaceholder: "Digite o nome do drama",
    descLabel: "Descrição",
    descPlaceholder: "Apresente personagens, conflito e arco emocional...",
    episodesLabel: "Episódios",
    episodesLockHint: "Não pode ser alterado depois de definido",
    episodesPlaceholder: "ex.: 30",
    channelLabel: "Canal",
    tagsLabel: "Tags",
    copyrightLabel: "Tipo de direitos autorais",

    colEp: "Ep.",
    colEpTitle: "Título",
    colVideoFile: "Arquivo de vídeo (máx. 500MB)",
    colSize: "Tamanho",
    colDuration: "Duração",
    colStatus: "Status",
    epTitlePlaceholder: "Título do episódio {ep} (opcional)",
    chooseFile: "Escolher arquivo",
    epStatusPending: "Pendente",
    epStatusReady: "Pronto",
    epStatusError: "Erro",
    fileTooLarge: "Arquivo excede o limite de 500MB",
    readingDuration: "Lendo…",
    uploadSummary: "{selected} / {total} selecionados",

    distSectionTitle: "Distribuição",
    distSectionDesc: "Escolha onde seu drama aparece — afeta o alcance e a receita",
    optAccountTitle: "Perfil da conta",
    optAccountDesc: "O drama aparece apenas no perfil da sua conta.",
    optAccountBadge: "Alcance básico",
    optFullTitle: "Perfil + Página inicial + For You",
    optFullDesc: "Enviado para a página inicial e o feed For You para alcance máximo.",
    optFullBadge: "Impulso total",
    revenueAccountTitle: "Receita: Assinatura do perfil",
    revenueFullTitle: "Receita: Assinatura de impulso total",
    platform: "Plataforma",
    producer: "Produtor",
    countriesSectionTitle: "Países de destino",
    countriesSectionDesc: "Selecione os países onde este drama ficará disponível",
    viewPricingRules: "Ver regras de preço por país",
    publishSettingsTitle: "Configurações de publicação",
    publishNowOption: "Publicar agora",
    publishLaterOption: "Salvar rascunho",
    submitPublish: "Enviar e publicar",
    submitSuccess: "Enviado. Seu drama está em análise.",

    phoneHome: "Início",
    phoneForYou: "For You",
    phoneMe: "Eu",
    tagAccount: "Perfil",
    tagHomepage: "Página inicial",
    tagForYou: "For You",

    pricingTitle: "Regras de preço por país",
    pricingDesc: "Preços definidos pela plataforma, somente leitura.",
    pricingColCountry: "País",
    pricingColFull: "Série completa",
    pricingColSingle: "Por episódio",
    pricingColAd: "Anúncio 15s",
    pricingReadonly: "Preço da plataforma, somente leitura",
    adNone: "—",
    adHas: "Sim",
    epLabelN: "Episódio {ep}",

    detailEpisodeVideos: "Vídeos dos episódios",
    detailBasicInfo: "Informações básicas",
    detailBasicInfoDesc: "Dados preenchidos no envio",
    detailDescription: "Descrição",
    detailNoDescription: "Sem descrição",
    detailCountries: "Países",
    detailTags: "Tags",
    detailChannel: "Canal",
    detailCopyright: "Direitos autorais",
    detailUploadDate: "Data de envio",
    detailPricingTitle: "Regras de preço",
    detailFullSeries: "Série completa",
    detailPerEpisode: "Por episódio",
    detailAd15s: "Anúncio 15s",
    detailEpisodeProgress: "Progresso dos episódios",
    detailManageEpisodes: "Gerenciar",
    detailUploadedOf: "{done} / {total} enviados",
    detailContinueUpload: "Continuar enviando",
    detailDistribution: "Distribuição",
    detailRevenue: "Receita",
    revenueAccountFull: "Assinatura do perfil (Plataforma 2 : Produtor 8)",
    revenueFullFull: "Assinatura de impulso total (Plataforma 4 : Produtor 6)",
    statUploaded: "Enviado",
    statProcessing: "Processando",
    statFailed: "Falhou",

    episodesTitle: "Gerenciar vídeos dos episódios",
    episodesBreadcrumbCount: "{done} / {total} episódios enviados",
    episodesSearchPlaceholder: "Buscar episódio",
    episodesResultCount: "{n} resultados",
    statPendingSubmit: "A enviar",
    epColUploadDate: "Data de envio",
    epActionReplace: "Substituir",
    epActionRetry: "Tentar novamente",
    epActionUpload: "Enviar",
    epStatusUploaded: "Enviado",
    epStatusProcessing: "Processando",
    epStatusFailed: "Falha no envio",
    epStatusNew: "Novo",
    epUploading: "Enviando…",
    epSubmitN: "Enviar ({n})",
    epSubmitNVideos: "Enviar {n} vídeos",
    epSaved: "Salvo",
    epTotalCount: "Total de {total} episódios",
    videoUploadFailed: "Falha no envio do vídeo, tente novamente",

    loadFailed: "Falha ao carregar, tente novamente",

    countries: { us: "Estados Unidos", ph: "Filipinas", in: "Índia" },
    tags: {
      urban: "Urbano",
      rural: "Rural",
      romance: "Romance no trabalho",
      youth: "Juventude",
      family: "Família",
      mystery: "Mistério",
      comeback: "Superação",
      plot: "Drama",
      wuxia: "Wuxia",
      comedy: "Comédia",
      ancient: "Histórico",
      campus: "Campus",
    },
    channels: { male: "Masculino", female: "Feminino", general: "Geral" },
  },
};
