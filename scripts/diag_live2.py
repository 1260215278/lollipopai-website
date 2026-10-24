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
    ("lollipop lines in Caddyfile", "grep -n 'lollipop' /etc/caddy/Caddyfile"),
    ("site block headers", "grep -nE '^[a-z0-9.*{}$-]+\\.(im|top|site|store|com)[ ,{]' /etc/caddy/Caddyfile | head -30"),
    ("global block top", "sed -n '1,12p' /etc/caddy/Caddyfile"),
    ("hermes env CF vars", "grep -iE 'cloud|cf_|zone|api|token' /home/ubuntu/.hermes/.env 2>/dev/null | sed 's/=.*/=<redacted>/' | head -20"),
    ("CF config files", "find /home/ubuntu /etc -maxdepth 4 \\( -name '*cloudflare*' -o -name 'wrangler*' -o -name '.cloudflared*' \\) 2>/dev/null | head -10"),
    ("cloudflared installed", "which cloudflared 2>/dev/null; systemctl is-active cloudflared 2>/dev/null"),
    ("all env files w/ CF", "grep -rliE 'CLOUDFLARE_API|CF_API_TOKEN|CF_ZONE' /home/ubuntu 2>/dev/null | head -10"),
    ("confirm public vs origin", "echo -n 'public: '; curl -s https://www.lollipop.im/zh/ | grep -o '<title>[^<]*</title>' | head -1; echo -n 'origin: '; curl -s -k --resolve www.lollipop.im:443:127.0.0.1 https://www.lollipop.im/zh/ | grep -o '<title>[^<]*</title>' | head -1"),
    ("Caddyfile backup/git", "ls -la /etc/caddy/ 2>/dev/null"),
]

for label, cmd in cmds:
    try:
        _, out, err = c.exec_command(cmd, timeout=30)
        o = out.read().decode("utf-8", "ignore").strip()
        e = err.read().decode("utf-8", "ignore").strip()
        print(f"===== {label} =====")
        print(o if o else "(empty)")
        if e:
            print("[stderr]", e[:250])
    except Exception as ex:
        print(f"===== {label} ===== EXC {ex}")

c.close()
print("DONE")
