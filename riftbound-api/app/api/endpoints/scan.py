
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import json
import base64
import os
import uuid
import easyocr
import numpy as np
import cv2
from app.core.database import get_db

router = APIRouter()

# Initialize EasyOCR Reader (English) -- this will download models on first run
# Note: In production, consider pre-downloading or using a singleton
reader = None

SCANS_DIR = "tmp/scans"
os.makedirs(SCANS_DIR, exist_ok=True)

@router.post("/scan")
async def scan_card(
    image_data: dict = Body(...),
    db: AsyncSession = Depends(get_db)
):
    global reader
    if reader is None:
        # gpu=False to ensure it works in CPU environments
        reader = easyocr.Reader(['en'], gpu=False)

    image_b64 = image_data.get("image")
    if not image_b64:
        raise HTTPException(status_code=400, detail="Nenhuma imagem enviada")

    try:
        # 1. Process Image
        if "," in image_b64:
            header, image_b64 = image_b64.split(",")
        
        img_bytes = base64.b64decode(image_b64)
        
        # Convert to OpenCV format for EasyOCR
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # 3. SEARCH DATABASE
        # We try to find a card name that appears in the detected lines
        best_match = None
        
        # Prepare list of names from DB (cached or query) for fuzzy/normalization matching
        # But for efficiency, we prioritize direct ILIKE with normalized strings
        for line in detected_lines:
            # Normalize line: lowercase and standard apostrophe
            line_clean = line.strip().lower().replace("’", "'").replace("`", "'")
            if len(line_clean) < 3: continue
            
            # Query with normalization in mind
            query = text("""
                SELECT data FROM cards 
                WHERE LOWER(REPLACE(REPLACE(data->>'name', '’', ''''), '`', '''')) ILIKE :name 
                LIMIT 1
            """)
            db_res = await db.execute(query, {"name": f"%{line_clean}%"})
            row = db_res.fetchone()
            if row:
                best_match = row[0]
                break

        if best_match:
            card_data = json.loads(best_match) if isinstance(best_match, str) else best_match
            return {"card": card_data, "detected_text": all_text}
        
        return {"card": None, "message": "Nenhuma carta identificada", "detected_text": all_text}

    except Exception as e:
        print(f"Error in scan_card: {e}")
        raise HTTPException(status_code=500, detail=str(e))
