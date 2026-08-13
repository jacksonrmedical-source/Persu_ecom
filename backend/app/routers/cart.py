from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.supabase_client import get_supabase
from app.core.auth import get_current_user_id

router = APIRouter()


class CartItemIn(BaseModel):
    product_id: str
    variant_id: str | None = None
    quantity: int = 1


@router.get("")
def get_cart(user_id: str = Depends(get_current_user_id)):
    sb = get_supabase()
    res = (
        sb.table("cart_items")
        .select("*, products(title, slug, sale_price, mrp, product_images(url, is_primary)), product_variants(size, color, stock)")
        .eq("user_id", user_id)
        .execute()
    )
    return res.data


@router.post("")
def add_to_cart(item: CartItemIn, user_id: str = Depends(get_current_user_id)):
    sb = get_supabase()
    payload = {
        "user_id": user_id,
        "product_id": item.product_id,
        "variant_id": item.variant_id,
        "quantity": item.quantity,
    }

    if item.variant_id:
        # unique(user_id, variant_id) works fine when variant_id is set
        res = sb.table("cart_items").upsert(payload, on_conflict="user_id,variant_id").execute()
    else:
        # Postgres treats every NULL as distinct, so the unique constraint
        # never matches two null-variant rows — upsert can't dedupe them.
        # Look up an existing no-variant row for this product manually instead.
        existing = (
            sb.table("cart_items")
            .select("id, quantity")
            .eq("user_id", user_id)
            .eq("product_id", item.product_id)
            .is_("variant_id", "null")
            .execute()
        )
        if existing.data:
            row = existing.data[0]
            res = (
                sb.table("cart_items")
                .update({"quantity": row["quantity"] + item.quantity})
                .eq("id", row["id"])
                .execute()
            )
        else:
            res = sb.table("cart_items").insert(payload).execute()

    return res.data


@router.patch("/{item_id}")
def update_quantity(item_id: str, quantity: int, user_id: str = Depends(get_current_user_id)):
    sb = get_supabase()
    res = (
        sb.table("cart_items")
        .update({"quantity": quantity})
        .eq("id", item_id)
        .eq("user_id", user_id)
        .execute()
    )
    return res.data


@router.delete("/{item_id}")
def remove_from_cart(item_id: str, user_id: str = Depends(get_current_user_id)):
    sb = get_supabase()
    sb.table("cart_items").delete().eq("id", item_id).eq("user_id", user_id).execute()
    return {"deleted": True}
