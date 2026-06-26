/**
 * 上剧中心 —— i18n 维度枚举
 * ------------------------------------------------------------------
 * 业务数据已切真实接口（services/content.ts，对接 /publisher/course/**），本文件不再
 * 承载 mock 列表/剧集数据。仅保留 i18n 文案仍引用的维度枚举：
 *  - CHANNEL_VALUES：频道（对应 genderType 1男/2女/3通用，顺序与 1/2/3 对齐）。
 *  - TAG_VALUES：历史标签枚举（发行剧标签现由 `/publisher/course/labels` 按语言动态
 *    返回，前端不再写死；此处仅为 i18n/content.ts 的 tags 文案保留类型占位）。
 */

/** 历史标签枚举（仅 i18n 文案占位；实际标签集走 labels 接口） */
export const TAG_VALUES = [
  "urban",
  "rural",
  "romance",
  "youth",
  "family",
  "mystery",
  "comeback",
  "plot",
  "wuxia",
  "comedy",
  "ancient",
  "campus",
] as const;
export type TagValue = (typeof TAG_VALUES)[number];

/** 频道（value 为业务码；label 走 i18n）。索引 +1 = genderType（1男/2女/3通用）。 */
export const CHANNEL_VALUES = ["male", "female", "general"] as const;
export type ChannelValue = (typeof CHANNEL_VALUES)[number];

/** genderType(1/2/3) → 频道 value。 */
export function genderToChannel(genderType: number): ChannelValue {
  return CHANNEL_VALUES[genderType - 1] ?? "general";
}

/** 频道 value → genderType(1/2/3)。 */
export function channelToGender(channel: ChannelValue): number {
  return CHANNEL_VALUES.indexOf(channel) + 1;
}
