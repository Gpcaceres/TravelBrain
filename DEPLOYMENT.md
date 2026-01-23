# 🚀 Guía de Despliegue - TravelBrain (3 Servicios)

## Descripción General

TravelBrain ahora consta de 3 servicios independientes:
1. **Frontend** - React (Puerto 5173)
2. **Backend API** - Node.js + MongoDB (Puerto 3004)
3. **Business Rules API** - Node.js (Puerto 3005)

---

## 📋 Requisitos Previos

- Node.js 18+
- npm o yarn
- Docker y Docker Compose (opcional)
- MongoDB Atlas (ya configurado)

---

## 🔧 Configuración Inicial

### 1. Clonar o actualizar el repositorio

```bash
cd TravelBrain
git pull origin main  # Si usas Git
```

### 2. Instalar dependencias en cada servicio

```bash
# Business Rules Backend
cd business-rules-backend
npm install

# Backend Principal
cd ../backend-project
npm install

# Frontend
cd ../frontend-react
npm install

cd ..
```

---

## 🌐 Despliegue en Desarrollo Local

### Opción A: Ejecutar servicios manualmente

Abre 3 terminales separadas:

**Terminal 1 - Business Rules API:**
```bash
cd business-rules-backend
npm run dev
# Escuchando en http://localhost:3005
```

**Terminal 2 - Backend API:**
```bash
cd backend-project
npm run dev
# Escuchando en http://localhost:3004
```

**Terminal 3 - Frontend:**
```bash
cd frontend-react
npm run dev
# Escuchando en http://localhost:5173
```

### Opción B: Usar Docker Compose (Recomendado)

```bash
# Desde la raíz del proyecto
docker-compose up --build

# Para ejecutar en segundo plano
docker-compose up -d --build

# Para detener
docker-compose down
```

### Verificar que los servicios están corriendo

```bash
# Business Rules API
curl http://localhost:3005/health

# Backend API
curl http://localhost:3004/

# Frontend
# Abrir en navegador: http://localhost:5173
```

---

## ☁️ Despliegue en Producción (VM/Servidor)

### Preparación del Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar Docker (opcional)
sudo apt install -y docker.io docker-compose

# Verificar instalación
node --version
npm --version
docker --version
```

### Configurar Variables de Entorno

#### Business Rules Backend
Crear `business-rules-backend/.env`:
```env
PORT=3005
NODE_ENV=production
CORS_ORIGINS=http://TU_IP:5173,http://TU_IP:3004
APP_TIMEZONE=America/Guayaquil
```

#### Backend Principal
Actualizar `backend-project/.env` o variables de entorno:
```env
PORT=3004
NODE_ENV=production
MONGO_URI=mongodb+srv://SrJCBM:bdd2025@cluster0.tjvfmrk.mongodb.net/
MONGO_DB=travel_brain
BUSINESS_RULES_API_URL=http://localhost:3005
CORS_ORIGINS=http://TU_IP:5173,http://TU_IP:8000
# ... otras variables existentes
```

#### Frontend
Actualizar `frontend-react/.env`:
```env
VITE_API_URL=http://TU_IP:3004
```

### Despliegue con PM2 (Proceso en Segundo Plano)

```bash
# Instalar PM2
sudo npm install -g pm2

# Iniciar Business Rules API
cd business-rules-backend
pm2 start src/server.js --name "travelbrain-business-rules"

# Iniciar Backend API
cd ../backend-project
pm2 start src/server.js --name "travelbrain-backend"

# Iniciar Frontend (con Vite preview)
cd ../frontend-react
npm run build
pm2 serve dist 5173 --name "travelbrain-frontend" --spa

# Guardar configuración de PM2
pm2 save
pm2 startup

# Ver estado de servicios
pm2 status
pm2 logs
```

### Despliegue con Docker en Producción

```bash
# Construir y ejecutar
docker-compose -f docker-compose.yml up -d --build

