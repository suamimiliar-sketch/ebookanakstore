"""FastAPI entrypoint."""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.core.config import get_settings
from app.db.base import Base, engine
from app.core.security import hash_password
from app.db.base import SessionLocal
from app.models import AdminUser

settings = get_settings()
logging.basicConfig(level=settings.LOG_LEVEL, format="%(asctime)s %(levelname)s %(name)s - %(message)s")
log = logging.getLogger("ebookanak-api")


def _bootstrap_admin() -> None:
    """Create the first admin if the table is empty."""
    db = SessionLocal()
    try:
        if db.query(AdminUser).count() == 0 and settings.ADMIN_BOOTSTRAP_EMAIL:
            db.add(AdminUser(
                email=settings.ADMIN_BOOTSTRAP_EMAIL,
                password_hash=hash_password(settings.ADMIN_BOOTSTRAP_PASSWORD),
                name="Root Admin",
            ))
            db.commit()
            log.info("Bootstrapped admin user %s", settings.ADMIN_BOOTSTRAP_EMAIL)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _bootstrap_admin()
    yield


app = FastAPI(
    title="ebookanakstore API",
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/api/health")
def health():
    return {"ok": True, "env": settings.APP_ENV, "version": settings.APP_VERSION}
