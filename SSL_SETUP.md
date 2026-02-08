# Configuración HTTPS con Let's Encrypt para TravelBrain

Este proyecto ahora usa Nginx como reverse proxy con certificados SSL gratuitos de Let's Encrypt.

## 🔒 Arquitectura

```
Internet (443/80)
       ↓
   [Nginx SSL]
       ↓
   ├─→ Frontend (React) :80
   ├─→ Backend (Node.js) :3004
   └─→ Business Rules :3005
```

## 📋 Requisitos Previos

✅ Docker y Docker Compose instalados
✅ Puerto 80 abierto en el firewall
✅ Puerto 443 abierto en el firewall
✅ Dominio apuntando al servidor: `travelbrain.ddns.net`

## 🚀 Instalación Inicial

### 1. Detener servicios actuales

```bash
docker-compose down
```

### 2. Obtener certificados SSL (Primera vez)

**En Windows:**
```cmd
init-letsencrypt.bat
```

**En Linux/Mac:**
```bash
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh
```

Este script va a:
- ✅ Crear certificados dummy temporales
- ✅ Iniciar Nginx
- ✅ Solicitar certificados reales a Let's Encrypt
- ✅ Reemplazar los certificados dummy
- ✅ Recargar Nginx

**⏱ Tiempo estimado: 2-3 minutos**

### 3. Verificar que funcionó

Abre tu navegador en:
```
https://travelbrain.ddns.net
```

Deberías ver:
- ✅ Candado verde (certificado SSL válido)
- ✅ Tu aplicación funcionando
- ✅ Sin errores de certificado

## 🔄 Renovación Automática

Los certificados se renuevan **automáticamente cada 12 horas** gracias al contenedor `certbot`.

Let's Encrypt verifica si los certificados están por vencer y los renueva automáticamente.

## 🛠 Comandos Útiles

### Iniciar los servicios
```bash
docker-compose up -d
```

### Ver logs
```bash
# Todos los servicios
docker-compose logs -f

# Solo nginx
docker-compose logs -f nginx

# Solo certbot
docker-compose logs -f certbot
```

### Detener servicios
```bash
docker-compose down
```

### Verificar certificados
```bash
docker-compose exec nginx nginx -t
```

### Forzar renovación de certificados
```bash
docker-compose run --rm certbot renew --force-renewal
docker-compose exec nginx nginx -s reload
```

### Ver fecha de expiración del certificado
```bash
docker-compose run --rm --entrypoint "certbot certificates" certbot
```

## 📁 Estructura de Archivos

```
TravelBrain/
├── nginx/
│   ├── nginx.conf          # Configuración de Nginx
│   └── Dockerfile          # Imagen de Nginx
├── certbot/                # Generado automáticamente
│   ├── conf/              # Certificados SSL
│   └── www/               # Validación de Let's Encrypt
├── init-letsencrypt.sh    # Script de inicialización (Linux/Mac)
├── init-letsencrypt.bat   # Script de inicialización (Windows)
└── docker-compose.yml     # Configuración actualizada
```

## 🔧 Configuración

### Variables de entorno actualizadas:

- **Frontend**: `VITE_API_URL=https://travelbrain.ddns.net`
- **Backend**: `CORS_ORIGINS=https://travelbrain.ddns.net`
- **JWT_SECRET**: Cambiado a una clave segura de producción

### URLs de acceso:

- **Aplicación**: https://travelbrain.ddns.net
- **API Backend**: https://travelbrain.ddns.net/api/*
- **Business Rules**: https://travelbrain.ddns.net/business-rules/*

Nginx hace el routing automático:
- Peticiones a `/api/*` → Backend :3004
- Peticiones a `/business-rules/*` → Business Rules :3005  
- Todo lo demás → Frontend :80

## 🔐 Seguridad

✅ **Certificados SSL válidos** (Let's Encrypt)
✅ **HTTP → HTTPS redirect** automático
✅ **TLS 1.2 y 1.3** únicamente
✅ **Security headers** configurados:
   - Strict-Transport-Security
   - X-Frame-Options
   - X-Content-Type-Options
   - X-XSS-Protection

✅ **Rate limiting** configurado:
   - API endpoints: 10 req/s (burst 20)
   - General: 30 req/s

## 🐛 Troubleshooting

### Problema: "Connection refused"
```bash
# Verificar que Nginx está corriendo
docker-compose ps

# Reiniciar Nginx
docker-compose restart nginx
```

### Problema: "Certificate not found"
```bash
# Ejecutar nuevamente la inicialización
init-letsencrypt.bat  # Windows
# o
./init-letsencrypt.sh # Linux/Mac
```

### Problema: "Too many certificates already issued"
Let's Encrypt tiene límite de 5 certificados por semana por dominio.
- **Solución**: Esperar una semana o usar staging mode para testing.

### Problema: "Port 80/443 already in use"
```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :80
netstat -ano | findstr :443

# Detener otros servicios que usen esos puertos
```

### Ver logs detallados de Nginx
```bash
docker-compose exec nginx cat /var/log/nginx/error.log
docker-compose exec nginx cat /var/log/nginx/access.log
```

## 📊 Verificar configuración SSL

Usa estas herramientas online:
- https://www.ssllabs.com/ssltest/
- https://securityheaders.com/

Tu sitio debería obtener calificación **A** o **A+**

## 🔄 Actualizar configuración

Si cambias `nginx/nginx.conf`:

```bash
# Recargar configuración sin downtime
docker-compose exec nginx nginx -s reload

# O reiniciar el contenedor
docker-compose restart nginx
```

## 📝 Notas Importantes

1. **Backup de certificados**: Los certificados están en `./certbot/conf/`. Haz backup periódicamente.

2. **Dominio válido requerido**: Let's Encrypt NO emite certificados para:
   - localhost
   - IPs (192.168.x.x, 10.x.x.x)
   - Dominios inválidos

3. **Límites de Let's Encrypt**:
   - 50 certificados por dominio registrado por semana
   - 5 certificados duplicados por semana

4. **Email de notificación**: Actualiza el email en `init-letsencrypt.bat` o `.sh` con tu email real para recibir alertas de expiración.

## ✅ Checklist de Verificación

Después de la instalación, verifica:

- [ ] `https://travelbrain.ddns.net` carga sin errores
- [ ] Candado verde en el navegador
- [ ] No hay warnings de certificado
- [ ] `http://travelbrain.ddns.net` redirige a HTTPS
- [ ] Login funciona correctamente
- [ ] API responde correctamente
- [ ] Admin panel funciona
- [ ] Búsqueda y paginación funcionan

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica el firewall: puertos 80 y 443 abiertos
3. Confirma el DNS: `travelbrain.ddns.net` apunta a tu IP
4. Prueba la configuración: `docker-compose exec nginx nginx -t`

---

## 🎉 ¡Todo listo!

Tu aplicación ahora está protegida con HTTPS y tiene certificados SSL válidos que se renuevan automáticamente. 🔒✨
