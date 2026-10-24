import paramiko, sys, time, subprocess
sys.stdout.reconfigure(line_buffering=True)
HOST = "43.160.226.253"; USER = "ubuntu"; KEY_PATH = "C:/Users/Administrator/.ssh/id_ed25519_hermes"
pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)

def ssh(host=HOST, user=USER, key=KEY_PATH):
    p = paramiko.Ed25519Key.from_private_key_file(key)
    c = paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(host, username=user, pkey=p, timeout=30); return c

c = ssh()
def run(cmd, t=60):
    _, out, err = c.exec_command(cmd, timeout=t)
    return (out.read().decode("utf-8","ignore") + err.read().decode("utf-8","ignore")).strip()

print("===== cloudflared / tunnel / proxies =====")
print(run("ps -ef | grep -iE 'cloudflare|tunnel|frpc|nginx|zhanqun' | grep -v grep | head"))
print("===== zhanqun process details =====")
print(run("sudo ls -l /proc/3991647/cwd 2>/dev/null; sudo tr '\\0' ' ' < /proc/3991647/cmdline 2>/dev/null; echo; sudo readlink /proc/3991647/exe 2>/dev/null"))
print("===== :8080 with Host www.lollipop.im (body) =====")
print(run("curl -s --max-time 6 -H 'Host: www.lollipop.im' http://127.0.0.1:8080/ | head -c 300; echo; echo '--- headers'; curl -sI --max-time 6 -H 'Host: www.lollipop.im' http://127.0.0.1:8080/ | head -10"))
print("===== :8080 other hosts =====")
for h in ["lollipop.im", "0yuan.top", "aigeo.store"]:
    print(f"  {h}:", run(f"curl -s --max-time 5 -H 'Host: {h}' http://127.0.0.1:8080/ | head -c 120"))

print("\n===== launching broad SYN capture =====")
run("sudo bash -c \"nohup timeout 18 tcpdump -n -i eth0 'tcp[tcpflags] & tcp-syn != 0 and src net not 10.0.0.0/8 and dst host 43.160.226.253' > /tmp/cap2.txt 2>&1 &\" ; echo ok")
c.close()

time.sleep(2)
print("firing public requests (through Cloudflare)...")
for u in ["https://www.lollipop.im/","https://www.lollipop.im/about/","https://www.lollipop.im/zh/",
          "https://www.lollipop.im/robots.txt","https://www.lollipop.im/assets/index-PFVAtkZ3.js"]:
    subprocess.run(["curl.exe","-sS","-o","NUL","--max-time","15",u], capture_output=True)
time.sleep(17)

c = ssh()
print("\n===== broad capture =====")
print(run("sudo cat /tmp/cap2.txt 2>/dev/null | grep -vE '169.254|10.3.0.3' | head -40"))
print("--- distinct source IPs ---")
print(run("sudo cat /tmp/cap2.txt 2>/dev/null | grep -oE 'IP [0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+' | awk '{print $2}' | sort | uniq -c | sort -rn | head -30"))
c.close(); print("DONE")
