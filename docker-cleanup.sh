#!/bin/bash
# 🧹 Docker Cleanup Script
# Limpia imágenes, contenedores, volúmenes y cache no utilizados

echo "🧹 Starting Docker cleanup..."

# Detener contenedores huérfanos
echo "⏹️  Stopping orphaned containers..."
docker-compose down --remove-orphans

# Eliminar imágenes no utilizadas (dangling)
echo "🗑️  Removing dangling images..."
docker image prune -f

# Eliminar contenedores detenidos
echo "📦 Removing stopped containers..."
docker container prune -f

# Eliminar redes no utilizadas
echo "🌐 Removing unused networks..."
docker network prune -f

# Eliminar volúmenes no utilizados (CUIDADO: esto puede eliminar datos)
echo "💾 Removing unused volumes..."
docker volume prune -f

# Limpieza completa del build cache (libera más espacio)
echo "🧽 Cleaning build cache..."
docker builder prune -f

echo ""
echo "✅ Docker cleanup completed!"
echo ""
echo "📊 Current Docker disk usage:"
docker system df

echo ""
echo "💡 Tip: Run 'docker system prune -a --volumes' for aggressive cleanup (removes ALL unused images)"
