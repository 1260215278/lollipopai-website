/**
 * 上剧中心服务（发行方端，真实接口）
 * ------------------------------------------------------------------
 * 严格对接《20260622-发行中心-上剧-接口文档》：所有端点前缀 `/publisher/**`，
 * 走独立 publisher token（由 http.ts 按路径自动注入）。统一响应 {code,msg,data}，
 * 列表载荷在顶层 `page`（用 pick:"page" 取）。
 *
 * 数据契约硬约束：字段一律来自接口文档，不臆造、不写撒网式兜底；枚举用后端数值。
 * 上传走「前端直传 OSS（services/upload.ts）→ 拿 URL → saveEpisode」，后端 ffprobe
 * 回写大小/时长，不在前端伪造。
 */
import { getPublisherToken } from "./auth";
import { BASE_URL, ApiError, http, type ApiResponse } from "./http";
import { getAcceptLanguage } from "../i18n";

/* ─── 枚举（与接口文档 §0.1 对应） ─────────────────────────────── */

/** 审核状态：0 草稿 / 1 审核中 / 2 已通过 / 3 已驳回 */
export const AuditStatus = { DRAFT: 0, REVIEWING: 1, APPROVED: 2, REJECTED: 3 } as const;
/** 上架状态：0 未上架 / 1 已上架 / 2 已下架（仅 auditStatus=2 有意义） */
export const ShelfStatus = { NOT_PUBLISHED: 0, ON_SHELF: 1, OFF_SHELF: 2 } as const;
/** 发布范围：1 账号主页 / 2 全量推荐 */
export const PublishScope = { ACCOUNT: 1, FULL: 2 } as const;
/** 版权类型：1 自制 / 2 授权 */
export const CopyrightType = { ORIGINAL: 1, LICENSED: 2 } as const;
/** 频道：1 男频 / 2 女频 / 3 通用 */
export const GenderType = { MALE: 1, FEMALE: 2, GENERAL: 3 } as const;
/** 剧集上传态（持久值）：1 已上传 / 2 上传失败；0 待提交为虚拟态（无 course_details 行） */
export const UploadStatus = { PENDING: 0, UPLOADED: 1, FAILED: 2 } as const;

/* ─── 通用结构 ─────────────────────────────────────────────────── */

/** 后端分页结构（renren-fast PageUtils） */
export interface PageResult<T> {
  totalCount: number;
  pageSize: number;
  totalPage: number;
  currPage: number;
  list: T[];
}

/* ─── 列表（§2） ───────────────────────────────────────────────── */

/** 短剧列表项（逐字段对应列表列） */
export interface PublisherCourseRow {
  courseId: number;
  /** 展示编号 `D` + courseId */
  dramaNo: string;
  title: string;
  titleImg: string;
  /** 已上传集数 */
  uploadedEpisodes: number;
  /** 计划集数 */
  plannedEpisodes: number;
  /** 频道 1男/2女/3通用 */
  genderType: number;
  /** 内容语言 code（如 en） */
  languageType: string;
  /** 发布范围 1账号主页/2全量推荐 */
  publishScope: number;
  /** 审核状态 0草稿/1审核中/2通过/3驳回 */
  auditStatus: number;
  /** 审核驳回原因：仅 auditStatus=3 有值，其余为 null */
  auditRemark: string | null;
  /** 上架状态 0未上架/1已上架/2已下架；未过审为 null */
  shelfStatus: number | null;
  /** 版权类型 1自制/2授权 */
  copyrightType: number;
  /** 收益方式（20260703 汇总版改为嵌套对象） */
  revenue: CourseRevenue;
  createTime: string;
}

export interface CourseRevenue {
  publishScope: number;
  platformRatio: number;
  creatorRatio: number;
  revenueText: string;
}

/** 列表查询参数 */
export interface CourseListQuery {
  /** 名称 / dramaNo 关键字 */
  keyword?: string;
  /** 审核状态过滤；不传=全部 */
  auditStatus?: number;
  /** 上架状态过滤；勿与 auditStatus 同传 */
  shelfStatus?: number;
  page?: number;
  limit?: number;
}

/** 获取我的短剧列表（分页） */
export function fetchCourseList(query: CourseListQuery = {}): Promise<PageResult<PublisherCourseRow>> {
  return http.get<PageResult<PublisherCourseRow>>("/publisher/course/list", {
    params: {
      keyword: query.keyword || undefined,
      auditStatus: query.auditStatus,
      shelfStatus: query.shelfStatus,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    },
    pick: "page",
  });
}

