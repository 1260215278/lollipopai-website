#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Production (root-deploy) build: VITE_BASE comes from .env.production (VITE_BASE=/).
Iron rule: remove dist (separate verified step) -> build -> compress.
"""
import subprocess, os, shutil, sys, datetime

ROOT = r"C:\Users\Administrator\Documents\lollipop"
NODE = r"C:\Users\Administrator\.workbuddy\binaries\node\versions\22.22.2-3\node.exe"
DIST = os.path.join(ROOT, "dist")
LOG = os.path.join(ROOT, "dist_build.log")

if os.path.isdir(DIST):
    shutil.rmtree(DIST, ignore_errors=True)
if os.path.isdir(DIST):
    print("FATAL: dist not removed"); sys.exit(2)
print("dist exists after removal:", os.path.isdir(DIST))

env = dict(os.environ)
env.pop("VITE_BASE", None)  # let .env.production (VITE_BASE=/) drive the base

with open(LOG, "w", encoding="utf-8") as lf:
    lf.write("production build %s\n" % datetime.datetime.now().isoformat())

r1 = subprocess.run([NODE, "node_modules/vite/bin/vite.js", "build"], cwd=ROOT, env=env, capture_output=True, text=True)
print("BUILD RC:", r1.returncode)
if r1.stdout:
    print(r1.stdout[-1200:])
if r1.returncode != 0:
    print(r1.stderr[-1500:]); sys.exit(1)
r2 = subprocess.run([NODE, "scripts/compress-dist.mjs"], cwd=ROOT, env=env, capture_output=True, text=True)
print("COMPRESS RC:", r2.returncode)
if r2.stdout:
    print(r2.stdout[-400:])
if r2.returncode != 0:
    print(r2.stderr[-1500:]); sys.exit(1)
print("PRODUCTION BUILD+COMPRESS OK")
