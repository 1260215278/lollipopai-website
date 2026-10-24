import paramiko, sys
sys.stdout.reconfigure(line_buffering=True)
HOST = "43.160.226.253"; USER = "ubuntu"; KEY_PATH = "C:/Users/Administrator/.ssh/id_ed25519_hermes"
pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
c = paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, username=USER, pkey=pkey, timeout=30)

def run(cmd, t=40):
    _, out, err = c.exec_command(cmd, timeout=t)
    o = out.read().decode("utf-8", "ignore")
    e = err.read().decode("utf-8", "ignore")
    return (o + ("\n[stderr] " + e if e.strip() else "")).strip()

print("===== 1. deploy layout =====")
print(run("ls -la /srv/www/lollipop/ ; echo '--- current ->'; readlink -f /srv/www/lollipop/current"))
print("===== 2. assets in current =====")
print(run("ls /srv/www/lollipop/current/assets/ | grep -E '^(index-|vendor-react-)' | head -20"))
print("===== 3. current index.html =====")
print(run("grep -oE '/assets/(index|vendor-react)-[A-Za-z0-9_-]+\\.js' /srv/www/lollipop/current/index.html | sort -u ; echo '--- stat'; stat -c '%y  %n' /srv/www/lollipop/current/index.html"))
print("===== 4. search old asset on disk =====")
print(run("sudo find /srv /var/www /usr/share -name 'index-PFVAtkZ3.js' 2>/dev/null | head; echo '(end)'"))
print("===== 5. other web roots =====")
print(run("ls -la /srv/www/ 2>/dev/null"))
print("===== 6. caddy: recent external connections on :443 =====")
print(run("sudo ss -tn state established '( sport = :443 )' 2>/dev/null | head -40"))
print("===== 7. caddy journal tail =====")
print(run("sudo journalctl -u caddy -n 25 --no-pager 2>/dev/null"))
c.close(); print("DONE")