export interface CourseStats {
  total: number;
  onShelf: number;
  auditing: number;
  offShelf: number;
}

/** 发行新剧列表页顶部统计卡。 */
export function fetchCourseStats(): Promise<CourseStats> {
  return http.get<CourseStats>("/publisher/course/stats");
}

/* ─── 上架 / 下架（§2.1） ──────────────────────────────────────── */

/** 上架(true) / 下架(false)。仅 auditStatus=2 可操作。 */
export function setShelf(courseId: number, onShelf: boolean): Promise<unknown> {
  return http.post<unknown>("/publisher/course/shelf", { courseId, onShelf });
}

/* ─── 剧集明细类型（§4 / §6） ──────────────────────────────────── */

/** 单集记录（已建行的集：已上传/上传失败） */
export interface EpisodeItem {
  courseDetailsId: number;
  episodeNo: number;
  title: string;
  videoUrl: string;
  /** 视频时长（秒，后端 ffprobe 回写） */
  videoDuration: number | null;
  /** 视频大小（字节，后端回写） */
  videoSize: number | null;
  /** 原始文件名（20260703 新增；老数据可为空） */
  fileName?: string | null;
  /** 上传日期（部分接口返回） */
  uploadDate?: string;
  /** 上传态 1已上传/2上传失败 */
  uploadStatus: number;
}

/* ─── Step1 暂存基本信息（§3.1） ──────────────────────────────── */

export interface SaveBasicBody {
  /** 空=新建草稿；非空=更新草稿 */
  courseId: number | null;
  /** 封面 URL（先 /publisher/course/upload 得 URL，9:16） */
  titleImg: string;
  title: string;
  /** 剧情简介 ≤200 */
  details: string;
  /** 计划集数（草稿已建且>0 时不可改） */
  plannedEpisodes: number;
  /** 频道 1男/2女/3通用 */
  genderType: number;
  /** 剧集语言 code（单选，step1） */
  languageType: string;
  /** 标签（逗号分隔的标签名，取自 §3.1.1 labels） */
  courseLabel: string;
  /** 类别 ID（候选来自 /publisher/course/classifications，送审必填） */
  classificationId: number;
  /** 版权类型 1自制/2授权 */
  copyrightType: number;
  /** 版权证明文件 URL（仅 copyrightType=2 授权时必填；支持 PDF/图片/Word）。 */
  copyrightProof?: string;
}

/** 暂存基本信息，返回 courseId（新建/更新草稿） */
export function saveBasic(body: SaveBasicBody): Promise<{ courseId: number }> {
  return http.post<{ courseId: number }>("/publisher/course/saveBasic", body);
}

/** 标签集（后端按语言写死的固定集，§3.1.1） */
export function fetchLabels(languageType: string): Promise<string[]> {
  return http.get<string[]>("/publisher/course/labels", { params: { languageType } });
}

export interface CourseClassification {
  classificationId: number;
  classificationName: string;
}

/** 类别候选（按剧集语言维护，前端不得写死）。 */
export function fetchClassifications(languageType: string): Promise<CourseClassification[]> {
  return http.get<CourseClassification[]>("/publisher/course/classifications", { params: { languageType } });
}

/* ─── Step2 暂存单集 / 上传视频（§3.2） ───────────────────────── */

export interface SaveEpisodeBody {
  courseId: number;
  /** 第几集（后端强校验 ∈ [1, plannedEpisodes]） */
  episodeNo: number;
  /** 剧集标题（选填） */
  title?: string;
  /** 视频 URL（≤500MB，先 /publisher/course/upload 直传 OSS 得到） */
  videoUrl: string;
  /** 原始文件名，用于行内回显 */
  fileName?: string;
}

/** saveEpisode 返回（后端回写大小/时长/上传态） */
export interface SaveEpisodeResult {
  courseDetailsId: number;
  episodeNo: number;
  /** 字节，后端可能尚未探测成功 */
  videoSize: number | null;
  /** 秒，后端可能尚未探测成功 */
  videoDuration: number | null;
  uploadStatus: number;
}

