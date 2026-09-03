# -*- coding: utf-8 -*-
"""构建后终检：/blog/ 全链路（2026-09-01 /guides 迁入后取代 verify-guides.py）

覆盖 9 组：
  1. HTML 文件生成（30 篇 + /blog 列表页）
  2. SSR 正文正确性（渲染出的 <h1> 必须与数据层标题逐字一致）
  3. /blog 列表页 Schema（CollectionPage + ItemList + BreadcrumbList）
  4. llms.txt / llms-full.txt 收录
  5. sitemap 收录 + hreflang 声明
  11. hreflang / sitemap 声明的 URL 必须能解析到实际产物（防「声明了但没生成」）
  6. HowTo schema ↔ 页面可见步骤一致性（GEO 硬要求，仅 9 篇迁入指南）
  7. dist 零 /guides 残留 + Caddyfile 301 覆盖 + 源码零旧路由
  8. 旧定位文案残留扫描
  9. 全站通用回归（两份路由表一致 + 无页面被兜底成首页）

⚠️ 数据全部从 src/app/data/blog.ts 反查，新增文章无需改动本脚本。
"""
import json
import re
import sys
from html import unescape
from pathlib import Path

DIST = Path(r"C:\Users\Administrator\Documents\lollipop\dist")
SRC = Path(r"C:\Users\Administrator\Documents\lollipop\src")

# ── 从 BlogListPage.tsx 反查每页篇数，避免校验脚本与实现脱节 ──────────────────
_blist = (SRC / "app" / "pages" / "BlogListPage.tsx").read_text(encoding="utf-8")
_m = re.search(r"const POSTS_PER_PAGE = (\d+);", _blist)
POSTS_PER_PAGE = int(_m.group(1)) if _m else 10

# ── 从 blog.ts 反查：slug / title / category / stepCount ─────────────────────
# 按 slug 切块，避免「stepCount 只有部分文章有」导致按序配对错位。
_src = (SRC / "app" / "data" / "blog.ts").read_text(encoding="utf-8")
_slug_pos = [(m.group(1), m.start()) for m in re.finditer(r'^\s*slug: "([a-z0-9-]+)",', _src, re.M)]

POSTS: list[dict] = []
for i, (slug, start) in enumerate(_slug_pos):
    end = _slug_pos[i + 1][1] if i + 1 < len(_slug_pos) else len(_src)
    chunk = _src[start:end]

    def field(name: str, default=None):
        m = re.search(rf'^\s*{name}: "([^"]*)",', chunk, re.M) or re.search(
            rf"^\s*{name}: `((?:[^`\\]|\\.)*)`,", chunk, re.M
        )
        return m.group(1) if m else default

    m = re.search(r"^\s*stepCount: (\d+),", chunk, re.M)
    POSTS.append(
        {
            "slug": slug,
            "title": field("title", ""),
            "category": field("category", ""),
            # titleZh 存在 = 该文章进入多语言预渲染子集（见 multilangSubset.ts）
            "titleZh": field("titleZh", ""),
            "stepCount": int(m.group(1)) if m else 0,
        }
    )

if not POSTS:
    sys.exit("[FATAL] 从 blog.ts 反查不到任何文章，检查正则是否失效")

# 带步骤的文章 = 需要输出 HowTo 的（GEO 资产）
HOWTO_POSTS = [p for p in POSTS if p["stepCount"] > 0]
# 其中真正「由 /guides 迁入」的 9 篇 —— category 是 workflow/production/distribution。
# ⚠️ 不能用「有 stepCount」判定迁入：2026-09-01 又给 3 篇原生 guide 文章补了真实步骤，
#    它们从未在 /guides 下存在过，不需要 301。
MIGRATED_POSTS = [p for p in HOWTO_POSTS if p["category"] != "guide"]

# ── 工具函数 ────────────────────────────────────────────────────────────────
fails: list[str] = []
passes = 0


def check(cond: bool, msg: str) -> None:
    global passes
    print(f"  {'PASS' if cond else 'FAIL'}  {msg}")
    if cond:
        passes += 1
    else:
        fails.append(msg)


