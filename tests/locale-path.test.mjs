/**
 * 路径式多语言路由工具单测（不依赖构建，直接复刻映射契约）。
 * 与 src/app/localePath.ts / language-routing-guide 保持一致。
 */
import test from "node:test";
import assert from "node:assert/strict";

/** 与 localePath.ts 对齐的纯函数复刻（避免 ESM/TS 加载器依赖） */
const LOCALE_PATH_SEGMENTS = ["zh-TW", "zh", "en", "pt", "es", "ar"];
const SEGMENT_TO_LOCALE = {
  zh: "zh-CN",
  "zh-TW": "zh-TW",
  en: "en",
  pt: "pt",
  es: "es",
  ar: "ar",
};
const LOCALE_TO_SEGMENT = {
  "zh-CN": "zh",
  "zh-TW": "zh-TW",
  en: "",
  pt: "pt",
  es: "es",
  ar: "ar",
};

/**
 * 多语言子集快照（与 src/app/multilangSubset.ts 对齐）。
 * 若子集变更（新增/移除语言产物页面），需同步更新此清单。
 */
const SUBSET_STATIC = new Set(["/", "/about", "/creating", "/download", "/contact", "/blog"]);
const SUBSET_GENRES = new Set([
  "romance", "revenge", "thriller", "ceo-drama", "fantasy",
  "action", "horror", "sci-fi", "family", "historical",
]);
const SUBSET_HOWTOS = new Set([
  "how-to-create-ai-short-drama", "script-to-screen-pipeline", "ten-episodes-two-weeks",
  "first-vertical-drama-zero-experience", "fix-ai-video-artifacts",
  "character-consistency-workflow", "multilingual-localization-workflow",
  "publish-and-monetize-vertical-drama", "ai-drama-budget-under-1000",
  "ai-drama-legal-checklist", "ai-video-storytelling", "ai-short-drama-complete-guide",
]);

function isMultilangSubsetPath(appPath) {
  const p = appPath.startsWith("/") ? appPath : `/${appPath}`;
  if (SUBSET_STATIC.has(p)) return true;
  if (p.startsWith("/genre/")) return SUBSET_GENRES.has(p.slice("/genre/".length));
  if (p.startsWith("/blog/")) return SUBSET_HOWTOS.has(p.slice("/blog/".length));
  return false;
}

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
  assert.equal(buildLocalizedPath("pt", "/blog/how-to-create-ai-short-drama"), "/pt/blog/how-to-create-ai-short-drama");
  assert.equal(buildLocalizedPath("es", "/about"), "/es/about");
  assert.equal(buildLocalizedPath("ar", "/"), "/ar/");
});

test("buildLocalizedPath: 方案 B 非子集路径回退英文（语言版本无产物）", () => {
  // 非子集：普通博客 / 剧集 / 地域 / 账户页 → 回退无前缀英文 URL
  assert.equal(buildLocalizedPath("ar", "/blog/what-is-micro-drama"), "/blog/what-is-micro-drama");
  assert.equal(buildLocalizedPath("zh-CN", "/drama/temptation-ceo"), "/drama/temptation-ceo");
  assert.equal(buildLocalizedPath("pt", "/region/north-america"), "/region/north-america");
  assert.equal(buildLocalizedPath("es", "/terms"), "/terms");
  assert.equal(buildLocalizedPath("zh-TW", "/distribution/enroll"), "/distribution/enroll");
  // 子集路径保持语言前缀
  assert.equal(buildLocalizedPath("zh-CN", "/genre/romance"), "/zh/genre/romance");
  assert.equal(buildLocalizedPath("pt", "/blog/ten-episodes-two-weeks"), "/pt/blog/ten-episodes-two-weeks");
  // 部署子路径下同样回退
  assert.equal(buildLocalizedPath("ar", "/blog/what-is-micro-drama", "/lollipop"), "/lollipop/blog/what-is-micro-drama");
});

test("matchLocalePath: es / ar 前缀", () => {
  const es = matchLocalePath("/es/download");
  assert.equal(es.locale, "es");
  assert.equal(es.appPath, "/download");
  const ar = matchLocalePath("/ar/distribution/enroll");
  assert.equal(ar.locale, "ar");
  assert.equal(ar.appPath, "/distribution/enroll");
});

test("stripLocalePrefix + getRouterBasename", () => {
  assert.equal(stripLocalePrefix("/zh/about"), "/about");
  assert.equal(getRouterBasename("/zh/about"), "/zh");
  assert.equal(getRouterBasename("/about"), "/");
  assert.equal(getRouterBasename("/en/distribution/enroll"), "/en");
});
