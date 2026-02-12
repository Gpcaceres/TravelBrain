# API Reference - Facial Recognition Service

## Base URL

```
Production: https://travelbrain.ddns.net/api/face
Development: http://localhost:8000/api/face
```

## Authentication

La mayoría de endpoints públicos no requieren autenticación. Los endpoints que modifican datos de usuarios requieren un JWT token válido en el header `Authorization`.

```http
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Health Check

#### `GET /`
Verifica que el servicio esté operativo.

**Response:**
```json
{
  "service": "TravelBrain Facial Recognition",
  "status": "active",
  "version": "1.0.0"
}
```

---

#### `GET /health`
Health check detallado con información de servicios.

**Response:**
```json
{
  "status": "healthy",
  "database": true,
  "face_service": true
}
```

---

### 2. Register Face

#### `POST /api/face/register`
Registra un nuevo rostro para un usuario.

**Content-Type:** `multipart/form-data`

**Parameters:**

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| user_id   | string | Yes      | ID único del usuario           |
| username  | string | Yes      | Nombre de usuario              |
| email     | string | Yes      | Email del usuario              |
| file      | file   | Yes      | Imagen con el rostro (JPG/PNG) |

**Example Request:**
```javascript
const formData = new FormData();
formData.append('user_id', '507f1f77bcf86cd799439011');
formData.append('username', 'johndoe');
formData.append('email', 'john@example.com');
formData.append('file', imageFile);

const response = await fetch('https://travelbrain.ddns.net/api/face/register', {
  method: 'POST',
  body: formData
});
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Face registered successfully",
  "face_id": "face_507f1f77bcf86cd799439011_a1b2c3d4",
  "user_id": "507f1f77bcf86cd799439011"
}
```

**Error Responses:**

```json
// 400 - No face detected
{
  "detail": "No face detected in image"
}

// 400 - Multiple faces
{
  "detail": "Multiple faces detected. Please ensure only one face is visible"
}

// 400 - Invalid file type
{
  "detail": "File must be an image"
}

// 500 - Processing error
{
  "detail": "Error registering face: <error_message>"
}
```

---

### 3. Verify Face

#### `POST /api/face/verify`
Verifica si un rostro corresponde a un usuario específico (verificación 1:1).

**Content-Type:** `multipart/form-data`

**Parameters:**

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| user_id   | string | Yes      | ID del usuario a verificar     |
| file      | file   | Yes      | Imagen con el rostro a verificar |

**Example Request:**
```javascript
const formData = new FormData();
formData.append('user_id', '507f1f77bcf86cd799439011');
formData.append('file', imageFile);

const response = await fetch('https://travelbrain.ddns.net/api/face/verify', {
  method: 'POST',
  body: formData
});
```

**Success Response (200):**
```json
{
  "verified": true,
  "confidence": 0.89,
  "distance": 0.25,
  "threshold": 0.6,
  "user_id": "507f1f77bcf86cd799439011",
  "model": "Facenet512"
}
```

**Field Descriptions:**
- `verified`: Boolean indicando si la verificación fue exitosa
- `confidence`: Nivel de confianza (0-1, mayor es mejor)
- `distance`: Distancia euclidiana entre embeddings (menor es mejor)
- `threshold`: Umbral usado para la decisión
- `model`: Modelo usado para la verificación

**Error Responses:**

```json
// 404 - Usuario sin rostro registrado
{
  "detail": "User face not registered"
}

// 400 - Error en detección
{
  "detail": "Face detection failed: <error_message>"
}
```

---

### 4. Face Login

#### `POST /api/face/login`
Autentica un usuario mediante reconocimiento facial (identificación 1:N).

**Content-Type:** `multipart/form-data`

**Parameters:**

| Parameter | Type | Required | Description                    |
|-----------|------|----------|--------------------------------|
| file      | file | Yes      | Imagen con el rostro del usuario |

**Example Request:**
```javascript
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
  localStorage.setItem('user', JSON.stringify(data.user));
  
  // Redirigir
  window.location.href = '/dashboard';
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "message": "Login successful with 89.2% confidence"
}
```

**JWT Token Claims:**
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "username": "johndoe",
  "email": "john@example.com",
  "auth_method": "facial_recognition",
  "iat": 1707651600,
  "exp": 1708256400,
  "type": "access"
}
```

**Failed Response (200):**
```json
{
  "success": false,
  "message": "Face not recognized. Please try again or use alternative login method."
}
```

**Error Responses:**

```json
// 400 - Invalid file
{
  "detail": "File must be an image"
}

// 404 - User not found
{
  "detail": "User not found"
}

// 500 - Processing error
{
  "detail": "Login failed: <error_message>"
}
```

---

### 5. Update Face

#### `POST /api/face/update`
Actualiza el rostro registrado de un usuario. **Requiere autenticación.**

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Content-Type:** `multipart/form-data`

**Parameters:**

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| user_id   | string | Yes      | ID del usuario                 |
| file      | file   | Yes      | Nueva imagen del rostro        |

**Example Request:**
```javascript
const formData = new FormData();
formData.append('user_id', '507f1f77bcf86cd799439011');
formData.append('file', imageFile);

const token = localStorage.getItem('token');

const response = await fetch('https://travelbrain.ddns.net/api/face/update', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Face updated successfully"
}
```

**Error Responses:**

```json
// 401 - No autorizado
{
  "detail": "Authorization header missing"
}

// 403 - Forbidden
{
  "detail": "Unauthorized to update this face"
}

// 400 - Invalid file
{
  "detail": "File must be an image"
}
```

