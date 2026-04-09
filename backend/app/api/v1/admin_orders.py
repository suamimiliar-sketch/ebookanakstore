from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.db.base import get_db
from app.models import Order
from app.schemas import OrderOut

router = APIRouter(dependencies=[Depends(get_current_admin)])


@router.get("", response_model=list[OrderOut])
def list_orders(
    db: Session = Depends(get_db),
    status: str | None = Query(None),
    limit: int = 100,
):
    q = db.query(Order)
    if status:
        q = q.filter(Order.payment_status == status)
    return q.order_by(Order.created_at.desc()).limit(limit).all()


@router.get("/{order_id}", response_model=OrderOut)
def get(order_id: str, db: Session = Depends(get_db)):
    o = db.query(Order).filter(Order.order_id == order_id).first()
    if not o:
        raise HTTPException(404, "Not found")
    return o
