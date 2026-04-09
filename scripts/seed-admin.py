"""Create (or reset) the bootstrap admin user.

Usage:
    python scripts/seed-admin.py admin@example.com 's3cret!'
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.db.base import Base, SessionLocal, engine  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.models import AdminUser  # noqa: E402


def main() -> None:
    if len(sys.argv) < 3:
        print("usage: seed-admin.py <email> <password>")
        sys.exit(1)
    email, password = sys.argv[1], sys.argv[2]
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user = db.query(AdminUser).filter(AdminUser.email == email).first()
        if user:
            user.password_hash = hash_password(password)
            user.is_active = True
            print(f"Reset password for {email}")
        else:
            db.add(AdminUser(email=email, password_hash=hash_password(password), name="Admin"))
            print(f"Created admin {email}")
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    main()
