from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db, engine, Base
from app.api.v1.api import api_router
from app.models import User

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# Inicjalizacja aplikacji
app = FastAPI(title="TouristAI API")

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        # Simple query to check if db is up
        db.execute(text("SELECT 1"))
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        return {"status": "error", "message": str(e)}