from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.deck import DeckOut, DeckCreate, DeckUpdate
from app.repositories.deck import DeckRepository

router = APIRouter(prefix="/decks", tags=["decks"])

@router.get("/", response_model=List[DeckOut])
def read_decks(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    repo = DeckRepository(db)
    return repo.get_decks_by_user(user_id)

@router.post("/", response_model=DeckOut, status_code=status.HTTP_201_CREATED)
def create_deck(
    deck_in: DeckCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    repo = DeckRepository(db)
    return repo.create_deck(user_id, deck_in)

@router.get("/{deck_id}", response_model=DeckOut)
def read_deck(
    deck_id: UUID,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    repo = DeckRepository(db)
    deck = repo.get_deck(deck_id, user_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    return deck

@router.put("/{deck_id}", response_model=DeckOut)
def update_deck(
    deck_id: UUID,
    deck_in: DeckUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    repo = DeckRepository(db)
    updated_deck = repo.update_deck(deck_id, user_id, deck_in)
    if not updated_deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    return updated_deck

@router.delete("/{deck_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deck(
    deck_id: UUID,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    repo = DeckRepository(db)
    deleted = repo.delete_deck(deck_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Deck not found")
