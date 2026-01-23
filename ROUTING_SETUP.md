# 🗺️ Routing API Setup Guide

## Configuración de APIs de Rutas

El sistema ahora utiliza **GraphHopper** como API principal de routing porque es más confiable y precisa que OpenRouteService. Las rutas terrestres ahora siguen carreteras reales en lugar de solo líneas curvas.

---

## 🚀 GraphHopper API (Recomendado)

### ¿Por qué GraphHopper?
- ✅ **Más confiable**: Menos problemas de rate limiting
- ✅ **Rutas reales**: Sigue carreteras específicas en lugar de líneas rectas
- ✅ **Mejor calidad**: Usa datos de OpenStreetMap con mejor procesamiento
- ✅ **Gratuito**: 500 requests/día en plan gratuito

### Cómo obtener tu API Key:

1. **Crear cuenta**:
   - Ve a: https://graphhopper.com/dashboard/#/api-keys
   - Haz clic en "Sign Up" o "Get Started"
   - Usa tu email o cuenta de GitHub

2. **Obtener la API Key**:
   - Una vez logueado, ve a "API Keys"
   - Copia tu API key (empieza con algo como `a1b2c3d4...`)

3. **Configurar en el backend**:
   ```bash
   # En backend-project/.env
   GRAPHHOPPER_API_KEY=tu_api_key_aqui
   ```

4. **Límites del plan gratuito**:
   - 500 requests/día
   - Límite de créditos: 500 credits/día
   - 1 request = 1 credit

---

## 🔄 OpenRouteService (Fallback)

El sistema mantiene OpenRouteService como backup si GraphHopper falla.

### Configuración:
```bash
# En backend-project/.env
OPENROUTE_API_KEY=5b3ce3597851110001cf62486bbfc1e6f98743e5b34bf5bf9e2e8b5c
```

### Límites:
- 2,000 requests/día
- Menos confiable (puede dar 403 Forbidden)

---

## 🔧 Cómo funciona el sistema

### 1. **Prioridad de APIs**:
```
GraphHopper (si está configurado)
    ↓ (si falla)
OpenRouteService  
    ↓ (si falla)
Fallback Local (líneas curvas con Bezier)
```

### 2. **Tipos de rutas**:

#### 🚗 Ground (Terrestre):
- Usa GraphHopper/OpenRouteService
- **AHORA**: Sigue carreteras reales (autopistas, rutas nacionales)
- **ANTES**: Solo líneas curvas aproximadas
- Color: Verde (#34D399)

#### ✈️ Air (Aéreo):
- Línea curva directa (Great Circle Route)
- Para distancias > 300 km
- Color: Azul (#4285F4)

#### 🌐 Mixed (Multimodal):
- **NOVEDAD**: Muestra desglose detallado de cada segmento
- Ejemplo: Ecuador → España
  ```
  1. 🚗 Guayaquil → Puerto de Guayaquil (25 km, 30 min)
  2. 🚢 Guayaquil → Barcelona (10,234 km, 15 días)
  3. 🚗 Puerto de Barcelona → Barcelona (12 km, 20 min)
  ```
- Color: Morado (#9333EA)

---

## 📊 Visualización de Rutas Mixed

Cuando seleccionas una ruta Mixed, ahora verás:

### Journey Breakdown (Desglose del Viaje):
```
┌─────────────────────────────────────┐
│ 🗺️ Journey Breakdown              │
├─────────────────────────────────────┤
│ ① 🚗 GROUND SEGMENT                │
│    📍 25 km  ⏱️ 30m                 │
│                                     │
│ ② 🚢 SEA SEGMENT                   │
│    📍 10,234 km  ⏱️ 360h            │
│                                     │
│ ③ 🚗 GROUND SEGMENT                │
│    📍 12 km  ⏱️ 20m                 │
├─────────────────────────────────────┤
│ Total Journey: 3 segments           │
└─────────────────────────────────────┘
```

---

## 🛠️ Solución de Problemas

### Problema: "Routing API unavailable, use fallback"
**Causa**: API key inválida o límite de requests alcanzado

**Solución**:
1. Verifica que `GRAPHHOPPER_API_KEY` esté configurado correctamente
2. Comprueba que no has excedido el límite de 500 requests/día
3. El sistema automáticamente usa fallback local (líneas curvas)

### Problema: Las rutas terrestres no siguen carreteras
**Causa**: GraphHopper no está configurado o falló

**Solución**:
1. Configura `GRAPHHOPPER_API_KEY` en el `.env`
2. Reinicia el backend: `cd backend-project && npm run dev`
3. Verifica en la consola del backend que dice "GraphHopper routing successful"

### Problema: Errores 403 Forbidden
**Causa**: OpenRouteService tiene rate limiting estricto

**Solución**:
- Usa GraphHopper que es más confiable
- El sistema automáticamente hace fallback si ambas APIs fallan

---

## 📝 Ejemplo de Configuración Completa

### Backend `.env`:
```env
# Routing APIs
GRAPHHOPPER_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
OPENROUTE_API_KEY=5b3ce3597851110001cf62486bbfc1e6f98743e5b34bf5bf9e2e8b5c
```

### Frontend `.env`:
```env
# NOT NEEDED - Backend handles all API calls
# Frontend usa backend proxy en /api/routing/directions
```

---

## 🎯 Beneficios del Nuevo Sistema

### Antes:
- ❌ Rutas terrestres = líneas curvas aproximadas
- ❌ No seguían carreteras reales
- ❌ Distancias y tiempos imprecisos
- ❌ Rutas Mixed sin detalles

### Ahora:
- ✅ Rutas terrestres siguen carreteras reales
- ✅ Distancias y tiempos precisos (con GraphHopper)
- ✅ Desglose completo de rutas multimodales
- ✅ Visualización detallada de cada segmento
- ✅ Sistema resiliente con múltiples fallbacks

---

## 🔐 Seguridad

- ✅ API keys están en backend (nunca expuestas al frontend)
- ✅ Frontend usa proxy endpoint: `/api/routing/directions`
- ✅ Sin problemas de CORS
- ✅ Rate limiting manejado automáticamente

---

## 📞 Soporte

Si necesitas más requests/día, considera:
- **GraphHopper Pro**: Desde $49/mes (10,000 requests/día)
- **OpenRouteService Premium**: Desde €40/mes (5,000 requests/día)
- **Google Maps Directions API**: Pay-as-you-go ($5 por 1,000 requests)

Para la mayoría de aplicaciones, el plan gratuito de GraphHopper (500/día) es suficiente.
