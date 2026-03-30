from fastapi import APIRouter, Depends, HTTPException, Request
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

@router.patch("/me/settings")
async def update_my_settings(
    settings: UserSettingsUpdate,
    db: Session = Depends(get_db)
):
    """
    ULTRA-SIMPLIFIED: Updates preferences for the FIRST user found in DB.
    NO AUTH REQUIRED.
    """
    current_user = db.query(User).first()
    
    if not current_user:
        # Create test user if none exists
        current_user = User(
            username="hackathon_user",
            email="hackathon@example.com",
            first_name="Hack",
            last_name="User"
        )
        db.add(current_user)
        db.commit()
        db.refresh(current_user)

    # 1. Update preferences
    if not current_user.preferences:
        new_prefs = UserPreference(
            user_id=current_user.id,
            language=settings.language or "en",
            system_prompt=settings.system_prompt or ""
        )
        db.add(new_prefs)
    else:
        if settings.language is not None:
            current_user.preferences.language = settings.language
        if settings.system_prompt is not None:
            current_user.preferences.system_prompt = settings.system_prompt

    db.commit()
    return {"status": "success", "message": "Updated without auth"}

@router.get("/me")
async def get_my_profile(db: Session = Depends(get_db)):
    current_user = db.query(User).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="No user found")
    return {
        "id": current_user.id,
        "username": current_user.username,
        "settings": {
            "language": current_user.preferences.language if current_user.preferences else "en",
            "system_prompt": current_user.preferences.system_prompt if current_user.preferences else ""
        }
    }
