/**
 * 内部链接尾斜杠规范化工具。
 *
 * 站点 canonical / sitemap 统一使用「尾斜杠」约定（/blog/slug/、/about/），
 * 但站内陆由（React Router <Link>）与 Markdown 正文链接历史上缺尾斜杠
 * （/blog/slug、/about）。Google 沿无斜杠内链抓取时，源站 Caddy 在 Cloudflare
 * 之后会误发 http:// 的 301 Location，被 GSC 判为「网页会自动重定向」。
 * 补齐尾斜杠使内链与 canonical 一致，消除该发现路径。
 *
 * 不处理：外部 / 协议相对(//)、锚点(# 开头)、mailto:/tel:、带扩展名的静态资源。
 */
export function withTrailingSlash(input: string): string {
  if (!input || typeof input !== "string") return input;
  // 绝对 URL（含协议）：拆出 origin 后仅归一化路径段，避免误改协议/主机
  const abs = input.match(/^([a-z][a-z0-9+.\-]*:\/\/[^/]+)(.*)$/i);
  if (abs) {
    const origin = abs[1];
    const rest = abs[2] || "/";
    return origin + withTrailingSlash(rest);
  }
  // 仅处理站内绝对路径（以 / 开头，且非协议相对 //）
  if (!input.startsWith("/") || input.startsWith("//")) return input;
  let path = input;
  let hash = "";
  const hi = path.indexOf("#");
  if (hi >= 0) {
    hash = path.slice(hi);
    path = path.slice(0, hi);
  }
  let query = "";
  const qi = path.indexOf("?");
  if (qi >= 0) {
    query = path.slice(qi);
    path = path.slice(0, qi);
  }
  // 静态资源（带扩展名）保持原样
  if (/\.[a-z0-9]+$/i.test(path)) return input;
  if (path.endsWith("/")) return input;
  if (path === "") path = "/";
  path += "/";
  return path + query + hash;
}
