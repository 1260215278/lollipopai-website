/** 把 /guides 的 9 篇指南一次性迁入 /blog 数据层 —— ⚠️ 已于 2026-09-01 执行完毕
 *
 * 【当前状态：已完成，不可重跑】
 *   依赖的 src/app/data/guides{Content,Faq}.ts 与 src/app/pages/Guide{,sList}Page.tsx
 *   均已在迁移后删除，再跑会在 ssrLoadModule 处直接抛错。
 *   本文件保留仅作为「如何做内容合并」的参考实现：
 *     - 用 ssrLoadModule 读 TS 数据（比正则解析模板字面量可靠得多）
 *     - 正文内链必须同步改写（/guides/<slug> → /blog/<slug>）
 *     - 项目数据文件是 CRLF 行尾，写回前必须统一 EOL
 *
 * 为什么用 vite 的 ssrLoadModule 而不是正则解析 .ts：
 *   正文是模板字面量里的多行 Markdown，含反引号、${}、转义符，
 *   正则解析极易出错。让 vite 直接把模块当 ESM 加载，拿到的是干净的 JS 对象。
 *
 * 做了四件事：
 *   1. 读 guides 元数据 + 正文 + FAQ
 *   2. 正文里的 /guides/<slug> 内链改写为 /blog/<slug>（否则迁移后全是死链）
 *   3. 生成 TS 代码片段，追加进 blog.ts / blogContent.ts / blogFaq.ts
 *   4. 打印校验信息
 *
 * ⚠️ 幂等：脚本会检测目标 slug 是否已存在，已存在则跳过，可重复运行。
 *
 * 用法：node scripts/merge-guides-into-blog.mjs [--dry-run]
 */
import { createServer } from "vite";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DRY = process.argv.includes("--dry-run");

