"""Admin CRUD for products. All routes require a valid JWT."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.db.base import get_db
from app.models import Product, ProductPage, AdminUser
from app.schemas import ProductCreate, ProductOut, ProductUpdate

router = APIRouter(dependencies=[Depends(get_current_admin)])


@router.get("", response_model=list[ProductOut])
def list_all(db: Session = Depends(get_db), include_inactive: bool = True):
    q = db.query(Product)
    if not include_inactive:
        q = q.filter(Product.is_active == True)  # noqa: E712
    return q.order_by(Product.id.desc()).all()


@router.post("", response_model=ProductOut, status_code=201)
def create(payload: ProductCreate, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude={"pages"})
    product = Product(**data)
    for pg in payload.pages:
        product.pages.append(ProductPage(**pg.model_dump()))
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/{product_id}", response_model=ProductOut)
def get_one(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(404, "Not found")
    return p


@router.patch("/{product_id}", response_model=ProductOut)
def update(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(404, "Not found")
    data = payload.model_dump(exclude_unset=True)
    pages = data.pop("pages", None)
    for k, v in data.items():
        setattr(p, k, v)
    if pages is not None:
        p.pages.clear()
        for pg in pages:
            p.pages.append(ProductPage(**pg))
    db.commit()
    db.refresh(p)
    return p


@router.delete("/{product_id}", status_code=204)
def delete(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(404, "Not found")
    db.delete(p)
    db.commit()
