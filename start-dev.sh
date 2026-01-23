#!/bin/bash

# TravelBrain - Script de inicio para desarrollo local
# Este script inicia los 3 servicios en terminales separadas

echo "═══════════════════════════════════════════════════════"
echo "🧠 TravelBrain - Iniciando servicios"
echo "═══════════════════════════════════════════════════════"

# Verificar si estamos en el directorio correcto
if [ ! -d "business-rules-backend" ] || [ ! -d "backend-project" ] || [ ! -d "frontend-react" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto TravelBrain"
    exit 1
fi

echo "✅ Directorio correcto detectado"
echo ""

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "⚠️  Puerto $port está en uso"
        return 1
    else
        echo "✅ Puerto $port disponible"
        return 0
    fi
}

# Verificar puertos
echo "📡 Verificando puertos..."
check_port 3005 || echo "   Business Rules API puede tener conflictos"
check_port 3004 || echo "   Backend API puede tener conflictos"
check_port 5173 || echo "   Frontend puede tener conflictos"
echo ""

# Verificar instalación de dependencias
echo "📦 Verificando dependencias..."

if [ ! -d "business-rules-backend/node_modules" ]; then
    echo "   Instalando dependencias de Business Rules Backend..."
    cd business-rules-backend && npm install && cd ..
fi

if [ ! -d "backend-project/node_modules" ]; then
    echo "   Instalando dependencias de Backend..."
    cd backend-project && npm install && cd ..
fi

if [ ! -d "frontend-react/node_modules" ]; then
    echo "   Instalando dependencias de Frontend..."
    cd frontend-react && npm install && cd ..
fi

echo "✅ Todas las dependencias instaladas"
echo ""

# Iniciar servicios
echo "🚀 Iniciando servicios..."
echo ""

# Crear archivos de log
mkdir -p logs
touch logs/business-rules.log
touch logs/backend.log
touch logs/frontend.log

# Iniciar Business Rules API en segundo plano
echo "1️⃣  Iniciando Business Rules API (Puerto 3005)..."
cd business-rules-backend
npm run dev > ../logs/business-rules.log 2>&1 &
BUSINESS_RULES_PID=$!
cd ..
echo "   PID: $BUSINESS_RULES_PID"
sleep 2

# Iniciar Backend API en segundo plano
echo "2️⃣  Iniciando Backend API (Puerto 3004)..."
cd backend-project
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo "   PID: $BACKEND_PID"
sleep 3

# Iniciar Frontend en segundo plano
echo "3️⃣  Iniciando Frontend (Puerto 5173)..."
cd frontend-react
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "   PID: $FRONTEND_PID"
sleep 3

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ Todos los servicios iniciados"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📋 Información de servicios:"
echo "   Business Rules API: http://localhost:3005"
echo "   Backend API:        http://localhost:3004"
echo "   Frontend:           http://localhost:5173"
echo ""
echo "📝 Logs disponibles en:"
echo "   ./logs/business-rules.log"
echo "   ./logs/backend.log"
echo "   ./logs/frontend.log"
echo ""
echo "🛑 Para detener todos los servicios:"
echo "   kill $BUSINESS_RULES_PID $BACKEND_PID $FRONTEND_PID"
echo "   O ejecuta: ./stop-dev.sh"
echo ""
echo "📊 Para ver logs en tiempo real:"
echo "   tail -f logs/business-rules.log"
echo "   tail -f logs/backend.log"
echo "   tail -f logs/frontend.log"
echo ""
echo "═══════════════════════════════════════════════════════"

# Guardar PIDs para script de parada
echo "$BUSINESS_RULES_PID" > .pids
echo "$BACKEND_PID" >> .pids
echo "$FRONTEND_PID" >> .pids

# Mantener el script corriendo
echo "Presiona Ctrl+C para detener todos los servicios..."
trap "kill $BUSINESS_RULES_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f .pids; echo ''; echo '🛑 Servicios detenidos'; exit" INT

wait
