"""Public order endpoints: create checkout + verify payment."""
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.models import Order, OrderItem, Product
from app.schemas import OrderCreate, OrderOut, OrderSnapResponse
from app.services.midtrans import create_snap_token
from app.services.pricing import compute_totals

router = APIRouter()


def _make_order_id() -> str:
    return "EBK-" + uuid.uuid4().hex[:10].upper()


@router.post("", response_model=OrderSnapResponse)
async def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    # 1. Resolve products & build item rows
    rows = []
    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product or not product.is_active:
            raise HTTPException(400, f"Invalid product {item.product_id}")
        rows.append({
            "product": product,
            "quantity": item.quantity,
            "price": product.price,
        })

    totals = compute_totals([{"price": r["price"], "quantity": r["quantity"]} for r in rows])

    order_id = _make_order_id()
    order = Order(
        order_id=order_id,
        customer_email=payload.customer_email,
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        subtotal=totals["subtotal"],
        discount=totals["discount"],
        total=totals["total"],
        bundle_applied=totals["bundle_applied"],
        payment_status="pending",
        midtrans_order_id=order_id,
    )
    for r in rows:
        p: Product = r["product"]
        order.items.append(OrderItem(
            product_id=p.id,
            product_type=p.product_type,
            title=p.title,
            quantity=r["quantity"],
            price=r["price"],
            drive_download_link=p.drive_download_link,
        ))
    db.add(order)
    db.commit()
    db.refresh(order)

    # 2. Ask Midtrans for a snap token
    snap = await create_snap_token(
        order_id=order_id,
        gross_amount=totals["total"],
        customer={
            "first_name": payload.customer_name,
            "email": payload.customer_email,
            "phone": payload.customer_phone or "",
        },
        items=[{
            "id": str(r["product"].id),
            "price": r["price"],
            "quantity": r["quantity"],
            "name": r["product"].title[:50],
        } for r in rows],
    )
    order.snap_token = snap["token"]
    db.commit()

    return OrderSnapResponse(
        order_id=order_id,
        snap_token=snap["token"],
        total=totals["total"],
        redirect_url=snap.get("redirect_url", ""),
    )


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: str, db: Session = Depends(get_db)):
    o = db.query(Order).filter(Order.order_id == order_id).first()
    if not o:
        raise HTTPException(404, "Order not found")
    return o