def jsonld_blocks(html: str) -> list[dict]:
    out = []
    # ⚠️ script 标签带 id 属性（id="site-schema" / "page-schema"），正则必须允许
    for m in re.finditer(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', html, re.S):
        try:
            out.append(json.loads(m.group(1)))
        except json.JSONDecodeError:
            pass
    return out


def count_types(node, target: str) -> int:
    total = 0
    if isinstance(node, dict):
        t = node.get("@type")
        if t == target or (isinstance(t, list) and target in t):
            total += 1
        for v in node.values():
            total += count_types(v, target)
    elif isinstance(node, list):
        for v in node:
            total += count_types(v, target)
    return total


def find_node(blocks, target: str):
    def walk(node):
        if isinstance(node, dict):
            t = node.get("@type")
            if t == target or (isinstance(t, list) and target in t):
                return node
            for v in node.values():
                r = walk(v)
                if r is not None:
                    return r
        elif isinstance(node, list):
            for v in node:
                r = walk(v)
                if r is not None:
                    return r
        return None

    return walk(blocks)


def graph_types(blocks) -> set:
    types: set = set()

    def walk(node):
        if isinstance(node, dict):
            t = node.get("@type")
            if isinstance(t, str):
                types.add(t)
            elif isinstance(t, list):
                types.update(t)
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)

    walk(blocks)
    return types


def body_text(path: Path) -> str:
    html = path.read_text(encoding="utf-8")
    m = re.search(r'<div id="root">(.*)</div>\s*<script', html, re.S)
    return m.group(1) if m else ""


def h1_text(html: str) -> str:
    """取渲染后的首个 <h1> 纯文本。SSR 兜底成首页时这里会变成首页标题。"""
    m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S)
    if not m:
        return ""
    return unescape(re.sub(r"<[^>]+>", "", m.group(1))).strip()


def norm(s: str) -> str:
    """归一化：去掉所有非字母数字字符 + 小写。

    ⚠️ 不能直接把标点替换成空格再比对 —— 标题里的连字符（Post-Production /
    Short-Form）在 HTML 中原样保留，替换成空格后必然匹配不上。
    """
    return re.sub(r"[^0-9a-z]", "", unescape(s).lower())


# ══ 1. HTML 文件生成 ════════════════════════════════════════════════════════
print("=" * 70)
print(f"1. HTML 文件生成（blog.ts 反查 {len(POSTS)} 篇，其中 {len(HOWTO_POSTS)} 篇带步骤）")
print("=" * 70)
hub = DIST / "blog" / "index.html"
check(hub.exists(), "dist/blog/index.html 存在")
missing = [p["slug"] for p in POSTS if not (DIST / "blog" / p["slug"] / "index.html").exists()]
check(not missing, f"全部 {len(POSTS)} 篇详情页存在" + (f"（缺：{missing}）" if missing else ""))

# ══ 2. SSR 正文正确性 ════════════════════════════════════════════════════════
print()
print("=" * 70)
print("2. SSR 正文正确性（防 entry-server 兜底渲染成首页）")
print("=" * 70)
hub_body = body_text(hub) if hub.exists() else ""

# 列表页已分页（BlogListPage 的 POSTS_PER_PAGE，当前 20），第 1 页只渲染前 N 篇。
# 分页是客户端状态，不产生可爬 URL，所以：
#   - 第 1 页内链：校验数量 == min(POSTS_PER_PAGE, 总篇数)
#   - 全量可发现性：改由 sitemap + JSON-LD ItemList 校验（见下方两项）
HUB_HTML = hub.read_text(encoding="utf-8") if hub.exists() else ""
page1_links = sorted(set(re.findall(r'href="/blog/([a-z0-9-]+)"', hub_body)))
expected_page1 = min(POSTS_PER_PAGE, len(POSTS))
check(
    len(page1_links) == expected_page1,
    f"列表页第 1 页内链 {len(page1_links)} 条（期望 {expected_page1}）",
)
for slug in page1_links:
    check(f'/blog/{slug}' in hub_body, f'列表页第 1 页含 {slug} 链接')

# 兜底：JSON-LD ItemList 必须列出全部文章，保证第 1 页之外的文章同样可被发现
itemlist_urls = set(re.findall(r'"url":\s*"[^"]*/blog/([a-z0-9-]+)"', HUB_HTML))
missing_in_itemlist = [p["slug"] for p in POSTS if p["slug"] not in itemlist_urls]
check(
    not missing_in_itemlist,
    f"JSON-LD ItemList 覆盖全部 {len(POSTS)} 篇"
    + (f"（缺：{missing_in_itemlist}）" if missing_in_itemlist else ""),
)
# 兜底：sitemap 必须收录全部文章页
sitemap_path = DIST / "sitemap.xml"
sitemap_text = sitemap_path.read_text(encoding="utf-8") if sitemap_path.exists() else ""
missing_in_sitemap = [p["slug"] for p in POSTS if f"/blog/{p['slug']}" not in sitemap_text]
check(
    not missing_in_sitemap,
    f"sitemap 收录全部 {len(POSTS)} 篇"
    + (f"（缺：{missing_in_sitemap}）" if missing_in_sitemap else ""),
)

