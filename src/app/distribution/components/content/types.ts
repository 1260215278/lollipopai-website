/**
 * content 组件共享类型：统一从 services（真实接口契约）与本地展示组件复出，
 * 不再依赖 mock 数据模型。
 */
export type {
  PublisherCourseRow,
  CourseDetail,
  CourseDetailBasic,
  EpisodeItem,
  EpisodesResponse,
  PriceRuleCountry,
  DraftResponse,
  DraftCourse,
  SaveBasicBody,
  SaveEpisodeBody,
  SaveEpisodeResult,
  SaveBasicResult,
  PublishBody,
  PublishResult,
  DraftPublish,
  PageResult,
  CourseListQuery,
  CourseStats,
  RevenueOption,
  CourseClassification,
} from "../../../services/content";
export {
  AuditStatus,
  ShelfStatus,
  PublishScope,
  CopyrightType,
  GenderType,
  UploadStatus,
} from "../../../services/content";

export type { LanguageOption } from "../../../services/language";
export type { Highlight } from "./PhoneMockup";
export type { ChannelValue } from "../../mock/content";
