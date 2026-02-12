# 📚 Documentación del Servicio de Reconocimiento Facial

Bienvenido a la documentación completa del servicio de reconocimiento facial de TravelBrain.

## 📖 Índice de Documentación

### 1. [README.md](./README.md) ⭐
**Inicio rápido y funcionalidades principales**
- Descripción del servicio
- Características principales
- Tecnologías utilizadas
- Instalación y configuración
- Endpoints básicos
- Ejemplos de uso
- Tips de integración

👉 *Comienza aquí si es tu primera vez*

---

### 2. [ARCHITECTURE.md](./ARCHITECTURE.md) 🏗️
**Arquitectura técnica del sistema**
- Diagrama de arquitectura completo
- Componentes principales (API, Face Service, Auth Service, Database)
- Modelo de datos (MongoDB collections)
- Flujos de autenticación detallados
- Consideraciones de seguridad
- Optimizaciones de performance
- Escalabilidad horizontal

👉 *Lectura esencial para desarrolladores y arquitectos*

---

### 3. [API_REFERENCE.md](./API_REFERENCE.md) 📡
**Referencia completa de la API REST**
- Base URLs y autenticación
- Todos los endpoints detallados:
  - `GET /health` - Health check
  - `POST /api/face/register` - Registrar rostro
  - `POST /api/face/verify` - Verificar rostro
  - `POST /api/face/login` - Login facial
  - `POST /api/face/update` - Actualizar rostro
  - `DELETE /api/face/delete/{user_id}` - Eliminar rostro
  - `GET /api/face/status/{user_id}` - Estado de registro
- Códigos de error
- Rate limits
- Best practices
- Ejemplos con código (JavaScript, cURL, Postman)

👉 *Referencia obligada para integración frontend/backend*

---

### 4. [DEPLOYMENT.md](./DEPLOYMENT.md) 🚀
**Guía completa de deployment**
- Opciones de deployment:
  - Docker Compose (recomendado)
  - Docker standalone
  - Desarrollo local
- Configuración de Nginx
- Variables de entorno
- Monitoreo y logs
- Health checks
- Seguridad en producción
- Escalamiento horizontal
- Proceso de actualización
- Backup y restore
- Smoke tests

👉 *Guía para DevOps y deployment en producción*

---

### 5. [FAQ.md](./FAQ.md) ❓
**Preguntas frecuentes y troubleshooting**
- Preguntas frecuentes:
  - Seguridad y privacidad
  - Precisión del sistema
  - Uso y registro
  - GDPR y cumplimiento
- Troubleshooting detallado:
  - "No face detected"
  - "Multiple faces detected"
  - "Face not recognized"
  - Problemas de conexión
  - Errores de CORS
  - Performance issues
- Testing y debugging
- Monitoreo de producción
- Soporte

👉 *Primera parada cuando algo no funciona*

---

## 🎯 Guías Rápidas por Rol

### Para Desarrolladores Frontend

1. Lee [README.md](./README.md) - Sección "Integración con TravelBrain"
2. Revisa [examples/FaceLogin.jsx](./examples/FaceLogin.jsx) - Componente React completo
3. Consulta [API_REFERENCE.md](./API_REFERENCE.md) para endpoints específicos
4. Usa [FAQ.md](./FAQ.md) para resolver errores comunes

**Archivos clave:**
- `examples/FaceLogin.jsx` - Componente React listo para usar
- `examples/README.md` - Guía de integración

---

### Para Desarrolladores Backend

1. Entender [ARCHITECTURE.md](./ARCHITECTURE.md) - Flujos de autenticación
2. Revisar [API_REFERENCE.md](./API_REFERENCE.md) - Validación de tokens JWT
3. Consultar modelo de datos en [ARCHITECTURE.md](./ARCHITECTURE.md)

**Archivos clave:**
- `src/services/auth_service.py` - Lógica de JWT
- `src/config/database.py` - Operaciones de BD

---

### Para DevOps / SysAdmin

1. Seguir [DEPLOYMENT.md](./DEPLOYMENT.md) paso a paso
2. Configurar monitoreo según [FAQ.md](./FAQ.md) - Sección "Monitoreo"
3. Preparar backups usando [DEPLOYMENT.md](./DEPLOYMENT.md) - Sección "Backup"
4. Implementar health checks de [DEPLOYMENT.md](./DEPLOYMENT.md)

**Archivos clave:**
- `docker-compose.yml` - Configuración de contenedores
- `nginx/nginx.conf` - Configuración de proxy
- `start-dev.sh` / `start-dev.bat` - Scripts de inicio

---

### Para Arquitectos / Tech Leads

