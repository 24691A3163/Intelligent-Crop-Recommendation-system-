from typing import Optional, Dict, Any
import jwt
from fastapi import Header, HTTPException, status
from backend.app.core.config import SUPABASE_JWT_SECRET

def verify_supabase_token(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """
    Extracts and verifies the Supabase JWT token if provided in the Authorization header.
    Returns user payload dictionary or None if header is not present.
    """
    if not authorization:
        return None

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected 'Bearer <token>'"
        )

    token = authorization.split(" ")[1]

    try:
        # If secret is set, verify signature; otherwise decode payload with verify=False
        if SUPABASE_JWT_SECRET:
            payload = jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
        else:
            payload = jwt.decode(
                token,
                options={"verify_signature": False}
            )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please log in again."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}"
        )

