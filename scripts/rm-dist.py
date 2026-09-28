#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
删除 dist（构建流水线的独立第一步）。

为什么必须独立成一个命令：safe-delete 会在单次操作里删除文件数 > 50 时拦截
(`SAFE_DELETE_BULK_CONFIRM_REQUIRED`)，dist 通常有 1500~8000 个文件，必然被拦。
如果把删除和构建写成 `rm -rf dist && vite build`，删除失败会让 `&&` 短路 ——
构建根本没跑，而上一轮的构建日志看起来还是"成功"的，极易误判为构建成功。

用法：
    python scripts/rm-dist.py            # 删除 dist 并校验
    python scripts/rm-dist.py --keep-ssr # 只删 dist 下的 .ssr（SSR 中间产物）
"""
import os
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")


def count_files(path: str) -> int:
    n = 0
    for _root, _dirs, files in os.walk(path):
        n += len(files)
    return n


def main() -> int:
    if not os.path.isdir(DIST):
        print("dist exists: False  (无需删除)")
        return 0

    n = count_files(DIST)
    print("dist exists: True   文件数 %d" % n)

    if "--keep-ssr" in sys.argv:
        ssr = os.path.join(DIST, ".ssr")
        if os.path.isdir(ssr):
            shutil.rmtree(ssr, ignore_errors=True)
        print(".ssr removed:", not os.path.isdir(ssr))
        return 0

    shutil.rmtree(DIST, ignore_errors=True)

    if os.path.isdir(DIST):
        print("FATAL: dist 仍然存在 —— 删除被拦截或失败")
        return 2
    print("dist exists after removal: False")
    return 0


if __name__ == "__main__":
    sys.exit(main())
