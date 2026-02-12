"""
Authentication Service for JWT token generation and validation
"""
import os
from datetime import datetime, timedelta
from typing import Optional, Dict
from jose import JWTError, jwt
from passlib.context import CryptContext

class AuthService:
    def __init__(self):
        """Initialize Authentication Service"""
        self.secret_key = os.getenv("JWT_SECRET", "travelbrain-super-secret-key-2026-production")
        self.algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        self.expires_in_days = int(os.getenv("JWT_EXPIRES_IN", "7"))
        
        # Password hashing context (for future use)
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    def create_access_token(self, data: Dict) -> str:
        """
        Create JWT access token
        
        Args:
            data: Dictionary containing user data to encode in token
            
        Returns:
            Encoded JWT token string
        """
        to_encode = data.copy()
        
        # Add expiration time
        expire = datetime.utcnow() + timedelta(days=self.expires_in_days)
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        })
        
        # Create JWT token
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[Dict]:
        """
        Verify and decode JWT token
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded token data or None if invalid
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError:
            return None
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        return self.pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return self.pwd_context.verify(plain_password, hashed_password)
