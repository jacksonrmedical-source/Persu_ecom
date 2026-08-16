from fastapi import Depends, HTTPException
from app.core.auth import get_current_user_id
from app.core.supabase_client import get_supabase


def require_admin(user_id: str = Depends(get_current_user_id)) -> str:
    """Verifies the caller is logged in AND has role='admin' in profiles.
    This checks the database, not a shared secret — the frontend cannot
    fake this by knowing a password, since it's tied to the caller's own
    Supabase-verified identity (see get_current_user_id).
    """
    sb = get_supabase()
    profile = sb.table("profiles").select("role").eq("id", user_id).single().execute()
    if not profile.data or profile.data.get("role") != "admin":
        raise HTTPException(403, "Admin access required")
    return user_id
