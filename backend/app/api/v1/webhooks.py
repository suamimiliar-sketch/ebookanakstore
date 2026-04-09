"""Midtrans payment-status webhook handler."""
from datetime import datetime
import hashlib

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.base import get_db
from app.models import Order

router = APIRouter()
settings = get_settings()


def _verify_signature(order_id: str, status_code: str, gross_amount: str, signature: str) -> bool:
    if not settings.MIDTRANS_SERVER_KEY:
        return True  # dev mode
    raw = f"{order_id}{status_code}{gross_amount}{settings.MIDTRANS_SERVER_KEY}".encode()
    return hashlib.sha512(raw).hexdigest() == signature


@router.post("/midtrans")
async def midtrans_webhook(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    order_id = body.get("order_id")
    tx_status = body.get("transaction_status")
    fraud = body.get("fraud_status")
    sig = body.get("signature_key", "")
    if not _verify_signature(order_id, body.get("status_code", ""), body.get("gross_amount", ""), sig):
        raise HTTPException(403, "Bad signature")

    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(404, "Unknown order")

    if tx_status in ("capture", "settlement") and fraud in (None, "accept"):
        order.payment_status = "success"
        order.paid_at = datetime.utcnow()
    elif tx_status in ("cancel", "deny", "expire"):
        order.payment_status = "failed"
    else:
        order.payment_status = "pending"

    order.midtrans_transaction_id = body.get("transaction_id")
    db.commit()
    return {"ok": True}
