# Размещение на сервере

Адрес: http://193.164.128.108/

Сайт находится в `/opt/fedor-site/public`, исходники — в `/opt/fedor-site/source`.
Конфигурация Nginx: `/opt/fedor-site/nginx.conf`.
Контейнер: `fedor-site-web`, проект Docker Compose: `fedor-site`.

Контейнер автоматически запускается после перезагрузки сервера.
Другие контейнеры и сервис на порту 443 не изменяются.

Команды на сервере:

```bash
cd /opt/fedor-site
docker compose ps
docker compose logs --tail 50 web
docker compose restart web
```

Для обновления: собрать проект через `npm.cmd run build`, загрузить содержимое
`out/` в `public/`. Исходники и SSH-ключи в публичную папку не загружать.

## HTTPS на порту 8443

Домен: `fedyasite.duckdns.org`. Порт 443 занят личным VPN и не изменяется.
Скрипт `setup-https.sh` предназначен для существующего развёртывания в
`/opt/fedor-site` на Linux с Docker Compose и systemd.

В PowerShell на своём компьютере:

```powershell
scp E:\umbrellaload\deployment\setup-https.sh root@193.164.128.108:/root/setup-https.sh
ssh root@193.164.128.108
```

В SSH-сессии заменить адрес почты своим и запустить:

```bash
bash /root/setup-https.sh your-email@example.com
```

Запуск принимает условия Let’s Encrypt для выпуска сертификата. Скрипт проверяет,
что порт 8443 свободен, сохраняет конфигурацию сайта в `backup-http-*`, получает
сертификат через порт 80 и пересоздаёт только контейнер `fedor-site-web`.
Если проверка или включение Nginx завершается ошибкой, восстанавливается HTTP.
Ошибки последующей настройки продления не отключают уже работающий HTTPS.

Итоговый адрес: https://fedyasite.duckdns.org:8443/.
Обычный HTTP перенаправляется туда, а `/.well-known/acme-challenge/` остаётся
доступным по HTTP для продления. Сертификаты хранятся в `letsencrypt/`, вне `public/`.
systemd-таймер проверяет необходимость продления дважды в сутки и перезагружает
только Nginx сайта. В конце установки выполняется тестовое продление.

Если у хостинга есть внешний firewall, разрешить входящий **TCP 8443**.
Скрипт добавляет это правило в UFW, только если UFW уже включён.

После установки использовать оба Compose-файла при изменении контейнера:

```bash
cd /opt/fedor-site
docker compose -f compose.yaml -f compose.https.yaml up -d --no-deps web
systemctl status fedor-site-cert-renew.timer
journalctl -u fedor-site-cert-renew.service --no-pager -n 50
```

Для ручной проверки продления:

```bash
bash /opt/fedor-site/renew-https.sh --dry-run
```

Локальная проверка скрипта не заменяет проверку сертификата и внешней доступности
на сервере. Если скрипт завершился ошибкой, сохранить вывод для диагностики.
