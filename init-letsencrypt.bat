@echo off
REM Initialize Let's Encrypt SSL certificates for TravelBrain (Windows version)

set DOMAINS=travelbrain.ddns.net
set EMAIL=ithopc@gmail.com
set DATA_PATH=.\certbot
set RSA_KEY_SIZE=4096

echo ### Preparing directories ...
if not exist "%DATA_PATH%\conf" mkdir "%DATA_PATH%\conf"
if not exist "%DATA_PATH%\www" mkdir "%DATA_PATH%\www"
if not exist "%DATA_PATH%\conf\live\%DOMAINS%" mkdir "%DATA_PATH%\conf\live\%DOMAINS%"

echo.
echo ### Creating dummy certificate for %DOMAINS% ...
if not exist "%DATA_PATH%\conf\live\%DOMAINS%\fullchain.pem" (
    docker compose run --rm --entrypoint "openssl req -x509 -nodes -newkey rsa:%RSA_KEY_SIZE% -days 1 -keyout /etc/letsencrypt/live/%DOMAINS%/privkey.pem -out /etc/letsencrypt/live/%DOMAINS%/fullchain.pem -subj /CN=localhost" certbot
)

echo.
echo ### Starting nginx ...
docker compose up --force-recreate -d nginx

timeout /t 5

echo.
echo ### Deleting dummy certificate for %DOMAINS% ...
docker compose run --rm --entrypoint "rm -Rf /etc/letsencrypt/live/%DOMAINS% && rm -Rf /etc/letsencrypt/archive/%DOMAINS% && rm -Rf /etc/letsencrypt/renewal/%DOMAINS%.conf" certbot

echo.
echo ### Requesting Let's Encrypt certificate for %DOMAINS% ...
docker compose run --rm --entrypoint "certbot certonly --webroot -w /var/www/certbot --email %EMAIL% -d %DOMAINS% --rsa-key-size %RSA_KEY_SIZE% --agree-tos --non-interactive --force-renewal" certbot

echo.
echo ### Reloading nginx ...
docker compose exec nginx nginx -s reload

echo.
echo ### SSL certificates have been successfully obtained!
echo ### Your site is now available at https://travelbrain.ddns.net
echo.
pause