home_h1 = norm(h1_text((DIST / "index.html").read_text(encoding="utf-8"))) if (DIST / "index.html").exists() else ""
for p in POSTS:
    path = DIST / "blog" / p["slug"] / "index.html"
    if not path.exists():
        continue
    html = path.read_text(encoding="utf-8")
    body = body_text(path)
    print(f'\n-- {p["slug"]} --')
    check(len(body) > 20000, f"正文长度 {len(body)} > 20000")
    # SSR 正确性判据：渲染出的 <h1> 必须与 blog.ts 的英文标题逐字一致
    h1 = h1_text(html)
    check(bool(h1), f"存在 <h1>（{h1[:60]}）")
    check(
        norm(h1) == norm(p["title"]),
        f"h1 与数据层标题一致"
        + ("" if norm(h1) == norm(p["title"]) else f"\n         h1={h1!r}\n         title={p['title']!r}"),
    )
    check(norm(h1) != home_h1, "未被 * 兜底渲染成首页（h1 ≠ 首页 h1）")

# ══ 3. 列表页 Schema ════════════════════════════════════════════════════════
print()
print("=" * 70)
print("3. /blog 列表页 Schema")
print("=" * 70)
if hub.exists():
    blocks = jsonld_blocks(hub.read_text(encoding="utf-8"))
    types = graph_types(blocks)
    check("CollectionPage" in types, "schema 含 CollectionPage")
    check("ItemList" in types, "schema 含 ItemList")
    check("BreadcrumbList" in types, "schema 含 BreadcrumbList")
    n = find_node(blocks, "ItemList")
    check(
        bool(n) and n.get("numberOfItems") == len(POSTS),
        f"ItemList numberOfItems == {len(POSTS)}（实际 {n.get('numberOfItems') if n else None}）",
    )

# ══ 4. llms 收录 ════════════════════════════════════════════════════════════
print()
print("=" * 70)
print("4. llms.txt / llms-full.txt 收录")
print("=" * 70)
llms = (DIST / "llms.txt").read_text(encoding="utf-8")
llms_full = (DIST / "llms-full.txt").read_text(encoding="utf-8")
check("/guides" not in llms and "/guides" not in llms_full, "llms 文件零 /guides 残留")
for p in POSTS:
    check(f'/blog/{p["slug"]}' in llms, f'llms.txt 收录 {p["slug"]}')
    check(f'- URL: https://www.lollipop.im/lollipop/blog/{p["slug"]}' in llms_full, f"llms-full 收录 {p['slug']}")
print(f"  INFO  llms.txt {len(llms)} chars / llms-full.txt {len(llms_full)} chars")
print(f"  INFO  llms-full 步骤首行 {llms_full.count('  1. ')} 篇")

# ══ 5. sitemap 收录 ═════════════════════════════════════════════════════════
print()
print("=" * 70)
print("5. sitemap 收录 + hreflang 声明")
print("=" * 70)
sitemap = (DIST / "sitemap.xml").read_text(encoding="utf-8")
print(f"  INFO  sitemap URL 总数 {sitemap.count('<url>')}")
check(not re.search(r"<loc>[^<]*/guides", sitemap), "sitemap 零 /guides 条目")
for p in POSTS:
    s = p["slug"]
    check(f"<loc>https://www.lollipop.im/lollipop/blog/{s}</loc>" in sitemap, f"sitemap 含 /blog/{s}")
    # ⚠️ 2026-09-01 止血后只声明 en + x-default。
    #    原先这里检查 zh-CN / ar —— 那两族 URL 在 dist 里根本没有产物，
    #    「sitemap 里写了」恰恰是当时的问题本身，不是验收标准。
    #    真正的验收在第 11 组：所有声明的 hreflang URL 必须能解析到实际产物。
    check(f'hreflang="en" href="https://www.lollipop.im/lollipop/blog/{s}"' in sitemap, f"{s} 含 en hreflang")
    check(f'hreflang="x-default" href="https://www.lollipop.im/lollipop/blog/{s}"' in sitemap, f"{s} 含 x-default")

