from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.supabase_client import get_supabase
from app.core.auth import get_current_user_id

router = APIRouter()


@router.get("")
def get_wishlist(user_id: str = Depends(get_current_user_id)):
    sb = get_supabase()
    res = (
        sb.table("wishlist_items")
        .select("id, product_id, created_at, products(title, slug, sale_price, mrp, product_images(url, is_primary))")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data


class WishlistAdd(BaseModel):
    product_id: str


@router.post("")
def add_to_wishlist(payload: WishlistAdd, user_id: str = Depends(get_current_user_id)):
    sb = get_supabase()
    # upsert so re-adding an already-wishlisted product doesn't error
    sb.table("wishlist_items").upsert(
        {"user_id": user_id, "product_id": payload.product_id},
        on_conflict="user_id,product_id",
    ).execute()
    return {"added": True}


@router.delete("/{product_id}")
def remove_from_wishlist(product_id: str, user_id: str = Depends(get_current_user_id)):
    sb = get_supabase()
    sb.table("wishlist_items").delete().eq("user_id", user_id).eq("product_id", product_id).execute()
    return {"removed": True}
