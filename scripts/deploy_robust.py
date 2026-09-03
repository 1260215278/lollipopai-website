import paramiko, os, sys, time

HOST = "43.160.226.253"
USER = "ubuntu"
KEY_PATH = os.path.expanduser("~/.ssh/id_ed25519_hermes")
LOCAL_TAR = "lollipop-production-20260902-1645.tar.gz"
REMOTE_TAR = "/tmp/lollipop-full-deploy.tar.gz"
DEPLOY_DIR = "/srv/www/lollipop/current"

def upload_with_resume(transport, local_path, remote_path, max_retries=15):
    file_size = os.path.getsize(local_path)
    print(f"Uploading {local_path} ({file_size/1024/1024:.1f} MB) with resume...")
    
    for attempt in range(1, max_retries + 1):
        try:
            sftp = paramiko.SFTPClient.from_transport(transport)
            if sftp is None:
                transport = paramiko.Transport((HOST, 22))
                transport.set_keepalive(10)
                pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
                transport.connect(username=USER, pkey=pkey)
                sftp = paramiko.SFTPClient.from_transport(transport)
            
            # Check for partial upload
            offset = 0
            try:
                remote_stat = sftp.stat(remote_path)
                offset = remote_stat.st_size
                if offset >= file_size:
                    print(f"  Already complete ({offset} bytes)")
                    return True
                print(f"  Attempt {attempt}: resuming from {offset/1024/1024:.1f} MB")
            except IOError:
                print(f"  Attempt {attempt}: starting fresh")
                offset = 0
            
            # Upload
            lfile = open(local_path, 'rb')
            lfile.seek(offset)
            rfile = sftp.open(remote_path, 'ab' if offset > 0 else 'wb')
            
            chunk = 256 * 1024  # 256KB
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
            
            remote_stat = sftp.stat(remote_path)
            if remote_stat.st_size == file_size:
                print(f"  Upload complete! ({remote_stat.st_size} bytes)")
                return True
            print(f"  Size mismatch: local={file_size}, remote={remote_stat.st_size}")
        except Exception as e:
            print(f"  Error: {type(e).__name__}: {e}")
            if attempt < max_retries:
                time.sleep(3)
                # Reconnect
                try:
                    transport.close()
                except:
                    pass
                transport = paramiko.Transport((HOST, 22))
                transport.set_keepalive(10)
                pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
                transport.connect(username=USER, pkey=pkey)
    return False

def main():
    # Upload the tar.gz
    transport = paramiko.Transport((HOST, 22))
    transport.set_keepalive(10)
    pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
    transport.connect(username=USER, pkey=pkey)
    
    success = upload_with_resume(transport, LOCAL_TAR, REMOTE_TAR)
    transport.close()
    
    if not success:
        print("FAILED to upload!")
        sys.exit(1)
    
    # Extract on server
    print("\nExtracting on server...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, pkey=pkey, timeout=15)
    
    cmd = f"cd {DEPLOY_DIR} && tar xzf {REMOTE_TAR} && echo EXTRACTED"
    stdin, stdout, stderr = client.exec_command(cmd, timeout=60)
    print(stdout.read().decode())
    err = stderr.read().decode()
    if err:
        print("STDERR:", err[:300])
    
    # Verify
    print("Verifying...")
    cmd = f"grep -c '/lollipop/assets/' {DEPLOY_DIR}/genre/romance/index.html 2>/dev/null; grep -c '/lollipop/assets/' {DEPLOY_DIR}/drama/temptation-ceo/index.html 2>/dev/null; ls {DEPLOY_DIR}/assets/*.css | head -3"
    stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
    print(stdout.read().decode())
    
    client.close()
    print("Done!")

if __name__ == "__main__":
    main()
