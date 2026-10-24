import paramiko, sys
sys.stdout.reconfigure(line_buffering=True)

HOST = "43.160.226.253"; USER = "ubuntu"; KEY_PATH = "C:/Users/Administrator/.ssh/id_ed25519_hermes"
pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
c = paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, username=USER, pkey=pkey, timeout=30)

def run(cmd):
    _, out, err = c.exec_command(cmd, timeout=60)
    return out.read().decode("utf-8", "ignore").strip()

cmds = [
    ("find old asset index-PFVAtkZ3.js", "sudo find /srv /var/www /home /opt -name 'index-PFVAtkZ3.js' 2>/dev/null | head; find /srv /var/www /home -name 'index-PFVAtkZ3.js' 2>/dev/null | head"),
    ("lollipop dirs", "ls -la /srv/www/lollipop/ 2>/dev/null; echo '---'; ls -la /srv/www/lollipop/current/ 2>/dev/null | head -20"),
    ("var www lollipop", "ls -la /var/www/lollipop/ 2>/dev/null | head"),
    ("all lollipop index.html", "find /srv /var/www /home -maxdepth 5 -path '*lollipop*' -name 'index.html' 2>/dev/null | head -20"),
    ("current symlink target", "readlink -f /srv/www/lollipop/current"),
    ("releases dir", "ls -lat /srv/www/lollipop/ 2>/dev/null | head -20"),
    ("catchall blocks", "grep -nE '^:(80|443)|^http://|^https://|handle \\{|handle_path' /etc/caddy/Caddyfile | head -40"),
]
for label, cmd in cmds:
    print(f"===== {label} =====")
    print(run(cmd) or "(empty)")

c.close(); print("DONE")
