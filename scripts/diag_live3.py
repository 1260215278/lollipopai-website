import paramiko, re, sys
sys.stdout.reconfigure(line_buffering=True)

HOST = "43.160.226.253"
USER = "ubuntu"
KEY_PATH = "C:/Users/Administrator/.ssh/id_ed25519_hermes"

pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, username=USER, pkey=pkey, timeout=30)

def run(cmd):
    _, out, err = c.exec_command(cmd, timeout=30)
    return out.read().decode("utf-8", "ignore").strip()

PUB = "https://www.lollipop.im/"
ORIG = "https://www.lollipop.im/"  # with --resolve to 127.0.0.1

for label, cmd in [
    ("PUBLIC root", f"curl -s {PUB}"),
    ("ORIGIN root", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/"),
    ("PUBLIC headers", f"curl -sI {PUB}"),
]:
    body = run(cmd)
    title = re.findall(r"<title>(.*?)</title>", body, re.S)
    canon = re.findall(r'rel="canonical" href="([^"]+)"', body)
    assets = re.findall(r'/assets/[A-Za-z0-9._-]+\.js', body)
    cjk = len(re.findall(r"[\u4e00-\u9fff]", body))
    print(f"===== {label} =====")
    print("  title:", title[0][:80] if title else "NONE")
    print("  canonical:", canon[0] if canon else "NONE")
    print("  cjk:", cjk)
    print("  assets:", sorted(set(assets))[:6])
    if "headers" in label:
        for line in body.split("\n"):
            if re.match(r"(?i)^(server|cf-|location|strict|x-)", line):
                print("  ", line.strip())

# deployed root index.html asset refs
dep = run("grep -o '/assets/[A-Za-z0-9._-]*\\.js' /srv/www/lollipop/current/index.html | sort -u | head -6")
print("===== DEPLOYED root index.html assets =====")
print(dep)

c.close()
print("DONE")
