import paramiko, os, sys

HOST = "43.160.226.253"
USER = "ubuntu"
KEY_PATH = os.path.expanduser("~/.ssh/id_ed25519_hermes")
DEPLOY_DIR = "/srv/www/lollipop/current"

def ensure_remote_dir(sftp, remote_path):
    parts = remote_path.strip("/").split("/")
    path = ""
    for part in parts:
        path += "/" + part
        try:
            sftp.stat(path)
        except IOError:
            try:
                sftp.mkdir(path)
            except IOError:
                pass

def upload_all_html(sftp, local_base, remote_base):
    count = 0
    for root, dirs, files in os.walk(local_base):
        for f in files:
            if f.endswith(".html"):
                local_path = os.path.join(root, f)
                rel_path = os.path.relpath(local_path, local_base).replace("\\", "/")
                remote_path = f"{remote_base}/{rel_path}"
                remote_dir = os.path.dirname(remote_path)
                ensure_remote_dir(sftp, remote_dir)
                sftp.put(local_path, remote_path)
                count += 1
                if count % 30 == 0:
                    print(f"  ...{count} files uploaded")
    return count

def main():
    print("Connecting...")
    transport = paramiko.Transport((HOST, 22))
    transport.set_keepalive(10)
    pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
    transport.connect(username=USER, pkey=pkey)
    sftp = paramiko.SFTPClient.from_transport(transport)

    print("Uploading ALL HTML files from dist/...")
    total = upload_all_html(sftp, "dist", DEPLOY_DIR)
    print(f"  Total: {total} HTML files uploaded")

    # Also upload all new assets (overwrite)
    print("\nUploading ALL asset files...")
    asset_count = 0
    for f in os.listdir("dist/assets"):
        sftp.put(f"dist/assets/{f}", f"{DEPLOY_DIR}/assets/{f}")
        asset_count += 1
    print(f"  Total: {asset_count} asset files uploaded")

    sftp.close()
    transport.close()
    print("\nDone!")

if __name__ == "__main__":
    main()
