import type { Locale } from "../../i18n-types";
import { TAG_VALUES, CHANNEL_VALUES } from "../mock/content";

/**
 * 上剧中心文案 —— 由 P2 功能 subagent 拥有并扩充。
 * zh-CN 为权威（取自 figma 15293-178/15294-663/15294-423/15077-20404/15081-20689/
 * 15081-20916/15081-21259/15081-21629/15081-22516/15081-22048/15081-22937/
 * 15081-23236/15081-23665 与原型 ContentPage）；en 同步；zh-TW / pt / es / ar 机翻占位。
 * 6 语言结构完全一致；含 {n} / {m} / {total} / {pct} / {pending} 等占位，由组件 replace。
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
  statTotalDramas: string;
  statOnShelfDramas: string;
  statAuditingDramas: string;
  statOffShelfDramas: string;
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
  /** 版权证明上传（自制/授权均必填） */
  copyrightProofLabel: string;
  copyrightProofPrompt: string;
  copyrightProofFormat: string;
  /** 自制：请上传以下任意一种确权材料（三选一） */
  selfProofPickHint: string;
  /** 作品登记证书 */
  selfProofRegistrationTitle: string;
  selfProofRegistrationDesc: string;
  /** 成片可信时间戳 */
  selfProofTimestampTitle: string;
  selfProofTimestampDesc: string;
  /** AI 工程截图 */
  selfProofAiTitle: string;
  selfProofAiDesc: string;
  /** 模版参考角标 */
  selfProofTemplateBadge: string;
  /** 模板预览底部说明 */
  selfProofTemplateCaption: string;
  /** 自制单文件上传提示 */
  selfProofUploadFile: string;
  /** AI 截图：需上传 4–20 张 */
  selfProofAiNeedCount: string;
  /** AI 截图：添加截图 */
  selfProofAiAdd: string;
  /** AI 截图：点击上传截图 */
  selfProofAiUpload: string;
  /** AI 截图：格式提示 */
  selfProofAiFormat: string;
  /** 自制底部提示 */
  selfProofNote: string;
  /** AI 截图数量不合法 */
  selfProofAiCountError: string;

  // ── 行内操作菜单 ──
  actionViewDetail: string;
  actionEpisodes: string;
  actionTakeOffline: string;
  actionRepublish: string;
  actionPublishNow: string;
  actionReviewLocked: string;
  actionPin: string;
  actionUnpin: string;
  /** 驳回行：修改并重新提交 */
  actionResubmit: string;

  // ── 下架确认弹窗 ──
  offlineConfirmTitle: string;
  offlineConfirmDesc: string;
  offlineConfirmOk: string;

  // ── 上剧流程通用 ──
  uploadTitle: string;
  /** 驳回后进入三步表单的标题 */
  resubmitTitle: string;
  /** 驳回编辑页说明 */
  rejectEditHint: string;
  draftRestored: string;
  /** 草稿恢复后本地 File 已丢失时的补充说明 */
  draftRestoredReselect: string;
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
  /** 封面超过 10MB 限制 */
  coverTooLarge: string;
  nameLabel: string;
  namePlaceholder: string;
  /** 短剧名称旁红字提示：按所选语言填写标题 */
  nameLangHint: string;
  descLabel: string;
  descPlaceholder: string;
  /** 剧情简介旁红字提示：按所选语言填写简介 */
  descLangHint: string;
  episodesLabel: string;
  episodesLockHint: string;
  /** 驳回态可改计划集数 */
  episodesUnlockHint: string;
  /** 缩减计划集数二次确认：{from} {to} {next} */
  episodesReduceConfirm: string;
  episodesReduceConfirmOk: string;
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
  batchUpload: string;
  batchUploadEpisodes: string;
  uploadFolder: string;
  /** 批量选择的视频数量超过计划集数。 */
  batchUploadTooMany: string;
  stopUpload: string;
  uploadStopped: string;
  /** complete 合并阶段文案（Step2 / 剧集管理复用） */
  epMerging: string;

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
  submitResubmit: string;
  submitSuccess: string;
  resubmitSuccess: string;

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
  /** 收费规则为空时的占位。 */
  pricingEmpty: string;
  detailFullSeries: string;
  detailPerEpisode: string;
  detailAd15s: string;
  detailEpisodeProgress: string;
  detailFailedEpisodes: string;
  detailPendingEpisodes: string;
  detailManageEpisodes: string;
  detailUploadedOf: string;
  detailContinueUpload: string;
  detailDistribution: string;
  detailRevenue: string;
  detailHighlightVideo: string;
  detailHighlightMissing: string;
  detailHighlightUploadedAt: string;
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
  /** 转码失败（vodStatus=3，20260707 item 8） */
  epTranscodeFailed: string;
  epStatusNew: string;
  epUploading: string;
  /** "提交上传 ({n})" */
  epSubmitN: string;
  /** "提交 {n} 个视频" */
  epSubmitNVideos: string;
  epSaved: string;
  epTotalCount: string;
  videoUploadFailed: string;
  downloadTemplate: string;
  templateDownloadFailed: string;
  importTemplate: string;
  templateImporting: string;
  templateImportSuccess: string;
  templateImportEmpty: string;
  templateImportFailed: string;
  uploadHighlight: string;
  highlightUploading: string;
  highlightSaved: string;
  highlightUploadFailed: string;
  highlightRequired: string;
  /** 提交时存在未上传视频的剧集（区别于上传过程失败） */
  videoIncomplete: string;

  // ── 加载 / 错误 ──
  loadFailed: string;

  // ── 发行中心对接新增 ──
  /** 列表「上架语言」列（原型曾用国家，现按文档为语言维度） */
  colLanguage: string;
  /** 审核态：草稿 */
  auditDraft: string;
  /** 审核态：已驳回 */
  auditRejected: string;
  /** 详情：剧集语言 */
  detailLanguage: string;
  /** step1：剧集语言字段 */
  langLabel: string;
  langPlaceholder: string;
  /** step1：类别字段 */
  classificationLabel: string;
  classificationSelectLangFirst: string;
  classificationEmpty: string;
  /** 标签需先选语言 */
  tagsSelectLangFirst: string;
  /** 驳回原因标题 */
  rejectReasonTitle: string;
  /** 收费规则：整剧（≤50集） */
  pricingColWholeLe50: string;
  /** 收费规则：整剧（>50集） */
  pricingColWholeGt50: string;
  /** 草稿已清空 */
  draftCleared: string;

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
    statTotalDramas: "总发行剧集",
    statOnShelfDramas: "已上架",
    statAuditingDramas: "审核中",
    statOffShelfDramas: "已下架",
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
    copyrightProofLabel: "版权证明",
    copyrightProofPrompt: "点击或拖拽上传版权证明",
    copyrightProofFormat: "支持 JPG、PNG、HEIC、PDF、DOC、DOCX 格式（≤20MB）",
    selfProofPickHint: "请上传以下任意一种确权材料（三选一）：",
    selfProofRegistrationTitle: "作品登记证书",
    selfProofRegistrationDesc: "完整清晰截图 / PDF（1 份）",
    selfProofTimestampTitle: "成片可信时间戳",
    selfProofTimestampDesc: "官方时间戳证书 PDF 文件（1 份）",
    selfProofAiTitle: "AI 工程截图",
    selfProofAiDesc: "提供 4–20 张截图，包含提示词、操作及生成结果",
    selfProofTemplateBadge: "模版参考",
    selfProofTemplateCaption: "模版仅供参考，请上传你自己的证书文件",
    selfProofUploadFile: "点击上传文件",
    selfProofAiNeedCount: "需上传 4–20 张",
    selfProofAiAdd: "添加截图",
    selfProofAiUpload: "点击上传截图",
    selfProofAiFormat: "4–20 张，仅支持图片格式",
    selfProofNote: "注：仅视频截图不作为有效确权材料；附属 .tsa 源文件无需上传，请自行留存备查。",
    selfProofAiCountError: "AI 工程截图需上传 4–20 张",

    actionViewDetail: "查看详情",
    actionEpisodes: "剧集视频",
    actionTakeOffline: "下架",
    actionRepublish: "重新上架",
    actionPublishNow: "立即上架",
    actionReviewLocked: "审核中，暂不可操作",
    actionPin: "置顶",
    actionUnpin: "取消置顶",
    actionResubmit: "修改并重新提交",

    offlineConfirmTitle: "确认下架此短剧？",
    offlineConfirmDesc: "下架后该剧集将对用户不可见，收益将暂停结算。您可以随时重新上架。",
    offlineConfirmOk: "确认下架",

    uploadTitle: "上传短剧",
    resubmitTitle: "修改并重新提交",
    rejectEditHint: "请在原记录上修改全部发行参数后重新提交，不会创建新短剧。",
    draftRestored: "已恢复上次未完成的草稿内容。",
    draftRestoredReselect: "本地未上传的视频文件不会保留，请重新选择后再上传。",
    draftStartFresh: "清空重填",
    step1: "短剧基本信息",
    step2: "上传剧集",
    step3: "发布配置",
    stepFooter1: "步骤 1 / 3：基本信息",
    stepFooter2: "步骤 2 / 3：上传剧集",
    stepFooter3: "步骤 3 / 3：发布配置",

    coverLabel: "封面",
    coverPrompt: "点击上传封面",
    coverHint: "9:16 · JPG / PNG / HEIC · 300 ~ 500 KB",
    coverRatio: "9:16",
    coverReplace: "点击替换",
    coverUploadFailed: "封面上传失败，请重试",
    coverTooLarge: "封面超过 10MB 限制",
    nameLabel: "短剧名称",
    namePlaceholder: "请输入短剧名称",
    nameLangHint: "输入对应语言短剧标题",
    descLabel: "剧情简介",
    descPlaceholder: "请输入剧情简介，介绍人物背景、核心矛盾与情感主线……",
    descLangHint: "输入对应语言剧情简介",
    episodesLabel: "集数",
    episodesLockHint: "根据实际集数填写，须准确无误，填后不可修改",
    episodesUnlockHint: "驳回后可修改计划集数",
    episodesReduceConfirm:
      "计划集数将从 {from} 集减少为 {to} 集，第 {next} 集及之后已上传的数据会被删除且无法恢复，是否继续？",
    episodesReduceConfirmOk: "确认减少",
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
    batchUpload: "批量上传",
    batchUploadEpisodes: "批量上传集数",
    uploadFolder: "上传文件夹",
    batchUploadTooMany: "最多可上传 {total} 集，当前选择了 {selected} 个视频",
    stopUpload: "停止上传",
    uploadStopped: "已停止上传，未完成的视频仍保留待上传",
    epMerging: "合并中…",

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
    submitResubmit: "重新提交审核",
    submitSuccess: "提交成功，短剧已进入审核",
    resubmitSuccess: "已重新提交，短剧已进入审核",

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
    pricingEmpty: "暂无收费规则",
    detailFullSeries: "整部剧",
    detailPerEpisode: "单集",
    detailAd15s: "15s广告费",
    detailEpisodeProgress: "剧集进度",
    detailFailedEpisodes: "失败 {n} 集",
    detailPendingEpisodes: "待提交 {n} 集",
    detailManageEpisodes: "管理剧集",
    detailUploadedOf: "已上传 {done} / {total} 集",
    detailContinueUpload: "继续上传剧集",
    detailDistribution: "发布配置",
    detailRevenue: "收益方式",
    detailHighlightVideo: "高光视频",
    detailHighlightMissing: "未上传高光视频",
    detailHighlightUploadedAt: "上传于 {time}",
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
    epTranscodeFailed: "转码失败",
    epStatusNew: "待提交",
    epUploading: "上传中…",
    epSubmitN: "提交上传 ({n})",
    epSubmitNVideos: "提交 {n} 个视频",
    epSaved: "已保存",
    epTotalCount: "共 {total} 集",
    videoUploadFailed: "视频上传失败，请重试",
    downloadTemplate: "下载批量录入模版",
    templateDownloadFailed: "模版下载失败，请重试",
    importTemplate: "导入批量模版",
    templateImporting: "导入中",
    templateImportSuccess: "已导入 {n} 集",
    templateImportEmpty: "模版中没有可导入的视频链接",
    templateImportFailed: "模版导入失败，请检查文件内容",
    uploadHighlight: "上传高光视频",
    highlightUploading: "上传中",
    highlightSaved: "高光视频已保存",
    highlightUploadFailed: "高光视频上传失败，请重试",
    highlightRequired: "请先上传高光视频",
    videoIncomplete: "请上传完整剧集视频",

    loadFailed: "加载失败，请重试",

    colLanguage: "上架语言",
    auditDraft: "草稿",
    auditRejected: "已驳回",
    detailLanguage: "剧集语言",
    langLabel: "剧集语言",
    langPlaceholder: "请选择语言",
    classificationLabel: "类别",
    classificationSelectLangFirst: "请先选择语言",
    classificationEmpty: "暂无可选类别",
    tagsSelectLangFirst: "请先选择语言",
    rejectReasonTitle: "驳回原因",
    pricingColWholeLe50: "整剧（≤50集）",
    pricingColWholeGt50: "整剧（>50集）",
    draftCleared: "已清空草稿",

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
    statTotalDramas: "總發行劇集",
    statOnShelfDramas: "已上架",
    statAuditingDramas: "審核中",
    statOffShelfDramas: "已下架",
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
    copyrightProofLabel: "版權證明",
    copyrightProofPrompt: "點擊或拖曳上傳版權證明",
    copyrightProofFormat: "支援 JPG、PNG、HEIC、PDF、DOC、DOCX 格式（≤20MB）",
    selfProofPickHint: "請上傳以下任意一種確權材料（三選一）：",
    selfProofRegistrationTitle: "作品登記證書",
    selfProofRegistrationDesc: "完整清晰截圖 / PDF（1 份）",
    selfProofTimestampTitle: "成片可信時間戳",
    selfProofTimestampDesc: "官方時間戳證書 PDF 文件（1 份）",
    selfProofAiTitle: "AI 工程截圖",
    selfProofAiDesc: "提供 4–20 張截圖，包含提示詞、操作及生成結果",
    selfProofTemplateBadge: "模版參考",
    selfProofTemplateCaption: "模版僅供參考，請上傳你自己的證書文件",
    selfProofUploadFile: "點擊上傳文件",
    selfProofAiNeedCount: "需上傳 4–20 張",
    selfProofAiAdd: "添加截圖",
    selfProofAiUpload: "點擊上傳截圖",
    selfProofAiFormat: "4–20 張，僅支援圖片格式",
    selfProofNote: "註：僅視頻截圖不作為有效確權材料；附屬 .tsa 源文件無需上傳，請自行留存備查。",
    selfProofAiCountError: "AI 工程截圖需上傳 4–20 張",

    actionViewDetail: "查看詳情",
    actionEpisodes: "劇集影片",
    actionTakeOffline: "下架",
    actionRepublish: "重新上架",
    actionPublishNow: "立即上架",
    actionReviewLocked: "審核中，暫不可操作",
    actionPin: "置頂",
    actionUnpin: "取消置頂",
    actionResubmit: "修改並重新提交",

    offlineConfirmTitle: "確認下架此短劇？",
    offlineConfirmDesc: "下架後該劇集將對使用者不可見，收益將暫停結算。您可以隨時重新上架。",
    offlineConfirmOk: "確認下架",

    uploadTitle: "上傳短劇",
    resubmitTitle: "修改並重新提交",
    rejectEditHint: "請在原紀錄上修改全部發行參數後重新提交，不會建立新短劇。",
    draftRestored: "已還原上次未完成的草稿內容。",
    draftRestoredReselect: "本機未上傳的影片檔案不會保留，請重新選擇後再上傳。",
    draftStartFresh: "清空重填",
    step1: "短劇基本資訊",
    step2: "上傳劇集",
    step3: "發佈設定",
    stepFooter1: "步驟 1 / 3：基本資訊",
    stepFooter2: "步驟 2 / 3：上傳劇集",
    stepFooter3: "步驟 3 / 3：發佈設定",

    coverLabel: "封面",
    coverPrompt: "點擊上傳封面",
    coverHint: "9:16 · JPG / PNG / HEIC · 300 ~ 500 KB",
    coverRatio: "9:16",
    coverReplace: "點擊替換",
    coverUploadFailed: "封面上傳失敗，請重試",
    coverTooLarge: "封面超過 10MB 限制",
    nameLabel: "短劇名稱",
    namePlaceholder: "請輸入短劇名稱",
    nameLangHint: "輸入對應語言短劇標題",
    descLabel: "劇情簡介",
    descPlaceholder: "請輸入劇情簡介，介紹人物背景、核心衝突與情感主線……",
    descLangHint: "輸入對應語言劇情簡介",
    episodesLabel: "集數",
    episodesLockHint: "根據實際集數填寫，須準確無誤，填後不可修改",
    episodesUnlockHint: "駁回後可修改計劃集數",
    episodesReduceConfirm:
      "計劃集數將從 {from} 集減少為 {to} 集，第 {next} 集及之後已上傳的資料會被刪除且無法恢復，是否繼續？",
    episodesReduceConfirmOk: "確認減少",
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
    batchUpload: "批量上傳",
    batchUploadEpisodes: "批量上傳集數",
    uploadFolder: "上傳資料夾",
    batchUploadTooMany: "最多可上傳 {total} 集，目前選擇了 {selected} 個影片",
    stopUpload: "停止上傳",
    uploadStopped: "已停止上傳，未完成的影片仍保留待上傳",
    epMerging: "合併中…",

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
    submitResubmit: "重新提交審核",
    submitSuccess: "提交成功，短劇已進入審核",
    resubmitSuccess: "已重新提交，短劇已進入審核",

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
    pricingEmpty: "暫無收費規則",
    detailFullSeries: "整部劇",
    detailPerEpisode: "單集",
    detailAd15s: "15s廣告費",
    detailEpisodeProgress: "劇集進度",
    detailFailedEpisodes: "失敗 {n} 集",
    detailPendingEpisodes: "待提交 {n} 集",
    detailManageEpisodes: "管理劇集",
    detailUploadedOf: "已上傳 {done} / {total} 集",
    detailContinueUpload: "繼續上傳劇集",
    detailDistribution: "發佈設定",
    detailRevenue: "收益方式",
    detailHighlightVideo: "高光影片",
    detailHighlightMissing: "未上傳高光影片",
    detailHighlightUploadedAt: "上傳於 {time}",
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
    epTranscodeFailed: "轉碼失敗",
    epStatusNew: "待提交",
    epUploading: "上傳中…",
    epSubmitN: "提交上傳 ({n})",
    epSubmitNVideos: "提交 {n} 個影片",
    epSaved: "已儲存",
    epTotalCount: "共 {total} 集",
    videoUploadFailed: "影片上傳失敗，請重試",
    downloadTemplate: "下載批量錄入模版",
    templateDownloadFailed: "模版下載失敗，請重試",
    importTemplate: "導入批量模版",
    templateImporting: "導入中",
    templateImportSuccess: "已導入 {n} 集",
    templateImportEmpty: "模版中沒有可導入的影片連結",
    templateImportFailed: "模版導入失敗，請檢查檔案內容",
    uploadHighlight: "上傳高光影片",
    highlightUploading: "上傳中",
    highlightSaved: "高光影片已儲存",
    highlightUploadFailed: "高光影片上傳失敗，請重試",
    highlightRequired: "請先上傳高光影片",
    videoIncomplete: "請上傳完整劇集影片",

    loadFailed: "載入失敗，請重試",

    colLanguage: "上架語言",
    auditDraft: "草稿",
    auditRejected: "已駁回",
    detailLanguage: "劇集語言",
    langLabel: "劇集語言",
    langPlaceholder: "請選擇語言",
    classificationLabel: "類別",
    classificationSelectLangFirst: "請先選擇語言",
    classificationEmpty: "暫無可選類別",
    tagsSelectLangFirst: "請先選擇語言",
    rejectReasonTitle: "駁回原因",
    pricingColWholeLe50: "整劇（≤50集）",
    pricingColWholeGt50: "整劇（>50集）",
    draftCleared: "已清空草稿",

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
    statTotalDramas: "Total Dramas",
    statOnShelfDramas: "On Shelf",
    statAuditingDramas: "Auditing",
    statOffShelfDramas: "Off Shelf",
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
    copyrightProofLabel: "Copyright proof",
    copyrightProofPrompt: "Click or drag to upload copyright proof",
    copyrightProofFormat: "Supports JPG, PNG, HEIC, PDF, DOC, DOCX (≤20MB)",
    selfProofPickHint: "Upload any one of the following proof materials (choose 1 of 3):",
    selfProofRegistrationTitle: "Work registration certificate",
    selfProofRegistrationDesc: "Clear screenshot / PDF (1 file)",
    selfProofTimestampTitle: "Trusted timestamp for final cut",
    selfProofTimestampDesc: "Official timestamp certificate PDF (1 file)",
    selfProofAiTitle: "AI production screenshots",
    selfProofAiDesc: "Provide 4–20 screenshots including prompts, steps, and results",
    selfProofTemplateBadge: "Sample",
    selfProofTemplateCaption: "Sample only — please upload your own certificate",
    selfProofUploadFile: "Click to upload file",
    selfProofAiNeedCount: "Upload 4–20 images",
    selfProofAiAdd: "Add screenshots",
    selfProofAiUpload: "Click to upload screenshots",
    selfProofAiFormat: "4–20 images, image formats only",
    selfProofNote: "Note: video-only screenshots are not valid proof; keep any .tsa source files yourself — no need to upload them.",
    selfProofAiCountError: "AI production screenshots require 4–20 images",

    actionViewDetail: "View Details",
    actionEpisodes: "Episode Videos",
    actionTakeOffline: "Take Offline",
    actionRepublish: "Re-publish",
    actionPublishNow: "Publish Now",
    actionReviewLocked: "Under review, locked",
    actionPin: "Pin to Top",
    actionUnpin: "Unpin",
    actionResubmit: "Edit & Resubmit",

    offlineConfirmTitle: "Take this drama offline?",
    offlineConfirmDesc:
      "The drama will be hidden from users and earnings will pause. You can re-publish anytime.",
    offlineConfirmOk: "Confirm Offline",

    uploadTitle: "Upload Drama",
    resubmitTitle: "Edit & Resubmit",
    rejectEditHint: "Edit all publishing fields on the original title and resubmit. A new title will not be created.",
    draftRestored: "Draft restored from your last session.",
    draftRestoredReselect: "Local video files are not kept after refresh. Please re-select them before uploading.",
    draftStartFresh: "Start fresh",
    step1: "Basic Info",
    step2: "Upload Episodes",
    step3: "Publish Config",
    stepFooter1: "Step 1 / 3: Basic Info",
    stepFooter2: "Step 2 / 3: Upload Episodes",
    stepFooter3: "Step 3 / 3: Publish Config",

    coverLabel: "Cover",
    coverPrompt: "Click to upload",
    coverHint: "9:16 · JPG / PNG / HEIC · 300 ~ 500 KB",
    coverRatio: "9:16",
    coverReplace: "Replace",
    coverUploadFailed: "Cover upload failed, please retry",
    coverTooLarge: "Cover exceeds the 10MB limit",
    nameLabel: "Drama Name",
    namePlaceholder: "Enter drama name",
    nameLangHint: "Enter the title in the selected language",
    descLabel: "Description",
    descPlaceholder: "Introduce characters, conflict, and emotional arc...",
    descLangHint: "Enter the synopsis in the selected language",
    episodesLabel: "Episodes",
    episodesLockHint: "Enter the actual episode count accurately; cannot be changed after filling in",
    episodesUnlockHint: "Planned episode count can be changed after rejection",
    episodesReduceConfirm:
      "Planned episode count will change from {from} to {to}. Episodes {next} and after will be deleted and cannot be recovered. Continue?",
    episodesReduceConfirmOk: "Confirm Reduce",
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
    batchUpload: "Batch Upload",
    batchUploadEpisodes: "Upload Multiple Episodes",
    uploadFolder: "Upload Folder",
    batchUploadTooMany: "You can upload up to {total} episodes; {selected} videos were selected",
    stopUpload: "Stop Upload",
    uploadStopped: "Upload stopped. Unfinished videos remain ready to upload",
    epMerging: "Merging…",

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
    publishLaterOption: "Do Not Publish Now",
    submitPublish: "Submit & Publish",
    submitResubmit: "Resubmit for Review",
    submitSuccess: "Submitted. Your drama is now under review.",
    resubmitSuccess: "Resubmitted. Your drama is now under review.",

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
    pricingEmpty: "No pricing rules yet",
    detailFullSeries: "Full Series",
    detailPerEpisode: "Per Episode",
    detailAd15s: "15s Ad",
    detailEpisodeProgress: "Episode Progress",
    detailFailedEpisodes: "{n} failed",
    detailPendingEpisodes: "{n} pending",
    detailManageEpisodes: "Manage",
    detailUploadedOf: "{done} / {total} uploaded",
    detailContinueUpload: "Continue Uploading",
    detailDistribution: "Distribution",
    detailRevenue: "Revenue",
    detailHighlightVideo: "Highlight Video",
    detailHighlightMissing: "No highlight video uploaded",
    detailHighlightUploadedAt: "Uploaded at {time}",
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
    epTranscodeFailed: "Transcode Failed",
    epStatusNew: "New",
    epUploading: "Uploading…",
    epSubmitN: "Submit ({n})",
    epSubmitNVideos: "Submit {n} videos",
    epSaved: "Saved",
    epTotalCount: "Total {total} episodes",
    videoUploadFailed: "Video upload failed, please retry",
    downloadTemplate: "Download Batch Template",
    templateDownloadFailed: "Template download failed, please retry",
    importTemplate: "Import Batch Template",
    templateImporting: "Importing",
    templateImportSuccess: "Imported {n} episodes",
    templateImportEmpty: "No importable video links in the template",
    templateImportFailed: "Template import failed. Check the file content",
    uploadHighlight: "Upload Highlight Video",
    highlightUploading: "Uploading",
    highlightSaved: "Highlight video saved",
    highlightUploadFailed: "Highlight upload failed, please retry",
    highlightRequired: "Please upload a highlight video first",
    videoIncomplete: "Please upload videos for all episodes",

    loadFailed: "Failed to load, please retry",

    colLanguage: "Language",
    auditDraft: "Draft",
    auditRejected: "Rejected",
    detailLanguage: "Language",
    langLabel: "Language",
    langPlaceholder: "Select language",
    classificationLabel: "Category",
    classificationSelectLangFirst: "Select a language first",
    classificationEmpty: "No categories available",
    tagsSelectLangFirst: "Select a language first",
    rejectReasonTitle: "Rejection Reason",
    pricingColWholeLe50: "Full (≤50 eps)",
    pricingColWholeGt50: "Full (>50 eps)",
    draftCleared: "Draft cleared",

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
    statTotalDramas: "Total de dramas",
    statOnShelfDramas: "Publicados",
    statAuditingDramas: "Em revisão",
    statOffShelfDramas: "Retirados",
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
    copyrightProofLabel: "Comprovante de direitos autorais",
    copyrightProofPrompt: "Clique ou arraste para enviar o comprovante",
    copyrightProofFormat: "Suporta JPG, PNG, HEIC, PDF, DOC, DOCX (≤20MB)",
    selfProofPickHint: "Envie qualquer um dos materiais de prova abaixo (escolha 1 de 3):",
    selfProofRegistrationTitle: "Certificado de registro da obra",
    selfProofRegistrationDesc: "Captura nítida / PDF (1 arquivo)",
    selfProofTimestampTitle: "Carimbo de tempo confiável do filme final",
    selfProofTimestampDesc: "Certificado oficial de carimbo de tempo em PDF (1 arquivo)",
    selfProofAiTitle: "Capturas do processo de IA",
    selfProofAiDesc: "Forneça 4–20 capturas com prompts, etapas e resultados",
    selfProofTemplateBadge: "Modelo",
    selfProofTemplateCaption: "Apenas modelo — envie o seu próprio certificado",
    selfProofUploadFile: "Clique para enviar o arquivo",
    selfProofAiNeedCount: "Envie 4–20 imagens",
    selfProofAiAdd: "Adicionar capturas",
    selfProofAiUpload: "Clique para enviar capturas",
    selfProofAiFormat: "4–20 imagens, apenas formatos de imagem",
    selfProofNote: "Nota: capturas só de vídeo não contam como prova; arquivos .tsa não precisam ser enviados — guarde-os você mesmo.",
    selfProofAiCountError: "As capturas de IA exigem de 4 a 20 imagens",

    actionViewDetail: "Ver detalhes",
    actionEpisodes: "Vídeos dos episódios",
    actionTakeOffline: "Despublicar",
    actionRepublish: "Republicar",
    actionPublishNow: "Publicar agora",
    actionReviewLocked: "Em análise, bloqueado",
    actionPin: "Fixar no topo",
    actionUnpin: "Desafixar",
    actionResubmit: "Editar e reenviar",

    offlineConfirmTitle: "Despublicar este drama?",
    offlineConfirmDesc:
      "O drama ficará oculto para os usuários e a receita será pausada. Você pode republicar a qualquer momento.",
    offlineConfirmOk: "Confirmar",

    uploadTitle: "Enviar drama",
    resubmitTitle: "Editar e reenviar",
    rejectEditHint: "Edite todos os parâmetros na obra original e reenvie. Uma nova obra não será criada.",
    draftRestored: "Rascunho restaurado da sua última sessão.",
    draftRestoredReselect: "Os arquivos de vídeo locais não são mantidos após atualizar. Selecione-os novamente antes de enviar.",
    draftStartFresh: "Começar do zero",
    step1: "Informações básicas",
    step2: "Enviar episódios",
    step3: "Configuração de publicação",
    stepFooter1: "Etapa 1 / 3: Informações básicas",
    stepFooter2: "Etapa 2 / 3: Enviar episódios",
    stepFooter3: "Etapa 3 / 3: Configuração de publicação",

    coverLabel: "Capa",
    coverPrompt: "Clique para enviar",
    coverHint: "9:16 · JPG / PNG / HEIC · 300 ~ 500 KB",
    coverRatio: "9:16",
    coverReplace: "Substituir",
    coverUploadFailed: "Falha no envio da capa, tente novamente",
    coverTooLarge: "A capa excede o limite de 10MB",
    nameLabel: "Nome do drama",
    namePlaceholder: "Digite o nome do drama",
    nameLangHint: "Digite o título no idioma selecionado",
    descLabel: "Descrição",
    descPlaceholder: "Apresente personagens, conflito e arco emocional...",
    descLangHint: "Digite a sinopse no idioma selecionado",
    episodesLabel: "Episódios",
    episodesLockHint: "Preencha com o número real de episódios, com precisão; não pode ser alterado depois",
    episodesUnlockHint: "Após a rejeição, o número planejado de episódios pode ser alterado",
    episodesReduceConfirm:
      "O número planejado mudará de {from} para {to} episódios. Os episódios {next} em diante serão excluídos e não poderão ser recuperados. Continuar?",
    episodesReduceConfirmOk: "Confirmar redução",
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
    batchUpload: "Upload em lote",
    batchUploadEpisodes: "Enviar vários episódios",
    uploadFolder: "Enviar pasta",
    batchUploadTooMany: "Você pode enviar no máximo {total} episódios; {selected} vídeos foram selecionados",
    stopUpload: "Parar envio",
    uploadStopped: "Envio interrompido. Os vídeos não concluídos continuam prontos para envio",
    epMerging: "Mesclando…",

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
    publishLaterOption: "Não publicar agora",
    submitPublish: "Enviar e publicar",
    submitResubmit: "Reenviar para análise",
    submitSuccess: "Enviado. Seu drama está em análise.",
    resubmitSuccess: "Reenviado. Seu drama está em análise.",

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
    pricingEmpty: "Sem regras de preço",
    detailFullSeries: "Série completa",
    detailPerEpisode: "Por episódio",
    detailAd15s: "Anúncio 15s",
    detailEpisodeProgress: "Progresso dos episódios",
    detailFailedEpisodes: "{n} com falha",
    detailPendingEpisodes: "{n} pendentes",
    detailManageEpisodes: "Gerenciar",
    detailUploadedOf: "{done} / {total} enviados",
    detailContinueUpload: "Continuar enviando",
    detailDistribution: "Distribuição",
    detailRevenue: "Receita",
    detailHighlightVideo: "Vídeo destaque",
    detailHighlightMissing: "Nenhum vídeo destaque enviado",
    detailHighlightUploadedAt: "Enviado em {time}",
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
    epTranscodeFailed: "Falha na transcodificação",
    epStatusNew: "Novo",
    epUploading: "Enviando…",
    epSubmitN: "Enviar ({n})",
    epSubmitNVideos: "Enviar {n} vídeos",
    epSaved: "Salvo",
    epTotalCount: "Total de {total} episódios",
    videoUploadFailed: "Falha no envio do vídeo, tente novamente",
    downloadTemplate: "Baixar Modelo em Lote",
    templateDownloadFailed: "Falha ao baixar modelo, tente novamente",
    importTemplate: "Importar Modelo em Lote",
    templateImporting: "Importando",
    templateImportSuccess: "{n} episódios importados",
    templateImportEmpty: "Nenhum link de vídeo importável no modelo",
    templateImportFailed: "Falha ao importar modelo. Verifique o conteúdo do arquivo",
    uploadHighlight: "Enviar Vídeo Destaque",
    highlightUploading: "Enviando",
    highlightSaved: "Vídeo destaque salvo",
    highlightUploadFailed: "Falha no envio do destaque, tente novamente",
    highlightRequired: "Envie um vídeo destaque primeiro",
    videoIncomplete: "Envie os vídeos de todos os episódios",

    loadFailed: "Falha ao carregar, tente novamente",

    colLanguage: "Idioma",
    auditDraft: "Rascunho",
    auditRejected: "Rejeitado",
    detailLanguage: "Idioma",
    langLabel: "Idioma",
    langPlaceholder: "Selecione o idioma",
    classificationLabel: "Categoria",
    classificationSelectLangFirst: "Selecione um idioma primeiro",
    classificationEmpty: "Nenhuma categoria disponível",
    tagsSelectLangFirst: "Selecione um idioma primeiro",
    rejectReasonTitle: "Motivo da rejeição",
    pricingColWholeLe50: "Série (≤50 eps)",
    pricingColWholeGt50: "Série (>50 eps)",
    draftCleared: "Rascunho limpo",

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

  es: {
    title: "Publicar drama",
    subtitle: "Suba y gestione sus dramas",

    next: "Siguiente",
    prev: "Atrás",
    cancel: "Cancelar",
    back: "Volver",

    searchPlaceholder: "Buscar nombre del drama / ID",
    uploadDrama: "Subir drama",
    statTotalDramas: "Total de dramas",
    statOnShelfDramas: "Publicados",
    statAuditingDramas: "En revisión",
    statOffShelfDramas: "Retirados",
    emptyTitle: "Aún no hay dramas",
    uploadNow: "Subir ahora",
    colDramaInfo: "Información del drama",
    colCountries: "Países",
    colDistribution: "Distribución",
    colReview: "Revisión",
    colPublishStatus: "Estado de publicación",
    colCopyright: "Derechos de autor",
    colRevenue: "Ingresos",
    colActions: "Acciones",
    episodesUploaded: "{done}/{total} eps subidos",

    statusOnline: "En línea",
    statusOffline: "Fuera de línea",
    statusReviewing: "En revisión",
    statusNotPublished: "No publicado",
    reviewApproved: "Aprobado",
    reviewReviewing: "En revisión",
    distAccount: "Solo cuenta",
    distFull: "Impulso total",
    revenueAccountShort: "Suscripción cuenta 2:8",
    revenueFullShort: "Impulso total 4:6",
    copyrightSelf: "Original",
    copyrightLicensed: "Licenciado",
    copyrightProofLabel: "Comprobante de derechos de autor",
    copyrightProofPrompt: "Haga clic o arrastre para subir el comprobante de derechos de autor",
    copyrightProofFormat: "Admite JPG, PNG, HEIC, PDF, DOC, DOCX (≤20MB)",
    selfProofPickHint: "Suba cualquiera de los siguientes materiales de prueba (elija 1 de 3):",
    selfProofRegistrationTitle: "Certificado de registro de la obra",
    selfProofRegistrationDesc: "Captura nítida / PDF (1 archivo)",
    selfProofTimestampTitle: "Sello de tiempo confiable del corte final",
    selfProofTimestampDesc: "Certificado oficial de sello de tiempo en PDF (1 archivo)",
    selfProofAiTitle: "Capturas del proceso de IA",
    selfProofAiDesc: "Proporcione 4–20 capturas que incluyan prompts, pasos y resultados",
    selfProofTemplateBadge: "Muestra",
    selfProofTemplateCaption: "Solo muestra: suba su propio certificado",
    selfProofUploadFile: "Haga clic para subir el archivo",
    selfProofAiNeedCount: "Suba 4–20 imágenes",
    selfProofAiAdd: "Añadir capturas",
    selfProofAiUpload: "Haga clic para subir capturas",
    selfProofAiFormat: "4–20 imágenes, solo formatos de imagen",
    selfProofNote: "Nota: las capturas solo de video no son prueba válida; conserve los archivos fuente .tsa usted mismo; no es necesario subirlos.",
    selfProofAiCountError: "Las capturas de producción con IA requieren 4–20 imágenes",

    actionViewDetail: "Ver detalles",
    actionEpisodes: "Videos de episodios",
    actionTakeOffline: "Retirar",
    actionRepublish: "Republicar",
    actionPublishNow: "Publicar ahora",
    actionReviewLocked: "En revisión, bloqueado",
    actionPin: "Fijar arriba",
    actionUnpin: "Desfijar",
    actionResubmit: "Editar y reenviar",

    offlineConfirmTitle: "¿Retirar este drama?",
    offlineConfirmDesc:
      "El drama se ocultará a los usuarios y los ingresos se pausarán. Puede republicarlo en cualquier momento.",
    offlineConfirmOk: "Confirmar retiro",

    uploadTitle: "Subir drama",
    resubmitTitle: "Editar y reenviar",
    rejectEditHint: "Edite todos los campos de publicación en el título original y reenvíe. No se creará un título nuevo.",
    draftRestored: "Borrador restaurado de su última sesión.",
    draftRestoredReselect: "Los archivos de video locales no se conservan tras actualizar. Vuelva a seleccionarlos antes de subir.",
    draftStartFresh: "Empezar de cero",
    step1: "Información básica",
    step2: "Subir episodios",
    step3: "Configuración de publicación",
    stepFooter1: "Paso 1 / 3: Información básica",
    stepFooter2: "Paso 2 / 3: Subir episodios",
    stepFooter3: "Paso 3 / 3: Configuración de publicación",

    coverLabel: "Portada",
    coverPrompt: "Haga clic para subir",
    coverHint: "9:16 · JPG / PNG / HEIC · 300 ~ 500 KB",
    coverRatio: "9:16",
    coverReplace: "Reemplazar",
    coverUploadFailed: "Error al subir la portada, inténtelo de nuevo",
    coverTooLarge: "La portada supera el límite de 10MB",
    nameLabel: "Nombre del drama",
    namePlaceholder: "Introduzca el nombre del drama",
    nameLangHint: "Introduzca el título en el idioma seleccionado",
    descLabel: "Descripción",
    descPlaceholder: "Presente personajes, conflicto y arco emocional...",
    descLangHint: "Introduzca la sinopsis en el idioma seleccionado",
    episodesLabel: "Episodios",
    episodesLockHint: "Introduzca con precisión el número real de episodios; no se puede cambiar después",
    episodesUnlockHint: "Tras el rechazo, se puede cambiar el número previsto de episodios",
    episodesReduceConfirm:
      "El número previsto de episodios cambiará de {from} a {to}. Los episodios {next} en adelante se eliminarán y no se podrán recuperar. ¿Continuar?",
    episodesReduceConfirmOk: "Confirmar reducción",
    episodesPlaceholder: "p. ej. 30",
    channelLabel: "Canal",
    tagsLabel: "Etiquetas",
    copyrightLabel: "Tipo de derechos de autor",

    colEp: "Ep.",
    colEpTitle: "Título",
    colVideoFile: "Archivo de video (máx. 500MB)",
    colSize: "Tamaño",
    colDuration: "Duración",
    colStatus: "Estado",
    epTitlePlaceholder: "Título del episodio {ep} (opcional)",
    chooseFile: "Elegir archivo",
    epStatusPending: "Pendiente",
    epStatusReady: "Listo",
    epStatusError: "Error",
    fileTooLarge: "El archivo supera el límite de 500MB",
    readingDuration: "Leyendo…",
    uploadSummary: "{selected} / {total} seleccionados",
    batchUpload: "Subida por lote",
    batchUploadEpisodes: "Subir varios episodios",
    uploadFolder: "Subir carpeta",
    batchUploadTooMany: "Puede subir hasta {total} episodios; se seleccionaron {selected} videos",
    stopUpload: "Detener subida",
    uploadStopped: "Subida detenida. Los videos no terminados siguen listos para subir",
    epMerging: "Combinando…",

    distSectionTitle: "Distribución",
    distSectionDesc: "Elija dónde aparece su drama: afecta la exposición y el método de ingresos",
    optAccountTitle: "Página de la cuenta",
    optAccountDesc: "El drama aparece solo en la página de su cuenta.",
    optAccountBadge: "Alcance básico",
    optFullTitle: "Cuenta + Inicio + For You",
    optFullDesc: "Se impulsa al inicio y al feed For You para máxima exposición.",
    optFullBadge: "Impulso total",
    revenueAccountTitle: "Ingresos: suscripción de cuenta",
    revenueFullTitle: "Ingresos: suscripción de impulso total",
    platform: "Plataforma",
    producer: "Productor",
    countriesSectionTitle: "Países de destino",
    countriesSectionDesc: "Seleccione los países donde estará disponible este drama",
    viewPricingRules: "Ver reglas de precio por país",
    publishSettingsTitle: "Ajustes de publicación",
    publishNowOption: "Publicar ahora",
    publishLaterOption: "No publicar ahora",
    submitPublish: "Enviar y publicar",
    submitResubmit: "Reenviar a revisión",
    submitSuccess: "Enviado. Su drama está en revisión.",
    resubmitSuccess: "Reenviado. Su drama está en revisión.",

    phoneHome: "Inicio",
    phoneForYou: "For You",
    phoneMe: "Yo",
    tagAccount: "Cuenta",
    tagHomepage: "Inicio",
    tagForYou: "For You",

    pricingTitle: "Reglas de precio por país",
    pricingDesc: "Precios definidos por la plataforma, solo lectura.",
    pricingColCountry: "País",
    pricingColFull: "Serie completa",
    pricingColSingle: "Por episodio",
    pricingColAd: "Anuncio 15s",
    pricingReadonly: "Precio de la plataforma, solo lectura",
    adNone: "—",
    adHas: "Sí",
    epLabelN: "Episodio {ep}",

    detailEpisodeVideos: "Videos de episodios",
    detailBasicInfo: "Información básica",
    detailBasicInfoDesc: "Datos completados al subir",
    detailDescription: "Descripción",
    detailNoDescription: "Sin descripción",
    detailCountries: "Países",
    detailTags: "Etiquetas",
    detailChannel: "Canal",
    detailCopyright: "Derechos de autor",
    detailUploadDate: "Fecha de subida",
    detailPricingTitle: "Reglas de precio",
    pricingEmpty: "Aún no hay reglas de precio",
    detailFullSeries: "Serie completa",
    detailPerEpisode: "Por episodio",
    detailAd15s: "Anuncio 15s",
    detailEpisodeProgress: "Progreso de episodios",
    detailFailedEpisodes: "{n} fallidos",
    detailPendingEpisodes: "{n} pendientes",
    detailManageEpisodes: "Gestionar",
    detailUploadedOf: "{done} / {total} subidos",
    detailContinueUpload: "Continuar subiendo",
    detailDistribution: "Distribución",
    detailRevenue: "Ingresos",
    detailHighlightVideo: "Video destacado",
    detailHighlightMissing: "No se ha subido un video destacado",
    detailHighlightUploadedAt: "Subido el {time}",
    revenueAccountFull: "Suscripción de cuenta (Plataforma 2 : Productor 8)",
    revenueFullFull: "Suscripción de impulso total (Plataforma 4 : Productor 6)",
    statUploaded: "Subido",
    statProcessing: "Procesando",
    statFailed: "Fallido",

    episodesTitle: "Videos de episodios",
    episodesBreadcrumbCount: "{done} / {total} episodios subidos",
    episodesSearchPlaceholder: "Buscar episodio",
    episodesResultCount: "{n} resultados",
    statPendingSubmit: "Pendiente de envío",
    epColUploadDate: "Fecha de subida",
    epActionReplace: "Reemplazar",
    epActionRetry: "Reintentar",
    epActionUpload: "Subir",
    epStatusUploaded: "Subido",
    epStatusProcessing: "Procesando",
    epStatusFailed: "Fallido",
    epTranscodeFailed: "Fallo de transcodificación",
    epStatusNew: "Nuevo",
    epUploading: "Subiendo…",
    epSubmitN: "Enviar ({n})",
    epSubmitNVideos: "Enviar {n} videos",
    epSaved: "Guardado",
    epTotalCount: "Total {total} episodios",
    videoUploadFailed: "Error al subir el video, inténtelo de nuevo",
    downloadTemplate: "Descargar plantilla por lote",
    templateDownloadFailed: "Error al descargar la plantilla, inténtelo de nuevo",
    importTemplate: "Importar plantilla por lote",
    templateImporting: "Importando",
    templateImportSuccess: "Se importaron {n} episodios",
    templateImportEmpty: "No hay enlaces de video importables en la plantilla",
    templateImportFailed: "Error al importar la plantilla. Revise el contenido del archivo",
    uploadHighlight: "Subir video destacado",
    highlightUploading: "Subiendo",
    highlightSaved: "Video destacado guardado",
    highlightUploadFailed: "Error al subir el destacado, inténtelo de nuevo",
    highlightRequired: "Suba primero un video destacado",
    videoIncomplete: "Suba videos para todos los episodios",

    loadFailed: "Error al cargar, inténtelo de nuevo",

    colLanguage: "Idioma",
    auditDraft: "Borrador",
    auditRejected: "Rechazado",
    detailLanguage: "Idioma",
    langLabel: "Idioma",
    langPlaceholder: "Seleccione el idioma",
    classificationLabel: "Categoría",
    classificationSelectLangFirst: "Seleccione un idioma primero",
    classificationEmpty: "No hay categorías disponibles",
    tagsSelectLangFirst: "Seleccione un idioma primero",
    rejectReasonTitle: "Motivo del rechazo",
    pricingColWholeLe50: "Completa (≤50 eps)",
    pricingColWholeGt50: "Completa (>50 eps)",
    draftCleared: "Borrador borrado",

    countries: { us: "Estados Unidos", ph: "Filipinas", in: "India" },
    tags: {
      urban: "Urbano",
      rural: "Rural",
      romance: "Romance laboral",
      youth: "Juventud",
      family: "Familia",
      mystery: "Misterio",
      comeback: "Resurgimiento",
      plot: "Drama",
      wuxia: "Wuxia",
      comedy: "Comedia",
      ancient: "Histórico",
      campus: "Campus",
    },
    channels: { male: "Masculino", female: "Femenino", general: "General" },
  },

  ar: {
    title: "رفع دراما",
    subtitle: "ارفع أدوارك الدرامية وأدرها",

    next: "التالي",
    prev: "رجوع",
    cancel: "إلغاء",
    back: "رجوع",

    searchPlaceholder: "ابحث باسم الدراما / المعرّف",
    uploadDrama: "رفع دراما",
    statTotalDramas: "إجمالي الدراما",
    statOnShelfDramas: "منشورة",
    statAuditingDramas: "قيد المراجعة",
    statOffShelfDramas: "مسحوبة",
    emptyTitle: "لا توجد دراما بعد",
    uploadNow: "رفع الآن",
    colDramaInfo: "معلومات الدراما",
    colCountries: "الدول",
    colDistribution: "التوزيع",
    colReview: "المراجعة",
    colPublishStatus: "حالة النشر",
    colCopyright: "حقوق النشر",
    colRevenue: "الإيرادات",
    colActions: "الإجراءات",
    episodesUploaded: "{done}/{total} حلقات مرفوعة",

    statusOnline: "منشور",
    statusOffline: "غير منشور",
    statusReviewing: "قيد المراجعة",
    statusNotPublished: "غير منشور",
    reviewApproved: "موافق عليه",
    reviewReviewing: "قيد المراجعة",
    distAccount: "الحساب فقط",
    distFull: "تعزيز كامل",
    revenueAccountShort: "اشتراك الحساب 2:8",
    revenueFullShort: "تعزيز كامل 4:6",
    copyrightSelf: "أصلي",
    copyrightLicensed: "مرخّص",
    copyrightProofLabel: "إثبات حقوق النشر",
    copyrightProofPrompt: "انقر أو اسحب لرفع إثبات حقوق النشر",
    copyrightProofFormat: "يدعم JPG و PNG و HEIC و PDF و DOC و DOCX (≤20MB)",
    selfProofPickHint: "ارفع أيًا من مواد الإثبات التالية (اختر 1 من 3):",
    selfProofRegistrationTitle: "شهادة تسجيل العمل",
    selfProofRegistrationDesc: "لقطة واضحة / PDF (ملف واحد)",
    selfProofTimestampTitle: "طابع زمني موثوق للنسخة النهائية",
    selfProofTimestampDesc: "شهادة الطابع الزمني الرسمية PDF (ملف واحد)",
    selfProofAiTitle: "لقطات إنتاج الذكاء الاصطناعي",
    selfProofAiDesc: "قدّم 4–20 لقطة تشمل الأوامر والخطوات والنتائج",
    selfProofTemplateBadge: "نموذج",
    selfProofTemplateCaption: "نموذج فقط — يرجى رفع شهادتك الخاصة",
    selfProofUploadFile: "انقر لرفع الملف",
    selfProofAiNeedCount: "ارفع 4–20 صورة",
    selfProofAiAdd: "إضافة لقطات",
    selfProofAiUpload: "انقر لرفع اللقطات",
    selfProofAiFormat: "4–20 صورة، صيغ الصور فقط",
    selfProofNote: "ملاحظة: لقطات الفيديو وحدها ليست إثباتًا صالحًا؛ احتفظ بملفات المصدر ‎.tsa بنفسك — لا حاجة لرفعها.",
    selfProofAiCountError: "تتطلب لقطات إنتاج الذكاء الاصطناعي 4–20 صورة",

    actionViewDetail: "عرض التفاصيل",
    actionEpisodes: "فيديوهات الحلقات",
    actionTakeOffline: "إلغاء النشر",
    actionRepublish: "إعادة النشر",
    actionPublishNow: "نشر الآن",
    actionReviewLocked: "قيد المراجعة، مقفل",
    actionPin: "تثبيت في الأعلى",
    actionUnpin: "إلغاء التثبيت",
    actionResubmit: "تعديل وإعادة التقديم",

    offlineConfirmTitle: "إلغاء نشر هذا العمل؟",
    offlineConfirmDesc:
      "سيُخفى العمل عن المستخدمين وتتوقف الأرباح. يمكنك إعادة النشر في أي وقت.",
    offlineConfirmOk: "تأكيد إلغاء النشر",

    uploadTitle: "رفع دراما",
    resubmitTitle: "تعديل وإعادة التقديم",
    rejectEditHint: "عدّل جميع حقول النشر على العنوان الأصلي وأعد التقديم. لن يُنشأ عنوان جديد.",
    draftRestored: "تم استعادة المسودة من جلستك الأخيرة.",
    draftRestoredReselect: "لا تُحفظ ملفات الفيديو المحلية بعد التحديث. يرجى إعادة اختيارها قبل الرفع.",
    draftStartFresh: "البدء من جديد",
    step1: "المعلومات الأساسية",
    step2: "رفع الحلقات",
    step3: "إعدادات النشر",
    stepFooter1: "الخطوة 1 / 3: المعلومات الأساسية",
    stepFooter2: "الخطوة 2 / 3: رفع الحلقات",
    stepFooter3: "الخطوة 3 / 3: إعدادات النشر",

    coverLabel: "الغلاف",
    coverPrompt: "انقر للرفع",
    coverHint: "9:16 · JPG / PNG / HEIC · 300 ~ 500 KB",
    coverRatio: "9:16",
    coverReplace: "استبدال",
    coverUploadFailed: "فشل رفع الغلاف، يرجى المحاولة مرة أخرى",
    coverTooLarge: "يتجاوز الغلاف حد 10MB",
    nameLabel: "اسم الدراما",
    namePlaceholder: "أدخل اسم الدراما",
    nameLangHint: "أدخل العنوان باللغة المحددة",
    descLabel: "الوصف",
    descPlaceholder: "قدّم الشخصيات والصراع والقوس العاطفي...",
    descLangHint: "أدخل الملخص باللغة المحددة",
    episodesLabel: "الحلقات",
    episodesLockHint: "أدخل عدد الحلقات الفعلي بدقة؛ لا يمكن تغييره بعد التعبئة",
    episodesUnlockHint: "يمكن تغيير عدد الحلقات المخطط بعد الرفض",
    episodesReduceConfirm:
      "سيتغير عدد الحلقات المخطط من {from} إلى {to}. ستُحذف الحلقات {next} وما بعدها ولا يمكن استعادتها. هل تريد المتابعة؟",
    episodesReduceConfirmOk: "تأكيد التخفيض",
    episodesPlaceholder: "مثال: 30",
    channelLabel: "القناة",
    tagsLabel: "الوسوم",
    copyrightLabel: "نوع حقوق النشر",

    colEp: "حلقة",
    colEpTitle: "العنوان",
    colVideoFile: "ملف الفيديو (حد أقصى 500MB)",
    colSize: "الحجم",
    colDuration: "المدة",
    colStatus: "الحالة",
    epTitlePlaceholder: "عنوان الحلقة {ep} (اختياري)",
    chooseFile: "اختيار ملف",
    epStatusPending: "قيد الانتظار",
    epStatusReady: "جاهز",
    epStatusError: "خطأ",
    fileTooLarge: "يتجاوز الملف حد 500MB",
    readingDuration: "جارٍ القراءة…",
    uploadSummary: "{selected} / {total} محددة",
    batchUpload: "رفع دفعي",
    batchUploadEpisodes: "رفع حلقات متعددة",
    uploadFolder: "رفع مجلد",
    batchUploadTooMany: "يمكنك رفع حتى {total} حلقات؛ تم اختيار {selected} فيديوهات",
    stopUpload: "إيقاف الرفع",
    uploadStopped: "تم إيقاف الرفع. تبقى الفيديوهات غير المكتملة جاهزة للرفع",
    epMerging: "جارٍ الدمج…",

    distSectionTitle: "التوزيع",
    distSectionDesc: "اختر أين يظهر عملك — يؤثر على الانتشار وطريقة الإيرادات",
    optAccountTitle: "صفحة الحساب",
    optAccountDesc: "يظهر العمل فقط في صفحة حسابك.",
    optAccountBadge: "وصول أساسي",
    optFullTitle: "الحساب + الصفحة الرئيسية + For You",
    optFullDesc: "يُدفع إلى الصفحة الرئيسية وتغذية For You لأقصى انتشار.",
    optFullBadge: "تعزيز كامل",
    revenueAccountTitle: "الإيرادات: اشتراك الحساب",
    revenueFullTitle: "الإيرادات: اشتراك التعزيز الكامل",
    platform: "المنصة",
    producer: "المنتج",
    countriesSectionTitle: "الدول المستهدفة",
    countriesSectionDesc: "حدد الدول التي سيتوفر فيها هذا العمل",
    viewPricingRules: "عرض قواعد التسعير حسب الدولة",
    publishSettingsTitle: "إعدادات النشر",
    publishNowOption: "نشر الآن",
    publishLaterOption: "عدم النشر الآن",
    submitPublish: "إرسال ونشر",
    submitResubmit: "إعادة التقديم للمراجعة",
    submitSuccess: "تم الإرسال. عملك قيد المراجعة الآن.",
    resubmitSuccess: "أُعيد التقديم. عملك قيد المراجعة الآن.",

    phoneHome: "الرئيسية",
    phoneForYou: "For You",
    phoneMe: "أنا",
    tagAccount: "الحساب",
    tagHomepage: "الصفحة الرئيسية",
    tagForYou: "For You",

    pricingTitle: "قواعد التسعير حسب الدولة",
    pricingDesc: "أسعار تحددها المنصة، للقراءة فقط.",
    pricingColCountry: "الدولة",
    pricingColFull: "المسلسل كاملًا",
    pricingColSingle: "لكل حلقة",
    pricingColAd: "إعلان 15 ث",
    pricingReadonly: "تسعير المنصة، للقراءة فقط",
    adNone: "—",
    adHas: "نعم",
    epLabelN: "الحلقة {ep}",

    detailEpisodeVideos: "فيديوهات الحلقات",
    detailBasicInfo: "المعلومات الأساسية",
    detailBasicInfoDesc: "البيانات المعبأة أثناء الرفع",
    detailDescription: "الوصف",
    detailNoDescription: "لا يوجد وصف",
    detailCountries: "الدول",
    detailTags: "الوسوم",
    detailChannel: "القناة",
    detailCopyright: "حقوق النشر",
    detailUploadDate: "تاريخ الرفع",
    detailPricingTitle: "قواعد التسعير",
    pricingEmpty: "لا توجد قواعد تسعير بعد",
    detailFullSeries: "المسلسل كاملًا",
    detailPerEpisode: "لكل حلقة",
    detailAd15s: "إعلان 15 ث",
    detailEpisodeProgress: "تقدم الحلقات",
    detailFailedEpisodes: "{n} فاشلة",
    detailPendingEpisodes: "{n} قيد الانتظار",
    detailManageEpisodes: "إدارة",
    detailUploadedOf: "{done} / {total} مرفوعة",
    detailContinueUpload: "متابعة الرفع",
    detailDistribution: "التوزيع",
    detailRevenue: "الإيرادات",
    detailHighlightVideo: "فيديو التمييز",
    detailHighlightMissing: "لم يُرفع فيديو تمييز",
    detailHighlightUploadedAt: "رُفع في {time}",
    revenueAccountFull: "اشتراك الحساب (المنصة 2 : المنتج 8)",
    revenueFullFull: "اشتراك التعزيز الكامل (المنصة 4 : المنتج 6)",
    statUploaded: "مرفوع",
    statProcessing: "قيد المعالجة",
    statFailed: "فشل",

    episodesTitle: "فيديوهات الحلقات",
    episodesBreadcrumbCount: "{done} / {total} حلقات مرفوعة",
    episodesSearchPlaceholder: "ابحث عن حلقة",
    episodesResultCount: "{n} نتائج",
    statPendingSubmit: "بانتظار الإرسال",
    epColUploadDate: "تاريخ الرفع",
    epActionReplace: "استبدال",
    epActionRetry: "إعادة المحاولة",
    epActionUpload: "رفع",
    epStatusUploaded: "مرفوع",
    epStatusProcessing: "قيد المعالجة",
    epStatusFailed: "فشل",
    epTranscodeFailed: "فشل التحويل",
    epStatusNew: "جديد",
    epUploading: "جارٍ الرفع…",
    epSubmitN: "إرسال ({n})",
    epSubmitNVideos: "إرسال {n} فيديوهات",
    epSaved: "تم الحفظ",
    epTotalCount: "إجمالي {total} حلقات",
    videoUploadFailed: "فشل رفع الفيديو، يرجى المحاولة مرة أخرى",
    downloadTemplate: "تنزيل قالب الدفعة",
    templateDownloadFailed: "فشل تنزيل القالب، يرجى المحاولة مرة أخرى",
    importTemplate: "استيراد قالب الدفعة",
    templateImporting: "جارٍ الاستيراد",
    templateImportSuccess: "تم استيراد {n} حلقات",
    templateImportEmpty: "لا توجد روابط فيديو قابلة للاستيراد في القالب",
    templateImportFailed: "فشل استيراد القالب. تحقق من محتوى الملف",
    uploadHighlight: "رفع فيديو التمييز",
    highlightUploading: "جارٍ الرفع",
    highlightSaved: "تم حفظ فيديو التمييز",
    highlightUploadFailed: "فشل رفع فيديو التمييز، يرجى المحاولة مرة أخرى",
    highlightRequired: "يرجى رفع فيديو تمييز أولًا",
    videoIncomplete: "يرجى رفع فيديوهات لجميع الحلقات",

    loadFailed: "فشل التحميل، يرجى المحاولة مرة أخرى",

    colLanguage: "اللغة",
    auditDraft: "مسودة",
    auditRejected: "مرفوض",
    detailLanguage: "اللغة",
    langLabel: "اللغة",
    langPlaceholder: "اختر اللغة",
    classificationLabel: "التصنيف",
    classificationSelectLangFirst: "اختر لغة أولًا",
    classificationEmpty: "لا توجد تصنيفات متاحة",
    tagsSelectLangFirst: "اختر لغة أولًا",
    rejectReasonTitle: "سبب الرفض",
    pricingColWholeLe50: "كامل (≤50 حلقة)",
    pricingColWholeGt50: "كامل (>50 حلقة)",
    draftCleared: "تم مسح المسودة",

    countries: { us: "الولايات المتحدة", ph: "الفلبين", in: "الهند" },
    tags: {
      urban: "حضري",
      rural: "ريفي",
      romance: "رومانسية العمل",
      youth: "شباب",
      family: "عائلي",
      mystery: "غموض",
      comeback: "عودة",
      plot: "دراما",
      wuxia: "ووشيا",
      comedy: "كوميديا",
      ancient: "تاريخي",
      campus: "حرم جامعي",
    },
    channels: { male: "ذكور", female: "إناث", general: "عام" },
  },
};
