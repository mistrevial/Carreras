from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.core.security import utcnow


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )


class PurchaseStatus(StrEnum):
    pending = "pending"
    paid = "paid"
    refunded = "refunded"


class AdminUser(TimestampMixin, Base):
    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    sessions: Mapped[list["AdminSession"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class AdminSession(Base):
    __tablename__ = "admin_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("admin_users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    user: Mapped[AdminUser] = relationship(back_populates="sessions")


class Race(TimestampMixin, Base):
    __tablename__ = "races"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    distance: Mapped[str] = mapped_column(String(80))
    race_date: Mapped[date] = mapped_column(Date, index=True)
    location: Mapped[str] = mapped_column(String(160))
    venue: Mapped[str] = mapped_column(String(200))
    summary: Mapped[str] = mapped_column(Text)
    price_cents: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    currency: Mapped[str] = mapped_column(String(8), default="MXN", nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    photos: Mapped[list["Photo"]] = relationship(back_populates="race", cascade="all, delete-orphan")
    purchases: Mapped[list["Purchase"]] = relationship(back_populates="race")


class Photo(TimestampMixin, Base):
    __tablename__ = "photos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    race_id: Mapped[int] = mapped_column(ForeignKey("races.id", ondelete="CASCADE"), index=True)
    bib_number: Mapped[str] = mapped_column(String(16), index=True)
    runner_name: Mapped[str] = mapped_column(String(160))
    shot_label: Mapped[str] = mapped_column(String(220))
    preview_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    full_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    file_name: Mapped[str | None] = mapped_column(String(220), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    race: Mapped[Race] = relationship(back_populates="photos")


class Purchase(TimestampMixin, Base):
    __tablename__ = "purchases"
    __table_args__ = (
        UniqueConstraint("provider", "provider_reference", name="uq_purchase_provider_reference"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    race_id: Mapped[int] = mapped_column(ForeignKey("races.id", ondelete="RESTRICT"), index=True)
    bib_number: Mapped[str] = mapped_column(String(16), index=True)
    buyer_name: Mapped[str] = mapped_column(String(160))
    buyer_email: Mapped[str] = mapped_column(String(255), index=True)
    amount_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="MXN", nullable=False)
    photos_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default=PurchaseStatus.pending.value, nullable=False)
    provider: Mapped[str] = mapped_column(String(40), default="demo", nullable=False)
    provider_reference: Mapped[str | None] = mapped_column(String(160), nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    race: Mapped[Race] = relationship(back_populates="purchases")
