# Deployment Guide - Facial Recognition Service

## 🚀 Opciones de Deployment

### 1. Docker Compose (Recomendado)

#### Producción con Docker Compose

```bash
# 1. Clonar repositorio
git clone https://github.com/Gpcaceres/TravelBrain.git
cd TravelBrain

# 2. Configurar variables de entorno
cp facial-recognition-service/.env.example facial-recognition-service/.env
nano facial-recognition-service/.env

# 3. Build y start
docker-compose up -d facial-recognition

# 4. Verificar logs
docker-compose logs -f facial-recognition

# 5. Check health
curl https://travelbrain.ddns.net/api/face/health
```

#### Variables de Entorno Requeridas

```env
# .env file
PORT=8000
HOST=0.0.0.0

# Backend API
BACKEND_API_URL=http://backend:3004

# MongoDB
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/
MONGO_DB=travel_brain

# JWT
JWT_SECRET=your-super-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRES_IN=7

# DeepFace
FACE_DETECTION_BACKEND=retinaface
FACE_RECOGNITION_MODEL=Facenet512
SIMILARITY_THRESHOLD=0.6

# CORS
CORS_ORIGINS=https://travelbrain.ddns.net,http://localhost:5173

# Storage
FACE_DATA_PATH=/app/data/faces
TEMP_DATA_PATH=/app/data/temp
```

---

### 2. Docker Standalone

#### Build Image

```bash
cd facial-recognition-service

# Build
docker build -t travelbrain-facial-recognition:1.0.0 .

# Run
docker run -d \
  --name facial-recognition \
  -p 8000:8000 \
  -e MONGO_URI="mongodb+srv://..." \
  -e JWT_SECRET="your-secret" \
  -v facial-data:/app/data \
  travelbrain-facial-recognition:1.0.0

# Logs
docker logs -f facial-recognition

# Stop
docker stop facial-recognition
docker rm facial-recognition
```

---

### 3. Desarrollo Local

#### Con Python Virtual Environment

```bash
cd facial-recognition-service

# Crear entorno virtual
python -m venv venv

# Activar (Linux/Mac)
source venv/bin/activate

# Activar (Windows)
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar .env
cp .env.example .env
nano .env

# Ejecutar
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

#### Script de Desarrollo

```bash
# Linux/Mac
chmod +x start-dev.sh
./start-dev.sh

# Windows
start-dev.bat
```

---

## 🔧 Configuración de Nginx

### Agregar al nginx.conf

```nginx
http {
    # ... configuración existente ...

    # Upstream para facial recognition
    upstream facial_recognition {
        server facial-recognition:8000;
    }

    server {
        listen 443 ssl http2;
        server_name travelbrain.ddns.net;

        # ... configuración SSL ...

        # Facial Recognition API
        location /api/face/ {
            limit_req zone=api_limit burst=10 nodelay;
            
            proxy_pass http://facial_recognition;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts for face processing
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
            
            # Max body size for images
            client_max_body_size 10M;
            
            # CORS
            add_header Access-Control-Allow-Origin * always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
            
            if ($request_method = 'OPTIONS') {
                return 204;
            }
        }
    }
}
```

### Reload Nginx

```bash
# Verificar configuración
docker-compose exec nginx nginx -t

# Reload
docker-compose exec nginx nginx -s reload
```

---

## 📊 Monitoreo y Logs

### Ver Logs

```bash
# Logs en tiempo real
docker-compose logs -f facial-recognition

# Últimas 100 líneas
docker-compose logs --tail=100 facial-recognition

# Logs con timestamp
docker-compose logs -t facial-recognition

# Guardar logs a archivo
docker-compose logs facial-recognition > face-service.log
```

### Métricas Importantes

```bash
# CPU y Memoria
docker stats facial-recognition

# Espacio en disco
docker system df -v

# Volúmenes
docker volume ls
docker volume inspect travelbrain_facial-recognition-data
```

---

## 🔍 Health Checks

### Endpoints de Health

```bash
# Basic health
curl https://travelbrain.ddns.net/api/face/

# Detailed health
curl https://travelbrain.ddns.net/api/face/health
```

### Health Check en Docker Compose

```yaml
facial-recognition:
  # ... otras configuraciones ...
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

---

## 🔐 Seguridad en Producción

### 1. SSL/TLS

```bash
# Verificar certificados
docker-compose exec nginx ls -la /etc/letsencrypt/live/travelbrain.ddns.net/

# Renovar certificados
docker-compose exec certbot certbot renew
```

### 2. Secrets Management

**Opción A: Docker Secrets**

```yaml
# docker-compose.yml
secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  mongo_uri:
    file: ./secrets/mongo_uri.txt

services:
  facial-recognition:
    secrets:
      - jwt_secret
      - mongo_uri
    environment:
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
      - MONGO_URI_FILE=/run/secrets/mongo_uri
```

