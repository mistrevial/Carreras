from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.security import generate_session_token, hash_session_token, session_expires_at, verify_password
from app.core.settings import get_settings
from app.deps import get_current_admin, get_db
from app.models import AdminSession, AdminUser
from app.schemas import AdminLoginRequest, AdminUserRead, MessageResponse


router = APIRouter(prefix="/api/admin/auth", tags=["admin-auth"])
settings = get_settings()


def _set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.session_cookie_name,
        value=token,
        httponly=True,
        secure=settings.use_secure_cookies,
        samesite="lax",
        max_age=settings.session_ttl_hours * 60 * 60,
        path="/",
    )


@router.post("/login", response_model=AdminUserRead)
def login(payload: AdminLoginRequest, response: Response, db: Session = Depends(get_db)) -> AdminUser:
    username = payload.username.strip().lower()
    admin = db.execute(select(AdminUser).where(AdminUser.username == username)).scalar_one_or_none()

    if not admin or not admin.is_active or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials.")

    raw_token = generate_session_token()
    db.add(
        AdminSession(
            user_id=admin.id,
            token_hash=hash_session_token(raw_token),
            expires_at=session_expires_at(settings.session_ttl_hours),
        )
    )
    db.commit()

    _set_session_cookie(response, raw_token)
    return admin


@router.post("/logout", response_model=MessageResponse)
def logout(
    request: Request,
    response: Response,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    del current_admin
    token = request.cookies.get(settings.session_cookie_name)
    if token:
        db.execute(delete(AdminSession).where(AdminSession.token_hash == hash_session_token(token)))
        db.commit()

    response.delete_cookie(settings.session_cookie_name, path="/")
    return MessageResponse(message="Admin session closed.")


@router.get("/me", response_model=AdminUserRead)
def me(current_admin: AdminUser = Depends(get_current_admin)) -> AdminUser:
    return current_admin
