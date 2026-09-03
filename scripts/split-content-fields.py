#!/usr/bin/env python3
"""
把内容型数据数组的「重正文字段」拆到独立模块 —— 解决列表页首屏被整包正文拖慢的问题。

背景
----
`src/app/data/<区>.ts` 是**全量静态导入**，不随路由懒加载切分。正文（Markdown 长文）
通常占 85%~90% 体积，而列表页/聚合页只需要元数据。拆开后：

  - 列表页 chunk：只含元数据（百 KB 级 → 十 KB 级）
  - 详情页 chunk：同步引入元数据 + 正文（正文从共享 chunk 挪进详情页自己的 chunk，
    净开销基本不变）

⚠️ 详情页必须**同步**引入正文，不要用动态 import：
   `src/main.tsx` 用的是 `createRoot`（不是 `hydrateRoot`），客户端挂载会清空重建 DOM，
   异步加载正文会让直接落地的用户看到「预渲染正文 → 空白 → 正文」闪屏，
   而详情页正是 GEO 落地方。

用法
----
    python scripts/split-content-fields.py \
        --src src/app/data/blog.ts \
        --array blogPosts --iface BlogPost \
        --fields content,contentZh \
        --out src/app/data/blogContent.ts \
        --meta-name blogMeta --meta-type BlogMeta \
        --content-name blogContent --body-type BlogBody \
        --getter getFullPost --all allBlogPosts

（guides 那次用的同一套参数，只是名字不同。）

拆分后**必须**手工处理（脚本不代劳）：
  1. 列表页/聚合页改导入 `<meta-name>`，且**绝不** import 生成的文件
  2. 详情页改导入 `<getter>`
  3. `scripts/prerender-plugin.ts` 改导入 `<all>`（预渲染需要全量正文）
  4. 列表页代码里若读了被拆走的字段（如 `post.content.length`），必须改掉
"""

import argparse
import pathlib
import re
import sys


def scan_value(s: str, i: int) -> int:
    """给定值的起始下标，返回值的结束下标（不含）。

    支持 `` `模板串` `` / `` "双引" `` / `` '单引' `` / `` [ 数组 ] ``，
    正确处理反斜杠转义与数组内嵌套（数组里常混着模板串）。
    """
    c = s[i]
    if c == "`":
        j = i + 1
        while j < len(s):
            if s[j] == "\\":
                j += 2
                continue
            if s[j] == "`":
                return j + 1
            j += 1
        raise ValueError(f"未闭合的反引号 @ {i}")
    if c in "\"'":
        q = c
        j = i + 1
        while j < len(s):
            if s[j] == "\\":
                j += 2
                continue
            if s[j] == q:
                return j + 1
            j += 1
        raise ValueError(f"未闭合的引号 @ {i}")
    if c == "[":
        depth = 0
        j = i
        while j < len(s):
            ch = s[j]
            if ch in "`\"'":
                j = scan_value(s, j)
                continue
            if ch == "[":
                depth += 1
            elif ch == "]":
                depth -= 1
                if depth == 0:
                    return j + 1
            j += 1
        raise ValueError(f"未闭合的方括号 @ {i}")
    raise ValueError(f"无法识别的值起始字符 {c!r} @ {i}")


def iter_toplevel_keys(s: str, start: int, end: int):
    """遍历对象字面量的顶层键，yield (key, span_start, value_end)。

    逐个 key 走 scan_value 跳过整个值 —— 这样值内部的换行（含 Markdown 代码块里
    长得像 key 的行）不会被误判成顶层字段。这是不能用朴素正则的原因。
    """
    i = start + 1  # 跳过 '{'
    depth = 1
    while i < end:
        ch = s[i]
        if ch in "`\"'":
            i = scan_value(s, i)
            continue
        if ch in "[{":
            depth += 1
        elif ch in "]}":
            depth -= 1
            if depth == 0:
                return
        elif depth == 1 and ch not in " \t\r\n,":
            m = re.match(r"([A-Za-z_$][\w$]*)\s*:", s[i:])
            if m:
                vstart = i + m.end()
                while vstart < end and s[vstart] in " \t\r\n":
                    vstart += 1
                vend = scan_value(s, vstart)
                yield m.group(1), i, vend
                i = vend
                continue
        i += 1


