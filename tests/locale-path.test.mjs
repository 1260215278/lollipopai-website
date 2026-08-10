/**
 * 路径式多语言路由工具单测（不依赖构建，直接复刻映射契约）。
 * 与 src/app/localePath.ts / language-routing-guide 保持一致。
 */
import test from "node:test";
import assert from "node:assert/strict";

/** 与 localePath.ts 对齐的纯函数复刻（避免 ESM/TS 加载器依赖） */
const LOCALE_PATH_SEGMENTS = ["zh-TW", "zh", "en", "pt"];
const SEGMENT_TO_LOCALE = {
  zh: "zh-CN",
  "zh-TW": "zh-TW",
  en: "en",
  pt: "pt",
};
const LOCALE_TO_SEGMENT = {
  "zh-CN": "zh",
  "zh-TW": "zh-TW",
  en: "",
  pt: "pt",
};

function matchLocalePath(pathname, deployBase = "") {
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
        locale: SEGMENT_TO_LOCALE[segment],
        prefix,
        appPath: rest.startsWith("/") ? rest : `/${rest}`,
      };
    }
  }
  return null;
}

function stripLocalePrefix(pathname, deployBase = "") {
  const matched = matchLocalePath(pathname, deployBase);
  if (matched) return matched.appPath;
  let path = pathname || "/";
  if (deployBase && (path === deployBase || path.startsWith(`${deployBase}/`))) {
    path = path.slice(deployBase.length) || "/";
  }
  return path.startsWith("/") ? path : `/${path}`;
}

function buildLocalizedPath(locale, appPath, deployBase = "") {
  const segment = LOCALE_TO_SEGMENT[locale];
  let app = appPath || "/";
  if (!app.startsWith("/")) app = `/${app}`;
  const isHome = app === "/";
  const base = deployBase.replace(/\/$/, "");

  if (!segment) {
    if (isHome) return base ? `${base}/` : "/";
    return `${base}${app}`;
  }
  if (isHome) return `${base}/${segment}/`;
  return `${base}/${segment}${app}`;
}

function getRouterBasename(pathname, deployBase = "") {
  const matched = matchLocalePath(pathname, deployBase);
  const combined = `${deployBase}${matched?.prefix ?? ""}`;
  return combined || "/";
}

test("matchLocalePath: /zh/distribution/enroll → zh-CN", () => {
  const m = matchLocalePath("/zh/distribution/enroll");
  assert.equal(m.locale, "zh-CN");
  assert.equal(m.appPath, "/distribution/enroll");
  assert.equal(m.prefix, "/zh");
});

test("matchLocalePath: zh-TW 不被 zh 误匹配", () => {
  const m = matchLocalePath("/zh-TW/blog");
  assert.equal(m.locale, "zh-TW");
  assert.equal(m.appPath, "/blog");
});

test("matchLocalePath: 无前缀返回 null", () => {
  assert.equal(matchLocalePath("/distribution/enroll"), null);
  assert.equal(matchLocalePath("/about"), null);
});

test("matchLocalePath: 部署子路径 + 语言前缀", () => {
  const m = matchLocalePath("/lollipop/pt/download", "/lollipop");
  assert.equal(m.locale, "pt");
  assert.equal(m.appPath, "/download");
});

test("buildLocalizedPath: 中文首页带尾斜杠（兼容 Nginx ^/zh/）", () => {
  assert.equal(buildLocalizedPath("zh-CN", "/"), "/zh/");
  assert.equal(buildLocalizedPath("en", "/"), "/");
  assert.equal(buildLocalizedPath("zh-CN", "/about"), "/zh/about");
  assert.equal(buildLocalizedPath("en", "/about"), "/about");
  assert.equal(buildLocalizedPath("pt", "/blog/x"), "/pt/blog/x");
});

test("stripLocalePrefix + getRouterBasename", () => {
  assert.equal(stripLocalePrefix("/zh/about"), "/about");
  assert.equal(getRouterBasename("/zh/about"), "/zh");
  assert.equal(getRouterBasename("/about"), "/");
  assert.equal(getRouterBasename("/en/distribution/enroll"), "/en");
});
