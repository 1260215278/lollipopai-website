import os
d = r"C:\Users\Administrator\Documents\lollipop\tmp\lollipop_zip"
for f in sorted(os.listdir(d)):
    if not f.endswith(".md"):
        continue
    p = os.path.join(d, f)
    t = open(p, encoding="utf-8").read()
    has_script = "<script" in t.lower()
    fm = t.startswith("---")
    nlines = t.count("\n") + 1
    bt = "`" in t
    doll = "${" in t
    print(f"{f:55} lines={nlines:4} script={has_script} fm={fm} backtick={bt} doll={doll}")
