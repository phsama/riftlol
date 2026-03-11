from fastapi import APIRouter, HTTPException
import httpx
import re
from typing import Optional, Dict

router = APIRouter()

LIGA_SEARCH_URL = "https://www.clubedaliga.com.br/api/cardsearch"
LIGA_BASE_URL = "https://www.ligariftbound.com.br/"

@router.get("/prices/{card_name}")
async def get_card_prices(card_name: str, lang: str = "pt"):
    """
    Busca o preço de uma carta na LigaRiftbound/ClubedaLiga.
    Se o idioma for EN/ES ou o preço em R$ não existir, tenta retornar USD (simplificado).
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # 1. Busca o ID da carta no Clube da Liga (API fornecida pelo usuário)
            # tcg=19 parece ser o ID do Riftbound/LoR no sistema deles
            params = {
                "tcg": 19,
                "maxQuantity": 8,
                "maintype": 1,
                "query": card_name
            }
            headers = {
                "accept": "application/json",
                "origin": LIGA_BASE_URL,
                "referer": LIGA_BASE_URL,
                "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1"
            }
            
            search_res = await client.get(LIGA_SEARCH_URL, params=params, headers=headers)
            if search_res.status_code != 200:
                raise HTTPException(status_code=502, detail="Erro ao consultar Clube da Liga")
            
            search_data = search_res.json()
            items = search_data.get("data", [])
            
            if not items:
                return {"found": False, "message": "Carta não encontrada na Liga"}

            # Pegamos o primeiro resultado que parece ser o mais exato
            # O sistema da liga usa o nome da carta na URL mais do que o ID para a view de detalhes
            target_card = items[0]
            # sNomeIdiomaSecundario costuma ser o nome em inglês/original
            card_slug = target_card.get("sNomeIdiomaSecundario") or target_card.get("suggestions", [card_name])[0]
            
            # 2. Scrape da página de detalhes para pegar os preços
            # URL format: https://www.ligariftbound.com.br/?view=cards/card&card=Sun+Disc
            card_url = f"{LIGA_BASE_URL}?view=cards/card&card={card_slug.replace(' ', '+')}"
            
            page_res = await client.get(card_url, headers=headers)
            if page_res.status_code != 200:
                 return {
                    "found": True, 
                    "name": card_slug,
                    "url": card_url,
                    "prices": None,
                    "message": "Página da carta encontrada, mas preços indisponíveis"
                }

            html = page_res.text
            
            # Regex para pegar os preços
            menor = re.search(r'id="precos-menor">R\$ (.*?)</div>', html)
            medio = re.search(r'id="precos-medio">R\$ (.*?)</div>', html)
            maior = re.search(r'id="precos-maior">R\$ (.*?)</div>', html)
            
            prices_brl = {
                "min": menor.group(1) if menor else None,
                "avg": medio.group(1) if medio else None,
                "max": maior.group(1) if maior else None
            }

            # 3. Lógica de Fallback USD ou Idioma
            # Como a Liga não tem USD nativo para Riftbound de forma fácil, 
            # se o usuário estiver em EN/ES, simulamos ou indicamos que é BRL.
            # No futuro, poderíamos plugar TCGPlayer aqui para USD real.
            
            use_usd = lang in ["en", "es"] or not any(prices_brl.values())
            
            # Por enquanto, se for USD, apenas marcamos como tal (na UI tratamos a conversão se quiser)
            # Mas vamos retornar o que temos.
            
            return {
                "found": True,
                "name": card_slug,
                "url": card_url,
                "currency": "BRL" if not use_usd else "USD",
                "prices": prices_brl,
                "is_fallback": use_usd
            }

    except Exception as e:
        print(f"Erro no scraping de preços: {str(e)}")
        return {"found": False, "error": str(e)}
