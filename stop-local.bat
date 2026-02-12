@echo off
echo Stopping TravelBrain Local Environment...
docker-compose -f docker-compose.yml -f docker-compose.local.yml down
echo Done!
