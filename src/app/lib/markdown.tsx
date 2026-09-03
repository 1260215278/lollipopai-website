/**
 * 共享 Markdown 渲染器（零第三方依赖）
 *
 * 原先内联在 BlogPostPage 中，因博客知识区（原 /guides，2026-09-01 已并入 /blog）
 * 需要同样的渲染能力而抽出，避免两套实现漂移。支持：标题 / 加粗 / 斜体 /
 * 行内代码 / 链接 / 引用 / 有序无序列表 / 表格 / 分隔线。
 */
import type { ReactNode } from "react";

/** 行内元素渲染：**加粗** *斜体* `代码` [链接](url) */
export function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
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
      nodes.push(
        <a key={key++} href={m[6]} target="_blank" rel="noopener noreferrer" className="text-[#FF4D00] hover:underline">
          {m[5]}
        </a>,
      );
    }
    last = regex.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
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
    .replace(/\s+/g, " ")
    .trim();
}