# ══ 6. HowTo schema ↔ 可见步骤一致 ═══════════════════════════════════════════
print()
print("=" * 70)
print(f"6. HowTo schema ↔ 页面可见步骤一致性（{len(HOWTO_POSTS)} 篇操作型指南）")
print("=" * 70)
for p in HOWTO_POSTS:
    path = DIST / "blog" / p["slug"] / "index.html"
    if not path.exists():
        continue
    html = path.read_text(encoding="utf-8")
    blocks = jsonld_blocks(html)
    types = graph_types(blocks)
    howto = find_node(blocks, "HowTo")
    schema_steps = len(howto.get("step", [])) if howto else 0
    visible = len(re.findall(r'id="step-\d+"', html))
    print(f'\n-- {p["slug"]} --')
    check("HowTo" in types, "schema 含 HowTo")
    check("TechArticle" in types, "schema 含 TechArticle")
    check("FAQPage" in types, "schema 含 FAQPage")
    check(
        schema_steps == visible == p["stepCount"],
        f"步骤数三方一致：schema={schema_steps} 可见={visible} 数据层={p['stepCount']}",
    )
    check(bool(howto and howto.get("totalTime")), "HowTo 含 totalTime")

# 6b. 反向检查：没有步骤的文章不得含 HowTo。
#     2026-09-01 前，所有 category === "guide" 的文章都会套一份 i18n 通用步骤模板，
#     步骤在页面上完全不可见，违反 Google 结构化数据规范。此检查防止该行为复活。
print()
print("=" * 70)
print(f"6b. 无步骤文章不得含 HowTo（{len(POSTS) - len(HOWTO_POSTS)} 篇）")
print("=" * 70)
for p in POSTS:
    if p["stepCount"] > 0:
        continue
    path = DIST / "blog" / p["slug"] / "index.html"
    if not path.exists():
        continue
    types = graph_types(jsonld_blocks(path.read_text(encoding="utf-8")))
    check("HowTo" not in types, f'{p["slug"]} 无 HowTo（category={p["category"]}）')
    check("TechArticle" not in types, f'{p["slug"]} 无 TechArticle（应为 Article）')

# ══ 7. dist /guides 残留 ════════════════════════════════════════════════════
print()
print("=" * 70)
print("7. dist 零 /guides 残留")
print("=" * 70)
residual = []
for f in DIST.rglob("*.html"):
    try:
        if "/guides" in f.read_text(encoding="utf-8"):
            residual.append(str(f.relative_to(DIST)))
    except Exception:
        continue
check(not residual, f"dist HTML 零 /guides 残留" + (f"（{residual[:5]}）" if residual else ""))
check(not (DIST / "guides").exists(), "dist/guides 目录已移除")

# 7b. 旧 /guides 路径的 301 覆盖（迁出的 9 篇 slug 保持不变，必须一一对应）
caddy = Path(r"C:\Users\Administrator\Documents\lollipop\Caddyfile").read_text(encoding="utf-8")
for p in MIGRATED_POSTS:
    s = p["slug"]
    check(f"/guides/{s} /blog/{s} 301" in caddy, f"Caddyfile 301: /guides/{s} → /blog/{s}")
check("/guides* /blog 301" in caddy, "Caddyfile 有兜底 /guides* → /blog")
# 源码层不应再有任何 /guides 路由（比对 path= 而非裸字符串，避免命中说明性注释）
for f in ["src/main.tsx", "src/entry-server.tsx"]:
    t = (Path(r"C:\Users\Administrator\Documents\lollipop") / f).read_text(encoding="utf-8")
    check(not re.search(r'path="/guides', t), f"{f} 零 /guides 路由")

# ══ 8. 旧文案残留 ═══════════════════════════════════════════════════════════
print()
print("=" * 70)
print("8. dist 旧定位文案残留扫描")
print("=" * 70)
BAD = ["Lollipop AI", "AI创作者生态", "AI 创作者生态", "AI Creator Ecosystem"]
hits = 0
for f in DIST.rglob("*.html"):
    try:
        t = f.read_text(encoding="utf-8")
    except Exception:
        continue
    for b in BAD:
        if b in t:
            print(f"  FAIL  残留 {b!r} @ {f.relative_to(DIST)}")
            hits += 1
check(hits == 0, f"dist 旧文案残留 {hits} 处")

