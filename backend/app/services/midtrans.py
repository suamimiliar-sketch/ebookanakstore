"""Thin Midtrans Snap client. Falls back to a mock token when keys are unset
so local dev and tests work without touching the real gateway."""
import base64
import logging

import httpx
from fastapi import HTTPException

from app.core.config import get_settings

log = logging.getLogger(__name__)
settings = get_settings()


def _base_url() -> str:
    return (
        "https://app.midtrans.com/snap/v1"
        if settings.MIDTRANS_IS_PRODUCTION
        else "https://app.sandbox.midtrans.com/snap/v1"
    )


def _auth_header() -> str:
    raw = f"{settings.MIDTRANS_SERVER_KEY}:".encode()
    return "Basic " + base64.b64encode(raw).decode()


async def create_snap_token(
    order_id: str,
    gross_amount: int,
    customer: dict,
    items: list[dict],
    discount: int = 0,
) -> dict:
    if not settings.MIDTRANS_SERVER_KEY:
        return {
            "token": f"mock-snap-{order_id}",
            "redirect_url": f"https://sandbox.midtrans.com/snap/v3/redirection/mock-{order_id}",
        }

    # Midtrans requires sum(item price*qty) == gross_amount.
    # When a discount exists, add a negative line item so the totals match.
    all_items = list(items)
    if discount > 0:
        all_items.append({
            "id": "DISCOUNT",
            "price": -discount,
            "quantity": 1,
            "name": "Diskon Bundle 20%",
        })

    payload = {
        "transaction_details": {"order_id": order_id, "gross_amount": gross_amount},
        "customer_details": customer,
        "item_details": all_items,
    }
    async with httpx.AsyncClient(timeout=20) as client:
        try:
            r = await client.post(
                f"{_base_url()}/transactions",
                headers={"Authorization": _auth_header(), "Content-Type": "application/json"},
                json=payload,
            )
            r.raise_for_status()
            return r.json()
        except httpx.HTTPStatusError as e:
            body = e.response.text
            log.error("Midtrans error %s: %s", e.response.status_code, body)
            raise HTTPException(502, f"Payment gateway error: {body}") from e
        except httpx.RequestError as e:
            log.error("Midtrans connection error: %s", e)
            raise HTTPException(502, "Payment gateway unreachable") from e
