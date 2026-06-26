/**
 * 发行中心 i18n 命名空间组装
 * ------------------------------------------------------------------
 * 各功能模块的文案分文件维护在 ./i18n/*（便于并行开发，各功能各自拥有自己的文件），
 * 这里组装为单一 distribution 命名空间，再由 ../i18n.tsx 顶层注入到每个语言。
 * 仍是官网同一套 useI18n() 体系，组件统一 messages.distribution.* 访问。
 */
import type { Locale } from "../i18n";
import { common, type CommonMessages } from "./i18n/common";
import { nav, type NavMessages } from "./i18n/nav";
import { enroll, type EnrollMessages } from "./i18n/enroll";
import { overview, type OverviewMessages } from "./i18n/overview";
import { content, type ContentMessages } from "./i18n/content";
import { payment, type PaymentMessages } from "./i18n/payment";
import { earnings, type EarningsMessages } from "./i18n/earnings";
import { withdraw, type WithdrawMessages } from "./i18n/withdraw";
import { tenant, type TenantMessages } from "./i18n/tenant";

export interface DistributionMessages {
  common: CommonMessages;
  nav: NavMessages;
  enroll: EnrollMessages;
  overview: OverviewMessages;
  content: ContentMessages;
  payment: PaymentMessages;
  earnings: EarningsMessages;
  withdraw: WithdrawMessages;
  tenant: TenantMessages;
}

function compose(locale: Locale): DistributionMessages {
  return {
    common: common[locale],
    nav: nav[locale],
    enroll: enroll[locale],
    overview: overview[locale],
    content: content[locale],
    payment: payment[locale],
    earnings: earnings[locale],
    withdraw: withdraw[locale],
    tenant: tenant[locale],
  };
}

export const distributionMessages: Record<Locale, DistributionMessages> = {
  "zh-CN": compose("zh-CN"),
  "zh-TW": compose("zh-TW"),
  en: compose("en"),
  pt: compose("pt"),
};
