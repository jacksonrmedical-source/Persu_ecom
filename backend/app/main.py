from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import products, categories, collections, cart, coupons, orders, admin

app = FastAPI(title="PERZN API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories.router, prefix="/api/categories", tags=["categories"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(collections.router, prefix="/api/collections", tags=["collections"])
app.include_router(cart.router, prefix="/api/cart", tags=["cart"])
app.include_router(coupons.router, prefix="/api/coupons", tags=["coupons"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "perzn-api"}