# ══ 9. 全站通用回归（原 verify-guides.py 的通用检查，2026-09-01 迁来）════════
print()
print("=" * 70)
print("9. 全站通用回归（两份路由表一致性 + 兜底污染）")
print("=" * 70)
ROOT = Path(r"C:\Users\Administrator\Documents\lollipop")
main_routes = set(re.findall(r'<Route path="([^"]+)"', (ROOT / "src" / "main.tsx").read_text(encoding="utf-8")))
ssr_routes = set(
    re.findall(r'<Route path="([^"]+)"', (ROOT / "src" / "entry-server.tsx").read_text(encoding="utf-8"))
)
# 明确不需要 SSR 预渲染的路由（受登录保护 / 动态参数 / getRouteData 未收录）
SSR_EXEMPT = {"/distribution/*", "/creator/:userId"}
missing_routes = main_routes - ssr_routes - {"*"} - SSR_EXEMPT
check(not missing_routes, "main.tsx 路由全部同步到 entry-server.tsx" + (f"（缺: {sorted(missing_routes)}）" if missing_routes else ""))

# 兜底污染：任何子页面的 <h1> 都不该与首页相同。
# ⚠️ 不能用「含首页文案 15,000+」判定 —— 该数字在若干营销页里正常出现，会误报。
polluted = [
    str(f.relative_to(DIST))
    for f in DIST.rglob("index.html")
    if f != DIST / "index.html" and norm(h1_text(f.read_text(encoding="utf-8"))) == home_h1
]
check(not polluted, f"无页面被 * 兜底污染成首页（污染: {polluted[:5]}）")

# ══ 10. i18n 动态键访问安全（2026-09-01 加）════════════════════════════════
# Footer.tsx 用 `messages.footer.links[item.key]` **动态取键**渲染网站导航。
# 静态分析查不出这类用法：写错 key 不会报 TS 错（key 是字面量联合类型，只要
# footer.links 里有同名键就合法），但少一个语言就会在那个语种渲染成空白链接。
# 所以这里直接对齐「Footer 用到的 key」×「6 个语言的 footer.links 键集合」。
print()
print("=" * 70)
print("10. Footer 动态键访问安全（websiteLinks.key ↔ 6 语言 footer.links）")
print("=" * 70)
I18N = (ROOT / "src" / "app" / "i18n.tsx").read_text(encoding="utf-8")
footer_src = (ROOT / "src" / "app" / "components" / "Footer.tsx").read_text(encoding="utf-8")

used_keys = re.findall(r'\{\s*key:\s*"([^"]+)"', footer_src)
check(bool(used_keys), f"Footer websiteLinks 取到 {len(used_keys)} 个 key")

# 6 个语言块各自的 footer.links 键集合
# （en 块缩进 4 空格、其余块缩进 8 空格，用 `    links: {` 锚定后按缩进收尾匹配）
link_blocks = re.findall(r"^([ \t]*)links: \{\n((?:[ \t]*[a-zA-Z][a-zA-Z0-9_]*: .*,\n)+)", I18N, re.M)
# 只保留 footer 下的 links（navbar 下也有 links，靠 `contact: {` … 上下文区分：
# footer.links 里含 aboutUs，navbar.links 里含 blog —— 用这个特征筛）
footer_blocks = [b for _, b in link_blocks if re.search(r"^[ \t]*aboutUs: ", b, re.M)]
check(len(footer_blocks) == 6, f"footer.links 块 {len(footer_blocks)} 个（期望 6）")

for i, blk in enumerate(footer_blocks):
    avail = set(re.findall(r"^[ \t]*([a-zA-Z][a-zA-Z0-9_]*): ", blk, re.M))
    missing = [k for k in used_keys if k not in avail]
    check(not missing, f"语言块#{i + 1} 含 Footer 全部 key" + (f"（缺: {missing}）" if missing else ""))

# 反向：Footer 里 `messages.footer.links[` 的动态访问必须仍存在，否则本组检查失去意义
check(
    re.search(r"messages\.footer\.links\[", footer_src),
    "Footer 仍用动态键访问（若改为静态访问，本组可删）",
)

# ══ 11. hreflang / sitemap 声明的 URL 必须能解析到实际产物（2026-09-01 加）══
# 事故复盘：sitemap 与页面 HTML 曾声明 6 个语言的 hreflang（476 条），
# 但预渲染只生成英文路径 —— 其中 340 条指向 /zh/… /pt/… /ar/… 等**不存在的页面**。
# Caddy `try_files … /index.html` 把它们全 fallback 到英文首页，
# 于是 hreflang 互指链断裂、整组失效，还凭空造出 340 个重复内容 URL。
#
# 根因是校验只查「标签存在」、不查「URL 能否解析」。本组补的就是后者 ——
# **凡是声明出去的 URL，dist 里必须有对应产物**。
print()
print("=" * 70)
print("11. 声明的 URL 必须能解析到实际产物（hreflang + sitemap）")
print("=" * 70)

