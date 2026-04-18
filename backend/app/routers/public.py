from __future__ import annotations

import secrets

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models import Photo, Purchase, PurchaseStatus, Race
from app.schemas import MessageResponse, PhotoRead, PurchaseCreateDemo, PurchaseRead, RaceRead
from app.core.security import utcnow


router = APIRouter(prefix="/api", tags=["public"])


@router.get("/health", response_model=MessageResponse)
def health() -> MessageResponse:
    return MessageResponse(message="Finish Line API is running.")


@router.get("/public/races", response_model=list[RaceRead])
def public_races(db: Session = Depends(get_db)) -> list[Race]:
    return db.execute(
        select(Race).where(Race.is_published.is_(True)).order_by(Race.race_date.desc())
    ).scalars().all()


@router.get("/public/races/{race_slug}", response_model=RaceRead)
def public_race_detail(race_slug: str, db: Session = Depends(get_db)) -> Race:
    race = db.execute(
        select(Race).where(Race.slug == race_slug, Race.is_published.is_(True))
    ).scalar_one_or_none()
    if not race:
        raise HTTPException(status_code=404, detail="Race not found.")
    return race


@router.get("/public/races/{race_slug}/photos", response_model=list[PhotoRead])
def public_race_photos(
    race_slug: str,
    bib: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[Photo]:
    race = db.execute(
        select(Race).where(Race.slug == race_slug, Race.is_published.is_(True))
    ).scalar_one_or_none()
    if not race:
        raise HTTPException(status_code=404, detail="Race not found.")

    statement = select(Photo).where(Photo.race_id == race.id, Photo.is_active.is_(True))
    if bib:
        statement = statement.where(Photo.bib_number == bib)
    return db.execute(statement.order_by(Photo.created_at.desc())).scalars().all()


@router.post("/public/purchases/demo", response_model=PurchaseRead, status_code=status.HTTP_201_CREATED)
def create_demo_purchase(payload: PurchaseCreateDemo, db: Session = Depends(get_db)) -> Purchase:
    race = db.execute(select(Race).where(Race.slug == payload.race_slug)).scalar_one_or_none()
    if not race:
        raise HTTPException(status_code=404, detail="Race not found.")

    photo_count = db.execute(
        select(Photo).where(
            Photo.race_id == race.id,
            Photo.bib_number == payload.bib_number,
            Photo.is_active.is_(True),
        )
    ).scalars().all()

    purchase = Purchase(
        race_id=race.id,
        bib_number=payload.bib_number,
        buyer_name=payload.buyer_name,
        buyer_email=str(payload.buyer_email).lower(),
        amount_cents=race.price_cents,
        currency=race.currency,
        photos_count=len(photo_count),
        status=PurchaseStatus.paid.value,
        provider="demo",
        provider_reference="demo-" + secrets.token_hex(8),
        paid_at=utcnow(),
    )
    db.add(purchase)
    db.commit()
    db.refresh(purchase)
    return purchase
