import paramiko, re, sys
sys.stdout.reconfigure(line_buffering=True)
HOST = "43.160.226.253"; USER = "ubuntu"; KEY_PATH = "C:/Users/Administrator/.ssh/id_ed25519_hermes"
pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
c = paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, username=USER, pkey=pkey, timeout=30)
def run(cmd, t=40):
    _, out, err = c.exec_command(cmd, timeout=t)
    return out.read().decode("utf-8", "ignore").strip()

print("===== listeners =====")
print(run("sudo ss -tlnp | grep -vE '127.0.0.1:22|:25|:53' | head -40"))
for port in [8080, 8081, 3000, 8000, 5000, 9000]:
    body = run(f"curl -s --max-time 6 -H 'Host: www.lollipop.im' http://127.0.0.1:{port}/ 2>/dev/null")
    if body:
        title = re.findall(r"<title>(.*?)</title>", body, re.S)
        asset = re.findall(r'/assets/index-[A-Za-z0-9._-]+\.js', body)
        print(f"  :{port} len={len(body)} title={title[0][:60] if title else 'NONE'} asset={sorted(set(asset))}")
    else:
        print(f"  :{port} (no response)")
print("===== :80 Host www.lollipop.im status/headers =====")
print(run("curl -sI -H 'Host: www.lollipop.im' http://127.0.0.1/ 2>&1 | head -8"))
c.close(); print("DONE")
