from __future__ import annotations

from fastapi import Cookie, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_session_token, utcnow
from app.core.settings import get_settings
from app.db import SessionLocal
from app.models import AdminSession, AdminUser


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_admin(
    request: Request,
    db: Session = Depends(get_db),
    session_cookie: str | None = Cookie(default=None, alias=get_settings().session_cookie_name),
) -> AdminUser:
    token = session_cookie or request.cookies.get(get_settings().session_cookie_name)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin session required.")

    session_hash = hash_session_token(token)
    admin_session = db.execute(
        select(AdminSession).where(
            AdminSession.token_hash == session_hash,
            AdminSession.expires_at > utcnow(),
        )
    ).scalar_one_or_none()

    if not admin_session or not admin_session.user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin session.")

    admin_session.last_seen_at = utcnow()
    db.add(admin_session)
    db.commit()
    return admin_session.user
