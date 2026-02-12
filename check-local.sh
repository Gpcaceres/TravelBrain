#!/bin/bash

echo "TravelBrain - Local Environment Setup Check"
echo "============================================"
echo ""

echo "Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed or not running"
    exit 1
else
    echo "[OK] Docker is installed"
fi

echo ""
echo "Checking Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "[ERROR] Docker Compose is not installed"
    exit 1
else
    echo "[OK] Docker Compose is installed"
fi

echo ""
echo "Checking required files..."

if [ ! -f "docker-compose.yml" ]; then
    echo "[ERROR] docker-compose.yml not found"
    exit 1
else
    echo "[OK] docker-compose.yml found"
fi

if [ ! -f "docker-compose.local.yml" ]; then
    echo "[ERROR] docker-compose.local.yml not found"
    exit 1
else
    echo "[OK] docker-compose.local.yml found"
fi

if [ ! -f "nginx/nginx-local.conf" ]; then
    echo "[ERROR] nginx-local.conf not found"
    exit 1
else
    echo "[OK] nginx-local.conf found"
fi

if [ ! -f "facial-recognition-service/.env" ]; then
    echo "[WARNING] facial-recognition-service/.env not found, using defaults"
else
    echo "[OK] facial-recognition-service/.env found"
fi

echo ""
echo "============================================"
echo "All checks passed! Ready to start."
echo ""
echo "Run: ./start-local.sh"
echo "============================================"
