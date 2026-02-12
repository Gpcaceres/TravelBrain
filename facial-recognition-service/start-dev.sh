#!/bin/bash

# Script de desarrollo local para Facial Recognition Service

echo "🚀 Starting Facial Recognition Service - Development Mode"
echo "================================================"

# Verificar si existe el entorno virtual
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activar entorno virtual
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Instalar dependencias
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Verificar MongoDB
echo "🔍 Checking MongoDB connection..."
if [ -z "$MONGO_URI" ]; then
    echo "⚠️  Warning: MONGO_URI not set. Loading from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Crear directorios necesarios
echo "📁 Creating data directories..."
mkdir -p data/faces
mkdir -p data/temp

# Iniciar servidor
echo "✅ Starting FastAPI server..."
echo "📡 Server will be available at http://localhost:8000"
echo "📚 API docs at http://localhost:8000/docs"
echo ""

uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
