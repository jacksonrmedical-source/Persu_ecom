import hmac
import hashlib
import razorpay
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.supabase_client import get_supabase
from app.core.auth import get_current_user_id
from app.core.config import settings

router = APIRouter()

razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class OrderItemIn(BaseModel):
    product_id: str
    variant_id: str | None = None
    title_snapshot: str
    price_snapshot: float
    quantity: int


class CreateOrderIn(BaseModel):
    address_id: str
    items: list[OrderItemIn]
    coupon_code: str | None = None
    discount: float = 0
    shipping_fee: float = 0


@router.post("")
def create_order(payload: CreateOrderIn, user_id: str = Depends(get_current_user_id)):
    """Creates a pending order + a Razorpay order for the frontend checkout widget."""
    sb = get_supabase()

    subtotal = sum(i.price_snapshot * i.quantity for i in payload.items)
    total = round(subtotal - payload.discount + payload.shipping_fee, 2)
    if total <= 0:
        raise HTTPException(400, "Order total must be greater than zero")

    coupon_id = None
    if payload.coupon_code:
        c = sb.table("coupons").select("id").eq("code", payload.coupon_code.upper()).single().execute()
        coupon_id = c.data["id"] if c.data else None

    order_row = (
        sb.table("orders")
        .insert(
            {
                "user_id": user_id,
                "address_id": payload.address_id,
                "subtotal": subtotal,
                "discount": payload.discount,
                "shipping_fee": payload.shipping_fee,
                "total": total,
                "coupon_id": coupon_id,
                "status": "pending",
                "payment_status": "pending",
            }
        )
        .execute()
    )
    order = order_row.data[0]

    sb.table("order_items").insert(
        [
            {
                "order_id": order["id"],
                "product_id": i.product_id,
                "variant_id": i.variant_id,
                "title_snapshot": i.title_snapshot,
                "price_snapshot": i.price_snapshot,
                "quantity": i.quantity,
            }
            for i in payload.items
        ]
    ).execute()

    # Razorpay amount is in paise
    rp_order = razorpay_client.order.create(
        {
            "amount": int(total * 100),
            "currency": "INR",
            "receipt": order["id"],
            "notes": {"order_id": order["id"]},
        }
    )

    sb.table("orders").update({"razorpay_order_id": rp_order["id"]}).eq("id", order["id"]).execute()

    return {
        "order_id": order["id"],
        "razorpay_order_id": rp_order["id"],
        "amount": rp_order["amount"],
        "currency": rp_order["currency"],
        "razorpay_key_id": settings.RAZORPAY_KEY_ID,
    }


class VerifyPaymentIn(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.post("/verify-payment")
def verify_payment(payload: VerifyPaymentIn, user_id: str = Depends(get_current_user_id)):
    """Verifies Razorpay's HMAC signature before marking an order as paid.
    Never trust the frontend's 'payment succeeded' callback alone.
    """
    body = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}"
    expected_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(), body.encode(), hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, payload.razorpay_signature):
        sb = get_supabase()
        sb.table("orders").update({"payment_status": "failed"}).eq("id", payload.order_id).execute()
        raise HTTPException(400, "Payment signature verification failed")

    sb = get_supabase()
    order = sb.table("orders").select("*, order_items(*)").eq("id", payload.order_id).eq("user_id", user_id).single().execute()
    if not order.data:
        raise HTTPException(404, "Order not found")

    sb.table("orders").update(
        {
            "payment_status": "paid",
            "status": "paid",
            "razorpay_payment_id": payload.razorpay_payment_id,
        }
    ).eq("id", payload.order_id).eq("user_id", user_id).execute()

    # decrement stock for each item now that payment is confirmed
    for item in order.data["order_items"]:
        product = sb.table("products").select("stock_remaining").eq("id", item["product_id"]).single().execute()
        if product.data:
            new_stock = max(0, product.data["stock_remaining"] - item["quantity"])
            sb.table("products").update({"stock_remaining": new_stock}).eq("id", item["product_id"]).execute()
        if item.get("variant_id"):
            variant = sb.table("product_variants").select("stock").eq("id", item["variant_id"]).single().execute()
            if variant.data:
                new_variant_stock = max(0, variant.data["stock"] - item["quantity"])
                sb.table("product_variants").update({"stock": new_variant_stock}).eq("id", item["variant_id"]).execute()

    # increment coupon usage if one was applied
    if order.data.get("coupon_id"):
        coupon = sb.table("coupons").select("times_used").eq("id", order.data["coupon_id"]).single().execute()
        if coupon.data:
            sb.table("coupons").update({"times_used": coupon.data["times_used"] + 1}).eq("id", order.data["coupon_id"]).execute()

    return {"verified": True}


@router.get("")
def list_my_orders(user_id: str = Depends(get_current_user_id)):
    sb = get_supabase()
    res = (
        sb.table("orders")
        .select("*, order_items(*)")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data
