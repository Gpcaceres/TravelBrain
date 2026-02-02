# Configuración de Google OAuth 2.0 para TravelBrain

## 1. CONFIGURACIÓN EN GOOGLE CLOUD CONSOLE

### Paso 1: Crear/Seleccionar Proyecto
1. Ve a: https://console.cloud.google.com/
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombre sugerido: **TravelBrain**

### Paso 2: Habilitar Google+ API
1. Ve a **"APIs y servicios"** > **"Biblioteca"**
2. Busca **"Google+ API"** o **"Google Identity"**
3. Haz clic en **"Habilitar"**

### Paso 3: Configurar Pantalla de Consentimiento OAuth
1. Ve a **"APIs y servicios"** > **"Pantalla de consentimiento de OAuth"**
2. Selecciona **"Externa"** (o "Interna" si es para una organización)
3. Completa la información requerida:
   - **Nombre de la aplicación**: TravelBrain
   - **Correo de soporte**: tu-email@example.com
   - **Logo**: (opcional)
   - **Dominio de la aplicación**: travelbrain.ddns.net
   - **Correo del desarrollador**: tu-email@example.com
4. En **"Scopes"**, añade:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. Guarda y continúa

### Paso 4: Crear Credenciales OAuth 2.0
1. Ve a **"APIs y servicios"** > **"Credenciales"**
2. Haz clic en **"+ CREAR CREDENCIALES"**
3. Selecciona **"ID de cliente de OAuth"**
4. Tipo de aplicación: **"Aplicación web"**
5. Nombre: **TravelBrain Web Client**

### Paso 5: Configurar URIs Autorizados

#### Orígenes de JavaScript autorizados:
```
http://travelbrain.ddns.net
http://localhost:3000
```

⚠️ **IMPORTANTE**: Para producción, se recomienda usar HTTPS:
```
https://travelbrain.ddns.net
```

#### URIs de redireccionamiento autorizados:
```
http://travelbrain.ddns.net/api/auth/google/callback
http://localhost:3004/api/auth/google/callback
```

Para producción con HTTPS:
```
https://travelbrain.ddns.net/api/auth/google/callback
```

### Paso 6: Obtener Credenciales
1. Después de crear el cliente OAuth, verás:
   - **Client ID**: algo como `123456789-abcdefg.apps.googleusercontent.com`
   - **Client Secret**: algo como `GOCSPX-abcdefghijklmnop`
2. **Copia estos valores** - los necesitarás para el archivo `.env`

---

## 2. CONFIGURACIÓN DEL BACKEND

### Variables de Entorno (.env)

Crea o actualiza el archivo `backend-project/.env`:

```env
# MongoDB
MONGO_URI=mongodb://tu-mongo-uri/
MONGO_DB=travel_brain

# JWT
JWT_SECRET=tu-jwt-secret-muy-seguro-y-largo-aqui

# Session
SESSION_SECRET=tu-session-secret-muy-seguro-aqui

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GOOGLE_CALLBACK_URL=http://travelbrain.ddns.net/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://travelbrain.ddns.net

# Server
PORT=3004
NODE_ENV=production

# CORS
CORS_ORIGINS=http://travelbrain.ddns.net,http://localhost:3000
```

⚠️ **IMPORTANTE**: 
- Cambia `JWT_SECRET` por una cadena aleatoria larga y segura
- Cambia `SESSION_SECRET` por una cadena aleatoria larga y segura
- Usa los valores reales de `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`

### Generar Secretos Seguros

Puedes generar secretos seguros con Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 3. CONFIGURACIÓN DEL FRONTEND

### Variables de Entorno (.env)

Crea o actualiza el archivo `frontend-react/.env`:

```env
REACT_APP_API_URL=http://travelbrain.ddns.net/api
```

Para desarrollo local:
```env
REACT_APP_API_URL=http://localhost:3004/api
```

---

## 4. USAR EL COMPONENTE GOOGLELOGINBUTTON

### En tu página de Login

Actualiza tu componente de Login para incluir el botón de Google:

```jsx
import React from 'react';
import GoogleLoginButton from '../components/GoogleLoginButton';
import './Login.css';

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        
        {/* Formulario tradicional */}
        <form>
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Contraseña" />
          <button type="submit">Iniciar Sesión</button>
        </form>
        
        {/* Separador */}
        <div className="divider">
          <span>o</span>
        </div>
        
        {/* Botón de Google OAuth */}
        <GoogleLoginButton />
        
        <p>
          ¿No tienes cuenta? <a href="/register">Regístrate</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
```

---

## 5. TESTING

### Testing Local

#### Terminal 1 - Backend:
```bash
cd backend-project
npm install
npm run dev
```

#### Terminal 2 - Frontend:
```bash
cd frontend-react
npm install
npm start
```

