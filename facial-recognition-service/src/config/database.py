"""
Database connection and operations for MongoDB
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
from typing import Optional, Dict, List
from datetime import datetime

class DatabaseConnection:
    def __init__(self):
        """Initialize database connection"""
        self.mongo_uri = os.getenv("MONGO_URI")
        self.db_name = os.getenv("MONGO_DB", "travel_brain")
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        
    async def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = AsyncIOMotorClient(self.mongo_uri)
            self.db = self.client[self.db_name]
            
            # Create indexes
            await self._create_indexes()
            
            print(f"Connected to MongoDB: {self.db_name}")
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
            raise
    
    async def close(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            print("MongoDB connection closed")
    
    async def is_connected(self) -> bool:
        """Check if database is connected"""
        try:
            if self.client:
                await self.client.admin.command('ping')
                return True
        except Exception:
            pass
        return False
    
    async def _create_indexes(self):
        """Create database indexes"""
        try:
            # Face data indexes
            await self.db.face_data.create_index([("user_id", ASCENDING)], unique=True)
            await self.db.face_data.create_index([("face_id", ASCENDING)])
            await self.db.face_data.create_index([("created_at", DESCENDING)])
            
            # Face authentication logs
            await self.db.face_auth_logs.create_index([("user_id", ASCENDING)])
            await self.db.face_auth_logs.create_index([("timestamp", DESCENDING)])
            
            print("Database indexes created successfully")
        except Exception as e:
            print(f"Error creating indexes: {e}")
    
    async def save_face_data(self, face_data: Dict):
        """
        Save face registration data
        
        Args:
            face_data: Dictionary containing face data
        """
        try:
            # Add timestamp
            face_data["created_at"] = datetime.utcnow()
            face_data["updated_at"] = datetime.utcnow()
            
            # Upsert face data
            result = await self.db.face_data.update_one(
                {"user_id": face_data["user_id"]},
                {"$set": face_data},
                upsert=True
            )
            
            return result
        except Exception as e:
            print(f"Error saving face data: {e}")
            raise
    
    async def get_face_data(self, user_id: str) -> Optional[Dict]:
        """
        Get face data for user
        
        Args:
            user_id: User's unique identifier
            
        Returns:
            Face data dictionary or None
        """
        try:
            result = await self.db.face_data.find_one({"user_id": user_id})
            return result
        except Exception as e:
            print(f"Error getting face data: {e}")
            return None
    
    async def get_all_face_embeddings(self) -> List[Dict]:
        """
        Get all face embeddings from database for duplicate detection
        
        Returns:
            List of dictionaries with user_id, username, email, and embedding
        """
        try:
            cursor = self.db.face_data.find(
                {},
                {"user_id": 1, "username": 1, "email": 1, "embedding": 1, "_id": 0}
            )
            results = await cursor.to_list(length=None)
            return results
        except Exception as e:
            print(f"Error getting all face embeddings: {e}")
            return []
    
    async def update_face_data(self, user_id: str, face_data: Dict):
        """
        Update face data for user
        
        Args:
            user_id: User's unique identifier
            face_data: Updated face data
        """
        try:
            face_data["updated_at"] = datetime.utcnow()
            
            result = await self.db.face_data.update_one(
                {"user_id": user_id},
                {"$set": face_data}
            )
            
            return result
        except Exception as e:
            print(f"Error updating face data: {e}")
            raise
    
    async def delete_face_data(self, user_id: str):
        """
        Delete face data for user
        
        Args:
            user_id: User's unique identifier
        """
        try:
            result = await self.db.face_data.delete_one({"user_id": user_id})
            return result
        except Exception as e:
            print(f"Error deleting face data: {e}")
            raise
    
    async def get_user_data(self, user_id: str) -> Optional[Dict]:
        """
        Get user data from users collection
        
        Args:
            user_id: User's unique identifier
            
        Returns:
            User data dictionary or None
        """
        try:
            # Try to find by _id first
            result = await self.db.users.find_one({"_id": user_id})
            
            if not result:
                # Try to find by string ID
                from bson import ObjectId
                try:
                    result = await self.db.users.find_one({"_id": ObjectId(user_id)})
                except:
                    pass
            
            return result
        except Exception as e:
            print(f"Error getting user data: {e}")
            return None
    
    async def update_last_login(self, user_id: str):
        """
        Update user's last login timestamp
        
        Args:
            user_id: User's unique identifier
        """
        try:
            from bson import ObjectId
            
            # Try both ID formats
            try:
                await self.db.users.update_one(
                    {"_id": ObjectId(user_id)},
                    {"$set": {"lastLogin": datetime.utcnow()}}
                )
            except:
                await self.db.users.update_one(
                    {"_id": user_id},
                    {"$set": {"lastLogin": datetime.utcnow()}}
                )
            
        except Exception as e:
            print(f"Error updating last login: {e}")
    
    async def log_face_auth(self, user_id: str, success: bool, method: str, details: Dict = None):
        """
        Log facial authentication attempt
        
        Args:
            user_id: User's unique identifier
            success: Whether authentication was successful
            method: Authentication method used
            details: Additional details
        """
        try:
            log_entry = {
                "user_id": user_id,
                "success": success,
                "method": method,
                "timestamp": datetime.utcnow(),
                "details": details or {}
            }
            
            await self.db.face_auth_logs.insert_one(log_entry)
        except Exception as e:
            print(f"Error logging face auth: {e}")
    
    async def get_auth_logs(self, user_id: str, limit: int = 50) -> List[Dict]:
        """
        Get authentication logs for user
        
        Args:
            user_id: User's unique identifier
            limit: Maximum number of logs to return
            
        Returns:
            List of log entries
        """
        try:
            cursor = self.db.face_auth_logs.find(
                {"user_id": user_id}
            ).sort("timestamp", DESCENDING).limit(limit)
            
            logs = await cursor.to_list(length=limit)
            return logs
        except Exception as e:
            print(f"Error getting auth logs: {e}")
            return []
