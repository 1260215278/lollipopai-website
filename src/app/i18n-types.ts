/**
 * 共享 i18n 类型定义 — 从 i18n.tsx 中提取，打破循环依赖。
 *
 * 问题：i18n.tsx 导入 distributionMessages（值），而 distribution i18n 文件
 * 导入 Locale（类型）从 i18n.tsx，形成 14+ 处循环依赖。
 * Vite SSR ssrLoadModule 遍历导入图时陷入循环，导致 SSR 初始化超时。
 *
 * 解决：将 Locale 类型提取到独立文件，所有 i18n 子模块从此处导入。
 * i18n.tsx 仍 re-export Locale 以保持向后兼容。
 */
export type Locale = "zh-TW" | "zh-CN" | "en" | "pt";
