# 🐳 Docker Optimization Guide

## Problema
Docker acumula imágenes, contenedores, volúmenes y cache que consumen espacio en disco.

## Solución 1: Configuración de Docker Daemon

Crea/edita `/etc/docker/daemon.json` en la VM:

```bash
sudo nano /etc/docker/daemon.json
```

Agrega esta configuración:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ]
}
```

Reinicia Docker:
```bash
sudo systemctl restart docker
```

## Solución 2: Script de Limpieza Manual

Ejecuta el script cuando necesites liberar espacio:

```bash
chmod +x docker-cleanup.sh
./docker-cleanup.sh
```

## Solución 3: Limpieza Automática con Cron

Configura limpieza semanal automática:

```bash
# Editar crontab
crontab -e

# Agregar esta línea (ejecuta domingos a las 3 AM)
0 3 * * 0 cd ~/TravelBrain && ./docker-cleanup.sh >> /tmp/docker-cleanup.log 2>&1
```

## Solución 4: Limpieza Agresiva (Emergencia)

Si necesitas liberar mucho espacio rápidamente:

```bash
# ⚠️ CUIDADO: Esto elimina TODAS las imágenes no usadas
docker system prune -a --volumes -f

# Luego reconstruye los contenedores
cd ~/TravelBrain
docker-compose build --no-cache
docker-compose up -d
```

## Comandos Útiles

```bash
# Ver uso de disco de Docker
docker system df

# Ver uso de disco detallado
docker system df -v

# Ver imágenes
docker images

# Ver contenedores (incluyendo detenidos)
docker ps -a

# Ver volúmenes
docker volume ls

# Eliminar imagen específica
docker rmi <image_id>

# Eliminar todas las imágenes no utilizadas
docker image prune -a -f
```

## Prevención

1. **Limitar logs** (ya configurado en daemon.json)
2. **Limpieza regular** (con cron o manual)
3. **No hacer builds innecesarios** - usa `docker-compose up` sin `--build` si no cambiaste código
4. **Usar `.dockerignore`** para excluir archivos innecesarios de las imágenes

## Verificación Post-Limpieza

```bash
# Ver espacio libre en disco
df -h

# Ver uso de Docker
docker system df

# Verificar que los servicios funcionen
docker-compose ps
docker logs travelbrain-backend --tail 20
```
