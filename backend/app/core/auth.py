from fastapi import Header, HTTPException
from app.core.supabase_client import get_supabase


def get_current_user_id(authorization: str = Header(...)) -> str:
    """Extracts and verifies the Supabase JWT sent from the frontend.
    Expects header: Authorization: Bearer <access_token>
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing bearer token")
    token = authorization.removeprefix("Bearer ").strip()

    sb = get_supabase()
    try:
        user = sb.auth.get_user(token)
    except Exception:
        raise HTTPException(401, "Invalid or expired token")

    if not user or not user.user:
        raise HTTPException(401, "Invalid or expired token")

    return user.user.id
