from fastapi import APIRouter, HTTPException
from app.core.supabase_client import get_supabase

router = APIRouter()


@router.get("")
def list_categories():
    sb = get_supabase()
    res = sb.table("categories").select("*").order("sort_order").execute()
    return res.data


@router.get("/{slug}")
def get_category(slug: str):
    sb = get_supabase()
    res = sb.table("categories").select("*").eq("slug", slug).single().execute()
    if not res.data:
        raise HTTPException(404, "Category not found")
    return res.data