---

### 6. Delete Face

#### `DELETE /api/face/delete/{user_id}`
Elimina los datos faciales de un usuario. **Requiere autenticación.**

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Parameters:**

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| user_id   | string | Yes      | ID del usuario (en URL)        |

**Example Request:**
```javascript
const userId = '507f1f77bcf86cd799439011';
const token = localStorage.getItem('token');

const response = await fetch(
  `https://travelbrain.ddns.net/api/face/delete/${userId}`,
  {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Face data deleted successfully"
}
```

**Error Responses:**

```json
// 401 - No autorizado
{
  "detail": "Invalid or expired token"
}

// 403 - Forbidden
{
  "detail": "Unauthorized to delete this face"
}

// 404 - Not found
{
  "detail": "Face data not found"
}
```

---

### 7. Face Status

#### `GET /api/face/status/{user_id}`
Verifica si un usuario tiene un rostro registrado.

**Parameters:**

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| user_id   | string | Yes      | ID del usuario (en URL)        |

**Example Request:**
```javascript
const userId = '507f1f77bcf86cd799439011';

const response = await fetch(
  `https://travelbrain.ddns.net/api/face/status/${userId}`
);

const data = await response.json();

if (data.has_face_registered) {
  // Mostrar opción de login facial
  showFaceLoginButton();
}
```

**Success Response (200):**
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "has_face_registered": true,
  "registration_date": "2026-02-11T10:30:00.000Z"
}
```

---

## Error Codes

| Code | Meaning                | Description                           |
|------|------------------------|---------------------------------------|
| 200  | OK                     | Request successful                    |
| 400  | Bad Request            | Invalid parameters or image           |
| 401  | Unauthorized           | Missing or invalid authentication     |
| 403  | Forbidden              | User not allowed to perform action    |
| 404  | Not Found              | Resource not found                    |
| 500  | Internal Server Error  | Server processing error               |

---

## Rate Limits

Rate limits are enforced by Nginx:

- **General endpoints**: 30 requests/second
- **Face processing endpoints**: 10 requests/second with burst of 10

**Rate limit headers:**
```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1707651660
```

---

## Best Practices

### Image Requirements

✅ **Good:**
- Single person facing camera
- Good lighting (natural or artificial)
- Clear, unobstructed face
- Neutral expression
- Image size: 640x480 to 1920x1080
- Format: JPG, PNG
- Size: < 10MB

❌ **Bad:**
- Multiple people in frame
- Wearing sunglasses
- Poor lighting / shadows
- Side profile
- Blurry images
- Extremely low/high resolution

### Error Handling

```javascript
async function faceLogin(imageFile) {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const response = await fetch('/api/face/login', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    
    const data = await response.json();
    
    if (data.success) {
      return { success: true, token: data.token, user: data.user };
    } else {
      return { success: false, message: data.message };
    }
    
  } catch (error) {
    console.error('Face login error:', error);
    return { success: false, message: error.message };
  }
}
```

### Security

1. **Always use HTTPS** in production
2. **Validate JWT tokens** on every protected endpoint
3. **Don't expose user_id** in client-side code when possible
4. **Implement retry logic** with exponential backoff
5. **Clear sensitive data** from memory after use

---

## Examples

### Complete Login Flow

```javascript
// 1. Capturar imagen del usuario
const captureImage = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  const video = document.querySelector('video');
  video.srcObject = stream;
  
  // Capturar después de 3 segundos
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  
  return new Promise(resolve => {
    canvas.toBlob(resolve, 'image/jpeg', 0.9);
  });
};

// 2. Realizar login
const performFaceLogin = async () => {
  try {
    setLoading(true);
    
    // Capturar imagen
    const imageBlob = await captureImage();
    
    // Crear FormData
    const formData = new FormData();
    formData.append('file', imageBlob, 'photo.jpg');
    
    // Enviar request
    const response = await fetch('https://travelbrain.ddns.net/api/face/login', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Guardar credenciales
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirigir
      window.location.href = '/dashboard';
    } else {
      alert(data.message);
    }
    
  } catch (error) {
    console.error('Login error:', error);
    alert('Error durante el login facial');
  } finally {
    setLoading(false);
  }
};
```

---

## Testing

### Using cURL

```bash
# Health check
curl https://travelbrain.ddns.net/api/face/health

# Register face
curl -X POST https://travelbrain.ddns.net/api/face/register \
  -F "user_id=507f1f77bcf86cd799439011" \
  -F "username=johndoe" \
  -F "email=john@example.com" \
  -F "file=@/path/to/photo.jpg"

# Face login
curl -X POST https://travelbrain.ddns.net/api/face/login \
  -F "file=@/path/to/photo.jpg"

# Check status
curl https://travelbrain.ddns.net/api/face/status/507f1f77bcf86cd799439011

# Verify face
curl -X POST https://travelbrain.ddns.net/api/face/verify \
  -F "user_id=507f1f77bcf86cd799439011" \
  -F "file=@/path/to/photo.jpg"

# Delete face (requires token)
curl -X DELETE https://travelbrain.ddns.net/api/face/delete/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <your_jwt_token>"
```

### Using Postman

1. Import collection from `/examples/postman_collection.json`
2. Set environment variables:
   - `base_url`: https://travelbrain.ddns.net
   - `token`: <your_jwt_token>
3. Run requests
