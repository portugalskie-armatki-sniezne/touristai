from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from database import get_db
from app.models.user import User
import os
import uuid

# Ustawienia te muszą być takie same jak w auth.py
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-key-685262745842")
ALGORITHM = "HS256"

# Zmieniamy na HTTPBearer - to wyłączy pola username/password w Swaggerze
security_scheme = HTTPBearer()

async def get_current_user(
    db: Session = Depends(get_db),
    auth: HTTPAuthorizationCredentials = Depends(security_scheme)
) -> User:
    token = auth.credentials # Pobieramy sam token z nagłówka Bearer
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Nie można zweryfikować tokenu",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    if user is None:
        raise credentials_exception
    return user
