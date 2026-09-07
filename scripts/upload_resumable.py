import paramiko, os, time, hashlib, sys

HOST = "43.160.226.253"
USER = "ubuntu"
KEY_PATH = os.path.expanduser("~/.ssh/id_ed25519_hermes")
LOCAL = "packages/lollipop-press-glossary.tar.gz"
REMOTE = "/tmp/lollipop-pg-final.tar.gz"
DEPLOY_DIR = "/srv/www/lollipop/current"

file_size = os.path.getsize(LOCAL)
print(f"Deploying: {LOCAL} ({file_size/1024/1024:.1f} MB)", flush=True)

for attempt in range(10):
    try:
        print(f"\nAttempt {attempt+1}: connecting...", flush=True)
        transport = paramiko.Transport((HOST, 22))
        transport.set_keepalive(15)
        transport.banner_timeout = 30
        pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
        transport.connect(username=USER, pkey=pkey)
        sftp = paramiko.SFTPClient.from_transport(transport)

        try:
            remote_size = sftp.stat(REMOTE).st_size
        except:
            remote_size = 0

        print(f"  Remote: {remote_size} / {file_size}", flush=True)
        if remote_size == file_size:
            print("  Already uploaded, extracting...", flush=True)
        else:
            print("  Uploading fresh (full)...", flush=True)
            sftp.put(LOCAL, REMOTE)
            remote_size = sftp.stat(REMOTE).st_size
            print(f"  Upload done: {remote_size} / {file_size}", flush=True)

        if remote_size == file_size:
            channel = transport.open_session()
            channel.exec_command(f"cd {DEPLOY_DIR} && tar xzf {REMOTE} --overwrite && echo EXTRACTED")
            output = b""
            while not channel.exit_status_ready():
                if channel.recv_ready():
                    output += channel.recv(4096)
                time.sleep(0.1)
            time.sleep(1)
            output += channel.recv(4096)
            print(f"  Extract: {output.decode().strip()}")

            ch2 = transport.open_session()
            ch2.exec_command(f"ls {DEPLOY_DIR}/press/index.html {DEPLOY_DIR}/glossary/index.html 2>&1")
            out2 = b""
            while not ch2.exit_status_ready():
                if ch2.recv_ready():
                    out2 += ch2.recv(4096)
                time.sleep(0.1)
            time.sleep(1)
            out2 += ch2.recv(4096)
            print(f"  Verify: {out2.decode().strip()}")
            transport.close()
            print("\nDone!")
            break
        else:
            print(f"  Size mismatch: {remote_size} != {file_size}")
            transport.close()
            time.sleep(5)
    except Exception as e:
        print(f"  Error: {e}")
        try:
            transport.close()
        except:
            pass
        time.sleep(5)
