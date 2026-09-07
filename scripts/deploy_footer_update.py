import paramiko, os, time

HOST = "43.160.226.253"
USER = "ubuntu"
KEY_PATH = os.path.expanduser("~/.ssh/id_ed25519_hermes")
LOCAL = "packages/lollipop-dist-0.0.1-20260904-1719-delta.tar.gz"
REMOTE = "/tmp/lollipop-footer-update.tar.gz"
DEPLOY_DIR = "/srv/www/lollipop/current"

file_size = os.path.getsize(LOCAL)
print(f"Deploying: {LOCAL} ({file_size/1024/1024:.1f} MB)")

for attempt in range(10):
    try:
        print(f"\nAttempt {attempt+1}: connecting...")
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

        print(f"  Remote: {remote_size} / {file_size}")
        if remote_size == file_size:
            print("  Already uploaded, extracting...")
        else:
            # Remove old file for clean upload
            if remote_size > 0:
                try:
                    sftp.remove(REMOTE)
                except:
                    pass
            print("  Uploading fresh (full)...")
            sftp.put(LOCAL, REMOTE)
            remote_size = sftp.stat(REMOTE).st_size
            print(f"  Upload done: {remote_size} / {file_size}")

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

            # Verify Footer links removed - check homepage HTML
            ch2 = transport.open_session()
            ch2.exec_command(f'grep -c "Press\|Glossary" {DEPLOY_DIR}/index.html')
            time.sleep(2)
            out2 = b""
            while ch2.recv_ready():
                out2 += ch2.recv(4096)
            print(f"  Press/Glossary mentions in index.html: {out2.decode().strip()}")

            # Verify press/glossary pages still exist
            ch3 = transport.open_session()
            ch3.exec_command(f"ls -la {DEPLOY_DIR}/press/index.html {DEPLOY_DIR}/glossary/index.html 2>&1")
            time.sleep(2)
            out3 = b""
            while ch3.recv_ready():
                out3 += ch3.recv(4096)
            print(f"  Press/Glossary files: {out3.decode().strip()}")

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