/** 暂存单集（同 episodeNo 再调=覆盖该集）。批量=前端循环调用本接口。 */
export function saveEpisode(body: SaveEpisodeBody): Promise<SaveEpisodeResult> {
  return http.post<SaveEpisodeResult>("/publisher/course/saveEpisode", body);
}

/** 移除单集（物理删除，幂等；仅草稿/驳回态可写）。 */
export function deleteEpisode(courseId: number, episodeNo: number): Promise<void> {
  return http.post<void>("/publisher/course/deleteEpisode", undefined, {
    params: { courseId, episodeNo },
  });
}

/* ─── Step3 发布配置并送审（§3.3） ────────────────────────────── */

export interface PublishBody {
  courseId: number;
  /** 发布范围 1账号主页/2全量推荐 */
  publishScope: number;
  /** 上架设置：立即上架=true / 暂不上架=false */
  onShelfNow: boolean;
}

/** 提交送审（需全部剧集已上传）。返回新审核态。 */
export function publishCourse(body: PublishBody): Promise<{ courseId: number; auditStatus: number }> {
  return http.post<{ courseId: number; auditStatus: number }>("/publisher/course/publish", body);
}

export interface RevenueOption {
  publishScope: number;
  platformRatio: number;
  creatorRatio: number;
  revenueText: string;
}

/** 发布范围分成比例（后管可调，前端不得写死）。 */
export function fetchRevenueOptions(): Promise<RevenueOption[]> {
  return http.get<RevenueOption[]>("/publisher/course/revenueOptions");
}

/* ─── 各国家收费规则（§3.4，只读） ───────────────────────────── */

export interface PriceRuleCountry {
  country: string;
  countryName: string;
  /** 单集价（NULL=该国不卖单集） */
  episodePriceUsd: number | null;
  /** 整剧价（≤50集） */
  wholePriceLe50Usd?: number;
  /** 整剧价（>50集） */
  wholePriceGt50Usd?: number;
  /** 传了 episodes 时按档命中的整剧价 */
  wholePriceUsd?: number;
}

/** 各国家收费规则（传 episodes 则附按档整剧价）。 */
export function fetchPriceRule(episodes?: number): Promise<PriceRuleCountry[]> {
  return http.get<PriceRuleCountry[]>("/publisher/course/priceRule", {
    params: { episodes },
  });
}

/* ─── 草稿恢复 / 清空（§4） ───────────────────────────────────── */

/** 草稿里的 course 基本信息（courseLabel 为逗号分隔字符串） */
export interface DraftCourse {
  courseId: number;
  titleImg: string;
  title: string;
  details: string;
  plannedEpisodes: number;
  genderType: number;
  languageType: string;
  /** 逗号分隔的标签名 */
  courseLabel: string;
  /** 类别 ID / 名称（20260704 新增） */
  classificationId?: number | null;
  classificationName?: string | null;
  copyrightType: number;
  /** 版权证明 URL（授权时回显） */
  copyrightProof?: string;
  /** 本剧高光时刻宣传视频 URL（20260703 起送审必填） */
  highlightVideoUrl?: string | null;
  highlightFileName?: string | null;
  highlightFileSize?: number | null;
  highlightUploadTime?: string | null;
  createTime?: string;
}

export interface DraftResponse {
  course: DraftCourse;
  /** 仅已上传的集（含 videoUrl 供回显） */
  episodes: EpisodeItem[];
}

/** 取当前用户进行中的草稿（无草稿返回 null） */
export function fetchDraft(): Promise<DraftResponse | null> {
  return http.get<DraftResponse | null>("/publisher/course/draft");
}

/** 清空草稿（物理删除，不可恢复）。courseId 为 query 参数。 */
export function clearDraft(courseId: number): Promise<unknown> {
  return http.post<unknown>("/publisher/course/clearDraft", undefined, {
    params: { courseId },
  });
}

/* ─── 短剧详情（§5） ───────────────────────────────────────────── */

export interface CourseDetailBasic {
  courseId: number;
  titleImg: string;
  details: string;
  /** 剧集语言 code */
  languageType: string;
  /** 标签名数组 */
  courseLabel: string[];
  genderType: number;
  /** 类别 ID / 名称（20260704 新增） */
  classificationId?: number | null;
  classificationName?: string | null;
  copyrightType: number;
  /** 版权证明 URL（授权时） */
  copyrightProof?: string;
  /** 本剧高光时刻宣传视频 URL（20260703 起送审必填） */
  highlightVideoUrl?: string | null;
  highlightFileName?: string | null;
  highlightFileSize?: number | null;
  highlightUploadTime?: string | null;
  createTime: string;
}