SITE_URL = "https://www.lollipop.im/lollipop"


def dist_has(path: str) -> bool:
    """站内路径在 dist 里是否有对应产物（目录索引或 .html）。"""
    p = path.strip("/")
    if not p:
        return (DIST / "index.html").is_file()
    return (DIST / p / "index.html").is_file() or (DIST / f"{p}.html").is_file()


# 11a. sitemap 里的 <loc> 与 hreflang href
sm_bad_loc: list[str] = []
sm_bad_href: list[str] = []
hreflang_langs: set[str] = set()
for loc in re.findall(r"<loc>([^<]+)</loc>", sitemap):
    if loc.startswith(SITE_URL) and not dist_has(loc[len(SITE_URL):]):
        sm_bad_loc.append(loc)
for href in re.findall(r'<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"', sitemap):
    hreflang_langs.add(href[0])
    if href[1].startswith(SITE_URL) and not dist_has(href[1][len(SITE_URL):]):
        sm_bad_href.append(f"{href[0]} → {href[1]}")
check(not sm_bad_loc, f"sitemap 的 <loc> 全部有产物" + (f"（坏: {sm_bad_loc[:3]}）" if sm_bad_loc else ""))
check(not sm_bad_href, f"sitemap 的 hreflang 全部有产物（共 {len(hreflang_langs)} 个语言: {sorted(hreflang_langs)}）"
      + (f"（坏: {sm_bad_href[:3]}）" if sm_bad_href else ""))

# 11b. 页面 HTML 里的 hreflang
html_bad: list[str] = []
html_hreflang_total = 0
for f in DIST.rglob("*.html"):
    try:
        t = f.read_text(encoding="utf-8")
    except Exception:
        continue
    for _lang, href in re.findall(
        r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"', t
    ):
        html_hreflang_total += 1
        if href.startswith(SITE_URL) and not dist_has(href[len(SITE_URL):]):
            html_bad.append(f"{f.relative_to(DIST)}: {href}")
check(
    not html_bad,
    f"页面 HTML 的 {html_hreflang_total} 条 hreflang 全部有产物"
    + (f"（坏: {html_bad[:3]}）" if html_bad else ""),
)

# 11c. 反向：确保没有把多语言 hreflang 全删光（真接入多语言时应来改这里）
check("en" in hreflang_langs, "sitemap 仍声明 en hreflang（防止误删过头）")
check("x-default" in hreflang_langs, "sitemap 仍声明 x-default（防止误删过头）")

# ══ 12. 方案 B 多语言预渲染（28 子集 × 6 语言，2026-09-01）══════════════════
# 子集页面（首页/关于/创作/下载/联系/博客列表 + 10 genre + 12 HowTo）生成 5 个
# 语言版本（zh/zh-TW/pt/es/ar），其余页面仅英文。本组校验语言版本产物的
# lang/dir/hreflang 完整性 + 非子集内链回退（rewriteNonSubsetLinks 生效性）。
print()
print("=" * 70)
print("12. 方案 B 多语言预渲染（子集 × 6 语言）")
print("=" * 70)

LANG_SEGS = ("zh", "zh-TW", "pt", "es", "ar")
LANG_TO_HTML_LANG = {"zh": "zh-CN", "zh-TW": "zh-TW", "pt": "pt", "es": "es", "ar": "ar"}

# 期望子集规模从源码反查，避免文章增删后硬编码 28 失效：
#   6 个静态页（multilangSubset.ts 的 MULTILANG_STATIC_PATHS）
#   + 10 个 genre（genres.ts）
#   + 有 titleZh 的文章数（子集规则已放宽为「有中文标题即入子集」）
_ms_src = (SRC / "app" / "multilangSubset.ts").read_text(encoding="utf-8")
_n_static = len(re.findall(r'^\s*"(?:/[a-z]*)?",', _ms_src, re.M))
if _n_static == 0:  # 回退：直接数集合里的路径字面量
    _n_static = len(re.findall(r'"/(?:about|creating|download|contact|blog)"', _ms_src)) + 1
_g_src = (SRC / "app" / "data" / "genres.ts").read_text(encoding="utf-8")
_n_genre = len(re.findall(r'^\s*slug: "([a-z0-9-]+)",', _g_src, re.M))
_n_blog_zh = len([p for p in POSTS if p.get("titleZh")])
EXPECTED_SUBSET = _n_static + _n_genre + _n_blog_zh
print(
    f"  （期望子集 = {_n_static} 静态 + {_n_genre} genre + {_n_blog_zh} 有中文文章"
    f" = {EXPECTED_SUBSET}）"
)

