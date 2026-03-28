from sqlalchemy import Column, String, DateTime, func, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base

class Visit(Base):
    __tablename__ = "visits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Standard SQLALchemy doesn't have GEOMETRY, so we might need to handle this manually 
    # for insertions but we can declare it as Text/NullType for simple ORM mapping
    location = Column(Text, nullable=False) 
    
    identified_object_name = Column(String(255), nullable=False)
    raw_facts = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="visits")
