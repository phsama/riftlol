import requests
import re
import json

def get_prices(card_name):
    # Search for the card to get exact name or ID if needed, 
    # but initially let's try direct URL construction since it works for "Sun Disc"
    url = f"https://www.ligariftbound.com.br/?view=cards/card&card={requests.utils.quote(card_name)}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    
    try:
        r = requests.get(url, headers=headers, timeout=10)
        html = r.text
        
        # Look for the price pattern
        # <div class="col-xs-12 col-md-4 card-preco-item p-0 m-0">
        # <div id="precos-menor">R$ 0,55</div>
        # <div class="card-preco-label">Menor</div>
        # </div>
        
        menor = re.search(r'id="precos-menor">R\$ (.*?)</div>', html)
        medio = re.search(r'id="precos-medio">R\$ (.*?)</div>', html)
        maior = re.search(r'id="precos-maior">R\$ (.*?)</div>', html)
        
        return {
            "card": card_name,
            "url": url,
            "prices": {
                "min": menor.group(1).replace(',', '.') if menor else None,
                "avg": medio.group(1).replace(',', '.') if medio else None,
                "max": maior.group(1).replace(',', '.') if maior else None
            }
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    print(json.dumps(get_prices("Sun Disc"), indent=2))
    print(json.dumps(get_prices("Jax"), indent=2))
