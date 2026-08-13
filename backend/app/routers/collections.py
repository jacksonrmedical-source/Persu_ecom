from fastapi import APIRouter, HTTPException
from app.core.supabase_client import get_supabase

router = APIRouter()


@router.get("")
def list_collections():
    """All active collections, e.g. 'Buy More Save More', 'Flash Friday'."""
    sb = get_supabase()
    res = (
        sb.table("collections")
        .select("*")
        .eq("is_active", True)
        .order("sort_order")
        .execute()
    )
    return res.data


@router.get("/{slug}/products")
def get_collection_products(slug: str, limit: int = 20):
    sb = get_supabase()
    collection = sb.table("collections").select("id").eq("slug", slug).single().execute()
    if not collection.data:
        raise HTTPException(404, "Collection not found")

    res = (
        sb.table("collection_products")
        .select("sort_order, products(*, product_images(url, is_primary))")
        .eq("collection_id", collection.data["id"])
        .order("sort_order")
        .limit(limit)
        .execute()
    )
    return [row["products"] for row in res.data]
