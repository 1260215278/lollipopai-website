/**
 * 语言版本服务（复用现有平台接口）
 * ------------------------------------------------------------------
 * 上剧 step1 的「剧集语言」单选下拉，复用 `GET /app/languageType/getLanguageTypeList`
 * （接口文档 §7「复用的现有接口」）。语言 code 存入 course.language_type。
 *
 * 真实响应（已对真实环境 testshort.top 核实）：data 为 MyBatis-Plus 分页对象
 * `{ records: [...], total, size, current, pages }`，每项：
 *   { languageId, language(code 如 en/zh/cht/pt/es/ar), remark(展示名 如 English/简体中文),
 *     isEnable(1 启用), sort, createTime }
 * 故此处取 data.records，过滤 isEnable=1，按 sort 升序，映射 remark → 展示名。
 */
import { http } from "./http";

/** 后端语言记录（IPage.records 项） */
interface LanguageRecord {
  languageId: number;
  /** 语言 code（存入 course.language_type） */
  language: string;
  /** 展示名（如 English / 简体中文） */
  remark: string;
  /** 1 启用 / 0 停用 */
  isEnable: number;
  /** 排序 */
  sort: number;
  createTime?: string;
}

/** 语言选项（前端统一形态） */
export interface LanguageOption {
  /** 语言 code */
  language: string;
  /** 展示名 */
  languageName: string;
}

/** 获取语言版本下拉列表（仅启用项，按 sort 升序） */
export function getLanguageTypeList(): Promise<LanguageOption[]> {
  return http
    .get<{ records: LanguageRecord[] }>("/app/languageType/getLanguageTypeList")
    .then((page) =>
      (page?.records ?? [])
        .filter((r) => r.isEnable === 1)
        .sort((a, b) => a.sort - b.sort)
        .map((r) => ({ language: r.language, languageName: r.remark })),
    );
}
