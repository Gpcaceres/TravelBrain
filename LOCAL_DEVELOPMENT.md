# TravelBrain - Desarrollo Local

## Inicio Rápido

### Windows
```bash
check-local.bat
start-local.bat
```

### Linux/Mac
```bash
chmod +x *.sh
./check-local.sh
./start-local.sh
```

## Scripts Disponibles

- `start-local` - Inicia todos los servicios en modo desarrollo
- `stop-local` - Detiene todos los servicios
- `logs-local` - Ver logs de todos los servicios
- `check-local` - Verificar que todo está configurado correctamente

## URLs de Acceso

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **Facial Recognition**: http://localhost/api/face
- **Business Rules**: http://localhost/business-rules

### Acceso Directo (sin proxy)
- **Backend**: http://localhost:3004
- **Frontend**: http://localhost:5173
- **Facial Recognition**: http://localhost:8000

## Ver Logs de un Servicio Específico

### Windows
```bash
logs-local.bat facial-recognition
logs-local.bat backend
logs-local.bat frontend
```

### Linux/Mac
```bash
./logs-local.sh facial-recognition
./logs-local.sh backend
./logs-local.sh frontend
```

## Detener Servicios

### Windows
```bash
stop-local.bat
```

### Linux/Mac
```bash
./stop-local.sh
```

## Arquitectura Local

```
nginx (puerto 80)
├── /api/face/*        → facial-recognition:8000
├── /api/*             → backend:3004
├── /business-rules/*  → business-rules:3005
└── /*                 → frontend:80
```

## Diferencias con Producción

| Característica | Producción | Local |
|---------------|-----------|-------|
| SSL/HTTPS | ✅ Sí | ❌ No |
| Dominio | travelbrain.ddns.net | localhost |
| Certbot | ✅ Activo | ❌ Deshabilitado |
| Puertos expuestos | Solo 80,443 | Todos los puertos |
| NODE_ENV | production | development |

## Troubleshooting

### Puerto 80 ocupado
```bash
# Windows
netstat -ano | findstr :80
taskkill /PID <pid> /F

# Linux/Mac
sudo lsof -i :80
sudo kill -9 <pid>
```

### Limpiar todo y empezar de nuevo
```bash
docker-compose -f docker-compose.yml -f docker-compose.local.yml down -v
docker system prune -a
start-local.bat  # o ./start-local.sh
```

### Ver estado de servicios
```bash
docker-compose -f docker-compose.yml -f docker-compose.local.yml ps
```

### Reconstruir un servicio específico
```bash
docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d --build facial-recognition
```
