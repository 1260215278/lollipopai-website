import paramiko, os, time

HOST = "43.160.226.253"
USER = "ubuntu"
KEY_PATH = os.path.expanduser("~/.ssh/id_ed25519_hermes")
LOCAL = "packages/lollipop-press-glossary.tar.gz"
REMOTE = "/tmp/lollipop-press-glossary.tar.gz"
DEPLOY_DIR = "/srv/www/lollipop/current"

def main():
    file_size = os.path.getsize(LOCAL)
    print(f"Deploying: {LOCAL} ({file_size/1024/1024:.1f} MB)")
    
    for attempt in range(5):
        transport = None
        try:
            print(f"\nAttempt {attempt+1}: connecting...")
            transport = paramiko.Transport((HOST, 22))
            transport.set_keepalive(30)
            pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
            transport.connect(username=USER, pkey=pkey)
            sftp = paramiko.SFTPClient.from_transport(transport)
            
            # Check remote size for resume
            remote_size = 0
            try:
                remote_size = sftp.stat(REMOTE).st_size
                if remote_size >= file_size:
                    print("  Already uploaded, skipping")
                    break
                print(f"  Resuming from {remote_size/1024/1024:.1f} MB")
            except IOError:
                print("  Starting fresh upload")
            
            # Upload
            with open(LOCAL, "rb") as lf:
                lf.seek(remote_size)
                mode = "ab" if remote_size > 0 else "wb"
                with sftp.file(REMOTE, mode) as rf:
                    rf.set_pipelined(True)
                    chunk = 64 * 1024
                    uploaded = remote_size
                    last_report = remote_size
                    while True:
                        data = lf.read(chunk)
                        if not data:
                            break
                        rf.write(data)
                        uploaded += len(data)
                        if uploaded - last_report >= 2 * 1024 * 1024:
                            print(f"    {uploaded/1024/1024:.1f}/{file_size/1024/1024:.1f} MB")
                            last_report = uploaded
            
            # Verify size
            final_size = sftp.stat(REMOTE).st_size
            if final_size != file_size:
                print(f"  Size mismatch: local={file_size}, remote={final_size}")
                raise Exception("Upload incomplete")
            
            print(f"  Upload complete! ({final_size/1024/1024:.1f} MB)")
            
            # Extract on server
            print("  Extracting on server...")
            channel = transport.open_session()
            cmd = f"cd {DEPLOY_DIR} && tar xzf {REMOTE} && echo '=== EXTRACTED ===' && head -20 index.html | grep title"
            channel.exec_command(cmd)
            
            output = ""
            while not channel.exit_status_ready():
                if channel.recv_ready():
                    output += channel.recv(4096).decode("utf-8", errors="replace")
                time.sleep(0.1)
            output += channel.recv(4096).decode("utf-8", errors="replace")
            print(output)
            
            if channel.recv_exit_status() != 0:
                stderr = ""
                if channel.recv_stderr_ready():
                    stderr = channel.recv_stderr(4096).decode("utf-8", errors="replace")
                print(f"  Extract stderr: {stderr}")
            
            print("\n✅ Deploy successful!")
            return True
            
        except Exception as e:
            print(f"  Error: {type(e).__name__}: {e}")
            if attempt < 4:
                print("  Retrying in 5s...")
                time.sleep(5)
                continue
            raise
        finally:
            if transport:
                try:
                    transport.close()
                except:
                    pass
    
    return False

if __name__ == "__main__":
    main()