# Ver logs
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Detener servicios
docker-compose down
```

---

## 🔒 Configuración de Firewall

```bash
# Permitir puertos necesarios
sudo ufw allow 3004/tcp   # Backend API
sudo ufw allow 3005/tcp   # Business Rules API
sudo ufw allow 5173/tcp   # Frontend
sudo ufw enable
```

---

## 🔍 Verificación Post-Despliegue

### 1. Verificar Business Rules API
```bash
curl http://localhost:3005/health
# Esperado: {"status":"ok","service":"TravelBrain Business Rules API"}
```

### 2. Verificar Backend API
```bash
curl http://localhost:3004/
# Esperado: Información de la API
```

### 3. Verificar comunicación entre servicios
```bash
# Desde el backend, intentar crear un viaje
curl -X POST http://localhost:3004/api/trips \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test",
    "title": "Viaje de prueba",
    "destination": "Quito",
    "startDate": "2026-02-01",
    "endDate": "2026-02-05",
    "budget": 500
  }'
```

### 4. Verificar Frontend
Abrir navegador: `http://TU_IP:5173`

---

## 📊 Monitoreo

### Ver logs en PM2
```bash
pm2 logs travelbrain-business-rules
pm2 logs travelbrain-backend
pm2 logs travelbrain-frontend
```

### Ver logs en Docker
```bash
docker-compose logs -f business-rules
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Reiniciar servicios
```bash
# Con PM2
pm2 restart travelbrain-business-rules
pm2 restart travelbrain-backend
pm2 restart travelbrain-frontend

# Con Docker
docker-compose restart business-rules
docker-compose restart backend
docker-compose restart frontend
```

---

## 🔄 Actualización de Servicios

### Con PM2
```bash
# Actualizar código
git pull origin main

# Instalar dependencias si hay cambios
cd business-rules-backend && npm install
cd ../backend-project && npm install
cd ../frontend-react && npm install && npm run build

# Reiniciar servicios
pm2 restart all
```

### Con Docker
```bash
git pull origin main
docker-compose down
docker-compose up -d --build
```

---

## ❗ Solución de Problemas

### Business Rules API no responde
```bash
# Verificar si está corriendo
pm2 status travelbrain-business-rules
# o
docker ps | grep business-rules

# Ver logs
pm2 logs travelbrain-business-rules --lines 50
# o
docker logs travelbrain-business-rules
```

### Backend no puede conectarse a Business Rules
1. Verificar que Business Rules esté corriendo
2. Verificar la variable `BUSINESS_RULES_API_URL` en backend
3. Si usan Docker, verificar que estén en la misma red

### Error de CORS
1. Verificar configuración de `CORS_ORIGINS` en ambas APIs
2. Asegurarse de incluir todas las URLs necesarias

### Puerto ocupado
```bash
# Ver qué proceso usa el puerto
sudo lsof -i :3005
sudo lsof -i :3004
sudo lsof -i :5173

# Matar proceso si es necesario
sudo kill -9 <PID>
```

---

## 📝 Checklist de Despliegue

- [ ] Instalar Node.js 18+
- [ ] Clonar repositorio
- [ ] Instalar dependencias en los 3 servicios
- [ ] Configurar variables de entorno
- [ ] Iniciar Business Rules API (puerto 3005)
- [ ] Iniciar Backend API (puerto 3004)
- [ ] Iniciar Frontend (puerto 5173)
- [ ] Verificar conectividad entre servicios
- [ ] Configurar firewall
- [ ] Probar endpoints principales
- [ ] Configurar PM2 o Docker para producción
- [ ] Configurar monitoreo y logs

---

## 📞 Soporte

Si encuentras problemas durante el despliegue:

1. Revisa los logs de cada servicio
2. Verifica las variables de entorno
3. Asegúrate de que los puertos no estén ocupados
4. Verifica la conectividad entre servicios

Para más información, consulta:
- [README.md](README.md) - Información general del proyecto
- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitectura del sistema
- [BUSINESS_RULES.md](BUSINESS_RULES.md) - Reglas de negocio implementadas
