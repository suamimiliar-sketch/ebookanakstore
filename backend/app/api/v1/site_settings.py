from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.db.base import get_db
from app.models import SiteSetting
from app.schemas import SiteSettingOut, SiteSettingUpdate

router = APIRouter()


@router.get("", response_model=list[SiteSettingOut])
def list_settings(db: Session = Depends(get_db)):
    return db.query(SiteSetting).all()


@router.get("/{key}", response_model=SiteSettingOut)
def get_setting(key: str, db: Session = Depends(get_db)):
    s = db.query(SiteSetting).filter(SiteSetting.key == key).first()
    if not s:
        raise HTTPException(404, "Not found")
    return s


@router.put(
    "/{key}",
    response_model=SiteSettingOut,
    dependencies=[Depends(get_current_admin)],
)
def upsert_setting(key: str, payload: SiteSettingUpdate, db: Session = Depends(get_db)):
    s = db.query(SiteSetting).filter(SiteSetting.key == key).first()
    if s:
        s.value = payload.value
    else:
        s = SiteSetting(key=key, value=payload.value)
        db.add(s)
    db.commit()
    db.refresh(s)
    return s
