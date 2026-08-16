from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from collections import defaultdict
import csv
import io
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


def _parse_dt(s: str):
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


@router.get("/analytics")
def get_analytics():
    sb = get_supabase()

    orders_res = sb.table("orders").select("*, order_items(*)").execute()
    orders = orders_res.data

    paid_orders = [o for o in orders if o["payment_status"] == "paid"]
    revenue_total = sum(o["total"] for o in paid_orders)
    today = datetime.now(timezone.utc).date()
    revenue_today = sum(
        o["total"] for o in paid_orders if _parse_dt(o["created_at"]).date() == today
    )
    order_count = len(paid_orders)
    avg_order_value = round(revenue_total / order_count, 2) if order_count else 0

    status_breakdown: dict[str, int] = defaultdict(int)
    for o in orders:
        status_breakdown[o["status"]] += 1

    product_sales: dict[str, dict] = defaultdict(lambda: {"qty_sold": 0, "revenue": 0.0, "title": ""})
    for o in paid_orders:
        for item in o["order_items"]:
            key = item["product_id"]
            product_sales[key]["qty_sold"] += item["quantity"]
            product_sales[key]["revenue"] += item["price_snapshot"] * item["quantity"]
            product_sales[key]["title"] = item["title_snapshot"]
    top_products = sorted(product_sales.values(), key=lambda x: x["qty_sold"], reverse=True)[:5]

    cutoff = today - timedelta(days=13)
    sales_by_day: dict[str, float] = defaultdict(float)
    for o in paid_orders:
        d = _parse_dt(o["created_at"]).date()
        if d >= cutoff:
            sales_by_day[d.isoformat()] += o["total"]
    sales_series = [
        {"date": (cutoff + timedelta(days=i)).isoformat(), "revenue": round(sales_by_day.get((cutoff + timedelta(days=i)).isoformat(), 0), 2)}
        for i in range(14)
    ]

    products_res = sb.table("products").select("title, slug, stock_remaining, stock_total").eq("is_active", True).execute()
    low_stock = [
        p for p in products_res.data
        if p["stock_total"] > 0 and p["stock_remaining"] / p["stock_total"] < 0.15
    ]

    coupons_res = sb.table("coupons").select("code, times_used, usage_limit").execute()

    return {
        "revenue_total": round(revenue_total, 2),
        "revenue_today": round(revenue_today, 2),
        "order_count": order_count,
        "avg_order_value": avg_order_value,
        "status_breakdown": dict(status_breakdown),
        "top_products": top_products,
        "low_stock": low_stock,
        "sales_by_day": sales_series,
        "coupon_stats": coupons_res.data,
    }


@router.get("/products/export.csv")
def export_products_csv():
    sb = get_supabase()
    products = sb.table("products").select("*, categories(slug)").execute().data

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["title", "slug", "category_slug", "description", "mrp", "sale_price", "stock_total", "stock_remaining", "is_flash_deal", "dispatch_hours"])
    for p in products:
        writer.writerow([
            p["title"], p["slug"],
            p["categories"]["slug"] if p.get("categories") else "",
            p.get("description") or "",
            p["mrp"], p["sale_price"], p["stock_total"], p["stock_remaining"],
            p["is_flash_deal"], p["dispatch_hours"],
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=products.csv"},
    )


@router.get("/orders/export.csv")
def export_orders_csv():
    sb = get_supabase()
    orders = sb.table("orders").select("*, addresses(full_name, phone, city, state)").order("created_at", desc=True).execute().data

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["order_id", "status", "payment_status", "total", "customer_name", "phone", "city", "state", "created_at"])
    for o in orders:
        addr = o.get("addresses") or {}
        writer.writerow([
            o["id"], o["status"], o["payment_status"], o["total"],
            addr.get("full_name", ""), addr.get("phone", ""), addr.get("city", ""), addr.get("state", ""),
            o["created_at"],
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=orders.csv"},
    )


@router.post("/products/import")
async def import_products_csv(file: UploadFile = File(...)):
    """CSV columns expected: title, slug, category_slug, description, mrp,
    sale_price, stock_total, is_flash_deal, dispatch_hours, image_url
    (description, is_flash_deal, dispatch_hours, image_url are optional)
    """
    sb = get_supabase()
    content = (await file.read()).decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(content))

    categories = {c["slug"]: c["id"] for c in sb.table("categories").select("id, slug").execute().data}
    created = 0
    errors: list[str] = []

    for i, row in enumerate(reader, start=2):  # row 1 is the header
        try:
            slug = (row.get("slug") or "").strip()
            title = (row.get("title") or "").strip()
            if not slug or not title:
                errors.append(f"Row {i}: title and slug are required")
                continue

            existing = sb.table("products").select("id").eq("slug", slug).execute()
            if existing.data:
                errors.append(f"Row {i}: slug '{slug}' already exists, skipped")
                continue

            category_id = categories.get((row.get("category_slug") or "").strip())
            stock_total = int(row.get("stock_total") or 0)

            product = sb.table("products").insert({
                "title": title,
                "slug": slug,
                "description": (row.get("description") or "").strip() or None,
                "category_id": category_id,
                "mrp": float(row["mrp"]),
                "sale_price": float(row["sale_price"]),
                "stock_total": stock_total,
                "stock_remaining": stock_total,
                "is_flash_deal": (row.get("is_flash_deal") or "").strip().lower() in ("true", "1", "yes"),
                "dispatch_hours": int(row.get("dispatch_hours") or 48),
            }).execute()

            image_url = (row.get("image_url") or "").strip()
            if image_url:
                sb.table("product_images").insert({
                    "product_id": product.data[0]["id"],
                    "url": image_url,
                    "is_primary": True,
                    "sort_order": 0,
                }).execute()

            created += 1
        except Exception as e:
            errors.append(f"Row {i}: {str(e)}")

    return {"created": created, "errors": errors}