export interface CourseDetailProgress {
  plannedEpisodes: number;
  uploadedEpisodes: number;
  failedEpisodes?: number;
  pendingEpisodes?: number;
  percent: number;
}

export interface CourseDetailPublish {
  publishScope: number;
  /** 上架状态 0未上架/1已上架/2已下架（仅 auditStatus=2 有意义） */
  shelfStatus: number;
}

export type CourseDetailRevenue = CourseRevenue;

export interface CourseDetail {
  courseId: number;
  dramaNo: string;
  title: string;
  auditStatus: number;
  /** 审核驳回原因：仅 auditStatus=3 有值，其余为 null */
  auditRemark: string | null;
  basic: CourseDetailBasic;
  progress: CourseDetailProgress;
  publish: CourseDetailPublish;
  /** 启用计价国家列表；20260703 汇总版明确无独立上架国家字段。 */
  priceRule: PriceRuleCountry[];
  revenue: CourseDetailRevenue;
}

/**
 * detail.basic.courseLabel 文档（§5）约定为字符串数组，但后端实际回传与 saveBasic/draft 一致的
 * 逗号分隔字符串（如 "Love,Reversal"），无标签时为 null。统一在边界收敛为 string[]，
 * 使声明的 CourseDetailBasic.courseLabel: string[] 与运行时一致，避免 UI 侧 .map 崩溃。
 */
function toLabelArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string" && x.length > 0);
  if (typeof raw === "string") return raw.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

/** 短剧详情 */
export function fetchCourseDetail(courseId: number): Promise<CourseDetail> {
  return http.get<CourseDetail>("/publisher/course/detail", { params: { courseId } }).then((d) => ({
    ...d,
    basic: { ...d.basic, courseLabel: toLabelArray(d.basic?.courseLabel) },
  }));
}

/** 下载批量录入模版（Excel 文件流，后端返回 .xlsx）。 */
export async function downloadUploadTemplate(courseId: number): Promise<Blob> {
  const headers: Record<string, string> = { "Accept-Language": getAcceptLanguage() };
  const token = getPublisherToken();
  if (token) headers["token"] = token;
  const res = await fetch(`${BASE_URL}/publisher/course/uploadTemplate?courseId=${courseId}`, { headers });
  if (!res.ok) throw new Error(`uploadTemplate failed: ${res.status}`);
  if (res.headers.get("Content-Type")?.includes("application/json")) {
    const json = (await res.json()) as ApiResponse<unknown>;
    throw new ApiError(json.code, json.msg);
  }
  return res.blob();
}

export interface SaveHighlightResult {
  courseId: number;
  highlightVideoUrl: string;
  highlightFileName: string | null;
  highlightFileSize: number | null;
  highlightUploadTime: string | null;
}

/** 保存本剧高光时刻宣传视频 URL（20260703 起送审必填；传空 videoUrl 可移除）。 */
export function saveHighlight(courseId: number, videoUrl: string, fileName?: string): Promise<SaveHighlightResult> {
  return http.post<SaveHighlightResult>("/publisher/course/saveHighlight", { courseId, videoUrl, fileName });
}

/* ─── 剧集视频管理（§6.1） ────────────────────────────────────── */

export interface EpisodesStat {
  /** 已上传 count(upload_status=1) */
  uploaded: number;
  /** 上传失败 count(upload_status=2) */
  failed: number;
  /** 待提交 planned − 已建行数 */
  pending: number;
}

export interface EpisodesResponse {
  courseId: number;
  title: string;
  plannedEpisodes: number;
  uploadedEpisodes: number;
  stat: EpisodesStat;
  /** 仅返回已建行的集；未建行的集号由前端按 plannedEpisodes 补"待提交" */
  episodes: EpisodeItem[];
}

export interface EpisodesQuery {
  keyword?: string;
  page?: number;
  limit?: number;
}

/** 剧集视频列表 + 状态统计 */
export function fetchEpisodes(courseId: number, query: EpisodesQuery = {}): Promise<EpisodesResponse> {
  return http.get<EpisodesResponse>("/publisher/course/episodes", {
    params: {
      courseId,
      keyword: query.keyword || undefined,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    },
  });
}
