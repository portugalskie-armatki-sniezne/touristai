from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter()

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, example="John Doe")
    bio: Optional[str] = Field(None, example="I love traveling to historic sites.")
    preferred_language: Optional[str] = Field("en", example="pl")

@router.get("/me")
async def get_my_profile():
    return {"id": "user_123", "full_name": "John Doe", "status": "active"}

@router.patch("/me")
async def update_my_profile(profile: UserProfileUpdate):
    return {"message": "Profile updated", "updated_fields": profile.dict(exclude_unset=True)}
