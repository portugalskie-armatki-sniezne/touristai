from sqlalchemy import Column, Integer, String, Boolean
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    google_id = Column(String, unique=True, index=True)  # Google 'sub'
    full_name = Column(String)
    picture = Column(String)
    is_active = Column(Boolean, default=True)
