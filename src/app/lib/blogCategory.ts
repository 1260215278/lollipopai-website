/** /blog 分类 → 本地化标签（BlogListPage 与 BlogPostPage 共用）
 *
 * ⚠️ 单一数据源：新增分类时只改这里，两个页面自动同步。
 *    若只改一处，另一处会静默 fallback 到 blog.ts 里硬编码的英文 categoryLabel，
 *    表现为「切到中文后某个分类标签仍是英文」，极难排查。
 *
 * @param category   BlogPost.category
 * @param fallback   未命中时回退值（通常传 BlogPost.categoryLabel）
 * @param dp         messages.dynamicPages（i18n 文案包）
 */
export function blogCategoryLabel(
  category: string,
  fallback: string,
  dp: Record<string, string>,
): string {
  switch (category) {
    case "industry":
      return dp.industryInsights;
    case "creator":
      return dp.creatorEconomy;
    case "guide":
      return dp.creatorGuides;
    // 以下三项为 2026-09-01 由 /guides 迁入的细分分类
    case "workflow":
      return dp.workflowGuides;
    case "production":
      return dp.productionGuides;
    case "distribution":
      return dp.distributionGuides;
    default:
      return fallback;
  }
}
