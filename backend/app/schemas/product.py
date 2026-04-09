from datetime import datetime
from typing import Literal, Optional, List
from pydantic import BaseModel, ConfigDict, Field

ProductType = Literal["ebook", "minigame", "ebook_exclusive"]


class ProductPageIn(BaseModel):
    page_number: int
    color: Optional[str] = None
    image_url: Optional[str] = None


class ProductPageOut(ProductPageIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ProductBase(BaseModel):
    product_type: ProductType = "ebook"
    title: str
    category: str
    age_group: str
    age_label: Optional[str] = None
    description: str = ""
    price: int = Field(ge=0)
    file_name: Optional[str] = None
    cover_color: Optional[str] = None
    drive_download_link: Optional[str] = None
    is_bonus: bool = False
    thumbnail_url: Optional[str] = None
    game_url: Optional[str] = None
    icon: Optional[str] = None
    access_duration_hours: int = 24
    has_audio: bool = False
    has_interactive: bool = False
    is_active: bool = True


class ProductCreate(ProductBase):
    pages: List[ProductPageIn] = []


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    age_group: Optional[str] = None
    age_label: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    file_name: Optional[str] = None
    cover_color: Optional[str] = None
    drive_download_link: Optional[str] = None
    is_bonus: Optional[bool] = None
    thumbnail_url: Optional[str] = None
    game_url: Optional[str] = None
    icon: Optional[str] = None
    access_duration_hours: Optional[int] = None
    has_audio: Optional[bool] = None
    has_interactive: Optional[bool] = None
    is_active: Optional[bool] = None
    pages: Optional[List[ProductPageIn]] = None


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime
    pages: List[ProductPageOut] = []
