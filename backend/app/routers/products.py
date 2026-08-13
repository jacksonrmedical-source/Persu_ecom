from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.core.supabase_client import get_supabase

router = APIRouter()


@router.get("")
def list_products(
    category_slug: Optional[str] = None,
    is_flash_deal: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: str = Query("newest", enum=["newest", "price_asc", "price_desc", "discount"]),
    page: int = 1,
    page_size: int = 24,
):
    sb = get_supabase()
    # categories!inner is required so filtering on categories.slug actually
    # excludes non-matching rows — a plain embed only nulls the field instead
    # of filtering, since PostgREST embeds default to a left join.
    category_embed = "categories!inner(slug, name)" if category_slug else "categories(slug, name)"
    q = sb.table("products").select(
        f"*, product_images(url, is_primary), {category_embed}",
        count="exact",
    ).eq("is_active", True)

    if category_slug:
        q = q.eq("categories.slug", category_slug)
    if is_flash_deal is not None:
        q = q.eq("is_flash_deal", is_flash_deal)
    if min_price is not None:
        q = q.gte("sale_price", min_price)
    if max_price is not None:
        q = q.lte("sale_price", max_price)

    if sort == "price_asc":
        q = q.order("sale_price")
    elif sort == "price_desc":
        q = q.order("sale_price", desc=True)
    elif sort == "newest":
        q = q.order("created_at", desc=True)
    # 'discount' sort computed client-side since it's a derived field

    start = (page - 1) * page_size
    end = start + page_size - 1
    q = q.range(start, end)

    res = q.execute()
    return {"items": res.data, "total": res.count, "page": page, "page_size": page_size}


@router.get("/{slug}")
def get_product(slug: str):
    sb = get_supabase()
    res = (
        sb.table("products")
        .select("*, product_images(url, sort_order, is_primary), product_variants(*), categories(slug, name)")
        .eq("slug", slug)
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(404, "Product not found")

    product = res.data
    # loot-meter ratio for the scarcity gauge on the frontend
    total = product.get("stock_total") or 1
    remaining = product.get("stock_remaining") or 0
    product["stock_ratio"] = round(remaining / total, 2) if total else 0
    return product