/** 转义为安全的模板字面量内容：\ ` ${ 三种字符必须处理，顺序不能调换 */
const tpl = (s) =>
  "`" +
  String(s)
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${") +
  "`";

/** 双引号单行字符串（元数据字段用，内容里无换行） */
const dq = (s) => JSON.stringify(String(s));

/**
 * ⚠️ 本项目数据文件是 CRLF 行尾（blog.ts 399 个 CRLF / blogContent.ts 6808 个）。
 * 而 ECMAScript 规定模板字面量里的行终止符序列会被规范化为 LF —— 也就是说
 * 从 guidesContent.ts 读到的正文，换行天然是 \n，与源文件行尾无关。
 * 若直接把 LF 内容写进 CRLF 文件，会产出混合行尾的文件（diff 噪声大、部分工具报警）。
 * 因此统一按目标文件的行尾风格回写。
 */
const detectEOL = (src) => (src.includes("\r\n") ? "\r\n" : "\n");
const toEOL = (s, eol) => (eol === "\r\n" ? String(s).replace(/\r?\n/g, "\r\n") : String(s));

const server = await createServer({
  root: ROOT,
  logLevel: "error",
  server: { middlewareMode: true, hmr: false },
});

let guidesMod;
let faqMod;
try {
  guidesMod = await server.ssrLoadModule("/src/app/data/guidesContent.ts", { timeout: 180_000 });
  faqMod = await server.ssrLoadModule("/src/app/data/guidesFaq.ts", { timeout: 180_000 });
} finally {
  await server.close();
}

const guides = guidesMod.allGuides;
const guidesFaq = faqMod.guidesFaq;
console.log(`[merge] 读到 ${guides.length} 篇指南，${Object.keys(guidesFaq).length} 组 FAQ`);

/** 把正文里的 /guides/... 内链改写成 /blog/...，否则迁移后全是死链 */
function rewriteGuideLinks(s) {
  return String(s)
    .replace(/\/guides\/([a-z0-9-]+)/g, "/blog/$1")
    .replace(/\/guides(?!\/)/g, "/blog");
}

// ── 1. blog.ts：追加 9 条 BlogMeta ─────────────────────────────────────────
function buildMetaEntries() {
  return guides
    .map((g) => {
      const lines = [
        "  {",
        `    slug: ${dq(g.slug)},`,
        `    title: ${tpl(g.title)},`,
        `    titleZh: ${tpl(g.titleZh)},`,
        `    excerpt: ${tpl(g.excerpt)},`,
        `    excerptZh: ${tpl(g.excerptZh)},`,
        `    seoTitle: ${tpl(g.seoTitle)},`,
        `    seoDescription: ${tpl(g.seoDescription)},`,
        `    category: ${dq(g.category)},`,
        `    categoryLabel: ${dq(g.categoryLabel)},`,
        `    author: ${dq(g.author)},`,
        `    authorRole: ${dq(g.authorRole)},`,
        `    publishDate: ${dq(g.publishDate)},`,
        `    updateDate: ${dq(g.updateDate)},`,
        `    coverImage: ${dq(g.coverImage)},`,
        `    stepCount: ${g.steps.length},`,
        `    totalTime: ${dq(g.totalTime)},`,
        `    difficulty: ${dq(g.difficulty)},`,
        "  },",
      ];
      return lines.join("\n");
    })
    .join("\n");
}

// ── 2. blogContent.ts：追加 9 条正文 + 步骤 ─────────────────────────────────
function buildBodyEntries() {
  return guides
    .map((g) => {
      const stepsEn = g.steps
        .map((s) => `      { name: ${dq(s.name)}, text: ${dq(s.text)} },`)
        .join("\n");
      const stepsZh = g.stepsZh
        .map((s) => `      { name: ${dq(s.name)}, text: ${dq(s.text)} },`)
        .join("\n");
      return [
        `  ${dq(g.slug)}: {`,
        `    content: ${tpl(rewriteGuideLinks(g.content))},`,
        `    contentZh: ${tpl(rewriteGuideLinks(g.contentZh))},`,
        `    steps: [\n${stepsEn}\n    ],`,
        `    stepsZh: [\n${stepsZh}\n    ],`,
        `    totalTime: ${dq(g.totalTime)},`,
        `    difficulty: ${dq(g.difficulty)},`,
        "  },",
      ].join("\n");
    })
    .join("\n");
}

// ── 3. blogFaq.ts：追加 9 组 FAQ ───────────────────────────────────────────
function buildFaqEntries() {
  return guides
    .map((g) => {
      const items = guidesFaq[g.slug] ?? [];
      if (!items.length) return "";
      const body = items
        .map((f) =>
          [
            "    {",
            `      question: ${dq(f.question)},`,
            `      answer: ${dq(f.answer)},`,
            `      questionEn: ${dq(f.questionEn)},`,
            `      answerEn: ${dq(f.answerEn)},`,
            "    },",
          ].join("\n"),
        )
        .join("\n");
      return `  ${dq(g.slug)}: [\n${body}\n  ],`;
    })
    .filter(Boolean)
    .join("\n");
}

const META_ANCHOR_LF = "\n];\n\n/** 通过 slug 查找";
const BODY_ANCHOR_LF = "\n};\n\n/** 合并元数据 + 正文";
const FAQ_TAIL_LF = "\n};\n";

async function insertBeforeLast(file, anchorLF, blockLF, label) {
  const p = path.join(ROOT, file);
  const src = await readFile(p, "utf8");
  const eol = detectEOL(src);
  const anchor = toEOL(anchorLF, eol);
  const idx = src.lastIndexOf(anchor);
  if (idx === -1) throw new Error(`[merge] ${file} 找不到锚点：${JSON.stringify(anchor)}`);

  // 幂等：已插入过就跳过
  const firstSlug = guides[0].slug;
  if (src.includes(firstSlug)) {
    console.log(`[merge] ${label}：已存在 ${firstSlug}，跳过`);
    return false;
  }

  const block = toEOL(blockLF, eol);
  const out = src.slice(0, idx) + eol + block + eol + src.slice(idx);
  if (!DRY) await writeFile(p, out, "utf8");
  console.log(`[merge] ${label}：${src.length} → ${out.length} 字节（+${out.length - src.length}），EOL=${eol === "\r\n" ? "CRLF" : "LF"}`);
  return true;
}

const metaBlock =
  "\n  // ─────────────────────────────────────────────────────────────\n" +
  "  // 由 /guides 迁入的操作型指南（2026-09-01 合并，/guides 路由已删除）\n" +
  "  // category 保留 workflow / production / distribution 细分，\n" +
  "  // 列表页统一归入「操作指南」筛选，卡片上仍显示细分标签。\n" +
  "  // ─────────────────────────────────────────────────────────────\n" +
  buildMetaEntries();

const bodyBlock =
  "\n  // ── 由 /guides 迁入的 9 篇操作型指南正文 + HowTo 步骤 ──\n" +
  buildBodyEntries();

const faqBlock = "\n  // ── 由 /guides 迁入的 9 组 FAQ ──\n" + buildFaqEntries();

if (DRY) console.log("[merge] DRY RUN —— 不写文件\n");

await insertBeforeLast("src/app/data/blog.ts", META_ANCHOR_LF, metaBlock, "blog.ts 元数据");
await insertBeforeLast("src/app/data/blogContent.ts", BODY_ANCHOR_LF, bodyBlock, "blogContent.ts 正文");

// blogFaq.ts 结构不同：末尾是 "};"，直接在最后一个 } 前插入
{
  const p = path.join(ROOT, "src/app/data/blogFaq.ts");
  const src = await readFile(p, "utf8");
  if (src.includes(guides[0].slug)) {
    console.log(`[merge] blogFaq.ts：已存在 ${guides[0].slug}，跳过`);
  } else {
    const eol = detectEOL(src);
    const tail = toEOL(FAQ_TAIL_LF, eol);
    const idx = src.lastIndexOf(tail);
    if (idx === -1) throw new Error("[merge] blogFaq.ts 找不到结尾 `};`");
    const out = src.slice(0, idx) + toEOL(faqBlock, eol) + src.slice(idx);
    if (!DRY) await writeFile(p, out, "utf8");
    console.log(`[merge] blogFaq.ts FAQ：${src.length} → ${out.length} 字节（+${out.length - src.length}）`);
  }
}

// ── 4. 校验：统计正文里被改写的 /guides 链接数 ─────────────────────────────
let rewritten = 0;
for (const g of guides) {
  const before = (g.content.match(/\/guides/g) ?? []).length + (g.contentZh.match(/\/guides/g) ?? []).length;
  rewritten += before;
}
console.log(`[merge] 正文内链改写：/guides → /blog 共 ${rewritten} 处`);
console.log("[merge] 完成。下一步：手动删除 /guides 路由与页面组件。");
