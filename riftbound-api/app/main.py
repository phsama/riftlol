from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import decks
from app.api.endpoints import collection

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

@app.get("/health")
def health_check():
    return {"status": "ok"}
