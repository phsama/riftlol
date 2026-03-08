from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import JSONB
import datetime
from app.models.deck import Base

class CardCache(Base):
    __tablename__ = "cards"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    set_id = Column(String, index=True)
    
    # Armazena todo o payload retornado pela RiftCodex (tags, media, stats)
    data = Column(JSONB, nullable=False)
    
    # Metadados de sincronização do cache
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
