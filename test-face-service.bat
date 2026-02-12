@echo off
echo Testing Facial Recognition Service...
echo ============================================
echo.

echo Health Check:
curl -s http://localhost:8000/health
echo.

echo.
echo Root Endpoint:
curl -s http://localhost:8000/
echo.

echo.
echo Through Nginx:
curl -s http://localhost/api/face/
echo.

echo ============================================
echo Test completed!
