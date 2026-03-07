from pydantic import BaseModel, ConfigDict
from uuid import UUID

class CollectionItemBase(BaseModel):
    card_id: str
    normal_qty: int = 0
    foil_qty: int = 0
    alt_art_qty: int = 0
    signed_qty: int = 0
    overnumbered_qty: int = 0

class CollectionItemCreate(CollectionItemBase):
    pass

class CollectionItemUpdate(BaseModel):
    normal_qty: int | None = None
    foil_qty: int | None = None
    alt_art_qty: int | None = None
    signed_qty: int | None = None
    overnumbered_qty: int | None = None

class CollectionItemOut(CollectionItemBase):
    id: UUID
    user_id: UUID

    model_config = ConfigDict(from_attributes=True)
