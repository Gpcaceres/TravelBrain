@echo off
echo TravelBrain - Local Environment Setup Check
echo ============================================
echo.

echo Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not running
    exit /b 1
) else (
    echo [OK] Docker is installed
)

echo.
echo Checking Docker Compose...
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed
    exit /b 1
) else (
    echo [OK] Docker Compose is installed
)

echo.
echo Checking required files...

if not exist "docker-compose.yml" (
    echo [ERROR] docker-compose.yml not found
    exit /b 1
) else (
    echo [OK] docker-compose.yml found
)

if not exist "docker-compose.local.yml" (
    echo [ERROR] docker-compose.local.yml not found
    exit /b 1
) else (
    echo [OK] docker-compose.local.yml found
)

if not exist "nginx\nginx-local.conf" (
    echo [ERROR] nginx-local.conf not found
    exit /b 1
) else (
    echo [OK] nginx-local.conf found
)

if not exist "facial-recognition-service\.env" (
    echo [WARNING] facial-recognition-service\.env not found, using defaults
) else (
    echo [OK] facial-recognition-service\.env found
)

echo.
echo ============================================
echo All checks passed! Ready to start.
echo.
echo Run: start-local.bat
echo ============================================
