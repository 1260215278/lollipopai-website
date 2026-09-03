/**
 * 路径式多语言路由工具。
 *
 * 与 Nginx 重写规则对齐（见 language-routing-guide）：
 *   /zh/     → zh-CN
 *   /zh-TW/  → zh-TW
 *   /en/     → en
 *   /pt/     → pt
 *   /es/     → es
 *   /ar/     → ar
 *   无前缀   → 默认英文（en）
 *
 * 说明：Nginx 内部 rewrite 不会把 ?lang= 暴露给浏览器，
 * SPA 必须以 pathname 语言前缀为真源；Router basename 含此前缀后，
 * 现有 /distribution/*、/about 等绝对路径 Link/navigate 无需逐处改写。
 */
import type { Locale } from "./i18n-types";
import { isMultilangSubsetPath } from "./multilangSubset";

/** URL 路径段（注意 zh-TW 须排在 zh 前，避免前缀误匹配） */
export const LOCALE_PATH_SEGMENTS = ["zh-TW", "zh", "en", "pt", "es", "ar"] as const;
export type LocalePathSegment = (typeof LOCALE_PATH_SEGMENTS)[number];

const SEGMENT_TO_LOCALE: Record<LocalePathSegment, Locale> = {
  zh: "zh-CN",
  "zh-TW": "zh-TW",
  en: "en",
  pt: "pt",
  es: "es",
  ar: "ar",
};

const LOCALE_TO_SEGMENT: Record<Locale, LocalePathSegment | ""> = {
  "zh-CN": "zh",
  "zh-TW": "zh-TW",
  // 默认英文不写前缀，保持干净 URL；/en/* 仍可识别
  en: "",
  pt: "pt",
  es: "es",
  ar: "ar",
};

export function isLocalePathSegment(value: string): value is LocalePathSegment {
  return (LOCALE_PATH_SEGMENTS as readonly string[]).includes(value);
}

export function pathSegmentToLocale(segment: LocalePathSegment): Locale {
  return SEGMENT_TO_LOCALE[segment];
}

/** 切换语言时写入 URL 的路径段；en 返回空字符串（无前缀） */
export function localeToPathSegment(locale: Locale): LocalePathSegment | "" {
  return LOCALE_TO_SEGMENT[locale];
}

/**
 * 从 import.meta.url / BASE_URL 推导部署根路径（不含语言前缀、无尾斜杠）。
 * 根部署 → ""；子路径 /lollipop/ → "/lollipop"
 */
export function getDeployBasename(moduleUrl?: string): string {
  try {
    const url = new URL(moduleUrl ?? import.meta.url);
    const match = url.pathname.match(/^(.*)\/assets\//);
    if (match) {
      const base = match[1] || "";
      return base === "/" ? "" : base.replace(/\/$/, "");
    }
  } catch {
    // fall through
  }

  try {
    const envBase = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL;
    if (envBase && envBase !== "/") {
      return envBase.replace(/\/$/, "");
    }
  } catch {
    // ignore
  }

  return "";
}

export type LocalePathMatch = {
  segment: LocalePathSegment;
  locale: Locale;
  /** 含前导斜杠的语言段，如 "/zh" */
  prefix: string;
  /** 去掉部署根与语言前缀后的应用路径，至少为 "/" */
  appPath: string;
};

/**
 * 解析 pathname 中的语言前缀。
 * @param pathname 完整 pathname（可含部署子路径）
 * @param deployBase 部署根，如 "" 或 "/lollipop"
 */
export function matchLocalePath(
  pathname: string,
  deployBase = "",
): LocalePathMatch | null {
  let path = pathname || "/";
  if (deployBase && (path === deployBase || path.startsWith(`${deployBase}/`))) {
    path = path.slice(deployBase.length) || "/";
  }
  if (!path.startsWith("/")) path = `/${path}`;

  for (const segment of LOCALE_PATH_SEGMENTS) {
    const prefix = `/${segment}`;
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      const rest = path.slice(prefix.length) || "/";
      return {
        segment,
        locale: pathSegmentToLocale(segment),
        prefix,
        appPath: rest.startsWith("/") ? rest : `/${rest}`,
      };
    }
  }
  return null;
}

/** 去掉语言前缀后的应用路径（保留部署根外的业务路径） */
export function stripLocalePrefix(pathname: string, deployBase = ""): string {
  const matched = matchLocalePath(pathname, deployBase);
  if (matched) return matched.appPath;

  let path = pathname || "/";
  if (deployBase && (path === deployBase || path.startsWith(`${deployBase}/`))) {
    path = path.slice(deployBase.length) || "/";
  }
  return path.startsWith("/") ? path : `/${path}`;
}

/**
 * 拼接部署根 + 语言前缀 + 应用路径。
 * - en（无前缀）+ "/" → "/" 或 deployBase + "/"
 * - zh-CN + "/" → "/zh/"（带尾斜杠，兼容 Nginx `^/zh/`）
 * - zh-CN + "/about" → "/zh/about"
 *
 * 方案 B 回退：非 en 语言下，若 appPath 不在多语言子集（没有语言版本产物，
 * 见 multilangSubset.ts），则回退到英文 URL（无语言前缀）—— 避免语言版本
 * 页面产生死链（check-dist-links.py 校验）。
 */
export function buildLocalizedPath(
  locale: Locale,
  appPath: string,
  deployBase = "",
): string {
  const segment = localeToPathSegment(locale);
  let app = appPath || "/";
  if (!app.startsWith("/")) app = `/${app}`;

  // 方案 B：非 en 语言 + 非子集路径 → 回退英文路径（保留部署根）
  if (segment && !isMultilangSubsetPath(app)) {
    const base = deployBase.replace(/\/$/, "");
    return app === "/" ? (base ? `${base}/` : "/") : `${base}${app}`;
  }

  const isHome = app === "/";
  const base = deployBase.replace(/\/$/, "");

  if (!segment) {
    if (isHome) return base ? `${base}/` : "/";
    return `${base}${app}`;
  }

  if (isHome) {
    return `${base}/${segment}/`;
  }
  return `${base}/${segment}${app}`;
}

/**
 * BrowserRouter / StaticRouter 的 basename：
 * 部署根 + 当前 URL 语言前缀。根且无语言 → "/"。
 */
export function getRouterBasename(
  pathname?: string,
  moduleUrl?: string,
): string {
  const deploy = getDeployBasename(moduleUrl);
  const path =
    pathname ??
    (typeof window !== "undefined" ? window.location.pathname : "/");
  const matched = matchLocalePath(path, deploy);
  const combined = `${deploy}${matched?.prefix ?? ""}`;
  return combined || "/";
}

/**
 * 为 hreflang / 外链生成带语言前缀的绝对路径（不含 origin）。
 * en 默认无前缀；需要显式 /en 时传 preferEnPrefix。
 */
export function localizedHref(
  locale: Locale,
  appPath: string,
  options?: { preferEnPrefix?: boolean },
): string {
  if (locale === "en" && options?.preferEnPrefix) {
    const app = !appPath || appPath === "/" ? "" : appPath.startsWith("/") ? appPath : `/${appPath}`;
    return app ? `/en${app}` : "/en/";
  }
  return buildLocalizedPath(locale, appPath, "");
}
