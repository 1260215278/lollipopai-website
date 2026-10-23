/**
 * 共享 Markdown 渲染器（零第三方依赖）
 *
 * 原先内联在 BlogPostPage 中，因博客知识区（原 /guides，2026-09-01 已并入 /blog）
 * 需要同样的渲染能力而抽出，避免两套实现漂移。支持：标题 / 加粗 / 斜体 /
 * 行内代码 / 链接 / 引用 / 有序无序列表 / 表格 / 分隔线。
 */
import type { ReactNode } from "react";
import { withTrailingSlash } from "./url";

/**
 * 行内裸 URL 链接化（2026-10-23 修复）
 *
 * 正文里常出现括号包裹的裸 URL，例如
 *   "...(an AI short-drama platform, https://www.lollipop.im/) ran..."
 * 旧实现只渲染 [text](url) 显式链接，裸 URL 以纯文本输出；Google 的 URL
 * 提取器会把结尾的 `)` 一起抓成 `https://www.lollipop.im/)` 并去爬，
 * 命中 SPA 兜底壳 → 被记为「noindex」。GSC Coverage 明细就此出现 /). /) 坏链。
 *
 * 这里把裸 URL 包成真正的 <a>，并剥离结尾标点（).,;:!? 及全角 ）】），
 * 既消除坏链提取，又让 URL 可点击、利于 AIO 引用。
 */
// 仅匹配合法 URL 字符（ASCII 字符集），遇中文/CJK 标点即止——
// 否则 https://www.lollipop.im/）把毕业作业 会被整句中文误吞为 URL，
// 导致 <a href> 携带全角 ） 变成点击 404 的坏链。
const BARE_URL_RE = /https?:\/\/[A-Za-z0-9\-._~:/?#\[\]@!$&'()*+,;=%]+/g;
const TRAIL_PUNCT_RE = /[.,;:!?)\]】）]+$/;

export function linkifyBareUrls(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  BARE_URL_RE.lastIndex = 0;
  while ((m = BARE_URL_RE.exec(text)) !== null) {
    let url = m[0];
    let trail = "";
    while (TRAIL_PUNCT_RE.test(url)) {
      trail = url.slice(-1) + trail;
      url = url.slice(0, -1);
    }
    if (m.index > last) nodes.push(text.slice(last, m.index));
    nodes.push(
      <a
        key={key++}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#FF4D00] hover:underline"
      >
        {url}
      </a>,
    );
    if (trail) nodes.push(trail);
    last = m.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** 行内元素渲染：**加粗** *斜体* `代码` [链接](url) */
export function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(...linkifyBareUrls(text.slice(last, m.index)));
    if (m[2] !== undefined) {
      nodes.push(<strong key={key++}>{m[2]}</strong>);
    } else if (m[3] !== undefined) {
      nodes.push(<em key={key++}>{m[3]}</em>);
    } else if (m[4] !== undefined) {
      nodes.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-white/10 text-[#FF4D00] text-[0.9em]">
          {m[4]}
        </code>,
      );
    } else if (m[5] !== undefined) {
      const url = m[6];
      const isInternal = url.startsWith("/") && !url.startsWith("//");
      const href = isInternal ? withTrailingSlash(url) : url;
      nodes.push(
        <a
          key={key++}
          href={href}
          {...(isInternal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
          className="text-[#FF4D00] hover:underline"
        >
          {m[5]}
        </a>,
      );
    }
    last = regex.lastIndex;
  }
  if (last < text.length) nodes.push(...linkifyBareUrls(text.slice(last)));
  return nodes;
}

/** 块级 Markdown 渲染 */
export function renderMarkdown(md: string): ReactNode[] {
  const lines = md.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;
  const isList = (l: string) => /^\s*[-*]\s+/.test(l);
  const isOrdered = (l: string) => /^\s*\d+\.\s+/.test(l);
  const isHeading = (l: string) => /^(#{1,6})\s+/.test(l);
  const isTableRow = (l: string) => l.trim().startsWith("|");
  const isSep = (l: string) => l.trim() === "---" || l.trim() === "***";

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }
    if (isSep(line)) {
      i++;
      continue;
    }
    // Heading
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const txt = h[2];
      const cls =
        level <= 2
          ? "text-2xl font-bold text-white mt-10 mb-4"
          : "text-xl font-semibold text-white mt-8 mb-3";
      blocks.push(level === 2 ? (
        <h2 key={key++} className={cls}>{renderInline(txt)}</h2>
      ) : (
        <h3 key={key++} className={cls}>{renderInline(txt)}</h3>
      ));
      i++;
      continue;
    }
    // Blockquote
    if (line.startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote key={key++} className="border-l-4 border-[#FF4D00] pl-4 my-6 text-gray-300 italic">
          {buf.map((b, bi) => (
            <p key={bi} className="mb-1">{renderInline(b)}</p>
          ))}
        </blockquote>,
      );
      continue;
    }
    // Table
    if (isTableRow(line)) {
      const rows: string[] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(lines[i].trim());
        i++;
      }
      const parsed = rows
        .filter((r) => !/^\|[\s:|-]+\|$/.test(r))
        .map((r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
      if (parsed.length) {
        const [head, ...bodyRows] = parsed;
        blocks.push(
          <div key={key++} className="my-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {head.map((c, ci) => (
                    <th key={ci} className="border border-white/10 bg-white/5 px-3 py-2 text-left text-white font-semibold">
                      {renderInline(c)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((r, ri) => (
                  <tr key={ri}>
                    {r.map((c, ci) => (
                      <td key={ci} className="border border-white/10 px-3 py-2 text-gray-300">
                        {renderInline(c)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
      }
      continue;
    }
    // Unordered list
    if (isList(line)) {
      const items: string[] = [];
      while (i < lines.length && isList(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="list-disc pl-6 my-4 space-y-2 text-gray-300">
          {items.map((it, ii) => (
            <li key={ii}>{renderInline(it)}</li>
          ))}
        </ul>,
      );
      continue;
    }
    // Ordered list
    if (isOrdered(line)) {
      const items: string[] = [];
      while (i < lines.length && isOrdered(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="list-decimal pl-6 my-4 space-y-2 text-gray-300">
          {items.map((it, ii) => (
            <li key={ii}>{renderInline(it)}</li>
          ))}
        </ol>,
      );
      continue;
    }
    // Paragraph: collect consecutive plain lines
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !isHeading(lines[i]) &&
      !lines[i].startsWith(">") &&
      !isTableRow(lines[i]) &&
      !isList(lines[i]) &&
      !isOrdered(lines[i]) &&
      !isSep(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="mb-5 text-gray-300" style={{ lineHeight: 1.9 }}>
        {renderInline(para.join(" "))}
      </p>,
    );
  }
  return blocks;
}

/** 将 Markdown 正文转为纯文本（供 Article Schema 的 articleBody / wordCount 使用）。 */
export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*\|.*\|\s*$/gm, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    // 2026-10-23：剥除裸 URL 结尾标点，避免 articleBody 里出现
    // `https://www.lollipop.im/)` 被 Google 的 URL 提取器误判为坏链。
    .replace(/https?:\/\/[A-Za-z0-9\-._~:/?#\[\]@!$&'()*+,;=%]+/g, (u) => u.replace(/[.,;:!?)\]】）]+$/, ""))
    .replace(/\s+/g, " ")
    .trim();
}
