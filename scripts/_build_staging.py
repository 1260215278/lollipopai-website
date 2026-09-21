#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Staging build orchestrator: build dist with VITE_BASE=/lollipop/ (43.160.226.253/lollipop).
Follows iron rule: remove dist (separate step, verify gone) -> build -> compress.
"""
import subprocess, os, shutil, sys, datetime

ROOT = r"C:\Users\Administrator\Documents\lollipop"
NODE = r"C:\Users\Administrator\.workbuddy\binaries\node\versions\22.22.2-3\node.exe"
DIST = os.path.join(ROOT, "dist")
LOG = os.path.join(ROOT, "dist_build.log")

def remove_dist():
    if os.path.isdir(DIST):
        try:
            shutil.rmtree(DIST, ignore_errors=True)
        except Exception as e:
            print("shutil.rmtree err:", e)
    # verify
    if os.path.isdir(DIST):
        print("WARN: dist still exists after rmtree -> per-file fallback")
        for dp, dn, fn in os.walk(DIST, topdown=False):
            for f in fn:
                try: os.remove(os.path.join(dp, f))
                except Exception: pass
            for d in dn:
                try: os.rmdir(os.path.join(dp, d))
                except Exception: pass
        try: os.rmdir(DIST)
        except Exception: pass
    print("dist exists after removal:", os.path.isdir(DIST))

def run(cmd, env):
    print("\n$ " + " ".join(cmd))
    r = subprocess.run(cmd, cwd=ROOT, env=env, capture_output=True, text=True)
    print("RC:", r.returncode)
    if r.stdout:
        tail = r.stdout if len(r.stdout) <= 4000 else ("...[truncated]\n" + r.stdout[-3500:])
        print("STDOUT:\n" + tail)
    if r.stderr:
        tail = r.stderr if len(r.stderr) <= 2500 else ("...[truncated]\n" + r.stderr[-2000:])
        print("STDERR:\n" + tail)
    return r

def main():
    remove_dist()
    if os.path.isdir(DIST):
        print("FATAL: dist not removed"); sys.exit(2)

    env = dict(os.environ)
    env["VITE_BASE"] = "/lollipop/"

    with open(LOG, "w", encoding="utf-8") as lf:
        lf.write("staging build %s\n" % datetime.datetime.now().isoformat())

    r1 = run([NODE, "node_modules/vite/bin/vite.js", "build"], env)
    if r1.returncode != 0:
        print("BUILD FAILED"); sys.exit(1)
    r2 = run([NODE, "scripts/compress-dist.mjs"], env)
    if r2.returncode != 0:
        print("COMPRESS FAILED"); sys.exit(1)
    print("\nBUILD+COMPRESS OK")

if __name__ == "__main__":
    main()
