"""全站 SEO 自检：对着 GSC / 第三方 SEO 报告的常见"问题"做事实核查。

把每类报告问题变成 dist 层面的可验证检查，确认是真实问题还是工具误报。
用法:
  python scripts/seo-self-check.py
  python scripts/seo-self-check.py --thin 1500 --title 40
"""
import argparse, os, re, sys
from html.parser import HTMLParser

THIN_DEFAULT = 1200   # 字符
TITLE_MIN_DEFAULT = 30


class ImgCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.imgs = []

    def handle_starttag(self, tag, attrs):
        if tag == "img":
            self.imgs.append(dict(attrs))


def strip_to_text(html: str) -> str:
    html = re.sub(r"<script[\s\S]*?</script>", " ", html)
    html = re.sub(r"<style[\s\S]*?</style>", " ", html)
    html = re.sub(r"<!--[\s\S]*?-->", " ", html)
    text = re.sub(r"<[^>]+>", " ", html)
    return re.sub(r"\s+", " ", text).strip()


def path_to_url(rel: str) -> str:
    if rel == "index.html":
        return "/"
    if rel.endswith("/index.html"):
        return "/" + rel[: -len("/index.html")]
    return "/" + rel[: -len(".html")]


def scan_dist(dist: str, thin: int, title_min: int):
    SKIP_DIRS = {".vite", ".ssr", "assets", "blog-images", "fonts", "seo-audit-report"}
    ACCOUNTS = {"/login", "/forgot-password"}
    IMPORTANT = {"/", "/about", "/contact", "/creating", "/download", "/blog",
                 "/privacy", "/terms", "/genre/romance"}
    thin_pages, short_titles, noindex_important, img_no_alt = [], [], [], []

    for dirpath, dirnames, filenames in os.walk(dist):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fn in filenames:
            if not fn.endswith(".html"):
                continue
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, dist).replace("\\", "/")
            url = path_to_url(rel)
            try:
                with open(full, encoding="utf-8", errors="ignore") as f:
                    content = f.read()
            except OSError:
                continue
            # 1) 薄内容
            text_len = len(strip_to_text(content))
            if text_len < thin and url not in ACCOUNTS and not url.endswith((".html",)):
                # 验证文件正常薄（< 100 字符）—— 排除
                if text_len > 100:
                    thin_pages.append((url, text_len))
            # 2) 短 title
            m = re.search(r"<title>([^<]*)", content)
            t = m.group(1) if m else ""
            if len(t) < title_min and url not in ACCOUNTS:
                short_titles.append((url, t, len(t)))
            # 3) 重要页面 noindex
            if url in IMPORTANT:
                mr = re.search(r'<meta name="robots" content="([^"]*)"', content)
                robots = mr.group(1) if mr else ""
                if "noindex" in robots:
                    noindex_important.append((url, robots))
            # 4) 缺 alt 的 img
            try:
                p = ImgCollector(); p.feed(content)
                no_alt = [i for i in p.imgs if "alt" not in i]
                if no_alt:
                    img_no_alt.append((url, len(p.imgs), len(no_alt)))
            except Exception:
                pass

    return thin_pages, short_titles, noindex_important, img_no_alt


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dist", default="dist")
    ap.add_argument("--thin", type=int, default=THIN_DEFAULT)
    ap.add_argument("--title", type=int, default=TITLE_MIN_DEFAULT)
    a = ap.parse_args()

    if not os.path.isdir(a.dist):
        sys.exit(f"dist 不存在: {a.dist}")

    thin, titles, noindex, imgs = scan_dist(a.dist, a.thin, a.title)
    total = sum(1 for _, _, filenames in os.walk(a.dist) for fn in filenames if fn.endswith(".html"))

    print(f"=== 全站 SEO 自检（dist={a.dist}, {total} 个 HTML 页面）===\n")
    print(f"  阈值: 薄内容 < {a.thin} 字符 | 短 title < {a.title} 字符")
    print(f"  排除: /login, /forgot-password（账户页，正确 noindex）")
    print()
    print(f"[1] 薄内容: {len(thin)} 个")
    for u, n in thin[:8]:
        print(f"    {u} ({n} 字)")
    if len(thin) > 8:
        print(f"    ...还有 {len(thin)-8} 个")

    print(f"\n[2] 短 title: {len(titles)} 个")
    for u, t, n in titles[:8]:
        print(f"    {u} '{t}' ({n})")

    print(f"\n[3] 重要页面 noindex: {len(noindex)} 个")
    for u, r in noindex:
        print(f"    {u} robots='{r}'")

    print(f"\n[4] 缺 alt 的 <img>: {len(imgs)} 个页面")
    for u, total_imgs, missing in imgs[:5]:
        print(f"    {u} 共 {total_imgs} 张, 缺 alt {missing} 张")

    print("\n" + "=" * 60)
    if not thin and not titles and not noindex and not imgs:
        print("✅ 全站 SEO 自检无问题")
    else:
        issues = len(thin) + len(titles) + len(noindex) + len(imgs)
        print(f"⚠️ 发现 {issues} 类问题，逐个判断后再修")


if __name__ == "__main__":
    main()