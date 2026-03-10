from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
import uuid

from app.models.collection import CollectionItem
from app.schemas.collection import CollectionItemUpdate

class CollectionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_collection(self, user_id: str) -> List[CollectionItem]:
        uid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        result = self.db.execute(
            select(CollectionItem).where(CollectionItem.user_id == uid)
        )
        return list(result.scalars().all())

    def get_or_create_item(self, user_id: str, card_id: str) -> CollectionItem:
        uid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        result = self.db.execute(
            select(CollectionItem).where(
                CollectionItem.user_id == uid, 
                CollectionItem.card_id == card_id
            )
        )
        item = result.scalars().first()
        
        if not item:
            item = CollectionItem(user_id=uid, card_id=card_id)
            self.db.add(item)
            self.db.commit()
            self.db.refresh(item)
            
        return item

    def update_item(self, user_id: str, card_id: str, item_in: CollectionItemUpdate) -> CollectionItem:
        item = self.get_or_create_item(user_id, card_id)
        
        update_data = item_in.model_dump(exclude_unset=True)
        if update_data:
            for key, value in update_data.items():
                setattr(item, key, value)
            
            # Verify if the item should be deleted because all quantities are zero
            total_qty = (
                (item.normal_qty or 0) +
                (item.foil_qty or 0) +
                (item.alt_art_qty or 0) +
                (item.alt_art_foil_qty or 0) +
                (item.signed_qty or 0) +
                (item.overnumbered_qty or 0) +
                (item.overnumbered_foil_qty or 0)
            )
            
            if total_qty == 0:
                self.db.delete(item)
                self.db.commit()
                # Return the zeroed out item for the API response, but it no longer exists in DB
                return item

            self.db.commit()
            self.db.refresh(item)
            
        return item
