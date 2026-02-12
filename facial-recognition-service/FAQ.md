# FAQ y Troubleshooting - Facial Recognition Service

## ❓ Preguntas Frecuentes

### General

#### ¿Qué es este servicio?
Es un microservicio de reconocimiento facial que permite a los usuarios de TravelBrain autenticarse usando su rostro en lugar de contraseñas tradicionales.

#### ¿Es seguro?
Sí. Utilizamos:
- Embeddings irreversibles (no se puede reconstruir la cara desde el embedding)
- JWT tokens con expiración
- Comunicación cifrada (HTTPS)
- Almacenamiento seguro de datos
- Cumplimiento con estándares de privacidad

#### ¿Qué tan preciso es?
Con el modelo Facenet512 y RetinaFace detector, alcanzamos:
- **Precisión**: >95%
- **Falsos positivos**: <1%
- **Falsos negativos**: <5%

#### ¿Funciona con máscaras faciales?
Actualmente no. El modelo necesita ver el rostro completo. Esto está en el roadmap para futuras versiones.

---

### Registro y Uso

#### ¿Necesito registrarme dos veces?
No. Solo necesitas:
1. Crear cuenta en TravelBrain (email/password o Google OAuth)
2. Registrar tu rostro una vez
3. Usar login facial en adelante

#### ¿Puedo tener múltiples rostros registrados?
Actualmente no. Cada usuario puede tener solo un rostro registrado. Si actualizas tu rostro, el anterior se elimina.

#### ¿Qué pasa si cambio mi apariencia?
Cambios menores (corte de cabello, barba, maquillaje) generalmente no afectan. Cambios mayores pueden requerir re-registro:
- Cirugía facial significativa
- Pérdida/ganancia extrema de peso
- Envejecimiento significativo (5+ años)

#### ¿Funciona con fotos?
El sistema está diseñado para detectar rostros reales. Usar fotos de otras personas:
- Es detectable en muchos casos
- Viola los términos de servicio
- Futura actualización incluirá anti-spoofing mejorado

#### ¿Necesito buena iluminación?
Sí. Para mejores resultados:
- Iluminación frontal o natural
- Evita sombras fuertes
- Evita contraluz

---

### Privacidad y Datos

#### ¿Dónde se almacenan mis datos faciales?
- **Imágenes**: Servidor local en volumen Docker persistente
- **Embeddings**: MongoDB (base de datos cifrada)
- **Logs**: MongoDB con retención de 90 días

#### ¿Puedo eliminar mis datos?
Sí. En cualquier momento puedes:
```javascript
// Frontend
await faceAuthService.deleteFace(userId);
```
Esto elimina:
- Imagen del rostro
- Embeddings de la base de datos
- Registros asociados

#### ¿Se comparte mi rostro con terceros?
No. Los datos nunca salen de la infraestructura de TravelBrain.

#### ¿Cumple con GDPR?
Sí. Implementamos:
- Derecho al olvido (eliminación de datos)
- Consentimiento explícito
- Minimización de datos
- Seguridad por diseño
- Transparencia en el procesamiento

---

## 🔧 Troubleshooting

### Errores Comunes

#### "No face detected in image"

**Causa**: No se detectó ningún rostro en la imagen.

**Soluciones**:
1. Asegúrate de estar mirando directamente a la cámara
2. Mejora la iluminación
3. Acércate más a la cámara
4. Limpia el lente de la cámara
5. Usa una cámara de mejor calidad

```javascript
// Tip: Implementar retry automático
async function captureWithRetry(maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const result = await captureFace();
      return result;
    } catch (error) {
      if (error.message.includes('No face detected') && i < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      throw error;
    }
  }
}
```

---

#### "Multiple faces detected"

**Causa**: Más de un rostro visible en la imagen.

**Soluciones**:
1. Asegúrate de estar solo en el encuadre
2. Revisa que no haya espejos en el fondo
3. Verifica que no hayan fotos de personas en el fondo
4. Usa modo retrato si está disponible

