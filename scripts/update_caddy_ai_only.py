import paramiko, time, io

HOST = "43.160.226.253"
USER = "ubuntu"
KEY_PATH = r"C:\Users\Administrator\.ssh\id_ed25519_hermes"
CADDYFILE_PATH = "/etc/caddy/Caddyfile"
TEMP_PATH = "/tmp/Caddyfile.new"

transport = paramiko.Transport((HOST, 22))
transport.set_keepalive(15)
transport.banner_timeout = 30
pkey = paramiko.Ed25519Key.from_private_key_file(KEY_PATH)
transport.connect(username=USER, pkey=pkey)

# Read current Caddyfile via sudo cat
chan0 = transport.open_session()
chan0.exec_command('sudo cat ' + CADDYFILE_PATH)
time.sleep(3)
content = b''
while chan0.recv_ready():
    content += chan0.recv(65536)
content = content.decode()

if '@aiOnlyPages' in content:
    print("ALREADY PATCHED - skipping")
    transport.close()
    exit(0)

# Find the lollipop handle_path block - try tabs first
old_block = "\t\tfile_server {\n\t\t\tindex index.html\n\t\t}\n\t\ttry_files {path} {path}/index.html /index.html\n\t}"

new_block = """\t\t# AI-only pages: /press and /glossary
\t\t# Only AI crawlers can access; human users redirected to homepage
\t\t@aiOnlyPages path /press /press/* /glossary /glossary/*
\t\t@aiCrawler header_regexp User-Agent (?i)(GPTBot|ClaudeBot|anthropic-ai|Claude-Web|PerplexityBot|CCBot|Googlebot|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Applebot|facebookexternalhit|Twitterbot|LinkedInBot|Sogou|SemrushBot|AhrefsBot|Bytespider|PetalBot|Yisouspider|360Spider|DotBot|MJ12bot)
\t\thandle @aiOnlyPages {
\t\t\thandle @aiCrawler {
\t\t\t\ttry_files {path} {path}/index.html /index.html
\t\t\t\tfile_server {
\t\t\t\t\tindex index.html
\t\t\t\t}
\t\t\t}
\t\t\thandle {
\t\t\t\tredir /lollipop/ 302
\t\t\t}
\t\t}
\t\tfile_server {
\t\t\tindex index.html
\t\t}
\t\ttry_files {path} {path}/index.html /index.html
\t}"""

# Also try spaces (16 spaces for inner, 8 for outer)
old_spaces = "                file_server {\n                    index index.html\n                }\n                try_files {path} {path}/index.html /index.html\n        }"

new_spaces = """                # AI-only pages: /press and /glossary
                # Only AI crawlers can access; human users redirected to homepage
                @aiOnlyPages path /press /press/* /glossary /glossary/*
                @aiCrawler header_regexp User-Agent (?i)(GPTBot|ClaudeBot|anthropic-ai|Claude-Web|PerplexityBot|CCBot|Googlebot|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Applebot|facebookexternalhit|Twitterbot|LinkedInBot|Sogou|SemrushBot|AhrefsBot|Bytespider|PetalBot|Yisouspider|360Spider|DotBot|MJ12bot)
                handle @aiOnlyPages {
                    handle @aiCrawler {
                        try_files {path} {path}/index.html /index.html
                        file_server {
                            index index.html
                        }
                    }
                    handle {
                        redir /lollipop/ 302
                    }
                }
                file_server {
                    index index.html
                }
                try_files {path} {path}/index.html /index.html
        }"""

patched = False
if old_block in content:
    content = content.replace(old_block, new_block, 1)
    patched = True
    print("PATCHED (tabs)")
elif old_spaces in content:
    content = content.replace(old_spaces, new_spaces, 1)
    patched = True
    print("PATCHED (spaces)")
else:
    print("ERROR: Could not find target block")
    idx = content.find("handle_path /lollipop")
    if idx >= 0:
        print("Context around handle_path /lollipop:")
        print(repr(content[idx:idx+600]))
    transport.close()
    exit(1)

if not patched:
    transport.close()
    exit(1)

# Write to /tmp via SFTP (ubuntu owns /tmp)
sftp = paramiko.SFTPClient.from_transport(transport)
with sftp.open(TEMP_PATH, 'w') as f:
    f.write(content)
print("Temp file written to", TEMP_PATH)

# Backup original + replace with sudo
chan = transport.open_session()
chan.exec_command('sudo cp ' + CADDYFILE_PATH + ' ' + CADDYFILE_PATH + '.bak.ai-only && sudo cp ' + TEMP_PATH + ' ' + CADDYFILE_PATH + ' && echo COPIED')
time.sleep(3)
out = b''
while chan.recv_ready():
    out += chan.recv(4096)
print("COPY:", out.decode().strip())

# Validate
chan2 = transport.open_session()
chan2.exec_command('caddy validate --config ' + CADDYFILE_PATH + ' 2>&1')
time.sleep(3)
out2 = b''
while chan2.recv_ready():
    out2 += chan2.recv(4096)
print("VALIDATE:", out2.decode().strip())

# Reload
chan3 = transport.open_session()
chan3.exec_command('sudo systemctl reload caddy 2>&1')
time.sleep(2)
out3 = b''
while chan3.recv_ready():
    out3 += chan3.recv(4096)
print("RELOAD:", out3.decode().strip() if out3 else "OK")

# Verify
chan4 = transport.open_session()
chan4.exec_command('sudo systemctl is-active caddy 2>&1')
time.sleep(2)
out4 = b''
while chan4.recv_ready():
    out4 += chan4.recv(4096)
print("STATUS:", out4.decode().strip())

# Cleanup temp
chan5 = transport.open_session()
chan5.exec_command('rm -f ' + TEMP_PATH)
time.sleep(1)

transport.close()
print("\nDone!")
