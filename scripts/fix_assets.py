import paramiko, os, sys, time

HOST = "43.160.226.253"
USER = "ubuntu"
KEY_PATH = os.path.expanduser("~/.ssh/id_ed25519_hermes")
DEPLOY_DIR = "/srv/www/lollipop/current"

def main():
    print("Connecting to server...")
    transport = paramiko.Transport((HOST, 22))
    transport.set_keepalive(10)
    pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
    transport.connect(username=USER, pkey=pkey)
    sftp = paramiko.SFTPClient.from_transport(transport)

    # Check if assets dir exists and how many files
    print("Checking server assets directory...")
    try:
        remote_files = sftp.listdir(f"{DEPLOY_DIR}/assets")
        print(f"  Server has {len(remote_files)} files in assets/")
        # Check for specific CSS/JS files
        css_found = [f for f in remote_files if f.endswith('.css')]
        js_found = [f for f in remote_files if f.endswith('.js')]
        print(f"  CSS files: {css_found[:5]}")
        print(f"  JS files: {js_found[:5]}")
    except IOError:
        print("  assets/ directory does NOT exist on server!")
        # Create it
        print("  Creating assets/ directory...")
        sftp.mkdir(f"{DEPLOY_DIR}/assets")
        remote_files = []

    # Upload all files from local dist/assets to server
    local_assets = "dist/assets"
    local_files = os.listdir(local_assets)
    print(f"\nUploading {len(local_files)} files from {local_assets}/...")

    uploaded = 0
    skipped = 0
    for fname in local_files:
        local_path = os.path.join(local_assets, fname)
        remote_path = f"{DEPLOY_DIR}/assets/{fname}"

        # Check if file already exists with same size
        try:
            local_size = os.path.getsize(local_path)
            remote_stat = sftp.stat(remote_path)
            if remote_stat.st_size == local_size:
                skipped += 1
                continue
        except IOError:
            pass

        # Upload
        file_size = os.path.getsize(local_path)
        sftp.put(local_path, remote_path)
        uploaded += 1
        if uploaded % 10 == 0:
            print(f"  Uploaded {uploaded}/{len(local_files)} files...")

    print(f"  Done: {uploaded} uploaded, {skipped} already existed")

    # Also check and upload other key files
    key_files = [
        "index.html",
        "sitemap.xml",
        "llms.txt",
        "llms-full.txt",
        "robots.txt",
    ]
    print("\nChecking key files...")
    for fname in key_files:
        local_path = f"dist/{fname}"
        remote_path = f"{DEPLOY_DIR}/{fname}"
        if os.path.exists(local_path):
            local_size = os.path.getsize(local_path)
            try:
                remote_stat = sftp.stat(remote_path)
                if remote_stat.st_size == local_size:
                    print(f"  {fname}: already correct ({local_size} bytes)")
                    continue
            except IOError:
                pass
            print(f"  {fname}: uploading ({local_size} bytes)")
            sftp.put(local_path, remote_path)
        else:
            print(f"  {fname}: not in dist, skipping")

    sftp.close()
    transport.close()

    # Verify via HTTP
    print("\nVerifying via HTTP...")
    import subprocess
    result = subprocess.run(
        ["curl.exe", "-s", "-o", "/dev/null", "-w", "%{http_code} %{content_type}",
         "http://43.160.226.253/lollipop/assets/index-Byklkf7R.css"],
        capture_output=True, text=True, timeout=10
    )
    print(f"  CSS file: {result.stdout}")

    result = subprocess.run(
        ["curl.exe", "-s", "-o", "/dev/null", "-w", "%{http_code} %{content_type}",
         "http://43.160.226.253/lollipop/blog"],
        capture_output=True, text=True, timeout=10
    )
    print(f"  Blog page: {result.stdout}")

    print("\nDone!")

if __name__ == "__main__":
    main()
