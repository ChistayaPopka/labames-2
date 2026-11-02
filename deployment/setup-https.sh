#!/usr/bin/env bash
# Configure only /opt/fedor-site; the VPN and host port 443 are untouched.
set -euo pipefail

site=/opt/fedor-site
domain=fedyasite.duckdns.org
email=${1:-}
certbot_image=certbot/certbot

if [ "$(id -u)" -ne 0 ] || [[ "$email" != *@*.* ]]; then
    echo "Usage: sudo bash setup-https.sh your-email@example.com" >&2
    exit 1
fi
for command in docker curl ss systemctl; do
    command -v "$command" >/dev/null || { echo "Missing: $command" >&2; exit 1; }
done
cd "$site"
test -f compose.yaml
test -f nginx.conf
test -f public/index.html
docker compose version >/dev/null
test "$(docker inspect -f '{{.State.Running}}' fedor-site-web)" = true
test "$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}' fedor-site-web)" = fedor-site
if [ -n "$(ss -H -ltn 'sport = :8443')" ] || [ -n "$(docker ps -q --filter publish=8443)" ]; then
    echo "Port 8443 is already in use. No configuration was changed." >&2
    exit 1
fi
for target in compose.https.yaml renew-https.sh /etc/systemd/system/fedor-site-cert-renew.service /etc/systemd/system/fedor-site-cert-renew.timer; do
    if [ -e "$target" ]; then
        echo "Already exists; inspect before continuing: $target" >&2
        exit 1
    fi
done

backup="$site/backup-http-$(date +%Y%m%d-%H%M%S)"
mkdir -m 700 "$backup"
cp -p compose.yaml nginx.conf "$backup/"
echo "Backup: $backup"

# HTTP-01 uses the existing web server on port 80. No port is published by Certbot.
install -d -m 700 "$site/letsencrypt"
install -d -m 755 "$site/public/.well-known/acme-challenge"
probe="https-setup-$(date +%s)-$$"
printf '%s' "$probe" > "$site/public/.well-known/acme-challenge/$probe"
if [ "$(curl --noproxy '*' -fsS --max-time 20 "http://$domain/.well-known/acme-challenge/$probe")" != "$probe" ]; then
    echo "HTTP challenge check failed. Check DNS and public access on port 80." >&2
    exit 1
fi
docker run --rm \
    -v "$site/letsencrypt:/etc/letsencrypt" \
    -v "$site/public:/var/www/html" \
    "$certbot_image" certonly --webroot -w /var/www/html \
    --cert-name "$domain" -d "$domain" \
    --email "$email" --agree-tos --non-interactive

# Restore HTTP if validation or activation fails.
activation_attempted=false
rollback() {
    result=$?
    trap - ERR
    cat "$backup/nginx.conf" > "$site/nginx.conf"
    if [ -f "$site/compose.https.yaml" ]; then
        mv "$site/compose.https.yaml" "$backup/failed-compose.https.yaml"
    fi
    if [ "$activation_attempted" = true ]; then
        docker compose -f compose.yaml up -d --no-deps web || true
    fi
    echo "HTTPS setup failed; restored the HTTP configuration. Backup: $backup" >&2
    exit "$result"
}
trap rollback ERR

cat > compose.https.yaml <<'YAML'
services:
  web:
    ports:
      - "8443:8443"
    volumes:
      - ./letsencrypt:/etc/letsencrypt:ro
YAML

cat > nginx.conf <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name fedyasite.duckdns.org;
    server_tokens off;

    # This must stay on HTTP: ACME does not follow redirects to port 8443.
    location ^~ /.well-known/acme-challenge/ {
        root /usr/share/nginx/html;
        default_type text/plain;
        try_files $uri =404;
    }
    location / {
        return 302 https://fedyasite.duckdns.org:8443$request_uri;
    }
}

server {
    listen 8443 ssl;
    listen [::]:8443 ssl;
    server_name fedyasite.duckdns.org;
    ssl_certificate /etc/letsencrypt/live/fedyasite.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fedyasite.duckdns.org/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /usr/share/nginx/html;
    index index.html;
    server_tokens off;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;

    location / {
        try_files $uri $uri/ =404;
        add_header Cache-Control "no-cache";
    }
    location /_next/static/ {
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    error_page 404 /404.html;
    location = /404.html {
        internal;
    }
}
NGINX

docker compose -f compose.yaml -f compose.https.yaml config --quiet
docker compose -f compose.yaml -f compose.https.yaml run --rm --no-deps web nginx -t
if command -v ufw >/dev/null && ufw status | grep -q '^Status: active'; then
    ufw allow 8443/tcp comment 'Fedor website HTTPS'
fi
activation_attempted=true
docker compose -f compose.yaml -f compose.https.yaml up -d --no-deps web
for attempt in {1..20}; do
    if curl --noproxy '*' -fsS --max-time 5 \
        --resolve "$domain:8443:127.0.0.1" "https://$domain:8443/" -o /dev/null; then
        break
    fi
    sleep 1
done
curl --noproxy '*' -fsS --max-time 10 \
    --resolve "$domain:8443:127.0.0.1" "https://$domain:8443/play/" -o /dev/null
trap - ERR

cat > renew-https.sh <<'RENEW'
#!/usr/bin/env bash
set -euo pipefail
docker run --rm \
    -v /opt/fedor-site/letsencrypt:/etc/letsencrypt \
    -v /opt/fedor-site/public:/var/www/html \
    certbot/certbot renew --cert-name fedyasite.duckdns.org "$@"
docker exec fedor-site-web nginx -t
docker exec fedor-site-web nginx -s reload
RENEW
chmod 700 renew-https.sh

cat > /etc/systemd/system/fedor-site-cert-renew.service <<'SERVICE'
[Unit]
Description=Renew the Fedor website TLS certificate and reload its Nginx
Wants=network-online.target
After=network-online.target docker.service

[Service]
Type=oneshot
ExecStart=/bin/bash /opt/fedor-site/renew-https.sh --quiet
SERVICE

cat > /etc/systemd/system/fedor-site-cert-renew.timer <<'TIMER'
[Unit]
Description=Check the Fedor website TLS certificate twice daily

[Timer]
OnCalendar=*-*-* 00,12:00:00
RandomizedDelaySec=1800
Persistent=true

[Install]
WantedBy=timers.target
TIMER

systemctl daemon-reload
systemctl enable --now fedor-site-cert-renew.timer
bash "$site/renew-https.sh" --dry-run
echo "Ready: https://$domain:8443/"
echo "If external access is blocked, allow inbound TCP 8443 in your hosting firewall."
echo "Backup: $backup"
