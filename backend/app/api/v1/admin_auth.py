from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.security import create_access_token, verify_password
from app.db.base import get_db
from app.models import AdminUser
from app.schemas import AdminLogin, AdminOut, TokenOut

router = APIRouter()


@router.post("/login", response_model=TokenOut)
def login(payload: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(AdminUser.email == payload.email).first()
    if not admin or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    if not admin.is_active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account disabled")
    token = create_access_token(admin.email, {"admin_id": admin.id})
    return TokenOut(access_token=token, admin=AdminOut.model_validate(admin))


@router.get("/me", response_model=AdminOut)
def me(admin: AdminUser = Depends(get_current_admin)):
    return admin
