"""
Authentication middleware for JWT token validation
"""
from fastapi import HTTPException, Header
from typing import Optional
from src.services.auth_service import AuthService

auth_service = AuthService()

async def verify_token(authorization: Optional[str] = Header(None)) -> dict:
    """
    Verify JWT token from Authorization header
    
    Args:
        authorization: Authorization header with Bearer token
        
    Returns:
        Decoded token data
        
    Raises:
        HTTPException: If token is invalid or missing
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    # Extract token from "Bearer <token>"
    parts = authorization.split()
    
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    
    token = parts[1]
    
    # Verify token
    payload = auth_service.verify_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return payload
