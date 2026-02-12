@echo off
echo Installing Python dependencies for local development...
cd facial-recognition-service

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt

echo.
echo ============================================
echo Dependencies installed!
echo To activate the environment: 
echo   cd facial-recognition-service
echo   venv\Scripts\activate.bat
echo To run locally:
echo   uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
echo ============================================
