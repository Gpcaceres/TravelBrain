# 🧠 TravelBrain Business Rules Backend

API dedicada para la gestión centralizada de reglas de negocio y validaciones del sistema TravelBrain.

## 📋 Descripción

Este servicio contiene todas las reglas de negocio del sistema TravelBrain, separadas en un microservicio independiente para:
- Centralizar la lógica de negocio
- Facilitar el mantenimiento y testing
- Permitir reutilización entre diferentes servicios
- Escalar independientemente según la carga

## 🚀 Características

### Módulos de Validación
- **Usuarios**: Validación de registro, email, username, roles
- **Viajes**: Validación de fechas, presupuesto, cálculo de duración
- **Destinos**: Validación de coordenadas geográficas, datos de ubicación
- **Rutas**: Validación de puntos origen/destino, distancias, modos de transporte
- **Itinerarios**: Generación de actividades, cálculo de presupuestos, horarios

### Servicios de Negocio
- Detección automática de tipo de presupuesto
- Generación de horarios diarios
- Cálculo de distribución de presupuesto
- Plantillas de actividades por tipo de interés

## 🛠️ Tecnologías

- **Node.js**: Runtime de JavaScript
- **Express**: Framework web
- **CORS**: Manejo de Cross-Origin Resource Sharing

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar en desarrollo
npm run dev

# Iniciar en producción
npm start
```

## 🐳 Docker

```bash
# Construir imagen
docker build -t travelbrain-business-rules .

# Ejecutar contenedor
docker run -p 3005:3005 travelbrain-business-rules
```

## 📡 Endpoints

### Validación de Usuarios
- `POST /api/business-rules/users/validate` - Validar datos de usuario
- `POST /api/business-rules/users/validate-registration` - Validar registro

### Validación de Viajes
- `POST /api/business-rules/trips/validate` - Validar datos de viaje
- `POST /api/business-rules/trips/calculate-duration` - Calcular duración

### Validación de Destinos
- `POST /api/business-rules/destinations/validate` - Validar destino
- `POST /api/business-rules/destinations/validate-coordinates` - Validar coordenadas

### Validación de Rutas
- `POST /api/business-rules/routes/validate` - Validar ruta completa
- `POST /api/business-rules/routes/validate-point` - Validar punto geográfico

### Generación de Itinerarios
- `POST /api/business-rules/itineraries/generate` - Generar itinerario completo
- `POST /api/business-rules/itineraries/detect-budget-type` - Detectar tipo de presupuesto
- `POST /api/business-rules/itineraries/calculate-budget-breakdown` - Calcular distribución de presupuesto

## 🔧 Configuración

Variables de entorno disponibles en `.env`:

```env
PORT=3005
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost:8000
APP_TIMEZONE=America/Guayaquil
```

## 📝 Reglas de Negocio Implementadas

Ver archivo `BUSINESS_RULES.md` en la raíz del proyecto para documentación completa de todas las reglas de negocio implementadas.

## 🏗️ Estructura del Proyecto

```
business-rules-backend/
├── src/
│   ├── config/          # Configuración de la aplicación
│   ├── controllers/     # Controladores de endpoints
│   ├── routes/          # Definición de rutas
│   ├── services/        # Lógica de negocio
│   ├── validators/      # Validadores específicos
│   ├── utils/           # Utilidades generales
│   ├── app.js          # Configuración de Express
│   └── server.js       # Punto de entrada
├── package.json
├── Dockerfile
└── README.md
```

## 🔗 Integración

Este servicio se comunica con:
- **Backend Principal**: Recibe solicitudes de validación
- **Frontend**: No se comunica directamente

## 📄 Licencia

ISC

## 👥 Equipo

TravelBrain Team
