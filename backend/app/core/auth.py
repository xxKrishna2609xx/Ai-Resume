"""
Authentication middleware and utilities for FastAPI
Handles Firebase token verification and user authentication
"""

import firebase_admin
from firebase_admin import auth
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from typing import Optional, Dict, Any
from functools import wraps

security = HTTPBearer()


class AuthUser:
    """Represents an authenticated user"""
    def __init__(self, uid: str, email: str, token_data: Dict[str, Any]):
        self.uid = uid
        self.email = email
        self.token_data = token_data
        self.email_verified = token_data.get('email_verified', False)
        
    def __repr__(self):
        return f"<AuthUser uid={self.uid} email={self.email}>"


async def verify_firebase_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> AuthUser:
    """
    Verify Firebase ID token from Authorization header
    
    Usage in routes:
        @app.get("/protected")
        async def protected_route(user: AuthUser = Depends(verify_firebase_token)):
            return {"message": f"Hello {user.email}"}
    """
    try:
        token = credentials.credentials
        
        # Verify the token with Firebase Admin SDK
        decoded_token = auth.verify_id_token(token)
        
        return AuthUser(
            uid=decoded_token['uid'],
            email=decoded_token.get('email', ''),
            token_data=decoded_token
        )
        
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=401,
            detail="Authentication token has expired"
        )
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Authentication failed: {str(e)}"
        )


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(HTTPBearer(auto_error=False))
) -> Optional[AuthUser]:
    """
    Get current user if authenticated, otherwise return None
    Useful for routes that work differently for authenticated vs anonymous users
    """
    if credentials is None:
        return None
    
    try:
        return await verify_firebase_token(credentials)
    except HTTPException:
        return None


def require_role(allowed_roles: list):
    """
    Decorator to require specific user roles
    
    Usage:
        @app.get("/company-only")
        @require_role(["company"])
        async def company_route(user: AuthUser = Depends(verify_firebase_token)):
            return {"message": "Company access granted"}
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # This is a placeholder - you'd need to fetch user role from Firestore
            # and check against allowed_roles
            return await func(*args, **kwargs)
        return wrapper
    return decorator
