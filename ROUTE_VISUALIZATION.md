# 🗺️ Route Visualization System

## Overview
Sistema mejorado de visualización de rutas que detecta automáticamente el tipo de transporte y muestra rutas con diferentes estilos visuales, similar a Google Maps.

## ✨ Features

### 1. **Detección Automática de Tipo de Transporte**
El sistema analiza la distancia y geografía entre origen y destino para determinar el tipo de transporte más apropiado:

- **🚗 Ground (Terrestre)**: 
  - Distancias < 200 km
  - Línea sólida verde (#34D399)
  - Velocidad estimada: 80 km/h

- **✈️ Air (Aéreo)**:
  - Distancias > 500 km
  - Línea punteada azul (#4285F4)
  - Velocidad estimada: 800 km/h
  - Animación continua de puntos

- **🚢 Sea (Marítimo)**:
  - Cruza grandes cuerpos de agua
  - Línea dash-dot teal (#0D9488)
  - Velocidad estimada: 40 km/h
  - Patrón de olas animado

- **🌐 Mixed (Mixto)**:
  - Combina múltiples tipos de transporte
  - Línea morada con patrón complejo (#9333EA)
  - Velocidad estimada: 300 km/h (promedio)
  - Animación única

### 2. **Visualización Mejorada en Mapa**

#### Marcadores Personalizados
- **Origen (A)**: Marcador verde circular con letra "A"
- **Destino (B)**: Marcador rosa circular con letra "B"
- **Icono de Transporte**: Marcador flotante en el punto medio de la ruta con emoji del tipo de transporte

#### Líneas de Ruta Animadas
Cada tipo de transporte tiene su propia animación CSS:
```css
.air-route {
  animation: dash-air 20s linear infinite;
}

.sea-route {
  animation: dash-sea 30s linear infinite;
}

.mixed-route {
  animation: dash-mixed 25s linear infinite;
}

.ground-route {
  animation: pulse-ground 2s ease-in-out infinite;
}
```

#### Efectos Interactivos
- **Hover**: Las rutas aumentan de grosor y muestran sombra
- **Float Animation**: El icono de transporte flota suavemente
- **Transiciones suaves**: Todos los cambios son animados

### 3. **Leyenda de Rutas**

Muestra en tiempo real:
- Todos los tipos de transporte disponibles
- Indica con ✓ el tipo activo
- Patrones visuales de cada línea
- Emojis representativos

### 4. **Información Detallada**

Tres estadísticas principales:
1. **Distancia**: Cálculo preciso usando fórmula Haversine
2. **Tiempo de viaje**: Estimado según tipo de transporte
3. **Tipo de transporte**: Detectado automáticamente

## 🔧 Technical Implementation

### Backend Changes

#### Model: `FavoriteRoute.js`
```javascript
transportType: {
  type: String,
  enum: ['ground', 'air', 'sea', 'mixed'],
  default: 'ground'
},
segments: [{
  type: {
    type: String,
    enum: ['ground', 'air', 'sea'],
    required: true
  },
  start: { lat: Number, lon: Number, label: String },
  end: { lat: Number, lon: Number, label: String },
  distance: Number,
  duration: Number
}]
```

### Frontend Changes

#### Component: `Destinations.jsx`

**Nueva función `determineTransportType()`**:
```javascript
const determineTransportType = (distance, origin, dest) => {
  if (distance > 500) {
    // Long distance - likely air or mixed
    const latDiff = Math.abs(dest.lat - origin.lat)
    const lonDiff = Math.abs(dest.lng - origin.lng)
    
    if (distance > 2000 && (latDiff > 20 || lonDiff > 30)) {
      if (Math.abs(lonDiff) > 40) {
        return 'mixed' // Cross-continental
      }
      return 'air'
    }
    return 'air'
  } else if (distance > 200) {
    return 'ground'
  } else {
    return 'ground'
  }
}
```

**Función mejorada `updateMapRoute()`**:
- Detecta tipo de transporte
- Aplica estilos dinámicos
- Añade marcador de transporte en punto medio
- Muestra popup con información

#### Styles: `Destinations.css`

**Nuevas animaciones**:
- `@keyframes dash-air`: Animación de línea punteada para vuelos
- `@keyframes dash-sea`: Animación ondulante para rutas marítimas
- `@keyframes dash-mixed`: Patrón complejo para rutas mixtas
- `@keyframes pulse-ground`: Pulso suave para rutas terrestres
- `@keyframes float`: Flotación del icono de transporte

**Nueva clase `.route-legend`**:
- Posicionamiento absoluto sobre el mapa
- Fondo semi-transparente
- Bordes y sombras modernos
- Items con líneas de ejemplo

## 📋 Usage Example

```javascript
// El usuario selecciona origen y destino
// El sistema automáticamente:

1. Calcula la distancia con Haversine
2. Determina el tipo de transporte
3. Ajusta velocidad de viaje estimada
4. Dibuja la ruta con estilo apropiado
5. Muestra leyenda con tipo activo
6. Añade icono flotante en el centro
```

## 🎨 Visual Design

### Color Palette
- **Ground**: `#34D399` (Green) - Representa caminos terrestres
- **Air**: `#4285F4` (Blue) - Color característico de Google para vuelos
- **Sea**: `#0D9488` (Teal) - Evoca el océano
- **Mixed**: `#9333EA` (Purple) - Combinación de múltiples transportes

### Line Patterns
- **Solid**: Rutas terrestres (continuas)
- **Dotted**: Vuelos (discontinuos, como trayectorias de avión)
- **Dash-Dot**: Rutas marítimas (patrón de olas)
- **Complex**: Rutas mixtas (combinación de patrones)

## 🚀 Future Enhancements

1. **Detección de Océanos**: Integrar base de datos de cuerpos de agua para mejor detección de rutas marítimas
2. **Rutas Multi-Segmento**: Mostrar rutas con múltiples paradas y diferentes tipos de transporte
3. **Integración con APIs de Rutas**: Google Directions, OpenRouteService para rutas reales
4. **Modo 3D**: Visualización en 3D para rutas aéreas
5. **Comparación de Rutas**: Mostrar múltiples opciones (aérea vs terrestre)
6. **Costo Estimado**: Añadir estimaciones de costo por tipo de transporte
7. **Huella de Carbono**: Calcular y mostrar emisiones CO2 por ruta

## 📱 Responsive Design

El sistema es completamente responsive:
- **Desktop**: Leyenda visible en esquina inferior derecha
- **Tablet**: Leyenda ajustada al ancho disponible
- **Mobile**: Leyenda colapsable con botón toggle

## 🔒 Data Structure

### DistanceInfo Object
```javascript
{
  distance: "1523.45 km",
  duration: "1h 54m (estimated)",
  origin: "Madrid, Spain",
  destination: "Paris, France",
  transportType: "air",
  distanceKm: 1523.45
}
```

## 🎯 Benefits

1. **UX Mejorada**: Los usuarios entienden inmediatamente el tipo de viaje
2. **Visual Appeal**: Animaciones suaves y colores distintivos
3. **Información Clara**: Iconos y etiquetas intuitivas
4. **Performance**: Animaciones CSS (GPU-accelerated)
5. **Escalable**: Fácil añadir nuevos tipos de transporte

## 📚 References

- [Leaflet Documentation](https://leafletjs.com/)
- [Google Maps Route Styling](https://developers.google.com/maps/documentation/javascript/examples/polyline-simple)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)

---

**Desarrollado por**: TravelBrain Team
**Última actualización**: Enero 2026
