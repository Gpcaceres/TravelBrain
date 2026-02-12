"""
Facial Recognition Service - Main Application
TravelBrain Secure Authentication System
"""
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv

from src.services.face_service import FaceRecognitionService
from src.services.auth_service import AuthService
from src.config.database import DatabaseConnection
from src.middlewares.auth import verify_token
from src.utils.logger import setup_logger

# Load environment variables
load_dotenv()

# Initialize logger
logger = setup_logger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="TravelBrain Facial Recognition Service",
    description="Secure facial authentication for TravelBrain application",
    version="1.0.0"
)

# CORS Configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
face_service = FaceRecognitionService()
auth_service = AuthService()
db_connection = DatabaseConnection()

# Pydantic Models
class RegisterFaceRequest(BaseModel):
    user_id: str
    username: str
    email: str

class VerifyFaceRequest(BaseModel):
    user_id: str

class LoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    user: Optional[dict] = None
    message: str

@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    await db_connection.connect()
    logger.info("Facial Recognition Service started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    await db_connection.close()
    logger.info("Facial Recognition Service shutting down")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "TravelBrain Facial Recognition",
        "status": "active",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": await db_connection.is_connected(),
        "face_service": face_service.is_ready()
    }

@app.post("/api/face/register", response_model=dict)
async def register_face(
    user_id: str = Form(...),
    username: str = Form(...),
    email: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Register a new face for a user
    
    Args:
        user_id: User's unique identifier
        username: User's username
        email: User's email
        file: Image file containing the user's face
    
    Returns:
        Success message and face ID
    """
    try:
        logger.info(f"Registering face for user: {username} ({user_id})")
        
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image data
        image_data = await file.read()
        
        # Register face with duplicate detection
        result = await face_service.register_face(
            user_id=user_id,
            username=username,
            email=email,
            image_data=image_data,
            db_connection=db_connection  # Pass DB connection for duplicate checking
        )
        
        # Save to database
        await db_connection.save_face_data(result)
        
        logger.info(f"Face registered successfully for user: {username}")
        return {
            "success": True,
            "message": "Face registered successfully",
            "face_id": result["face_id"],
            "user_id": user_id
        }
        
    except ValueError as ve:
        logger.error(f"Validation error: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error registering face: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error registering face: {str(e)}")

@app.post("/api/face/verify", response_model=dict)
async def verify_face(
    user_id: str,
    file: UploadFile = File(...)
):
    """
    Verify a face against a registered user
    
    Args:
        user_id: User's unique identifier
        file: Image file to verify
    
    Returns:
        Verification result with confidence score
    """
    try:
        logger.info(f"Verifying face for user: {user_id}")
        
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image data
        image_data = await file.read()
        
        # Get registered face data
        face_data = await db_connection.get_face_data(user_id)
        if not face_data:
            raise HTTPException(status_code=404, detail="User face not registered")
        
        # Verify face
        result = await face_service.verify_face(
            user_id=user_id,
            image_data=image_data,
            registered_face_path=face_data["face_path"]
        )
        
        logger.info(f"Face verification result for {user_id}: {result['verified']}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying face: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error verifying face: {str(e)}")

@app.post("/api/face/login", response_model=LoginResponse)
async def face_login(file: UploadFile = File(...)):
    """
    Authenticate user using facial recognition
    
    Args:
        file: Image file containing user's face
    
    Returns:
        JWT token and user information if authentication successful
    """
    try:
        logger.info("Processing face login request")
        
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image data
        image_data = await file.read()
        
        # Identify user by face
        identification_result = await face_service.identify_face(image_data)
        
        if not identification_result["identified"]:
            return LoginResponse(
                success=False,
                message="Face not recognized. Please try again or use alternative login method."
            )
        
        user_id = identification_result["user_id"]
        confidence = identification_result["confidence"]
        
        # Get user data from database
        user_data = await db_connection.get_user_data(user_id)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Generate JWT token
        token = auth_service.create_access_token({
            "user_id": user_id,
            "username": user_data["username"],
            "email": user_data["email"],
            "auth_method": "facial_recognition"
        })
        
        # Update last login
        await db_connection.update_last_login(user_id)
        
        logger.info(f"Face login successful for user: {user_data['username']} (confidence: {confidence})")
        
        return LoginResponse(
            success=True,
            token=token,
            user={
                "id": user_id,
                "username": user_data["username"],
                "email": user_data["email"],
                "firstName": user_data.get("firstName", ""),
                "lastName": user_data.get("lastName", "")
            },
            message=f"Login successful with {confidence:.1%} confidence"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during face login: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@app.post("/api/face/update")
async def update_face(
    user_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(verify_token)
):
    """
    Update registered face for a user
    
    Args:
        user_id: User's unique identifier
        file: New image file
        current_user: Current authenticated user (from token)
    
    Returns:
        Success message
    """
    try:
        # Verify user can only update their own face
        if current_user["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized to update this face")
        
        logger.info(f"Updating face for user: {user_id}")
        
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image data
        image_data = await file.read()
        
        # Delete old face data
        old_face_data = await db_connection.get_face_data(user_id)
        if old_face_data:
            await face_service.delete_face(old_face_data["face_path"])
        
        # Register new face
        result = await face_service.register_face(
            user_id=user_id,
            username=current_user["username"],
            email=current_user["email"],
            image_data=image_data
        )
        
        # Update database
        await db_connection.update_face_data(user_id, result)
        
        logger.info(f"Face updated successfully for user: {user_id}")
        return {
            "success": True,
            "message": "Face updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating face: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating face: {str(e)}")

@app.delete("/api/face/delete/{user_id}")
async def delete_face(
    user_id: str,
    current_user: dict = Depends(verify_token)
):
    """
    Delete registered face for a user
    
    Args:
        user_id: User's unique identifier
        current_user: Current authenticated user (from token)
    
    Returns:
        Success message
    """
    try:
        # Verify user can only delete their own face
        if current_user["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized to delete this face")
        
        logger.info(f"Deleting face for user: {user_id}")
        
        # Get face data
        face_data = await db_connection.get_face_data(user_id)
        if not face_data:
            raise HTTPException(status_code=404, detail="Face data not found")
        
        # Delete face file
        await face_service.delete_face(face_data["face_path"])
        
        # Delete from database
        await db_connection.delete_face_data(user_id)
        
        logger.info(f"Face deleted successfully for user: {user_id}")
        return {
            "success": True,
            "message": "Face data deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting face: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting face: {str(e)}")

@app.get("/api/face/status/{user_id}")
async def get_face_status(user_id: str):
    """
    Check if user has registered face
    
    Args:
        user_id: User's unique identifier
    
    Returns:
        Registration status
    """
    try:
        face_data = await db_connection.get_face_data(user_id)
        
        return {
            "user_id": user_id,
            "has_face_registered": face_data is not None,
            "registration_date": face_data.get("created_at") if face_data else None
        }
        
    except Exception as e:
        logger.error(f"Error checking face status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error checking status: {str(e)}")

@app.post("/api/face/verify-liveness", response_model=dict)
async def verify_liveness(file: UploadFile = File(...)):
    """
    Verify liveness detection to prevent spoofing attacks
    (photos, videos, masks, etc.)
    
    Args:
        file: Image file to verify
    
    Returns:
        Liveness verification result with confidence score
    """
    import cv2
    import numpy as np
    from deepface import DeepFace
    from PIL import Image
    from PIL.ExifTags import TAGS
    import io
    
    try:
        logger.info("Starting liveness detection")
        
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image data
        image_data = await file.read()
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        issues = []
        confidence = 100.0
        
        # ==== ANTI-SPOOFING CHECKS ====
        
        # 1. EXIF Metadata Analysis - Detect screenshots or edited photos
        try:
            pil_img = Image.open(io.BytesIO(image_data))
            exif_data = pil_img._getexif() if hasattr(pil_img, '_getexif') else None
            
            if exif_data:
                exif_dict = {TAGS.get(k, k): v for k, v in exif_data.items()}
                
                # Check for screenshot indicators (very specific keywords)
                software = exif_dict.get('Software', '').lower()
                make = exif_dict.get('Make', '').lower()
                
                # Only flag obvious screenshot tools
                screenshot_keywords = ['snipping', 'snagit', 'greenshot', 'lightshot', 'screenshot']
                if any(keyword in software for keyword in screenshot_keywords):
                    issues.append("Screenshot detected - use live camera")
                    confidence -= 80  # Reduced from 100
                    logger.warning(f"Screenshot detected via EXIF: {software}")
        except Exception as e:
            logger.debug(f"EXIF check skipped: {str(e)}")
        
        # 2. Edge/Border Detection - Photos of photos have visible borders
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        
        # Check for rectangular borders (typical in photos of photos)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        height, width = img.shape[:2]
        
        for contour in contours:
            area = cv2.contourArea(contour)
            img_area = height * width
            
            # Large rectangular contour near image border indicates photo of photo
            # RELAXED: More specific criteria to avoid false positives
            if area > img_area * 0.7:  # Increased from 0.6 to be more strict
                x, y, w, h = cv2.boundingRect(contour)
                aspect_ratio = w / float(h)
                
                # Rectangular and near edges WITH strong border
                if 0.8 < aspect_ratio < 1.3 and (x < 10 and y < 10):  # More strict position check
                    issues.append("Photo frame borders detected - use live camera")
                    confidence -= 50  # Reduced from 80
                    logger.warning("Photo frame detected")
                    break
        
        # 3. Moiré Pattern Detection - Appears when photographing screens
        # Apply FFT to detect periodic patterns (RELAXED for webcams)
        f_transform = np.fft.fft2(gray)
        f_shift = np.fft.fftshift(f_transform)
        magnitude_spectrum = 20 * np.log(np.abs(f_shift) + 1)
        
        # High frequency peaks indicate moiré patterns
        center_y, center_x = magnitude_spectrum.shape[0] // 2, magnitude_spectrum.shape[1] // 2
        high_freq_region = magnitude_spectrum[center_y-50:center_y+50, center_x-50:center_x+50]
        high_freq_mean = np.mean(high_freq_region)
        
        # VERY RELAXED: Much higher threshold - webcams naturally have patterns
        if high_freq_mean > 280:  # Increased from 200
            issues.append("Screen moiré pattern detected")
            confidence -= 30  # Reduced from 40
            logger.warning(f"Moiré pattern detected (score: {high_freq_mean:.1f})")
        elif high_freq_mean > 240:
            logger.debug(f"Moderate frequency pattern (score: {high_freq_mean:.1f}) - acceptable for webcam")
        
        # 4. Color Histogram Analysis - Printed photos have different color distribution
        hist_b = cv2.calcHist([img], [0], None, [256], [0, 256])
        hist_g = cv2.calcHist([img], [1], None, [256], [0, 256])
        hist_r = cv2.calcHist([img], [2], None, [256], [0, 256])
        
        # Calculate histogram flatness (uniform distribution indicates processed image)
        hist_std = (np.std(hist_b) + np.std(hist_g) + np.std(hist_r)) / 3
        
        # VERY RELAXED: Lower penalty and threshold
        if hist_std < 20:  # Reduced from 30
            issues.append("Unnatural color distribution detected")
            confidence -= 15  # Reduced from 25
            logger.warning(f"Suspicious color distribution (std: {hist_std:.1f})")
        
        # 5. Texture Analysis - LBP (Local Binary Pattern) for photo detection
        def calculate_lbp_variance(img):
            """Calculate LBP variance - low variance indicates printed/screen photo"""
            # Convert to grayscale if needed
            if len(img.shape) == 3:
                img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            lbp = np.zeros_like(img)
            for i in range(1, img.shape[0] - 1):
                for j in range(1, img.shape[1] - 1):
                    center = img[i, j]
                    code = 0
                    code |= (img[i-1, j-1] > center) << 7
                    code |= (img[i-1, j] > center) << 6
                    code |= (img[i-1, j+1] > center) << 5
                    code |= (img[i, j+1] > center) << 4
                    code |= (img[i+1, j+1] > center) << 3
                    code |= (img[i+1, j] > center) << 2
                    code |= (img[i+1, j-1] > center) << 1
                    code |= (img[i, j-1] > center) << 0
                    lbp[i, j] = code
            
            return np.var(lbp)
        
        lbp_var = calculate_lbp_variance(gray)
        # VERY RELAXED: Much lower threshold and penalty
        if lbp_var < 200:  # Reduced from 400
            issues.append("Suspicious texture pattern - may be printed photo")
            confidence -= 15  # Reduced from 30
            logger.warning(f"Low LBP variance: {lbp_var}")
        
        # 6. Face Detection with Deep Analysis + Hand/Object Detection
        try:
            faces = DeepFace.extract_faces(
                img_path=img,
                detector_backend='retinaface',
                enforce_detection=False
            )
            
            if len(faces) == 0:
                issues.append("No face detected")
                confidence -= 100
            elif len(faces) > 1:
                issues.append("Multiple faces detected - only one person allowed")
                confidence -= 15  # Reduced from 20 (often false positives in background)
            else:
                face = faces[0]
                # Check face confidence
                if face.get('confidence', 0) < 0.85:
                    issues.append("Face detection confidence too low")
                    confidence -= 15
                    
                # Check face size and positioning
                face_area = face['facial_area']
                face_x = face_area['x']
                face_y = face_area['y']
                face_width = face_area['w']
                face_height = face_area['h']
                img_height, img_width = img.shape[:2]
                img_area = img_height * img_width
                face_size_ratio = (face_width * face_height) / img_area
                
                if face_size_ratio < 0.08:
                    issues.append("Face too small - move closer to camera")
                    confidence -= 15
                elif face_size_ratio > 0.85:
                    issues.append("Face too close - move back slightly")
                    confidence -= 10
                
                # **DISABLED: Hand/object detection - Too many false positives with webcams**
                # Skin detection catches neck, arms, background tones
                # Device edge detection is too sensitive for normal webcam frames
                # Only rely on obvious spoofing indicators (EXIF, photo borders)
                
        except Exception as e:
            logger.error(f"Face detection error: {str(e)}")
            issues.append("Face detection failed")
            confidence -= 100
        
        # 7. Blur Detection (VERY RELAXED for webcams)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        if laplacian_var < 30:  # Very low threshold
            issues.append("Image too blurry - hold camera steady")
            confidence -= 15  # Reduced penalty
        elif laplacian_var < 80:  # Gentle warning only
            logger.debug(f"Blur score acceptable: {laplacian_var:.1f}")
        
        # 8. Brightness Check (VERY RELAXED)
        brightness = np.mean(gray)
        if brightness < 30:  # Very dark
            issues.append("Image too dark - improve lighting")
            confidence -= 15  # Reduced
        elif brightness > 230:  # Very bright
            issues.append("Image too bright - reduce lighting")
            confidence -= 15  # Reduced
        
        # 9. Resolution Check (VERY RELAXED)
        if width < 480 or height < 360:  # Very low threshold
            issues.append("Image resolution too low - use better camera")
            confidence -= 15  # Reduced
        
        # 10. Specular Reflection Check - Real faces have skin reflection patterns
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        v_channel = hsv[:, :, 2]
        
        # Check for uniform brightness (printed photos lack natural skin reflection)
        brightness_variance = np.var(v_channel)
        # VERY RELAXED: Minimal threshold
        if brightness_variance < 100:  # Reduced from 200
            issues.append("Unnatural lighting detected - use live camera")
            confidence -= 15  # Reduced from 25
            logger.warning(f"Low brightness variance: {brightness_variance}")
        
        # Ensure confidence doesn't go below 0
        confidence = max(0, confidence)
        
        # **** SIMPLIFIED THRESHOLD ****
        # Accept real webcam captures, reject only obvious spoofing
        # Hand/device detection disabled due to false positives
        critical_keywords = ['screenshot', 'frame borders']
        has_critical_issue = any(keyword in issue.lower() for issue in issues for keyword in critical_keywords)
        
        has_one_face = len(faces) == 1 if 'faces' in locals() else False
        
        # Simple and effective: reasonable confidence + one face + no obvious spoofing
        is_live = (confidence >= 40 and has_one_face and not has_critical_issue)
        
        result = {
            "is_live": is_live,
            "confidence": confidence,
            "message": "Liveness verified successfully" if is_live else "Liveness check failed - please use live camera capture",
            "issues": issues,
            "details": {
                "faces_detected": len(faces) if 'faces' in locals() else 0,
                "blur_score": float(laplacian_var) if 'laplacian_var' in locals() else 0,
                "brightness": float(brightness) if 'brightness' in locals() else 0,
                "brightness_variance": float(brightness_variance) if 'brightness_variance' in locals() else 0,
                "lbp_variance": float(lbp_var) if 'lbp_var' in locals() else 0,
                "resolution": f"{width}x{height}"
            }
        }
        
        logger.info(f"Liveness check result: {is_live} (confidence: {confidence:.1f}%)")
        if not is_live and issues:
            logger.warning(f"Failed checks: {', '.join(issues)}")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during liveness verification: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Liveness verification failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
