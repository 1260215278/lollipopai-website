// 诊断：按页面类型 × 语言的「正文本地化率」（2026-09-01）
//
// 用法（顺序不能乱）：
//   node node_modules/vite/bin/vite.js build   ← 生成 dist/.ssr/entry-server.js
//   node scripts/check-locale-coverage.mjs     ← 本脚本
//   node scripts/compress-dist.mjs             ← 之后才会清掉 dist/.ssr
//
// ⚠️ 依赖 dist/.ssr/entry-server.js，而压缩脚本会删掉它 ——
//    必须在 **build 之后、compress 之前** 跑。若报找不到，重新 build 即可。
//
// 目的：决定多语言预渲染的规模。生成非 en 版本的前提是**正文真的有该语言的内容**，
// 否则产出的就是「翻译了导航外壳、正文还是英文」的页面 —— 等于新造一批重复内容。
//
// ⚠️ 第一版的两个坑，本版修正：
//   1. pt / es 是拉丁字母语言，不能用「数非拉丁字符」判定 ——
//      `RE[script]` 取到 undefined，`String.match(undefined)` 会去匹配字面量
//      "undefined"，于是 Local 恒为 1，整列数据全是假的。
//   2. 直接对原始 HTML 数英文单词会被 CSS 类名 / JSON-LD / URL / 属性值严重稀释
//      （首页 14205 个「英文单词」里绝大部分不是人读的正文）。
//      → 必须先剥掉 script / style / 标签，只统计**可见文本**。
//
// 判据（可见文本上）：
//   zh / ar：本地文字字符数 ÷ 可见文本总字符数
//   pt / es / en：语言特征词命中率（en 用 the/and/with，pt 用 não/para/com/ção，
//                 es 用 más/para/con/ción/ñ）
import { pathToFileURL } from "node:url";
import { join } from "node:path";

const { renderRoute } = await import(
  pathToFileURL(join(process.cwd(), "dist", ".ssr", "entry-server.js")).href
);

const ROUTES = [
  ["/", "首页"],
  ["/about", "关于"],
  ["/creating", "创作"],
  ["/download", "下载"],
  ["/contact", "联系"],
  ["/blog", "博客列表"],
  ["/blog/character-consistency-workflow", "博客详情"],
  ["/genre/romance", "品类页"],
  ["/region/us", "区域页"],
];

const LANGS = [
  ["", "en"],
  ["/zh", "zh-CN"],
  ["/zh-TW", "zh-TW"],
  ["/pt", "pt"],
  ["/es", "es"],
  ["/ar", "ar"],
];

// 语言特征词（可见文本里出现即视为该语言的内容）
const MARKERS = {
  en: [" the ", " and ", " with ", " for ", " you "],
  "zh-CN": ["的", "和", "我们", "可以", "创作"],
  "zh-TW": ["的", "和", "我們", "可以", "創作"],
  pt: [" não ", " para ", " com ", "ção", "ões", " mais "],
  es: [" más ", " para ", " con ", "ción", "ñ", " nuestro"],
  ar: [" في ", " من ", " على ", " و ", " نحن "],
};

function visibleText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-zA-Z#0-9]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function score(text, locale) {
  if (locale === "zh-CN" || locale === "zh-TW" || locale === "ar") {
    const re = locale === "ar" ? /[؀-ۿ]/g : /[一-鿿]/g;
    const local = (text.match(re) || []).length;
    const total = text.replace(/\s/g, "").length || 1;
    return { pct: local / total, raw: `${local}字/${total}` };
  }
  const markers = MARKERS[locale] ?? [];
  const lower = ` ${text.toLowerCase()} `;
  let hits = 0;
  for (const m of markers) {
    const n = lower.split(m).length - 1;
    hits += n;
  }
  return { pct: hits, raw: `${hits}次特征词` };
}

console.log("=".repeat(100));
console.log("正文本地化率（已剥离 script/style/标签，只统计可见文本）");
console.log("=".repeat(100));
console.log("页面".padEnd(12) + LANGS.map(([, l]) => l.padStart(14)).join(""));

const data = {};
for (const [route, name] of ROUTES) {
  const cells = [];
  for (const [prefix, locale] of LANGS) {
    let html;
    try {
      html = renderRoute(prefix + route);
    } catch {
      cells.push("ERR".padStart(14));
      continue;
    }
    const text = visibleText(html);
    const s = score(text, locale);
    cells.push(s.raw.padStart(14));
    data[route] ??= {};
    data[route][locale] = s.pct;
  }
  console.log(name.padEnd(12) + cells.join(""));
}

console.log();
console.log("=".repeat(100));
console.log("判定");
console.log("=".repeat(100));
for (const [route, name] of ROUTES) {
  const row = [];
  for (const [, locale] of LANGS) {
    if (locale === "en") continue;
    const v = data[route]?.[locale];
    if (v === undefined) { row.push(`${locale}:?`); continue; }
    // zh / ar：本地文字占可见文本比例 ≥8% 视为真本地化
    // pt / es：特征词命中 ≥10 次视为真本地化
    const threshold = locale === "zh-CN" || locale === "zh-TW" || locale === "ar" ? 0.08 : 10;
    const ok = v >= threshold;
    const shown = typeof v === "number" && v < 1 ? `${(v * 100).toFixed(1)}%` : v.toFixed(0);
    row.push(`${locale}:${ok ? "✓" : "✗"}${shown}`);
  }
  console.log(`  ${name.padEnd(12)} ${row.join("  ")}`);
}
console.log();
console.log("  ✓ zh/ar：本地文字占可见文本 ≥8%　pt/es：语言特征词 ≥10 次　→ 可生成该语言版本");
console.log("  ✗ 未达阈值 → 正文仍是英文，生成出来就是重复内容");
