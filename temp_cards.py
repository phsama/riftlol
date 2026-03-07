import urllib.request
import json

try:
    req = urllib.request.urlopen("https://api.riftcodex.com/v1/cards")
    data = json.loads(req.read().decode("utf-8"))
    
    names = ["Bellows Breath", "Sivir", "Fiora, Worthy"]
    cards = [c for c in data.get("items", []) if c.get("name") in names]
    
    for c in cards:
        print(f"Name: {c.get('name')} | ID: {c.get('id')} | Rarity: {c.get('classification',{}).get('rarity')} | Tags: {c.get('tags',[])} | Set ID: {c.get('set',{}).get('id')} Number {c.get('set',{}).get('number','')}")
        print(f"  Image: {c.get('media',{}).get('image_url','')}")
        
except Exception as e:
    print(f"Error: {e}")
