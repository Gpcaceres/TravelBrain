@echo off
echo Rebuilding Facial Recognition Service...
echo ============================================

docker-compose -f docker-compose.yml -f docker-compose.local.yml stop facial-recognition
docker-compose -f docker-compose.yml -f docker-compose.local.yml rm -f facial-recognition
docker-compose -f docker-compose.yml -f docker-compose.local.yml build facial-recognition
docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d facial-recognition

echo.
echo Waiting for service to start...
timeout /t 5 /nobreak > nul

echo.
echo Service status:
docker-compose -f docker-compose.yml -f docker-compose.local.yml ps facial-recognition

echo.
echo Facial Recognition Service rebuilt!
echo URL: http://localhost:8000
echo Docs: http://localhost:8000/docs
echo.
echo View logs: logs-local.bat facial-recognition