#### Probar en navegador:
1. Abre: `http://localhost:3000/login`
2. Haz clic en **"Continuar con Google"**
3. Deberías ser redirigido a Google
4. Selecciona tu cuenta de Google
5. Deberías volver a tu app en `/auth/success`
6. Finalmente serás redirigido a `/dashboard`

### Testing en Producción

1. **Desplegar Backend y Frontend** en tu servidor
2. Asegúrate de que las variables de entorno estén configuradas correctamente
3. Ve a: `http://travelbrain.ddns.net/login`
4. Haz clic en **"Continuar con Google"**
5. Verifica el flujo completo

### Verificar que todo funciona:

#### 1. Backend responde:
```bash
curl http://travelbrain.ddns.net/api/health
```

#### 2. Ruta de Google funciona:
```bash
curl -I http://travelbrain.ddns.net/api/auth/google
```
Debería responder con un **redirect 302** a Google.

#### 3. Frontend carga:
Abre `http://travelbrain.ddns.net` en el navegador

---

## 6. TROUBLESHOOTING

### Error: "redirect_uri_mismatch"
**Causa**: La URI de callback no coincide con la configurada en Google Cloud Console.

**Solución**:
1. Verifica que en Google Cloud Console tengas exactamente:
   ```
   http://travelbrain.ddns.net/api/auth/google/callback
   ```
2. Verifica que tu variable `GOOGLE_CALLBACK_URL` coincida exactamente
3. Elimina espacios en blanco al principio o final

### Error: "origin_mismatch"
**Causa**: El origen del frontend no está autorizado.

**Solución**:
1. Añade el origen en Google Cloud Console:
   ```
   http://travelbrain.ddns.net
   ```

### Error: "invalid_client"
**Causa**: El Client ID o Client Secret son incorrectos.

**Solución**:
1. Verifica que copiaste correctamente las credenciales
2. Asegúrate de no tener espacios extra
3. Reinicia el servidor backend después de cambiar el `.env`

### Usuario no se crea en la base de datos
**Causa**: Error en la conexión a MongoDB o en el modelo.

**Solución**:
1. Verifica la conexión a MongoDB
2. Revisa los logs del servidor backend
3. Verifica que el modelo User tenga los campos correctos

---

## 7. SEGURIDAD - MIGRAR A HTTPS

⚠️ **IMPORTANTE**: Google recomienda usar HTTPS en producción.

### Obtener certificado SSL con Let's Encrypt (gratis):

```bash
# Instalar Certbot
sudo apt-get update
sudo apt-get install certbot

# Obtener certificado
sudo certbot certonly --standalone -d travelbrain.ddns.net

# Los certificados estarán en:
# /etc/letsencrypt/live/travelbrain.ddns.net/fullchain.pem
# /etc/letsencrypt/live/travelbrain.ddns.net/privkey.pem
```

### Actualizar Google Cloud Console:
Cambia todos los URIs de `http://` a `https://`:
```
https://travelbrain.ddns.net
https://travelbrain.ddns.net/api/auth/google/callback
```

### Actualizar variables de entorno:
```env
GOOGLE_CALLBACK_URL=https://travelbrain.ddns.net/api/auth/google/callback
FRONTEND_URL=https://travelbrain.ddns.net
```

---

## 8. RESUMEN DE ARCHIVOS CREADOS/MODIFICADOS

### Backend:
- ✅ `backend-project/src/config/passport.js` - Configuración de Passport
- ✅ `backend-project/src/routes/authRoutes.js` - Rutas OAuth añadidas
- ✅ `backend-project/src/models/User.js` - Campo `provider` añadido
- ✅ `backend-project/src/app.js` - Passport integrado
- ✅ `backend-project/.env` - Variables añadidas

### Frontend:
- ✅ `frontend-react/src/components/GoogleLoginButton.jsx` - Componente creado
- ✅ `frontend-react/src/components/GoogleLoginButton.css` - Estilos creados
- ✅ `frontend-react/src/pages/AuthSuccess.jsx` - Página creada
- ✅ `frontend-react/src/pages/AuthSuccess.css` - Estilos creados
- ✅ `frontend-react/src/services/authService.js` - Servicio creado
- ✅ `frontend-react/src/App.jsx` - Ruta añadida
- ✅ `frontend-react/.env` - Variable añadida

---

## 9. PRÓXIMOS PASOS

1. ✅ Configura Google Cloud Console con las credenciales
2. ✅ Actualiza el archivo `.env` del backend con las credenciales
3. ✅ Reinicia el servidor backend
4. ✅ Añade el componente `GoogleLoginButton` a tu página de Login
5. ✅ Prueba el flujo completo localmente
6. ✅ Despliega en producción
7. ⚠️ Considera migrar a HTTPS para mayor seguridad

---

¿Necesitas ayuda con algún paso específico?
