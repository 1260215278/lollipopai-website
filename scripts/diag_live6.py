import paramiko, sys
sys.stdout.reconfigure(line_buffering=True)
HOST = "43.160.226.253"; USER = "ubuntu"; KEY_PATH = "C:/Users/Administrator/.ssh/id_ed25519_hermes"
pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
c = paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, username=USER, pkey=pkey, timeout=30)
def run(cmd, t=90):
    _, out, err = c.exec_command(cmd, timeout=t)
    return out.read().decode("utf-8", "ignore").strip()

cmds = [
    ("find PFVAtkZ3 whole FS", "sudo find / -name 'index-PFVAtkZ3.js' 2>/dev/null | head -5; echo '---DMQ2vJKB---'; sudo find / -name 'vendor-react-DMQ2vJKB.js' 2>/dev/null | head -5"),
    ("_root contents", "sudo ls -la /srv/www/_root/ 2>/dev/null | head -20"),
    ("index.html asset per dir", "for d in /srv/www/_root /var/www/lollipop /srv/www/lollipop/current; do echo \"[$d]\"; grep -o '/assets/index-[A-Za-z0-9._-]*\\.js' $d/index.html 2>/dev/null | head -1; done"),
    ("var/www/lollipop assets count", "ls /var/www/lollipop/assets/ 2>/dev/null | wc -l; ls /var/www/lollipop/assets/ 2>/dev/null | grep 'index-' | head"),
    ("srv current assets count", "ls /srv/www/lollipop/current/assets/ 2>/dev/null | wc -l; ls /srv/www/lollipop/current/assets/ 2>/dev/null | grep 'index-' | head"),
    ("Caddyfile 220-320", "sudo sed -n '220,320p' /etc/caddy/Caddyfile"),
]
for label, cmd in cmds:
    print(f"===== {label} =====")
    print(run(cmd) or "(empty)")
c.close(); print("DONE")
