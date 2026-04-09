"""Bundle / discount rules. Mirrors v1 logic: bundle kicks in at N items."""

BUNDLE_MIN_ITEMS = 5
BUNDLE_DISCOUNT_PCT = 20  # percent


def compute_totals(items: list[dict]) -> dict:
    """`items` is a list of {price, quantity} dicts."""
    subtotal = sum(i["price"] * i["quantity"] for i in items)
    item_count = sum(i["quantity"] for i in items)
    bundle_applied = item_count >= BUNDLE_MIN_ITEMS
    discount = subtotal * BUNDLE_DISCOUNT_PCT // 100 if bundle_applied else 0
    total = subtotal - discount
    return {
        "subtotal": subtotal,
        "discount": discount,
        "total": total,
        "bundle_applied": bundle_applied,
    }
