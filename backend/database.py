import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# If running locally (not in docker), change 'db' to 'localhost'
if os.getenv("ENV") != "production" and os.getenv("DOCKER_CONTAINER") != "true":
    DATABASE_URL = DATABASE_URL.replace("@db:", "@localhost:")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
