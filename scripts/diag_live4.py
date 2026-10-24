import paramiko, re, sys
sys.stdout.reconfigure(line_buffering=True)

HOST = "43.160.226.253"; USER = "ubuntu"; KEY_PATH = "C:/Users/Administrator/.ssh/id_ed25519_hermes"
pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
c = paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, username=USER, pkey=pkey, timeout=30)

def run(cmd):
    _, out, err = c.exec_command(cmd, timeout=35)
    return out.read().decode("utf-8", "ignore")

print("########## Caddyfile lines 1-133 ##########")
print(run("sed -n '1,133p' /etc/caddy/Caddyfile"))

print("\n########## origin :80 with Host www.lollipop.im ##########")
for p in ["/", "/zh/about/", "/about/"]:
    body = run(f"curl -s -H 'Host: www.lollipop.im' http://127.0.0.1{p}")
    title = re.findall(r"<title>(.*?)</title>", body, re.S)
    canon = re.findall(r'rel="canonical" href="([^"]+)"', body)
    assets = sorted(set(re.findall(r'/assets/index-[A-Za-z0-9._-]+\.js', body)))
    print(f"  {p}: title={title[0][:60] if title else 'NONE'} canon={canon[0] if canon else 'NONE'} assets={assets}")

print("\n########## origin :443 with Host (insecure) ##########")
body = run("curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/")
print("  root assets:", sorted(set(re.findall(r'/assets/index-[A-Za-z0-9._-]+\.js', body))))

print("\n########## all roots referenced ##########")
print(run("grep -n 'root \\*' /etc/caddy/Caddyfile"))

c.close(); print("DONE")