# 12a. 子集清单：由 sitemap 的语言版本 <loc> 反推（语言前缀去掉 = appPath）
subset_paths: set[str] = set()
for loc in re.findall(r"<loc>([^<]+)</loc>", sitemap):
    if not loc.startswith(SITE_URL):
        continue
    u = loc[len(SITE_URL):]
    for seg in LANG_SEGS:
        if u == f"/{seg}":
            subset_paths.add("/")
            break
        if u.startswith(f"/{seg}/"):
            subset_paths.add(u[len(f"/{seg}"):])
            break
check(
    len(subset_paths) == EXPECTED_SUBSET,
    f"多语言子集共 {len(subset_paths)} 个（期望 {EXPECTED_SUBSET}）",
)

# 12b. 每个语言版本目录的产物数与 <html lang> / dir=rtl 正确性
for seg in LANG_SEGS:
    seg_dir = DIST / seg
    n_html = len(list(seg_dir.rglob("index.html"))) if seg_dir.is_dir() else 0
    check(n_html == EXPECTED_SUBSET, f"{seg}/ 语言版本产物 {n_html} 个（期望 {EXPECTED_SUBSET}）")
    bad_lang: list[str] = []
    bad_rtl: list[str] = []
    for f in seg_dir.rglob("index.html"):
        t = f.read_text(encoding="utf-8", errors="ignore")
        expect_lang = LANG_TO_HTML_LANG[seg]
        m = re.search(r'<html[^>]*lang="([^"]*)"', t)
        if not m or m.group(1) != expect_lang:
            bad_lang.append(str(f.relative_to(DIST)))
        has_rtl = 'dir="rtl"' in t
        if (seg == "ar" and not has_rtl) or (seg != "ar" and has_rtl):
            bad_rtl.append(str(f.relative_to(DIST)))
    check(not bad_lang, f"{seg}/ 全部页面 <html lang> 正确" + (f"（坏: {bad_lang[:3]}）" if bad_lang else ""))
    check(
        not bad_rtl,
        f"{seg}/ dir=rtl 仅存在于 ar 页" + (f"（坏: {bad_rtl[:3]}）" if bad_rtl else ""),
    )

# 12c. 子集页面的 hreflang 互指完整：6 语言 + x-default 共 7 条，URL 与产物一致
# 注意用 (hreflang, href) 对统计 —— en 与 x-default 可能指向同一英文 URL，set 会误合并。
def en_dir(app_path: str) -> Path:
    return DIST / app_path.strip("/") if app_path != "/" else DIST

bad_interlink: list[str] = []
for app_path in sorted(subset_paths):
    # 英文版（无前缀）
    en_pairs = set()
    f_en = en_dir(app_path) / "index.html"
    if f_en.is_file():
        t = f_en.read_text(encoding="utf-8", errors="ignore")
        en_pairs = set(
            re.findall(
                r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"', t
            )
        )
    # 语言版本（/zh/about 等）
    for seg in LANG_SEGS:
        f_zh = DIST / seg / app_path.strip("/") / "index.html" if app_path != "/" else DIST / seg / "index.html"
        if not f_zh.is_file():
            bad_interlink.append(f"{f_zh.relative_to(DIST)} 缺失（子集应生成语言版本）")
            continue
        t = f_zh.read_text(encoding="utf-8", errors="ignore")
        pairs = set(
            re.findall(
                r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"', t
            )
        )
        if len(pairs) != 7:
            bad_interlink.append(f"{f_zh.relative_to(DIST)} hreflang {len(pairs)} 条（期望 7）")
        # 与英文版互指集合应一致（6 语言 + x-default）
        if en_pairs and pairs != en_pairs:
            bad_interlink.append(f"{f_zh.relative_to(DIST)} 互指与英文版不一致")
check(not bad_interlink, f"子集页面 6 语言互指 + x-default 完整" + (f"（坏: {bad_interlink[:3]}）" if bad_interlink else ""))

