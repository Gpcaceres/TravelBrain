#!/bin/bash

echo "Starting TravelBrain - Local Development Mode"
echo "============================================"
echo ""

echo "Stopping existing containers..."
docker-compose -f docker-compose.yml -f docker-compose.local.yml down

echo ""
echo "Building and starting services..."
docker-compose -f docker-compose.yml -f docker-compose.local.yml up --build -d

echo ""
echo "Waiting for services to start..."
sleep 10

echo ""
echo "============================================"
echo "Services Status:"
docker-compose -f docker-compose.yml -f docker-compose.local.yml ps

echo ""
echo "============================================"
echo "Services are running at:"
echo ""
echo "Frontend:              http://localhost"
echo "Backend API:           http://localhost/api"
echo "Facial Recognition:    http://localhost/api/face"
echo "Business Rules:        http://localhost/business-rules"
echo ""
echo "Direct access:"
echo "Backend:               http://localhost:3004"
echo "Frontend:              http://localhost:5173"
echo "Facial Recognition:    http://localhost:8000"
echo ""
echo "To view logs: docker-compose -f docker-compose.yml -f docker-compose.local.yml logs -f"
echo "To stop: docker-compose -f docker-compose.yml -f docker-compose.local.yml down"
echo "============================================"
