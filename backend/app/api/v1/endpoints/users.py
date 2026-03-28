from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel, Field
from database import get_db
from app.models import User, UserPreference
from app.api.v1.endpoints.deps import get_current_user

router = APIRouter()

class UserSettingsUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    language: Optional[str] = Field(None, pattern="^(pl|en)$")
    system_prompt: Optional[str] = None

@router.get("/me")
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Zwraca dane profilu wraz z preferencjami.
    """
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "profile_picture_url": current_user.profile_picture_url,
        "settings": {
            "language": current_user.preferences.language if current_user.preferences else "en",
            "system_prompt": current_user.preferences.system_prompt if current_user.preferences else ""
        }
    }

@router.patch("/me/settings")
async def update_my_settings(
    settings: UserSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Aktualizuje nick (username) oraz preferencje (język, system_prompt).
    """
    # 1. Aktualizacja username w tabeli users
    if settings.username is not None:
        # Sprawdź czy username nie jest zajęty
        existing_user = db.query(User).filter(User.username == settings.username).first()
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(status_code=400, detail="Ten nick jest już zajęty")
        current_user.username = settings.username

    # 2. Aktualizacja preferencji w tabeli user_preferences
    if not current_user.preferences:
        # Jeśli rekord w user_preferences jeszcze nie istnieje, stwórz go
        new_prefs = UserPreference(
            user_id=current_user.id,
            language=settings.language or "en",
            system_prompt=settings.system_prompt or ""
        )
        db.add(new_prefs)
    else:
        # Jeśli istnieje, zaktualizuj pola
        if settings.language is not None:
            current_user.preferences.language = settings.language
        if settings.system_prompt is not None:
            current_user.preferences.system_prompt = settings.system_prompt

    db.commit()
    db.refresh(current_user)
    
    return {"status": "success", "message": "Ustawienia zostały zaktualizowane"}
