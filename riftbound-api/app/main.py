from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import decks
from app.api.endpoints import collection
from app.api.endpoints import cards

app = FastAPI(title="Riftbound API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(decks.router, prefix="/api")
app.include_router(collection.router, prefix="/api")
app.include_router(cards.router, prefix="/api/cards")

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/test")
def test_endpoint():
    return {"status": "python is alive!"}
