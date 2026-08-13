from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone
from app.core.supabase_client import get_supabase

router = APIRouter()


class CouponCheck(BaseModel):
    code: str
    subtotal: float


@router.post("/validate")
def validate_coupon(payload: CouponCheck):
    sb = get_supabase()
    res = sb.table("coupons").select("*").eq("code", payload.code.upper()).single().execute()
    coupon = res.data
    if not coupon or not coupon["is_active"]:
        raise HTTPException(400, "Invalid coupon code")

    now = datetime.now(timezone.utc)
    if coupon.get("valid_until") and datetime.fromisoformat(coupon["valid_until"]) < now:
        raise HTTPException(400, "This coupon has expired")

    if coupon.get("usage_limit") and coupon["times_used"] >= coupon["usage_limit"]:
        raise HTTPException(400, "This coupon has reached its usage limit")

    if payload.subtotal < (coupon.get("min_order_value") or 0):
        raise HTTPException(
            400, f"Minimum order value of ₹{coupon['min_order_value']} required for this coupon"
        )

    if coupon["discount_type"] == "flat":
        discount = coupon["discount_value"]
    else:
        discount = payload.subtotal * (coupon["discount_value"] / 100)
        if coupon.get("max_discount"):
            discount = min(discount, coupon["max_discount"])

    return {
        "code": coupon["code"],
        "discount": round(discount, 2),
        "discount_type": coupon["discount_type"],
    }
