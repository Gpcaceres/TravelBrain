# Arquitectura del Servicio de Reconocimiento Facial

## 🏗️ Visión General

El servicio de reconocimiento facial es un microservicio independiente construido con FastAPI y DeepFace que proporciona capacidades de autenticación biométrica a TravelBrain.

## 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     TravelBrain System                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │   Frontend   │◄───────►│    Nginx     │                  │
│  │   (React)    │         │ Reverse Proxy│                  │
│  └──────────────┘         └───────┬──────┘                  │
│                                    │                          │
│                    ┌───────────────┼───────────────┐         │
│                    │               │               │         │
│                    ▼               ▼               ▼         │
│          ┌─────────────┐  ┌──────────────┐  ┌──────────┐   │
│          │   Backend   │  │   Facial     │  │ Business │   │
│          │  (Node.js)  │  │ Recognition  │  │  Rules   │   │
│          │             │  │  (FastAPI)   │  │          │   │
│          └──────┬──────┘  └──────┬───────┘  └──────────┘   │
│                 │                 │                          │
│                 │                 │                          │
│                 ▼                 ▼                          │
│          ┌────────────────────────────┐                     │
│          │       MongoDB Atlas        │                     │
│          │  - users collection        │                     │
│          │  - face_data collection    │                     │
│          │  - face_auth_logs          │                     │
│          └────────────────────────────┘                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Componentes Principales

### 1. API Layer (FastAPI)
- **Ubicación**: `src/main.py`
- **Responsabilidades**:
  - Exponer endpoints REST
  - Validación de requests
  - Manejo de errores
  - CORS management
  - Rate limiting (via Nginx)

### 2. Face Service
- **Ubicación**: `src/services/face_service.py`
- **Responsabilidades**:
  - Detección de rostros
  - Registro de embeddings faciales
  - Verificación 1:1
  - Identificación 1:N
  - Gestión de archivos de imágenes

**Tecnologías**:
- DeepFace: Framework de reconocimiento facial
- TensorFlow: Backend de deep learning
- OpenCV: Procesamiento de imágenes
- RetinaFace: Detector de rostros
- Facenet512: Modelo de embeddings

### 3. Auth Service
- **Ubicación**: `src/services/auth_service.py`
- **Responsabilidades**:
  - Generación de JWT tokens
  - Validación de tokens
  - Hash de passwords
  - Verificación de credenciales

### 4. Database Layer
- **Ubicación**: `src/config/database.py`
- **Responsabilidades**:
  - Conexión a MongoDB
  - CRUD operations
  - Gestión de índices
  - Logging de autenticaciones

## 🗄️ Modelo de Datos

### Collection: face_data
```javascript
{
  _id: ObjectId,
  face_id: "face_<user_id>_<uuid>",
  user_id: String,
  username: String,
  email: String,
  face_path: String,  // Ruta al archivo de imagen
  embedding: Array,   // Vector de características (512 dimensiones)
  confidence: Number, // Confianza del registro
  created_at: ISODate,
  updated_at: ISODate
}

// Índices
db.face_data.createIndex({ user_id: 1 }, { unique: true })
db.face_data.createIndex({ face_id: 1 })
db.face_data.createIndex({ created_at: -1 })
```

### Collection: face_auth_logs
```javascript
{
  _id: ObjectId,
  user_id: String,
  success: Boolean,
  method: String,  // "login", "verification", "registration"
  timestamp: ISODate,
  details: {
    confidence: Number,
    distance: Number,
    model: String,
    ip_address: String
  }
}

// Índices
db.face_auth_logs.createIndex({ user_id: 1 })
db.face_auth_logs.createIndex({ timestamp: -1 })
```

## 🔐 Flujo de Autenticación

### Registro de Rostro
```
1. Usuario → Frontend: Captura/Sube imagen
2. Frontend → Facial Service: POST /api/face/register
3. Facial Service:
   a. Detecta rostro (RetinaFace)
   b. Valida que hay solo UN rostro
   c. Genera embedding (Facenet512)
   d. Guarda imagen en /app/data/faces
   e. Almacena datos en MongoDB
4. Facial Service → Frontend: {success: true, face_id}
```

### Login Facial
```
1. Usuario → Frontend: Captura/Sube imagen
2. Frontend → Facial Service: POST /api/face/login
3. Facial Service:
   a. Detecta rostro en imagen
   b. Genera embedding
   c. Compara con TODOS los rostros registrados (1:N)
   d. Encuentra mejor match si distance < threshold
   e. Obtiene datos de usuario de MongoDB
   f. Genera JWT token
4. Facial Service → Frontend: {success: true, token, user}
5. Frontend: Guarda token en localStorage
6. Frontend → Backend: Requests con Authorization: Bearer <token>
```

### Verificación 1:1
```
1. Frontend → Facial Service: POST /api/face/verify
   Body: { user_id, file }
2. Facial Service:
   a. Obtiene rostro registrado del usuario
   b. Compara con imagen provista
   c. Calcula distancia y confianza
3. Facial Service → Frontend: 
   {verified: boolean, confidence: number}
```

## 🚀 Endpoints

