from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.deck import DeckOut, DeckCreate, DeckUpdate
from app.repositories.deck import DeckRepository

router = APIRouter(prefix="/decks", tags=["decks"])

@router.get("/", response_model=List[DeckOut])
async def read_decks(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    repo = DeckRepository(db)
    return await repo.get_decks_by_user(user_id)

@router.post("/", response_model=DeckOut, status_code=status.HTTP_201_CREATED)
async def create_deck(
    deck_in: DeckCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    repo = DeckRepository(db)
    return await repo.create_deck(user_id, deck_in)

@router.get("/{deck_id}", response_model=DeckOut)
async def read_deck(
    deck_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    repo = DeckRepository(db)
    deck = await repo.get_deck(deck_id, user_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    return deck

@router.put("/{deck_id}", response_model=DeckOut)
async def update_deck(
    deck_id: UUID,
    deck_in: DeckUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    repo = DeckRepository(db)
    updated_deck = await repo.update_deck(deck_id, user_id, deck_in)
    if not updated_deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    return updated_deck

@router.delete("/{deck_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_deck(
    deck_id: UUID,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    repo = DeckRepository(db)
    deleted = await repo.delete_deck(deck_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Deck not found")
