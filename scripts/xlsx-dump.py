"""极简 xlsx 解析：不依赖第三方库，把每个 sheet 导出为 CSV。
用法: python scripts/xlsx-dump.py <file.xlsx> <outdir>
"""
import csv
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"


def col_to_idx(ref: str) -> int:
    m = re.match(r"([A-Z]+)", ref)
    s = m.group(1)
    n = 0
    for ch in s:
        n = n * 26 + (ord(ch) - 64)
    return n - 1


def load_shared(z):
    if "xl/sharedStrings.xml" not in z.namelist():
        return []
    root = ET.fromstring(z.read("xl/sharedStrings.xml"))
    out = []
    for si in root.findall(f"{NS}si"):
        out.append("".join(t.text or "" for t in si.iter(f"{NS}t")))
    return out


def sheet_names(z):
    """返回 [(name, path)]，按 workbook 顺序"""
    wb = ET.fromstring(z.read("xl/workbook.xml"))
    rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
    rid2t = {r.get("Id"): r.get("Target") for r in rels}
    out = []
    for sh in wb.find(f"{NS}sheets"):
        rid = sh.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
        tgt = rid2t.get(rid, "")
        if not tgt.startswith("/"):
            tgt = "xl/" + tgt.lstrip("./")
        else:
            tgt = tgt.lstrip("/")
        out.append((sh.get("name"), tgt))
    return out


def dump(z, path, shared):
    root = ET.fromstring(z.read(path))
    rows = []
    for row in root.iter(f"{NS}row"):
        cells = {}
        for c in row.findall(f"{NS}c"):
            ref = c.get("r") or ""
            i = col_to_idx(ref) if ref else len(cells)
            t = c.get("t")
            v = c.find(f"{NS}v")
            isel = c.find(f"{NS}is")
            if t == "s" and v is not None:
                val = shared[int(v.text)]
            elif t == "inlineStr" and isel is not None:
                val = "".join(x.text or "" for x in isel.iter(f"{NS}t"))
            elif v is not None:
                val = v.text or ""
            else:
                val = ""
            cells[i] = val
        if cells:
            w = max(cells) + 1
            rows.append([cells.get(i, "") for i in range(w)])
    return rows


def main():
    src, outdir = sys.argv[1], sys.argv[2]
    import os

    os.makedirs(outdir, exist_ok=True)
    z = zipfile.ZipFile(src)
    shared = load_shared(z)
    for name, path in sheet_names(z):
        rows = dump(z, path, shared)
        safe = re.sub(r"[^\w\u4e00-\u9fff-]", "_", name)[:60]
        fp = os.path.join(outdir, f"{safe}.csv")
        with open(fp, "w", encoding="utf-8-sig", newline="") as f:
            csv.writer(f).writerows(rows)
        print(f"[ok] {name} -> {fp}  ({len(rows)} rows)")


if __name__ == "__main__":
    main()
