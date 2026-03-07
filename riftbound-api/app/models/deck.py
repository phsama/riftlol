from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class Deck(Base):
    __tablename__ = "decks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False) # Represents Supabase auth.users.id
    name = Column(String(255), nullable=False)
    main_champion_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    cards = relationship("DeckCard", back_populates="deck", cascade="all, delete-orphan")


class DeckCard(Base):
    __tablename__ = "deck_cards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deck_id = Column(UUID(as_uuid=True), ForeignKey("decks.id", ondelete="CASCADE"), nullable=False)
    card_id = Column(String, nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    is_sideboard = Column(Boolean, default=False, nullable=False)

    deck = relationship("Deck", back_populates="cards")
