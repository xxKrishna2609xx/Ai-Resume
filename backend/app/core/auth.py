"""
Authentication middleware and utilities for FastAPI
Handles Firebase token verification and user authentication
"""

import firebase_admin
from firebase_admin import auth
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from typing import Optional, Dict, Any

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

        try:
            # Verify the token with Firebase Admin SDK
            decoded_token = auth.verify_id_token(token)
        except Exception as first_err:
            # If it's a clock skew issue (token used too early), retry after a short delay
            if "Token used too early" in str(first_err):
                print(f"[Auth Warning] Clock skew detected ({first_err}). Retrying in 2 seconds...")
                import time
                time.sleep(2.0)
                decoded_token = auth.verify_id_token(token)
            else:
                raise first_err

        return AuthUser(
            uid=decoded_token['uid'],
            email=decoded_token.get('email', ''),
            token_data=decoded_token
        )

    except auth.InvalidIdTokenError as e:
        print(f"[Auth Error] Invalid ID Token: {e}")
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )
    except auth.ExpiredIdTokenError as e:
        print(f"[Auth Error] Expired ID Token: {e}")
        raise HTTPException(
            status_code=401,
            detail="Authentication token has expired"
        )
    except Exception as e:
        print(f"[Auth Error] Authentication failed: {str(e)}")
        import traceback
        traceback.print_exc()
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
    FastAPI dependency factory that checks the authenticated user has an allowed role.

    Usage:
        @app.get("/company-only")
        async def company_route(user: AuthUser = Depends(require_role(["company"]))):
            return {"message": "Company access granted"}

    Fix #14: Previously this was a no-op decorator that never checked roles.
    Now implemented as a proper FastAPI Depends factory.
    """
    async def role_checker(
        credentials: HTTPAuthorizationCredentials = Security(security)
    ) -> AuthUser:
        # First verify the token
        user = await verify_firebase_token(credentials)

        # Then check the role stored in the token claims
        user_role = user.token_data.get("role")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required role(s): {', '.join(allowed_roles)}"
            )
        return user

    return role_checker
