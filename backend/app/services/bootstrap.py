from __future__ import annotations

from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.core.settings import get_settings
from app.models import AdminUser, Photo, Race


def ensure_bootstrap_admin(db: Session) -> None:
    settings = get_settings()
    username = settings.admin_bootstrap_username.strip().lower()
    existing = db.execute(select(AdminUser).where(AdminUser.username == username)).scalar_one_or_none()
    if existing:
        return

    user = AdminUser(
        username=username,
        password_hash=hash_password(settings.admin_bootstrap_password),
        is_active=True,
    )
    db.add(user)
    db.commit()


def seed_demo_catalog(db: Session) -> None:
    settings = get_settings()
    if not settings.seed_demo_data:
        return

    existing_race = db.execute(select(Race.id).limit(1)).scalar_one_or_none()
    if existing_race:
        return

    races = [
        Race(
            slug="cdmx-21k-2026",
            name="Medio Maraton de la Ciudad de Mexico 2025",
            distance="21K",
            race_date=date(2025, 7, 13),
            location="Ciudad de Mexico",
            venue="Paseo de la Reforma",
            summary="Edicion pasada de gran convocatoria sobre Paseo de la Reforma.",
            price_cents=22900,
            currency="MXN",
            is_published=True,
        ),
        Race(
            slug="trail-bosque-15k-2026",
            name="Tune Up Trail Ajusco 2025",
            distance="21K",
            race_date=date(2025, 3, 2),
            location="Ajusco, Ciudad de Mexico",
            venue="Valle de la Cantimplora",
            summary="Carrera trail pasada con bosque, desnivel y salida en Ajusco.",
            price_cents=24900,
            currency="MXN",
            is_published=True,
        ),
        Race(
            slug="puebla-nocturna-10k-2025",
            name="Medio Maraton Powerade Rosarito 2025",
            distance="21K",
            race_date=date(2025, 6, 22),
            location="Rosarito",
            venue="Boulevard Benito Juarez",
            summary="Evento pasado a pie de costa con trazado rapido y urbano.",
            price_cents=19900,
            currency="MXN",
            is_published=True,
        ),
    ]
    db.add_all(races)
    db.commit()

    race_by_slug = {race.slug: race for race in db.execute(select(Race)).scalars().all()}

    photo_rows = [
        ("cdmx-21k-2026", "1043", "Daniel Vega", "Amanecer sobre Reforma", "1043-1.jpg"),
        ("cdmx-21k-2026", "1389", "Majo Ruiz", "Bloque fuerte en avenida", "1389-1.jpg"),
        ("cdmx-21k-2026", "2582", "Luis Campos", "Ritmo de grupo", "2582-1.jpg"),
        ("cdmx-21k-2026", "6470", "Andrea Leon", "Paso largo en asfalto", "6470-1.jpg"),
        ("cdmx-21k-2026", "9260", "Erik Mora", "Remate en recta", "9260-1.jpg"),
        ("cdmx-21k-2026", "2673", "Paola Gil", "Cadencia estable rumbo a meta", "2673-1.jpg"),
        ("trail-bosque-15k-2026", "403", "Mar Fer", "Bajada tecnica entre pinos", "403-1.jpg"),
        ("trail-bosque-15k-2026", "270", "Sofi Lara", "Seccion rapida con barro", "270-1.jpg"),
        ("puebla-nocturna-10k-2025", "324", "Mario Solis", "Llegada con grupo puntero", "324-1.jpg"),
        ("puebla-nocturna-10k-2025", "324", "Mario Solis", "Ritmo estable en el tramo final", "elite-1.jpg"),
        ("puebla-nocturna-10k-2025", "5226", "Fernanda Rios", "Empuje final en carril abierto", "5226-1.jpg"),
    ]

    for race_slug, bib, runner_name, shot_label, file_name in photo_rows:
        race = race_by_slug[race_slug]
        db.add(
            Photo(
                race_id=race.id,
                bib_number=bib,
                runner_name=runner_name,
                shot_label=shot_label,
                preview_path=f"assets/races/{race_slug}/previews/{file_name}",
                full_path=f"assets/races/{race_slug}/full/{file_name}",
                file_name=file_name,
                is_active=True,
            )
        )

    db.commit()
