@echo off
REM Script de desarrollo local para Facial Recognition Service (Windows)

echo Starting Facial Recognition Service - Development Mode
echo ================================================

REM Verificar si existe el entorno virtual
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activar entorno virtual
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Instalar dependencias
echo Installing dependencies...
pip install -r requirements.txt

REM Crear directorios necesarios
echo Creating data directories...
if not exist "data\faces" mkdir data\faces
if not exist "data\temp" mkdir data\temp

REM Iniciar servidor
echo Starting FastAPI server...
echo Server will be available at http://localhost:8000
echo API docs at http://localhost:8000/docs
echo.

uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
