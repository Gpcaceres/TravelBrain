# 🏗️ Arquitectura de TravelBrain

## Descripción General

TravelBrain ahora utiliza una arquitectura de microservicios con tres capas principales:

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                   (React + Vite)                             │
│                   Puerto: 5173                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API                               │
│                  (Node.js + Express)                         │
│                   Puerto: 3004                               │
│                                                              │
│  Responsabilidades:                                          │
│  • Gestión de datos (CRUD)                                  │
│  • Autenticación y autorización                             │
│  • Acceso a base de datos MongoDB                           │
│  • Integración con APIs externas                            │
│  • Cache de resultados                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP Requests (validación)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            BUSINESS RULES API                                │
│              (Node.js + Express)                             │
│                 Puerto: 3005                                 │
│                                                              │
│  Responsabilidades:                                          │
│  • Validación de datos de usuarios                          │
│  • Validación de viajes y destinos                          │
│  • Cálculo de duración de viajes                            │
│  • Generación de itinerarios                                │
│  • Detección de tipo de presupuesto                         │
│  • Distribución de presupuesto                              │
│  • Plantillas de actividades                                │
└─────────────────────────────────────────────────────────────┘
```

## Componentes

### 1. Frontend (Puerto 5173)
**Tecnologías:** React, Vite, CSS
**Ubicación:** `frontend-react/`

**Funciones:**
- Interfaz de usuario
- Gestión de estado local
- Comunicación con Backend API
- Visualización de datos

### 2. Backend API (Puerto 3004)
**Tecnologías:** Node.js, Express, MongoDB, Mongoose
**Ubicación:** `backend-project/`

**Funciones:**
- API REST principal
- Autenticación JWT
- Operaciones CRUD en base de datos
- Integración con servicios externos (OpenWeather, Mapbox)
- Cache en memoria
- **Consumo del Business Rules API para validaciones**

### 3. Business Rules API (Puerto 3005)
**Tecnologías:** Node.js, Express
**Ubicación:** `business-rules-backend/`

**Funciones:**
- Centralización de reglas de negocio
- Validación de datos
- Lógica de cálculo
- Generación de itinerarios
- Independiente de la base de datos

## Flujo de Datos

### Ejemplo: Creación de un Viaje

```
1. Usuario crea viaje en Frontend
   │
   ▼
2. Frontend → POST /api/trips (Backend API)
   │
   ▼
3. Backend API → POST /api/business-rules/trips/validate-creation (Business Rules API)
   │
   ▼
4. Business Rules API valida:
   - userId obligatorio
   - Título obligatorio
   - Fechas válidas
   - Presupuesto ≥ 0
   - Calcula duración
   │
   ▼
5. Si válido → Backend guarda en MongoDB
   │
   ▼
6. Backend → Respuesta al Frontend
```

### Ejemplo: Generación de Itinerario

```
1. Usuario solicita itinerario en Frontend
   │
   ▼
2. Frontend → POST /api/itineraries/generate (Backend API)
   │
   ▼
3. Backend obtiene datos del viaje de MongoDB
   │
   ▼
4. Backend → POST /api/business-rules/itineraries/generate (Business Rules API)
   │
   ▼
5. Business Rules API:
   - Detecta tipo de presupuesto
   - Selecciona plantillas de actividades
   - Genera horarios diarios
   - Calcula distribución de presupuesto
   │
   ▼
6. Backend recibe datos generados
   │
   ▼
7. Backend guarda itinerario en MongoDB
   │
   ▼
8. Backend → Respuesta al Frontend
```

## Comunicación entre Servicios

### Backend → Business Rules API

**Cliente HTTP:** axios
**Ubicación:** `backend-project/src/utils/businessRulesClient.js`

**Endpoints consumidos:**
- POST `/api/business-rules/users/validate-registration`
- POST `/api/business-rules/users/validate-update`
- POST `/api/business-rules/trips/validate-creation`
- POST `/api/business-rules/trips/validate-update`
- POST `/api/business-rules/trips/calculate-duration`
- POST `/api/business-rules/destinations/validate-creation`
- POST `/api/business-rules/routes/validate-creation`
- POST `/api/business-rules/itineraries/generate`
- POST `/api/business-rules/itineraries/detect-budget-type`
- POST `/api/business-rules/itineraries/calculate-budget-breakdown`

## Variables de Entorno

### Frontend
```env
VITE_API_URL=http://localhost:3004
```

### Backend API
```env
PORT=3004
MONGO_URI=mongodb+srv://...
BUSINESS_RULES_API_URL=http://localhost:3005
OPENWEATHER_API_KEY=...
MAPBOX_TOKEN=...
```

### Business Rules API
```env
PORT=3005
CORS_ORIGINS=http://localhost:5173,http://localhost:3004
```

## Docker Compose

Los tres servicios se ejecutan en contenedores Docker:

```yaml
services:
  business-rules:    # Puerto 3005
  backend:           # Puerto 3004 (depende de business-rules)
  frontend:          # Puerto 5173 (depende de backend)
```

## Ventajas de esta Arquitectura

### ✅ Separación de Responsabilidades
- Frontend: UI/UX
- Backend: Datos y persistencia
- Business Rules: Lógica de negocio

### ✅ Escalabilidad
- Cada servicio puede escalar independientemente
- Business Rules puede atender múltiples backends

### ✅ Mantenibilidad
- Cambios en reglas de negocio no afectan persistencia
- Testing más fácil de cada componente

### ✅ Reutilización
- Reglas de negocio disponibles para otros servicios
- Lógica centralizada y consistente

### ✅ Testing
- Unit tests más simples
- Business Rules sin dependencias externas

## Iniciar el Sistema

### Desarrollo Local

```bash
# Instalar dependencias en cada proyecto
cd business-rules-backend && npm install
cd ../backend-project && npm install
cd ../frontend-react && npm install

# Iniciar servicios (en terminales separadas)
cd business-rules-backend && npm run dev  # Puerto 3005
cd backend-project && npm run dev         # Puerto 3004
cd frontend-react && npm run dev          # Puerto 5173
```

### Con Docker Compose

```bash
# Construir e iniciar todos los servicios
docker-compose up --build

# Detener servicios
docker-compose down
```

## Monitoreo

### Health Checks
- Business Rules API: http://localhost:3005/health
- Backend API: http://localhost:3004/
- Frontend: http://localhost:5173/

### Logs
```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f business-rules
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Próximos Pasos

1. **Implementar Circuit Breaker** en el cliente HTTP del backend
2. **Agregar caché** en Business Rules API para cálculos costosos
3. **Implementar métricas** (Prometheus)
4. **Agregar trazabilidad** (Jaeger)
5. **Implementar rate limiting** en ambas APIs
6. **Agregar autenticación** entre servicios (Service-to-Service Auth)
