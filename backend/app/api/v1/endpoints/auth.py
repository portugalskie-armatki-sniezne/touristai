from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
# from google.oauth2 import id_token
# from google.auth.transport import requests

router = APIRouter()

class GoogleToken(BaseModel):
    id_token: str

@router.post("/google-login")
async def google_login(token_data: GoogleToken, db: Session = Depends(get_db)):
    """
    Endpoint do logowania przez Google.
    Frontend przesyła 'id_token' otrzymany od Google SDK.
    """
    # 1. Weryfikacja tokenu u Google (wymaga GOOGLE_CLIENT_ID)
    # try:
    #     idinfo = id_token.verify_oauth2_token(token_data.id_token, requests.Request(), GOOGLE_CLIENT_ID)
    #     google_id = idinfo['sub']
    #     email = idinfo['email']
    # except ValueError:
    #     raise HTTPException(status_code=400, detail="Invalid Google token")

    # 2. Logika bazy danych:
    # Sprawdź czy użytkownik z tym google_id już istnieje
    # Jeśli nie, utwórz nowy rekord
    
    # 3. Wygeneruj własny JWT dla Twojej aplikacji
    return {"message": "Endpoint ready for logic", "received_token": token_data.id_token[:10] + "..."}
