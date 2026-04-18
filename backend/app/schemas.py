from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class MessageResponse(BaseModel):
    message: str


class AdminLoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=120)
    password: str = Field(min_length=8, max_length=255)


class AdminUserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    is_active: bool
    created_at: datetime


class RaceBase(BaseModel):
    slug: str
    name: str
    distance: str
    race_date: date
    location: str
    venue: str
    summary: str
    price_cents: int = Field(ge=0)
    currency: str = "MXN"
    is_published: bool = True


class RaceCreate(RaceBase):
    pass


class RaceRead(RaceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class PhotoBase(BaseModel):
    race_id: int
    bib_number: str = Field(min_length=1, max_length=16)
    runner_name: str
    shot_label: str
    preview_path: str | None = None
    full_path: str | None = None
    file_name: str | None = None
    is_active: bool = True


class PhotoCreate(PhotoBase):
    pass


class PhotoRead(PhotoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class PurchaseCreateDemo(BaseModel):
    race_slug: str
    bib_number: str = Field(min_length=1, max_length=16)
    buyer_name: str = Field(min_length=2, max_length=160)
    buyer_email: EmailStr


class PurchaseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    race_id: int
    bib_number: str
    buyer_name: str
    buyer_email: EmailStr
    amount_cents: int
    currency: str
    photos_count: int
    status: str
    provider: str
    provider_reference: str | None
    paid_at: datetime | None
    created_at: datetime
    updated_at: datetime


class PurchaseReportRow(BaseModel):
    id: int
    created_at: datetime
    buyer_name: str
    buyer_email: EmailStr
    race_name: str
    race_slug: str
    bib_number: str
    photos_count: int
    amount_cents: int
    currency: str
    status: str
    provider: str


class ReportSummary(BaseModel):
    purchases_count: int
    paid_revenue_cents: int
    currency: str
    customers_count: int
    latest_purchase_at: datetime | None
