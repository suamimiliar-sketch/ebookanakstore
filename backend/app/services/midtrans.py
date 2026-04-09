"""Thin Midtrans Snap client. Falls back to a mock token when keys are unset
so local dev and tests work without touching the real gateway."""
import base64
import httpx
from app.core.config import get_settings

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


async def create_snap_token(order_id: str, gross_amount: int, customer: dict, items: list[dict]) -> dict:
    if not settings.MIDTRANS_SERVER_KEY:
        # Dev fallback: deterministic fake token.
        return {
            "token": f"mock-snap-{order_id}",
            "redirect_url": f"https://sandbox.midtrans.com/snap/v3/redirection/mock-{order_id}",
        }

    payload = {
        "transaction_details": {"order_id": order_id, "gross_amount": gross_amount},
        "customer_details": customer,
        "item_details": items,
    }
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.post(
            f"{_base_url()}/transactions",
            headers={"Authorization": _auth_header(), "Content-Type": "application/json"},
            json=payload,
        )
        r.raise_for_status()
        return r.json()
