from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, text
from typing import Any
import httpx
from fastapi.responses import Response
from app.core.security import get_current_user
from app.core.database import get_db
from app.models.card import CardCache

router = APIRouter()

@router.post("/sync", status_code=status.HTTP_200_OK)
def sync_cards_from_riftcodex(
    db: Session = Depends(get_db)
) -> Any:
    """
    Consome todas as páginas do RiftCodex e faz Upsert no banco de dados local.
    """
    # 1. Busca carta externa
    url = "https://api.riftcodex.com/cards"
    all_cards = []
    
    with httpx.Client(timeout=60.0) as client:
        page = 1
        total_synced = 0
        
        while True:
            try:
                print(f"Buscando pagina {page} do RiftCodex...")
                response = client.get(f"{url}?page={page}&size=100")
                if response.status_code != 200:
                    print(f"Aviso: Erro {response.status_code} na pagina {page}")
                    break
                    
                data = response.json()
                items = data.get("items", [])
                if not items:
                    break
                    
                # Processa e persiste a página imediatamente
                for card_data in items:
                    card_id = card_data.get("id")
                    card_name = card_data.get("name")
                    set_id = card_data.get("set", {}).get("id")
                    
                    result = db.execute(select(CardCache).filter(CardCache.id == card_id))
                    existing_card = result.scalars().first()
                    
                    if existing_card:
                        existing_card.name = card_name
                        existing_card.set_id = set_id
                        existing_card.data = card_data
                    else:
                        new_card = CardCache(
                            id=card_id,
                            name=card_name,
                            set_id=set_id,
                            data=card_data
                        )
                        db.add(new_card)
                        
                db.commit()
                total_synced += len(items)
                print(f"Pagina {page} persistida. Total ate agora: {total_synced}")
                
                if page >= data.get("pages", 1):
                    break
                page += 1
                
            except httpx.RequestError as e:
                print(f"Erro de rede na pagina {page}: {str(e)}. Interrompendo sync.")
                break

    return {"message": f"Sincronizados {total_synced} cards com sucesso."}


@router.get("", response_class=Response)
def get_cached_cards(
    db: Session = Depends(get_db)
):
    """
    Retorna todas as cartas salvos em Cache.
    A UI espera um array `[...]` ou `{ items: [...] }`
    Utiliza json_agg para delegar a serialização direto pro PostgreSQL (X vezes + rápido)
    """
    query = text("SELECT json_build_object('items', COALESCE(json_agg(data), '[]'::json))::text FROM cards")
    result = db.execute(query)
    raw_json = result.scalar()
    
    return Response(content=raw_json, media_type="application/json")