**Opción B: Environment Variables**

```bash
# No commitear .env al repositorio
echo ".env" >> .gitignore

# Usar variables de entorno del sistema
export JWT_SECRET="..."
export MONGO_URI="..."
```

### 3. Firewall Rules

```bash
# Permitir solo tráfico necesario
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 8000/tcp  # No exponer puerto del servicio directamente
ufw enable
```

---

## 📈 Escalamiento

### Escalamiento Horizontal

```yaml
# docker-compose.yml
services:
  facial-recognition:
    # ... configuración ...
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 1G
```

```bash
# Escalar manualmente
docker-compose up -d --scale facial-recognition=3
```

### Load Balancing en Nginx

```nginx
upstream facial_recognition {
    least_conn;  # Load balancing algorithm
    server facial-recognition-1:8000 weight=1;
    server facial-recognition-2:8000 weight=1;
    server facial-recognition-3:8000 weight=1;
}
```

---

## 🔄 Actualizaciones

### Rolling Update

```bash
# 1. Pull nueva imagen
docker-compose pull facial-recognition

# 2. Recrear contenedor sin downtime
docker-compose up -d --no-deps --build facial-recognition

# 3. Verificar
docker-compose ps facial-recognition
docker-compose logs --tail=50 facial-recognition
```

### Rollback

```bash
# 1. Detener servicio actual
docker-compose stop facial-recognition

# 2. Restaurar versión anterior
docker-compose up -d facial-recognition:previous-version

# 3. Verificar
curl https://travelbrain.ddns.net/api/face/health
```

---

## 💾 Backup y Restore

### Backup de Datos Faciales

```bash
# Backup del volumen
docker run --rm \
  -v travelbrain_facial-recognition-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/face-data-backup-$(date +%Y%m%d).tar.gz /data

# Backup de MongoDB (face_data collection)
docker-compose exec -T backend mongodump \
  --uri="$MONGO_URI" \
  --db=travel_brain \
  --collection=face_data \
  --out=/backup/mongodb-$(date +%Y%m%d)
```

### Restore

```bash
# Restore volumen
docker run --rm \
  -v travelbrain_facial-recognition-data:/data \
  -v $(pwd):/backup \
  alpine sh -c "cd /data && tar xzf /backup/face-data-backup-20260211.tar.gz"

# Restore MongoDB
docker-compose exec -T backend mongorestore \
  --uri="$MONGO_URI" \
  --db=travel_brain \
  /backup/mongodb-20260211
```

---

## 🧪 Testing en Producción

### Smoke Tests

```bash
#!/bin/bash

echo "Running smoke tests..."

# Test 1: Health check
echo "1. Health check..."
curl -f https://travelbrain.ddns.net/api/face/health || exit 1

# Test 2: Face status (should return false for non-existent user)
echo "2. Face status..."
curl -f https://travelbrain.ddns.net/api/face/status/test_user_123 || exit 1

# Test 3: Register face (con imagen de test)
echo "3. Register face..."
curl -X POST https://travelbrain.ddns.net/api/face/register \
  -F "user_id=smoke_test" \
  -F "username=smoketest" \
  -F "email=test@test.com" \
  -F "file=@test-face.jpg" || exit 1

echo "✅ All smoke tests passed!"
```

---

## 🐛 Troubleshooting

### Servicio no inicia

```bash
# Ver logs detallados
docker-compose logs facial-recognition

# Verificar configuración
docker-compose config

# Verificar puertos
netstat -tulpn | grep 8000

# Reiniciar desde cero
docker-compose down
docker-compose up -d facial-recognition
```

### MongoDB no conecta

```bash
# Test conexión
docker-compose exec facial-recognition python -c "
from pymongo import MongoClient
import os
client = MongoClient(os.getenv('MONGO_URI'))
print(client.list_database_names())
"
```

### Memoria insuficiente

```bash
# Aumentar límites en docker-compose.yml
services:
  facial-recognition:
    deploy:
      resources:
        limits:
          memory: 4G  # Aumentar de 2G a 4G
```

---

## 📞 Soporte

Para problemas o preguntas:

1. Revisar logs: `docker-compose logs facial-recognition`
2. Verificar health: `curl https://travelbrain.ddns.net/api/face/health`
3. Consultar documentación: `README.md`, `API_REFERENCE.md`
4. Crear issue en GitHub

---

## ✅ Checklist de Deployment

- [ ] Variables de entorno configuradas
- [ ] Certificados SSL válidos
- [ ] MongoDB accesible
- [ ] Volúmenes persistentes creados
- [ ] Nginx configurado y funcionando
- [ ] Health checks respondiendo
- [ ] Logs sin errores críticos
- [ ] Backup automático configurado
- [ ] Monitoreo en funcionamiento
- [ ] Smoke tests pasando
- [ ] Documentación actualizada
