@echo off
docker-compose -f docker-compose.yml -f docker-compose.local.yml logs -f %*
