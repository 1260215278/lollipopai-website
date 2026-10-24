import paramiko, sys
sys.stdout.reconfigure(line_buffering=True)

HOST = "43.160.226.253"
USER = "ubuntu"
KEY_PATH = "C:/Users/Administrator/.ssh/id_ed25519_hermes"

pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, username=USER, pkey=pkey, timeout=30)

cmds = [
    ("listeners 80/443", "sudo ss -tlnp 2>/dev/null | grep -E ':(80|443)\\b' || ss -tlnp | grep -E ':(80|443)\\b'"),
    ("caddy/nginx active", "systemctl is-active caddy 2>&1; systemctl is-active nginx 2>&1"),
    ("origin title /zh/about/", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/zh/about/ | grep -o '<title>[^<]*</title>' | head -1"),
    ("public title /zh/about/", "curl -s https://www.lollipop.im/zh/about/ | grep -o '<title>[^<]*</title>' | head -1"),
    ("origin canonical /zh/about/", "curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/zh/about/ | grep -o 'rel=\"canonical\" href=\"[^\"]*\"' | head -1"),
    ("public canonical /zh/about/", "curl -s https://www.lollipop.im/zh/about/ | grep -o 'rel=\"canonical\" href=\"[^\"]*\"' | head -1"),
    ("deployed file canonical", "grep -o 'rel=\"canonical\" href=\"[^\"]*\"' /srv/www/lollipop/current/zh/about/index.html 2>/dev/null | head -1; ls -la /srv/www/lollipop/current/zh/about/index.html 2>/dev/null"),
    ("public redirect /zh/about", "curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\\n' https://www.lollipop.im/zh/about"),
    ("dns", "dig +short www.lollipop.im; dig +short lollipop.im"),
    ("Caddyfile path", "ls -la /etc/caddy/Caddyfile 2>/dev/null; head -5 /etc/caddy/Caddyfile 2>/dev/null"),
    ("Caddyfile lang/zh rules", "grep -niE 'lang|/zh|strip_prefix|redir' /etc/caddy/Caddyfile 2>/dev/null | head -40"),
    ("nginx exists", "ls -d /etc/nginx 2>/dev/null; grep -rniE 'lang=|/zh/' /etc/nginx 2>/dev/null | head -20"),
    ("proxy env", "env | grep -i proxy"),
]

for label, cmd in cmds:
    try:
        _, out, err = c.exec_command(cmd, timeout=25)
        o = out.read().decode("utf-8", "ignore").strip()
        e = err.read().decode("utf-8", "ignore").strip()
        print(f"===== {label} =====")
        print(o if o else "(empty)")
        if e and "sudo" not in cmd:
            print("[stderr]", e[:300])
    except Exception as ex:
        print(f"===== {label} ===== EXC {ex}")

c.close()
print("DONE")
