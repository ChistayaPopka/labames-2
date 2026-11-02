#!/usr/bin/env bash
set -euo pipefail

upload=/root/fedor-site-transfer-20261101
site=/opt/fedor-site

if [ -e "$site" ]; then
    echo "Target already exists; leaving it unchanged: $site" >&2
    exit 1
fi
if docker container inspect fedor-site-web >/dev/null 2>&1; then
    echo "Container name is already in use; leaving it unchanged." >&2
    exit 1
fi

install -d -m 755 "$site" "$site/public"
install -d -m 700 "$site/source"
tar -xzf "$upload/fedor-server.tar.gz" -C "$site/public"
tar -xzf "$upload/fedor-source.tar.gz" -C "$site/source"
install -m 644 "$upload/compose.yaml" "$site/compose.yaml"
install -m 644 "$upload/nginx.conf" "$site/nginx.conf"
install -m 644 "$upload/README.md" "$site/README.md"
find "$site/public" -type d -exec chmod 755 {} +
find "$site/public" -type f -exec chmod 644 {} +

cd "$site"
docker compose config --quiet
docker compose run --rm --no-deps web nginx -t
ufw allow 80/tcp comment 'Fedor personal website'
docker compose up -d

for attempt in $(seq 1 20); do
    if curl -fsS http://127.0.0.1/ -o /dev/null; then
        break
    fi
    sleep 1
done
curl -fsS http://127.0.0.1/ -o /dev/null
curl -fsS http://127.0.0.1/play/ -o /dev/null
docker compose ps
