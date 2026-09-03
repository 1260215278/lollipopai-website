import paramiko
import os
import sys
import time

HOST = "43.160.226.253"
USER = "ubuntu"
KEY_PATH = os.path.expanduser("~/.ssh/id_ed25519_hermes")
LOCAL_FILE = sys.argv[1] if len(sys.argv) > 1 else r"c:\Users\Administrator\Documents\lollipop\packages\lollipop-dist-0.0.1-20260902-1004-full.tar.gz"
REMOTE_FILE = sys.argv[2] if len(sys.argv) > 2 else "/tmp/lollipop-deploy.tar.gz"

def upload_chunked(local_path, remote_path, chunk_size=512*1024, max_retries=10):
    """Upload file in chunks with resume capability."""
    file_size = os.path.getsize(local_path)

    for attempt in range(1, max_retries + 1):
        try:
            print(f"Attempt {attempt}/{max_retries}: Connecting to {HOST}...")
            transport = paramiko.Transport((HOST, 22))
            transport.set_keepalive(10)
            pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
            transport.connect(username=USER, pkey=pkey)
            sftp = paramiko.SFTPClient.from_transport(transport)

            # Check if partial file exists and get its size
            offset = 0
            try:
                remote_stat = sftp.stat(remote_path)
                offset = remote_stat.st_size
                if offset >= file_size:
                    print("File already fully uploaded!")
                    sftp.close()
                    transport.close()
                    return True
                print(f"Resuming from offset {offset} ({offset / 1024 / 1024:.2f} MB)")
            except IOError:
                pass

            # Open remote file for append, local file for read
            rfile = sftp.open(remote_path, 'ab' if offset > 0 else 'wb')
            lfile = open(local_path, 'rb')
            lfile.seek(offset)

            while offset < file_size:
                data = lfile.read(chunk_size)
                if not data:
                    break
                rfile.write(data)
                offset += len(data)
                pct = offset * 100 // file_size
                print(f"  {pct}% ({offset / 1024 / 1024:.1f} / {file_size / 1024 / 1024:.1f} MB)")

            rfile.close()
            lfile.close()

            # Verify
            remote_stat = sftp.stat(remote_path)
            print(f"Remote file size: {remote_stat.st_size} bytes (expected {file_size})")
            ok = remote_stat.st_size == file_size
            sftp.close()
            transport.close()
            if ok:
                print("SUCCESS: File uploaded and verified!")
                return True
            print("Size mismatch, will retry...")
        except Exception as e:
            print(f"Error at offset ~{offset}: {e}")
            try:
                if 'rfile' in dir(): rfile.close()
                if 'lfile' in dir(): lfile.close()
            except:
                pass
            if transport:
                try:
                    transport.close()
                except:
                    pass
            if attempt < max_retries:
                remaining = (file_size - offset) / 1024 / 1024
                print(f"Retrying in 3s... ({remaining:.1f} MB remaining)")
                time.sleep(3)
    return False

if __name__ == "__main__":
    ok = upload_chunked(LOCAL_FILE, REMOTE_FILE)
    sys.exit(0 if ok else 1)