1. Estudiar [ARCHITECTURE.md](./ARCHITECTURE.md) completo
2. Revisar consideraciones de seguridad en [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Evaluar escalabilidad en [DEPLOYMENT.md](./DEPLOYMENT.md)
4. Analizar performance en [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 📂 Estructura del Proyecto

```
facial-recognition-service/
├── README.md                   # ⭐ Inicio rápido
├── ARCHITECTURE.md             # 🏗️ Arquitectura técnica
├── API_REFERENCE.md            # 📡 Referencia API
├── DEPLOYMENT.md               # 🚀 Guía de deployment
├── FAQ.md                      # ❓ FAQ y troubleshooting
├── Dockerfile                  # 🐳 Imagen Docker
├── requirements.txt            # 📦 Dependencias Python
├── .env.example               # ⚙️ Variables de entorno
├── start-dev.sh               # 🔧 Script desarrollo (Linux/Mac)
├── start-dev.bat              # 🔧 Script desarrollo (Windows)
├── test_service.py            # 🧪 Tests básicos
│
├── src/
│   ├── main.py                # 🎯 API FastAPI principal
│   ├── services/
│   │   ├── face_service.py    # 👤 Reconocimiento facial
│   │   └── auth_service.py    # 🔐 JWT y autenticación
│   ├── config/
│   │   └── database.py        # 💾 MongoDB
│   ├── middlewares/
│   │   └── auth.py            # 🛡️ Middleware de auth
│   └── utils/
│       └── logger.py          # 📝 Logging
│
└── examples/
    ├── FaceLogin.jsx          # ⚛️ Componente React
    └── README.md              # 📖 Guía de integración
```

---

## 🚀 Quick Start

### 1. Instalación Rápida

```bash
# Clonar y navegar
cd TravelBrain/facial-recognition-service

# Iniciar con Docker Compose
docker-compose up -d facial-recognition

# Verificar
curl https://travelbrain.ddns.net/api/face/health
```

### 2. Primer Uso

```javascript
// Registrar rostro
const formData = new FormData();
formData.append('user_id', userId);
formData.append('username', username);
formData.append('email', email);
formData.append('file', imageFile);

await fetch('/api/face/register', {
  method: 'POST',
  body: formData
});

// Login facial
const loginData = new FormData();
loginData.append('file', imageFile);

const response = await fetch('/api/face/login', {
  method: 'POST',
  body: loginData
});

const { success, token, user } = await response.json();
```

### 3. Integración en Frontend

```jsx
import FaceLogin from './components/FaceLogin';

function App() {
  return <FaceLogin />;
}
```

---

## 🔗 Enlaces Útiles

### Repositorio
- **GitHub**: https://github.com/Gpcaceres/TravelBrain

### API Documentation (Interactive)
```bash
# Una vez iniciado el servicio
http://localhost:8000/docs          # Swagger UI
http://localhost:8000/redoc         # ReDoc
```

### Recursos Externos
- **DeepFace**: https://github.com/serengil/deepface
- **FastAPI**: https://fastapi.tiangolo.com/
- **TensorFlow**: https://www.tensorflow.org/
- **Facenet Paper**: https://arxiv.org/abs/1503.03832

---

## 📞 Soporte

### Encontraste un bug?
1. Revisa [FAQ.md](./FAQ.md) primero
2. Busca en issues existentes
3. Crea un nuevo issue con:
   - Descripción del problema
   - Pasos para reproducir
   - Logs relevantes
   - Versión del servicio

### Necesitas ayuda?
1. Consultar documentación relevante
2. Revisar ejemplos en `examples/`
3. Contactar al equipo de desarrollo

---

## 📊 Métricas y Estado

```bash
# Health check
curl https://travelbrain.ddns.net/api/face/health

# Logs en tiempo real
docker-compose logs -f facial-recognition

# Métricas de Docker
docker stats facial-recognition
```

---

## 🔄 Actualizaciones

### Versión Actual: 1.0.0

**Características principales:**
- ✅ Registro de rostros
- ✅ Verificación 1:1
- ✅ Login facial (identificación 1:N)
- ✅ JWT integration
- ✅ MongoDB persistence
- ✅ Docker deployment
- ✅ Nginx integration
- ✅ HTTPS support

**Próximamente (v1.1):**
- 🔜 Anti-spoofing
- 🔜 Liveness detection
- 🔜 Múltiples rostros por usuario
- 🔜 Dashboard de administración

---

## 🎓 Material de Aprendizaje

### Tutoriales
1. **Setup inicial**: [DEPLOYMENT.md](./DEPLOYMENT.md) → Sección "Instalación"
2. **Primer registro**: [README.md](./README.md) → Sección "Registrar Rostro"
3. **Integración React**: [examples/FaceLogin.jsx](./examples/FaceLogin.jsx)
4. **Troubleshooting**: [FAQ.md](./FAQ.md)

### Videos (próximamente)
- Setup y configuración
- Integración frontend
- Deployment en producción
- Troubleshooting común

---

## ✅ Checklist de Implementación

### Desarrollo
- [ ] Leer README.md
- [ ] Configurar entorno local
- [ ] Ejecutar tests
- [ ] Integrar en frontend
- [ ] Probar flujos completos

### Staging
- [ ] Configurar variables de entorno
- [ ] Deploy en staging
- [ ] Tests de integración
- [ ] Tests de carga
- [ ] Validar seguridad

### Producción
- [ ] SSL/TLS configurado
- [ ] Backups automatizados
- [ ] Monitoreo activo
- [ ] Health checks funcionando
- [ ] Documentación actualizada
- [ ] Equipo capacitado

---

## 📝 Contribuir

Para contribuir al servicio:

1. Fork del repositorio
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push al branch: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

**Áreas donde puedes contribuir:**
- Mejoras en el modelo de reconocimiento
- Optimizaciones de performance
- Tests adicionales
- Documentación
- Ejemplos de integración
- Soporte para nuevos frameworks

---

## 📄 Licencia

Parte del proyecto TravelBrain.

---

**¡Gracias por usar el Servicio de Reconocimiento Facial de TravelBrain!** 🎉

Para preguntas o sugerencias, no dudes en contactarnos.
