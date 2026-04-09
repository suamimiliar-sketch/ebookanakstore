from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class OrderItemCreate(BaseModel):
    product_id: int
    product_type: Literal["ebook", "ebook_exclusive"]
    quantity: int = 1


class OrderCreate(BaseModel):
    customer_email: EmailStr
    customer_name: str
    customer_phone: Optional[str] = ""
    items: List[OrderItemCreate] = Field(min_length=1)


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    product_type: str
    title: str
    quantity: int
    price: int
    drive_download_link: Optional[str] = None


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    order_id: str
    customer_email: str
    customer_name: str
    customer_phone: Optional[str] = None
    subtotal: int
    discount: int
    total: int
    bundle_applied: bool
    payment_status: str
    snap_token: Optional[str] = None
    created_at: datetime
    paid_at: Optional[datetime] = None
    items: List[OrderItemOut] = []


class OrderSnapResponse(BaseModel):
    order_id: str
    snap_token: str
    total: int
    redirect_url: str