---

#### "Face not recognized"

**Causa**: El rostro no coincide con ninguno registrado o la confianza es baja.

**Soluciones**:
1. Intenta con mejor iluminación
2. Mira directamente a la cámara
3. Quítate lentes de sol u objetos que cubran la cara
4. Si persiste, re-registra tu rostro

```javascript
// Verificar estado de registro primero
const status = await faceAuthService.checkStatus(userId);
if (!status.has_face_registered) {
  // Dirigir a registro
  navigate('/register-face');
}
```

---

#### "Invalid or expired token"

**Causa**: El JWT token no es válido o expiró.

**Soluciones**:
1. Vuelve a hacer login
2. Verifica que el reloj del sistema esté correcto
3. Limpia localStorage y cookies

```javascript
// Implementar refresh token logic
async function makeAuthenticatedRequest(url, options) {
  try {
    return await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  } catch (error) {
    if (error.message.includes('401')) {
      // Token expirado, redirigir a login
      localStorage.clear();
      window.location.href = '/login';
    }
    throw error;
  }
}
```

---

#### "Database not connected"

**Causa**: El servicio no puede conectarse a MongoDB.

**Diagnóstico**:
```bash
# Verificar conexión
docker-compose logs facial-recognition | grep -i "mongo\|database"

# Test manual
docker-compose exec facial-recognition python -c "
from pymongo import MongoClient
import os
try:
    client = MongoClient(os.getenv('MONGO_URI'), serverSelectionTimeoutMS=5000)
    print('Connected:', client.server_info())
except Exception as e:
    print('Error:', e)
"
```

**Soluciones**:
1. Verifica que `MONGO_URI` esté correctamente configurado
2. Comprueba conectividad de red
3. Verifica credenciales de MongoDB
4. Revisa firewall/security groups

---

#### Servicio lento o timeout

**Causa**: Primera ejecución (descarga de modelos) o recursos insuficientes.

**Soluciones**:

**Primera ejecución**:
```bash
# Los modelos se descargan solo la primera vez (~1GB)
# Espera a que termine la descarga
docker-compose logs -f facial-recognition
```

**Recursos insuficientes**:
```yaml
# docker-compose.yml - Aumentar recursos
services:
  facial-recognition:
    deploy:
      resources:
        limits:
          cpus: '2.0'      # De 1.0 a 2.0
          memory: 4G        # De 2G a 4G
```

**Optimizar imágenes**:
```javascript
// Redimensionar imagen antes de enviar
async function compressImage(file, maxWidth = 1280) {
  const img = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, maxWidth / img.width);
  
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  return new Promise(resolve => {
    canvas.toBlob(resolve, 'image/jpeg', 0.8);
  });
}
```

---

### Errores de Integración

#### Frontend no se comunica con el servicio

**Diagnóstico**:
```javascript
// Test de conectividad
async function testConnection() {
  try {
    const response = await fetch('https://travelbrain.ddns.net/api/face/health');
    const data = await response.json();
    console.log('Service status:', data);
    return data.status === 'healthy';
  } catch (error) {
    console.error('Connection failed:', error);
    return false;
  }
}
```

**Soluciones**:
1. Verifica CORS configuration
2. Comprueba URL en `config.js`
3. Revisa network tab en DevTools
4. Verifica que Nginx esté enrutando correctamente

---

#### CORS errors

**Síntoma**: Error en consola del navegador sobre CORS.

**Solución**:
```env
# facial-recognition-service/.env
CORS_ORIGINS=https://travelbrain.ddns.net,http://localhost:5173,http://localhost:3000
```

```nginx
# nginx.conf
location /api/face/ {
    # ... otras configuraciones ...
    
    add_header Access-Control-Allow-Origin * always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

---

### Problemas de Performance

#### Alta latencia

**Diagnóstico**:
```bash
# Medir tiempo de respuesta
time curl -X POST https://travelbrain.ddns.net/api/face/verify \
  -F "user_id=test" \
  -F "file=@test-image.jpg"

