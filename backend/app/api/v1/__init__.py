from fastapi import APIRouter
from app.api.v1 import products, orders, admin_auth, admin_products, admin_orders, site_settings, webhooks

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(site_settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(admin_auth.router, prefix="/admin/auth", tags=["admin"])
api_router.include_router(admin_products.router, prefix="/admin/products", tags=["admin"])
api_router.include_router(admin_orders.router, prefix="/admin/orders", tags=["admin"])