def split_elements(s: str, arr_start: int):
    """把 `[ ... ]` 切成顶层元素，返回 [( '{' 下标, '}' 下标 )]。"""
    elems = []
    i = arr_start + 1
    n = len(s)
    while True:
        while i < n and s[i] in " \t\r\n,":
            i += 1
        if i >= n or s[i] == "]":
            break
        if s[i] != "{":
            raise ValueError(f"数组元素不是对象字面量 @ {i}: {s[i:i+40]!r}")
        depth = 0
        j = i
        while j < n:
            ch = s[j]
            if ch in "`\"'":
                j = scan_value(s, j)
                continue
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    break
            j += 1
        elems.append((i, j))
        i = j + 1
    return elems


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True)
    ap.add_argument("--array", required=True, help="原数组常量名，如 blogPosts")
    ap.add_argument("--iface", required=True, help="接口名，如 BlogPost")
    ap.add_argument("--fields", required=True, help="要拆走的正文字段，逗号分隔")
    ap.add_argument("--out", required=True, help="生成的正文模块路径")
    ap.add_argument("--meta-name", required=True, help="拆分后的元数据数组名")
    ap.add_argument("--meta-type", required=True, help="拆分后的元数据类型名")
    ap.add_argument("--content-name", required=True, help="生成的正文映射名")
    ap.add_argument("--body-type", required=True, help="生成的正文字段类型名")
    ap.add_argument("--getter", required=True, help="合并函数（元数据 + 正文）名")
    ap.add_argument("--all", required=True, help="全量数组名（供 prerender 用）")
    a = ap.parse_args()

    fields = [f.strip() for f in a.fields.split(",") if f.strip()]
    src_path = pathlib.Path(a.src)
    s = src_path.read_text(encoding="utf-8")

    m = re.search(
        rf"export const {re.escape(a.array)}:\s*{re.escape(a.iface)}\[\]\s*=\s*\[", s
    )
    if not m:
        print(f"找不到 `export const {a.array}: {a.iface}[] = [`", file=sys.stderr)
        return 2
    arr_start = m.end() - 1

    elems = split_elements(s, arr_start)
    print(f"数组元素 {len(elems)} 个")

    entries = []      # [(slug, {field: value_text})]
    deletions = []    # [(start, end)] 待从源文件删除的区间

    for estart, eend in elems:
        slug = None
        found = {}
        for key, kstart, vend in iter_toplevel_keys(s, estart, eend):
            vstart = kstart + (s[kstart:vend].index(":") + 1)
            while s[vstart] in " \t\r\n":
                vstart += 1
            value = s[vstart:vend]
            if key == "slug":
                mm = re.match(r'"([^"]+)"', value)
                if mm:
                    slug = mm.group(1)
            if key in fields:
                found[key] = value
                # 删除区间：**整行**（从 key 所在行的行首，到值结束后的换行）。
                # ⚠️ 必须从行首开始：只删到 key 起点会留下该行的缩进，
                #    让下一个 `}` 的缩进多出 4 格（2026-09-01 踩过）。
                line_start = s.rfind("\n", 0, kstart) + 1
                e = vend
                while e < len(s) and s[e] in " \t":
                    e += 1
                if e < len(s) and s[e] == ",":
                    e += 1
                while e < len(s) and s[e] in " \t":
                    e += 1
                if e < len(s) and s[e] == "\r":
                    e += 1
                if e < len(s) and s[e] == "\n":
                    e += 1
                deletions.append((line_start, e))
        if slug is None:
            print(f"元素缺少 slug @ {estart}", file=sys.stderr)
            return 2
        missing = [f for f in fields if f not in found]
        if missing:
            print(f"{slug} 缺少字段 {missing}", file=sys.stderr)
            return 2
        entries.append((slug, found))

    # 倒序删除，避免下标偏移
    new_src = s
    for start, end in sorted(deletions, reverse=True):
        new_src = new_src[:start] + new_src[end:]
    # 清掉因删除而产生的尾随逗号（对象字面量里 `,\n  }` → `\n  }`）
    new_src, n_comma = re.subn(r",(\s*\n\s*)\}", r"\1}", new_src)

    # 元数据数组重命名 + 插入元数据类型
    new_src = new_src.replace(
        f"export const {a.array}: {a.iface}[] = [",
        f"export type {a.meta_type} = Omit<{a.iface}, "
        + " | ".join(f'"{f}"' for f in fields)
        + ">;\n\n"
        + f"export const {a.meta_name}: {a.meta_type}[] = [",
        1,
    )

    # 生成正文模块
    src_name = src_path.stem
    parts = [
        "/**\n"
        f" * {a.iface} 正文 —— 从 {src_name}.ts 拆出（由 scripts/split-content-fields.py 生成）。\n"
        " *\n"
        f" * {src_name}.ts 的 `{a.array}` 里，正文占绝大部分体积，而列表页只需要元数据。\n"
        " * 拆开后列表页 chunk 大幅缩小，详情页同步引入两者（净开销不变）。\n"
        " *\n"
        f" * ⚠️ 硬约束：本文件只能被两处导入 ——\n"
        f" *   ① 详情页（用 `{a.getter}()` 取元数据 + 正文）\n"
        f" *   ② scripts/prerender-plugin.ts（用 `{a.all}` 渲染静态 HTML 与 llms 文件）\n"
        " * 若在列表页/聚合页导入，全部正文会被重新拉回 bundle，拆分立刻失效。\n"
        " */\n\n"
        f'import {{ {a.meta_name}, type {a.iface} }} from "./{src_name}";\n\n'
        f"export type {a.body_type} = Pick<{a.iface}, "
        + " | ".join(f'"{f}"' for f in fields)
        + ">;\n\n"
        f"export const {a.content_name}: Record<string, {a.body_type}> = {{\n"
    ]
    for slug, found in entries:
        parts.append(f'  "{slug}": {{\n')
        for f in fields:
            parts.append(f"    {f}: {found[f]},\n")
        parts.append("  },\n")
    parts.append("};\n\n")
    parts.append(
        f"/** 合并元数据 + 正文，得到完整的 {a.iface} */\n"
        f"export function {a.getter}(slug: string): {a.iface} | undefined {{\n"
        f"  const meta = {a.meta_name}.find((m) => m.slug === slug);\n"
        f"  const body = {a.content_name}[slug];\n"
        "  if (!meta || !body) return undefined;\n"
        "  return { ...meta, ...body };\n"
        "}\n\n"
        f"/** 全量（含正文）—— 预渲染用；客户端请勿导入 */\n"
        f"export const {a.all}: {a.iface}[] = {a.meta_name}\n"
        f"  .map((m) => {a.getter}(m.slug))\n"
        f"  .filter((p): p is {a.iface} => Boolean(p));\n"
    )
    out_path = pathlib.Path(a.out)
    out_path.write_text("".join(parts), encoding="utf-8")
    src_path.write_text(new_src, encoding="utf-8")

    print(f"拆分字段：{', '.join(fields)}")
    print(f"条目数：{len(entries)}")
    print(f"清理尾随逗号：{n_comma} 处")
    print(f"{a.src}: {len(s)} -> {len(new_src)} 字符")
    print(f"{a.out}: {out_path.stat().st_size} 字节")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