# Monitorear recursos
docker stats facial-recognition
```

**Soluciones**:

1. **Caché de embeddings** (ya implementado)
2. **Optimizar modelo**:
```env
# Use modelo más rápido (menos preciso)
FACE_RECOGNITION_MODEL=Facenet  # En lugar de Facenet512
FACE_DETECTION_BACKEND=opencv   # En lugar de retinaface
```

3. **Escalar horizontalmente**:
```bash
docker-compose up -d --scale facial-recognition=3
```

---

#### Alto uso de memoria

**Diagnóstico**:
```bash
docker stats facial-recognition --no-stream
```

**Soluciones**:

1. **Limitar recursos**:
```yaml
services:
  facial-recognition:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

2. **Limpiar archivos temporales**:
```bash
# Cronjob para limpiar temp
0 */6 * * * docker-compose exec facial-recognition find /app/data/temp -type f -mtime +1 -delete
```

---

## 🧪 Testing y Debugging

### Habilitar modo debug

```env
# .env
LOG_LEVEL=DEBUG
PYTHONUNBUFFERED=1
```

### Test endpoints manualmente

```bash
# Health check
curl https://travelbrain.ddns.net/api/face/health

# Registro (necesitas una imagen de prueba)
curl -X POST https://travelbrain.ddns.net/api/face/register \
  -F "user_id=debug_user" \
  -F "username=debuguser" \
  -F "email=debug@test.com" \
  -F "file=@test-face.jpg" \
  -v

# Login
curl -X POST https://travelbrain.ddns.net/api/face/login \
  -F "file=@test-face.jpg" \
  -v

# Status
curl https://travelbrain.ddns.net/api/face/status/debug_user -v
```

### Debug en Python

```python
# facial-recognition-service/debug_test.py
import asyncio
from src.services.face_service import FaceRecognitionService

async def test():
    service = FaceRecognitionService()
    
    # Test detection
    with open('test-image.jpg', 'rb') as f:
        image_data = f.read()
    
    result = await service.detect_face(image_data)
    print('Detection result:', result)

asyncio.run(test())
```

---

## 📊 Monitoreo de Producción

### Alertas Importantes

```bash
# Script de monitoreo
#!/bin/bash

# Check 1: Service health
health=$(curl -s https://travelbrain.ddns.net/api/face/health | jq -r '.status')
if [ "$health" != "healthy" ]; then
    echo "ALERT: Service unhealthy!"
    # Enviar notificación
fi

# Check 2: Response time
response_time=$(curl -w "%{time_total}" -o /dev/null -s https://travelbrain.ddns.net/api/face/)
if (( $(echo "$response_time > 5.0" | bc -l) )); then
    echo "ALERT: High response time: ${response_time}s"
fi

# Check 3: Error rate in logs
errors=$(docker-compose logs --tail=1000 facial-recognition | grep -i error | wc -l)
if [ "$errors" -gt 10 ]; then
    echo "ALERT: High error rate: $errors errors in last 1000 logs"
fi
```

---

## 🆘 Soporte

Si ninguna solución funciona:

1. **Recolectar información**:
```bash
# Logs
docker-compose logs facial-recognition > debug-logs.txt

# Estado del sistema
docker stats --no-stream > debug-stats.txt

# Configuración
docker-compose config > debug-config.txt

# Variables de entorno (sin secretos)
docker-compose exec facial-recognition env | grep -v SECRET > debug-env.txt
```

2. **Crear issue en GitHub** con:
   - Descripción del problema
   - Pasos para reproducir
   - Logs relevantes
   - Versión del servicio
   - Ambiente (dev/prod)

3. **Contactar al equipo**:
   - Email: support@travelbrain.com
   - Slack: #facial-recognition-support
