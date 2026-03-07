from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.deck import Deck, DeckCard
from app.schemas.deck import DeckCreate, DeckUpdate
from uuid import UUID

class DeckRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_decks_by_user(self, user_id: UUID):
        stmt = select(Deck).where(Deck.user_id == user_id).options(selectinload(Deck.cards))
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_deck(self, deck_id: UUID, user_id: UUID):
        stmt = select(Deck).where(Deck.id == deck_id, Deck.user_id == user_id).options(selectinload(Deck.cards))
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def create_deck(self, user_id: UUID, deck_in: DeckCreate) -> Deck:
        db_deck = Deck(
            user_id=user_id,
            name=deck_in.name,
            main_champion_id=deck_in.main_champion_id
        )
        self.db.add(db_deck)
        await self.db.flush() # To get the deck id

        for card in deck_in.cards:
            db_card = DeckCard(
                deck_id=db_deck.id,
                card_id=card.card_id,
                quantity=card.quantity,
                is_sideboard=card.is_sideboard
            )
            self.db.add(db_card)

        await self.db.commit()
        await self.db.refresh(db_deck)
        # Manually load relationship after refresh
        stmt = select(Deck).where(Deck.id == db_deck.id).options(selectinload(Deck.cards))
        res = await self.db.execute(stmt)
        return res.scalars().first()

    async def update_deck(self, deck_id: UUID, user_id: UUID, deck_in: DeckUpdate):
        db_deck = await self.get_deck(deck_id, user_id)
        if not db_deck:
            return None

        if deck_in.name is not None:
            db_deck.name = deck_in.name
        if deck_in.main_champion_id is not None:
            db_deck.main_champion_id = deck_in.main_champion_id

        if deck_in.cards is not None:
            # Drop old cards and insert new ones
            for old_card in db_deck.cards:
                await self.db.delete(old_card)
            
            # Wait for delete to apply
            await self.db.flush()

            for card in deck_in.cards:
                new_card = DeckCard(
                    deck_id=db_deck.id,
                    card_id=card.card_id,
                    quantity=card.quantity,
                    is_sideboard=card.is_sideboard
                )
                self.db.add(new_card)

        await self.db.commit()
        # Reload relationships
        stmt = select(Deck).where(Deck.id == db_deck.id).options(selectinload(Deck.cards))
        res = await self.db.execute(stmt)
        return res.scalars().first()

    async def delete_deck(self, deck_id: UUID, user_id: UUID) -> bool:
        db_deck = await self.get_deck(deck_id, user_id)
        if db_deck:
            await self.db.delete(db_deck)
            await self.db.commit()
            return True
        return False
