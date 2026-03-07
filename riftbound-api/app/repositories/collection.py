from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import uuid

from app.models.collection import CollectionItem
from app.schemas.collection import CollectionItemUpdate

class CollectionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_collection(self, user_id: str) -> List[CollectionItem]:
        uid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        result = await self.db.execute(
            select(CollectionItem).where(CollectionItem.user_id == uid)
        )
        return list(result.scalars().all())

    async def get_or_create_item(self, user_id: str, card_id: str) -> CollectionItem:
        uid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        result = await self.db.execute(
            select(CollectionItem).where(
                CollectionItem.user_id == uid, 
                CollectionItem.card_id == card_id
            )
        )
        item = result.scalars().first()
        
        if not item:
            item = CollectionItem(user_id=uid, card_id=card_id)
            self.db.add(item)
            await self.db.commit()
            await self.db.refresh(item)
            
        return item

    async def update_item(self, user_id: str, card_id: str, item_in: CollectionItemUpdate) -> CollectionItem:
        item = await self.get_or_create_item(user_id, card_id)
        
        update_data = item_in.model_dump(exclude_unset=True)
        if update_data:
            for key, value in update_data.items():
                setattr(item, key, value)
            
            await self.db.commit()
            await self.db.refresh(item)
            
        return item
