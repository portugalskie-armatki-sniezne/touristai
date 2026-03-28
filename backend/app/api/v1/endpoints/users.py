from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.user import User
from app.api.v1.endpoints.deps import get_current_user

router = APIRouter()

@router.get("/me")
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Zwraca dane obecnie zalogowanego użytkownika na podstawie tokenu JWT.
    """
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "profile_picture_url": current_user.profile_picture_url,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at
    }
