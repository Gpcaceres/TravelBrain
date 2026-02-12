"""
Face Recognition Service using DeepFace
Handles face detection, registration, verification, and identification
"""
import os
import cv2
import numpy as np
from deepface import DeepFace
from typing import Optional, Dict, List
import base64
from io import BytesIO
from PIL import Image
import uuid
from datetime import datetime
import tempfile
import aiofiles

class FaceRecognitionService:
    def __init__(self):
        """Initialize Face Recognition Service"""
        self.detection_backend = os.getenv("FACE_DETECTION_BACKEND", "retinaface")
        self.model_name = os.getenv("FACE_RECOGNITION_MODEL", "Facenet512")
        self.similarity_threshold = float(os.getenv("SIMILARITY_THRESHOLD", "0.6"))
        self.face_data_path = os.getenv("FACE_DATA_PATH", "/app/data/faces")
        self.temp_data_path = os.getenv("TEMP_DATA_PATH", "/app/data/temp")
        
        # Ensure directories exist
        os.makedirs(self.face_data_path, exist_ok=True)
        os.makedirs(self.temp_data_path, exist_ok=True)
        
        self._is_ready = True
    
    def is_ready(self) -> bool:
        """Check if service is ready"""
        return self._is_ready
    
    async def _save_temp_image(self, image_data: bytes, filename: str = None) -> str:
        """Save image data to temporary file"""
        if filename is None:
            filename = f"temp_{uuid.uuid4()}.jpg"
        
        filepath = os.path.join(self.temp_data_path, filename)
        
        # Convert bytes to image
        image = Image.open(BytesIO(image_data))
        image.save(filepath)
        
        return filepath
    
    async def _delete_temp_image(self, filepath: str):
        """Delete temporary image file"""
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
        except Exception as e:
            print(f"Error deleting temp file: {e}")
    
    async def detect_face(self, image_data: bytes) -> Dict:
        """
        Detect face in image
        
        Args:
            image_data: Image bytes
            
        Returns:
            Detection result with face coordinates
        """
        temp_path = None
        try:
            # Save temporary image
            temp_path = await self._save_temp_image(image_data)
            
            # Detect face using DeepFace
            face_objs = DeepFace.extract_faces(
                img_path=temp_path,
                detector_backend=self.detection_backend,
                enforce_detection=True
            )
            
            if not face_objs or len(face_objs) == 0:
                raise ValueError("No face detected in image")
            
            if len(face_objs) > 1:
                raise ValueError("Multiple faces detected. Please ensure only one face is visible")
            
            face = face_objs[0]
            
            return {
                "detected": True,
                "confidence": face.get("confidence", 1.0),
                "facial_area": face.get("facial_area", {}),
                "face_count": len(face_objs)
            }
            
        except Exception as e:
            raise ValueError(f"Face detection failed: {str(e)}")
        finally:
            if temp_path:
                await self._delete_temp_image(temp_path)
    
    def _calculate_euclidean_distance(self, embedding1: list, embedding2: list) -> float:
        """
        Calculate euclidean distance between two face embeddings
        Uses L2 normalization for Facenet512 embeddings
        
        Args:
            embedding1: First face embedding
            embedding2: Second face embedding
            
        Returns:
            Euclidean distance (lower = more similar)
        """
        emb1 = np.array(embedding1)
        emb2 = np.array(embedding2)
        
        # L2 normalization for Facenet512
        emb1_norm = emb1 / np.linalg.norm(emb1)
        emb2_norm = emb2 / np.linalg.norm(emb2)
        
        return np.linalg.norm(emb1_norm - emb2_norm)
    
    async def find_similar_face(
        self,
        new_embedding: list,
        existing_embeddings: list,
        threshold: float = 0.4  # Adjusted for normalized Facenet512
    ) -> Optional[Dict]:
        """
        Find if a similar face already exists in database
        
        Args:
            new_embedding: Embedding of the new face to check
            existing_embeddings: List of existing face embeddings from database
            threshold: Similarity threshold (0.4 for normalized Facenet512)
            
        Returns:
            Dictionary with matched user info if found, None otherwise
        """
        for existing in existing_embeddings:
            if "embedding" not in existing:
                continue
                
            distance = self._calculate_euclidean_distance(
                new_embedding,
                existing["embedding"]
            )
            
            # If distance is below threshold, faces are similar
            if distance < threshold:
                # Convert distance to similarity percentage (distance 0 = 100%, distance 1.4 = 0%)
                similarity = max(0, min(100, (1 - (distance / 1.4)) * 100))
                return {
                    "matched": True,
                    "user_id": existing.get("user_id"),
                    "username": existing.get("username"),
                    "email": existing.get("email"),
                    "distance": float(distance),
                    "similarity_percentage": round(similarity, 2)
                }
        
        return None
    
    async def register_face(
        self,
        user_id: str,
        username: str,
        email: str,
        image_data: bytes,
        db_connection=None
    ) -> Dict:
        """
        Register a new face with duplicate detection
        
        Args:
            user_id: User's unique identifier
            username: User's username
            email: User's email
            image_data: Face image bytes
            db_connection: Database connection for duplicate checking
            
        Returns:
            Registration result with face ID
        """
        temp_path = None
        try:
            # Detect face first
            detection_result = await self.detect_face(image_data)
            
            if not detection_result["detected"]:
                raise ValueError("No valid face detected")
            
            # Generate face embedding
            temp_path = await self._save_temp_image(image_data, f"reg_{user_id}_{uuid.uuid4()}.jpg")
            
            embedding = DeepFace.represent(
                img_path=temp_path,
                model_name=self.model_name,
                detector_backend=self.detection_backend,
                enforce_detection=True
            )
            
            new_embedding = embedding[0]["embedding"]
            
            # **DUPLICATE DETECTION**: Check if this face already exists in database
            if db_connection:
                existing_embeddings = await db_connection.get_all_face_embeddings()
                
                similar_face = await self.find_similar_face(
                    new_embedding=new_embedding,
                    existing_embeddings=existing_embeddings,
                    threshold=0.4  # Normalized Facenet512 threshold
                )
                
                if similar_face:
                    raise ValueError(
                        f"Este rostro ya está registrado en el sistema. "
                        f"Usuario existente: {similar_face['username']} ({similar_face['email']}). "
                        f"Similitud: {similar_face['similarity_percentage']}%. "
                        f"No se permite el registro duplicado."
                    )
            
            # Generate unique face ID
            face_id = f"face_{user_id}_{uuid.uuid4()}"
            face_filename = f"{face_id}.jpg"
            face_path = os.path.join(self.face_data_path, face_filename)
            
            # Save face image
            image = Image.open(BytesIO(image_data))
            image.save(face_path)
            
            return {
                "face_id": face_id,
                "user_id": user_id,
                "username": username,
                "email": email,
                "face_path": face_path,
                "embedding": new_embedding,
                "confidence": detection_result["confidence"],
                "created_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            raise ValueError(f"Face registration failed: {str(e)}")
        finally:
            if temp_path:
                await self._delete_temp_image(temp_path)
    
    async def verify_face(
        self,
        user_id: str,
        image_data: bytes,
        registered_face_path: str
    ) -> Dict:
        """
        Verify face against registered face
        
        Args:
            user_id: User's unique identifier
            image_data: Face image to verify
            registered_face_path: Path to registered face image
            
        Returns:
            Verification result with confidence score
        """
        temp_path = None
        try:
            # Check if registered face exists
            if not os.path.exists(registered_face_path):
                raise ValueError("Registered face not found")
            
            # Save temporary image
            temp_path = await self._save_temp_image(image_data, f"verify_{user_id}.jpg")
            
            # Verify using DeepFace
            result = DeepFace.verify(
                img1_path=temp_path,
                img2_path=registered_face_path,
                model_name=self.model_name,
                detector_backend=self.detection_backend,
                enforce_detection=True
            )
            
            verified = result["verified"]
            distance = result["distance"]
            threshold = result["threshold"]
            
            # Calculate confidence score (inverse of distance, normalized)
            confidence = max(0, 1 - (distance / threshold)) if verified else 0
            
            return {
                "verified": verified,
                "confidence": confidence,
                "distance": distance,
                "threshold": threshold,
                "user_id": user_id,
                "model": self.model_name
            }
            
        except Exception as e:
            raise ValueError(f"Face verification failed: {str(e)}")
        finally:
            if temp_path:
                await self._delete_temp_image(temp_path)
    
    async def identify_face(self, image_data: bytes) -> Dict:
        """
        Identify user from face image by comparing with all registered faces
        
        Args:
            image_data: Face image bytes
            
        Returns:
            Identification result with user_id if found
        """
        temp_path = None
        try:
            # Detect face first
            detection_result = await self.detect_face(image_data)
            
            if not detection_result["detected"]:
                return {
                    "identified": False,
                    "message": "No face detected"
                }
            
            # Save temporary image
            temp_path = await self._save_temp_image(image_data, f"identify_{uuid.uuid4()}.jpg")
            
            # Find faces in database directory
            if not os.path.exists(self.face_data_path):
                return {
                    "identified": False,
                    "message": "No registered faces in database"
                }
            
            registered_faces = [
                os.path.join(self.face_data_path, f) 
                for f in os.listdir(self.face_data_path) 
                if f.endswith(('.jpg', '.jpeg', '.png'))
            ]
            
            if not registered_faces:
                return {
                    "identified": False,
                    "message": "No registered faces found"
                }
            
            # Try to find matching face
            best_match = None
            best_distance = float('inf')
            
            for registered_face_path in registered_faces:
                try:
                    result = DeepFace.verify(
                        img1_path=temp_path,
                        img2_path=registered_face_path,
                        model_name=self.model_name,
                        detector_backend=self.detection_backend,
                        enforce_detection=False
                    )
                    
                    if result["verified"] and result["distance"] < best_distance:
                        best_distance = result["distance"]
                        # Extract user_id from filename (face_<user_id>_<uuid>.jpg)
                        filename = os.path.basename(registered_face_path)
                        parts = filename.split('_')
                        if len(parts) >= 2:
                            user_id = parts[1]
                            best_match = {
                                "user_id": user_id,
                                "distance": result["distance"],
                                "threshold": result["threshold"],
                                "face_path": registered_face_path
                            }
                
                except Exception as e:
                    # Continue to next face if verification fails
                    continue
            
            if best_match:
                confidence = max(0, 1 - (best_match["distance"] / best_match["threshold"]))
                return {
                    "identified": True,
                    "user_id": best_match["user_id"],
                    "confidence": confidence,
                    "distance": best_match["distance"],
                    "model": self.model_name
                }
            else:
                return {
                    "identified": False,
                    "message": "No matching face found"
                }
            
        except Exception as e:
            raise ValueError(f"Face identification failed: {str(e)}")
        finally:
            if temp_path:
                await self._delete_temp_image(temp_path)
    
    async def delete_face(self, face_path: str):
        """Delete face image file"""
        try:
            if os.path.exists(face_path):
                os.remove(face_path)
        except Exception as e:
            raise ValueError(f"Failed to delete face: {str(e)}")
