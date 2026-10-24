import paramiko, sys, time, subprocess
sys.stdout.reconfigure(line_buffering=True)
HOST = "43.160.226.253"; USER = "ubuntu"; KEY_PATH = "C:/Users/Administrator/.ssh/id_ed25519_hermes"
pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)

def ssh():
    c = paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(HOST, username=USER, pkey=pkey, timeout=30); return c

c = ssh()
def run(cmd, t=60):
    _, out, err = c.exec_command(cmd, timeout=t)
    return out.read().decode("utf-8","ignore").strip()

print("tcpdump present:", run("which tcpdump || echo MISSING"))
print("launch capture...")
run("sudo bash -c \"nohup timeout 18 tcpdump -n -i any 'tcp[tcpflags] & tcp-syn != 0 and (dst port 80 or dst port 443)' > /tmp/cap.txt 2>&1 &\" ; echo started")
c.close()

time.sleep(2)
print("firing public requests...")
for u in ["https://www.lollipop.im/", "https://www.lollipop.im/about/",
          "https://www.lollipop.im/zh/", "https://www.lollipop.im/robots.txt",
          "https://www.lollipop.im/sitemap.xml"]:
    subprocess.run(["curl.exe","-sS","-o","NUL","--max-time","15",u], capture_output=True)
    print("  hit", u)

time.sleep(18)
c = ssh()
print("\n===== capture (SYN to :80/:443 on this host) =====")
print(run("sudo cat /tmp/cap.txt 2>/dev/null | head -60"))
print("===== unique source IPs =====")
print(run("sudo cat /tmp/cap.txt 2>/dev/null | grep -oE 'IP [0-9.]+' | sort | uniq -c | sort -rn | head -30"))
c.close(); print("DONE")
