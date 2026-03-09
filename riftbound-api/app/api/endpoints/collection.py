from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.collection import CollectionItemOut, CollectionItemUpdate
from app.repositories.collection import CollectionRepository

router = APIRouter(prefix="/collection", tags=["collection"])

@router.get("/", response_model=List[CollectionItemOut])
def read_collection(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    repo = CollectionRepository(db)
    return repo.get_collection(user_id)

@router.post("/{card_id:path}", response_model=CollectionItemOut)
def update_collection_item(
    card_id: str,
    item_in: CollectionItemUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    repo = CollectionRepository(db)
    return repo.update_item(user_id, card_id, item_in)
