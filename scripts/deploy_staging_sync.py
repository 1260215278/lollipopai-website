#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Deploy staging build (VITE_BASE=/lollipop/) to 43.160.226.253:/srv/www/lollipop/current.

Flow: package dist -> tar.gz -> SFTP upload /tmp/lollipop-deploy.tar.gz (resumable)
      -> SSH: rm -rf /tmp/lollipop-new && tar xzf -> sudo rsync -a --delete /tmp/lollipop-new/ /srv/www/lollipop/current/
      -> verify new creator-story articles + cover images + expanded ZH content live.
"""
import os, sys, time, tarfile, datetime, io

import paramiko

ROOT = r"C:\Users\Administrator\Documents\lollipop"
DIST = os.path.join(ROOT, "dist")
OUT = os.path.join(ROOT, "packages")
HOST = "43.160.226.253"
USER = "ubuntu"
KEY = os.path.expanduser(r"~\.ssh\id_ed25519_hermes")
REMOTE_TAR = "/tmp/lollipop-deploy.tar.gz"
REMOTE_NEW = "/tmp/lollipop-new"
DEPLOY_DIR = "/srv/www/lollipop/current"
STAMP = datetime.datetime.now().strftime("%Y%m%d-%H%M")

SKIP_DIRS = {".vite", ".ssr"}


def package():
    os.makedirs(OUT, exist_ok=True)
    name = f"lollipop-staging-{STAMP}.tar.gz"
    path = os.path.join(OUT, name)
    files = []
    for dp, dn, fn in os.walk(DIST):
        dn[:] = [d for d in dn if d not in SKIP_DIRS]
        for f in fn:
            full = os.path.join(dp, f)
            rel = os.path.relpath(full, DIST).replace("\\", "/")
            files.append((full, rel))
    files.sort()
    with tarfile.open(path, "w:gz", compresslevel=6) as tf:
        for full, rel in files:
            tf.add(full, arcname=rel)
    size = os.path.getsize(path) / 1048576
    print(f"[pkg] {name}: {len(files)} files, {size:.2f} MB")
    return path


def connect():
    import socket
    sock = socket.create_connection((HOST, 22), timeout=20)
    t = paramiko.Transport(sock)
    t.set_keepalive(10)
    pkey = paramiko.Ed25519Key.from_private_key_file(KEY)
    t.connect(username=USER, pkey=pkey)
    return t


def upload(t, local_path):
    """Fresh-start + crash-safe resume upload.

    Anti-stale guarantee: the remote tar is REMOVED before the first byte is
    written, so any partial file found afterwards is strictly a prefix of THIS
    tar — resuming by offset is then safe. (The original corruption bug resumed
    onto a leftover COMPLETE tar from a previous deploy.)"""
    size = os.path.getsize(local_path)
    wiped = False
    for attempt in range(1, 9):
        tr = None
        try:
            if not wiped:
                tr = connect()
                sftp = paramiko.SFTPClient.from_transport(tr)
                try:
                    sftp.remove(REMOTE_TAR)
                except IOError:
                    pass
                sftp.close(); tr.close()
                wiped = True
            tr = connect()
            sftp = paramiko.SFTPClient.from_transport(tr)
            offset = 0
            try:
                offset = sftp.stat(REMOTE_TAR).st_size
                if offset > size:
                    sftp.remove(REMOTE_TAR); offset = 0
                elif offset > 0:
                    print(f"  [retry {attempt}] resuming from {offset/1048576:.1f} MB", flush=True)
            except IOError:
                offset = 0
            lf = open(local_path, "rb")
            lf.seek(offset)
            rf = sftp.open(REMOTE_TAR, "ab" if offset else "wb")
            chunk = 256 * 1024
            last = (offset * 100) // size
            while offset < size:
                data = lf.read(chunk)
                if not data:
                    break
                rf.write(data)
                offset += len(data)
                pct = (offset * 100) // size
                if pct >= last + 10:
                    print(f"  {pct}%", flush=True)
                    last = pct
            rf.close(); lf.close()
            rs = sftp.stat(REMOTE_TAR).st_size
            sftp.close(); tr.close()
            ok = rs == size
            print(f"[upload] {'OK' if ok else 'MISMATCH'} remote={rs} expected={size}", flush=True)
            if ok:
                return True
        except Exception as e:
            print(f"  [retry {attempt}] {type(e).__name__}: {str(e)[:120]}", flush=True)
            try:
                if tr is not None:
                    tr.close()
            except Exception:
                pass
            time.sleep(5)
    return False


def remote_tar_count(t):
    out, err = ssh_run(t, f"tar tzf {REMOTE_TAR} 2>/dev/null | wc -l", timeout=120)
    try:
        return int(out.strip().splitlines()[-1])
    except Exception:
        return -1


def ssh_run(t, cmd, timeout=120):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, pkey=paramiko.Ed25519Key.from_private_key_file(KEY), timeout=15)
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors="ignore")
    err = stderr.read().decode(errors="ignore")
    ssh.close()
    return out, err


def deploy_and_verify(t):
    print("[deploy] extracting + rsync...")
    out, err = ssh_run(t,
        f"rm -rf {REMOTE_NEW} && mkdir -p {REMOTE_NEW} && tar xzf {REMOTE_TAR} -C {REMOTE_NEW} && "
        f"sudo rsync -a --delete {REMOTE_NEW}/ {DEPLOY_DIR}/")
    if out.strip(): print("[deploy out]", out.strip()[:300])
    if err.strip(): print("[deploy err]", err.strip()[:300])
    print("[deploy] verifying live...")
    checks = [
        f"ls -d {DEPLOY_DIR}/blog/creator-story-* 2>/dev/null | wc -l",
        f"ls {DEPLOY_DIR}/blog-images/creator-story-*-new.webp 2>/dev/null | wc -l",
        f"ls {DEPLOY_DIR}/assets/index-*.js 2>/dev/null | head -1",
        f"test -f {DEPLOY_DIR}/zh/blog/creator-story-ai-compliance/index.html && echo ZH_OK || echo ZH_MISSING",
        f"test -f {DEPLOY_DIR}/.well-known/llms.txt && echo WELLKNOWN_OK || echo WELLKNOWN_MISSING",
        f"curl -s http://localhost/lollipop/blog/ | grep -c 'creator-story'",
    ]
    for c in checks:
        out, err = ssh_run(t, c, timeout=30)
        print(f"  $ {c}\n    -> {out.strip()[:200]}" + (f" (err:{err.strip()[:100]})" if err.strip() else ""))


def main():
    use_tar = None
    if len(sys.argv) > 2 and sys.argv[1] == "--tar":
        use_tar = sys.argv[2]
    if use_tar:
        local = use_tar
        if not os.path.isfile(local):
            print("FATAL: tar not found:", local); sys.exit(1)
        print("[pkg] reusing existing tar:", local)
    else:
        if not os.path.isdir(DIST):
            print("FATAL: dist missing"); sys.exit(1)
        # sanity: staging build base
        idx = open(os.path.join(DIST, "index.html"), encoding="utf-8", errors="ignore").read()
        if "/lollipop/assets/" not in idx:
            print("WARN: dist is NOT a /lollipop/ build — aborting to avoid breaking staging.")
            sys.exit(2)
        local = package()
    t = connect()
    try:
        if not upload(t, local):
            print("FATAL: upload failed"); sys.exit(3)
        # integrity: remote tar must list exactly the packaged entries (guards
        # against corrupted/append-mixed uploads silently deploying stale builds)
        with tarfile.open(local) as tf:
            local_n = len(tf.getnames())
        remote_n = remote_tar_count(t)
        print(f"[integrity] local entries={local_n} remote entries={remote_n}")
        if remote_n != local_n:
            print("FATAL: remote tar integrity mismatch — aborting before rsync"); sys.exit(4)
        deploy_and_verify(t)
    finally:
        t.close()
    print("DONE. Package:", local)


if __name__ == "__main__":
    main()
