from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.supabase_client import get_supabase
from app.core.admin_auth import verify_admin

router = APIRouter(dependencies=[Depends(verify_admin)])


class VariantIn(BaseModel):
    size: str | None = None
    color: str | None = None
    stock: int = 0


class ProductIn(BaseModel):
    title: str
    slug: str
    description: str | None = None
    category_id: str
    mrp: float
    sale_price: float
    stock_total: int
    dispatch_hours: int = 48
    is_flash_deal: bool = False
    flash_deal_ends_at: str | None = None
    image_urls: list[str] = []
    variants: list[VariantIn] = []
    collection_ids: list[str] = []


@router.get("/categories")
def list_categories_for_admin():
    sb = get_supabase()
    return sb.table("categories").select("id, name, slug").order("name").execute().data


@router.get("/collections")
def list_collections_for_admin():
    sb = get_supabase()
    return sb.table("collections").select("id, name, slug").order("name").execute().data


@router.post("/products")
def create_product(payload: ProductIn):
    sb = get_supabase()

    existing = sb.table("products").select("id").eq("slug", payload.slug).execute()
    if existing.data:
        raise HTTPException(400, f"Slug '{payload.slug}' is already in use")

    product_row = (
        sb.table("products")
        .insert(
            {
                "title": payload.title,
                "slug": payload.slug,
                "description": payload.description,
                "category_id": payload.category_id,
                "mrp": payload.mrp,
                "sale_price": payload.sale_price,
                "stock_total": payload.stock_total,
                "stock_remaining": payload.stock_total,
                "dispatch_hours": payload.dispatch_hours,
                "is_flash_deal": payload.is_flash_deal,
                "flash_deal_ends_at": payload.flash_deal_ends_at,
            }
        )
        .execute()
    )
    product = product_row.data[0]
    product_id = product["id"]

    if payload.image_urls:
        sb.table("product_images").insert(
            [
                {
                    "product_id": product_id,
                    "url": url,
                    "is_primary": i == 0,
                    "sort_order": i,
                }
                for i, url in enumerate(payload.image_urls)
            ]
        ).execute()

    if payload.variants:
        sb.table("product_variants").insert(
            [
                {
                    "product_id": product_id,
                    "size": v.size,
                    "color": v.color,
                    "stock": v.stock,
                    "sku": f"{payload.slug}-{v.size or v.color or 'default'}",
                }
                for v in payload.variants
            ]
        ).execute()

    if payload.collection_ids:
        sb.table("collection_products").insert(
            [
                {"collection_id": cid, "product_id": product_id, "sort_order": 0}
                for cid in payload.collection_ids
            ]
        ).execute()

    return {"id": product_id, "slug": payload.slug}


@router.get("/products")
def list_products_for_admin():
    sb = get_supabase()
    res = (
        sb.table("products")
        .select("id, title, slug, sale_price, stock_remaining, is_active, created_at")
        .order("created_at", desc=True)
        .execute()
    )
    return res.data


@router.delete("/products/{product_id}")
def delete_product(product_id: str):
    sb = get_supabase()
    sb.table("products").delete().eq("id", product_id).execute()
    return {"deleted": True}


@router.get("/orders")
def list_all_orders():
    sb = get_supabase()
    res = (
        sb.table("orders")
        .select("*, order_items(*), addresses(full_name, phone, city, state)")
        .order("created_at", desc=True)
        .execute()
    )
    return res.data


class OrderStatusUpdate(BaseModel):
    status: str


@router.patch("/orders/{order_id}")
def update_order_status(order_id: str, payload: OrderStatusUpdate):
    sb = get_supabase()
    valid = {"pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"}
    if payload.status not in valid:
        raise HTTPException(400, f"Status must be one of {sorted(valid)}")
    sb.table("orders").update({"status": payload.status}).eq("id", order_id).execute()
    return {"updated": True}
