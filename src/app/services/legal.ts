/**
 * 官网用户协议 / 隐私政策
 * ------------------------------------------------------------------
 * 与 H5 `/me/setting/xieyi`、`/me/setting/mimi` 同源：
 *   - 用户协议（xieyi）→ app/common/type/154
 *   - 隐私政策（mimi）  → app/common/type/155
 * 正文为配置中心富文本 HTML，随 Accept-Language 返回对应语言。
 */
import { http } from "./http";

export type LegalDocKind = "terms" | "privacy";

/** 与 short-play me/setting 一致的配置 type */
const LEGAL_COMMON_TYPE = {
  terms: 154,
  privacy: 155,
} as const;

interface AppCommonConfig {
  id: number;
  type: number;
  value: string;
  min: string;
  max: string | null;
  conditionFrom: string | null;
  createAt: string | null;
}

/** 拉取用户协议或隐私政策正文（HTML 字符串） */
export function getLegalDocument(kind: LegalDocKind): Promise<string> {
  const type = LEGAL_COMMON_TYPE[kind];
  return http
    .get<AppCommonConfig>(`/app/common/type/${type}`, {
      auth: false,
      toastOnError: false,
    })
    .then((data) => data.value ?? "");
}
