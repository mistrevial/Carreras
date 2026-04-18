from __future__ import annotations

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends, HTTPException, Query

from app.deps import get_current_admin, get_db
from app.models import AdminUser, Photo, Purchase, PurchaseStatus, Race
from app.schemas import PhotoCreate, PhotoRead, PurchaseReportRow, RaceCreate, RaceRead, ReportSummary


router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/reports/summary", response_model=ReportSummary)
def reports_summary(
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> ReportSummary:
    del current_admin

    purchases_count = db.execute(select(func.count(Purchase.id))).scalar_one()
    paid_revenue_cents = db.execute(
        select(func.coalesce(func.sum(Purchase.amount_cents), 0)).where(Purchase.status == PurchaseStatus.paid.value)
    ).scalar_one()
    customers_count = db.execute(select(func.count(func.distinct(Purchase.buyer_email)))).scalar_one()
    latest_purchase_at = db.execute(select(func.max(Purchase.created_at))).scalar_one()

    return ReportSummary(
        purchases_count=purchases_count,
        paid_revenue_cents=paid_revenue_cents,
        currency="MXN",
        customers_count=customers_count,
        latest_purchase_at=latest_purchase_at,
    )


@router.get("/reports/purchases", response_model=list[PurchaseReportRow])
def list_purchases(
    q: str | None = Query(default=None),
    limit: int = Query(default=200, ge=1, le=1000),
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[PurchaseReportRow]:
    del current_admin

    statement = select(Purchase, Race.name, Race.slug).join(Race, Purchase.race_id == Race.id)
    if q:
        like_term = f"%{q.strip()}%"
        statement = statement.where(
            or_(
                Purchase.buyer_name.ilike(like_term),
                Purchase.buyer_email.ilike(like_term),
                Purchase.bib_number.ilike(like_term),
                Race.name.ilike(like_term),
                Race.slug.ilike(like_term),
            )
        )

    rows = db.execute(statement.order_by(Purchase.created_at.desc()).limit(limit)).all()
    return [
        PurchaseReportRow(
            id=purchase.id,
            created_at=purchase.created_at,
            buyer_name=purchase.buyer_name,
            buyer_email=purchase.buyer_email,
            race_name=race_name,
            race_slug=race_slug,
            bib_number=purchase.bib_number,
            photos_count=purchase.photos_count,
            amount_cents=purchase.amount_cents,
            currency=purchase.currency,
            status=purchase.status,
            provider=purchase.provider,
        )
        for purchase, race_name, race_slug in rows
    ]


@router.get("/races", response_model=list[RaceRead])
def list_races(current_admin: AdminUser = Depends(get_current_admin), db: Session = Depends(get_db)) -> list[Race]:
    del current_admin
    return db.execute(select(Race).order_by(Race.race_date.desc())).scalars().all()


@router.post("/races", response_model=RaceRead, status_code=201)
def create_race(
    payload: RaceCreate,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Race:
    del current_admin
    existing = db.execute(select(Race).where(Race.slug == payload.slug)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Race slug already exists.")

    race = Race(**payload.model_dump())
    db.add(race)
    db.commit()
    db.refresh(race)
    return race


@router.get("/photos", response_model=list[PhotoRead])
def list_photos(
    race_id: int | None = None,
    bib: str | None = None,
    limit: int = Query(default=300, ge=1, le=1000),
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[Photo]:
    del current_admin

    statement = select(Photo).order_by(Photo.created_at.desc())
    if race_id:
        statement = statement.where(Photo.race_id == race_id)
    if bib:
        statement = statement.where(Photo.bib_number == bib)

    return db.execute(statement.limit(limit)).scalars().all()


@router.post("/photos", response_model=PhotoRead, status_code=201)
def create_photo(
    payload: PhotoCreate,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Photo:
    del current_admin

    race = db.execute(select(Race).where(Race.id == payload.race_id)).scalar_one_or_none()
    if not race:
        raise HTTPException(status_code=404, detail="Race not found.")

    photo = Photo(**payload.model_dump())
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo
