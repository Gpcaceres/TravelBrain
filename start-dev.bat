@echo off
REM TravelBrain - Script de inicio para Windows

echo ===============================================================
echo   TravelBrain - Iniciando servicios
echo ===============================================================
echo.

REM Verificar directorio
if not exist "business-rules-backend" (
    echo Error: Ejecuta este script desde la raiz del proyecto
    pause
    exit /b 1
)

echo Verificando dependencias...
echo.

REM Instalar dependencias si es necesario
if not exist "business-rules-backend\node_modules" (
    echo Instalando dependencias de Business Rules Backend...
    cd business-rules-backend
    call npm install
    cd ..
)

if not exist "backend-project\node_modules" (
    echo Instalando dependencias de Backend...
    cd backend-project
    call npm install
    cd ..
)

if not exist "frontend-react\node_modules" (
    echo Instalando dependencias de Frontend...
    cd frontend-react
    call npm install
    cd ..
)

echo.
echo Iniciando servicios...
echo.

REM Crear directorio de logs
if not exist "logs" mkdir logs

REM Iniciar Business Rules API
echo 1. Iniciando Business Rules API (Puerto 3005)...
start "Business Rules API" cmd /k "cd business-rules-backend && npm run dev"
timeout /t 3 >nul

REM Iniciar Backend API
echo 2. Iniciando Backend API (Puerto 3004)...
start "Backend API" cmd /k "cd backend-project && npm run dev"
timeout /t 3 >nul

REM Iniciar Frontend
echo 3. Iniciando Frontend (Puerto 5173)...
start "Frontend" cmd /k "cd frontend-react && npm run dev"
timeout /t 3 >nul

echo.
echo ===============================================================
echo   Servicios iniciados en ventanas separadas
echo ===============================================================
echo.
echo   Business Rules API: http://localhost:3005
echo   Backend API:        http://localhost:3004
echo   Frontend:           http://localhost:5173
echo.
echo   Cierra las ventanas de comando para detener los servicios
echo ===============================================================
echo.

pause