# 12d. 非子集英文页面仅声明 en + x-default（2 条，指向自身）
subset_en_rels = {
    "index.html" if p == "/" else f"{p.strip('/')}/index.html" for p in subset_paths
}
non_subset_bad: list[str] = []
for f in DIST.rglob("index.html"):
    rel = str(f.relative_to(DIST)).replace("\\", "/")
    first_seg = rel.split("/")[0]
    if first_seg in LANG_SEGS:
        continue  # 语言版本页面必有 7 条（12c 已校验）
    if rel in subset_en_rels:
        continue  # 子集英文页面 7 条（12c 已校验）
    t = f.read_text(encoding="utf-8", errors="ignore")
    hrefs = [
        h for _l, h in re.findall(
            r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"', t
        )
    ]
    if len(hrefs) > 2:
        non_subset_bad.append(f"{rel}: {len(hrefs)} 条 hreflang（非子集应仅 en+x-default）")
check(
    not non_subset_bad,
    "非子集英文页仅 en + x-default" + (f"（坏: {non_subset_bad[:3]}）" if non_subset_bad else ""),
)

# 12e. 语言版本页面无「带前缀的非子集内链」（rewriteNonSubsetLinks 生效性）
non_subset_links: list[str] = []
for seg in LANG_SEGS:
    for f in (DIST / seg).rglob("index.html"):
        t = f.read_text(encoding="utf-8", errors="ignore")
        for m in re.finditer(rf'href="/{seg}/([^"#?]+)"', t):
            target = "/" + m.group(1)
            if target not in subset_paths:
                non_subset_links.append(f"{f.relative_to(DIST)} → {target}")
check(
    not non_subset_links,
    "语言版本页面内链全部指向有产物的 URL（非子集已回退英文）"
    + (f"（坏: {non_subset_links[:3]}）" if non_subset_links else ""),
)

# ══ 13. 无 /lollipop/ 部署前缀的 URL 残留（2026-09-01 Coverage 修复 R1/R2）══
# GSC Coverage 报告（2026-09-01）：sitemap/canonical/hreflang 曾全部缺 /lollipop/
# 部署前缀，真实可索引 URL 是 https://www.lollipop.im/lollipop/...，无前缀 URL
# 实际 301 → Google 记录 398 个「自动重定向」+ 103 个「canonical 备用页」。
# 本组用负面前瞻正则检测任何「无前缀」URL 残留（sitemap + dist HTML + llms）。
print()
print("=" * 70)
print("13. 无 /lollipop/ 部署前缀的 URL 残留（canonical/og:url/hreflang/sitemap/llms）")
print("=" * 70)

BAD_URL_RE = re.compile(r"https://www\.lollipop\.im/(?!lollipop/)")

# 13a. sitemap：loc + hreflang href 必须带前缀
sm_prefix_bad: list[str] = []
for m in BAD_URL_RE.finditer(sitemap):
    ctx = sitemap[max(0, m.start() - 40): m.end() + 40].replace("\n", " ")
    sm_prefix_bad.append(ctx)
check(
    not sm_prefix_bad,
    "sitemap 的 loc/hreflang 全部带 /lollipop/ 前缀"
    + (f"（坏: {sm_prefix_bad[:3]}）" if sm_prefix_bad else ""),
)

# 13b. dist HTML：canonical / og:url / hreflang 必须带前缀（正文自由文本不计）
html_prefix_bad: list[str] = []
for f in DIST.rglob("*.html"):
    try:
        t = f.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        continue
    for m in BAD_URL_RE.finditer(t):
        seg = t[max(0, m.start() - 80): m.start()]
        if "canonical" in seg or "og:url" in seg or "hreflang" in seg:
            html_prefix_bad.append(
                f"{f.relative_to(DIST)}: ...{t[max(0, m.start() - 40): m.end() + 30]}..."
            )
            break
check(
    not html_prefix_bad,
    "dist HTML 的 canonical/og:url/hreflang 全部带 /lollipop/ 前缀"
    + (f"（坏: {html_prefix_bad[:3]}）" if html_prefix_bad else ""),
)

# 13c. llms 文件必须带前缀
llms_prefix_bad = [
    name
    for name in ("llms.txt", "llms-full.txt")
    if BAD_URL_RE.search((DIST / name).read_text(encoding="utf-8", errors="ignore"))
]
check(
    not llms_prefix_bad,
    "llms 文件全部带 /lollipop/ 前缀" + (f"（坏: {llms_prefix_bad}）" if llms_prefix_bad else ""),
)

# ══ 结果 ════════════════════════════════════════════════════════════════════
print()
print("=" * 70)
print(f"通过项数: {passes}   失败项数: {len(fails)}")
if fails:
    print(f"RESULT: {len(fails)} FAILED")
    for f in fails[:30]:
        print(f"  - {f}")
    sys.exit(1)
print("RESULT: ALL PASSED")
