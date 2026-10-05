import os
import time
import jwt
import bcrypt
import logging
from typing import Optional, Dict, Any
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

import db

logger = logging.getLogger(__name__)

JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-jwt-key-change-in-production-12345")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_SECONDS = 60 * 60 * 24 * 30  # 30 days
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

security = HTTPBearer()

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(user_id: str, email: str, full_name: Optional[str] = None) -> str:
    now = int(time.time())
    payload = {
        "sub": user_id,
        "email": email,
        "full_name": full_name or "",
        "iat": now,
        "exp": now + JWT_EXPIRE_SECONDS
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Dependency to verify JWT Bearer token and return the user ID."""
    token = credentials.credentials
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    return user_id

def verify_google_credential(credential: str) -> Dict[str, Any]:
    """Verify Google OAuth ID token / credential."""
    try:
        # If GOOGLE_CLIENT_ID is provided, verify audience, otherwise verify token signature
        request = google_requests.Request()
        audience = GOOGLE_CLIENT_ID if GOOGLE_CLIENT_ID else None
        idinfo = id_token.verify_oauth2_token(credential, request, audience=audience)
        return idinfo
    except Exception as e:
        logger.error(f"Google token verification failed: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")