### Públicos (Sin autenticación)
- `GET /` - Health check
- `GET /health` - Status detallado
- `POST /api/face/register` - Registrar rostro
- `POST /api/face/login` - Login facial
- `POST /api/face/verify` - Verificar rostro
- `GET /api/face/status/{user_id}` - Estado de registro

### Protegidos (Requieren JWT)
- `POST /api/face/update` - Actualizar rostro
- `DELETE /api/face/delete/{user_id}` - Eliminar rostro

## 🔒 Seguridad

### Autenticación
- JWT tokens compartidos con backend principal
- Mismo secreto: `JWT_SECRET`
- Expiración: 7 días (configurable)
- Algoritmo: HS256

### Validación de Imágenes
```python
# Validaciones implementadas:
1. Tipo de archivo: solo imágenes
2. Tamaño máximo: 10MB (configurado en Nginx)
3. Un solo rostro por imagen
4. Calidad de detección mínima
5. Threshold de similitud configurable
```

### Rate Limiting
- Configurado en Nginx
- API general: 30 req/s
- Face endpoints: 10 req/s con burst de 10

### Privacidad
- Imágenes almacenadas localmente (no en DB)
- Embeddings irreversibles
- Logs de autenticación auditables
- GDPR compliant (usuario puede eliminar sus datos)

## ⚡ Performance

### Tiempos de Respuesta
- **Detección**: ~500ms
- **Registro**: ~2-3s (incluye generación de embedding)
- **Verificación 1:1**: ~1-2s
- **Identificación 1:N**: ~1-2s por cada 100 rostros

### Optimizaciones
1. **Embeddings pre-calculados**: Se guardan en DB para comparaciones rápidas
2. **Multi-stage Docker build**: Reduce tamaño de imagen
3. **Async operations**: Motor async para MongoDB
4. **Resource management**: Límites de memoria y CPU en Docker

### Escalabilidad
```yaml
# Para escalar horizontalmente:
docker-compose up --scale facial-recognition=3

# Nginx hará load balancing automático
upstream facial_recognition {
    server facial-recognition-1:8000;
    server facial-recognition-2:8000;
    server facial-recognition-3:8000;
}
```

## 🐳 Deployment

### Contenedores
```yaml
facial-recognition:
  image: travelbrain-facial-recognition:1.0.0
  ports: ["8000:8000"]
  volumes:
    - facial-recognition-data:/app/data
  environment:
    - MONGO_URI=...
    - JWT_SECRET=...
  resources:
    limits:
      memory: 2G
      cpus: '1.0'
```

### Volúmenes
- `facial-recognition-data`: Persistencia de imágenes faciales

### Red
- Network: `travelbrain-network` (bridge)
- Comunicación interna entre servicios
- Solo Nginx expuesto externamente

## 📈 Monitoreo

### Logs
```bash
# Ver logs del servicio
docker-compose logs -f facial-recognition

# Patrones importantes:
# - "Face registered successfully"
# - "Face login successful"
# - "Error" - Cualquier error
```

### Métricas a Monitorear
1. **Tasa de éxito de login**: > 95%
2. **Tiempo de respuesta**: < 3s p95
3. **Errores 5xx**: < 1%
4. **Uso de memoria**: < 80%
5. **Uso de CPU**: < 70%

### Health Checks
```bash
# Check básico
curl https://travelbrain.ddns.net/api/face/health

# Respuesta esperada:
{
  "status": "healthy",
  "database": true,
  "face_service": true
}
```

## 🔄 Integración con Otros Servicios

### Backend (Node.js)
```javascript
// Verificar si usuario tiene rostro
const hasFaceAuth = await fetch(
  'http://facial-recognition:8000/api/face/status/' + userId
);

// Validar token facial
jwt.verify(token, process.env.JWT_SECRET);
```

### Frontend (React)
```javascript
// Componente de login facial
import FaceLogin from './components/FaceLogin';

// Service para facial auth
import faceAuthService from './services/faceAuth';
```

## 🛠️ Troubleshooting

### Problema: "No face detected"
- **Causa**: Iluminación pobre, rostro no visible
- **Solución**: Mejorar condiciones de captura

### Problema: Servicio lento
- **Causa**: Primera vez descargando modelos
- **Solución**: Los modelos se cachean después de primera descarga

### Problema: "Database not connected"
- **Causa**: MONGO_URI inválido o red no disponible
- **Solución**: Verificar variables de entorno y conectividad

## 📚 Referencias

- **DeepFace**: https://github.com/serengil/deepface
- **FastAPI**: https://fastapi.tiangolo.com/
- **Facenet**: https://arxiv.org/abs/1503.03832
- **RetinaFace**: https://arxiv.org/abs/1905.00641

## 🔄 Actualizaciones Futuras

### Versión 1.1
- [ ] Soporte para múltiples rostros por usuario
- [ ] Anti-spoofing (detección de fotos/videos)
- [ ] Liveness detection
- [ ] Modo offline con embeddings en cache
- [ ] API de gestión de usuarios admin

### Versión 2.0
- [ ] Reconocimiento con máscaras faciales
- [ ] Soporte para biometría multimodal
- [ ] Edge computing con modelos optimizados
- [ ] Blockchain para auditoría
