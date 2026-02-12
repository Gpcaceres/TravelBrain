#!/bin/bash

echo "Installing Python dependencies for local development..."
cd facial-recognition-service

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "============================================"
echo "Dependencies installed!"
echo "To activate the environment:"
echo "  cd facial-recognition-service"
echo "  source venv/bin/activate"
echo "To run locally:"
echo "  uvicorn src.main:app --reload --host 0.0.0.0 --port 8000"
echo "============================================"
