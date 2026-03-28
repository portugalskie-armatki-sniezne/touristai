from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
import os
import httpx
from datetime import datetime, timedelta
from jose import jwt
from database import get_db
from app.models.user import User
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

router = APIRouter()

# Konfiguracja JWT - w produkcji przenieś SECRET_KEY do .env!
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-key-685262745842")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 godziny

# Pobierz dane Google z .env
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

class GoogleToken(BaseModel):
    token: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_or_create_google_user(db: Session, idinfo: dict) -> User:
    google_id = idinfo['sub']
    email = idinfo['email']
    full_name = idinfo.get('name')
    first_name = idinfo.get('given_name', '')
    last_name = idinfo.get('family_name', '')
    picture = idinfo.get('picture')

    user = db.query(User).filter((User.google_id == google_id) | (User.email == email)).first()

    if not user:
        base_username = email.split('@')[0]
        username = base_username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}{counter}"
            counter += 1

        user = User(
            username=username,
            email=email,
            first_name=first_name or (full_name.split(' ')[0] if full_name else 'User'),
            last_name=last_name or (full_name.split(' ')[1] if full_name and len(full_name.split(' ')) > 1 else 'Google'),
            google_id=google_id,
            full_name=full_name,
            profile_picture_url=picture,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        updated = False
        if not user.google_id:
            user.google_id = google_id
            updated = True
        if full_name and user.full_name != full_name:
            user.full_name = full_name
            updated = True
        if picture and user.profile_picture_url != picture:
            user.profile_picture_url = picture
            updated = True
        if updated:
            db.commit()
            db.refresh(user)
    return user

@router.get("/google/authorize")
async def google_authorize_redirect():
    if not GOOGLE_CLIENT_ID or not GOOGLE_REDIRECT_URI:
        raise HTTPException(status_code=500, detail="Konfiguracja Google SSO niekompletna")
    
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}&"
        f"redirect_uri={GOOGLE_REDIRECT_URI}&"
        f"response_type=code&"
        f"scope=openid%20email%20profile&"
        f"access_type=offline&"
        f"prompt=select_account"
    )
    return RedirectResponse(url=google_auth_url)

@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data)
        token_data = response.json()

    if "id_token" not in token_data:
        raise HTTPException(status_code=400, detail="Błąd pobierania tokenu Google")

    idinfo = id_token.verify_oauth2_token(token_data["id_token"], google_requests.Request(), GOOGLE_CLIENT_ID)
    user = get_or_create_google_user(db, idinfo)

    # Tworzymy nasz token JWT (sub to standardowe pole na ID użytkownika)
    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "status": "success",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "profile_picture_url": user.profile_picture_url
        },
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/google/authenticate")
async def google_authenticate_token(token_data: GoogleToken, db: Session = Depends(get_db)):
    try:
        idinfo = id_token.verify_oauth2_token(token_data.token, google_requests.Request(), GOOGLE_CLIENT_ID)
    except ValueError:
        raise HTTPException(status_code=401, detail="Nieprawidłowy token Google")

    user = get_or_create_google_user(db, idinfo)
    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "status": "success",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_picture_url": user.profile_picture_url
        },
        "access_token": access_token,
        "token_type": "bearer"
    }
