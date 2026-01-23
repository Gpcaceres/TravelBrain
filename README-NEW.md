# 🧠 TravelBrain - Sistema de Planificación de Viajes

## Arquitectura de Microservicios

TravelBrain es una aplicación completa de planificación de viajes que utiliza una arquitectura de microservicios con tres componentes principales:

```
Frontend (React) ←→ Backend API (Node.js) ←→ Business Rules API (Node.js)
```

---

## 🏗️ Estructura del Proyecto

```
TravelBrain/
├── frontend-react/          # Aplicación React (Puerto 5173)
├── backend-project/         # API principal + MongoDB (Puerto 3004)
├── business-rules-backend/  # API de reglas de negocio (Puerto 3005)
├── docker-compose.yml       # Orquestación de servicios
├── ARCHITECTURE.md          # Documentación de arquitectura
├── DEPLOYMENT.md            # Guía de despliegue
├── BUSINESS_RULES.md        # Reglas de negocio
└── README.md               # Este archivo
```

---

## 🚀 Inicio Rápido

### Opción 1: Docker Compose (Recomendado)

```bash
# Iniciar todos los servicios
docker-compose up --build

# Acceder a:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:3004
# - Business Rules API: http://localhost:3005
```

### Opción 2: Desarrollo Local

```bash
# Terminal 1 - Business Rules API
cd business-rules-backend
npm install
npm run dev

# Terminal 2 - Backend API
cd backend-project
npm install
npm run dev

# Terminal 3 - Frontend
cd frontend-react
npm install
npm run dev
```

---

## 📦 Componentes del Sistema

### 1. Frontend (React + Vite)
**Puerto:** 5173  
**Ubicación:** `frontend-react/`

- Interfaz de usuario moderna
- Gestión de viajes y destinos
- Generación de itinerarios personalizados
- Integración con mapas (Mapbox)
- Consulta de clima en tiempo real

### 2. Backend API (Node.js + Express + MongoDB)
**Puerto:** 3004  
**Ubicación:** `backend-project/`

- API REST principal
- Autenticación JWT
- Base de datos MongoDB Atlas
- Integración con APIs externas:
  - OpenWeather API
  - Mapbox
  - Google OAuth
- Sistema de caché

### 3. Business Rules API (Node.js + Express)
**Puerto:** 3005  
**Ubicación:** `business-rules-backend/`

- **NUEVO:** Servicio dedicado para reglas de negocio
- Validación de datos (usuarios, viajes, destinos, rutas)
- Cálculo de duración de viajes
- Generación de itinerarios
- Detección de tipo de presupuesto
- Distribución de presupuesto
- Plantillas de actividades

---

## 🔑 Funcionalidades Principales

### Gestión de Usuarios
- ✅ Registro y autenticación
- ✅ Login con Google OAuth
- ✅ Perfiles de usuario
- ✅ Roles y permisos

### Planificación de Viajes
- ✅ Crear y gestionar viajes
- ✅ Establecer presupuesto y fechas
- ✅ Calcular duración automáticamente
- ✅ Validación de datos completa

### Destinos
- ✅ Búsqueda de destinos
- ✅ Información geográfica
- ✅ Coordenadas GPS
- ✅ Imágenes y descripciones

### Itinerarios Personalizados
- ✅ Generación automática basada en:
  - Tipo de interés (Cultura, Naturaleza, Gastronomía, Deportes)
  - Presupuesto (Económico, Medio, Alto)
  - Duración del viaje
- ✅ Actividades diarias con horarios
- ✅ Distribución de presupuesto
- ✅ Pronóstico del clima

### Rutas Favoritas
- ✅ Guardar rutas frecuentes
- ✅ Cálculo de distancia y duración
- ✅ Múltiples modos de transporte

### Clima
- ✅ Pronóstico del clima
- ✅ Integración con OpenWeather API
- ✅ Datos históricos

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 18
- Vite
- React Router
- Axios
- CSS Modules

### Backend API
- Node.js 18+
- Express
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Node Cache
- CORS

### Business Rules API
- Node.js 18+
- Express
- CORS

### DevOps
- Docker
- Docker Compose
- PM2 (producción)

---

