from fastapi import Header, HTTPException
from app.core.config import settings


def verify_admin(x_admin_key: str = Header(...)):
    """Simple shared-secret gate for admin endpoints.
    Not full user auth — meant for a single trusted operator (you),
    not a multi-admin system. Upgrade to real auth if you add staff accounts.
    """
    if not settings.ADMIN_SECRET or x_admin_key != settings.ADMIN_SECRET:
        raise HTTPException(401, "Invalid admin key")
