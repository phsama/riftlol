from sqlalchemy import Column, String, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
import uuid

# Reusing Base from deck to ensure they share the same metadata registry
from app.models.deck import Base

class CollectionItem(Base):
    __tablename__ = "collections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False) # Represents Supabase auth.users.id
    card_id = Column(String, nullable=False)
    
    # Quantities for different finishes/variations
    normal_qty = Column(Integer, default=0, nullable=False)
    foil_qty = Column(Integer, default=0, nullable=False)
    alt_art_qty = Column(Integer, default=0, nullable=False)
    alt_art_foil_qty = Column(Integer, default=0, nullable=False)
    signed_qty = Column(Integer, default=0, nullable=False)
    signed_foil_qty = Column(Integer, default=0, nullable=False)
    overnumbered_qty = Column(Integer, default=0, nullable=False)
    overnumbered_foil_qty = Column(Integer, default=0, nullable=False)

    # A user can only have one collection item record per card_id
    __table_args__ = (
        UniqueConstraint('user_id', 'card_id', name='uq_user_card_collection'),
    )
