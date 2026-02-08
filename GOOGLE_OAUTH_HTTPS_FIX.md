# 🔒 Actualización Google OAuth para HTTPS

## ⚠️ ACCIÓN REQUERIDA: Actualizar Callback URLs

Ya que tu sitio ahora usa **HTTPS**, DEBES actualizar las URLs en Google Cloud Console.

---

## 📝 Pasos para Actualizar

### 1. Acceder a Google Cloud Console
https://console.cloud.google.com/apis/credentials

### 2. Seleccionar tu Client ID OAuth
**Client ID actual**: 
```
713160370468-sb3jjg16idaaakn3n6fe870nu6cn2h4b.apps.googleusercontent.com
```

### 3. Actualizar "Authorized Redirect URIs"

**✅ AGREGAR (Principal - HTTPS):**
```
https://travelbrain.ddns.net/api/auth/google/callback
```

**⚠️ MANTENER OPCIONAL (Desarrollo local):**
```
http://localhost:3004/api/auth/google/callback
```

**❌ ELIMINAR (HTTP en producción):**
```
http://travelbrain.ddns.net/api/auth/google/callback
```

### 4. Guardar Cambios
Haz clic en **"GUARDAR"** en Google Console.

---

## 🔐 Configurar Variable de Entorno

### En tu VM Linux (`~/TravelBrain/`):

```bash
# Crear archivo .env
nano .env
```

**Contenido del archivo `.env`:**
```env
# Google OAuth Secret (OBLIGATORIO)
GOOGLE_CLIENT_SECRET=tu_google_client_secret_aqui
```

### Obtener el Client Secret:
1. En Google Cloud Console > Credentials
2. Click en tu OAuth 2.0 Client ID
3. **Copia el "Client Secret"**
4. Pégalo en el archivo `.env`

**⚠️ NUNCA subas el `.env` a Git** (ya está en `.gitignore`)

---

## 🚀 Desplegar Cambios

```bash
# 1. En Windows (donde estás ahora)
git add .
git commit -m "Fix Google OAuth for HTTPS and CSP"
git push

# 2. En VM Linux
cd ~/TravelBrain
git pull

# 3. Crear .env con tu Client Secret
nano .env
# Pegar: GOOGLE_CLIENT_SECRET=tu_secret_aqui

# 4. Reconstruir servicios
docker-compose down
docker-compose up -d --build backend nginx frontend

# 5. Verificar logs
docker-compose logs -f backend | grep GOOGLE
```

---

## ✅ Verificar que Funciona

### 1. Acceder al Login
```
https://travelbrain.ddns.net/login
```

### 2. Click en "Continuar con Google"
- Deberías ver el popup de autorización de Google
- **NO** debería aparecer "redirect_uri_mismatch"

### 3. Después de autorizar
- Serás redirigido a `/auth/success`
- El token se guardará automáticamente
- Serás redirigido al Dashboard

---

## 🐛 Solución de Problemas

### Error: "redirect_uri_mismatch"
```
Causa: La URL de callback en Google Console no coincide
Solución: 
1. Verifica que agregaste exactamente:
   https://travelbrain.ddns.net/api/auth/google/callback
2. Sin espacios, sin barra al final
3. Guarda y espera 5 minutos para que se propague
```

### Error: "invalid_client" o "401 Unauthorized"
```
Causa: GOOGLE_CLIENT_SECRET no configurado o incorrecto
Solución:
1. Verifica el archivo .env existe: ls -la ~/TravelBrain/.env
2. Verifica el contenido: cat ~/TravelBrain/.env
3. Reinicia backend: docker-compose restart backend
```

### Error CSP: "Content Security Policy blocked..."
```
Causa: CSP bloqueando Google
Solución: Ya actualizado en nginx.conf (debe incluir):
   script-src 'self' 'unsafe-eval' https://accounts.google.com
   frame-src https://accounts.google.com
   connect-src 'self' https://accounts.google.com https://*.googleapis.com
```

### Login funciona pero redirige a inicio sin autenticar
```
Causa: Token no se guarda en localStorage
Solución:
1. F12 > Console
2. Ejecutar: localStorage.getItem('travelbrain_token')
3. Si es null, revisa logs: docker-compose logs backend
4. Busca: "GOOGLE CALLBACK HANDLER"
```

---

## 📋 Variables Configuradas

```yaml
# En docker-compose.yml (backend service)
- GOOGLE_CLIENT_ID=713160370468-sb3jjg16idaaakn3n6fe870nu6cn2h4b.apps.googleusercontent.com
- GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}  # ← Desde .env
- GOOGLE_CALLBACK_URL=https://travelbrain.ddns.net/api/auth/google/callback
- FRONTEND_URL=https://travelbrain.ddns.net
```

---

## 🎯 Resumen de Cambios Realizados

✅ **Nginx**: Agregado CSP permisivo para Google OAuth  
✅ **Backend passport.js**: Callback URL cambiado a HTTPS  
✅ **Backend authRoutes.js**: Frontend URL cambiado a HTTPS  
✅ **Frontend config.js**: Usa rutas relativas (HTTPS automático)  
✅ **Frontend Destinations.jsx**: Todas las APIs usan rutas relativas  
✅ **docker-compose.yml**: Variables de entorno HTTPS configuradas  

---

## 📞 Siguiente Paso

**Una vez configurado el `.env` y actualizada la Google Console:**

```bash
docker-compose up -d
```

Luego prueba: **https://travelbrain.ddns.net/login** → Click "Continuar con Google"
