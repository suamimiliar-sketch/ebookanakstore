"""Unified product table — covers ebook and ebook_exclusive."""
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_type: Mapped[str] = mapped_column(String(32), index=True)  # ebook | ebook_exclusive
    title: Mapped[str] = mapped_column(String(255), index=True)
    category: Mapped[str] = mapped_column(String(120), index=True)
    age_group: Mapped[str] = mapped_column(String(32), index=True)
    age_label: Mapped[str | None] = mapped_column(String(64), nullable=True)
    description: Mapped[str] = mapped_column(Text, default="")
    price: Mapped[int] = mapped_column(Integer)  # IDR, integer

    # ebook fields
    file_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    cover_color: Mapped[str | None] = mapped_column(String(16), nullable=True)
    drive_download_link: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_bonus: Mapped[bool] = mapped_column(Boolean, default=False)

    # product image (used across product types as the cover thumbnail)
    thumbnail_url: Mapped[str | None] = mapped_column(String(512), nullable=True)

    # exclusive fields
    has_audio: Mapped[bool] = mapped_column(Boolean, default=False)
    has_interactive: Mapped[bool] = mapped_column(Boolean, default=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    pages: Mapped[list["ProductPage"]] = relationship(
        back_populates="product", cascade="all, delete-orphan", order_by="ProductPage.page_number"
    )


class ProductPage(Base):
    __tablename__ = "product_pages"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), index=True)
    page_number: Mapped[int] = mapped_column(Integer)
    color: Mapped[str | None] = mapped_column(String(16), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(512), nullable=True)

    product: Mapped[Product] = relationship(back_populates="pages")
