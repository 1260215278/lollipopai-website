/**
 * 多语言预渲染子集（方案 B）路径判定。
 *
 * 背景：2026-09-01 落地方案 B —— 只对高价值页面生成语言版本产物
 * （首页 / 关于 / 创作 / 下载 / 联系 / 博客列表 6 个静态页 + 10 个 genre
 * + 全部有中文标题的文章）。子集规则后来从「仅 12 篇 HowTo」放宽为
 * 「titleZh 存在即有语言版本」，故子集规模随有中文翻译的文章数变化：
 * 新增文章无需改本文件，产物数与 hreflang 自动跟随。
 * 其余页面（drama / region / 无中文文章 / 账户页等）只有英文产物。
 *
 * 因此语言版本页面里的站内链接若指向非子集路径，必须回退到英文 URL（无语言前缀），
 * 否则产物层面是死链（见 scripts/check-dist-links.py 的资源缺失），
 * 且爬虫直链语言版本 URL 会拿到不匹配的内容。
 *
 * 硬约束：本模块只能从数据「元数据」读取（blog.ts / genres.ts）。
 * 禁止导入 blogContent.ts —— 正文导入会把全部博客正文拉回公共 chunk，
 * 破坏 blogContent.ts 顶部声明的「仅两处导入」拆分约束。
 */
import { blogMeta } from "./data/blog";
import { genres } from "./data/genres";

/** 有语言产物的静态页（与 scripts/prerender-plugin.ts 的 staticPages 子集对齐） */
const MULTILANG_STATIC_PATHS = new Set([
  "/",
  "/about",
  "/creating",
  "/download",
  "/contact",
  "/blog",
]);

const MULTILANG_GENRE_SLUGS = new Set(genres.map((g) => g.slug));

/**
 * 所有有中文标题的文章都进入多语言子集（titleZh 存在 = 有中文翻译）。
 * 之前仅 HowTo 文章进入子集，导致 18 篇有中文内容的文章缺少语言版本产物。
 */
const MULTILANG_HOWTO_SLUGS = new Set(
  blogMeta.filter((p) => p.titleZh).map((p) => p.slug),
);

/**
 * 判断 appPath 是否属于多语言子集（即是否有语言版本产物）。
 * @param appPath 无语言前缀的应用路径，如 "/about"、"/blog/how-to-create-ai-short-drama"
 */
export function isMultilangSubsetPath(appPath: string): boolean {
  const p = appPath.startsWith("/") ? appPath : `/${appPath}`;
  if (MULTILANG_STATIC_PATHS.has(p)) return true;
  if (p.startsWith("/genre/")) {
    return MULTILANG_GENRE_SLUGS.has(p.slice("/genre/".length));
  }
  if (p.startsWith("/blog/")) {
    return MULTILANG_HOWTO_SLUGS.has(p.slice("/blog/".length));
  }
  return false;
}
