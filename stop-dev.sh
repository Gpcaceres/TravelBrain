#!/bin/bash

# TravelBrain - Script para detener servicios de desarrollo

echo "🛑 Deteniendo servicios de TravelBrain..."

if [ -f ".pids" ]; then
    while read pid; do
        if ps -p $pid > /dev/null 2>&1; then
            echo "   Deteniendo proceso $pid..."
            kill $pid 2>/dev/null
        fi
    done < .pids
    rm -f .pids
    echo "✅ Todos los servicios detenidos"
else
    echo "⚠️  No se encontró archivo .pids"
    echo "   Buscando procesos manualmente..."
    
    # Buscar y matar procesos por puerto
    lsof -ti:3005 | xargs kill -9 2>/dev/null && echo "   Business Rules API detenida"
    lsof -ti:3004 | xargs kill -9 2>/dev/null && echo "   Backend API detenida"
    lsof -ti:5173 | xargs kill -9 2>/dev/null && echo "   Frontend detenido"
fi

echo "🧹 Limpiando archivos temporales..."
rm -f .pids

echo "✅ Listo!"
