# Facial Recognition Service - TravelBrain

Servicio de reconocimiento facial con DeepFace para autenticación segura en TravelBrain.

## 🎯 Características

- **Registro de rostros**: Registro seguro de datos faciales de usuarios
- **Verificación facial**: Verificación 1:1 de rostros contra usuarios registrados
- **Login facial**: Autenticación completa usando reconocimiento facial
- **Identificación**: Identificación 1:N para encontrar usuarios por su rostro
- **JWT Integration**: Generación de tokens JWT compatibles con el backend principal
- **Alta precisión**: Utiliza el modelo Facenet512 con backend RetinaFace

## 🛠️ Tecnologías

- **FastAPI**: Framework web moderno y rápido
- **DeepFace**: Biblioteca de reconocimiento facial con múltiples modelos
- **TensorFlow**: Backend de deep learning
- **MongoDB**: Base de datos para almacenar datos faciales
- **OpenCV**: Procesamiento de imágenes
- **JWT**: Autenticación mediante tokens

## 📋 Requisitos

- Python 3.10+
- MongoDB
- Docker (recomendado)

## 🚀 Instalación

### Con Docker (Recomendado)

El servicio está configurado en `docker-compose.yml`:

```bash
docker-compose up facial-recognition
```

### Instalación Local

```bash
cd facial-recognition-service
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## ⚙️ Configuración

Crea un archivo `.env` basado en `.env.example`:

```env
PORT=8000
MONGO_URI=mongodb+srv://...
MONGO_DB=travel_brain
JWT_SECRET=your-secret-key
FACE_DETECTION_BACKEND=retinaface
FACE_RECOGNITION_MODEL=Facenet512
SIMILARITY_THRESHOLD=0.6
```

## 📡 Endpoints API

### Health Check

```http
GET /health
```

Verifica el estado del servicio.

### Registrar Rostro

```http
POST /api/face/register
Content-Type: multipart/form-data

user_id: string
username: string
email: string
file: image file
```

Registra un nuevo rostro para un usuario.

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Face registered successfully",
  "face_id": "face_user123_uuid",
  "user_id": "user123"
}
```

### Verificar Rostro

```http
POST /api/face/verify
Content-Type: multipart/form-data

user_id: string
file: image file
```

Verifica si el rostro enviado corresponde al usuario especificado.

**Respuesta exitosa:**
```json
{
  "verified": true,
  "confidence": 0.89,
  "distance": 0.25,
  "threshold": 0.6,
  "user_id": "user123",
  "model": "Facenet512"
}
```

### Login Facial

```http
POST /api/face/login
Content-Type: multipart/form-data

file: image file
```

Autentica un usuario mediante su rostro y retorna un JWT token.

**Respuesta exitosa:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user123",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "message": "Login successful with 89.2% confidence"
}
```

### Actualizar Rostro

```http
POST /api/face/update
Authorization: Bearer <token>
Content-Type: multipart/form-data

user_id: string
file: image file
```

Actualiza el rostro registrado de un usuario (requiere autenticación).

### Eliminar Rostro

```http
DELETE /api/face/delete/{user_id}
Authorization: Bearer <token>
```

Elimina los datos faciales de un usuario (requiere autenticación).

### Verificar Estado

```http
GET /api/face/status/{user_id}
```

Verifica si un usuario tiene rostro registrado.

**Respuesta:**
```json
{
  "user_id": "user123",
  "has_face_registered": true,
  "registration_date": "2026-02-11T10:30:00"
}
```

## 🔒 Seguridad

- **Autenticación JWT**: Los endpoints protegidos requieren token Bearer
- **Validación de imágenes**: Solo se aceptan archivos de imagen válidos
- **Detección única**: Se rechaza si hay múltiples rostros en la imagen
- **Umbral de confianza**: Configurable para ajustar precisión vs seguridad
- **Permisos**: Los usuarios solo pueden modificar sus propios datos faciales

## 🧪 Modelos Disponibles

### Modelos de Reconocimiento
- `VGG-Face`
- `Facenet` (default)
- `Facenet512` (recomendado - alta precisión)
- `OpenFace`
- `DeepFace`
- `DeepID`
- `ArcFace`
- `Dlib`
- `SFace`

### Backends de Detección
- `opencv`
- `ssd`
- `dlib`
- `mtcnn`
- `retinaface` (recomendado)
- `mediapipe`

## 📊 Integración con TravelBrain

### Frontend (React)

```javascript
// Registro de rostro
const registerFace = async (userId, username, email, imageFile) => {
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('username', username);
  formData.append('email', email);
  formData.append('file', imageFile);
  
  const response = await fetch('https://travelbrain.ddns.net/api/face/register', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
};

// Login facial
const faceLogin = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const response = await fetch('https://travelbrain.ddns.net/api/face/login', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Guardar token
    localStorage.setItem('token', data.token);
    // Redirigir al dashboard
    navigate('/dashboard');
  }
};
```

### Backend (Node.js)

```javascript
// Verificar si usuario tiene rostro registrado
const checkFaceRegistration = async (userId) => {
  try {
    const response = await axios.get(
      `http://facial-recognition:8000/api/face/status/${userId}`
    );
    return response.data.has_face_registered;
  } catch (error) {
    console.error('Error checking face registration:', error);
    return false;
  }
};
```

## 🐛 Troubleshooting

### Error: "No face detected"
- Asegúrate de que la imagen tenga buena iluminación
- Verifica que el rostro esté centrado y visible
- La imagen debe tener un solo rostro visible

### Error: "Multiple faces detected"
- La imagen contiene más de un rostro
- Toma una foto con solo una persona

### Error: "Face not recognized"
- El rostro no está registrado en el sistema
- La calidad de la imagen puede ser baja
- Considera re-registrar el rostro con mejor iluminación

### Baja confianza en verificación
- Ajusta `SIMILARITY_THRESHOLD` en .env
- Considera cambiar a un modelo más preciso (ej: Facenet512)
- Mejora las condiciones de iluminación

## 📈 Performance

- **Tiempo de registro**: ~2-3 segundos
- **Tiempo de verificación**: ~1-2 segundos
- **Tiempo de identificación**: ~1-2 segundos por cada 100 rostros registrados
- **Precisión**: >95% con Facenet512 y RetinaFace

## 🔄 Comunicación con otros servicios

```
Frontend (React) <---> Nginx <---> Facial Recognition Service
                        ^                      |
                        |                      v
                        +-------- Backend (Node.js)
                                       |
                                       v
                                   MongoDB
```

## 📝 Notas Importantes

1. **Primera ejecución**: La primera vez se descargarán los modelos de DeepFace (~1GB)
2. **Almacenamiento**: Las imágenes de rostros se guardan en `/app/data/faces`
3. **Privacidad**: Los embeddings faciales se almacenan de forma segura en MongoDB
4. **Tokens JWT**: Compatibles con el sistema de autenticación del backend principal

## 👥 Autor

TravelBrain Team - Sistema de autenticación facial

## 📄 Licencia

Parte del proyecto TravelBrain
