from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class DeckCardBase(BaseModel):
    card_id: str
    quantity: int
    is_sideboard: bool = False

class DeckCardCreate(DeckCardBase):
    pass

class DeckCardOut(DeckCardBase):
    id: UUID
    class Config:
        from_attributes = True

class DeckBase(BaseModel):
    name: str
    main_champion_id: Optional[str] = None

class DeckCreate(DeckBase):
    cards: List[DeckCardCreate] = []

class DeckUpdate(BaseModel):
    name: Optional[str] = None
    main_champion_id: Optional[str] = None
    cards: Optional[List[DeckCardCreate]] = None

class DeckOut(DeckBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    cards: List[DeckCardOut]

    class Config:
        from_attributes = True
