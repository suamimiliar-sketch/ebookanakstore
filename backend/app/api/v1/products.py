"""Public product endpoints — read only."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.base import get_db
from app.models import Product
from app.schemas import ProductOut

router = APIRouter()


@router.get("", response_model=list[ProductOut])
def list_products(
    db: Session = Depends(get_db),
    type: str | None = Query(None, description="ebook | minigame | ebook_exclusive"),
    age: str | None = Query(None),
    category: str | None = Query(None),
    q: str | None = Query(None),
):
    query = db.query(Product).filter(Product.is_active == True)  # noqa: E712
    if type:
        query = query.filter(Product.product_type == type)
    if age:
        query = query.filter(Product.age_group == age)
    if category:
        query = query.filter(Product.category == category)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(Product.title.ilike(like), Product.description.ilike(like)))
    return query.order_by(Product.id.asc()).all()


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()  # noqa: E712
    if not p:
        raise HTTPException(404, "Product not found")
    return p
