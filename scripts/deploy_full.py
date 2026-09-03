import paramiko
import os
import sys
import time

HOST = "43.160.226.253"
USER = "ubuntu"
KEY_PATH = os.path.expanduser("~/.ssh/id_ed25519_hermes")
LOCAL_PKG = r"c:\Users\Administrator\Documents\lollipop\packages\lollipop-production-20260902-1645.tar.gz"
REMOTE_PKG = "/tmp/lollipop-deploy.tar.gz"
DEPLOY_DIR = "/srv/www/lollipop/current"

def upload_package():
    file_size = os.path.getsize(LOCAL_PKG)
    print(f"Uploading {LOCAL_PKG} ({file_size/1024/1024:.1f} MB) to {HOST}...")

    for attempt in range(1, 20):
        try:
            transport = paramiko.Transport((HOST, 22))
            transport.set_keepalive(10)
            pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
            transport.connect(username=USER, pkey=pkey)
            sftp = paramiko.SFTPClient.from_transport(transport)

            offset = 0
            try:
                remote_stat = sftp.stat(REMOTE_PKG)
                offset = remote_stat.st_size
                if offset >= file_size:
                    print(f"  Already complete ({offset} bytes)")
                    sftp.close()
                    transport.close()
                    return True
                print(f"  Attempt {attempt}: resuming from {offset/1024/1024:.1f} MB")
            except IOError:
                offset = 0

            lfile = open(LOCAL_PKG, 'rb')
            lfile.seek(offset)
            rfile = sftp.open(REMOTE_PKG, 'ab' if offset > 0 else 'wb')

            chunk = 256 * 1024
            last_report = 0
            while offset < file_size:
                data = lfile.read(chunk)
                if not data:
                    break
                rfile.write(data)
                offset += len(data)
                pct = offset * 100 // file_size
                if pct >= last_report + 10:
                    print(f"  {pct}% ({offset/1024/1024:.1f}/{file_size/1024/1024:.1f} MB)")
                    last_report = pct

            rfile.close()
            lfile.close()

            remote_stat = sftp.stat(REMOTE_PKG)
            if remote_stat.st_size == file_size:
                print(f"  Upload complete! ({remote_stat.st_size} bytes)")
                sftp.close()
                transport.close()
                return True
            print(f"  Size mismatch: local={file_size}, remote={remote_stat.st_size}")
            sftp.close()
            transport.close()
        except Exception as e:
            print(f"  Error: {type(e).__name__}: {e}")
            if attempt < 20:
                time.sleep(3)
    return False

def deploy_and_verify():
    print("\nConnecting via SSH to deploy...")
    transport = paramiko.Transport((HOST, 22))
    transport.set_keepalive(10)
    pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
    transport.connect(username=USER, pkey=pkey)
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, pkey=pkey)

    commands = [
        f"mkdir -p {DEPLOY_DIR}",
        f"rm -rf {DEPLOY_DIR}/*",
        f"tar xzf {REMOTE_PKG} -C {DEPLOY_DIR}",
        f"ls {DEPLOY_DIR}/assets/index-*.js 2>/dev/null | head -3",
        f"ls {DEPLOY_DIR}/assets/app-*.js 2>/dev/null | head -5",
        f"grep -c '/lollipop/assets/' {DEPLOY_DIR}/index.html",
        f"grep -o 'src=\"[^\"]*\"' {DEPLOY_DIR}/index.html | head -5",
        f"ls {DEPLOY_DIR}/assets/fonts/inter-latin.woff2 2>/dev/null",
        f"curl -sI http://localhost/lollipop/assets/index-YG3yGmlN.js | head -5",
        f"curl -sI http://localhost/lollipop/assets/app-distribution-C5tx_T6F.js | head -5",
        f"curl -sI http://localhost/lollipop/assets/fonts/inter-latin.woff2 | head -5",
    ]

    for cmd in commands:
        print(f"\n$ {cmd}")
        stdin, stdout, stderr = ssh.exec_command(cmd, timeout=30)
        out = stdout.read().decode()
        err = stderr.read().decode()
        if out.strip():
            print(out.rstrip())
        if err.strip():
            print(f"  (stderr) {err.rstrip()}")

    ssh.close()
    transport.close()

if __name__ == "__main__":
    if upload_package():
        deploy_and_verify()
        print("\nDone! Check results above.")
    else:
        print("Upload failed after all retries.")
        sys.exit(1)
