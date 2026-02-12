"""
Test script for Facial Recognition Service
Tests basic functionality without starting the full server
"""
import os
import sys
import asyncio
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

async def test_services():
    """Test all services"""
    print("🧪 Testing Facial Recognition Service Components\n")
    
    # Test 1: Face Service
    print("1️⃣ Testing Face Service...")
    try:
        from src.services.face_service import FaceRecognitionService
        face_service = FaceRecognitionService()
        print(f"   ✅ Face Service initialized")
        print(f"   - Model: {face_service.model_name}")
        print(f"   - Backend: {face_service.detection_backend}")
        print(f"   - Threshold: {face_service.similarity_threshold}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: Auth Service
    print("\n2️⃣ Testing Auth Service...")
    try:
        from src.services.auth_service import AuthService
        auth_service = AuthService()
        
        # Create test token
        test_data = {
            "user_id": "test123",
            "username": "testuser",
            "email": "test@example.com"
        }
        token = auth_service.create_access_token(test_data)
        print(f"   ✅ Auth Service initialized")
        print(f"   - Token created: {token[:50]}...")
        
        # Verify token
        decoded = auth_service.verify_token(token)
        print(f"   - Token verified: {decoded['username']}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 3: Database Connection
    print("\n3️⃣ Testing Database Connection...")
    try:
        from src.config.database import DatabaseConnection
        db = DatabaseConnection()
        await db.connect()
        is_connected = await db.is_connected()
        print(f"   ✅ Database connection: {'Connected' if is_connected else 'Not connected'}")
        await db.close()
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 4: Logger
    print("\n4️⃣ Testing Logger...")
    try:
        from src.utils.logger import setup_logger
        logger = setup_logger("test")
        logger.info("Test log message")
        print(f"   ✅ Logger initialized")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n✅ All tests completed!")

if __name__ == "__main__":
    # Set environment variables for testing
    os.environ.setdefault("MONGO_URI", "mongodb://localhost:27017")
    os.environ.setdefault("MONGO_DB", "travel_brain_test")
    os.environ.setdefault("JWT_SECRET", "test-secret-key")
    
    # Run tests
    asyncio.run(test_services())
