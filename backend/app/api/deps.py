"""FastAPI dependencies: DB session + admin auth guard."""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db.base import get_db
from app.models import AdminUser

oauth2 = OAuth2PasswordBearer(tokenUrl="/api/v1/admin/auth/login", auto_error=False)


def get_current_admin(
    token: str | None = Depends(oauth2),
    db: Session = Depends(get_db),
) -> AdminUser:
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")
    admin = db.query(AdminUser).filter(AdminUser.email == payload.get("sub")).first()
    if not admin or not admin.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Admin not found or disabled")
    return admin