## 📚 Documentación

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitectura detallada del sistema
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guía completa de despliegue
- **[BUSINESS_RULES.md](BUSINESS_RULES.md)** - Reglas de negocio implementadas
- **[business-rules-backend/README.md](business-rules-backend/README.md)** - Documentación del API de reglas

---

## 🔧 Variables de Entorno

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3004
```

### Backend API (.env)
```env
PORT=3004
MONGO_URI=mongodb+srv://...
BUSINESS_RULES_API_URL=http://localhost:3005
OPENWEATHER_API_KEY=...
MAPBOX_TOKEN=...
GOOGLE_CLIENT_ID=...
JWT_SECRET=...
```

### Business Rules API (.env)
```env
PORT=3005
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost:3004
```

---

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test
```

---

## 📊 Endpoints Principales

### Backend API (Puerto 3004)

#### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verify` - Verificar token

#### Viajes
- `GET /api/trips` - Listar viajes
- `POST /api/trips` - Crear viaje
- `GET /api/trips/:id` - Obtener viaje
- `PUT /api/trips/:id` - Actualizar viaje
- `DELETE /api/trips/:id` - Eliminar viaje

#### Itinerarios
- `POST /api/itineraries/generate` - Generar itinerario
- `GET /api/itineraries/:id` - Obtener itinerario
- `GET /api/itineraries/trip/:tripId` - Obtener por viaje

### Business Rules API (Puerto 3005)

#### Validación de Usuarios
- `POST /api/business-rules/users/validate-registration`
- `POST /api/business-rules/users/validate-update`

#### Validación de Viajes
- `POST /api/business-rules/trips/validate-creation`
- `POST /api/business-rules/trips/validate-update`
- `POST /api/business-rules/trips/calculate-duration`

#### Generación de Itinerarios
- `POST /api/business-rules/itineraries/generate`
- `POST /api/business-rules/itineraries/detect-budget-type`
- `POST /api/business-rules/itineraries/calculate-budget-breakdown`
- `GET /api/business-rules/itineraries/activity-templates`

---

## 🚀 Despliegue en Producción

Ver guía completa en [DEPLOYMENT.md](DEPLOYMENT.md)

### VM/Servidor con PM2
```bash
# Instalar PM2
npm install -g pm2

# Iniciar servicios
cd business-rules-backend && pm2 start src/server.js --name "business-rules"
cd ../backend-project && pm2 start src/server.js --name "backend"
cd ../frontend-react && pm2 serve dist 5173 --name "frontend" --spa
```

### Docker
```bash
docker-compose -f docker-compose.yml up -d --build
```

---

## 🔍 Monitoreo

### Health Checks
- Business Rules: `http://localhost:3005/health`
- Backend: `http://localhost:3004/`
- Frontend: `http://localhost:5173/`

### Logs con Docker
```bash
docker-compose logs -f business-rules
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 📈 Ventajas de la Nueva Arquitectura

### ✅ Separación de Responsabilidades
- Lógica de negocio independiente
- Backend enfocado en datos
- Frontend enfocado en UI/UX

### ✅ Escalabilidad
- Cada servicio puede escalar independientemente
- Business Rules puede atender múltiples backends

### ✅ Mantenibilidad
- Código más organizado y fácil de mantener
- Testing más simple
- Despliegue independiente

### ✅ Reutilización
- Reglas de negocio disponibles para otros proyectos
- Lógica centralizada y consistente

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

ISC

---

## 👥 Equipo

TravelBrain Team

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisa la documentación en `/docs`
2. Consulta [DEPLOYMENT.md](DEPLOYMENT.md) para problemas de despliegue
3. Revisa [ARCHITECTURE.md](ARCHITECTURE.md) para entender el sistema

---

## 🎯 Roadmap

- [ ] Implementar tests unitarios
- [ ] Implementar tests de integración
- [ ] Agregar Circuit Breaker entre servicios
- [ ] Implementar rate limiting
- [ ] Agregar autenticación entre servicios
- [ ] Implementar métricas (Prometheus)
- [ ] Agregar trazabilidad (Jaeger)
- [ ] Implementar CI/CD
- [ ] Agregar documentación con Swagger/OpenAPI

---

**Versión:** 2.0.0  
**Última actualización:** Enero 2026  
**Arquitectura:** Microservicios (3 servicios)
