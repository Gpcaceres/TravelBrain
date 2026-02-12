# Ejemplos de Integración

Este directorio contiene ejemplos de cómo integrar el servicio de reconocimiento facial en diferentes partes de la aplicación TravelBrain.

## FaceLogin.jsx

Componente React completo que implementa:
- Login facial
- Registro de rostro  
- Captura desde cámara web
- Upload de imágenes

### Uso del Componente

```jsx
import FaceLogin from './components/FaceLogin';

function App() {
  return (
    <div>
      <FaceLogin />
    </div>
  );
}
```

## Integración con el Backend Node.js

```javascript
// backend-project/src/controllers/authController.js

const axios = require('axios');

// Verificar si un usuario tiene rostro registrado
exports.checkFaceRegistration = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const response = await axios.get(
      `http://facial-recognition:8000/api/face/status/${userId}`
    );
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Validar token JWT del servicio facial
exports.validateFaceToken = async (req, res, next) => {
  // El token generado por facial-recognition usa la misma clave JWT
  // por lo que es compatible con el backend principal
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

## Flujo de Autenticación Completo

1. **Registro de Usuario** (Backend principal)
   - Usuario se registra con email/password
   - Usuario recibe su ID

2. **Registro de Rostro** (Facial Recognition Service)
   - Usuario captura/sube foto de su rostro
   - POST /api/face/register con user_id
   - Se almacena embedding facial

3. **Login Facial** (Facial Recognition Service)
   - Usuario captura/sube foto
   - POST /api/face/login
   - Sistema identifica usuario y retorna JWT
   - Token es válido para todo el sistema TravelBrain

4. **Acceso a Recursos Protegidos** (Cualquier servicio)
   - Cliente usa JWT en header Authorization
   - Servidor valida token
   - Acceso concedido

## Tips de Implementación

- Usa HTTPS siempre para transmitir imágenes
- Implementa retry logic para requests lentos
- Valida tamaño de imagen antes de enviar (máx 10MB)
- Muestra feedback visual durante procesamiento
- Maneja errores de cámara graciosamente
- Implementa fallback a login tradicional
